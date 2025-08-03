console.log('=== TESTING EXPORTS ===');

// Load the module
const morphPay = require('./dist/index.cjs.js');

console.log('1. Module type:', typeof morphPay);
console.log('2. Module keys:', Object.keys(morphPay));
console.log('3. Module prototype:', Object.getPrototypeOf(morphPay));
console.log('4. Own property names:', Object.getOwnPropertyNames(morphPay));
console.log('5. Has default?', 'default' in morphPay);
console.log('6. Direct property access:');
console.log('   - morphPay.MorphPay:', typeof morphPay.MorphPay);
console.log('   - morphPay.formatEther:', typeof morphPay.formatEther);
console.log('   - morphPay.default:', typeof morphPay.default);

// Check if it's a function (maybe it's exporting the class directly)
if (typeof morphPay === 'function') {
  console.log('7. It\'s a function! Function name:', morphPay.name);
  try {
    const instance = new morphPay();
    console.log('8. Can instantiate:', typeof instance);
  } catch(e) {
    console.log('8. Cannot instantiate:', e.message);
  }
}

console.log('=== END TEST ===');
