const fs = require('fs');
const path = require('path');
const terser = require('terser');

/**
 * Build Script for MorphPay SDK
 * Generates CDN-ready files in public/sdk/ directory
 */

async function buildSDK() {
    console.log('🚀 Building MorphPay SDK...');

    try {
        // Ensure directories exist
        const publicDir = path.join(__dirname, '../public/sdk');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        // Read source files
        const coreFiles = [
            '../src/sdk/core/MorphPay.js',
            '../src/sdk/core/api.js',
            '../src/sdk/core/utils.js'
        ];

        let combinedSource = '';
        
        // Add banner
        combinedSource += `/**\n * MorphPay SDK v1.0.0\n * Complete payment processing SDK for web applications\n * https://morphpay.com\n */\n\n`;

        // UMD wrapper start
        combinedSource += `(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.MorphPay = {}));
})(this, (function(exports) {
    'use strict';

`;

        // Combine core files
        for (const file of coreFiles) {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                combinedSource += content + '\n\n';
            }
        }

        // Add exports and UMD wrapper end
        combinedSource += `
    // Export for different module systems
    exports.MorphPay = MorphPay;
    exports.default = MorphPay;

    // Global registration
    if (typeof window !== 'undefined') {
        window.MorphPay = MorphPay;
    }

}));`;

        // Write unminified version
        const unminifiedPath = path.join(publicDir, 'morphpay-sdk.js');
        fs.writeFileSync(unminifiedPath, combinedSource);
        console.log('✅ Built unminified SDK:', unminifiedPath);

        // Minify and write minified version
        const minified = await terser.minify(combinedSource, {
            compress: {
                drop_console: false,
                drop_debugger: true,
                pure_funcs: ['console.log']
            },
            mangle: {
                reserved: ['MorphPay']
            },
            format: {
                comments: /^!/
            }
        });

        if (minified.error) {
            throw minified.error;
        }

        const minifiedPath = path.join(publicDir, 'morphpay-sdk.min.js');
        fs.writeFileSync(minifiedPath, minified.code);
        console.log('✅ Built minified SDK:', minifiedPath);

        // Generate type definitions
        const typeDefinitions = generateTypeDefinitions();
        const typesPath = path.join(publicDir, 'morphpay-sdk.d.ts');
        fs.writeFileSync(typesPath, typeDefinitions);
        console.log('✅ Generated TypeScript definitions:', typesPath);

        // Generate integration examples
        generateIntegrationExamples(publicDir);

        // Generate version info
        const versionInfo = {
            version: '1.0.0',
            buildDate: new Date().toISOString(),
            files: {
                unminified: 'morphpay-sdk.js',
                minified: 'morphpay-sdk.min.js',
                types: 'morphpay-sdk.d.ts'
            },
            cdn: {
                jsdelivr: 'https://cdn.jsdelivr.net/npm/morphpay-sdk@1.0.0/dist/morphpay-sdk.min.js',
                unpkg: 'https://unpkg.com/morphpay-sdk@1.0.0/dist/morphpay-sdk.min.js'
            }
        };

        fs.writeFileSync(
            path.join(publicDir, 'version.json'),
            JSON.stringify(versionInfo, null, 2)
        );

        console.log('🎉 SDK build completed successfully!');
        console.log(`📦 Files generated in: ${publicDir}`);
        
        // Display file sizes
        const stats = fs.statSync(unminifiedPath);
        const minStats = fs.statSync(minifiedPath);
        console.log(`📊 Unminified size: ${(stats.size / 1024).toFixed(2)}KB`);
        console.log(`📊 Minified size: ${(minStats.size / 1024).toFixed(2)}KB`);

    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

function generateTypeDefinitions() {
    return `/**
 * MorphPay SDK TypeScript Definitions
 * Version: 1.0.0
 */

export interface MorphPayOptions {
    baseURL?: string;
    environment?: 'production' | 'sandbox';
    debug?: boolean;
}

export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
    metadata?: Record<string, any>;
}

export interface PaymentMethod {
    type: 'card';
    card: {
        number: string;
        exp_month: number;
        exp_year: number;
        cvc: string;
    };
    billing_details?: {
        name?: string;
        email?: string;
        address?: {
            line1?: string;
            line2?: string;
            city?: string;
            state?: string;
            postal_code?: string;
            country?: string;
        };
    };
}

export interface Customer {
    id: string;
    email: string;
    name?: string;
    metadata?: Record<string, any>;
}

export interface Subscription {
    id: string;
    customer: string;
    price: string;
    status: 'active' | 'canceled' | 'past_due';
    metadata?: Record<string, any>;
}

export interface CheckoutOptions {
    amount?: number;
    currency?: string;
    paymentIntentId?: string;
    onSuccess?: (result: any) => void;
    onError?: (error: Error) => void;
    onCancel?: () => void;
}

export interface PaymentButtonOptions {
    text?: string;
    disabled?: boolean;
    onClick?: () => void;
}

export declare class MorphPay {
    constructor(apiKey: string, options?: MorphPayOptions);
    
    // Payment Methods
    createPaymentIntent(amount: number, currency?: string, metadata?: Record<string, any>): Promise<PaymentIntent>;
    confirmPayment(paymentIntentId: string, paymentMethod: PaymentMethod): Promise<any>;
    getPaymentMethods(customerId: string): Promise<PaymentMethod[]>;
    
    // Customer Methods
    createCustomer(email: string, name?: string, metadata?: Record<string, any>): Promise<Customer>;
    getCustomer(customerId: string): Promise<Customer>;
    
    // Subscription Methods
    createSubscription(customerId: string, priceId: string, metadata?: Record<string, any>): Promise<Subscription>;
    cancelSubscription(subscriptionId: string): Promise<Subscription>;
    
    // UI Methods
    createPaymentButton(options?: PaymentButtonOptions): HTMLButtonElement;
    openCheckout(options?: CheckoutOptions): HTMLElement;
    closeModal(modal: HTMLElement): void;
    
    // Event Handling
    on(event: string, callback: (data?: any) => void): void;
    off(event: string, callback: (data?: any) => void): void;
    emit(event: string, data?: any): void;
    
    // Utility Methods
    validateCard(cardNumber: string): boolean;
    formatAmount(amount: number, currency?: string): string;
    verifyWebhook(payload: string, signature: string, secret: string): boolean;
}

export default MorphPay;

declare global {
    interface Window {
        MorphPay: typeof MorphPay;
    }
}
`;
}

function generateIntegrationExamples(publicDir) {
    const examplesDir = path.join(publicDir, 'examples');
    if (!fs.existsSync(examplesDir)) {
        fs.mkdirSync(examplesDir);
    }

    // Basic HTML example
    const htmlExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MorphPay SDK - Basic Example</title>
    <script src="../morphpay-sdk.min.js"></script>
</head>
<body>
    <h1>MorphPay SDK Example</h1>
    
    <div id="payment-section">
        <h2>Make a Payment</h2>
        <div id="payment-button-container"></div>
    </div>

    <script>
        // Initialize MorphPay
        const morphpay = new MorphPay('pk_test_your_publishable_key_here', {
            environment: 'sandbox',
            debug: true
        });

        // Create payment button
        const paymentButton = morphpay.createPaymentButton({
            text: 'Pay $29.99',
            onClick: () => {
                morphpay.openCheckout({
                    amount: 29.99,
                    currency: 'USD',
                    onSuccess: (result) => {
                        alert('Payment successful!');
                        console.log(result);
                    },
                    onError: (error) => {
                        alert('Payment failed: ' + error.message);
                        console.error(error);
                    }
                });
            }
        });

        // Add button to page
        document.getElementById('payment-button-container').appendChild(paymentButton);

        // Listen for events
        morphpay.on('payment_success', (data) => {
            console.log('Payment succeeded:', data);
        });

        morphpay.on('payment_error', (error) => {
            console.error('Payment error:', error);
        });
    </script>
</body>
</html>`;

    fs.writeFileSync(path.join(examplesDir, 'basic.html'), htmlExample);

    // React example
    const reactExample = `import React, { useEffect, useState } from 'react';
import MorphPay from 'morphpay-sdk';

const PaymentComponent = () => {
    const [morphpay, setMorphpay] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const mp = new MorphPay(process.env.REACT_APP_MORPHPAY_KEY, {
            environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        });
        setMorphpay(mp);

        // Event listeners
        mp.on('payment_success', (result) => {
            console.log('Payment successful:', result);
            setLoading(false);
        });

        mp.on('payment_error', (error) => {
            console.error('Payment failed:', error);
            setLoading(false);
        });

        return () => {
            // Cleanup if needed
        };
    }, []);

    const handlePayment = async () => {
        if (!morphpay) return;

        setLoading(true);
        
        try {
            // Create payment intent
            const intent = await morphpay.createPaymentIntent(2999, 'USD'); // $29.99 in cents
            
            // Open checkout
            morphpay.openCheckout({
                paymentIntentId: intent.id,
                amount: 29.99,
                onSuccess: (result) => {
                    // Handle success
                    console.log('Payment completed:', result);
                },
                onError: (error) => {
                    // Handle error
                    console.error('Payment error:', error);
                    setLoading(false);
                }
            });
        } catch (error) {
            console.error('Failed to create payment intent:', error);
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Payment</h2>
            <button 
                onClick={handlePayment}
                disabled={loading || !morphpay}
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                }}
            >
                {loading ? 'Processing...' : 'Pay $29.99'}
            </button>
        </div>
    );
};

export default PaymentComponent;`;

    fs.writeFileSync(path.join(examplesDir, 'react-example.jsx'), reactExample);

    // Node.js example
    const nodeExample = `const MorphPay = require('morphpay-sdk');

// Initialize with your secret key
const morphpay = new MorphPay(process.env.MORPHPAY_SECRET_KEY, {
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
});

async function createPayment() {
    try {
        // Create a customer
        const customer = await morphpay.createCustomer(
            'customer@example.com',
            'John Doe'
        );
        
        console.log('Customer created:', customer);

        // Create a payment intent
        const paymentIntent = await morphpay.createPaymentIntent(
            2999, // $29.99 in cents
            'USD',
            {
                customer_id: customer.id,
                order_id: 'order_123'
            }
        );

        console.log('Payment intent created:', paymentIntent);

        // Return client secret to frontend
        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        };

    } catch (error) {
        console.error('Payment creation failed:', error);
        throw error;
    }
}

// Webhook handler
function handleWebhook(req, res) {
    const signature = req.headers['morphpay-signature'];
    const payload = req.body;

    try {
        // Verify webhook
        const isValid = morphpay.verifyWebhook(
            payload,
            signature,
            process.env.MORPHPAY_WEBHOOK_SECRET
        );

        if (!isValid) {
            return res.status(400).send('Invalid signature');
        }

        // Handle different event types
        switch (payload.type) {
            case 'payment_intent.succeeded':
                console.log('Payment succeeded:', payload.data);
                // Update your database, send confirmation email, etc.
                break;
                
            case 'payment_intent.payment_failed':
                console.log('Payment failed:', payload.data);
                // Handle failed payment
                break;
                
            default:
                console.log('Unhandled webhook event:', payload.type);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Webhook processing failed');
    }
}

module.exports = {
    createPayment,
    handleWebhook
};`;

    fs.writeFileSync(path.join(examplesDir, 'node-example.js'), nodeExample);

    console.log('✅ Generated integration examples');
}

// Run build if this file is executed directly
if (require.main === module) {
    buildSDK();
}

module.exports = { buildSDK };`;