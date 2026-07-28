# vue-klasha

Klasha payment gateway component for **Vue 2.x**.

[![npm](https://img.shields.io/npm/v/vue-klasha.svg)](https://www.npmjs.com/package/vue-klasha)
[![license](https://img.shields.io/npm/l/vue-klasha.svg)](LICENSE)

---

## ⚠️ Upgrade immediately if you are on 0.0.x

**Every 0.0.x release of `vue-klasha` (up to and including 0.0.5) is completely
non-functional.** Do not ship it.

| What was broken | Detail |
| --- | --- |
| **The script it loaded no longer exists** | 0.0.x fetched `https://klastatic.fra1.digitaloceanspaces.com/{test,prod}/js/klasha-integration.js`. That bucket has been **deleted** and returns `NoSuchBucket` (404) for both test and prod. `window.KlashaClient` is therefore never defined, and clicking Pay does nothing. |
| **The 9th `isTestMode` argument is missing** | `KlashaClient` takes `isTestMode` as its 9th constructor argument, and on the current `pay.js` it is the *only* thing selecting sandbox vs production. 0.0.x passes **8**. This matters now: the current script uses one URL for both environments, so repointing without adding the argument would route sandbox traffic to production. (While the old CDN existed, 0.0.x did pick `/test/js/` vs `/prod/js/` correctly, so there is no reason to think past sandbox payments went live.) |
| **Your `txRef` was thrown away** | The kit was built with `tx_ref: this.txFef || this.makeId(16)`. There is no `txFef` prop — it is a typo for `txRef` — so *every* transaction got a random reference instead of yours. Reconciliation was impossible. |
| **The phone number never reached Klasha** | The kit set `phone_number`; the gateway reads `phone`. |
| **Your merchant key was logged to the console** | `console.log(klashaOptions)` printed the whole options object, `merchantKey` included, on every payment. |
| **Duplicate DOM ids** | A `<div id="ktest">` was appended to `<body>` on every mount and never removed. |
| **jQuery was loaded for nothing** | Two scripts were injected; the gateway does not use jQuery. |

**1.0.0 fixes all of the above.**

## Vue 2 only

This package targets **Vue 2.6 / 2.7**. Vue is a `peerDependency`, so your app's
Vue is the one that gets used (0.0.x listed Vue as a regular `dependency`, which
could give you two Vue instances).

**Using Vue 3?** Use [`vue3-klasha`](https://www.npmjs.com/package/vue3-klasha)
instead.

> Note: Vue 2 reached end-of-life in December 2023 and no longer receives
> security patches. This package is maintained for existing Vue 2 apps; new
> projects should start on Vue 3 with `vue3-klasha`.

## Install

```bash
npm install vue-klasha
# vue is a peer dependency
npm install vue@^2.7
```

or via CDN:

```html
<!-- Vue 2 -->
<script src="https://unpkg.com/vue@2/dist/vue.js"></script>
<!-- vue-klasha (UMD) -->
<script src="https://unpkg.com/vue-klasha/dist/klasha.min.js"></script>
```

You do **not** need to add a `<script>` tag for Klasha itself.
`https://js.klasha.com/pay.js` is injected once, automatically, on demand.

## Usage

### Single-file component

```vue
<template>
  <klasha
    :is-test-mode="isTestMode"
    :merchant-key="merchantKey"
    :business-id="businessId"
    :amount="amount"
    :tx-ref="txRef"
    :source-currency="sourceCurrency"
    :destination-currency="destinationCurrency"
    :email="email"
    :phone-number="phoneNumber"
    :fullname="fullname"
    :payment-type="paymentType"
    :payment-description="paymentDescription"
    :callback-url="callbackUrl"
    :call-back="callBack"
    :embed="false"
    @success="onSuccess"
    @error="onError"
    @tx-ref="onGeneratedTxRef"
  >
    <i class="fas fa-money-bill-alt" />
    Make Payment
  </klasha>
</template>

<script>
import klasha from 'vue-klasha';

export default {
    components: { klasha },
    data() {
        return {
            // true  -> Klasha sandbox
            // false -> LIVE gateway, real money
            isTestMode: true,
            merchantKey: process.env.VUE_APP_KLASHA_MERCHANT_KEY,
            businessId: '1',
            amount: 1000,
            txRef: 'ORDER-' + Date.now(),
            sourceCurrency: 'NGN',
            destinationCurrency: 'NGN',
            email: 'buyer@example.com',
            phoneNumber: '+2348159991635',
            fullname: 'Ada Lovelace',
            paymentType: '',
            paymentDescription: '',
            callbackUrl: 'https://shop.example.com/klasha/callback'
        };
    },
    methods: {
        callBack(response) {
            console.log('payment response', response);
        },
        onSuccess(response) {
            console.log('payment response (event)', response);
        },
        onError(error) {
            console.error('klasha failed to load', error);
        },
        onGeneratedTxRef(txRef) {
            // Only fires when you did not supply :tx-ref yourself.
            this.txRef = txRef;
        }
    }
};
</script>
```

[Full example](examples/commonjs/App.vue)

### As a plugin

```js
import Vue from 'vue';
import VueKlasha from 'vue-klasha';

Vue.use(VueKlasha);            // registers <klasha>
Vue.use(VueKlasha, { name: 'klasha-pay' }); // or under your own name
```

### Via CDN

```html
<div id="app">
  <klasha
    :is-test-mode="isTestMode"
    :merchant-key="merchantKey"
    :amount="amount"
    :tx-ref="txRef"
    :business-id="businessId"
    :email="email"
    :phone-number="phoneNumber"
    :fullname="fullname"
    :call-back="callBack"
  >Make Payment</klasha>
</div>

<script>
new Vue({
    el: '#app',
    components: {
        // the UMD bundle exposes the component as VueKlasha.default
        klasha: VueKlasha.default
    },
    data: function () {
        return {
            isTestMode: true,
            merchantKey: 'YOUR_TEST_MERCHANT_KEY',
            amount: 1000,
            txRef: 'ORDER-' + Date.now(),
            businessId: '1',
            email: 'buyer@example.com',
            phoneNumber: '+2348159991635',
            fullname: 'Ada Lovelace'
        };
    },
    methods: {
        callBack: function (response) { console.log(response); }
    }
});
</script>
```

[Full CDN example](examples/index.html)

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `merchantKey` | `String` | ✅ | — | Merchant key from your Klasha dashboard. |
| `amount` | `Number` | ✅ | — | Amount in the source currency's minor unit. |
| `callBack` | `Function` | ✅ | noop | Called with the gateway response. |
| `isTestMode` | `Boolean` | | `true` | `true` = sandbox, `false` = **live gateway, real money**. Forwarded as the 9th `KlashaClient` argument. |
| `businessId` | `String \| Number` | | `''` | Business id from your dashboard (falls back to `1`). |
| `txRef` | `String` | | `''` | Your transaction reference. Generated and emitted as `tx-ref` if omitted. |
| `sourceCurrency` | `String` | | `'NGN'` | Currency the customer pays in. |
| `destinationCurrency` | `String` | | `'NGN'` | Currency you are settled in. |
| `email` | `String` | | `''` | Customer email. |
| `phoneNumber` | `String` | | `''` | Customer phone. Sent to the gateway as `kit.phone`. |
| `fullname` | `String` | | `''` | Customer name. |
| `paymentType` | `String` | | `''` | Sent to the gateway as `kit.productType`. |
| `paymentDescription` | `String` | | `''` | Free-text description. |
| `callbackUrl` | `String` | | `''` | Merchant callback URL. |
| `metadata` | `Object` | | `{}` | Extra data passed through on the kit. |
| `embed` | `Boolean` | | `false` | Render an inline container instead of a button and start on mount. |
| `containerId` | `String` | | auto | Explicit DOM id for the checkout container. Leave unset for a unique per-instance id. |
| `init` | `Function` | | noop | Called just before checkout opens. |
| `onClose` | `Function` | | noop | Accepted for API compatibility. `pay.js` does not currently expose a "modal closed" hook, so **this is not invoked by the gateway**. |

## Events

| Event | Payload | When |
| --- | --- | --- |
| `ready` | — | `pay.js` finished loading. |
| `success` | gateway response | Same payload as `callBack`. |
| `error` | `Error` | The script failed to load, or checkout could not be started. |
| `tx-ref` | `String` | A reference was generated because you did not supply `txRef`. Record it. |

## Test mode vs live mode

`isTestMode` is the **only** thing that selects the environment — there is one
script URL for both. Internally it chooses between Klasha's development and
production gateway hosts.

```vue
<klasha :is-test-mode="true" ... />   <!-- sandbox -->
<klasha :is-test-mode="false" ... />  <!-- LIVE, real money -->
```

It defaults to `true` so that a missing or mistyped value can never charge a real
card. Bind a real boolean — a string such as `"false"` is truthy in JavaScript
(the component casts with `Boolean()` as a safety net, but Vue will also warn on
a type mismatch).

**Never hard-code a live merchant key in client source or commit it.** Read it
from your build-time environment.

## Styling the button

The default button carries the class `klashaPayButtonStyle`:

```html
<style>
    .klashaPayButtonStyle {
        background-color: #4CAF50;
        border-radius: 20px;
        border: 0;
        color: white;
        cursor: pointer;
        padding: 15px 32px;
        font-size: 16px;
    }
</style>
```

In `embed` mode the rendered container carries the class `klashaEmbedContainer`.

## Development

```bash
npm install
npm run lint     # eslint
npm test         # jest + @vue/test-utils
npm run build    # UMD -> dist/klasha.min.js, ESM -> dist/klasha.esm.js
npm run dev      # webpack-dev-server against examples/commonjs
```

The test suite mocks `window.KlashaClient` and asserts on the constructor
arguments. It cannot complete a real payment — that requires live merchant
credentials.

## Contributing

1. Fork it
2. Create your feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Some commit message'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request 😉

## How can I thank you?

Star the repo, or share it. Don't forget to
[follow me on twitter](https://twitter.com/dansteveade)!

Dansteve Adekanbi — [dansteve.com](https://dansteve.com)

## License

MIT — see [LICENSE](LICENSE).
