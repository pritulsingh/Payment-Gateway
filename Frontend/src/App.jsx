import React from "react";
import DemoPayment from "./components/DemoPayment";

export default function App() {
  return (
    <div style={{ maxWidth: 420, margin: "4rem auto", textAlign: "center" }}>
      <h1>Morph Pay Checkout Demo</h1>
      <DemoPayment />
    </div>
  );
}
