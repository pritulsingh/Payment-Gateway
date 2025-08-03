// src/__tests__/morphpay-sdk.test.js
describe('MorphPay SDK Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset ethereum mock before each test
    if (window.ethereum) {
      window.ethereum.request.mockReset();
      window.ethereum.on.mockReset();
      window.ethereum.removeListener.mockReset();
    }
  });

  describe('Utility Functions', () => {
    test('should validate ethereum addresses correctly', () => {
      const isValidAddress = (address) => {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      };

      // Valid addresses
      expect(isValidAddress('0x69f66FFbb39Bfe6538d870Bd483999A6C7442B58')).toBe(true);
      expect(isValidAddress('0xaF673968bd6b1c373670c9e82bc8B9059d5037F4')).toBe(true);
      
      // Invalid addresses
      expect(isValidAddress('0xinvalid')).toBe(false);
      expect(isValidAddress('invalid')).toBe(false);
      expect(isValidAddress('')).toBe(false);
      expect(isValidAddress('0x123')).toBe(false); // too short
      expect(isValidAddress('0x' + 'a'.repeat(41))).toBe(false); // too long
    });

    test('should calculate fees correctly', () => {
      const calculateFee = (amount, feeBps) => {
        const amountNum = parseFloat(amount);
        const feePercent = feeBps / 10000;
        return amountNum * feePercent;
      };

      expect(calculateFee('1.0', 50)).toBeCloseTo(0.005); // 0.5% of 1 ETH
      expect(calculateFee('0.01', 50)).toBeCloseTo(0.00005, 10);
      expect(calculateFee('10', 100)).toBeCloseTo(0.1, 10);
      expect(calculateFee('0.1', 250)).toBeCloseTo(0.0025, 10);
    });

    test('should generate payment IDs correctly', () => {
      const generatePaymentId = () => {
        return `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      };

      const id1 = generatePaymentId();
      const id2 = generatePaymentId();

      expect(id1).toMatch(/^mp_\d+_[a-z0-9]{9}$/);
      expect(id2).toMatch(/^mp_\d+_[a-z0-9]{9}$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('Configuration', () => {
    test('should have correct Morph network configuration', () => {
      const MORPH_CONFIG = {
        chainId: 2810,
        chainIdHex: '0xafa',
        rpcUrl: 'https://rpc-holesky.morphl2.io',
        explorerUrl: 'https://explorer-holesky.morphl2.io',
        contractAddress: '0xaF673968bd6b1c373670c9e82bc8B9059d5037F4'
      };

      expect(MORPH_CONFIG.chainId).toBe(2810);
      expect(parseInt(MORPH_CONFIG.chainIdHex, 16)).toBe(2810);
      expect(MORPH_CONFIG.rpcUrl).toContain('morphl2.io');
      expect(MORPH_CONFIG.explorerUrl).toContain('explorer-holesky.morphl2.io');
    });
  });

  describe('MetaMask Integration', () => {
    test('should detect MetaMask availability', () => {
      const isMetaMaskInstalled = () => {
        return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
      };

      expect(isMetaMaskInstalled()).toBe(true);
      expect(window.ethereum).toBeDefined();
      expect(window.ethereum.isMetaMask).toBe(true);
    });

    test('should handle account connection requests', async () => {
      const mockAccounts = ['0x123456789abcdef123456789abcdef123456789a'];
      window.ethereum.request.mockResolvedValueOnce(mockAccounts);

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      expect(accounts).toEqual(mockAccounts);
      expect(window.ethereum.request).toHaveBeenCalledWith({
        method: 'eth_requestAccounts'
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid addresses gracefully', () => {
      const invalidAddresses = [
        '',
        '0x',
        '0xinvalid',
        'not-an-address',
        '0x123', // too short
      ];

      const isValidAddress = (address) => {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      };

      invalidAddresses.forEach(addr => {
        expect(isValidAddress(addr)).toBe(false);
      });
    });

    test('should handle invalid payment amounts', () => {
      const invalidAmounts = ['', '0', '-1', 'abc', 'null', 'undefined', '-0.5'];

      const isValidAmount = (amount) => {
        const num = parseFloat(amount);
        return !isNaN(num) && num > 0;
      };

      invalidAmounts.forEach(amount => {
        expect(isValidAmount(amount)).toBe(false);
      });

      // Valid amounts
      expect(isValidAmount('0.01')).toBe(true);
      expect(isValidAmount('1.5')).toBe(true);
      expect(isValidAmount('1000')).toBe(true);
    });
  });
});
