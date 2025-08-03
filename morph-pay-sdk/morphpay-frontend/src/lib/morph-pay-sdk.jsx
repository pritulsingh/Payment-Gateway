import React from "react";
import ReactDOM from "react-dom/client";
import MorphPay from "./MorphPay.js";

/**
 * Launches the Morph Pay popup.
 *
 * @param {Object} config
 *   vendor   – vendors wallet address
 *   token    – ERC‑20 address (for token payments)
 *   amountToken – numeric string (e.g. "10")
 *   amountEth   – numeric string (e.g. "0.01")
 *   decimals    – token decimals (default 6)
 *   gateway     – a Web3.js contract instance (PaymentGateway)
 */
export function launchMorphPay(config) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(
    <MorphPay
      config={config}
      onClose={() => {
        root.unmount();
        container.remove();
      }}
    />
  );
}
