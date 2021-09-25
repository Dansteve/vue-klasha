# Klasha Component for Vue 2.x

A Vue Plugin for Klasha payment gateway.

### Demo

![Demo Image](vue-klasha.png?raw=true "Demo Image")

### Install

#### NPM

```
npm install vue vue-klasha --save
```

#### Javascript via CDN

```javascript 1.8
<!-- Vue -->
<script src="https://unpkg.com/vue/dist/vue.js"></script>
<!-- Vue-Klasha -->
<script src="https://unpkg.com/vue-klasha/dist/klasha.min.js"></script>
```

### Usage

#### Via NPM

###### my-compnent.vue sample

```vue
<template>
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
    <i class="fas fa-money-bill-alt"></i>
    Make Payment
  </klasha>
</template>

<script type="text/javascript">
import klasha from 'vue-klasha';
export default {
    components: {
        klasha
    },
    data(){
        return{
            isTestMode : true,
            email: 'some data',
            phoneNumber: 'some phoneNumber',
            merchantKey: 'your merchantKey',
            amount: 1000 // in kobo,
            sourceCurrency: '' || 'NGN',
            destinationCurrency: '' || 'NGN',,
            txRef: '' + this.makeId(16),
            businessId: '1',
            fullname: 'some fullname',
            paymentDescription: '',
            paymentType: '',
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
        }
    }
}
</script>
```

[Usage Example via NPM or Yarn](examples/commonjs/App.vue)

#### via CDN

```javascript 1.8
new Vue({
        el: '#app',
        components:{
          'klasha': VueKlasha.default
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
          }
        },
        data: {
          isTestMode : true,
          email: 'some data',
          phoneNumber: 'some phoneNumber',
          merchantKey: 'your merchantKey',
          amount: 1000 // in kobo,
          sourceCurrency: '' || 'NGN',
          destinationCurrency: '' || 'NGN',,
          txRef: '' + this.makeId(16),
          businessId: '1',
          fullname: 'some fullname',
          paymentDescription: '',
          paymentType: '',
        }
    });
```

[Usage Example via CDN](examples/index.html)

Please checkout [Klasha Documentation](https://documenter.getpostman.com/view/8963555/TzJoFgHh) for other available options you can add to the

## Deployment

REMEMBER TO CHANGE THE *merchantKey* WHEN DEPLOYING ON A LIVE/PRODUCTION SYSTEM

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Some commit message'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request 😉😉

## How can I thank you?

Why not star the github repo? I'd love the attention! Why not share the link for this repository on Twitter or Any Social Media? Spread the word!

Don't forget to [follow me on twitter](https://twitter.com/dansteveade)!

Thanks!
Dansteve Adekanbi.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details
