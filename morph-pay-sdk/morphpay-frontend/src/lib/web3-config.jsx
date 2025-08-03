import Web3 from "web3";

let web3;
if (window.ethereum) {
  web3 = new Web3(window.ethereum);
} else {
  // Fallback read‑only provider (Morph Holesky RPC)
  web3 = new Web3("https://rpc-holesky.morphl2.io");
}

export default web3;
