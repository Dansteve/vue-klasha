import { mount } from '@vue/test-utils';
import Klasha from '../src/index';
import { resetKlashaScriptCache, KLASHA_SCRIPT_URL } from '../src/load-script';

// Constructor argument positions, verified against the shipped
// https://js.klasha.com/pay.js:
//
//   0 merchantKey  1 businessId  2 amount     3 containerId  4 callbackUrl
//   5 countryCode  6 sourceCurrency           7 kit          8 isTestMode
const ARG = {
    merchantKey: 0,
    businessId: 1,
    amount: 2,
    containerId: 3,
    callbackUrl: 4,
    countryCode: 5,
    sourceCurrency: 6,
    kit: 7,
    isTestMode: 8
};

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

let calls;
let initSpy;

function installKlashaClientMock() {
    calls = [];
    initSpy = jest.fn();
    window.KlashaClient = jest.fn(function KlashaClient(...args) {
        calls.push(args);
        this.init = initSpy;
    });
}

const baseProps = () => ({
    merchantKey: 'test-merchant-key',
    businessId: '1',
    amount: 1000,
    txRef: 'MERCHANT-REF-123',
    email: 'buyer@example.com',
    phoneNumber: '+2348159991635',
    fullname: 'Ada Lovelace',
    callBack: jest.fn()
});

async function payOnce(props = {}, mountOptions = {}) {
    const wrapper = mount(Klasha, {
        propsData: { ...baseProps(), ...props },
        attachTo: document.body,
        ...mountOptions
    });
    await flush();
    if (!wrapper.props().embed) {
        await wrapper.find('button').trigger('click');
    }
    await flush();
    return wrapper;
}

beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    resetKlashaScriptCache();
    installKlashaClientMock();
});

afterEach(() => {
    delete window.KlashaClient;
    jest.restoreAllMocks();
});

describe('kit.tx_ref (regression: `this.txFef` typo silently discarded it)', () => {
    it("forwards the merchant's txRef prop verbatim", async() => {
        const wrapper = await payOnce({ txRef: 'ORDER-2026-07-28-0001' });

        expect(calls).toHaveLength(1);
        expect(calls[0][ARG.kit].tx_ref).toBe('ORDER-2026-07-28-0001');
        wrapper.destroy();
    });

    it('generates and emits a tx_ref only when none was supplied', async() => {
        const wrapper = await payOnce({ txRef: '' });

        const generated = calls[0][ARG.kit].tx_ref;
        expect(typeof generated).toBe('string');
        expect(generated).toHaveLength(16);
        expect(wrapper.emitted('tx-ref')[0][0]).toBe(generated);
        wrapper.destroy();
    });
});

describe('isTestMode (regression: `this.isTestMode || true` could never be false)', () => {
    it('stays false when the merchant asked for live mode', async() => {
        const wrapper = await payOnce({ isTestMode: false });

        expect(calls[0][ARG.isTestMode]).toBe(false);
        wrapper.destroy();
    });

    it('is true when the merchant asked for test mode', async() => {
        const wrapper = await payOnce({ isTestMode: true });

        expect(calls[0][ARG.isTestMode]).toBe(true);
        wrapper.destroy();
    });

    it('defaults to sandbox when the prop is omitted', async() => {
        const props = baseProps();
        const wrapper = mount(Klasha, { propsData: props, attachTo: document.body });
        await flush();
        await wrapper.find('button').trigger('click');
        await flush();

        expect(calls[0][ARG.isTestMode]).toBe(true);
        wrapper.destroy();
    });
});

describe('constructor arity and argument mapping', () => {
    it('passes a 9th argument and it is a real boolean', async() => {
        const wrapper = await payOnce({ isTestMode: false });

        expect(calls[0]).toHaveLength(9);
        expect(typeof calls[0][ARG.isTestMode]).toBe('boolean');
        wrapper.destroy();
    });

    it('maps the first eight arguments as pay.js expects', async() => {
        const wrapper = await payOnce({
            merchantKey: 'mk_live_abc',
            businessId: '42',
            amount: 250000,
            callbackUrl: 'https://shop.example.com/klasha/callback',
            sourceCurrency: 'NGN',
            destinationCurrency: 'USD'
        });

        const args = calls[0];
        expect(args[ARG.merchantKey]).toBe('mk_live_abc');
        expect(args[ARG.businessId]).toBe('42');
        expect(args[ARG.amount]).toBe(250000);
        expect(args[ARG.containerId]).toEqual(expect.stringMatching(/^klasha-container-\d+$/));
        expect(args[ARG.callbackUrl]).toBe('https://shop.example.com/klasha/callback');
        expect(args[ARG.countryCode]).toBe('USD');
        expect(args[ARG.sourceCurrency]).toBe('NGN');
        expect(typeof args[ARG.kit]).toBe('object');
        wrapper.destroy();
    });

    it('calls .init() on the instance for the button flow', async() => {
        const wrapper = await payOnce();

        expect(initSpy).toHaveBeenCalledTimes(1);
        wrapper.destroy();
    });

    it('does not call .init() in embed mode', async() => {
        const wrapper = await payOnce({ embed: true });

        expect(calls).toHaveLength(1);
        expect(initSpy).not.toHaveBeenCalled();
        wrapper.destroy();
    });
});

describe('the kit object', () => {
    it('populates kit.phone (pay.js never reads phone_number)', async() => {
        const wrapper = await payOnce({ phoneNumber: '+2348159991635' });

        const kit = calls[0][ARG.kit];
        expect(kit.phone).toBe('+2348159991635');
        // kept for backwards compatibility, but `phone` is the one that counts
        expect(kit.phone_number).toBe('+2348159991635');
        wrapper.destroy();
    });

    it('carries the customer and payment fields pay.js reads', async() => {
        const wrapper = await payOnce({
            email: 'buyer@example.com',
            sourceCurrency: 'KES',
            amount: 4500,
            paymentType: 'one-time'
        });

        const kit = calls[0][ARG.kit];
        expect(kit.email).toBe('buyer@example.com');
        expect(kit.currency).toBe('KES');
        expect(kit.amount).toBe(4500);
        expect(kit.productType).toBe('one-time');
        expect(typeof kit.callBack).toBe('function');
        wrapper.destroy();
    });

    it('builds a fresh kit per payment (pay.js mutates the one it is given)', async() => {
        const wrapper = await payOnce();
        await wrapper.find('button').trigger('click');
        await flush();

        expect(calls).toHaveLength(2);
        expect(calls[0][ARG.kit]).not.toBe(calls[1][ARG.kit]);
        wrapper.destroy();
    });

    it('routes the gateway response to callBack and the success event', async() => {
        const callBack = jest.fn();
        const wrapper = await payOnce({ callBack });

        calls[0][ARG.kit].callBack({ status: 'successful' });

        expect(callBack).toHaveBeenCalledWith({ status: 'successful' });
        expect(wrapper.emitted('success')[0][0]).toEqual({ status: 'successful' });
        wrapper.destroy();
    });
});

describe('the container element', () => {
    const containers = () =>
        document.querySelectorAll('div[id^="klasha-container-"]');

    it('creates exactly one container per instance', async() => {
        const wrapper = await payOnce();

        expect(containers()).toHaveLength(1);
        wrapper.destroy();
    });

    it('does not duplicate the container across repeated payments', async() => {
        const wrapper = await payOnce();
        await wrapper.find('button').trigger('click');
        await flush();
        await wrapper.find('button').trigger('click');
        await flush();

        expect(calls).toHaveLength(3);
        expect(containers()).toHaveLength(1);
        wrapper.destroy();
    });

    it('does not accumulate containers across repeated mounts', async() => {
        for (let i = 0; i < 3; i++) {
            const wrapper = await payOnce();
            expect(containers()).toHaveLength(1);
            wrapper.destroy();
            expect(containers()).toHaveLength(0);
        }
    });

    it('gives concurrent instances distinct ids and never reuses one id twice', async() => {
        const a = await payOnce();
        const b = await payOnce();
        const c = await payOnce();

        const ids = Array.prototype.map.call(containers(), el => el.id);
        expect(ids).toHaveLength(3);
        expect(new Set(ids).size).toBe(3);

        [a, b, c].forEach(w => w.destroy());
        expect(containers()).toHaveLength(0);
    });

    it('reuses an explicit containerId instead of appending a second div', async() => {
        const a = await payOnce({ containerId: 'my-checkout' });
        const b = await payOnce({ containerId: 'my-checkout' });

        expect(document.querySelectorAll('#my-checkout')).toHaveLength(1);
        expect(calls[0][ARG.containerId]).toBe('my-checkout');
        expect(calls[1][ARG.containerId]).toBe('my-checkout');
        a.destroy();
        b.destroy();
    });

    it('renders into its own element in embed mode', async() => {
        const wrapper = await payOnce({ embed: true });

        expect(wrapper.element.id).toBe(calls[0][ARG.containerId]);
        expect(document.querySelectorAll('#' + wrapper.element.id)).toHaveLength(1);
        wrapper.destroy();
    });
});

describe('script loading', () => {
    beforeEach(() => {
        delete window.KlashaClient;
        resetKlashaScriptCache();
    });

    it('injects exactly one pay.js tag and no jQuery', async() => {
        const w1 = mount(Klasha, { propsData: baseProps() });
        const w2 = mount(Klasha, { propsData: baseProps() });
        await flush();

        const scripts = Array.prototype.map.call(
            document.querySelectorAll('script'),
            el => el.getAttribute('src')
        );

        expect(scripts).toEqual([KLASHA_SCRIPT_URL]);
        expect(KLASHA_SCRIPT_URL).toBe('https://js.klasha.com/pay.js');
        expect(scripts.some(src => /jquery/i.test(src))).toBe(false);
        expect(scripts.some(src => /digitaloceanspaces/i.test(src))).toBe(false);

        w1.destroy();
        w2.destroy();
    });

    it('emits an error instead of throwing when the script fails', async() => {
        const wrapper = mount(Klasha, { propsData: baseProps(), attachTo: document.body });
        document
            .getElementById('klasha-pay-js')
            .dispatchEvent(new window.Event('error'));
        await flush();
        await wrapper.find('button').trigger('click');
        await flush();

        expect(wrapper.emitted('error')).toBeTruthy();
        wrapper.destroy();
    });

    it('retries the script load on a later click instead of failing forever', async() => {
        const wrapper = mount(Klasha, { propsData: baseProps(), attachTo: document.body });
        document
            .getElementById('klasha-pay-js')
            .dispatchEvent(new window.Event('error'));
        await flush();

        // Script becomes available on the retry.
        installKlashaClientMock();
        await wrapper.find('button').trigger('click');
        await flush();

        expect(calls).toHaveLength(1);
        wrapper.destroy();
    });
});

describe('no secrets are logged', () => {
    it('never calls console.log during a payment', async() => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        const wrapper = await payOnce({ merchantKey: 'super-secret-key' });

        expect(logSpy).not.toHaveBeenCalled();
        wrapper.destroy();
    });
});
