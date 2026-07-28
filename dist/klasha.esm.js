
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/klasha.vue?vue&type=template&id=59617b68
var render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return !_vm.embed ? _c("button", {
    staticClass: "klashaPayButtonStyle",
    attrs: {
      type: "button"
    },
    on: {
      click: _vm.payWithKlasha
    }
  }, [_vm._t("default", function () {
    return [_vm._v("Make Payment")];
  })], 2) : _c("div", {
    staticClass: "klashaEmbedContainer",
    attrs: {
      id: _vm.containerElementId
    }
  });
};
var staticRenderFns = [];
render._withStripped = true;

;// ./src/klasha.vue?vue&type=template&id=59617b68

;// ./src/load-script.js
/*
 * Loader for Klasha's hosted checkout script.
 *
 * There is exactly ONE script URL for both test and live. The environment is
 * chosen by the 9th `KlashaClient` constructor argument (`isTestMode`), NOT by
 * the script URL. The old DigitalOcean Spaces buckets
 * (klastatic.fra1.digitaloceanspaces.com/{test,prod}/js/klasha-integration.js)
 * have been deleted and return 404, which is why vue-klasha 0.0.x is
 * completely non-functional.
 *
 * jQuery is not required — pay.js loads its own dependencies.
 */

const KLASHA_SCRIPT_URL = 'https://js.klasha.com/pay.js';
const KLASHA_SCRIPT_ID = 'klasha-pay-js';
let scriptPromise = null;

/**
 * Loads pay.js at most once per page and resolves with the global
 * `KlashaClient` constructor.
 *
 * @returns {Promise<Function>}
 */
function loadKlashaScript() {
  if (typeof window === 'undefined' || typeof window.document === 'undefined') {
    return Promise.reject(new Error('vue-klasha: no document available (server-side render?).'));
  }
  if (typeof window.KlashaClient === 'function') {
    return Promise.resolve(window.KlashaClient);
  }
  if (scriptPromise) {
    return scriptPromise;
  }
  scriptPromise = new Promise((resolve, reject) => {
    const doc = window.document;
    let script = doc.getElementById(KLASHA_SCRIPT_ID);
    const isNew = !script;
    if (isNew) {
      script = doc.createElement('script');
      script.id = KLASHA_SCRIPT_ID;
      script.async = true;
    }
    const cleanUp = () => {
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
    };
    const onLoad = () => {
      cleanUp();
      if (typeof window.KlashaClient !== 'function') {
        scriptPromise = null;
        reject(new Error('vue-klasha: ' + KLASHA_SCRIPT_URL + ' loaded but did not define window.KlashaClient.'));
        return;
      }
      resolve(window.KlashaClient);
    };
    const onError = () => {
      cleanUp();
      scriptPromise = null;
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      reject(new Error('vue-klasha: failed to load ' + KLASHA_SCRIPT_URL + '.'));
    };
    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);
    if (isNew) {
      // src is assigned last so the listeners are attached before the
      // request can start.
      script.setAttribute('src', KLASHA_SCRIPT_URL);
      doc.head.appendChild(script);
    }
  });
  return scriptPromise;
}

/**
 * Clears the cached in-flight/settled script promise. Intended for tests.
 */
function resetKlashaScriptCache() {
  scriptPromise = null;
}
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/klasha.vue?vue&type=script&lang=js
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


let instanceCounter = 0;
/* harmony default export */ const klashavue_type_script_lang_js = ({
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
      default: function () {
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
      default: function () {}
    },
    /**
     * Kept for API compatibility. pay.js does not currently expose a
     * "modal closed" hook, so this is not invoked by the gateway.
     */
    onClose: {
      type: Function,
      required: false,
      default: function () {}
    },
    /** Called right before the checkout is opened. */
    init: {
      type: Function,
      required: false,
      default: function () {}
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
    this.scriptLoaded.then(() => {
      this.$emit('ready');
    }, error => {
      // Drop the rejected promise so the next payWithKlasha() retries
      // the load rather than replaying the failure forever.
      this.scriptLoaded = null;
      this.$emit('error', error);
    });
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
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
      return pending.then(KlashaClient => {
        const txRef = this.resolveTxRef();
        const containerId = this.ensureContainer();
        const kit = this.buildKit(txRef);
        this.init();
        const payment = new KlashaClient(this.merchantKey, this.businessId || 1, this.amount, containerId, this.callbackUrl,
        // pay.js calls this parameter `countryCode`; the value the
        // gateway expects here is the destination currency.
        this.destinationCurrency || 'NGN', this.sourceCurrency || 'NGN', kit,
        // 9th argument. This is the ONLY thing that selects
        // sandbox vs live. Cast hard: "false" would be truthy.
        Boolean(this.isTestMode));
        if (!this.embed) {
          payment.init();
        }
        return payment;
      }).catch(error => {
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
});
;// ./src/klasha.vue?vue&type=script&lang=js
 /* harmony default export */ const src_klashavue_type_script_lang_js = (klashavue_type_script_lang_js); 
;// ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent(
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */,
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options =
    typeof scriptExports === 'function' ? scriptExports.options : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) {
    // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () {
          injectStyles.call(
            this,
            (options.functional ? this.parent : this).$root.$options.shadowRoot
          )
        }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functional component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}

;// ./src/klasha.vue





/* normalize component */
;
var component = normalizeComponent(
  src_klashavue_type_script_lang_js,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const klasha = (component.exports);
;// ./src/index.js



// Allows `Vue.use(VueKlasha)` in addition to local registration.
klasha.install = function install(Vue, options) {
  Vue.component(options && options.name || 'klasha', klasha);
};
/* harmony default export */ const src = (klasha);

export { KLASHA_SCRIPT_ID, KLASHA_SCRIPT_URL, klasha as Klasha, src as default, loadKlashaScript, resetKlashaScriptCache };

//# sourceMappingURL=klasha.esm.js.map