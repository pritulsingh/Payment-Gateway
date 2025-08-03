// Test setup file - src/__tests__/setup.js
// This file sets up the testing environment

// Mock Web3 and window.ethereum globally
Object.defineProperty(window, 'ethereum', {
  writable: true,
  value: {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
    isMetaMask: true,
  }
});

// Mock Web3 constructor
jest.mock('web3', () => {
  return jest.fn().mockImplementation(() => ({
    eth: {
      getAccounts: jest.fn().mockResolvedValue(['0x123456789']),
      getBalance: jest.fn().mockResolvedValue('1000000000000000000'), // 1 ETH in wei
      getChainId: jest.fn().mockResolvedValue(2810),
      sendTransaction: jest.fn().mockResolvedValue({
        transactionHash: '0xabcdef123456789',
        gasUsed: 21000,
        status: true,
        blockNumber: 12345
      }),
      estimateGas: jest.fn().mockResolvedValue(21000),
      getTransactionReceipt: jest.fn().mockResolvedValue({
        status: true,
        gasUsed: 21000,
        blockNumber: 12345
      }),
      Contract: jest.fn().mockImplementation(() => ({
        methods: {
          transfer: jest.fn().mockReturnValue({
            send: jest.fn().mockResolvedValue({
              transactionHash: '0xtoken123',
              gasUsed: 50000,
              status: true,
              blockNumber: 12346
            })
          }),
          decimals: jest.fn().mockReturnValue({
            call: jest.fn().mockResolvedValue(18)
          })
        }
      }))
    },
    utils: {
      toWei: jest.fn((value, unit) => {
        if (unit === 'ether') {
          return (parseFloat(value) * 1e18).toString();
        }
        return value;
      }),
      fromWei: jest.fn((value, unit) => {
        if (unit === 'ether') {
          return (parseInt(value) / 1e18).toString();
        }
        return value;
      }),
      toBN: jest.fn(value => ({
        mul: jest.fn(() => ({ 
          pow: jest.fn(() => value) 
        })),
        toString: jest.fn(() => value.toString())
      }))
    }
  }));
});

// Silence console logs in tests unless needed
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};
