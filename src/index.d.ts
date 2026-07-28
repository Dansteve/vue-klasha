import Vue, { PluginObject } from 'vue';

/** Whatever Klasha hands back to `callBack`. */
export type KlashaResponse = Record<string, any>;

export interface KlashaProps {
    /**
     * Render an inline container instead of a button and start the payment on
     * mount. Default: `false`.
     */
    embed?: boolean;
    /**
     * `true` -> Klasha sandbox. `false` -> LIVE gateway, real money.
     * Forwarded as the 9th `KlashaClient` constructor argument, which is the
     * only thing that selects the environment. Default: `true`.
     */
    isTestMode?: boolean;
    /** Merchant key from the Klasha dashboard. Required. */
    merchantKey: string;
    /** Business id from the Klasha dashboard. */
    businessId?: string | number;
    /** Amount in the source currency's minor unit. Required. */
    amount: number;
    /** Your transaction reference. Generated (and emitted) if omitted. */
    txRef?: string;
    /** Currency the customer pays in. Default: `'NGN'`. */
    sourceCurrency?: string;
    /** Currency you get settled in. Default: `'NGN'`. */
    destinationCurrency?: string;
    fullname?: string;
    email?: string;
    phoneNumber?: string;
    paymentDescription?: string;
    callbackUrl?: string;
    metadata?: Record<string, any>;
    paymentType?: string;
    /** Explicit container DOM id. Leave unset for a unique per-instance id. */
    containerId?: string;
    /** Called with the gateway response. Required. */
    callBack: (response: KlashaResponse) => void;
    /**
     * Accepted for API compatibility. pay.js does not currently expose a
     * "modal closed" hook, so this is not invoked by the gateway.
     */
    onClose?: (response?: KlashaResponse) => void;
    /** Called right before the checkout is opened. */
    init?: () => void;
}

/** URL of Klasha's hosted checkout script. */
export declare const KLASHA_SCRIPT_URL: string;
/** DOM id of the injected `<script>` tag. */
export declare const KLASHA_SCRIPT_ID: string;

/** Loads pay.js at most once and resolves with the global KlashaClient. */
export declare function loadKlashaScript(): Promise<Function>;

/** Clears the cached script promise. Intended for tests. */
export declare function resetKlashaScriptCache(): void;

declare const Klasha: typeof Vue & PluginObject<{ name?: string }>;

export { Klasha };
export default Klasha;
