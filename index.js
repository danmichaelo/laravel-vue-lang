"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lang = exports.default = void 0;
const lang_js_1 = __importDefault(require("lang.js"));
/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/
/**
 * Determines if the given locale and domain combination is ignored.
 */
function shouldIgnore(ignore, locale, domain) {
    for (let [ignoreLocale, ignoreDomains] of Object.entries(ignore)) {
        if (locale === ignoreLocale && ignoreDomains.includes(domain)) {
            return true;
        }
    }
    return false;
}
/**
 * Imports translations from the configured alias.
 */
function importTranslations({ ignore, globalTranslationsKey }) {
    const catalogue = {};
    const files = require.context('@lang', true, /\.(php|json)$/);
    files.keys().forEach((file) => {
        var _a, _b;
        // Find localization files at the root directory
        const [isGlobal, rootLocale] = (_a = /\.\/([A-Za-z0-9-_]+).(?:php|json)/.exec(file)) !== null && _a !== void 0 ? _a : [];
        if (isGlobal) {
            catalogue[`${rootLocale}.${globalTranslationsKey}`] = files(file);
            return;
        }
        // Find localization files in a /lang/ directory
        const [isScoped, locale, domain] = (_b = /\.\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+).(?:php|json)/.exec(file)) !== null && _b !== void 0 ? _b : [];
        if (!ignore || !shouldIgnore(ignore, locale, domain)) {
            catalogue[`${locale}.${domain}`] = files(file);
        }
    });
    return catalogue;
}
/**
 * Adds localization to Vue.
 */
const Lang = {
    install: (Vue, options = {}) => {
        var _a;
        // Defines default options
        options = Object.assign({ globalTranslationsKey: '__global__' }, options);
        // Creates the Lang.js object
        const i18n = new lang_js_1.default(Object.assign({ fallback: document.documentElement.lang || navigator.language, messages: (_a = options === null || options === void 0 ? void 0 : options.messages) !== null && _a !== void 0 ? _a : importTranslations(options) }, options));
        // Defines a global translation function
        const __ = (key, ...args) => {
            // Non-global translations
            if (key.match(/^[\w-]+(?:\.[\w-]+)+$/)) {
                return i18n.get(key, ...args);
            }
            // Global translations
            const result = i18n.get(`${options.globalTranslationsKey}.${key}`, ...args);
            return result.startsWith(options.globalTranslationsKey)
                ? result.substr(options.globalTranslationsKey.length + 1)
                : result;
        };
        Vue.mixin({
            methods: {
                $lang: () => i18n,
                __,
            },
        });
    },
};
exports.default = Lang;
exports.Lang = Lang;