<template>
  <div class="App">
    <div
      id="container"
      class="ion-text-center"
    >
      <p><strong class="padding">vue-klasha</strong></p>
      <p><strong class="padding">Vue 2 component for the Klasha payment gateway</strong></p>
      <br>
      <div class="margin">
        <klasha
          :is-test-mode="isTestMode"
          :email="email"
          :phone-number="phoneNumber"
          :merchant-key="merchantKey"
          :amount="amount"
          :source-currency="sourceCurrency"
          :destination-currency="destinationCurrency"
          :tx-ref="txRef"
          :business-id="businessId"
          :fullname="fullname"
          :payment-type="paymentType"
          :payment-description="paymentDescription"
          :call-back="callBack"
          :embed="false"
          @error="onError"
          @tx-ref="onGeneratedTxRef"
        >
          <div>Pay me, My Money</div>
        </klasha>
      </div>

      <div
        v-if="paymentData"
        class="margin"
      >
        <div>Payment Data</div>
        <div class="margin">
          <code>{{ paymentData }}</code>
        </div>
      </div>

      <div
        v-if="error"
        class="margin"
      >
        <code>{{ error }}</code>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import klasha from '../../src';

export default {
    components: {
        klasha
    },
    data() {
        return {
            // true  -> Klasha sandbox
            // false -> LIVE gateway, real money
            isTestMode: true,
            email: 'buyer@example.com',
            phoneNumber: '+2348159991635',
            // Replace with your own key from the Klasha dashboard.
            merchantKey: 'YOUR_TEST_MERCHANT_KEY',
            amount: 1000,
            sourceCurrency: 'NGN',
            destinationCurrency: 'NGN',
            txRef: 'DEMO-' + Date.now(),
            businessId: '1',
            fullname: 'Ada Lovelace',
            paymentDescription: '',
            paymentType: '',
            paymentData: null,
            error: null
        };
    },
    methods: {
        callBack(response) {
            this.paymentData = response;
        },
        onError(error) {
            this.error = error.message;
        },
        onGeneratedTxRef(txRef) {
            this.txRef = txRef;
        }
    }
};
</script>
<style>
    .App-intro {
        font-size: large;
    }
    .klashaPayButtonStyle{
        background-color: #4CAF50; /* Green */
        border-radius: 20px;
        color: white;
        border: 0;
        cursor: pointer;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
    }
    #container {
        text-align: center;
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
    }

    #container strong {
        font-size: 20px;
        line-height: 26px;
    }

    #container p {
        font-size: 16px;
        line-height: 22px;
        color: #8c8c8c;
        margin: 0;
    }

    #container a {
        text-decoration: none;
    }

    .padding{
        padding: 26px;
    }

    .margin{
        margin: 26px;
    }

    code {
        font-family: Consolas, "courier new";
        font-family: monospace;
        background-color: #f1f1f1;
        padding: 20px;
        font-size: 105%;
    }
</style>
