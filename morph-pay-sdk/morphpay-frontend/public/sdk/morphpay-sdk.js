/**
 * MorphPay SDK v1.0.0
 * Complete payment processing SDK for web applications
 * https://morphpay.com
 */

(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.MorphPay = {}));
})(this, (function(exports) {
    'use strict';

    // Core MorphPay Class
    class MorphPay {
        constructor(apiKey, options = {}) {
            if (!apiKey) {
                throw new Error('MorphPay API key is required');
            }

            this.apiKey = apiKey;
            this.baseURL = options.baseURL || 'https://api.morphpay.com';
            this.environment = options.environment || 'production';
            this.version = 'v1';
            this.debug = options.debug || false;

            // Event listeners
            this.listeners = {};
            
            // Initialize SDK
            this.init();
        }

        init() {
            if (this.debug) {
                console.log('MorphPay SDK initialized', {
                    environment: this.environment,
                    version: this.version
                });
            }

            // Load styles if not already loaded
            this.loadStyles();
            
            // Setup global error handler
            this.setupErrorHandler();
        }

        loadStyles() {
            if (document.getElementById('morphpay-styles')) return;

            const styles = `
                .morphpay-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .morphpay-modal-content {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    width: 90%;
                    max-width: 500px;
                    position: relative;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                }

                .morphpay-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                }

                .morphpay-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .morphpay-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .morphpay-label {
                    font-weight: 600;
                    color: #374151;
                }

                .morphpay-input {
                    padding: 0.75rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }

                .morphpay-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .morphpay-button {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .morphpay-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                }

                .morphpay-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .morphpay-loading {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: morphpay-spin 1s ease-in-out infinite;
                }

                @keyframes morphpay-spin {
                    to { transform: rotate(360deg); }
                }

                .morphpay-error {
                    color: #ef4444;
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                }

                .morphpay-success {
                    color: #10b981;
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                }
            `;

            const styleSheet = document.createElement('style');
            styleSheet.id = 'morphpay-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        setupErrorHandler() {
            window.addEventListener('error', (event) => {
                if (event.error && event.error.morphpay) {
                    this.emit('error', event.error);
                }
            });
        }

        // API Methods
        async makeRequest(endpoint, options = {}) {
            const url = `${this.baseURL}/${this.version}${endpoint}`;
            
            const config = {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'X-MorphPay-Version': this.version,
                    ...options.headers
                },
                ...options
            };

            if (config.body && typeof config.body === 'object') {
                config.body = JSON.stringify(config.body);
            }

            try {
                const response = await fetch(url, config);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || `HTTP ${response.status}`);
                }

                return data;
            } catch (error) {
                if (this.debug) {
                    console.error('MorphPay API Error:', error);
                }
                throw error;
            }
        }

        // Payment Methods
        async createPaymentIntent(amount, currency = 'USD', metadata = {}) {
            return await this.makeRequest('/payment-intents', {
                method: 'POST',
                body: {
                    amount,
                    currency,
                    metadata
                }
            });
        }

        async confirmPayment(paymentIntentId, paymentMethod) {
            return await this.makeRequest(`/payment-intents/${paymentIntentId}/confirm`, {
                method: 'POST',
                body: {
                    payment_method: paymentMethod
                }
            });
        }

        async getPaymentMethods(customerId) {
            return await this.makeRequest(`/customers/${customerId}/payment-methods`);
        }

        // Subscription Methods
        async createSubscription(customerId, priceId, metadata = {}) {
            return await this.makeRequest('/subscriptions', {
                method: 'POST',
                body: {
                    customer: customerId,
                    price: priceId,
                    metadata
                }
            });
        }

        async cancelSubscription(subscriptionId) {
            return await this.makeRequest(`/subscriptions/${subscriptionId}`, {
                method: 'DELETE'
            });
        }

        // Customer Methods
        async createCustomer(email, name, metadata = {}) {
            return await this.makeRequest('/customers', {
                method: 'POST',
                body: {
                    email,
                    name,
                    metadata
                }
            });
        }

        async getCustomer(customerId) {
            return await this.makeRequest(`/customers/${customerId}`);
        }

        // Event Handling
        on(event, callback) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(callback);
        }

        off(event, callback) {
            if (this.listeners[event]) {
                this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
            }
        }

        emit(event, data) {
            if (this.listeners[event]) {
                this.listeners[event].forEach(callback => callback(data));
            }
        }

        // UI Components
        createPaymentButton(options = {}) {
            const button = document.createElement('button');
            button.className = 'morphpay-button';
            button.textContent = options.text || 'Pay Now';
            button.disabled = options.disabled || false;

            button.addEventListener('click', () => {
                if (options.onClick) {
                    options.onClick();
                } else {
                    this.openCheckout(options);
                }
            });

            return button;
        }

        openCheckout(options = {}) {
            const modal = this.createModal(options);
            document.body.appendChild(modal);
            
            // Focus management
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }

            return modal;
        }

        createModal(options = {}) {
            const modal = document.createElement('div');
            modal.className = 'morphpay-modal';
            
            modal.innerHTML = `
                <div class="morphpay-modal-content">
                    <button class="morphpay-close">&times;</button>
                    <h2>Complete Payment</h2>
                    <form class="morphpay-form" id="morphpay-checkout-form">
                        <div class="morphpay-field">
                            <label class="morphpay-label">Card Number</label>
                            <input type="text" class="morphpay-input" placeholder="1234 5678 9012 3456" maxlength="19" required>
                            <div class="morphpay-error" id="card-error"></div>
                        </div>
                        
                        <div style="display: flex; gap: 1rem;">
                            <div class="morphpay-field" style="flex: 1;">
                                <label class="morphpay-label">Expiry</label>
                                <input type="text" class="morphpay-input" placeholder="MM/YY" maxlength="5" required>
                            </div>
                            <div class="morphpay-field" style="flex: 1;">
                                <label class="morphpay-label">CVC</label>
                                <input type="text" class="morphpay-input" placeholder="123" maxlength="4" required>
                            </div>
                        </div>

                        <div class="morphpay-field">
                            <label class="morphpay-label">Cardholder Name</label>
                            <input type="text" class="morphpay-input" placeholder="John Doe" required>
                        </div>

                        <button type="submit" class="morphpay-button" id="morphpay-submit">
                            Pay ${options.amount ? `$${options.amount}` : ''}
                        </button>
                    </form>
                </div>
            `;

            // Event listeners
            const closeBtn = modal.querySelector('.morphpay-close');
            const form = modal.querySelector('#morphpay-checkout-form');
            const submitBtn = modal.querySelector('#morphpay-submit');

            closeBtn.addEventListener('click', () => {
                this.closeModal(modal);
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleFormSubmit(form, submitBtn, options);
            });

            // Card number formatting
            const cardInput = modal.querySelector('input[placeholder*="1234"]');
            cardInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.substring(0, 16);
                value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                e.target.value = value;
            });

            // Expiry formatting
            const expiryInput = modal.querySelector('input[placeholder="MM/YY"]');
            expiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });

            return modal;
        }

        async handleFormSubmit(form, submitBtn, options) {
            const formData = new FormData(form);
            const inputs = form.querySelectorAll('input');
            
            // Disable form
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="morphpay-loading"></span> Processing...';

            try {
                // Validate form
                let isValid = true;
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.style.borderColor = '#ef4444';
                    } else {
                        input.style.borderColor = '#e5e7eb';
                    }
                });

                if (!isValid) {
                    throw new Error('Please fill in all fields');
                }

                // Create payment method
                const paymentMethod = {
                    type: 'card',
                    card: {
                        number: inputs[0].value.replace(/\s/g, ''),
                        exp_month: parseInt(inputs[1].value.split('/')[0]),
                        exp_year: parseInt('20' + inputs[1].value.split('/')[1]),
                        cvc: inputs[2].value
                    },
                    billing_details: {
                        name: inputs[3].value
                    }
                };

                // Process payment
                let result;
                if (options.paymentIntentId) {
                    result = await this.confirmPayment(options.paymentIntentId, paymentMethod);
                } else if (options.amount) {
                    const intent = await this.createPaymentIntent(options.amount * 100); // Convert to cents
                    result = await this.confirmPayment(intent.id, paymentMethod);
                }

                // Success
                this.emit('payment_success', result);
                if (options.onSuccess) {
                    options.onSuccess(result);
                }

                // Close modal
                setTimeout(() => {
                    this.closeModal(form.closest('.morphpay-modal'));
                }, 1000);

            } catch (error) {
                // Show error
                const errorDiv = form.querySelector('#card-error');
                errorDiv.textContent = error.message;
                
                this.emit('payment_error', error);
                if (options.onError) {
                    options.onError(error);
                }
            } finally {
                // Re-enable form
                submitBtn.disabled = false;
                submitBtn.innerHTML = `Pay ${options.amount ? `$${options.amount}` : ''}`;
            }
        }

        closeModal(modal) {
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            this.emit('modal_closed');
        }

        // Utility Methods
        validateCard(cardNumber) {
            const num = cardNumber.replace(/\s/g, '');
            
            // Luhn algorithm
            let sum = 0;
            let isEven = false;
            
            for (let i = num.length - 1; i >= 0; i--) {
                let digit = parseInt(num.charAt(i));
                
                if (isEven) {
                    digit *= 2;
                    if (digit > 9) {
                        digit -= 9;
                    }
                }
                
                sum += digit;
                isEven = !isEven;
            }
            
            return sum % 10 === 0;
        }

        formatAmount(amount, currency = 'USD') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            }).format(amount);
        }

        // Webhook verification
        verifyWebhook(payload, signature, secret) {
            // Implementation would depend on your webhook signing method
            // This is a placeholder for webhook verification logic
            return true;
        }
    }

    // Export for different module systems
    exports.MorphPay = MorphPay;
    exports.default = MorphPay;

    // Global registration
    if (typeof window !== 'undefined') {
        window.MorphPay = MorphPay;
    }

}));