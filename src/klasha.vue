<template>
  <button
    v-if="!embed"
    class="klashaPayButtonStyle"
    type="button"
    @click="payWithKlasha"
  >
    <slot>Make Payment</slot>
  </button>
  <div
    v-else
    :id="containerElementId"
    class="klashaEmbedContainer"
  />
</template>

<script type="text/javascript">
/*
 * vue-klasha — Vue 2 wrapper around Klasha's hosted checkout.
 *
 * The integration contract implemented here was verified against the shipped
 * https://js.klasha.com/pay.js. Notably:
 *
 *   - There is ONE script URL for both test and live. The environment is chosen
 *     by the 9th constructor argument (`isTestMode`), NOT by the script URL.
 *     The old DigitalOcean Spaces buckets (klastatic.fra1.digitaloceanspaces.com)
 *     have been deleted and return 404.
 *   - jQuery is not required. pay.js loads what it needs itself.
 *   - pay.js reads `kit.phone`, not `kit.phone_number`.
 *   - pay.js MUTATES the kit object it is given (businessId, currency,
 *     redirect_url), so a fresh kit is built for every payment.
 */

import { loadKlashaScript } from './load-script';

let instanceCounter = 0;

export default {
    name: 'Klasha',
    props: {
        /**
         * Render an inline container instead of a button, and start the
         * payment as soon as the component mounts.
         */
        embed: {
            type: Boolean,
            default: false
        },
        /**
         * true  -> Klasha sandbox.
         * false -> LIVE gateway, real money.
         * Defaults to true so that a missing value can never charge a real card.
         */
        isTestMode: {
            type: Boolean,
            default: true
        },
        merchantKey: {
            type: String,
            required: true,
            default: ''
        },
        businessId: {
            type: [String, Number],
            default: ''
        },
        amount: {
            type: Number,
            required: true,
            default: 0
        },
        /**
         * Your own transaction reference. If omitted, one is generated and
         * emitted as the `tx-ref` event so you can still reconcile it.
         */
        txRef: {
            type: String,
            default: ''
        },
        sourceCurrency: {
            type: String,
            default: 'NGN'
        },
        destinationCurrency: {
            type: String,
            default: 'NGN'
        },
        fullname: {
            type: String,
            default: ''
        },
        email: {
            type: String,
            default: ''
        },
        phoneNumber: {
            type: String,
            default: ''
        },
        paymentDescription: {
            type: String,
            default: ''
        },
        callbackUrl: {
            type: String,
            default: ''
        },
        metadata: {
            type: Object,
            default: function() {
                return {};
            }
        },
        paymentType: {
            type: String,
            default: ''
        },
        /**
         * Explicit DOM id for the checkout container. Leave empty to get a
         * unique per-instance id (recommended).
         */
        containerId: {
            type: String,
            default: ''
        },
        callBack: {
            type: Function,
            required: true,
            default: function() {}
        },
        /**
         * Kept for API compatibility. pay.js does not currently expose a
         * "modal closed" hook, so this is not invoked by the gateway.
         */
        onClose: {
            type: Function,
            required: false,
            default: function() {}
        },
        /** Called right before the checkout is opened. */
        init: {
            type: Function,
            required: false,
            default: function() {}
        }
    },
    data() {
        instanceCounter += 1;
        return {
            containerElementId: this.containerId || 'klasha-container-' + instanceCounter,
            ownsContainer: false,
            scriptLoaded: null
        };
    },
    created() {
        // Warm the script up so the first click is not blocked on a network round trip.
        this.scriptLoaded = loadKlashaScript();
        this.scriptLoaded.then(
            () => {
                this.$emit('ready');
            },
            error => {
                // Drop the rejected promise so the next payWithKlasha() retries
                // the load rather than replaying the failure forever.
                this.scriptLoaded = null;
                this.$emit('error', error);
            }
        );
    },
    mounted() {
        if (this.embed) {
            this.payWithKlasha();
        }
    },
    beforeDestroy() {
        this.removeContainer();
    },
    methods: {
        makeId(length) {
            let result = '';
            const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        },

        /**
         * Resolves the transaction reference: the merchant's `txRef` if given,
         * otherwise a generated one (emitted so it is not lost).
         */
        resolveTxRef() {
            if (typeof this.txRef === 'string' && this.txRef.length > 0) {
                return this.txRef;
            }
            const generated = this.makeId(16);
            this.$emit('tx-ref', generated);
            return generated;
        },

        /**
         * Makes sure a container element with `containerElementId` exists and
         * returns its id. Never appends a second element with the same id.
         */
        ensureContainer() {
            const doc = window.document;
            const existing = doc.getElementById(this.containerElementId);
            if (existing) {
                return this.containerElementId;
            }
            const el = doc.createElement('div');
            el.id = this.containerElementId;
            el.className = 'klashaContainer';
            doc.body.appendChild(el);
            this.ownsContainer = true;
            return this.containerElementId;
        },

        removeContainer() {
            if (!this.ownsContainer || typeof window === 'undefined') {
                return;
            }
            const el = window.document.getElementById(this.containerElementId);
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            this.ownsContainer = false;
        },

        /**
         * Builds a FRESH kit object. pay.js mutates whatever it is handed, so
         * this must never be cached or shared between payments.
         */
        buildKit(txRef) {
            return {
                currency: this.sourceCurrency || 'NGN',
                amount: this.amount,
                email: this.email || '',
                // pay.js reads `phone`. `phone_number` is kept for merchants
                // and integrations that still read it off the kit themselves.
                phone: this.phoneNumber || '',
                phone_number: this.phoneNumber || '',
                fullname: this.fullname || '',
                tx_ref: txRef,
                // pay.js reads `productType`; `paymentType` retained for compat.
                productType: this.paymentType || '',
                paymentType: this.paymentType || '',
                paymentDescription: this.paymentDescription || '',
                metadata: this.metadata || {},
                callBack: response => {
                    this.$emit('success', response);
                    this.callBack(response);
                }
            };
        },

        payWithKlasha() {
            const pending = this.scriptLoaded || loadKlashaScript();
            return pending
                .then(KlashaClient => {
                    const txRef = this.resolveTxRef();
                    const containerId = this.ensureContainer();
                    const kit = this.buildKit(txRef);

                    this.init();

                    const payment = new KlashaClient(
                        this.merchantKey,
                        this.businessId || 1,
                        this.amount,
                        containerId,
                        this.callbackUrl,
                        // pay.js calls this parameter `countryCode`; the value the
                        // gateway expects here is the destination currency.
                        this.destinationCurrency || 'NGN',
                        this.sourceCurrency || 'NGN',
                        kit,
                        // 9th argument. This is the ONLY thing that selects
                        // sandbox vs live. Cast hard: "false" would be truthy.
                        Boolean(this.isTestMode)
                    );

                    if (!this.embed) {
                        payment.init();
                    }

                    return payment;
                })
                .catch(error => {
                    // Drop the cached (rejected) promise so a second click can
                    // retry the script load instead of failing forever.
                    this.scriptLoaded = null;
                    // Surfaced as an event rather than an unhandled rejection,
                    // because this is also wired straight to a click handler.
                    this.$emit('error', error);
                    return null;
                });
        }
    }
};
</script>
