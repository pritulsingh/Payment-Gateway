// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MorphPaymentGateway
 * @notice Stripe‑like payment router for Morph L2.
 *         - Multi‑token support (USDT, USDC, cUSD, …)
 *         - 0.5 % platform fee (configurable)
 *         - Instant settlement to vendor wallets
 *         - Emergency controls and recovery mechanisms
 */
contract PaymentGateway is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ─────────────────── Storage ───────────────────

    uint256 public feeBps = 50;               // 50 bp = 0.5 %
    uint256 public constant MAX_FEE_BPS = 1000;    // 10% maximum
    uint256 public constant MIN_PAYMENT_AMOUNT = 1000; // Minimum payment (adjust based on token decimals)
    
    address public feeRecipient;              // Treasury wallet
    mapping(address => bool) public supportedTokens;
    mapping(bytes32 => bool) public processedPayments;
    mapping(address => uint256) public vendorPayments; // Track total payments per vendor
    
    // Emergency recovery
    mapping(address => uint256) public emergencyBalance;
    bool public emergencyWithdrawalEnabled = false;
    
    // Payment limits
    uint256 public dailyPaymentLimit = 1000000 * 10**18; // 1M tokens per day
    mapping(uint256 => uint256) public dailyPaymentVolume; // day => volume
    
    // ─────────────────── Events ───────────────────

    event PaymentSettled(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed vendor,
        address token,
        uint256 amountNet,
        uint256 fee,
        uint256 timestamp
    );

    event TokenSupported(address indexed token, bool supported);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event EmergencyWithdrawal(address indexed token, address indexed to, uint256 amount);
    event DailyLimitUpdated(uint256 oldLimit, uint256 newLimit);
    event MinPaymentUpdated(uint256 oldMin, uint256 newMin);

    // ─────────────────── Errors ───────────────────

    error TokenNotSupported();
    error InvalidAddress();
    error PaymentAlreadyProcessed();
    error TransferFailed();
    error PaymentTooSmall();
    error DailyLimitExceeded();
    error FeeTooHigh();
    error InvalidAmount();

    // ─────────────────── Constructor ───────────────────

    constructor(address _feeRecipient) Ownable(msg.sender) {
        if (_feeRecipient == address(0)) revert InvalidAddress();
        feeRecipient = _feeRecipient;
    }

    // ─────────────────── Admin Functions ───────────────────

    function setSupportedToken(address token, bool supported) external onlyOwner {
        if (token == address(0)) revert InvalidAddress();
        supportedTokens[token] = supported;
        emit TokenSupported(token, supported);
    }

    function setFeeBps(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert FeeTooHigh();
        emit FeeUpdated(feeBps, newFeeBps);
        feeBps = newFeeBps;
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert InvalidAddress();
        emit FeeRecipientUpdated(feeRecipient, newRecipient);
        feeRecipient = newRecipient;
    }

    function setDailyPaymentLimit(uint256 newLimit) external onlyOwner {
        emit DailyLimitUpdated(dailyPaymentLimit, newLimit);
        dailyPaymentLimit = newLimit;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function enableEmergencyWithdrawal() external onlyOwner {
        emergencyWithdrawalEnabled = true;
    }

    function disableEmergencyWithdrawal() external onlyOwner {
        emergencyWithdrawalEnabled = false;
    }

    // ─────────────────── Core Payments ───────────────────

    /**
     * @notice Pay with any supported ERC‑20
     * @param token  ERC‑20 address (e.g. USDT)
     * @param amount Amount SENT by payer (incl. fee)
     * @param vendor Vendor wallet that receives net amount
     * @param paymentId Front‑end generated UUID to dedup events
     */
    function payWithToken(
        address token,
        uint256 amount,
        address vendor,
        bytes32 paymentId
    ) external nonReentrant whenNotPaused {
        if (!supportedTokens[token]) revert TokenNotSupported();
        if (vendor == address(0)) revert InvalidAddress();
        if (processedPayments[paymentId]) revert PaymentAlreadyProcessed();
        if (amount < MIN_PAYMENT_AMOUNT) revert PaymentTooSmall();
        
        // Check daily limits
        uint256 currentDay = block.timestamp / 1 days;
        if (dailyPaymentVolume[currentDay] + amount > dailyPaymentLimit) {
            revert DailyLimitExceeded();
        }
        
        processedPayments[paymentId] = true;
        dailyPaymentVolume[currentDay] += amount;

        uint256 fee = (amount * feeBps) / 10_000;
        uint256 net = amount - fee;

        // Update vendor tracking
        vendorPayments[vendor] += net;

        // Transfer tokens
        IERC20(token).safeTransferFrom(msg.sender, vendor, net);
        if (fee > 0) {
            IERC20(token).safeTransferFrom(msg.sender, feeRecipient, fee);
        }

        emit PaymentSettled(paymentId, msg.sender, vendor, token, net, fee, block.timestamp);
    }

    /**
     * @notice Native ETH path (for tips / gasless UX)
     */
    function payWithETH(address vendor, bytes32 paymentId)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        if (vendor == address(0)) revert InvalidAddress();
        if (processedPayments[paymentId]) revert PaymentAlreadyProcessed();
        if (msg.value < MIN_PAYMENT_AMOUNT) revert PaymentTooSmall();
        
        // Check daily limits
        uint256 currentDay = block.timestamp / 1 days;
        if (dailyPaymentVolume[currentDay] + msg.value > dailyPaymentLimit) {
            revert DailyLimitExceeded();
        }
        
        processedPayments[paymentId] = true;
        dailyPaymentVolume[currentDay] += msg.value;

        uint256 fee = (msg.value * feeBps) / 10_000;
        uint256 net = msg.value - fee;

        // Update vendor tracking
        vendorPayments[vendor] += net;

        // Transfer ETH
        (bool vOk, ) = vendor.call{value: net}("");
        if (!vOk) revert TransferFailed();
        
        if (fee > 0) {
            (bool fOk, ) = feeRecipient.call{value: fee}("");
            if (!fOk) revert TransferFailed();
        }

        emit PaymentSettled(paymentId, msg.sender, vendor, address(0), net, fee, block.timestamp);
    }

    // ─────────────────── Batch Operations ───────────────────

    /**
     * @notice Batch process multiple token payments
     * @param tokens Array of token addresses
     * @param amounts Array of payment amounts
     * @param vendors Array of vendor addresses
     * @param paymentIds Array of payment IDs
     */
    function batchPayWithTokens(
        address[] calldata tokens,
        uint256[] calldata amounts,
        address[] calldata vendors,
        bytes32[] calldata paymentIds
    ) external nonReentrant whenNotPaused {
        if (tokens.length != amounts.length || 
            amounts.length != vendors.length || 
            vendors.length != paymentIds.length) {
            revert InvalidAmount();
        }
        
        for (uint256 i = 0; i < tokens.length; i++) {
            _processSingleTokenPayment(tokens[i], amounts[i], vendors[i], paymentIds[i]);
        }
    }

    function _processSingleTokenPayment(
        address token,
        uint256 amount,
        address vendor,
        bytes32 paymentId
    ) internal {
        if (!supportedTokens[token]) revert TokenNotSupported();
        if (vendor == address(0)) revert InvalidAddress();
        if (processedPayments[paymentId]) revert PaymentAlreadyProcessed();
        if (amount < MIN_PAYMENT_AMOUNT) revert PaymentTooSmall();
        
        processedPayments[paymentId] = true;

        uint256 fee = (amount * feeBps) / 10_000;
        uint256 net = amount - fee;

        vendorPayments[vendor] += net;

        IERC20(token).safeTransferFrom(msg.sender, vendor, net);
        if (fee > 0) {
            IERC20(token).safeTransferFrom(msg.sender, feeRecipient, fee);
        }

        emit PaymentSettled(paymentId, msg.sender, vendor, token, net, fee, block.timestamp);
    }

    // ─────────────────── View Functions ───────────────────

    function calculateFee(uint256 amount) external view returns (uint256) {
        return (amount * feeBps) / 10_000;
    }

    function calculateNetAmount(uint256 amount) external view returns (uint256) {
        uint256 fee = (amount * feeBps) / 10_000;
        return amount - fee;
    }

    function getDailyVolume(uint256 dayTimestamp) external view returns (uint256) {
        uint256 day = dayTimestamp / 1 days;
        return dailyPaymentVolume[day];
    }

    function getTodayVolume() external view returns (uint256) {
        uint256 currentDay = block.timestamp / 1 days;
        return dailyPaymentVolume[currentDay];
    }

    function getRemainingDailyLimit() external view returns (uint256) {
        uint256 currentDay = block.timestamp / 1 days;
        uint256 used = dailyPaymentVolume[currentDay];
        return used >= dailyPaymentLimit ? 0 : dailyPaymentLimit - used;
    }

    // ─────────────────── Emergency Functions ───────────────────

    /**
     * @notice Emergency withdrawal function (only when enabled)
     * @param token Token address (address(0) for ETH)
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        if (!emergencyWithdrawalEnabled) revert("Emergency withdrawal disabled");
        if (to == address(0)) revert InvalidAddress();

        if (token == address(0)) {
            // ETH withdrawal
            (bool success, ) = to.call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            // ERC20 withdrawal
            IERC20(token).safeTransfer(to, amount);
        }

        emit EmergencyWithdrawal(token, to, amount);
    }

    // ─────────────────── Fallback ───────────────────

    receive() external payable {
        revert("Use payWithETH");
    }

    fallback() external payable {
        revert("Function not found");
    }
}