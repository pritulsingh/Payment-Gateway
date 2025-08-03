import web3 from "./web3";
import abiJson from "../abi/PaymentGateway.json";
//  ^^^ relative path:   ../abi/…  (no stray symbols)

const GATEWAY_ADDRESS = "0xaF673968bd6B1c373670c9e82bc8B9059d5037F4";

const paymentGateway = new web3.eth.Contract(
  // if the JSON file has { "abi": [ … ] }
  abiJson.abi ? abiJson.abi : abiJson,
  GATEWAY_ADDRESS
);

export default paymentGateway;
