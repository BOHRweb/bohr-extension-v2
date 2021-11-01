"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyRateController = void 0;
const async_mutex_1 = require("async-mutex");
const BaseController_1 = __importDefault(require("../BaseController"));
const util_1 = require("../util");
const crypto_compare_1 = require("../apis/crypto-compare");
/**
 * Controller that passively polls on a set interval for an exchange rate from the current base
 * asset to the current currency
 */
class CurrencyRateController extends BaseController_1.default {
    /**
     * Creates a CurrencyRateController instance
     *
     * @param config - Initial options used to configure this controller
     * @param state - Initial state to set on this controller
     */
    constructor(config, state, fetchExchangeRate = crypto_compare_1.fetchExchangeRate) {
        super(config, state);
        this.activeCurrency = '';
        this.activeNativeCurrency = '';
        this.mutex = new async_mutex_1.Mutex();
        /**
         * Name of this controller used during composition
         */
        this.name = 'CurrencyRateController';
        this.fetchExchangeRate = fetchExchangeRate;
        this.defaultConfig = {
            currentCurrency: this.getCurrentCurrencyFromState(state),
            disabled: true,
            interval: 180000,
            nativeCurrency: 'ETH',
            includeUSDRate: false,
        };
        this.defaultState = {
            conversionDate: 0,
            conversionRate: 0,
            currentCurrency: this.defaultConfig.currentCurrency,
            nativeCurrency: this.defaultConfig.nativeCurrency,
            usdConversionRate: 0,
        };
        this.initialize();
        this.configure({ disabled: false }, false, false);
        this.poll();
    }
    getCurrentCurrencyFromState(state) {
        return (state === null || state === void 0 ? void 0 : state.currentCurrency) ? state.currentCurrency : 'usd';
    }
    /**
     * Sets a currency to track
     *
     * TODO: Replace this wth a method
     *
     * @param currentCurrency - ISO 4217 currency code
     */
    set currentCurrency(currentCurrency) {
        this.activeCurrency = currentCurrency;
        util_1.safelyExecute(() => this.updateExchangeRate());
    }
    get currentCurrency() {
        throw new Error('Property only used for setting');
    }
    /**
     * Sets a new native currency
     *
     * TODO: Replace this wth a method
     *
     * @param symbol - Symbol for the base asset
     */
    set nativeCurrency(symbol) {
        this.activeNativeCurrency = symbol;
        util_1.safelyExecute(() => this.updateExchangeRate());
    }
    get nativeCurrency() {
        throw new Error('Property only used for setting');
    }
    /**
     * Starts a new polling interval
     *
     * @param interval - Polling interval used to fetch new exchange rate
     */
    poll(interval) {
        return __awaiter(this, void 0, void 0, function* () {
            interval && this.configure({ interval }, false, false);
            this.handle && clearTimeout(this.handle);
            yield util_1.safelyExecute(() => this.updateExchangeRate());
            this.handle = setTimeout(() => {
                this.poll(this.config.interval);
            }, this.config.interval);
        });
    }
    /**
     * Updates exchange rate for the current currency
     *
     * @returns Promise resolving to currency data or undefined if disabled
     */
    updateExchangeRate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.disabled || !this.activeCurrency || !this.activeNativeCurrency) {
                return undefined;
            }
            const releaseLock = yield this.mutex.acquire();
            try {
                const { conversionDate, conversionRate, usdConversionRate } = yield this.fetchExchangeRate(this.activeCurrency, this.activeNativeCurrency, this.includeUSDRate);
                const newState = {
                    conversionDate,
                    conversionRate,
                    currentCurrency: this.activeCurrency,
                    nativeCurrency: this.activeNativeCurrency,
                    usdConversionRate: this.includeUSDRate ? usdConversionRate : this.defaultState.usdConversionRate,
                };
                this.update(newState);
                return this.state;
            }
            finally {
                releaseLock();
            }
        });
    }
}
exports.CurrencyRateController = CurrencyRateController;
exports.default = CurrencyRateController;
//# sourceMappingURL=CurrencyRateController.js.map