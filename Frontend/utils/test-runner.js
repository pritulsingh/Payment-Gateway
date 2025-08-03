import dotenv from 'dotenv';
import { runTests, quickTokenTest } from './testPaymentGateway.js';   // quickTokenTest must be exported

dotenv.config();

// ─── Load and sanity‑check env vars ───────────────────────────────
const {
  CONTRACT_ADDRESS,
  RPC_URL,
  PRIVATE_KEY,
  VENDOR_ADDRESS,
  USDT_ADDRESS            // instead of TOKEN_ADDRESS
} = process.env;

if (!CONTRACT_ADDRESS || !RPC_URL || !PRIVATE_KEY || !VENDOR_ADDRESS || !USDT_ADDRESS) {
  console.error('❌ Missing environment variables. Check your .env file.');
  process.exit(1);
}


// Optional debug
// console.log({ CONTRACT_ADDRESS, RPC_URL, PRIVATE_KEY: PRIVATE_KEY.slice(0,10)+'…', VENDOR_ADDRESS, TOKEN_ADDRESS });

(async () => {
  console.log('📦  Running MorphPaymentGateway ETH tests…');
  await runTests(CONTRACT_ADDRESS, RPC_URL, PRIVATE_KEY, VENDOR_ADDRESS);

  console.log('\n📦  Running USDT token test…');
  // 10 USDT in 6‑decimals  →  10 * 10^6
  await quickTokenTest(
    CONTRACT_ADDRESS,
    RPC_URL,
    PRIVATE_KEY,
    USDT_ADDRESS,
    VENDOR_ADDRESS,
    10_000_000           // 10 USDT base‑units
  );

  console.log('\n✅  All tests complete');
})();
