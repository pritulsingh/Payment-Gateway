import React, { useState } from "react";
import web3 from "../web3";
import gateway from "../contractInstance";

/* --- config for demo --- */
const TOKEN_USDT  = "0x4022210ba16Ab225A2518D9FDBD7c90b5Fb4fF16"; // mock USDT (6 dec)
const DECIMALS    = 6n;                                            // USDT/USDC
const AMOUNT_TOK  = 10n * 10n ** DECIMALS;                         // 10 USDT in base‑units

/* minimal ERC‑20 ABI just for `approve` */
const ERC20_ABI = [
  {
    name:   "approve",
    type:   "function",
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value",   type: "uint256" }
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable"
  }
];

export default function DemoPayment () {
  const [status, setStatus] = useState("Ready");

  const pay = async () => {
    try {
      setStatus("Connecting wallet…");
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const [payer] = await web3.eth.getAccounts();
      const vendor  = payer;               // pay to self for demo

      /* 1. approve gateway to spend USDT */
      setStatus("Approving USDT…");
      const usdt = new web3.eth.Contract(ERC20_ABI, TOKEN_USDT);
      await usdt.methods
        .approve(gateway.options.address, AMOUNT_TOK.toString())
        .send({ from: payer });

      /* 2. call payWithToken on gateway */
      const paymentId = web3.utils.randomHex(32);
      setStatus("Sending payWithToken…");

      const gas = await gateway.methods
        .payWithToken(TOKEN_USDT, AMOUNT_TOK.toString(), vendor, paymentId)
        .estimateGas({ from: payer });

      const tx = await gateway.methods
        .payWithToken(TOKEN_USDT, AMOUNT_TOK.toString(), vendor, paymentId)
        .send({ from: payer, gas });

      setStatus("✅ Payment settled! Tx: " + tx.transactionHash.slice(0, 10) + "…");
    } catch (e) {
      console.error(e);
      setStatus("❌ Error: " + (e?.message ?? e));
    }
  };

  return (
    <div style={{ padding:20 }}>
      <h2>Demo Payment</h2>
      <button onClick={pay}>Pay 10 USDT</button>
      <p>Status: {status}</p>
    </div>
  );
}
