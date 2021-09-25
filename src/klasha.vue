/*eslint camelcase: ["error", {properties: "never"}]*/
<template>
  <button
    v-if="!embed"
    class="klashaPayButtonStyle"
    @click="payWithKlasha"
  >
    <slot>Make Payment</slot>
  </button>
  <div
    v-else
    id="klashaEmbedContainer"
  />
</template>

<script type="text/javascript">
export default {
    props: {
        embed: {
            type: Boolean,
            default: false
        },
        isTestMode: {
            type: Boolean,
            required: true,
            default: true
        },
        merchantKey: {
            type: String,
            required: true,
            default: ""
        },
        businessId: {
            type: String,
            default: ""
        },
        amount: {
            type: Number,
            required: true
        },
        txRef: {
            type: String,
            required: true
        },
        sourceCurrency: {
            type: String,
            default: "NGN"
        },
        destinationCurrency: {
            type: String,
            default: "NGN"
        },
        fullname: {
            type: String,
            default: ""
        },
        email: {
            type: String,
            default: ""
        },
        phoneNumber: {
            type: String,
            default: ""
        },
        paymentDescription: {
            type: String,
            default: ""
        },
        callbackUrl: {
            type: String,
            default: ""
        },
        metadata: {
            type: Object,
            default: function() {
                return {};
            }
        },
        paymentType: {
            type: String,
            default: ""
        },
        callBack: {
            type: Function,
            required: true,
            default: function(response) {}
        },
        onClose: {
            type: Function,
            required: false,
            default: function() {}
        },
        init: {
            type: Function,
            required: false,
            default: function() {}
        },
    },
    data() {
        return {
            scriptLoaded: null
        };
    },
    created() {
        this.scriptLoaded = new Promise(resolve => {
            this.loadScript(() => {
                resolve();
            });
        });
    },
    mounted() {
        if (this.embed) {
            this.payWithKlasha();
        }
    },
    methods: {
        loadScript(callback) {
            return new Promise(resolve => {
                const divScript = window.document.createElement('div');
                divScript.id = 'ktest';
                window.document.body.appendChild(divScript);
                const script = window.document.createElement('script');
                window.document.head.appendChild(script);
                const onLoadFunc = () => {
                    script.removeEventListener('load', onLoadFunc);
                    resolve();
                };
                script.addEventListener('load', onLoadFunc);
                if (this.isTestMode) {
                    script.setAttribute('src', 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js');
                } else {
                    script.setAttribute('src', 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js');
                }
                console.log('loaded');


                const script1 = window.document.createElement('script');
                window.document.head.appendChild(script1);
                const onLoadFunc1 = () => {
                    script1.removeEventListener('load', onLoadFunc1);
                    callback();
                };
                script1.addEventListener('load', onLoadFunc1);
                if (this.isTestMode) {
                    script1.setAttribute('src', 'https://klastatic.fra1.digitaloceanspaces.com/test/js/klasha-integration.js');
                } else {
                    script1.setAttribute('src', 'https://klastatic.fra1.digitaloceanspaces.com/prod/js/klasha-integration.js');
                }
                console.log('loaded1');
                if (script1.readyState) {
                    // IE
                    script1.onreadystatechange = () => {
                        if (
                            script1.readyState === "loaded" ||
                            script1.readyState === "complete"
                        ) {
                            script1.onreadystatechange = null;
                            callback();
                        }
                    };
                } else {
                    // Others
                    script1.onload = () => {
                        callback();
                    };
                }
            });
        },

        isDynamicSplit() {
            return this.split.constructor === Object && Object.keys(this.split).length > 0;
        },
        makeId(length) {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        },
        payWithKlasha() {
            this.scriptLoaded &&
        this.scriptLoaded.then(() => {
            const klashaOptions = {
                isTestMode: this.isTestMode || true,
                merchantKey: this.merchantKey,
                businessId: this.businessId,
                amount: this.amount,
                tx_ref: this.txRef,
                sourceCurrency: this.sourceCurrency,
                destinationCurrency: this.destinationCurrency,
                fullname: this.fullname,
                email: this.email,
                phone_number: this.phoneNumber,
                paymentDescription: this.paymentDescription,
                callbackUrl: this.callbackUrl,
                metadata: this.metadata,
                kit: {
                    currency: this.sourceCurrency || 'NGN',
                    phone_number: this.phoneNumber || '',
                    email: this.email || '',
                    fullname: this.fullname || '',
                    tx_ref: this.txFef || this.makeId(16),
                    paymentType: this.paymentType || '',
                    callBack: response => {
                        this.callBack(response);
                    },
                },
                callBack: response => {
                    this.callBack(response);
                },
                onClose: response => {
                    this.onClose(response);
                },
            };

            if (this.embed) {
                klashaOptions.container = "klashaEmbedContainer";
            }

            console.log(klashaOptions);

            const payment = new window.KlashaClient(
                klashaOptions.merchantKey,
                klashaOptions.businessId || 1,
                klashaOptions.amount,
                'ktest',
                klashaOptions.callbackUrl,
                klashaOptions.destinationCurrency || 'NGN',
                klashaOptions.sourceCurrency || 'NGN',
                klashaOptions.kit);
           
            if (!this.embed) {
                payment.init();
            }
        });
        }
    }
};
</script>

