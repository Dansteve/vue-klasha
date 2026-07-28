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

export const KLASHA_SCRIPT_URL = 'https://js.klasha.com/pay.js';
export const KLASHA_SCRIPT_ID = 'klasha-pay-js';

let scriptPromise = null;

/**
 * Loads pay.js at most once per page and resolves with the global
 * `KlashaClient` constructor.
 *
 * @returns {Promise<Function>}
 */
export function loadKlashaScript() {
    if (typeof window === 'undefined' || typeof window.document === 'undefined') {
        return Promise.reject(
            new Error('vue-klasha: no document available (server-side render?).')
        );
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
                reject(
                    new Error(
                        'vue-klasha: ' +
              KLASHA_SCRIPT_URL +
              ' loaded but did not define window.KlashaClient.'
                    )
                );
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
export function resetKlashaScriptCache() {
    scriptPromise = null;
}
