import web3 from "../web3.jsx";

export default function generatePaymentId() {
  return web3.utils.randomHex(32);
}
