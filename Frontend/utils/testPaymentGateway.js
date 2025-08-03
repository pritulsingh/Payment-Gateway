/* eslint-disable no-console */
// Payment‑Gateway tester for Morph Holesky (ES‑modules)

import Web3 from 'web3';

/*─────────────────────────────────────────────────────────────*/
/* Gateway ABI (only the methods we use)                       */
/*─────────────────────────────────────────────────────────────*/
export const PAYMENT_GATEWAY_ABI = [
  { "name": "payWithETH",   "type": "function", "stateMutability": "payable",
    "inputs":[ { "name":"vendor","type":"address"}, { "name":"paymentId","type":"bytes32"} ],
    "outputs":[] },
  { "name": "payWithToken", "type": "function", "stateMutability": "nonpayable",
    "inputs":[
      { "name":"token","type":"address" },
      { "name":"amount","type":"uint256" },
      { "name":"vendor","type":"address" },
      { "name":"paymentId","type":"bytes32"} ],
    "outputs":[] },
  { "name": "calculateFee",       "type":"function","stateMutability":"view",
    "inputs":[{"name":"amount","type":"uint256"}],"outputs":[{"type":"uint256"}] },
  { "name": "calculateNetAmount", "type":"function","stateMutability":"view",
    "inputs":[{"name":"amount","type":"uint256"}],"outputs":[{"type":"uint256"}] },
  { "name": "feeBps",              "type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"uint256"}] },
  { "name": "getTodayVolume",      "type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"uint256"}] },
  { "name": "getRemainingDailyLimit","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"uint256"}] },
  { "name": "processedPayments",   "type":"function","stateMutability":"view",
    "inputs":[{"name":"","type":"bytes32"}],"outputs":[{"type":"bool"}] },
  { "name": "vendorPayments",      "type":"function","stateMutability":"view",
    "inputs":[{"name":"","type":"address"}],"outputs":[{"type":"uint256"}] },
  { "anonymous":false,"name":"PaymentSettled","type":"event",
    "inputs":[
      {"indexed":true,"name":"paymentId","type":"bytes32"},
      {"indexed":true,"name":"payer","type":"address"},
      {"indexed":true,"name":"vendor","type":"address"},
      {"indexed":false,"name":"token","type":"address"},
      {"indexed":false,"name":"amountNet","type":"uint256"},
      {"indexed":false,"name":"fee","type":"uint256"},
      {"indexed":false,"name":"timestamp","type":"uint256"}] }
];

/*─────────────────────────────────────────────────────────────*/
/* Tester class                                                */
/*─────────────────────────────────────────────────────────────*/
export class PaymentGatewayTester {
  constructor(gatewayAddr, rpcUrl, privateKey) {
    this.web3     = new Web3(new Web3.providers.HttpProvider(rpcUrl));
    this.account  = this.web3.eth.accounts.privateKeyToAccount(privateKey.trim());
    this.web3.eth.accounts.wallet.add(this.account);
    this.contract = new this.web3.eth.Contract(PAYMENT_GATEWAY_ABI, gatewayAddr);
  }

  /* Generate random bytes32 */
  generatePaymentId() { return this.web3.utils.randomHex(32); }

  /*──── ETH payment ──────────────────────────────────────────*/
  async testETHPayment(vendorAddr, amountEth) {
    const id   = this.generatePaymentId();
    const wei  = this.web3.utils.toWei(amountEth.toString(), 'ether');
    const [feeWei, netWei] = await Promise.all([
      this.contract.methods.calculateFee(wei).call(),
      this.contract.methods.calculateNetAmount(wei).call(),
    ]);

    console.log(`\n=== ETH Payment (${amountEth} ETH) ===`);
    console.log(`PaymentId : ${id}`);

    const gasEst = await this.contract.methods
      .payWithETH(vendorAddr, id).estimateGas({ from: this.account.address, value: wei });

    const tx = await this.contract.methods
      .payWithETH(vendorAddr, id).send({
        from:  this.account.address,
        value: wei,
        gas:   Math.floor(Number(gasEst) * 1.2),
        maxPriorityFeePerGas: await this.web3.eth.getGasPrice(),
        maxFeePerGas:        await this.web3.eth.getGasPrice(),
      });

    const e = tx.events?.PaymentSettled?.returnValues;
    console.log(`✅ Settled. Net ${this.web3.utils.fromWei(e.amountNet,'ether')} ETH, Fee ${this.web3.utils.fromWei(e.fee,'ether')} ETH`);
  }

  /*──── Duplicate‑payment check ──────────────────────────────*/
  async testDuplicatePayment(vendorAddr, amountEth) {
    const dupId  = this.generatePaymentId();
    const wei    = this.web3.utils.toWei(amountEth.toString(), 'ether');

    // first payment (will succeed)
    await this.contract.methods
      .payWithETH(vendorAddr, dupId)
      .send({ from:this.account.address, value: wei, gas: 150_000 });

    // second payment (should revert)
    let ok = false;
    try {
      await this.contract.methods
        .payWithETH(vendorAddr, dupId)
        .send({ from:this.account.address, value: wei, gas: 150_000 });
    } catch { ok = true; }

    console.log(ok ? '✅ Duplicate correctly rejected' : '❌ Duplicate unexpectedly succeeded');
  }

  /*──── Token (USDT) payment ─────────────────────────────────*/
  async testTokenPayment(tokenAddr, vendorAddr, amountUnits) {
    const id = this.generatePaymentId();
    console.log(`\n=== Token Payment (${amountUnits} units) ===`);

    /* minimal ERC‑20 ABI for approve */
    const tokenAbi = [
      { "name":"approve", "type":"function", "stateMutability":"nonpayable",
        "inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}], "outputs":[{"type":"bool"}] }
    ];
    const token = new this.web3.eth.Contract(tokenAbi, tokenAddr);

    // 1) approve gateway
    await token.methods.approve(this.contract.options.address, amountUnits)
      .send({ from: this.account.address, gas: 80_000 });

    // 2) payWithToken
    const tx = await this.contract.methods
      .payWithToken(tokenAddr, amountUnits, vendorAddr, id)
      .send({ from: this.account.address, gas: 250_000 });

    const e = tx.events?.PaymentSettled?.returnValues;
    console.log(`✅ Settled. Net ${e.amountNet}, Fee ${e.fee} (base units)`);
  }

  /*──── View helpers ─────────────────────────────────────────*/
  async testViewFunctions() {
    const [bps, today, remain] = await Promise.all([
      this.contract.methods.feeBps().call(),
      this.contract.methods.getTodayVolume().call(),
      this.contract.methods.getRemainingDailyLimit().call()
    ]);
    console.log('\n=== Contract Stats ===');
    console.log(`feeBps        : ${bps}  (${Number(bps)/100}% )`);
    console.log(`todayVolume   : ${this.web3.utils.fromWei(today,'ether')} ETH`);
    console.log(`remainingLimit: ${this.web3.utils.fromWei(remain,'ether')} ETH`);
  }
}

/*─────────────────────────────────────────────────────────────*/
/* Convenience wrappers                                        */
/*─────────────────────────────────────────────────────────────*/
export async function runTests(gateway, rpc, pk, vendor) {
  const t = new PaymentGatewayTester(gateway, rpc, pk);
  await t.testViewFunctions();
  await t.testETHPayment(vendor, 0.01);
  await t.testDuplicatePayment(vendor, 0.005);
  await t.testETHPayment(vendor, 0.1);
}
export async function quickETHTest(g, r, k, v, amt) {
  await new PaymentGatewayTester(g,r,k).testETHPayment(v, amt);
}
export async function quickTokenTest(g,r,k,token,vendor,units) {
  await new PaymentGatewayTester(g,r,k).testTokenPayment(token, vendor, units);
}
export async function quickViewTest(g,r,k){
  await new PaymentGatewayTester(g,r,k).testViewFunctions();
}

/*─────────────────────────────────────────────────────────────*/
/* CLI usage:  node utils/testPaymentGateway.js                */
/*─────────────────────────────────────────────────────────────*/
if (import.meta.url === `file://${process.argv[1]}`) {
  (await import('dotenv')).config();
  const { CONTRACT_ADDRESS, RPC_URL, PRIVATE_KEY, VENDOR_ADDRESS, USDT_ADDRESS } = process.env;
  if (!CONTRACT_ADDRESS || !RPC_URL || !PRIVATE_KEY || !VENDOR_ADDRESS || !USDT_ADDRESS) {
    console.error('Missing env vars'); process.exit(1);
  }
  await runTests(CONTRACT_ADDRESS, RPC_URL, PRIVATE_KEY, VENDOR_ADDRESS);
  await quickTokenTest(CONTRACT_ADDRESS, RPC_URL, PRIVATE_KEY, USDT_ADDRESS, VENDOR_ADDRESS, 10_000_000);
}
