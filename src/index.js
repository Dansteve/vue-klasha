import klasha from './klasha.vue';
import {
    loadKlashaScript,
    resetKlashaScriptCache,
    KLASHA_SCRIPT_URL,
    KLASHA_SCRIPT_ID
} from './load-script';

// Allows `Vue.use(VueKlasha)` in addition to local registration.
klasha.install = function install(Vue, options) {
    Vue.component((options && options.name) || 'klasha', klasha);
};

export default klasha;
export {
    klasha as Klasha,
    loadKlashaScript,
    resetKlashaScriptCache,
    KLASHA_SCRIPT_URL,
    KLASHA_SCRIPT_ID
};
