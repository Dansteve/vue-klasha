<template>
  <div class="App">
    <div 
      id="container" 
      class="ion-text-center"
    >
      <p><strong class="padding">Welcome to Dansteve Adekanbi</strong></p>
      <p><strong class="padding">Vue-Klasha package testing</strong></p>
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
          :on-close="onClose"
          :embed="false"
        >
          <div>Pay me, My Money</div>
        </klasha>
      </div>

      <div
        v-if="paymentData"
        class="margin"
      >
        <div>Payment Data</div>
        <div  
          class="margin"
        >
          <code>
            {{ paymentData }}
          </code>
        </div>
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
    data(){
        return{
            isTestMode : true,
            email: 'danstevea@gmail.com',
            phoneNumber: '+2348159991635',
            merchantKey: 'GByi/gkhn5+BX4j6uI0lR7HCVo2NvTsVAQhyPko/uK4=',
            amount: 1000,
            sourceCurrency: '',
            destinationCurrency: '',
            txRef: '' + this.makeId(16),
            businessId: '1',
            fullname: 'Dansteve Adekanbi',
            paymentDescription: '',
            paymentType: '',
            paymentData : {}
        }
    },
    computed: {
        
    },
    methods: {
        makeId(length) {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        },
        callBack: function(response){
            console.log(response)
            this.paymentData = response;
        },
        onClose: function(){
            console.log("Payment closed")
        }
    }
}
</script>
<style>
    .App {
        /* text-align: center;
        margin: auto;
        width: 50%;
        padding: 10px; */
    }

    .App-intro {
        font-size: large;
    }
    .klashaPayButtonStyle{
        background-color: #4CAF50; /* Green */
        border-radius: 20px;
        color: white;
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
        font-family: Consolas,"courier new";
        font-family: monospace;
        background-color: #f1f1f1;
        padding: 20px;
        font-size: 105%;
    }

</style>
