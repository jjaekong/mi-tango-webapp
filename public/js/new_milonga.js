/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @fileoverview Firebase constants.  Some of these (@defines) can be overridden at compile-time.
 */

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const stringToByteArray$1 = function (str) {
    // TODO(user): Use native implementations if/when available
    const out = [];
    let p = 0;
    for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        if (c < 128) {
            out[p++] = c;
        }
        else if (c < 2048) {
            out[p++] = (c >> 6) | 192;
            out[p++] = (c & 63) | 128;
        }
        else if ((c & 0xfc00) === 0xd800 &&
            i + 1 < str.length &&
            (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
            // Surrogate Pair
            c = 0x10000 + ((c & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
            out[p++] = (c >> 18) | 240;
            out[p++] = ((c >> 12) & 63) | 128;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        }
        else {
            out[p++] = (c >> 12) | 224;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        }
    }
    return out;
};
/**
 * Turns an array of numbers into the string given by the concatenation of the
 * characters to which the numbers correspond.
 * @param bytes Array of numbers representing characters.
 * @return Stringification of the array.
 */
const byteArrayToString = function (bytes) {
    // TODO(user): Use native implementations if/when available
    const out = [];
    let pos = 0, c = 0;
    while (pos < bytes.length) {
        const c1 = bytes[pos++];
        if (c1 < 128) {
            out[c++] = String.fromCharCode(c1);
        }
        else if (c1 > 191 && c1 < 224) {
            const c2 = bytes[pos++];
            out[c++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
        }
        else if (c1 > 239 && c1 < 365) {
            // Surrogate Pair
            const c2 = bytes[pos++];
            const c3 = bytes[pos++];
            const c4 = bytes[pos++];
            const u = (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) -
                0x10000;
            out[c++] = String.fromCharCode(0xd800 + (u >> 10));
            out[c++] = String.fromCharCode(0xdc00 + (u & 1023));
        }
        else {
            const c2 = bytes[pos++];
            const c3 = bytes[pos++];
            out[c++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        }
    }
    return out.join('');
};
// We define it as an object literal instead of a class because a class compiled down to es5 can't
// be treeshaked. https://github.com/rollup/rollup/issues/1691
// Static lookup maps, lazily populated by init_()
const base64 = {
    /**
     * Maps bytes to characters.
     */
    byteToCharMap_: null,
    /**
     * Maps characters to bytes.
     */
    charToByteMap_: null,
    /**
     * Maps bytes to websafe characters.
     * @private
     */
    byteToCharMapWebSafe_: null,
    /**
     * Maps websafe characters to bytes.
     * @private
     */
    charToByteMapWebSafe_: null,
    /**
     * Our default alphabet, shared between
     * ENCODED_VALS and ENCODED_VALS_WEBSAFE
     */
    ENCODED_VALS_BASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789',
    /**
     * Our default alphabet. Value 64 (=) is special; it means "nothing."
     */
    get ENCODED_VALS() {
        return this.ENCODED_VALS_BASE + '+/=';
    },
    /**
     * Our websafe alphabet.
     */
    get ENCODED_VALS_WEBSAFE() {
        return this.ENCODED_VALS_BASE + '-_.';
    },
    /**
     * Whether this browser supports the atob and btoa functions. This extension
     * started at Mozilla but is now implemented by many browsers. We use the
     * ASSUME_* variables to avoid pulling in the full useragent detection library
     * but still allowing the standard per-browser compilations.
     *
     */
    HAS_NATIVE_SUPPORT: typeof atob === 'function',
    /**
     * Base64-encode an array of bytes.
     *
     * @param input An array of bytes (numbers with
     *     value in [0, 255]) to encode.
     * @param webSafe Boolean indicating we should use the
     *     alternative alphabet.
     * @return The base64 encoded string.
     */
    encodeByteArray(input, webSafe) {
        if (!Array.isArray(input)) {
            throw Error('encodeByteArray takes an array as a parameter');
        }
        this.init_();
        const byteToCharMap = webSafe
            ? this.byteToCharMapWebSafe_
            : this.byteToCharMap_;
        const output = [];
        for (let i = 0; i < input.length; i += 3) {
            const byte1 = input[i];
            const haveByte2 = i + 1 < input.length;
            const byte2 = haveByte2 ? input[i + 1] : 0;
            const haveByte3 = i + 2 < input.length;
            const byte3 = haveByte3 ? input[i + 2] : 0;
            const outByte1 = byte1 >> 2;
            const outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
            let outByte3 = ((byte2 & 0x0f) << 2) | (byte3 >> 6);
            let outByte4 = byte3 & 0x3f;
            if (!haveByte3) {
                outByte4 = 64;
                if (!haveByte2) {
                    outByte3 = 64;
                }
            }
            output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
        }
        return output.join('');
    },
    /**
     * Base64-encode a string.
     *
     * @param input A string to encode.
     * @param webSafe If true, we should use the
     *     alternative alphabet.
     * @return The base64 encoded string.
     */
    encodeString(input, webSafe) {
        // Shortcut for Mozilla browsers that implement
        // a native base64 encoder in the form of "btoa/atob"
        if (this.HAS_NATIVE_SUPPORT && !webSafe) {
            return btoa(input);
        }
        return this.encodeByteArray(stringToByteArray$1(input), webSafe);
    },
    /**
     * Base64-decode a string.
     *
     * @param input to decode.
     * @param webSafe True if we should use the
     *     alternative alphabet.
     * @return string representing the decoded value.
     */
    decodeString(input, webSafe) {
        // Shortcut for Mozilla browsers that implement
        // a native base64 encoder in the form of "btoa/atob"
        if (this.HAS_NATIVE_SUPPORT && !webSafe) {
            return atob(input);
        }
        return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
    },
    /**
     * Base64-decode a string.
     *
     * In base-64 decoding, groups of four characters are converted into three
     * bytes.  If the encoder did not apply padding, the input length may not
     * be a multiple of 4.
     *
     * In this case, the last group will have fewer than 4 characters, and
     * padding will be inferred.  If the group has one or two characters, it decodes
     * to one byte.  If the group has three characters, it decodes to two bytes.
     *
     * @param input Input to decode.
     * @param webSafe True if we should use the web-safe alphabet.
     * @return bytes representing the decoded value.
     */
    decodeStringToByteArray(input, webSafe) {
        this.init_();
        const charToByteMap = webSafe
            ? this.charToByteMapWebSafe_
            : this.charToByteMap_;
        const output = [];
        for (let i = 0; i < input.length;) {
            const byte1 = charToByteMap[input.charAt(i++)];
            const haveByte2 = i < input.length;
            const byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
            ++i;
            const haveByte3 = i < input.length;
            const byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64;
            ++i;
            const haveByte4 = i < input.length;
            const byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64;
            ++i;
            if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
                throw new DecodeBase64StringError();
            }
            const outByte1 = (byte1 << 2) | (byte2 >> 4);
            output.push(outByte1);
            if (byte3 !== 64) {
                const outByte2 = ((byte2 << 4) & 0xf0) | (byte3 >> 2);
                output.push(outByte2);
                if (byte4 !== 64) {
                    const outByte3 = ((byte3 << 6) & 0xc0) | byte4;
                    output.push(outByte3);
                }
            }
        }
        return output;
    },
    /**
     * Lazy static initialization function. Called before
     * accessing any of the static map variables.
     * @private
     */
    init_() {
        if (!this.byteToCharMap_) {
            this.byteToCharMap_ = {};
            this.charToByteMap_ = {};
            this.byteToCharMapWebSafe_ = {};
            this.charToByteMapWebSafe_ = {};
            // We want quick mappings back and forth, so we precompute two maps.
            for (let i = 0; i < this.ENCODED_VALS.length; i++) {
                this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
                this.charToByteMap_[this.byteToCharMap_[i]] = i;
                this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
                this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
                // Be forgiving when decoding and correctly decode both encodings.
                if (i >= this.ENCODED_VALS_BASE.length) {
                    this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
                    this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
                }
            }
        }
    }
};
/**
 * An error encountered while decoding base64 string.
 */
class DecodeBase64StringError extends Error {
    constructor() {
        super(...arguments);
        this.name = 'DecodeBase64StringError';
    }
}
/**
 * URL-safe base64 encoding
 */
const base64Encode = function (str) {
    const utf8Bytes = stringToByteArray$1(str);
    return base64.encodeByteArray(utf8Bytes, true);
};
/**
 * URL-safe base64 encoding (without "." padding in the end).
 * e.g. Used in JSON Web Token (JWT) parts.
 */
const base64urlEncodeWithoutPadding = function (str) {
    // Use base64url encoding and remove padding in the end (dot characters).
    return base64Encode(str).replace(/\./g, '');
};
/**
 * URL-safe base64 decoding
 *
 * NOTE: DO NOT use the global atob() function - it does NOT support the
 * base64Url variant encoding.
 *
 * @param str To be decoded
 * @return Decoded result, if possible
 */
const base64Decode = function (str) {
    try {
        return base64.decodeString(str, true);
    }
    catch (e) {
        console.error('base64Decode failed: ', e);
    }
    return null;
};

/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Polyfill for `globalThis` object.
 * @returns the `globalThis` object for the given environment.
 * @public
 */
function getGlobal() {
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    throw new Error('Unable to locate global object.');
}

/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const getDefaultsFromGlobal = () => getGlobal().__FIREBASE_DEFAULTS__;
/**
 * Attempt to read defaults from a JSON string provided to
 * process(.)env(.)__FIREBASE_DEFAULTS__ or a JSON file whose path is in
 * process(.)env(.)__FIREBASE_DEFAULTS_PATH__
 * The dots are in parens because certain compilers (Vite?) cannot
 * handle seeing that variable in comments.
 * See https://github.com/firebase/firebase-js-sdk/issues/6838
 */
const getDefaultsFromEnvVariable = () => {
    if (typeof process === 'undefined' || typeof process.env === 'undefined') {
        return;
    }
    const defaultsJsonString = process.env.__FIREBASE_DEFAULTS__;
    if (defaultsJsonString) {
        return JSON.parse(defaultsJsonString);
    }
};
const getDefaultsFromCookie = () => {
    if (typeof document === 'undefined') {
        return;
    }
    let match;
    try {
        match = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
    }
    catch (e) {
        // Some environments such as Angular Universal SSR have a
        // `document` object but error on accessing `document.cookie`.
        return;
    }
    const decoded = match && base64Decode(match[1]);
    return decoded && JSON.parse(decoded);
};
/**
 * Get the __FIREBASE_DEFAULTS__ object. It checks in order:
 * (1) if such an object exists as a property of `globalThis`
 * (2) if such an object was provided on a shell environment variable
 * (3) if such an object exists in a cookie
 * @public
 */
const getDefaults = () => {
    try {
        return (getDefaultsFromGlobal() ||
            getDefaultsFromEnvVariable() ||
            getDefaultsFromCookie());
    }
    catch (e) {
        /**
         * Catch-all for being unable to get __FIREBASE_DEFAULTS__ due
         * to any environment case we have not accounted for. Log to
         * info instead of swallowing so we can find these unknown cases
         * and add paths for them if needed.
         */
        console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);
        return;
    }
};
/**
 * Returns emulator host stored in the __FIREBASE_DEFAULTS__ object
 * for the given product.
 * @returns a URL host formatted like `127.0.0.1:9999` or `[::1]:4000` if available
 * @public
 */
const getDefaultEmulatorHost = (productName) => { var _a, _b; return (_b = (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a.emulatorHosts) === null || _b === void 0 ? void 0 : _b[productName]; };
/**
 * Returns emulator hostname and port stored in the __FIREBASE_DEFAULTS__ object
 * for the given product.
 * @returns a pair of hostname and port like `["::1", 4000]` if available
 * @public
 */
const getDefaultEmulatorHostnameAndPort = (productName) => {
    const host = getDefaultEmulatorHost(productName);
    if (!host) {
        return undefined;
    }
    const separatorIndex = host.lastIndexOf(':'); // Finding the last since IPv6 addr also has colons.
    if (separatorIndex <= 0 || separatorIndex + 1 === host.length) {
        throw new Error(`Invalid host ${host} with no separate hostname and port!`);
    }
    // eslint-disable-next-line no-restricted-globals
    const port = parseInt(host.substring(separatorIndex + 1), 10);
    if (host[0] === '[') {
        // Bracket-quoted `[ipv6addr]:port` => return "ipv6addr" (without brackets).
        return [host.substring(1, separatorIndex - 1), port];
    }
    else {
        return [host.substring(0, separatorIndex), port];
    }
};
/**
 * Returns Firebase app config stored in the __FIREBASE_DEFAULTS__ object.
 * @public
 */
const getDefaultAppConfig = () => { var _a; return (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a.config; };
/**
 * Returns an experimental setting on the __FIREBASE_DEFAULTS__ object (properties
 * prefixed by "_")
 * @public
 */
const getExperimentalSetting = (name) => { var _a; return (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a[`_${name}`]; };

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Deferred {
    constructor() {
        this.reject = () => { };
        this.resolve = () => { };
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
    /**
     * Our API internals are not promiseified and cannot because our callback APIs have subtle expectations around
     * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
     * and returns a node-style callback which will resolve or reject the Deferred's promise.
     */
    wrapCallback(callback) {
        return (error, value) => {
            if (error) {
                this.reject(error);
            }
            else {
                this.resolve(value);
            }
            if (typeof callback === 'function') {
                // Attaching noop handler just in case developer wasn't expecting
                // promises
                this.promise.catch(() => { });
                // Some of our callbacks don't expect a value and our own tests
                // assert that the parameter length is 1
                if (callback.length === 1) {
                    callback(error);
                }
                else {
                    callback(error, value);
                }
            }
        };
    }
}

/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function createMockUserToken(token, projectId) {
    if (token.uid) {
        throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');
    }
    // Unsecured JWTs use "none" as the algorithm.
    const header = {
        alg: 'none',
        type: 'JWT'
    };
    const project = projectId || 'demo-project';
    const iat = token.iat || 0;
    const sub = token.sub || token.user_id;
    if (!sub) {
        throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");
    }
    const payload = Object.assign({ 
        // Set all required fields to decent defaults
        iss: `https://securetoken.google.com/${project}`, aud: project, iat, exp: iat + 3600, auth_time: iat, sub, user_id: sub, firebase: {
            sign_in_provider: 'custom',
            identities: {}
        } }, token);
    // Unsecured JWTs use the empty string as a signature.
    const signature = '';
    return [
        base64urlEncodeWithoutPadding(JSON.stringify(header)),
        base64urlEncodeWithoutPadding(JSON.stringify(payload)),
        signature
    ].join('.');
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Returns navigator.userAgent string or '' if it's not defined.
 * @return user agent string
 */
function getUA() {
    if (typeof navigator !== 'undefined' &&
        typeof navigator['userAgent'] === 'string') {
        return navigator['userAgent'];
    }
    else {
        return '';
    }
}
/**
 * Detect Cordova / PhoneGap / Ionic frameworks on a mobile device.
 *
 * Deliberately does not rely on checking `file://` URLs (as this fails PhoneGap
 * in the Ripple emulator) nor Cordova `onDeviceReady`, which would normally
 * wait for a callback.
 */
function isMobileCordova() {
    return (typeof window !== 'undefined' &&
        // @ts-ignore Setting up an broadly applicable index signature for Window
        // just to deal with this case would probably be a bad idea.
        !!(window['cordova'] || window['phonegap'] || window['PhoneGap']) &&
        /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(getUA()));
}
function isBrowserExtension() {
    const runtime = typeof chrome === 'object'
        ? chrome.runtime
        : typeof browser === 'object'
            ? browser.runtime
            : undefined;
    return typeof runtime === 'object' && runtime.id !== undefined;
}
/**
 * Detect React Native.
 *
 * @return true if ReactNative environment is detected.
 */
function isReactNative() {
    return (typeof navigator === 'object' && navigator['product'] === 'ReactNative');
}
/** Detects Internet Explorer. */
function isIE() {
    const ua = getUA();
    return ua.indexOf('MSIE ') >= 0 || ua.indexOf('Trident/') >= 0;
}
/**
 * This method checks if indexedDB is supported by current browser/service worker context
 * @return true if indexedDB is supported by current browser/service worker context
 */
function isIndexedDBAvailable() {
    try {
        return typeof indexedDB === 'object';
    }
    catch (e) {
        return false;
    }
}
/**
 * This method validates browser/sw context for indexedDB by opening a dummy indexedDB database and reject
 * if errors occur during the database open operation.
 *
 * @throws exception if current browser/sw context can't run idb.open (ex: Safari iframe, Firefox
 * private browsing)
 */
function validateIndexedDBOpenable() {
    return new Promise((resolve, reject) => {
        try {
            let preExist = true;
            const DB_CHECK_NAME = 'validate-browser-context-for-indexeddb-analytics-module';
            const request = self.indexedDB.open(DB_CHECK_NAME);
            request.onsuccess = () => {
                request.result.close();
                // delete database only when it doesn't pre-exist
                if (!preExist) {
                    self.indexedDB.deleteDatabase(DB_CHECK_NAME);
                }
                resolve(true);
            };
            request.onupgradeneeded = () => {
                preExist = false;
            };
            request.onerror = () => {
                var _a;
                reject(((_a = request.error) === null || _a === void 0 ? void 0 : _a.message) || '');
            };
        }
        catch (error) {
            reject(error);
        }
    });
}
/**
 *
 * This method checks whether cookie is enabled within current browser
 * @return true if cookie is enabled within current browser
 */
function areCookiesEnabled() {
    if (typeof navigator === 'undefined' || !navigator.cookieEnabled) {
        return false;
    }
    return true;
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @fileoverview Standardized Firebase Error.
 *
 * Usage:
 *
 *   // Typescript string literals for type-safe codes
 *   type Err =
 *     'unknown' |
 *     'object-not-found'
 *     ;
 *
 *   // Closure enum for type-safe error codes
 *   // at-enum {string}
 *   var Err = {
 *     UNKNOWN: 'unknown',
 *     OBJECT_NOT_FOUND: 'object-not-found',
 *   }
 *
 *   let errors: Map<Err, string> = {
 *     'generic-error': "Unknown error",
 *     'file-not-found': "Could not find file: {$file}",
 *   };
 *
 *   // Type-safe function - must pass a valid error code as param.
 *   let error = new ErrorFactory<Err>('service', 'Service', errors);
 *
 *   ...
 *   throw error.create(Err.GENERIC);
 *   ...
 *   throw error.create(Err.FILE_NOT_FOUND, {'file': fileName});
 *   ...
 *   // Service: Could not file file: foo.txt (service/file-not-found).
 *
 *   catch (e) {
 *     assert(e.message === "Could not find file: foo.txt.");
 *     if ((e as FirebaseError)?.code === 'service/file-not-found') {
 *       console.log("Could not read file: " + e['file']);
 *     }
 *   }
 */
const ERROR_NAME = 'FirebaseError';
// Based on code from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
class FirebaseError extends Error {
    constructor(
    /** The error code for this error. */
    code, message, 
    /** Custom data for this error. */
    customData) {
        super(message);
        this.code = code;
        this.customData = customData;
        /** The custom name for all FirebaseErrors. */
        this.name = ERROR_NAME;
        // Fix For ES5
        // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, FirebaseError.prototype);
        // Maintains proper stack trace for where our error was thrown.
        // Only available on V8.
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ErrorFactory.prototype.create);
        }
    }
}
class ErrorFactory {
    constructor(service, serviceName, errors) {
        this.service = service;
        this.serviceName = serviceName;
        this.errors = errors;
    }
    create(code, ...data) {
        const customData = data[0] || {};
        const fullCode = `${this.service}/${code}`;
        const template = this.errors[code];
        const message = template ? replaceTemplate(template, customData) : 'Error';
        // Service Name: Error message (service/code).
        const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
        const error = new FirebaseError(fullCode, fullMessage, customData);
        return error;
    }
}
function replaceTemplate(template, data) {
    return template.replace(PATTERN, (_, key) => {
        const value = data[key];
        return value != null ? String(value) : `<${key}?>`;
    });
}
const PATTERN = /\{\$([^}]+)}/g;
function isEmpty$1(obj) {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}
/**
 * Deep equal two objects. Support Arrays and Objects.
 */
function deepEqual(a, b) {
    if (a === b) {
        return true;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    for (const k of aKeys) {
        if (!bKeys.includes(k)) {
            return false;
        }
        const aProp = a[k];
        const bProp = b[k];
        if (isObject(aProp) && isObject(bProp)) {
            if (!deepEqual(aProp, bProp)) {
                return false;
            }
        }
        else if (aProp !== bProp) {
            return false;
        }
    }
    for (const k of bKeys) {
        if (!aKeys.includes(k)) {
            return false;
        }
    }
    return true;
}
function isObject(thing) {
    return thing !== null && typeof thing === 'object';
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Returns a querystring-formatted string (e.g. &arg=val&arg2=val2) from a
 * params object (e.g. {arg: 'val', arg2: 'val2'})
 * Note: You must prepend it with ? when adding it to a URL.
 */
function querystring(querystringParams) {
    const params = [];
    for (const [key, value] of Object.entries(querystringParams)) {
        if (Array.isArray(value)) {
            value.forEach(arrayVal => {
                params.push(encodeURIComponent(key) + '=' + encodeURIComponent(arrayVal));
            });
        }
        else {
            params.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        }
    }
    return params.length ? '&' + params.join('&') : '';
}

/**
 * Helper to make a Subscribe function (just like Promise helps make a
 * Thenable).
 *
 * @param executor Function which can make calls to a single Observer
 *     as a proxy.
 * @param onNoObservers Callback when count of Observers goes to zero.
 */
function createSubscribe(executor, onNoObservers) {
    const proxy = new ObserverProxy(executor, onNoObservers);
    return proxy.subscribe.bind(proxy);
}
/**
 * Implement fan-out for any number of Observers attached via a subscribe
 * function.
 */
class ObserverProxy {
    /**
     * @param executor Function which can make calls to a single Observer
     *     as a proxy.
     * @param onNoObservers Callback when count of Observers goes to zero.
     */
    constructor(executor, onNoObservers) {
        this.observers = [];
        this.unsubscribes = [];
        this.observerCount = 0;
        // Micro-task scheduling by calling task.then().
        this.task = Promise.resolve();
        this.finalized = false;
        this.onNoObservers = onNoObservers;
        // Call the executor asynchronously so subscribers that are called
        // synchronously after the creation of the subscribe function
        // can still receive the very first value generated in the executor.
        this.task
            .then(() => {
            executor(this);
        })
            .catch(e => {
            this.error(e);
        });
    }
    next(value) {
        this.forEachObserver((observer) => {
            observer.next(value);
        });
    }
    error(error) {
        this.forEachObserver((observer) => {
            observer.error(error);
        });
        this.close(error);
    }
    complete() {
        this.forEachObserver((observer) => {
            observer.complete();
        });
        this.close();
    }
    /**
     * Subscribe function that can be used to add an Observer to the fan-out list.
     *
     * - We require that no event is sent to a subscriber sychronously to their
     *   call to subscribe().
     */
    subscribe(nextOrObserver, error, complete) {
        let observer;
        if (nextOrObserver === undefined &&
            error === undefined &&
            complete === undefined) {
            throw new Error('Missing Observer.');
        }
        // Assemble an Observer object when passed as callback functions.
        if (implementsAnyMethods(nextOrObserver, [
            'next',
            'error',
            'complete'
        ])) {
            observer = nextOrObserver;
        }
        else {
            observer = {
                next: nextOrObserver,
                error,
                complete
            };
        }
        if (observer.next === undefined) {
            observer.next = noop;
        }
        if (observer.error === undefined) {
            observer.error = noop;
        }
        if (observer.complete === undefined) {
            observer.complete = noop;
        }
        const unsub = this.unsubscribeOne.bind(this, this.observers.length);
        // Attempt to subscribe to a terminated Observable - we
        // just respond to the Observer with the final error or complete
        // event.
        if (this.finalized) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.task.then(() => {
                try {
                    if (this.finalError) {
                        observer.error(this.finalError);
                    }
                    else {
                        observer.complete();
                    }
                }
                catch (e) {
                    // nothing
                }
                return;
            });
        }
        this.observers.push(observer);
        return unsub;
    }
    // Unsubscribe is synchronous - we guarantee that no events are sent to
    // any unsubscribed Observer.
    unsubscribeOne(i) {
        if (this.observers === undefined || this.observers[i] === undefined) {
            return;
        }
        delete this.observers[i];
        this.observerCount -= 1;
        if (this.observerCount === 0 && this.onNoObservers !== undefined) {
            this.onNoObservers(this);
        }
    }
    forEachObserver(fn) {
        if (this.finalized) {
            // Already closed by previous event....just eat the additional values.
            return;
        }
        // Since sendOne calls asynchronously - there is no chance that
        // this.observers will become undefined.
        for (let i = 0; i < this.observers.length; i++) {
            this.sendOne(i, fn);
        }
    }
    // Call the Observer via one of it's callback function. We are careful to
    // confirm that the observe has not been unsubscribed since this asynchronous
    // function had been queued.
    sendOne(i, fn) {
        // Execute the callback asynchronously
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.task.then(() => {
            if (this.observers !== undefined && this.observers[i] !== undefined) {
                try {
                    fn(this.observers[i]);
                }
                catch (e) {
                    // Ignore exceptions raised in Observers or missing methods of an
                    // Observer.
                    // Log error to console. b/31404806
                    if (typeof console !== 'undefined' && console.error) {
                        console.error(e);
                    }
                }
            }
        });
    }
    close(err) {
        if (this.finalized) {
            return;
        }
        this.finalized = true;
        if (err !== undefined) {
            this.finalError = err;
        }
        // Proxy is no longer needed - garbage collect references
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.task.then(() => {
            this.observers = undefined;
            this.onNoObservers = undefined;
        });
    }
}
/**
 * Return true if the object passed in implements any of the named methods.
 */
function implementsAnyMethods(obj, methods) {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    for (const method of methods) {
        if (method in obj && typeof obj[method] === 'function') {
            return true;
        }
    }
    return false;
}
function noop() {
    // do nothing
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * The amount of milliseconds to exponentially increase.
 */
const DEFAULT_INTERVAL_MILLIS = 1000;
/**
 * The factor to backoff by.
 * Should be a number greater than 1.
 */
const DEFAULT_BACKOFF_FACTOR = 2;
/**
 * The maximum milliseconds to increase to.
 *
 * <p>Visible for testing
 */
const MAX_VALUE_MILLIS = 4 * 60 * 60 * 1000; // Four hours, like iOS and Android.
/**
 * The percentage of backoff time to randomize by.
 * See
 * http://go/safe-client-behavior#step-1-determine-the-appropriate-retry-interval-to-handle-spike-traffic
 * for context.
 *
 * <p>Visible for testing
 */
const RANDOM_FACTOR = 0.5;
/**
 * Based on the backoff method from
 * https://github.com/google/closure-library/blob/master/closure/goog/math/exponentialbackoff.js.
 * Extracted here so we don't need to pass metadata and a stateful ExponentialBackoff object around.
 */
function calculateBackoffMillis(backoffCount, intervalMillis = DEFAULT_INTERVAL_MILLIS, backoffFactor = DEFAULT_BACKOFF_FACTOR) {
    // Calculates an exponentially increasing value.
    // Deviation: calculates value from count and a constant interval, so we only need to save value
    // and count to restore state.
    const currBaseValue = intervalMillis * Math.pow(backoffFactor, backoffCount);
    // A random "fuzz" to avoid waves of retries.
    // Deviation: randomFactor is required.
    const randomWait = Math.round(
    // A fraction of the backoff value to add/subtract.
    // Deviation: changes multiplication order to improve readability.
    RANDOM_FACTOR *
        currBaseValue *
        // A random float (rounded to int by Math.round above) in the range [-1, 1]. Determines
        // if we add or subtract.
        (Math.random() - 0.5) *
        2);
    // Limits backoff to max to avoid effectively permanent backoff.
    return Math.min(MAX_VALUE_MILLIS, currBaseValue + randomWait);
}

/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function getModularInstance(service) {
    if (service && service._delegate) {
        return service._delegate;
    }
    else {
        return service;
    }
}

/**
 * Component for service name T, e.g. `auth`, `auth-internal`
 */
class Component {
    /**
     *
     * @param name The public service name, e.g. app, auth, firestore, database
     * @param instanceFactory Service factory responsible for creating the public interface
     * @param type whether the service provided by the component is public or private
     */
    constructor(name, instanceFactory, type) {
        this.name = name;
        this.instanceFactory = instanceFactory;
        this.type = type;
        this.multipleInstances = false;
        /**
         * Properties to be added to the service namespace
         */
        this.serviceProps = {};
        this.instantiationMode = "LAZY" /* InstantiationMode.LAZY */;
        this.onInstanceCreated = null;
    }
    setInstantiationMode(mode) {
        this.instantiationMode = mode;
        return this;
    }
    setMultipleInstances(multipleInstances) {
        this.multipleInstances = multipleInstances;
        return this;
    }
    setServiceProps(props) {
        this.serviceProps = props;
        return this;
    }
    setInstanceCreatedCallback(callback) {
        this.onInstanceCreated = callback;
        return this;
    }
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DEFAULT_ENTRY_NAME$1 = '[DEFAULT]';

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Provider for instance for service name T, e.g. 'auth', 'auth-internal'
 * NameServiceMapping[T] is an alias for the type of the instance
 */
class Provider {
    constructor(name, container) {
        this.name = name;
        this.container = container;
        this.component = null;
        this.instances = new Map();
        this.instancesDeferred = new Map();
        this.instancesOptions = new Map();
        this.onInitCallbacks = new Map();
    }
    /**
     * @param identifier A provider can provide mulitple instances of a service
     * if this.component.multipleInstances is true.
     */
    get(identifier) {
        // if multipleInstances is not supported, use the default name
        const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
        if (!this.instancesDeferred.has(normalizedIdentifier)) {
            const deferred = new Deferred();
            this.instancesDeferred.set(normalizedIdentifier, deferred);
            if (this.isInitialized(normalizedIdentifier) ||
                this.shouldAutoInitialize()) {
                // initialize the service if it can be auto-initialized
                try {
                    const instance = this.getOrInitializeService({
                        instanceIdentifier: normalizedIdentifier
                    });
                    if (instance) {
                        deferred.resolve(instance);
                    }
                }
                catch (e) {
                    // when the instance factory throws an exception during get(), it should not cause
                    // a fatal error. We just return the unresolved promise in this case.
                }
            }
        }
        return this.instancesDeferred.get(normalizedIdentifier).promise;
    }
    getImmediate(options) {
        var _a;
        // if multipleInstances is not supported, use the default name
        const normalizedIdentifier = this.normalizeInstanceIdentifier(options === null || options === void 0 ? void 0 : options.identifier);
        const optional = (_a = options === null || options === void 0 ? void 0 : options.optional) !== null && _a !== void 0 ? _a : false;
        if (this.isInitialized(normalizedIdentifier) ||
            this.shouldAutoInitialize()) {
            try {
                return this.getOrInitializeService({
                    instanceIdentifier: normalizedIdentifier
                });
            }
            catch (e) {
                if (optional) {
                    return null;
                }
                else {
                    throw e;
                }
            }
        }
        else {
            // In case a component is not initialized and should/can not be auto-initialized at the moment, return null if the optional flag is set, or throw
            if (optional) {
                return null;
            }
            else {
                throw Error(`Service ${this.name} is not available`);
            }
        }
    }
    getComponent() {
        return this.component;
    }
    setComponent(component) {
        if (component.name !== this.name) {
            throw Error(`Mismatching Component ${component.name} for Provider ${this.name}.`);
        }
        if (this.component) {
            throw Error(`Component for ${this.name} has already been provided`);
        }
        this.component = component;
        // return early without attempting to initialize the component if the component requires explicit initialization (calling `Provider.initialize()`)
        if (!this.shouldAutoInitialize()) {
            return;
        }
        // if the service is eager, initialize the default instance
        if (isComponentEager(component)) {
            try {
                this.getOrInitializeService({ instanceIdentifier: DEFAULT_ENTRY_NAME$1 });
            }
            catch (e) {
                // when the instance factory for an eager Component throws an exception during the eager
                // initialization, it should not cause a fatal error.
                // TODO: Investigate if we need to make it configurable, because some component may want to cause
                // a fatal error in this case?
            }
        }
        // Create service instances for the pending promises and resolve them
        // NOTE: if this.multipleInstances is false, only the default instance will be created
        // and all promises with resolve with it regardless of the identifier.
        for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
            const normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
            try {
                // `getOrInitializeService()` should always return a valid instance since a component is guaranteed. use ! to make typescript happy.
                const instance = this.getOrInitializeService({
                    instanceIdentifier: normalizedIdentifier
                });
                instanceDeferred.resolve(instance);
            }
            catch (e) {
                // when the instance factory throws an exception, it should not cause
                // a fatal error. We just leave the promise unresolved.
            }
        }
    }
    clearInstance(identifier = DEFAULT_ENTRY_NAME$1) {
        this.instancesDeferred.delete(identifier);
        this.instancesOptions.delete(identifier);
        this.instances.delete(identifier);
    }
    // app.delete() will call this method on every provider to delete the services
    // TODO: should we mark the provider as deleted?
    async delete() {
        const services = Array.from(this.instances.values());
        await Promise.all([
            ...services
                .filter(service => 'INTERNAL' in service) // legacy services
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map(service => service.INTERNAL.delete()),
            ...services
                .filter(service => '_delete' in service) // modularized services
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map(service => service._delete())
        ]);
    }
    isComponentSet() {
        return this.component != null;
    }
    isInitialized(identifier = DEFAULT_ENTRY_NAME$1) {
        return this.instances.has(identifier);
    }
    getOptions(identifier = DEFAULT_ENTRY_NAME$1) {
        return this.instancesOptions.get(identifier) || {};
    }
    initialize(opts = {}) {
        const { options = {} } = opts;
        const normalizedIdentifier = this.normalizeInstanceIdentifier(opts.instanceIdentifier);
        if (this.isInitialized(normalizedIdentifier)) {
            throw Error(`${this.name}(${normalizedIdentifier}) has already been initialized`);
        }
        if (!this.isComponentSet()) {
            throw Error(`Component ${this.name} has not been registered yet`);
        }
        const instance = this.getOrInitializeService({
            instanceIdentifier: normalizedIdentifier,
            options
        });
        // resolve any pending promise waiting for the service instance
        for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
            const normalizedDeferredIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
            if (normalizedIdentifier === normalizedDeferredIdentifier) {
                instanceDeferred.resolve(instance);
            }
        }
        return instance;
    }
    /**
     *
     * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
     * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
     *
     * @param identifier An optional instance identifier
     * @returns a function to unregister the callback
     */
    onInit(callback, identifier) {
        var _a;
        const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
        const existingCallbacks = (_a = this.onInitCallbacks.get(normalizedIdentifier)) !== null && _a !== void 0 ? _a : new Set();
        existingCallbacks.add(callback);
        this.onInitCallbacks.set(normalizedIdentifier, existingCallbacks);
        const existingInstance = this.instances.get(normalizedIdentifier);
        if (existingInstance) {
            callback(existingInstance, normalizedIdentifier);
        }
        return () => {
            existingCallbacks.delete(callback);
        };
    }
    /**
     * Invoke onInit callbacks synchronously
     * @param instance the service instance`
     */
    invokeOnInitCallbacks(instance, identifier) {
        const callbacks = this.onInitCallbacks.get(identifier);
        if (!callbacks) {
            return;
        }
        for (const callback of callbacks) {
            try {
                callback(instance, identifier);
            }
            catch (_a) {
                // ignore errors in the onInit callback
            }
        }
    }
    getOrInitializeService({ instanceIdentifier, options = {} }) {
        let instance = this.instances.get(instanceIdentifier);
        if (!instance && this.component) {
            instance = this.component.instanceFactory(this.container, {
                instanceIdentifier: normalizeIdentifierForFactory(instanceIdentifier),
                options
            });
            this.instances.set(instanceIdentifier, instance);
            this.instancesOptions.set(instanceIdentifier, options);
            /**
             * Invoke onInit listeners.
             * Note this.component.onInstanceCreated is different, which is used by the component creator,
             * while onInit listeners are registered by consumers of the provider.
             */
            this.invokeOnInitCallbacks(instance, instanceIdentifier);
            /**
             * Order is important
             * onInstanceCreated() should be called after this.instances.set(instanceIdentifier, instance); which
             * makes `isInitialized()` return true.
             */
            if (this.component.onInstanceCreated) {
                try {
                    this.component.onInstanceCreated(this.container, instanceIdentifier, instance);
                }
                catch (_a) {
                    // ignore errors in the onInstanceCreatedCallback
                }
            }
        }
        return instance || null;
    }
    normalizeInstanceIdentifier(identifier = DEFAULT_ENTRY_NAME$1) {
        if (this.component) {
            return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME$1;
        }
        else {
            return identifier; // assume multiple instances are supported before the component is provided.
        }
    }
    shouldAutoInitialize() {
        return (!!this.component &&
            this.component.instantiationMode !== "EXPLICIT" /* InstantiationMode.EXPLICIT */);
    }
}
// undefined should be passed to the service factory for the default instance
function normalizeIdentifierForFactory(identifier) {
    return identifier === DEFAULT_ENTRY_NAME$1 ? undefined : identifier;
}
function isComponentEager(component) {
    return component.instantiationMode === "EAGER" /* InstantiationMode.EAGER */;
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * ComponentContainer that provides Providers for service name T, e.g. `auth`, `auth-internal`
 */
class ComponentContainer {
    constructor(name) {
        this.name = name;
        this.providers = new Map();
    }
    /**
     *
     * @param component Component being added
     * @param overwrite When a component with the same name has already been registered,
     * if overwrite is true: overwrite the existing component with the new component and create a new
     * provider with the new component. It can be useful in tests where you want to use different mocks
     * for different tests.
     * if overwrite is false: throw an exception
     */
    addComponent(component) {
        const provider = this.getProvider(component.name);
        if (provider.isComponentSet()) {
            throw new Error(`Component ${component.name} has already been registered with ${this.name}`);
        }
        provider.setComponent(component);
    }
    addOrOverwriteComponent(component) {
        const provider = this.getProvider(component.name);
        if (provider.isComponentSet()) {
            // delete the existing provider from the container, so we can register the new component
            this.providers.delete(component.name);
        }
        this.addComponent(component);
    }
    /**
     * getProvider provides a type safe interface where it can only be called with a field name
     * present in NameServiceMapping interface.
     *
     * Firebase SDKs providing services should extend NameServiceMapping interface to register
     * themselves.
     */
    getProvider(name) {
        if (this.providers.has(name)) {
            return this.providers.get(name);
        }
        // create a Provider for a service that hasn't registered with Firebase
        const provider = new Provider(name, this);
        this.providers.set(name, provider);
        return provider;
    }
    getProviders() {
        return Array.from(this.providers.values());
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A container for all of the Logger instances
 */
/**
 * The JS SDK supports 5 log levels and also allows a user the ability to
 * silence the logs altogether.
 *
 * The order is a follows:
 * DEBUG < VERBOSE < INFO < WARN < ERROR
 *
 * All of the log types above the current log level will be captured (i.e. if
 * you set the log level to `INFO`, errors will still be logged, but `DEBUG` and
 * `VERBOSE` logs will not)
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
})(LogLevel || (LogLevel = {}));
const levelStringToEnum = {
    'debug': LogLevel.DEBUG,
    'verbose': LogLevel.VERBOSE,
    'info': LogLevel.INFO,
    'warn': LogLevel.WARN,
    'error': LogLevel.ERROR,
    'silent': LogLevel.SILENT
};
/**
 * The default log level
 */
const defaultLogLevel = LogLevel.INFO;
/**
 * By default, `console.debug` is not displayed in the developer console (in
 * chrome). To avoid forcing users to have to opt-in to these logs twice
 * (i.e. once for firebase, and once in the console), we are sending `DEBUG`
 * logs to the `console.log` function.
 */
const ConsoleMethod = {
    [LogLevel.DEBUG]: 'log',
    [LogLevel.VERBOSE]: 'log',
    [LogLevel.INFO]: 'info',
    [LogLevel.WARN]: 'warn',
    [LogLevel.ERROR]: 'error'
};
/**
 * The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
 * messages on to their corresponding console counterparts (if the log method
 * is supported by the current log level)
 */
const defaultLogHandler = (instance, logType, ...args) => {
    if (logType < instance.logLevel) {
        return;
    }
    const now = new Date().toISOString();
    const method = ConsoleMethod[logType];
    if (method) {
        console[method](`[${now}]  ${instance.name}:`, ...args);
    }
    else {
        throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
    }
};
class Logger {
    /**
     * Gives you an instance of a Logger to capture messages according to
     * Firebase's logging scheme.
     *
     * @param name The name that the logs will be associated with
     */
    constructor(name) {
        this.name = name;
        /**
         * The log level of the given Logger instance.
         */
        this._logLevel = defaultLogLevel;
        /**
         * The main (internal) log handler for the Logger instance.
         * Can be set to a new function in internal package code but not by user.
         */
        this._logHandler = defaultLogHandler;
        /**
         * The optional, additional, user-defined log handler for the Logger instance.
         */
        this._userLogHandler = null;
    }
    get logLevel() {
        return this._logLevel;
    }
    set logLevel(val) {
        if (!(val in LogLevel)) {
            throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
        }
        this._logLevel = val;
    }
    // Workaround for setter/getter having to be the same type.
    setLogLevel(val) {
        this._logLevel = typeof val === 'string' ? levelStringToEnum[val] : val;
    }
    get logHandler() {
        return this._logHandler;
    }
    set logHandler(val) {
        if (typeof val !== 'function') {
            throw new TypeError('Value assigned to `logHandler` must be a function');
        }
        this._logHandler = val;
    }
    get userLogHandler() {
        return this._userLogHandler;
    }
    set userLogHandler(val) {
        this._userLogHandler = val;
    }
    /**
     * The functions below are all based on the `console` interface
     */
    debug(...args) {
        this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
        this._logHandler(this, LogLevel.DEBUG, ...args);
    }
    log(...args) {
        this._userLogHandler &&
            this._userLogHandler(this, LogLevel.VERBOSE, ...args);
        this._logHandler(this, LogLevel.VERBOSE, ...args);
    }
    info(...args) {
        this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
        this._logHandler(this, LogLevel.INFO, ...args);
    }
    warn(...args) {
        this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
        this._logHandler(this, LogLevel.WARN, ...args);
    }
    error(...args) {
        this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
        this._logHandler(this, LogLevel.ERROR, ...args);
    }
}

const instanceOfAny$1 = (object, constructors) => constructors.some((c) => object instanceof c);

let idbProxyableTypes$1;
let cursorAdvanceMethods$1;
// This is a function to prevent it throwing up in node environments.
function getIdbProxyableTypes$1() {
    return (idbProxyableTypes$1 ||
        (idbProxyableTypes$1 = [
            IDBDatabase,
            IDBObjectStore,
            IDBIndex,
            IDBCursor,
            IDBTransaction,
        ]));
}
// This is a function to prevent it throwing up in node environments.
function getCursorAdvanceMethods$1() {
    return (cursorAdvanceMethods$1 ||
        (cursorAdvanceMethods$1 = [
            IDBCursor.prototype.advance,
            IDBCursor.prototype.continue,
            IDBCursor.prototype.continuePrimaryKey,
        ]));
}
const cursorRequestMap$1 = new WeakMap();
const transactionDoneMap$1 = new WeakMap();
const transactionStoreNamesMap$1 = new WeakMap();
const transformCache$1 = new WeakMap();
const reverseTransformCache$1 = new WeakMap();
function promisifyRequest$1(request) {
    const promise = new Promise((resolve, reject) => {
        const unlisten = () => {
            request.removeEventListener('success', success);
            request.removeEventListener('error', error);
        };
        const success = () => {
            resolve(wrap$1(request.result));
            unlisten();
        };
        const error = () => {
            reject(request.error);
            unlisten();
        };
        request.addEventListener('success', success);
        request.addEventListener('error', error);
    });
    promise
        .then((value) => {
        // Since cursoring reuses the IDBRequest (*sigh*), we cache it for later retrieval
        // (see wrapFunction).
        if (value instanceof IDBCursor) {
            cursorRequestMap$1.set(value, request);
        }
        // Catching to avoid "Uncaught Promise exceptions"
    })
        .catch(() => { });
    // This mapping exists in reverseTransformCache but doesn't doesn't exist in transformCache. This
    // is because we create many promises from a single IDBRequest.
    reverseTransformCache$1.set(promise, request);
    return promise;
}
function cacheDonePromiseForTransaction$1(tx) {
    // Early bail if we've already created a done promise for this transaction.
    if (transactionDoneMap$1.has(tx))
        return;
    const done = new Promise((resolve, reject) => {
        const unlisten = () => {
            tx.removeEventListener('complete', complete);
            tx.removeEventListener('error', error);
            tx.removeEventListener('abort', error);
        };
        const complete = () => {
            resolve();
            unlisten();
        };
        const error = () => {
            reject(tx.error || new DOMException('AbortError', 'AbortError'));
            unlisten();
        };
        tx.addEventListener('complete', complete);
        tx.addEventListener('error', error);
        tx.addEventListener('abort', error);
    });
    // Cache it for later retrieval.
    transactionDoneMap$1.set(tx, done);
}
let idbProxyTraps$1 = {
    get(target, prop, receiver) {
        if (target instanceof IDBTransaction) {
            // Special handling for transaction.done.
            if (prop === 'done')
                return transactionDoneMap$1.get(target);
            // Polyfill for objectStoreNames because of Edge.
            if (prop === 'objectStoreNames') {
                return target.objectStoreNames || transactionStoreNamesMap$1.get(target);
            }
            // Make tx.store return the only store in the transaction, or undefined if there are many.
            if (prop === 'store') {
                return receiver.objectStoreNames[1]
                    ? undefined
                    : receiver.objectStore(receiver.objectStoreNames[0]);
            }
        }
        // Else transform whatever we get back.
        return wrap$1(target[prop]);
    },
    set(target, prop, value) {
        target[prop] = value;
        return true;
    },
    has(target, prop) {
        if (target instanceof IDBTransaction &&
            (prop === 'done' || prop === 'store')) {
            return true;
        }
        return prop in target;
    },
};
function replaceTraps$1(callback) {
    idbProxyTraps$1 = callback(idbProxyTraps$1);
}
function wrapFunction$1(func) {
    // Due to expected object equality (which is enforced by the caching in `wrap`), we
    // only create one new func per func.
    // Edge doesn't support objectStoreNames (booo), so we polyfill it here.
    if (func === IDBDatabase.prototype.transaction &&
        !('objectStoreNames' in IDBTransaction.prototype)) {
        return function (storeNames, ...args) {
            const tx = func.call(unwrap$1(this), storeNames, ...args);
            transactionStoreNamesMap$1.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
            return wrap$1(tx);
        };
    }
    // Cursor methods are special, as the behaviour is a little more different to standard IDB. In
    // IDB, you advance the cursor and wait for a new 'success' on the IDBRequest that gave you the
    // cursor. It's kinda like a promise that can resolve with many values. That doesn't make sense
    // with real promises, so each advance methods returns a new promise for the cursor object, or
    // undefined if the end of the cursor has been reached.
    if (getCursorAdvanceMethods$1().includes(func)) {
        return function (...args) {
            // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
            // the original object.
            func.apply(unwrap$1(this), args);
            return wrap$1(cursorRequestMap$1.get(this));
        };
    }
    return function (...args) {
        // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
        // the original object.
        return wrap$1(func.apply(unwrap$1(this), args));
    };
}
function transformCachableValue$1(value) {
    if (typeof value === 'function')
        return wrapFunction$1(value);
    // This doesn't return, it just creates a 'done' promise for the transaction,
    // which is later returned for transaction.done (see idbObjectHandler).
    if (value instanceof IDBTransaction)
        cacheDonePromiseForTransaction$1(value);
    if (instanceOfAny$1(value, getIdbProxyableTypes$1()))
        return new Proxy(value, idbProxyTraps$1);
    // Return the same value back if we're not going to transform it.
    return value;
}
function wrap$1(value) {
    // We sometimes generate multiple promises from a single IDBRequest (eg when cursoring), because
    // IDB is weird and a single IDBRequest can yield many responses, so these can't be cached.
    if (value instanceof IDBRequest)
        return promisifyRequest$1(value);
    // If we've already transformed this value before, reuse the transformed value.
    // This is faster, but it also provides object equality.
    if (transformCache$1.has(value))
        return transformCache$1.get(value);
    const newValue = transformCachableValue$1(value);
    // Not all types are transformed.
    // These may be primitive types, so they can't be WeakMap keys.
    if (newValue !== value) {
        transformCache$1.set(value, newValue);
        reverseTransformCache$1.set(newValue, value);
    }
    return newValue;
}
const unwrap$1 = (value) => reverseTransformCache$1.get(value);

/**
 * Open a database.
 *
 * @param name Name of the database.
 * @param version Schema version.
 * @param callbacks Additional callbacks.
 */
function openDB$1(name, version, { blocked, upgrade, blocking, terminated } = {}) {
    const request = indexedDB.open(name, version);
    const openPromise = wrap$1(request);
    if (upgrade) {
        request.addEventListener('upgradeneeded', (event) => {
            upgrade(wrap$1(request.result), event.oldVersion, event.newVersion, wrap$1(request.transaction), event);
        });
    }
    if (blocked) {
        request.addEventListener('blocked', (event) => blocked(
        // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
        event.oldVersion, event.newVersion, event));
    }
    openPromise
        .then((db) => {
        if (terminated)
            db.addEventListener('close', () => terminated());
        if (blocking) {
            db.addEventListener('versionchange', (event) => blocking(event.oldVersion, event.newVersion, event));
        }
    })
        .catch(() => { });
    return openPromise;
}

const readMethods$1 = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'];
const writeMethods$1 = ['put', 'add', 'delete', 'clear'];
const cachedMethods$1 = new Map();
function getMethod$1(target, prop) {
    if (!(target instanceof IDBDatabase &&
        !(prop in target) &&
        typeof prop === 'string')) {
        return;
    }
    if (cachedMethods$1.get(prop))
        return cachedMethods$1.get(prop);
    const targetFuncName = prop.replace(/FromIndex$/, '');
    const useIndex = prop !== targetFuncName;
    const isWrite = writeMethods$1.includes(targetFuncName);
    if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) ||
        !(isWrite || readMethods$1.includes(targetFuncName))) {
        return;
    }
    const method = async function (storeName, ...args) {
        // isWrite ? 'readwrite' : undefined gzipps better, but fails in Edge :(
        const tx = this.transaction(storeName, isWrite ? 'readwrite' : 'readonly');
        let target = tx.store;
        if (useIndex)
            target = target.index(args.shift());
        // Must reject if op rejects.
        // If it's a write operation, must reject if tx.done rejects.
        // Must reject with op rejection first.
        // Must resolve with op value.
        // Must handle both promises (no unhandled rejections)
        return (await Promise.all([
            target[targetFuncName](...args),
            isWrite && tx.done,
        ]))[0];
    };
    cachedMethods$1.set(prop, method);
    return method;
}
replaceTraps$1((oldTraps) => ({
    ...oldTraps,
    get: (target, prop, receiver) => getMethod$1(target, prop) || oldTraps.get(target, prop, receiver),
    has: (target, prop) => !!getMethod$1(target, prop) || oldTraps.has(target, prop),
}));

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class PlatformLoggerServiceImpl {
    constructor(container) {
        this.container = container;
    }
    // In initial implementation, this will be called by installations on
    // auth token refresh, and installations will send this string.
    getPlatformInfoString() {
        const providers = this.container.getProviders();
        // Loop through providers and get library/version pairs from any that are
        // version components.
        return providers
            .map(provider => {
            if (isVersionServiceProvider(provider)) {
                const service = provider.getImmediate();
                return `${service.library}/${service.version}`;
            }
            else {
                return null;
            }
        })
            .filter(logString => logString)
            .join(' ');
    }
}
/**
 *
 * @param provider check if this provider provides a VersionService
 *
 * NOTE: Using Provider<'app-version'> is a hack to indicate that the provider
 * provides VersionService. The provider is not necessarily a 'app-version'
 * provider.
 */
function isVersionServiceProvider(provider) {
    const component = provider.getComponent();
    return (component === null || component === void 0 ? void 0 : component.type) === "VERSION" /* ComponentType.VERSION */;
}

const name$o = "@firebase/app";
const version$1$1 = "0.9.25";

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const logger$1 = new Logger('@firebase/app');

const name$n = "@firebase/app-compat";

const name$m = "@firebase/analytics-compat";

const name$l = "@firebase/analytics";

const name$k = "@firebase/app-check-compat";

const name$j = "@firebase/app-check";

const name$i = "@firebase/auth";

const name$h = "@firebase/auth-compat";

const name$g = "@firebase/database";

const name$f = "@firebase/database-compat";

const name$e = "@firebase/functions";

const name$d = "@firebase/functions-compat";

const name$c = "@firebase/installations";

const name$b = "@firebase/installations-compat";

const name$a = "@firebase/messaging";

const name$9 = "@firebase/messaging-compat";

const name$8 = "@firebase/performance";

const name$7 = "@firebase/performance-compat";

const name$6 = "@firebase/remote-config";

const name$5 = "@firebase/remote-config-compat";

const name$4 = "@firebase/storage";

const name$3$1 = "@firebase/storage-compat";

const name$2$1 = "@firebase/firestore";

const name$1$1 = "@firebase/firestore-compat";

const name$p = "firebase";
const version$4 = "10.7.1";

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * The default app name
 *
 * @internal
 */
const DEFAULT_ENTRY_NAME = '[DEFAULT]';
const PLATFORM_LOG_STRING = {
    [name$o]: 'fire-core',
    [name$n]: 'fire-core-compat',
    [name$l]: 'fire-analytics',
    [name$m]: 'fire-analytics-compat',
    [name$j]: 'fire-app-check',
    [name$k]: 'fire-app-check-compat',
    [name$i]: 'fire-auth',
    [name$h]: 'fire-auth-compat',
    [name$g]: 'fire-rtdb',
    [name$f]: 'fire-rtdb-compat',
    [name$e]: 'fire-fn',
    [name$d]: 'fire-fn-compat',
    [name$c]: 'fire-iid',
    [name$b]: 'fire-iid-compat',
    [name$a]: 'fire-fcm',
    [name$9]: 'fire-fcm-compat',
    [name$8]: 'fire-perf',
    [name$7]: 'fire-perf-compat',
    [name$6]: 'fire-rc',
    [name$5]: 'fire-rc-compat',
    [name$4]: 'fire-gcs',
    [name$3$1]: 'fire-gcs-compat',
    [name$2$1]: 'fire-fst',
    [name$1$1]: 'fire-fst-compat',
    'fire-js': 'fire-js',
    [name$p]: 'fire-js-all'
};

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @internal
 */
const _apps = new Map();
/**
 * Registered components.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _components = new Map();
/**
 * @param component - the component being added to this app's container
 *
 * @internal
 */
function _addComponent(app, component) {
    try {
        app.container.addComponent(component);
    }
    catch (e) {
        logger$1.debug(`Component ${component.name} failed to register with FirebaseApp ${app.name}`, e);
    }
}
/**
 *
 * @param component - the component to register
 * @returns whether or not the component is registered successfully
 *
 * @internal
 */
function _registerComponent(component) {
    const componentName = component.name;
    if (_components.has(componentName)) {
        logger$1.debug(`There were multiple attempts to register component ${componentName}.`);
        return false;
    }
    _components.set(componentName, component);
    // add the component to existing app instances
    for (const app of _apps.values()) {
        _addComponent(app, component);
    }
    return true;
}
/**
 *
 * @param app - FirebaseApp instance
 * @param name - service name
 *
 * @returns the provider for the service with the matching name
 *
 * @internal
 */
function _getProvider(app, name) {
    const heartbeatController = app.container
        .getProvider('heartbeat')
        .getImmediate({ optional: true });
    if (heartbeatController) {
        void heartbeatController.triggerHeartbeat();
    }
    return app.container.getProvider(name);
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ERRORS$1 = {
    ["no-app" /* AppError.NO_APP */]: "No Firebase App '{$appName}' has been created - " +
        'call initializeApp() first',
    ["bad-app-name" /* AppError.BAD_APP_NAME */]: "Illegal App name: '{$appName}",
    ["duplicate-app" /* AppError.DUPLICATE_APP */]: "Firebase App named '{$appName}' already exists with different options or config",
    ["app-deleted" /* AppError.APP_DELETED */]: "Firebase App named '{$appName}' already deleted",
    ["no-options" /* AppError.NO_OPTIONS */]: 'Need to provide options, when not being deployed to hosting via source.',
    ["invalid-app-argument" /* AppError.INVALID_APP_ARGUMENT */]: 'firebase.{$appName}() takes either no argument or a ' +
        'Firebase App instance.',
    ["invalid-log-argument" /* AppError.INVALID_LOG_ARGUMENT */]: 'First argument to `onLog` must be null or a function.',
    ["idb-open" /* AppError.IDB_OPEN */]: 'Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.',
    ["idb-get" /* AppError.IDB_GET */]: 'Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.',
    ["idb-set" /* AppError.IDB_WRITE */]: 'Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.',
    ["idb-delete" /* AppError.IDB_DELETE */]: 'Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.'
};
const ERROR_FACTORY$2 = new ErrorFactory('app', 'Firebase', ERRORS$1);

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class FirebaseAppImpl {
    constructor(options, config, container) {
        this._isDeleted = false;
        this._options = Object.assign({}, options);
        this._config = Object.assign({}, config);
        this._name = config.name;
        this._automaticDataCollectionEnabled =
            config.automaticDataCollectionEnabled;
        this._container = container;
        this.container.addComponent(new Component('app', () => this, "PUBLIC" /* ComponentType.PUBLIC */));
    }
    get automaticDataCollectionEnabled() {
        this.checkDestroyed();
        return this._automaticDataCollectionEnabled;
    }
    set automaticDataCollectionEnabled(val) {
        this.checkDestroyed();
        this._automaticDataCollectionEnabled = val;
    }
    get name() {
        this.checkDestroyed();
        return this._name;
    }
    get options() {
        this.checkDestroyed();
        return this._options;
    }
    get config() {
        this.checkDestroyed();
        return this._config;
    }
    get container() {
        return this._container;
    }
    get isDeleted() {
        return this._isDeleted;
    }
    set isDeleted(val) {
        this._isDeleted = val;
    }
    /**
     * This function will throw an Error if the App has already been deleted -
     * use before performing API actions on the App.
     */
    checkDestroyed() {
        if (this.isDeleted) {
            throw ERROR_FACTORY$2.create("app-deleted" /* AppError.APP_DELETED */, { appName: this._name });
        }
    }
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * The current SDK version.
 *
 * @public
 */
const SDK_VERSION = version$4;
function initializeApp(_options, rawConfig = {}) {
    let options = _options;
    if (typeof rawConfig !== 'object') {
        const name = rawConfig;
        rawConfig = { name };
    }
    const config = Object.assign({ name: DEFAULT_ENTRY_NAME, automaticDataCollectionEnabled: false }, rawConfig);
    const name = config.name;
    if (typeof name !== 'string' || !name) {
        throw ERROR_FACTORY$2.create("bad-app-name" /* AppError.BAD_APP_NAME */, {
            appName: String(name)
        });
    }
    options || (options = getDefaultAppConfig());
    if (!options) {
        throw ERROR_FACTORY$2.create("no-options" /* AppError.NO_OPTIONS */);
    }
    const existingApp = _apps.get(name);
    if (existingApp) {
        // return the existing app if options and config deep equal the ones in the existing app.
        if (deepEqual(options, existingApp.options) &&
            deepEqual(config, existingApp.config)) {
            return existingApp;
        }
        else {
            throw ERROR_FACTORY$2.create("duplicate-app" /* AppError.DUPLICATE_APP */, { appName: name });
        }
    }
    const container = new ComponentContainer(name);
    for (const component of _components.values()) {
        container.addComponent(component);
    }
    const newApp = new FirebaseAppImpl(options, config, container);
    _apps.set(name, newApp);
    return newApp;
}
/**
 * Retrieves a {@link @firebase/app#FirebaseApp} instance.
 *
 * When called with no arguments, the default app is returned. When an app name
 * is provided, the app corresponding to that name is returned.
 *
 * An exception is thrown if the app being retrieved has not yet been
 * initialized.
 *
 * @example
 * ```javascript
 * // Return the default app
 * const app = getApp();
 * ```
 *
 * @example
 * ```javascript
 * // Return a named app
 * const otherApp = getApp("otherApp");
 * ```
 *
 * @param name - Optional name of the app to return. If no name is
 *   provided, the default is `"[DEFAULT]"`.
 *
 * @returns The app corresponding to the provided app name.
 *   If no app name is provided, the default app is returned.
 *
 * @public
 */
function getApp(name = DEFAULT_ENTRY_NAME) {
    const app = _apps.get(name);
    if (!app && name === DEFAULT_ENTRY_NAME && getDefaultAppConfig()) {
        return initializeApp();
    }
    if (!app) {
        throw ERROR_FACTORY$2.create("no-app" /* AppError.NO_APP */, { appName: name });
    }
    return app;
}
/**
 * Registers a library's name and version for platform logging purposes.
 * @param library - Name of 1p or 3p library (e.g. firestore, angularfire)
 * @param version - Current version of that library.
 * @param variant - Bundle variant, e.g., node, rn, etc.
 *
 * @public
 */
function registerVersion(libraryKeyOrName, version, variant) {
    var _a;
    // TODO: We can use this check to whitelist strings when/if we set up
    // a good whitelist system.
    let library = (_a = PLATFORM_LOG_STRING[libraryKeyOrName]) !== null && _a !== void 0 ? _a : libraryKeyOrName;
    if (variant) {
        library += `-${variant}`;
    }
    const libraryMismatch = library.match(/\s|\//);
    const versionMismatch = version.match(/\s|\//);
    if (libraryMismatch || versionMismatch) {
        const warning = [
            `Unable to register library "${library}" with version "${version}":`
        ];
        if (libraryMismatch) {
            warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
        }
        if (libraryMismatch && versionMismatch) {
            warning.push('and');
        }
        if (versionMismatch) {
            warning.push(`version name "${version}" contains illegal characters (whitespace or "/")`);
        }
        logger$1.warn(warning.join(' '));
        return;
    }
    _registerComponent(new Component(`${library}-version`, () => ({ library, version }), "VERSION" /* ComponentType.VERSION */));
}

/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DB_NAME$1 = 'firebase-heartbeat-database';
const DB_VERSION$1 = 1;
const STORE_NAME = 'firebase-heartbeat-store';
let dbPromise$1 = null;
function getDbPromise$1() {
    if (!dbPromise$1) {
        dbPromise$1 = openDB$1(DB_NAME$1, DB_VERSION$1, {
            upgrade: (db, oldVersion) => {
                // We don't use 'break' in this switch statement, the fall-through
                // behavior is what we want, because if there are multiple versions between
                // the old version and the current version, we want ALL the migrations
                // that correspond to those versions to run, not only the last one.
                // eslint-disable-next-line default-case
                switch (oldVersion) {
                    case 0:
                        db.createObjectStore(STORE_NAME);
                }
            }
        }).catch(e => {
            throw ERROR_FACTORY$2.create("idb-open" /* AppError.IDB_OPEN */, {
                originalErrorMessage: e.message
            });
        });
    }
    return dbPromise$1;
}
async function readHeartbeatsFromIndexedDB(app) {
    try {
        const db = await getDbPromise$1();
        const result = await db
            .transaction(STORE_NAME)
            .objectStore(STORE_NAME)
            .get(computeKey(app));
        return result;
    }
    catch (e) {
        if (e instanceof FirebaseError) {
            logger$1.warn(e.message);
        }
        else {
            const idbGetError = ERROR_FACTORY$2.create("idb-get" /* AppError.IDB_GET */, {
                originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
            });
            logger$1.warn(idbGetError.message);
        }
    }
}
async function writeHeartbeatsToIndexedDB(app, heartbeatObject) {
    try {
        const db = await getDbPromise$1();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const objectStore = tx.objectStore(STORE_NAME);
        await objectStore.put(heartbeatObject, computeKey(app));
        await tx.done;
    }
    catch (e) {
        if (e instanceof FirebaseError) {
            logger$1.warn(e.message);
        }
        else {
            const idbGetError = ERROR_FACTORY$2.create("idb-set" /* AppError.IDB_WRITE */, {
                originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
            });
            logger$1.warn(idbGetError.message);
        }
    }
}
function computeKey(app) {
    return `${app.name}!${app.options.appId}`;
}

/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const MAX_HEADER_BYTES = 1024;
// 30 days
const STORED_HEARTBEAT_RETENTION_MAX_MILLIS = 30 * 24 * 60 * 60 * 1000;
class HeartbeatServiceImpl {
    constructor(container) {
        this.container = container;
        /**
         * In-memory cache for heartbeats, used by getHeartbeatsHeader() to generate
         * the header string.
         * Stores one record per date. This will be consolidated into the standard
         * format of one record per user agent string before being sent as a header.
         * Populated from indexedDB when the controller is instantiated and should
         * be kept in sync with indexedDB.
         * Leave public for easier testing.
         */
        this._heartbeatsCache = null;
        const app = this.container.getProvider('app').getImmediate();
        this._storage = new HeartbeatStorageImpl(app);
        this._heartbeatsCachePromise = this._storage.read().then(result => {
            this._heartbeatsCache = result;
            return result;
        });
    }
    /**
     * Called to report a heartbeat. The function will generate
     * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
     * to IndexedDB.
     * Note that we only store one heartbeat per day. So if a heartbeat for today is
     * already logged, subsequent calls to this function in the same day will be ignored.
     */
    async triggerHeartbeat() {
        var _a, _b;
        const platformLogger = this.container
            .getProvider('platform-logger')
            .getImmediate();
        // This is the "Firebase user agent" string from the platform logger
        // service, not the browser user agent.
        const agent = platformLogger.getPlatformInfoString();
        const date = getUTCDateString();
        if (((_a = this._heartbeatsCache) === null || _a === void 0 ? void 0 : _a.heartbeats) == null) {
            this._heartbeatsCache = await this._heartbeatsCachePromise;
            // If we failed to construct a heartbeats cache, then return immediately.
            if (((_b = this._heartbeatsCache) === null || _b === void 0 ? void 0 : _b.heartbeats) == null) {
                return;
            }
        }
        // Do not store a heartbeat if one is already stored for this day
        // or if a header has already been sent today.
        if (this._heartbeatsCache.lastSentHeartbeatDate === date ||
            this._heartbeatsCache.heartbeats.some(singleDateHeartbeat => singleDateHeartbeat.date === date)) {
            return;
        }
        else {
            // There is no entry for this date. Create one.
            this._heartbeatsCache.heartbeats.push({ date, agent });
        }
        // Remove entries older than 30 days.
        this._heartbeatsCache.heartbeats = this._heartbeatsCache.heartbeats.filter(singleDateHeartbeat => {
            const hbTimestamp = new Date(singleDateHeartbeat.date).valueOf();
            const now = Date.now();
            return now - hbTimestamp <= STORED_HEARTBEAT_RETENTION_MAX_MILLIS;
        });
        return this._storage.overwrite(this._heartbeatsCache);
    }
    /**
     * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
     * It also clears all heartbeats from memory as well as in IndexedDB.
     *
     * NOTE: Consuming product SDKs should not send the header if this method
     * returns an empty string.
     */
    async getHeartbeatsHeader() {
        var _a;
        if (this._heartbeatsCache === null) {
            await this._heartbeatsCachePromise;
        }
        // If it's still null or the array is empty, there is no data to send.
        if (((_a = this._heartbeatsCache) === null || _a === void 0 ? void 0 : _a.heartbeats) == null ||
            this._heartbeatsCache.heartbeats.length === 0) {
            return '';
        }
        const date = getUTCDateString();
        // Extract as many heartbeats from the cache as will fit under the size limit.
        const { heartbeatsToSend, unsentEntries } = extractHeartbeatsForHeader(this._heartbeatsCache.heartbeats);
        const headerString = base64urlEncodeWithoutPadding(JSON.stringify({ version: 2, heartbeats: heartbeatsToSend }));
        // Store last sent date to prevent another being logged/sent for the same day.
        this._heartbeatsCache.lastSentHeartbeatDate = date;
        if (unsentEntries.length > 0) {
            // Store any unsent entries if they exist.
            this._heartbeatsCache.heartbeats = unsentEntries;
            // This seems more likely than emptying the array (below) to lead to some odd state
            // since the cache isn't empty and this will be called again on the next request,
            // and is probably safest if we await it.
            await this._storage.overwrite(this._heartbeatsCache);
        }
        else {
            this._heartbeatsCache.heartbeats = [];
            // Do not wait for this, to reduce latency.
            void this._storage.overwrite(this._heartbeatsCache);
        }
        return headerString;
    }
}
function getUTCDateString() {
    const today = new Date();
    // Returns date format 'YYYY-MM-DD'
    return today.toISOString().substring(0, 10);
}
function extractHeartbeatsForHeader(heartbeatsCache, maxSize = MAX_HEADER_BYTES) {
    // Heartbeats grouped by user agent in the standard format to be sent in
    // the header.
    const heartbeatsToSend = [];
    // Single date format heartbeats that are not sent.
    let unsentEntries = heartbeatsCache.slice();
    for (const singleDateHeartbeat of heartbeatsCache) {
        // Look for an existing entry with the same user agent.
        const heartbeatEntry = heartbeatsToSend.find(hb => hb.agent === singleDateHeartbeat.agent);
        if (!heartbeatEntry) {
            // If no entry for this user agent exists, create one.
            heartbeatsToSend.push({
                agent: singleDateHeartbeat.agent,
                dates: [singleDateHeartbeat.date]
            });
            if (countBytes(heartbeatsToSend) > maxSize) {
                // If the header would exceed max size, remove the added heartbeat
                // entry and stop adding to the header.
                heartbeatsToSend.pop();
                break;
            }
        }
        else {
            heartbeatEntry.dates.push(singleDateHeartbeat.date);
            // If the header would exceed max size, remove the added date
            // and stop adding to the header.
            if (countBytes(heartbeatsToSend) > maxSize) {
                heartbeatEntry.dates.pop();
                break;
            }
        }
        // Pop unsent entry from queue. (Skipped if adding the entry exceeded
        // quota and the loop breaks early.)
        unsentEntries = unsentEntries.slice(1);
    }
    return {
        heartbeatsToSend,
        unsentEntries
    };
}
class HeartbeatStorageImpl {
    constructor(app) {
        this.app = app;
        this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
    }
    async runIndexedDBEnvironmentCheck() {
        if (!isIndexedDBAvailable()) {
            return false;
        }
        else {
            return validateIndexedDBOpenable()
                .then(() => true)
                .catch(() => false);
        }
    }
    /**
     * Read all heartbeats.
     */
    async read() {
        const canUseIndexedDB = await this._canUseIndexedDBPromise;
        if (!canUseIndexedDB) {
            return { heartbeats: [] };
        }
        else {
            const idbHeartbeatObject = await readHeartbeatsFromIndexedDB(this.app);
            if (idbHeartbeatObject === null || idbHeartbeatObject === void 0 ? void 0 : idbHeartbeatObject.heartbeats) {
                return idbHeartbeatObject;
            }
            else {
                return { heartbeats: [] };
            }
        }
    }
    // overwrite the storage with the provided heartbeats
    async overwrite(heartbeatsObject) {
        var _a;
        const canUseIndexedDB = await this._canUseIndexedDBPromise;
        if (!canUseIndexedDB) {
            return;
        }
        else {
            const existingHeartbeatsObject = await this.read();
            return writeHeartbeatsToIndexedDB(this.app, {
                lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== void 0 ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
                heartbeats: heartbeatsObject.heartbeats
            });
        }
    }
    // add heartbeats
    async add(heartbeatsObject) {
        var _a;
        const canUseIndexedDB = await this._canUseIndexedDBPromise;
        if (!canUseIndexedDB) {
            return;
        }
        else {
            const existingHeartbeatsObject = await this.read();
            return writeHeartbeatsToIndexedDB(this.app, {
                lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== void 0 ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
                heartbeats: [
                    ...existingHeartbeatsObject.heartbeats,
                    ...heartbeatsObject.heartbeats
                ]
            });
        }
    }
}
/**
 * Calculate bytes of a HeartbeatsByUserAgent array after being wrapped
 * in a platform logging header JSON object, stringified, and converted
 * to base 64.
 */
function countBytes(heartbeatsCache) {
    // base64 has a restricted set of characters, all of which should be 1 byte.
    return base64urlEncodeWithoutPadding(
    // heartbeatsCache wrapper properties
    JSON.stringify({ version: 2, heartbeats: heartbeatsCache })).length;
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function registerCoreComponents(variant) {
    _registerComponent(new Component('platform-logger', container => new PlatformLoggerServiceImpl(container), "PRIVATE" /* ComponentType.PRIVATE */));
    _registerComponent(new Component('heartbeat', container => new HeartbeatServiceImpl(container), "PRIVATE" /* ComponentType.PRIVATE */));
    // Register `app` package.
    registerVersion(name$o, version$1$1, variant);
    // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
    registerVersion(name$o, version$1$1, 'esm2017');
    // Register platform SDK identifier (no version).
    registerVersion('fire-js', '');
}

/**
 * Firebase App
 *
 * @remarks This package coordinates the communication between the different Firebase components
 * @packageDocumentation
 */
registerCoreComponents('');

var name$3 = "firebase";
var version$3 = "10.7.1";

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
registerVersion(name$3, version$3, 'app');

const instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);

let idbProxyableTypes;
let cursorAdvanceMethods;
// This is a function to prevent it throwing up in node environments.
function getIdbProxyableTypes() {
    return (idbProxyableTypes ||
        (idbProxyableTypes = [
            IDBDatabase,
            IDBObjectStore,
            IDBIndex,
            IDBCursor,
            IDBTransaction,
        ]));
}
// This is a function to prevent it throwing up in node environments.
function getCursorAdvanceMethods() {
    return (cursorAdvanceMethods ||
        (cursorAdvanceMethods = [
            IDBCursor.prototype.advance,
            IDBCursor.prototype.continue,
            IDBCursor.prototype.continuePrimaryKey,
        ]));
}
const cursorRequestMap = new WeakMap();
const transactionDoneMap = new WeakMap();
const transactionStoreNamesMap = new WeakMap();
const transformCache = new WeakMap();
const reverseTransformCache = new WeakMap();
function promisifyRequest(request) {
    const promise = new Promise((resolve, reject) => {
        const unlisten = () => {
            request.removeEventListener('success', success);
            request.removeEventListener('error', error);
        };
        const success = () => {
            resolve(wrap(request.result));
            unlisten();
        };
        const error = () => {
            reject(request.error);
            unlisten();
        };
        request.addEventListener('success', success);
        request.addEventListener('error', error);
    });
    promise
        .then((value) => {
        // Since cursoring reuses the IDBRequest (*sigh*), we cache it for later retrieval
        // (see wrapFunction).
        if (value instanceof IDBCursor) {
            cursorRequestMap.set(value, request);
        }
        // Catching to avoid "Uncaught Promise exceptions"
    })
        .catch(() => { });
    // This mapping exists in reverseTransformCache but doesn't doesn't exist in transformCache. This
    // is because we create many promises from a single IDBRequest.
    reverseTransformCache.set(promise, request);
    return promise;
}
function cacheDonePromiseForTransaction(tx) {
    // Early bail if we've already created a done promise for this transaction.
    if (transactionDoneMap.has(tx))
        return;
    const done = new Promise((resolve, reject) => {
        const unlisten = () => {
            tx.removeEventListener('complete', complete);
            tx.removeEventListener('error', error);
            tx.removeEventListener('abort', error);
        };
        const complete = () => {
            resolve();
            unlisten();
        };
        const error = () => {
            reject(tx.error || new DOMException('AbortError', 'AbortError'));
            unlisten();
        };
        tx.addEventListener('complete', complete);
        tx.addEventListener('error', error);
        tx.addEventListener('abort', error);
    });
    // Cache it for later retrieval.
    transactionDoneMap.set(tx, done);
}
let idbProxyTraps = {
    get(target, prop, receiver) {
        if (target instanceof IDBTransaction) {
            // Special handling for transaction.done.
            if (prop === 'done')
                return transactionDoneMap.get(target);
            // Polyfill for objectStoreNames because of Edge.
            if (prop === 'objectStoreNames') {
                return target.objectStoreNames || transactionStoreNamesMap.get(target);
            }
            // Make tx.store return the only store in the transaction, or undefined if there are many.
            if (prop === 'store') {
                return receiver.objectStoreNames[1]
                    ? undefined
                    : receiver.objectStore(receiver.objectStoreNames[0]);
            }
        }
        // Else transform whatever we get back.
        return wrap(target[prop]);
    },
    set(target, prop, value) {
        target[prop] = value;
        return true;
    },
    has(target, prop) {
        if (target instanceof IDBTransaction &&
            (prop === 'done' || prop === 'store')) {
            return true;
        }
        return prop in target;
    },
};
function replaceTraps(callback) {
    idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
    // Due to expected object equality (which is enforced by the caching in `wrap`), we
    // only create one new func per func.
    // Edge doesn't support objectStoreNames (booo), so we polyfill it here.
    if (func === IDBDatabase.prototype.transaction &&
        !('objectStoreNames' in IDBTransaction.prototype)) {
        return function (storeNames, ...args) {
            const tx = func.call(unwrap(this), storeNames, ...args);
            transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
            return wrap(tx);
        };
    }
    // Cursor methods are special, as the behaviour is a little more different to standard IDB. In
    // IDB, you advance the cursor and wait for a new 'success' on the IDBRequest that gave you the
    // cursor. It's kinda like a promise that can resolve with many values. That doesn't make sense
    // with real promises, so each advance methods returns a new promise for the cursor object, or
    // undefined if the end of the cursor has been reached.
    if (getCursorAdvanceMethods().includes(func)) {
        return function (...args) {
            // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
            // the original object.
            func.apply(unwrap(this), args);
            return wrap(cursorRequestMap.get(this));
        };
    }
    return function (...args) {
        // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
        // the original object.
        return wrap(func.apply(unwrap(this), args));
    };
}
function transformCachableValue(value) {
    if (typeof value === 'function')
        return wrapFunction(value);
    // This doesn't return, it just creates a 'done' promise for the transaction,
    // which is later returned for transaction.done (see idbObjectHandler).
    if (value instanceof IDBTransaction)
        cacheDonePromiseForTransaction(value);
    if (instanceOfAny(value, getIdbProxyableTypes()))
        return new Proxy(value, idbProxyTraps);
    // Return the same value back if we're not going to transform it.
    return value;
}
function wrap(value) {
    // We sometimes generate multiple promises from a single IDBRequest (eg when cursoring), because
    // IDB is weird and a single IDBRequest can yield many responses, so these can't be cached.
    if (value instanceof IDBRequest)
        return promisifyRequest(value);
    // If we've already transformed this value before, reuse the transformed value.
    // This is faster, but it also provides object equality.
    if (transformCache.has(value))
        return transformCache.get(value);
    const newValue = transformCachableValue(value);
    // Not all types are transformed.
    // These may be primitive types, so they can't be WeakMap keys.
    if (newValue !== value) {
        transformCache.set(value, newValue);
        reverseTransformCache.set(newValue, value);
    }
    return newValue;
}
const unwrap = (value) => reverseTransformCache.get(value);

/**
 * Open a database.
 *
 * @param name Name of the database.
 * @param version Schema version.
 * @param callbacks Additional callbacks.
 */
function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
    const request = indexedDB.open(name, version);
    const openPromise = wrap(request);
    if (upgrade) {
        request.addEventListener('upgradeneeded', (event) => {
            upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction));
        });
    }
    if (blocked)
        request.addEventListener('blocked', () => blocked());
    openPromise
        .then((db) => {
        if (terminated)
            db.addEventListener('close', () => terminated());
        if (blocking)
            db.addEventListener('versionchange', () => blocking());
    })
        .catch(() => { });
    return openPromise;
}

const readMethods = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'];
const writeMethods = ['put', 'add', 'delete', 'clear'];
const cachedMethods = new Map();
function getMethod(target, prop) {
    if (!(target instanceof IDBDatabase &&
        !(prop in target) &&
        typeof prop === 'string')) {
        return;
    }
    if (cachedMethods.get(prop))
        return cachedMethods.get(prop);
    const targetFuncName = prop.replace(/FromIndex$/, '');
    const useIndex = prop !== targetFuncName;
    const isWrite = writeMethods.includes(targetFuncName);
    if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) ||
        !(isWrite || readMethods.includes(targetFuncName))) {
        return;
    }
    const method = async function (storeName, ...args) {
        // isWrite ? 'readwrite' : undefined gzipps better, but fails in Edge :(
        const tx = this.transaction(storeName, isWrite ? 'readwrite' : 'readonly');
        let target = tx.store;
        if (useIndex)
            target = target.index(args.shift());
        // Must reject if op rejects.
        // If it's a write operation, must reject if tx.done rejects.
        // Must reject with op rejection first.
        // Must resolve with op value.
        // Must handle both promises (no unhandled rejections)
        return (await Promise.all([
            target[targetFuncName](...args),
            isWrite && tx.done,
        ]))[0];
    };
    cachedMethods.set(prop, method);
    return method;
}
replaceTraps((oldTraps) => ({
    ...oldTraps,
    get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
    has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop),
}));

const name$2 = "@firebase/installations";
const version$2 = "0.6.4";

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const PENDING_TIMEOUT_MS = 10000;
const PACKAGE_VERSION = `w:${version$2}`;
const INTERNAL_AUTH_VERSION = 'FIS_v2';
const INSTALLATIONS_API_URL = 'https://firebaseinstallations.googleapis.com/v1';
const TOKEN_EXPIRATION_BUFFER = 60 * 60 * 1000; // One hour
const SERVICE = 'installations';
const SERVICE_NAME = 'Installations';

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ERROR_DESCRIPTION_MAP = {
    ["missing-app-config-values" /* ErrorCode.MISSING_APP_CONFIG_VALUES */]: 'Missing App configuration value: "{$valueName}"',
    ["not-registered" /* ErrorCode.NOT_REGISTERED */]: 'Firebase Installation is not registered.',
    ["installation-not-found" /* ErrorCode.INSTALLATION_NOT_FOUND */]: 'Firebase Installation not found.',
    ["request-failed" /* ErrorCode.REQUEST_FAILED */]: '{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',
    ["app-offline" /* ErrorCode.APP_OFFLINE */]: 'Could not process request. Application offline.',
    ["delete-pending-registration" /* ErrorCode.DELETE_PENDING_REGISTRATION */]: "Can't delete installation while there is a pending registration request."
};
const ERROR_FACTORY$1 = new ErrorFactory(SERVICE, SERVICE_NAME, ERROR_DESCRIPTION_MAP);
/** Returns true if error is a FirebaseError that is based on an error from the server. */
function isServerError(error) {
    return (error instanceof FirebaseError &&
        error.code.includes("request-failed" /* ErrorCode.REQUEST_FAILED */));
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function getInstallationsEndpoint({ projectId }) {
    return `${INSTALLATIONS_API_URL}/projects/${projectId}/installations`;
}
function extractAuthTokenInfoFromResponse(response) {
    return {
        token: response.token,
        requestStatus: 2 /* RequestStatus.COMPLETED */,
        expiresIn: getExpiresInFromResponseExpiresIn(response.expiresIn),
        creationTime: Date.now()
    };
}
async function getErrorFromResponse(requestName, response) {
    const responseJson = await response.json();
    const errorData = responseJson.error;
    return ERROR_FACTORY$1.create("request-failed" /* ErrorCode.REQUEST_FAILED */, {
        requestName,
        serverCode: errorData.code,
        serverMessage: errorData.message,
        serverStatus: errorData.status
    });
}
function getHeaders$1({ apiKey }) {
    return new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-goog-api-key': apiKey
    });
}
function getHeadersWithAuth(appConfig, { refreshToken }) {
    const headers = getHeaders$1(appConfig);
    headers.append('Authorization', getAuthorizationHeader(refreshToken));
    return headers;
}
/**
 * Calls the passed in fetch wrapper and returns the response.
 * If the returned response has a status of 5xx, re-runs the function once and
 * returns the response.
 */
async function retryIfServerError(fn) {
    const result = await fn();
    if (result.status >= 500 && result.status < 600) {
        // Internal Server Error. Retry request.
        return fn();
    }
    return result;
}
function getExpiresInFromResponseExpiresIn(responseExpiresIn) {
    // This works because the server will never respond with fractions of a second.
    return Number(responseExpiresIn.replace('s', '000'));
}
function getAuthorizationHeader(refreshToken) {
    return `${INTERNAL_AUTH_VERSION} ${refreshToken}`;
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function createInstallationRequest({ appConfig, heartbeatServiceProvider }, { fid }) {
    const endpoint = getInstallationsEndpoint(appConfig);
    const headers = getHeaders$1(appConfig);
    // If heartbeat service exists, add the heartbeat string to the header.
    const heartbeatService = heartbeatServiceProvider.getImmediate({
        optional: true
    });
    if (heartbeatService) {
        const heartbeatsHeader = await heartbeatService.getHeartbeatsHeader();
        if (heartbeatsHeader) {
            headers.append('x-firebase-client', heartbeatsHeader);
        }
    }
    const body = {
        fid,
        authVersion: INTERNAL_AUTH_VERSION,
        appId: appConfig.appId,
        sdkVersion: PACKAGE_VERSION
    };
    const request = {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    };
    const response = await retryIfServerError(() => fetch(endpoint, request));
    if (response.ok) {
        const responseValue = await response.json();
        const registeredInstallationEntry = {
            fid: responseValue.fid || fid,
            registrationStatus: 2 /* RequestStatus.COMPLETED */,
            refreshToken: responseValue.refreshToken,
            authToken: extractAuthTokenInfoFromResponse(responseValue.authToken)
        };
        return registeredInstallationEntry;
    }
    else {
        throw await getErrorFromResponse('Create Installation', response);
    }
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** Returns a promise that resolves after given time passes. */
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function bufferToBase64UrlSafe(array) {
    const b64 = btoa(String.fromCharCode(...array));
    return b64.replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const VALID_FID_PATTERN = /^[cdef][\w-]{21}$/;
const INVALID_FID = '';
/**
 * Generates a new FID using random values from Web Crypto API.
 * Returns an empty string if FID generation fails for any reason.
 */
function generateFid() {
    try {
        // A valid FID has exactly 22 base64 characters, which is 132 bits, or 16.5
        // bytes. our implementation generates a 17 byte array instead.
        const fidByteArray = new Uint8Array(17);
        const crypto = self.crypto || self.msCrypto;
        crypto.getRandomValues(fidByteArray);
        // Replace the first 4 random bits with the constant FID header of 0b0111.
        fidByteArray[0] = 0b01110000 + (fidByteArray[0] % 0b00010000);
        const fid = encode(fidByteArray);
        return VALID_FID_PATTERN.test(fid) ? fid : INVALID_FID;
    }
    catch (_a) {
        // FID generation errored
        return INVALID_FID;
    }
}
/** Converts a FID Uint8Array to a base64 string representation. */
function encode(fidByteArray) {
    const b64String = bufferToBase64UrlSafe(fidByteArray);
    // Remove the 23rd character that was added because of the extra 4 bits at the
    // end of our 17 byte array, and the '=' padding.
    return b64String.substr(0, 22);
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** Returns a string key that can be used to identify the app. */
function getKey(appConfig) {
    return `${appConfig.appName}!${appConfig.appId}`;
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const fidChangeCallbacks = new Map();
/**
 * Calls the onIdChange callbacks with the new FID value, and broadcasts the
 * change to other tabs.
 */
function fidChanged(appConfig, fid) {
    const key = getKey(appConfig);
    callFidChangeCallbacks(key, fid);
    broadcastFidChange(key, fid);
}
function callFidChangeCallbacks(key, fid) {
    const callbacks = fidChangeCallbacks.get(key);
    if (!callbacks) {
        return;
    }
    for (const callback of callbacks) {
        callback(fid);
    }
}
function broadcastFidChange(key, fid) {
    const channel = getBroadcastChannel();
    if (channel) {
        channel.postMessage({ key, fid });
    }
    closeBroadcastChannel();
}
let broadcastChannel = null;
/** Opens and returns a BroadcastChannel if it is supported by the browser. */
function getBroadcastChannel() {
    if (!broadcastChannel && 'BroadcastChannel' in self) {
        broadcastChannel = new BroadcastChannel('[Firebase] FID Change');
        broadcastChannel.onmessage = e => {
            callFidChangeCallbacks(e.data.key, e.data.fid);
        };
    }
    return broadcastChannel;
}
function closeBroadcastChannel() {
    if (fidChangeCallbacks.size === 0 && broadcastChannel) {
        broadcastChannel.close();
        broadcastChannel = null;
    }
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DATABASE_NAME = 'firebase-installations-database';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'firebase-installations-store';
let dbPromise = null;
function getDbPromise() {
    if (!dbPromise) {
        dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
            upgrade: (db, oldVersion) => {
                // We don't use 'break' in this switch statement, the fall-through
                // behavior is what we want, because if there are multiple versions between
                // the old version and the current version, we want ALL the migrations
                // that correspond to those versions to run, not only the last one.
                // eslint-disable-next-line default-case
                switch (oldVersion) {
                    case 0:
                        db.createObjectStore(OBJECT_STORE_NAME);
                }
            }
        });
    }
    return dbPromise;
}
/** Assigns or overwrites the record for the given key with the given value. */
async function set(appConfig, value) {
    const key = getKey(appConfig);
    const db = await getDbPromise();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const objectStore = tx.objectStore(OBJECT_STORE_NAME);
    const oldValue = (await objectStore.get(key));
    await objectStore.put(value, key);
    await tx.done;
    if (!oldValue || oldValue.fid !== value.fid) {
        fidChanged(appConfig, value.fid);
    }
    return value;
}
/** Removes record(s) from the objectStore that match the given key. */
async function remove(appConfig) {
    const key = getKey(appConfig);
    const db = await getDbPromise();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    await tx.objectStore(OBJECT_STORE_NAME).delete(key);
    await tx.done;
}
/**
 * Atomically updates a record with the result of updateFn, which gets
 * called with the current value. If newValue is undefined, the record is
 * deleted instead.
 * @return Updated value
 */
async function update(appConfig, updateFn) {
    const key = getKey(appConfig);
    const db = await getDbPromise();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    const oldValue = (await store.get(key));
    const newValue = updateFn(oldValue);
    if (newValue === undefined) {
        await store.delete(key);
    }
    else {
        await store.put(newValue, key);
    }
    await tx.done;
    if (newValue && (!oldValue || oldValue.fid !== newValue.fid)) {
        fidChanged(appConfig, newValue.fid);
    }
    return newValue;
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Updates and returns the InstallationEntry from the database.
 * Also triggers a registration request if it is necessary and possible.
 */
async function getInstallationEntry(installations) {
    let registrationPromise;
    const installationEntry = await update(installations.appConfig, oldEntry => {
        const installationEntry = updateOrCreateInstallationEntry(oldEntry);
        const entryWithPromise = triggerRegistrationIfNecessary(installations, installationEntry);
        registrationPromise = entryWithPromise.registrationPromise;
        return entryWithPromise.installationEntry;
    });
    if (installationEntry.fid === INVALID_FID) {
        // FID generation failed. Waiting for the FID from the server.
        return { installationEntry: await registrationPromise };
    }
    return {
        installationEntry,
        registrationPromise
    };
}
/**
 * Creates a new Installation Entry if one does not exist.
 * Also clears timed out pending requests.
 */
function updateOrCreateInstallationEntry(oldEntry) {
    const entry = oldEntry || {
        fid: generateFid(),
        registrationStatus: 0 /* RequestStatus.NOT_STARTED */
    };
    return clearTimedOutRequest(entry);
}
/**
 * If the Firebase Installation is not registered yet, this will trigger the
 * registration and return an InProgressInstallationEntry.
 *
 * If registrationPromise does not exist, the installationEntry is guaranteed
 * to be registered.
 */
function triggerRegistrationIfNecessary(installations, installationEntry) {
    if (installationEntry.registrationStatus === 0 /* RequestStatus.NOT_STARTED */) {
        if (!navigator.onLine) {
            // Registration required but app is offline.
            const registrationPromiseWithError = Promise.reject(ERROR_FACTORY$1.create("app-offline" /* ErrorCode.APP_OFFLINE */));
            return {
                installationEntry,
                registrationPromise: registrationPromiseWithError
            };
        }
        // Try registering. Change status to IN_PROGRESS.
        const inProgressEntry = {
            fid: installationEntry.fid,
            registrationStatus: 1 /* RequestStatus.IN_PROGRESS */,
            registrationTime: Date.now()
        };
        const registrationPromise = registerInstallation(installations, inProgressEntry);
        return { installationEntry: inProgressEntry, registrationPromise };
    }
    else if (installationEntry.registrationStatus === 1 /* RequestStatus.IN_PROGRESS */) {
        return {
            installationEntry,
            registrationPromise: waitUntilFidRegistration(installations)
        };
    }
    else {
        return { installationEntry };
    }
}
/** This will be executed only once for each new Firebase Installation. */
async function registerInstallation(installations, installationEntry) {
    try {
        const registeredInstallationEntry = await createInstallationRequest(installations, installationEntry);
        return set(installations.appConfig, registeredInstallationEntry);
    }
    catch (e) {
        if (isServerError(e) && e.customData.serverCode === 409) {
            // Server returned a "FID can not be used" error.
            // Generate a new ID next time.
            await remove(installations.appConfig);
        }
        else {
            // Registration failed. Set FID as not registered.
            await set(installations.appConfig, {
                fid: installationEntry.fid,
                registrationStatus: 0 /* RequestStatus.NOT_STARTED */
            });
        }
        throw e;
    }
}
/** Call if FID registration is pending in another request. */
async function waitUntilFidRegistration(installations) {
    // Unfortunately, there is no way of reliably observing when a value in
    // IndexedDB changes (yet, see https://github.com/WICG/indexed-db-observers),
    // so we need to poll.
    let entry = await updateInstallationRequest(installations.appConfig);
    while (entry.registrationStatus === 1 /* RequestStatus.IN_PROGRESS */) {
        // createInstallation request still in progress.
        await sleep(100);
        entry = await updateInstallationRequest(installations.appConfig);
    }
    if (entry.registrationStatus === 0 /* RequestStatus.NOT_STARTED */) {
        // The request timed out or failed in a different call. Try again.
        const { installationEntry, registrationPromise } = await getInstallationEntry(installations);
        if (registrationPromise) {
            return registrationPromise;
        }
        else {
            // if there is no registrationPromise, entry is registered.
            return installationEntry;
        }
    }
    return entry;
}
/**
 * Called only if there is a CreateInstallation request in progress.
 *
 * Updates the InstallationEntry in the DB based on the status of the
 * CreateInstallation request.
 *
 * Returns the updated InstallationEntry.
 */
function updateInstallationRequest(appConfig) {
    return update(appConfig, oldEntry => {
        if (!oldEntry) {
            throw ERROR_FACTORY$1.create("installation-not-found" /* ErrorCode.INSTALLATION_NOT_FOUND */);
        }
        return clearTimedOutRequest(oldEntry);
    });
}
function clearTimedOutRequest(entry) {
    if (hasInstallationRequestTimedOut(entry)) {
        return {
            fid: entry.fid,
            registrationStatus: 0 /* RequestStatus.NOT_STARTED */
        };
    }
    return entry;
}
function hasInstallationRequestTimedOut(installationEntry) {
    return (installationEntry.registrationStatus === 1 /* RequestStatus.IN_PROGRESS */ &&
        installationEntry.registrationTime + PENDING_TIMEOUT_MS < Date.now());
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function generateAuthTokenRequest({ appConfig, heartbeatServiceProvider }, installationEntry) {
    const endpoint = getGenerateAuthTokenEndpoint(appConfig, installationEntry);
    const headers = getHeadersWithAuth(appConfig, installationEntry);
    // If heartbeat service exists, add the heartbeat string to the header.
    const heartbeatService = heartbeatServiceProvider.getImmediate({
        optional: true
    });
    if (heartbeatService) {
        const heartbeatsHeader = await heartbeatService.getHeartbeatsHeader();
        if (heartbeatsHeader) {
            headers.append('x-firebase-client', heartbeatsHeader);
        }
    }
    const body = {
        installation: {
            sdkVersion: PACKAGE_VERSION,
            appId: appConfig.appId
        }
    };
    const request = {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    };
    const response = await retryIfServerError(() => fetch(endpoint, request));
    if (response.ok) {
        const responseValue = await response.json();
        const completedAuthToken = extractAuthTokenInfoFromResponse(responseValue);
        return completedAuthToken;
    }
    else {
        throw await getErrorFromResponse('Generate Auth Token', response);
    }
}
function getGenerateAuthTokenEndpoint(appConfig, { fid }) {
    return `${getInstallationsEndpoint(appConfig)}/${fid}/authTokens:generate`;
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Returns a valid authentication token for the installation. Generates a new
 * token if one doesn't exist, is expired or about to expire.
 *
 * Should only be called if the Firebase Installation is registered.
 */
async function refreshAuthToken(installations, forceRefresh = false) {
    let tokenPromise;
    const entry = await update(installations.appConfig, oldEntry => {
        if (!isEntryRegistered(oldEntry)) {
            throw ERROR_FACTORY$1.create("not-registered" /* ErrorCode.NOT_REGISTERED */);
        }
        const oldAuthToken = oldEntry.authToken;
        if (!forceRefresh && isAuthTokenValid(oldAuthToken)) {
            // There is a valid token in the DB.
            return oldEntry;
        }
        else if (oldAuthToken.requestStatus === 1 /* RequestStatus.IN_PROGRESS */) {
            // There already is a token request in progress.
            tokenPromise = waitUntilAuthTokenRequest(installations, forceRefresh);
            return oldEntry;
        }
        else {
            // No token or token expired.
            if (!navigator.onLine) {
                throw ERROR_FACTORY$1.create("app-offline" /* ErrorCode.APP_OFFLINE */);
            }
            const inProgressEntry = makeAuthTokenRequestInProgressEntry(oldEntry);
            tokenPromise = fetchAuthTokenFromServer(installations, inProgressEntry);
            return inProgressEntry;
        }
    });
    const authToken = tokenPromise
        ? await tokenPromise
        : entry.authToken;
    return authToken;
}
/**
 * Call only if FID is registered and Auth Token request is in progress.
 *
 * Waits until the current pending request finishes. If the request times out,
 * tries once in this thread as well.
 */
async function waitUntilAuthTokenRequest(installations, forceRefresh) {
    // Unfortunately, there is no way of reliably observing when a value in
    // IndexedDB changes (yet, see https://github.com/WICG/indexed-db-observers),
    // so we need to poll.
    let entry = await updateAuthTokenRequest(installations.appConfig);
    while (entry.authToken.requestStatus === 1 /* RequestStatus.IN_PROGRESS */) {
        // generateAuthToken still in progress.
        await sleep(100);
        entry = await updateAuthTokenRequest(installations.appConfig);
    }
    const authToken = entry.authToken;
    if (authToken.requestStatus === 0 /* RequestStatus.NOT_STARTED */) {
        // The request timed out or failed in a different call. Try again.
        return refreshAuthToken(installations, forceRefresh);
    }
    else {
        return authToken;
    }
}
/**
 * Called only if there is a GenerateAuthToken request in progress.
 *
 * Updates the InstallationEntry in the DB based on the status of the
 * GenerateAuthToken request.
 *
 * Returns the updated InstallationEntry.
 */
function updateAuthTokenRequest(appConfig) {
    return update(appConfig, oldEntry => {
        if (!isEntryRegistered(oldEntry)) {
            throw ERROR_FACTORY$1.create("not-registered" /* ErrorCode.NOT_REGISTERED */);
        }
        const oldAuthToken = oldEntry.authToken;
        if (hasAuthTokenRequestTimedOut(oldAuthToken)) {
            return Object.assign(Object.assign({}, oldEntry), { authToken: { requestStatus: 0 /* RequestStatus.NOT_STARTED */ } });
        }
        return oldEntry;
    });
}
async function fetchAuthTokenFromServer(installations, installationEntry) {
    try {
        const authToken = await generateAuthTokenRequest(installations, installationEntry);
        const updatedInstallationEntry = Object.assign(Object.assign({}, installationEntry), { authToken });
        await set(installations.appConfig, updatedInstallationEntry);
        return authToken;
    }
    catch (e) {
        if (isServerError(e) &&
            (e.customData.serverCode === 401 || e.customData.serverCode === 404)) {
            // Server returned a "FID not found" or a "Invalid authentication" error.
            // Generate a new ID next time.
            await remove(installations.appConfig);
        }
        else {
            const updatedInstallationEntry = Object.assign(Object.assign({}, installationEntry), { authToken: { requestStatus: 0 /* RequestStatus.NOT_STARTED */ } });
            await set(installations.appConfig, updatedInstallationEntry);
        }
        throw e;
    }
}
function isEntryRegistered(installationEntry) {
    return (installationEntry !== undefined &&
        installationEntry.registrationStatus === 2 /* RequestStatus.COMPLETED */);
}
function isAuthTokenValid(authToken) {
    return (authToken.requestStatus === 2 /* RequestStatus.COMPLETED */ &&
        !isAuthTokenExpired(authToken));
}
function isAuthTokenExpired(authToken) {
    const now = Date.now();
    return (now < authToken.creationTime ||
        authToken.creationTime + authToken.expiresIn < now + TOKEN_EXPIRATION_BUFFER);
}
/** Returns an updated InstallationEntry with an InProgressAuthToken. */
function makeAuthTokenRequestInProgressEntry(oldEntry) {
    const inProgressAuthToken = {
        requestStatus: 1 /* RequestStatus.IN_PROGRESS */,
        requestTime: Date.now()
    };
    return Object.assign(Object.assign({}, oldEntry), { authToken: inProgressAuthToken });
}
function hasAuthTokenRequestTimedOut(authToken) {
    return (authToken.requestStatus === 1 /* RequestStatus.IN_PROGRESS */ &&
        authToken.requestTime + PENDING_TIMEOUT_MS < Date.now());
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Creates a Firebase Installation if there isn't one for the app and
 * returns the Installation ID.
 * @param installations - The `Installations` instance.
 *
 * @public
 */
async function getId(installations) {
    const installationsImpl = installations;
    const { installationEntry, registrationPromise } = await getInstallationEntry(installationsImpl);
    if (registrationPromise) {
        registrationPromise.catch(console.error);
    }
    else {
        // If the installation is already registered, update the authentication
        // token if needed.
        refreshAuthToken(installationsImpl).catch(console.error);
    }
    return installationEntry.fid;
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Returns a Firebase Installations auth token, identifying the current
 * Firebase Installation.
 * @param installations - The `Installations` instance.
 * @param forceRefresh - Force refresh regardless of token expiration.
 *
 * @public
 */
async function getToken(installations, forceRefresh = false) {
    const installationsImpl = installations;
    await completeInstallationRegistration(installationsImpl);
    // At this point we either have a Registered Installation in the DB, or we've
    // already thrown an error.
    const authToken = await refreshAuthToken(installationsImpl, forceRefresh);
    return authToken.token;
}
async function completeInstallationRegistration(installations) {
    const { registrationPromise } = await getInstallationEntry(installations);
    if (registrationPromise) {
        // A createInstallation request is in progress. Wait until it finishes.
        await registrationPromise;
    }
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function extractAppConfig(app) {
    if (!app || !app.options) {
        throw getMissingValueError('App Configuration');
    }
    if (!app.name) {
        throw getMissingValueError('App Name');
    }
    // Required app config keys
    const configKeys = [
        'projectId',
        'apiKey',
        'appId'
    ];
    for (const keyName of configKeys) {
        if (!app.options[keyName]) {
            throw getMissingValueError(keyName);
        }
    }
    return {
        appName: app.name,
        projectId: app.options.projectId,
        apiKey: app.options.apiKey,
        appId: app.options.appId
    };
}
function getMissingValueError(valueName) {
    return ERROR_FACTORY$1.create("missing-app-config-values" /* ErrorCode.MISSING_APP_CONFIG_VALUES */, {
        valueName
    });
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const INSTALLATIONS_NAME = 'installations';
const INSTALLATIONS_NAME_INTERNAL = 'installations-internal';
const publicFactory = (container) => {
    const app = container.getProvider('app').getImmediate();
    // Throws if app isn't configured properly.
    const appConfig = extractAppConfig(app);
    const heartbeatServiceProvider = _getProvider(app, 'heartbeat');
    const installationsImpl = {
        app,
        appConfig,
        heartbeatServiceProvider,
        _delete: () => Promise.resolve()
    };
    return installationsImpl;
};
const internalFactory = (container) => {
    const app = container.getProvider('app').getImmediate();
    // Internal FIS instance relies on public FIS instance.
    const installations = _getProvider(app, INSTALLATIONS_NAME).getImmediate();
    const installationsInternal = {
        getId: () => getId(installations),
        getToken: (forceRefresh) => getToken(installations, forceRefresh)
    };
    return installationsInternal;
};
function registerInstallations() {
    _registerComponent(new Component(INSTALLATIONS_NAME, publicFactory, "PUBLIC" /* ComponentType.PUBLIC */));
    _registerComponent(new Component(INSTALLATIONS_NAME_INTERNAL, internalFactory, "PRIVATE" /* ComponentType.PRIVATE */));
}

/**
 * Firebase Installations
 *
 * @packageDocumentation
 */
registerInstallations();
registerVersion(name$2, version$2);
// BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
registerVersion(name$2, version$2, 'esm2017');

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Type constant for Firebase Analytics.
 */
const ANALYTICS_TYPE = 'analytics';
// Key to attach FID to in gtag params.
const GA_FID_KEY = 'firebase_id';
const ORIGIN_KEY = 'origin';
const FETCH_TIMEOUT_MILLIS = 60 * 1000;
const DYNAMIC_CONFIG_URL = 'https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig';
const GTAG_URL = 'https://www.googletagmanager.com/gtag/js';

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const logger = new Logger('@firebase/analytics');

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ERRORS = {
    ["already-exists" /* AnalyticsError.ALREADY_EXISTS */]: 'A Firebase Analytics instance with the appId {$id} ' +
        ' already exists. ' +
        'Only one Firebase Analytics instance can be created for each appId.',
    ["already-initialized" /* AnalyticsError.ALREADY_INITIALIZED */]: 'initializeAnalytics() cannot be called again with different options than those ' +
        'it was initially called with. It can be called again with the same options to ' +
        'return the existing instance, or getAnalytics() can be used ' +
        'to get a reference to the already-intialized instance.',
    ["already-initialized-settings" /* AnalyticsError.ALREADY_INITIALIZED_SETTINGS */]: 'Firebase Analytics has already been initialized.' +
        'settings() must be called before initializing any Analytics instance' +
        'or it will have no effect.',
    ["interop-component-reg-failed" /* AnalyticsError.INTEROP_COMPONENT_REG_FAILED */]: 'Firebase Analytics Interop Component failed to instantiate: {$reason}',
    ["invalid-analytics-context" /* AnalyticsError.INVALID_ANALYTICS_CONTEXT */]: 'Firebase Analytics is not supported in this environment. ' +
        'Wrap initialization of analytics in analytics.isSupported() ' +
        'to prevent initialization in unsupported environments. Details: {$errorInfo}',
    ["indexeddb-unavailable" /* AnalyticsError.INDEXEDDB_UNAVAILABLE */]: 'IndexedDB unavailable or restricted in this environment. ' +
        'Wrap initialization of analytics in analytics.isSupported() ' +
        'to prevent initialization in unsupported environments. Details: {$errorInfo}',
    ["fetch-throttle" /* AnalyticsError.FETCH_THROTTLE */]: 'The config fetch request timed out while in an exponential backoff state.' +
        ' Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.',
    ["config-fetch-failed" /* AnalyticsError.CONFIG_FETCH_FAILED */]: 'Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}',
    ["no-api-key" /* AnalyticsError.NO_API_KEY */]: 'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field to' +
        'contain a valid API key.',
    ["no-app-id" /* AnalyticsError.NO_APP_ID */]: 'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field to' +
        'contain a valid app ID.',
    ["no-client-id" /* AnalyticsError.NO_CLIENT_ID */]: 'The "client_id" field is empty.',
    ["invalid-gtag-resource" /* AnalyticsError.INVALID_GTAG_RESOURCE */]: 'Trusted Types detected an invalid gtag resource: {$gtagURL}.'
};
const ERROR_FACTORY = new ErrorFactory('analytics', 'Analytics', ERRORS);

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Verifies and creates a TrustedScriptURL.
 */
function createGtagTrustedTypesScriptURL(url) {
    if (!url.startsWith(GTAG_URL)) {
        const err = ERROR_FACTORY.create("invalid-gtag-resource" /* AnalyticsError.INVALID_GTAG_RESOURCE */, {
            gtagURL: url
        });
        logger.warn(err.message);
        return '';
    }
    return url;
}
/**
 * Makeshift polyfill for Promise.allSettled(). Resolves when all promises
 * have either resolved or rejected.
 *
 * @param promises Array of promises to wait for.
 */
function promiseAllSettled(promises) {
    return Promise.all(promises.map(promise => promise.catch(e => e)));
}
/**
 * Creates a TrustedTypePolicy object that implements the rules passed as policyOptions.
 *
 * @param policyName A string containing the name of the policy
 * @param policyOptions Object containing implementations of instance methods for TrustedTypesPolicy, see {@link https://developer.mozilla.org/en-US/docs/Web/API/TrustedTypePolicy#instance_methods
 * | the TrustedTypePolicy reference documentation}.
 */
function createTrustedTypesPolicy(policyName, policyOptions) {
    // Create a TrustedTypes policy that we can use for updating src
    // properties
    let trustedTypesPolicy;
    if (window.trustedTypes) {
        trustedTypesPolicy = window.trustedTypes.createPolicy(policyName, policyOptions);
    }
    return trustedTypesPolicy;
}
/**
 * Inserts gtag script tag into the page to asynchronously download gtag.
 * @param dataLayerName Name of datalayer (most often the default, "_dataLayer").
 */
function insertScriptTag(dataLayerName, measurementId) {
    const trustedTypesPolicy = createTrustedTypesPolicy('firebase-js-sdk-policy', {
        createScriptURL: createGtagTrustedTypesScriptURL
    });
    const script = document.createElement('script');
    // We are not providing an analyticsId in the URL because it would trigger a `page_view`
    // without fid. We will initialize ga-id using gtag (config) command together with fid.
    const gtagScriptURL = `${GTAG_URL}?l=${dataLayerName}&id=${measurementId}`;
    script.src = trustedTypesPolicy
        ? trustedTypesPolicy === null || trustedTypesPolicy === void 0 ? void 0 : trustedTypesPolicy.createScriptURL(gtagScriptURL)
        : gtagScriptURL;
    script.async = true;
    document.head.appendChild(script);
}
/**
 * Get reference to, or create, global datalayer.
 * @param dataLayerName Name of datalayer (most often the default, "_dataLayer").
 */
function getOrCreateDataLayer(dataLayerName) {
    // Check for existing dataLayer and create if needed.
    let dataLayer = [];
    if (Array.isArray(window[dataLayerName])) {
        dataLayer = window[dataLayerName];
    }
    else {
        window[dataLayerName] = dataLayer;
    }
    return dataLayer;
}
/**
 * Wrapped gtag logic when gtag is called with 'config' command.
 *
 * @param gtagCore Basic gtag function that just appends to dataLayer.
 * @param initializationPromisesMap Map of appIds to their initialization promises.
 * @param dynamicConfigPromisesList Array of dynamic config fetch promises.
 * @param measurementIdToAppId Map of GA measurementIDs to corresponding Firebase appId.
 * @param measurementId GA Measurement ID to set config for.
 * @param gtagParams Gtag config params to set.
 */
async function gtagOnConfig(gtagCore, initializationPromisesMap, dynamicConfigPromisesList, measurementIdToAppId, measurementId, gtagParams) {
    // If config is already fetched, we know the appId and can use it to look up what FID promise we
    /// are waiting for, and wait only on that one.
    const correspondingAppId = measurementIdToAppId[measurementId];
    try {
        if (correspondingAppId) {
            await initializationPromisesMap[correspondingAppId];
        }
        else {
            // If config is not fetched yet, wait for all configs (we don't know which one we need) and
            // find the appId (if any) corresponding to this measurementId. If there is one, wait on
            // that appId's initialization promise. If there is none, promise resolves and gtag
            // call goes through.
            const dynamicConfigResults = await promiseAllSettled(dynamicConfigPromisesList);
            const foundConfig = dynamicConfigResults.find(config => config.measurementId === measurementId);
            if (foundConfig) {
                await initializationPromisesMap[foundConfig.appId];
            }
        }
    }
    catch (e) {
        logger.error(e);
    }
    gtagCore("config" /* GtagCommand.CONFIG */, measurementId, gtagParams);
}
/**
 * Wrapped gtag logic when gtag is called with 'event' command.
 *
 * @param gtagCore Basic gtag function that just appends to dataLayer.
 * @param initializationPromisesMap Map of appIds to their initialization promises.
 * @param dynamicConfigPromisesList Array of dynamic config fetch promises.
 * @param measurementId GA Measurement ID to log event to.
 * @param gtagParams Params to log with this event.
 */
async function gtagOnEvent(gtagCore, initializationPromisesMap, dynamicConfigPromisesList, measurementId, gtagParams) {
    try {
        let initializationPromisesToWaitFor = [];
        // If there's a 'send_to' param, check if any ID specified matches
        // an initializeIds() promise we are waiting for.
        if (gtagParams && gtagParams['send_to']) {
            let gaSendToList = gtagParams['send_to'];
            // Make it an array if is isn't, so it can be dealt with the same way.
            if (!Array.isArray(gaSendToList)) {
                gaSendToList = [gaSendToList];
            }
            // Checking 'send_to' fields requires having all measurement ID results back from
            // the dynamic config fetch.
            const dynamicConfigResults = await promiseAllSettled(dynamicConfigPromisesList);
            for (const sendToId of gaSendToList) {
                // Any fetched dynamic measurement ID that matches this 'send_to' ID
                const foundConfig = dynamicConfigResults.find(config => config.measurementId === sendToId);
                const initializationPromise = foundConfig && initializationPromisesMap[foundConfig.appId];
                if (initializationPromise) {
                    initializationPromisesToWaitFor.push(initializationPromise);
                }
                else {
                    // Found an item in 'send_to' that is not associated
                    // directly with an FID, possibly a group.  Empty this array,
                    // exit the loop early, and let it get populated below.
                    initializationPromisesToWaitFor = [];
                    break;
                }
            }
        }
        // This will be unpopulated if there was no 'send_to' field , or
        // if not all entries in the 'send_to' field could be mapped to
        // a FID. In these cases, wait on all pending initialization promises.
        if (initializationPromisesToWaitFor.length === 0) {
            initializationPromisesToWaitFor = Object.values(initializationPromisesMap);
        }
        // Run core gtag function with args after all relevant initialization
        // promises have been resolved.
        await Promise.all(initializationPromisesToWaitFor);
        // Workaround for http://b/141370449 - third argument cannot be undefined.
        gtagCore("event" /* GtagCommand.EVENT */, measurementId, gtagParams || {});
    }
    catch (e) {
        logger.error(e);
    }
}
/**
 * Wraps a standard gtag function with extra code to wait for completion of
 * relevant initialization promises before sending requests.
 *
 * @param gtagCore Basic gtag function that just appends to dataLayer.
 * @param initializationPromisesMap Map of appIds to their initialization promises.
 * @param dynamicConfigPromisesList Array of dynamic config fetch promises.
 * @param measurementIdToAppId Map of GA measurementIDs to corresponding Firebase appId.
 */
function wrapGtag(gtagCore, 
/**
 * Allows wrapped gtag calls to wait on whichever intialization promises are required,
 * depending on the contents of the gtag params' `send_to` field, if any.
 */
initializationPromisesMap, 
/**
 * Wrapped gtag calls sometimes require all dynamic config fetches to have returned
 * before determining what initialization promises (which include FIDs) to wait for.
 */
dynamicConfigPromisesList, 
/**
 * Wrapped gtag config calls can narrow down which initialization promise (with FID)
 * to wait for if the measurementId is already fetched, by getting the corresponding appId,
 * which is the key for the initialization promises map.
 */
measurementIdToAppId) {
    /**
     * Wrapper around gtag that ensures FID is sent with gtag calls.
     * @param command Gtag command type.
     * @param idOrNameOrParams Measurement ID if command is EVENT/CONFIG, params if command is SET.
     * @param gtagParams Params if event is EVENT/CONFIG.
     */
    async function gtagWrapper(command, ...args) {
        try {
            // If event, check that relevant initialization promises have completed.
            if (command === "event" /* GtagCommand.EVENT */) {
                const [measurementId, gtagParams] = args;
                // If EVENT, second arg must be measurementId.
                await gtagOnEvent(gtagCore, initializationPromisesMap, dynamicConfigPromisesList, measurementId, gtagParams);
            }
            else if (command === "config" /* GtagCommand.CONFIG */) {
                const [measurementId, gtagParams] = args;
                // If CONFIG, second arg must be measurementId.
                await gtagOnConfig(gtagCore, initializationPromisesMap, dynamicConfigPromisesList, measurementIdToAppId, measurementId, gtagParams);
            }
            else if (command === "consent" /* GtagCommand.CONSENT */) {
                const [gtagParams] = args;
                gtagCore("consent" /* GtagCommand.CONSENT */, 'update', gtagParams);
            }
            else if (command === "get" /* GtagCommand.GET */) {
                const [measurementId, fieldName, callback] = args;
                gtagCore("get" /* GtagCommand.GET */, measurementId, fieldName, callback);
            }
            else if (command === "set" /* GtagCommand.SET */) {
                const [customParams] = args;
                // If SET, second arg must be params.
                gtagCore("set" /* GtagCommand.SET */, customParams);
            }
            else {
                gtagCore(command, ...args);
            }
        }
        catch (e) {
            logger.error(e);
        }
    }
    return gtagWrapper;
}
/**
 * Creates global gtag function or wraps existing one if found.
 * This wrapped function attaches Firebase instance ID (FID) to gtag 'config' and
 * 'event' calls that belong to the GAID associated with this Firebase instance.
 *
 * @param initializationPromisesMap Map of appIds to their initialization promises.
 * @param dynamicConfigPromisesList Array of dynamic config fetch promises.
 * @param measurementIdToAppId Map of GA measurementIDs to corresponding Firebase appId.
 * @param dataLayerName Name of global GA datalayer array.
 * @param gtagFunctionName Name of global gtag function ("gtag" if not user-specified).
 */
function wrapOrCreateGtag(initializationPromisesMap, dynamicConfigPromisesList, measurementIdToAppId, dataLayerName, gtagFunctionName) {
    // Create a basic core gtag function
    let gtagCore = function (..._args) {
        // Must push IArguments object, not an array.
        window[dataLayerName].push(arguments);
    };
    // Replace it with existing one if found
    if (window[gtagFunctionName] &&
        typeof window[gtagFunctionName] === 'function') {
        // @ts-ignore
        gtagCore = window[gtagFunctionName];
    }
    window[gtagFunctionName] = wrapGtag(gtagCore, initializationPromisesMap, dynamicConfigPromisesList, measurementIdToAppId);
    return {
        gtagCore,
        wrappedGtag: window[gtagFunctionName]
    };
}
/**
 * Returns the script tag in the DOM matching both the gtag url pattern
 * and the provided data layer name.
 */
function findGtagScriptOnPage(dataLayerName) {
    const scriptTags = window.document.getElementsByTagName('script');
    for (const tag of Object.values(scriptTags)) {
        if (tag.src &&
            tag.src.includes(GTAG_URL) &&
            tag.src.includes(dataLayerName)) {
            return tag;
        }
    }
    return null;
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Backoff factor for 503 errors, which we want to be conservative about
 * to avoid overloading servers. Each retry interval will be
 * BASE_INTERVAL_MILLIS * LONG_RETRY_FACTOR ^ retryCount, so the second one
 * will be ~30 seconds (with fuzzing).
 */
const LONG_RETRY_FACTOR = 30;
/**
 * Base wait interval to multiplied by backoffFactor^backoffCount.
 */
const BASE_INTERVAL_MILLIS = 1000;
/**
 * Stubbable retry data storage class.
 */
class RetryData {
    constructor(throttleMetadata = {}, intervalMillis = BASE_INTERVAL_MILLIS) {
        this.throttleMetadata = throttleMetadata;
        this.intervalMillis = intervalMillis;
    }
    getThrottleMetadata(appId) {
        return this.throttleMetadata[appId];
    }
    setThrottleMetadata(appId, metadata) {
        this.throttleMetadata[appId] = metadata;
    }
    deleteThrottleMetadata(appId) {
        delete this.throttleMetadata[appId];
    }
}
const defaultRetryData = new RetryData();
/**
 * Set GET request headers.
 * @param apiKey App API key.
 */
function getHeaders(apiKey) {
    return new Headers({
        Accept: 'application/json',
        'x-goog-api-key': apiKey
    });
}
/**
 * Fetches dynamic config from backend.
 * @param app Firebase app to fetch config for.
 */
async function fetchDynamicConfig(appFields) {
    var _a;
    const { appId, apiKey } = appFields;
    const request = {
        method: 'GET',
        headers: getHeaders(apiKey)
    };
    const appUrl = DYNAMIC_CONFIG_URL.replace('{app-id}', appId);
    const response = await fetch(appUrl, request);
    if (response.status !== 200 && response.status !== 304) {
        let errorMessage = '';
        try {
            // Try to get any error message text from server response.
            const jsonResponse = (await response.json());
            if ((_a = jsonResponse.error) === null || _a === void 0 ? void 0 : _a.message) {
                errorMessage = jsonResponse.error.message;
            }
        }
        catch (_ignored) { }
        throw ERROR_FACTORY.create("config-fetch-failed" /* AnalyticsError.CONFIG_FETCH_FAILED */, {
            httpStatus: response.status,
            responseMessage: errorMessage
        });
    }
    return response.json();
}
/**
 * Fetches dynamic config from backend, retrying if failed.
 * @param app Firebase app to fetch config for.
 */
async function fetchDynamicConfigWithRetry(app, 
// retryData and timeoutMillis are parameterized to allow passing a different value for testing.
retryData = defaultRetryData, timeoutMillis) {
    const { appId, apiKey, measurementId } = app.options;
    if (!appId) {
        throw ERROR_FACTORY.create("no-app-id" /* AnalyticsError.NO_APP_ID */);
    }
    if (!apiKey) {
        if (measurementId) {
            return {
                measurementId,
                appId
            };
        }
        throw ERROR_FACTORY.create("no-api-key" /* AnalyticsError.NO_API_KEY */);
    }
    const throttleMetadata = retryData.getThrottleMetadata(appId) || {
        backoffCount: 0,
        throttleEndTimeMillis: Date.now()
    };
    const signal = new AnalyticsAbortSignal();
    setTimeout(async () => {
        // Note a very low delay, eg < 10ms, can elapse before listeners are initialized.
        signal.abort();
    }, timeoutMillis !== undefined ? timeoutMillis : FETCH_TIMEOUT_MILLIS);
    return attemptFetchDynamicConfigWithRetry({ appId, apiKey, measurementId }, throttleMetadata, signal, retryData);
}
/**
 * Runs one retry attempt.
 * @param appFields Necessary app config fields.
 * @param throttleMetadata Ongoing metadata to determine throttling times.
 * @param signal Abort signal.
 */
async function attemptFetchDynamicConfigWithRetry(appFields, { throttleEndTimeMillis, backoffCount }, signal, retryData = defaultRetryData // for testing
) {
    var _a;
    const { appId, measurementId } = appFields;
    // Starts with a (potentially zero) timeout to support resumption from stored state.
    // Ensures the throttle end time is honored if the last attempt timed out.
    // Note the SDK will never make a request if the fetch timeout expires at this point.
    try {
        await setAbortableTimeout(signal, throttleEndTimeMillis);
    }
    catch (e) {
        if (measurementId) {
            logger.warn(`Timed out fetching this Firebase app's measurement ID from the server.` +
                ` Falling back to the measurement ID ${measurementId}` +
                ` provided in the "measurementId" field in the local Firebase config. [${e === null || e === void 0 ? void 0 : e.message}]`);
            return { appId, measurementId };
        }
        throw e;
    }
    try {
        const response = await fetchDynamicConfig(appFields);
        // Note the SDK only clears throttle state if response is success or non-retriable.
        retryData.deleteThrottleMetadata(appId);
        return response;
    }
    catch (e) {
        const error = e;
        if (!isRetriableError(error)) {
            retryData.deleteThrottleMetadata(appId);
            if (measurementId) {
                logger.warn(`Failed to fetch this Firebase app's measurement ID from the server.` +
                    ` Falling back to the measurement ID ${measurementId}` +
                    ` provided in the "measurementId" field in the local Firebase config. [${error === null || error === void 0 ? void 0 : error.message}]`);
                return { appId, measurementId };
            }
            else {
                throw e;
            }
        }
        const backoffMillis = Number((_a = error === null || error === void 0 ? void 0 : error.customData) === null || _a === void 0 ? void 0 : _a.httpStatus) === 503
            ? calculateBackoffMillis(backoffCount, retryData.intervalMillis, LONG_RETRY_FACTOR)
            : calculateBackoffMillis(backoffCount, retryData.intervalMillis);
        // Increments backoff state.
        const throttleMetadata = {
            throttleEndTimeMillis: Date.now() + backoffMillis,
            backoffCount: backoffCount + 1
        };
        // Persists state.
        retryData.setThrottleMetadata(appId, throttleMetadata);
        logger.debug(`Calling attemptFetch again in ${backoffMillis} millis`);
        return attemptFetchDynamicConfigWithRetry(appFields, throttleMetadata, signal, retryData);
    }
}
/**
 * Supports waiting on a backoff by:
 *
 * <ul>
 *   <li>Promisifying setTimeout, so we can set a timeout in our Promise chain</li>
 *   <li>Listening on a signal bus for abort events, just like the Fetch API</li>
 *   <li>Failing in the same way the Fetch API fails, so timing out a live request and a throttled
 *       request appear the same.</li>
 * </ul>
 *
 * <p>Visible for testing.
 */
function setAbortableTimeout(signal, throttleEndTimeMillis) {
    return new Promise((resolve, reject) => {
        // Derives backoff from given end time, normalizing negative numbers to zero.
        const backoffMillis = Math.max(throttleEndTimeMillis - Date.now(), 0);
        const timeout = setTimeout(resolve, backoffMillis);
        // Adds listener, rather than sets onabort, because signal is a shared object.
        signal.addEventListener(() => {
            clearTimeout(timeout);
            // If the request completes before this timeout, the rejection has no effect.
            reject(ERROR_FACTORY.create("fetch-throttle" /* AnalyticsError.FETCH_THROTTLE */, {
                throttleEndTimeMillis
            }));
        });
    });
}
/**
 * Returns true if the {@link Error} indicates a fetch request may succeed later.
 */
function isRetriableError(e) {
    if (!(e instanceof FirebaseError) || !e.customData) {
        return false;
    }
    // Uses string index defined by ErrorData, which FirebaseError implements.
    const httpStatus = Number(e.customData['httpStatus']);
    return (httpStatus === 429 ||
        httpStatus === 500 ||
        httpStatus === 503 ||
        httpStatus === 504);
}
/**
 * Shims a minimal AbortSignal (copied from Remote Config).
 *
 * <p>AbortController's AbortSignal conveniently decouples fetch timeout logic from other aspects
 * of networking, such as retries. Firebase doesn't use AbortController enough to justify a
 * polyfill recommendation, like we do with the Fetch API, but this minimal shim can easily be
 * swapped out if/when we do.
 */
class AnalyticsAbortSignal {
    constructor() {
        this.listeners = [];
    }
    addEventListener(listener) {
        this.listeners.push(listener);
    }
    abort() {
        this.listeners.forEach(listener => listener());
    }
}
/**
 * Logs an analytics event through the Firebase SDK.
 *
 * @param gtagFunction Wrapped gtag function that waits for fid to be set before sending an event
 * @param eventName Google Analytics event name, choose from standard list or use a custom string.
 * @param eventParams Analytics event parameters.
 */
async function logEvent$1(gtagFunction, initializationPromise, eventName, eventParams, options) {
    if (options && options.global) {
        gtagFunction("event" /* GtagCommand.EVENT */, eventName, eventParams);
        return;
    }
    else {
        const measurementId = await initializationPromise;
        const params = Object.assign(Object.assign({}, eventParams), { 'send_to': measurementId });
        gtagFunction("event" /* GtagCommand.EVENT */, eventName, params);
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function validateIndexedDB() {
    if (!isIndexedDBAvailable()) {
        logger.warn(ERROR_FACTORY.create("indexeddb-unavailable" /* AnalyticsError.INDEXEDDB_UNAVAILABLE */, {
            errorInfo: 'IndexedDB is not available in this environment.'
        }).message);
        return false;
    }
    else {
        try {
            await validateIndexedDBOpenable();
        }
        catch (e) {
            logger.warn(ERROR_FACTORY.create("indexeddb-unavailable" /* AnalyticsError.INDEXEDDB_UNAVAILABLE */, {
                errorInfo: e === null || e === void 0 ? void 0 : e.toString()
            }).message);
            return false;
        }
    }
    return true;
}
/**
 * Initialize the analytics instance in gtag.js by calling config command with fid.
 *
 * NOTE: We combine analytics initialization and setting fid together because we want fid to be
 * part of the `page_view` event that's sent during the initialization
 * @param app Firebase app
 * @param gtagCore The gtag function that's not wrapped.
 * @param dynamicConfigPromisesList Array of all dynamic config promises.
 * @param measurementIdToAppId Maps measurementID to appID.
 * @param installations _FirebaseInstallationsInternal instance.
 *
 * @returns Measurement ID.
 */
async function _initializeAnalytics(app, dynamicConfigPromisesList, measurementIdToAppId, installations, gtagCore, dataLayerName, options) {
    var _a;
    const dynamicConfigPromise = fetchDynamicConfigWithRetry(app);
    // Once fetched, map measurementIds to appId, for ease of lookup in wrapped gtag function.
    dynamicConfigPromise
        .then(config => {
        measurementIdToAppId[config.measurementId] = config.appId;
        if (app.options.measurementId &&
            config.measurementId !== app.options.measurementId) {
            logger.warn(`The measurement ID in the local Firebase config (${app.options.measurementId})` +
                ` does not match the measurement ID fetched from the server (${config.measurementId}).` +
                ` To ensure analytics events are always sent to the correct Analytics property,` +
                ` update the` +
                ` measurement ID field in the local config or remove it from the local config.`);
        }
    })
        .catch(e => logger.error(e));
    // Add to list to track state of all dynamic config promises.
    dynamicConfigPromisesList.push(dynamicConfigPromise);
    const fidPromise = validateIndexedDB().then(envIsValid => {
        if (envIsValid) {
            return installations.getId();
        }
        else {
            return undefined;
        }
    });
    const [dynamicConfig, fid] = await Promise.all([
        dynamicConfigPromise,
        fidPromise
    ]);
    // Detect if user has already put the gtag <script> tag on this page with the passed in
    // data layer name.
    if (!findGtagScriptOnPage(dataLayerName)) {
        insertScriptTag(dataLayerName, dynamicConfig.measurementId);
    }
    // This command initializes gtag.js and only needs to be called once for the entire web app,
    // but since it is idempotent, we can call it multiple times.
    // We keep it together with other initialization logic for better code structure.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtagCore('js', new Date());
    // User config added first. We don't want users to accidentally overwrite
    // base Firebase config properties.
    const configProperties = (_a = options === null || options === void 0 ? void 0 : options.config) !== null && _a !== void 0 ? _a : {};
    // guard against developers accidentally setting properties with prefix `firebase_`
    configProperties[ORIGIN_KEY] = 'firebase';
    configProperties.update = true;
    if (fid != null) {
        configProperties[GA_FID_KEY] = fid;
    }
    // It should be the first config command called on this GA-ID
    // Initialize this GA-ID and set FID on it using the gtag config API.
    // Note: This will trigger a page_view event unless 'send_page_view' is set to false in
    // `configProperties`.
    gtagCore("config" /* GtagCommand.CONFIG */, dynamicConfig.measurementId, configProperties);
    return dynamicConfig.measurementId;
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Analytics Service class.
 */
class AnalyticsService {
    constructor(app) {
        this.app = app;
    }
    _delete() {
        delete initializationPromisesMap[this.app.options.appId];
        return Promise.resolve();
    }
}
/**
 * Maps appId to full initialization promise. Wrapped gtag calls must wait on
 * all or some of these, depending on the call's `send_to` param and the status
 * of the dynamic config fetches (see below).
 */
let initializationPromisesMap = {};
/**
 * List of dynamic config fetch promises. In certain cases, wrapped gtag calls
 * wait on all these to be complete in order to determine if it can selectively
 * wait for only certain initialization (FID) promises or if it must wait for all.
 */
let dynamicConfigPromisesList = [];
/**
 * Maps fetched measurementIds to appId. Populated when the app's dynamic config
 * fetch completes. If already populated, gtag config calls can use this to
 * selectively wait for only this app's initialization promise (FID) instead of all
 * initialization promises.
 */
const measurementIdToAppId = {};
/**
 * Name for window global data layer array used by GA: defaults to 'dataLayer'.
 */
let dataLayerName = 'dataLayer';
/**
 * Name for window global gtag function used by GA: defaults to 'gtag'.
 */
let gtagName = 'gtag';
/**
 * Reproduction of standard gtag function or reference to existing
 * gtag function on window object.
 */
let gtagCoreFunction;
/**
 * Wrapper around gtag function that ensures FID is sent with all
 * relevant event and config calls.
 */
let wrappedGtagFunction;
/**
 * Flag to ensure page initialization steps (creation or wrapping of
 * dataLayer and gtag script) are only run once per page load.
 */
let globalInitDone = false;
/**
 * Returns true if no environment mismatch is found.
 * If environment mismatches are found, throws an INVALID_ANALYTICS_CONTEXT
 * error that also lists details for each mismatch found.
 */
function warnOnBrowserContextMismatch() {
    const mismatchedEnvMessages = [];
    if (isBrowserExtension()) {
        mismatchedEnvMessages.push('This is a browser extension environment.');
    }
    if (!areCookiesEnabled()) {
        mismatchedEnvMessages.push('Cookies are not available.');
    }
    if (mismatchedEnvMessages.length > 0) {
        const details = mismatchedEnvMessages
            .map((message, index) => `(${index + 1}) ${message}`)
            .join(' ');
        const err = ERROR_FACTORY.create("invalid-analytics-context" /* AnalyticsError.INVALID_ANALYTICS_CONTEXT */, {
            errorInfo: details
        });
        logger.warn(err.message);
    }
}
/**
 * Analytics instance factory.
 * @internal
 */
function factory(app, installations, options) {
    warnOnBrowserContextMismatch();
    const appId = app.options.appId;
    if (!appId) {
        throw ERROR_FACTORY.create("no-app-id" /* AnalyticsError.NO_APP_ID */);
    }
    if (!app.options.apiKey) {
        if (app.options.measurementId) {
            logger.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest` +
                ` measurement ID for this Firebase app. Falling back to the measurement ID ${app.options.measurementId}` +
                ` provided in the "measurementId" field in the local Firebase config.`);
        }
        else {
            throw ERROR_FACTORY.create("no-api-key" /* AnalyticsError.NO_API_KEY */);
        }
    }
    if (initializationPromisesMap[appId] != null) {
        throw ERROR_FACTORY.create("already-exists" /* AnalyticsError.ALREADY_EXISTS */, {
            id: appId
        });
    }
    if (!globalInitDone) {
        // Steps here should only be done once per page: creation or wrapping
        // of dataLayer and global gtag function.
        getOrCreateDataLayer(dataLayerName);
        const { wrappedGtag, gtagCore } = wrapOrCreateGtag(initializationPromisesMap, dynamicConfigPromisesList, measurementIdToAppId, dataLayerName, gtagName);
        wrappedGtagFunction = wrappedGtag;
        gtagCoreFunction = gtagCore;
        globalInitDone = true;
    }
    // Async but non-blocking.
    // This map reflects the completion state of all promises for each appId.
    initializationPromisesMap[appId] = _initializeAnalytics(app, dynamicConfigPromisesList, measurementIdToAppId, installations, gtagCoreFunction, dataLayerName, options);
    const analyticsInstance = new AnalyticsService(app);
    return analyticsInstance;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Returns an {@link Analytics} instance for the given app.
 *
 * @public
 *
 * @param app - The {@link @firebase/app#FirebaseApp} to use.
 */
function getAnalytics(app = getApp()) {
    app = getModularInstance(app);
    // Dependencies
    const analyticsProvider = _getProvider(app, ANALYTICS_TYPE);
    if (analyticsProvider.isInitialized()) {
        return analyticsProvider.getImmediate();
    }
    return initializeAnalytics(app);
}
/**
 * Returns an {@link Analytics} instance for the given app.
 *
 * @public
 *
 * @param app - The {@link @firebase/app#FirebaseApp} to use.
 */
function initializeAnalytics(app, options = {}) {
    // Dependencies
    const analyticsProvider = _getProvider(app, ANALYTICS_TYPE);
    if (analyticsProvider.isInitialized()) {
        const existingInstance = analyticsProvider.getImmediate();
        if (deepEqual(options, analyticsProvider.getOptions())) {
            return existingInstance;
        }
        else {
            throw ERROR_FACTORY.create("already-initialized" /* AnalyticsError.ALREADY_INITIALIZED */);
        }
    }
    const analyticsInstance = analyticsProvider.initialize({ options });
    return analyticsInstance;
}
/**
 * Sends a Google Analytics event with given `eventParams`. This method
 * automatically associates this logged event with this Firebase web
 * app instance on this device.
 * List of official event parameters can be found in the gtag.js
 * reference documentation:
 * {@link https://developers.google.com/gtagjs/reference/ga4-events
 * | the GA4 reference documentation}.
 *
 * @public
 */
function logEvent(analyticsInstance, eventName, eventParams, options) {
    analyticsInstance = getModularInstance(analyticsInstance);
    logEvent$1(wrappedGtagFunction, initializationPromisesMap[analyticsInstance.app.options.appId], eventName, eventParams, options).catch(e => logger.error(e));
}

const name$1 = "@firebase/analytics";
const version$1 = "0.10.0";

/**
 * Firebase Analytics
 *
 * @packageDocumentation
 */
function registerAnalytics() {
    _registerComponent(new Component(ANALYTICS_TYPE, (container, { options: analyticsOptions }) => {
        // getImmediate for FirebaseApp will always succeed
        const app = container.getProvider('app').getImmediate();
        const installations = container
            .getProvider('installations-internal')
            .getImmediate();
        return factory(app, installations, analyticsOptions);
    }, "PUBLIC" /* ComponentType.PUBLIC */));
    _registerComponent(new Component('analytics-internal', internalFactory, "PRIVATE" /* ComponentType.PRIVATE */));
    registerVersion(name$1, version$1);
    // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
    registerVersion(name$1, version$1, 'esm2017');
    function internalFactory(container) {
        try {
            const analytics = container.getProvider(ANALYTICS_TYPE).getImmediate();
            return {
                logEvent: (eventName, eventParams, options) => logEvent(analytics, eventName, eventParams, options)
            };
        }
        catch (e) {
            throw ERROR_FACTORY.create("interop-component-reg-failed" /* AnalyticsError.INTEROP_COMPONENT_REG_FAILED */, {
                reason: e
            });
        }
    }
}
registerAnalytics();

const firebaseConfig = {
    apiKey: "AIzaSyBjlBi8FCJF2CHKQcOx7OrN9J3PFM7_iyg",
    authDomain: "mi-tango-365.firebaseapp.com",
    databaseURL: "https://mi-tango-365-default-rtdb.firebaseio.com",
    projectId: "mi-tango-365",
    storageBucket: "mi-tango-365.appspot.com",
    messagingSenderId: "956666689230",
    appId: "1:956666689230:web:91786a791bbf7468ee829f",
    measurementId: "G-JC6NCDNBX7"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
getAnalytics(firebaseApp);

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
      }
  return t;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function _prodErrorMap() {
    // We will include this one message in the prod error map since by the very
    // nature of this error, developers will never be able to see the message
    // using the debugErrorMap (which is installed during auth initialization).
    return {
        ["dependent-sdk-initialized-before-auth" /* AuthErrorCode.DEPENDENT_SDK_INIT_BEFORE_AUTH */]: 'Another Firebase SDK was initialized and is trying to use Auth before Auth is ' +
            'initialized. Please be sure to call `initializeAuth` or `getAuth` before ' +
            'starting any other Firebase SDK.'
    };
}
/**
 * A minimal error map with all verbose error messages stripped.
 *
 * See discussion at {@link AuthErrorMap}
 *
 * @public
 */
const prodErrorMap = _prodErrorMap;
const _DEFAULT_AUTH_ERROR_FACTORY = new ErrorFactory('auth', 'Firebase', _prodErrorMap());

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const logClient = new Logger('@firebase/auth');
function _logWarn(msg, ...args) {
    if (logClient.logLevel <= LogLevel.WARN) {
        logClient.warn(`Auth (${SDK_VERSION}): ${msg}`, ...args);
    }
}
function _logError(msg, ...args) {
    if (logClient.logLevel <= LogLevel.ERROR) {
        logClient.error(`Auth (${SDK_VERSION}): ${msg}`, ...args);
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _fail(authOrCode, ...rest) {
    throw createErrorInternal(authOrCode, ...rest);
}
function _createError(authOrCode, ...rest) {
    return createErrorInternal(authOrCode, ...rest);
}
function _errorWithCustomMessage(auth, code, message) {
    const errorMap = Object.assign(Object.assign({}, prodErrorMap()), { [code]: message });
    const factory = new ErrorFactory('auth', 'Firebase', errorMap);
    return factory.create(code, {
        appName: auth.name
    });
}
function createErrorInternal(authOrCode, ...rest) {
    if (typeof authOrCode !== 'string') {
        const code = rest[0];
        const fullParams = [...rest.slice(1)];
        if (fullParams[0]) {
            fullParams[0].appName = authOrCode.name;
        }
        return authOrCode._errorFactory.create(code, ...fullParams);
    }
    return _DEFAULT_AUTH_ERROR_FACTORY.create(authOrCode, ...rest);
}
function _assert(assertion, authOrCode, ...rest) {
    if (!assertion) {
        throw createErrorInternal(authOrCode, ...rest);
    }
}
/**
 * Unconditionally fails, throwing an internal error with the given message.
 *
 * @param failure type of failure encountered
 * @throws Error
 */
function debugFail(failure) {
    // Log the failure in addition to throw an exception, just in case the
    // exception is swallowed.
    const message = `INTERNAL ASSERTION FAILED: ` + failure;
    _logError(message);
    // NOTE: We don't use FirebaseError here because these are internal failures
    // that cannot be handled by the user. (Also it would create a circular
    // dependency between the error and assert modules which doesn't work.)
    throw new Error(message);
}
/**
 * Fails if the given assertion condition is false, throwing an Error with the
 * given message if it did.
 *
 * @param assertion
 * @param message
 */
function debugAssert(assertion, message) {
    if (!assertion) {
        debugFail(message);
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _getCurrentUrl() {
    var _a;
    return (typeof self !== 'undefined' && ((_a = self.location) === null || _a === void 0 ? void 0 : _a.href)) || '';
}
function _isHttpOrHttps() {
    return _getCurrentScheme() === 'http:' || _getCurrentScheme() === 'https:';
}
function _getCurrentScheme() {
    var _a;
    return (typeof self !== 'undefined' && ((_a = self.location) === null || _a === void 0 ? void 0 : _a.protocol)) || null;
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Determine whether the browser is working online
 */
function _isOnline() {
    if (typeof navigator !== 'undefined' &&
        navigator &&
        'onLine' in navigator &&
        typeof navigator.onLine === 'boolean' &&
        // Apply only for traditional web apps and Chrome extensions.
        // This is especially true for Cordova apps which have unreliable
        // navigator.onLine behavior unless cordova-plugin-network-information is
        // installed which overwrites the native navigator.onLine value and
        // defines navigator.connection.
        (_isHttpOrHttps() || isBrowserExtension() || 'connection' in navigator)) {
        return navigator.onLine;
    }
    // If we can't determine the state, assume it is online.
    return true;
}
function _getUserLanguage() {
    if (typeof navigator === 'undefined') {
        return null;
    }
    const navigatorLanguage = navigator;
    return (
    // Most reliable, but only supported in Chrome/Firefox.
    (navigatorLanguage.languages && navigatorLanguage.languages[0]) ||
        // Supported in most browsers, but returns the language of the browser
        // UI, not the language set in browser settings.
        navigatorLanguage.language ||
        // Couldn't determine language.
        null);
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A structure to help pick between a range of long and short delay durations
 * depending on the current environment. In general, the long delay is used for
 * mobile environments whereas short delays are used for desktop environments.
 */
class Delay {
    constructor(shortDelay, longDelay) {
        this.shortDelay = shortDelay;
        this.longDelay = longDelay;
        // Internal error when improperly initialized.
        debugAssert(longDelay > shortDelay, 'Short delay should be less than long delay!');
        this.isMobile = isMobileCordova() || isReactNative();
    }
    get() {
        if (!_isOnline()) {
            // Pick the shorter timeout.
            return Math.min(5000 /* DelayMin.OFFLINE */, this.shortDelay);
        }
        // If running in a mobile environment, return the long delay, otherwise
        // return the short delay.
        // This could be improved in the future to dynamically change based on other
        // variables instead of just reading the current environment.
        return this.isMobile ? this.longDelay : this.shortDelay;
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _emulatorUrl(config, path) {
    debugAssert(config.emulator, 'Emulator should always be set here');
    const { url } = config.emulator;
    if (!path) {
        return url;
    }
    return `${url}${path.startsWith('/') ? path.slice(1) : path}`;
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class FetchProvider {
    static initialize(fetchImpl, headersImpl, responseImpl) {
        this.fetchImpl = fetchImpl;
        if (headersImpl) {
            this.headersImpl = headersImpl;
        }
        if (responseImpl) {
            this.responseImpl = responseImpl;
        }
    }
    static fetch() {
        if (this.fetchImpl) {
            return this.fetchImpl;
        }
        if (typeof self !== 'undefined' && 'fetch' in self) {
            return self.fetch;
        }
        if (typeof globalThis !== 'undefined' && globalThis.fetch) {
            return globalThis.fetch;
        }
        if (typeof fetch !== 'undefined') {
            return fetch;
        }
        debugFail('Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill');
    }
    static headers() {
        if (this.headersImpl) {
            return this.headersImpl;
        }
        if (typeof self !== 'undefined' && 'Headers' in self) {
            return self.Headers;
        }
        if (typeof globalThis !== 'undefined' && globalThis.Headers) {
            return globalThis.Headers;
        }
        if (typeof Headers !== 'undefined') {
            return Headers;
        }
        debugFail('Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill');
    }
    static response() {
        if (this.responseImpl) {
            return this.responseImpl;
        }
        if (typeof self !== 'undefined' && 'Response' in self) {
            return self.Response;
        }
        if (typeof globalThis !== 'undefined' && globalThis.Response) {
            return globalThis.Response;
        }
        if (typeof Response !== 'undefined') {
            return Response;
        }
        debugFail('Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill');
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Map from errors returned by the server to errors to developer visible errors
 */
const SERVER_ERROR_MAP = {
    // Custom token errors.
    ["CREDENTIAL_MISMATCH" /* ServerError.CREDENTIAL_MISMATCH */]: "custom-token-mismatch" /* AuthErrorCode.CREDENTIAL_MISMATCH */,
    // This can only happen if the SDK sends a bad request.
    ["MISSING_CUSTOM_TOKEN" /* ServerError.MISSING_CUSTOM_TOKEN */]: "internal-error" /* AuthErrorCode.INTERNAL_ERROR */,
    // Create Auth URI errors.
    ["INVALID_IDENTIFIER" /* ServerError.INVALID_IDENTIFIER */]: "invalid-email" /* AuthErrorCode.INVALID_EMAIL */,
    // This can only happen if the SDK sends a bad request.
    ["MISSING_CONTINUE_URI" /* ServerError.MISSING_CONTINUE_URI */]: "internal-error" /* AuthErrorCode.INTERNAL_ERROR */,
    // Sign in with email and password errors (some apply to sign up too).
    ["INVALID_PASSWORD" /* ServerError.INVALID_PASSWORD */]: "wrong-password" /* AuthErrorCode.INVALID_PASSWORD */,
    // This can only happen if the SDK sends a bad request.
    ["MISSING_PASSWORD" /* ServerError.MISSING_PASSWORD */]: "missing-password" /* AuthErrorCode.MISSING_PASSWORD */,
    // Thrown if Email Enumeration Protection is enabled in the project and the email or password is
    // invalid.
    ["INVALID_LOGIN_CREDENTIALS" /* ServerError.INVALID_LOGIN_CREDENTIALS */]: "invalid-credential" /* AuthErrorCode.INVALID_CREDENTIAL */,
    // Sign up with email and password errors.
    ["EMAIL_EXISTS" /* ServerError.EMAIL_EXISTS */]: "email-already-in-use" /* AuthErrorCode.EMAIL_EXISTS */,
    ["PASSWORD_LOGIN_DISABLED" /* ServerError.PASSWORD_LOGIN_DISABLED */]: "operation-not-allowed" /* AuthErrorCode.OPERATION_NOT_ALLOWED */,
    // Verify assertion for sign in with credential errors:
    ["INVALID_IDP_RESPONSE" /* ServerError.INVALID_IDP_RESPONSE */]: "invalid-credential" /* AuthErrorCode.INVALID_CREDENTIAL */,
    ["INVALID_PENDING_TOKEN" /* ServerError.INVALID_PENDING_TOKEN */]: "invalid-credential" /* AuthErrorCode.INVALID_CREDENTIAL */,
    ["FEDERATED_USER_ID_ALREADY_LINKED" /* ServerError.FEDERATED_USER_ID_ALREADY_LINKED */]: "credential-already-in-use" /* AuthErrorCode.CREDENTIAL_ALREADY_IN_USE */,
    // This can only happen if the SDK sends a bad request.
    ["MISSING_REQ_TYPE" /* ServerError.MISSING_REQ_TYPE */]: "internal-error" /* AuthErrorCode.INTERNAL_ERROR */,
    // Send Password reset email errors:
    ["EMAIL_NOT_FOUND" /* ServerError.EMAIL_NOT_FOUND */]: "user-not-found" /* AuthErrorCode.USER_DELETED */,
    ["RESET_PASSWORD_EXCEED_LIMIT" /* ServerError.RESET_PASSWORD_EXCEED_LIMIT */]: "too-many-requests" /* AuthErrorCode.TOO_MANY_ATTEMPTS_TRY_LATER */,
    ["EXPIRED_OOB_CODE" /* ServerError.EXPIRED_OOB_CODE */]: "expired-action-code" /* AuthErrorCode.EXPIRED_OOB_CODE */,
    ["INVALID_OOB_CODE" /* ServerError.INVALID_OOB_CODE */]: "invalid-action-code" /* AuthErrorCode.INVALID_OOB_CODE */,
    // This can only happen if the SDK sends a bad request.
    ["MISSING_OOB_CODE" /* ServerError.MISSING_OOB_CODE */]: "internal-error" /* AuthErrorCode.INTERNAL_ERROR */,
    // Operations that require ID token in request:
    ["CREDENTIAL_TOO_OLD_LOGIN_AGAIN" /* ServerError.CREDENTIAL_TOO_OLD_LOGIN_AGAIN */]: "requires-recent-login" /* AuthErrorCode.CREDENTIAL_TOO_OLD_LOGIN_AGAIN */,
    ["INVALID_ID_TOKEN" /* ServerError.INVALID_ID_TOKEN */]: "invalid-user-token" /* AuthErrorCode.INVALID_AUTH */,
    ["TOKEN_EXPIRED" /* ServerError.TOKEN_EXPIRED */]: "user-token-expired" /* AuthErrorCode.TOKEN_EXPIRED */,
    ["USER_NOT_FOUND" /* ServerError.USER_NOT_FOUND */]: "user-token-expired" /* AuthErrorCode.TOKEN_EXPIRED */,
    // Other errors.
    ["TOO_MANY_ATTEMPTS_TRY_LATER" /* ServerError.TOO_MANY_ATTEMPTS_TRY_LATER */]: "too-many-requests" /* AuthErrorCode.TOO_MANY_ATTEMPTS_TRY_LATER */,
    ["PASSWORD_DOES_NOT_MEET_REQUIREMENTS" /* ServerError.PASSWORD_DOES_NOT_MEET_REQUIREMENTS */]: "password-does-not-meet-requirements" /* AuthErrorCode.PASSWORD_DOES_NOT_MEET_REQUIREMENTS */,
    // Phone Auth related errors.
    ["INVALID_CODE" /* ServerError.INVALID_CODE */]: "invalid-verification-code" /* AuthErrorCode.INVALID_CODE */,
    ["INVALID_SESSION_INFO" /* ServerError.INVALID_SESSION_INFO */]: "invalid-verification-id" /* AuthErrorCode.INVALID_SESSION_INFO */,
    ["INVALID_TEMPORARY_PROOF" /* ServerError.INVALID_TEMPORARY_PROOF */]: "invalid-credential" /* AuthErrorCode.INVALID_CREDENTIAL */,
    ["MISSING_SESSION_INFO" /* ServerError.MISSING_SESSION_INFO */]: "missing-verification-id" /* AuthErrorCode.MISSING_SESSION_INFO */,
    ["SESSION_EXPIRED" /* ServerError.SESSION_EXPIRED */]: "code-expired" /* AuthErrorCode.CODE_EXPIRED */,
    // Other action code errors when additional settings passed.
    // MISSING_CONTINUE_URI is getting mapped to INTERNAL_ERROR above.
    // This is OK as this error will be caught by client side validation.
    ["MISSING_ANDROID_PACKAGE_NAME" /* ServerError.MISSING_ANDROID_PACKAGE_NAME */]: "missing-android-pkg-name" /* AuthErrorCode.MISSING_ANDROID_PACKAGE_NAME */,
    ["UNAUTHORIZED_DOMAIN" /* ServerError.UNAUTHORIZED_DOMAIN */]: "unauthorized-continue-uri" /* AuthErrorCode.UNAUTHORIZED_DOMAIN */,
    // getProjectConfig errors when clientId is passed.
    ["INVALID_OAUTH_CLIENT_ID" /* ServerError.INVALID_OAUTH_CLIENT_ID */]: "invalid-oauth-client-id" /* AuthErrorCode.INVALID_OAUTH_CLIENT_ID */,
    // User actions (sign-up or deletion) disabled errors.
    ["ADMIN_ONLY_OPERATION" /* ServerError.ADMIN_ONLY_OPERATION */]: "admin-restricted-operation" /* AuthErrorCode.ADMIN_ONLY_OPERATION */,
    // Multi factor related errors.
    ["INVALID_MFA_PENDING_CREDENTIAL" /* ServerError.INVALID_MFA_PENDING_CREDENTIAL */]: "invalid-multi-factor-session" /* AuthErrorCode.INVALID_MFA_SESSION */,
    ["MFA_ENROLLMENT_NOT_FOUND" /* ServerError.MFA_ENROLLMENT_NOT_FOUND */]: "multi-factor-info-not-found" /* AuthErrorCode.MFA_INFO_NOT_FOUND */,
    ["MISSING_MFA_ENROLLMENT_ID" /* ServerError.MISSING_MFA_ENROLLMENT_ID */]: "missing-multi-factor-info" /* AuthErrorCode.MISSING_MFA_INFO */,
    ["MISSING_MFA_PENDING_CREDENTIAL" /* ServerError.MISSING_MFA_PENDING_CREDENTIAL */]: "missing-multi-factor-session" /* AuthErrorCode.MISSING_MFA_SESSION */,
    ["SECOND_FACTOR_EXISTS" /* ServerError.SECOND_FACTOR_EXISTS */]: "second-factor-already-in-use" /* AuthErrorCode.SECOND_FACTOR_ALREADY_ENROLLED */,
    ["SECOND_FACTOR_LIMIT_EXCEEDED" /* ServerError.SECOND_FACTOR_LIMIT_EXCEEDED */]: "maximum-second-factor-count-exceeded" /* AuthErrorCode.SECOND_FACTOR_LIMIT_EXCEEDED */,
    // Blocking functions related errors.
    ["BLOCKING_FUNCTION_ERROR_RESPONSE" /* ServerError.BLOCKING_FUNCTION_ERROR_RESPONSE */]: "internal-error" /* AuthErrorCode.INTERNAL_ERROR */,
    // Recaptcha related errors.
    ["RECAPTCHA_NOT_ENABLED" /* ServerError.RECAPTCHA_NOT_ENABLED */]: "recaptcha-not-enabled" /* AuthErrorCode.RECAPTCHA_NOT_ENABLED */,
    ["MISSING_RECAPTCHA_TOKEN" /* ServerError.MISSING_RECAPTCHA_TOKEN */]: "missing-recaptcha-token" /* AuthErrorCode.MISSING_RECAPTCHA_TOKEN */,
    ["INVALID_RECAPTCHA_TOKEN" /* ServerError.INVALID_RECAPTCHA_TOKEN */]: "invalid-recaptcha-token" /* AuthErrorCode.INVALID_RECAPTCHA_TOKEN */,
    ["INVALID_RECAPTCHA_ACTION" /* ServerError.INVALID_RECAPTCHA_ACTION */]: "invalid-recaptcha-action" /* AuthErrorCode.INVALID_RECAPTCHA_ACTION */,
    ["MISSING_CLIENT_TYPE" /* ServerError.MISSING_CLIENT_TYPE */]: "missing-client-type" /* AuthErrorCode.MISSING_CLIENT_TYPE */,
    ["MISSING_RECAPTCHA_VERSION" /* ServerError.MISSING_RECAPTCHA_VERSION */]: "missing-recaptcha-version" /* AuthErrorCode.MISSING_RECAPTCHA_VERSION */,
    ["INVALID_RECAPTCHA_VERSION" /* ServerError.INVALID_RECAPTCHA_VERSION */]: "invalid-recaptcha-version" /* AuthErrorCode.INVALID_RECAPTCHA_VERSION */,
    ["INVALID_REQ_TYPE" /* ServerError.INVALID_REQ_TYPE */]: "invalid-req-type" /* AuthErrorCode.INVALID_REQ_TYPE */
};

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DEFAULT_API_TIMEOUT_MS = new Delay(30000, 60000);
function _addTidIfNecessary(auth, request) {
    if (auth.tenantId && !request.tenantId) {
        return Object.assign(Object.assign({}, request), { tenantId: auth.tenantId });
    }
    return request;
}
async function _performApiRequest(auth, method, path, request, customErrorMap = {}) {
    return _performFetchWithErrorHandling(auth, customErrorMap, async () => {
        let body = {};
        let params = {};
        if (request) {
            if (method === "GET" /* HttpMethod.GET */) {
                params = request;
            }
            else {
                body = {
                    body: JSON.stringify(request)
                };
            }
        }
        const query = querystring(Object.assign({ key: auth.config.apiKey }, params)).slice(1);
        const headers = await auth._getAdditionalHeaders();
        headers["Content-Type" /* HttpHeader.CONTENT_TYPE */] = 'application/json';
        if (auth.languageCode) {
            headers["X-Firebase-Locale" /* HttpHeader.X_FIREBASE_LOCALE */] = auth.languageCode;
        }
        return FetchProvider.fetch()(_getFinalTarget(auth, auth.config.apiHost, path, query), Object.assign({ method,
            headers, referrerPolicy: 'no-referrer' }, body));
    });
}
async function _performFetchWithErrorHandling(auth, customErrorMap, fetchFn) {
    auth._canInitEmulator = false;
    const errorMap = Object.assign(Object.assign({}, SERVER_ERROR_MAP), customErrorMap);
    try {
        const networkTimeout = new NetworkTimeout(auth);
        const response = await Promise.race([
            fetchFn(),
            networkTimeout.promise
        ]);
        // If we've reached this point, the fetch succeeded and the networkTimeout
        // didn't throw; clear the network timeout delay so that Node won't hang
        networkTimeout.clearNetworkTimeout();
        const json = await response.json();
        if ('needConfirmation' in json) {
            throw _makeTaggedError(auth, "account-exists-with-different-credential" /* AuthErrorCode.NEED_CONFIRMATION */, json);
        }
        if (response.ok && !('errorMessage' in json)) {
            return json;
        }
        else {
            const errorMessage = response.ok ? json.errorMessage : json.error.message;
            const [serverErrorCode, serverErrorMessage] = errorMessage.split(' : ');
            if (serverErrorCode === "FEDERATED_USER_ID_ALREADY_LINKED" /* ServerError.FEDERATED_USER_ID_ALREADY_LINKED */) {
                throw _makeTaggedError(auth, "credential-already-in-use" /* AuthErrorCode.CREDENTIAL_ALREADY_IN_USE */, json);
            }
            else if (serverErrorCode === "EMAIL_EXISTS" /* ServerError.EMAIL_EXISTS */) {
                throw _makeTaggedError(auth, "email-already-in-use" /* AuthErrorCode.EMAIL_EXISTS */, json);
            }
            else if (serverErrorCode === "USER_DISABLED" /* ServerError.USER_DISABLED */) {
                throw _makeTaggedError(auth, "user-disabled" /* AuthErrorCode.USER_DISABLED */, json);
            }
            const authError = errorMap[serverErrorCode] ||
                serverErrorCode
                    .toLowerCase()
                    .replace(/[_\s]+/g, '-');
            if (serverErrorMessage) {
                throw _errorWithCustomMessage(auth, authError, serverErrorMessage);
            }
            else {
                _fail(auth, authError);
            }
        }
    }
    catch (e) {
        if (e instanceof FirebaseError) {
            throw e;
        }
        // Changing this to a different error code will log user out when there is a network error
        // because we treat any error other than NETWORK_REQUEST_FAILED as token is invalid.
        // https://github.com/firebase/firebase-js-sdk/blob/4fbc73610d70be4e0852e7de63a39cb7897e8546/packages/auth/src/core/auth/auth_impl.ts#L309-L316
        _fail(auth, "network-request-failed" /* AuthErrorCode.NETWORK_REQUEST_FAILED */, { 'message': String(e) });
    }
}
async function _performSignInRequest(auth, method, path, request, customErrorMap = {}) {
    const serverResponse = (await _performApiRequest(auth, method, path, request, customErrorMap));
    if ('mfaPendingCredential' in serverResponse) {
        _fail(auth, "multi-factor-auth-required" /* AuthErrorCode.MFA_REQUIRED */, {
            _serverResponse: serverResponse
        });
    }
    return serverResponse;
}
function _getFinalTarget(auth, host, path, query) {
    const base = `${host}${path}?${query}`;
    if (!auth.config.emulator) {
        return `${auth.config.apiScheme}://${base}`;
    }
    return _emulatorUrl(auth.config, base);
}
class NetworkTimeout {
    constructor(auth) {
        this.auth = auth;
        // Node timers and browser timers are fundamentally incompatible, but we
        // don't care about the value here
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.timer = null;
        this.promise = new Promise((_, reject) => {
            this.timer = setTimeout(() => {
                return reject(_createError(this.auth, "network-request-failed" /* AuthErrorCode.NETWORK_REQUEST_FAILED */));
            }, DEFAULT_API_TIMEOUT_MS.get());
        });
    }
    clearNetworkTimeout() {
        clearTimeout(this.timer);
    }
}
function _makeTaggedError(auth, code, response) {
    const errorParams = {
        appName: auth.name
    };
    if (response.email) {
        errorParams.email = response.email;
    }
    if (response.phoneNumber) {
        errorParams.phoneNumber = response.phoneNumber;
    }
    const error = _createError(auth, code, errorParams);
    // We know customData is defined on error because errorParams is defined
    error.customData._tokenResponse = response;
    return error;
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function deleteAccount(auth, request) {
    return _performApiRequest(auth, "POST" /* HttpMethod.POST */, "/v1/accounts:delete" /* Endpoint.DELETE_ACCOUNT */, request);
}
async function getAccountInfo(auth, request) {
    return _performApiRequest(auth, "POST" /* HttpMethod.POST */, "/v1/accounts:lookup" /* Endpoint.GET_ACCOUNT_INFO */, request);
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function utcTimestampToDateString(utcTimestamp) {
    if (!utcTimestamp) {
        return undefined;
    }
    try {
        // Convert to date object.
        const date = new Date(Number(utcTimestamp));
        // Test date is valid.
        if (!isNaN(date.getTime())) {
            // Convert to UTC date string.
            return date.toUTCString();
        }
    }
    catch (e) {
        // Do nothing. undefined will be returned.
    }
    return undefined;
}
/**
 * Returns a deserialized JSON Web Token (JWT) used to identify the user to a Firebase service.
 *
 * @remarks
 * Returns the current token if it has not expired or if it will not expire in the next five
 * minutes. Otherwise, this will refresh the token and return a new one.
 *
 * @param user - The user.
 * @param forceRefresh - Force refresh regardless of token expiration.
 *
 * @public
 */
async function getIdTokenResult(user, forceRefresh = false) {
    const userInternal = getModularInstance(user);
    const token = await userInternal.getIdToken(forceRefresh);
    const claims = _parseToken(token);
    _assert(claims && claims.exp && claims.auth_time && claims.iat, userInternal.auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
    const firebase = typeof claims.firebase === 'object' ? claims.firebase : undefined;
    const signInProvider = firebase === null || firebase === void 0 ? void 0 : firebase['sign_in_provider'];
    return {
        claims,
        token,
        authTime: utcTimestampToDateString(secondsStringToMilliseconds(claims.auth_time)),
        issuedAtTime: utcTimestampToDateString(secondsStringToMilliseconds(claims.iat)),
        expirationTime: utcTimestampToDateString(secondsStringToMilliseconds(claims.exp)),
        signInProvider: signInProvider || null,
        signInSecondFactor: (firebase === null || firebase === void 0 ? void 0 : firebase['sign_in_second_factor']) || null
    };
}
function secondsStringToMilliseconds(seconds) {
    return Number(seconds) * 1000;
}
function _parseToken(token) {
    const [algorithm, payload, signature] = token.split('.');
    if (algorithm === undefined ||
        payload === undefined ||
        signature === undefined) {
        _logError('JWT malformed, contained fewer than 3 sections');
        return null;
    }
    try {
        const decoded = base64Decode(payload);
        if (!decoded) {
            _logError('Failed to decode base64 JWT payload');
            return null;
        }
        return JSON.parse(decoded);
    }
    catch (e) {
        _logError('Caught error parsing JWT payload as JSON', e === null || e === void 0 ? void 0 : e.toString());
        return null;
    }
}
/**
 * Extract expiresIn TTL from a token by subtracting the expiration from the issuance.
 */
function _tokenExpiresIn(token) {
    const parsedToken = _parseToken(token);
    _assert(parsedToken, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
    _assert(typeof parsedToken.exp !== 'undefined', "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
    _assert(typeof parsedToken.iat !== 'undefined', "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
    return Number(parsedToken.exp) - Number(parsedToken.iat);
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function _logoutIfInvalidated(user, promise, bypassAuthState = false) {
    if (bypassAuthState) {
        return promise;
    }
    try {
        return await promise;
    }
    catch (e) {
        if (e instanceof FirebaseError && isUserInvalidated(e)) {
            if (user.auth.currentUser === user) {
                await user.auth.signOut();
            }
        }
        throw e;
    }
}
function isUserInvalidated({ code }) {
    return (code === `auth/${"user-disabled" /* AuthErrorCode.USER_DISABLED */}` ||
        code === `auth/${"user-token-expired" /* AuthErrorCode.TOKEN_EXPIRED */}`);
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ProactiveRefresh {
    constructor(user) {
        this.user = user;
        this.isRunning = false;
        // Node timers and browser timers return fundamentally different types.
        // We don't actually care what the value is but TS won't accept unknown and
        // we can't cast properly in both environments.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.timerId = null;
        this.errorBackoff = 30000 /* Duration.RETRY_BACKOFF_MIN */;
    }
    _start() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        this.schedule();
    }
    _stop() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        if (this.timerId !== null) {
            clearTimeout(this.timerId);
        }
    }
    getInterval(wasError) {
        var _a;
        if (wasError) {
            const interval = this.errorBackoff;
            this.errorBackoff = Math.min(this.errorBackoff * 2, 960000 /* Duration.RETRY_BACKOFF_MAX */);
            return interval;
        }
        else {
            // Reset the error backoff
            this.errorBackoff = 30000 /* Duration.RETRY_BACKOFF_MIN */;
            const expTime = (_a = this.user.stsTokenManager.expirationTime) !== null && _a !== void 0 ? _a : 0;
            const interval = expTime - Date.now() - 300000 /* Duration.OFFSET */;
            return Math.max(0, interval);
        }
    }
    schedule(wasError = false) {
        if (!this.isRunning) {
            // Just in case...
            return;
        }
        const interval = this.getInterval(wasError);
        this.timerId = setTimeout(async () => {
            await this.iteration();
        }, interval);
    }
    async iteration() {
        try {
            await this.user.getIdToken(true);
        }
        catch (e) {
            // Only retry on network errors
            if ((e === null || e === void 0 ? void 0 : e.code) ===
                `auth/${"network-request-failed" /* AuthErrorCode.NETWORK_REQUEST_FAILED */}`) {
                this.schedule(/* wasError */ true);
            }
            return;
        }
        this.schedule();
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class UserMetadata {
    constructor(createdAt, lastLoginAt) {
        this.createdAt = createdAt;
        this.lastLoginAt = lastLoginAt;
        this._initializeTime();
    }
    _initializeTime() {
        this.lastSignInTime = utcTimestampToDateString(this.lastLoginAt);
        this.creationTime = utcTimestampToDateString(this.createdAt);
    }
    _copy(metadata) {
        this.createdAt = metadata.createdAt;
        this.lastLoginAt = metadata.lastLoginAt;
        this._initializeTime();
    }
    toJSON() {
        return {
            createdAt: this.createdAt,
            lastLoginAt: this.lastLoginAt
        };
    }
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function _reloadWithoutSaving(user) {
    var _a;
    const auth = user.auth;
    const idToken = await user.getIdToken();
    const response = await _logoutIfInvalidated(user, getAccountInfo(auth, { idToken }));
    _assert(response === null || response === void 0 ? void 0 : response.users.length, auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
    const coreAccount = response.users[0];
    user._notifyReloadListener(coreAccount);
    const newProviderData = ((_a = coreAccount.providerUserInfo) === null || _a === void 0 ? void 0 : _a.length)
        ? extractProviderData(coreAccount.providerUserInfo)
        : [];
    const providerData = mergeProviderData(user.providerData, newProviderData);
    // Preserves the non-nonymous status of the stored user, even if no more
    // credentials (federated or email/password) are linked to the user. If
    // the user was previously anonymous, then use provider data to update.
    // On the other hand, if it was not anonymous before, it should never be
    // considered anonymous now.
    const oldIsAnonymous = user.isAnonymous;
    const newIsAnonymous = !(user.email && coreAccount.passwordHash) && !(providerData === null || providerData === void 0 ? void 0 : providerData.length);
    const isAnonymous = !oldIsAnonymous ? false : newIsAnonymous;
    const updates = {
        uid: coreAccount.localId,
        displayName: coreAccount.displayName || null,
        photoURL: coreAccount.photoUrl || null,
        email: coreAccount.email || null,
        emailVerified: coreAccount.emailVerified || false,
        phoneNumber: coreAccount.phoneNumber || null,
        tenantId: coreAccount.tenantId || null,
        providerData,
        metadata: new UserMetadata(coreAccount.createdAt, coreAccount.lastLoginAt),
        isAnonymous
    };
    Object.assign(user, updates);
}
/**
 * Reloads user account data, if signed in.
 *
 * @param user - The user.
 *
 * @public
 */
async function reload(user) {
    const userInternal = getModularInstance(user);
    await _reloadWithoutSaving(userInternal);
    // Even though the current user hasn't changed, update
    // current user will trigger a persistence update w/ the
    // new info.
    await userInternal.auth._persistUserIfCurrent(userInternal);
    userInternal.auth._notifyListenersIfCurrent(userInternal);
}
function mergeProviderData(original, newData) {
    const deduped = original.filter(o => !newData.some(n => n.providerId === o.providerId));
    return [...deduped, ...newData];
}
function extractProviderData(providers) {
    return providers.map((_a) => {
        var { providerId } = _a, provider = __rest(_a, ["providerId"]);
        return {
            providerId,
            uid: provider.rawId || '',
            displayName: provider.displayName || null,
            email: provider.email || null,
            phoneNumber: provider.phoneNumber || null,
            photoURL: provider.photoUrl || null
        };
    });
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function requestStsToken(auth, refreshToken) {
    const response = await _performFetchWithErrorHandling(auth, {}, async () => {
        const body = querystring({
            'grant_type': 'refresh_token',
            'refresh_token': refreshToken
        }).slice(1);
        const { tokenApiHost, apiKey } = auth.config;
        const url = _getFinalTarget(auth, tokenApiHost, "/v1/token" /* Endpoint.TOKEN */, `key=${apiKey}`);
        const headers = await auth._getAdditionalHeaders();
        headers["Content-Type" /* HttpHeader.CONTENT_TYPE */] = 'application/x-www-form-urlencoded';
        return FetchProvider.fetch()(url, {
            method: "POST" /* HttpMethod.POST */,
            headers,
            body
        });
    });
    // The response comes back in snake_case. Convert to camel:
    return {
        accessToken: response.access_token,
        expiresIn: response.expires_in,
        refreshToken: response.refresh_token
    };
}
async function revokeToken(auth, request) {
    return _performApiRequest(auth, "POST" /* HttpMethod.POST */, "/v2/accounts:revokeToken" /* Endpoint.REVOKE_TOKEN */, _addTidIfNecessary(auth, request));
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * We need to mark this class as internal explicitly to exclude it in the public typings, because
 * it references AuthInternal which has a circular dependency with UserInternal.
 *
 * @internal
 */
class StsTokenManager {
    constructor() {
        this.refreshToken = null;
        this.accessToken = null;
        this.expirationTime = null;
    }
    get isExpired() {
        return (!this.expirationTime ||
            Date.now() > this.expirationTime - 30000 /* Buffer.TOKEN_REFRESH */);
    }
    updateFromServerResponse(response) {
        _assert(response.idToken, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        _assert(typeof response.idToken !== 'undefined', "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        _assert(typeof response.refreshToken !== 'undefined', "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        const expiresIn = 'expiresIn' in response && typeof response.expiresIn !== 'undefined'
            ? Number(response.expiresIn)
            : _tokenExpiresIn(response.idToken);
        this.updateTokensAndExpiration(response.idToken, response.refreshToken, expiresIn);
    }
    async getToken(auth, forceRefresh = false) {
        _assert(!this.accessToken || this.refreshToken, auth, "user-token-expired" /* AuthErrorCode.TOKEN_EXPIRED */);
        if (!forceRefresh && this.accessToken && !this.isExpired) {
            return this.accessToken;
        }
        if (this.refreshToken) {
            await this.refresh(auth, this.refreshToken);
            return this.accessToken;
        }
        return null;
    }
    clearRefreshToken() {
        this.refreshToken = null;
    }
    async refresh(auth, oldToken) {
        const { accessToken, refreshToken, expiresIn } = await requestStsToken(auth, oldToken);
        this.updateTokensAndExpiration(accessToken, refreshToken, Number(expiresIn));
    }
    updateTokensAndExpiration(accessToken, refreshToken, expiresInSec) {
        this.refreshToken = refreshToken || null;
        this.accessToken = accessToken || null;
        this.expirationTime = Date.now() + expiresInSec * 1000;
    }
    static fromJSON(appName, object) {
        const { refreshToken, accessToken, expirationTime } = object;
        const manager = new StsTokenManager();
        if (refreshToken) {
            _assert(typeof refreshToken === 'string', "internal-error" /* AuthErrorCode.INTERNAL_ERROR */, {
                appName
            });
            manager.refreshToken = refreshToken;
        }
        if (accessToken) {
            _assert(typeof accessToken === 'string', "internal-error" /* AuthErrorCode.INTERNAL_ERROR */, {
                appName
            });
            manager.accessToken = accessToken;
        }
        if (expirationTime) {
            _assert(typeof expirationTime === 'number', "internal-error" /* AuthErrorCode.INTERNAL_ERROR */, {
                appName
            });
            manager.expirationTime = expirationTime;
        }
        return manager;
    }
    toJSON() {
        return {
            refreshToken: this.refreshToken,
            accessToken: this.accessToken,
            expirationTime: this.expirationTime
        };
    }
    _assign(stsTokenManager) {
        this.accessToken = stsTokenManager.accessToken;
        this.refreshToken = stsTokenManager.refreshToken;
        this.expirationTime = stsTokenManager.expirationTime;
    }
    _clone() {
        return Object.assign(new StsTokenManager(), this.toJSON());
    }
    _performRefresh() {
        return debugFail('not implemented');
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function assertStringOrUndefined(assertion, appName) {
    _assert(typeof assertion === 'string' || typeof assertion === 'undefined', "internal-error" /* AuthErrorCode.INTERNAL_ERROR */, { appName });
}
class UserImpl {
    constructor(_a) {
        var { uid, auth, stsTokenManager } = _a, opt = __rest(_a, ["uid", "auth", "stsTokenManager"]);
        // For the user object, provider is always Firebase.
        this.providerId = "firebase" /* ProviderId.FIREBASE */;
        this.proactiveRefresh = new ProactiveRefresh(this);
        this.reloadUserInfo = null;
        this.reloadListener = null;
        this.uid = uid;
        this.auth = auth;
        this.stsTokenManager = stsTokenManager;
        this.accessToken = stsTokenManager.accessToken;
        this.displayName = opt.displayName || null;
        this.email = opt.email || null;
        this.emailVerified = opt.emailVerified || false;
        this.phoneNumber = opt.phoneNumber || null;
        this.photoURL = opt.photoURL || null;
        this.isAnonymous = opt.isAnonymous || false;
        this.tenantId = opt.tenantId || null;
        this.providerData = opt.providerData ? [...opt.providerData] : [];
        this.metadata = new UserMetadata(opt.createdAt || undefined, opt.lastLoginAt || undefined);
    }
    async getIdToken(forceRefresh) {
        const accessToken = await _logoutIfInvalidated(this, this.stsTokenManager.getToken(this.auth, forceRefresh));
        _assert(accessToken, this.auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        if (this.accessToken !== accessToken) {
            this.accessToken = accessToken;
            await this.auth._persistUserIfCurrent(this);
            this.auth._notifyListenersIfCurrent(this);
        }
        return accessToken;
    }
    getIdTokenResult(forceRefresh) {
        return getIdTokenResult(this, forceRefresh);
    }
    reload() {
        return reload(this);
    }
    _assign(user) {
        if (this === user) {
            return;
        }
        _assert(this.uid === user.uid, this.auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        this.displayName = user.displayName;
        this.photoURL = user.photoURL;
        this.email = user.email;
        this.emailVerified = user.emailVerified;
        this.phoneNumber = user.phoneNumber;
        this.isAnonymous = user.isAnonymous;
        this.tenantId = user.tenantId;
        this.providerData = user.providerData.map(userInfo => (Object.assign({}, userInfo)));
        this.metadata._copy(user.metadata);
        this.stsTokenManager._assign(user.stsTokenManager);
    }
    _clone(auth) {
        const newUser = new UserImpl(Object.assign(Object.assign({}, this), { auth, stsTokenManager: this.stsTokenManager._clone() }));
        newUser.metadata._copy(this.metadata);
        return newUser;
    }
    _onReload(callback) {
        // There should only ever be one listener, and that is a single instance of MultiFactorUser
        _assert(!this.reloadListener, this.auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        this.reloadListener = callback;
        if (this.reloadUserInfo) {
            this._notifyReloadListener(this.reloadUserInfo);
            this.reloadUserInfo = null;
        }
    }
    _notifyReloadListener(userInfo) {
        if (this.reloadListener) {
            this.reloadListener(userInfo);
        }
        else {
            // If no listener is subscribed yet, save the result so it's available when they do subscribe
            this.reloadUserInfo = userInfo;
        }
    }
    _startProactiveRefresh() {
        this.proactiveRefresh._start();
    }
    _stopProactiveRefresh() {
        this.proactiveRefresh._stop();
    }
    async _updateTokensIfNecessary(response, reload = false) {
        let tokensRefreshed = false;
        if (response.idToken &&
            response.idToken !== this.stsTokenManager.accessToken) {
            this.stsTokenManager.updateFromServerResponse(response);
            tokensRefreshed = true;
        }
        if (reload) {
            await _reloadWithoutSaving(this);
        }
        await this.auth._persistUserIfCurrent(this);
        if (tokensRefreshed) {
            this.auth._notifyListenersIfCurrent(this);
        }
    }
    async delete() {
        const idToken = await this.getIdToken();
        await _logoutIfInvalidated(this, deleteAccount(this.auth, { idToken }));
        this.stsTokenManager.clearRefreshToken();
        // TODO: Determine if cancellable-promises are necessary to use in this class so that delete()
        //       cancels pending actions...
        return this.auth.signOut();
    }
    toJSON() {
        return Object.assign(Object.assign({ uid: this.uid, email: this.email || undefined, emailVerified: this.emailVerified, displayName: this.displayName || undefined, isAnonymous: this.isAnonymous, photoURL: this.photoURL || undefined, phoneNumber: this.phoneNumber || undefined, tenantId: this.tenantId || undefined, providerData: this.providerData.map(userInfo => (Object.assign({}, userInfo))), stsTokenManager: this.stsTokenManager.toJSON(), 
            // Redirect event ID must be maintained in case there is a pending
            // redirect event.
            _redirectEventId: this._redirectEventId }, this.metadata.toJSON()), { 
            // Required for compatibility with the legacy SDK (go/firebase-auth-sdk-persistence-parsing):
            apiKey: this.auth.config.apiKey, appName: this.auth.name });
    }
    get refreshToken() {
        return this.stsTokenManager.refreshToken || '';
    }
    static _fromJSON(auth, object) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const displayName = (_a = object.displayName) !== null && _a !== void 0 ? _a : undefined;
        const email = (_b = object.email) !== null && _b !== void 0 ? _b : undefined;
        const phoneNumber = (_c = object.phoneNumber) !== null && _c !== void 0 ? _c : undefined;
        const photoURL = (_d = object.photoURL) !== null && _d !== void 0 ? _d : undefined;
        const tenantId = (_e = object.tenantId) !== null && _e !== void 0 ? _e : undefined;
        const _redirectEventId = (_f = object._redirectEventId) !== null && _f !== void 0 ? _f : undefined;
        const createdAt = (_g = object.createdAt) !== null && _g !== void 0 ? _g : undefined;
        const lastLoginAt = (_h = object.lastLoginAt) !== null && _h !== void 0 ? _h : undefined;
        const { uid, emailVerified, isAnonymous, providerData, stsTokenManager: plainObjectTokenManager } = object;
        _assert(uid && plainObjectTokenManager, auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        const stsTokenManager = StsTokenManager.fromJSON(this.name, plainObjectTokenManager);
        _assert(typeof uid === 'string', auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        assertStringOrUndefined(displayName, auth.name);
        assertStringOrUndefined(email, auth.name);
        _assert(typeof emailVerified === 'boolean', auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        _assert(typeof isAnonymous === 'boolean', auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        assertStringOrUndefined(phoneNumber, auth.name);
        assertStringOrUndefined(photoURL, auth.name);
        assertStringOrUndefined(tenantId, auth.name);
        assertStringOrUndefined(_redirectEventId, auth.name);
        assertStringOrUndefined(createdAt, auth.name);
        assertStringOrUndefined(lastLoginAt, auth.name);
        const user = new UserImpl({
            uid,
            auth,
            email,
            emailVerified,
            displayName,
            isAnonymous,
            photoURL,
            phoneNumber,
            tenantId,
            stsTokenManager,
            createdAt,
            lastLoginAt
        });
        if (providerData && Array.isArray(providerData)) {
            user.providerData = providerData.map(userInfo => (Object.assign({}, userInfo)));
        }
        if (_redirectEventId) {
            user._redirectEventId = _redirectEventId;
        }
        return user;
    }
    /**
     * Initialize a User from an idToken server response
     * @param auth
     * @param idTokenResponse
     */
    static async _fromIdTokenResponse(auth, idTokenResponse, isAnonymous = false) {
        const stsTokenManager = new StsTokenManager();
        stsTokenManager.updateFromServerResponse(idTokenResponse);
        // Initialize the Firebase Auth user.
        const user = new UserImpl({
            uid: idTokenResponse.localId,
            auth,
            stsTokenManager,
            isAnonymous
        });
        // Updates the user info and data and resolves with a user instance.
        await _reloadWithoutSaving(user);
        return user;
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const instanceCache = new Map();
function _getInstance(cls) {
    debugAssert(cls instanceof Function, 'Expected a class definition');
    let instance = instanceCache.get(cls);
    if (instance) {
        debugAssert(instance instanceof cls, 'Instance stored in cache mismatched with class');
        return instance;
    }
    instance = new cls();
    instanceCache.set(cls, instance);
    return instance;
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class InMemoryPersistence {
    constructor() {
        this.type = "NONE" /* PersistenceType.NONE */;
        this.storage = {};
    }
    async _isAvailable() {
        return true;
    }
    async _set(key, value) {
        this.storage[key] = value;
    }
    async _get(key) {
        const value = this.storage[key];
        return value === undefined ? null : value;
    }
    async _remove(key) {
        delete this.storage[key];
    }
    _addListener(_key, _listener) {
        // Listeners are not supported for in-memory storage since it cannot be shared across windows/workers
        return;
    }
    _removeListener(_key, _listener) {
        // Listeners are not supported for in-memory storage since it cannot be shared across windows/workers
        return;
    }
}
InMemoryPersistence.type = 'NONE';
/**
 * An implementation of {@link Persistence} of type 'NONE'.
 *
 * @public
 */
const inMemoryPersistence = InMemoryPersistence;

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _persistenceKeyName(key, apiKey, appName) {
    return `${"firebase" /* Namespace.PERSISTENCE */}:${key}:${apiKey}:${appName}`;
}
class PersistenceUserManager {
    constructor(persistence, auth, userKey) {
        this.persistence = persistence;
        this.auth = auth;
        this.userKey = userKey;
        const { config, name } = this.auth;
        this.fullUserKey = _persistenceKeyName(this.userKey, config.apiKey, name);
        this.fullPersistenceKey = _persistenceKeyName("persistence" /* KeyName.PERSISTENCE_USER */, config.apiKey, name);
        this.boundEventHandler = auth._onStorageEvent.bind(auth);
        this.persistence._addListener(this.fullUserKey, this.boundEventHandler);
    }
    setCurrentUser(user) {
        return this.persistence._set(this.fullUserKey, user.toJSON());
    }
    async getCurrentUser() {
        const blob = await this.persistence._get(this.fullUserKey);
        return blob ? UserImpl._fromJSON(this.auth, blob) : null;
    }
    removeCurrentUser() {
        return this.persistence._remove(this.fullUserKey);
    }
    savePersistenceForRedirect() {
        return this.persistence._set(this.fullPersistenceKey, this.persistence.type);
    }
    async setPersistence(newPersistence) {
        if (this.persistence === newPersistence) {
            return;
        }
        const currentUser = await this.getCurrentUser();
        await this.removeCurrentUser();
        this.persistence = newPersistence;
        if (currentUser) {
            return this.setCurrentUser(currentUser);
        }
    }
    delete() {
        this.persistence._removeListener(this.fullUserKey, this.boundEventHandler);
    }
    static async create(auth, persistenceHierarchy, userKey = "authUser" /* KeyName.AUTH_USER */) {
        if (!persistenceHierarchy.length) {
            return new PersistenceUserManager(_getInstance(inMemoryPersistence), auth, userKey);
        }
        // Eliminate any persistences that are not available
        const availablePersistences = (await Promise.all(persistenceHierarchy.map(async (persistence) => {
            if (await persistence._isAvailable()) {
                return persistence;
            }
            return undefined;
        }))).filter(persistence => persistence);
        // Fall back to the first persistence listed, or in memory if none available
        let selectedPersistence = availablePersistences[0] ||
            _getInstance(inMemoryPersistence);
        const key = _persistenceKeyName(userKey, auth.config.apiKey, auth.name);
        // Pull out the existing user, setting the chosen persistence to that
        // persistence if the user exists.
        let userToMigrate = null;
        // Note, here we check for a user in _all_ persistences, not just the
        // ones deemed available. If we can migrate a user out of a broken
        // persistence, we will (but only if that persistence supports migration).
        for (const persistence of persistenceHierarchy) {
            try {
                const blob = await persistence._get(key);
                if (blob) {
                    const user = UserImpl._fromJSON(auth, blob); // throws for unparsable blob (wrong format)
                    if (persistence !== selectedPersistence) {
                        userToMigrate = user;
                    }
                    selectedPersistence = persistence;
                    break;
                }
            }
            catch (_a) { }
        }
        // If we find the user in a persistence that does support migration, use
        // that migration path (of only persistences that support migration)
        const migrationHierarchy = availablePersistences.filter(p => p._shouldAllowMigration);
        // If the persistence does _not_ allow migration, just finish off here
        if (!selectedPersistence._shouldAllowMigration ||
            !migrationHierarchy.length) {
            return new PersistenceUserManager(selectedPersistence, auth, userKey);
        }
        selectedPersistence = migrationHierarchy[0];
        if (userToMigrate) {
            // This normally shouldn't throw since chosenPersistence.isAvailable() is true, but if it does
            // we'll just let it bubble to surface the error.
            await selectedPersistence._set(key, userToMigrate.toJSON());
        }
        // Attempt to clear the key in other persistences but ignore errors. This helps prevent issues
        // such as users getting stuck with a previous account after signing out and refreshing the tab.
        await Promise.all(persistenceHierarchy.map(async (persistence) => {
            if (persistence !== selectedPersistence) {
                try {
                    await persistence._remove(key);
                }
                catch (_a) { }
            }
        }));
        return new PersistenceUserManager(selectedPersistence, auth, userKey);
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Determine the browser for the purposes of reporting usage to the API
 */
function _getBrowserName(userAgent) {
    const ua = userAgent.toLowerCase();
    if (ua.includes('opera/') || ua.includes('opr/') || ua.includes('opios/')) {
        return "Opera" /* BrowserName.OPERA */;
    }
    else if (_isIEMobile(ua)) {
        // Windows phone IEMobile browser.
        return "IEMobile" /* BrowserName.IEMOBILE */;
    }
    else if (ua.includes('msie') || ua.includes('trident/')) {
        return "IE" /* BrowserName.IE */;
    }
    else if (ua.includes('edge/')) {
        return "Edge" /* BrowserName.EDGE */;
    }
    else if (_isFirefox(ua)) {
        return "Firefox" /* BrowserName.FIREFOX */;
    }
    else if (ua.includes('silk/')) {
        return "Silk" /* BrowserName.SILK */;
    }
    else if (_isBlackBerry(ua)) {
        // Blackberry browser.
        return "Blackberry" /* BrowserName.BLACKBERRY */;
    }
    else if (_isWebOS(ua)) {
        // WebOS default browser.
        return "Webos" /* BrowserName.WEBOS */;
    }
    else if (_isSafari(ua)) {
        return "Safari" /* BrowserName.SAFARI */;
    }
    else if ((ua.includes('chrome/') || _isChromeIOS(ua)) &&
        !ua.includes('edge/')) {
        return "Chrome" /* BrowserName.CHROME */;
    }
    else if (_isAndroid(ua)) {
        // Android stock browser.
        return "Android" /* BrowserName.ANDROID */;
    }
    else {
        // Most modern browsers have name/version at end of user agent string.
        const re = /([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/;
        const matches = userAgent.match(re);
        if ((matches === null || matches === void 0 ? void 0 : matches.length) === 2) {
            return matches[1];
        }
    }
    return "Other" /* BrowserName.OTHER */;
}
function _isFirefox(ua = getUA()) {
    return /firefox\//i.test(ua);
}
function _isSafari(userAgent = getUA()) {
    const ua = userAgent.toLowerCase();
    return (ua.includes('safari/') &&
        !ua.includes('chrome/') &&
        !ua.includes('crios/') &&
        !ua.includes('android'));
}
function _isChromeIOS(ua = getUA()) {
    return /crios\//i.test(ua);
}
function _isIEMobile(ua = getUA()) {
    return /iemobile/i.test(ua);
}
function _isAndroid(ua = getUA()) {
    return /android/i.test(ua);
}
function _isBlackBerry(ua = getUA()) {
    return /blackberry/i.test(ua);
}
function _isWebOS(ua = getUA()) {
    return /webos/i.test(ua);
}
function _isIOS(ua = getUA()) {
    return (/iphone|ipad|ipod/i.test(ua) ||
        (/macintosh/i.test(ua) && /mobile/i.test(ua)));
}
function _isIOSStandalone(ua = getUA()) {
    var _a;
    return _isIOS(ua) && !!((_a = window.navigator) === null || _a === void 0 ? void 0 : _a.standalone);
}
function _isIE10() {
    return isIE() && document.documentMode === 10;
}
function _isMobileBrowser(ua = getUA()) {
    // TODO: implement getBrowserName equivalent for OS.
    return (_isIOS(ua) ||
        _isAndroid(ua) ||
        _isWebOS(ua) ||
        _isBlackBerry(ua) ||
        /windows phone/i.test(ua) ||
        _isIEMobile(ua));
}
function _isIframe() {
    try {
        // Check that the current window is not the top window.
        // If so, return true.
        return !!(window && window !== window.top);
    }
    catch (e) {
        return false;
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*
 * Determine the SDK version string
 */
function _getClientVersion(clientPlatform, frameworks = []) {
    let reportedPlatform;
    switch (clientPlatform) {
        case "Browser" /* ClientPlatform.BROWSER */:
            // In a browser environment, report the browser name.
            reportedPlatform = _getBrowserName(getUA());
            break;
        case "Worker" /* ClientPlatform.WORKER */:
            // Technically a worker runs from a browser but we need to differentiate a
            // worker from a browser.
            // For example: Chrome-Worker/JsCore/4.9.1/FirebaseCore-web.
            reportedPlatform = `${_getBrowserName(getUA())}-${clientPlatform}`;
            break;
        default:
            reportedPlatform = clientPlatform;
    }
    const reportedFrameworks = frameworks.length
        ? frameworks.join(',')
        : 'FirebaseCore-web'; /* default value if no other framework is used */
    return `${reportedPlatform}/${"JsCore" /* ClientImplementation.CORE */}/${SDK_VERSION}/${reportedFrameworks}`;
}

/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class AuthMiddlewareQueue {
    constructor(auth) {
        this.auth = auth;
        this.queue = [];
    }
    pushCallback(callback, onAbort) {
        // The callback could be sync or async. Wrap it into a
        // function that is always async.
        const wrappedCallback = (user) => new Promise((resolve, reject) => {
            try {
                const result = callback(user);
                // Either resolve with existing promise or wrap a non-promise
                // return value into a promise.
                resolve(result);
            }
            catch (e) {
                // Sync callback throws.
                reject(e);
            }
        });
        // Attach the onAbort if present
        wrappedCallback.onAbort = onAbort;
        this.queue.push(wrappedCallback);
        const index = this.queue.length - 1;
        return () => {
            // Unsubscribe. Replace with no-op. Do not remove from array, or it will disturb
            // indexing of other elements.
            this.queue[index] = () => Promise.resolve();
        };
    }
    async runMiddleware(nextUser) {
        if (this.auth.currentUser === nextUser) {
            return;
        }
        // While running the middleware, build a temporary stack of onAbort
        // callbacks to call if one middleware callback rejects.
        const onAbortStack = [];
        try {
            for (const beforeStateCallback of this.queue) {
                await beforeStateCallback(nextUser);
                // Only push the onAbort if the callback succeeds
                if (beforeStateCallback.onAbort) {
                    onAbortStack.push(beforeStateCallback.onAbort);
                }
            }
        }
        catch (e) {
            // Run all onAbort, with separate try/catch to ignore any errors and
            // continue
            onAbortStack.reverse();
            for (const onAbort of onAbortStack) {
                try {
                    onAbort();
                }
                catch (_) {
                    /* swallow error */
                }
            }
            throw this.auth._errorFactory.create("login-blocked" /* AuthErrorCode.LOGIN_BLOCKED */, {
                originalMessage: e === null || e === void 0 ? void 0 : e.message
            });
        }
    }
}

/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Fetches the password policy for the currently set tenant or the project if no tenant is set.
 *
 * @param auth Auth object.
 * @param request Password policy request.
 * @returns Password policy response.
 */
async function _getPasswordPolicy(auth, request = {}) {
    return _performApiRequest(auth, "GET" /* HttpMethod.GET */, "/v2/passwordPolicy" /* Endpoint.GET_PASSWORD_POLICY */, _addTidIfNecessary(auth, request));
}

/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Minimum min password length enforced by the backend, even if no minimum length is set.
const MINIMUM_MIN_PASSWORD_LENGTH = 6;
/**
 * Stores password policy requirements and provides password validation against the policy.
 *
 * @internal
 */
class PasswordPolicyImpl {
    constructor(response) {
        var _a, _b, _c, _d;
        // Only include custom strength options defined in the response.
        const responseOptions = response.customStrengthOptions;
        this.customStrengthOptions = {};
        // TODO: Remove once the backend is updated to include the minimum min password length instead of undefined when there is no minimum length set.
        this.customStrengthOptions.minPasswordLength =
            (_a = responseOptions.minPasswordLength) !== null && _a !== void 0 ? _a : MINIMUM_MIN_PASSWORD_LENGTH;
        if (responseOptions.maxPasswordLength) {
            this.customStrengthOptions.maxPasswordLength =
                responseOptions.maxPasswordLength;
        }
        if (responseOptions.containsLowercaseCharacter !== undefined) {
            this.customStrengthOptions.containsLowercaseLetter =
                responseOptions.containsLowercaseCharacter;
        }
        if (responseOptions.containsUppercaseCharacter !== undefined) {
            this.customStrengthOptions.containsUppercaseLetter =
                responseOptions.containsUppercaseCharacter;
        }
        if (responseOptions.containsNumericCharacter !== undefined) {
            this.customStrengthOptions.containsNumericCharacter =
                responseOptions.containsNumericCharacter;
        }
        if (responseOptions.containsNonAlphanumericCharacter !== undefined) {
            this.customStrengthOptions.containsNonAlphanumericCharacter =
                responseOptions.containsNonAlphanumericCharacter;
        }
        this.enforcementState = response.enforcementState;
        if (this.enforcementState === 'ENFORCEMENT_STATE_UNSPECIFIED') {
            this.enforcementState = 'OFF';
        }
        // Use an empty string if no non-alphanumeric characters are specified in the response.
        this.allowedNonAlphanumericCharacters =
            (_c = (_b = response.allowedNonAlphanumericCharacters) === null || _b === void 0 ? void 0 : _b.join('')) !== null && _c !== void 0 ? _c : '';
        this.forceUpgradeOnSignin = (_d = response.forceUpgradeOnSignin) !== null && _d !== void 0 ? _d : false;
        this.schemaVersion = response.schemaVersion;
    }
    validatePassword(password) {
        var _a, _b, _c, _d, _e, _f;
        const status = {
            isValid: true,
            passwordPolicy: this
        };
        // Check the password length and character options.
        this.validatePasswordLengthOptions(password, status);
        this.validatePasswordCharacterOptions(password, status);
        // Combine the status into single isValid property.
        status.isValid && (status.isValid = (_a = status.meetsMinPasswordLength) !== null && _a !== void 0 ? _a : true);
        status.isValid && (status.isValid = (_b = status.meetsMaxPasswordLength) !== null && _b !== void 0 ? _b : true);
        status.isValid && (status.isValid = (_c = status.containsLowercaseLetter) !== null && _c !== void 0 ? _c : true);
        status.isValid && (status.isValid = (_d = status.containsUppercaseLetter) !== null && _d !== void 0 ? _d : true);
        status.isValid && (status.isValid = (_e = status.containsNumericCharacter) !== null && _e !== void 0 ? _e : true);
        status.isValid && (status.isValid = (_f = status.containsNonAlphanumericCharacter) !== null && _f !== void 0 ? _f : true);
        return status;
    }
    /**
     * Validates that the password meets the length options for the policy.
     *
     * @param password Password to validate.
     * @param status Validation status.
     */
    validatePasswordLengthOptions(password, status) {
        const minPasswordLength = this.customStrengthOptions.minPasswordLength;
        const maxPasswordLength = this.customStrengthOptions.maxPasswordLength;
        if (minPasswordLength) {
            status.meetsMinPasswordLength = password.length >= minPasswordLength;
        }
        if (maxPasswordLength) {
            status.meetsMaxPasswordLength = password.length <= maxPasswordLength;
        }
    }
    /**
     * Validates that the password meets the character options for the policy.
     *
     * @param password Password to validate.
     * @param status Validation status.
     */
    validatePasswordCharacterOptions(password, status) {
        // Assign statuses for requirements even if the password is an empty string.
        this.updatePasswordCharacterOptionsStatuses(status, 
        /* containsLowercaseCharacter= */ false, 
        /* containsUppercaseCharacter= */ false, 
        /* containsNumericCharacter= */ false, 
        /* containsNonAlphanumericCharacter= */ false);
        let passwordChar;
        for (let i = 0; i < password.length; i++) {
            passwordChar = password.charAt(i);
            this.updatePasswordCharacterOptionsStatuses(status, 
            /* containsLowercaseCharacter= */ passwordChar >= 'a' &&
                passwordChar <= 'z', 
            /* containsUppercaseCharacter= */ passwordChar >= 'A' &&
                passwordChar <= 'Z', 
            /* containsNumericCharacter= */ passwordChar >= '0' &&
                passwordChar <= '9', 
            /* containsNonAlphanumericCharacter= */ this.allowedNonAlphanumericCharacters.includes(passwordChar));
        }
    }
    /**
     * Updates the running validation status with the statuses for the character options.
     * Expected to be called each time a character is processed to update each option status
     * based on the current character.
     *
     * @param status Validation status.
     * @param containsLowercaseCharacter Whether the character is a lowercase letter.
     * @param containsUppercaseCharacter Whether the character is an uppercase letter.
     * @param containsNumericCharacter Whether the character is a numeric character.
     * @param containsNonAlphanumericCharacter Whether the character is a non-alphanumeric character.
     */
    updatePasswordCharacterOptionsStatuses(status, containsLowercaseCharacter, containsUppercaseCharacter, containsNumericCharacter, containsNonAlphanumericCharacter) {
        if (this.customStrengthOptions.containsLowercaseLetter) {
            status.containsLowercaseLetter || (status.containsLowercaseLetter = containsLowercaseCharacter);
        }
        if (this.customStrengthOptions.containsUppercaseLetter) {
            status.containsUppercaseLetter || (status.containsUppercaseLetter = containsUppercaseCharacter);
        }
        if (this.customStrengthOptions.containsNumericCharacter) {
            status.containsNumericCharacter || (status.containsNumericCharacter = containsNumericCharacter);
        }
        if (this.customStrengthOptions.containsNonAlphanumericCharacter) {
            status.containsNonAlphanumericCharacter || (status.containsNonAlphanumericCharacter = containsNonAlphanumericCharacter);
        }
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class AuthImpl {
    constructor(app, heartbeatServiceProvider, appCheckServiceProvider, config) {
        this.app = app;
        this.heartbeatServiceProvider = heartbeatServiceProvider;
        this.appCheckServiceProvider = appCheckServiceProvider;
        this.config = config;
        this.currentUser = null;
        this.emulatorConfig = null;
        this.operations = Promise.resolve();
        this.authStateSubscription = new Subscription(this);
        this.idTokenSubscription = new Subscription(this);
        this.beforeStateQueue = new AuthMiddlewareQueue(this);
        this.redirectUser = null;
        this.isProactiveRefreshEnabled = false;
        this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION = 1;
        // Any network calls will set this to true and prevent subsequent emulator
        // initialization
        this._canInitEmulator = true;
        this._isInitialized = false;
        this._deleted = false;
        this._initializationPromise = null;
        this._popupRedirectResolver = null;
        this._errorFactory = _DEFAULT_AUTH_ERROR_FACTORY;
        this._agentRecaptchaConfig = null;
        this._tenantRecaptchaConfigs = {};
        this._projectPasswordPolicy = null;
        this._tenantPasswordPolicies = {};
        // Tracks the last notified UID for state change listeners to prevent
        // repeated calls to the callbacks. Undefined means it's never been
        // called, whereas null means it's been called with a signed out user
        this.lastNotifiedUid = undefined;
        this.languageCode = null;
        this.tenantId = null;
        this.settings = { appVerificationDisabledForTesting: false };
        this.frameworks = [];
        this.name = app.name;
        this.clientVersion = config.sdkClientVersion;
    }
    _initializeWithPersistence(persistenceHierarchy, popupRedirectResolver) {
        if (popupRedirectResolver) {
            this._popupRedirectResolver = _getInstance(popupRedirectResolver);
        }
        // Have to check for app deletion throughout initialization (after each
        // promise resolution)
        this._initializationPromise = this.queue(async () => {
            var _a, _b;
            if (this._deleted) {
                return;
            }
            this.persistenceManager = await PersistenceUserManager.create(this, persistenceHierarchy);
            if (this._deleted) {
                return;
            }
            // Initialize the resolver early if necessary (only applicable to web:
            // this will cause the iframe to load immediately in certain cases)
            if ((_a = this._popupRedirectResolver) === null || _a === void 0 ? void 0 : _a._shouldInitProactively) {
                // If this fails, don't halt auth loading
                try {
                    await this._popupRedirectResolver._initialize(this);
                }
                catch (e) {
                    /* Ignore the error */
                }
            }
            await this.initializeCurrentUser(popupRedirectResolver);
            this.lastNotifiedUid = ((_b = this.currentUser) === null || _b === void 0 ? void 0 : _b.uid) || null;
            if (this._deleted) {
                return;
            }
            this._isInitialized = true;
        });
        return this._initializationPromise;
    }
    /**
     * If the persistence is changed in another window, the user manager will let us know
     */
    async _onStorageEvent() {
        if (this._deleted) {
            return;
        }
        const user = await this.assertedPersistence.getCurrentUser();
        if (!this.currentUser && !user) {
            // No change, do nothing (was signed out and remained signed out).
            return;
        }
        // If the same user is to be synchronized.
        if (this.currentUser && user && this.currentUser.uid === user.uid) {
            // Data update, simply copy data changes.
            this._currentUser._assign(user);
            // If tokens changed from previous user tokens, this will trigger
            // notifyAuthListeners_.
            await this.currentUser.getIdToken();
            return;
        }
        // Update current Auth state. Either a new login or logout.
        // Skip blocking callbacks, they should not apply to a change in another tab.
        await this._updateCurrentUser(user, /* skipBeforeStateCallbacks */ true);
    }
    async initializeCurrentUser(popupRedirectResolver) {
        var _a;
        // First check to see if we have a pending redirect event.
        const previouslyStoredUser = (await this.assertedPersistence.getCurrentUser());
        let futureCurrentUser = previouslyStoredUser;
        let needsTocheckMiddleware = false;
        if (popupRedirectResolver && this.config.authDomain) {
            await this.getOrInitRedirectPersistenceManager();
            const redirectUserEventId = (_a = this.redirectUser) === null || _a === void 0 ? void 0 : _a._redirectEventId;
            const storedUserEventId = futureCurrentUser === null || futureCurrentUser === void 0 ? void 0 : futureCurrentUser._redirectEventId;
            const result = await this.tryRedirectSignIn(popupRedirectResolver);
            // If the stored user (i.e. the old "currentUser") has a redirectId that
            // matches the redirect user, then we want to initially sign in with the
            // new user object from result.
            // TODO(samgho): More thoroughly test all of this
            if ((!redirectUserEventId || redirectUserEventId === storedUserEventId) &&
                (result === null || result === void 0 ? void 0 : result.user)) {
                futureCurrentUser = result.user;
                needsTocheckMiddleware = true;
            }
        }
        // If no user in persistence, there is no current user. Set to null.
        if (!futureCurrentUser) {
            return this.directlySetCurrentUser(null);
        }
        if (!futureCurrentUser._redirectEventId) {
            // This isn't a redirect link operation, we can reload and bail.
            // First though, ensure that we check the middleware is happy.
            if (needsTocheckMiddleware) {
                try {
                    await this.beforeStateQueue.runMiddleware(futureCurrentUser);
                }
                catch (e) {
                    futureCurrentUser = previouslyStoredUser;
                    // We know this is available since the bit is only set when the
                    // resolver is available
                    this._popupRedirectResolver._overrideRedirectResult(this, () => Promise.reject(e));
                }
            }
            if (futureCurrentUser) {
                return this.reloadAndSetCurrentUserOrClear(futureCurrentUser);
            }
            else {
                return this.directlySetCurrentUser(null);
            }
        }
        _assert(this._popupRedirectResolver, this, "argument-error" /* AuthErrorCode.ARGUMENT_ERROR */);
        await this.getOrInitRedirectPersistenceManager();
        // If the redirect user's event ID matches the current user's event ID,
        // DO NOT reload the current user, otherwise they'll be cleared from storage.
        // This is important for the reauthenticateWithRedirect() flow.
        if (this.redirectUser &&
            this.redirectUser._redirectEventId === futureCurrentUser._redirectEventId) {
            return this.directlySetCurrentUser(futureCurrentUser);
        }
        return this.reloadAndSetCurrentUserOrClear(futureCurrentUser);
    }
    async tryRedirectSignIn(redirectResolver) {
        // The redirect user needs to be checked (and signed in if available)
        // during auth initialization. All of the normal sign in and link/reauth
        // flows call back into auth and push things onto the promise queue. We
        // need to await the result of the redirect sign in *inside the promise
        // queue*. This presents a problem: we run into deadlock. See:
        //    ┌> [Initialization] ─────┐
        //    ┌> [<other queue tasks>] │
        //    └─ [getRedirectResult] <─┘
        //    where [] are tasks on the queue and arrows denote awaits
        // Initialization will never complete because it's waiting on something
        // that's waiting for initialization to complete!
        //
        // Instead, this method calls getRedirectResult() (stored in
        // _completeRedirectFn) with an optional parameter that instructs all of
        // the underlying auth operations to skip anything that mutates auth state.
        let result = null;
        try {
            // We know this._popupRedirectResolver is set since redirectResolver
            // is passed in. The _completeRedirectFn expects the unwrapped extern.
            result = await this._popupRedirectResolver._completeRedirectFn(this, redirectResolver, true);
        }
        catch (e) {
            // Swallow any errors here; the code can retrieve them in
            // getRedirectResult().
            await this._setRedirectUser(null);
        }
        return result;
    }
    async reloadAndSetCurrentUserOrClear(user) {
        try {
            await _reloadWithoutSaving(user);
        }
        catch (e) {
            if ((e === null || e === void 0 ? void 0 : e.code) !==
                `auth/${"network-request-failed" /* AuthErrorCode.NETWORK_REQUEST_FAILED */}`) {
                // Something's wrong with the user's token. Log them out and remove
                // them from storage
                return this.directlySetCurrentUser(null);
            }
        }
        return this.directlySetCurrentUser(user);
    }
    useDeviceLanguage() {
        this.languageCode = _getUserLanguage();
    }
    async _delete() {
        this._deleted = true;
    }
    async updateCurrentUser(userExtern) {
        // The public updateCurrentUser method needs to make a copy of the user,
        // and also check that the project matches
        const user = userExtern
            ? getModularInstance(userExtern)
            : null;
        if (user) {
            _assert(user.auth.config.apiKey === this.config.apiKey, this, "invalid-user-token" /* AuthErrorCode.INVALID_AUTH */);
        }
        return this._updateCurrentUser(user && user._clone(this));
    }
    async _updateCurrentUser(user, skipBeforeStateCallbacks = false) {
        if (this._deleted) {
            return;
        }
        if (user) {
            _assert(this.tenantId === user.tenantId, this, "tenant-id-mismatch" /* AuthErrorCode.TENANT_ID_MISMATCH */);
        }
        if (!skipBeforeStateCallbacks) {
            await this.beforeStateQueue.runMiddleware(user);
        }
        return this.queue(async () => {
            await this.directlySetCurrentUser(user);
            this.notifyAuthListeners();
        });
    }
    async signOut() {
        // Run first, to block _setRedirectUser() if any callbacks fail.
        await this.beforeStateQueue.runMiddleware(null);
        // Clear the redirect user when signOut is called
        if (this.redirectPersistenceManager || this._popupRedirectResolver) {
            await this._setRedirectUser(null);
        }
        // Prevent callbacks from being called again in _updateCurrentUser, as
        // they were already called in the first line.
        return this._updateCurrentUser(null, /* skipBeforeStateCallbacks */ true);
    }
    setPersistence(persistence) {
        return this.queue(async () => {
            await this.assertedPersistence.setPersistence(_getInstance(persistence));
        });
    }
    _getRecaptchaConfig() {
        if (this.tenantId == null) {
            return this._agentRecaptchaConfig;
        }
        else {
            return this._tenantRecaptchaConfigs[this.tenantId];
        }
    }
    async validatePassword(password) {
        if (!this._getPasswordPolicyInternal()) {
            await this._updatePasswordPolicy();
        }
        // Password policy will be defined after fetching.
        const passwordPolicy = this._getPasswordPolicyInternal();
        // Check that the policy schema version is supported by the SDK.
        // TODO: Update this logic to use a max supported policy schema version once we have multiple schema versions.
        if (passwordPolicy.schemaVersion !==
            this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION) {
            return Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version" /* AuthErrorCode.UNSUPPORTED_PASSWORD_POLICY_SCHEMA_VERSION */, {}));
        }
        return passwordPolicy.validatePassword(password);
    }
    _getPasswordPolicyInternal() {
        if (this.tenantId === null) {
            return this._projectPasswordPolicy;
        }
        else {
            return this._tenantPasswordPolicies[this.tenantId];
        }
    }
    async _updatePasswordPolicy() {
        const response = await _getPasswordPolicy(this);
        const passwordPolicy = new PasswordPolicyImpl(response);
        if (this.tenantId === null) {
            this._projectPasswordPolicy = passwordPolicy;
        }
        else {
            this._tenantPasswordPolicies[this.tenantId] = passwordPolicy;
        }
    }
    _getPersistence() {
        return this.assertedPersistence.persistence.type;
    }
    _updateErrorMap(errorMap) {
        this._errorFactory = new ErrorFactory('auth', 'Firebase', errorMap());
    }
    onAuthStateChanged(nextOrObserver, error, completed) {
        return this.registerStateListener(this.authStateSubscription, nextOrObserver, error, completed);
    }
    beforeAuthStateChanged(callback, onAbort) {
        return this.beforeStateQueue.pushCallback(callback, onAbort);
    }
    onIdTokenChanged(nextOrObserver, error, completed) {
        return this.registerStateListener(this.idTokenSubscription, nextOrObserver, error, completed);
    }
    authStateReady() {
        return new Promise((resolve, reject) => {
            if (this.currentUser) {
                resolve();
            }
            else {
                const unsubscribe = this.onAuthStateChanged(() => {
                    unsubscribe();
                    resolve();
                }, reject);
            }
        });
    }
    /**
     * Revokes the given access token. Currently only supports Apple OAuth access tokens.
     */
    async revokeAccessToken(token) {
        if (this.currentUser) {
            const idToken = await this.currentUser.getIdToken();
            // Generalize this to accept other providers once supported.
            const request = {
                providerId: 'apple.com',
                tokenType: "ACCESS_TOKEN" /* TokenType.ACCESS_TOKEN */,
                token,
                idToken
            };
            if (this.tenantId != null) {
                request.tenantId = this.tenantId;
            }
            await revokeToken(this, request);
        }
    }
    toJSON() {
        var _a;
        return {
            apiKey: this.config.apiKey,
            authDomain: this.config.authDomain,
            appName: this.name,
            currentUser: (_a = this._currentUser) === null || _a === void 0 ? void 0 : _a.toJSON()
        };
    }
    async _setRedirectUser(user, popupRedirectResolver) {
        const redirectManager = await this.getOrInitRedirectPersistenceManager(popupRedirectResolver);
        return user === null
            ? redirectManager.removeCurrentUser()
            : redirectManager.setCurrentUser(user);
    }
    async getOrInitRedirectPersistenceManager(popupRedirectResolver) {
        if (!this.redirectPersistenceManager) {
            const resolver = (popupRedirectResolver && _getInstance(popupRedirectResolver)) ||
                this._popupRedirectResolver;
            _assert(resolver, this, "argument-error" /* AuthErrorCode.ARGUMENT_ERROR */);
            this.redirectPersistenceManager = await PersistenceUserManager.create(this, [_getInstance(resolver._redirectPersistence)], "redirectUser" /* KeyName.REDIRECT_USER */);
            this.redirectUser =
                await this.redirectPersistenceManager.getCurrentUser();
        }
        return this.redirectPersistenceManager;
    }
    async _redirectUserForId(id) {
        var _a, _b;
        // Make sure we've cleared any pending persistence actions if we're not in
        // the initializer
        if (this._isInitialized) {
            await this.queue(async () => { });
        }
        if (((_a = this._currentUser) === null || _a === void 0 ? void 0 : _a._redirectEventId) === id) {
            return this._currentUser;
        }
        if (((_b = this.redirectUser) === null || _b === void 0 ? void 0 : _b._redirectEventId) === id) {
            return this.redirectUser;
        }
        return null;
    }
    async _persistUserIfCurrent(user) {
        if (user === this.currentUser) {
            return this.queue(async () => this.directlySetCurrentUser(user));
        }
    }
    /** Notifies listeners only if the user is current */
    _notifyListenersIfCurrent(user) {
        if (user === this.currentUser) {
            this.notifyAuthListeners();
        }
    }
    _key() {
        return `${this.config.authDomain}:${this.config.apiKey}:${this.name}`;
    }
    _startProactiveRefresh() {
        this.isProactiveRefreshEnabled = true;
        if (this.currentUser) {
            this._currentUser._startProactiveRefresh();
        }
    }
    _stopProactiveRefresh() {
        this.isProactiveRefreshEnabled = false;
        if (this.currentUser) {
            this._currentUser._stopProactiveRefresh();
        }
    }
    /** Returns the current user cast as the internal type */
    get _currentUser() {
        return this.currentUser;
    }
    notifyAuthListeners() {
        var _a, _b;
        if (!this._isInitialized) {
            return;
        }
        this.idTokenSubscription.next(this.currentUser);
        const currentUid = (_b = (_a = this.currentUser) === null || _a === void 0 ? void 0 : _a.uid) !== null && _b !== void 0 ? _b : null;
        if (this.lastNotifiedUid !== currentUid) {
            this.lastNotifiedUid = currentUid;
            this.authStateSubscription.next(this.currentUser);
        }
    }
    registerStateListener(subscription, nextOrObserver, error, completed) {
        if (this._deleted) {
            return () => { };
        }
        const cb = typeof nextOrObserver === 'function'
            ? nextOrObserver
            : nextOrObserver.next.bind(nextOrObserver);
        let isUnsubscribed = false;
        const promise = this._isInitialized
            ? Promise.resolve()
            : this._initializationPromise;
        _assert(promise, this, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        // The callback needs to be called asynchronously per the spec.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        promise.then(() => {
            if (isUnsubscribed) {
                return;
            }
            cb(this.currentUser);
        });
        if (typeof nextOrObserver === 'function') {
            const unsubscribe = subscription.addObserver(nextOrObserver, error, completed);
            return () => {
                isUnsubscribed = true;
                unsubscribe();
            };
        }
        else {
            const unsubscribe = subscription.addObserver(nextOrObserver);
            return () => {
                isUnsubscribed = true;
                unsubscribe();
            };
        }
    }
    /**
     * Unprotected (from race conditions) method to set the current user. This
     * should only be called from within a queued callback. This is necessary
     * because the queue shouldn't rely on another queued callback.
     */
    async directlySetCurrentUser(user) {
        if (this.currentUser && this.currentUser !== user) {
            this._currentUser._stopProactiveRefresh();
        }
        if (user && this.isProactiveRefreshEnabled) {
            user._startProactiveRefresh();
        }
        this.currentUser = user;
        if (user) {
            await this.assertedPersistence.setCurrentUser(user);
        }
        else {
            await this.assertedPersistence.removeCurrentUser();
        }
    }
    queue(action) {
        // In case something errors, the callback still should be called in order
        // to keep the promise chain alive
        this.operations = this.operations.then(action, action);
        return this.operations;
    }
    get assertedPersistence() {
        _assert(this.persistenceManager, this, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        return this.persistenceManager;
    }
    _logFramework(framework) {
        if (!framework || this.frameworks.includes(framework)) {
            return;
        }
        this.frameworks.push(framework);
        // Sort alphabetically so that "FirebaseCore-web,FirebaseUI-web" and
        // "FirebaseUI-web,FirebaseCore-web" aren't viewed as different.
        this.frameworks.sort();
        this.clientVersion = _getClientVersion(this.config.clientPlatform, this._getFrameworks());
    }
    _getFrameworks() {
        return this.frameworks;
    }
    async _getAdditionalHeaders() {
        var _a;
        // Additional headers on every request
        const headers = {
            ["X-Client-Version" /* HttpHeader.X_CLIENT_VERSION */]: this.clientVersion
        };
        if (this.app.options.appId) {
            headers["X-Firebase-gmpid" /* HttpHeader.X_FIREBASE_GMPID */] = this.app.options.appId;
        }
        // If the heartbeat service exists, add the heartbeat string
        const heartbeatsHeader = await ((_a = this.heartbeatServiceProvider
            .getImmediate({
            optional: true
        })) === null || _a === void 0 ? void 0 : _a.getHeartbeatsHeader());
        if (heartbeatsHeader) {
            headers["X-Firebase-Client" /* HttpHeader.X_FIREBASE_CLIENT */] = heartbeatsHeader;
        }
        // If the App Check service exists, add the App Check token in the headers
        const appCheckToken = await this._getAppCheckToken();
        if (appCheckToken) {
            headers["X-Firebase-AppCheck" /* HttpHeader.X_FIREBASE_APP_CHECK */] = appCheckToken;
        }
        return headers;
    }
    async _getAppCheckToken() {
        var _a;
        const appCheckTokenResult = await ((_a = this.appCheckServiceProvider
            .getImmediate({ optional: true })) === null || _a === void 0 ? void 0 : _a.getToken());
        if (appCheckTokenResult === null || appCheckTokenResult === void 0 ? void 0 : appCheckTokenResult.error) {
            // Context: appCheck.getToken() will never throw even if an error happened.
            // In the error case, a dummy token will be returned along with an error field describing
            // the error. In general, we shouldn't care about the error condition and just use
            // the token (actual or dummy) to send requests.
            _logWarn(`Error while retrieving App Check token: ${appCheckTokenResult.error}`);
        }
        return appCheckTokenResult === null || appCheckTokenResult === void 0 ? void 0 : appCheckTokenResult.token;
    }
}
/**
 * Method to be used to cast down to our private implmentation of Auth.
 * It will also handle unwrapping from the compat type if necessary
 *
 * @param auth Auth object passed in from developer
 */
function _castAuth(auth) {
    return getModularInstance(auth);
}
/** Helper class to wrap subscriber logic */
class Subscription {
    constructor(auth) {
        this.auth = auth;
        this.observer = null;
        this.addObserver = createSubscribe(observer => (this.observer = observer));
    }
    get next() {
        _assert(this.observer, this.auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        return this.observer.next.bind(this.observer);
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function getScriptParentElement() {
    var _a, _b;
    return (_b = (_a = document.getElementsByTagName('head')) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : document;
}
function _loadJS(url) {
    // TODO: consider adding timeout support & cancellation
    return new Promise((resolve, reject) => {
        const el = document.createElement('script');
        el.setAttribute('src', url);
        el.onload = resolve;
        el.onerror = e => {
            const error = _createError("internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
            error.customData = e;
            reject(error);
        };
        el.type = 'text/javascript';
        el.charset = 'UTF-8';
        getScriptParentElement().appendChild(el);
    });
}
function _generateCallbackName(prefix) {
    return `__${prefix}${Math.floor(Math.random() * 1000000)}`;
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Initializes an {@link Auth} instance with fine-grained control over
 * {@link Dependencies}.
 *
 * @remarks
 *
 * This function allows more control over the {@link Auth} instance than
 * {@link getAuth}. `getAuth` uses platform-specific defaults to supply
 * the {@link Dependencies}. In general, `getAuth` is the easiest way to
 * initialize Auth and works for most use cases. Use `initializeAuth` if you
 * need control over which persistence layer is used, or to minimize bundle
 * size if you're not using either `signInWithPopup` or `signInWithRedirect`.
 *
 * For example, if your app only uses anonymous accounts and you only want
 * accounts saved for the current session, initialize `Auth` with:
 *
 * ```js
 * const auth = initializeAuth(app, {
 *   persistence: browserSessionPersistence,
 *   popupRedirectResolver: undefined,
 * });
 * ```
 *
 * @public
 */
function initializeAuth(app, deps) {
    const provider = _getProvider(app, 'auth');
    if (provider.isInitialized()) {
        const auth = provider.getImmediate();
        const initialOptions = provider.getOptions();
        if (deepEqual(initialOptions, deps !== null && deps !== void 0 ? deps : {})) {
            return auth;
        }
        else {
            _fail(auth, "already-initialized" /* AuthErrorCode.ALREADY_INITIALIZED */);
        }
    }
    const auth = provider.initialize({ options: deps });
    return auth;
}
function _initializeAuthInstance(auth, deps) {
    const persistence = (deps === null || deps === void 0 ? void 0 : deps.persistence) || [];
    const hierarchy = (Array.isArray(persistence) ? persistence : [persistence]).map(_getInstance);
    if (deps === null || deps === void 0 ? void 0 : deps.errorMap) {
        auth._updateErrorMap(deps.errorMap);
    }
    // This promise is intended to float; auth initialization happens in the
    // background, meanwhile the auth object may be used by the app.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    auth._initializeWithPersistence(hierarchy, deps === null || deps === void 0 ? void 0 : deps.popupRedirectResolver);
}

/**
 * Changes the {@link Auth} instance to communicate with the Firebase Auth Emulator, instead of production
 * Firebase Auth services.
 *
 * @remarks
 * This must be called synchronously immediately following the first call to
 * {@link initializeAuth}.  Do not use with production credentials as emulator
 * traffic is not encrypted.
 *
 *
 * @example
 * ```javascript
 * connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
 * ```
 *
 * @param auth - The {@link Auth} instance.
 * @param url - The URL at which the emulator is running (eg, 'http://localhost:9099').
 * @param options - Optional. `options.disableWarnings` defaults to `false`. Set it to
 * `true` to disable the warning banner attached to the DOM.
 *
 * @public
 */
function connectAuthEmulator(auth, url, options) {
    const authInternal = _castAuth(auth);
    _assert(authInternal._canInitEmulator, authInternal, "emulator-config-failed" /* AuthErrorCode.EMULATOR_CONFIG_FAILED */);
    _assert(/^https?:\/\//.test(url), authInternal, "invalid-emulator-scheme" /* AuthErrorCode.INVALID_EMULATOR_SCHEME */);
    const disableWarnings = !!(options === null || options === void 0 ? void 0 : options.disableWarnings);
    const protocol = extractProtocol(url);
    const { host, port } = extractHostAndPort(url);
    const portStr = port === null ? '' : `:${port}`;
    // Always replace path with "/" (even if input url had no path at all, or had a different one).
    authInternal.config.emulator = { url: `${protocol}//${host}${portStr}/` };
    authInternal.settings.appVerificationDisabledForTesting = true;
    authInternal.emulatorConfig = Object.freeze({
        host,
        port,
        protocol: protocol.replace(':', ''),
        options: Object.freeze({ disableWarnings })
    });
    if (!disableWarnings) {
        emitEmulatorWarning();
    }
}
function extractProtocol(url) {
    const protocolEnd = url.indexOf(':');
    return protocolEnd < 0 ? '' : url.substr(0, protocolEnd + 1);
}
function extractHostAndPort(url) {
    const protocol = extractProtocol(url);
    const authority = /(\/\/)?([^?#/]+)/.exec(url.substr(protocol.length)); // Between // and /, ? or #.
    if (!authority) {
        return { host: '', port: null };
    }
    const hostAndPort = authority[2].split('@').pop() || ''; // Strip out "username:password@".
    const bracketedIPv6 = /^(\[[^\]]+\])(:|$)/.exec(hostAndPort);
    if (bracketedIPv6) {
        const host = bracketedIPv6[1];
        return { host, port: parsePort(hostAndPort.substr(host.length + 1)) };
    }
    else {
        const [host, port] = hostAndPort.split(':');
        return { host, port: parsePort(port) };
    }
}
function parsePort(portStr) {
    if (!portStr) {
        return null;
    }
    const port = Number(portStr);
    if (isNaN(port)) {
        return null;
    }
    return port;
}
function emitEmulatorWarning() {
    function attachBanner() {
        const el = document.createElement('p');
        const sty = el.style;
        el.innerText =
            'Running in emulator mode. Do not use with production credentials.';
        sty.position = 'fixed';
        sty.width = '100%';
        sty.backgroundColor = '#ffffff';
        sty.border = '.1em solid #000000';
        sty.color = '#b50000';
        sty.bottom = '0px';
        sty.left = '0px';
        sty.margin = '0px';
        sty.zIndex = '10000';
        sty.textAlign = 'center';
        el.classList.add('firebase-emulator-warning');
        document.body.appendChild(el);
    }
    if (typeof console !== 'undefined' && typeof console.info === 'function') {
        console.info('WARNING: You are using the Auth Emulator,' +
            ' which is intended for local testing only.  Do not use with' +
            ' production credentials.');
    }
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', attachBanner);
        }
        else {
            attachBanner();
        }
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Interface that represents the credentials returned by an {@link AuthProvider}.
 *
 * @remarks
 * Implementations specify the details about each auth provider's credential requirements.
 *
 * @public
 */
class AuthCredential {
    /** @internal */
    constructor(
    /**
     * The authentication provider ID for the credential.
     *
     * @remarks
     * For example, 'facebook.com', or 'google.com'.
     */
    providerId, 
    /**
     * The authentication sign in method for the credential.
     *
     * @remarks
     * For example, {@link SignInMethod}.EMAIL_PASSWORD, or
     * {@link SignInMethod}.EMAIL_LINK. This corresponds to the sign-in method
     * identifier as returned in {@link fetchSignInMethodsForEmail}.
     */
    signInMethod) {
        this.providerId = providerId;
        this.signInMethod = signInMethod;
    }
    /**
     * Returns a JSON-serializable representation of this object.
     *
     * @returns a JSON-serializable representation of this object.
     */
    toJSON() {
        return debugFail('not implemented');
    }
    /** @internal */
    _getIdTokenResponse(_auth) {
        return debugFail('not implemented');
    }
    /** @internal */
    _linkToIdToken(_auth, _idToken) {
        return debugFail('not implemented');
    }
    /** @internal */
    _getReauthenticationResolver(_auth) {
        return debugFail('not implemented');
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function signInWithIdp(auth, request) {
    return _performSignInRequest(auth, "POST" /* HttpMethod.POST */, "/v1/accounts:signInWithIdp" /* Endpoint.SIGN_IN_WITH_IDP */, _addTidIfNecessary(auth, request));
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const IDP_REQUEST_URI$1 = 'http://localhost';
/**
 * Represents the OAuth credentials returned by an {@link OAuthProvider}.
 *
 * @remarks
 * Implementations specify the details about each auth provider's credential requirements.
 *
 * @public
 */
class OAuthCredential extends AuthCredential {
    constructor() {
        super(...arguments);
        this.pendingToken = null;
    }
    /** @internal */
    static _fromParams(params) {
        const cred = new OAuthCredential(params.providerId, params.signInMethod);
        if (params.idToken || params.accessToken) {
            // OAuth 2 and either ID token or access token.
            if (params.idToken) {
                cred.idToken = params.idToken;
            }
            if (params.accessToken) {
                cred.accessToken = params.accessToken;
            }
            // Add nonce if available and no pendingToken is present.
            if (params.nonce && !params.pendingToken) {
                cred.nonce = params.nonce;
            }
            if (params.pendingToken) {
                cred.pendingToken = params.pendingToken;
            }
        }
        else if (params.oauthToken && params.oauthTokenSecret) {
            // OAuth 1 and OAuth token with token secret
            cred.accessToken = params.oauthToken;
            cred.secret = params.oauthTokenSecret;
        }
        else {
            _fail("argument-error" /* AuthErrorCode.ARGUMENT_ERROR */);
        }
        return cred;
    }
    /** {@inheritdoc AuthCredential.toJSON}  */
    toJSON() {
        return {
            idToken: this.idToken,
            accessToken: this.accessToken,
            secret: this.secret,
            nonce: this.nonce,
            pendingToken: this.pendingToken,
            providerId: this.providerId,
            signInMethod: this.signInMethod
        };
    }
    /**
     * Static method to deserialize a JSON representation of an object into an
     * {@link  AuthCredential}.
     *
     * @param json - Input can be either Object or the stringified representation of the object.
     * When string is provided, JSON.parse would be called first.
     *
     * @returns If the JSON input does not represent an {@link  AuthCredential}, null is returned.
     */
    static fromJSON(json) {
        const obj = typeof json === 'string' ? JSON.parse(json) : json;
        const { providerId, signInMethod } = obj, rest = __rest(obj, ["providerId", "signInMethod"]);
        if (!providerId || !signInMethod) {
            return null;
        }
        const cred = new OAuthCredential(providerId, signInMethod);
        cred.idToken = rest.idToken || undefined;
        cred.accessToken = rest.accessToken || undefined;
        cred.secret = rest.secret;
        cred.nonce = rest.nonce;
        cred.pendingToken = rest.pendingToken || null;
        return cred;
    }
    /** @internal */
    _getIdTokenResponse(auth) {
        const request = this.buildRequest();
        return signInWithIdp(auth, request);
    }
    /** @internal */
    _linkToIdToken(auth, idToken) {
        const request = this.buildRequest();
        request.idToken = idToken;
        return signInWithIdp(auth, request);
    }
    /** @internal */
    _getReauthenticationResolver(auth) {
        const request = this.buildRequest();
        request.autoCreate = false;
        return signInWithIdp(auth, request);
    }
    buildRequest() {
        const request = {
            requestUri: IDP_REQUEST_URI$1,
            returnSecureToken: true
        };
        if (this.pendingToken) {
            request.pendingToken = this.pendingToken;
        }
        else {
            const postBody = {};
            if (this.idToken) {
                postBody['id_token'] = this.idToken;
            }
            if (this.accessToken) {
                postBody['access_token'] = this.accessToken;
            }
            if (this.secret) {
                postBody['oauth_token_secret'] = this.secret;
            }
            postBody['providerId'] = this.providerId;
            if (this.nonce && !this.pendingToken) {
                postBody['nonce'] = this.nonce;
            }
            request.postBody = querystring(postBody);
        }
        return request;
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * The base class for all Federated providers (OAuth (including OIDC), SAML).
 *
 * This class is not meant to be instantiated directly.
 *
 * @public
 */
class FederatedAuthProvider {
    /**
     * Constructor for generic OAuth providers.
     *
     * @param providerId - Provider for which credentials should be generated.
     */
    constructor(providerId) {
        this.providerId = providerId;
        /** @internal */
        this.defaultLanguageCode = null;
        /** @internal */
        this.customParameters = {};
    }
    /**
     * Set the language gode.
     *
     * @param languageCode - language code
     */
    setDefaultLanguage(languageCode) {
        this.defaultLanguageCode = languageCode;
    }
    /**
     * Sets the OAuth custom parameters to pass in an OAuth request for popup and redirect sign-in
     * operations.
     *
     * @remarks
     * For a detailed list, check the reserved required OAuth 2.0 parameters such as `client_id`,
     * `redirect_uri`, `scope`, `response_type`, and `state` are not allowed and will be ignored.
     *
     * @param customOAuthParameters - The custom OAuth parameters to pass in the OAuth request.
     */
    setCustomParameters(customOAuthParameters) {
        this.customParameters = customOAuthParameters;
        return this;
    }
    /**
     * Retrieve the current list of {@link CustomParameters}.
     */
    getCustomParameters() {
        return this.customParameters;
    }
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Common code to all OAuth providers. This is separate from the
 * {@link OAuthProvider} so that child providers (like
 * {@link GoogleAuthProvider}) don't inherit the `credential` instance method.
 * Instead, they rely on a static `credential` method.
 */
class BaseOAuthProvider extends FederatedAuthProvider {
    constructor() {
        super(...arguments);
        /** @internal */
        this.scopes = [];
    }
    /**
     * Add an OAuth scope to the credential.
     *
     * @param scope - Provider OAuth scope to add.
     */
    addScope(scope) {
        // If not already added, add scope to list.
        if (!this.scopes.includes(scope)) {
            this.scopes.push(scope);
        }
        return this;
    }
    /**
     * Retrieve the current list of OAuth scopes.
     */
    getScopes() {
        return [...this.scopes];
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Provider for generating an {@link OAuthCredential} for {@link ProviderId}.FACEBOOK.
 *
 * @example
 * ```javascript
 * // Sign in using a redirect.
 * const provider = new FacebookAuthProvider();
 * // Start a sign in process for an unauthenticated user.
 * provider.addScope('user_birthday');
 * await signInWithRedirect(auth, provider);
 * // This will trigger a full page redirect away from your app
 *
 * // After returning from the redirect when your app initializes you can obtain the result
 * const result = await getRedirectResult(auth);
 * if (result) {
 *   // This is the signed-in user
 *   const user = result.user;
 *   // This gives you a Facebook Access Token.
 *   const credential = FacebookAuthProvider.credentialFromResult(result);
 *   const token = credential.accessToken;
 * }
 * ```
 *
 * @example
 * ```javascript
 * // Sign in using a popup.
 * const provider = new FacebookAuthProvider();
 * provider.addScope('user_birthday');
 * const result = await signInWithPopup(auth, provider);
 *
 * // The signed-in user info.
 * const user = result.user;
 * // This gives you a Facebook Access Token.
 * const credential = FacebookAuthProvider.credentialFromResult(result);
 * const token = credential.accessToken;
 * ```
 *
 * @public
 */
class FacebookAuthProvider extends BaseOAuthProvider {
    constructor() {
        super("facebook.com" /* ProviderId.FACEBOOK */);
    }
    /**
     * Creates a credential for Facebook.
     *
     * @example
     * ```javascript
     * // `event` from the Facebook auth.authResponseChange callback.
     * const credential = FacebookAuthProvider.credential(event.authResponse.accessToken);
     * const result = await signInWithCredential(credential);
     * ```
     *
     * @param accessToken - Facebook access token.
     */
    static credential(accessToken) {
        return OAuthCredential._fromParams({
            providerId: FacebookAuthProvider.PROVIDER_ID,
            signInMethod: FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD,
            accessToken
        });
    }
    /**
     * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
     *
     * @param userCredential - The user credential.
     */
    static credentialFromResult(userCredential) {
        return FacebookAuthProvider.credentialFromTaggedObject(userCredential);
    }
    /**
     * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
     * thrown during a sign-in, link, or reauthenticate operation.
     *
     * @param userCredential - The user credential.
     */
    static credentialFromError(error) {
        return FacebookAuthProvider.credentialFromTaggedObject((error.customData || {}));
    }
    static credentialFromTaggedObject({ _tokenResponse: tokenResponse }) {
        if (!tokenResponse || !('oauthAccessToken' in tokenResponse)) {
            return null;
        }
        if (!tokenResponse.oauthAccessToken) {
            return null;
        }
        try {
            return FacebookAuthProvider.credential(tokenResponse.oauthAccessToken);
        }
        catch (_a) {
            return null;
        }
    }
}
/** Always set to {@link SignInMethod}.FACEBOOK. */
FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD = "facebook.com" /* SignInMethod.FACEBOOK */;
/** Always set to {@link ProviderId}.FACEBOOK. */
FacebookAuthProvider.PROVIDER_ID = "facebook.com" /* ProviderId.FACEBOOK */;

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Provider for generating an an {@link OAuthCredential} for {@link ProviderId}.GOOGLE.
 *
 * @example
 * ```javascript
 * // Sign in using a redirect.
 * const provider = new GoogleAuthProvider();
 * // Start a sign in process for an unauthenticated user.
 * provider.addScope('profile');
 * provider.addScope('email');
 * await signInWithRedirect(auth, provider);
 * // This will trigger a full page redirect away from your app
 *
 * // After returning from the redirect when your app initializes you can obtain the result
 * const result = await getRedirectResult(auth);
 * if (result) {
 *   // This is the signed-in user
 *   const user = result.user;
 *   // This gives you a Google Access Token.
 *   const credential = GoogleAuthProvider.credentialFromResult(result);
 *   const token = credential.accessToken;
 * }
 * ```
 *
 * @example
 * ```javascript
 * // Sign in using a popup.
 * const provider = new GoogleAuthProvider();
 * provider.addScope('profile');
 * provider.addScope('email');
 * const result = await signInWithPopup(auth, provider);
 *
 * // The signed-in user info.
 * const user = result.user;
 * // This gives you a Google Access Token.
 * const credential = GoogleAuthProvider.credentialFromResult(result);
 * const token = credential.accessToken;
 * ```
 *
 * @public
 */
class GoogleAuthProvider extends BaseOAuthProvider {
    constructor() {
        super("google.com" /* ProviderId.GOOGLE */);
        this.addScope('profile');
    }
    /**
     * Creates a credential for Google. At least one of ID token and access token is required.
     *
     * @example
     * ```javascript
     * // \`googleUser\` from the onsuccess Google Sign In callback.
     * const credential = GoogleAuthProvider.credential(googleUser.getAuthResponse().id_token);
     * const result = await signInWithCredential(credential);
     * ```
     *
     * @param idToken - Google ID token.
     * @param accessToken - Google access token.
     */
    static credential(idToken, accessToken) {
        return OAuthCredential._fromParams({
            providerId: GoogleAuthProvider.PROVIDER_ID,
            signInMethod: GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD,
            idToken,
            accessToken
        });
    }
    /**
     * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
     *
     * @param userCredential - The user credential.
     */
    static credentialFromResult(userCredential) {
        return GoogleAuthProvider.credentialFromTaggedObject(userCredential);
    }
    /**
     * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
     * thrown during a sign-in, link, or reauthenticate operation.
     *
     * @param userCredential - The user credential.
     */
    static credentialFromError(error) {
        return GoogleAuthProvider.credentialFromTaggedObject((error.customData || {}));
    }
    static credentialFromTaggedObject({ _tokenResponse: tokenResponse }) {
        if (!tokenResponse) {
            return null;
        }
        const { oauthIdToken, oauthAccessToken } = tokenResponse;
        if (!oauthIdToken && !oauthAccessToken) {
            // This could be an oauth 1 credential or a phone credential
            return null;
        }
        try {
            return GoogleAuthProvider.credential(oauthIdToken, oauthAccessToken);
        }
        catch (_a) {
            return null;
        }
    }
}
/** Always set to {@link SignInMethod}.GOOGLE. */
GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD = "google.com" /* SignInMethod.GOOGLE */;
/** Always set to {@link ProviderId}.GOOGLE. */
GoogleAuthProvider.PROVIDER_ID = "google.com" /* ProviderId.GOOGLE */;

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Provider for generating an {@link OAuthCredential} for {@link ProviderId}.GITHUB.
 *
 * @remarks
 * GitHub requires an OAuth 2.0 redirect, so you can either handle the redirect directly, or use
 * the {@link signInWithPopup} handler:
 *
 * @example
 * ```javascript
 * // Sign in using a redirect.
 * const provider = new GithubAuthProvider();
 * // Start a sign in process for an unauthenticated user.
 * provider.addScope('repo');
 * await signInWithRedirect(auth, provider);
 * // This will trigger a full page redirect away from your app
 *
 * // After returning from the redirect when your app initializes you can obtain the result
 * const result = await getRedirectResult(auth);
 * if (result) {
 *   // This is the signed-in user
 *   const user = result.user;
 *   // This gives you a Github Access Token.
 *   const credential = GithubAuthProvider.credentialFromResult(result);
 *   const token = credential.accessToken;
 * }
 * ```
 *
 * @example
 * ```javascript
 * // Sign in using a popup.
 * const provider = new GithubAuthProvider();
 * provider.addScope('repo');
 * const result = await signInWithPopup(auth, provider);
 *
 * // The signed-in user info.
 * const user = result.user;
 * // This gives you a Github Access Token.
 * const credential = GithubAuthProvider.credentialFromResult(result);
 * const token = credential.accessToken;
 * ```
 * @public
 */
class GithubAuthProvider extends BaseOAuthProvider {
    constructor() {
        super("github.com" /* ProviderId.GITHUB */);
    }
    /**
     * Creates a credential for Github.
     *
     * @param accessToken - Github access token.
     */
    static credential(accessToken) {
        return OAuthCredential._fromParams({
            providerId: GithubAuthProvider.PROVIDER_ID,
            signInMethod: GithubAuthProvider.GITHUB_SIGN_IN_METHOD,
            accessToken
        });
    }
    /**
     * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
     *
     * @param userCredential - The user credential.
     */
    static credentialFromResult(userCredential) {
        return GithubAuthProvider.credentialFromTaggedObject(userCredential);
    }
    /**
     * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
     * thrown during a sign-in, link, or reauthenticate operation.
     *
     * @param userCredential - The user credential.
     */
    static credentialFromError(error) {
        return GithubAuthProvider.credentialFromTaggedObject((error.customData || {}));
    }
    static credentialFromTaggedObject({ _tokenResponse: tokenResponse }) {
        if (!tokenResponse || !('oauthAccessToken' in tokenResponse)) {
            return null;
        }
        if (!tokenResponse.oauthAccessToken) {
            return null;
        }
        try {
            return GithubAuthProvider.credential(tokenResponse.oauthAccessToken);
        }
        catch (_a) {
            return null;
        }
    }
}
/** Always set to {@link SignInMethod}.GITHUB. */
GithubAuthProvider.GITHUB_SIGN_IN_METHOD = "github.com" /* SignInMethod.GITHUB */;
/** Always set to {@link ProviderId}.GITHUB. */
GithubAuthProvider.PROVIDER_ID = "github.com" /* ProviderId.GITHUB */;

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Provider for generating an {@link OAuthCredential} for {@link ProviderId}.TWITTER.
 *
 * @example
 * ```javascript
 * // Sign in using a redirect.
 * const provider = new TwitterAuthProvider();
 * // Start a sign in process for an unauthenticated user.
 * await signInWithRedirect(auth, provider);
 * // This will trigger a full page redirect away from your app
 *
 * // After returning from the redirect when your app initializes you can obtain the result
 * const result = await getRedirectResult(auth);
 * if (result) {
 *   // This is the signed-in user
 *   const user = result.user;
 *   // This gives you a Twitter Access Token and Secret.
 *   const credential = TwitterAuthProvider.credentialFromResult(result);
 *   const token = credential.accessToken;
 *   const secret = credential.secret;
 * }
 * ```
 *
 * @example
 * ```javascript
 * // Sign in using a popup.
 * const provider = new TwitterAuthProvider();
 * const result = await signInWithPopup(auth, provider);
 *
 * // The signed-in user info.
 * const user = result.user;
 * // This gives you a Twitter Access Token and Secret.
 * const credential = TwitterAuthProvider.credentialFromResult(result);
 * const token = credential.accessToken;
 * const secret = credential.secret;
 * ```
 *
 * @public
 */
class TwitterAuthProvider extends BaseOAuthProvider {
    constructor() {
        super("twitter.com" /* ProviderId.TWITTER */);
    }
    /**
     * Creates a credential for Twitter.
     *
     * @param token - Twitter access token.
     * @param secret - Twitter secret.
     */
    static credential(token, secret) {
        return OAuthCredential._fromParams({
            providerId: TwitterAuthProvider.PROVIDER_ID,
            signInMethod: TwitterAuthProvider.TWITTER_SIGN_IN_METHOD,
            oauthToken: token,
            oauthTokenSecret: secret
        });
    }
    /**
     * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
     *
     * @param userCredential - The user credential.
     */
    static credentialFromResult(userCredential) {
        return TwitterAuthProvider.credentialFromTaggedObject(userCredential);
    }
    /**
     * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
     * thrown during a sign-in, link, or reauthenticate operation.
     *
     * @param userCredential - The user credential.
     */
    static credentialFromError(error) {
        return TwitterAuthProvider.credentialFromTaggedObject((error.customData || {}));
    }
    static credentialFromTaggedObject({ _tokenResponse: tokenResponse }) {
        if (!tokenResponse) {
            return null;
        }
        const { oauthAccessToken, oauthTokenSecret } = tokenResponse;
        if (!oauthAccessToken || !oauthTokenSecret) {
            return null;
        }
        try {
            return TwitterAuthProvider.credential(oauthAccessToken, oauthTokenSecret);
        }
        catch (_a) {
            return null;
        }
    }
}
/** Always set to {@link SignInMethod}.TWITTER. */
TwitterAuthProvider.TWITTER_SIGN_IN_METHOD = "twitter.com" /* SignInMethod.TWITTER */;
/** Always set to {@link ProviderId}.TWITTER. */
TwitterAuthProvider.PROVIDER_ID = "twitter.com" /* ProviderId.TWITTER */;

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class UserCredentialImpl {
    constructor(params) {
        this.user = params.user;
        this.providerId = params.providerId;
        this._tokenResponse = params._tokenResponse;
        this.operationType = params.operationType;
    }
    static async _fromIdTokenResponse(auth, operationType, idTokenResponse, isAnonymous = false) {
        const user = await UserImpl._fromIdTokenResponse(auth, idTokenResponse, isAnonymous);
        const providerId = providerIdForResponse(idTokenResponse);
        const userCred = new UserCredentialImpl({
            user,
            providerId,
            _tokenResponse: idTokenResponse,
            operationType
        });
        return userCred;
    }
    static async _forOperation(user, operationType, response) {
        await user._updateTokensIfNecessary(response, /* reload */ true);
        const providerId = providerIdForResponse(response);
        return new UserCredentialImpl({
            user,
            providerId,
            _tokenResponse: response,
            operationType
        });
    }
}
function providerIdForResponse(response) {
    if (response.providerId) {
        return response.providerId;
    }
    if ('phoneNumber' in response) {
        return "phone" /* ProviderId.PHONE */;
    }
    return null;
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class MultiFactorError extends FirebaseError {
    constructor(auth, error, operationType, user) {
        var _a;
        super(error.code, error.message);
        this.operationType = operationType;
        this.user = user;
        // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, MultiFactorError.prototype);
        this.customData = {
            appName: auth.name,
            tenantId: (_a = auth.tenantId) !== null && _a !== void 0 ? _a : undefined,
            _serverResponse: error.customData._serverResponse,
            operationType
        };
    }
    static _fromErrorAndOperation(auth, error, operationType, user) {
        return new MultiFactorError(auth, error, operationType, user);
    }
}
function _processCredentialSavingMfaContextIfNecessary(auth, operationType, credential, user) {
    const idTokenProvider = operationType === "reauthenticate" /* OperationType.REAUTHENTICATE */
        ? credential._getReauthenticationResolver(auth)
        : credential._getIdTokenResponse(auth);
    return idTokenProvider.catch(error => {
        if (error.code === `auth/${"multi-factor-auth-required" /* AuthErrorCode.MFA_REQUIRED */}`) {
            throw MultiFactorError._fromErrorAndOperation(auth, error, operationType, user);
        }
        throw error;
    });
}
async function _link$1(user, credential, bypassAuthState = false) {
    const response = await _logoutIfInvalidated(user, credential._linkToIdToken(user.auth, await user.getIdToken()), bypassAuthState);
    return UserCredentialImpl._forOperation(user, "link" /* OperationType.LINK */, response);
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function _reauthenticate(user, credential, bypassAuthState = false) {
    const { auth } = user;
    const operationType = "reauthenticate" /* OperationType.REAUTHENTICATE */;
    try {
        const response = await _logoutIfInvalidated(user, _processCredentialSavingMfaContextIfNecessary(auth, operationType, credential, user), bypassAuthState);
        _assert(response.idToken, auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        const parsed = _parseToken(response.idToken);
        _assert(parsed, auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        const { sub: localId } = parsed;
        _assert(user.uid === localId, auth, "user-mismatch" /* AuthErrorCode.USER_MISMATCH */);
        return UserCredentialImpl._forOperation(user, operationType, response);
    }
    catch (e) {
        // Convert user deleted error into user mismatch
        if ((e === null || e === void 0 ? void 0 : e.code) === `auth/${"user-not-found" /* AuthErrorCode.USER_DELETED */}`) {
            _fail(auth, "user-mismatch" /* AuthErrorCode.USER_MISMATCH */);
        }
        throw e;
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function _signInWithCredential(auth, credential, bypassAuthState = false) {
    const operationType = "signIn" /* OperationType.SIGN_IN */;
    const response = await _processCredentialSavingMfaContextIfNecessary(auth, operationType, credential);
    const userCredential = await UserCredentialImpl._fromIdTokenResponse(auth, operationType, response);
    if (!bypassAuthState) {
        await auth._updateCurrentUser(userCredential.user);
    }
    return userCredential;
}
/**
 * Adds an observer for changes to the signed-in user's ID token.
 *
 * @remarks
 * This includes sign-in, sign-out, and token refresh events.
 * This will not be triggered automatically upon ID token expiration. Use {@link User.getIdToken} to refresh the ID token.
 *
 * @param auth - The {@link Auth} instance.
 * @param nextOrObserver - callback triggered on change.
 * @param error - Deprecated. This callback is never triggered. Errors
 * on signing in/out can be caught in promises returned from
 * sign-in/sign-out functions.
 * @param completed - Deprecated. This callback is never triggered.
 *
 * @public
 */
function onIdTokenChanged(auth, nextOrObserver, error, completed) {
    return getModularInstance(auth).onIdTokenChanged(nextOrObserver, error, completed);
}
/**
 * Adds a blocking callback that runs before an auth state change
 * sets a new user.
 *
 * @param auth - The {@link Auth} instance.
 * @param callback - callback triggered before new user value is set.
 *   If this throws, it blocks the user from being set.
 * @param onAbort - callback triggered if a later `beforeAuthStateChanged()`
 *   callback throws, allowing you to undo any side effects.
 */
function beforeAuthStateChanged(auth, callback, onAbort) {
    return getModularInstance(auth).beforeAuthStateChanged(callback, onAbort);
}
/**
 * Adds an observer for changes to the user's sign-in state.
 *
 * @remarks
 * To keep the old behavior, see {@link onIdTokenChanged}.
 *
 * @param auth - The {@link Auth} instance.
 * @param nextOrObserver - callback triggered on change.
 * @param error - Deprecated. This callback is never triggered. Errors
 * on signing in/out can be caught in promises returned from
 * sign-in/sign-out functions.
 * @param completed - Deprecated. This callback is never triggered.
 *
 * @public
 */
function onAuthStateChanged(auth, nextOrObserver, error, completed) {
    return getModularInstance(auth).onAuthStateChanged(nextOrObserver, error, completed);
}

const STORAGE_AVAILABLE_KEY = '__sak';

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// There are two different browser persistence types: local and session.
// Both have the same implementation but use a different underlying storage
// object.
class BrowserPersistenceClass {
    constructor(storageRetriever, type) {
        this.storageRetriever = storageRetriever;
        this.type = type;
    }
    _isAvailable() {
        try {
            if (!this.storage) {
                return Promise.resolve(false);
            }
            this.storage.setItem(STORAGE_AVAILABLE_KEY, '1');
            this.storage.removeItem(STORAGE_AVAILABLE_KEY);
            return Promise.resolve(true);
        }
        catch (_a) {
            return Promise.resolve(false);
        }
    }
    _set(key, value) {
        this.storage.setItem(key, JSON.stringify(value));
        return Promise.resolve();
    }
    _get(key) {
        const json = this.storage.getItem(key);
        return Promise.resolve(json ? JSON.parse(json) : null);
    }
    _remove(key) {
        this.storage.removeItem(key);
        return Promise.resolve();
    }
    get storage() {
        return this.storageRetriever();
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _iframeCannotSyncWebStorage() {
    const ua = getUA();
    return _isSafari(ua) || _isIOS(ua);
}
// The polling period in case events are not supported
const _POLLING_INTERVAL_MS$1 = 1000;
// The IE 10 localStorage cross tab synchronization delay in milliseconds
const IE10_LOCAL_STORAGE_SYNC_DELAY = 10;
class BrowserLocalPersistence extends BrowserPersistenceClass {
    constructor() {
        super(() => window.localStorage, "LOCAL" /* PersistenceType.LOCAL */);
        this.boundEventHandler = (event, poll) => this.onStorageEvent(event, poll);
        this.listeners = {};
        this.localCache = {};
        // setTimeout return value is platform specific
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.pollTimer = null;
        // Safari or iOS browser and embedded in an iframe.
        this.safariLocalStorageNotSynced = _iframeCannotSyncWebStorage() && _isIframe();
        // Whether to use polling instead of depending on window events
        this.fallbackToPolling = _isMobileBrowser();
        this._shouldAllowMigration = true;
    }
    forAllChangedKeys(cb) {
        // Check all keys with listeners on them.
        for (const key of Object.keys(this.listeners)) {
            // Get value from localStorage.
            const newValue = this.storage.getItem(key);
            const oldValue = this.localCache[key];
            // If local map value does not match, trigger listener with storage event.
            // Differentiate this simulated event from the real storage event.
            if (newValue !== oldValue) {
                cb(key, oldValue, newValue);
            }
        }
    }
    onStorageEvent(event, poll = false) {
        // Key would be null in some situations, like when localStorage is cleared
        if (!event.key) {
            this.forAllChangedKeys((key, _oldValue, newValue) => {
                this.notifyListeners(key, newValue);
            });
            return;
        }
        const key = event.key;
        // Check the mechanism how this event was detected.
        // The first event will dictate the mechanism to be used.
        if (poll) {
            // Environment detects storage changes via polling.
            // Remove storage event listener to prevent possible event duplication.
            this.detachListener();
        }
        else {
            // Environment detects storage changes via storage event listener.
            // Remove polling listener to prevent possible event duplication.
            this.stopPolling();
        }
        // Safari embedded iframe. Storage event will trigger with the delta
        // changes but no changes will be applied to the iframe localStorage.
        if (this.safariLocalStorageNotSynced) {
            // Get current iframe page value.
            const storedValue = this.storage.getItem(key);
            // Value not synchronized, synchronize manually.
            if (event.newValue !== storedValue) {
                if (event.newValue !== null) {
                    // Value changed from current value.
                    this.storage.setItem(key, event.newValue);
                }
                else {
                    // Current value deleted.
                    this.storage.removeItem(key);
                }
            }
            else if (this.localCache[key] === event.newValue && !poll) {
                // Already detected and processed, do not trigger listeners again.
                return;
            }
        }
        const triggerListeners = () => {
            // Keep local map up to date in case storage event is triggered before
            // poll.
            const storedValue = this.storage.getItem(key);
            if (!poll && this.localCache[key] === storedValue) {
                // Real storage event which has already been detected, do nothing.
                // This seems to trigger in some IE browsers for some reason.
                return;
            }
            this.notifyListeners(key, storedValue);
        };
        const storedValue = this.storage.getItem(key);
        if (_isIE10() &&
            storedValue !== event.newValue &&
            event.newValue !== event.oldValue) {
            // IE 10 has this weird bug where a storage event would trigger with the
            // correct key, oldValue and newValue but localStorage.getItem(key) does
            // not yield the updated value until a few milliseconds. This ensures
            // this recovers from that situation.
            setTimeout(triggerListeners, IE10_LOCAL_STORAGE_SYNC_DELAY);
        }
        else {
            triggerListeners();
        }
    }
    notifyListeners(key, value) {
        this.localCache[key] = value;
        const listeners = this.listeners[key];
        if (listeners) {
            for (const listener of Array.from(listeners)) {
                listener(value ? JSON.parse(value) : value);
            }
        }
    }
    startPolling() {
        this.stopPolling();
        this.pollTimer = setInterval(() => {
            this.forAllChangedKeys((key, oldValue, newValue) => {
                this.onStorageEvent(new StorageEvent('storage', {
                    key,
                    oldValue,
                    newValue
                }), 
                /* poll */ true);
            });
        }, _POLLING_INTERVAL_MS$1);
    }
    stopPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    }
    attachListener() {
        window.addEventListener('storage', this.boundEventHandler);
    }
    detachListener() {
        window.removeEventListener('storage', this.boundEventHandler);
    }
    _addListener(key, listener) {
        if (Object.keys(this.listeners).length === 0) {
            // Whether browser can detect storage event when it had already been pushed to the background.
            // This may happen in some mobile browsers. A localStorage change in the foreground window
            // will not be detected in the background window via the storage event.
            // This was detected in iOS 7.x mobile browsers
            if (this.fallbackToPolling) {
                this.startPolling();
            }
            else {
                this.attachListener();
            }
        }
        if (!this.listeners[key]) {
            this.listeners[key] = new Set();
            // Populate the cache to avoid spuriously triggering on first poll.
            this.localCache[key] = this.storage.getItem(key);
        }
        this.listeners[key].add(listener);
    }
    _removeListener(key, listener) {
        if (this.listeners[key]) {
            this.listeners[key].delete(listener);
            if (this.listeners[key].size === 0) {
                delete this.listeners[key];
            }
        }
        if (Object.keys(this.listeners).length === 0) {
            this.detachListener();
            this.stopPolling();
        }
    }
    // Update local cache on base operations:
    async _set(key, value) {
        await super._set(key, value);
        this.localCache[key] = JSON.stringify(value);
    }
    async _get(key) {
        const value = await super._get(key);
        this.localCache[key] = JSON.stringify(value);
        return value;
    }
    async _remove(key) {
        await super._remove(key);
        delete this.localCache[key];
    }
}
BrowserLocalPersistence.type = 'LOCAL';
/**
 * An implementation of {@link Persistence} of type `LOCAL` using `localStorage`
 * for the underlying storage.
 *
 * @public
 */
const browserLocalPersistence = BrowserLocalPersistence;

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class BrowserSessionPersistence extends BrowserPersistenceClass {
    constructor() {
        super(() => window.sessionStorage, "SESSION" /* PersistenceType.SESSION */);
    }
    _addListener(_key, _listener) {
        // Listeners are not supported for session storage since it cannot be shared across windows
        return;
    }
    _removeListener(_key, _listener) {
        // Listeners are not supported for session storage since it cannot be shared across windows
        return;
    }
}
BrowserSessionPersistence.type = 'SESSION';
/**
 * An implementation of {@link Persistence} of `SESSION` using `sessionStorage`
 * for the underlying storage.
 *
 * @public
 */
const browserSessionPersistence = BrowserSessionPersistence;

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Shim for Promise.allSettled, note the slightly different format of `fulfilled` vs `status`.
 *
 * @param promises - Array of promises to wait on.
 */
function _allSettled(promises) {
    return Promise.all(promises.map(async (promise) => {
        try {
            const value = await promise;
            return {
                fulfilled: true,
                value
            };
        }
        catch (reason) {
            return {
                fulfilled: false,
                reason
            };
        }
    }));
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Interface class for receiving messages.
 *
 */
class Receiver {
    constructor(eventTarget) {
        this.eventTarget = eventTarget;
        this.handlersMap = {};
        this.boundEventHandler = this.handleEvent.bind(this);
    }
    /**
     * Obtain an instance of a Receiver for a given event target, if none exists it will be created.
     *
     * @param eventTarget - An event target (such as window or self) through which the underlying
     * messages will be received.
     */
    static _getInstance(eventTarget) {
        // The results are stored in an array since objects can't be keys for other
        // objects. In addition, setting a unique property on an event target as a
        // hash map key may not be allowed due to CORS restrictions.
        const existingInstance = this.receivers.find(receiver => receiver.isListeningto(eventTarget));
        if (existingInstance) {
            return existingInstance;
        }
        const newInstance = new Receiver(eventTarget);
        this.receivers.push(newInstance);
        return newInstance;
    }
    isListeningto(eventTarget) {
        return this.eventTarget === eventTarget;
    }
    /**
     * Fans out a MessageEvent to the appropriate listeners.
     *
     * @remarks
     * Sends an {@link Status.ACK} upon receipt and a {@link Status.DONE} once all handlers have
     * finished processing.
     *
     * @param event - The MessageEvent.
     *
     */
    async handleEvent(event) {
        const messageEvent = event;
        const { eventId, eventType, data } = messageEvent.data;
        const handlers = this.handlersMap[eventType];
        if (!(handlers === null || handlers === void 0 ? void 0 : handlers.size)) {
            return;
        }
        messageEvent.ports[0].postMessage({
            status: "ack" /* _Status.ACK */,
            eventId,
            eventType
        });
        const promises = Array.from(handlers).map(async (handler) => handler(messageEvent.origin, data));
        const response = await _allSettled(promises);
        messageEvent.ports[0].postMessage({
            status: "done" /* _Status.DONE */,
            eventId,
            eventType,
            response
        });
    }
    /**
     * Subscribe an event handler for a particular event.
     *
     * @param eventType - Event name to subscribe to.
     * @param eventHandler - The event handler which should receive the events.
     *
     */
    _subscribe(eventType, eventHandler) {
        if (Object.keys(this.handlersMap).length === 0) {
            this.eventTarget.addEventListener('message', this.boundEventHandler);
        }
        if (!this.handlersMap[eventType]) {
            this.handlersMap[eventType] = new Set();
        }
        this.handlersMap[eventType].add(eventHandler);
    }
    /**
     * Unsubscribe an event handler from a particular event.
     *
     * @param eventType - Event name to unsubscribe from.
     * @param eventHandler - Optinoal event handler, if none provided, unsubscribe all handlers on this event.
     *
     */
    _unsubscribe(eventType, eventHandler) {
        if (this.handlersMap[eventType] && eventHandler) {
            this.handlersMap[eventType].delete(eventHandler);
        }
        if (!eventHandler || this.handlersMap[eventType].size === 0) {
            delete this.handlersMap[eventType];
        }
        if (Object.keys(this.handlersMap).length === 0) {
            this.eventTarget.removeEventListener('message', this.boundEventHandler);
        }
    }
}
Receiver.receivers = [];

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _generateEventId(prefix = '', digits = 10) {
    let random = '';
    for (let i = 0; i < digits; i++) {
        random += Math.floor(Math.random() * 10);
    }
    return prefix + random;
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Interface for sending messages and waiting for a completion response.
 *
 */
class Sender {
    constructor(target) {
        this.target = target;
        this.handlers = new Set();
    }
    /**
     * Unsubscribe the handler and remove it from our tracking Set.
     *
     * @param handler - The handler to unsubscribe.
     */
    removeMessageHandler(handler) {
        if (handler.messageChannel) {
            handler.messageChannel.port1.removeEventListener('message', handler.onMessage);
            handler.messageChannel.port1.close();
        }
        this.handlers.delete(handler);
    }
    /**
     * Send a message to the Receiver located at {@link target}.
     *
     * @remarks
     * We'll first wait a bit for an ACK , if we get one we will wait significantly longer until the
     * receiver has had a chance to fully process the event.
     *
     * @param eventType - Type of event to send.
     * @param data - The payload of the event.
     * @param timeout - Timeout for waiting on an ACK from the receiver.
     *
     * @returns An array of settled promises from all the handlers that were listening on the receiver.
     */
    async _send(eventType, data, timeout = 50 /* _TimeoutDuration.ACK */) {
        const messageChannel = typeof MessageChannel !== 'undefined' ? new MessageChannel() : null;
        if (!messageChannel) {
            throw new Error("connection_unavailable" /* _MessageError.CONNECTION_UNAVAILABLE */);
        }
        // Node timers and browser timers return fundamentally different types.
        // We don't actually care what the value is but TS won't accept unknown and
        // we can't cast properly in both environments.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let completionTimer;
        let handler;
        return new Promise((resolve, reject) => {
            const eventId = _generateEventId('', 20);
            messageChannel.port1.start();
            const ackTimer = setTimeout(() => {
                reject(new Error("unsupported_event" /* _MessageError.UNSUPPORTED_EVENT */));
            }, timeout);
            handler = {
                messageChannel,
                onMessage(event) {
                    const messageEvent = event;
                    if (messageEvent.data.eventId !== eventId) {
                        return;
                    }
                    switch (messageEvent.data.status) {
                        case "ack" /* _Status.ACK */:
                            // The receiver should ACK first.
                            clearTimeout(ackTimer);
                            completionTimer = setTimeout(() => {
                                reject(new Error("timeout" /* _MessageError.TIMEOUT */));
                            }, 3000 /* _TimeoutDuration.COMPLETION */);
                            break;
                        case "done" /* _Status.DONE */:
                            // Once the receiver's handlers are finished we will get the results.
                            clearTimeout(completionTimer);
                            resolve(messageEvent.data.response);
                            break;
                        default:
                            clearTimeout(ackTimer);
                            clearTimeout(completionTimer);
                            reject(new Error("invalid_response" /* _MessageError.INVALID_RESPONSE */));
                            break;
                    }
                }
            };
            this.handlers.add(handler);
            messageChannel.port1.addEventListener('message', handler.onMessage);
            this.target.postMessage({
                eventType,
                eventId,
                data
            }, [messageChannel.port2]);
        }).finally(() => {
            if (handler) {
                this.removeMessageHandler(handler);
            }
        });
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Lazy accessor for window, since the compat layer won't tree shake this out,
 * we need to make sure not to mess with window unless we have to
 */
function _window() {
    return window;
}
function _setWindowLocation(url) {
    _window().location.href = url;
}

/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _isWorker() {
    return (typeof _window()['WorkerGlobalScope'] !== 'undefined' &&
        typeof _window()['importScripts'] === 'function');
}
async function _getActiveServiceWorker() {
    if (!(navigator === null || navigator === void 0 ? void 0 : navigator.serviceWorker)) {
        return null;
    }
    try {
        const registration = await navigator.serviceWorker.ready;
        return registration.active;
    }
    catch (_a) {
        return null;
    }
}
function _getServiceWorkerController() {
    var _a;
    return ((_a = navigator === null || navigator === void 0 ? void 0 : navigator.serviceWorker) === null || _a === void 0 ? void 0 : _a.controller) || null;
}
function _getWorkerGlobalScope() {
    return _isWorker() ? self : null;
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DB_NAME = 'firebaseLocalStorageDb';
const DB_VERSION = 1;
const DB_OBJECTSTORE_NAME = 'firebaseLocalStorage';
const DB_DATA_KEYPATH = 'fbase_key';
/**
 * Promise wrapper for IDBRequest
 *
 * Unfortunately we can't cleanly extend Promise<T> since promises are not callable in ES6
 *
 */
class DBPromise {
    constructor(request) {
        this.request = request;
    }
    toPromise() {
        return new Promise((resolve, reject) => {
            this.request.addEventListener('success', () => {
                resolve(this.request.result);
            });
            this.request.addEventListener('error', () => {
                reject(this.request.error);
            });
        });
    }
}
function getObjectStore(db, isReadWrite) {
    return db
        .transaction([DB_OBJECTSTORE_NAME], isReadWrite ? 'readwrite' : 'readonly')
        .objectStore(DB_OBJECTSTORE_NAME);
}
function _deleteDatabase() {
    const request = indexedDB.deleteDatabase(DB_NAME);
    return new DBPromise(request).toPromise();
}
function _openDatabase() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    return new Promise((resolve, reject) => {
        request.addEventListener('error', () => {
            reject(request.error);
        });
        request.addEventListener('upgradeneeded', () => {
            const db = request.result;
            try {
                db.createObjectStore(DB_OBJECTSTORE_NAME, { keyPath: DB_DATA_KEYPATH });
            }
            catch (e) {
                reject(e);
            }
        });
        request.addEventListener('success', async () => {
            const db = request.result;
            // Strange bug that occurs in Firefox when multiple tabs are opened at the
            // same time. The only way to recover seems to be deleting the database
            // and re-initializing it.
            // https://github.com/firebase/firebase-js-sdk/issues/634
            if (!db.objectStoreNames.contains(DB_OBJECTSTORE_NAME)) {
                // Need to close the database or else you get a `blocked` event
                db.close();
                await _deleteDatabase();
                resolve(await _openDatabase());
            }
            else {
                resolve(db);
            }
        });
    });
}
async function _putObject(db, key, value) {
    const request = getObjectStore(db, true).put({
        [DB_DATA_KEYPATH]: key,
        value
    });
    return new DBPromise(request).toPromise();
}
async function getObject(db, key) {
    const request = getObjectStore(db, false).get(key);
    const data = await new DBPromise(request).toPromise();
    return data === undefined ? null : data.value;
}
function _deleteObject(db, key) {
    const request = getObjectStore(db, true).delete(key);
    return new DBPromise(request).toPromise();
}
const _POLLING_INTERVAL_MS = 800;
const _TRANSACTION_RETRY_COUNT = 3;
class IndexedDBLocalPersistence {
    constructor() {
        this.type = "LOCAL" /* PersistenceType.LOCAL */;
        this._shouldAllowMigration = true;
        this.listeners = {};
        this.localCache = {};
        // setTimeout return value is platform specific
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.pollTimer = null;
        this.pendingWrites = 0;
        this.receiver = null;
        this.sender = null;
        this.serviceWorkerReceiverAvailable = false;
        this.activeServiceWorker = null;
        // Fire & forget the service worker registration as it may never resolve
        this._workerInitializationPromise =
            this.initializeServiceWorkerMessaging().then(() => { }, () => { });
    }
    async _openDb() {
        if (this.db) {
            return this.db;
        }
        this.db = await _openDatabase();
        return this.db;
    }
    async _withRetries(op) {
        let numAttempts = 0;
        while (true) {
            try {
                const db = await this._openDb();
                return await op(db);
            }
            catch (e) {
                if (numAttempts++ > _TRANSACTION_RETRY_COUNT) {
                    throw e;
                }
                if (this.db) {
                    this.db.close();
                    this.db = undefined;
                }
                // TODO: consider adding exponential backoff
            }
        }
    }
    /**
     * IndexedDB events do not propagate from the main window to the worker context.  We rely on a
     * postMessage interface to send these events to the worker ourselves.
     */
    async initializeServiceWorkerMessaging() {
        return _isWorker() ? this.initializeReceiver() : this.initializeSender();
    }
    /**
     * As the worker we should listen to events from the main window.
     */
    async initializeReceiver() {
        this.receiver = Receiver._getInstance(_getWorkerGlobalScope());
        // Refresh from persistence if we receive a KeyChanged message.
        this.receiver._subscribe("keyChanged" /* _EventType.KEY_CHANGED */, async (_origin, data) => {
            const keys = await this._poll();
            return {
                keyProcessed: keys.includes(data.key)
            };
        });
        // Let the sender know that we are listening so they give us more timeout.
        this.receiver._subscribe("ping" /* _EventType.PING */, async (_origin, _data) => {
            return ["keyChanged" /* _EventType.KEY_CHANGED */];
        });
    }
    /**
     * As the main window, we should let the worker know when keys change (set and remove).
     *
     * @remarks
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/ready | ServiceWorkerContainer.ready}
     * may not resolve.
     */
    async initializeSender() {
        var _a, _b;
        // Check to see if there's an active service worker.
        this.activeServiceWorker = await _getActiveServiceWorker();
        if (!this.activeServiceWorker) {
            return;
        }
        this.sender = new Sender(this.activeServiceWorker);
        // Ping the service worker to check what events they can handle.
        const results = await this.sender._send("ping" /* _EventType.PING */, {}, 800 /* _TimeoutDuration.LONG_ACK */);
        if (!results) {
            return;
        }
        if (((_a = results[0]) === null || _a === void 0 ? void 0 : _a.fulfilled) &&
            ((_b = results[0]) === null || _b === void 0 ? void 0 : _b.value.includes("keyChanged" /* _EventType.KEY_CHANGED */))) {
            this.serviceWorkerReceiverAvailable = true;
        }
    }
    /**
     * Let the worker know about a changed key, the exact key doesn't technically matter since the
     * worker will just trigger a full sync anyway.
     *
     * @remarks
     * For now, we only support one service worker per page.
     *
     * @param key - Storage key which changed.
     */
    async notifyServiceWorker(key) {
        if (!this.sender ||
            !this.activeServiceWorker ||
            _getServiceWorkerController() !== this.activeServiceWorker) {
            return;
        }
        try {
            await this.sender._send("keyChanged" /* _EventType.KEY_CHANGED */, { key }, 
            // Use long timeout if receiver has previously responded to a ping from us.
            this.serviceWorkerReceiverAvailable
                ? 800 /* _TimeoutDuration.LONG_ACK */
                : 50 /* _TimeoutDuration.ACK */);
        }
        catch (_a) {
            // This is a best effort approach. Ignore errors.
        }
    }
    async _isAvailable() {
        try {
            if (!indexedDB) {
                return false;
            }
            const db = await _openDatabase();
            await _putObject(db, STORAGE_AVAILABLE_KEY, '1');
            await _deleteObject(db, STORAGE_AVAILABLE_KEY);
            return true;
        }
        catch (_a) { }
        return false;
    }
    async _withPendingWrite(write) {
        this.pendingWrites++;
        try {
            await write();
        }
        finally {
            this.pendingWrites--;
        }
    }
    async _set(key, value) {
        return this._withPendingWrite(async () => {
            await this._withRetries((db) => _putObject(db, key, value));
            this.localCache[key] = value;
            return this.notifyServiceWorker(key);
        });
    }
    async _get(key) {
        const obj = (await this._withRetries((db) => getObject(db, key)));
        this.localCache[key] = obj;
        return obj;
    }
    async _remove(key) {
        return this._withPendingWrite(async () => {
            await this._withRetries((db) => _deleteObject(db, key));
            delete this.localCache[key];
            return this.notifyServiceWorker(key);
        });
    }
    async _poll() {
        // TODO: check if we need to fallback if getAll is not supported
        const result = await this._withRetries((db) => {
            const getAllRequest = getObjectStore(db, false).getAll();
            return new DBPromise(getAllRequest).toPromise();
        });
        if (!result) {
            return [];
        }
        // If we have pending writes in progress abort, we'll get picked up on the next poll
        if (this.pendingWrites !== 0) {
            return [];
        }
        const keys = [];
        const keysInResult = new Set();
        if (result.length !== 0) {
            for (const { fbase_key: key, value } of result) {
                keysInResult.add(key);
                if (JSON.stringify(this.localCache[key]) !== JSON.stringify(value)) {
                    this.notifyListeners(key, value);
                    keys.push(key);
                }
            }
        }
        for (const localKey of Object.keys(this.localCache)) {
            if (this.localCache[localKey] && !keysInResult.has(localKey)) {
                // Deleted
                this.notifyListeners(localKey, null);
                keys.push(localKey);
            }
        }
        return keys;
    }
    notifyListeners(key, newValue) {
        this.localCache[key] = newValue;
        const listeners = this.listeners[key];
        if (listeners) {
            for (const listener of Array.from(listeners)) {
                listener(newValue);
            }
        }
    }
    startPolling() {
        this.stopPolling();
        this.pollTimer = setInterval(async () => this._poll(), _POLLING_INTERVAL_MS);
    }
    stopPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    }
    _addListener(key, listener) {
        if (Object.keys(this.listeners).length === 0) {
            this.startPolling();
        }
        if (!this.listeners[key]) {
            this.listeners[key] = new Set();
            // Populate the cache to avoid spuriously triggering on first poll.
            void this._get(key); // This can happen in the background async and we can return immediately.
        }
        this.listeners[key].add(listener);
    }
    _removeListener(key, listener) {
        if (this.listeners[key]) {
            this.listeners[key].delete(listener);
            if (this.listeners[key].size === 0) {
                delete this.listeners[key];
            }
        }
        if (Object.keys(this.listeners).length === 0) {
            this.stopPolling();
        }
    }
}
IndexedDBLocalPersistence.type = 'LOCAL';
/**
 * An implementation of {@link Persistence} of type `LOCAL` using `indexedDB`
 * for the underlying storage.
 *
 * @public
 */
const indexedDBLocalPersistence = IndexedDBLocalPersistence;
new Delay(30000, 60000);

/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Chooses a popup/redirect resolver to use. This prefers the override (which
 * is directly passed in), and falls back to the property set on the auth
 * object. If neither are available, this function errors w/ an argument error.
 */
function _withDefaultResolver(auth, resolverOverride) {
    if (resolverOverride) {
        return _getInstance(resolverOverride);
    }
    _assert(auth._popupRedirectResolver, auth, "argument-error" /* AuthErrorCode.ARGUMENT_ERROR */);
    return auth._popupRedirectResolver;
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class IdpCredential extends AuthCredential {
    constructor(params) {
        super("custom" /* ProviderId.CUSTOM */, "custom" /* ProviderId.CUSTOM */);
        this.params = params;
    }
    _getIdTokenResponse(auth) {
        return signInWithIdp(auth, this._buildIdpRequest());
    }
    _linkToIdToken(auth, idToken) {
        return signInWithIdp(auth, this._buildIdpRequest(idToken));
    }
    _getReauthenticationResolver(auth) {
        return signInWithIdp(auth, this._buildIdpRequest());
    }
    _buildIdpRequest(idToken) {
        const request = {
            requestUri: this.params.requestUri,
            sessionId: this.params.sessionId,
            postBody: this.params.postBody,
            tenantId: this.params.tenantId,
            pendingToken: this.params.pendingToken,
            returnSecureToken: true,
            returnIdpCredential: true
        };
        if (idToken) {
            request.idToken = idToken;
        }
        return request;
    }
}
function _signIn(params) {
    return _signInWithCredential(params.auth, new IdpCredential(params), params.bypassAuthState);
}
function _reauth(params) {
    const { auth, user } = params;
    _assert(user, auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
    return _reauthenticate(user, new IdpCredential(params), params.bypassAuthState);
}
async function _link(params) {
    const { auth, user } = params;
    _assert(user, auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
    return _link$1(user, new IdpCredential(params), params.bypassAuthState);
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Popup event manager. Handles the popup's entire lifecycle; listens to auth
 * events
 */
class AbstractPopupRedirectOperation {
    constructor(auth, filter, resolver, user, bypassAuthState = false) {
        this.auth = auth;
        this.resolver = resolver;
        this.user = user;
        this.bypassAuthState = bypassAuthState;
        this.pendingPromise = null;
        this.eventManager = null;
        this.filter = Array.isArray(filter) ? filter : [filter];
    }
    execute() {
        return new Promise(async (resolve, reject) => {
            this.pendingPromise = { resolve, reject };
            try {
                this.eventManager = await this.resolver._initialize(this.auth);
                await this.onExecution();
                this.eventManager.registerConsumer(this);
            }
            catch (e) {
                this.reject(e);
            }
        });
    }
    async onAuthEvent(event) {
        const { urlResponse, sessionId, postBody, tenantId, error, type } = event;
        if (error) {
            this.reject(error);
            return;
        }
        const params = {
            auth: this.auth,
            requestUri: urlResponse,
            sessionId: sessionId,
            tenantId: tenantId || undefined,
            postBody: postBody || undefined,
            user: this.user,
            bypassAuthState: this.bypassAuthState
        };
        try {
            this.resolve(await this.getIdpTask(type)(params));
        }
        catch (e) {
            this.reject(e);
        }
    }
    onError(error) {
        this.reject(error);
    }
    getIdpTask(type) {
        switch (type) {
            case "signInViaPopup" /* AuthEventType.SIGN_IN_VIA_POPUP */:
            case "signInViaRedirect" /* AuthEventType.SIGN_IN_VIA_REDIRECT */:
                return _signIn;
            case "linkViaPopup" /* AuthEventType.LINK_VIA_POPUP */:
            case "linkViaRedirect" /* AuthEventType.LINK_VIA_REDIRECT */:
                return _link;
            case "reauthViaPopup" /* AuthEventType.REAUTH_VIA_POPUP */:
            case "reauthViaRedirect" /* AuthEventType.REAUTH_VIA_REDIRECT */:
                return _reauth;
            default:
                _fail(this.auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        }
    }
    resolve(cred) {
        debugAssert(this.pendingPromise, 'Pending promise was never set');
        this.pendingPromise.resolve(cred);
        this.unregisterAndCleanUp();
    }
    reject(error) {
        debugAssert(this.pendingPromise, 'Pending promise was never set');
        this.pendingPromise.reject(error);
        this.unregisterAndCleanUp();
    }
    unregisterAndCleanUp() {
        if (this.eventManager) {
            this.eventManager.unregisterConsumer(this);
        }
        this.pendingPromise = null;
        this.cleanUp();
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const _POLL_WINDOW_CLOSE_TIMEOUT = new Delay(2000, 10000);
/**
 * Popup event manager. Handles the popup's entire lifecycle; listens to auth
 * events
 *
 */
class PopupOperation extends AbstractPopupRedirectOperation {
    constructor(auth, filter, provider, resolver, user) {
        super(auth, filter, resolver, user);
        this.provider = provider;
        this.authWindow = null;
        this.pollId = null;
        if (PopupOperation.currentPopupAction) {
            PopupOperation.currentPopupAction.cancel();
        }
        PopupOperation.currentPopupAction = this;
    }
    async executeNotNull() {
        const result = await this.execute();
        _assert(result, this.auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        return result;
    }
    async onExecution() {
        debugAssert(this.filter.length === 1, 'Popup operations only handle one event');
        const eventId = _generateEventId();
        this.authWindow = await this.resolver._openPopup(this.auth, this.provider, this.filter[0], // There's always one, see constructor
        eventId);
        this.authWindow.associatedEvent = eventId;
        // Check for web storage support and origin validation _after_ the popup is
        // loaded. These operations are slow (~1 second or so) Rather than
        // waiting on them before opening the window, optimistically open the popup
        // and check for storage support at the same time. If storage support is
        // not available, this will cause the whole thing to reject properly. It
        // will also close the popup, but since the promise has already rejected,
        // the popup closed by user poll will reject into the void.
        this.resolver._originValidation(this.auth).catch(e => {
            this.reject(e);
        });
        this.resolver._isIframeWebStorageSupported(this.auth, isSupported => {
            if (!isSupported) {
                this.reject(_createError(this.auth, "web-storage-unsupported" /* AuthErrorCode.WEB_STORAGE_UNSUPPORTED */));
            }
        });
        // Handle user closure. Notice this does *not* use await
        this.pollUserCancellation();
    }
    get eventId() {
        var _a;
        return ((_a = this.authWindow) === null || _a === void 0 ? void 0 : _a.associatedEvent) || null;
    }
    cancel() {
        this.reject(_createError(this.auth, "cancelled-popup-request" /* AuthErrorCode.EXPIRED_POPUP_REQUEST */));
    }
    cleanUp() {
        if (this.authWindow) {
            this.authWindow.close();
        }
        if (this.pollId) {
            window.clearTimeout(this.pollId);
        }
        this.authWindow = null;
        this.pollId = null;
        PopupOperation.currentPopupAction = null;
    }
    pollUserCancellation() {
        const poll = () => {
            var _a, _b;
            if ((_b = (_a = this.authWindow) === null || _a === void 0 ? void 0 : _a.window) === null || _b === void 0 ? void 0 : _b.closed) {
                // Make sure that there is sufficient time for whatever action to
                // complete. The window could have closed but the sign in network
                // call could still be in flight. This is specifically true for
                // Firefox or if the opener is in an iframe, in which case the oauth
                // helper closes the popup.
                this.pollId = window.setTimeout(() => {
                    this.pollId = null;
                    this.reject(_createError(this.auth, "popup-closed-by-user" /* AuthErrorCode.POPUP_CLOSED_BY_USER */));
                }, 8000 /* _Timeout.AUTH_EVENT */);
                return;
            }
            this.pollId = window.setTimeout(poll, _POLL_WINDOW_CLOSE_TIMEOUT.get());
        };
        poll();
    }
}
// Only one popup is ever shown at once. The lifecycle of the current popup
// can be managed / cancelled by the constructor.
PopupOperation.currentPopupAction = null;

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const PENDING_REDIRECT_KEY = 'pendingRedirect';
// We only get one redirect outcome for any one auth, so just store it
// in here.
const redirectOutcomeMap = new Map();
class RedirectAction extends AbstractPopupRedirectOperation {
    constructor(auth, resolver, bypassAuthState = false) {
        super(auth, [
            "signInViaRedirect" /* AuthEventType.SIGN_IN_VIA_REDIRECT */,
            "linkViaRedirect" /* AuthEventType.LINK_VIA_REDIRECT */,
            "reauthViaRedirect" /* AuthEventType.REAUTH_VIA_REDIRECT */,
            "unknown" /* AuthEventType.UNKNOWN */
        ], resolver, undefined, bypassAuthState);
        this.eventId = null;
    }
    /**
     * Override the execute function; if we already have a redirect result, then
     * just return it.
     */
    async execute() {
        let readyOutcome = redirectOutcomeMap.get(this.auth._key());
        if (!readyOutcome) {
            try {
                const hasPendingRedirect = await _getAndClearPendingRedirectStatus(this.resolver, this.auth);
                const result = hasPendingRedirect ? await super.execute() : null;
                readyOutcome = () => Promise.resolve(result);
            }
            catch (e) {
                readyOutcome = () => Promise.reject(e);
            }
            redirectOutcomeMap.set(this.auth._key(), readyOutcome);
        }
        // If we're not bypassing auth state, the ready outcome should be set to
        // null.
        if (!this.bypassAuthState) {
            redirectOutcomeMap.set(this.auth._key(), () => Promise.resolve(null));
        }
        return readyOutcome();
    }
    async onAuthEvent(event) {
        if (event.type === "signInViaRedirect" /* AuthEventType.SIGN_IN_VIA_REDIRECT */) {
            return super.onAuthEvent(event);
        }
        else if (event.type === "unknown" /* AuthEventType.UNKNOWN */) {
            // This is a sentinel value indicating there's no pending redirect
            this.resolve(null);
            return;
        }
        if (event.eventId) {
            const user = await this.auth._redirectUserForId(event.eventId);
            if (user) {
                this.user = user;
                return super.onAuthEvent(event);
            }
            else {
                this.resolve(null);
            }
        }
    }
    async onExecution() { }
    cleanUp() { }
}
async function _getAndClearPendingRedirectStatus(resolver, auth) {
    const key = pendingRedirectKey(auth);
    const persistence = resolverPersistence(resolver);
    if (!(await persistence._isAvailable())) {
        return false;
    }
    const hasPendingRedirect = (await persistence._get(key)) === 'true';
    await persistence._remove(key);
    return hasPendingRedirect;
}
function _overrideRedirectResult(auth, result) {
    redirectOutcomeMap.set(auth._key(), result);
}
function resolverPersistence(resolver) {
    return _getInstance(resolver._redirectPersistence);
}
function pendingRedirectKey(auth) {
    return _persistenceKeyName(PENDING_REDIRECT_KEY, auth.config.apiKey, auth.name);
}
async function _getRedirectResult(auth, resolverExtern, bypassAuthState = false) {
    const authInternal = _castAuth(auth);
    const resolver = _withDefaultResolver(authInternal, resolverExtern);
    const action = new RedirectAction(authInternal, resolver, bypassAuthState);
    const result = await action.execute();
    if (result && !bypassAuthState) {
        delete result.user._redirectEventId;
        await authInternal._persistUserIfCurrent(result.user);
        await authInternal._setRedirectUser(null, resolverExtern);
    }
    return result;
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// The amount of time to store the UIDs of seen events; this is
// set to 10 min by default
const EVENT_DUPLICATION_CACHE_DURATION_MS = 10 * 60 * 1000;
class AuthEventManager {
    constructor(auth) {
        this.auth = auth;
        this.cachedEventUids = new Set();
        this.consumers = new Set();
        this.queuedRedirectEvent = null;
        this.hasHandledPotentialRedirect = false;
        this.lastProcessedEventTime = Date.now();
    }
    registerConsumer(authEventConsumer) {
        this.consumers.add(authEventConsumer);
        if (this.queuedRedirectEvent &&
            this.isEventForConsumer(this.queuedRedirectEvent, authEventConsumer)) {
            this.sendToConsumer(this.queuedRedirectEvent, authEventConsumer);
            this.saveEventToCache(this.queuedRedirectEvent);
            this.queuedRedirectEvent = null;
        }
    }
    unregisterConsumer(authEventConsumer) {
        this.consumers.delete(authEventConsumer);
    }
    onEvent(event) {
        // Check if the event has already been handled
        if (this.hasEventBeenHandled(event)) {
            return false;
        }
        let handled = false;
        this.consumers.forEach(consumer => {
            if (this.isEventForConsumer(event, consumer)) {
                handled = true;
                this.sendToConsumer(event, consumer);
                this.saveEventToCache(event);
            }
        });
        if (this.hasHandledPotentialRedirect || !isRedirectEvent(event)) {
            // If we've already seen a redirect before, or this is a popup event,
            // bail now
            return handled;
        }
        this.hasHandledPotentialRedirect = true;
        // If the redirect wasn't handled, hang on to it
        if (!handled) {
            this.queuedRedirectEvent = event;
            handled = true;
        }
        return handled;
    }
    sendToConsumer(event, consumer) {
        var _a;
        if (event.error && !isNullRedirectEvent(event)) {
            const code = ((_a = event.error.code) === null || _a === void 0 ? void 0 : _a.split('auth/')[1]) ||
                "internal-error" /* AuthErrorCode.INTERNAL_ERROR */;
            consumer.onError(_createError(this.auth, code));
        }
        else {
            consumer.onAuthEvent(event);
        }
    }
    isEventForConsumer(event, consumer) {
        const eventIdMatches = consumer.eventId === null ||
            (!!event.eventId && event.eventId === consumer.eventId);
        return consumer.filter.includes(event.type) && eventIdMatches;
    }
    hasEventBeenHandled(event) {
        if (Date.now() - this.lastProcessedEventTime >=
            EVENT_DUPLICATION_CACHE_DURATION_MS) {
            this.cachedEventUids.clear();
        }
        return this.cachedEventUids.has(eventUid(event));
    }
    saveEventToCache(event) {
        this.cachedEventUids.add(eventUid(event));
        this.lastProcessedEventTime = Date.now();
    }
}
function eventUid(e) {
    return [e.type, e.eventId, e.sessionId, e.tenantId].filter(v => v).join('-');
}
function isNullRedirectEvent({ type, error }) {
    return (type === "unknown" /* AuthEventType.UNKNOWN */ &&
        (error === null || error === void 0 ? void 0 : error.code) === `auth/${"no-auth-event" /* AuthErrorCode.NO_AUTH_EVENT */}`);
}
function isRedirectEvent(event) {
    switch (event.type) {
        case "signInViaRedirect" /* AuthEventType.SIGN_IN_VIA_REDIRECT */:
        case "linkViaRedirect" /* AuthEventType.LINK_VIA_REDIRECT */:
        case "reauthViaRedirect" /* AuthEventType.REAUTH_VIA_REDIRECT */:
            return true;
        case "unknown" /* AuthEventType.UNKNOWN */:
            return isNullRedirectEvent(event);
        default:
            return false;
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function _getProjectConfig(auth, request = {}) {
    return _performApiRequest(auth, "GET" /* HttpMethod.GET */, "/v1/projects" /* Endpoint.GET_PROJECT_CONFIG */, request);
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const IP_ADDRESS_REGEX = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const HTTP_REGEX = /^https?/;
async function _validateOrigin(auth) {
    // Skip origin validation if we are in an emulated environment
    if (auth.config.emulator) {
        return;
    }
    const { authorizedDomains } = await _getProjectConfig(auth);
    for (const domain of authorizedDomains) {
        try {
            if (matchDomain(domain)) {
                return;
            }
        }
        catch (_a) {
            // Do nothing if there's a URL error; just continue searching
        }
    }
    // In the old SDK, this error also provides helpful messages.
    _fail(auth, "unauthorized-domain" /* AuthErrorCode.INVALID_ORIGIN */);
}
function matchDomain(expected) {
    const currentUrl = _getCurrentUrl();
    const { protocol, hostname } = new URL(currentUrl);
    if (expected.startsWith('chrome-extension://')) {
        const ceUrl = new URL(expected);
        if (ceUrl.hostname === '' && hostname === '') {
            // For some reason we're not parsing chrome URLs properly
            return (protocol === 'chrome-extension:' &&
                expected.replace('chrome-extension://', '') ===
                    currentUrl.replace('chrome-extension://', ''));
        }
        return protocol === 'chrome-extension:' && ceUrl.hostname === hostname;
    }
    if (!HTTP_REGEX.test(protocol)) {
        return false;
    }
    if (IP_ADDRESS_REGEX.test(expected)) {
        // The domain has to be exactly equal to the pattern, as an IP domain will
        // only contain the IP, no extra character.
        return hostname === expected;
    }
    // Dots in pattern should be escaped.
    const escapedDomainPattern = expected.replace(/\./g, '\\.');
    // Non ip address domains.
    // domain.com = *.domain.com OR domain.com
    const re = new RegExp('^(.+\\.' + escapedDomainPattern + '|' + escapedDomainPattern + ')$', 'i');
    return re.test(hostname);
}

/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const NETWORK_TIMEOUT = new Delay(30000, 60000);
/**
 * Reset unlaoded GApi modules. If gapi.load fails due to a network error,
 * it will stop working after a retrial. This is a hack to fix this issue.
 */
function resetUnloadedGapiModules() {
    // Clear last failed gapi.load state to force next gapi.load to first
    // load the failed gapi.iframes module.
    // Get gapix.beacon context.
    const beacon = _window().___jsl;
    // Get current hint.
    if (beacon === null || beacon === void 0 ? void 0 : beacon.H) {
        // Get gapi hint.
        for (const hint of Object.keys(beacon.H)) {
            // Requested modules.
            beacon.H[hint].r = beacon.H[hint].r || [];
            // Loaded modules.
            beacon.H[hint].L = beacon.H[hint].L || [];
            // Set requested modules to a copy of the loaded modules.
            beacon.H[hint].r = [...beacon.H[hint].L];
            // Clear pending callbacks.
            if (beacon.CP) {
                for (let i = 0; i < beacon.CP.length; i++) {
                    // Remove all failed pending callbacks.
                    beacon.CP[i] = null;
                }
            }
        }
    }
}
function loadGapi(auth) {
    return new Promise((resolve, reject) => {
        var _a, _b, _c;
        // Function to run when gapi.load is ready.
        function loadGapiIframe() {
            // The developer may have tried to previously run gapi.load and failed.
            // Run this to fix that.
            resetUnloadedGapiModules();
            gapi.load('gapi.iframes', {
                callback: () => {
                    resolve(gapi.iframes.getContext());
                },
                ontimeout: () => {
                    // The above reset may be sufficient, but having this reset after
                    // failure ensures that if the developer calls gapi.load after the
                    // connection is re-established and before another attempt to embed
                    // the iframe, it would work and would not be broken because of our
                    // failed attempt.
                    // Timeout when gapi.iframes.Iframe not loaded.
                    resetUnloadedGapiModules();
                    reject(_createError(auth, "network-request-failed" /* AuthErrorCode.NETWORK_REQUEST_FAILED */));
                },
                timeout: NETWORK_TIMEOUT.get()
            });
        }
        if ((_b = (_a = _window().gapi) === null || _a === void 0 ? void 0 : _a.iframes) === null || _b === void 0 ? void 0 : _b.Iframe) {
            // If gapi.iframes.Iframe available, resolve.
            resolve(gapi.iframes.getContext());
        }
        else if (!!((_c = _window().gapi) === null || _c === void 0 ? void 0 : _c.load)) {
            // Gapi loader ready, load gapi.iframes.
            loadGapiIframe();
        }
        else {
            // Create a new iframe callback when this is called so as not to overwrite
            // any previous defined callback. This happens if this method is called
            // multiple times in parallel and could result in the later callback
            // overwriting the previous one. This would end up with a iframe
            // timeout.
            const cbName = _generateCallbackName('iframefcb');
            // GApi loader not available, dynamically load platform.js.
            _window()[cbName] = () => {
                // GApi loader should be ready.
                if (!!gapi.load) {
                    loadGapiIframe();
                }
                else {
                    // Gapi loader failed, throw error.
                    reject(_createError(auth, "network-request-failed" /* AuthErrorCode.NETWORK_REQUEST_FAILED */));
                }
            };
            // Load GApi loader.
            return _loadJS(`https://apis.google.com/js/api.js?onload=${cbName}`)
                .catch(e => reject(e));
        }
    }).catch(error => {
        // Reset cached promise to allow for retrial.
        cachedGApiLoader = null;
        throw error;
    });
}
let cachedGApiLoader = null;
function _loadGapi(auth) {
    cachedGApiLoader = cachedGApiLoader || loadGapi(auth);
    return cachedGApiLoader;
}

/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const PING_TIMEOUT = new Delay(5000, 15000);
const IFRAME_PATH = '__/auth/iframe';
const EMULATED_IFRAME_PATH = 'emulator/auth/iframe';
const IFRAME_ATTRIBUTES = {
    style: {
        position: 'absolute',
        top: '-100px',
        width: '1px',
        height: '1px'
    },
    'aria-hidden': 'true',
    tabindex: '-1'
};
// Map from apiHost to endpoint ID for passing into iframe. In current SDK, apiHost can be set to
// anything (not from a list of endpoints with IDs as in legacy), so this is the closest we can get.
const EID_FROM_APIHOST = new Map([
    ["identitytoolkit.googleapis.com" /* DefaultConfig.API_HOST */, 'p'],
    ['staging-identitytoolkit.sandbox.googleapis.com', 's'],
    ['test-identitytoolkit.sandbox.googleapis.com', 't'] // test
]);
function getIframeUrl(auth) {
    const config = auth.config;
    _assert(config.authDomain, auth, "auth-domain-config-required" /* AuthErrorCode.MISSING_AUTH_DOMAIN */);
    const url = config.emulator
        ? _emulatorUrl(config, EMULATED_IFRAME_PATH)
        : `https://${auth.config.authDomain}/${IFRAME_PATH}`;
    const params = {
        apiKey: config.apiKey,
        appName: auth.name,
        v: SDK_VERSION
    };
    const eid = EID_FROM_APIHOST.get(auth.config.apiHost);
    if (eid) {
        params.eid = eid;
    }
    const frameworks = auth._getFrameworks();
    if (frameworks.length) {
        params.fw = frameworks.join(',');
    }
    return `${url}?${querystring(params).slice(1)}`;
}
async function _openIframe(auth) {
    const context = await _loadGapi(auth);
    const gapi = _window().gapi;
    _assert(gapi, auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
    return context.open({
        where: document.body,
        url: getIframeUrl(auth),
        messageHandlersFilter: gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
        attributes: IFRAME_ATTRIBUTES,
        dontclear: true
    }, (iframe) => new Promise(async (resolve, reject) => {
        await iframe.restyle({
            // Prevent iframe from closing on mouse out.
            setHideOnLeave: false
        });
        const networkError = _createError(auth, "network-request-failed" /* AuthErrorCode.NETWORK_REQUEST_FAILED */);
        // Confirm iframe is correctly loaded.
        // To fallback on failure, set a timeout.
        const networkErrorTimer = _window().setTimeout(() => {
            reject(networkError);
        }, PING_TIMEOUT.get());
        // Clear timer and resolve pending iframe ready promise.
        function clearTimerAndResolve() {
            _window().clearTimeout(networkErrorTimer);
            resolve(iframe);
        }
        // This returns an IThenable. However the reject part does not call
        // when the iframe is not loaded.
        iframe.ping(clearTimerAndResolve).then(clearTimerAndResolve, () => {
            reject(networkError);
        });
    }));
}

/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const BASE_POPUP_OPTIONS = {
    location: 'yes',
    resizable: 'yes',
    statusbar: 'yes',
    toolbar: 'no'
};
const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 600;
const TARGET_BLANK = '_blank';
const FIREFOX_EMPTY_URL = 'http://localhost';
class AuthPopup {
    constructor(window) {
        this.window = window;
        this.associatedEvent = null;
    }
    close() {
        if (this.window) {
            try {
                this.window.close();
            }
            catch (e) { }
        }
    }
}
function _open(auth, url, name, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
    const top = Math.max((window.screen.availHeight - height) / 2, 0).toString();
    const left = Math.max((window.screen.availWidth - width) / 2, 0).toString();
    let target = '';
    const options = Object.assign(Object.assign({}, BASE_POPUP_OPTIONS), { width: width.toString(), height: height.toString(), top,
        left });
    // Chrome iOS 7 and 8 is returning an undefined popup win when target is
    // specified, even though the popup is not necessarily blocked.
    const ua = getUA().toLowerCase();
    if (name) {
        target = _isChromeIOS(ua) ? TARGET_BLANK : name;
    }
    if (_isFirefox(ua)) {
        // Firefox complains when invalid URLs are popped out. Hacky way to bypass.
        url = url || FIREFOX_EMPTY_URL;
        // Firefox disables by default scrolling on popup windows, which can create
        // issues when the user has many Google accounts, for instance.
        options.scrollbars = 'yes';
    }
    const optionsString = Object.entries(options).reduce((accum, [key, value]) => `${accum}${key}=${value},`, '');
    if (_isIOSStandalone(ua) && target !== '_self') {
        openAsNewWindowIOS(url || '', target);
        return new AuthPopup(null);
    }
    // about:blank getting sanitized causing browsers like IE/Edge to display
    // brief error message before redirecting to handler.
    const newWin = window.open(url || '', target, optionsString);
    _assert(newWin, auth, "popup-blocked" /* AuthErrorCode.POPUP_BLOCKED */);
    // Flaky on IE edge, encapsulate with a try and catch.
    try {
        newWin.focus();
    }
    catch (e) { }
    return new AuthPopup(newWin);
}
function openAsNewWindowIOS(url, target) {
    const el = document.createElement('a');
    el.href = url;
    el.target = target;
    const click = document.createEvent('MouseEvent');
    click.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 1, null);
    el.dispatchEvent(click);
}

/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * URL for Authentication widget which will initiate the OAuth handshake
 *
 * @internal
 */
const WIDGET_PATH = '__/auth/handler';
/**
 * URL for emulated environment
 *
 * @internal
 */
const EMULATOR_WIDGET_PATH = 'emulator/auth/handler';
/**
 * Fragment name for the App Check token that gets passed to the widget
 *
 * @internal
 */
const FIREBASE_APP_CHECK_FRAGMENT_ID = encodeURIComponent('fac');
async function _getRedirectUrl(auth, provider, authType, redirectUrl, eventId, additionalParams) {
    _assert(auth.config.authDomain, auth, "auth-domain-config-required" /* AuthErrorCode.MISSING_AUTH_DOMAIN */);
    _assert(auth.config.apiKey, auth, "invalid-api-key" /* AuthErrorCode.INVALID_API_KEY */);
    const params = {
        apiKey: auth.config.apiKey,
        appName: auth.name,
        authType,
        redirectUrl,
        v: SDK_VERSION,
        eventId
    };
    if (provider instanceof FederatedAuthProvider) {
        provider.setDefaultLanguage(auth.languageCode);
        params.providerId = provider.providerId || '';
        if (!isEmpty$1(provider.getCustomParameters())) {
            params.customParameters = JSON.stringify(provider.getCustomParameters());
        }
        // TODO set additionalParams from the provider as well?
        for (const [key, value] of Object.entries(additionalParams || {})) {
            params[key] = value;
        }
    }
    if (provider instanceof BaseOAuthProvider) {
        const scopes = provider.getScopes().filter(scope => scope !== '');
        if (scopes.length > 0) {
            params.scopes = scopes.join(',');
        }
    }
    if (auth.tenantId) {
        params.tid = auth.tenantId;
    }
    // TODO: maybe set eid as endipointId
    // TODO: maybe set fw as Frameworks.join(",")
    const paramsDict = params;
    for (const key of Object.keys(paramsDict)) {
        if (paramsDict[key] === undefined) {
            delete paramsDict[key];
        }
    }
    // Sets the App Check token to pass to the widget
    const appCheckToken = await auth._getAppCheckToken();
    const appCheckTokenFragment = appCheckToken
        ? `#${FIREBASE_APP_CHECK_FRAGMENT_ID}=${encodeURIComponent(appCheckToken)}`
        : '';
    // Start at index 1 to skip the leading '&' in the query string
    return `${getHandlerBase(auth)}?${querystring(paramsDict).slice(1)}${appCheckTokenFragment}`;
}
function getHandlerBase({ config }) {
    if (!config.emulator) {
        return `https://${config.authDomain}/${WIDGET_PATH}`;
    }
    return _emulatorUrl(config, EMULATOR_WIDGET_PATH);
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * The special web storage event
 *
 */
const WEB_STORAGE_SUPPORT_KEY = 'webStorageSupport';
class BrowserPopupRedirectResolver {
    constructor() {
        this.eventManagers = {};
        this.iframes = {};
        this.originValidationPromises = {};
        this._redirectPersistence = browserSessionPersistence;
        this._completeRedirectFn = _getRedirectResult;
        this._overrideRedirectResult = _overrideRedirectResult;
    }
    // Wrapping in async even though we don't await anywhere in order
    // to make sure errors are raised as promise rejections
    async _openPopup(auth, provider, authType, eventId) {
        var _a;
        debugAssert((_a = this.eventManagers[auth._key()]) === null || _a === void 0 ? void 0 : _a.manager, '_initialize() not called before _openPopup()');
        const url = await _getRedirectUrl(auth, provider, authType, _getCurrentUrl(), eventId);
        return _open(auth, url, _generateEventId());
    }
    async _openRedirect(auth, provider, authType, eventId) {
        await this._originValidation(auth);
        const url = await _getRedirectUrl(auth, provider, authType, _getCurrentUrl(), eventId);
        _setWindowLocation(url);
        return new Promise(() => { });
    }
    _initialize(auth) {
        const key = auth._key();
        if (this.eventManagers[key]) {
            const { manager, promise } = this.eventManagers[key];
            if (manager) {
                return Promise.resolve(manager);
            }
            else {
                debugAssert(promise, 'If manager is not set, promise should be');
                return promise;
            }
        }
        const promise = this.initAndGetManager(auth);
        this.eventManagers[key] = { promise };
        // If the promise is rejected, the key should be removed so that the
        // operation can be retried later.
        promise.catch(() => {
            delete this.eventManagers[key];
        });
        return promise;
    }
    async initAndGetManager(auth) {
        const iframe = await _openIframe(auth);
        const manager = new AuthEventManager(auth);
        iframe.register('authEvent', (iframeEvent) => {
            _assert(iframeEvent === null || iframeEvent === void 0 ? void 0 : iframeEvent.authEvent, auth, "invalid-auth-event" /* AuthErrorCode.INVALID_AUTH_EVENT */);
            // TODO: Consider splitting redirect and popup events earlier on
            const handled = manager.onEvent(iframeEvent.authEvent);
            return { status: handled ? "ACK" /* GapiOutcome.ACK */ : "ERROR" /* GapiOutcome.ERROR */ };
        }, gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
        this.eventManagers[auth._key()] = { manager };
        this.iframes[auth._key()] = iframe;
        return manager;
    }
    _isIframeWebStorageSupported(auth, cb) {
        const iframe = this.iframes[auth._key()];
        iframe.send(WEB_STORAGE_SUPPORT_KEY, { type: WEB_STORAGE_SUPPORT_KEY }, result => {
            var _a;
            const isSupported = (_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a[WEB_STORAGE_SUPPORT_KEY];
            if (isSupported !== undefined) {
                cb(!!isSupported);
            }
            _fail(auth, "internal-error" /* AuthErrorCode.INTERNAL_ERROR */);
        }, gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
    }
    _originValidation(auth) {
        const key = auth._key();
        if (!this.originValidationPromises[key]) {
            this.originValidationPromises[key] = _validateOrigin(auth);
        }
        return this.originValidationPromises[key];
    }
    get _shouldInitProactively() {
        // Mobile browsers and Safari need to optimistically initialize
        return _isMobileBrowser() || _isSafari() || _isIOS();
    }
}
/**
 * An implementation of {@link PopupRedirectResolver} suitable for browser
 * based applications.
 *
 * @remarks
 * This method does not work in a Node.js environment.
 *
 * @public
 */
const browserPopupRedirectResolver = BrowserPopupRedirectResolver;

var name = "@firebase/auth";
var version = "1.5.1";

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class AuthInterop {
    constructor(auth) {
        this.auth = auth;
        this.internalListeners = new Map();
    }
    getUid() {
        var _a;
        this.assertAuthConfigured();
        return ((_a = this.auth.currentUser) === null || _a === void 0 ? void 0 : _a.uid) || null;
    }
    async getToken(forceRefresh) {
        this.assertAuthConfigured();
        await this.auth._initializationPromise;
        if (!this.auth.currentUser) {
            return null;
        }
        const accessToken = await this.auth.currentUser.getIdToken(forceRefresh);
        return { accessToken };
    }
    addAuthTokenListener(listener) {
        this.assertAuthConfigured();
        if (this.internalListeners.has(listener)) {
            return;
        }
        const unsubscribe = this.auth.onIdTokenChanged(user => {
            listener((user === null || user === void 0 ? void 0 : user.stsTokenManager.accessToken) || null);
        });
        this.internalListeners.set(listener, unsubscribe);
        this.updateProactiveRefresh();
    }
    removeAuthTokenListener(listener) {
        this.assertAuthConfigured();
        const unsubscribe = this.internalListeners.get(listener);
        if (!unsubscribe) {
            return;
        }
        this.internalListeners.delete(listener);
        unsubscribe();
        this.updateProactiveRefresh();
    }
    assertAuthConfigured() {
        _assert(this.auth._initializationPromise, "dependent-sdk-initialized-before-auth" /* AuthErrorCode.DEPENDENT_SDK_INIT_BEFORE_AUTH */);
    }
    updateProactiveRefresh() {
        if (this.internalListeners.size > 0) {
            this.auth._startProactiveRefresh();
        }
        else {
            this.auth._stopProactiveRefresh();
        }
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function getVersionForPlatform(clientPlatform) {
    switch (clientPlatform) {
        case "Node" /* ClientPlatform.NODE */:
            return 'node';
        case "ReactNative" /* ClientPlatform.REACT_NATIVE */:
            return 'rn';
        case "Worker" /* ClientPlatform.WORKER */:
            return 'webworker';
        case "Cordova" /* ClientPlatform.CORDOVA */:
            return 'cordova';
        default:
            return undefined;
    }
}
/** @internal */
function registerAuth(clientPlatform) {
    _registerComponent(new Component("auth" /* _ComponentName.AUTH */, (container, { options: deps }) => {
        const app = container.getProvider('app').getImmediate();
        const heartbeatServiceProvider = container.getProvider('heartbeat');
        const appCheckServiceProvider = container.getProvider('app-check-internal');
        const { apiKey, authDomain } = app.options;
        _assert(apiKey && !apiKey.includes(':'), "invalid-api-key" /* AuthErrorCode.INVALID_API_KEY */, { appName: app.name });
        const config = {
            apiKey,
            authDomain,
            clientPlatform,
            apiHost: "identitytoolkit.googleapis.com" /* DefaultConfig.API_HOST */,
            tokenApiHost: "securetoken.googleapis.com" /* DefaultConfig.TOKEN_API_HOST */,
            apiScheme: "https" /* DefaultConfig.API_SCHEME */,
            sdkClientVersion: _getClientVersion(clientPlatform)
        };
        const authInstance = new AuthImpl(app, heartbeatServiceProvider, appCheckServiceProvider, config);
        _initializeAuthInstance(authInstance, deps);
        return authInstance;
    }, "PUBLIC" /* ComponentType.PUBLIC */)
        /**
         * Auth can only be initialized by explicitly calling getAuth() or initializeAuth()
         * For why we do this, See go/firebase-next-auth-init
         */
        .setInstantiationMode("EXPLICIT" /* InstantiationMode.EXPLICIT */)
        /**
         * Because all firebase products that depend on auth depend on auth-internal directly,
         * we need to initialize auth-internal after auth is initialized to make it available to other firebase products.
         */
        .setInstanceCreatedCallback((container, _instanceIdentifier, _instance) => {
        const authInternalProvider = container.getProvider("auth-internal" /* _ComponentName.AUTH_INTERNAL */);
        authInternalProvider.initialize();
    }));
    _registerComponent(new Component("auth-internal" /* _ComponentName.AUTH_INTERNAL */, container => {
        const auth = _castAuth(container.getProvider("auth" /* _ComponentName.AUTH */).getImmediate());
        return (auth => new AuthInterop(auth))(auth);
    }, "PRIVATE" /* ComponentType.PRIVATE */).setInstantiationMode("EXPLICIT" /* InstantiationMode.EXPLICIT */));
    registerVersion(name, version, getVersionForPlatform(clientPlatform));
    // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
    registerVersion(name, version, 'esm2017');
}

/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DEFAULT_ID_TOKEN_MAX_AGE = 5 * 60;
const authIdTokenMaxAge = getExperimentalSetting('authIdTokenMaxAge') || DEFAULT_ID_TOKEN_MAX_AGE;
let lastPostedIdToken = null;
const mintCookieFactory = (url) => async (user) => {
    const idTokenResult = user && (await user.getIdTokenResult());
    const idTokenAge = idTokenResult &&
        (new Date().getTime() - Date.parse(idTokenResult.issuedAtTime)) / 1000;
    if (idTokenAge && idTokenAge > authIdTokenMaxAge) {
        return;
    }
    // Specifically trip null => undefined when logged out, to delete any existing cookie
    const idToken = idTokenResult === null || idTokenResult === void 0 ? void 0 : idTokenResult.token;
    if (lastPostedIdToken === idToken) {
        return;
    }
    lastPostedIdToken = idToken;
    await fetch(url, {
        method: idToken ? 'POST' : 'DELETE',
        headers: idToken
            ? {
                'Authorization': `Bearer ${idToken}`
            }
            : {}
    });
};
/**
 * Returns the Auth instance associated with the provided {@link @firebase/app#FirebaseApp}.
 * If no instance exists, initializes an Auth instance with platform-specific default dependencies.
 *
 * @param app - The Firebase App.
 *
 * @public
 */
function getAuth(app = getApp()) {
    const provider = _getProvider(app, 'auth');
    if (provider.isInitialized()) {
        return provider.getImmediate();
    }
    const auth = initializeAuth(app, {
        popupRedirectResolver: browserPopupRedirectResolver,
        persistence: [
            indexedDBLocalPersistence,
            browserLocalPersistence,
            browserSessionPersistence
        ]
    });
    const authTokenSyncUrl = getExperimentalSetting('authTokenSyncURL');
    if (authTokenSyncUrl) {
        const mintCookie = mintCookieFactory(authTokenSyncUrl);
        beforeAuthStateChanged(auth, mintCookie, () => mintCookie(auth.currentUser));
        onIdTokenChanged(auth, user => mintCookie(user));
    }
    const authEmulatorHost = getDefaultEmulatorHost('auth');
    if (authEmulatorHost) {
        connectAuthEmulator(auth, `http://${authEmulatorHost}`);
    }
    return auth;
}
registerAuth("Browser" /* ClientPlatform.BROWSER */);

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/

var k$1,goog=goog||{},l$1=commonjsGlobal||self;function aa(a){var b=typeof a;b="object"!=b?b:a?Array.isArray(a)?"array":b:"null";return "array"==b||"object"==b&&"number"==typeof a.length}function p$1(a){var b=typeof a;return "object"==b&&null!=a||"function"==b}function ba(a){return Object.prototype.hasOwnProperty.call(a,ca)&&a[ca]||(a[ca]=++da)}var ca="closure_uid_"+(1E9*Math.random()>>>0),da=0;function ea(a,b,c){return a.call.apply(a.bind,arguments)}
function fa(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var e=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(e,d);return a.apply(b,e)}}return function(){return a.apply(b,arguments)}}function q(a,b,c){Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?q=ea:q=fa;return q.apply(null,arguments)}
function ha(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var d=c.slice();d.push.apply(d,arguments);return a.apply(this,d)}}function r$1(a,b){function c(){}c.prototype=b.prototype;a.$=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.ac=function(d,e,f){for(var h=Array(arguments.length-2),n=2;n<arguments.length;n++)h[n-2]=arguments[n];return b.prototype[e].apply(d,h)};}function v$2(){this.s=this.s;this.o=this.o;}var ia=0;v$2.prototype.s=!1;v$2.prototype.sa=function(){if(!this.s&&(this.s=!0,this.N(),0!=ia)){ba(this);}};v$2.prototype.N=function(){if(this.o)for(;this.o.length;)this.o.shift()();};const ka=Array.prototype.indexOf?function(a,b){return Array.prototype.indexOf.call(a,b,void 0)}:function(a,b){if("string"===typeof a)return "string"!==typeof b||1!=b.length?-1:a.indexOf(b,0);for(let c=0;c<a.length;c++)if(c in a&&a[c]===b)return c;return -1};function ma(a){const b=a.length;if(0<b){const c=Array(b);for(let d=0;d<b;d++)c[d]=a[d];return c}return []}
function na(a,b){for(let c=1;c<arguments.length;c++){const d=arguments[c];if(aa(d)){const e=a.length||0,f=d.length||0;a.length=e+f;for(let h=0;h<f;h++)a[e+h]=d[h];}else a.push(d);}}function w$2(a,b){this.type=a;this.g=this.target=b;this.defaultPrevented=!1;}w$2.prototype.h=function(){this.defaultPrevented=!0;};var oa=function(){if(!l$1.addEventListener||!Object.defineProperty)return !1;var a=!1,b=Object.defineProperty({},"passive",{get:function(){a=!0;}});try{const c=()=>{};l$1.addEventListener("test",c,b);l$1.removeEventListener("test",c,b);}catch(c){}return a}();function x$1(a){return /^[\s\xa0]*$/.test(a)}function pa(){var a=l$1.navigator;return a&&(a=a.userAgent)?a:""}function y$1(a){return -1!=pa().indexOf(a)}function qa(a){qa[" "](a);return a}qa[" "]=function(){};function ra(a,b){var c=sa;return Object.prototype.hasOwnProperty.call(c,a)?c[a]:c[a]=b(a)}var ta=y$1("Opera"),z=y$1("Trident")||y$1("MSIE"),ua=y$1("Edge"),va=ua||z,wa=y$1("Gecko")&&!(-1!=pa().toLowerCase().indexOf("webkit")&&!y$1("Edge"))&&!(y$1("Trident")||y$1("MSIE"))&&!y$1("Edge"),xa=-1!=pa().toLowerCase().indexOf("webkit")&&!y$1("Edge");function ya(){var a=l$1.document;return a?a.documentMode:void 0}var za;
a:{var Aa="",Ba=function(){var a=pa();if(wa)return /rv:([^\);]+)(\)|;)/.exec(a);if(ua)return /Edge\/([\d\.]+)/.exec(a);if(z)return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(xa)return /WebKit\/(\S+)/.exec(a);if(ta)return /(?:Version)[ \/]?(\S+)/.exec(a)}();Ba&&(Aa=Ba?Ba[1]:"");if(z){var Ca=ya();if(null!=Ca&&Ca>parseFloat(Aa)){za=String(Ca);break a}}za=Aa;}var Da;if(l$1.document&&z){var Ea=ya();Da=Ea?Ea:parseInt(za,10)||void 0;}else Da=void 0;var Fa=Da;function A$1(a,b){w$2.call(this,a?a.type:"");this.relatedTarget=this.g=this.target=null;this.button=this.screenY=this.screenX=this.clientY=this.clientX=0;this.key="";this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1;this.state=null;this.pointerId=0;this.pointerType="";this.i=null;if(a){var c=this.type=a.type,d=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement;this.g=b;if(b=a.relatedTarget){if(wa){a:{try{qa(b.nodeName);var e=!0;break a}catch(f){}e=
!1;}e||(b=null);}}else "mouseover"==c?b=a.fromElement:"mouseout"==c&&(b=a.toElement);this.relatedTarget=b;d?(this.clientX=void 0!==d.clientX?d.clientX:d.pageX,this.clientY=void 0!==d.clientY?d.clientY:d.pageY,this.screenX=d.screenX||0,this.screenY=d.screenY||0):(this.clientX=void 0!==a.clientX?a.clientX:a.pageX,this.clientY=void 0!==a.clientY?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0);this.button=a.button;this.key=a.key||"";this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=
a.shiftKey;this.metaKey=a.metaKey;this.pointerId=a.pointerId||0;this.pointerType="string"===typeof a.pointerType?a.pointerType:Ga[a.pointerType]||"";this.state=a.state;this.i=a;a.defaultPrevented&&A$1.$.h.call(this);}}r$1(A$1,w$2);var Ga={2:"touch",3:"pen",4:"mouse"};A$1.prototype.h=function(){A$1.$.h.call(this);var a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1;};var Ha="closure_listenable_"+(1E6*Math.random()|0);var Ia=0;function Ja(a,b,c,d,e){this.listener=a;this.proxy=null;this.src=b;this.type=c;this.capture=!!d;this.la=e;this.key=++Ia;this.fa=this.ia=!1;}function Ma(a){a.fa=!0;a.listener=null;a.proxy=null;a.src=null;a.la=null;}function Na(a,b,c){for(const d in a)b.call(c,a[d],d,a);}function Oa(a,b){for(const c in a)b.call(void 0,a[c],c,a);}function Pa(a){const b={};for(const c in a)b[c]=a[c];return b}const Qa="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Ra(a,b){let c,d;for(let e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(let f=0;f<Qa.length;f++)c=Qa[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c]);}}function Sa(a){this.src=a;this.g={};this.h=0;}Sa.prototype.add=function(a,b,c,d,e){var f=a.toString();a=this.g[f];a||(a=this.g[f]=[],this.h++);var h=Ta(a,b,d,e);-1<h?(b=a[h],c||(b.ia=!1)):(b=new Ja(b,this.src,f,!!d,e),b.ia=c,a.push(b));return b};function Ua(a,b){var c=b.type;if(c in a.g){var d=a.g[c],e=ka(d,b),f;(f=0<=e)&&Array.prototype.splice.call(d,e,1);f&&(Ma(b),0==a.g[c].length&&(delete a.g[c],a.h--));}}
function Ta(a,b,c,d){for(var e=0;e<a.length;++e){var f=a[e];if(!f.fa&&f.listener==b&&f.capture==!!c&&f.la==d)return e}return -1}var Va="closure_lm_"+(1E6*Math.random()|0),Wa={};function Ya(a,b,c,d,e){if(d&&d.once)return Za(a,b,c,d,e);if(Array.isArray(b)){for(var f=0;f<b.length;f++)Ya(a,b[f],c,d,e);return null}c=$a(c);return a&&a[Ha]?a.O(b,c,p$1(d)?!!d.capture:!!d,e):ab(a,b,c,!1,d,e)}
function ab(a,b,c,d,e,f){if(!b)throw Error("Invalid event type");var h=p$1(e)?!!e.capture:!!e,n=bb(a);n||(a[Va]=n=new Sa(a));c=n.add(b,c,d,h,f);if(c.proxy)return c;d=cb();c.proxy=d;d.src=a;d.listener=c;if(a.addEventListener)oa||(e=h),void 0===e&&(e=!1),a.addEventListener(b.toString(),d,e);else if(a.attachEvent)a.attachEvent(db$1(b.toString()),d);else if(a.addListener&&a.removeListener)a.addListener(d);else throw Error("addEventListener and attachEvent are unavailable.");return c}
function cb(){function a(c){return b.call(a.src,a.listener,c)}const b=eb;return a}function Za(a,b,c,d,e){if(Array.isArray(b)){for(var f=0;f<b.length;f++)Za(a,b[f],c,d,e);return null}c=$a(c);return a&&a[Ha]?a.P(b,c,p$1(d)?!!d.capture:!!d,e):ab(a,b,c,!0,d,e)}
function fb(a,b,c,d,e){if(Array.isArray(b))for(var f=0;f<b.length;f++)fb(a,b[f],c,d,e);else (d=p$1(d)?!!d.capture:!!d,c=$a(c),a&&a[Ha])?(a=a.i,b=String(b).toString(),b in a.g&&(f=a.g[b],c=Ta(f,c,d,e),-1<c&&(Ma(f[c]),Array.prototype.splice.call(f,c,1),0==f.length&&(delete a.g[b],a.h--)))):a&&(a=bb(a))&&(b=a.g[b.toString()],a=-1,b&&(a=Ta(b,c,d,e)),(c=-1<a?b[a]:null)&&gb(c));}
function gb(a){if("number"!==typeof a&&a&&!a.fa){var b=a.src;if(b&&b[Ha])Ua(b.i,a);else {var c=a.type,d=a.proxy;b.removeEventListener?b.removeEventListener(c,d,a.capture):b.detachEvent?b.detachEvent(db$1(c),d):b.addListener&&b.removeListener&&b.removeListener(d);(c=bb(b))?(Ua(c,a),0==c.h&&(c.src=null,b[Va]=null)):Ma(a);}}}function db$1(a){return a in Wa?Wa[a]:Wa[a]="on"+a}function eb(a,b){if(a.fa)a=!0;else {b=new A$1(b,this);var c=a.listener,d=a.la||a.src;a.ia&&gb(a);a=c.call(d,b);}return a}
function bb(a){a=a[Va];return a instanceof Sa?a:null}var hb="__closure_events_fn_"+(1E9*Math.random()>>>0);function $a(a){if("function"===typeof a)return a;a[hb]||(a[hb]=function(b){return a.handleEvent(b)});return a[hb]}function B(){v$2.call(this);this.i=new Sa(this);this.S=this;this.J=null;}r$1(B,v$2);B.prototype[Ha]=!0;B.prototype.removeEventListener=function(a,b,c,d){fb(this,a,b,c,d);};
function C$2(a,b){var c,d=a.J;if(d)for(c=[];d;d=d.J)c.push(d);a=a.S;d=b.type||b;if("string"===typeof b)b=new w$2(b,a);else if(b instanceof w$2)b.target=b.target||a;else {var e=b;b=new w$2(d,a);Ra(b,e);}e=!0;if(c)for(var f=c.length-1;0<=f;f--){var h=b.g=c[f];e=ib(h,d,!0,b)&&e;}h=b.g=a;e=ib(h,d,!0,b)&&e;e=ib(h,d,!1,b)&&e;if(c)for(f=0;f<c.length;f++)h=b.g=c[f],e=ib(h,d,!1,b)&&e;}
B.prototype.N=function(){B.$.N.call(this);if(this.i){var a=this.i,c;for(c in a.g){for(var d=a.g[c],e=0;e<d.length;e++)Ma(d[e]);delete a.g[c];a.h--;}}this.J=null;};B.prototype.O=function(a,b,c,d){return this.i.add(String(a),b,!1,c,d)};B.prototype.P=function(a,b,c,d){return this.i.add(String(a),b,!0,c,d)};
function ib(a,b,c,d){b=a.i.g[String(b)];if(!b)return !0;b=b.concat();for(var e=!0,f=0;f<b.length;++f){var h=b[f];if(h&&!h.fa&&h.capture==c){var n=h.listener,t=h.la||h.src;h.ia&&Ua(a.i,h);e=!1!==n.call(t,d)&&e;}}return e&&!d.defaultPrevented}var jb=l$1.JSON.stringify;class kb{constructor(a,b){this.i=a;this.j=b;this.h=0;this.g=null;}get(){let a;0<this.h?(this.h--,a=this.g,this.g=a.next,a.next=null):a=this.i();return a}}function lb(){var a=mb;let b=null;a.g&&(b=a.g,a.g=a.g.next,a.g||(a.h=null),b.next=null);return b}class nb{constructor(){this.h=this.g=null;}add(a,b){const c=ob.get();c.set(a,b);this.h?this.h.next=c:this.g=c;this.h=c;}}var ob=new kb(()=>new pb,a=>a.reset());class pb{constructor(){this.next=this.g=this.h=null;}set(a,b){this.h=a;this.g=b;this.next=null;}reset(){this.next=this.g=this.h=null;}}function qb(a){var b=1;a=a.split(":");const c=[];for(;0<b&&a.length;)c.push(a.shift()),b--;a.length&&c.push(a.join(":"));return c}function rb(a){l$1.setTimeout(()=>{throw a;},0);}let sb,tb=!1,mb=new nb,vb=()=>{const a=l$1.Promise.resolve(void 0);sb=()=>{a.then(ub);};};var ub=()=>{for(var a;a=lb();){try{a.h.call(a.g);}catch(c){rb(c);}var b=ob;b.j(a);100>b.h&&(b.h++,a.next=b.g,b.g=a);}tb=!1;};function wb(a,b){B.call(this);this.h=a||1;this.g=b||l$1;this.j=q(this.qb,this);this.l=Date.now();}r$1(wb,B);k$1=wb.prototype;k$1.ga=!1;k$1.T=null;k$1.qb=function(){if(this.ga){var a=Date.now()-this.l;0<a&&a<.8*this.h?this.T=this.g.setTimeout(this.j,this.h-a):(this.T&&(this.g.clearTimeout(this.T),this.T=null),C$2(this,"tick"),this.ga&&(xb(this),this.start()));}};k$1.start=function(){this.ga=!0;this.T||(this.T=this.g.setTimeout(this.j,this.h),this.l=Date.now());};
function xb(a){a.ga=!1;a.T&&(a.g.clearTimeout(a.T),a.T=null);}k$1.N=function(){wb.$.N.call(this);xb(this);delete this.g;};function yb(a,b,c){if("function"===typeof a)c&&(a=q(a,c));else if(a&&"function"==typeof a.handleEvent)a=q(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(b)?-1:l$1.setTimeout(a,b||0)}function zb(a){a.g=yb(()=>{a.g=null;a.i&&(a.i=!1,zb(a));},a.j);const b=a.h;a.h=null;a.m.apply(null,b);}class Ab extends v$2{constructor(a,b){super();this.m=a;this.j=b;this.h=null;this.i=!1;this.g=null;}l(a){this.h=arguments;this.g?this.i=!0:zb(this);}N(){super.N();this.g&&(l$1.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null);}}function Bb(a){v$2.call(this);this.h=a;this.g={};}r$1(Bb,v$2);var Cb=[];function Eb(a,b,c,d){Array.isArray(c)||(c&&(Cb[0]=c.toString()),c=Cb);for(var e=0;e<c.length;e++){var f=Ya(b,c[e],d||a.handleEvent,!1,a.h||a);if(!f)break;a.g[f.key]=f;}}function Fb(a){Na(a.g,function(b,c){this.g.hasOwnProperty(c)&&gb(b);},a);a.g={};}Bb.prototype.N=function(){Bb.$.N.call(this);Fb(this);};Bb.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented");};function Gb(){this.g=!0;}Gb.prototype.Ea=function(){this.g=!1;};function Hb(a,b,c,d,e,f){a.info(function(){if(a.g)if(f){var h="";for(var n=f.split("&"),t=0;t<n.length;t++){var m=n[t].split("=");if(1<m.length){var u=m[0];m=m[1];var L=u.split("_");h=2<=L.length&&"type"==L[1]?h+(u+"="+m+"&"):h+(u+"=redacted&");}}}else h=null;else h=f;return "XMLHTTP REQ ("+d+") [attempt "+e+"]: "+b+"\n"+c+"\n"+h});}
function Ib(a,b,c,d,e,f,h){a.info(function(){return "XMLHTTP RESP ("+d+") [ attempt "+e+"]: "+b+"\n"+c+"\n"+f+" "+h});}function D$1(a,b,c,d){a.info(function(){return "XMLHTTP TEXT ("+b+"): "+Jb(a,c)+(d?" "+d:"")});}function Kb(a,b){a.info(function(){return "TIMEOUT: "+b});}Gb.prototype.info=function(){};
function Jb(a,b){if(!a.g)return b;if(!b)return null;try{var c=JSON.parse(b);if(c)for(a=0;a<c.length;a++)if(Array.isArray(c[a])){var d=c[a];if(!(2>d.length)){var e=d[1];if(Array.isArray(e)&&!(1>e.length)){var f=e[0];if("noop"!=f&&"stop"!=f&&"close"!=f)for(var h=1;h<e.length;h++)e[h]="";}}}return jb(c)}catch(n){return b}}var E$1={},Lb=null;function Mb(){return Lb=Lb||new B}E$1.Ta="serverreachability";function Nb(a){w$2.call(this,E$1.Ta,a);}r$1(Nb,w$2);function Ob(a){const b=Mb();C$2(b,new Nb(b));}E$1.STAT_EVENT="statevent";function Pb(a,b){w$2.call(this,E$1.STAT_EVENT,a);this.stat=b;}r$1(Pb,w$2);function F(a){const b=Mb();C$2(b,new Pb(b,a));}E$1.Ua="timingevent";function Qb(a,b){w$2.call(this,E$1.Ua,a);this.size=b;}r$1(Qb,w$2);
function Rb(a,b){if("function"!==typeof a)throw Error("Fn must not be null and must be a function");return l$1.setTimeout(function(){a();},b)}var Sb={NO_ERROR:0,rb:1,Eb:2,Db:3,yb:4,Cb:5,Fb:6,Qa:7,TIMEOUT:8,Ib:9};var Tb={wb:"complete",Sb:"success",Ra:"error",Qa:"abort",Kb:"ready",Lb:"readystatechange",TIMEOUT:"timeout",Gb:"incrementaldata",Jb:"progress",zb:"downloadprogress",$b:"uploadprogress"};function Ub(){}Ub.prototype.h=null;function Vb(a){return a.h||(a.h=a.i())}function Wb(){}var Xb={OPEN:"a",vb:"b",Ra:"c",Hb:"d"};function Yb(){w$2.call(this,"d");}r$1(Yb,w$2);function Zb(){w$2.call(this,"c");}r$1(Zb,w$2);var $b;function ac(){}r$1(ac,Ub);ac.prototype.g=function(){return new XMLHttpRequest};ac.prototype.i=function(){return {}};$b=new ac;function bc(a,b,c,d){this.l=a;this.j=b;this.m=c;this.W=d||1;this.U=new Bb(this);this.P=cc;a=va?125:void 0;this.V=new wb(a);this.I=null;this.i=!1;this.u=this.B=this.A=this.L=this.G=this.Y=this.C=null;this.F=[];this.g=null;this.o=0;this.s=this.v=null;this.ca=-1;this.J=!1;this.O=0;this.M=null;this.ba=this.K=this.aa=this.S=!1;this.h=new dc;}function dc(){this.i=null;this.g="";this.h=!1;}var cc=45E3,ec={},fc={};k$1=bc.prototype;k$1.setTimeout=function(a){this.P=a;};
function gc(a,b,c){a.L=1;a.A=hc(G(b));a.u=c;a.S=!0;ic(a,null);}function ic(a,b){a.G=Date.now();jc(a);a.B=G(a.A);var c=a.B,d=a.W;Array.isArray(d)||(d=[String(d)]);kc(c.i,"t",d);a.o=0;c=a.l.J;a.h=new dc;a.g=lc(a.l,c?b:null,!a.u);0<a.O&&(a.M=new Ab(q(a.Pa,a,a.g),a.O));Eb(a.U,a.g,"readystatechange",a.nb);b=a.I?Pa(a.I):{};a.u?(a.v||(a.v="POST"),b["Content-Type"]="application/x-www-form-urlencoded",a.g.ha(a.B,a.v,a.u,b)):(a.v="GET",a.g.ha(a.B,a.v,null,b));Ob();Hb(a.j,a.v,a.B,a.m,a.W,a.u);}
k$1.nb=function(a){a=a.target;const b=this.M;b&&3==H$1(a)?b.l():this.Pa(a);};
k$1.Pa=function(a){try{if(a==this.g)a:{const u=H$1(this.g);var b=this.g.Ia();const L=this.g.da();if(!(3>u)&&(3!=u||va||this.g&&(this.h.h||this.g.ja()||mc(this.g)))){this.J||4!=u||7==b||(8==b||0>=L?Ob(3):Ob(2));nc(this);var c=this.g.da();this.ca=c;b:if(oc(this)){var d=mc(this.g);a="";var e=d.length,f=4==H$1(this.g);if(!this.h.i){if("undefined"===typeof TextDecoder){I$1(this);pc(this);var h="";break b}this.h.i=new l$1.TextDecoder;}for(b=0;b<e;b++)this.h.h=!0,a+=this.h.i.decode(d[b],{stream:f&&b==e-1});d.length=
0;this.h.g+=a;this.o=0;h=this.h.g;}else h=this.g.ja();this.i=200==c;Ib(this.j,this.v,this.B,this.m,this.W,u,c);if(this.i){if(this.aa&&!this.K){b:{if(this.g){var n,t=this.g;if((n=t.g?t.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!x$1(n)){var m=n;break b}}m=null;}if(c=m)D$1(this.j,this.m,c,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,qc(this,c);else {this.i=!1;this.s=3;F(12);I$1(this);pc(this);break a}}this.S?(rc(this,u,h),va&&this.i&&3==u&&(Eb(this.U,this.V,"tick",this.mb),
this.V.start())):(D$1(this.j,this.m,h,null),qc(this,h));4==u&&I$1(this);this.i&&!this.J&&(4==u?sc(this.l,this):(this.i=!1,jc(this)));}else tc(this.g),400==c&&0<h.indexOf("Unknown SID")?(this.s=3,F(12)):(this.s=0,F(13)),I$1(this),pc(this);}}}catch(u){}finally{}};function oc(a){return a.g?"GET"==a.v&&2!=a.L&&a.l.Ha:!1}
function rc(a,b,c){let d=!0,e;for(;!a.J&&a.o<c.length;)if(e=uc(a,c),e==fc){4==b&&(a.s=4,F(14),d=!1);D$1(a.j,a.m,null,"[Incomplete Response]");break}else if(e==ec){a.s=4;F(15);D$1(a.j,a.m,c,"[Invalid Chunk]");d=!1;break}else D$1(a.j,a.m,e,null),qc(a,e);oc(a)&&0!=a.o&&(a.h.g=a.h.g.slice(a.o),a.o=0);4!=b||0!=c.length||a.h.h||(a.s=1,F(16),d=!1);a.i=a.i&&d;d?0<c.length&&!a.ba&&(a.ba=!0,b=a.l,b.g==a&&b.ca&&!b.M&&(b.l.info("Great, no buffering proxy detected. Bytes received: "+c.length),vc(b),b.M=!0,F(11))):(D$1(a.j,
a.m,c,"[Invalid Chunked Response]"),I$1(a),pc(a));}k$1.mb=function(){if(this.g){var a=H$1(this.g),b=this.g.ja();this.o<b.length&&(nc(this),rc(this,a,b),this.i&&4!=a&&jc(this));}};function uc(a,b){var c=a.o,d=b.indexOf("\n",c);if(-1==d)return fc;c=Number(b.substring(c,d));if(isNaN(c))return ec;d+=1;if(d+c>b.length)return fc;b=b.slice(d,d+c);a.o=d+c;return b}k$1.cancel=function(){this.J=!0;I$1(this);};function jc(a){a.Y=Date.now()+a.P;wc(a,a.P);}
function wc(a,b){if(null!=a.C)throw Error("WatchDog timer not null");a.C=Rb(q(a.lb,a),b);}function nc(a){a.C&&(l$1.clearTimeout(a.C),a.C=null);}k$1.lb=function(){this.C=null;const a=Date.now();0<=a-this.Y?(Kb(this.j,this.B),2!=this.L&&(Ob(),F(17)),I$1(this),this.s=2,pc(this)):wc(this,this.Y-a);};function pc(a){0==a.l.H||a.J||sc(a.l,a);}function I$1(a){nc(a);var b=a.M;b&&"function"==typeof b.sa&&b.sa();a.M=null;xb(a.V);Fb(a.U);a.g&&(b=a.g,a.g=null,b.abort(),b.sa());}
function qc(a,b){try{var c=a.l;if(0!=c.H&&(c.g==a||xc(c.i,a)))if(!a.K&&xc(c.i,a)&&3==c.H){try{var d=c.Ja.g.parse(b);}catch(m){d=null;}if(Array.isArray(d)&&3==d.length){var e=d;if(0==e[0])a:{if(!c.u){if(c.g)if(c.g.G+3E3<a.G)yc(c),zc(c);else break a;Ac(c);F(18);}}else c.Fa=e[1],0<c.Fa-c.V&&37500>e[2]&&c.G&&0==c.A&&!c.v&&(c.v=Rb(q(c.ib,c),6E3));if(1>=Bc(c.i)&&c.oa){try{c.oa();}catch(m){}c.oa=void 0;}}else J(c,11);}else if((a.K||c.g==a)&&yc(c),!x$1(b))for(e=c.Ja.g.parse(b),b=0;b<e.length;b++){let m=e[b];c.V=
m[0];m=m[1];if(2==c.H)if("c"==m[0]){c.K=m[1];c.pa=m[2];const u=m[3];null!=u&&(c.ra=u,c.l.info("VER="+c.ra));const L=m[4];null!=L&&(c.Ga=L,c.l.info("SVER="+c.Ga));const Ka=m[5];null!=Ka&&"number"===typeof Ka&&0<Ka&&(d=1.5*Ka,c.L=d,c.l.info("backChannelRequestTimeoutMs_="+d));d=c;const la=a.g;if(la){const La=la.g?la.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(La){var f=d.i;f.g||-1==La.indexOf("spdy")&&-1==La.indexOf("quic")&&-1==La.indexOf("h2")||(f.j=f.l,f.g=new Set,f.h&&(Cc(f,f.h),f.h=null));}if(d.F){const Db=
la.g?la.g.getResponseHeader("X-HTTP-Session-Id"):null;Db&&(d.Da=Db,K(d.I,d.F,Db));}}c.H=3;c.h&&c.h.Ba();c.ca&&(c.S=Date.now()-a.G,c.l.info("Handshake RTT: "+c.S+"ms"));d=c;var h=a;d.wa=Dc(d,d.J?d.pa:null,d.Y);if(h.K){Ec(d.i,h);var n=h,t=d.L;t&&n.setTimeout(t);n.C&&(nc(n),jc(n));d.g=h;}else Fc(d);0<c.j.length&&Gc(c);}else "stop"!=m[0]&&"close"!=m[0]||J(c,7);else 3==c.H&&("stop"==m[0]||"close"==m[0]?"stop"==m[0]?J(c,7):Hc(c):"noop"!=m[0]&&c.h&&c.h.Aa(m),c.A=0);}Ob(4);}catch(m){}}function Ic(a){if(a.Z&&"function"==typeof a.Z)return a.Z();if("undefined"!==typeof Map&&a instanceof Map||"undefined"!==typeof Set&&a instanceof Set)return Array.from(a.values());if("string"===typeof a)return a.split("");if(aa(a)){for(var b=[],c=a.length,d=0;d<c;d++)b.push(a[d]);return b}b=[];c=0;for(d in a)b[c++]=a[d];return b}
function Jc(a){if(a.ta&&"function"==typeof a.ta)return a.ta();if(!a.Z||"function"!=typeof a.Z){if("undefined"!==typeof Map&&a instanceof Map)return Array.from(a.keys());if(!("undefined"!==typeof Set&&a instanceof Set)){if(aa(a)||"string"===typeof a){var b=[];a=a.length;for(var c=0;c<a;c++)b.push(c);return b}b=[];c=0;for(const d in a)b[c++]=d;return b}}}
function Kc(a,b){if(a.forEach&&"function"==typeof a.forEach)a.forEach(b,void 0);else if(aa(a)||"string"===typeof a)Array.prototype.forEach.call(a,b,void 0);else for(var c=Jc(a),d=Ic(a),e=d.length,f=0;f<e;f++)b.call(void 0,d[f],c&&c[f],a);}var Lc=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Mc(a,b){if(a){a=a.split("&");for(var c=0;c<a.length;c++){var d=a[c].indexOf("="),e=null;if(0<=d){var f=a[c].substring(0,d);e=a[c].substring(d+1);}else f=a[c];b(f,e?decodeURIComponent(e.replace(/\+/g," ")):"");}}}function M$1(a){this.g=this.s=this.j="";this.m=null;this.o=this.l="";this.h=!1;if(a instanceof M$1){this.h=a.h;Nc(this,a.j);this.s=a.s;this.g=a.g;Oc(this,a.m);this.l=a.l;var b=a.i;var c=new Pc;c.i=b.i;b.g&&(c.g=new Map(b.g),c.h=b.h);Qc(this,c);this.o=a.o;}else a&&(b=String(a).match(Lc))?(this.h=!1,Nc(this,b[1]||"",!0),this.s=Rc(b[2]||""),this.g=Rc(b[3]||"",!0),Oc(this,b[4]),this.l=Rc(b[5]||"",!0),Qc(this,b[6]||"",!0),this.o=Rc(b[7]||"")):(this.h=!1,this.i=new Pc(null,this.h));}
M$1.prototype.toString=function(){var a=[],b=this.j;b&&a.push(Sc(b,Tc,!0),":");var c=this.g;if(c||"file"==b)a.push("//"),(b=this.s)&&a.push(Sc(b,Tc,!0),"@"),a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c=this.m,null!=c&&a.push(":",String(c));if(c=this.l)this.g&&"/"!=c.charAt(0)&&a.push("/"),a.push(Sc(c,"/"==c.charAt(0)?Uc:Vc,!0));(c=this.i.toString())&&a.push("?",c);(c=this.o)&&a.push("#",Sc(c,Wc));return a.join("")};function G(a){return new M$1(a)}
function Nc(a,b,c){a.j=c?Rc(b,!0):b;a.j&&(a.j=a.j.replace(/:$/,""));}function Oc(a,b){if(b){b=Number(b);if(isNaN(b)||0>b)throw Error("Bad port number "+b);a.m=b;}else a.m=null;}function Qc(a,b,c){b instanceof Pc?(a.i=b,Xc(a.i,a.h)):(c||(b=Sc(b,Yc)),a.i=new Pc(b,a.h));}function K(a,b,c){a.i.set(b,c);}function hc(a){K(a,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36));return a}
function Rc(a,b){return a?b?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function Sc(a,b,c){return "string"===typeof a?(a=encodeURI(a).replace(b,Zc),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function Zc(a){a=a.charCodeAt(0);return "%"+(a>>4&15).toString(16)+(a&15).toString(16)}var Tc=/[#\/\?@]/g,Vc=/[#\?:]/g,Uc=/[#\?]/g,Yc=/[#\?@]/g,Wc=/#/g;function Pc(a,b){this.h=this.g=null;this.i=a||null;this.j=!!b;}
function N$1(a){a.g||(a.g=new Map,a.h=0,a.i&&Mc(a.i,function(b,c){a.add(decodeURIComponent(b.replace(/\+/g," ")),c);}));}k$1=Pc.prototype;k$1.add=function(a,b){N$1(this);this.i=null;a=O(this,a);var c=this.g.get(a);c||this.g.set(a,c=[]);c.push(b);this.h+=1;return this};function $c(a,b){N$1(a);b=O(a,b);a.g.has(b)&&(a.i=null,a.h-=a.g.get(b).length,a.g.delete(b));}function ad(a,b){N$1(a);b=O(a,b);return a.g.has(b)}
k$1.forEach=function(a,b){N$1(this);this.g.forEach(function(c,d){c.forEach(function(e){a.call(b,e,d,this);},this);},this);};k$1.ta=function(){N$1(this);const a=Array.from(this.g.values()),b=Array.from(this.g.keys()),c=[];for(let d=0;d<b.length;d++){const e=a[d];for(let f=0;f<e.length;f++)c.push(b[d]);}return c};k$1.Z=function(a){N$1(this);let b=[];if("string"===typeof a)ad(this,a)&&(b=b.concat(this.g.get(O(this,a))));else {a=Array.from(this.g.values());for(let c=0;c<a.length;c++)b=b.concat(a[c]);}return b};
k$1.set=function(a,b){N$1(this);this.i=null;a=O(this,a);ad(this,a)&&(this.h-=this.g.get(a).length);this.g.set(a,[b]);this.h+=1;return this};k$1.get=function(a,b){if(!a)return b;a=this.Z(a);return 0<a.length?String(a[0]):b};function kc(a,b,c){$c(a,b);0<c.length&&(a.i=null,a.g.set(O(a,b),ma(c)),a.h+=c.length);}
k$1.toString=function(){if(this.i)return this.i;if(!this.g)return "";const a=[],b=Array.from(this.g.keys());for(var c=0;c<b.length;c++){var d=b[c];const f=encodeURIComponent(String(d)),h=this.Z(d);for(d=0;d<h.length;d++){var e=f;""!==h[d]&&(e+="="+encodeURIComponent(String(h[d])));a.push(e);}}return this.i=a.join("&")};function O(a,b){b=String(b);a.j&&(b=b.toLowerCase());return b}
function Xc(a,b){b&&!a.j&&(N$1(a),a.i=null,a.g.forEach(function(c,d){var e=d.toLowerCase();d!=e&&($c(this,d),kc(this,e,c));},a));a.j=b;}var bd=class{constructor(a,b){this.g=a;this.map=b;}};function cd(a){this.l=a||dd;l$1.PerformanceNavigationTiming?(a=l$1.performance.getEntriesByType("navigation"),a=0<a.length&&("hq"==a[0].nextHopProtocol||"h2"==a[0].nextHopProtocol)):a=!!(l$1.g&&l$1.g.Ka&&l$1.g.Ka()&&l$1.g.Ka().dc);this.j=a?this.l:1;this.g=null;1<this.j&&(this.g=new Set);this.h=null;this.i=[];}var dd=10;function ed(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Bc(a){return a.h?1:a.g?a.g.size:0}function xc(a,b){return a.h?a.h==b:a.g?a.g.has(b):!1}function Cc(a,b){a.g?a.g.add(b):a.h=b;}
function Ec(a,b){a.h&&a.h==b?a.h=null:a.g&&a.g.has(b)&&a.g.delete(b);}cd.prototype.cancel=function(){this.i=fd(this);if(this.h)this.h.cancel(),this.h=null;else if(this.g&&0!==this.g.size){for(const a of this.g.values())a.cancel();this.g.clear();}};function fd(a){if(null!=a.h)return a.i.concat(a.h.F);if(null!=a.g&&0!==a.g.size){let b=a.i;for(const c of a.g.values())b=b.concat(c.F);return b}return ma(a.i)}var gd=class{stringify(a){return l$1.JSON.stringify(a,void 0)}parse(a){return l$1.JSON.parse(a,void 0)}};function hd(){this.g=new gd;}function id(a,b,c){const d=c||"";try{Kc(a,function(e,f){let h=e;p$1(e)&&(h=jb(e));b.push(d+f+"="+encodeURIComponent(h));});}catch(e){throw b.push(d+"type="+encodeURIComponent("_badmap")),e;}}function jd(a,b){const c=new Gb;if(l$1.Image){const d=new Image;d.onload=ha(kd,c,d,"TestLoadImage: loaded",!0,b);d.onerror=ha(kd,c,d,"TestLoadImage: error",!1,b);d.onabort=ha(kd,c,d,"TestLoadImage: abort",!1,b);d.ontimeout=ha(kd,c,d,"TestLoadImage: timeout",!1,b);l$1.setTimeout(function(){if(d.ontimeout)d.ontimeout();},1E4);d.src=a;}else b(!1);}function kd(a,b,c,d,e){try{b.onload=null,b.onerror=null,b.onabort=null,b.ontimeout=null,e(d);}catch(f){}}function ld(a){this.l=a.ec||null;this.j=a.ob||!1;}r$1(ld,Ub);ld.prototype.g=function(){return new md(this.l,this.j)};ld.prototype.i=function(a){return function(){return a}}({});function md(a,b){B.call(this);this.F=a;this.u=b;this.m=void 0;this.readyState=nd;this.status=0;this.responseType=this.responseText=this.response=this.statusText="";this.onreadystatechange=null;this.v=new Headers;this.h=null;this.C="GET";this.B="";this.g=!1;this.A=this.j=this.l=null;}r$1(md,B);var nd=0;k$1=md.prototype;
k$1.open=function(a,b){if(this.readyState!=nd)throw this.abort(),Error("Error reopening a connection");this.C=a;this.B=b;this.readyState=1;od(this);};k$1.send=function(a){if(1!=this.readyState)throw this.abort(),Error("need to call open() first. ");this.g=!0;const b={headers:this.v,method:this.C,credentials:this.m,cache:void 0};a&&(b.body=a);(this.F||l$1).fetch(new Request(this.B,b)).then(this.$a.bind(this),this.ka.bind(this));};
k$1.abort=function(){this.response=this.responseText="";this.v=new Headers;this.status=0;this.j&&this.j.cancel("Request was aborted.").catch(()=>{});1<=this.readyState&&this.g&&4!=this.readyState&&(this.g=!1,pd(this));this.readyState=nd;};
k$1.$a=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,od(this)),this.g&&(this.readyState=3,od(this),this.g)))if("arraybuffer"===this.responseType)a.arrayBuffer().then(this.Ya.bind(this),this.ka.bind(this));else if("undefined"!==typeof l$1.ReadableStream&&"body"in a){this.j=a.body.getReader();if(this.u){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=
[];}else this.response=this.responseText="",this.A=new TextDecoder;qd(this);}else a.text().then(this.Za.bind(this),this.ka.bind(this));};function qd(a){a.j.read().then(a.Xa.bind(a)).catch(a.ka.bind(a));}k$1.Xa=function(a){if(this.g){if(this.u&&a.value)this.response.push(a.value);else if(!this.u){var b=a.value?a.value:new Uint8Array(0);if(b=this.A.decode(b,{stream:!a.done}))this.response=this.responseText+=b;}a.done?pd(this):od(this);3==this.readyState&&qd(this);}};
k$1.Za=function(a){this.g&&(this.response=this.responseText=a,pd(this));};k$1.Ya=function(a){this.g&&(this.response=a,pd(this));};k$1.ka=function(){this.g&&pd(this);};function pd(a){a.readyState=4;a.l=null;a.j=null;a.A=null;od(a);}k$1.setRequestHeader=function(a,b){this.v.append(a,b);};k$1.getResponseHeader=function(a){return this.h?this.h.get(a.toLowerCase())||"":""};
k$1.getAllResponseHeaders=function(){if(!this.h)return "";const a=[],b=this.h.entries();for(var c=b.next();!c.done;)c=c.value,a.push(c[0]+": "+c[1]),c=b.next();return a.join("\r\n")};function od(a){a.onreadystatechange&&a.onreadystatechange.call(a);}Object.defineProperty(md.prototype,"withCredentials",{get:function(){return "include"===this.m},set:function(a){this.m=a?"include":"same-origin";}});var rd=l$1.JSON.parse;function P$1(a){B.call(this);this.headers=new Map;this.u=a||null;this.h=!1;this.C=this.g=null;this.I="";this.m=0;this.j="";this.l=this.G=this.v=this.F=!1;this.B=0;this.A=null;this.K=sd;this.L=this.M=!1;}r$1(P$1,B);var sd="",td=/^https?$/i,ud=["POST","PUT"];k$1=P$1.prototype;k$1.Oa=function(a){this.M=a;};
k$1.ha=function(a,b,c,d){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.I+"; newUri="+a);b=b?b.toUpperCase():"GET";this.I=a;this.j="";this.m=0;this.F=!1;this.h=!0;this.g=this.u?this.u.g():$b.g();this.C=this.u?Vb(this.u):Vb($b);this.g.onreadystatechange=q(this.La,this);try{this.G=!0,this.g.open(b,String(a),!0),this.G=!1;}catch(f){vd(this,f);return}a=c||"";c=new Map(this.headers);if(d)if(Object.getPrototypeOf(d)===Object.prototype)for(var e in d)c.set(e,d[e]);else if("function"===
typeof d.keys&&"function"===typeof d.get)for(const f of d.keys())c.set(f,d.get(f));else throw Error("Unknown input type for opt_headers: "+String(d));d=Array.from(c.keys()).find(f=>"content-type"==f.toLowerCase());e=l$1.FormData&&a instanceof l$1.FormData;!(0<=ka(ud,b))||d||e||c.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const [f,h]of c)this.g.setRequestHeader(f,h);this.K&&(this.g.responseType=this.K);"withCredentials"in this.g&&this.g.withCredentials!==this.M&&(this.g.withCredentials=
this.M);try{wd(this),0<this.B&&((this.L=xd(this.g))?(this.g.timeout=this.B,this.g.ontimeout=q(this.ua,this)):this.A=yb(this.ua,this.B,this)),this.v=!0,this.g.send(a),this.v=!1;}catch(f){vd(this,f);}};function xd(a){return z&&"number"===typeof a.timeout&&void 0!==a.ontimeout}k$1.ua=function(){"undefined"!=typeof goog&&this.g&&(this.j="Timed out after "+this.B+"ms, aborting",this.m=8,C$2(this,"timeout"),this.abort(8));};function vd(a,b){a.h=!1;a.g&&(a.l=!0,a.g.abort(),a.l=!1);a.j=b;a.m=5;yd(a);zd(a);}
function yd(a){a.F||(a.F=!0,C$2(a,"complete"),C$2(a,"error"));}k$1.abort=function(a){this.g&&this.h&&(this.h=!1,this.l=!0,this.g.abort(),this.l=!1,this.m=a||7,C$2(this,"complete"),C$2(this,"abort"),zd(this));};k$1.N=function(){this.g&&(this.h&&(this.h=!1,this.l=!0,this.g.abort(),this.l=!1),zd(this,!0));P$1.$.N.call(this);};k$1.La=function(){this.s||(this.G||this.v||this.l?Ad(this):this.kb());};k$1.kb=function(){Ad(this);};
function Ad(a){if(a.h&&"undefined"!=typeof goog&&(!a.C[1]||4!=H$1(a)||2!=a.da()))if(a.v&&4==H$1(a))yb(a.La,0,a);else if(C$2(a,"readystatechange"),4==H$1(a)){a.h=!1;try{const h=a.da();a:switch(h){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var b=!0;break a;default:b=!1;}var c;if(!(c=b)){var d;if(d=0===h){var e=String(a.I).match(Lc)[1]||null;!e&&l$1.self&&l$1.self.location&&(e=l$1.self.location.protocol.slice(0,-1));d=!td.test(e?e.toLowerCase():"");}c=d;}if(c)C$2(a,"complete"),C$2(a,"success");else {a.m=
6;try{var f=2<H$1(a)?a.g.statusText:"";}catch(n){f="";}a.j=f+" ["+a.da()+"]";yd(a);}}finally{zd(a);}}}function zd(a,b){if(a.g){wd(a);const c=a.g,d=a.C[0]?()=>{}:null;a.g=null;a.C=null;b||C$2(a,"ready");try{c.onreadystatechange=d;}catch(e){}}}function wd(a){a.g&&a.L&&(a.g.ontimeout=null);a.A&&(l$1.clearTimeout(a.A),a.A=null);}k$1.isActive=function(){return !!this.g};function H$1(a){return a.g?a.g.readyState:0}k$1.da=function(){try{return 2<H$1(this)?this.g.status:-1}catch(a){return -1}};
k$1.ja=function(){try{return this.g?this.g.responseText:""}catch(a){return ""}};k$1.Wa=function(a){if(this.g){var b=this.g.responseText;a&&0==b.indexOf(a)&&(b=b.substring(a.length));return rd(b)}};function mc(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.K){case sd:case "text":return a.g.responseText;case "arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch(b){return null}}
function tc(a){const b={};a=(a.g&&2<=H$1(a)?a.g.getAllResponseHeaders()||"":"").split("\r\n");for(let d=0;d<a.length;d++){if(x$1(a[d]))continue;var c=qb(a[d]);const e=c[0];c=c[1];if("string"!==typeof c)continue;c=c.trim();const f=b[e]||[];b[e]=f;f.push(c);}Oa(b,function(d){return d.join(", ")});}k$1.Ia=function(){return this.m};k$1.Sa=function(){return "string"===typeof this.j?this.j:String(this.j)};function Bd(a){let b="";Na(a,function(c,d){b+=d;b+=":";b+=c;b+="\r\n";});return b}function Cd(a,b,c){a:{for(d in c){var d=!1;break a}d=!0;}d||(c=Bd(c),"string"===typeof a?(null!=c&&encodeURIComponent(String(c))):K(a,b,c));}function Dd(a,b,c){return c&&c.internalChannelParams?c.internalChannelParams[a]||b:b}
function Ed(a){this.Ga=0;this.j=[];this.l=new Gb;this.pa=this.wa=this.I=this.Y=this.g=this.Da=this.F=this.na=this.o=this.U=this.s=null;this.fb=this.W=0;this.cb=Dd("failFast",!1,a);this.G=this.v=this.u=this.m=this.h=null;this.aa=!0;this.Fa=this.V=-1;this.ba=this.A=this.C=0;this.ab=Dd("baseRetryDelayMs",5E3,a);this.hb=Dd("retryDelaySeedMs",1E4,a);this.eb=Dd("forwardChannelMaxRetries",2,a);this.xa=Dd("forwardChannelRequestTimeoutMs",2E4,a);this.va=a&&a.xmlHttpFactory||void 0;this.Ha=a&&a.useFetchStreams||
!1;this.L=void 0;this.J=a&&a.supportsCrossDomainXhr||!1;this.K="";this.i=new cd(a&&a.concurrentRequestLimit);this.Ja=new hd;this.P=a&&a.fastHandshake||!1;this.O=a&&a.encodeInitMessageHeaders||!1;this.P&&this.O&&(this.O=!1);this.bb=a&&a.bc||!1;a&&a.Ea&&this.l.Ea();a&&a.forceLongPolling&&(this.aa=!1);this.ca=!this.P&&this.aa&&a&&a.detectBufferingProxy||!1;this.qa=void 0;a&&a.longPollingTimeout&&0<a.longPollingTimeout&&(this.qa=a.longPollingTimeout);this.oa=void 0;this.S=0;this.M=!1;this.ma=this.B=null;}
k$1=Ed.prototype;k$1.ra=8;k$1.H=1;function Hc(a){Fd(a);if(3==a.H){var b=a.W++,c=G(a.I);K(c,"SID",a.K);K(c,"RID",b);K(c,"TYPE","terminate");Gd(a,c);b=new bc(a,a.l,b);b.L=2;b.A=hc(G(c));c=!1;if(l$1.navigator&&l$1.navigator.sendBeacon)try{c=l$1.navigator.sendBeacon(b.A.toString(),"");}catch(d){}!c&&l$1.Image&&((new Image).src=b.A,c=!0);c||(b.g=lc(b.l,null),b.g.ha(b.A));b.G=Date.now();jc(b);}Hd(a);}function zc(a){a.g&&(vc(a),a.g.cancel(),a.g=null);}
function Fd(a){zc(a);a.u&&(l$1.clearTimeout(a.u),a.u=null);yc(a);a.i.cancel();a.m&&("number"===typeof a.m&&l$1.clearTimeout(a.m),a.m=null);}function Gc(a){if(!ed(a.i)&&!a.m){a.m=!0;var b=a.Na;sb||vb();tb||(sb(),tb=!0);mb.add(b,a);a.C=0;}}function Id(a,b){if(Bc(a.i)>=a.i.j-(a.m?1:0))return !1;if(a.m)return a.j=b.F.concat(a.j),!0;if(1==a.H||2==a.H||a.C>=(a.cb?0:a.eb))return !1;a.m=Rb(q(a.Na,a,b),Jd(a,a.C));a.C++;return !0}
k$1.Na=function(a){if(this.m)if(this.m=null,1==this.H){if(!a){this.W=Math.floor(1E5*Math.random());a=this.W++;const e=new bc(this,this.l,a);let f=this.s;this.U&&(f?(f=Pa(f),Ra(f,this.U)):f=this.U);null!==this.o||this.O||(e.I=f,f=null);if(this.P)a:{var b=0;for(var c=0;c<this.j.length;c++){b:{var d=this.j[c];if("__data__"in d.map&&(d=d.map.__data__,"string"===typeof d)){d=d.length;break b}d=void 0;}if(void 0===d)break;b+=d;if(4096<b){b=c;break a}if(4096===b||c===this.j.length-1){b=c+1;break a}}b=1E3;}else b=
1E3;b=Kd(this,e,b);c=G(this.I);K(c,"RID",a);K(c,"CVER",22);this.F&&K(c,"X-HTTP-Session-Id",this.F);Gd(this,c);f&&(this.O?b="headers="+encodeURIComponent(String(Bd(f)))+"&"+b:this.o&&Cd(c,this.o,f));Cc(this.i,e);this.bb&&K(c,"TYPE","init");this.P?(K(c,"$req",b),K(c,"SID","null"),e.aa=!0,gc(e,c,null)):gc(e,c,b);this.H=2;}}else 3==this.H&&(a?Ld(this,a):0==this.j.length||ed(this.i)||Ld(this));};
function Ld(a,b){var c;b?c=b.m:c=a.W++;const d=G(a.I);K(d,"SID",a.K);K(d,"RID",c);K(d,"AID",a.V);Gd(a,d);a.o&&a.s&&Cd(d,a.o,a.s);c=new bc(a,a.l,c,a.C+1);null===a.o&&(c.I=a.s);b&&(a.j=b.F.concat(a.j));b=Kd(a,c,1E3);c.setTimeout(Math.round(.5*a.xa)+Math.round(.5*a.xa*Math.random()));Cc(a.i,c);gc(c,d,b);}function Gd(a,b){a.na&&Na(a.na,function(c,d){K(b,d,c);});a.h&&Kc({},function(c,d){K(b,d,c);});}
function Kd(a,b,c){c=Math.min(a.j.length,c);var d=a.h?q(a.h.Va,a.h,a):null;a:{var e=a.j;let f=-1;for(;;){const h=["count="+c];-1==f?0<c?(f=e[0].g,h.push("ofs="+f)):f=0:h.push("ofs="+f);let n=!0;for(let t=0;t<c;t++){let m=e[t].g;const u=e[t].map;m-=f;if(0>m)f=Math.max(0,e[t].g-100),n=!1;else try{id(u,h,"req"+m+"_");}catch(L){d&&d(u);}}if(n){d=h.join("&");break a}}}a=a.j.splice(0,c);b.F=a;return d}function Fc(a){if(!a.g&&!a.u){a.ba=1;var b=a.Ma;sb||vb();tb||(sb(),tb=!0);mb.add(b,a);a.A=0;}}
function Ac(a){if(a.g||a.u||3<=a.A)return !1;a.ba++;a.u=Rb(q(a.Ma,a),Jd(a,a.A));a.A++;return !0}k$1.Ma=function(){this.u=null;Md(this);if(this.ca&&!(this.M||null==this.g||0>=this.S)){var a=2*this.S;this.l.info("BP detection timer enabled: "+a);this.B=Rb(q(this.jb,this),a);}};k$1.jb=function(){this.B&&(this.B=null,this.l.info("BP detection timeout reached."),this.l.info("Buffering proxy detected and switch to long-polling!"),this.G=!1,this.M=!0,F(10),zc(this),Md(this));};
function vc(a){null!=a.B&&(l$1.clearTimeout(a.B),a.B=null);}function Md(a){a.g=new bc(a,a.l,"rpc",a.ba);null===a.o&&(a.g.I=a.s);a.g.O=0;var b=G(a.wa);K(b,"RID","rpc");K(b,"SID",a.K);K(b,"AID",a.V);K(b,"CI",a.G?"0":"1");!a.G&&a.qa&&K(b,"TO",a.qa);K(b,"TYPE","xmlhttp");Gd(a,b);a.o&&a.s&&Cd(b,a.o,a.s);a.L&&a.g.setTimeout(a.L);var c=a.g;a=a.pa;c.L=1;c.A=hc(G(b));c.u=null;c.S=!0;ic(c,a);}k$1.ib=function(){null!=this.v&&(this.v=null,zc(this),Ac(this),F(19));};
function yc(a){null!=a.v&&(l$1.clearTimeout(a.v),a.v=null);}function sc(a,b){var c=null;if(a.g==b){yc(a);vc(a);a.g=null;var d=2;}else if(xc(a.i,b))c=b.F,Ec(a.i,b),d=1;else return;if(0!=a.H)if(b.i)if(1==d){c=b.u?b.u.length:0;b=Date.now()-b.G;var e=a.C;d=Mb();C$2(d,new Qb(d,c));Gc(a);}else Fc(a);else if(e=b.s,3==e||0==e&&0<b.ca||!(1==d&&Id(a,b)||2==d&&Ac(a)))switch(c&&0<c.length&&(b=a.i,b.i=b.i.concat(c)),e){case 1:J(a,5);break;case 4:J(a,10);break;case 3:J(a,6);break;default:J(a,2);}}
function Jd(a,b){let c=a.ab+Math.floor(Math.random()*a.hb);a.isActive()||(c*=2);return c*b}function J(a,b){a.l.info("Error code "+b);if(2==b){var c=null;a.h&&(c=null);var d=q(a.pb,a);c||(c=new M$1("//www.google.com/images/cleardot.gif"),l$1.location&&"http"==l$1.location.protocol||Nc(c,"https"),hc(c));jd(c.toString(),d);}else F(2);a.H=0;a.h&&a.h.za(b);Hd(a);Fd(a);}k$1.pb=function(a){a?(this.l.info("Successfully pinged google.com"),F(2)):(this.l.info("Failed to ping google.com"),F(1));};
function Hd(a){a.H=0;a.ma=[];if(a.h){const b=fd(a.i);if(0!=b.length||0!=a.j.length)na(a.ma,b),na(a.ma,a.j),a.i.i.length=0,ma(a.j),a.j.length=0;a.h.ya();}}function Dc(a,b,c){var d=c instanceof M$1?G(c):new M$1(c);if(""!=d.g)b&&(d.g=b+"."+d.g),Oc(d,d.m);else {var e=l$1.location;d=e.protocol;b=b?b+"."+e.hostname:e.hostname;e=+e.port;var f=new M$1(null);d&&Nc(f,d);b&&(f.g=b);e&&Oc(f,e);c&&(f.l=c);d=f;}c=a.F;b=a.Da;c&&b&&K(d,c,b);K(d,"VER",a.ra);Gd(a,d);return d}
function lc(a,b,c){if(b&&!a.J)throw Error("Can't create secondary domain capable XhrIo object.");b=a.Ha&&!a.va?new P$1(new ld({ob:c})):new P$1(a.va);b.Oa(a.J);return b}k$1.isActive=function(){return !!this.h&&this.h.isActive(this)};function Nd(){}k$1=Nd.prototype;k$1.Ba=function(){};k$1.Aa=function(){};k$1.za=function(){};k$1.ya=function(){};k$1.isActive=function(){return !0};k$1.Va=function(){};function Od(){if(z&&!(10<=Number(Fa)))throw Error("Environmental error: no available transport.");}Od.prototype.g=function(a,b){return new Q(a,b)};
function Q(a,b){B.call(this);this.g=new Ed(b);this.l=a;this.h=b&&b.messageUrlParams||null;a=b&&b.messageHeaders||null;b&&b.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"});this.g.s=a;a=b&&b.initMessageHeaders||null;b&&b.messageContentType&&(a?a["X-WebChannel-Content-Type"]=b.messageContentType:a={"X-WebChannel-Content-Type":b.messageContentType});b&&b.Ca&&(a?a["X-WebChannel-Client-Profile"]=b.Ca:a={"X-WebChannel-Client-Profile":b.Ca});this.g.U=
a;(a=b&&b.cc)&&!x$1(a)&&(this.g.o=a);this.A=b&&b.supportsCrossDomainXhr||!1;this.v=b&&b.sendRawJson||!1;(b=b&&b.httpSessionIdParam)&&!x$1(b)&&(this.g.F=b,a=this.h,null!==a&&b in a&&(a=this.h,b in a&&delete a[b]));this.j=new R$1(this);}r$1(Q,B);Q.prototype.m=function(){this.g.h=this.j;this.A&&(this.g.J=!0);var a=this.g,b=this.l,c=this.h||void 0;F(0);a.Y=b;a.na=c||{};a.G=a.aa;a.I=Dc(a,null,a.Y);Gc(a);};Q.prototype.close=function(){Hc(this.g);};
Q.prototype.u=function(a){var b=this.g;if("string"===typeof a){var c={};c.__data__=a;a=c;}else this.v&&(c={},c.__data__=jb(a),a=c);b.j.push(new bd(b.fb++,a));3==b.H&&Gc(b);};Q.prototype.N=function(){this.g.h=null;delete this.j;Hc(this.g);delete this.g;Q.$.N.call(this);};
function Pd(a){Yb.call(this);a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var b=a.__sm__;if(b){a:{for(const c in b){a=c;break a}a=void 0;}if(this.i=a)a=this.i,b=null!==b&&a in b?b[a]:void 0;this.data=b;}else this.data=a;}r$1(Pd,Yb);function Qd(){Zb.call(this);this.status=1;}r$1(Qd,Zb);function R$1(a){this.g=a;}r$1(R$1,Nd);R$1.prototype.Ba=function(){C$2(this.g,"a");};R$1.prototype.Aa=function(a){C$2(this.g,new Pd(a));};
R$1.prototype.za=function(a){C$2(this.g,new Qd());};R$1.prototype.ya=function(){C$2(this.g,"b");};function Rd(){this.blockSize=-1;}function S$2(){this.blockSize=-1;this.blockSize=64;this.g=Array(4);this.m=Array(this.blockSize);this.i=this.h=0;this.reset();}r$1(S$2,Rd);S$2.prototype.reset=function(){this.g[0]=1732584193;this.g[1]=4023233417;this.g[2]=2562383102;this.g[3]=271733878;this.i=this.h=0;};
function Sd(a,b,c){c||(c=0);var d=Array(16);if("string"===typeof b)for(var e=0;16>e;++e)d[e]=b.charCodeAt(c++)|b.charCodeAt(c++)<<8|b.charCodeAt(c++)<<16|b.charCodeAt(c++)<<24;else for(e=0;16>e;++e)d[e]=b[c++]|b[c++]<<8|b[c++]<<16|b[c++]<<24;b=a.g[0];c=a.g[1];e=a.g[2];var f=a.g[3];var h=b+(f^c&(e^f))+d[0]+3614090360&4294967295;b=c+(h<<7&4294967295|h>>>25);h=f+(e^b&(c^e))+d[1]+3905402710&4294967295;f=b+(h<<12&4294967295|h>>>20);h=e+(c^f&(b^c))+d[2]+606105819&4294967295;e=f+(h<<17&4294967295|h>>>15);
h=c+(b^e&(f^b))+d[3]+3250441966&4294967295;c=e+(h<<22&4294967295|h>>>10);h=b+(f^c&(e^f))+d[4]+4118548399&4294967295;b=c+(h<<7&4294967295|h>>>25);h=f+(e^b&(c^e))+d[5]+1200080426&4294967295;f=b+(h<<12&4294967295|h>>>20);h=e+(c^f&(b^c))+d[6]+2821735955&4294967295;e=f+(h<<17&4294967295|h>>>15);h=c+(b^e&(f^b))+d[7]+4249261313&4294967295;c=e+(h<<22&4294967295|h>>>10);h=b+(f^c&(e^f))+d[8]+1770035416&4294967295;b=c+(h<<7&4294967295|h>>>25);h=f+(e^b&(c^e))+d[9]+2336552879&4294967295;f=b+(h<<12&4294967295|
h>>>20);h=e+(c^f&(b^c))+d[10]+4294925233&4294967295;e=f+(h<<17&4294967295|h>>>15);h=c+(b^e&(f^b))+d[11]+2304563134&4294967295;c=e+(h<<22&4294967295|h>>>10);h=b+(f^c&(e^f))+d[12]+1804603682&4294967295;b=c+(h<<7&4294967295|h>>>25);h=f+(e^b&(c^e))+d[13]+4254626195&4294967295;f=b+(h<<12&4294967295|h>>>20);h=e+(c^f&(b^c))+d[14]+2792965006&4294967295;e=f+(h<<17&4294967295|h>>>15);h=c+(b^e&(f^b))+d[15]+1236535329&4294967295;c=e+(h<<22&4294967295|h>>>10);h=b+(e^f&(c^e))+d[1]+4129170786&4294967295;b=c+(h<<
5&4294967295|h>>>27);h=f+(c^e&(b^c))+d[6]+3225465664&4294967295;f=b+(h<<9&4294967295|h>>>23);h=e+(b^c&(f^b))+d[11]+643717713&4294967295;e=f+(h<<14&4294967295|h>>>18);h=c+(f^b&(e^f))+d[0]+3921069994&4294967295;c=e+(h<<20&4294967295|h>>>12);h=b+(e^f&(c^e))+d[5]+3593408605&4294967295;b=c+(h<<5&4294967295|h>>>27);h=f+(c^e&(b^c))+d[10]+38016083&4294967295;f=b+(h<<9&4294967295|h>>>23);h=e+(b^c&(f^b))+d[15]+3634488961&4294967295;e=f+(h<<14&4294967295|h>>>18);h=c+(f^b&(e^f))+d[4]+3889429448&4294967295;c=
e+(h<<20&4294967295|h>>>12);h=b+(e^f&(c^e))+d[9]+568446438&4294967295;b=c+(h<<5&4294967295|h>>>27);h=f+(c^e&(b^c))+d[14]+3275163606&4294967295;f=b+(h<<9&4294967295|h>>>23);h=e+(b^c&(f^b))+d[3]+4107603335&4294967295;e=f+(h<<14&4294967295|h>>>18);h=c+(f^b&(e^f))+d[8]+1163531501&4294967295;c=e+(h<<20&4294967295|h>>>12);h=b+(e^f&(c^e))+d[13]+2850285829&4294967295;b=c+(h<<5&4294967295|h>>>27);h=f+(c^e&(b^c))+d[2]+4243563512&4294967295;f=b+(h<<9&4294967295|h>>>23);h=e+(b^c&(f^b))+d[7]+1735328473&4294967295;
e=f+(h<<14&4294967295|h>>>18);h=c+(f^b&(e^f))+d[12]+2368359562&4294967295;c=e+(h<<20&4294967295|h>>>12);h=b+(c^e^f)+d[5]+4294588738&4294967295;b=c+(h<<4&4294967295|h>>>28);h=f+(b^c^e)+d[8]+2272392833&4294967295;f=b+(h<<11&4294967295|h>>>21);h=e+(f^b^c)+d[11]+1839030562&4294967295;e=f+(h<<16&4294967295|h>>>16);h=c+(e^f^b)+d[14]+4259657740&4294967295;c=e+(h<<23&4294967295|h>>>9);h=b+(c^e^f)+d[1]+2763975236&4294967295;b=c+(h<<4&4294967295|h>>>28);h=f+(b^c^e)+d[4]+1272893353&4294967295;f=b+(h<<11&4294967295|
h>>>21);h=e+(f^b^c)+d[7]+4139469664&4294967295;e=f+(h<<16&4294967295|h>>>16);h=c+(e^f^b)+d[10]+3200236656&4294967295;c=e+(h<<23&4294967295|h>>>9);h=b+(c^e^f)+d[13]+681279174&4294967295;b=c+(h<<4&4294967295|h>>>28);h=f+(b^c^e)+d[0]+3936430074&4294967295;f=b+(h<<11&4294967295|h>>>21);h=e+(f^b^c)+d[3]+3572445317&4294967295;e=f+(h<<16&4294967295|h>>>16);h=c+(e^f^b)+d[6]+76029189&4294967295;c=e+(h<<23&4294967295|h>>>9);h=b+(c^e^f)+d[9]+3654602809&4294967295;b=c+(h<<4&4294967295|h>>>28);h=f+(b^c^e)+d[12]+
3873151461&4294967295;f=b+(h<<11&4294967295|h>>>21);h=e+(f^b^c)+d[15]+530742520&4294967295;e=f+(h<<16&4294967295|h>>>16);h=c+(e^f^b)+d[2]+3299628645&4294967295;c=e+(h<<23&4294967295|h>>>9);h=b+(e^(c|~f))+d[0]+4096336452&4294967295;b=c+(h<<6&4294967295|h>>>26);h=f+(c^(b|~e))+d[7]+1126891415&4294967295;f=b+(h<<10&4294967295|h>>>22);h=e+(b^(f|~c))+d[14]+2878612391&4294967295;e=f+(h<<15&4294967295|h>>>17);h=c+(f^(e|~b))+d[5]+4237533241&4294967295;c=e+(h<<21&4294967295|h>>>11);h=b+(e^(c|~f))+d[12]+1700485571&
4294967295;b=c+(h<<6&4294967295|h>>>26);h=f+(c^(b|~e))+d[3]+2399980690&4294967295;f=b+(h<<10&4294967295|h>>>22);h=e+(b^(f|~c))+d[10]+4293915773&4294967295;e=f+(h<<15&4294967295|h>>>17);h=c+(f^(e|~b))+d[1]+2240044497&4294967295;c=e+(h<<21&4294967295|h>>>11);h=b+(e^(c|~f))+d[8]+1873313359&4294967295;b=c+(h<<6&4294967295|h>>>26);h=f+(c^(b|~e))+d[15]+4264355552&4294967295;f=b+(h<<10&4294967295|h>>>22);h=e+(b^(f|~c))+d[6]+2734768916&4294967295;e=f+(h<<15&4294967295|h>>>17);h=c+(f^(e|~b))+d[13]+1309151649&
4294967295;c=e+(h<<21&4294967295|h>>>11);h=b+(e^(c|~f))+d[4]+4149444226&4294967295;b=c+(h<<6&4294967295|h>>>26);h=f+(c^(b|~e))+d[11]+3174756917&4294967295;f=b+(h<<10&4294967295|h>>>22);h=e+(b^(f|~c))+d[2]+718787259&4294967295;e=f+(h<<15&4294967295|h>>>17);h=c+(f^(e|~b))+d[9]+3951481745&4294967295;a.g[0]=a.g[0]+b&4294967295;a.g[1]=a.g[1]+(e+(h<<21&4294967295|h>>>11))&4294967295;a.g[2]=a.g[2]+e&4294967295;a.g[3]=a.g[3]+f&4294967295;}
S$2.prototype.j=function(a,b){void 0===b&&(b=a.length);for(var c=b-this.blockSize,d=this.m,e=this.h,f=0;f<b;){if(0==e)for(;f<=c;)Sd(this,a,f),f+=this.blockSize;if("string"===typeof a)for(;f<b;){if(d[e++]=a.charCodeAt(f++),e==this.blockSize){Sd(this,d);e=0;break}}else for(;f<b;)if(d[e++]=a[f++],e==this.blockSize){Sd(this,d);e=0;break}}this.h=e;this.i+=b;};
S$2.prototype.l=function(){var a=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);a[0]=128;for(var b=1;b<a.length-8;++b)a[b]=0;var c=8*this.i;for(b=a.length-8;b<a.length;++b)a[b]=c&255,c/=256;this.j(a);a=Array(16);for(b=c=0;4>b;++b)for(var d=0;32>d;d+=8)a[c++]=this.g[b]>>>d&255;return a};function T$1(a,b){this.h=b;for(var c=[],d=!0,e=a.length-1;0<=e;e--){var f=a[e]|0;d&&f==b||(c[e]=f,d=!1);}this.g=c;}var sa={};function Td(a){return -128<=a&&128>a?ra(a,function(b){return new T$1([b|0],0>b?-1:0)}):new T$1([a|0],0>a?-1:0)}function U(a){if(isNaN(a)||!isFinite(a))return V$1;if(0>a)return W(U(-a));for(var b=[],c=1,d=0;a>=c;d++)b[d]=a/c|0,c*=Ud;return new T$1(b,0)}
function Vd(a,b){if(0==a.length)throw Error("number format error: empty string");b=b||10;if(2>b||36<b)throw Error("radix out of range: "+b);if("-"==a.charAt(0))return W(Vd(a.substring(1),b));if(0<=a.indexOf("-"))throw Error('number format error: interior "-" character');for(var c=U(Math.pow(b,8)),d=V$1,e=0;e<a.length;e+=8){var f=Math.min(8,a.length-e),h=parseInt(a.substring(e,e+f),b);8>f?(f=U(Math.pow(b,f)),d=d.R(f).add(U(h))):(d=d.R(c),d=d.add(U(h)));}return d}
var Ud=4294967296,V$1=Td(0),Wd=Td(1),Xd=Td(16777216);k$1=T$1.prototype;k$1.ea=function(){if(X(this))return -W(this).ea();for(var a=0,b=1,c=0;c<this.g.length;c++){var d=this.D(c);a+=(0<=d?d:Ud+d)*b;b*=Ud;}return a};
k$1.toString=function(a){a=a||10;if(2>a||36<a)throw Error("radix out of range: "+a);if(Y(this))return "0";if(X(this))return "-"+W(this).toString(a);for(var b=U(Math.pow(a,6)),c=this,d="";;){var e=Yd(c,b).g;c=Zd(c,e.R(b));var f=((0<c.g.length?c.g[0]:c.h)>>>0).toString(a);c=e;if(Y(c))return f+d;for(;6>f.length;)f="0"+f;d=f+d;}};k$1.D=function(a){return 0>a?0:a<this.g.length?this.g[a]:this.h};function Y(a){if(0!=a.h)return !1;for(var b=0;b<a.g.length;b++)if(0!=a.g[b])return !1;return !0}
function X(a){return -1==a.h}k$1.X=function(a){a=Zd(this,a);return X(a)?-1:Y(a)?0:1};function W(a){for(var b=a.g.length,c=[],d=0;d<b;d++)c[d]=~a.g[d];return (new T$1(c,~a.h)).add(Wd)}k$1.abs=function(){return X(this)?W(this):this};k$1.add=function(a){for(var b=Math.max(this.g.length,a.g.length),c=[],d=0,e=0;e<=b;e++){var f=d+(this.D(e)&65535)+(a.D(e)&65535),h=(f>>>16)+(this.D(e)>>>16)+(a.D(e)>>>16);d=h>>>16;f&=65535;h&=65535;c[e]=h<<16|f;}return new T$1(c,c[c.length-1]&-2147483648?-1:0)};
function Zd(a,b){return a.add(W(b))}
k$1.R=function(a){if(Y(this)||Y(a))return V$1;if(X(this))return X(a)?W(this).R(W(a)):W(W(this).R(a));if(X(a))return W(this.R(W(a)));if(0>this.X(Xd)&&0>a.X(Xd))return U(this.ea()*a.ea());for(var b=this.g.length+a.g.length,c=[],d=0;d<2*b;d++)c[d]=0;for(d=0;d<this.g.length;d++)for(var e=0;e<a.g.length;e++){var f=this.D(d)>>>16,h=this.D(d)&65535,n=a.D(e)>>>16,t=a.D(e)&65535;c[2*d+2*e]+=h*t;$d(c,2*d+2*e);c[2*d+2*e+1]+=f*t;$d(c,2*d+2*e+1);c[2*d+2*e+1]+=h*n;$d(c,2*d+2*e+1);c[2*d+2*e+2]+=f*n;$d(c,2*d+2*e+2);}for(d=
0;d<b;d++)c[d]=c[2*d+1]<<16|c[2*d];for(d=b;d<2*b;d++)c[d]=0;return new T$1(c,0)};function $d(a,b){for(;(a[b]&65535)!=a[b];)a[b+1]+=a[b]>>>16,a[b]&=65535,b++;}function ae$1(a,b){this.g=a;this.h=b;}
function Yd(a,b){if(Y(b))throw Error("division by zero");if(Y(a))return new ae$1(V$1,V$1);if(X(a))return b=Yd(W(a),b),new ae$1(W(b.g),W(b.h));if(X(b))return b=Yd(a,W(b)),new ae$1(W(b.g),b.h);if(30<a.g.length){if(X(a)||X(b))throw Error("slowDivide_ only works with positive integers.");for(var c=Wd,d=b;0>=d.X(a);)c=be(c),d=be(d);var e=Z$1(c,1),f=Z$1(d,1);d=Z$1(d,2);for(c=Z$1(c,2);!Y(d);){var h=f.add(d);0>=h.X(a)&&(e=e.add(c),f=h);d=Z$1(d,1);c=Z$1(c,1);}b=Zd(a,e.R(b));return new ae$1(e,b)}for(e=V$1;0<=a.X(b);){c=Math.max(1,Math.floor(a.ea()/
b.ea()));d=Math.ceil(Math.log(c)/Math.LN2);d=48>=d?1:Math.pow(2,d-48);f=U(c);for(h=f.R(b);X(h)||0<h.X(a);)c-=d,f=U(c),h=f.R(b);Y(f)&&(f=Wd);e=e.add(f);a=Zd(a,h);}return new ae$1(e,a)}k$1.gb=function(a){return Yd(this,a).h};k$1.and=function(a){for(var b=Math.max(this.g.length,a.g.length),c=[],d=0;d<b;d++)c[d]=this.D(d)&a.D(d);return new T$1(c,this.h&a.h)};k$1.or=function(a){for(var b=Math.max(this.g.length,a.g.length),c=[],d=0;d<b;d++)c[d]=this.D(d)|a.D(d);return new T$1(c,this.h|a.h)};
k$1.xor=function(a){for(var b=Math.max(this.g.length,a.g.length),c=[],d=0;d<b;d++)c[d]=this.D(d)^a.D(d);return new T$1(c,this.h^a.h)};function be(a){for(var b=a.g.length+1,c=[],d=0;d<b;d++)c[d]=a.D(d)<<1|a.D(d-1)>>>31;return new T$1(c,a.h)}function Z$1(a,b){var c=b>>5;b%=32;for(var d=a.g.length-c,e=[],f=0;f<d;f++)e[f]=0<b?a.D(f+c)>>>b|a.D(f+c+1)<<32-b:a.D(f+c);return new T$1(e,a.h)}Od.prototype.createWebChannel=Od.prototype.g;Q.prototype.send=Q.prototype.u;Q.prototype.open=Q.prototype.m;Q.prototype.close=Q.prototype.close;Sb.NO_ERROR=0;Sb.TIMEOUT=8;Sb.HTTP_ERROR=6;Tb.COMPLETE="complete";Wb.EventType=Xb;Xb.OPEN="a";Xb.CLOSE="b";Xb.ERROR="c";Xb.MESSAGE="d";B.prototype.listen=B.prototype.O;P$1.prototype.listenOnce=P$1.prototype.P;P$1.prototype.getLastError=P$1.prototype.Sa;P$1.prototype.getLastErrorCode=P$1.prototype.Ia;P$1.prototype.getStatus=P$1.prototype.da;P$1.prototype.getResponseJson=P$1.prototype.Wa;
P$1.prototype.getResponseText=P$1.prototype.ja;P$1.prototype.send=P$1.prototype.ha;P$1.prototype.setWithCredentials=P$1.prototype.Oa;S$2.prototype.digest=S$2.prototype.l;S$2.prototype.reset=S$2.prototype.reset;S$2.prototype.update=S$2.prototype.j;T$1.prototype.add=T$1.prototype.add;T$1.prototype.multiply=T$1.prototype.R;T$1.prototype.modulo=T$1.prototype.gb;T$1.prototype.compare=T$1.prototype.X;T$1.prototype.toNumber=T$1.prototype.ea;T$1.prototype.toString=T$1.prototype.toString;T$1.prototype.getBits=T$1.prototype.D;T$1.fromNumber=U;T$1.fromString=Vd;
var createWebChannelTransport = function(){return new Od};var getStatEventTarget = function(){return Mb()};var ErrorCode = Sb;var EventType = Tb;var Event = E$1;var Stat = {xb:0,Ab:1,Bb:2,Ub:3,Zb:4,Wb:5,Xb:6,Vb:7,Tb:8,Yb:9,PROXY:10,NOPROXY:11,Rb:12,Nb:13,Ob:14,Mb:15,Pb:16,Qb:17,tb:18,sb:19,ub:20};var WebChannel = Wb;var XhrIo = P$1;var Md5 = S$2;var Integer = T$1;

const w$1 = "@firebase/firestore";

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Simple wrapper around a nullable UID. Mostly exists to make code more
 * readable.
 */
class User {
    constructor(e) {
        this.uid = e;
    }
    isAuthenticated() {
        return null != this.uid;
    }
    /**
     * Returns a key representing this user, suitable for inclusion in a
     * dictionary.
     */    toKey() {
        return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
    }
    isEqual(e) {
        return e.uid === this.uid;
    }
}

/** A user with a null UID. */ User.UNAUTHENTICATED = new User(null), 
// TODO(mikelehen): Look into getting a proper uid-equivalent for
// non-FirebaseAuth providers.
User.GOOGLE_CREDENTIALS = new User("google-credentials-uid"), User.FIRST_PARTY = new User("first-party-uid"), 
User.MOCK_USER = new User("mock-user");

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let S$1 = "10.7.0";

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const b = new Logger("@firebase/firestore");

// Helper methods are needed because variables can't be exported as read/write
function __PRIVATE_getLogLevel() {
    return b.logLevel;
}

function __PRIVATE_logDebug(e, ...t) {
    if (b.logLevel <= LogLevel.DEBUG) {
        const n = t.map(__PRIVATE_argToString);
        b.debug(`Firestore (${S$1}): ${e}`, ...n);
    }
}

function __PRIVATE_logError(e, ...t) {
    if (b.logLevel <= LogLevel.ERROR) {
        const n = t.map(__PRIVATE_argToString);
        b.error(`Firestore (${S$1}): ${e}`, ...n);
    }
}

/**
 * @internal
 */ function __PRIVATE_logWarn(e, ...t) {
    if (b.logLevel <= LogLevel.WARN) {
        const n = t.map(__PRIVATE_argToString);
        b.warn(`Firestore (${S$1}): ${e}`, ...n);
    }
}

/**
 * Converts an additional log parameter to a string representation.
 */ function __PRIVATE_argToString(e) {
    if ("string" == typeof e) return e;
    try {
        /**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
        /** Formats an object as a JSON string, suitable for logging. */
        return function __PRIVATE_formatJSON(e) {
            return JSON.stringify(e);
        }(e);
    } catch (t) {
        // Converting to JSON failed, just log the object directly
        return e;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Unconditionally fails, throwing an Error with the given message.
 * Messages are stripped in production builds.
 *
 * Returns `never` and can be used in expressions:
 * @example
 * let futureVar = fail('not implemented yet');
 */ function fail(e = "Unexpected state") {
    // Log the failure in addition to throw an exception, just in case the
    // exception is swallowed.
    const t = `FIRESTORE (${S$1}) INTERNAL ASSERTION FAILED: ` + e;
    // NOTE: We don't use FirestoreError here because these are internal failures
    // that cannot be handled by the user. (Also it would create a circular
    // dependency between the error and assert modules which doesn't work.)
    throw __PRIVATE_logError(t), new Error(t);
}

/**
 * Fails if the given assertion condition is false, throwing an Error with the
 * given message if it did.
 *
 * Messages are stripped in production builds.
 */ function __PRIVATE_hardAssert(e, t) {
    e || fail();
}

/**
 * Casts `obj` to `T`. In non-production builds, verifies that `obj` is an
 * instance of `T` before casting.
 */ function __PRIVATE_debugCast(e, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
t) {
    return e;
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const D = {
    // Causes are copied from:
    // https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
    /** Not an error; returned on success. */
    OK: "ok",
    /** The operation was cancelled (typically by the caller). */
    CANCELLED: "cancelled",
    /** Unknown error or an error from a different error domain. */
    UNKNOWN: "unknown",
    /**
     * Client specified an invalid argument. Note that this differs from
     * FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are
     * problematic regardless of the state of the system (e.g., a malformed file
     * name).
     */
    INVALID_ARGUMENT: "invalid-argument",
    /**
     * Deadline expired before operation could complete. For operations that
     * change the state of the system, this error may be returned even if the
     * operation has completed successfully. For example, a successful response
     * from a server could have been delayed long enough for the deadline to
     * expire.
     */
    DEADLINE_EXCEEDED: "deadline-exceeded",
    /** Some requested entity (e.g., file or directory) was not found. */
    NOT_FOUND: "not-found",
    /**
     * Some entity that we attempted to create (e.g., file or directory) already
     * exists.
     */
    ALREADY_EXISTS: "already-exists",
    /**
     * The caller does not have permission to execute the specified operation.
     * PERMISSION_DENIED must not be used for rejections caused by exhausting
     * some resource (use RESOURCE_EXHAUSTED instead for those errors).
     * PERMISSION_DENIED must not be used if the caller can not be identified
     * (use UNAUTHENTICATED instead for those errors).
     */
    PERMISSION_DENIED: "permission-denied",
    /**
     * The request does not have valid authentication credentials for the
     * operation.
     */
    UNAUTHENTICATED: "unauthenticated",
    /**
     * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
     * entire file system is out of space.
     */
    RESOURCE_EXHAUSTED: "resource-exhausted",
    /**
     * Operation was rejected because the system is not in a state required for
     * the operation's execution. For example, directory to be deleted may be
     * non-empty, an rmdir operation is applied to a non-directory, etc.
     *
     * A litmus test that may help a service implementor in deciding
     * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
     *  (a) Use UNAVAILABLE if the client can retry just the failing call.
     *  (b) Use ABORTED if the client should retry at a higher-level
     *      (e.g., restarting a read-modify-write sequence).
     *  (c) Use FAILED_PRECONDITION if the client should not retry until
     *      the system state has been explicitly fixed. E.g., if an "rmdir"
     *      fails because the directory is non-empty, FAILED_PRECONDITION
     *      should be returned since the client should not retry unless
     *      they have first fixed up the directory by deleting files from it.
     *  (d) Use FAILED_PRECONDITION if the client performs conditional
     *      REST Get/Update/Delete on a resource and the resource on the
     *      server does not match the condition. E.g., conflicting
     *      read-modify-write on the same resource.
     */
    FAILED_PRECONDITION: "failed-precondition",
    /**
     * The operation was aborted, typically due to a concurrency issue like
     * sequencer check failures, transaction aborts, etc.
     *
     * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
     * and UNAVAILABLE.
     */
    ABORTED: "aborted",
    /**
     * Operation was attempted past the valid range. E.g., seeking or reading
     * past end of file.
     *
     * Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed
     * if the system state changes. For example, a 32-bit file system will
     * generate INVALID_ARGUMENT if asked to read at an offset that is not in the
     * range [0,2^32-1], but it will generate OUT_OF_RANGE if asked to read from
     * an offset past the current file size.
     *
     * There is a fair bit of overlap between FAILED_PRECONDITION and
     * OUT_OF_RANGE. We recommend using OUT_OF_RANGE (the more specific error)
     * when it applies so that callers who are iterating through a space can
     * easily look for an OUT_OF_RANGE error to detect when they are done.
     */
    OUT_OF_RANGE: "out-of-range",
    /** Operation is not implemented or not supported/enabled in this service. */
    UNIMPLEMENTED: "unimplemented",
    /**
     * Internal errors. Means some invariants expected by underlying System has
     * been broken. If you see one of these errors, Something is very broken.
     */
    INTERNAL: "internal",
    /**
     * The service is currently unavailable. This is a most likely a transient
     * condition and may be corrected by retrying with a backoff.
     *
     * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
     * and UNAVAILABLE.
     */
    UNAVAILABLE: "unavailable",
    /** Unrecoverable data loss or corruption. */
    DATA_LOSS: "data-loss"
};

/** An error returned by a Firestore operation. */ class FirestoreError extends FirebaseError {
    /** @hideconstructor */
    constructor(
    /**
     * The backend error code associated with this error.
     */
    e, 
    /**
     * A custom error description.
     */
    t) {
        super(e, t), this.code = e, this.message = t, 
        // HACK: We write a toString property directly because Error is not a real
        // class and so inheritance does not work correctly. We could alternatively
        // do the same "back-door inheritance" trick that FirebaseError does.
        this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class __PRIVATE_Deferred {
    constructor() {
        this.promise = new Promise(((e, t) => {
            this.resolve = e, this.reject = t;
        }));
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class __PRIVATE_OAuthToken {
    constructor(e, t) {
        this.user = t, this.type = "OAuth", this.headers = new Map, this.headers.set("Authorization", `Bearer ${e}`);
    }
}

/**
 * A CredentialsProvider that always yields an empty token.
 * @internal
 */ class __PRIVATE_EmptyAuthCredentialsProvider {
    getToken() {
        return Promise.resolve(null);
    }
    invalidateToken() {}
    start(e, t) {
        // Fire with initial user.
        e.enqueueRetryable((() => t(User.UNAUTHENTICATED)));
    }
    shutdown() {}
}

/**
 * A CredentialsProvider that always returns a constant token. Used for
 * emulator token mocking.
 */ class __PRIVATE_EmulatorAuthCredentialsProvider {
    constructor(e) {
        this.token = e, 
        /**
         * Stores the listener registered with setChangeListener()
         * This isn't actually necessary since the UID never changes, but we use this
         * to verify the listen contract is adhered to in tests.
         */
        this.changeListener = null;
    }
    getToken() {
        return Promise.resolve(this.token);
    }
    invalidateToken() {}
    start(e, t) {
        this.changeListener = t, 
        // Fire with initial user.
        e.enqueueRetryable((() => t(this.token.user)));
    }
    shutdown() {
        this.changeListener = null;
    }
}

class __PRIVATE_FirebaseAuthCredentialsProvider {
    constructor(e) {
        this.t = e, 
        /** Tracks the current User. */
        this.currentUser = User.UNAUTHENTICATED, 
        /**
         * Counter used to detect if the token changed while a getToken request was
         * outstanding.
         */
        this.i = 0, this.forceRefresh = !1, this.auth = null;
    }
    start(e, t) {
        let n = this.i;
        // A change listener that prevents double-firing for the same token change.
                const __PRIVATE_guardedChangeListener = e => this.i !== n ? (n = this.i, 
        t(e)) : Promise.resolve();
        // A promise that can be waited on to block on the next token change.
        // This promise is re-created after each change.
                let r = new __PRIVATE_Deferred;
        this.o = () => {
            this.i++, this.currentUser = this.u(), r.resolve(), r = new __PRIVATE_Deferred, 
            e.enqueueRetryable((() => __PRIVATE_guardedChangeListener(this.currentUser)));
        };
        const __PRIVATE_awaitNextToken = () => {
            const t = r;
            e.enqueueRetryable((async () => {
                await t.promise, await __PRIVATE_guardedChangeListener(this.currentUser);
            }));
        }, __PRIVATE_registerAuth = e => {
            __PRIVATE_logDebug("FirebaseAuthCredentialsProvider", "Auth detected"), this.auth = e, 
            this.auth.addAuthTokenListener(this.o), __PRIVATE_awaitNextToken();
        };
        this.t.onInit((e => __PRIVATE_registerAuth(e))), 
        // Our users can initialize Auth right after Firestore, so we give it
        // a chance to register itself with the component framework before we
        // determine whether to start up in unauthenticated mode.
        setTimeout((() => {
            if (!this.auth) {
                const e = this.t.getImmediate({
                    optional: !0
                });
                e ? __PRIVATE_registerAuth(e) : (
                // If auth is still not available, proceed with `null` user
                __PRIVATE_logDebug("FirebaseAuthCredentialsProvider", "Auth not yet detected"), 
                r.resolve(), r = new __PRIVATE_Deferred);
            }
        }), 0), __PRIVATE_awaitNextToken();
    }
    getToken() {
        // Take note of the current value of the tokenCounter so that this method
        // can fail (with an ABORTED error) if there is a token change while the
        // request is outstanding.
        const e = this.i, t = this.forceRefresh;
        return this.forceRefresh = !1, this.auth ? this.auth.getToken(t).then((t => 
        // Cancel the request since the token changed while the request was
        // outstanding so the response is potentially for a previous user (which
        // user, we can't be sure).
        this.i !== e ? (__PRIVATE_logDebug("FirebaseAuthCredentialsProvider", "getToken aborted due to token change."), 
        this.getToken()) : t ? (__PRIVATE_hardAssert("string" == typeof t.accessToken), 
        new __PRIVATE_OAuthToken(t.accessToken, this.currentUser)) : null)) : Promise.resolve(null);
    }
    invalidateToken() {
        this.forceRefresh = !0;
    }
    shutdown() {
        this.auth && this.auth.removeAuthTokenListener(this.o);
    }
    // Auth.getUid() can return null even with a user logged in. It is because
    // getUid() is synchronous, but the auth code populating Uid is asynchronous.
    // This method should only be called in the AuthTokenListener callback
    // to guarantee to get the actual user.
    u() {
        const e = this.auth && this.auth.getUid();
        return __PRIVATE_hardAssert(null === e || "string" == typeof e), new User(e);
    }
}

/*
 * FirstPartyToken provides a fresh token each time its value
 * is requested, because if the token is too old, requests will be rejected.
 * Technically this may no longer be necessary since the SDK should gracefully
 * recover from unauthenticated errors (see b/33147818 for context), but it's
 * safer to keep the implementation as-is.
 */ class __PRIVATE_FirstPartyToken {
    constructor(e, t, n) {
        this.l = e, this.h = t, this.P = n, this.type = "FirstParty", this.user = User.FIRST_PARTY, 
        this.I = new Map;
    }
    /**
     * Gets an authorization token, using a provided factory function, or return
     * null.
     */    T() {
        return this.P ? this.P() : null;
    }
    get headers() {
        this.I.set("X-Goog-AuthUser", this.l);
        // Use array notation to prevent minification
        const e = this.T();
        return e && this.I.set("Authorization", e), this.h && this.I.set("X-Goog-Iam-Authorization-Token", this.h), 
        this.I;
    }
}

/*
 * Provides user credentials required for the Firestore JavaScript SDK
 * to authenticate the user, using technique that is only available
 * to applications hosted by Google.
 */ class __PRIVATE_FirstPartyAuthCredentialsProvider {
    constructor(e, t, n) {
        this.l = e, this.h = t, this.P = n;
    }
    getToken() {
        return Promise.resolve(new __PRIVATE_FirstPartyToken(this.l, this.h, this.P));
    }
    start(e, t) {
        // Fire with initial uid.
        e.enqueueRetryable((() => t(User.FIRST_PARTY)));
    }
    shutdown() {}
    invalidateToken() {}
}

class AppCheckToken {
    constructor(e) {
        this.value = e, this.type = "AppCheck", this.headers = new Map, e && e.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
    }
}

class __PRIVATE_FirebaseAppCheckTokenProvider {
    constructor(e) {
        this.A = e, this.forceRefresh = !1, this.appCheck = null, this.R = null;
    }
    start(e, t) {
        const onTokenChanged = e => {
            null != e.error && __PRIVATE_logDebug("FirebaseAppCheckTokenProvider", `Error getting App Check token; using placeholder token instead. Error: ${e.error.message}`);
            const n = e.token !== this.R;
            return this.R = e.token, __PRIVATE_logDebug("FirebaseAppCheckTokenProvider", `Received ${n ? "new" : "existing"} token.`), 
            n ? t(e.token) : Promise.resolve();
        };
        this.o = t => {
            e.enqueueRetryable((() => onTokenChanged(t)));
        };
        const __PRIVATE_registerAppCheck = e => {
            __PRIVATE_logDebug("FirebaseAppCheckTokenProvider", "AppCheck detected"), this.appCheck = e, 
            this.appCheck.addTokenListener(this.o);
        };
        this.A.onInit((e => __PRIVATE_registerAppCheck(e))), 
        // Our users can initialize AppCheck after Firestore, so we give it
        // a chance to register itself with the component framework.
        setTimeout((() => {
            if (!this.appCheck) {
                const e = this.A.getImmediate({
                    optional: !0
                });
                e ? __PRIVATE_registerAppCheck(e) : 
                // If AppCheck is still not available, proceed without it.
                __PRIVATE_logDebug("FirebaseAppCheckTokenProvider", "AppCheck not yet detected");
            }
        }), 0);
    }
    getToken() {
        const e = this.forceRefresh;
        return this.forceRefresh = !1, this.appCheck ? this.appCheck.getToken(e).then((e => e ? (__PRIVATE_hardAssert("string" == typeof e.token), 
        this.R = e.token, new AppCheckToken(e.token)) : null)) : Promise.resolve(null);
    }
    invalidateToken() {
        this.forceRefresh = !0;
    }
    shutdown() {
        this.appCheck && this.appCheck.removeTokenListener(this.o);
    }
}

/**
 * Builds a CredentialsProvider depending on the type of
 * the credentials passed in.
 */
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Generates `nBytes` of random bytes.
 *
 * If `nBytes < 0` , an error will be thrown.
 */
function __PRIVATE_randomBytes(e) {
    // Polyfills for IE and WebWorker by using `self` and `msCrypto` when `crypto` is not available.
    const t = 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "undefined" != typeof self && (self.crypto || self.msCrypto), n = new Uint8Array(e);
    if (t && "function" == typeof t.getRandomValues) t.getRandomValues(n); else 
    // Falls back to Math.random
    for (let t = 0; t < e; t++) n[t] = Math.floor(256 * Math.random());
    return n;
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A utility class for generating unique alphanumeric IDs of a specified length.
 *
 * @internal
 * Exported internally for testing purposes.
 */ class __PRIVATE_AutoId {
    static newId() {
        // Alphanumeric characters
        const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", t = Math.floor(256 / e.length) * e.length;
        // The largest byte value that is a multiple of `char.length`.
                let n = "";
        for (;n.length < 20; ) {
            const r = __PRIVATE_randomBytes(40);
            for (let i = 0; i < r.length; ++i) 
            // Only accept values that are [0, maxMultiple), this ensures they can
            // be evenly mapped to indices of `chars` via a modulo operation.
            n.length < 20 && r[i] < t && (n += e.charAt(r[i] % e.length));
        }
        return n;
    }
}

function __PRIVATE_primitiveComparator(e, t) {
    return e < t ? -1 : e > t ? 1 : 0;
}

/** Helper to compare arrays using isEqual(). */ function __PRIVATE_arrayEquals(e, t, n) {
    return e.length === t.length && e.every(((e, r) => n(e, t[r])));
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// The earliest date supported by Firestore timestamps (0001-01-01T00:00:00Z).
/**
 * A `Timestamp` represents a point in time independent of any time zone or
 * calendar, represented as seconds and fractions of seconds at nanosecond
 * resolution in UTC Epoch time.
 *
 * It is encoded using the Proleptic Gregorian Calendar which extends the
 * Gregorian calendar backwards to year one. It is encoded assuming all minutes
 * are 60 seconds long, i.e. leap seconds are "smeared" so that no leap second
 * table is needed for interpretation. Range is from 0001-01-01T00:00:00Z to
 * 9999-12-31T23:59:59.999999999Z.
 *
 * For examples and further specifications, refer to the
 * {@link https://github.com/google/protobuf/blob/master/src/google/protobuf/timestamp.proto | Timestamp definition}.
 */
class Timestamp {
    /**
     * Creates a new timestamp.
     *
     * @param seconds - The number of seconds of UTC time since Unix epoch
     *     1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
     *     9999-12-31T23:59:59Z inclusive.
     * @param nanoseconds - The non-negative fractions of a second at nanosecond
     *     resolution. Negative second values with fractions must still have
     *     non-negative nanoseconds values that count forward in time. Must be
     *     from 0 to 999,999,999 inclusive.
     */
    constructor(
    /**
     * The number of seconds of UTC time since Unix epoch 1970-01-01T00:00:00Z.
     */
    e, 
    /**
     * The fractions of a second at nanosecond resolution.*
     */
    t) {
        if (this.seconds = e, this.nanoseconds = t, t < 0) throw new FirestoreError(D.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
        if (t >= 1e9) throw new FirestoreError(D.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
        if (e < -62135596800) throw new FirestoreError(D.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
        // This will break in the year 10,000.
                if (e >= 253402300800) throw new FirestoreError(D.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
    }
    /**
     * Creates a new timestamp with the current date, with millisecond precision.
     *
     * @returns a new timestamp representing the current date.
     */    static now() {
        return Timestamp.fromMillis(Date.now());
    }
    /**
     * Creates a new timestamp from the given date.
     *
     * @param date - The date to initialize the `Timestamp` from.
     * @returns A new `Timestamp` representing the same point in time as the given
     *     date.
     */    static fromDate(e) {
        return Timestamp.fromMillis(e.getTime());
    }
    /**
     * Creates a new timestamp from the given number of milliseconds.
     *
     * @param milliseconds - Number of milliseconds since Unix epoch
     *     1970-01-01T00:00:00Z.
     * @returns A new `Timestamp` representing the same point in time as the given
     *     number of milliseconds.
     */    static fromMillis(e) {
        const t = Math.floor(e / 1e3), n = Math.floor(1e6 * (e - 1e3 * t));
        return new Timestamp(t, n);
    }
    /**
     * Converts a `Timestamp` to a JavaScript `Date` object. This conversion
     * causes a loss of precision since `Date` objects only support millisecond
     * precision.
     *
     * @returns JavaScript `Date` object representing the same point in time as
     *     this `Timestamp`, with millisecond precision.
     */    toDate() {
        return new Date(this.toMillis());
    }
    /**
     * Converts a `Timestamp` to a numeric timestamp (in milliseconds since
     * epoch). This operation causes a loss of precision.
     *
     * @returns The point in time corresponding to this timestamp, represented as
     *     the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
     */    toMillis() {
        return 1e3 * this.seconds + this.nanoseconds / 1e6;
    }
    _compareTo(e) {
        return this.seconds === e.seconds ? __PRIVATE_primitiveComparator(this.nanoseconds, e.nanoseconds) : __PRIVATE_primitiveComparator(this.seconds, e.seconds);
    }
    /**
     * Returns true if this `Timestamp` is equal to the provided one.
     *
     * @param other - The `Timestamp` to compare against.
     * @returns true if this `Timestamp` is equal to the provided one.
     */    isEqual(e) {
        return e.seconds === this.seconds && e.nanoseconds === this.nanoseconds;
    }
    /** Returns a textual representation of this `Timestamp`. */    toString() {
        return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
    }
    /** Returns a JSON-serializable representation of this `Timestamp`. */    toJSON() {
        return {
            seconds: this.seconds,
            nanoseconds: this.nanoseconds
        };
    }
    /**
     * Converts this object to a primitive string, which allows `Timestamp` objects
     * to be compared using the `>`, `<=`, `>=` and `>` operators.
     */    valueOf() {
        // This method returns a string of the form <seconds>.<nanoseconds> where
        // <seconds> is translated to have a non-negative value and both <seconds>
        // and <nanoseconds> are left-padded with zeroes to be a consistent length.
        // Strings with this format then have a lexiographical ordering that matches
        // the expected ordering. The <seconds> translation is done to avoid having
        // a leading negative sign (i.e. a leading '-' character) in its string
        // representation, which would affect its lexiographical ordering.
        const e = this.seconds - -62135596800;
        // Note: Up to 12 decimal digits are required to represent all valid
        // 'seconds' values.
                return String(e).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A version of a document in Firestore. This corresponds to the version
 * timestamp, such as update_time or read_time.
 */ class SnapshotVersion {
    constructor(e) {
        this.timestamp = e;
    }
    static fromTimestamp(e) {
        return new SnapshotVersion(e);
    }
    static min() {
        return new SnapshotVersion(new Timestamp(0, 0));
    }
    static max() {
        return new SnapshotVersion(new Timestamp(253402300799, 999999999));
    }
    compareTo(e) {
        return this.timestamp._compareTo(e.timestamp);
    }
    isEqual(e) {
        return this.timestamp.isEqual(e.timestamp);
    }
    /** Returns a number representation of the version for use in spec tests. */    toMicroseconds() {
        // Convert to microseconds.
        return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
    }
    toString() {
        return "SnapshotVersion(" + this.timestamp.toString() + ")";
    }
    toTimestamp() {
        return this.timestamp;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Path represents an ordered sequence of string segments.
 */
class BasePath {
    constructor(e, t, n) {
        void 0 === t ? t = 0 : t > e.length && fail(), void 0 === n ? n = e.length - t : n > e.length - t && fail(), 
        this.segments = e, this.offset = t, this.len = n;
    }
    get length() {
        return this.len;
    }
    isEqual(e) {
        return 0 === BasePath.comparator(this, e);
    }
    child(e) {
        const t = this.segments.slice(this.offset, this.limit());
        return e instanceof BasePath ? e.forEach((e => {
            t.push(e);
        })) : t.push(e), this.construct(t);
    }
    /** The index of one past the last segment of the path. */    limit() {
        return this.offset + this.length;
    }
    popFirst(e) {
        return e = void 0 === e ? 1 : e, this.construct(this.segments, this.offset + e, this.length - e);
    }
    popLast() {
        return this.construct(this.segments, this.offset, this.length - 1);
    }
    firstSegment() {
        return this.segments[this.offset];
    }
    lastSegment() {
        return this.get(this.length - 1);
    }
    get(e) {
        return this.segments[this.offset + e];
    }
    isEmpty() {
        return 0 === this.length;
    }
    isPrefixOf(e) {
        if (e.length < this.length) return !1;
        for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return !1;
        return !0;
    }
    isImmediateParentOf(e) {
        if (this.length + 1 !== e.length) return !1;
        for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return !1;
        return !0;
    }
    forEach(e) {
        for (let t = this.offset, n = this.limit(); t < n; t++) e(this.segments[t]);
    }
    toArray() {
        return this.segments.slice(this.offset, this.limit());
    }
    static comparator(e, t) {
        const n = Math.min(e.length, t.length);
        for (let r = 0; r < n; r++) {
            const n = e.get(r), i = t.get(r);
            if (n < i) return -1;
            if (n > i) return 1;
        }
        return e.length < t.length ? -1 : e.length > t.length ? 1 : 0;
    }
}

/**
 * A slash-separated path for navigating resources (documents and collections)
 * within Firestore.
 *
 * @internal
 */ class ResourcePath extends BasePath {
    construct(e, t, n) {
        return new ResourcePath(e, t, n);
    }
    canonicalString() {
        // NOTE: The client is ignorant of any path segments containing escape
        // sequences (e.g. __id123__) and just passes them through raw (they exist
        // for legacy reasons and should not be used frequently).
        return this.toArray().join("/");
    }
    toString() {
        return this.canonicalString();
    }
    /**
     * Creates a resource path from the given slash-delimited string. If multiple
     * arguments are provided, all components are combined. Leading and trailing
     * slashes from all components are ignored.
     */    static fromString(...e) {
        // NOTE: The client is ignorant of any path segments containing escape
        // sequences (e.g. __id123__) and just passes them through raw (they exist
        // for legacy reasons and should not be used frequently).
        const t = [];
        for (const n of e) {
            if (n.indexOf("//") >= 0) throw new FirestoreError(D.INVALID_ARGUMENT, `Invalid segment (${n}). Paths must not contain // in them.`);
            // Strip leading and traling slashed.
                        t.push(...n.split("/").filter((e => e.length > 0)));
        }
        return new ResourcePath(t);
    }
    static emptyPath() {
        return new ResourcePath([]);
    }
}

const C$1 = /^[_a-zA-Z][_a-zA-Z0-9]*$/;

/**
 * A dot-separated path for navigating sub-objects within a document.
 * @internal
 */ class FieldPath$1 extends BasePath {
    construct(e, t, n) {
        return new FieldPath$1(e, t, n);
    }
    /**
     * Returns true if the string could be used as a segment in a field path
     * without escaping.
     */    static isValidIdentifier(e) {
        return C$1.test(e);
    }
    canonicalString() {
        return this.toArray().map((e => (e = e.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), 
        FieldPath$1.isValidIdentifier(e) || (e = "`" + e + "`"), e))).join(".");
    }
    toString() {
        return this.canonicalString();
    }
    /**
     * Returns true if this field references the key of a document.
     */    isKeyField() {
        return 1 === this.length && "__name__" === this.get(0);
    }
    /**
     * The field designating the key of a document.
     */    static keyField() {
        return new FieldPath$1([ "__name__" ]);
    }
    /**
     * Parses a field string from the given server-formatted string.
     *
     * - Splitting the empty string is not allowed (for now at least).
     * - Empty segments within the string (e.g. if there are two consecutive
     *   separators) are not allowed.
     *
     * TODO(b/37244157): we should make this more strict. Right now, it allows
     * non-identifier path components, even if they aren't escaped.
     */    static fromServerFormat(e) {
        const t = [];
        let n = "", r = 0;
        const __PRIVATE_addCurrentSegment = () => {
            if (0 === n.length) throw new FirestoreError(D.INVALID_ARGUMENT, `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
            t.push(n), n = "";
        };
        let i = !1;
        for (;r < e.length; ) {
            const t = e[r];
            if ("\\" === t) {
                if (r + 1 === e.length) throw new FirestoreError(D.INVALID_ARGUMENT, "Path has trailing escape character: " + e);
                const t = e[r + 1];
                if ("\\" !== t && "." !== t && "`" !== t) throw new FirestoreError(D.INVALID_ARGUMENT, "Path has invalid escape sequence: " + e);
                n += t, r += 2;
            } else "`" === t ? (i = !i, r++) : "." !== t || i ? (n += t, r++) : (__PRIVATE_addCurrentSegment(), 
            r++);
        }
        if (__PRIVATE_addCurrentSegment(), i) throw new FirestoreError(D.INVALID_ARGUMENT, "Unterminated ` in path: " + e);
        return new FieldPath$1(t);
    }
    static emptyPath() {
        return new FieldPath$1([]);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @internal
 */ class DocumentKey {
    constructor(e) {
        this.path = e;
    }
    static fromPath(e) {
        return new DocumentKey(ResourcePath.fromString(e));
    }
    static fromName(e) {
        return new DocumentKey(ResourcePath.fromString(e).popFirst(5));
    }
    static empty() {
        return new DocumentKey(ResourcePath.emptyPath());
    }
    get collectionGroup() {
        return this.path.popLast().lastSegment();
    }
    /** Returns true if the document is in the specified collectionId. */    hasCollectionId(e) {
        return this.path.length >= 2 && this.path.get(this.path.length - 2) === e;
    }
    /** Returns the collection group (i.e. the name of the parent collection) for this key. */    getCollectionGroup() {
        return this.path.get(this.path.length - 2);
    }
    /** Returns the fully qualified path to the parent collection. */    getCollectionPath() {
        return this.path.popLast();
    }
    isEqual(e) {
        return null !== e && 0 === ResourcePath.comparator(this.path, e.path);
    }
    toString() {
        return this.path.toString();
    }
    static comparator(e, t) {
        return ResourcePath.comparator(e.path, t.path);
    }
    static isDocumentKey(e) {
        return e.length % 2 == 0;
    }
    /**
     * Creates and returns a new document key with the given segments.
     *
     * @param segments - The segments of the path to the document
     * @returns A new instance of DocumentKey
     */    static fromSegments(e) {
        return new DocumentKey(new ResourcePath(e.slice()));
    }
}

/**
 * Creates an offset that matches all documents with a read time higher than
 * `readTime`.
 */ function __PRIVATE_newIndexOffsetSuccessorFromReadTime(e, t) {
    // We want to create an offset that matches all documents with a read time
    // greater than the provided read time. To do so, we technically need to
    // create an offset for `(readTime, MAX_DOCUMENT_KEY)`. While we could use
    // Unicode codepoints to generate MAX_DOCUMENT_KEY, it is much easier to use
    // `(readTime + 1, DocumentKey.empty())` since `> DocumentKey.empty()` matches
    // all valid document IDs.
    const n = e.toTimestamp().seconds, r = e.toTimestamp().nanoseconds + 1, i = SnapshotVersion.fromTimestamp(1e9 === r ? new Timestamp(n + 1, 0) : new Timestamp(n, r));
    return new IndexOffset(i, DocumentKey.empty(), t);
}

/** Creates a new offset based on the provided document. */ function __PRIVATE_newIndexOffsetFromDocument(e) {
    return new IndexOffset(e.readTime, e.key, -1);
}

/**
 * Stores the latest read time, document and batch ID that were processed for an
 * index.
 */ class IndexOffset {
    constructor(
    /**
     * The latest read time version that has been indexed by Firestore for this
     * field index.
     */
    e, 
    /**
     * The key of the last document that was indexed for this query. Use
     * `DocumentKey.empty()` if no document has been indexed.
     */
    t, 
    /*
     * The largest mutation batch id that's been processed by Firestore.
     */
    n) {
        this.readTime = e, this.documentKey = t, this.largestBatchId = n;
    }
    /** Returns an offset that sorts before all regular offsets. */    static min() {
        return new IndexOffset(SnapshotVersion.min(), DocumentKey.empty(), -1);
    }
    /** Returns an offset that sorts after all regular offsets. */    static max() {
        return new IndexOffset(SnapshotVersion.max(), DocumentKey.empty(), -1);
    }
}

function __PRIVATE_indexOffsetComparator(e, t) {
    let n = e.readTime.compareTo(t.readTime);
    return 0 !== n ? n : (n = DocumentKey.comparator(e.documentKey, t.documentKey), 
    0 !== n ? n : __PRIVATE_primitiveComparator(e.largestBatchId, t.largestBatchId));
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const v$1 = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";

/**
 * A base class representing a persistence transaction, encapsulating both the
 * transaction's sequence numbers as well as a list of onCommitted listeners.
 *
 * When you call Persistence.runTransaction(), it will create a transaction and
 * pass it to your callback. You then pass it to any method that operates
 * on persistence.
 */ class PersistenceTransaction {
    constructor() {
        this.onCommittedListeners = [];
    }
    addOnCommittedListener(e) {
        this.onCommittedListeners.push(e);
    }
    raiseOnCommittedEvent() {
        this.onCommittedListeners.forEach((e => e()));
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Verifies the error thrown by a LocalStore operation. If a LocalStore
 * operation fails because the primary lease has been taken by another client,
 * we ignore the error (the persistence layer will immediately call
 * `applyPrimaryLease` to propagate the primary state change). All other errors
 * are re-thrown.
 *
 * @param err - An error returned by a LocalStore operation.
 * @returns A Promise that resolves after we recovered, or the original error.
 */ async function __PRIVATE_ignoreIfPrimaryLeaseLoss(e) {
    if (e.code !== D.FAILED_PRECONDITION || e.message !== v$1) throw e;
    __PRIVATE_logDebug("LocalStore", "Unexpectedly lost primary lease");
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * PersistencePromise is essentially a re-implementation of Promise except
 * it has a .next() method instead of .then() and .next() and .catch() callbacks
 * are executed synchronously when a PersistencePromise resolves rather than
 * asynchronously (Promise implementations use setImmediate() or similar).
 *
 * This is necessary to interoperate with IndexedDB which will automatically
 * commit transactions if control is returned to the event loop without
 * synchronously initiating another operation on the transaction.
 *
 * NOTE: .then() and .catch() only allow a single consumer, unlike normal
 * Promises.
 */ class PersistencePromise {
    constructor(e) {
        // NOTE: next/catchCallback will always point to our own wrapper functions,
        // not the user's raw next() or catch() callbacks.
        this.nextCallback = null, this.catchCallback = null, 
        // When the operation resolves, we'll set result or error and mark isDone.
        this.result = void 0, this.error = void 0, this.isDone = !1, 
        // Set to true when .then() or .catch() are called and prevents additional
        // chaining.
        this.callbackAttached = !1, e((e => {
            this.isDone = !0, this.result = e, this.nextCallback && 
            // value should be defined unless T is Void, but we can't express
            // that in the type system.
            this.nextCallback(e);
        }), (e => {
            this.isDone = !0, this.error = e, this.catchCallback && this.catchCallback(e);
        }));
    }
    catch(e) {
        return this.next(void 0, e);
    }
    next(e, t) {
        return this.callbackAttached && fail(), this.callbackAttached = !0, this.isDone ? this.error ? this.wrapFailure(t, this.error) : this.wrapSuccess(e, this.result) : new PersistencePromise(((n, r) => {
            this.nextCallback = t => {
                this.wrapSuccess(e, t).next(n, r);
            }, this.catchCallback = e => {
                this.wrapFailure(t, e).next(n, r);
            };
        }));
    }
    toPromise() {
        return new Promise(((e, t) => {
            this.next(e, t);
        }));
    }
    wrapUserFunction(e) {
        try {
            const t = e();
            return t instanceof PersistencePromise ? t : PersistencePromise.resolve(t);
        } catch (e) {
            return PersistencePromise.reject(e);
        }
    }
    wrapSuccess(e, t) {
        return e ? this.wrapUserFunction((() => e(t))) : PersistencePromise.resolve(t);
    }
    wrapFailure(e, t) {
        return e ? this.wrapUserFunction((() => e(t))) : PersistencePromise.reject(t);
    }
    static resolve(e) {
        return new PersistencePromise(((t, n) => {
            t(e);
        }));
    }
    static reject(e) {
        return new PersistencePromise(((t, n) => {
            n(e);
        }));
    }
    static waitFor(
    // Accept all Promise types in waitFor().
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    e) {
        return new PersistencePromise(((t, n) => {
            let r = 0, i = 0, s = !1;
            e.forEach((e => {
                ++r, e.next((() => {
                    ++i, s && i === r && t();
                }), (e => n(e)));
            })), s = !0, i === r && t();
        }));
    }
    /**
     * Given an array of predicate functions that asynchronously evaluate to a
     * boolean, implements a short-circuiting `or` between the results. Predicates
     * will be evaluated until one of them returns `true`, then stop. The final
     * result will be whether any of them returned `true`.
     */    static or(e) {
        let t = PersistencePromise.resolve(!1);
        for (const n of e) t = t.next((e => e ? PersistencePromise.resolve(e) : n()));
        return t;
    }
    static forEach(e, t) {
        const n = [];
        return e.forEach(((e, r) => {
            n.push(t.call(this, e, r));
        })), this.waitFor(n);
    }
    /**
     * Concurrently map all array elements through asynchronous function.
     */    static mapArray(e, t) {
        return new PersistencePromise(((n, r) => {
            const i = e.length, s = new Array(i);
            let o = 0;
            for (let _ = 0; _ < i; _++) {
                const a = _;
                t(e[a]).next((e => {
                    s[a] = e, ++o, o === i && n(s);
                }), (e => r(e)));
            }
        }));
    }
    /**
     * An alternative to recursive PersistencePromise calls, that avoids
     * potential memory problems from unbounded chains of promises.
     *
     * The `action` will be called repeatedly while `condition` is true.
     */    static doWhile(e, t) {
        return new PersistencePromise(((n, r) => {
            const process = () => {
                !0 === e() ? t().next((() => {
                    process();
                }), r) : n();
            };
            process();
        }));
    }
}

/** Verifies whether `e` is an IndexedDbTransactionError. */ function __PRIVATE_isIndexedDbTransactionError(e) {
    // Use name equality, as instanceof checks on errors don't work with errors
    // that wrap other errors.
    return "IndexedDbTransactionError" === e.name;
}

/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * `ListenSequence` is a monotonic sequence. It is initialized with a minimum value to
 * exceed. All subsequent calls to next will return increasing values. If provided with a
 * `SequenceNumberSyncer`, it will additionally bump its next value when told of a new value, as
 * well as write out sequence numbers that it produces via `next()`.
 */ class __PRIVATE_ListenSequence {
    constructor(e, t) {
        this.previousValue = e, t && (t.sequenceNumberHandler = e => this.se(e), this.oe = e => t.writeSequenceNumber(e));
    }
    se(e) {
        return this.previousValue = Math.max(e, this.previousValue), this.previousValue;
    }
    next() {
        const e = ++this.previousValue;
        return this.oe && this.oe(e), e;
    }
}

__PRIVATE_ListenSequence._e = -1;

/**
 * Returns whether a variable is either undefined or null.
 */
function __PRIVATE_isNullOrUndefined(e) {
    return null == e;
}

/** Returns whether the value represents -0. */ function __PRIVATE_isNegativeZero(e) {
    // Detect if the value is -0.0. Based on polyfill from
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
    return 0 === e && 1 / e == -1 / 0;
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function __PRIVATE_objectSize(e) {
    let t = 0;
    for (const n in e) Object.prototype.hasOwnProperty.call(e, n) && t++;
    return t;
}

function forEach(e, t) {
    for (const n in e) Object.prototype.hasOwnProperty.call(e, n) && t(n, e[n]);
}

function isEmpty(e) {
    for (const t in e) if (Object.prototype.hasOwnProperty.call(e, t)) return !1;
    return !0;
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// An immutable sorted map implementation, based on a Left-leaning Red-Black
// tree.
class SortedMap {
    constructor(e, t) {
        this.comparator = e, this.root = t || LLRBNode.EMPTY;
    }
    // Returns a copy of the map, with the specified key/value added or replaced.
    insert(e, t) {
        return new SortedMap(this.comparator, this.root.insert(e, t, this.comparator).copy(null, null, LLRBNode.BLACK, null, null));
    }
    // Returns a copy of the map, with the specified key removed.
    remove(e) {
        return new SortedMap(this.comparator, this.root.remove(e, this.comparator).copy(null, null, LLRBNode.BLACK, null, null));
    }
    // Returns the value of the node with the given key, or null.
    get(e) {
        let t = this.root;
        for (;!t.isEmpty(); ) {
            const n = this.comparator(e, t.key);
            if (0 === n) return t.value;
            n < 0 ? t = t.left : n > 0 && (t = t.right);
        }
        return null;
    }
    // Returns the index of the element in this sorted map, or -1 if it doesn't
    // exist.
    indexOf(e) {
        // Number of nodes that were pruned when descending right
        let t = 0, n = this.root;
        for (;!n.isEmpty(); ) {
            const r = this.comparator(e, n.key);
            if (0 === r) return t + n.left.size;
            r < 0 ? n = n.left : (
            // Count all nodes left of the node plus the node itself
            t += n.left.size + 1, n = n.right);
        }
        // Node not found
                return -1;
    }
    isEmpty() {
        return this.root.isEmpty();
    }
    // Returns the total number of nodes in the map.
    get size() {
        return this.root.size;
    }
    // Returns the minimum key in the map.
    minKey() {
        return this.root.minKey();
    }
    // Returns the maximum key in the map.
    maxKey() {
        return this.root.maxKey();
    }
    // Traverses the map in key order and calls the specified action function
    // for each key/value pair. If action returns true, traversal is aborted.
    // Returns the first truthy value returned by action, or the last falsey
    // value returned by action.
    inorderTraversal(e) {
        return this.root.inorderTraversal(e);
    }
    forEach(e) {
        this.inorderTraversal(((t, n) => (e(t, n), !1)));
    }
    toString() {
        const e = [];
        return this.inorderTraversal(((t, n) => (e.push(`${t}:${n}`), !1))), `{${e.join(", ")}}`;
    }
    // Traverses the map in reverse key order and calls the specified action
    // function for each key/value pair. If action returns true, traversal is
    // aborted.
    // Returns the first truthy value returned by action, or the last falsey
    // value returned by action.
    reverseTraversal(e) {
        return this.root.reverseTraversal(e);
    }
    // Returns an iterator over the SortedMap.
    getIterator() {
        return new SortedMapIterator(this.root, null, this.comparator, !1);
    }
    getIteratorFrom(e) {
        return new SortedMapIterator(this.root, e, this.comparator, !1);
    }
    getReverseIterator() {
        return new SortedMapIterator(this.root, null, this.comparator, !0);
    }
    getReverseIteratorFrom(e) {
        return new SortedMapIterator(this.root, e, this.comparator, !0);
    }
}

 // end SortedMap
// An iterator over an LLRBNode.
class SortedMapIterator {
    constructor(e, t, n, r) {
        this.isReverse = r, this.nodeStack = [];
        let i = 1;
        for (;!e.isEmpty(); ) if (i = t ? n(e.key, t) : 1, 
        // flip the comparison if we're going in reverse
        t && r && (i *= -1), i < 0) 
        // This node is less than our start key. ignore it
        e = this.isReverse ? e.left : e.right; else {
            if (0 === i) {
                // This node is exactly equal to our start key. Push it on the stack,
                // but stop iterating;
                this.nodeStack.push(e);
                break;
            }
            // This node is greater than our start key, add it to the stack and move
            // to the next one
            this.nodeStack.push(e), e = this.isReverse ? e.right : e.left;
        }
    }
    getNext() {
        let e = this.nodeStack.pop();
        const t = {
            key: e.key,
            value: e.value
        };
        if (this.isReverse) for (e = e.left; !e.isEmpty(); ) this.nodeStack.push(e), e = e.right; else for (e = e.right; !e.isEmpty(); ) this.nodeStack.push(e), 
        e = e.left;
        return t;
    }
    hasNext() {
        return this.nodeStack.length > 0;
    }
    peek() {
        if (0 === this.nodeStack.length) return null;
        const e = this.nodeStack[this.nodeStack.length - 1];
        return {
            key: e.key,
            value: e.value
        };
    }
}

 // end SortedMapIterator
// Represents a node in a Left-leaning Red-Black tree.
class LLRBNode {
    constructor(e, t, n, r, i) {
        this.key = e, this.value = t, this.color = null != n ? n : LLRBNode.RED, this.left = null != r ? r : LLRBNode.EMPTY, 
        this.right = null != i ? i : LLRBNode.EMPTY, this.size = this.left.size + 1 + this.right.size;
    }
    // Returns a copy of the current node, optionally replacing pieces of it.
    copy(e, t, n, r, i) {
        return new LLRBNode(null != e ? e : this.key, null != t ? t : this.value, null != n ? n : this.color, null != r ? r : this.left, null != i ? i : this.right);
    }
    isEmpty() {
        return !1;
    }
    // Traverses the tree in key order and calls the specified action function
    // for each node. If action returns true, traversal is aborted.
    // Returns the first truthy value returned by action, or the last falsey
    // value returned by action.
    inorderTraversal(e) {
        return this.left.inorderTraversal(e) || e(this.key, this.value) || this.right.inorderTraversal(e);
    }
    // Traverses the tree in reverse key order and calls the specified action
    // function for each node. If action returns true, traversal is aborted.
    // Returns the first truthy value returned by action, or the last falsey
    // value returned by action.
    reverseTraversal(e) {
        return this.right.reverseTraversal(e) || e(this.key, this.value) || this.left.reverseTraversal(e);
    }
    // Returns the minimum node in the tree.
    min() {
        return this.left.isEmpty() ? this : this.left.min();
    }
    // Returns the maximum key in the tree.
    minKey() {
        return this.min().key;
    }
    // Returns the maximum key in the tree.
    maxKey() {
        return this.right.isEmpty() ? this.key : this.right.maxKey();
    }
    // Returns new tree, with the key/value added.
    insert(e, t, n) {
        let r = this;
        const i = n(e, r.key);
        return r = i < 0 ? r.copy(null, null, null, r.left.insert(e, t, n), null) : 0 === i ? r.copy(null, t, null, null, null) : r.copy(null, null, null, null, r.right.insert(e, t, n)), 
        r.fixUp();
    }
    removeMin() {
        if (this.left.isEmpty()) return LLRBNode.EMPTY;
        let e = this;
        return e.left.isRed() || e.left.left.isRed() || (e = e.moveRedLeft()), e = e.copy(null, null, null, e.left.removeMin(), null), 
        e.fixUp();
    }
    // Returns new tree, with the specified item removed.
    remove(e, t) {
        let n, r = this;
        if (t(e, r.key) < 0) r.left.isEmpty() || r.left.isRed() || r.left.left.isRed() || (r = r.moveRedLeft()), 
        r = r.copy(null, null, null, r.left.remove(e, t), null); else {
            if (r.left.isRed() && (r = r.rotateRight()), r.right.isEmpty() || r.right.isRed() || r.right.left.isRed() || (r = r.moveRedRight()), 
            0 === t(e, r.key)) {
                if (r.right.isEmpty()) return LLRBNode.EMPTY;
                n = r.right.min(), r = r.copy(n.key, n.value, null, null, r.right.removeMin());
            }
            r = r.copy(null, null, null, null, r.right.remove(e, t));
        }
        return r.fixUp();
    }
    isRed() {
        return this.color;
    }
    // Returns new tree after performing any needed rotations.
    fixUp() {
        let e = this;
        return e.right.isRed() && !e.left.isRed() && (e = e.rotateLeft()), e.left.isRed() && e.left.left.isRed() && (e = e.rotateRight()), 
        e.left.isRed() && e.right.isRed() && (e = e.colorFlip()), e;
    }
    moveRedLeft() {
        let e = this.colorFlip();
        return e.right.left.isRed() && (e = e.copy(null, null, null, null, e.right.rotateRight()), 
        e = e.rotateLeft(), e = e.colorFlip()), e;
    }
    moveRedRight() {
        let e = this.colorFlip();
        return e.left.left.isRed() && (e = e.rotateRight(), e = e.colorFlip()), e;
    }
    rotateLeft() {
        const e = this.copy(null, null, LLRBNode.RED, null, this.right.left);
        return this.right.copy(null, null, this.color, e, null);
    }
    rotateRight() {
        const e = this.copy(null, null, LLRBNode.RED, this.left.right, null);
        return this.left.copy(null, null, this.color, null, e);
    }
    colorFlip() {
        const e = this.left.copy(null, null, !this.left.color, null, null), t = this.right.copy(null, null, !this.right.color, null, null);
        return this.copy(null, null, !this.color, e, t);
    }
    // For testing.
    checkMaxDepth() {
        const e = this.check();
        return Math.pow(2, e) <= this.size + 1;
    }
    // In a balanced RB tree, the black-depth (number of black nodes) from root to
    // leaves is equal on both sides.  This function verifies that or asserts.
    check() {
        if (this.isRed() && this.left.isRed()) throw fail();
        if (this.right.isRed()) throw fail();
        const e = this.left.check();
        if (e !== this.right.check()) throw fail();
        return e + (this.isRed() ? 0 : 1);
    }
}

 // end LLRBNode
// Empty node is shared between all LLRB trees.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
LLRBNode.EMPTY = null, LLRBNode.RED = !0, LLRBNode.BLACK = !1;

// end LLRBEmptyNode
LLRBNode.EMPTY = new 
// Represents an empty node (a leaf node in the Red-Black Tree).
class LLRBEmptyNode {
    constructor() {
        this.size = 0;
    }
    get key() {
        throw fail();
    }
    get value() {
        throw fail();
    }
    get color() {
        throw fail();
    }
    get left() {
        throw fail();
    }
    get right() {
        throw fail();
    }
    // Returns a copy of the current node.
    copy(e, t, n, r, i) {
        return this;
    }
    // Returns a copy of the tree, with the specified key/value added.
    insert(e, t, n) {
        return new LLRBNode(e, t);
    }
    // Returns a copy of the tree, with the specified key removed.
    remove(e, t) {
        return this;
    }
    isEmpty() {
        return !0;
    }
    inorderTraversal(e) {
        return !1;
    }
    reverseTraversal(e) {
        return !1;
    }
    minKey() {
        return null;
    }
    maxKey() {
        return null;
    }
    isRed() {
        return !1;
    }
    // For testing.
    checkMaxDepth() {
        return !0;
    }
    check() {
        return 0;
    }
};

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * SortedSet is an immutable (copy-on-write) collection that holds elements
 * in order specified by the provided comparator.
 *
 * NOTE: if provided comparator returns 0 for two elements, we consider them to
 * be equal!
 */
class SortedSet {
    constructor(e) {
        this.comparator = e, this.data = new SortedMap(this.comparator);
    }
    has(e) {
        return null !== this.data.get(e);
    }
    first() {
        return this.data.minKey();
    }
    last() {
        return this.data.maxKey();
    }
    get size() {
        return this.data.size;
    }
    indexOf(e) {
        return this.data.indexOf(e);
    }
    /** Iterates elements in order defined by "comparator" */    forEach(e) {
        this.data.inorderTraversal(((t, n) => (e(t), !1)));
    }
    /** Iterates over `elem`s such that: range[0] &lt;= elem &lt; range[1]. */    forEachInRange(e, t) {
        const n = this.data.getIteratorFrom(e[0]);
        for (;n.hasNext(); ) {
            const r = n.getNext();
            if (this.comparator(r.key, e[1]) >= 0) return;
            t(r.key);
        }
    }
    /**
     * Iterates over `elem`s such that: start &lt;= elem until false is returned.
     */    forEachWhile(e, t) {
        let n;
        for (n = void 0 !== t ? this.data.getIteratorFrom(t) : this.data.getIterator(); n.hasNext(); ) {
            if (!e(n.getNext().key)) return;
        }
    }
    /** Finds the least element greater than or equal to `elem`. */    firstAfterOrEqual(e) {
        const t = this.data.getIteratorFrom(e);
        return t.hasNext() ? t.getNext().key : null;
    }
    getIterator() {
        return new SortedSetIterator(this.data.getIterator());
    }
    getIteratorFrom(e) {
        return new SortedSetIterator(this.data.getIteratorFrom(e));
    }
    /** Inserts or updates an element */    add(e) {
        return this.copy(this.data.remove(e).insert(e, !0));
    }
    /** Deletes an element */    delete(e) {
        return this.has(e) ? this.copy(this.data.remove(e)) : this;
    }
    isEmpty() {
        return this.data.isEmpty();
    }
    unionWith(e) {
        let t = this;
        // Make sure `result` always refers to the larger one of the two sets.
                return t.size < e.size && (t = e, e = this), e.forEach((e => {
            t = t.add(e);
        })), t;
    }
    isEqual(e) {
        if (!(e instanceof SortedSet)) return !1;
        if (this.size !== e.size) return !1;
        const t = this.data.getIterator(), n = e.data.getIterator();
        for (;t.hasNext(); ) {
            const e = t.getNext().key, r = n.getNext().key;
            if (0 !== this.comparator(e, r)) return !1;
        }
        return !0;
    }
    toArray() {
        const e = [];
        return this.forEach((t => {
            e.push(t);
        })), e;
    }
    toString() {
        const e = [];
        return this.forEach((t => e.push(t))), "SortedSet(" + e.toString() + ")";
    }
    copy(e) {
        const t = new SortedSet(this.comparator);
        return t.data = e, t;
    }
}

class SortedSetIterator {
    constructor(e) {
        this.iter = e;
    }
    getNext() {
        return this.iter.getNext().key;
    }
    hasNext() {
        return this.iter.hasNext();
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Provides a set of fields that can be used to partially patch a document.
 * FieldMask is used in conjunction with ObjectValue.
 * Examples:
 *   foo - Overwrites foo entirely with the provided value. If foo is not
 *         present in the companion ObjectValue, the field is deleted.
 *   foo.bar - Overwrites only the field bar of the object foo.
 *             If foo is not an object, foo is replaced with an object
 *             containing foo
 */ class FieldMask {
    constructor(e) {
        this.fields = e, 
        // TODO(dimond): validation of FieldMask
        // Sort the field mask to support `FieldMask.isEqual()` and assert below.
        e.sort(FieldPath$1.comparator);
    }
    static empty() {
        return new FieldMask([]);
    }
    /**
     * Returns a new FieldMask object that is the result of adding all the given
     * fields paths to this field mask.
     */    unionWith(e) {
        let t = new SortedSet(FieldPath$1.comparator);
        for (const e of this.fields) t = t.add(e);
        for (const n of e) t = t.add(n);
        return new FieldMask(t.toArray());
    }
    /**
     * Verifies that `fieldPath` is included by at least one field in this field
     * mask.
     *
     * This is an O(n) operation, where `n` is the size of the field mask.
     */    covers(e) {
        for (const t of this.fields) if (t.isPrefixOf(e)) return !0;
        return !1;
    }
    isEqual(e) {
        return __PRIVATE_arrayEquals(this.fields, e.fields, ((e, t) => e.isEqual(t)));
    }
}

/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * An error encountered while decoding base64 string.
 */ class __PRIVATE_Base64DecodeError extends Error {
    constructor() {
        super(...arguments), this.name = "Base64DecodeError";
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Immutable class that represents a "proto" byte string.
 *
 * Proto byte strings can either be Base64-encoded strings or Uint8Arrays when
 * sent on the wire. This class abstracts away this differentiation by holding
 * the proto byte string in a common class that must be converted into a string
 * before being sent as a proto.
 * @internal
 */ class ByteString {
    constructor(e) {
        this.binaryString = e;
    }
    static fromBase64String(e) {
        const t = function __PRIVATE_decodeBase64(e) {
            try {
                return atob(e);
            } catch (e) {
                // Check that `DOMException` is defined before using it to avoid
                // "ReferenceError: Property 'DOMException' doesn't exist" in react-native.
                // (https://github.com/firebase/firebase-js-sdk/issues/7115)
                throw "undefined" != typeof DOMException && e instanceof DOMException ? new __PRIVATE_Base64DecodeError("Invalid base64 string: " + e) : e;
            }
        }
        /** Converts a binary string to a Base64 encoded string. */ (e);
        return new ByteString(t);
    }
    static fromUint8Array(e) {
        // TODO(indexing); Remove the copy of the byte string here as this method
        // is frequently called during indexing.
        const t = 
        /**
 * Helper function to convert an Uint8array to a binary string.
 */
        function __PRIVATE_binaryStringFromUint8Array(e) {
            let t = "";
            for (let n = 0; n < e.length; ++n) t += String.fromCharCode(e[n]);
            return t;
        }
        /**
 * Helper function to convert a binary string to an Uint8Array.
 */ (e);
        return new ByteString(t);
    }
    [Symbol.iterator]() {
        let e = 0;
        return {
            next: () => e < this.binaryString.length ? {
                value: this.binaryString.charCodeAt(e++),
                done: !1
            } : {
                value: void 0,
                done: !0
            }
        };
    }
    toBase64() {
        return function __PRIVATE_encodeBase64(e) {
            return btoa(e);
        }(this.binaryString);
    }
    toUint8Array() {
        return function __PRIVATE_uint8ArrayFromBinaryString(e) {
            const t = new Uint8Array(e.length);
            for (let n = 0; n < e.length; n++) t[n] = e.charCodeAt(n);
            return t;
        }
        /**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
        // A RegExp matching ISO 8601 UTC timestamps with optional fraction.
        (this.binaryString);
    }
    approximateByteSize() {
        return 2 * this.binaryString.length;
    }
    compareTo(e) {
        return __PRIVATE_primitiveComparator(this.binaryString, e.binaryString);
    }
    isEqual(e) {
        return this.binaryString === e.binaryString;
    }
}

ByteString.EMPTY_BYTE_STRING = new ByteString("");

const ee = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);

/**
 * Converts the possible Proto values for a timestamp value into a "seconds and
 * nanos" representation.
 */ function __PRIVATE_normalizeTimestamp(e) {
    // The json interface (for the browser) will return an iso timestamp string,
    // while the proto js library (for node) will return a
    // google.protobuf.Timestamp instance.
    if (__PRIVATE_hardAssert(!!e), "string" == typeof e) {
        // The date string can have higher precision (nanos) than the Date class
        // (millis), so we do some custom parsing here.
        // Parse the nanos right out of the string.
        let t = 0;
        const n = ee.exec(e);
        if (__PRIVATE_hardAssert(!!n), n[1]) {
            // Pad the fraction out to 9 digits (nanos).
            let e = n[1];
            e = (e + "000000000").substr(0, 9), t = Number(e);
        }
        // Parse the date to get the seconds.
                const r = new Date(e);
        return {
            seconds: Math.floor(r.getTime() / 1e3),
            nanos: t
        };
    }
    return {
        seconds: __PRIVATE_normalizeNumber(e.seconds),
        nanos: __PRIVATE_normalizeNumber(e.nanos)
    };
}

/**
 * Converts the possible Proto types for numbers into a JavaScript number.
 * Returns 0 if the value is not numeric.
 */ function __PRIVATE_normalizeNumber(e) {
    // TODO(bjornick): Handle int64 greater than 53 bits.
    return "number" == typeof e ? e : "string" == typeof e ? Number(e) : 0;
}

/** Converts the possible Proto types for Blobs into a ByteString. */ function __PRIVATE_normalizeByteString(e) {
    return "string" == typeof e ? ByteString.fromBase64String(e) : ByteString.fromUint8Array(e);
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Represents a locally-applied ServerTimestamp.
 *
 * Server Timestamps are backed by MapValues that contain an internal field
 * `__type__` with a value of `server_timestamp`. The previous value and local
 * write time are stored in its `__previous_value__` and `__local_write_time__`
 * fields respectively.
 *
 * Notes:
 * - ServerTimestampValue instances are created as the result of applying a
 *   transform. They can only exist in the local view of a document. Therefore
 *   they do not need to be parsed or serialized.
 * - When evaluated locally (e.g. for snapshot.data()), they by default
 *   evaluate to `null`. This behavior can be configured by passing custom
 *   FieldValueOptions to value().
 * - With respect to other ServerTimestampValues, they sort by their
 *   localWriteTime.
 */ function __PRIVATE_isServerTimestamp(e) {
    var t, n;
    return "server_timestamp" === (null === (n = ((null === (t = null == e ? void 0 : e.mapValue) || void 0 === t ? void 0 : t.fields) || {}).__type__) || void 0 === n ? void 0 : n.stringValue);
}

/**
 * Creates a new ServerTimestamp proto value (using the internal format).
 */
/**
 * Returns the value of the field before this ServerTimestamp was set.
 *
 * Preserving the previous values allows the user to display the last resoled
 * value until the backend responds with the timestamp.
 */
function __PRIVATE_getPreviousValue(e) {
    const t = e.mapValue.fields.__previous_value__;
    return __PRIVATE_isServerTimestamp(t) ? __PRIVATE_getPreviousValue(t) : t;
}

/**
 * Returns the local time at which this timestamp was first set.
 */ function __PRIVATE_getLocalWriteTime(e) {
    const t = __PRIVATE_normalizeTimestamp(e.mapValue.fields.__local_write_time__.timestampValue);
    return new Timestamp(t.seconds, t.nanos);
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class DatabaseInfo {
    /**
     * Constructs a DatabaseInfo using the provided host, databaseId and
     * persistenceKey.
     *
     * @param databaseId - The database to use.
     * @param appId - The Firebase App Id.
     * @param persistenceKey - A unique identifier for this Firestore's local
     * storage (used in conjunction with the databaseId).
     * @param host - The Firestore backend host to connect to.
     * @param ssl - Whether to use SSL when connecting.
     * @param forceLongPolling - Whether to use the forceLongPolling option
     * when using WebChannel as the network transport.
     * @param autoDetectLongPolling - Whether to use the detectBufferingProxy
     * option when using WebChannel as the network transport.
     * @param longPollingOptions Options that configure long-polling.
     * @param useFetchStreams Whether to use the Fetch API instead of
     * XMLHTTPRequest
     */
    constructor(e, t, n, r, i, s, o, _, a) {
        this.databaseId = e, this.appId = t, this.persistenceKey = n, this.host = r, this.ssl = i, 
        this.forceLongPolling = s, this.autoDetectLongPolling = o, this.longPollingOptions = _, 
        this.useFetchStreams = a;
    }
}

/** The default database name for a project. */
/**
 * Represents the database ID a Firestore client is associated with.
 * @internal
 */
class DatabaseId {
    constructor(e, t) {
        this.projectId = e, this.database = t || "(default)";
    }
    static empty() {
        return new DatabaseId("", "");
    }
    get isDefaultDatabase() {
        return "(default)" === this.database;
    }
    isEqual(e) {
        return e instanceof DatabaseId && e.projectId === this.projectId && e.database === this.database;
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const te = {
    mapValue: {
        fields: {
            __type__: {
                stringValue: "__max__"
            }
        }
    }
};

/** Extracts the backend's type order for the provided value. */
function __PRIVATE_typeOrder(e) {
    return "nullValue" in e ? 0 /* TypeOrder.NullValue */ : "booleanValue" in e ? 1 /* TypeOrder.BooleanValue */ : "integerValue" in e || "doubleValue" in e ? 2 /* TypeOrder.NumberValue */ : "timestampValue" in e ? 3 /* TypeOrder.TimestampValue */ : "stringValue" in e ? 5 /* TypeOrder.StringValue */ : "bytesValue" in e ? 6 /* TypeOrder.BlobValue */ : "referenceValue" in e ? 7 /* TypeOrder.RefValue */ : "geoPointValue" in e ? 8 /* TypeOrder.GeoPointValue */ : "arrayValue" in e ? 9 /* TypeOrder.ArrayValue */ : "mapValue" in e ? __PRIVATE_isServerTimestamp(e) ? 4 /* TypeOrder.ServerTimestampValue */ : __PRIVATE_isMaxValue(e) ? 9007199254740991 /* TypeOrder.MaxValue */ : 10 /* TypeOrder.ObjectValue */ : fail();
}

/** Tests `left` and `right` for equality based on the backend semantics. */ function __PRIVATE_valueEquals(e, t) {
    if (e === t) return !0;
    const n = __PRIVATE_typeOrder(e);
    if (n !== __PRIVATE_typeOrder(t)) return !1;
    switch (n) {
      case 0 /* TypeOrder.NullValue */ :
      case 9007199254740991 /* TypeOrder.MaxValue */ :
        return !0;

      case 1 /* TypeOrder.BooleanValue */ :
        return e.booleanValue === t.booleanValue;

      case 4 /* TypeOrder.ServerTimestampValue */ :
        return __PRIVATE_getLocalWriteTime(e).isEqual(__PRIVATE_getLocalWriteTime(t));

      case 3 /* TypeOrder.TimestampValue */ :
        return function __PRIVATE_timestampEquals(e, t) {
            if ("string" == typeof e.timestampValue && "string" == typeof t.timestampValue && e.timestampValue.length === t.timestampValue.length) 
            // Use string equality for ISO 8601 timestamps
            return e.timestampValue === t.timestampValue;
            const n = __PRIVATE_normalizeTimestamp(e.timestampValue), r = __PRIVATE_normalizeTimestamp(t.timestampValue);
            return n.seconds === r.seconds && n.nanos === r.nanos;
        }(e, t);

      case 5 /* TypeOrder.StringValue */ :
        return e.stringValue === t.stringValue;

      case 6 /* TypeOrder.BlobValue */ :
        return function __PRIVATE_blobEquals(e, t) {
            return __PRIVATE_normalizeByteString(e.bytesValue).isEqual(__PRIVATE_normalizeByteString(t.bytesValue));
        }(e, t);

      case 7 /* TypeOrder.RefValue */ :
        return e.referenceValue === t.referenceValue;

      case 8 /* TypeOrder.GeoPointValue */ :
        return function __PRIVATE_geoPointEquals(e, t) {
            return __PRIVATE_normalizeNumber(e.geoPointValue.latitude) === __PRIVATE_normalizeNumber(t.geoPointValue.latitude) && __PRIVATE_normalizeNumber(e.geoPointValue.longitude) === __PRIVATE_normalizeNumber(t.geoPointValue.longitude);
        }(e, t);

      case 2 /* TypeOrder.NumberValue */ :
        return function __PRIVATE_numberEquals(e, t) {
            if ("integerValue" in e && "integerValue" in t) return __PRIVATE_normalizeNumber(e.integerValue) === __PRIVATE_normalizeNumber(t.integerValue);
            if ("doubleValue" in e && "doubleValue" in t) {
                const n = __PRIVATE_normalizeNumber(e.doubleValue), r = __PRIVATE_normalizeNumber(t.doubleValue);
                return n === r ? __PRIVATE_isNegativeZero(n) === __PRIVATE_isNegativeZero(r) : isNaN(n) && isNaN(r);
            }
            return !1;
        }(e, t);

      case 9 /* TypeOrder.ArrayValue */ :
        return __PRIVATE_arrayEquals(e.arrayValue.values || [], t.arrayValue.values || [], __PRIVATE_valueEquals);

      case 10 /* TypeOrder.ObjectValue */ :
        return function __PRIVATE_objectEquals(e, t) {
            const n = e.mapValue.fields || {}, r = t.mapValue.fields || {};
            if (__PRIVATE_objectSize(n) !== __PRIVATE_objectSize(r)) return !1;
            for (const e in n) if (n.hasOwnProperty(e) && (void 0 === r[e] || !__PRIVATE_valueEquals(n[e], r[e]))) return !1;
            return !0;
        }
        /** Returns true if the ArrayValue contains the specified element. */ (e, t);

      default:
        return fail();
    }
}

function __PRIVATE_arrayValueContains(e, t) {
    return void 0 !== (e.values || []).find((e => __PRIVATE_valueEquals(e, t)));
}

function __PRIVATE_valueCompare(e, t) {
    if (e === t) return 0;
    const n = __PRIVATE_typeOrder(e), r = __PRIVATE_typeOrder(t);
    if (n !== r) return __PRIVATE_primitiveComparator(n, r);
    switch (n) {
      case 0 /* TypeOrder.NullValue */ :
      case 9007199254740991 /* TypeOrder.MaxValue */ :
        return 0;

      case 1 /* TypeOrder.BooleanValue */ :
        return __PRIVATE_primitiveComparator(e.booleanValue, t.booleanValue);

      case 2 /* TypeOrder.NumberValue */ :
        return function __PRIVATE_compareNumbers(e, t) {
            const n = __PRIVATE_normalizeNumber(e.integerValue || e.doubleValue), r = __PRIVATE_normalizeNumber(t.integerValue || t.doubleValue);
            return n < r ? -1 : n > r ? 1 : n === r ? 0 : 
            // one or both are NaN.
            isNaN(n) ? isNaN(r) ? 0 : -1 : 1;
        }(e, t);

      case 3 /* TypeOrder.TimestampValue */ :
        return __PRIVATE_compareTimestamps(e.timestampValue, t.timestampValue);

      case 4 /* TypeOrder.ServerTimestampValue */ :
        return __PRIVATE_compareTimestamps(__PRIVATE_getLocalWriteTime(e), __PRIVATE_getLocalWriteTime(t));

      case 5 /* TypeOrder.StringValue */ :
        return __PRIVATE_primitiveComparator(e.stringValue, t.stringValue);

      case 6 /* TypeOrder.BlobValue */ :
        return function __PRIVATE_compareBlobs(e, t) {
            const n = __PRIVATE_normalizeByteString(e), r = __PRIVATE_normalizeByteString(t);
            return n.compareTo(r);
        }(e.bytesValue, t.bytesValue);

      case 7 /* TypeOrder.RefValue */ :
        return function __PRIVATE_compareReferences(e, t) {
            const n = e.split("/"), r = t.split("/");
            for (let e = 0; e < n.length && e < r.length; e++) {
                const t = __PRIVATE_primitiveComparator(n[e], r[e]);
                if (0 !== t) return t;
            }
            return __PRIVATE_primitiveComparator(n.length, r.length);
        }(e.referenceValue, t.referenceValue);

      case 8 /* TypeOrder.GeoPointValue */ :
        return function __PRIVATE_compareGeoPoints(e, t) {
            const n = __PRIVATE_primitiveComparator(__PRIVATE_normalizeNumber(e.latitude), __PRIVATE_normalizeNumber(t.latitude));
            if (0 !== n) return n;
            return __PRIVATE_primitiveComparator(__PRIVATE_normalizeNumber(e.longitude), __PRIVATE_normalizeNumber(t.longitude));
        }(e.geoPointValue, t.geoPointValue);

      case 9 /* TypeOrder.ArrayValue */ :
        return function __PRIVATE_compareArrays(e, t) {
            const n = e.values || [], r = t.values || [];
            for (let e = 0; e < n.length && e < r.length; ++e) {
                const t = __PRIVATE_valueCompare(n[e], r[e]);
                if (t) return t;
            }
            return __PRIVATE_primitiveComparator(n.length, r.length);
        }(e.arrayValue, t.arrayValue);

      case 10 /* TypeOrder.ObjectValue */ :
        return function __PRIVATE_compareMaps(e, t) {
            if (e === te.mapValue && t === te.mapValue) return 0;
            if (e === te.mapValue) return 1;
            if (t === te.mapValue) return -1;
            const n = e.fields || {}, r = Object.keys(n), i = t.fields || {}, s = Object.keys(i);
            // Even though MapValues are likely sorted correctly based on their insertion
            // order (e.g. when received from the backend), local modifications can bring
            // elements out of order. We need to re-sort the elements to ensure that
            // canonical IDs are independent of insertion order.
            r.sort(), s.sort();
            for (let e = 0; e < r.length && e < s.length; ++e) {
                const t = __PRIVATE_primitiveComparator(r[e], s[e]);
                if (0 !== t) return t;
                const o = __PRIVATE_valueCompare(n[r[e]], i[s[e]]);
                if (0 !== o) return o;
            }
            return __PRIVATE_primitiveComparator(r.length, s.length);
        }
        /**
 * Generates the canonical ID for the provided field value (as used in Target
 * serialization).
 */ (e.mapValue, t.mapValue);

      default:
        throw fail();
    }
}

function __PRIVATE_compareTimestamps(e, t) {
    if ("string" == typeof e && "string" == typeof t && e.length === t.length) return __PRIVATE_primitiveComparator(e, t);
    const n = __PRIVATE_normalizeTimestamp(e), r = __PRIVATE_normalizeTimestamp(t), i = __PRIVATE_primitiveComparator(n.seconds, r.seconds);
    return 0 !== i ? i : __PRIVATE_primitiveComparator(n.nanos, r.nanos);
}

function canonicalId(e) {
    return __PRIVATE_canonifyValue(e);
}

function __PRIVATE_canonifyValue(e) {
    return "nullValue" in e ? "null" : "booleanValue" in e ? "" + e.booleanValue : "integerValue" in e ? "" + e.integerValue : "doubleValue" in e ? "" + e.doubleValue : "timestampValue" in e ? function __PRIVATE_canonifyTimestamp(e) {
        const t = __PRIVATE_normalizeTimestamp(e);
        return `time(${t.seconds},${t.nanos})`;
    }(e.timestampValue) : "stringValue" in e ? e.stringValue : "bytesValue" in e ? function __PRIVATE_canonifyByteString(e) {
        return __PRIVATE_normalizeByteString(e).toBase64();
    }(e.bytesValue) : "referenceValue" in e ? function __PRIVATE_canonifyReference(e) {
        return DocumentKey.fromName(e).toString();
    }(e.referenceValue) : "geoPointValue" in e ? function __PRIVATE_canonifyGeoPoint(e) {
        return `geo(${e.latitude},${e.longitude})`;
    }(e.geoPointValue) : "arrayValue" in e ? function __PRIVATE_canonifyArray(e) {
        let t = "[", n = !0;
        for (const r of e.values || []) n ? n = !1 : t += ",", t += __PRIVATE_canonifyValue(r);
        return t + "]";
    }
    /**
 * Returns an approximate (and wildly inaccurate) in-memory size for the field
 * value.
 *
 * The memory size takes into account only the actual user data as it resides
 * in memory and ignores object overhead.
 */ (e.arrayValue) : "mapValue" in e ? function __PRIVATE_canonifyMap(e) {
        // Iteration order in JavaScript is not guaranteed. To ensure that we generate
        // matching canonical IDs for identical maps, we need to sort the keys.
        const t = Object.keys(e.fields || {}).sort();
        let n = "{", r = !0;
        for (const i of t) r ? r = !1 : n += ",", n += `${i}:${__PRIVATE_canonifyValue(e.fields[i])}`;
        return n + "}";
    }(e.mapValue) : fail();
}

/** Returns true if `value` is an IntegerValue . */ function isInteger(e) {
    return !!e && "integerValue" in e;
}

/** Returns true if `value` is a DoubleValue. */
/** Returns true if `value` is an ArrayValue. */
function isArray(e) {
    return !!e && "arrayValue" in e;
}

/** Returns true if `value` is a NullValue. */ function __PRIVATE_isNullValue(e) {
    return !!e && "nullValue" in e;
}

/** Returns true if `value` is NaN. */ function __PRIVATE_isNanValue(e) {
    return !!e && "doubleValue" in e && isNaN(Number(e.doubleValue));
}

/** Returns true if `value` is a MapValue. */ function __PRIVATE_isMapValue(e) {
    return !!e && "mapValue" in e;
}

/** Creates a deep copy of `source`. */ function __PRIVATE_deepClone(e) {
    if (e.geoPointValue) return {
        geoPointValue: Object.assign({}, e.geoPointValue)
    };
    if (e.timestampValue && "object" == typeof e.timestampValue) return {
        timestampValue: Object.assign({}, e.timestampValue)
    };
    if (e.mapValue) {
        const t = {
            mapValue: {
                fields: {}
            }
        };
        return forEach(e.mapValue.fields, ((e, n) => t.mapValue.fields[e] = __PRIVATE_deepClone(n))), 
        t;
    }
    if (e.arrayValue) {
        const t = {
            arrayValue: {
                values: []
            }
        };
        for (let n = 0; n < (e.arrayValue.values || []).length; ++n) t.arrayValue.values[n] = __PRIVATE_deepClone(e.arrayValue.values[n]);
        return t;
    }
    return Object.assign({}, e);
}

/** Returns true if the Value represents the canonical {@link #MAX_VALUE} . */ function __PRIVATE_isMaxValue(e) {
    return "__max__" === (((e.mapValue || {}).fields || {}).__type__ || {}).stringValue;
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * An ObjectValue represents a MapValue in the Firestore Proto and offers the
 * ability to add and remove fields (via the ObjectValueBuilder).
 */ class ObjectValue {
    constructor(e) {
        this.value = e;
    }
    static empty() {
        return new ObjectValue({
            mapValue: {}
        });
    }
    /**
     * Returns the value at the given path or null.
     *
     * @param path - the path to search
     * @returns The value at the path or null if the path is not set.
     */    field(e) {
        if (e.isEmpty()) return this.value;
        {
            let t = this.value;
            for (let n = 0; n < e.length - 1; ++n) if (t = (t.mapValue.fields || {})[e.get(n)], 
            !__PRIVATE_isMapValue(t)) return null;
            return t = (t.mapValue.fields || {})[e.lastSegment()], t || null;
        }
    }
    /**
     * Sets the field to the provided value.
     *
     * @param path - The field path to set.
     * @param value - The value to set.
     */    set(e, t) {
        this.getFieldsMap(e.popLast())[e.lastSegment()] = __PRIVATE_deepClone(t);
    }
    /**
     * Sets the provided fields to the provided values.
     *
     * @param data - A map of fields to values (or null for deletes).
     */    setAll(e) {
        let t = FieldPath$1.emptyPath(), n = {}, r = [];
        e.forEach(((e, i) => {
            if (!t.isImmediateParentOf(i)) {
                // Insert the accumulated changes at this parent location
                const e = this.getFieldsMap(t);
                this.applyChanges(e, n, r), n = {}, r = [], t = i.popLast();
            }
            e ? n[i.lastSegment()] = __PRIVATE_deepClone(e) : r.push(i.lastSegment());
        }));
        const i = this.getFieldsMap(t);
        this.applyChanges(i, n, r);
    }
    /**
     * Removes the field at the specified path. If there is no field at the
     * specified path, nothing is changed.
     *
     * @param path - The field path to remove.
     */    delete(e) {
        const t = this.field(e.popLast());
        __PRIVATE_isMapValue(t) && t.mapValue.fields && delete t.mapValue.fields[e.lastSegment()];
    }
    isEqual(e) {
        return __PRIVATE_valueEquals(this.value, e.value);
    }
    /**
     * Returns the map that contains the leaf element of `path`. If the parent
     * entry does not yet exist, or if it is not a map, a new map will be created.
     */    getFieldsMap(e) {
        let t = this.value;
        t.mapValue.fields || (t.mapValue = {
            fields: {}
        });
        for (let n = 0; n < e.length; ++n) {
            let r = t.mapValue.fields[e.get(n)];
            __PRIVATE_isMapValue(r) && r.mapValue.fields || (r = {
                mapValue: {
                    fields: {}
                }
            }, t.mapValue.fields[e.get(n)] = r), t = r;
        }
        return t.mapValue.fields;
    }
    /**
     * Modifies `fieldsMap` by adding, replacing or deleting the specified
     * entries.
     */    applyChanges(e, t, n) {
        forEach(t, ((t, n) => e[t] = n));
        for (const t of n) delete e[t];
    }
    clone() {
        return new ObjectValue(__PRIVATE_deepClone(this.value));
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Represents a document in Firestore with a key, version, data and whether it
 * has local mutations applied to it.
 *
 * Documents can transition between states via `convertToFoundDocument()`,
 * `convertToNoDocument()` and `convertToUnknownDocument()`. If a document does
 * not transition to one of these states even after all mutations have been
 * applied, `isValidDocument()` returns false and the document should be removed
 * from all views.
 */ class MutableDocument {
    constructor(e, t, n, r, i, s, o) {
        this.key = e, this.documentType = t, this.version = n, this.readTime = r, this.createTime = i, 
        this.data = s, this.documentState = o;
    }
    /**
     * Creates a document with no known version or data, but which can serve as
     * base document for mutations.
     */    static newInvalidDocument(e) {
        return new MutableDocument(e, 0 /* DocumentType.INVALID */ , 
        /* version */ SnapshotVersion.min(), 
        /* readTime */ SnapshotVersion.min(), 
        /* createTime */ SnapshotVersion.min(), ObjectValue.empty(), 0 /* DocumentState.SYNCED */);
    }
    /**
     * Creates a new document that is known to exist with the given data at the
     * given version.
     */    static newFoundDocument(e, t, n, r) {
        return new MutableDocument(e, 1 /* DocumentType.FOUND_DOCUMENT */ , 
        /* version */ t, 
        /* readTime */ SnapshotVersion.min(), 
        /* createTime */ n, r, 0 /* DocumentState.SYNCED */);
    }
    /** Creates a new document that is known to not exist at the given version. */    static newNoDocument(e, t) {
        return new MutableDocument(e, 2 /* DocumentType.NO_DOCUMENT */ , 
        /* version */ t, 
        /* readTime */ SnapshotVersion.min(), 
        /* createTime */ SnapshotVersion.min(), ObjectValue.empty(), 0 /* DocumentState.SYNCED */);
    }
    /**
     * Creates a new document that is known to exist at the given version but
     * whose data is not known (e.g. a document that was updated without a known
     * base document).
     */    static newUnknownDocument(e, t) {
        return new MutableDocument(e, 3 /* DocumentType.UNKNOWN_DOCUMENT */ , 
        /* version */ t, 
        /* readTime */ SnapshotVersion.min(), 
        /* createTime */ SnapshotVersion.min(), ObjectValue.empty(), 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */);
    }
    /**
     * Changes the document type to indicate that it exists and that its version
     * and data are known.
     */    convertToFoundDocument(e, t) {
        // If a document is switching state from being an invalid or deleted
        // document to a valid (FOUND_DOCUMENT) document, either due to receiving an
        // update from Watch or due to applying a local set mutation on top
        // of a deleted document, our best guess about its createTime would be the
        // version at which the document transitioned to a FOUND_DOCUMENT.
        return !this.createTime.isEqual(SnapshotVersion.min()) || 2 /* DocumentType.NO_DOCUMENT */ !== this.documentType && 0 /* DocumentType.INVALID */ !== this.documentType || (this.createTime = e), 
        this.version = e, this.documentType = 1 /* DocumentType.FOUND_DOCUMENT */ , this.data = t, 
        this.documentState = 0 /* DocumentState.SYNCED */ , this;
    }
    /**
     * Changes the document type to indicate that it doesn't exist at the given
     * version.
     */    convertToNoDocument(e) {
        return this.version = e, this.documentType = 2 /* DocumentType.NO_DOCUMENT */ , 
        this.data = ObjectValue.empty(), this.documentState = 0 /* DocumentState.SYNCED */ , 
        this;
    }
    /**
     * Changes the document type to indicate that it exists at a given version but
     * that its data is not known (e.g. a document that was updated without a known
     * base document).
     */    convertToUnknownDocument(e) {
        return this.version = e, this.documentType = 3 /* DocumentType.UNKNOWN_DOCUMENT */ , 
        this.data = ObjectValue.empty(), this.documentState = 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */ , 
        this;
    }
    setHasCommittedMutations() {
        return this.documentState = 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */ , this;
    }
    setHasLocalMutations() {
        return this.documentState = 1 /* DocumentState.HAS_LOCAL_MUTATIONS */ , this.version = SnapshotVersion.min(), 
        this;
    }
    setReadTime(e) {
        return this.readTime = e, this;
    }
    get hasLocalMutations() {
        return 1 /* DocumentState.HAS_LOCAL_MUTATIONS */ === this.documentState;
    }
    get hasCommittedMutations() {
        return 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */ === this.documentState;
    }
    get hasPendingWrites() {
        return this.hasLocalMutations || this.hasCommittedMutations;
    }
    isValidDocument() {
        return 0 /* DocumentType.INVALID */ !== this.documentType;
    }
    isFoundDocument() {
        return 1 /* DocumentType.FOUND_DOCUMENT */ === this.documentType;
    }
    isNoDocument() {
        return 2 /* DocumentType.NO_DOCUMENT */ === this.documentType;
    }
    isUnknownDocument() {
        return 3 /* DocumentType.UNKNOWN_DOCUMENT */ === this.documentType;
    }
    isEqual(e) {
        return e instanceof MutableDocument && this.key.isEqual(e.key) && this.version.isEqual(e.version) && this.documentType === e.documentType && this.documentState === e.documentState && this.data.isEqual(e.data);
    }
    mutableCopy() {
        return new MutableDocument(this.key, this.documentType, this.version, this.readTime, this.createTime, this.data.clone(), this.documentState);
    }
    toString() {
        return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
    }
}

/**
 * Compares the value for field `field` in the provided documents. Throws if
 * the field does not exist in both documents.
 */
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Represents a bound of a query.
 *
 * The bound is specified with the given components representing a position and
 * whether it's just before or just after the position (relative to whatever the
 * query order is).
 *
 * The position represents a logical index position for a query. It's a prefix
 * of values for the (potentially implicit) order by clauses of a query.
 *
 * Bound provides a function to determine whether a document comes before or
 * after a bound. This is influenced by whether the position is just before or
 * just after the provided values.
 */
class Bound {
    constructor(e, t) {
        this.position = e, this.inclusive = t;
    }
}

function __PRIVATE_boundCompareToDocument(e, t, n) {
    let r = 0;
    for (let i = 0; i < e.position.length; i++) {
        const s = t[i], o = e.position[i];
        if (s.field.isKeyField()) r = DocumentKey.comparator(DocumentKey.fromName(o.referenceValue), n.key); else {
            r = __PRIVATE_valueCompare(o, n.data.field(s.field));
        }
        if ("desc" /* Direction.DESCENDING */ === s.dir && (r *= -1), 0 !== r) break;
    }
    return r;
}

/**
 * Returns true if a document sorts after a bound using the provided sort
 * order.
 */ function __PRIVATE_boundEquals(e, t) {
    if (null === e) return null === t;
    if (null === t) return !1;
    if (e.inclusive !== t.inclusive || e.position.length !== t.position.length) return !1;
    for (let n = 0; n < e.position.length; n++) {
        if (!__PRIVATE_valueEquals(e.position[n], t.position[n])) return !1;
    }
    return !0;
}

/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * An ordering on a field, in some Direction. Direction defaults to ASCENDING.
 */ class OrderBy {
    constructor(e, t = "asc" /* Direction.ASCENDING */) {
        this.field = e, this.dir = t;
    }
}

function __PRIVATE_orderByEquals(e, t) {
    return e.dir === t.dir && e.field.isEqual(t.field);
}

/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Filter {}

class FieldFilter extends Filter {
    constructor(e, t, n) {
        super(), this.field = e, this.op = t, this.value = n;
    }
    /**
     * Creates a filter based on the provided arguments.
     */    static create(e, t, n) {
        return e.isKeyField() ? "in" /* Operator.IN */ === t || "not-in" /* Operator.NOT_IN */ === t ? this.createKeyFieldInFilter(e, t, n) : new __PRIVATE_KeyFieldFilter(e, t, n) : "array-contains" /* Operator.ARRAY_CONTAINS */ === t ? new __PRIVATE_ArrayContainsFilter(e, n) : "in" /* Operator.IN */ === t ? new __PRIVATE_InFilter(e, n) : "not-in" /* Operator.NOT_IN */ === t ? new __PRIVATE_NotInFilter(e, n) : "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ === t ? new __PRIVATE_ArrayContainsAnyFilter(e, n) : new FieldFilter(e, t, n);
    }
    static createKeyFieldInFilter(e, t, n) {
        return "in" /* Operator.IN */ === t ? new __PRIVATE_KeyFieldInFilter(e, n) : new __PRIVATE_KeyFieldNotInFilter(e, n);
    }
    matches(e) {
        const t = e.data.field(this.field);
        // Types do not have to match in NOT_EQUAL filters.
                return "!=" /* Operator.NOT_EQUAL */ === this.op ? null !== t && this.matchesComparison(__PRIVATE_valueCompare(t, this.value)) : null !== t && __PRIVATE_typeOrder(this.value) === __PRIVATE_typeOrder(t) && this.matchesComparison(__PRIVATE_valueCompare(t, this.value));
        // Only compare types with matching backend order (such as double and int).
        }
    matchesComparison(e) {
        switch (this.op) {
          case "<" /* Operator.LESS_THAN */ :
            return e < 0;

          case "<=" /* Operator.LESS_THAN_OR_EQUAL */ :
            return e <= 0;

          case "==" /* Operator.EQUAL */ :
            return 0 === e;

          case "!=" /* Operator.NOT_EQUAL */ :
            return 0 !== e;

          case ">" /* Operator.GREATER_THAN */ :
            return e > 0;

          case ">=" /* Operator.GREATER_THAN_OR_EQUAL */ :
            return e >= 0;

          default:
            return fail();
        }
    }
    isInequality() {
        return [ "<" /* Operator.LESS_THAN */ , "<=" /* Operator.LESS_THAN_OR_EQUAL */ , ">" /* Operator.GREATER_THAN */ , ">=" /* Operator.GREATER_THAN_OR_EQUAL */ , "!=" /* Operator.NOT_EQUAL */ , "not-in" /* Operator.NOT_IN */ ].indexOf(this.op) >= 0;
    }
    getFlattenedFilters() {
        return [ this ];
    }
    getFilters() {
        return [ this ];
    }
}

class CompositeFilter extends Filter {
    constructor(e, t) {
        super(), this.filters = e, this.op = t, this.ue = null;
    }
    /**
     * Creates a filter based on the provided arguments.
     */    static create(e, t) {
        return new CompositeFilter(e, t);
    }
    matches(e) {
        return __PRIVATE_compositeFilterIsConjunction(this) ? void 0 === this.filters.find((t => !t.matches(e))) : void 0 !== this.filters.find((t => t.matches(e)));
    }
    getFlattenedFilters() {
        return null !== this.ue || (this.ue = this.filters.reduce(((e, t) => e.concat(t.getFlattenedFilters())), [])), 
        this.ue;
    }
    // Returns a mutable copy of `this.filters`
    getFilters() {
        return Object.assign([], this.filters);
    }
}

function __PRIVATE_compositeFilterIsConjunction(e) {
    return "and" /* CompositeOperator.AND */ === e.op;
}

/**
 * Returns true if this filter is a conjunction of field filters only. Returns false otherwise.
 */ function __PRIVATE_compositeFilterIsFlatConjunction(e) {
    return __PRIVATE_compositeFilterIsFlat(e) && __PRIVATE_compositeFilterIsConjunction(e);
}

/**
 * Returns true if this filter does not contain any composite filters. Returns false otherwise.
 */ function __PRIVATE_compositeFilterIsFlat(e) {
    for (const t of e.filters) if (t instanceof CompositeFilter) return !1;
    return !0;
}

function __PRIVATE_canonifyFilter(e) {
    if (e instanceof FieldFilter) 
    // TODO(b/29183165): Technically, this won't be unique if two values have
    // the same description, such as the int 3 and the string "3". So we should
    // add the types in here somehow, too.
    return e.field.canonicalString() + e.op.toString() + canonicalId(e.value);
    if (__PRIVATE_compositeFilterIsFlatConjunction(e)) 
    // Older SDK versions use an implicit AND operation between their filters.
    // In the new SDK versions, the developer may use an explicit AND filter.
    // To stay consistent with the old usages, we add a special case to ensure
    // the canonical ID for these two are the same. For example:
    // `col.whereEquals("a", 1).whereEquals("b", 2)` should have the same
    // canonical ID as `col.where(and(equals("a",1), equals("b",2)))`.
    return e.filters.map((e => __PRIVATE_canonifyFilter(e))).join(",");
    {
        // filter instanceof CompositeFilter
        const t = e.filters.map((e => __PRIVATE_canonifyFilter(e))).join(",");
        return `${e.op}(${t})`;
    }
}

function __PRIVATE_filterEquals(e, t) {
    return e instanceof FieldFilter ? function __PRIVATE_fieldFilterEquals(e, t) {
        return t instanceof FieldFilter && e.op === t.op && e.field.isEqual(t.field) && __PRIVATE_valueEquals(e.value, t.value);
    }(e, t) : e instanceof CompositeFilter ? function __PRIVATE_compositeFilterEquals(e, t) {
        if (t instanceof CompositeFilter && e.op === t.op && e.filters.length === t.filters.length) {
            return e.filters.reduce(((e, n, r) => e && __PRIVATE_filterEquals(n, t.filters[r])), !0);
        }
        return !1;
    }
    /**
 * Returns a new composite filter that contains all filter from
 * `compositeFilter` plus all the given filters in `otherFilters`.
 */ (e, t) : void fail();
}

/** Returns a debug description for `filter`. */ function __PRIVATE_stringifyFilter(e) {
    return e instanceof FieldFilter ? function __PRIVATE_stringifyFieldFilter(e) {
        return `${e.field.canonicalString()} ${e.op} ${canonicalId(e.value)}`;
    }
    /** Filter that matches on key fields (i.e. '__name__'). */ (e) : e instanceof CompositeFilter ? function __PRIVATE_stringifyCompositeFilter(e) {
        return e.op.toString() + " {" + e.getFilters().map(__PRIVATE_stringifyFilter).join(" ,") + "}";
    }(e) : "Filter";
}

class __PRIVATE_KeyFieldFilter extends FieldFilter {
    constructor(e, t, n) {
        super(e, t, n), this.key = DocumentKey.fromName(n.referenceValue);
    }
    matches(e) {
        const t = DocumentKey.comparator(e.key, this.key);
        return this.matchesComparison(t);
    }
}

/** Filter that matches on key fields within an array. */ class __PRIVATE_KeyFieldInFilter extends FieldFilter {
    constructor(e, t) {
        super(e, "in" /* Operator.IN */ , t), this.keys = __PRIVATE_extractDocumentKeysFromArrayValue("in" /* Operator.IN */ , t);
    }
    matches(e) {
        return this.keys.some((t => t.isEqual(e.key)));
    }
}

/** Filter that matches on key fields not present within an array. */ class __PRIVATE_KeyFieldNotInFilter extends FieldFilter {
    constructor(e, t) {
        super(e, "not-in" /* Operator.NOT_IN */ , t), this.keys = __PRIVATE_extractDocumentKeysFromArrayValue("not-in" /* Operator.NOT_IN */ , t);
    }
    matches(e) {
        return !this.keys.some((t => t.isEqual(e.key)));
    }
}

function __PRIVATE_extractDocumentKeysFromArrayValue(e, t) {
    var n;
    return ((null === (n = t.arrayValue) || void 0 === n ? void 0 : n.values) || []).map((e => DocumentKey.fromName(e.referenceValue)));
}

/** A Filter that implements the array-contains operator. */ class __PRIVATE_ArrayContainsFilter extends FieldFilter {
    constructor(e, t) {
        super(e, "array-contains" /* Operator.ARRAY_CONTAINS */ , t);
    }
    matches(e) {
        const t = e.data.field(this.field);
        return isArray(t) && __PRIVATE_arrayValueContains(t.arrayValue, this.value);
    }
}

/** A Filter that implements the IN operator. */ class __PRIVATE_InFilter extends FieldFilter {
    constructor(e, t) {
        super(e, "in" /* Operator.IN */ , t);
    }
    matches(e) {
        const t = e.data.field(this.field);
        return null !== t && __PRIVATE_arrayValueContains(this.value.arrayValue, t);
    }
}

/** A Filter that implements the not-in operator. */ class __PRIVATE_NotInFilter extends FieldFilter {
    constructor(e, t) {
        super(e, "not-in" /* Operator.NOT_IN */ , t);
    }
    matches(e) {
        if (__PRIVATE_arrayValueContains(this.value.arrayValue, {
            nullValue: "NULL_VALUE"
        })) return !1;
        const t = e.data.field(this.field);
        return null !== t && !__PRIVATE_arrayValueContains(this.value.arrayValue, t);
    }
}

/** A Filter that implements the array-contains-any operator. */ class __PRIVATE_ArrayContainsAnyFilter extends FieldFilter {
    constructor(e, t) {
        super(e, "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ , t);
    }
    matches(e) {
        const t = e.data.field(this.field);
        return !(!isArray(t) || !t.arrayValue.values) && t.arrayValue.values.some((e => __PRIVATE_arrayValueContains(this.value.arrayValue, e)));
    }
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Visible for testing
class __PRIVATE_TargetImpl {
    constructor(e, t = null, n = [], r = [], i = null, s = null, o = null) {
        this.path = e, this.collectionGroup = t, this.orderBy = n, this.filters = r, this.limit = i, 
        this.startAt = s, this.endAt = o, this.ce = null;
    }
}

/**
 * Initializes a Target with a path and optional additional query constraints.
 * Path must currently be empty if this is a collection group query.
 *
 * NOTE: you should always construct `Target` from `Query.toTarget` instead of
 * using this factory method, because `Query` provides an implicit `orderBy`
 * property.
 */ function __PRIVATE_newTarget(e, t = null, n = [], r = [], i = null, s = null, o = null) {
    return new __PRIVATE_TargetImpl(e, t, n, r, i, s, o);
}

function __PRIVATE_canonifyTarget(e) {
    const t = __PRIVATE_debugCast(e);
    if (null === t.ce) {
        let e = t.path.canonicalString();
        null !== t.collectionGroup && (e += "|cg:" + t.collectionGroup), e += "|f:", e += t.filters.map((e => __PRIVATE_canonifyFilter(e))).join(","), 
        e += "|ob:", e += t.orderBy.map((e => function __PRIVATE_canonifyOrderBy(e) {
            // TODO(b/29183165): Make this collision robust.
            return e.field.canonicalString() + e.dir;
        }(e))).join(","), __PRIVATE_isNullOrUndefined(t.limit) || (e += "|l:", e += t.limit), 
        t.startAt && (e += "|lb:", e += t.startAt.inclusive ? "b:" : "a:", e += t.startAt.position.map((e => canonicalId(e))).join(",")), 
        t.endAt && (e += "|ub:", e += t.endAt.inclusive ? "a:" : "b:", e += t.endAt.position.map((e => canonicalId(e))).join(",")), 
        t.ce = e;
    }
    return t.ce;
}

function __PRIVATE_targetEquals(e, t) {
    if (e.limit !== t.limit) return !1;
    if (e.orderBy.length !== t.orderBy.length) return !1;
    for (let n = 0; n < e.orderBy.length; n++) if (!__PRIVATE_orderByEquals(e.orderBy[n], t.orderBy[n])) return !1;
    if (e.filters.length !== t.filters.length) return !1;
    for (let n = 0; n < e.filters.length; n++) if (!__PRIVATE_filterEquals(e.filters[n], t.filters[n])) return !1;
    return e.collectionGroup === t.collectionGroup && (!!e.path.isEqual(t.path) && (!!__PRIVATE_boundEquals(e.startAt, t.startAt) && __PRIVATE_boundEquals(e.endAt, t.endAt)));
}

function __PRIVATE_targetIsDocumentTarget(e) {
    return DocumentKey.isDocumentKey(e.path) && null === e.collectionGroup && 0 === e.filters.length;
}

/** Returns the number of segments of a perfect index for this target. */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Query encapsulates all the query attributes we support in the SDK. It can
 * be run against the LocalStore, as well as be converted to a `Target` to
 * query the RemoteStore results.
 *
 * Visible for testing.
 */
class __PRIVATE_QueryImpl {
    /**
     * Initializes a Query with a path and optional additional query constraints.
     * Path must currently be empty if this is a collection group query.
     */
    constructor(e, t = null, n = [], r = [], i = null, s = "F" /* LimitType.First */ , o = null, _ = null) {
        this.path = e, this.collectionGroup = t, this.explicitOrderBy = n, this.filters = r, 
        this.limit = i, this.limitType = s, this.startAt = o, this.endAt = _, this.le = null, 
        // The corresponding `Target` of this `Query` instance, for use with
        // non-aggregate queries.
        this.he = null, 
        // The corresponding `Target` of this `Query` instance, for use with
        // aggregate queries. Unlike targets for non-aggregate queries,
        // aggregate query targets do not contain normalized order-bys, they only
        // contain explicit order-bys.
        this.Pe = null, this.startAt, this.endAt;
    }
}

/** Creates a new Query instance with the options provided. */ function __PRIVATE_newQuery(e, t, n, r, i, s, o, _) {
    return new __PRIVATE_QueryImpl(e, t, n, r, i, s, o, _);
}

/** Creates a new Query for a query that matches all documents at `path` */ function __PRIVATE_newQueryForPath(e) {
    return new __PRIVATE_QueryImpl(e);
}

/**
 * Helper to convert a collection group query into a collection query at a
 * specific path. This is used when executing collection group queries, since
 * we have to split the query into a set of collection queries at multiple
 * paths.
 */
/**
 * Returns true if this query does not specify any query constraints that
 * could remove results.
 */
function __PRIVATE_queryMatchesAllDocuments(e) {
    return 0 === e.filters.length && null === e.limit && null == e.startAt && null == e.endAt && (0 === e.explicitOrderBy.length || 1 === e.explicitOrderBy.length && e.explicitOrderBy[0].field.isKeyField());
}

// Returns the sorted set of inequality filter fields used in this query.
/**
 * Returns whether the query matches a collection group rather than a specific
 * collection.
 */
function __PRIVATE_isCollectionGroupQuery(e) {
    return null !== e.collectionGroup;
}

/**
 * Returns the normalized order-by constraint that is used to execute the Query,
 * which can be different from the order-by constraints the user provided (e.g.
 * the SDK and backend always orders by `__name__`). The normalized order-by
 * includes implicit order-bys in addition to the explicit user provided
 * order-bys.
 */ function __PRIVATE_queryNormalizedOrderBy(e) {
    const t = __PRIVATE_debugCast(e);
    if (null === t.le) {
        t.le = [];
        const e = new Set;
        // Any explicit order by fields should be added as is.
                for (const n of t.explicitOrderBy) t.le.push(n), e.add(n.field.canonicalString());
        // The order of the implicit ordering always matches the last explicit order by.
                const n = t.explicitOrderBy.length > 0 ? t.explicitOrderBy[t.explicitOrderBy.length - 1].dir : "asc" /* Direction.ASCENDING */ , r = function __PRIVATE_getInequalityFilterFields(e) {
            let t = new SortedSet(FieldPath$1.comparator);
            return e.filters.forEach((e => {
                e.getFlattenedFilters().forEach((e => {
                    e.isInequality() && (t = t.add(e.field));
                }));
            })), t;
        }
        /**
 * Creates a new Query for a collection group query that matches all documents
 * within the provided collection group.
 */ (t);
        // Any inequality fields not explicitly ordered should be implicitly ordered in a lexicographical
        // order. When there are multiple inequality filters on the same field, the field should be added
        // only once.
        // Note: `SortedSet<FieldPath>` sorts the key field before other fields. However, we want the key
        // field to be sorted last.
                r.forEach((r => {
            e.has(r.canonicalString()) || r.isKeyField() || t.le.push(new OrderBy(r, n));
        })), 
        // Add the document key field to the last if it is not explicitly ordered.
        e.has(FieldPath$1.keyField().canonicalString()) || t.le.push(new OrderBy(FieldPath$1.keyField(), n));
    }
    return t.le;
}

/**
 * Converts this `Query` instance to its corresponding `Target` representation.
 */ function __PRIVATE_queryToTarget(e) {
    const t = __PRIVATE_debugCast(e);
    return t.he || (t.he = __PRIVATE__queryToTarget(t, __PRIVATE_queryNormalizedOrderBy(e))), 
    t.he;
}

/**
 * Converts this `Query` instance to its corresponding `Target` representation,
 * for use within an aggregate query. Unlike targets for non-aggregate queries,
 * aggregate query targets do not contain normalized order-bys, they only
 * contain explicit order-bys.
 */ function __PRIVATE__queryToTarget(e, t) {
    if ("F" /* LimitType.First */ === e.limitType) return __PRIVATE_newTarget(e.path, e.collectionGroup, t, e.filters, e.limit, e.startAt, e.endAt);
    {
        // Flip the orderBy directions since we want the last results
        t = t.map((e => {
            const t = "desc" /* Direction.DESCENDING */ === e.dir ? "asc" /* Direction.ASCENDING */ : "desc" /* Direction.DESCENDING */;
            return new OrderBy(e.field, t);
        }));
        // We need to swap the cursors to match the now-flipped query ordering.
        const n = e.endAt ? new Bound(e.endAt.position, e.endAt.inclusive) : null, r = e.startAt ? new Bound(e.startAt.position, e.startAt.inclusive) : null;
        // Now return as a LimitType.First query.
        return __PRIVATE_newTarget(e.path, e.collectionGroup, t, e.filters, e.limit, n, r);
    }
}

function __PRIVATE_queryWithLimit(e, t, n) {
    return new __PRIVATE_QueryImpl(e.path, e.collectionGroup, e.explicitOrderBy.slice(), e.filters.slice(), t, n, e.startAt, e.endAt);
}

function __PRIVATE_queryEquals(e, t) {
    return __PRIVATE_targetEquals(__PRIVATE_queryToTarget(e), __PRIVATE_queryToTarget(t)) && e.limitType === t.limitType;
}

// TODO(b/29183165): This is used to get a unique string from a query to, for
// example, use as a dictionary key, but the implementation is subject to
// collisions. Make it collision-free.
function __PRIVATE_canonifyQuery(e) {
    return `${__PRIVATE_canonifyTarget(__PRIVATE_queryToTarget(e))}|lt:${e.limitType}`;
}

function __PRIVATE_stringifyQuery(e) {
    return `Query(target=${function __PRIVATE_stringifyTarget(e) {
        let t = e.path.canonicalString();
        return null !== e.collectionGroup && (t += " collectionGroup=" + e.collectionGroup), 
        e.filters.length > 0 && (t += `, filters: [${e.filters.map((e => __PRIVATE_stringifyFilter(e))).join(", ")}]`), 
        __PRIVATE_isNullOrUndefined(e.limit) || (t += ", limit: " + e.limit), e.orderBy.length > 0 && (t += `, orderBy: [${e.orderBy.map((e => function __PRIVATE_stringifyOrderBy(e) {
            return `${e.field.canonicalString()} (${e.dir})`;
        }(e))).join(", ")}]`), e.startAt && (t += ", startAt: ", t += e.startAt.inclusive ? "b:" : "a:", 
        t += e.startAt.position.map((e => canonicalId(e))).join(",")), e.endAt && (t += ", endAt: ", 
        t += e.endAt.inclusive ? "a:" : "b:", t += e.endAt.position.map((e => canonicalId(e))).join(",")), 
        `Target(${t})`;
    }(__PRIVATE_queryToTarget(e))}; limitType=${e.limitType})`;
}

/** Returns whether `doc` matches the constraints of `query`. */ function __PRIVATE_queryMatches(e, t) {
    return t.isFoundDocument() && function __PRIVATE_queryMatchesPathAndCollectionGroup(e, t) {
        const n = t.key.path;
        return null !== e.collectionGroup ? t.key.hasCollectionId(e.collectionGroup) && e.path.isPrefixOf(n) : DocumentKey.isDocumentKey(e.path) ? e.path.isEqual(n) : e.path.isImmediateParentOf(n);
    }
    /**
 * A document must have a value for every ordering clause in order to show up
 * in the results.
 */ (e, t) && function __PRIVATE_queryMatchesOrderBy(e, t) {
        // We must use `queryNormalizedOrderBy()` to get the list of all orderBys (both implicit and explicit).
        // Note that for OR queries, orderBy applies to all disjunction terms and implicit orderBys must
        // be taken into account. For example, the query "a > 1 || b==1" has an implicit "orderBy a" due
        // to the inequality, and is evaluated as "a > 1 orderBy a || b==1 orderBy a".
        // A document with content of {b:1} matches the filters, but does not match the orderBy because
        // it's missing the field 'a'.
        for (const n of __PRIVATE_queryNormalizedOrderBy(e)) 
        // order-by key always matches
        if (!n.field.isKeyField() && null === t.data.field(n.field)) return !1;
        return !0;
    }(e, t) && function __PRIVATE_queryMatchesFilters(e, t) {
        for (const n of e.filters) if (!n.matches(t)) return !1;
        return !0;
    }
    /** Makes sure a document is within the bounds, if provided. */ (e, t) && function __PRIVATE_queryMatchesBounds(e, t) {
        if (e.startAt && !
        /**
 * Returns true if a document sorts before a bound using the provided sort
 * order.
 */
        function __PRIVATE_boundSortsBeforeDocument(e, t, n) {
            const r = __PRIVATE_boundCompareToDocument(e, t, n);
            return e.inclusive ? r <= 0 : r < 0;
        }(e.startAt, __PRIVATE_queryNormalizedOrderBy(e), t)) return !1;
        if (e.endAt && !function __PRIVATE_boundSortsAfterDocument(e, t, n) {
            const r = __PRIVATE_boundCompareToDocument(e, t, n);
            return e.inclusive ? r >= 0 : r > 0;
        }(e.endAt, __PRIVATE_queryNormalizedOrderBy(e), t)) return !1;
        return !0;
    }
    /**
 * Returns the collection group that this query targets.
 *
 * PORTING NOTE: This is only used in the Web SDK to facilitate multi-tab
 * synchronization for query results.
 */ (e, t);
}

function __PRIVATE_queryCollectionGroup(e) {
    return e.collectionGroup || (e.path.length % 2 == 1 ? e.path.lastSegment() : e.path.get(e.path.length - 2));
}

/**
 * Returns a new comparator function that can be used to compare two documents
 * based on the Query's ordering constraint.
 */ function __PRIVATE_newQueryComparator(e) {
    return (t, n) => {
        let r = !1;
        for (const i of __PRIVATE_queryNormalizedOrderBy(e)) {
            const e = __PRIVATE_compareDocs(i, t, n);
            if (0 !== e) return e;
            r = r || i.field.isKeyField();
        }
        return 0;
    };
}

function __PRIVATE_compareDocs(e, t, n) {
    const r = e.field.isKeyField() ? DocumentKey.comparator(t.key, n.key) : function __PRIVATE_compareDocumentsByField(e, t, n) {
        const r = t.data.field(e), i = n.data.field(e);
        return null !== r && null !== i ? __PRIVATE_valueCompare(r, i) : fail();
    }(e.field, t, n);
    switch (e.dir) {
      case "asc" /* Direction.ASCENDING */ :
        return r;

      case "desc" /* Direction.DESCENDING */ :
        return -1 * r;

      default:
        return fail();
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A map implementation that uses objects as keys. Objects must have an
 * associated equals function and must be immutable. Entries in the map are
 * stored together with the key being produced from the mapKeyFn. This map
 * automatically handles collisions of keys.
 */ class ObjectMap {
    constructor(e, t) {
        this.mapKeyFn = e, this.equalsFn = t, 
        /**
         * The inner map for a key/value pair. Due to the possibility of collisions we
         * keep a list of entries that we do a linear search through to find an actual
         * match. Note that collisions should be rare, so we still expect near
         * constant time lookups in practice.
         */
        this.inner = {}, 
        /** The number of entries stored in the map */
        this.innerSize = 0;
    }
    /** Get a value for this key, or undefined if it does not exist. */    get(e) {
        const t = this.mapKeyFn(e), n = this.inner[t];
        if (void 0 !== n) for (const [t, r] of n) if (this.equalsFn(t, e)) return r;
    }
    has(e) {
        return void 0 !== this.get(e);
    }
    /** Put this key and value in the map. */    set(e, t) {
        const n = this.mapKeyFn(e), r = this.inner[n];
        if (void 0 === r) return this.inner[n] = [ [ e, t ] ], void this.innerSize++;
        for (let n = 0; n < r.length; n++) if (this.equalsFn(r[n][0], e)) 
        // This is updating an existing entry and does not increase `innerSize`.
        return void (r[n] = [ e, t ]);
        r.push([ e, t ]), this.innerSize++;
    }
    /**
     * Remove this key from the map. Returns a boolean if anything was deleted.
     */    delete(e) {
        const t = this.mapKeyFn(e), n = this.inner[t];
        if (void 0 === n) return !1;
        for (let r = 0; r < n.length; r++) if (this.equalsFn(n[r][0], e)) return 1 === n.length ? delete this.inner[t] : n.splice(r, 1), 
        this.innerSize--, !0;
        return !1;
    }
    forEach(e) {
        forEach(this.inner, ((t, n) => {
            for (const [t, r] of n) e(t, r);
        }));
    }
    isEmpty() {
        return isEmpty(this.inner);
    }
    size() {
        return this.innerSize;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const re = new SortedMap(DocumentKey.comparator);

function __PRIVATE_mutableDocumentMap() {
    return re;
}

const ie = new SortedMap(DocumentKey.comparator);

function documentMap(...e) {
    let t = ie;
    for (const n of e) t = t.insert(n.key, n);
    return t;
}

function __PRIVATE_convertOverlayedDocumentMapToDocumentMap(e) {
    let t = ie;
    return e.forEach(((e, n) => t = t.insert(e, n.overlayedDocument))), t;
}

function __PRIVATE_newOverlayMap() {
    return __PRIVATE_newDocumentKeyMap();
}

function __PRIVATE_newMutationMap() {
    return __PRIVATE_newDocumentKeyMap();
}

function __PRIVATE_newDocumentKeyMap() {
    return new ObjectMap((e => e.toString()), ((e, t) => e.isEqual(t)));
}

const oe = new SortedSet(DocumentKey.comparator);

function __PRIVATE_documentKeySet(...e) {
    let t = oe;
    for (const n of e) t = t.add(n);
    return t;
}

const _e = new SortedSet(__PRIVATE_primitiveComparator);

function __PRIVATE_targetIdSet() {
    return _e;
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Returns an DoubleValue for `value` that is encoded based the serializer's
 * `useProto3Json` setting.
 */ function __PRIVATE_toDouble(e, t) {
    if (e.useProto3Json) {
        if (isNaN(t)) return {
            doubleValue: "NaN"
        };
        if (t === 1 / 0) return {
            doubleValue: "Infinity"
        };
        if (t === -1 / 0) return {
            doubleValue: "-Infinity"
        };
    }
    return {
        doubleValue: __PRIVATE_isNegativeZero(t) ? "-0" : t
    };
}

/**
 * Returns an IntegerValue for `value`.
 */ function __PRIVATE_toInteger(e) {
    return {
        integerValue: "" + e
    };
}

/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** Used to represent a field transform on a mutation. */ class TransformOperation {
    constructor() {
        // Make sure that the structural type of `TransformOperation` is unique.
        // See https://github.com/microsoft/TypeScript/issues/5451
        this._ = void 0;
    }
}

/**
 * Computes the local transform result against the provided `previousValue`,
 * optionally using the provided localWriteTime.
 */ function __PRIVATE_applyTransformOperationToLocalView(e, t, n) {
    return e instanceof __PRIVATE_ServerTimestampTransform ? function serverTimestamp$1(e, t) {
        const n = {
            fields: {
                __type__: {
                    stringValue: "server_timestamp"
                },
                __local_write_time__: {
                    timestampValue: {
                        seconds: e.seconds,
                        nanos: e.nanoseconds
                    }
                }
            }
        };
        // We should avoid storing deeply nested server timestamp map values
        // because we never use the intermediate "previous values".
        // For example:
        // previous: 42L, add: t1, result: t1 -> 42L
        // previous: t1,  add: t2, result: t2 -> 42L (NOT t2 -> t1 -> 42L)
        // previous: t2,  add: t3, result: t3 -> 42L (NOT t3 -> t2 -> t1 -> 42L)
        // `getPreviousValue` recursively traverses server timestamps to find the
        // least recent Value.
                return t && __PRIVATE_isServerTimestamp(t) && (t = __PRIVATE_getPreviousValue(t)), 
        t && (n.fields.__previous_value__ = t), {
            mapValue: n
        };
    }(n, t) : e instanceof __PRIVATE_ArrayUnionTransformOperation ? __PRIVATE_applyArrayUnionTransformOperation(e, t) : e instanceof __PRIVATE_ArrayRemoveTransformOperation ? __PRIVATE_applyArrayRemoveTransformOperation(e, t) : function __PRIVATE_applyNumericIncrementTransformOperationToLocalView(e, t) {
        // PORTING NOTE: Since JavaScript's integer arithmetic is limited to 53 bit
        // precision and resolves overflows by reducing precision, we do not
        // manually cap overflows at 2^63.
        const n = __PRIVATE_computeTransformOperationBaseValue(e, t), r = asNumber(n) + asNumber(e.Ie);
        return isInteger(n) && isInteger(e.Ie) ? __PRIVATE_toInteger(r) : __PRIVATE_toDouble(e.serializer, r);
    }(e, t);
}

/**
 * Computes a final transform result after the transform has been acknowledged
 * by the server, potentially using the server-provided transformResult.
 */ function __PRIVATE_applyTransformOperationToRemoteDocument(e, t, n) {
    // The server just sends null as the transform result for array operations,
    // so we have to calculate a result the same as we do for local
    // applications.
    return e instanceof __PRIVATE_ArrayUnionTransformOperation ? __PRIVATE_applyArrayUnionTransformOperation(e, t) : e instanceof __PRIVATE_ArrayRemoveTransformOperation ? __PRIVATE_applyArrayRemoveTransformOperation(e, t) : n;
}

/**
 * If this transform operation is not idempotent, returns the base value to
 * persist for this transform. If a base value is returned, the transform
 * operation is always applied to this base value, even if document has
 * already been updated.
 *
 * Base values provide consistent behavior for non-idempotent transforms and
 * allow us to return the same latency-compensated value even if the backend
 * has already applied the transform operation. The base value is null for
 * idempotent transforms, as they can be re-played even if the backend has
 * already applied them.
 *
 * @returns a base value to store along with the mutation, or null for
 * idempotent transforms.
 */ function __PRIVATE_computeTransformOperationBaseValue(e, t) {
    return e instanceof __PRIVATE_NumericIncrementTransformOperation ? 
    /** Returns true if `value` is either an IntegerValue or a DoubleValue. */
    function __PRIVATE_isNumber(e) {
        return isInteger(e) || function __PRIVATE_isDouble(e) {
            return !!e && "doubleValue" in e;
        }(e);
    }(t) ? t : {
        integerValue: 0
    } : null;
}

/** Transforms a value into a server-generated timestamp. */
class __PRIVATE_ServerTimestampTransform extends TransformOperation {}

/** Transforms an array value via a union operation. */ class __PRIVATE_ArrayUnionTransformOperation extends TransformOperation {
    constructor(e) {
        super(), this.elements = e;
    }
}

function __PRIVATE_applyArrayUnionTransformOperation(e, t) {
    const n = __PRIVATE_coercedFieldValuesArray(t);
    for (const t of e.elements) n.some((e => __PRIVATE_valueEquals(e, t))) || n.push(t);
    return {
        arrayValue: {
            values: n
        }
    };
}

/** Transforms an array value via a remove operation. */ class __PRIVATE_ArrayRemoveTransformOperation extends TransformOperation {
    constructor(e) {
        super(), this.elements = e;
    }
}

function __PRIVATE_applyArrayRemoveTransformOperation(e, t) {
    let n = __PRIVATE_coercedFieldValuesArray(t);
    for (const t of e.elements) n = n.filter((e => !__PRIVATE_valueEquals(e, t)));
    return {
        arrayValue: {
            values: n
        }
    };
}

/**
 * Implements the backend semantics for locally computed NUMERIC_ADD (increment)
 * transforms. Converts all field values to integers or doubles, but unlike the
 * backend does not cap integer values at 2^63. Instead, JavaScript number
 * arithmetic is used and precision loss can occur for values greater than 2^53.
 */ class __PRIVATE_NumericIncrementTransformOperation extends TransformOperation {
    constructor(e, t) {
        super(), this.serializer = e, this.Ie = t;
    }
}

function asNumber(e) {
    return __PRIVATE_normalizeNumber(e.integerValue || e.doubleValue);
}

function __PRIVATE_coercedFieldValuesArray(e) {
    return isArray(e) && e.arrayValue.values ? e.arrayValue.values.slice() : [];
}

function __PRIVATE_fieldTransformEquals(e, t) {
    return e.field.isEqual(t.field) && function __PRIVATE_transformOperationEquals(e, t) {
        return e instanceof __PRIVATE_ArrayUnionTransformOperation && t instanceof __PRIVATE_ArrayUnionTransformOperation || e instanceof __PRIVATE_ArrayRemoveTransformOperation && t instanceof __PRIVATE_ArrayRemoveTransformOperation ? __PRIVATE_arrayEquals(e.elements, t.elements, __PRIVATE_valueEquals) : e instanceof __PRIVATE_NumericIncrementTransformOperation && t instanceof __PRIVATE_NumericIncrementTransformOperation ? __PRIVATE_valueEquals(e.Ie, t.Ie) : e instanceof __PRIVATE_ServerTimestampTransform && t instanceof __PRIVATE_ServerTimestampTransform;
    }(e.transform, t.transform);
}

/**
 * Encodes a precondition for a mutation. This follows the model that the
 * backend accepts with the special case of an explicit "empty" precondition
 * (meaning no precondition).
 */ class Precondition {
    constructor(e, t) {
        this.updateTime = e, this.exists = t;
    }
    /** Creates a new empty Precondition. */    static none() {
        return new Precondition;
    }
    /** Creates a new Precondition with an exists flag. */    static exists(e) {
        return new Precondition(void 0, e);
    }
    /** Creates a new Precondition based on a version a document exists at. */    static updateTime(e) {
        return new Precondition(e);
    }
    /** Returns whether this Precondition is empty. */    get isNone() {
        return void 0 === this.updateTime && void 0 === this.exists;
    }
    isEqual(e) {
        return this.exists === e.exists && (this.updateTime ? !!e.updateTime && this.updateTime.isEqual(e.updateTime) : !e.updateTime);
    }
}

/** Returns true if the preconditions is valid for the given document. */ function __PRIVATE_preconditionIsValidForDocument(e, t) {
    return void 0 !== e.updateTime ? t.isFoundDocument() && t.version.isEqual(e.updateTime) : void 0 === e.exists || e.exists === t.isFoundDocument();
}

/**
 * A mutation describes a self-contained change to a document. Mutations can
 * create, replace, delete, and update subsets of documents.
 *
 * Mutations not only act on the value of the document but also its version.
 *
 * For local mutations (mutations that haven't been committed yet), we preserve
 * the existing version for Set and Patch mutations. For Delete mutations, we
 * reset the version to 0.
 *
 * Here's the expected transition table.
 *
 * MUTATION           APPLIED TO            RESULTS IN
 *
 * SetMutation        Document(v3)          Document(v3)
 * SetMutation        NoDocument(v3)        Document(v0)
 * SetMutation        InvalidDocument(v0)   Document(v0)
 * PatchMutation      Document(v3)          Document(v3)
 * PatchMutation      NoDocument(v3)        NoDocument(v3)
 * PatchMutation      InvalidDocument(v0)   UnknownDocument(v3)
 * DeleteMutation     Document(v3)          NoDocument(v0)
 * DeleteMutation     NoDocument(v3)        NoDocument(v0)
 * DeleteMutation     InvalidDocument(v0)   NoDocument(v0)
 *
 * For acknowledged mutations, we use the updateTime of the WriteResponse as
 * the resulting version for Set and Patch mutations. As deletes have no
 * explicit update time, we use the commitTime of the WriteResponse for
 * Delete mutations.
 *
 * If a mutation is acknowledged by the backend but fails the precondition check
 * locally, we transition to an `UnknownDocument` and rely on Watch to send us
 * the updated version.
 *
 * Field transforms are used only with Patch and Set Mutations. We use the
 * `updateTransforms` message to store transforms, rather than the `transforms`s
 * messages.
 *
 * ## Subclassing Notes
 *
 * Every type of mutation needs to implement its own applyToRemoteDocument() and
 * applyToLocalView() to implement the actual behavior of applying the mutation
 * to some source document (see `setMutationApplyToRemoteDocument()` for an
 * example).
 */ class Mutation {}

/**
 * A utility method to calculate a `Mutation` representing the overlay from the
 * final state of the document, and a `FieldMask` representing the fields that
 * are mutated by the local mutations.
 */ function __PRIVATE_calculateOverlayMutation(e, t) {
    if (!e.hasLocalMutations || t && 0 === t.fields.length) return null;
    // mask is null when sets or deletes are applied to the current document.
        if (null === t) return e.isNoDocument() ? new __PRIVATE_DeleteMutation(e.key, Precondition.none()) : new __PRIVATE_SetMutation(e.key, e.data, Precondition.none());
    {
        const n = e.data, r = ObjectValue.empty();
        let i = new SortedSet(FieldPath$1.comparator);
        for (let e of t.fields) if (!i.has(e)) {
            let t = n.field(e);
            // If we are deleting a nested field, we take the immediate parent as
            // the mask used to construct the resulting mutation.
            // Justification: Nested fields can create parent fields implicitly. If
            // only a leaf entry is deleted in later mutations, the parent field
            // should still remain, but we may have lost this information.
            // Consider mutation (foo.bar 1), then mutation (foo.bar delete()).
            // This leaves the final result (foo, {}). Despite the fact that `doc`
            // has the correct result, `foo` is not in `mask`, and the resulting
            // mutation would miss `foo`.
                        null === t && e.length > 1 && (e = e.popLast(), t = n.field(e)), null === t ? r.delete(e) : r.set(e, t), 
            i = i.add(e);
        }
        return new __PRIVATE_PatchMutation(e.key, r, new FieldMask(i.toArray()), Precondition.none());
    }
}

/**
 * Applies this mutation to the given document for the purposes of computing a
 * new remote document. If the input document doesn't match the expected state
 * (e.g. it is invalid or outdated), the document type may transition to
 * unknown.
 *
 * @param mutation - The mutation to apply.
 * @param document - The document to mutate. The input document can be an
 *     invalid document if the client has no knowledge of the pre-mutation state
 *     of the document.
 * @param mutationResult - The result of applying the mutation from the backend.
 */ function __PRIVATE_mutationApplyToRemoteDocument(e, t, n) {
    e instanceof __PRIVATE_SetMutation ? function __PRIVATE_setMutationApplyToRemoteDocument(e, t, n) {
        // Unlike setMutationApplyToLocalView, if we're applying a mutation to a
        // remote document the server has accepted the mutation so the precondition
        // must have held.
        const r = e.value.clone(), i = __PRIVATE_serverTransformResults(e.fieldTransforms, t, n.transformResults);
        r.setAll(i), t.convertToFoundDocument(n.version, r).setHasCommittedMutations();
    }(e, t, n) : e instanceof __PRIVATE_PatchMutation ? function __PRIVATE_patchMutationApplyToRemoteDocument(e, t, n) {
        if (!__PRIVATE_preconditionIsValidForDocument(e.precondition, t)) 
        // Since the mutation was not rejected, we know that the precondition
        // matched on the backend. We therefore must not have the expected version
        // of the document in our cache and convert to an UnknownDocument with a
        // known updateTime.
        return void t.convertToUnknownDocument(n.version);
        const r = __PRIVATE_serverTransformResults(e.fieldTransforms, t, n.transformResults), i = t.data;
        i.setAll(__PRIVATE_getPatch(e)), i.setAll(r), t.convertToFoundDocument(n.version, i).setHasCommittedMutations();
    }(e, t, n) : function __PRIVATE_deleteMutationApplyToRemoteDocument(e, t, n) {
        // Unlike applyToLocalView, if we're applying a mutation to a remote
        // document the server has accepted the mutation so the precondition must
        // have held.
        t.convertToNoDocument(n.version).setHasCommittedMutations();
    }(0, t, n);
}

/**
 * Applies this mutation to the given document for the purposes of computing
 * the new local view of a document. If the input document doesn't match the
 * expected state, the document is not modified.
 *
 * @param mutation - The mutation to apply.
 * @param document - The document to mutate. The input document can be an
 *     invalid document if the client has no knowledge of the pre-mutation state
 *     of the document.
 * @param previousMask - The fields that have been updated before applying this mutation.
 * @param localWriteTime - A timestamp indicating the local write time of the
 *     batch this mutation is a part of.
 * @returns A `FieldMask` representing the fields that are changed by applying this mutation.
 */ function __PRIVATE_mutationApplyToLocalView(e, t, n, r) {
    return e instanceof __PRIVATE_SetMutation ? function __PRIVATE_setMutationApplyToLocalView(e, t, n, r) {
        if (!__PRIVATE_preconditionIsValidForDocument(e.precondition, t)) 
        // The mutation failed to apply (e.g. a document ID created with add()
        // caused a name collision).
        return n;
        const i = e.value.clone(), s = __PRIVATE_localTransformResults(e.fieldTransforms, r, t);
        return i.setAll(s), t.convertToFoundDocument(t.version, i).setHasLocalMutations(), 
        null;
 // SetMutation overwrites all fields.
        }
    /**
 * A mutation that modifies fields of the document at the given key with the
 * given values. The values are applied through a field mask:
 *
 *  * When a field is in both the mask and the values, the corresponding field
 *    is updated.
 *  * When a field is in neither the mask nor the values, the corresponding
 *    field is unmodified.
 *  * When a field is in the mask but not in the values, the corresponding field
 *    is deleted.
 *  * When a field is not in the mask but is in the values, the values map is
 *    ignored.
 */ (e, t, n, r) : e instanceof __PRIVATE_PatchMutation ? function __PRIVATE_patchMutationApplyToLocalView(e, t, n, r) {
        if (!__PRIVATE_preconditionIsValidForDocument(e.precondition, t)) return n;
        const i = __PRIVATE_localTransformResults(e.fieldTransforms, r, t), s = t.data;
        if (s.setAll(__PRIVATE_getPatch(e)), s.setAll(i), t.convertToFoundDocument(t.version, s).setHasLocalMutations(), 
        null === n) return null;
        return n.unionWith(e.fieldMask.fields).unionWith(e.fieldTransforms.map((e => e.field)));
    }
    /**
 * Returns a FieldPath/Value map with the content of the PatchMutation.
 */ (e, t, n, r) : function __PRIVATE_deleteMutationApplyToLocalView(e, t, n) {
        if (__PRIVATE_preconditionIsValidForDocument(e.precondition, t)) return t.convertToNoDocument(t.version).setHasLocalMutations(), 
        null;
        return n;
    }
    /**
 * A mutation that verifies the existence of the document at the given key with
 * the provided precondition.
 *
 * The `verify` operation is only used in Transactions, and this class serves
 * primarily to facilitate serialization into protos.
 */ (e, t, n);
}

function __PRIVATE_mutationEquals(e, t) {
    return e.type === t.type && (!!e.key.isEqual(t.key) && (!!e.precondition.isEqual(t.precondition) && (!!function __PRIVATE_fieldTransformsAreEqual(e, t) {
        return void 0 === e && void 0 === t || !(!e || !t) && __PRIVATE_arrayEquals(e, t, ((e, t) => __PRIVATE_fieldTransformEquals(e, t)));
    }(e.fieldTransforms, t.fieldTransforms) && (0 /* MutationType.Set */ === e.type ? e.value.isEqual(t.value) : 1 /* MutationType.Patch */ !== e.type || e.data.isEqual(t.data) && e.fieldMask.isEqual(t.fieldMask)))));
}

/**
 * A mutation that creates or replaces the document at the given key with the
 * object value contents.
 */ class __PRIVATE_SetMutation extends Mutation {
    constructor(e, t, n, r = []) {
        super(), this.key = e, this.value = t, this.precondition = n, this.fieldTransforms = r, 
        this.type = 0 /* MutationType.Set */;
    }
    getFieldMask() {
        return null;
    }
}

class __PRIVATE_PatchMutation extends Mutation {
    constructor(e, t, n, r, i = []) {
        super(), this.key = e, this.data = t, this.fieldMask = n, this.precondition = r, 
        this.fieldTransforms = i, this.type = 1 /* MutationType.Patch */;
    }
    getFieldMask() {
        return this.fieldMask;
    }
}

function __PRIVATE_getPatch(e) {
    const t = new Map;
    return e.fieldMask.fields.forEach((n => {
        if (!n.isEmpty()) {
            const r = e.data.field(n);
            t.set(n, r);
        }
    })), t;
}

/**
 * Creates a list of "transform results" (a transform result is a field value
 * representing the result of applying a transform) for use after a mutation
 * containing transforms has been acknowledged by the server.
 *
 * @param fieldTransforms - The field transforms to apply the result to.
 * @param mutableDocument - The current state of the document after applying all
 * previous mutations.
 * @param serverTransformResults - The transform results received by the server.
 * @returns The transform results list.
 */ function __PRIVATE_serverTransformResults(e, t, n) {
    const r = new Map;
    __PRIVATE_hardAssert(e.length === n.length);
    for (let i = 0; i < n.length; i++) {
        const s = e[i], o = s.transform, _ = t.data.field(s.field);
        r.set(s.field, __PRIVATE_applyTransformOperationToRemoteDocument(o, _, n[i]));
    }
    return r;
}

/**
 * Creates a list of "transform results" (a transform result is a field value
 * representing the result of applying a transform) for use when applying a
 * transform locally.
 *
 * @param fieldTransforms - The field transforms to apply the result to.
 * @param localWriteTime - The local time of the mutation (used to
 *     generate ServerTimestampValues).
 * @param mutableDocument - The document to apply transforms on.
 * @returns The transform results list.
 */ function __PRIVATE_localTransformResults(e, t, n) {
    const r = new Map;
    for (const i of e) {
        const e = i.transform, s = n.data.field(i.field);
        r.set(i.field, __PRIVATE_applyTransformOperationToLocalView(e, s, t));
    }
    return r;
}

/** A mutation that deletes the document at the given key. */ class __PRIVATE_DeleteMutation extends Mutation {
    constructor(e, t) {
        super(), this.key = e, this.precondition = t, this.type = 2 /* MutationType.Delete */ , 
        this.fieldTransforms = [];
    }
    getFieldMask() {
        return null;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A batch of mutations that will be sent as one unit to the backend.
 */ class MutationBatch {
    /**
     * @param batchId - The unique ID of this mutation batch.
     * @param localWriteTime - The original write time of this mutation.
     * @param baseMutations - Mutations that are used to populate the base
     * values when this mutation is applied locally. This can be used to locally
     * overwrite values that are persisted in the remote document cache. Base
     * mutations are never sent to the backend.
     * @param mutations - The user-provided mutations in this mutation batch.
     * User-provided mutations are applied both locally and remotely on the
     * backend.
     */
    constructor(e, t, n, r) {
        this.batchId = e, this.localWriteTime = t, this.baseMutations = n, this.mutations = r;
    }
    /**
     * Applies all the mutations in this MutationBatch to the specified document
     * to compute the state of the remote document
     *
     * @param document - The document to apply mutations to.
     * @param batchResult - The result of applying the MutationBatch to the
     * backend.
     */    applyToRemoteDocument(e, t) {
        const n = t.mutationResults;
        for (let t = 0; t < this.mutations.length; t++) {
            const r = this.mutations[t];
            if (r.key.isEqual(e.key)) {
                __PRIVATE_mutationApplyToRemoteDocument(r, e, n[t]);
            }
        }
    }
    /**
     * Computes the local view of a document given all the mutations in this
     * batch.
     *
     * @param document - The document to apply mutations to.
     * @param mutatedFields - Fields that have been updated before applying this mutation batch.
     * @returns A `FieldMask` representing all the fields that are mutated.
     */    applyToLocalView(e, t) {
        // First, apply the base state. This allows us to apply non-idempotent
        // transform against a consistent set of values.
        for (const n of this.baseMutations) n.key.isEqual(e.key) && (t = __PRIVATE_mutationApplyToLocalView(n, e, t, this.localWriteTime));
        // Second, apply all user-provided mutations.
                for (const n of this.mutations) n.key.isEqual(e.key) && (t = __PRIVATE_mutationApplyToLocalView(n, e, t, this.localWriteTime));
        return t;
    }
    /**
     * Computes the local view for all provided documents given the mutations in
     * this batch. Returns a `DocumentKey` to `Mutation` map which can be used to
     * replace all the mutation applications.
     */    applyToLocalDocumentSet(e, t) {
        // TODO(mrschmidt): This implementation is O(n^2). If we apply the mutations
        // directly (as done in `applyToLocalView()`), we can reduce the complexity
        // to O(n).
        const n = __PRIVATE_newMutationMap();
        return this.mutations.forEach((r => {
            const i = e.get(r.key), s = i.overlayedDocument;
            // TODO(mutabledocuments): This method should take a MutableDocumentMap
            // and we should remove this cast.
                        let o = this.applyToLocalView(s, i.mutatedFields);
            // Set mutatedFields to null if the document is only from local mutations.
            // This creates a Set or Delete mutation, instead of trying to create a
            // patch mutation as the overlay.
                        o = t.has(r.key) ? null : o;
            const _ = __PRIVATE_calculateOverlayMutation(s, o);
            null !== _ && n.set(r.key, _), s.isValidDocument() || s.convertToNoDocument(SnapshotVersion.min());
        })), n;
    }
    keys() {
        return this.mutations.reduce(((e, t) => e.add(t.key)), __PRIVATE_documentKeySet());
    }
    isEqual(e) {
        return this.batchId === e.batchId && __PRIVATE_arrayEquals(this.mutations, e.mutations, ((e, t) => __PRIVATE_mutationEquals(e, t))) && __PRIVATE_arrayEquals(this.baseMutations, e.baseMutations, ((e, t) => __PRIVATE_mutationEquals(e, t)));
    }
}

/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Representation of an overlay computed by Firestore.
 *
 * Holds information about a mutation and the largest batch id in Firestore when
 * the mutation was created.
 */ class Overlay {
    constructor(e, t) {
        this.largestBatchId = e, this.mutation = t;
    }
    getKey() {
        return this.mutation.key;
    }
    isEqual(e) {
        return null !== e && this.mutation === e.mutation;
    }
    toString() {
        return `Overlay{\n      largestBatchId: ${this.largestBatchId},\n      mutation: ${this.mutation.toString()}\n    }`;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class ExistenceFilter {
    constructor(e, t) {
        this.count = e, this.unchangedNames = t;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Error Codes describing the different ways GRPC can fail. These are copied
 * directly from GRPC's sources here:
 *
 * https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
 *
 * Important! The names of these identifiers matter because the string forms
 * are used for reverse lookups from the webchannel stream. Do NOT change the
 * names of these identifiers or change this into a const enum.
 */ var ae, ue;

/**
 * Determines whether an error code represents a permanent error when received
 * in response to a write operation.
 *
 * Write operations must be handled specially because as of b/119437764, ABORTED
 * errors on the write stream should be retried too (even though ABORTED errors
 * are not generally retryable).
 *
 * Note that during the initial handshake on the write stream an ABORTED error
 * signals that we should discard our stream token (i.e. it is permanent). This
 * means a handshake error should be classified with isPermanentError, above.
 */
/**
 * Maps an error Code from GRPC status code number, like 0, 1, or 14. These
 * are not the same as HTTP status codes.
 *
 * @returns The Code equivalent to the given GRPC status code. Fails if there
 *     is no match.
 */
function __PRIVATE_mapCodeFromRpcCode(e) {
    if (void 0 === e) 
    // This shouldn't normally happen, but in certain error cases (like trying
    // to send invalid proto messages) we may get an error with no GRPC code.
    return __PRIVATE_logError("GRPC error has no .code"), D.UNKNOWN;
    switch (e) {
      case ae.OK:
        return D.OK;

      case ae.CANCELLED:
        return D.CANCELLED;

      case ae.UNKNOWN:
        return D.UNKNOWN;

      case ae.DEADLINE_EXCEEDED:
        return D.DEADLINE_EXCEEDED;

      case ae.RESOURCE_EXHAUSTED:
        return D.RESOURCE_EXHAUSTED;

      case ae.INTERNAL:
        return D.INTERNAL;

      case ae.UNAVAILABLE:
        return D.UNAVAILABLE;

      case ae.UNAUTHENTICATED:
        return D.UNAUTHENTICATED;

      case ae.INVALID_ARGUMENT:
        return D.INVALID_ARGUMENT;

      case ae.NOT_FOUND:
        return D.NOT_FOUND;

      case ae.ALREADY_EXISTS:
        return D.ALREADY_EXISTS;

      case ae.PERMISSION_DENIED:
        return D.PERMISSION_DENIED;

      case ae.FAILED_PRECONDITION:
        return D.FAILED_PRECONDITION;

      case ae.ABORTED:
        return D.ABORTED;

      case ae.OUT_OF_RANGE:
        return D.OUT_OF_RANGE;

      case ae.UNIMPLEMENTED:
        return D.UNIMPLEMENTED;

      case ae.DATA_LOSS:
        return D.DATA_LOSS;

      default:
        return fail();
    }
}

/**
 * Converts an HTTP response's error status to the equivalent error code.
 *
 * @param status - An HTTP error response status ("FAILED_PRECONDITION",
 * "UNKNOWN", etc.)
 * @returns The equivalent Code. Non-matching responses are mapped to
 *     Code.UNKNOWN.
 */ (ue = ae || (ae = {}))[ue.OK = 0] = "OK", ue[ue.CANCELLED = 1] = "CANCELLED", 
ue[ue.UNKNOWN = 2] = "UNKNOWN", ue[ue.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", 
ue[ue.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", ue[ue.NOT_FOUND = 5] = "NOT_FOUND", 
ue[ue.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", ue[ue.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", 
ue[ue.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", ue[ue.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", 
ue[ue.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", ue[ue.ABORTED = 10] = "ABORTED", 
ue[ue.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", ue[ue.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", 
ue[ue.INTERNAL = 13] = "INTERNAL", ue[ue.UNAVAILABLE = 14] = "UNAVAILABLE", ue[ue.DATA_LOSS = 15] = "DATA_LOSS";

/**
 * Sets the value of the `testingHooksSpi` object.
 * @param instance the instance to set.
 */
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * An instance of the Platform's 'TextEncoder' implementation.
 */
function __PRIVATE_newTextEncoder() {
    return new TextEncoder;
}

/**
 * An instance of the Platform's 'TextDecoder' implementation.
 */
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const le = new Integer([ 4294967295, 4294967295 ], 0);

// Hash a string using md5 hashing algorithm.
function __PRIVATE_getMd5HashValue(e) {
    const t = __PRIVATE_newTextEncoder().encode(e), n = new Md5;
    return n.update(t), new Uint8Array(n.digest());
}

// Interpret the 16 bytes array as two 64-bit unsigned integers, encoded using
// 2’s complement using little endian.
function __PRIVATE_get64BitUints(e) {
    const t = new DataView(e.buffer), n = t.getUint32(0, /* littleEndian= */ !0), r = t.getUint32(4, /* littleEndian= */ !0), i = t.getUint32(8, /* littleEndian= */ !0), s = t.getUint32(12, /* littleEndian= */ !0);
    return [ new Integer([ n, r ], 0), new Integer([ i, s ], 0) ];
}

class BloomFilter {
    constructor(e, t, n) {
        if (this.bitmap = e, this.padding = t, this.hashCount = n, t < 0 || t >= 8) throw new __PRIVATE_BloomFilterError(`Invalid padding: ${t}`);
        if (n < 0) throw new __PRIVATE_BloomFilterError(`Invalid hash count: ${n}`);
        if (e.length > 0 && 0 === this.hashCount) 
        // Only empty bloom filter can have 0 hash count.
        throw new __PRIVATE_BloomFilterError(`Invalid hash count: ${n}`);
        if (0 === e.length && 0 !== t) 
        // Empty bloom filter should have 0 padding.
        throw new __PRIVATE_BloomFilterError(`Invalid padding when bitmap length is 0: ${t}`);
        this.Te = 8 * e.length - t, 
        // Set the bit count in Integer to avoid repetition in mightContain().
        this.Ee = Integer.fromNumber(this.Te);
    }
    // Calculate the ith hash value based on the hashed 64bit integers,
    // and calculate its corresponding bit index in the bitmap to be checked.
    de(e, t, n) {
        // Calculate hashed value h(i) = h1 + (i * h2).
        let r = e.add(t.multiply(Integer.fromNumber(n)));
        // Wrap if hash value overflow 64bit.
                return 1 === r.compare(le) && (r = new Integer([ r.getBits(0), r.getBits(1) ], 0)), 
        r.modulo(this.Ee).toNumber();
    }
    // Return whether the bit on the given index in the bitmap is set to 1.
    Ae(e) {
        return 0 != (this.bitmap[Math.floor(e / 8)] & 1 << e % 8);
    }
    mightContain(e) {
        // Empty bitmap should always return false on membership check.
        if (0 === this.Te) return !1;
        const t = __PRIVATE_getMd5HashValue(e), [n, r] = __PRIVATE_get64BitUints(t);
        for (let e = 0; e < this.hashCount; e++) {
            const t = this.de(n, r, e);
            if (!this.Ae(t)) return !1;
        }
        return !0;
    }
    /** Create bloom filter for testing purposes only. */    static create(e, t, n) {
        const r = e % 8 == 0 ? 0 : 8 - e % 8, i = new Uint8Array(Math.ceil(e / 8)), s = new BloomFilter(i, r, t);
        return n.forEach((e => s.insert(e))), s;
    }
    insert(e) {
        if (0 === this.Te) return;
        const t = __PRIVATE_getMd5HashValue(e), [n, r] = __PRIVATE_get64BitUints(t);
        for (let e = 0; e < this.hashCount; e++) {
            const t = this.de(n, r, e);
            this.Re(t);
        }
    }
    Re(e) {
        const t = Math.floor(e / 8), n = e % 8;
        this.bitmap[t] |= 1 << n;
    }
}

class __PRIVATE_BloomFilterError extends Error {
    constructor() {
        super(...arguments), this.name = "BloomFilterError";
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * An event from the RemoteStore. It is split into targetChanges (changes to the
 * state or the set of documents in our watched targets) and documentUpdates
 * (changes to the actual documents).
 */ class RemoteEvent {
    constructor(
    /**
     * The snapshot version this event brings us up to, or MIN if not set.
     */
    e, 
    /**
     * A map from target to changes to the target. See TargetChange.
     */
    t, 
    /**
     * A map of targets that is known to be inconsistent, and the purpose for
     * re-listening. Listens for these targets should be re-established without
     * resume tokens.
     */
    n, 
    /**
     * A set of which documents have changed or been deleted, along with the
     * doc's new values (if not deleted).
     */
    r, 
    /**
     * A set of which document updates are due only to limbo resolution targets.
     */
    i) {
        this.snapshotVersion = e, this.targetChanges = t, this.targetMismatches = n, this.documentUpdates = r, 
        this.resolvedLimboDocuments = i;
    }
    /**
     * HACK: Views require RemoteEvents in order to determine whether the view is
     * CURRENT, but secondary tabs don't receive remote events. So this method is
     * used to create a synthesized RemoteEvent that can be used to apply a
     * CURRENT status change to a View, for queries executed in a different tab.
     */
    // PORTING NOTE: Multi-tab only
    static createSynthesizedRemoteEventForCurrentChange(e, t, n) {
        const r = new Map;
        return r.set(e, TargetChange.createSynthesizedTargetChangeForCurrentChange(e, t, n)), 
        new RemoteEvent(SnapshotVersion.min(), r, new SortedMap(__PRIVATE_primitiveComparator), __PRIVATE_mutableDocumentMap(), __PRIVATE_documentKeySet());
    }
}

/**
 * A TargetChange specifies the set of changes for a specific target as part of
 * a RemoteEvent. These changes track which documents are added, modified or
 * removed, as well as the target's resume token and whether the target is
 * marked CURRENT.
 * The actual changes *to* documents are not part of the TargetChange since
 * documents may be part of multiple targets.
 */ class TargetChange {
    constructor(
    /**
     * An opaque, server-assigned token that allows watching a query to be resumed
     * after disconnecting without retransmitting all the data that matches the
     * query. The resume token essentially identifies a point in time from which
     * the server should resume sending results.
     */
    e, 
    /**
     * The "current" (synced) status of this target. Note that "current"
     * has special meaning in the RPC protocol that implies that a target is
     * both up-to-date and consistent with the rest of the watch stream.
     */
    t, 
    /**
     * The set of documents that were newly assigned to this target as part of
     * this remote event.
     */
    n, 
    /**
     * The set of documents that were already assigned to this target but received
     * an update during this remote event.
     */
    r, 
    /**
     * The set of documents that were removed from this target as part of this
     * remote event.
     */
    i) {
        this.resumeToken = e, this.current = t, this.addedDocuments = n, this.modifiedDocuments = r, 
        this.removedDocuments = i;
    }
    /**
     * This method is used to create a synthesized TargetChanges that can be used to
     * apply a CURRENT status change to a View (for queries executed in a different
     * tab) or for new queries (to raise snapshots with correct CURRENT status).
     */    static createSynthesizedTargetChangeForCurrentChange(e, t, n) {
        return new TargetChange(n, t, __PRIVATE_documentKeySet(), __PRIVATE_documentKeySet(), __PRIVATE_documentKeySet());
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Represents a changed document and a list of target ids to which this change
 * applies.
 *
 * If document has been deleted NoDocument will be provided.
 */ class __PRIVATE_DocumentWatchChange {
    constructor(
    /** The new document applies to all of these targets. */
    e, 
    /** The new document is removed from all of these targets. */
    t, 
    /** The key of the document for this change. */
    n, 
    /**
     * The new document or NoDocument if it was deleted. Is null if the
     * document went out of view without the server sending a new document.
     */
    r) {
        this.Ve = e, this.removedTargetIds = t, this.key = n, this.me = r;
    }
}

class __PRIVATE_ExistenceFilterChange {
    constructor(e, t) {
        this.targetId = e, this.fe = t;
    }
}

class __PRIVATE_WatchTargetChange {
    constructor(
    /** What kind of change occurred to the watch target. */
    e, 
    /** The target IDs that were added/removed/set. */
    t, 
    /**
     * An opaque, server-assigned token that allows watching a target to be
     * resumed after disconnecting without retransmitting all the data that
     * matches the target. The resume token essentially identifies a point in
     * time from which the server should resume sending results.
     */
    n = ByteString.EMPTY_BYTE_STRING
    /** An RPC error indicating why the watch failed. */ , r = null) {
        this.state = e, this.targetIds = t, this.resumeToken = n, this.cause = r;
    }
}

/** Tracks the internal state of a Watch target. */ class __PRIVATE_TargetState {
    constructor() {
        /**
         * The number of pending responses (adds or removes) that we are waiting on.
         * We only consider targets active that have no pending responses.
         */
        this.ge = 0, 
        /**
         * Keeps track of the document changes since the last raised snapshot.
         *
         * These changes are continuously updated as we receive document updates and
         * always reflect the current set of changes against the last issued snapshot.
         */
        this.pe = __PRIVATE_snapshotChangesMap(), 
        /** See public getters for explanations of these fields. */
        this.ye = ByteString.EMPTY_BYTE_STRING, this.we = !1, 
        /**
         * Whether this target state should be included in the next snapshot. We
         * initialize to true so that newly-added targets are included in the next
         * RemoteEvent.
         */
        this.Se = !0;
    }
    /**
     * Whether this target has been marked 'current'.
     *
     * 'Current' has special meaning in the RPC protocol: It implies that the
     * Watch backend has sent us all changes up to the point at which the target
     * was added and that the target is consistent with the rest of the watch
     * stream.
     */    get current() {
        return this.we;
    }
    /** The last resume token sent to us for this target. */    get resumeToken() {
        return this.ye;
    }
    /** Whether this target has pending target adds or target removes. */    get be() {
        return 0 !== this.ge;
    }
    /** Whether we have modified any state that should trigger a snapshot. */    get De() {
        return this.Se;
    }
    /**
     * Applies the resume token to the TargetChange, but only when it has a new
     * value. Empty resumeTokens are discarded.
     */    Ce(e) {
        e.approximateByteSize() > 0 && (this.Se = !0, this.ye = e);
    }
    /**
     * Creates a target change from the current set of changes.
     *
     * To reset the document changes after raising this snapshot, call
     * `clearPendingChanges()`.
     */    ve() {
        let e = __PRIVATE_documentKeySet(), t = __PRIVATE_documentKeySet(), n = __PRIVATE_documentKeySet();
        return this.pe.forEach(((r, i) => {
            switch (i) {
              case 0 /* ChangeType.Added */ :
                e = e.add(r);
                break;

              case 2 /* ChangeType.Modified */ :
                t = t.add(r);
                break;

              case 1 /* ChangeType.Removed */ :
                n = n.add(r);
                break;

              default:
                fail();
            }
        })), new TargetChange(this.ye, this.we, e, t, n);
    }
    /**
     * Resets the document changes and sets `hasPendingChanges` to false.
     */    Fe() {
        this.Se = !1, this.pe = __PRIVATE_snapshotChangesMap();
    }
    Me(e, t) {
        this.Se = !0, this.pe = this.pe.insert(e, t);
    }
    xe(e) {
        this.Se = !0, this.pe = this.pe.remove(e);
    }
    Oe() {
        this.ge += 1;
    }
    Ne() {
        this.ge -= 1, __PRIVATE_hardAssert(this.ge >= 0);
    }
    Be() {
        this.Se = !0, this.we = !0;
    }
}

/**
 * A helper class to accumulate watch changes into a RemoteEvent.
 */
class __PRIVATE_WatchChangeAggregator {
    constructor(e) {
        this.Le = e, 
        /** The internal state of all tracked targets. */
        this.ke = new Map, 
        /** Keeps track of the documents to update since the last raised snapshot. */
        this.qe = __PRIVATE_mutableDocumentMap(), 
        /** A mapping of document keys to their set of target IDs. */
        this.Qe = __PRIVATE_documentTargetMap(), 
        /**
         * A map of targets with existence filter mismatches. These targets are
         * known to be inconsistent and their listens needs to be re-established by
         * RemoteStore.
         */
        this.Ke = new SortedMap(__PRIVATE_primitiveComparator);
    }
    /**
     * Processes and adds the DocumentWatchChange to the current set of changes.
     */    $e(e) {
        for (const t of e.Ve) e.me && e.me.isFoundDocument() ? this.Ue(t, e.me) : this.We(t, e.key, e.me);
        for (const t of e.removedTargetIds) this.We(t, e.key, e.me);
    }
    /** Processes and adds the WatchTargetChange to the current set of changes. */    Ge(e) {
        this.forEachTarget(e, (t => {
            const n = this.ze(t);
            switch (e.state) {
              case 0 /* WatchTargetChangeState.NoChange */ :
                this.je(t) && n.Ce(e.resumeToken);
                break;

              case 1 /* WatchTargetChangeState.Added */ :
                // We need to decrement the number of pending acks needed from watch
                // for this targetId.
                n.Ne(), n.be || 
                // We have a freshly added target, so we need to reset any state
                // that we had previously. This can happen e.g. when remove and add
                // back a target for existence filter mismatches.
                n.Fe(), n.Ce(e.resumeToken);
                break;

              case 2 /* WatchTargetChangeState.Removed */ :
                // We need to keep track of removed targets to we can post-filter and
                // remove any target changes.
                // We need to decrement the number of pending acks needed from watch
                // for this targetId.
                n.Ne(), n.be || this.removeTarget(t);
                break;

              case 3 /* WatchTargetChangeState.Current */ :
                this.je(t) && (n.Be(), n.Ce(e.resumeToken));
                break;

              case 4 /* WatchTargetChangeState.Reset */ :
                this.je(t) && (
                // Reset the target and synthesizes removes for all existing
                // documents. The backend will re-add any documents that still
                // match the target before it sends the next global snapshot.
                this.He(t), n.Ce(e.resumeToken));
                break;

              default:
                fail();
            }
        }));
    }
    /**
     * Iterates over all targetIds that the watch change applies to: either the
     * targetIds explicitly listed in the change or the targetIds of all currently
     * active targets.
     */    forEachTarget(e, t) {
        e.targetIds.length > 0 ? e.targetIds.forEach(t) : this.ke.forEach(((e, n) => {
            this.je(n) && t(n);
        }));
    }
    /**
     * Handles existence filters and synthesizes deletes for filter mismatches.
     * Targets that are invalidated by filter mismatches are added to
     * `pendingTargetResets`.
     */    Je(e) {
        const t = e.targetId, n = e.fe.count, r = this.Ye(t);
        if (r) {
            const i = r.target;
            if (__PRIVATE_targetIsDocumentTarget(i)) if (0 === n) {
                // The existence filter told us the document does not exist. We deduce
                // that this document does not exist and apply a deleted document to
                // our updates. Without applying this deleted document there might be
                // another query that will raise this document as part of a snapshot
                // until it is resolved, essentially exposing inconsistency between
                // queries.
                const e = new DocumentKey(i.path);
                this.We(t, e, MutableDocument.newNoDocument(e, SnapshotVersion.min()));
            } else __PRIVATE_hardAssert(1 === n); else {
                const r = this.Ze(t);
                // Existence filter mismatch. Mark the documents as being in limbo, and
                // raise a snapshot with `isFromCache:true`.
                                if (r !== n) {
                    // Apply bloom filter to identify and mark removed documents.
                    const n = this.Xe(e), i = n ? this.et(n, e, r) : 1 /* BloomFilterApplicationStatus.Skipped */;
                    if (0 /* BloomFilterApplicationStatus.Success */ !== i) {
                        // If bloom filter application fails, we reset the mapping and
                        // trigger re-run of the query.
                        this.He(t);
                        const e = 2 /* BloomFilterApplicationStatus.FalsePositive */ === i ? "TargetPurposeExistenceFilterMismatchBloom" /* TargetPurpose.ExistenceFilterMismatchBloom */ : "TargetPurposeExistenceFilterMismatch" /* TargetPurpose.ExistenceFilterMismatch */;
                        this.Ke = this.Ke.insert(t, e);
                    }
                }
            }
        }
    }
    /**
     * Parse the bloom filter from the "unchanged_names" field of an existence
     * filter.
     */    Xe(e) {
        const t = e.fe.unchangedNames;
        if (!t || !t.bits) return null;
        const {bits: {bitmap: n = "", padding: r = 0}, hashCount: i = 0} = t;
        let s, o;
        try {
            s = __PRIVATE_normalizeByteString(n).toUint8Array();
        } catch (e) {
            if (e instanceof __PRIVATE_Base64DecodeError) return __PRIVATE_logWarn("Decoding the base64 bloom filter in existence filter failed (" + e.message + "); ignoring the bloom filter and falling back to full re-query."), 
            null;
            throw e;
        }
        try {
            // BloomFilter throws error if the inputs are invalid.
            o = new BloomFilter(s, r, i);
        } catch (e) {
            return __PRIVATE_logWarn(e instanceof __PRIVATE_BloomFilterError ? "BloomFilter error: " : "Applying bloom filter failed: ", e), 
            null;
        }
        return 0 === o.Te ? null : o;
    }
    /**
     * Apply bloom filter to remove the deleted documents, and return the
     * application status.
     */    et(e, t, n) {
        return t.fe.count === n - this.rt(e, t.targetId) ? 0 /* BloomFilterApplicationStatus.Success */ : 2 /* BloomFilterApplicationStatus.FalsePositive */;
    }
    /**
     * Filter out removed documents based on bloom filter membership result and
     * return number of documents removed.
     */    rt(e, t) {
        const n = this.Le.getRemoteKeysForTarget(t);
        let r = 0;
        return n.forEach((n => {
            const i = this.Le.nt(), s = `projects/${i.projectId}/databases/${i.database}/documents/${n.path.canonicalString()}`;
            e.mightContain(s) || (this.We(t, n, /*updatedDocument=*/ null), r++);
        })), r;
    }
    /**
     * Converts the currently accumulated state into a remote event at the
     * provided snapshot version. Resets the accumulated changes before returning.
     */    it(e) {
        const t = new Map;
        this.ke.forEach(((n, r) => {
            const i = this.Ye(r);
            if (i) {
                if (n.current && __PRIVATE_targetIsDocumentTarget(i.target)) {
                    // Document queries for document that don't exist can produce an empty
                    // result set. To update our local cache, we synthesize a document
                    // delete if we have not previously received the document. This
                    // resolves the limbo state of the document, removing it from
                    // limboDocumentRefs.
                    // TODO(dimond): Ideally we would have an explicit lookup target
                    // instead resulting in an explicit delete message and we could
                    // remove this special logic.
                    const t = new DocumentKey(i.target.path);
                    null !== this.qe.get(t) || this.st(r, t) || this.We(r, t, MutableDocument.newNoDocument(t, e));
                }
                n.De && (t.set(r, n.ve()), n.Fe());
            }
        }));
        let n = __PRIVATE_documentKeySet();
        // We extract the set of limbo-only document updates as the GC logic
        // special-cases documents that do not appear in the target cache.
        
        // TODO(gsoltis): Expand on this comment once GC is available in the JS
        // client.
                this.Qe.forEach(((e, t) => {
            let r = !0;
            t.forEachWhile((e => {
                const t = this.Ye(e);
                return !t || "TargetPurposeLimboResolution" /* TargetPurpose.LimboResolution */ === t.purpose || (r = !1, 
                !1);
            })), r && (n = n.add(e));
        })), this.qe.forEach(((t, n) => n.setReadTime(e)));
        const r = new RemoteEvent(e, t, this.Ke, this.qe, n);
        return this.qe = __PRIVATE_mutableDocumentMap(), this.Qe = __PRIVATE_documentTargetMap(), 
        this.Ke = new SortedMap(__PRIVATE_primitiveComparator), r;
    }
    /**
     * Adds the provided document to the internal list of document updates and
     * its document key to the given target's mapping.
     */
    // Visible for testing.
    Ue(e, t) {
        if (!this.je(e)) return;
        const n = this.st(e, t.key) ? 2 /* ChangeType.Modified */ : 0 /* ChangeType.Added */;
        this.ze(e).Me(t.key, n), this.qe = this.qe.insert(t.key, t), this.Qe = this.Qe.insert(t.key, this.ot(t.key).add(e));
    }
    /**
     * Removes the provided document from the target mapping. If the
     * document no longer matches the target, but the document's state is still
     * known (e.g. we know that the document was deleted or we received the change
     * that caused the filter mismatch), the new document can be provided
     * to update the remote document cache.
     */
    // Visible for testing.
    We(e, t, n) {
        if (!this.je(e)) return;
        const r = this.ze(e);
        this.st(e, t) ? r.Me(t, 1 /* ChangeType.Removed */) : 
        // The document may have entered and left the target before we raised a
        // snapshot, so we can just ignore the change.
        r.xe(t), this.Qe = this.Qe.insert(t, this.ot(t).delete(e)), n && (this.qe = this.qe.insert(t, n));
    }
    removeTarget(e) {
        this.ke.delete(e);
    }
    /**
     * Returns the current count of documents in the target. This includes both
     * the number of documents that the LocalStore considers to be part of the
     * target as well as any accumulated changes.
     */    Ze(e) {
        const t = this.ze(e).ve();
        return this.Le.getRemoteKeysForTarget(e).size + t.addedDocuments.size - t.removedDocuments.size;
    }
    /**
     * Increment the number of acks needed from watch before we can consider the
     * server to be 'in-sync' with the client's active targets.
     */    Oe(e) {
        this.ze(e).Oe();
    }
    ze(e) {
        let t = this.ke.get(e);
        return t || (t = new __PRIVATE_TargetState, this.ke.set(e, t)), t;
    }
    ot(e) {
        let t = this.Qe.get(e);
        return t || (t = new SortedSet(__PRIVATE_primitiveComparator), this.Qe = this.Qe.insert(e, t)), 
        t;
    }
    /**
     * Verifies that the user is still interested in this target (by calling
     * `getTargetDataForTarget()`) and that we are not waiting for pending ADDs
     * from watch.
     */    je(e) {
        const t = null !== this.Ye(e);
        return t || __PRIVATE_logDebug("WatchChangeAggregator", "Detected inactive target", e), 
        t;
    }
    /**
     * Returns the TargetData for an active target (i.e. a target that the user
     * is still interested in that has no outstanding target change requests).
     */    Ye(e) {
        const t = this.ke.get(e);
        return t && t.be ? null : this.Le._t(e);
    }
    /**
     * Resets the state of a Watch target to its initial state (e.g. sets
     * 'current' to false, clears the resume token and removes its target mapping
     * from all documents).
     */    He(e) {
        this.ke.set(e, new __PRIVATE_TargetState);
        this.Le.getRemoteKeysForTarget(e).forEach((t => {
            this.We(e, t, /*updatedDocument=*/ null);
        }));
    }
    /**
     * Returns whether the LocalStore considers the document to be part of the
     * specified target.
     */    st(e, t) {
        return this.Le.getRemoteKeysForTarget(e).has(t);
    }
}

function __PRIVATE_documentTargetMap() {
    return new SortedMap(DocumentKey.comparator);
}

function __PRIVATE_snapshotChangesMap() {
    return new SortedMap(DocumentKey.comparator);
}

const he = (() => {
    const e = {
        asc: "ASCENDING",
        desc: "DESCENDING"
    };
    return e;
})(), Pe = (() => {
    const e = {
        "<": "LESS_THAN",
        "<=": "LESS_THAN_OR_EQUAL",
        ">": "GREATER_THAN",
        ">=": "GREATER_THAN_OR_EQUAL",
        "==": "EQUAL",
        "!=": "NOT_EQUAL",
        "array-contains": "ARRAY_CONTAINS",
        in: "IN",
        "not-in": "NOT_IN",
        "array-contains-any": "ARRAY_CONTAINS_ANY"
    };
    return e;
})(), Ie = (() => {
    const e = {
        and: "AND",
        or: "OR"
    };
    return e;
})();

/**
 * This class generates JsonObject values for the Datastore API suitable for
 * sending to either GRPC stub methods or via the JSON/HTTP REST API.
 *
 * The serializer supports both Protobuf.js and Proto3 JSON formats. By
 * setting `useProto3Json` to true, the serializer will use the Proto3 JSON
 * format.
 *
 * For a description of the Proto3 JSON format check
 * https://developers.google.com/protocol-buffers/docs/proto3#json
 *
 * TODO(klimt): We can remove the databaseId argument if we keep the full
 * resource name in documents.
 */
class JsonProtoSerializer {
    constructor(e, t) {
        this.databaseId = e, this.useProto3Json = t;
    }
}

/**
 * Returns a value for a number (or null) that's appropriate to put into
 * a google.protobuf.Int32Value proto.
 * DO NOT USE THIS FOR ANYTHING ELSE.
 * This method cheats. It's typed as returning "number" because that's what
 * our generated proto interfaces say Int32Value must be. But GRPC actually
 * expects a { value: <number> } struct.
 */
function __PRIVATE_toInt32Proto(e, t) {
    return e.useProto3Json || __PRIVATE_isNullOrUndefined(t) ? t : {
        value: t
    };
}

/**
 * Returns a number (or null) from a google.protobuf.Int32Value proto.
 */
/**
 * Returns a value for a Date that's appropriate to put into a proto.
 */
function toTimestamp(e, t) {
    if (e.useProto3Json) {
        return `${new Date(1e3 * t.seconds).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + t.nanoseconds).slice(-9)}Z`;
    }
    return {
        seconds: "" + t.seconds,
        nanos: t.nanoseconds
    };
}

/**
 * Returns a value for bytes that's appropriate to put in a proto.
 *
 * Visible for testing.
 */
function __PRIVATE_toBytes(e, t) {
    return e.useProto3Json ? t.toBase64() : t.toUint8Array();
}

function __PRIVATE_fromVersion(e) {
    return __PRIVATE_hardAssert(!!e), SnapshotVersion.fromTimestamp(function fromTimestamp(e) {
        const t = __PRIVATE_normalizeTimestamp(e);
        return new Timestamp(t.seconds, t.nanos);
    }(e));
}

function __PRIVATE_toResourceName(e, t) {
    return function __PRIVATE_fullyQualifiedPrefixPath(e) {
        return new ResourcePath([ "projects", e.projectId, "databases", e.database ]);
    }(e).child("documents").child(t).canonicalString();
}

function __PRIVATE_fromResourceName(e) {
    const t = ResourcePath.fromString(e);
    return __PRIVATE_hardAssert(__PRIVATE_isValidResourceName(t)), t;
}

function fromName(e, t) {
    const n = __PRIVATE_fromResourceName(t);
    if (n.get(1) !== e.databaseId.projectId) throw new FirestoreError(D.INVALID_ARGUMENT, "Tried to deserialize key from different project: " + n.get(1) + " vs " + e.databaseId.projectId);
    if (n.get(3) !== e.databaseId.database) throw new FirestoreError(D.INVALID_ARGUMENT, "Tried to deserialize key from different database: " + n.get(3) + " vs " + e.databaseId.database);
    return new DocumentKey(__PRIVATE_extractLocalPathFromResourceName(n));
}

function __PRIVATE_toQueryPath(e, t) {
    return __PRIVATE_toResourceName(e.databaseId, t);
}

function __PRIVATE_fromQueryPath(e) {
    const t = __PRIVATE_fromResourceName(e);
    // In v1beta1 queries for collections at the root did not have a trailing
    // "/documents". In v1 all resource paths contain "/documents". Preserve the
    // ability to read the v1beta1 form for compatibility with queries persisted
    // in the local target cache.
        return 4 === t.length ? ResourcePath.emptyPath() : __PRIVATE_extractLocalPathFromResourceName(t);
}

function __PRIVATE_getEncodedDatabaseId(e) {
    return new ResourcePath([ "projects", e.databaseId.projectId, "databases", e.databaseId.database ]).canonicalString();
}

function __PRIVATE_extractLocalPathFromResourceName(e) {
    return __PRIVATE_hardAssert(e.length > 4 && "documents" === e.get(4)), e.popFirst(5);
}

function __PRIVATE_fromWatchChange(e, t) {
    let n;
    if ("targetChange" in t) {
        t.targetChange;
        // proto3 default value is unset in JSON (undefined), so use 'NO_CHANGE'
        // if unset
        const r = function __PRIVATE_fromWatchTargetChangeState(e) {
            return "NO_CHANGE" === e ? 0 /* WatchTargetChangeState.NoChange */ : "ADD" === e ? 1 /* WatchTargetChangeState.Added */ : "REMOVE" === e ? 2 /* WatchTargetChangeState.Removed */ : "CURRENT" === e ? 3 /* WatchTargetChangeState.Current */ : "RESET" === e ? 4 /* WatchTargetChangeState.Reset */ : fail();
        }(t.targetChange.targetChangeType || "NO_CHANGE"), i = t.targetChange.targetIds || [], s = function __PRIVATE_fromBytes(e, t) {
            return e.useProto3Json ? (__PRIVATE_hardAssert(void 0 === t || "string" == typeof t), 
            ByteString.fromBase64String(t || "")) : (__PRIVATE_hardAssert(void 0 === t || t instanceof Uint8Array), 
            ByteString.fromUint8Array(t || new Uint8Array));
        }(e, t.targetChange.resumeToken), o = t.targetChange.cause, _ = o && function __PRIVATE_fromRpcStatus(e) {
            const t = void 0 === e.code ? D.UNKNOWN : __PRIVATE_mapCodeFromRpcCode(e.code);
            return new FirestoreError(t, e.message || "");
        }(o);
        n = new __PRIVATE_WatchTargetChange(r, i, s, _ || null);
    } else if ("documentChange" in t) {
        t.documentChange;
        const r = t.documentChange;
        r.document, r.document.name, r.document.updateTime;
        const i = fromName(e, r.document.name), s = __PRIVATE_fromVersion(r.document.updateTime), o = r.document.createTime ? __PRIVATE_fromVersion(r.document.createTime) : SnapshotVersion.min(), _ = new ObjectValue({
            mapValue: {
                fields: r.document.fields
            }
        }), a = MutableDocument.newFoundDocument(i, s, o, _), u = r.targetIds || [], c = r.removedTargetIds || [];
        n = new __PRIVATE_DocumentWatchChange(u, c, a.key, a);
    } else if ("documentDelete" in t) {
        t.documentDelete;
        const r = t.documentDelete;
        r.document;
        const i = fromName(e, r.document), s = r.readTime ? __PRIVATE_fromVersion(r.readTime) : SnapshotVersion.min(), o = MutableDocument.newNoDocument(i, s), _ = r.removedTargetIds || [];
        n = new __PRIVATE_DocumentWatchChange([], _, o.key, o);
    } else if ("documentRemove" in t) {
        t.documentRemove;
        const r = t.documentRemove;
        r.document;
        const i = fromName(e, r.document), s = r.removedTargetIds || [];
        n = new __PRIVATE_DocumentWatchChange([], s, i, null);
    } else {
        if (!("filter" in t)) return fail();
        {
            t.filter;
            const e = t.filter;
            e.targetId;
            const {count: r = 0, unchangedNames: i} = e, s = new ExistenceFilter(r, i), o = e.targetId;
            n = new __PRIVATE_ExistenceFilterChange(o, s);
        }
    }
    return n;
}

function __PRIVATE_toDocumentsTarget(e, t) {
    return {
        documents: [ __PRIVATE_toQueryPath(e, t.path) ]
    };
}

function __PRIVATE_toQueryTarget(e, t) {
    // Dissect the path into parent, collectionId, and optional key filter.
    const n = {
        structuredQuery: {}
    }, r = t.path;
    null !== t.collectionGroup ? (n.parent = __PRIVATE_toQueryPath(e, r), n.structuredQuery.from = [ {
        collectionId: t.collectionGroup,
        allDescendants: !0
    } ]) : (n.parent = __PRIVATE_toQueryPath(e, r.popLast()), n.structuredQuery.from = [ {
        collectionId: r.lastSegment()
    } ]);
    const i = function __PRIVATE_toFilters(e) {
        if (0 === e.length) return;
        return __PRIVATE_toFilter(CompositeFilter.create(e, "and" /* CompositeOperator.AND */));
    }(t.filters);
    i && (n.structuredQuery.where = i);
    const s = function __PRIVATE_toOrder(e) {
        if (0 === e.length) return;
        return e.map((e => 
        // visible for testing
        function __PRIVATE_toPropertyOrder(e) {
            return {
                field: __PRIVATE_toFieldPathReference(e.field),
                direction: __PRIVATE_toDirection(e.dir)
            };
        }(e)));
    }(t.orderBy);
    s && (n.structuredQuery.orderBy = s);
    const o = __PRIVATE_toInt32Proto(e, t.limit);
    return null !== o && (n.structuredQuery.limit = o), t.startAt && (n.structuredQuery.startAt = function __PRIVATE_toStartAtCursor(e) {
        return {
            before: e.inclusive,
            values: e.position
        };
    }(t.startAt)), t.endAt && (n.structuredQuery.endAt = function __PRIVATE_toEndAtCursor(e) {
        return {
            before: !e.inclusive,
            values: e.position
        };
    }(t.endAt)), n;
}

function __PRIVATE_convertQueryTargetToQuery(e) {
    let t = __PRIVATE_fromQueryPath(e.parent);
    const n = e.structuredQuery, r = n.from ? n.from.length : 0;
    let i = null;
    if (r > 0) {
        __PRIVATE_hardAssert(1 === r);
        const e = n.from[0];
        e.allDescendants ? i = e.collectionId : t = t.child(e.collectionId);
    }
    let s = [];
    n.where && (s = function __PRIVATE_fromFilters(e) {
        const t = __PRIVATE_fromFilter(e);
        if (t instanceof CompositeFilter && __PRIVATE_compositeFilterIsFlatConjunction(t)) return t.getFilters();
        return [ t ];
    }(n.where));
    let o = [];
    n.orderBy && (o = function __PRIVATE_fromOrder(e) {
        return e.map((e => function __PRIVATE_fromPropertyOrder(e) {
            return new OrderBy(__PRIVATE_fromFieldPathReference(e.field), 
            // visible for testing
            function __PRIVATE_fromDirection(e) {
                switch (e) {
                  case "ASCENDING":
                    return "asc" /* Direction.ASCENDING */;

                  case "DESCENDING":
                    return "desc" /* Direction.DESCENDING */;

                  default:
                    return;
                }
            }
            // visible for testing
            (e.direction));
        }
        // visible for testing
        (e)));
    }(n.orderBy));
    let _ = null;
    n.limit && (_ = function __PRIVATE_fromInt32Proto(e) {
        let t;
        return t = "object" == typeof e ? e.value : e, __PRIVATE_isNullOrUndefined(t) ? null : t;
    }(n.limit));
    let a = null;
    n.startAt && (a = function __PRIVATE_fromStartAtCursor(e) {
        const t = !!e.before, n = e.values || [];
        return new Bound(n, t);
    }(n.startAt));
    let u = null;
    return n.endAt && (u = function __PRIVATE_fromEndAtCursor(e) {
        const t = !e.before, n = e.values || [];
        return new Bound(n, t);
    }
    // visible for testing
    (n.endAt)), __PRIVATE_newQuery(t, i, o, s, _, "F" /* LimitType.First */ , a, u);
}

function __PRIVATE_toListenRequestLabels(e, t) {
    const n = function __PRIVATE_toLabel(e) {
        switch (e) {
          case "TargetPurposeListen" /* TargetPurpose.Listen */ :
            return null;

          case "TargetPurposeExistenceFilterMismatch" /* TargetPurpose.ExistenceFilterMismatch */ :
            return "existence-filter-mismatch";

          case "TargetPurposeExistenceFilterMismatchBloom" /* TargetPurpose.ExistenceFilterMismatchBloom */ :
            return "existence-filter-mismatch-bloom";

          case "TargetPurposeLimboResolution" /* TargetPurpose.LimboResolution */ :
            return "limbo-document";

          default:
            return fail();
        }
    }(t.purpose);
    return null == n ? null : {
        "goog-listen-tags": n
    };
}

function __PRIVATE_fromFilter(e) {
    return void 0 !== e.unaryFilter ? function __PRIVATE_fromUnaryFilter(e) {
        switch (e.unaryFilter.op) {
          case "IS_NAN":
            const t = __PRIVATE_fromFieldPathReference(e.unaryFilter.field);
            return FieldFilter.create(t, "==" /* Operator.EQUAL */ , {
                doubleValue: NaN
            });

          case "IS_NULL":
            const n = __PRIVATE_fromFieldPathReference(e.unaryFilter.field);
            return FieldFilter.create(n, "==" /* Operator.EQUAL */ , {
                nullValue: "NULL_VALUE"
            });

          case "IS_NOT_NAN":
            const r = __PRIVATE_fromFieldPathReference(e.unaryFilter.field);
            return FieldFilter.create(r, "!=" /* Operator.NOT_EQUAL */ , {
                doubleValue: NaN
            });

          case "IS_NOT_NULL":
            const i = __PRIVATE_fromFieldPathReference(e.unaryFilter.field);
            return FieldFilter.create(i, "!=" /* Operator.NOT_EQUAL */ , {
                nullValue: "NULL_VALUE"
            });

          default:
            return fail();
        }
    }(e) : void 0 !== e.fieldFilter ? function __PRIVATE_fromFieldFilter(e) {
        return FieldFilter.create(__PRIVATE_fromFieldPathReference(e.fieldFilter.field), function __PRIVATE_fromOperatorName(e) {
            switch (e) {
              case "EQUAL":
                return "==" /* Operator.EQUAL */;

              case "NOT_EQUAL":
                return "!=" /* Operator.NOT_EQUAL */;

              case "GREATER_THAN":
                return ">" /* Operator.GREATER_THAN */;

              case "GREATER_THAN_OR_EQUAL":
                return ">=" /* Operator.GREATER_THAN_OR_EQUAL */;

              case "LESS_THAN":
                return "<" /* Operator.LESS_THAN */;

              case "LESS_THAN_OR_EQUAL":
                return "<=" /* Operator.LESS_THAN_OR_EQUAL */;

              case "ARRAY_CONTAINS":
                return "array-contains" /* Operator.ARRAY_CONTAINS */;

              case "IN":
                return "in" /* Operator.IN */;

              case "NOT_IN":
                return "not-in" /* Operator.NOT_IN */;

              case "ARRAY_CONTAINS_ANY":
                return "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */;

              default:
                return fail();
            }
        }(e.fieldFilter.op), e.fieldFilter.value);
    }(e) : void 0 !== e.compositeFilter ? function __PRIVATE_fromCompositeFilter(e) {
        return CompositeFilter.create(e.compositeFilter.filters.map((e => __PRIVATE_fromFilter(e))), function __PRIVATE_fromCompositeOperatorName(e) {
            switch (e) {
              case "AND":
                return "and" /* CompositeOperator.AND */;

              case "OR":
                return "or" /* CompositeOperator.OR */;

              default:
                return fail();
            }
        }(e.compositeFilter.op));
    }(e) : fail();
}

function __PRIVATE_toDirection(e) {
    return he[e];
}

function __PRIVATE_toOperatorName(e) {
    return Pe[e];
}

function __PRIVATE_toCompositeOperatorName(e) {
    return Ie[e];
}

function __PRIVATE_toFieldPathReference(e) {
    return {
        fieldPath: e.canonicalString()
    };
}

function __PRIVATE_fromFieldPathReference(e) {
    return FieldPath$1.fromServerFormat(e.fieldPath);
}

function __PRIVATE_toFilter(e) {
    return e instanceof FieldFilter ? function __PRIVATE_toUnaryOrFieldFilter(e) {
        if ("==" /* Operator.EQUAL */ === e.op) {
            if (__PRIVATE_isNanValue(e.value)) return {
                unaryFilter: {
                    field: __PRIVATE_toFieldPathReference(e.field),
                    op: "IS_NAN"
                }
            };
            if (__PRIVATE_isNullValue(e.value)) return {
                unaryFilter: {
                    field: __PRIVATE_toFieldPathReference(e.field),
                    op: "IS_NULL"
                }
            };
        } else if ("!=" /* Operator.NOT_EQUAL */ === e.op) {
            if (__PRIVATE_isNanValue(e.value)) return {
                unaryFilter: {
                    field: __PRIVATE_toFieldPathReference(e.field),
                    op: "IS_NOT_NAN"
                }
            };
            if (__PRIVATE_isNullValue(e.value)) return {
                unaryFilter: {
                    field: __PRIVATE_toFieldPathReference(e.field),
                    op: "IS_NOT_NULL"
                }
            };
        }
        return {
            fieldFilter: {
                field: __PRIVATE_toFieldPathReference(e.field),
                op: __PRIVATE_toOperatorName(e.op),
                value: e.value
            }
        };
    }(e) : e instanceof CompositeFilter ? function __PRIVATE_toCompositeFilter(e) {
        const t = e.getFilters().map((e => __PRIVATE_toFilter(e)));
        if (1 === t.length) return t[0];
        return {
            compositeFilter: {
                op: __PRIVATE_toCompositeOperatorName(e.op),
                filters: t
            }
        };
    }(e) : fail();
}

function __PRIVATE_isValidResourceName(e) {
    // Resource names have at least 4 components (project ID, database ID)
    return e.length >= 4 && "projects" === e.get(0) && "databases" === e.get(2);
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * An immutable set of metadata that the local store tracks for each target.
 */ class TargetData {
    constructor(
    /** The target being listened to. */
    e, 
    /**
     * The target ID to which the target corresponds; Assigned by the
     * LocalStore for user listens and by the SyncEngine for limbo watches.
     */
    t, 
    /** The purpose of the target. */
    n, 
    /**
     * The sequence number of the last transaction during which this target data
     * was modified.
     */
    r, 
    /** The latest snapshot version seen for this target. */
    i = SnapshotVersion.min()
    /**
     * The maximum snapshot version at which the associated view
     * contained no limbo documents.
     */ , s = SnapshotVersion.min()
    /**
     * An opaque, server-assigned token that allows watching a target to be
     * resumed after disconnecting without retransmitting all the data that
     * matches the target. The resume token essentially identifies a point in
     * time from which the server should resume sending results.
     */ , o = ByteString.EMPTY_BYTE_STRING
    /**
     * The number of documents that last matched the query at the resume token or
     * read time. Documents are counted only when making a listen request with
     * resume token or read time, otherwise, keep it null.
     */ , _ = null) {
        this.target = e, this.targetId = t, this.purpose = n, this.sequenceNumber = r, this.snapshotVersion = i, 
        this.lastLimboFreeSnapshotVersion = s, this.resumeToken = o, this.expectedCount = _;
    }
    /** Creates a new target data instance with an updated sequence number. */    withSequenceNumber(e) {
        return new TargetData(this.target, this.targetId, this.purpose, e, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, this.expectedCount);
    }
    /**
     * Creates a new target data instance with an updated resume token and
     * snapshot version.
     */    withResumeToken(e, t) {
        return new TargetData(this.target, this.targetId, this.purpose, this.sequenceNumber, t, this.lastLimboFreeSnapshotVersion, e, 
        /* expectedCount= */ null);
    }
    /**
     * Creates a new target data instance with an updated expected count.
     */    withExpectedCount(e) {
        return new TargetData(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, e);
    }
    /**
     * Creates a new target data instance with an updated last limbo free
     * snapshot version number.
     */    withLastLimboFreeSnapshotVersion(e) {
        return new TargetData(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, e, this.resumeToken, this.expectedCount);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** Serializer for values stored in the LocalStore. */ class __PRIVATE_LocalSerializer {
    constructor(e) {
        this.ut = e;
    }
}

/**
 * Encodes a `BundledQuery` from bundle proto to a Query object.
 *
 * This reconstructs the original query used to build the bundle being loaded,
 * including features exists only in SDKs (for example: limit-to-last).
 */
function __PRIVATE_fromBundledQuery(e) {
    const t = __PRIVATE_convertQueryTargetToQuery({
        parent: e.parent,
        structuredQuery: e.structuredQuery
    });
    return "LAST" === e.limitType ? __PRIVATE_queryWithLimit(t, t.limit, "L" /* LimitType.Last */) : t;
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * An in-memory implementation of IndexManager.
 */ class __PRIVATE_MemoryIndexManager {
    constructor() {
        this.on = new __PRIVATE_MemoryCollectionParentIndex;
    }
    addToCollectionParentIndex(e, t) {
        return this.on.add(t), PersistencePromise.resolve();
    }
    getCollectionParents(e, t) {
        return PersistencePromise.resolve(this.on.getEntries(t));
    }
    addFieldIndex(e, t) {
        // Field indices are not supported with memory persistence.
        return PersistencePromise.resolve();
    }
    deleteFieldIndex(e, t) {
        // Field indices are not supported with memory persistence.
        return PersistencePromise.resolve();
    }
    deleteAllFieldIndexes(e) {
        // Field indices are not supported with memory persistence.
        return PersistencePromise.resolve();
    }
    createTargetIndexes(e, t) {
        // Field indices are not supported with memory persistence.
        return PersistencePromise.resolve();
    }
    getDocumentsMatchingTarget(e, t) {
        // Field indices are not supported with memory persistence.
        return PersistencePromise.resolve(null);
    }
    getIndexType(e, t) {
        // Field indices are not supported with memory persistence.
        return PersistencePromise.resolve(0 /* IndexType.NONE */);
    }
    getFieldIndexes(e, t) {
        // Field indices are not supported with memory persistence.
        return PersistencePromise.resolve([]);
    }
    getNextCollectionGroupToUpdate(e) {
        // Field indices are not supported with memory persistence.
        return PersistencePromise.resolve(null);
    }
    getMinOffset(e, t) {
        return PersistencePromise.resolve(IndexOffset.min());
    }
    getMinOffsetFromCollectionGroup(e, t) {
        return PersistencePromise.resolve(IndexOffset.min());
    }
    updateCollectionGroup(e, t, n) {
        // Field indices are not supported with memory persistence.
        return PersistencePromise.resolve();
    }
    updateIndexEntries(e, t) {
        // Field indices are not supported with memory persistence.
        return PersistencePromise.resolve();
    }
}

/**
 * Internal implementation of the collection-parent index exposed by MemoryIndexManager.
 * Also used for in-memory caching by IndexedDbIndexManager and initial index population
 * in indexeddb_schema.ts
 */ class __PRIVATE_MemoryCollectionParentIndex {
    constructor() {
        this.index = {};
    }
    // Returns false if the entry already existed.
    add(e) {
        const t = e.lastSegment(), n = e.popLast(), r = this.index[t] || new SortedSet(ResourcePath.comparator), i = !r.has(n);
        return this.index[t] = r.add(n), i;
    }
    has(e) {
        const t = e.lastSegment(), n = e.popLast(), r = this.index[t];
        return r && r.has(n);
    }
    getEntries(e) {
        return (this.index[e] || new SortedSet(ResourcePath.comparator)).toArray();
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** Offset to ensure non-overlapping target ids. */
/**
 * Generates monotonically increasing target IDs for sending targets to the
 * watch stream.
 *
 * The client constructs two generators, one for the target cache, and one for
 * for the sync engine (to generate limbo documents targets). These
 * generators produce non-overlapping IDs (by using even and odd IDs
 * respectively).
 *
 * By separating the target ID space, the query cache can generate target IDs
 * that persist across client restarts, while sync engine can independently
 * generate in-memory target IDs that are transient and can be reused after a
 * restart.
 */
class __PRIVATE_TargetIdGenerator {
    constructor(e) {
        this.xn = e;
    }
    next() {
        return this.xn += 2, this.xn;
    }
    static On() {
        // The target cache generator must return '2' in its first call to `next()`
        // as there is no differentiation in the protocol layer between an unset
        // number and the number '0'. If we were to sent a target with target ID
        // '0', the backend would consider it unset and replace it with its own ID.
        return new __PRIVATE_TargetIdGenerator(0);
    }
    static Nn() {
        // Sync engine assigns target IDs for limbo document detection.
        return new __PRIVATE_TargetIdGenerator(-1);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * An in-memory buffer of entries to be written to a RemoteDocumentCache.
 * It can be used to batch up a set of changes to be written to the cache, but
 * additionally supports reading entries back with the `getEntry()` method,
 * falling back to the underlying RemoteDocumentCache if no entry is
 * buffered.
 *
 * Entries added to the cache *must* be read first. This is to facilitate
 * calculating the size delta of the pending changes.
 *
 * PORTING NOTE: This class was implemented then removed from other platforms.
 * If byte-counting ends up being needed on the other platforms, consider
 * porting this class as part of that implementation work.
 */ class RemoteDocumentChangeBuffer {
    constructor() {
        // A mapping of document key to the new cache entry that should be written.
        this.changes = new ObjectMap((e => e.toString()), ((e, t) => e.isEqual(t))), this.changesApplied = !1;
    }
    /**
     * Buffers a `RemoteDocumentCache.addEntry()` call.
     *
     * You can only modify documents that have already been retrieved via
     * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
     */    addEntry(e) {
        this.assertNotApplied(), this.changes.set(e.key, e);
    }
    /**
     * Buffers a `RemoteDocumentCache.removeEntry()` call.
     *
     * You can only remove documents that have already been retrieved via
     * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
     */    removeEntry(e, t) {
        this.assertNotApplied(), this.changes.set(e, MutableDocument.newInvalidDocument(e).setReadTime(t));
    }
    /**
     * Looks up an entry in the cache. The buffered changes will first be checked,
     * and if no buffered change applies, this will forward to
     * `RemoteDocumentCache.getEntry()`.
     *
     * @param transaction - The transaction in which to perform any persistence
     *     operations.
     * @param documentKey - The key of the entry to look up.
     * @returns The cached document or an invalid document if we have nothing
     * cached.
     */    getEntry(e, t) {
        this.assertNotApplied();
        const n = this.changes.get(t);
        return void 0 !== n ? PersistencePromise.resolve(n) : this.getFromCache(e, t);
    }
    /**
     * Looks up several entries in the cache, forwarding to
     * `RemoteDocumentCache.getEntry()`.
     *
     * @param transaction - The transaction in which to perform any persistence
     *     operations.
     * @param documentKeys - The keys of the entries to look up.
     * @returns A map of cached documents, indexed by key. If an entry cannot be
     *     found, the corresponding key will be mapped to an invalid document.
     */    getEntries(e, t) {
        return this.getAllFromCache(e, t);
    }
    /**
     * Applies buffered changes to the underlying RemoteDocumentCache, using
     * the provided transaction.
     */    apply(e) {
        return this.assertNotApplied(), this.changesApplied = !0, this.applyChanges(e);
    }
    /** Helper to assert this.changes is not null  */    assertNotApplied() {}
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Schema Version for the Web client:
 * 1.  Initial version including Mutation Queue, Query Cache, and Remote
 *     Document Cache
 * 2.  Used to ensure a targetGlobal object exists and add targetCount to it. No
 *     longer required because migration 3 unconditionally clears it.
 * 3.  Dropped and re-created Query Cache to deal with cache corruption related
 *     to limbo resolution. Addresses
 *     https://github.com/firebase/firebase-ios-sdk/issues/1548
 * 4.  Multi-Tab Support.
 * 5.  Removal of held write acks.
 * 6.  Create document global for tracking document cache size.
 * 7.  Ensure every cached document has a sentinel row with a sequence number.
 * 8.  Add collection-parent index for Collection Group queries.
 * 9.  Change RemoteDocumentChanges store to be keyed by readTime rather than
 *     an auto-incrementing ID. This is required for Index-Free queries.
 * 10. Rewrite the canonical IDs to the explicit Protobuf-based format.
 * 11. Add bundles and named_queries for bundle support.
 * 12. Add document overlays.
 * 13. Rewrite the keys of the remote document cache to allow for efficient
 *     document lookup via `getAll()`.
 * 14. Add overlays.
 * 15. Add indexing support.
 */
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Represents a local view (overlay) of a document, and the fields that are
 * locally mutated.
 */
class OverlayedDocument {
    constructor(e, 
    /**
     * The fields that are locally mutated by patch mutations.
     *
     * If the overlayed	document is from set or delete mutations, this is `null`.
     * If there is no overlay (mutation) for the document, this is an empty `FieldMask`.
     */
    t) {
        this.overlayedDocument = e, this.mutatedFields = t;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A readonly view of the local state of all documents we're tracking (i.e. we
 * have a cached version in remoteDocumentCache or local mutations for the
 * document). The view is computed by applying the mutations in the
 * MutationQueue to the RemoteDocumentCache.
 */ class LocalDocumentsView {
    constructor(e, t, n, r) {
        this.remoteDocumentCache = e, this.mutationQueue = t, this.documentOverlayCache = n, 
        this.indexManager = r;
    }
    /**
     * Get the local view of the document identified by `key`.
     *
     * @returns Local view of the document or null if we don't have any cached
     * state for it.
     */    getDocument(e, t) {
        let n = null;
        return this.documentOverlayCache.getOverlay(e, t).next((r => (n = r, this.remoteDocumentCache.getEntry(e, t)))).next((e => (null !== n && __PRIVATE_mutationApplyToLocalView(n.mutation, e, FieldMask.empty(), Timestamp.now()), 
        e)));
    }
    /**
     * Gets the local view of the documents identified by `keys`.
     *
     * If we don't have cached state for a document in `keys`, a NoDocument will
     * be stored for that key in the resulting set.
     */    getDocuments(e, t) {
        return this.remoteDocumentCache.getEntries(e, t).next((t => this.getLocalViewOfDocuments(e, t, __PRIVATE_documentKeySet()).next((() => t))));
    }
    /**
     * Similar to `getDocuments`, but creates the local view from the given
     * `baseDocs` without retrieving documents from the local store.
     *
     * @param transaction - The transaction this operation is scoped to.
     * @param docs - The documents to apply local mutations to get the local views.
     * @param existenceStateChanged - The set of document keys whose existence state
     *   is changed. This is useful to determine if some documents overlay needs
     *   to be recalculated.
     */    getLocalViewOfDocuments(e, t, n = __PRIVATE_documentKeySet()) {
        const r = __PRIVATE_newOverlayMap();
        return this.populateOverlays(e, r, t).next((() => this.computeViews(e, t, r, n).next((e => {
            let t = documentMap();
            return e.forEach(((e, n) => {
                t = t.insert(e, n.overlayedDocument);
            })), t;
        }))));
    }
    /**
     * Gets the overlayed documents for the given document map, which will include
     * the local view of those documents and a `FieldMask` indicating which fields
     * are mutated locally, `null` if overlay is a Set or Delete mutation.
     */    getOverlayedDocuments(e, t) {
        const n = __PRIVATE_newOverlayMap();
        return this.populateOverlays(e, n, t).next((() => this.computeViews(e, t, n, __PRIVATE_documentKeySet())));
    }
    /**
     * Fetches the overlays for {@code docs} and adds them to provided overlay map
     * if the map does not already contain an entry for the given document key.
     */    populateOverlays(e, t, n) {
        const r = [];
        return n.forEach((e => {
            t.has(e) || r.push(e);
        })), this.documentOverlayCache.getOverlays(e, r).next((e => {
            e.forEach(((e, n) => {
                t.set(e, n);
            }));
        }));
    }
    /**
     * Computes the local view for the given documents.
     *
     * @param docs - The documents to compute views for. It also has the base
     *   version of the documents.
     * @param overlays - The overlays that need to be applied to the given base
     *   version of the documents.
     * @param existenceStateChanged - A set of documents whose existence states
     *   might have changed. This is used to determine if we need to re-calculate
     *   overlays from mutation queues.
     * @return A map represents the local documents view.
     */    computeViews(e, t, n, r) {
        let i = __PRIVATE_mutableDocumentMap();
        const s = __PRIVATE_newDocumentKeyMap(), o = function __PRIVATE_newOverlayedDocumentMap() {
            return __PRIVATE_newDocumentKeyMap();
        }();
        return t.forEach(((e, t) => {
            const o = n.get(t.key);
            // Recalculate an overlay if the document's existence state changed due to
            // a remote event *and* the overlay is a PatchMutation. This is because
            // document existence state can change if some patch mutation's
            // preconditions are met.
            // NOTE: we recalculate when `overlay` is undefined as well, because there
            // might be a patch mutation whose precondition does not match before the
            // change (hence overlay is undefined), but would now match.
                        r.has(t.key) && (void 0 === o || o.mutation instanceof __PRIVATE_PatchMutation) ? i = i.insert(t.key, t) : void 0 !== o ? (s.set(t.key, o.mutation.getFieldMask()), 
            __PRIVATE_mutationApplyToLocalView(o.mutation, t, o.mutation.getFieldMask(), Timestamp.now())) : 
            // no overlay exists
            // Using EMPTY to indicate there is no overlay for the document.
            s.set(t.key, FieldMask.empty());
        })), this.recalculateAndSaveOverlays(e, i).next((e => (e.forEach(((e, t) => s.set(e, t))), 
        t.forEach(((e, t) => {
            var n;
            return o.set(e, new OverlayedDocument(t, null !== (n = s.get(e)) && void 0 !== n ? n : null));
        })), o)));
    }
    recalculateAndSaveOverlays(e, t) {
        const n = __PRIVATE_newDocumentKeyMap();
        // A reverse lookup map from batch id to the documents within that batch.
                let r = new SortedMap(((e, t) => e - t)), i = __PRIVATE_documentKeySet();
        return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e, t).next((e => {
            for (const i of e) i.keys().forEach((e => {
                const s = t.get(e);
                if (null === s) return;
                let o = n.get(e) || FieldMask.empty();
                o = i.applyToLocalView(s, o), n.set(e, o);
                const _ = (r.get(i.batchId) || __PRIVATE_documentKeySet()).add(e);
                r = r.insert(i.batchId, _);
            }));
        })).next((() => {
            const s = [], o = r.getReverseIterator();
            // Iterate in descending order of batch IDs, and skip documents that are
            // already saved.
                        for (;o.hasNext(); ) {
                const r = o.getNext(), _ = r.key, a = r.value, u = __PRIVATE_newMutationMap();
                a.forEach((e => {
                    if (!i.has(e)) {
                        const r = __PRIVATE_calculateOverlayMutation(t.get(e), n.get(e));
                        null !== r && u.set(e, r), i = i.add(e);
                    }
                })), s.push(this.documentOverlayCache.saveOverlays(e, _, u));
            }
            return PersistencePromise.waitFor(s);
        })).next((() => n));
    }
    /**
     * Recalculates overlays by reading the documents from remote document cache
     * first, and saves them after they are calculated.
     */    recalculateAndSaveOverlaysForDocumentKeys(e, t) {
        return this.remoteDocumentCache.getEntries(e, t).next((t => this.recalculateAndSaveOverlays(e, t)));
    }
    /**
     * Performs a query against the local view of all documents.
     *
     * @param transaction - The persistence transaction.
     * @param query - The query to match documents against.
     * @param offset - Read time and key to start scanning by (exclusive).
     * @param context - A optional tracker to keep a record of important details
     *   during database local query execution.
     */    getDocumentsMatchingQuery(e, t, n, r) {
        /**
 * Returns whether the query matches a single document by path (rather than a
 * collection).
 */
        return function __PRIVATE_isDocumentQuery$1(e) {
            return DocumentKey.isDocumentKey(e.path) && null === e.collectionGroup && 0 === e.filters.length;
        }(t) ? this.getDocumentsMatchingDocumentQuery(e, t.path) : __PRIVATE_isCollectionGroupQuery(t) ? this.getDocumentsMatchingCollectionGroupQuery(e, t, n, r) : this.getDocumentsMatchingCollectionQuery(e, t, n, r);
    }
    /**
     * Given a collection group, returns the next documents that follow the provided offset, along
     * with an updated batch ID.
     *
     * <p>The documents returned by this method are ordered by remote version from the provided
     * offset. If there are no more remote documents after the provided offset, documents with
     * mutations in order of batch id from the offset are returned. Since all documents in a batch are
     * returned together, the total number of documents returned can exceed {@code count}.
     *
     * @param transaction
     * @param collectionGroup The collection group for the documents.
     * @param offset The offset to index into.
     * @param count The number of documents to return
     * @return A LocalWriteResult with the documents that follow the provided offset and the last processed batch id.
     */    getNextDocuments(e, t, n, r) {
        return this.remoteDocumentCache.getAllFromCollectionGroup(e, t, n, r).next((i => {
            const s = r - i.size > 0 ? this.documentOverlayCache.getOverlaysForCollectionGroup(e, t, n.largestBatchId, r - i.size) : PersistencePromise.resolve(__PRIVATE_newOverlayMap());
            // The callsite will use the largest batch ID together with the latest read time to create
            // a new index offset. Since we only process batch IDs if all remote documents have been read,
            // no overlay will increase the overall read time. This is why we only need to special case
            // the batch id.
                        let o = -1, _ = i;
            return s.next((t => PersistencePromise.forEach(t, ((t, n) => (o < n.largestBatchId && (o = n.largestBatchId), 
            i.get(t) ? PersistencePromise.resolve() : this.remoteDocumentCache.getEntry(e, t).next((e => {
                _ = _.insert(t, e);
            }))))).next((() => this.populateOverlays(e, t, i))).next((() => this.computeViews(e, _, t, __PRIVATE_documentKeySet()))).next((e => ({
                batchId: o,
                changes: __PRIVATE_convertOverlayedDocumentMapToDocumentMap(e)
            })))));
        }));
    }
    getDocumentsMatchingDocumentQuery(e, t) {
        // Just do a simple document lookup.
        return this.getDocument(e, new DocumentKey(t)).next((e => {
            let t = documentMap();
            return e.isFoundDocument() && (t = t.insert(e.key, e)), t;
        }));
    }
    getDocumentsMatchingCollectionGroupQuery(e, t, n, r) {
        const i = t.collectionGroup;
        let s = documentMap();
        return this.indexManager.getCollectionParents(e, i).next((o => PersistencePromise.forEach(o, (o => {
            const _ = function __PRIVATE_asCollectionQueryAtPath(e, t) {
                return new __PRIVATE_QueryImpl(t, 
                /*collectionGroup=*/ null, e.explicitOrderBy.slice(), e.filters.slice(), e.limit, e.limitType, e.startAt, e.endAt);
            }(t, o.child(i));
            return this.getDocumentsMatchingCollectionQuery(e, _, n, r).next((e => {
                e.forEach(((e, t) => {
                    s = s.insert(e, t);
                }));
            }));
        })).next((() => s))));
    }
    getDocumentsMatchingCollectionQuery(e, t, n, r) {
        // Query the remote documents and overlay mutations.
        let i;
        return this.documentOverlayCache.getOverlaysForCollection(e, t.path, n.largestBatchId).next((s => (i = s, 
        this.remoteDocumentCache.getDocumentsMatchingQuery(e, t, n, i, r)))).next((e => {
            // As documents might match the query because of their overlay we need to
            // include documents for all overlays in the initial document set.
            i.forEach(((t, n) => {
                const r = n.getKey();
                null === e.get(r) && (e = e.insert(r, MutableDocument.newInvalidDocument(r)));
            }));
            // Apply the overlays and match against the query.
            let n = documentMap();
            return e.forEach(((e, r) => {
                const s = i.get(e);
                void 0 !== s && __PRIVATE_mutationApplyToLocalView(s.mutation, r, FieldMask.empty(), Timestamp.now()), 
                // Finally, insert the documents that still match the query
                __PRIVATE_queryMatches(t, r) && (n = n.insert(e, r));
            })), n;
        }));
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class __PRIVATE_MemoryBundleCache {
    constructor(e) {
        this.serializer = e, this.ur = new Map, this.cr = new Map;
    }
    getBundleMetadata(e, t) {
        return PersistencePromise.resolve(this.ur.get(t));
    }
    saveBundleMetadata(e, t) {
        return this.ur.set(t.id, 
        /** Decodes a BundleMetadata proto into a BundleMetadata object. */
        function __PRIVATE_fromBundleMetadata(e) {
            return {
                id: e.id,
                version: e.version,
                createTime: __PRIVATE_fromVersion(e.createTime)
            };
        }(t)), PersistencePromise.resolve();
    }
    getNamedQuery(e, t) {
        return PersistencePromise.resolve(this.cr.get(t));
    }
    saveNamedQuery(e, t) {
        return this.cr.set(t.name, function __PRIVATE_fromProtoNamedQuery(e) {
            return {
                name: e.name,
                query: __PRIVATE_fromBundledQuery(e.bundledQuery),
                readTime: __PRIVATE_fromVersion(e.readTime)
            };
        }(t)), PersistencePromise.resolve();
    }
}

/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * An in-memory implementation of DocumentOverlayCache.
 */ class __PRIVATE_MemoryDocumentOverlayCache {
    constructor() {
        // A map sorted by DocumentKey, whose value is a pair of the largest batch id
        // for the overlay and the overlay itself.
        this.overlays = new SortedMap(DocumentKey.comparator), this.lr = new Map;
    }
    getOverlay(e, t) {
        return PersistencePromise.resolve(this.overlays.get(t));
    }
    getOverlays(e, t) {
        const n = __PRIVATE_newOverlayMap();
        return PersistencePromise.forEach(t, (t => this.getOverlay(e, t).next((e => {
            null !== e && n.set(t, e);
        })))).next((() => n));
    }
    saveOverlays(e, t, n) {
        return n.forEach(((n, r) => {
            this.lt(e, t, r);
        })), PersistencePromise.resolve();
    }
    removeOverlaysForBatchId(e, t, n) {
        const r = this.lr.get(n);
        return void 0 !== r && (r.forEach((e => this.overlays = this.overlays.remove(e))), 
        this.lr.delete(n)), PersistencePromise.resolve();
    }
    getOverlaysForCollection(e, t, n) {
        const r = __PRIVATE_newOverlayMap(), i = t.length + 1, s = new DocumentKey(t.child("")), o = this.overlays.getIteratorFrom(s);
        for (;o.hasNext(); ) {
            const e = o.getNext().value, s = e.getKey();
            if (!t.isPrefixOf(s.path)) break;
            // Documents from sub-collections
                        s.path.length === i && (e.largestBatchId > n && r.set(e.getKey(), e));
        }
        return PersistencePromise.resolve(r);
    }
    getOverlaysForCollectionGroup(e, t, n, r) {
        let i = new SortedMap(((e, t) => e - t));
        const s = this.overlays.getIterator();
        for (;s.hasNext(); ) {
            const e = s.getNext().value;
            if (e.getKey().getCollectionGroup() === t && e.largestBatchId > n) {
                let t = i.get(e.largestBatchId);
                null === t && (t = __PRIVATE_newOverlayMap(), i = i.insert(e.largestBatchId, t)), 
                t.set(e.getKey(), e);
            }
        }
        const o = __PRIVATE_newOverlayMap(), _ = i.getIterator();
        for (;_.hasNext(); ) {
            if (_.getNext().value.forEach(((e, t) => o.set(e, t))), o.size() >= r) break;
        }
        return PersistencePromise.resolve(o);
    }
    lt(e, t, n) {
        // Remove the association of the overlay to its batch id.
        const r = this.overlays.get(n.key);
        if (null !== r) {
            const e = this.lr.get(r.largestBatchId).delete(n.key);
            this.lr.set(r.largestBatchId, e);
        }
        this.overlays = this.overlays.insert(n.key, new Overlay(t, n));
        // Create the association of this overlay to the given largestBatchId.
        let i = this.lr.get(t);
        void 0 === i && (i = __PRIVATE_documentKeySet(), this.lr.set(t, i)), this.lr.set(t, i.add(n.key));
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A collection of references to a document from some kind of numbered entity
 * (either a target ID or batch ID). As references are added to or removed from
 * the set corresponding events are emitted to a registered garbage collector.
 *
 * Each reference is represented by a DocumentReference object. Each of them
 * contains enough information to uniquely identify the reference. They are all
 * stored primarily in a set sorted by key. A document is considered garbage if
 * there's no references in that set (this can be efficiently checked thanks to
 * sorting by key).
 *
 * ReferenceSet also keeps a secondary set that contains references sorted by
 * IDs. This one is used to efficiently implement removal of all references by
 * some target ID.
 */ class __PRIVATE_ReferenceSet {
    constructor() {
        // A set of outstanding references to a document sorted by key.
        this.hr = new SortedSet(__PRIVATE_DocReference.Pr), 
        // A set of outstanding references to a document sorted by target id.
        this.Ir = new SortedSet(__PRIVATE_DocReference.Tr);
    }
    /** Returns true if the reference set contains no references. */    isEmpty() {
        return this.hr.isEmpty();
    }
    /** Adds a reference to the given document key for the given ID. */    addReference(e, t) {
        const n = new __PRIVATE_DocReference(e, t);
        this.hr = this.hr.add(n), this.Ir = this.Ir.add(n);
    }
    /** Add references to the given document keys for the given ID. */    Er(e, t) {
        e.forEach((e => this.addReference(e, t)));
    }
    /**
     * Removes a reference to the given document key for the given
     * ID.
     */    removeReference(e, t) {
        this.dr(new __PRIVATE_DocReference(e, t));
    }
    Ar(e, t) {
        e.forEach((e => this.removeReference(e, t)));
    }
    /**
     * Clears all references with a given ID. Calls removeRef() for each key
     * removed.
     */    Rr(e) {
        const t = new DocumentKey(new ResourcePath([])), n = new __PRIVATE_DocReference(t, e), r = new __PRIVATE_DocReference(t, e + 1), i = [];
        return this.Ir.forEachInRange([ n, r ], (e => {
            this.dr(e), i.push(e.key);
        })), i;
    }
    Vr() {
        this.hr.forEach((e => this.dr(e)));
    }
    dr(e) {
        this.hr = this.hr.delete(e), this.Ir = this.Ir.delete(e);
    }
    mr(e) {
        const t = new DocumentKey(new ResourcePath([])), n = new __PRIVATE_DocReference(t, e), r = new __PRIVATE_DocReference(t, e + 1);
        let i = __PRIVATE_documentKeySet();
        return this.Ir.forEachInRange([ n, r ], (e => {
            i = i.add(e.key);
        })), i;
    }
    containsKey(e) {
        const t = new __PRIVATE_DocReference(e, 0), n = this.hr.firstAfterOrEqual(t);
        return null !== n && e.isEqual(n.key);
    }
}

class __PRIVATE_DocReference {
    constructor(e, t) {
        this.key = e, this.gr = t;
    }
    /** Compare by key then by ID */    static Pr(e, t) {
        return DocumentKey.comparator(e.key, t.key) || __PRIVATE_primitiveComparator(e.gr, t.gr);
    }
    /** Compare by ID then by key */    static Tr(e, t) {
        return __PRIVATE_primitiveComparator(e.gr, t.gr) || DocumentKey.comparator(e.key, t.key);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class __PRIVATE_MemoryMutationQueue {
    constructor(e, t) {
        this.indexManager = e, this.referenceDelegate = t, 
        /**
         * The set of all mutations that have been sent but not yet been applied to
         * the backend.
         */
        this.mutationQueue = [], 
        /** Next value to use when assigning sequential IDs to each mutation batch. */
        this.pr = 1, 
        /** An ordered mapping between documents and the mutations batch IDs. */
        this.yr = new SortedSet(__PRIVATE_DocReference.Pr);
    }
    checkEmpty(e) {
        return PersistencePromise.resolve(0 === this.mutationQueue.length);
    }
    addMutationBatch(e, t, n, r) {
        const i = this.pr;
        this.pr++, this.mutationQueue.length > 0 && this.mutationQueue[this.mutationQueue.length - 1];
        const s = new MutationBatch(i, t, n, r);
        this.mutationQueue.push(s);
        // Track references by document key and index collection parents.
        for (const t of r) this.yr = this.yr.add(new __PRIVATE_DocReference(t.key, i)), 
        this.indexManager.addToCollectionParentIndex(e, t.key.path.popLast());
        return PersistencePromise.resolve(s);
    }
    lookupMutationBatch(e, t) {
        return PersistencePromise.resolve(this.wr(t));
    }
    getNextMutationBatchAfterBatchId(e, t) {
        const n = t + 1, r = this.Sr(n), i = r < 0 ? 0 : r;
        // The requested batchId may still be out of range so normalize it to the
        // start of the queue.
                return PersistencePromise.resolve(this.mutationQueue.length > i ? this.mutationQueue[i] : null);
    }
    getHighestUnacknowledgedBatchId() {
        return PersistencePromise.resolve(0 === this.mutationQueue.length ? -1 : this.pr - 1);
    }
    getAllMutationBatches(e) {
        return PersistencePromise.resolve(this.mutationQueue.slice());
    }
    getAllMutationBatchesAffectingDocumentKey(e, t) {
        const n = new __PRIVATE_DocReference(t, 0), r = new __PRIVATE_DocReference(t, Number.POSITIVE_INFINITY), i = [];
        return this.yr.forEachInRange([ n, r ], (e => {
            const t = this.wr(e.gr);
            i.push(t);
        })), PersistencePromise.resolve(i);
    }
    getAllMutationBatchesAffectingDocumentKeys(e, t) {
        let n = new SortedSet(__PRIVATE_primitiveComparator);
        return t.forEach((e => {
            const t = new __PRIVATE_DocReference(e, 0), r = new __PRIVATE_DocReference(e, Number.POSITIVE_INFINITY);
            this.yr.forEachInRange([ t, r ], (e => {
                n = n.add(e.gr);
            }));
        })), PersistencePromise.resolve(this.br(n));
    }
    getAllMutationBatchesAffectingQuery(e, t) {
        // Use the query path as a prefix for testing if a document matches the
        // query.
        const n = t.path, r = n.length + 1;
        // Construct a document reference for actually scanning the index. Unlike
        // the prefix the document key in this reference must have an even number of
        // segments. The empty segment can be used a suffix of the query path
        // because it precedes all other segments in an ordered traversal.
        let i = n;
        DocumentKey.isDocumentKey(i) || (i = i.child(""));
        const s = new __PRIVATE_DocReference(new DocumentKey(i), 0);
        // Find unique batchIDs referenced by all documents potentially matching the
        // query.
                let o = new SortedSet(__PRIVATE_primitiveComparator);
        return this.yr.forEachWhile((e => {
            const t = e.key.path;
            return !!n.isPrefixOf(t) && (
            // Rows with document keys more than one segment longer than the query
            // path can't be matches. For example, a query on 'rooms' can't match
            // the document /rooms/abc/messages/xyx.
            // TODO(mcg): we'll need a different scanner when we implement
            // ancestor queries.
            t.length === r && (o = o.add(e.gr)), !0);
        }), s), PersistencePromise.resolve(this.br(o));
    }
    br(e) {
        // Construct an array of matching batches, sorted by batchID to ensure that
        // multiple mutations affecting the same document key are applied in order.
        const t = [];
        return e.forEach((e => {
            const n = this.wr(e);
            null !== n && t.push(n);
        })), t;
    }
    removeMutationBatch(e, t) {
        __PRIVATE_hardAssert(0 === this.Dr(t.batchId, "removed")), this.mutationQueue.shift();
        let n = this.yr;
        return PersistencePromise.forEach(t.mutations, (r => {
            const i = new __PRIVATE_DocReference(r.key, t.batchId);
            return n = n.delete(i), this.referenceDelegate.markPotentiallyOrphaned(e, r.key);
        })).next((() => {
            this.yr = n;
        }));
    }
    Fn(e) {
        // No-op since the memory mutation queue does not maintain a separate cache.
    }
    containsKey(e, t) {
        const n = new __PRIVATE_DocReference(t, 0), r = this.yr.firstAfterOrEqual(n);
        return PersistencePromise.resolve(t.isEqual(r && r.key));
    }
    performConsistencyCheck(e) {
        return this.mutationQueue.length, PersistencePromise.resolve();
    }
    /**
     * Finds the index of the given batchId in the mutation queue and asserts that
     * the resulting index is within the bounds of the queue.
     *
     * @param batchId - The batchId to search for
     * @param action - A description of what the caller is doing, phrased in passive
     * form (e.g. "acknowledged" in a routine that acknowledges batches).
     */    Dr(e, t) {
        return this.Sr(e);
    }
    /**
     * Finds the index of the given batchId in the mutation queue. This operation
     * is O(1).
     *
     * @returns The computed index of the batch with the given batchId, based on
     * the state of the queue. Note this index can be negative if the requested
     * batchId has already been remvoed from the queue or past the end of the
     * queue if the batchId is larger than the last added batch.
     */    Sr(e) {
        if (0 === this.mutationQueue.length) 
        // As an index this is past the end of the queue
        return 0;
        // Examine the front of the queue to figure out the difference between the
        // batchId and indexes in the array. Note that since the queue is ordered
        // by batchId, if the first batch has a larger batchId then the requested
        // batchId doesn't exist in the queue.
                return e - this.mutationQueue[0].batchId;
    }
    /**
     * A version of lookupMutationBatch that doesn't return a promise, this makes
     * other functions that uses this code easier to read and more efficent.
     */    wr(e) {
        const t = this.Sr(e);
        if (t < 0 || t >= this.mutationQueue.length) return null;
        return this.mutationQueue[t];
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * The memory-only RemoteDocumentCache for IndexedDb. To construct, invoke
 * `newMemoryRemoteDocumentCache()`.
 */
class __PRIVATE_MemoryRemoteDocumentCacheImpl {
    /**
     * @param sizer - Used to assess the size of a document. For eager GC, this is
     * expected to just return 0 to avoid unnecessarily doing the work of
     * calculating the size.
     */
    constructor(e) {
        this.Cr = e, 
        /** Underlying cache of documents and their read times. */
        this.docs = function __PRIVATE_documentEntryMap() {
            return new SortedMap(DocumentKey.comparator);
        }(), 
        /** Size of all cached documents. */
        this.size = 0;
    }
    setIndexManager(e) {
        this.indexManager = e;
    }
    /**
     * Adds the supplied entry to the cache and updates the cache size as appropriate.
     *
     * All calls of `addEntry`  are required to go through the RemoteDocumentChangeBuffer
     * returned by `newChangeBuffer()`.
     */    addEntry(e, t) {
        const n = t.key, r = this.docs.get(n), i = r ? r.size : 0, s = this.Cr(t);
        return this.docs = this.docs.insert(n, {
            document: t.mutableCopy(),
            size: s
        }), this.size += s - i, this.indexManager.addToCollectionParentIndex(e, n.path.popLast());
    }
    /**
     * Removes the specified entry from the cache and updates the cache size as appropriate.
     *
     * All calls of `removeEntry` are required to go through the RemoteDocumentChangeBuffer
     * returned by `newChangeBuffer()`.
     */    removeEntry(e) {
        const t = this.docs.get(e);
        t && (this.docs = this.docs.remove(e), this.size -= t.size);
    }
    getEntry(e, t) {
        const n = this.docs.get(t);
        return PersistencePromise.resolve(n ? n.document.mutableCopy() : MutableDocument.newInvalidDocument(t));
    }
    getEntries(e, t) {
        let n = __PRIVATE_mutableDocumentMap();
        return t.forEach((e => {
            const t = this.docs.get(e);
            n = n.insert(e, t ? t.document.mutableCopy() : MutableDocument.newInvalidDocument(e));
        })), PersistencePromise.resolve(n);
    }
    getDocumentsMatchingQuery(e, t, n, r) {
        let i = __PRIVATE_mutableDocumentMap();
        // Documents are ordered by key, so we can use a prefix scan to narrow down
        // the documents we need to match the query against.
                const s = t.path, o = new DocumentKey(s.child("")), _ = this.docs.getIteratorFrom(o);
        for (;_.hasNext(); ) {
            const {key: e, value: {document: o}} = _.getNext();
            if (!s.isPrefixOf(e.path)) break;
            e.path.length > s.length + 1 || (__PRIVATE_indexOffsetComparator(__PRIVATE_newIndexOffsetFromDocument(o), n) <= 0 || (r.has(o.key) || __PRIVATE_queryMatches(t, o)) && (i = i.insert(o.key, o.mutableCopy())));
        }
        return PersistencePromise.resolve(i);
    }
    getAllFromCollectionGroup(e, t, n, r) {
        // This method should only be called from the IndexBackfiller if persistence
        // is enabled.
        fail();
    }
    vr(e, t) {
        return PersistencePromise.forEach(this.docs, (e => t(e)));
    }
    newChangeBuffer(e) {
        // `trackRemovals` is ignores since the MemoryRemoteDocumentCache keeps
        // a separate changelog and does not need special handling for removals.
        return new __PRIVATE_MemoryRemoteDocumentChangeBuffer(this);
    }
    getSize(e) {
        return PersistencePromise.resolve(this.size);
    }
}

/**
 * Creates a new memory-only RemoteDocumentCache.
 *
 * @param sizer - Used to assess the size of a document. For eager GC, this is
 * expected to just return 0 to avoid unnecessarily doing the work of
 * calculating the size.
 */
/**
 * Handles the details of adding and updating documents in the MemoryRemoteDocumentCache.
 */
class __PRIVATE_MemoryRemoteDocumentChangeBuffer extends RemoteDocumentChangeBuffer {
    constructor(e) {
        super(), this._r = e;
    }
    applyChanges(e) {
        const t = [];
        return this.changes.forEach(((n, r) => {
            r.isValidDocument() ? t.push(this._r.addEntry(e, r)) : this._r.removeEntry(n);
        })), PersistencePromise.waitFor(t);
    }
    getFromCache(e, t) {
        return this._r.getEntry(e, t);
    }
    getAllFromCache(e, t) {
        return this._r.getEntries(e, t);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class __PRIVATE_MemoryTargetCache {
    constructor(e) {
        this.persistence = e, 
        /**
         * Maps a target to the data about that target
         */
        this.Fr = new ObjectMap((e => __PRIVATE_canonifyTarget(e)), __PRIVATE_targetEquals), 
        /** The last received snapshot version. */
        this.lastRemoteSnapshotVersion = SnapshotVersion.min(), 
        /** The highest numbered target ID encountered. */
        this.highestTargetId = 0, 
        /** The highest sequence number encountered. */
        this.Mr = 0, 
        /**
         * A ordered bidirectional mapping between documents and the remote target
         * IDs.
         */
        this.Or = new __PRIVATE_ReferenceSet, this.targetCount = 0, this.Nr = __PRIVATE_TargetIdGenerator.On();
    }
    forEachTarget(e, t) {
        return this.Fr.forEach(((e, n) => t(n))), PersistencePromise.resolve();
    }
    getLastRemoteSnapshotVersion(e) {
        return PersistencePromise.resolve(this.lastRemoteSnapshotVersion);
    }
    getHighestSequenceNumber(e) {
        return PersistencePromise.resolve(this.Mr);
    }
    allocateTargetId(e) {
        return this.highestTargetId = this.Nr.next(), PersistencePromise.resolve(this.highestTargetId);
    }
    setTargetsMetadata(e, t, n) {
        return n && (this.lastRemoteSnapshotVersion = n), t > this.Mr && (this.Mr = t), 
        PersistencePromise.resolve();
    }
    kn(e) {
        this.Fr.set(e.target, e);
        const t = e.targetId;
        t > this.highestTargetId && (this.Nr = new __PRIVATE_TargetIdGenerator(t), this.highestTargetId = t), 
        e.sequenceNumber > this.Mr && (this.Mr = e.sequenceNumber);
    }
    addTargetData(e, t) {
        return this.kn(t), this.targetCount += 1, PersistencePromise.resolve();
    }
    updateTargetData(e, t) {
        return this.kn(t), PersistencePromise.resolve();
    }
    removeTargetData(e, t) {
        return this.Fr.delete(t.target), this.Or.Rr(t.targetId), this.targetCount -= 1, 
        PersistencePromise.resolve();
    }
    removeTargets(e, t, n) {
        let r = 0;
        const i = [];
        return this.Fr.forEach(((s, o) => {
            o.sequenceNumber <= t && null === n.get(o.targetId) && (this.Fr.delete(s), i.push(this.removeMatchingKeysForTargetId(e, o.targetId)), 
            r++);
        })), PersistencePromise.waitFor(i).next((() => r));
    }
    getTargetCount(e) {
        return PersistencePromise.resolve(this.targetCount);
    }
    getTargetData(e, t) {
        const n = this.Fr.get(t) || null;
        return PersistencePromise.resolve(n);
    }
    addMatchingKeys(e, t, n) {
        return this.Or.Er(t, n), PersistencePromise.resolve();
    }
    removeMatchingKeys(e, t, n) {
        this.Or.Ar(t, n);
        const r = this.persistence.referenceDelegate, i = [];
        return r && t.forEach((t => {
            i.push(r.markPotentiallyOrphaned(e, t));
        })), PersistencePromise.waitFor(i);
    }
    removeMatchingKeysForTargetId(e, t) {
        return this.Or.Rr(t), PersistencePromise.resolve();
    }
    getMatchingKeysForTargetId(e, t) {
        const n = this.Or.mr(t);
        return PersistencePromise.resolve(n);
    }
    containsKey(e, t) {
        return PersistencePromise.resolve(this.Or.containsKey(t));
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A memory-backed instance of Persistence. Data is stored only in RAM and
 * not persisted across sessions.
 */
class __PRIVATE_MemoryPersistence {
    /**
     * The constructor accepts a factory for creating a reference delegate. This
     * allows both the delegate and this instance to have strong references to
     * each other without having nullable fields that would then need to be
     * checked or asserted on every access.
     */
    constructor(e, t) {
        this.Br = {}, this.overlays = {}, this.Lr = new __PRIVATE_ListenSequence(0), this.kr = !1, 
        this.kr = !0, this.referenceDelegate = e(this), this.qr = new __PRIVATE_MemoryTargetCache(this);
        this.indexManager = new __PRIVATE_MemoryIndexManager, this.remoteDocumentCache = function __PRIVATE_newMemoryRemoteDocumentCache(e) {
            return new __PRIVATE_MemoryRemoteDocumentCacheImpl(e);
        }((e => this.referenceDelegate.Qr(e))), this.serializer = new __PRIVATE_LocalSerializer(t), 
        this.Kr = new __PRIVATE_MemoryBundleCache(this.serializer);
    }
    start() {
        return Promise.resolve();
    }
    shutdown() {
        // No durable state to ensure is closed on shutdown.
        return this.kr = !1, Promise.resolve();
    }
    get started() {
        return this.kr;
    }
    setDatabaseDeletedListener() {
        // No op.
    }
    setNetworkEnabled() {
        // No op.
    }
    getIndexManager(e) {
        // We do not currently support indices for memory persistence, so we can
        // return the same shared instance of the memory index manager.
        return this.indexManager;
    }
    getDocumentOverlayCache(e) {
        let t = this.overlays[e.toKey()];
        return t || (t = new __PRIVATE_MemoryDocumentOverlayCache, this.overlays[e.toKey()] = t), 
        t;
    }
    getMutationQueue(e, t) {
        let n = this.Br[e.toKey()];
        return n || (n = new __PRIVATE_MemoryMutationQueue(t, this.referenceDelegate), this.Br[e.toKey()] = n), 
        n;
    }
    getTargetCache() {
        return this.qr;
    }
    getRemoteDocumentCache() {
        return this.remoteDocumentCache;
    }
    getBundleCache() {
        return this.Kr;
    }
    runTransaction(e, t, n) {
        __PRIVATE_logDebug("MemoryPersistence", "Starting transaction:", e);
        const r = new __PRIVATE_MemoryTransaction(this.Lr.next());
        return this.referenceDelegate.$r(), n(r).next((e => this.referenceDelegate.Ur(r).next((() => e)))).toPromise().then((e => (r.raiseOnCommittedEvent(), 
        e)));
    }
    Wr(e, t) {
        return PersistencePromise.or(Object.values(this.Br).map((n => () => n.containsKey(e, t))));
    }
}

/**
 * Memory persistence is not actually transactional, but future implementations
 * may have transaction-scoped state.
 */ class __PRIVATE_MemoryTransaction extends PersistenceTransaction {
    constructor(e) {
        super(), this.currentSequenceNumber = e;
    }
}

class __PRIVATE_MemoryEagerDelegate {
    constructor(e) {
        this.persistence = e, 
        /** Tracks all documents that are active in Query views. */
        this.Gr = new __PRIVATE_ReferenceSet, 
        /** The list of documents that are potentially GCed after each transaction. */
        this.zr = null;
    }
    static jr(e) {
        return new __PRIVATE_MemoryEagerDelegate(e);
    }
    get Hr() {
        if (this.zr) return this.zr;
        throw fail();
    }
    addReference(e, t, n) {
        return this.Gr.addReference(n, t), this.Hr.delete(n.toString()), PersistencePromise.resolve();
    }
    removeReference(e, t, n) {
        return this.Gr.removeReference(n, t), this.Hr.add(n.toString()), PersistencePromise.resolve();
    }
    markPotentiallyOrphaned(e, t) {
        return this.Hr.add(t.toString()), PersistencePromise.resolve();
    }
    removeTarget(e, t) {
        this.Gr.Rr(t.targetId).forEach((e => this.Hr.add(e.toString())));
        const n = this.persistence.getTargetCache();
        return n.getMatchingKeysForTargetId(e, t.targetId).next((e => {
            e.forEach((e => this.Hr.add(e.toString())));
        })).next((() => n.removeTargetData(e, t)));
    }
    $r() {
        this.zr = new Set;
    }
    Ur(e) {
        // Remove newly orphaned documents.
        const t = this.persistence.getRemoteDocumentCache().newChangeBuffer();
        return PersistencePromise.forEach(this.Hr, (n => {
            const r = DocumentKey.fromPath(n);
            return this.Jr(e, r).next((e => {
                e || t.removeEntry(r, SnapshotVersion.min());
            }));
        })).next((() => (this.zr = null, t.apply(e))));
    }
    updateLimboDocument(e, t) {
        return this.Jr(e, t).next((e => {
            e ? this.Hr.delete(t.toString()) : this.Hr.add(t.toString());
        }));
    }
    Qr(e) {
        // For eager GC, we don't care about the document size, there are no size thresholds.
        return 0;
    }
    Jr(e, t) {
        return PersistencePromise.or([ () => PersistencePromise.resolve(this.Gr.containsKey(t)), () => this.persistence.getTargetCache().containsKey(e, t), () => this.persistence.Wr(e, t) ]);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A set of changes to what documents are currently in view and out of view for
 * a given query. These changes are sent to the LocalStore by the View (via
 * the SyncEngine) and are used to pin / unpin documents as appropriate.
 */
class __PRIVATE_LocalViewChanges {
    constructor(e, t, n, r) {
        this.targetId = e, this.fromCache = t, this.ki = n, this.qi = r;
    }
    static Qi(e, t) {
        let n = __PRIVATE_documentKeySet(), r = __PRIVATE_documentKeySet();
        for (const e of t.docChanges) switch (e.type) {
          case 0 /* ChangeType.Added */ :
            n = n.add(e.doc.key);
            break;

          case 1 /* ChangeType.Removed */ :
            r = r.add(e.doc.key);
 // do nothing
                }
        return new __PRIVATE_LocalViewChanges(e, t.fromCache, n, r);
    }
}

/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A tracker to keep a record of important details during database local query
 * execution.
 */ class QueryContext {
    constructor() {
        /**
         * Counts the number of documents passed through during local query execution.
         */
        this._documentReadCount = 0;
    }
    get documentReadCount() {
        return this._documentReadCount;
    }
    incrementDocumentReadCount(e) {
        this._documentReadCount += e;
    }
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * The Firestore query engine.
 *
 * Firestore queries can be executed in three modes. The Query Engine determines
 * what mode to use based on what data is persisted. The mode only determines
 * the runtime complexity of the query - the result set is equivalent across all
 * implementations.
 *
 * The Query engine will use indexed-based execution if a user has configured
 * any index that can be used to execute query (via `setIndexConfiguration()`).
 * Otherwise, the engine will try to optimize the query by re-using a previously
 * persisted query result. If that is not possible, the query will be executed
 * via a full collection scan.
 *
 * Index-based execution is the default when available. The query engine
 * supports partial indexed execution and merges the result from the index
 * lookup with documents that have not yet been indexed. The index evaluation
 * matches the backend's format and as such, the SDK can use indexing for all
 * queries that the backend supports.
 *
 * If no index exists, the query engine tries to take advantage of the target
 * document mapping in the TargetCache. These mappings exists for all queries
 * that have been synced with the backend at least once and allow the query
 * engine to only read documents that previously matched a query plus any
 * documents that were edited after the query was last listened to.
 *
 * There are some cases when this optimization is not guaranteed to produce
 * the same results as full collection scans. In these cases, query
 * processing falls back to full scans. These cases are:
 *
 * - Limit queries where a document that matched the query previously no longer
 *   matches the query.
 *
 * - Limit queries where a document edit may cause the document to sort below
 *   another document that is in the local cache.
 *
 * - Queries that have never been CURRENT or free of limbo documents.
 */
class __PRIVATE_QueryEngine {
    constructor() {
        this.Ki = !1, this.$i = !1, 
        /**
         * SDK only decides whether it should create index when collection size is
         * larger than this.
         */
        this.Ui = 100, this.Wi = 8;
    }
    /** Sets the document view to query against. */    initialize(e, t) {
        this.Gi = e, this.indexManager = t, this.Ki = !0;
    }
    /** Returns all local documents matching the specified query. */    getDocumentsMatchingQuery(e, t, n, r) {
        // Stores the result from executing the query; using this object is more
        // convenient than passing the result between steps of the persistence
        // transaction and improves readability comparatively.
        const i = {
            result: null
        };
        return this.zi(e, t).next((e => {
            i.result = e;
        })).next((() => {
            if (!i.result) return this.ji(e, t, r, n).next((e => {
                i.result = e;
            }));
        })).next((() => {
            if (i.result) return;
            const n = new QueryContext;
            return this.Hi(e, t, n).next((r => {
                if (i.result = r, this.$i) return this.Ji(e, t, n, r.size);
            }));
        })).next((() => i.result));
    }
    Ji(e, t, n, r) {
        return n.documentReadCount < this.Ui ? (__PRIVATE_getLogLevel() <= LogLevel.DEBUG && __PRIVATE_logDebug("QueryEngine", "SDK will not create cache indexes for query:", __PRIVATE_stringifyQuery(t), "since it only creates cache indexes for collection contains", "more than or equal to", this.Ui, "documents"), 
        PersistencePromise.resolve()) : (__PRIVATE_getLogLevel() <= LogLevel.DEBUG && __PRIVATE_logDebug("QueryEngine", "Query:", __PRIVATE_stringifyQuery(t), "scans", n.documentReadCount, "local documents and returns", r, "documents as results."), 
        n.documentReadCount > this.Wi * r ? (__PRIVATE_getLogLevel() <= LogLevel.DEBUG && __PRIVATE_logDebug("QueryEngine", "The SDK decides to create cache indexes for query:", __PRIVATE_stringifyQuery(t), "as using cache indexes may help improve performance."), 
        this.indexManager.createTargetIndexes(e, __PRIVATE_queryToTarget(t))) : PersistencePromise.resolve());
    }
    /**
     * Performs an indexed query that evaluates the query based on a collection's
     * persisted index values. Returns `null` if an index is not available.
     */    zi(e, t) {
        if (__PRIVATE_queryMatchesAllDocuments(t)) 
        // Queries that match all documents don't benefit from using
        // key-based lookups. It is more efficient to scan all documents in a
        // collection, rather than to perform individual lookups.
        return PersistencePromise.resolve(null);
        let n = __PRIVATE_queryToTarget(t);
        return this.indexManager.getIndexType(e, n).next((r => 0 /* IndexType.NONE */ === r ? null : (null !== t.limit && 1 /* IndexType.PARTIAL */ === r && (
        // We cannot apply a limit for targets that are served using a partial
        // index. If a partial index will be used to serve the target, the
        // query may return a superset of documents that match the target
        // (e.g. if the index doesn't include all the target's filters), or
        // may return the correct set of documents in the wrong order (e.g. if
        // the index doesn't include a segment for one of the orderBys).
        // Therefore, a limit should not be applied in such cases.
        t = __PRIVATE_queryWithLimit(t, null, "F" /* LimitType.First */), n = __PRIVATE_queryToTarget(t)), 
        this.indexManager.getDocumentsMatchingTarget(e, n).next((r => {
            const i = __PRIVATE_documentKeySet(...r);
            return this.Gi.getDocuments(e, i).next((r => this.indexManager.getMinOffset(e, n).next((n => {
                const s = this.Yi(t, r);
                return this.Zi(t, s, i, n.readTime) ? this.zi(e, __PRIVATE_queryWithLimit(t, null, "F" /* LimitType.First */)) : this.Xi(e, s, t, n);
            }))));
        })))));
    }
    /**
     * Performs a query based on the target's persisted query mapping. Returns
     * `null` if the mapping is not available or cannot be used.
     */    ji(e, t, n, r) {
        return __PRIVATE_queryMatchesAllDocuments(t) || r.isEqual(SnapshotVersion.min()) ? PersistencePromise.resolve(null) : this.Gi.getDocuments(e, n).next((i => {
            const s = this.Yi(t, i);
            return this.Zi(t, s, n, r) ? PersistencePromise.resolve(null) : (__PRIVATE_getLogLevel() <= LogLevel.DEBUG && __PRIVATE_logDebug("QueryEngine", "Re-using previous result from %s to execute query: %s", r.toString(), __PRIVATE_stringifyQuery(t)), 
            this.Xi(e, s, t, __PRIVATE_newIndexOffsetSuccessorFromReadTime(r, -1)).next((e => e)));
        }));
        // Queries that have never seen a snapshot without limbo free documents
        // should also be run as a full collection scan.
        }
    /** Applies the query filter and sorting to the provided documents.  */    Yi(e, t) {
        // Sort the documents and re-apply the query filter since previously
        // matching documents do not necessarily still match the query.
        let n = new SortedSet(__PRIVATE_newQueryComparator(e));
        return t.forEach(((t, r) => {
            __PRIVATE_queryMatches(e, r) && (n = n.add(r));
        })), n;
    }
    /**
     * Determines if a limit query needs to be refilled from cache, making it
     * ineligible for index-free execution.
     *
     * @param query - The query.
     * @param sortedPreviousResults - The documents that matched the query when it
     * was last synchronized, sorted by the query's comparator.
     * @param remoteKeys - The document keys that matched the query at the last
     * snapshot.
     * @param limboFreeSnapshotVersion - The version of the snapshot when the
     * query was last synchronized.
     */    Zi(e, t, n, r) {
        if (null === e.limit) 
        // Queries without limits do not need to be refilled.
        return !1;
        if (n.size !== t.size) 
        // The query needs to be refilled if a previously matching document no
        // longer matches.
        return !0;
        // Limit queries are not eligible for index-free query execution if there is
        // a potential that an older document from cache now sorts before a document
        // that was previously part of the limit. This, however, can only happen if
        // the document at the edge of the limit goes out of limit.
        // If a document that is not the limit boundary sorts differently,
        // the boundary of the limit itself did not change and documents from cache
        // will continue to be "rejected" by this boundary. Therefore, we can ignore
        // any modifications that don't affect the last document.
                const i = "F" /* LimitType.First */ === e.limitType ? t.last() : t.first();
        return !!i && (i.hasPendingWrites || i.version.compareTo(r) > 0);
    }
    Hi(e, t, n) {
        return __PRIVATE_getLogLevel() <= LogLevel.DEBUG && __PRIVATE_logDebug("QueryEngine", "Using full collection scan to execute query:", __PRIVATE_stringifyQuery(t)), 
        this.Gi.getDocumentsMatchingQuery(e, t, IndexOffset.min(), n);
    }
    /**
     * Combines the results from an indexed execution with the remaining documents
     * that have not yet been indexed.
     */    Xi(e, t, n, r) {
        // Retrieve all results for documents that were updated since the offset.
        return this.Gi.getDocumentsMatchingQuery(e, n, r).next((e => (
        // Merge with existing results
        t.forEach((t => {
            e = e.insert(t.key, t);
        })), e)));
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Implements `LocalStore` interface.
 *
 * Note: some field defined in this class might have public access level, but
 * the class is not exported so they are only accessible from this module.
 * This is useful to implement optional features (like bundles) in free
 * functions, such that they are tree-shakeable.
 */
class __PRIVATE_LocalStoreImpl {
    constructor(
    /** Manages our in-memory or durable persistence. */
    e, t, n, r) {
        this.persistence = e, this.es = t, this.serializer = r, 
        /**
         * Maps a targetID to data about its target.
         *
         * PORTING NOTE: We are using an immutable data structure on Web to make re-runs
         * of `applyRemoteEvent()` idempotent.
         */
        this.ts = new SortedMap(__PRIVATE_primitiveComparator), 
        /** Maps a target to its targetID. */
        // TODO(wuandy): Evaluate if TargetId can be part of Target.
        this.ns = new ObjectMap((e => __PRIVATE_canonifyTarget(e)), __PRIVATE_targetEquals), 
        /**
         * A per collection group index of the last read time processed by
         * `getNewDocumentChanges()`.
         *
         * PORTING NOTE: This is only used for multi-tab synchronization.
         */
        this.rs = new Map, this.ss = e.getRemoteDocumentCache(), this.qr = e.getTargetCache(), 
        this.Kr = e.getBundleCache(), this.os(n);
    }
    os(e) {
        // TODO(indexing): Add spec tests that test these components change after a
        // user change
        this.documentOverlayCache = this.persistence.getDocumentOverlayCache(e), this.indexManager = this.persistence.getIndexManager(e), 
        this.mutationQueue = this.persistence.getMutationQueue(e, this.indexManager), this.localDocuments = new LocalDocumentsView(this.ss, this.mutationQueue, this.documentOverlayCache, this.indexManager), 
        this.ss.setIndexManager(this.indexManager), this.es.initialize(this.localDocuments, this.indexManager);
    }
    collectGarbage(e) {
        return this.persistence.runTransaction("Collect garbage", "readwrite-primary", (t => e.collect(t, this.ts)));
    }
}

function __PRIVATE_newLocalStore(
/** Manages our in-memory or durable persistence. */
e, t, n, r) {
    return new __PRIVATE_LocalStoreImpl(e, t, n, r);
}

/**
 * Tells the LocalStore that the currently authenticated user has changed.
 *
 * In response the local store switches the mutation queue to the new user and
 * returns any resulting document changes.
 */
// PORTING NOTE: Android and iOS only return the documents affected by the
// change.
async function __PRIVATE_localStoreHandleUserChange(e, t) {
    const n = __PRIVATE_debugCast(e);
    return await n.persistence.runTransaction("Handle user change", "readonly", (e => {
        // Swap out the mutation queue, grabbing the pending mutation batches
        // before and after.
        let r;
        return n.mutationQueue.getAllMutationBatches(e).next((i => (r = i, n.os(t), n.mutationQueue.getAllMutationBatches(e)))).next((t => {
            const i = [], s = [];
            // Union the old/new changed keys.
            let o = __PRIVATE_documentKeySet();
            for (const e of r) {
                i.push(e.batchId);
                for (const t of e.mutations) o = o.add(t.key);
            }
            for (const e of t) {
                s.push(e.batchId);
                for (const t of e.mutations) o = o.add(t.key);
            }
            // Return the set of all (potentially) changed documents and the list
            // of mutation batch IDs that were affected by change.
                        return n.localDocuments.getDocuments(e, o).next((e => ({
                _s: e,
                removedBatchIds: i,
                addedBatchIds: s
            })));
        }));
    }));
}

/**
 * Returns the last consistent snapshot processed (used by the RemoteStore to
 * determine whether to buffer incoming snapshots from the backend).
 */
function __PRIVATE_localStoreGetLastRemoteSnapshotVersion(e) {
    const t = __PRIVATE_debugCast(e);
    return t.persistence.runTransaction("Get last remote snapshot version", "readonly", (e => t.qr.getLastRemoteSnapshotVersion(e)));
}

/**
 * Updates the "ground-state" (remote) documents. We assume that the remote
 * event reflects any write batches that have been acknowledged or rejected
 * (i.e. we do not re-apply local mutations to updates from this event).
 *
 * LocalDocuments are re-calculated if there are remaining mutations in the
 * queue.
 */ function __PRIVATE_localStoreApplyRemoteEventToLocalCache(e, t) {
    const n = __PRIVATE_debugCast(e), r = t.snapshotVersion;
    let i = n.ts;
    return n.persistence.runTransaction("Apply remote event", "readwrite-primary", (e => {
        const s = n.ss.newChangeBuffer({
            trackRemovals: !0
        });
        // Reset newTargetDataByTargetMap in case this transaction gets re-run.
                i = n.ts;
        const o = [];
        t.targetChanges.forEach(((s, _) => {
            const a = i.get(_);
            if (!a) return;
            // Only update the remote keys if the target is still active. This
            // ensures that we can persist the updated target data along with
            // the updated assignment.
                        o.push(n.qr.removeMatchingKeys(e, s.removedDocuments, _).next((() => n.qr.addMatchingKeys(e, s.addedDocuments, _))));
            let u = a.withSequenceNumber(e.currentSequenceNumber);
            null !== t.targetMismatches.get(_) ? u = u.withResumeToken(ByteString.EMPTY_BYTE_STRING, SnapshotVersion.min()).withLastLimboFreeSnapshotVersion(SnapshotVersion.min()) : s.resumeToken.approximateByteSize() > 0 && (u = u.withResumeToken(s.resumeToken, r)), 
            i = i.insert(_, u), 
            // Update the target data if there are target changes (or if
            // sufficient time has passed since the last update).
            /**
 * Returns true if the newTargetData should be persisted during an update of
 * an active target. TargetData should always be persisted when a target is
 * being released and should not call this function.
 *
 * While the target is active, TargetData updates can be omitted when nothing
 * about the target has changed except metadata like the resume token or
 * snapshot version. Occasionally it's worth the extra write to prevent these
 * values from getting too stale after a crash, but this doesn't have to be
 * too frequent.
 */
            function __PRIVATE_shouldPersistTargetData(e, t, n) {
                // Always persist target data if we don't already have a resume token.
                if (0 === e.resumeToken.approximateByteSize()) return !0;
                // Don't allow resume token changes to be buffered indefinitely. This
                // allows us to be reasonably up-to-date after a crash and avoids needing
                // to loop over all active queries on shutdown. Especially in the browser
                // we may not get time to do anything interesting while the current tab is
                // closing.
                                if (t.snapshotVersion.toMicroseconds() - e.snapshotVersion.toMicroseconds() >= 3e8) return !0;
                // Otherwise if the only thing that has changed about a target is its resume
                // token it's not worth persisting. Note that the RemoteStore keeps an
                // in-memory view of the currently active targets which includes the current
                // resume token, so stream failure or user changes will still use an
                // up-to-date resume token regardless of what we do here.
                                return n.addedDocuments.size + n.modifiedDocuments.size + n.removedDocuments.size > 0;
            }
            /**
 * Notifies local store of the changed views to locally pin documents.
 */ (a, u, s) && o.push(n.qr.updateTargetData(e, u));
        }));
        let _ = __PRIVATE_mutableDocumentMap(), a = __PRIVATE_documentKeySet();
        // HACK: The only reason we allow a null snapshot version is so that we
        // can synthesize remote events when we get permission denied errors while
        // trying to resolve the state of a locally cached document that is in
        // limbo.
        if (t.documentUpdates.forEach((r => {
            t.resolvedLimboDocuments.has(r) && o.push(n.persistence.referenceDelegate.updateLimboDocument(e, r));
        })), 
        // Each loop iteration only affects its "own" doc, so it's safe to get all
        // the remote documents in advance in a single call.
        o.push(__PRIVATE_populateDocumentChangeBuffer(e, s, t.documentUpdates).next((e => {
            _ = e.us, a = e.cs;
        }))), !r.isEqual(SnapshotVersion.min())) {
            const t = n.qr.getLastRemoteSnapshotVersion(e).next((t => n.qr.setTargetsMetadata(e, e.currentSequenceNumber, r)));
            o.push(t);
        }
        return PersistencePromise.waitFor(o).next((() => s.apply(e))).next((() => n.localDocuments.getLocalViewOfDocuments(e, _, a))).next((() => _));
    })).then((e => (n.ts = i, e)));
}

/**
 * Populates document change buffer with documents from backend or a bundle.
 * Returns the document changes resulting from applying those documents, and
 * also a set of documents whose existence state are changed as a result.
 *
 * @param txn - Transaction to use to read existing documents from storage.
 * @param documentBuffer - Document buffer to collect the resulted changes to be
 *        applied to storage.
 * @param documents - Documents to be applied.
 */ function __PRIVATE_populateDocumentChangeBuffer(e, t, n) {
    let r = __PRIVATE_documentKeySet(), i = __PRIVATE_documentKeySet();
    return n.forEach((e => r = r.add(e))), t.getEntries(e, r).next((e => {
        let r = __PRIVATE_mutableDocumentMap();
        return n.forEach(((n, s) => {
            const o = e.get(n);
            // Check if see if there is a existence state change for this document.
                        s.isFoundDocument() !== o.isFoundDocument() && (i = i.add(n)), 
            // Note: The order of the steps below is important, since we want
            // to ensure that rejected limbo resolutions (which fabricate
            // NoDocuments with SnapshotVersion.min()) never add documents to
            // cache.
            s.isNoDocument() && s.version.isEqual(SnapshotVersion.min()) ? (
            // NoDocuments with SnapshotVersion.min() are used in manufactured
            // events. We remove these documents from cache since we lost
            // access.
            t.removeEntry(n, s.readTime), r = r.insert(n, s)) : !o.isValidDocument() || s.version.compareTo(o.version) > 0 || 0 === s.version.compareTo(o.version) && o.hasPendingWrites ? (t.addEntry(s), 
            r = r.insert(n, s)) : __PRIVATE_logDebug("LocalStore", "Ignoring outdated watch update for ", n, ". Current version:", o.version, " Watch version:", s.version);
        })), {
            us: r,
            cs: i
        };
    }));
}

/**
 * Reads the current value of a Document with a given key or null if not
 * found - used for testing.
 */
/**
 * Assigns the given target an internal ID so that its results can be pinned so
 * they don't get GC'd. A target must be allocated in the local store before
 * the store can be used to manage its view.
 *
 * Allocating an already allocated `Target` will return the existing `TargetData`
 * for that `Target`.
 */
function __PRIVATE_localStoreAllocateTarget(e, t) {
    const n = __PRIVATE_debugCast(e);
    return n.persistence.runTransaction("Allocate target", "readwrite", (e => {
        let r;
        return n.qr.getTargetData(e, t).next((i => i ? (
        // This target has been listened to previously, so reuse the
        // previous targetID.
        // TODO(mcg): freshen last accessed date?
        r = i, PersistencePromise.resolve(r)) : n.qr.allocateTargetId(e).next((i => (r = new TargetData(t, i, "TargetPurposeListen" /* TargetPurpose.Listen */ , e.currentSequenceNumber), 
        n.qr.addTargetData(e, r).next((() => r)))))));
    })).then((e => {
        // If Multi-Tab is enabled, the existing target data may be newer than
        // the in-memory data
        const r = n.ts.get(e.targetId);
        return (null === r || e.snapshotVersion.compareTo(r.snapshotVersion) > 0) && (n.ts = n.ts.insert(e.targetId, e), 
        n.ns.set(t, e.targetId)), e;
    }));
}

/**
 * Returns the TargetData as seen by the LocalStore, including updates that may
 * have not yet been persisted to the TargetCache.
 */
// Visible for testing.
/**
 * Unpins all the documents associated with the given target. If
 * `keepPersistedTargetData` is set to false and Eager GC enabled, the method
 * directly removes the associated target data from the target cache.
 *
 * Releasing a non-existing `Target` is a no-op.
 */
// PORTING NOTE: `keepPersistedTargetData` is multi-tab only.
async function __PRIVATE_localStoreReleaseTarget(e, t, n) {
    const r = __PRIVATE_debugCast(e), i = r.ts.get(t), s = n ? "readwrite" : "readwrite-primary";
    try {
        n || await r.persistence.runTransaction("Release target", s, (e => r.persistence.referenceDelegate.removeTarget(e, i)));
    } catch (e) {
        if (!__PRIVATE_isIndexedDbTransactionError(e)) throw e;
        // All `releaseTarget` does is record the final metadata state for the
        // target, but we've been recording this periodically during target
        // activity. If we lose this write this could cause a very slight
        // difference in the order of target deletion during GC, but we
        // don't define exact LRU semantics so this is acceptable.
        __PRIVATE_logDebug("LocalStore", `Failed to update sequence numbers for target ${t}: ${e}`);
    }
    r.ts = r.ts.remove(t), r.ns.delete(i.target);
}

/**
 * Runs the specified query against the local store and returns the results,
 * potentially taking advantage of query data from previous executions (such
 * as the set of remote keys).
 *
 * @param usePreviousResults - Whether results from previous executions can
 * be used to optimize this query execution.
 */ function __PRIVATE_localStoreExecuteQuery(e, t, n) {
    const r = __PRIVATE_debugCast(e);
    let i = SnapshotVersion.min(), s = __PRIVATE_documentKeySet();
    return r.persistence.runTransaction("Execute query", "readwrite", (// Use readwrite instead of readonly so indexes can be created
    // Use readwrite instead of readonly so indexes can be created
    e => function __PRIVATE_localStoreGetTargetData(e, t, n) {
        const r = __PRIVATE_debugCast(e), i = r.ns.get(n);
        return void 0 !== i ? PersistencePromise.resolve(r.ts.get(i)) : r.qr.getTargetData(t, n);
    }(r, e, __PRIVATE_queryToTarget(t)).next((t => {
        if (t) return i = t.lastLimboFreeSnapshotVersion, r.qr.getMatchingKeysForTargetId(e, t.targetId).next((e => {
            s = e;
        }));
    })).next((() => r.es.getDocumentsMatchingQuery(e, t, n ? i : SnapshotVersion.min(), n ? s : __PRIVATE_documentKeySet()))).next((e => (__PRIVATE_setMaxReadTime(r, __PRIVATE_queryCollectionGroup(t), e), 
    {
        documents: e,
        ls: s
    })))));
}

/** Sets the collection group's maximum read time from the given documents. */
// PORTING NOTE: Multi-Tab only.
function __PRIVATE_setMaxReadTime(e, t, n) {
    let r = e.rs.get(t) || SnapshotVersion.min();
    n.forEach(((e, t) => {
        t.readTime.compareTo(r) > 0 && (r = t.readTime);
    })), e.rs.set(t, r);
}

/**
 * Metadata state of the local client. Unlike `RemoteClientState`, this class is
 * mutable and keeps track of all pending mutations, which allows us to
 * update the range of pending mutation batch IDs as new mutations are added or
 * removed.
 *
 * The data in `LocalClientState` is not read from WebStorage and instead
 * updated via its instance methods. The updated state can be serialized via
 * `toWebStorageJSON()`.
 */
// Visible for testing.
class __PRIVATE_LocalClientState {
    constructor() {
        this.activeTargetIds = __PRIVATE_targetIdSet();
    }
    ds(e) {
        this.activeTargetIds = this.activeTargetIds.add(e);
    }
    As(e) {
        this.activeTargetIds = this.activeTargetIds.delete(e);
    }
    /**
     * Converts this entry into a JSON-encoded format we can use for WebStorage.
     * Does not encode `clientId` as it is part of the key in WebStorage.
     */    Es() {
        const e = {
            activeTargetIds: this.activeTargetIds.toArray(),
            updateTimeMs: Date.now()
        };
        return JSON.stringify(e);
    }
}

class __PRIVATE_MemorySharedClientState {
    constructor() {
        this.eo = new __PRIVATE_LocalClientState, this.no = {}, this.onlineStateHandler = null, 
        this.sequenceNumberHandler = null;
    }
    addPendingMutation(e) {
        // No op.
    }
    updateMutationState(e, t, n) {
        // No op.
    }
    addLocalQueryTarget(e) {
        return this.eo.ds(e), this.no[e] || "not-current";
    }
    updateQueryState(e, t, n) {
        this.no[e] = t;
    }
    removeLocalQueryTarget(e) {
        this.eo.As(e);
    }
    isLocalQueryTarget(e) {
        return this.eo.activeTargetIds.has(e);
    }
    clearQueryState(e) {
        delete this.no[e];
    }
    getAllActiveQueryTargets() {
        return this.eo.activeTargetIds;
    }
    isActiveQueryTarget(e) {
        return this.eo.activeTargetIds.has(e);
    }
    start() {
        return this.eo = new __PRIVATE_LocalClientState, Promise.resolve();
    }
    handleUserChange(e, t, n) {
        // No op.
    }
    setOnlineState(e) {
        // No op.
    }
    shutdown() {}
    writeSequenceNumber(e) {}
    notifyBundleLoaded(e) {
        // No op.
    }
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class __PRIVATE_NoopConnectivityMonitor {
    ro(e) {
        // No-op.
    }
    shutdown() {
        // No-op.
    }
}

/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// References to `window` are guarded by BrowserConnectivityMonitor.isAvailable()
/* eslint-disable no-restricted-globals */
/**
 * Browser implementation of ConnectivityMonitor.
 */
class __PRIVATE_BrowserConnectivityMonitor {
    constructor() {
        this.io = () => this.so(), this.oo = () => this._o(), this.ao = [], this.uo();
    }
    ro(e) {
        this.ao.push(e);
    }
    shutdown() {
        window.removeEventListener("online", this.io), window.removeEventListener("offline", this.oo);
    }
    uo() {
        window.addEventListener("online", this.io), window.addEventListener("offline", this.oo);
    }
    so() {
        __PRIVATE_logDebug("ConnectivityMonitor", "Network connectivity changed: AVAILABLE");
        for (const e of this.ao) e(0 /* NetworkStatus.AVAILABLE */);
    }
    _o() {
        __PRIVATE_logDebug("ConnectivityMonitor", "Network connectivity changed: UNAVAILABLE");
        for (const e of this.ao) e(1 /* NetworkStatus.UNAVAILABLE */);
    }
    // TODO(chenbrian): Consider passing in window either into this component or
    // here for testing via FakeWindow.
    /** Checks that all used attributes of window are available. */
    static D() {
        return "undefined" != typeof window && void 0 !== window.addEventListener && void 0 !== window.removeEventListener;
    }
}

/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * The value returned from the most recent invocation of
 * `generateUniqueDebugId()`, or null if it has never been invoked.
 */ let Ae = null;

/**
 * Generates and returns an initial value for `lastUniqueDebugId`.
 *
 * The returned value is randomly selected from a range of integers that are
 * represented as 8 hexadecimal digits. This means that (within reason) any
 * numbers generated by incrementing the returned number by 1 will also be
 * represented by 8 hexadecimal digits. This leads to all "IDs" having the same
 * length when converted to a hexadecimal string, making reading logs containing
 * these IDs easier to follow. And since the return value is randomly selected
 * it will help to differentiate between logs from different executions.
 */
/**
 * Generates and returns a unique ID as a hexadecimal string.
 *
 * The returned ID is intended to be used in debug logging messages to help
 * correlate log messages that may be spatially separated in the logs, but
 * logically related. For example, a network connection could include the same
 * "debug ID" string in all of its log messages to help trace a specific
 * connection over time.
 *
 * @return the 10-character generated ID (e.g. "0xa1b2c3d4").
 */
function __PRIVATE_generateUniqueDebugId() {
    return null === Ae ? Ae = function __PRIVATE_generateInitialUniqueDebugId() {
        return 268435456 + Math.round(2147483648 * Math.random());
    }() : Ae++, "0x" + Ae.toString(16);
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Re = {
    BatchGetDocuments: "batchGet",
    Commit: "commit",
    RunQuery: "runQuery",
    RunAggregationQuery: "runAggregationQuery"
};

/**
 * Maps RPC names to the corresponding REST endpoint name.
 *
 * We use array notation to avoid mangling.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Provides a simple helper class that implements the Stream interface to
 * bridge to other implementations that are streams but do not implement the
 * interface. The stream callbacks are invoked with the callOn... methods.
 */
class __PRIVATE_StreamBridge {
    constructor(e) {
        this.co = e.co, this.lo = e.lo;
    }
    ho(e) {
        this.Po = e;
    }
    Io(e) {
        this.To = e;
    }
    onMessage(e) {
        this.Eo = e;
    }
    close() {
        this.lo();
    }
    send(e) {
        this.co(e);
    }
    Ao() {
        this.Po();
    }
    Ro(e) {
        this.To(e);
    }
    Vo(e) {
        this.Eo(e);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Ve = "WebChannelConnection";

class __PRIVATE_WebChannelConnection extends 
/**
 * Base class for all Rest-based connections to the backend (WebChannel and
 * HTTP).
 */
class __PRIVATE_RestConnection {
    constructor(e) {
        this.databaseInfo = e, this.databaseId = e.databaseId;
        const t = e.ssl ? "https" : "http", n = encodeURIComponent(this.databaseId.projectId), r = encodeURIComponent(this.databaseId.database);
        this.mo = t + "://" + e.host, this.fo = `projects/${n}/databases/${r}`, this.po = "(default)" === this.databaseId.database ? `project_id=${n}` : `project_id=${n}&database_id=${r}`;
    }
    get yo() {
        // Both `invokeRPC()` and `invokeStreamingRPC()` use their `path` arguments to determine
        // where to run the query, and expect the `request` to NOT specify the "path".
        return !1;
    }
    wo(e, t, n, r, i) {
        const s = __PRIVATE_generateUniqueDebugId(), o = this.So(e, t);
        __PRIVATE_logDebug("RestConnection", `Sending RPC '${e}' ${s}:`, o, n);
        const _ = {
            "google-cloud-resource-prefix": this.fo,
            "x-goog-request-params": this.po
        };
        return this.bo(_, r, i), this.Do(e, o, _, n).then((t => (__PRIVATE_logDebug("RestConnection", `Received RPC '${e}' ${s}: `, t), 
        t)), (t => {
            throw __PRIVATE_logWarn("RestConnection", `RPC '${e}' ${s} failed with error: `, t, "url: ", o, "request:", n), 
            t;
        }));
    }
    Co(e, t, n, r, i, s) {
        // The REST API automatically aggregates all of the streamed results, so we
        // can just use the normal invoke() method.
        return this.wo(e, t, n, r, i);
    }
    /**
     * Modifies the headers for a request, adding any authorization token if
     * present and any additional headers for the request.
     */    bo(e, t, n) {
        e["X-Goog-Api-Client"] = 
        // SDK_VERSION is updated to different value at runtime depending on the entry point,
        // so we need to get its value when we need it in a function.
        function __PRIVATE_getGoogApiClientValue() {
            return "gl-js/ fire/" + S$1;
        }(), 
        // Content-Type: text/plain will avoid preflight requests which might
        // mess with CORS and redirects by proxies. If we add custom headers
        // we will need to change this code to potentially use the $httpOverwrite
        // parameter supported by ESF to avoid triggering preflight requests.
        e["Content-Type"] = "text/plain", this.databaseInfo.appId && (e["X-Firebase-GMPID"] = this.databaseInfo.appId), 
        t && t.headers.forEach(((t, n) => e[n] = t)), n && n.headers.forEach(((t, n) => e[n] = t));
    }
    So(e, t) {
        const n = Re[e];
        return `${this.mo}/v1/${t}:${n}`;
    }
} {
    constructor(e) {
        super(e), this.forceLongPolling = e.forceLongPolling, this.autoDetectLongPolling = e.autoDetectLongPolling, 
        this.useFetchStreams = e.useFetchStreams, this.longPollingOptions = e.longPollingOptions;
    }
    Do(e, t, n, r) {
        const i = __PRIVATE_generateUniqueDebugId();
        return new Promise(((s, o) => {
            const _ = new XhrIo;
            _.setWithCredentials(!0), _.listenOnce(EventType.COMPLETE, (() => {
                try {
                    switch (_.getLastErrorCode()) {
                      case ErrorCode.NO_ERROR:
                        const t = _.getResponseJson();
                        __PRIVATE_logDebug(Ve, `XHR for RPC '${e}' ${i} received:`, JSON.stringify(t)), 
                        s(t);
                        break;

                      case ErrorCode.TIMEOUT:
                        __PRIVATE_logDebug(Ve, `RPC '${e}' ${i} timed out`), o(new FirestoreError(D.DEADLINE_EXCEEDED, "Request time out"));
                        break;

                      case ErrorCode.HTTP_ERROR:
                        const n = _.getStatus();
                        if (__PRIVATE_logDebug(Ve, `RPC '${e}' ${i} failed with status:`, n, "response text:", _.getResponseText()), 
                        n > 0) {
                            let e = _.getResponseJson();
                            Array.isArray(e) && (e = e[0]);
                            const t = null == e ? void 0 : e.error;
                            if (t && t.status && t.message) {
                                const e = function __PRIVATE_mapCodeFromHttpResponseErrorStatus(e) {
                                    const t = e.toLowerCase().replace(/_/g, "-");
                                    return Object.values(D).indexOf(t) >= 0 ? t : D.UNKNOWN;
                                }(t.status);
                                o(new FirestoreError(e, t.message));
                            } else o(new FirestoreError(D.UNKNOWN, "Server responded with status " + _.getStatus()));
                        } else 
                        // If we received an HTTP_ERROR but there's no status code,
                        // it's most probably a connection issue
                        o(new FirestoreError(D.UNAVAILABLE, "Connection failed."));
                        break;

                      default:
                        fail();
                    }
                } finally {
                    __PRIVATE_logDebug(Ve, `RPC '${e}' ${i} completed.`);
                }
            }));
            const a = JSON.stringify(r);
            __PRIVATE_logDebug(Ve, `RPC '${e}' ${i} sending request:`, r), _.send(t, "POST", a, n, 15);
        }));
    }
    vo(e, t, n) {
        const r = __PRIVATE_generateUniqueDebugId(), i = [ this.mo, "/", "google.firestore.v1.Firestore", "/", e, "/channel" ], s = createWebChannelTransport(), o = getStatEventTarget(), _ = {
            // Required for backend stickiness, routing behavior is based on this
            // parameter.
            httpSessionIdParam: "gsessionid",
            initMessageHeaders: {},
            messageUrlParams: {
                // This param is used to improve routing and project isolation by the
                // backend and must be included in every request.
                database: `projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`
            },
            sendRawJson: !0,
            supportsCrossDomainXhr: !0,
            internalChannelParams: {
                // Override the default timeout (randomized between 10-20 seconds) since
                // a large write batch on a slow internet connection may take a long
                // time to send to the backend. Rather than have WebChannel impose a
                // tight timeout which could lead to infinite timeouts and retries, we
                // set it very large (5-10 minutes) and rely on the browser's builtin
                // timeouts to kick in if the request isn't working.
                forwardChannelRequestTimeoutMs: 6e5
            },
            forceLongPolling: this.forceLongPolling,
            detectBufferingProxy: this.autoDetectLongPolling
        }, a = this.longPollingOptions.timeoutSeconds;
        void 0 !== a && (_.longPollingTimeout = Math.round(1e3 * a)), this.useFetchStreams && (_.useFetchStreams = !0), 
        this.bo(_.initMessageHeaders, t, n), 
        // Sending the custom headers we just added to request.initMessageHeaders
        // (Authorization, etc.) will trigger the browser to make a CORS preflight
        // request because the XHR will no longer meet the criteria for a "simple"
        // CORS request:
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
        // Therefore to avoid the CORS preflight request (an extra network
        // roundtrip), we use the encodeInitMessageHeaders option to specify that
        // the headers should instead be encoded in the request's POST payload,
        // which is recognized by the webchannel backend.
        _.encodeInitMessageHeaders = !0;
        const u = i.join("");
        __PRIVATE_logDebug(Ve, `Creating RPC '${e}' stream ${r}: ${u}`, _);
        const c = s.createWebChannel(u, _);
        // WebChannel supports sending the first message with the handshake - saving
        // a network round trip. However, it will have to call send in the same
        // JS event loop as open. In order to enforce this, we delay actually
        // opening the WebChannel until send is called. Whether we have called
        // open is tracked with this variable.
                let l = !1, h = !1;
        // A flag to determine whether the stream was closed (by us or through an
        // error/close event) to avoid delivering multiple close events or sending
        // on a closed stream
                const P = new __PRIVATE_StreamBridge({
            co: t => {
                h ? __PRIVATE_logDebug(Ve, `Not sending because RPC '${e}' stream ${r} is closed:`, t) : (l || (__PRIVATE_logDebug(Ve, `Opening RPC '${e}' stream ${r} transport.`), 
                c.open(), l = !0), __PRIVATE_logDebug(Ve, `RPC '${e}' stream ${r} sending:`, t), 
                c.send(t));
            },
            lo: () => c.close()
        }), __PRIVATE_unguardedEventListen = (e, t, n) => {
            // TODO(dimond): closure typing seems broken because WebChannel does
            // not implement goog.events.Listenable
            e.listen(t, (e => {
                try {
                    n(e);
                } catch (e) {
                    setTimeout((() => {
                        throw e;
                    }), 0);
                }
            }));
        };
        // Closure events are guarded and exceptions are swallowed, so catch any
        // exception and rethrow using a setTimeout so they become visible again.
        // Note that eventually this function could go away if we are confident
        // enough the code is exception free.
                return __PRIVATE_unguardedEventListen(c, WebChannel.EventType.OPEN, (() => {
            h || __PRIVATE_logDebug(Ve, `RPC '${e}' stream ${r} transport opened.`);
        })), __PRIVATE_unguardedEventListen(c, WebChannel.EventType.CLOSE, (() => {
            h || (h = !0, __PRIVATE_logDebug(Ve, `RPC '${e}' stream ${r} transport closed`), 
            P.Ro());
        })), __PRIVATE_unguardedEventListen(c, WebChannel.EventType.ERROR, (t => {
            h || (h = !0, __PRIVATE_logWarn(Ve, `RPC '${e}' stream ${r} transport errored:`, t), 
            P.Ro(new FirestoreError(D.UNAVAILABLE, "The operation could not be completed")));
        })), __PRIVATE_unguardedEventListen(c, WebChannel.EventType.MESSAGE, (t => {
            var n;
            if (!h) {
                const i = t.data[0];
                __PRIVATE_hardAssert(!!i);
                // TODO(b/35143891): There is a bug in One Platform that caused errors
                // (and only errors) to be wrapped in an extra array. To be forward
                // compatible with the bug we need to check either condition. The latter
                // can be removed once the fix has been rolled out.
                // Use any because msgData.error is not typed.
                const s = i, o = s.error || (null === (n = s[0]) || void 0 === n ? void 0 : n.error);
                if (o) {
                    __PRIVATE_logDebug(Ve, `RPC '${e}' stream ${r} received error:`, o);
                    // error.status will be a string like 'OK' or 'NOT_FOUND'.
                    const t = o.status;
                    let n = 
                    /**
 * Maps an error Code from a GRPC status identifier like 'NOT_FOUND'.
 *
 * @returns The Code equivalent to the given status string or undefined if
 *     there is no match.
 */
                    function __PRIVATE_mapCodeFromRpcStatus(e) {
                        // lookup by string
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const t = ae[e];
                        if (void 0 !== t) return __PRIVATE_mapCodeFromRpcCode(t);
                    }(t), i = o.message;
                    void 0 === n && (n = D.INTERNAL, i = "Unknown error status: " + t + " with message " + o.message), 
                    // Mark closed so no further events are propagated
                    h = !0, P.Ro(new FirestoreError(n, i)), c.close();
                } else __PRIVATE_logDebug(Ve, `RPC '${e}' stream ${r} received:`, i), P.Vo(i);
            }
        })), __PRIVATE_unguardedEventListen(o, Event.STAT_EVENT, (t => {
            t.stat === Stat.PROXY ? __PRIVATE_logDebug(Ve, `RPC '${e}' stream ${r} detected buffering proxy`) : t.stat === Stat.NOPROXY && __PRIVATE_logDebug(Ve, `RPC '${e}' stream ${r} detected no buffering proxy`);
        })), setTimeout((() => {
            // Technically we could/should wait for the WebChannel opened event,
            // but because we want to send the first message with the WebChannel
            // handshake we pretend the channel opened here (asynchronously), and
            // then delay the actual open until the first message is sent.
            P.Ao();
        }), 0), P;
    }
}

/** The Platform's 'document' implementation or null if not available. */ function getDocument() {
    // `document` is not always available, e.g. in ReactNative and WebWorkers.
    // eslint-disable-next-line no-restricted-globals
    return "undefined" != typeof document ? document : null;
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function __PRIVATE_newSerializer(e) {
    return new JsonProtoSerializer(e, /* useProto3Json= */ !0);
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A helper for running delayed tasks following an exponential backoff curve
 * between attempts.
 *
 * Each delay is made up of a "base" delay which follows the exponential
 * backoff curve, and a +/- 50% "jitter" that is calculated and added to the
 * base delay. This prevents clients from accidentally synchronizing their
 * delays causing spikes of load to the backend.
 */
class __PRIVATE_ExponentialBackoff {
    constructor(
    /**
     * The AsyncQueue to run backoff operations on.
     */
    e, 
    /**
     * The ID to use when scheduling backoff operations on the AsyncQueue.
     */
    t, 
    /**
     * The initial delay (used as the base delay on the first retry attempt).
     * Note that jitter will still be applied, so the actual delay could be as
     * little as 0.5*initialDelayMs.
     */
    n = 1e3
    /**
     * The multiplier to use to determine the extended base delay after each
     * attempt.
     */ , r = 1.5
    /**
     * The maximum base delay after which no further backoff is performed.
     * Note that jitter will still be applied, so the actual delay could be as
     * much as 1.5*maxDelayMs.
     */ , i = 6e4) {
        this.si = e, this.timerId = t, this.Fo = n, this.Mo = r, this.xo = i, this.Oo = 0, 
        this.No = null, 
        /** The last backoff attempt, as epoch milliseconds. */
        this.Bo = Date.now(), this.reset();
    }
    /**
     * Resets the backoff delay.
     *
     * The very next backoffAndWait() will have no delay. If it is called again
     * (i.e. due to an error), initialDelayMs (plus jitter) will be used, and
     * subsequent ones will increase according to the backoffFactor.
     */    reset() {
        this.Oo = 0;
    }
    /**
     * Resets the backoff delay to the maximum delay (e.g. for use after a
     * RESOURCE_EXHAUSTED error).
     */    Lo() {
        this.Oo = this.xo;
    }
    /**
     * Returns a promise that resolves after currentDelayMs, and increases the
     * delay for any subsequent attempts. If there was a pending backoff operation
     * already, it will be canceled.
     */    ko(e) {
        // Cancel any pending backoff operation.
        this.cancel();
        // First schedule using the current base (which may be 0 and should be
        // honored as such).
        const t = Math.floor(this.Oo + this.qo()), n = Math.max(0, Date.now() - this.Bo), r = Math.max(0, t - n);
        // Guard against lastAttemptTime being in the future due to a clock change.
                r > 0 && __PRIVATE_logDebug("ExponentialBackoff", `Backing off for ${r} ms (base delay: ${this.Oo} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`), 
        this.No = this.si.enqueueAfterDelay(this.timerId, r, (() => (this.Bo = Date.now(), 
        e()))), 
        // Apply backoff factor to determine next delay and ensure it is within
        // bounds.
        this.Oo *= this.Mo, this.Oo < this.Fo && (this.Oo = this.Fo), this.Oo > this.xo && (this.Oo = this.xo);
    }
    Qo() {
        null !== this.No && (this.No.skipDelay(), this.No = null);
    }
    cancel() {
        null !== this.No && (this.No.cancel(), this.No = null);
    }
    /** Returns a random value in the range [-currentBaseMs/2, currentBaseMs/2] */    qo() {
        return (Math.random() - .5) * this.Oo;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A PersistentStream is an abstract base class that represents a streaming RPC
 * to the Firestore backend. It's built on top of the connections own support
 * for streaming RPCs, and adds several critical features for our clients:
 *
 *   - Exponential backoff on failure
 *   - Authentication via CredentialsProvider
 *   - Dispatching all callbacks into the shared worker queue
 *   - Closing idle streams after 60 seconds of inactivity
 *
 * Subclasses of PersistentStream implement serialization of models to and
 * from the JSON representation of the protocol buffers for a specific
 * streaming RPC.
 *
 * ## Starting and Stopping
 *
 * Streaming RPCs are stateful and need to be start()ed before messages can
 * be sent and received. The PersistentStream will call the onOpen() function
 * of the listener once the stream is ready to accept requests.
 *
 * Should a start() fail, PersistentStream will call the registered onClose()
 * listener with a FirestoreError indicating what went wrong.
 *
 * A PersistentStream can be started and stopped repeatedly.
 *
 * Generic types:
 *  SendType: The type of the outgoing message of the underlying
 *    connection stream
 *  ReceiveType: The type of the incoming message of the underlying
 *    connection stream
 *  ListenerType: The type of the listener that will be used for callbacks
 */
class __PRIVATE_PersistentStream {
    constructor(e, t, n, r, i, s, o, _) {
        this.si = e, this.Ko = n, this.$o = r, this.connection = i, this.authCredentialsProvider = s, 
        this.appCheckCredentialsProvider = o, this.listener = _, this.state = 0 /* PersistentStreamState.Initial */ , 
        /**
         * A close count that's incremented every time the stream is closed; used by
         * getCloseGuardedDispatcher() to invalidate callbacks that happen after
         * close.
         */
        this.Uo = 0, this.Wo = null, this.Go = null, this.stream = null, this.zo = new __PRIVATE_ExponentialBackoff(e, t);
    }
    /**
     * Returns true if start() has been called and no error has occurred. True
     * indicates the stream is open or in the process of opening (which
     * encompasses respecting backoff, getting auth tokens, and starting the
     * actual RPC). Use isOpen() to determine if the stream is open and ready for
     * outbound requests.
     */    jo() {
        return 1 /* PersistentStreamState.Starting */ === this.state || 5 /* PersistentStreamState.Backoff */ === this.state || this.Ho();
    }
    /**
     * Returns true if the underlying RPC is open (the onOpen() listener has been
     * called) and the stream is ready for outbound requests.
     */    Ho() {
        return 2 /* PersistentStreamState.Open */ === this.state || 3 /* PersistentStreamState.Healthy */ === this.state;
    }
    /**
     * Starts the RPC. Only allowed if isStarted() returns false. The stream is
     * not immediately ready for use: onOpen() will be invoked when the RPC is
     * ready for outbound requests, at which point isOpen() will return true.
     *
     * When start returns, isStarted() will return true.
     */    start() {
        4 /* PersistentStreamState.Error */ !== this.state ? this.auth() : this.Jo();
    }
    /**
     * Stops the RPC. This call is idempotent and allowed regardless of the
     * current isStarted() state.
     *
     * When stop returns, isStarted() and isOpen() will both return false.
     */    async stop() {
        this.jo() && await this.close(0 /* PersistentStreamState.Initial */);
    }
    /**
     * After an error the stream will usually back off on the next attempt to
     * start it. If the error warrants an immediate restart of the stream, the
     * sender can use this to indicate that the receiver should not back off.
     *
     * Each error will call the onClose() listener. That function can decide to
     * inhibit backoff if required.
     */    Yo() {
        this.state = 0 /* PersistentStreamState.Initial */ , this.zo.reset();
    }
    /**
     * Marks this stream as idle. If no further actions are performed on the
     * stream for one minute, the stream will automatically close itself and
     * notify the stream's onClose() handler with Status.OK. The stream will then
     * be in a !isStarted() state, requiring the caller to start the stream again
     * before further use.
     *
     * Only streams that are in state 'Open' can be marked idle, as all other
     * states imply pending network operations.
     */    Zo() {
        // Starts the idle time if we are in state 'Open' and are not yet already
        // running a timer (in which case the previous idle timeout still applies).
        this.Ho() && null === this.Wo && (this.Wo = this.si.enqueueAfterDelay(this.Ko, 6e4, (() => this.Xo())));
    }
    /** Sends a message to the underlying stream. */    e_(e) {
        this.t_(), this.stream.send(e);
    }
    /** Called by the idle timer when the stream should close due to inactivity. */    async Xo() {
        if (this.Ho()) 
        // When timing out an idle stream there's no reason to force the stream into backoff when
        // it restarts so set the stream state to Initial instead of Error.
        return this.close(0 /* PersistentStreamState.Initial */);
    }
    /** Marks the stream as active again. */    t_() {
        this.Wo && (this.Wo.cancel(), this.Wo = null);
    }
    /** Cancels the health check delayed operation. */    n_() {
        this.Go && (this.Go.cancel(), this.Go = null);
    }
    /**
     * Closes the stream and cleans up as necessary:
     *
     * * closes the underlying GRPC stream;
     * * calls the onClose handler with the given 'error';
     * * sets internal stream state to 'finalState';
     * * adjusts the backoff timer based on the error
     *
     * A new stream can be opened by calling start().
     *
     * @param finalState - the intended state of the stream after closing.
     * @param error - the error the connection was closed with.
     */    async close(e, t) {
        // Cancel any outstanding timers (they're guaranteed not to execute).
        this.t_(), this.n_(), this.zo.cancel(), 
        // Invalidates any stream-related callbacks (e.g. from auth or the
        // underlying stream), guaranteeing they won't execute.
        this.Uo++, 4 /* PersistentStreamState.Error */ !== e ? 
        // If this is an intentional close ensure we don't delay our next connection attempt.
        this.zo.reset() : t && t.code === D.RESOURCE_EXHAUSTED ? (
        // Log the error. (Probably either 'quota exceeded' or 'max queue length reached'.)
        __PRIVATE_logError(t.toString()), __PRIVATE_logError("Using maximum backoff delay to prevent overloading the backend."), 
        this.zo.Lo()) : t && t.code === D.UNAUTHENTICATED && 3 /* PersistentStreamState.Healthy */ !== this.state && (
        // "unauthenticated" error means the token was rejected. This should rarely
        // happen since both Auth and AppCheck ensure a sufficient TTL when we
        // request a token. If a user manually resets their system clock this can
        // fail, however. In this case, we should get a Code.UNAUTHENTICATED error
        // before we received the first message and we need to invalidate the token
        // to ensure that we fetch a new token.
        this.authCredentialsProvider.invalidateToken(), this.appCheckCredentialsProvider.invalidateToken()), 
        // Clean up the underlying stream because we are no longer interested in events.
        null !== this.stream && (this.r_(), this.stream.close(), this.stream = null), 
        // This state must be assigned before calling onClose() to allow the callback to
        // inhibit backoff or otherwise manipulate the state in its non-started state.
        this.state = e, 
        // Notify the listener that the stream closed.
        await this.listener.Io(t);
    }
    /**
     * Can be overridden to perform additional cleanup before the stream is closed.
     * Calling super.tearDown() is not required.
     */    r_() {}
    auth() {
        this.state = 1 /* PersistentStreamState.Starting */;
        const e = this.i_(this.Uo), t = this.Uo;
        // TODO(mikelehen): Just use dispatchIfNotClosed, but see TODO below.
                Promise.all([ this.authCredentialsProvider.getToken(), this.appCheckCredentialsProvider.getToken() ]).then((([e, n]) => {
            // Stream can be stopped while waiting for authentication.
            // TODO(mikelehen): We really should just use dispatchIfNotClosed
            // and let this dispatch onto the queue, but that opened a spec test can
            // of worms that I don't want to deal with in this PR.
            this.Uo === t && 
            // Normally we'd have to schedule the callback on the AsyncQueue.
            // However, the following calls are safe to be called outside the
            // AsyncQueue since they don't chain asynchronous calls
            this.s_(e, n);
        }), (t => {
            e((() => {
                const e = new FirestoreError(D.UNKNOWN, "Fetching auth token failed: " + t.message);
                return this.o_(e);
            }));
        }));
    }
    s_(e, t) {
        const n = this.i_(this.Uo);
        this.stream = this.__(e, t), this.stream.ho((() => {
            n((() => (this.state = 2 /* PersistentStreamState.Open */ , this.Go = this.si.enqueueAfterDelay(this.$o, 1e4, (() => (this.Ho() && (this.state = 3 /* PersistentStreamState.Healthy */), 
            Promise.resolve()))), this.listener.ho())));
        })), this.stream.Io((e => {
            n((() => this.o_(e)));
        })), this.stream.onMessage((e => {
            n((() => this.onMessage(e)));
        }));
    }
    Jo() {
        this.state = 5 /* PersistentStreamState.Backoff */ , this.zo.ko((async () => {
            this.state = 0 /* PersistentStreamState.Initial */ , this.start();
        }));
    }
    // Visible for tests
    o_(e) {
        // In theory the stream could close cleanly, however, in our current model
        // we never expect this to happen because if we stop a stream ourselves,
        // this callback will never be called. To prevent cases where we retry
        // without a backoff accidentally, we set the stream to error in all cases.
        return __PRIVATE_logDebug("PersistentStream", `close with error: ${e}`), this.stream = null, 
        this.close(4 /* PersistentStreamState.Error */ , e);
    }
    /**
     * Returns a "dispatcher" function that dispatches operations onto the
     * AsyncQueue but only runs them if closeCount remains unchanged. This allows
     * us to turn auth / stream callbacks into no-ops if the stream is closed /
     * re-opened, etc.
     */    i_(e) {
        return t => {
            this.si.enqueueAndForget((() => this.Uo === e ? t() : (__PRIVATE_logDebug("PersistentStream", "stream callback skipped by getCloseGuardedDispatcher."), 
            Promise.resolve())));
        };
    }
}

/**
 * A PersistentStream that implements the Listen RPC.
 *
 * Once the Listen stream has called the onOpen() listener, any number of
 * listen() and unlisten() calls can be made to control what changes will be
 * sent from the server for ListenResponses.
 */ class __PRIVATE_PersistentListenStream extends __PRIVATE_PersistentStream {
    constructor(e, t, n, r, i, s) {
        super(e, "listen_stream_connection_backoff" /* TimerId.ListenStreamConnectionBackoff */ , "listen_stream_idle" /* TimerId.ListenStreamIdle */ , "health_check_timeout" /* TimerId.HealthCheckTimeout */ , t, n, r, s), 
        this.serializer = i;
    }
    __(e, t) {
        return this.connection.vo("Listen", e, t);
    }
    onMessage(e) {
        // A successful response means the stream is healthy
        this.zo.reset();
        const t = __PRIVATE_fromWatchChange(this.serializer, e), n = function __PRIVATE_versionFromListenResponse(e) {
            // We have only reached a consistent snapshot for the entire stream if there
            // is a read_time set and it applies to all targets (i.e. the list of
            // targets is empty). The backend is guaranteed to send such responses.
            if (!("targetChange" in e)) return SnapshotVersion.min();
            const t = e.targetChange;
            return t.targetIds && t.targetIds.length ? SnapshotVersion.min() : t.readTime ? __PRIVATE_fromVersion(t.readTime) : SnapshotVersion.min();
        }(e);
        return this.listener.a_(t, n);
    }
    /**
     * Registers interest in the results of the given target. If the target
     * includes a resumeToken it will be included in the request. Results that
     * affect the target will be streamed back as WatchChange messages that
     * reference the targetId.
     */    u_(e) {
        const t = {};
        t.database = __PRIVATE_getEncodedDatabaseId(this.serializer), t.addTarget = function __PRIVATE_toTarget(e, t) {
            let n;
            const r = t.target;
            if (n = __PRIVATE_targetIsDocumentTarget(r) ? {
                documents: __PRIVATE_toDocumentsTarget(e, r)
            } : {
                query: __PRIVATE_toQueryTarget(e, r)
            }, n.targetId = t.targetId, t.resumeToken.approximateByteSize() > 0) {
                n.resumeToken = __PRIVATE_toBytes(e, t.resumeToken);
                const r = __PRIVATE_toInt32Proto(e, t.expectedCount);
                null !== r && (n.expectedCount = r);
            } else if (t.snapshotVersion.compareTo(SnapshotVersion.min()) > 0) {
                // TODO(wuandy): Consider removing above check because it is most likely true.
                // Right now, many tests depend on this behaviour though (leaving min() out
                // of serialization).
                n.readTime = toTimestamp(e, t.snapshotVersion.toTimestamp());
                const r = __PRIVATE_toInt32Proto(e, t.expectedCount);
                null !== r && (n.expectedCount = r);
            }
            return n;
        }(this.serializer, e);
        const n = __PRIVATE_toListenRequestLabels(this.serializer, e);
        n && (t.labels = n), this.e_(t);
    }
    /**
     * Unregisters interest in the results of the target associated with the
     * given targetId.
     */    c_(e) {
        const t = {};
        t.database = __PRIVATE_getEncodedDatabaseId(this.serializer), t.removeTarget = e, 
        this.e_(t);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Datastore and its related methods are a wrapper around the external Google
 * Cloud Datastore grpc API, which provides an interface that is more convenient
 * for the rest of the client SDK architecture to consume.
 */
/**
 * An implementation of Datastore that exposes additional state for internal
 * consumption.
 */
class __PRIVATE_DatastoreImpl extends class Datastore {} {
    constructor(e, t, n, r) {
        super(), this.authCredentials = e, this.appCheckCredentials = t, this.connection = n, 
        this.serializer = r, this.d_ = !1;
    }
    A_() {
        if (this.d_) throw new FirestoreError(D.FAILED_PRECONDITION, "The client has already been terminated.");
    }
    /** Invokes the provided RPC with auth and AppCheck tokens. */    wo(e, t, n) {
        return this.A_(), Promise.all([ this.authCredentials.getToken(), this.appCheckCredentials.getToken() ]).then((([r, i]) => this.connection.wo(e, t, n, r, i))).catch((e => {
            throw "FirebaseError" === e.name ? (e.code === D.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), 
            this.appCheckCredentials.invalidateToken()), e) : new FirestoreError(D.UNKNOWN, e.toString());
        }));
    }
    /** Invokes the provided RPC with streamed results with auth and AppCheck tokens. */    Co(e, t, n, r) {
        return this.A_(), Promise.all([ this.authCredentials.getToken(), this.appCheckCredentials.getToken() ]).then((([i, s]) => this.connection.Co(e, t, n, i, s, r))).catch((e => {
            throw "FirebaseError" === e.name ? (e.code === D.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), 
            this.appCheckCredentials.invalidateToken()), e) : new FirestoreError(D.UNKNOWN, e.toString());
        }));
    }
    terminate() {
        this.d_ = !0;
    }
}

/**
 * A component used by the RemoteStore to track the OnlineState (that is,
 * whether or not the client as a whole should be considered to be online or
 * offline), implementing the appropriate heuristics.
 *
 * In particular, when the client is trying to connect to the backend, we
 * allow up to MAX_WATCH_STREAM_FAILURES within ONLINE_STATE_TIMEOUT_MS for
 * a connection to succeed. If we have too many failures or the timeout elapses,
 * then we set the OnlineState to Offline, and the client will behave as if
 * it is offline (get()s will return cached data, etc.).
 */
class __PRIVATE_OnlineStateTracker {
    constructor(e, t) {
        this.asyncQueue = e, this.onlineStateHandler = t, 
        /** The current OnlineState. */
        this.state = "Unknown" /* OnlineState.Unknown */ , 
        /**
         * A count of consecutive failures to open the stream. If it reaches the
         * maximum defined by MAX_WATCH_STREAM_FAILURES, we'll set the OnlineState to
         * Offline.
         */
        this.V_ = 0, 
        /**
         * A timer that elapses after ONLINE_STATE_TIMEOUT_MS, at which point we
         * transition from OnlineState.Unknown to OnlineState.Offline without waiting
         * for the stream to actually fail (MAX_WATCH_STREAM_FAILURES times).
         */
        this.m_ = null, 
        /**
         * Whether the client should log a warning message if it fails to connect to
         * the backend (initially true, cleared after a successful stream, or if we've
         * logged the message already).
         */
        this.f_ = !0;
    }
    /**
     * Called by RemoteStore when a watch stream is started (including on each
     * backoff attempt).
     *
     * If this is the first attempt, it sets the OnlineState to Unknown and starts
     * the onlineStateTimer.
     */    g_() {
        0 === this.V_ && (this.p_("Unknown" /* OnlineState.Unknown */), this.m_ = this.asyncQueue.enqueueAfterDelay("online_state_timeout" /* TimerId.OnlineStateTimeout */ , 1e4, (() => (this.m_ = null, 
        this.y_("Backend didn't respond within 10 seconds."), this.p_("Offline" /* OnlineState.Offline */), 
        Promise.resolve()))));
    }
    /**
     * Updates our OnlineState as appropriate after the watch stream reports a
     * failure. The first failure moves us to the 'Unknown' state. We then may
     * allow multiple failures (based on MAX_WATCH_STREAM_FAILURES) before we
     * actually transition to the 'Offline' state.
     */    w_(e) {
        "Online" /* OnlineState.Online */ === this.state ? this.p_("Unknown" /* OnlineState.Unknown */) : (this.V_++, 
        this.V_ >= 1 && (this.S_(), this.y_(`Connection failed 1 times. Most recent error: ${e.toString()}`), 
        this.p_("Offline" /* OnlineState.Offline */)));
    }
    /**
     * Explicitly sets the OnlineState to the specified state.
     *
     * Note that this resets our timers / failure counters, etc. used by our
     * Offline heuristics, so must not be used in place of
     * handleWatchStreamStart() and handleWatchStreamFailure().
     */    set(e) {
        this.S_(), this.V_ = 0, "Online" /* OnlineState.Online */ === e && (
        // We've connected to watch at least once. Don't warn the developer
        // about being offline going forward.
        this.f_ = !1), this.p_(e);
    }
    p_(e) {
        e !== this.state && (this.state = e, this.onlineStateHandler(e));
    }
    y_(e) {
        const t = `Could not reach Cloud Firestore backend. ${e}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
        this.f_ ? (__PRIVATE_logError(t), this.f_ = !1) : __PRIVATE_logDebug("OnlineStateTracker", t);
    }
    S_() {
        null !== this.m_ && (this.m_.cancel(), this.m_ = null);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class __PRIVATE_RemoteStoreImpl {
    constructor(
    /**
     * The local store, used to fill the write pipeline with outbound mutations.
     */
    e, 
    /** The client-side proxy for interacting with the backend. */
    t, n, r, i) {
        this.localStore = e, this.datastore = t, this.asyncQueue = n, this.remoteSyncer = {}, 
        /**
         * A list of up to MAX_PENDING_WRITES writes that we have fetched from the
         * LocalStore via fillWritePipeline() and have or will send to the write
         * stream.
         *
         * Whenever writePipeline.length > 0 the RemoteStore will attempt to start or
         * restart the write stream. When the stream is established the writes in the
         * pipeline will be sent in order.
         *
         * Writes remain in writePipeline until they are acknowledged by the backend
         * and thus will automatically be re-sent if the stream is interrupted /
         * restarted before they're acknowledged.
         *
         * Write responses from the backend are linked to their originating request
         * purely based on order, and so we can just shift() writes from the front of
         * the writePipeline as we receive responses.
         */
        this.b_ = [], 
        /**
         * A mapping of watched targets that the client cares about tracking and the
         * user has explicitly called a 'listen' for this target.
         *
         * These targets may or may not have been sent to or acknowledged by the
         * server. On re-establishing the listen stream, these targets should be sent
         * to the server. The targets removed with unlistens are removed eagerly
         * without waiting for confirmation from the listen stream.
         */
        this.D_ = new Map, 
        /**
         * A set of reasons for why the RemoteStore may be offline. If empty, the
         * RemoteStore may start its network connections.
         */
        this.C_ = new Set, 
        /**
         * Event handlers that get called when the network is disabled or enabled.
         *
         * PORTING NOTE: These functions are used on the Web client to create the
         * underlying streams (to support tree-shakeable streams). On Android and iOS,
         * the streams are created during construction of RemoteStore.
         */
        this.v_ = [], this.F_ = i, this.F_.ro((e => {
            n.enqueueAndForget((async () => {
                // Porting Note: Unlike iOS, `restartNetwork()` is called even when the
                // network becomes unreachable as we don't have any other way to tear
                // down our streams.
                __PRIVATE_canUseNetwork(this) && (__PRIVATE_logDebug("RemoteStore", "Restarting streams for network reachability change."), 
                await async function __PRIVATE_restartNetwork(e) {
                    const t = __PRIVATE_debugCast(e);
                    t.C_.add(4 /* OfflineCause.ConnectivityChange */), await __PRIVATE_disableNetworkInternal(t), 
                    t.M_.set("Unknown" /* OnlineState.Unknown */), t.C_.delete(4 /* OfflineCause.ConnectivityChange */), 
                    await __PRIVATE_enableNetworkInternal(t);
                }(this));
            }));
        })), this.M_ = new __PRIVATE_OnlineStateTracker(n, r);
    }
}

async function __PRIVATE_enableNetworkInternal(e) {
    if (__PRIVATE_canUseNetwork(e)) for (const t of e.v_) await t(/* enabled= */ !0);
}

/**
 * Temporarily disables the network. The network can be re-enabled using
 * enableNetwork().
 */ async function __PRIVATE_disableNetworkInternal(e) {
    for (const t of e.v_) await t(/* enabled= */ !1);
}

/**
 * Starts new listen for the given target. Uses resume token if provided. It
 * is a no-op if the target of given `TargetData` is already being listened to.
 */
function __PRIVATE_remoteStoreListen(e, t) {
    const n = __PRIVATE_debugCast(e);
    n.D_.has(t.targetId) || (
    // Mark this as something the client is currently listening for.
    n.D_.set(t.targetId, t), __PRIVATE_shouldStartWatchStream(n) ? 
    // The listen will be sent in onWatchStreamOpen
    __PRIVATE_startWatchStream(n) : __PRIVATE_ensureWatchStream(n).Ho() && __PRIVATE_sendWatchRequest(n, t));
}

/**
 * Removes the listen from server. It is a no-op if the given target id is
 * not being listened to.
 */ function __PRIVATE_remoteStoreUnlisten(e, t) {
    const n = __PRIVATE_debugCast(e), r = __PRIVATE_ensureWatchStream(n);
    n.D_.delete(t), r.Ho() && __PRIVATE_sendUnwatchRequest(n, t), 0 === n.D_.size && (r.Ho() ? r.Zo() : __PRIVATE_canUseNetwork(n) && 
    // Revert to OnlineState.Unknown if the watch stream is not open and we
    // have no listeners, since without any listens to send we cannot
    // confirm if the stream is healthy and upgrade to OnlineState.Online.
    n.M_.set("Unknown" /* OnlineState.Unknown */));
}

/**
 * We need to increment the the expected number of pending responses we're due
 * from watch so we wait for the ack to process any messages from this target.
 */ function __PRIVATE_sendWatchRequest(e, t) {
    if (e.x_.Oe(t.targetId), t.resumeToken.approximateByteSize() > 0 || t.snapshotVersion.compareTo(SnapshotVersion.min()) > 0) {
        const n = e.remoteSyncer.getRemoteKeysForTarget(t.targetId).size;
        t = t.withExpectedCount(n);
    }
    __PRIVATE_ensureWatchStream(e).u_(t);
}

/**
 * We need to increment the expected number of pending responses we're due
 * from watch so we wait for the removal on the server before we process any
 * messages from this target.
 */ function __PRIVATE_sendUnwatchRequest(e, t) {
    e.x_.Oe(t), __PRIVATE_ensureWatchStream(e).c_(t);
}

function __PRIVATE_startWatchStream(e) {
    e.x_ = new __PRIVATE_WatchChangeAggregator({
        getRemoteKeysForTarget: t => e.remoteSyncer.getRemoteKeysForTarget(t),
        _t: t => e.D_.get(t) || null,
        nt: () => e.datastore.serializer.databaseId
    }), __PRIVATE_ensureWatchStream(e).start(), e.M_.g_();
}

/**
 * Returns whether the watch stream should be started because it's necessary
 * and has not yet been started.
 */ function __PRIVATE_shouldStartWatchStream(e) {
    return __PRIVATE_canUseNetwork(e) && !__PRIVATE_ensureWatchStream(e).jo() && e.D_.size > 0;
}

function __PRIVATE_canUseNetwork(e) {
    return 0 === __PRIVATE_debugCast(e).C_.size;
}

function __PRIVATE_cleanUpWatchStreamState(e) {
    e.x_ = void 0;
}

async function __PRIVATE_onWatchStreamOpen(e) {
    e.D_.forEach(((t, n) => {
        __PRIVATE_sendWatchRequest(e, t);
    }));
}

async function __PRIVATE_onWatchStreamClose(e, t) {
    __PRIVATE_cleanUpWatchStreamState(e), 
    // If we still need the watch stream, retry the connection.
    __PRIVATE_shouldStartWatchStream(e) ? (e.M_.w_(t), __PRIVATE_startWatchStream(e)) : 
    // No need to restart watch stream because there are no active targets.
    // The online state is set to unknown because there is no active attempt
    // at establishing a connection
    e.M_.set("Unknown" /* OnlineState.Unknown */);
}

async function __PRIVATE_onWatchStreamChange(e, t, n) {
    if (
    // Mark the client as online since we got a message from the server
    e.M_.set("Online" /* OnlineState.Online */), t instanceof __PRIVATE_WatchTargetChange && 2 /* WatchTargetChangeState.Removed */ === t.state && t.cause) 
    // There was an error on a target, don't wait for a consistent snapshot
    // to raise events
    try {
        await 
        /** Handles an error on a target */
        async function __PRIVATE_handleTargetError(e, t) {
            const n = t.cause;
            for (const r of t.targetIds) 
            // A watched target might have been removed already.
            e.D_.has(r) && (await e.remoteSyncer.rejectListen(r, n), e.D_.delete(r), e.x_.removeTarget(r));
        }
        /**
 * Attempts to fill our write pipeline with writes from the LocalStore.
 *
 * Called internally to bootstrap or refill the write pipeline and by
 * SyncEngine whenever there are new mutations to process.
 *
 * Starts the write stream if necessary.
 */ (e, t);
    } catch (n) {
        __PRIVATE_logDebug("RemoteStore", "Failed to remove targets %s: %s ", t.targetIds.join(","), n), 
        await __PRIVATE_disableNetworkUntilRecovery(e, n);
    } else if (t instanceof __PRIVATE_DocumentWatchChange ? e.x_.$e(t) : t instanceof __PRIVATE_ExistenceFilterChange ? e.x_.Je(t) : e.x_.Ge(t), 
    !n.isEqual(SnapshotVersion.min())) try {
        const t = await __PRIVATE_localStoreGetLastRemoteSnapshotVersion(e.localStore);
        n.compareTo(t) >= 0 && 
        // We have received a target change with a global snapshot if the snapshot
        // version is not equal to SnapshotVersion.min().
        await 
        /**
 * Takes a batch of changes from the Datastore, repackages them as a
 * RemoteEvent, and passes that on to the listener, which is typically the
 * SyncEngine.
 */
        function __PRIVATE_raiseWatchSnapshot(e, t) {
            const n = e.x_.it(t);
            // Update in-memory resume tokens. LocalStore will update the
            // persistent view of these when applying the completed RemoteEvent.
                        return n.targetChanges.forEach(((n, r) => {
                if (n.resumeToken.approximateByteSize() > 0) {
                    const i = e.D_.get(r);
                    // A watched target might have been removed already.
                                        i && e.D_.set(r, i.withResumeToken(n.resumeToken, t));
                }
            })), 
            // Re-establish listens for the targets that have been invalidated by
            // existence filter mismatches.
            n.targetMismatches.forEach(((t, n) => {
                const r = e.D_.get(t);
                if (!r) 
                // A watched target might have been removed already.
                return;
                // Clear the resume token for the target, since we're in a known mismatch
                // state.
                                e.D_.set(t, r.withResumeToken(ByteString.EMPTY_BYTE_STRING, r.snapshotVersion)), 
                // Cause a hard reset by unwatching and rewatching immediately, but
                // deliberately don't send a resume token so that we get a full update.
                __PRIVATE_sendUnwatchRequest(e, t);
                // Mark the target we send as being on behalf of an existence filter
                // mismatch, but don't actually retain that in listenTargets. This ensures
                // that we flag the first re-listen this way without impacting future
                // listens of this target (that might happen e.g. on reconnect).
                const i = new TargetData(r.target, t, n, r.sequenceNumber);
                __PRIVATE_sendWatchRequest(e, i);
            })), e.remoteSyncer.applyRemoteEvent(n);
        }(e, n);
    } catch (t) {
        __PRIVATE_logDebug("RemoteStore", "Failed to raise snapshot:", t), await __PRIVATE_disableNetworkUntilRecovery(e, t);
    }
}

/**
 * Recovery logic for IndexedDB errors that takes the network offline until
 * `op` succeeds. Retries are scheduled with backoff using
 * `enqueueRetryable()`. If `op()` is not provided, IndexedDB access is
 * validated via a generic operation.
 *
 * The returned Promise is resolved once the network is disabled and before
 * any retry attempt.
 */ async function __PRIVATE_disableNetworkUntilRecovery(e, t, n) {
    if (!__PRIVATE_isIndexedDbTransactionError(t)) throw t;
    e.C_.add(1 /* OfflineCause.IndexedDbFailed */), 
    // Disable network and raise offline snapshots
    await __PRIVATE_disableNetworkInternal(e), e.M_.set("Offline" /* OnlineState.Offline */), 
    n || (
    // Use a simple read operation to determine if IndexedDB recovered.
    // Ideally, we would expose a health check directly on SimpleDb, but
    // RemoteStore only has access to persistence through LocalStore.
    n = () => __PRIVATE_localStoreGetLastRemoteSnapshotVersion(e.localStore)), 
    // Probe IndexedDB periodically and re-enable network
    e.asyncQueue.enqueueRetryable((async () => {
        __PRIVATE_logDebug("RemoteStore", "Retrying IndexedDB access"), await n(), e.C_.delete(1 /* OfflineCause.IndexedDbFailed */), 
        await __PRIVATE_enableNetworkInternal(e);
    }));
}

async function __PRIVATE_remoteStoreHandleCredentialChange(e, t) {
    const n = __PRIVATE_debugCast(e);
    n.asyncQueue.verifyOperationInProgress(), __PRIVATE_logDebug("RemoteStore", "RemoteStore received new credentials");
    const r = __PRIVATE_canUseNetwork(n);
    // Tear down and re-create our network streams. This will ensure we get a
    // fresh auth token for the new user and re-fill the write pipeline with
    // new mutations from the LocalStore (since mutations are per-user).
        n.C_.add(3 /* OfflineCause.CredentialChange */), await __PRIVATE_disableNetworkInternal(n), 
    r && 
    // Don't set the network status to Unknown if we are offline.
    n.M_.set("Unknown" /* OnlineState.Unknown */), await n.remoteSyncer.handleCredentialChange(t), 
    n.C_.delete(3 /* OfflineCause.CredentialChange */), await __PRIVATE_enableNetworkInternal(n);
}

/**
 * Toggles the network state when the client gains or loses its primary lease.
 */ async function __PRIVATE_remoteStoreApplyPrimaryState(e, t) {
    const n = __PRIVATE_debugCast(e);
    t ? (n.C_.delete(2 /* OfflineCause.IsSecondary */), await __PRIVATE_enableNetworkInternal(n)) : t || (n.C_.add(2 /* OfflineCause.IsSecondary */), 
    await __PRIVATE_disableNetworkInternal(n), n.M_.set("Unknown" /* OnlineState.Unknown */));
}

/**
 * If not yet initialized, registers the WatchStream and its network state
 * callback with `remoteStoreImpl`. Returns the existing stream if one is
 * already available.
 *
 * PORTING NOTE: On iOS and Android, the WatchStream gets registered on startup.
 * This is not done on Web to allow it to be tree-shaken.
 */ function __PRIVATE_ensureWatchStream(e) {
    return e.O_ || (
    // Create stream (but note that it is not started yet).
    e.O_ = function __PRIVATE_newPersistentWatchStream(e, t, n) {
        const r = __PRIVATE_debugCast(e);
        return r.A_(), new __PRIVATE_PersistentListenStream(t, r.connection, r.authCredentials, r.appCheckCredentials, r.serializer, n);
    }
    /**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ (e.datastore, e.asyncQueue, {
        ho: __PRIVATE_onWatchStreamOpen.bind(null, e),
        Io: __PRIVATE_onWatchStreamClose.bind(null, e),
        a_: __PRIVATE_onWatchStreamChange.bind(null, e)
    }), e.v_.push((async t => {
        t ? (e.O_.Yo(), __PRIVATE_shouldStartWatchStream(e) ? __PRIVATE_startWatchStream(e) : e.M_.set("Unknown" /* OnlineState.Unknown */)) : (await e.O_.stop(), 
        __PRIVATE_cleanUpWatchStreamState(e));
    }))), e.O_;
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Represents an operation scheduled to be run in the future on an AsyncQueue.
 *
 * It is created via DelayedOperation.createAndSchedule().
 *
 * Supports cancellation (via cancel()) and early execution (via skipDelay()).
 *
 * Note: We implement `PromiseLike` instead of `Promise`, as the `Promise` type
 * in newer versions of TypeScript defines `finally`, which is not available in
 * IE.
 */
class DelayedOperation {
    constructor(e, t, n, r, i) {
        this.asyncQueue = e, this.timerId = t, this.targetTimeMs = n, this.op = r, this.removalCallback = i, 
        this.deferred = new __PRIVATE_Deferred, this.then = this.deferred.promise.then.bind(this.deferred.promise), 
        // It's normal for the deferred promise to be canceled (due to cancellation)
        // and so we attach a dummy catch callback to avoid
        // 'UnhandledPromiseRejectionWarning' log spam.
        this.deferred.promise.catch((e => {}));
    }
    get promise() {
        return this.deferred.promise;
    }
    /**
     * Creates and returns a DelayedOperation that has been scheduled to be
     * executed on the provided asyncQueue after the provided delayMs.
     *
     * @param asyncQueue - The queue to schedule the operation on.
     * @param id - A Timer ID identifying the type of operation this is.
     * @param delayMs - The delay (ms) before the operation should be scheduled.
     * @param op - The operation to run.
     * @param removalCallback - A callback to be called synchronously once the
     *   operation is executed or canceled, notifying the AsyncQueue to remove it
     *   from its delayedOperations list.
     *   PORTING NOTE: This exists to prevent making removeDelayedOperation() and
     *   the DelayedOperation class public.
     */    static createAndSchedule(e, t, n, r, i) {
        const s = Date.now() + n, o = new DelayedOperation(e, t, s, r, i);
        return o.start(n), o;
    }
    /**
     * Starts the timer. This is called immediately after construction by
     * createAndSchedule().
     */    start(e) {
        this.timerHandle = setTimeout((() => this.handleDelayElapsed()), e);
    }
    /**
     * Queues the operation to run immediately (if it hasn't already been run or
     * canceled).
     */    skipDelay() {
        return this.handleDelayElapsed();
    }
    /**
     * Cancels the operation if it hasn't already been executed or canceled. The
     * promise will be rejected.
     *
     * As long as the operation has not yet been run, calling cancel() provides a
     * guarantee that the operation will not be run.
     */    cancel(e) {
        null !== this.timerHandle && (this.clearTimeout(), this.deferred.reject(new FirestoreError(D.CANCELLED, "Operation cancelled" + (e ? ": " + e : ""))));
    }
    handleDelayElapsed() {
        this.asyncQueue.enqueueAndForget((() => null !== this.timerHandle ? (this.clearTimeout(), 
        this.op().then((e => this.deferred.resolve(e)))) : Promise.resolve()));
    }
    clearTimeout() {
        null !== this.timerHandle && (this.removalCallback(this), clearTimeout(this.timerHandle), 
        this.timerHandle = null);
    }
}

/**
 * Returns a FirestoreError that can be surfaced to the user if the provided
 * error is an IndexedDbTransactionError. Re-throws the error otherwise.
 */ function __PRIVATE_wrapInUserErrorIfRecoverable(e, t) {
    if (__PRIVATE_logError("AsyncQueue", `${t}: ${e}`), __PRIVATE_isIndexedDbTransactionError(e)) return new FirestoreError(D.UNAVAILABLE, `${t}: ${e}`);
    throw e;
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * DocumentSet is an immutable (copy-on-write) collection that holds documents
 * in order specified by the provided comparator. We always add a document key
 * comparator on top of what is provided to guarantee document equality based on
 * the key.
 */ class DocumentSet {
    /** The default ordering is by key if the comparator is omitted */
    constructor(e) {
        // We are adding document key comparator to the end as it's the only
        // guaranteed unique property of a document.
        this.comparator = e ? (t, n) => e(t, n) || DocumentKey.comparator(t.key, n.key) : (e, t) => DocumentKey.comparator(e.key, t.key), 
        this.keyedMap = documentMap(), this.sortedSet = new SortedMap(this.comparator);
    }
    /**
     * Returns an empty copy of the existing DocumentSet, using the same
     * comparator.
     */    static emptySet(e) {
        return new DocumentSet(e.comparator);
    }
    has(e) {
        return null != this.keyedMap.get(e);
    }
    get(e) {
        return this.keyedMap.get(e);
    }
    first() {
        return this.sortedSet.minKey();
    }
    last() {
        return this.sortedSet.maxKey();
    }
    isEmpty() {
        return this.sortedSet.isEmpty();
    }
    /**
     * Returns the index of the provided key in the document set, or -1 if the
     * document key is not present in the set;
     */    indexOf(e) {
        const t = this.keyedMap.get(e);
        return t ? this.sortedSet.indexOf(t) : -1;
    }
    get size() {
        return this.sortedSet.size;
    }
    /** Iterates documents in order defined by "comparator" */    forEach(e) {
        this.sortedSet.inorderTraversal(((t, n) => (e(t), !1)));
    }
    /** Inserts or updates a document with the same key */    add(e) {
        // First remove the element if we have it.
        const t = this.delete(e.key);
        return t.copy(t.keyedMap.insert(e.key, e), t.sortedSet.insert(e, null));
    }
    /** Deletes a document with a given key */    delete(e) {
        const t = this.get(e);
        return t ? this.copy(this.keyedMap.remove(e), this.sortedSet.remove(t)) : this;
    }
    isEqual(e) {
        if (!(e instanceof DocumentSet)) return !1;
        if (this.size !== e.size) return !1;
        const t = this.sortedSet.getIterator(), n = e.sortedSet.getIterator();
        for (;t.hasNext(); ) {
            const e = t.getNext().key, r = n.getNext().key;
            if (!e.isEqual(r)) return !1;
        }
        return !0;
    }
    toString() {
        const e = [];
        return this.forEach((t => {
            e.push(t.toString());
        })), 0 === e.length ? "DocumentSet ()" : "DocumentSet (\n  " + e.join("  \n") + "\n)";
    }
    copy(e, t) {
        const n = new DocumentSet;
        return n.comparator = this.comparator, n.keyedMap = e, n.sortedSet = t, n;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * DocumentChangeSet keeps track of a set of changes to docs in a query, merging
 * duplicate events for the same doc.
 */ class __PRIVATE_DocumentChangeSet {
    constructor() {
        this.B_ = new SortedMap(DocumentKey.comparator);
    }
    track(e) {
        const t = e.doc.key, n = this.B_.get(t);
        n ? 
        // Merge the new change with the existing change.
        0 /* ChangeType.Added */ !== e.type && 3 /* ChangeType.Metadata */ === n.type ? this.B_ = this.B_.insert(t, e) : 3 /* ChangeType.Metadata */ === e.type && 1 /* ChangeType.Removed */ !== n.type ? this.B_ = this.B_.insert(t, {
            type: n.type,
            doc: e.doc
        }) : 2 /* ChangeType.Modified */ === e.type && 2 /* ChangeType.Modified */ === n.type ? this.B_ = this.B_.insert(t, {
            type: 2 /* ChangeType.Modified */ ,
            doc: e.doc
        }) : 2 /* ChangeType.Modified */ === e.type && 0 /* ChangeType.Added */ === n.type ? this.B_ = this.B_.insert(t, {
            type: 0 /* ChangeType.Added */ ,
            doc: e.doc
        }) : 1 /* ChangeType.Removed */ === e.type && 0 /* ChangeType.Added */ === n.type ? this.B_ = this.B_.remove(t) : 1 /* ChangeType.Removed */ === e.type && 2 /* ChangeType.Modified */ === n.type ? this.B_ = this.B_.insert(t, {
            type: 1 /* ChangeType.Removed */ ,
            doc: n.doc
        }) : 0 /* ChangeType.Added */ === e.type && 1 /* ChangeType.Removed */ === n.type ? this.B_ = this.B_.insert(t, {
            type: 2 /* ChangeType.Modified */ ,
            doc: e.doc
        }) : 
        // This includes these cases, which don't make sense:
        // Added->Added
        // Removed->Removed
        // Modified->Added
        // Removed->Modified
        // Metadata->Added
        // Removed->Metadata
        fail() : this.B_ = this.B_.insert(t, e);
    }
    L_() {
        const e = [];
        return this.B_.inorderTraversal(((t, n) => {
            e.push(n);
        })), e;
    }
}

class ViewSnapshot {
    constructor(e, t, n, r, i, s, o, _, a) {
        this.query = e, this.docs = t, this.oldDocs = n, this.docChanges = r, this.mutatedKeys = i, 
        this.fromCache = s, this.syncStateChanged = o, this.excludesMetadataChanges = _, 
        this.hasCachedResults = a;
    }
    /** Returns a view snapshot as if all documents in the snapshot were added. */    static fromInitialDocuments(e, t, n, r, i) {
        const s = [];
        return t.forEach((e => {
            s.push({
                type: 0 /* ChangeType.Added */ ,
                doc: e
            });
        })), new ViewSnapshot(e, t, DocumentSet.emptySet(t), s, n, r, 
        /* syncStateChanged= */ !0, 
        /* excludesMetadataChanges= */ !1, i);
    }
    get hasPendingWrites() {
        return !this.mutatedKeys.isEmpty();
    }
    isEqual(e) {
        if (!(this.fromCache === e.fromCache && this.hasCachedResults === e.hasCachedResults && this.syncStateChanged === e.syncStateChanged && this.mutatedKeys.isEqual(e.mutatedKeys) && __PRIVATE_queryEquals(this.query, e.query) && this.docs.isEqual(e.docs) && this.oldDocs.isEqual(e.oldDocs))) return !1;
        const t = this.docChanges, n = e.docChanges;
        if (t.length !== n.length) return !1;
        for (let e = 0; e < t.length; e++) if (t[e].type !== n[e].type || !t[e].doc.isEqual(n[e].doc)) return !1;
        return !0;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Holds the listeners and the last received ViewSnapshot for a query being
 * tracked by EventManager.
 */ class __PRIVATE_QueryListenersInfo {
    constructor() {
        this.k_ = void 0, this.listeners = [];
    }
}

class __PRIVATE_EventManagerImpl {
    constructor() {
        this.queries = new ObjectMap((e => __PRIVATE_canonifyQuery(e)), __PRIVATE_queryEquals), 
        this.onlineState = "Unknown" /* OnlineState.Unknown */ , this.q_ = new Set;
    }
}

async function __PRIVATE_eventManagerListen(e, t) {
    const n = __PRIVATE_debugCast(e), r = t.query;
    let i = !1, s = n.queries.get(r);
    if (s || (i = !0, s = new __PRIVATE_QueryListenersInfo), i) try {
        s.k_ = await n.onListen(r);
    } catch (e) {
        const n = __PRIVATE_wrapInUserErrorIfRecoverable(e, `Initialization of query '${__PRIVATE_stringifyQuery(t.query)}' failed`);
        return void t.onError(n);
    }
    if (n.queries.set(r, s), s.listeners.push(t), 
    // Run global snapshot listeners if a consistent snapshot has been emitted.
    t.Q_(n.onlineState), s.k_) {
        t.K_(s.k_) && __PRIVATE_raiseSnapshotsInSyncEvent(n);
    }
}

async function __PRIVATE_eventManagerUnlisten(e, t) {
    const n = __PRIVATE_debugCast(e), r = t.query;
    let i = !1;
    const s = n.queries.get(r);
    if (s) {
        const e = s.listeners.indexOf(t);
        e >= 0 && (s.listeners.splice(e, 1), i = 0 === s.listeners.length);
    }
    if (i) return n.queries.delete(r), n.onUnlisten(r);
}

function __PRIVATE_eventManagerOnWatchChange(e, t) {
    const n = __PRIVATE_debugCast(e);
    let r = !1;
    for (const e of t) {
        const t = e.query, i = n.queries.get(t);
        if (i) {
            for (const t of i.listeners) t.K_(e) && (r = !0);
            i.k_ = e;
        }
    }
    r && __PRIVATE_raiseSnapshotsInSyncEvent(n);
}

function __PRIVATE_eventManagerOnWatchError(e, t, n) {
    const r = __PRIVATE_debugCast(e), i = r.queries.get(t);
    if (i) for (const e of i.listeners) e.onError(n);
    // Remove all listeners. NOTE: We don't need to call syncEngine.unlisten()
    // after an error.
        r.queries.delete(t);
}

// Call all global snapshot listeners that have been set.
function __PRIVATE_raiseSnapshotsInSyncEvent(e) {
    e.q_.forEach((e => {
        e.next();
    }));
}

/**
 * QueryListener takes a series of internal view snapshots and determines
 * when to raise the event.
 *
 * It uses an Observer to dispatch events.
 */ class __PRIVATE_QueryListener {
    constructor(e, t, n) {
        this.query = e, this.U_ = t, 
        /**
         * Initial snapshots (e.g. from cache) may not be propagated to the wrapped
         * observer. This flag is set to true once we've actually raised an event.
         */
        this.W_ = !1, this.G_ = null, this.onlineState = "Unknown" /* OnlineState.Unknown */ , 
        this.options = n || {};
    }
    /**
     * Applies the new ViewSnapshot to this listener, raising a user-facing event
     * if applicable (depending on what changed, whether the user has opted into
     * metadata-only changes, etc.). Returns true if a user-facing event was
     * indeed raised.
     */    K_(e) {
        if (!this.options.includeMetadataChanges) {
            // Remove the metadata only changes.
            const t = [];
            for (const n of e.docChanges) 3 /* ChangeType.Metadata */ !== n.type && t.push(n);
            e = new ViewSnapshot(e.query, e.docs, e.oldDocs, t, e.mutatedKeys, e.fromCache, e.syncStateChanged, 
            /* excludesMetadataChanges= */ !0, e.hasCachedResults);
        }
        let t = !1;
        return this.W_ ? this.z_(e) && (this.U_.next(e), t = !0) : this.j_(e, this.onlineState) && (this.H_(e), 
        t = !0), this.G_ = e, t;
    }
    onError(e) {
        this.U_.error(e);
    }
    /** Returns whether a snapshot was raised. */    Q_(e) {
        this.onlineState = e;
        let t = !1;
        return this.G_ && !this.W_ && this.j_(this.G_, e) && (this.H_(this.G_), t = !0), 
        t;
    }
    j_(e, t) {
        // Always raise the first event when we're synced
        if (!e.fromCache) return !0;
        // NOTE: We consider OnlineState.Unknown as online (it should become Offline
        // or Online if we wait long enough).
                const n = "Offline" /* OnlineState.Offline */ !== t;
        // Don't raise the event if we're online, aren't synced yet (checked
        // above) and are waiting for a sync.
                return (!this.options.J_ || !n) && (!e.docs.isEmpty() || e.hasCachedResults || "Offline" /* OnlineState.Offline */ === t);
        // Raise data from cache if we have any documents, have cached results before,
        // or we are offline.
        }
    z_(e) {
        // We don't need to handle includeDocumentMetadataChanges here because
        // the Metadata only changes have already been stripped out if needed.
        // At this point the only changes we will see are the ones we should
        // propagate.
        if (e.docChanges.length > 0) return !0;
        const t = this.G_ && this.G_.hasPendingWrites !== e.hasPendingWrites;
        return !(!e.syncStateChanged && !t) && !0 === this.options.includeMetadataChanges;
        // Generally we should have hit one of the cases above, but it's possible
        // to get here if there were only metadata docChanges and they got
        // stripped out.
        }
    H_(e) {
        e = ViewSnapshot.fromInitialDocuments(e.query, e.docs, e.mutatedKeys, e.fromCache, e.hasCachedResults), 
        this.W_ = !0, this.U_.next(e);
    }
}

/**
 * Returns a `LoadBundleTaskProgress` representing the progress that the loading
 * has succeeded.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class __PRIVATE_AddedLimboDocument {
    constructor(e) {
        this.key = e;
    }
}

class __PRIVATE_RemovedLimboDocument {
    constructor(e) {
        this.key = e;
    }
}

/**
 * View is responsible for computing the final merged truth of what docs are in
 * a query. It gets notified of local and remote changes to docs, and applies
 * the query filters and limits to determine the most correct possible results.
 */ class __PRIVATE_View {
    constructor(e, 
    /** Documents included in the remote target */
    t) {
        this.query = e, this.ia = t, this.sa = null, this.hasCachedResults = !1, 
        /**
         * A flag whether the view is current with the backend. A view is considered
         * current after it has seen the current flag from the backend and did not
         * lose consistency within the watch stream (e.g. because of an existence
         * filter mismatch).
         */
        this.current = !1, 
        /** Documents in the view but not in the remote target */
        this.oa = __PRIVATE_documentKeySet(), 
        /** Document Keys that have local changes */
        this.mutatedKeys = __PRIVATE_documentKeySet(), this._a = __PRIVATE_newQueryComparator(e), 
        this.aa = new DocumentSet(this._a);
    }
    /**
     * The set of remote documents that the server has told us belongs to the target associated with
     * this view.
     */    get ua() {
        return this.ia;
    }
    /**
     * Iterates over a set of doc changes, applies the query limit, and computes
     * what the new results should be, what the changes were, and whether we may
     * need to go back to the local cache for more results. Does not make any
     * changes to the view.
     * @param docChanges - The doc changes to apply to this view.
     * @param previousChanges - If this is being called with a refill, then start
     *        with this set of docs and changes instead of the current view.
     * @returns a new set of docs, changes, and refill flag.
     */    ca(e, t) {
        const n = t ? t.la : new __PRIVATE_DocumentChangeSet, r = t ? t.aa : this.aa;
        let i = t ? t.mutatedKeys : this.mutatedKeys, s = r, o = !1;
        // Track the last doc in a (full) limit. This is necessary, because some
        // update (a delete, or an update moving a doc past the old limit) might
        // mean there is some other document in the local cache that either should
        // come (1) between the old last limit doc and the new last document, in the
        // case of updates, or (2) after the new last document, in the case of
        // deletes. So we keep this doc at the old limit to compare the updates to.
        // Note that this should never get used in a refill (when previousChanges is
        // set), because there will only be adds -- no deletes or updates.
        const _ = "F" /* LimitType.First */ === this.query.limitType && r.size === this.query.limit ? r.last() : null, a = "L" /* LimitType.Last */ === this.query.limitType && r.size === this.query.limit ? r.first() : null;
        // Drop documents out to meet limit/limitToLast requirement.
        if (e.inorderTraversal(((e, t) => {
            const u = r.get(e), c = __PRIVATE_queryMatches(this.query, t) ? t : null, l = !!u && this.mutatedKeys.has(u.key), h = !!c && (c.hasLocalMutations || 
            // We only consider committed mutations for documents that were
            // mutated during the lifetime of the view.
            this.mutatedKeys.has(c.key) && c.hasCommittedMutations);
            let P = !1;
            // Calculate change
                        if (u && c) {
                u.data.isEqual(c.data) ? l !== h && (n.track({
                    type: 3 /* ChangeType.Metadata */ ,
                    doc: c
                }), P = !0) : this.ha(u, c) || (n.track({
                    type: 2 /* ChangeType.Modified */ ,
                    doc: c
                }), P = !0, (_ && this._a(c, _) > 0 || a && this._a(c, a) < 0) && (
                // This doc moved from inside the limit to outside the limit.
                // That means there may be some other doc in the local cache
                // that should be included instead.
                o = !0));
            } else !u && c ? (n.track({
                type: 0 /* ChangeType.Added */ ,
                doc: c
            }), P = !0) : u && !c && (n.track({
                type: 1 /* ChangeType.Removed */ ,
                doc: u
            }), P = !0, (_ || a) && (
            // A doc was removed from a full limit query. We'll need to
            // requery from the local cache to see if we know about some other
            // doc that should be in the results.
            o = !0));
            P && (c ? (s = s.add(c), i = h ? i.add(e) : i.delete(e)) : (s = s.delete(e), i = i.delete(e)));
        })), null !== this.query.limit) for (;s.size > this.query.limit; ) {
            const e = "F" /* LimitType.First */ === this.query.limitType ? s.last() : s.first();
            s = s.delete(e.key), i = i.delete(e.key), n.track({
                type: 1 /* ChangeType.Removed */ ,
                doc: e
            });
        }
        return {
            aa: s,
            la: n,
            Zi: o,
            mutatedKeys: i
        };
    }
    ha(e, t) {
        // We suppress the initial change event for documents that were modified as
        // part of a write acknowledgment (e.g. when the value of a server transform
        // is applied) as Watch will send us the same document again.
        // By suppressing the event, we only raise two user visible events (one with
        // `hasPendingWrites` and the final state of the document) instead of three
        // (one with `hasPendingWrites`, the modified document with
        // `hasPendingWrites` and the final state of the document).
        return e.hasLocalMutations && t.hasCommittedMutations && !t.hasLocalMutations;
    }
    /**
     * Updates the view with the given ViewDocumentChanges and optionally updates
     * limbo docs and sync state from the provided target change.
     * @param docChanges - The set of changes to make to the view's docs.
     * @param limboResolutionEnabled - Whether to update limbo documents based on
     *        this change.
     * @param targetChange - A target change to apply for computing limbo docs and
     *        sync state.
     * @param targetIsPendingReset - Whether the target is pending to reset due to
     *        existence filter mismatch. If not explicitly specified, it is treated
     *        equivalently to `false`.
     * @returns A new ViewChange with the given docs, changes, and sync state.
     */
    // PORTING NOTE: The iOS/Android clients always compute limbo document changes.
    applyChanges(e, t, n, r) {
        const i = this.aa;
        this.aa = e.aa, this.mutatedKeys = e.mutatedKeys;
        // Sort changes based on type and query comparator
        const s = e.la.L_();
        s.sort(((e, t) => function __PRIVATE_compareChangeType(e, t) {
            const order = e => {
                switch (e) {
                  case 0 /* ChangeType.Added */ :
                    return 1;

                  case 2 /* ChangeType.Modified */ :
                  case 3 /* ChangeType.Metadata */ :
                    // A metadata change is converted to a modified change at the public
                    // api layer.  Since we sort by document key and then change type,
                    // metadata and modified changes must be sorted equivalently.
                    return 2;

                  case 1 /* ChangeType.Removed */ :
                    return 0;

                  default:
                    return fail();
                }
            };
            return order(e) - order(t);
        }
        /**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ (e.type, t.type) || this._a(e.doc, t.doc))), this.Pa(n), r = null != r && r;
        const o = t && !r ? this.Ia() : [], _ = 0 === this.oa.size && this.current && !r ? 1 /* SyncState.Synced */ : 0 /* SyncState.Local */ , a = _ !== this.sa;
        // We are at synced state if there is no limbo docs are waiting to be resolved, view is current
        // with the backend, and the query is not pending to reset due to existence filter mismatch.
                if (this.sa = _, 0 !== s.length || a) {
            return {
                snapshot: new ViewSnapshot(this.query, e.aa, i, s, e.mutatedKeys, 0 /* SyncState.Local */ === _, a, 
                /* excludesMetadataChanges= */ !1, !!n && n.resumeToken.approximateByteSize() > 0),
                Ta: o
            };
        }
        // no changes
        return {
            Ta: o
        };
    }
    /**
     * Applies an OnlineState change to the view, potentially generating a
     * ViewChange if the view's syncState changes as a result.
     */    Q_(e) {
        return this.current && "Offline" /* OnlineState.Offline */ === e ? (
        // If we're offline, set `current` to false and then call applyChanges()
        // to refresh our syncState and generate a ViewChange as appropriate. We
        // are guaranteed to get a new TargetChange that sets `current` back to
        // true once the client is back online.
        this.current = !1, this.applyChanges({
            aa: this.aa,
            la: new __PRIVATE_DocumentChangeSet,
            mutatedKeys: this.mutatedKeys,
            Zi: !1
        }, 
        /* limboResolutionEnabled= */ !1)) : {
            Ta: []
        };
    }
    /**
     * Returns whether the doc for the given key should be in limbo.
     */    Ea(e) {
        // If the remote end says it's part of this query, it's not in limbo.
        return !this.ia.has(e) && (
        // The local store doesn't think it's a result, so it shouldn't be in limbo.
        !!this.aa.has(e) && !this.aa.get(e).hasLocalMutations);
    }
    /**
     * Updates syncedDocuments, current, and limbo docs based on the given change.
     * Returns the list of changes to which docs are in limbo.
     */    Pa(e) {
        e && (e.addedDocuments.forEach((e => this.ia = this.ia.add(e))), e.modifiedDocuments.forEach((e => {})), 
        e.removedDocuments.forEach((e => this.ia = this.ia.delete(e))), this.current = e.current);
    }
    Ia() {
        // We can only determine limbo documents when we're in-sync with the server.
        if (!this.current) return [];
        // TODO(klimt): Do this incrementally so that it's not quadratic when
        // updating many documents.
                const e = this.oa;
        this.oa = __PRIVATE_documentKeySet(), this.aa.forEach((e => {
            this.Ea(e.key) && (this.oa = this.oa.add(e.key));
        }));
        // Diff the new limbo docs with the old limbo docs.
        const t = [];
        return e.forEach((e => {
            this.oa.has(e) || t.push(new __PRIVATE_RemovedLimboDocument(e));
        })), this.oa.forEach((n => {
            e.has(n) || t.push(new __PRIVATE_AddedLimboDocument(n));
        })), t;
    }
    /**
     * Update the in-memory state of the current view with the state read from
     * persistence.
     *
     * We update the query view whenever a client's primary status changes:
     * - When a client transitions from primary to secondary, it can miss
     *   LocalStorage updates and its query views may temporarily not be
     *   synchronized with the state on disk.
     * - For secondary to primary transitions, the client needs to update the list
     *   of `syncedDocuments` since secondary clients update their query views
     *   based purely on synthesized RemoteEvents.
     *
     * @param queryResult.documents - The documents that match the query according
     * to the LocalStore.
     * @param queryResult.remoteKeys - The keys of the documents that match the
     * query according to the backend.
     *
     * @returns The ViewChange that resulted from this synchronization.
     */
    // PORTING NOTE: Multi-tab only.
    da(e) {
        this.ia = e.ls, this.oa = __PRIVATE_documentKeySet();
        const t = this.ca(e.documents);
        return this.applyChanges(t, /* limboResolutionEnabled= */ !0);
    }
    /**
     * Returns a view snapshot as if this query was just listened to. Contains
     * a document add for every existing document and the `fromCache` and
     * `hasPendingWrites` status of the already established view.
     */
    // PORTING NOTE: Multi-tab only.
    Aa() {
        return ViewSnapshot.fromInitialDocuments(this.query, this.aa, this.mutatedKeys, 0 /* SyncState.Local */ === this.sa, this.hasCachedResults);
    }
}

/**
 * QueryView contains all of the data that SyncEngine needs to keep track of for
 * a particular query.
 */
class __PRIVATE_QueryView {
    constructor(
    /**
     * The query itself.
     */
    e, 
    /**
     * The target number created by the client that is used in the watch
     * stream to identify this query.
     */
    t, 
    /**
     * The view is responsible for computing the final merged truth of what
     * docs are in the query. It gets notified of local and remote changes,
     * and applies the query filters and limits to determine the most correct
     * possible results.
     */
    n) {
        this.query = e, this.targetId = t, this.view = n;
    }
}

/** Tracks a limbo resolution. */ class LimboResolution {
    constructor(e) {
        this.key = e, 
        /**
         * Set to true once we've received a document. This is used in
         * getRemoteKeysForTarget() and ultimately used by WatchChangeAggregator to
         * decide whether it needs to manufacture a delete event for the target once
         * the target is CURRENT.
         */
        this.Ra = !1;
    }
}

/**
 * An implementation of `SyncEngine` coordinating with other parts of SDK.
 *
 * The parts of SyncEngine that act as a callback to RemoteStore need to be
 * registered individually. This is done in `syncEngineWrite()` and
 * `syncEngineListen()` (as well as `applyPrimaryState()`) as these methods
 * serve as entry points to RemoteStore's functionality.
 *
 * Note: some field defined in this class might have public access level, but
 * the class is not exported so they are only accessible from this module.
 * This is useful to implement optional features (like bundles) in free
 * functions, such that they are tree-shakeable.
 */ class __PRIVATE_SyncEngineImpl {
    constructor(e, t, n, 
    // PORTING NOTE: Manages state synchronization in multi-tab environments.
    r, i, s) {
        this.localStore = e, this.remoteStore = t, this.eventManager = n, this.sharedClientState = r, 
        this.currentUser = i, this.maxConcurrentLimboResolutions = s, this.Va = {}, this.ma = new ObjectMap((e => __PRIVATE_canonifyQuery(e)), __PRIVATE_queryEquals), 
        this.fa = new Map, 
        /**
         * The keys of documents that are in limbo for which we haven't yet started a
         * limbo resolution query. The strings in this set are the result of calling
         * `key.path.canonicalString()` where `key` is a `DocumentKey` object.
         *
         * The `Set` type was chosen because it provides efficient lookup and removal
         * of arbitrary elements and it also maintains insertion order, providing the
         * desired queue-like FIFO semantics.
         */
        this.ga = new Set, 
        /**
         * Keeps track of the target ID for each document that is in limbo with an
         * active target.
         */
        this.pa = new SortedMap(DocumentKey.comparator), 
        /**
         * Keeps track of the information about an active limbo resolution for each
         * active target ID that was started for the purpose of limbo resolution.
         */
        this.ya = new Map, this.wa = new __PRIVATE_ReferenceSet, 
        /** Stores user completion handlers, indexed by User and BatchId. */
        this.Sa = {}, 
        /** Stores user callbacks waiting for all pending writes to be acknowledged. */
        this.ba = new Map, this.Da = __PRIVATE_TargetIdGenerator.Nn(), this.onlineState = "Unknown" /* OnlineState.Unknown */ , 
        // The primary state is set to `true` or `false` immediately after Firestore
        // startup. In the interim, a client should only be considered primary if
        // `isPrimary` is true.
        this.Ca = void 0;
    }
    get isPrimaryClient() {
        return !0 === this.Ca;
    }
}

/**
 * Initiates the new listen, resolves promise when listen enqueued to the
 * server. All the subsequent view snapshots or errors are sent to the
 * subscribed handlers. Returns the initial snapshot.
 */
async function __PRIVATE_syncEngineListen(e, t) {
    const n = __PRIVATE_ensureWatchCallbacks(e);
    let r, i;
    const s = n.ma.get(t);
    if (s) 
    // PORTING NOTE: With Multi-Tab Web, it is possible that a query view
    // already exists when EventManager calls us for the first time. This
    // happens when the primary tab is already listening to this query on
    // behalf of another tab and the user of the primary also starts listening
    // to the query. EventManager will not have an assigned target ID in this
    // case and calls `listen` to obtain this ID.
    r = s.targetId, n.sharedClientState.addLocalQueryTarget(r), i = s.view.Aa(); else {
        const e = await __PRIVATE_localStoreAllocateTarget(n.localStore, __PRIVATE_queryToTarget(t)), s = n.sharedClientState.addLocalQueryTarget(e.targetId);
        r = e.targetId, i = await __PRIVATE_initializeViewAndComputeSnapshot(n, t, r, "current" === s, e.resumeToken), 
        n.isPrimaryClient && __PRIVATE_remoteStoreListen(n.remoteStore, e);
    }
    return i;
}

/**
 * Registers a view for a previously unknown query and computes its initial
 * snapshot.
 */ async function __PRIVATE_initializeViewAndComputeSnapshot(e, t, n, r, i) {
    // PORTING NOTE: On Web only, we inject the code that registers new Limbo
    // targets based on view changes. This allows us to only depend on Limbo
    // changes when user code includes queries.
    e.va = (t, n, r) => async function __PRIVATE_applyDocChanges(e, t, n, r) {
        let i = t.view.ca(n);
        i.Zi && (
        // The query has a limit and some docs were removed, so we need
        // to re-run the query against the local store to make sure we
        // didn't lose any good docs that had been past the limit.
        i = await __PRIVATE_localStoreExecuteQuery(e.localStore, t.query, 
        /* usePreviousResults= */ !1).then((({documents: e}) => t.view.ca(e, i))));
        const s = r && r.targetChanges.get(t.targetId), o = r && null != r.targetMismatches.get(t.targetId), _ = t.view.applyChanges(i, 
        /* limboResolutionEnabled= */ e.isPrimaryClient, s, o);
        return __PRIVATE_updateTrackedLimbos(e, t.targetId, _.Ta), _.snapshot;
    }(e, t, n, r);
    const s = await __PRIVATE_localStoreExecuteQuery(e.localStore, t, 
    /* usePreviousResults= */ !0), o = new __PRIVATE_View(t, s.ls), _ = o.ca(s.documents), a = TargetChange.createSynthesizedTargetChangeForCurrentChange(n, r && "Offline" /* OnlineState.Offline */ !== e.onlineState, i), u = o.applyChanges(_, 
    /* limboResolutionEnabled= */ e.isPrimaryClient, a);
    __PRIVATE_updateTrackedLimbos(e, n, u.Ta);
    const c = new __PRIVATE_QueryView(t, n, o);
    return e.ma.set(t, c), e.fa.has(n) ? e.fa.get(n).push(t) : e.fa.set(n, [ t ]), u.snapshot;
}

/** Stops listening to the query. */ async function __PRIVATE_syncEngineUnlisten(e, t) {
    const n = __PRIVATE_debugCast(e), r = n.ma.get(t), i = n.fa.get(r.targetId);
    if (i.length > 1) return n.fa.set(r.targetId, i.filter((e => !__PRIVATE_queryEquals(e, t)))), 
    void n.ma.delete(t);
    // No other queries are mapped to the target, clean up the query and the target.
        if (n.isPrimaryClient) {
        // We need to remove the local query target first to allow us to verify
        // whether any other client is still interested in this target.
        n.sharedClientState.removeLocalQueryTarget(r.targetId);
        n.sharedClientState.isActiveQueryTarget(r.targetId) || await __PRIVATE_localStoreReleaseTarget(n.localStore, r.targetId, 
        /*keepPersistedTargetData=*/ !1).then((() => {
            n.sharedClientState.clearQueryState(r.targetId), __PRIVATE_remoteStoreUnlisten(n.remoteStore, r.targetId), 
            __PRIVATE_removeAndCleanupTarget(n, r.targetId);
        })).catch(__PRIVATE_ignoreIfPrimaryLeaseLoss);
    } else __PRIVATE_removeAndCleanupTarget(n, r.targetId), await __PRIVATE_localStoreReleaseTarget(n.localStore, r.targetId, 
    /*keepPersistedTargetData=*/ !0);
}

/**
 * Applies one remote event to the sync engine, notifying any views of the
 * changes, and releasing any pending mutation batches that would become
 * visible because of the snapshot version the remote event contains.
 */ async function __PRIVATE_syncEngineApplyRemoteEvent(e, t) {
    const n = __PRIVATE_debugCast(e);
    try {
        const e = await __PRIVATE_localStoreApplyRemoteEventToLocalCache(n.localStore, t);
        // Update `receivedDocument` as appropriate for any limbo targets.
                t.targetChanges.forEach(((e, t) => {
            const r = n.ya.get(t);
            r && (
            // Since this is a limbo resolution lookup, it's for a single document
            // and it could be added, modified, or removed, but not a combination.
            __PRIVATE_hardAssert(e.addedDocuments.size + e.modifiedDocuments.size + e.removedDocuments.size <= 1), 
            e.addedDocuments.size > 0 ? r.Ra = !0 : e.modifiedDocuments.size > 0 ? __PRIVATE_hardAssert(r.Ra) : e.removedDocuments.size > 0 && (__PRIVATE_hardAssert(r.Ra), 
            r.Ra = !1));
        })), await __PRIVATE_syncEngineEmitNewSnapsAndNotifyLocalStore(n, e, t);
    } catch (e) {
        await __PRIVATE_ignoreIfPrimaryLeaseLoss(e);
    }
}

/**
 * Applies an OnlineState change to the sync engine and notifies any views of
 * the change.
 */ function __PRIVATE_syncEngineApplyOnlineStateChange(e, t, n) {
    const r = __PRIVATE_debugCast(e);
    // If we are the secondary client, we explicitly ignore the remote store's
    // online state (the local client may go offline, even though the primary
    // tab remains online) and only apply the primary tab's online state from
    // SharedClientState.
        if (r.isPrimaryClient && 0 /* OnlineStateSource.RemoteStore */ === n || !r.isPrimaryClient && 1 /* OnlineStateSource.SharedClientState */ === n) {
        const e = [];
        r.ma.forEach(((n, r) => {
            const i = r.view.Q_(t);
            i.snapshot && e.push(i.snapshot);
        })), function __PRIVATE_eventManagerOnOnlineStateChange(e, t) {
            const n = __PRIVATE_debugCast(e);
            n.onlineState = t;
            let r = !1;
            n.queries.forEach(((e, n) => {
                for (const e of n.listeners) 
                // Run global snapshot listeners if a consistent snapshot has been emitted.
                e.Q_(t) && (r = !0);
            })), r && __PRIVATE_raiseSnapshotsInSyncEvent(n);
        }(r.eventManager, t), e.length && r.Va.a_(e), r.onlineState = t, r.isPrimaryClient && r.sharedClientState.setOnlineState(t);
    }
}

/**
 * Rejects the listen for the given targetID. This can be triggered by the
 * backend for any active target.
 *
 * @param syncEngine - The sync engine implementation.
 * @param targetId - The targetID corresponds to one previously initiated by the
 * user as part of TargetData passed to listen() on RemoteStore.
 * @param err - A description of the condition that has forced the rejection.
 * Nearly always this will be an indication that the user is no longer
 * authorized to see the data matching the target.
 */ async function __PRIVATE_syncEngineRejectListen(e, t, n) {
    const r = __PRIVATE_debugCast(e);
    // PORTING NOTE: Multi-tab only.
        r.sharedClientState.updateQueryState(t, "rejected", n);
    const i = r.ya.get(t), s = i && i.key;
    if (s) {
        // TODO(klimt): We really only should do the following on permission
        // denied errors, but we don't have the cause code here.
        // It's a limbo doc. Create a synthetic event saying it was deleted.
        // This is kind of a hack. Ideally, we would have a method in the local
        // store to purge a document. However, it would be tricky to keep all of
        // the local store's invariants with another method.
        let e = new SortedMap(DocumentKey.comparator);
        // TODO(b/217189216): This limbo document should ideally have a read time,
        // so that it is picked up by any read-time based scans. The backend,
        // however, does not send a read time for target removals.
                e = e.insert(s, MutableDocument.newNoDocument(s, SnapshotVersion.min()));
        const n = __PRIVATE_documentKeySet().add(s), i = new RemoteEvent(SnapshotVersion.min(), 
        /* targetChanges= */ new Map, 
        /* targetMismatches= */ new SortedMap(__PRIVATE_primitiveComparator), e, n);
        await __PRIVATE_syncEngineApplyRemoteEvent(r, i), 
        // Since this query failed, we won't want to manually unlisten to it.
        // We only remove it from bookkeeping after we successfully applied the
        // RemoteEvent. If `applyRemoteEvent()` throws, we want to re-listen to
        // this query when the RemoteStore restarts the Watch stream, which should
        // re-trigger the target failure.
        r.pa = r.pa.remove(s), r.ya.delete(t), __PRIVATE_pumpEnqueuedLimboResolutions(r);
    } else await __PRIVATE_localStoreReleaseTarget(r.localStore, t, 
    /* keepPersistedTargetData */ !1).then((() => __PRIVATE_removeAndCleanupTarget(r, t, n))).catch(__PRIVATE_ignoreIfPrimaryLeaseLoss);
}

function __PRIVATE_removeAndCleanupTarget(e, t, n = null) {
    e.sharedClientState.removeLocalQueryTarget(t);
    for (const r of e.fa.get(t)) e.ma.delete(r), n && e.Va.Fa(r, n);
    if (e.fa.delete(t), e.isPrimaryClient) {
        e.wa.Rr(t).forEach((t => {
            e.wa.containsKey(t) || 
            // We removed the last reference for this key
            __PRIVATE_removeLimboTarget(e, t);
        }));
    }
}

function __PRIVATE_removeLimboTarget(e, t) {
    e.ga.delete(t.path.canonicalString());
    // It's possible that the target already got removed because the query failed. In that case,
    // the key won't exist in `limboTargetsByKey`. Only do the cleanup if we still have the target.
    const n = e.pa.get(t);
    null !== n && (__PRIVATE_remoteStoreUnlisten(e.remoteStore, n), e.pa = e.pa.remove(t), 
    e.ya.delete(n), __PRIVATE_pumpEnqueuedLimboResolutions(e));
}

function __PRIVATE_updateTrackedLimbos(e, t, n) {
    for (const r of n) if (r instanceof __PRIVATE_AddedLimboDocument) e.wa.addReference(r.key, t), 
    __PRIVATE_trackLimboChange(e, r); else if (r instanceof __PRIVATE_RemovedLimboDocument) {
        __PRIVATE_logDebug("SyncEngine", "Document no longer in limbo: " + r.key), e.wa.removeReference(r.key, t);
        e.wa.containsKey(r.key) || 
        // We removed the last reference for this key
        __PRIVATE_removeLimboTarget(e, r.key);
    } else fail();
}

function __PRIVATE_trackLimboChange(e, t) {
    const n = t.key, r = n.path.canonicalString();
    e.pa.get(n) || e.ga.has(r) || (__PRIVATE_logDebug("SyncEngine", "New document in limbo: " + n), 
    e.ga.add(r), __PRIVATE_pumpEnqueuedLimboResolutions(e));
}

/**
 * Starts listens for documents in limbo that are enqueued for resolution,
 * subject to a maximum number of concurrent resolutions.
 *
 * Without bounding the number of concurrent resolutions, the server can fail
 * with "resource exhausted" errors which can lead to pathological client
 * behavior as seen in https://github.com/firebase/firebase-js-sdk/issues/2683.
 */ function __PRIVATE_pumpEnqueuedLimboResolutions(e) {
    for (;e.ga.size > 0 && e.pa.size < e.maxConcurrentLimboResolutions; ) {
        const t = e.ga.values().next().value;
        e.ga.delete(t);
        const n = new DocumentKey(ResourcePath.fromString(t)), r = e.Da.next();
        e.ya.set(r, new LimboResolution(n)), e.pa = e.pa.insert(n, r), __PRIVATE_remoteStoreListen(e.remoteStore, new TargetData(__PRIVATE_queryToTarget(__PRIVATE_newQueryForPath(n.path)), r, "TargetPurposeLimboResolution" /* TargetPurpose.LimboResolution */ , __PRIVATE_ListenSequence._e));
    }
}

async function __PRIVATE_syncEngineEmitNewSnapsAndNotifyLocalStore(e, t, n) {
    const r = __PRIVATE_debugCast(e), i = [], s = [], o = [];
    r.ma.isEmpty() || (r.ma.forEach(((e, _) => {
        o.push(r.va(_, t, n).then((e => {
            // Update views if there are actual changes.
            if (
            // If there are changes, or we are handling a global snapshot, notify
            // secondary clients to update query state.
            (e || n) && r.isPrimaryClient && r.sharedClientState.updateQueryState(_.targetId, (null == e ? void 0 : e.fromCache) ? "not-current" : "current"), 
            e) {
                i.push(e);
                const t = __PRIVATE_LocalViewChanges.Qi(_.targetId, e);
                s.push(t);
            }
        })));
    })), await Promise.all(o), r.Va.a_(i), await async function __PRIVATE_localStoreNotifyLocalViewChanges(e, t) {
        const n = __PRIVATE_debugCast(e);
        try {
            await n.persistence.runTransaction("notifyLocalViewChanges", "readwrite", (e => PersistencePromise.forEach(t, (t => PersistencePromise.forEach(t.ki, (r => n.persistence.referenceDelegate.addReference(e, t.targetId, r))).next((() => PersistencePromise.forEach(t.qi, (r => n.persistence.referenceDelegate.removeReference(e, t.targetId, r)))))))));
        } catch (e) {
            if (!__PRIVATE_isIndexedDbTransactionError(e)) throw e;
            // If `notifyLocalViewChanges` fails, we did not advance the sequence
            // number for the documents that were included in this transaction.
            // This might trigger them to be deleted earlier than they otherwise
            // would have, but it should not invalidate the integrity of the data.
            __PRIVATE_logDebug("LocalStore", "Failed to update sequence numbers: " + e);
        }
        for (const e of t) {
            const t = e.targetId;
            if (!e.fromCache) {
                const e = n.ts.get(t), r = e.snapshotVersion, i = e.withLastLimboFreeSnapshotVersion(r);
                // Advance the last limbo free snapshot version
                                n.ts = n.ts.insert(t, i);
            }
        }
    }(r.localStore, s));
}

async function __PRIVATE_syncEngineHandleCredentialChange(e, t) {
    const n = __PRIVATE_debugCast(e);
    if (!n.currentUser.isEqual(t)) {
        __PRIVATE_logDebug("SyncEngine", "User change. New user:", t.toKey());
        const e = await __PRIVATE_localStoreHandleUserChange(n.localStore, t);
        n.currentUser = t, 
        // Fails tasks waiting for pending writes requested by previous user.
        function __PRIVATE_rejectOutstandingPendingWritesCallbacks(e, t) {
            e.ba.forEach((e => {
                e.forEach((e => {
                    e.reject(new FirestoreError(D.CANCELLED, t));
                }));
            })), e.ba.clear();
        }(n, "'waitForPendingWrites' promise is rejected due to a user change."), 
        // TODO(b/114226417): Consider calling this only in the primary tab.
        n.sharedClientState.handleUserChange(t, e.removedBatchIds, e.addedBatchIds), await __PRIVATE_syncEngineEmitNewSnapsAndNotifyLocalStore(n, e._s);
    }
}

function __PRIVATE_syncEngineGetRemoteKeysForTarget(e, t) {
    const n = __PRIVATE_debugCast(e), r = n.ya.get(t);
    if (r && r.Ra) return __PRIVATE_documentKeySet().add(r.key);
    {
        let e = __PRIVATE_documentKeySet();
        const r = n.fa.get(t);
        if (!r) return e;
        for (const t of r) {
            const r = n.ma.get(t);
            e = e.unionWith(r.view.ua);
        }
        return e;
    }
}

function __PRIVATE_ensureWatchCallbacks(e) {
    const t = __PRIVATE_debugCast(e);
    return t.remoteStore.remoteSyncer.applyRemoteEvent = __PRIVATE_syncEngineApplyRemoteEvent.bind(null, t), 
    t.remoteStore.remoteSyncer.getRemoteKeysForTarget = __PRIVATE_syncEngineGetRemoteKeysForTarget.bind(null, t), 
    t.remoteStore.remoteSyncer.rejectListen = __PRIVATE_syncEngineRejectListen.bind(null, t), 
    t.Va.a_ = __PRIVATE_eventManagerOnWatchChange.bind(null, t.eventManager), t.Va.Fa = __PRIVATE_eventManagerOnWatchError.bind(null, t.eventManager), 
    t;
}

class MemoryOfflineComponentProvider {
    constructor() {
        this.synchronizeTabs = !1;
    }
    async initialize(e) {
        this.serializer = __PRIVATE_newSerializer(e.databaseInfo.databaseId), this.sharedClientState = this.createSharedClientState(e), 
        this.persistence = this.createPersistence(e), await this.persistence.start(), this.localStore = this.createLocalStore(e), 
        this.gcScheduler = this.createGarbageCollectionScheduler(e, this.localStore), this.indexBackfillerScheduler = this.createIndexBackfillerScheduler(e, this.localStore);
    }
    createGarbageCollectionScheduler(e, t) {
        return null;
    }
    createIndexBackfillerScheduler(e, t) {
        return null;
    }
    createLocalStore(e) {
        return __PRIVATE_newLocalStore(this.persistence, new __PRIVATE_QueryEngine, e.initialUser, this.serializer);
    }
    createPersistence(e) {
        return new __PRIVATE_MemoryPersistence(__PRIVATE_MemoryEagerDelegate.jr, this.serializer);
    }
    createSharedClientState(e) {
        return new __PRIVATE_MemorySharedClientState;
    }
    async terminate() {
        this.gcScheduler && this.gcScheduler.stop(), await this.sharedClientState.shutdown(), 
        await this.persistence.shutdown();
    }
}

/**
 * Initializes and wires the components that are needed to interface with the
 * network.
 */ class OnlineComponentProvider {
    async initialize(e, t) {
        this.localStore || (this.localStore = e.localStore, this.sharedClientState = e.sharedClientState, 
        this.datastore = this.createDatastore(t), this.remoteStore = this.createRemoteStore(t), 
        this.eventManager = this.createEventManager(t), this.syncEngine = this.createSyncEngine(t, 
        /* startAsPrimary=*/ !e.synchronizeTabs), this.sharedClientState.onlineStateHandler = e => __PRIVATE_syncEngineApplyOnlineStateChange(this.syncEngine, e, 1 /* OnlineStateSource.SharedClientState */), 
        this.remoteStore.remoteSyncer.handleCredentialChange = __PRIVATE_syncEngineHandleCredentialChange.bind(null, this.syncEngine), 
        await __PRIVATE_remoteStoreApplyPrimaryState(this.remoteStore, this.syncEngine.isPrimaryClient));
    }
    createEventManager(e) {
        return function __PRIVATE_newEventManager() {
            return new __PRIVATE_EventManagerImpl;
        }();
    }
    createDatastore(e) {
        const t = __PRIVATE_newSerializer(e.databaseInfo.databaseId), n = function __PRIVATE_newConnection(e) {
            return new __PRIVATE_WebChannelConnection(e);
        }
        /** Return the Platform-specific connectivity monitor. */ (e.databaseInfo);
        return function __PRIVATE_newDatastore(e, t, n, r) {
            return new __PRIVATE_DatastoreImpl(e, t, n, r);
        }(e.authCredentials, e.appCheckCredentials, n, t);
    }
    createRemoteStore(e) {
        return function __PRIVATE_newRemoteStore(e, t, n, r, i) {
            return new __PRIVATE_RemoteStoreImpl(e, t, n, r, i);
        }
        /** Re-enables the network. Idempotent. */ (this.localStore, this.datastore, e.asyncQueue, (e => __PRIVATE_syncEngineApplyOnlineStateChange(this.syncEngine, e, 0 /* OnlineStateSource.RemoteStore */)), function __PRIVATE_newConnectivityMonitor() {
            return __PRIVATE_BrowserConnectivityMonitor.D() ? new __PRIVATE_BrowserConnectivityMonitor : new __PRIVATE_NoopConnectivityMonitor;
        }());
    }
    createSyncEngine(e, t) {
        return function __PRIVATE_newSyncEngine(e, t, n, 
        // PORTING NOTE: Manages state synchronization in multi-tab environments.
        r, i, s, o) {
            const _ = new __PRIVATE_SyncEngineImpl(e, t, n, r, i, s);
            return o && (_.Ca = !0), _;
        }(this.localStore, this.remoteStore, this.eventManager, this.sharedClientState, e.initialUser, e.maxConcurrentLimboResolutions, t);
    }
    terminate() {
        return async function __PRIVATE_remoteStoreShutdown(e) {
            const t = __PRIVATE_debugCast(e);
            __PRIVATE_logDebug("RemoteStore", "RemoteStore shutting down."), t.C_.add(5 /* OfflineCause.Shutdown */), 
            await __PRIVATE_disableNetworkInternal(t), t.F_.shutdown(), 
            // Set the OnlineState to Unknown (rather than Offline) to avoid potentially
            // triggering spurious listener events with cached data, etc.
            t.M_.set("Unknown" /* OnlineState.Unknown */);
        }(this.remoteStore);
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * On web, a `ReadableStream` is wrapped around by a `ByteStreamReader`.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*
 * A wrapper implementation of Observer<T> that will dispatch events
 * asynchronously. To allow immediate silencing, a mute call is added which
 * causes events scheduled to no longer be raised.
 */
class __PRIVATE_AsyncObserver {
    constructor(e) {
        this.observer = e, 
        /**
         * When set to true, will not raise future events. Necessary to deal with
         * async detachment of listener.
         */
        this.muted = !1;
    }
    next(e) {
        this.observer.next && this.Oa(this.observer.next, e);
    }
    error(e) {
        this.observer.error ? this.Oa(this.observer.error, e) : __PRIVATE_logError("Uncaught Error in snapshot listener:", e.toString());
    }
    Na() {
        this.muted = !0;
    }
    Oa(e, t) {
        this.muted || setTimeout((() => {
            this.muted || e(t);
        }), 0);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * FirestoreClient is a top-level class that constructs and owns all of the //
 * pieces of the client SDK architecture. It is responsible for creating the //
 * async queue that is shared by all of the other components in the system. //
 */
class FirestoreClient {
    constructor(e, t, 
    /**
     * Asynchronous queue responsible for all of our internal processing. When
     * we get incoming work from the user (via public API) or the network
     * (incoming GRPC messages), we should always schedule onto this queue.
     * This ensures all of our work is properly serialized (e.g. we don't
     * start processing a new operation while the previous one is waiting for
     * an async I/O to complete).
     */
    n, r) {
        this.authCredentials = e, this.appCheckCredentials = t, this.asyncQueue = n, this.databaseInfo = r, 
        this.user = User.UNAUTHENTICATED, this.clientId = __PRIVATE_AutoId.newId(), this.authCredentialListener = () => Promise.resolve(), 
        this.appCheckCredentialListener = () => Promise.resolve(), this.authCredentials.start(n, (async e => {
            __PRIVATE_logDebug("FirestoreClient", "Received user=", e.uid), await this.authCredentialListener(e), 
            this.user = e;
        })), this.appCheckCredentials.start(n, (e => (__PRIVATE_logDebug("FirestoreClient", "Received new app check token=", e), 
        this.appCheckCredentialListener(e, this.user))));
    }
    async getConfiguration() {
        return {
            asyncQueue: this.asyncQueue,
            databaseInfo: this.databaseInfo,
            clientId: this.clientId,
            authCredentials: this.authCredentials,
            appCheckCredentials: this.appCheckCredentials,
            initialUser: this.user,
            maxConcurrentLimboResolutions: 100
        };
    }
    setCredentialChangeListener(e) {
        this.authCredentialListener = e;
    }
    setAppCheckTokenChangeListener(e) {
        this.appCheckCredentialListener = e;
    }
    /**
     * Checks that the client has not been terminated. Ensures that other methods on //
     * this class cannot be called after the client is terminated. //
     */    verifyNotTerminated() {
        if (this.asyncQueue.isShuttingDown) throw new FirestoreError(D.FAILED_PRECONDITION, "The client has already been terminated.");
    }
    terminate() {
        this.asyncQueue.enterRestrictedMode();
        const e = new __PRIVATE_Deferred;
        return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async () => {
            try {
                this._onlineComponents && await this._onlineComponents.terminate(), this._offlineComponents && await this._offlineComponents.terminate(), 
                // The credentials provider must be terminated after shutting down the
                // RemoteStore as it will prevent the RemoteStore from retrieving auth
                // tokens.
                this.authCredentials.shutdown(), this.appCheckCredentials.shutdown(), e.resolve();
            } catch (t) {
                const n = __PRIVATE_wrapInUserErrorIfRecoverable(t, "Failed to shutdown persistence");
                e.reject(n);
            }
        })), e.promise;
    }
}

async function __PRIVATE_setOfflineComponentProvider(e, t) {
    e.asyncQueue.verifyOperationInProgress(), __PRIVATE_logDebug("FirestoreClient", "Initializing OfflineComponentProvider");
    const n = await e.getConfiguration();
    await t.initialize(n);
    let r = n.initialUser;
    e.setCredentialChangeListener((async e => {
        r.isEqual(e) || (await __PRIVATE_localStoreHandleUserChange(t.localStore, e), r = e);
    })), 
    // When a user calls clearPersistence() in one client, all other clients
    // need to be terminated to allow the delete to succeed.
    t.persistence.setDatabaseDeletedListener((() => e.terminate())), e._offlineComponents = t;
}

async function __PRIVATE_setOnlineComponentProvider(e, t) {
    e.asyncQueue.verifyOperationInProgress();
    const n = await __PRIVATE_ensureOfflineComponents(e);
    __PRIVATE_logDebug("FirestoreClient", "Initializing OnlineComponentProvider");
    const r = await e.getConfiguration();
    await t.initialize(n, r), 
    // The CredentialChangeListener of the online component provider takes
    // precedence over the offline component provider.
    e.setCredentialChangeListener((e => __PRIVATE_remoteStoreHandleCredentialChange(t.remoteStore, e))), 
    e.setAppCheckTokenChangeListener(((e, n) => __PRIVATE_remoteStoreHandleCredentialChange(t.remoteStore, n))), 
    e._onlineComponents = t;
}

/**
 * Decides whether the provided error allows us to gracefully disable
 * persistence (as opposed to crashing the client).
 */ function __PRIVATE_canFallbackFromIndexedDbError(e) {
    return "FirebaseError" === e.name ? e.code === D.FAILED_PRECONDITION || e.code === D.UNIMPLEMENTED : !("undefined" != typeof DOMException && e instanceof DOMException) || (
    // When the browser is out of quota we could get either quota exceeded
    // or an aborted error depending on whether the error happened during
    // schema migration.
    22 === e.code || 20 === e.code || 
    // Firefox Private Browsing mode disables IndexedDb and returns
    // INVALID_STATE for any usage.
    11 === e.code);
}

async function __PRIVATE_ensureOfflineComponents(e) {
    if (!e._offlineComponents) if (e._uninitializedComponentsProvider) {
        __PRIVATE_logDebug("FirestoreClient", "Using user provided OfflineComponentProvider");
        try {
            await __PRIVATE_setOfflineComponentProvider(e, e._uninitializedComponentsProvider._offline);
        } catch (t) {
            const n = t;
            if (!__PRIVATE_canFallbackFromIndexedDbError(n)) throw n;
            __PRIVATE_logWarn("Error using user provided cache. Falling back to memory cache: " + n), 
            await __PRIVATE_setOfflineComponentProvider(e, new MemoryOfflineComponentProvider);
        }
    } else __PRIVATE_logDebug("FirestoreClient", "Using default OfflineComponentProvider"), 
    await __PRIVATE_setOfflineComponentProvider(e, new MemoryOfflineComponentProvider);
    return e._offlineComponents;
}

async function __PRIVATE_ensureOnlineComponents(e) {
    return e._onlineComponents || (e._uninitializedComponentsProvider ? (__PRIVATE_logDebug("FirestoreClient", "Using user provided OnlineComponentProvider"), 
    await __PRIVATE_setOnlineComponentProvider(e, e._uninitializedComponentsProvider._online)) : (__PRIVATE_logDebug("FirestoreClient", "Using default OnlineComponentProvider"), 
    await __PRIVATE_setOnlineComponentProvider(e, new OnlineComponentProvider))), e._onlineComponents;
}

async function __PRIVATE_getEventManager(e) {
    const t = await __PRIVATE_ensureOnlineComponents(e), n = t.eventManager;
    return n.onListen = __PRIVATE_syncEngineListen.bind(null, t.syncEngine), n.onUnlisten = __PRIVATE_syncEngineUnlisten.bind(null, t.syncEngine), 
    n;
}

function __PRIVATE_firestoreClientGetDocumentViaSnapshotListener(e, t, n = {}) {
    const r = new __PRIVATE_Deferred;
    return e.asyncQueue.enqueueAndForget((async () => function __PRIVATE_readDocumentViaSnapshotListener(e, t, n, r, i) {
        const s = new __PRIVATE_AsyncObserver({
            next: s => {
                // Remove query first before passing event to user to avoid
                // user actions affecting the now stale query.
                t.enqueueAndForget((() => __PRIVATE_eventManagerUnlisten(e, o)));
                const _ = s.docs.has(n);
                !_ && s.fromCache ? 
                // TODO(dimond): If we're online and the document doesn't
                // exist then we resolve with a doc.exists set to false. If
                // we're offline however, we reject the Promise in this
                // case. Two options: 1) Cache the negative response from
                // the server so we can deliver that even when you're
                // offline 2) Actually reject the Promise in the online case
                // if the document doesn't exist.
                i.reject(new FirestoreError(D.UNAVAILABLE, "Failed to get document because the client is offline.")) : _ && s.fromCache && r && "server" === r.source ? i.reject(new FirestoreError(D.UNAVAILABLE, 'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')) : i.resolve(s);
            },
            error: e => i.reject(e)
        }), o = new __PRIVATE_QueryListener(__PRIVATE_newQueryForPath(n.path), s, {
            includeMetadataChanges: !0,
            J_: !0
        });
        return __PRIVATE_eventManagerListen(e, o);
    }(await __PRIVATE_getEventManager(e), e.asyncQueue, t, n, r))), r.promise;
}

/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Compares two `ExperimentalLongPollingOptions` objects for equality.
 */
/**
 * Creates and returns a new `ExperimentalLongPollingOptions` with the same
 * option values as the given instance.
 */
function __PRIVATE_cloneLongPollingOptions(e) {
    const t = {};
    return void 0 !== e.timeoutSeconds && (t.timeoutSeconds = e.timeoutSeconds), t;
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const me = new Map;

/**
 * An instance map that ensures only one Datastore exists per Firestore
 * instance.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __PRIVATE_validateNonEmptyArgument(e, t, n) {
    if (!n) throw new FirestoreError(D.INVALID_ARGUMENT, `Function ${e}() cannot be called with an empty ${t}.`);
}

/**
 * Validates that two boolean options are not set at the same time.
 * @internal
 */ function __PRIVATE_validateIsNotUsedTogether(e, t, n, r) {
    if (!0 === t && !0 === r) throw new FirestoreError(D.INVALID_ARGUMENT, `${e} and ${n} cannot be used together.`);
}

/**
 * Validates that `path` refers to a document (indicated by the fact it contains
 * an even numbers of segments).
 */ function __PRIVATE_validateDocumentPath(e) {
    if (!DocumentKey.isDocumentKey(e)) throw new FirestoreError(D.INVALID_ARGUMENT, `Invalid document reference. Document references must have an even number of segments, but ${e} has ${e.length}.`);
}

/**
 * Returns true if it's a non-null object without a custom prototype
 * (i.e. excludes Array, Date, etc.).
 */
/** Returns a string describing the type / value of the provided input. */
function __PRIVATE_valueDescription(e) {
    if (void 0 === e) return "undefined";
    if (null === e) return "null";
    if ("string" == typeof e) return e.length > 20 && (e = `${e.substring(0, 20)}...`), 
    JSON.stringify(e);
    if ("number" == typeof e || "boolean" == typeof e) return "" + e;
    if ("object" == typeof e) {
        if (e instanceof Array) return "an array";
        {
            const t = 
            /** try to get the constructor name for an object. */
            function __PRIVATE_tryGetCustomObjectType(e) {
                if (e.constructor) return e.constructor.name;
                return null;
            }
            /**
 * Casts `obj` to `T`, optionally unwrapping Compat types to expose the
 * underlying instance. Throws if  `obj` is not an instance of `T`.
 *
 * This cast is used in the Lite and Full SDK to verify instance types for
 * arguments passed to the public API.
 * @internal
 */ (e);
            return t ? `a custom ${t} object` : "an object";
        }
    }
    return "function" == typeof e ? "a function" : fail();
}

function __PRIVATE_cast(e, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
t) {
    if ("_delegate" in e && (
    // Unwrap Compat types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    e = e._delegate), !(e instanceof t)) {
        if (t.name === e.constructor.name) throw new FirestoreError(D.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
        {
            const n = __PRIVATE_valueDescription(e);
            throw new FirestoreError(D.INVALID_ARGUMENT, `Expected type '${t.name}', but it was: ${n}`);
        }
    }
    return e;
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// settings() defaults:
/**
 * A concrete type describing all the values that can be applied via a
 * user-supplied `FirestoreSettings` object. This is a separate type so that
 * defaults can be supplied and the value can be checked for equality.
 */
class FirestoreSettingsImpl {
    constructor(e) {
        var t, n;
        if (void 0 === e.host) {
            if (void 0 !== e.ssl) throw new FirestoreError(D.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
            this.host = "firestore.googleapis.com", this.ssl = true;
        } else this.host = e.host, this.ssl = null === (t = e.ssl) || void 0 === t || t;
        if (this.credentials = e.credentials, this.ignoreUndefinedProperties = !!e.ignoreUndefinedProperties, 
        this.localCache = e.localCache, void 0 === e.cacheSizeBytes) this.cacheSizeBytes = 41943040; else {
            if (-1 !== e.cacheSizeBytes && e.cacheSizeBytes < 1048576) throw new FirestoreError(D.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
            this.cacheSizeBytes = e.cacheSizeBytes;
        }
        __PRIVATE_validateIsNotUsedTogether("experimentalForceLongPolling", e.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", e.experimentalAutoDetectLongPolling), 
        this.experimentalForceLongPolling = !!e.experimentalForceLongPolling, this.experimentalForceLongPolling ? this.experimentalAutoDetectLongPolling = !1 : void 0 === e.experimentalAutoDetectLongPolling ? this.experimentalAutoDetectLongPolling = true : 
        // For backwards compatibility, coerce the value to boolean even though
        // the TypeScript compiler has narrowed the type to boolean already.
        // noinspection PointlessBooleanExpressionJS
        this.experimentalAutoDetectLongPolling = !!e.experimentalAutoDetectLongPolling, 
        this.experimentalLongPollingOptions = __PRIVATE_cloneLongPollingOptions(null !== (n = e.experimentalLongPollingOptions) && void 0 !== n ? n : {}), 
        function __PRIVATE_validateLongPollingOptions(e) {
            if (void 0 !== e.timeoutSeconds) {
                if (isNaN(e.timeoutSeconds)) throw new FirestoreError(D.INVALID_ARGUMENT, `invalid long polling timeout: ${e.timeoutSeconds} (must not be NaN)`);
                if (e.timeoutSeconds < 5) throw new FirestoreError(D.INVALID_ARGUMENT, `invalid long polling timeout: ${e.timeoutSeconds} (minimum allowed value is 5)`);
                if (e.timeoutSeconds > 30) throw new FirestoreError(D.INVALID_ARGUMENT, `invalid long polling timeout: ${e.timeoutSeconds} (maximum allowed value is 30)`);
            }
        }
        /**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
        /**
 * The Cloud Firestore service interface.
 *
 * Do not call this constructor directly. Instead, use {@link (getFirestore:1)}.
 */ (this.experimentalLongPollingOptions), this.useFetchStreams = !!e.useFetchStreams;
    }
    isEqual(e) {
        return this.host === e.host && this.ssl === e.ssl && this.credentials === e.credentials && this.cacheSizeBytes === e.cacheSizeBytes && this.experimentalForceLongPolling === e.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === e.experimentalAutoDetectLongPolling && function __PRIVATE_longPollingOptionsEqual(e, t) {
            return e.timeoutSeconds === t.timeoutSeconds;
        }(this.experimentalLongPollingOptions, e.experimentalLongPollingOptions) && this.ignoreUndefinedProperties === e.ignoreUndefinedProperties && this.useFetchStreams === e.useFetchStreams;
    }
}

class Firestore$1 {
    /** @hideconstructor */
    constructor(e, t, n, r) {
        this._authCredentials = e, this._appCheckCredentials = t, this._databaseId = n, 
        this._app = r, 
        /**
         * Whether it's a Firestore or Firestore Lite instance.
         */
        this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new FirestoreSettingsImpl({}), 
        this._settingsFrozen = !1;
    }
    /**
     * The {@link @firebase/app#FirebaseApp} associated with this `Firestore` service
     * instance.
     */    get app() {
        if (!this._app) throw new FirestoreError(D.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
        return this._app;
    }
    get _initialized() {
        return this._settingsFrozen;
    }
    get _terminated() {
        return void 0 !== this._terminateTask;
    }
    _setSettings(e) {
        if (this._settingsFrozen) throw new FirestoreError(D.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
        this._settings = new FirestoreSettingsImpl(e), void 0 !== e.credentials && (this._authCredentials = function __PRIVATE_makeAuthCredentialsProvider(e) {
            if (!e) return new __PRIVATE_EmptyAuthCredentialsProvider;
            switch (e.type) {
              case "firstParty":
                return new __PRIVATE_FirstPartyAuthCredentialsProvider(e.sessionIndex || "0", e.iamToken || null, e.authTokenFactory || null);

              case "provider":
                return e.client;

              default:
                throw new FirestoreError(D.INVALID_ARGUMENT, "makeAuthCredentialsProvider failed due to invalid credential type");
            }
        }(e.credentials));
    }
    _getSettings() {
        return this._settings;
    }
    _freezeSettings() {
        return this._settingsFrozen = !0, this._settings;
    }
    _delete() {
        return this._terminateTask || (this._terminateTask = this._terminate()), this._terminateTask;
    }
    /** Returns a JSON-serializable representation of this `Firestore` instance. */    toJSON() {
        return {
            app: this._app,
            databaseId: this._databaseId,
            settings: this._settings
        };
    }
    /**
     * Terminates all components used by this client. Subclasses can override
     * this method to clean up their own dependencies, but must also call this
     * method.
     *
     * Only ever called once.
     */    _terminate() {
        /**
 * Removes all components associated with the provided instance. Must be called
 * when the `Firestore` instance is terminated.
 */
        return function __PRIVATE_removeComponents(e) {
            const t = me.get(e);
            t && (__PRIVATE_logDebug("ComponentProvider", "Removing Datastore"), me.delete(e), 
            t.terminate());
        }(this), Promise.resolve();
    }
}

/**
 * Modify this instance to communicate with the Cloud Firestore emulator.
 *
 * Note: This must be called before this instance has been used to do any
 * operations.
 *
 * @param firestore - The `Firestore` instance to configure to connect to the
 * emulator.
 * @param host - the emulator host (ex: localhost).
 * @param port - the emulator port (ex: 9000).
 * @param options.mockUserToken - the mock auth token to use for unit testing
 * Security Rules.
 */ function connectFirestoreEmulator(e, t, n, r = {}) {
    var i;
    const s = (e = __PRIVATE_cast(e, Firestore$1))._getSettings(), o = `${t}:${n}`;
    if ("firestore.googleapis.com" !== s.host && s.host !== o && __PRIVATE_logWarn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."), 
    e._setSettings(Object.assign(Object.assign({}, s), {
        host: o,
        ssl: !1
    })), r.mockUserToken) {
        let t, n;
        if ("string" == typeof r.mockUserToken) t = r.mockUserToken, n = User.MOCK_USER; else {
            // Let createMockUserToken validate first (catches common mistakes like
            // invalid field "uid" and missing field "sub" / "user_id".)
            t = createMockUserToken(r.mockUserToken, null === (i = e._app) || void 0 === i ? void 0 : i.options.projectId);
            const s = r.mockUserToken.sub || r.mockUserToken.user_id;
            if (!s) throw new FirestoreError(D.INVALID_ARGUMENT, "mockUserToken must contain 'sub' or 'user_id' field!");
            n = new User(s);
        }
        e._authCredentials = new __PRIVATE_EmulatorAuthCredentialsProvider(new __PRIVATE_OAuthToken(t, n));
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A `Query` refers to a query which you can read or listen to. You can also
 * construct refined `Query` objects by adding filters and ordering.
 */ class Query {
    // This is the lite version of the Query class in the main SDK.
    /** @hideconstructor protected */
    constructor(e, 
    /**
     * If provided, the `FirestoreDataConverter` associated with this instance.
     */
    t, n) {
        this.converter = t, this._query = n, 
        /** The type of this Firestore reference. */
        this.type = "query", this.firestore = e;
    }
    withConverter(e) {
        return new Query(this.firestore, e, this._query);
    }
}

/**
 * A `DocumentReference` refers to a document location in a Firestore database
 * and can be used to write, read, or listen to the location. The document at
 * the referenced location may or may not exist.
 */ class DocumentReference {
    /** @hideconstructor */
    constructor(e, 
    /**
     * If provided, the `FirestoreDataConverter` associated with this instance.
     */
    t, n) {
        this.converter = t, this._key = n, 
        /** The type of this Firestore reference. */
        this.type = "document", this.firestore = e;
    }
    get _path() {
        return this._key.path;
    }
    /**
     * The document's identifier within its collection.
     */    get id() {
        return this._key.path.lastSegment();
    }
    /**
     * A string representing the path of the referenced document (relative
     * to the root of the database).
     */    get path() {
        return this._key.path.canonicalString();
    }
    /**
     * The collection this `DocumentReference` belongs to.
     */    get parent() {
        return new CollectionReference(this.firestore, this.converter, this._key.path.popLast());
    }
    withConverter(e) {
        return new DocumentReference(this.firestore, e, this._key);
    }
}

/**
 * A `CollectionReference` object can be used for adding documents, getting
 * document references, and querying for documents (using {@link (query:1)}).
 */ class CollectionReference extends Query {
    /** @hideconstructor */
    constructor(e, t, n) {
        super(e, t, __PRIVATE_newQueryForPath(n)), this._path = n, 
        /** The type of this Firestore reference. */
        this.type = "collection";
    }
    /** The collection's identifier. */    get id() {
        return this._query.path.lastSegment();
    }
    /**
     * A string representing the path of the referenced collection (relative
     * to the root of the database).
     */    get path() {
        return this._query.path.canonicalString();
    }
    /**
     * A reference to the containing `DocumentReference` if this is a
     * subcollection. If this isn't a subcollection, the reference is null.
     */    get parent() {
        const e = this._path.popLast();
        return e.isEmpty() ? null : new DocumentReference(this.firestore, 
        /* converter= */ null, new DocumentKey(e));
    }
    withConverter(e) {
        return new CollectionReference(this.firestore, e, this._path);
    }
}

function doc(e, t, ...n) {
    if (e = getModularInstance(e), 
    // We allow omission of 'pathString' but explicitly prohibit passing in both
    // 'undefined' and 'null'.
    1 === arguments.length && (t = __PRIVATE_AutoId.newId()), __PRIVATE_validateNonEmptyArgument("doc", "path", t), 
    e instanceof Firestore$1) {
        const r = ResourcePath.fromString(t, ...n);
        return __PRIVATE_validateDocumentPath(r), new DocumentReference(e, 
        /* converter= */ null, new DocumentKey(r));
    }
    {
        if (!(e instanceof DocumentReference || e instanceof CollectionReference)) throw new FirestoreError(D.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
        const r = e._path.child(ResourcePath.fromString(t, ...n));
        return __PRIVATE_validateDocumentPath(r), new DocumentReference(e.firestore, e instanceof CollectionReference ? e.converter : null, new DocumentKey(r));
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class __PRIVATE_AsyncQueueImpl {
    constructor() {
        // The last promise in the queue.
        this.Ja = Promise.resolve(), 
        // A list of retryable operations. Retryable operations are run in order and
        // retried with backoff.
        this.Ya = [], 
        // Is this AsyncQueue being shut down? Once it is set to true, it will not
        // be changed again.
        this.Za = !1, 
        // Operations scheduled to be queued in the future. Operations are
        // automatically removed after they are run or canceled.
        this.Xa = [], 
        // visible for testing
        this.eu = null, 
        // Flag set while there's an outstanding AsyncQueue operation, used for
        // assertion sanity-checks.
        this.tu = !1, 
        // Enabled during shutdown on Safari to prevent future access to IndexedDB.
        this.nu = !1, 
        // List of TimerIds to fast-forward delays for.
        this.ru = [], 
        // Backoff timer used to schedule retries for retryable operations
        this.zo = new __PRIVATE_ExponentialBackoff(this, "async_queue_retry" /* TimerId.AsyncQueueRetry */), 
        // Visibility handler that triggers an immediate retry of all retryable
        // operations. Meant to speed up recovery when we regain file system access
        // after page comes into foreground.
        this.iu = () => {
            const e = getDocument();
            e && __PRIVATE_logDebug("AsyncQueue", "Visibility state changed to " + e.visibilityState), 
            this.zo.Qo();
        };
        const e = getDocument();
        e && "function" == typeof e.addEventListener && e.addEventListener("visibilitychange", this.iu);
    }
    get isShuttingDown() {
        return this.Za;
    }
    /**
     * Adds a new operation to the queue without waiting for it to complete (i.e.
     * we ignore the Promise result).
     */    enqueueAndForget(e) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.enqueue(e);
    }
    enqueueAndForgetEvenWhileRestricted(e) {
        this.su(), 
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.ou(e);
    }
    enterRestrictedMode(e) {
        if (!this.Za) {
            this.Za = !0, this.nu = e || !1;
            const t = getDocument();
            t && "function" == typeof t.removeEventListener && t.removeEventListener("visibilitychange", this.iu);
        }
    }
    enqueue(e) {
        if (this.su(), this.Za) 
        // Return a Promise which never resolves.
        return new Promise((() => {}));
        // Create a deferred Promise that we can return to the callee. This
        // allows us to return a "hanging Promise" only to the callee and still
        // advance the queue even when the operation is not run.
                const t = new __PRIVATE_Deferred;
        return this.ou((() => this.Za && this.nu ? Promise.resolve() : (e().then(t.resolve, t.reject), 
        t.promise))).then((() => t.promise));
    }
    enqueueRetryable(e) {
        this.enqueueAndForget((() => (this.Ya.push(e), this._u())));
    }
    /**
     * Runs the next operation from the retryable queue. If the operation fails,
     * reschedules with backoff.
     */    async _u() {
        if (0 !== this.Ya.length) {
            try {
                await this.Ya[0](), this.Ya.shift(), this.zo.reset();
            } catch (e) {
                if (!__PRIVATE_isIndexedDbTransactionError(e)) throw e;
 // Failure will be handled by AsyncQueue
                                __PRIVATE_logDebug("AsyncQueue", "Operation failed with retryable error: " + e);
            }
            this.Ya.length > 0 && 
            // If there are additional operations, we re-schedule `retryNextOp()`.
            // This is necessary to run retryable operations that failed during
            // their initial attempt since we don't know whether they are already
            // enqueued. If, for example, `op1`, `op2`, `op3` are enqueued and `op1`
            // needs to  be re-run, we will run `op1`, `op1`, `op2` using the
            // already enqueued calls to `retryNextOp()`. `op3()` will then run in the
            // call scheduled here.
            // Since `backoffAndRun()` cancels an existing backoff and schedules a
            // new backoff on every call, there is only ever a single additional
            // operation in the queue.
            this.zo.ko((() => this._u()));
        }
    }
    ou(e) {
        const t = this.Ja.then((() => (this.tu = !0, e().catch((e => {
            this.eu = e, this.tu = !1;
            const t = 
            /**
 * Chrome includes Error.message in Error.stack. Other browsers do not.
 * This returns expected output of message + stack when available.
 * @param error - Error or FirestoreError
 */
            function __PRIVATE_getMessageOrStack(e) {
                let t = e.message || "";
                e.stack && (t = e.stack.includes(e.message) ? e.stack : e.message + "\n" + e.stack);
                return t;
            }
            /**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ (e);
            // Re-throw the error so that this.tail becomes a rejected Promise and
            // all further attempts to chain (via .then) will just short-circuit
            // and return the rejected Promise.
            throw __PRIVATE_logError("INTERNAL UNHANDLED ERROR: ", t), e;
        })).then((e => (this.tu = !1, e))))));
        return this.Ja = t, t;
    }
    enqueueAfterDelay(e, t, n) {
        this.su(), 
        // Fast-forward delays for timerIds that have been overriden.
        this.ru.indexOf(e) > -1 && (t = 0);
        const r = DelayedOperation.createAndSchedule(this, e, t, n, (e => this.au(e)));
        return this.Xa.push(r), r;
    }
    su() {
        this.eu && fail();
    }
    verifyOperationInProgress() {}
    /**
     * Waits until all currently queued tasks are finished executing. Delayed
     * operations are not run.
     */    async uu() {
        // Operations in the queue prior to draining may have enqueued additional
        // operations. Keep draining the queue until the tail is no longer advanced,
        // which indicates that no more new operations were enqueued and that all
        // operations were executed.
        let e;
        do {
            e = this.Ja, await e;
        } while (e !== this.Ja);
    }
    /**
     * For Tests: Determine if a delayed operation with a particular TimerId
     * exists.
     */    cu(e) {
        for (const t of this.Xa) if (t.timerId === e) return !0;
        return !1;
    }
    /**
     * For Tests: Runs some or all delayed operations early.
     *
     * @param lastTimerId - Delayed operations up to and including this TimerId
     * will be drained. Pass TimerId.All to run all delayed operations.
     * @returns a Promise that resolves once all operations have been run.
     */    lu(e) {
        // Note that draining may generate more delayed ops, so we do that first.
        return this.uu().then((() => {
            // Run ops in the same order they'd run if they ran naturally.
            this.Xa.sort(((e, t) => e.targetTimeMs - t.targetTimeMs));
            for (const t of this.Xa) if (t.skipDelay(), "all" /* TimerId.All */ !== e && t.timerId === e) break;
            return this.uu();
        }));
    }
    /**
     * For Tests: Skip all subsequent delays for a timer id.
     */    hu(e) {
        this.ru.push(e);
    }
    /** Called once a DelayedOperation is run or canceled. */    au(e) {
        // NOTE: indexOf / slice are O(n), but delayedOperations is expected to be small.
        const t = this.Xa.indexOf(e);
        this.Xa.splice(t, 1);
    }
}

/**
 * The Cloud Firestore service interface.
 *
 * Do not call this constructor directly. Instead, use {@link (getFirestore:1)}.
 */ class Firestore extends Firestore$1 {
    /** @hideconstructor */
    constructor(e, t, n, r) {
        super(e, t, n, r), 
        /**
         * Whether it's a {@link Firestore} or Firestore Lite instance.
         */
        this.type = "firestore", this._queue = function __PRIVATE_newAsyncQueue() {
            return new __PRIVATE_AsyncQueueImpl;
        }(), this._persistenceKey = (null == r ? void 0 : r.name) || "[DEFAULT]";
    }
    _terminate() {
        return this._firestoreClient || 
        // The client must be initialized to ensure that all subsequent API
        // usage throws an exception.
        __PRIVATE_configureFirestore(this), this._firestoreClient.terminate();
    }
}

function getFirestore(t, n) {
    const r = "object" == typeof t ? t : getApp(), i = "string" == typeof t ? t : n || "(default)", s = _getProvider(r, "firestore").getImmediate({
        identifier: i
    });
    if (!s._initialized) {
        const e = getDefaultEmulatorHostnameAndPort("firestore");
        e && connectFirestoreEmulator(s, ...e);
    }
    return s;
}

/**
 * @internal
 */ function ensureFirestoreConfigured(e) {
    return e._firestoreClient || __PRIVATE_configureFirestore(e), e._firestoreClient.verifyNotTerminated(), 
    e._firestoreClient;
}

function __PRIVATE_configureFirestore(e) {
    var t, n, r;
    const i = e._freezeSettings(), s = function __PRIVATE_makeDatabaseInfo(e, t, n, r) {
        return new DatabaseInfo(e, t, n, r.host, r.ssl, r.experimentalForceLongPolling, r.experimentalAutoDetectLongPolling, __PRIVATE_cloneLongPollingOptions(r.experimentalLongPollingOptions), r.useFetchStreams);
    }(e._databaseId, (null === (t = e._app) || void 0 === t ? void 0 : t.options.appId) || "", e._persistenceKey, i);
    e._firestoreClient = new FirestoreClient(e._authCredentials, e._appCheckCredentials, e._queue, s), 
    (null === (n = i.localCache) || void 0 === n ? void 0 : n._offlineComponentProvider) && (null === (r = i.localCache) || void 0 === r ? void 0 : r._onlineComponentProvider) && (e._firestoreClient._uninitializedComponentsProvider = {
        _offlineKind: i.localCache.kind,
        _offline: i.localCache._offlineComponentProvider,
        _online: i.localCache._onlineComponentProvider
    });
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * An immutable object representing an array of bytes.
 */ class Bytes {
    /** @hideconstructor */
    constructor(e) {
        this._byteString = e;
    }
    /**
     * Creates a new `Bytes` object from the given Base64 string, converting it to
     * bytes.
     *
     * @param base64 - The Base64 string used to create the `Bytes` object.
     */    static fromBase64String(e) {
        try {
            return new Bytes(ByteString.fromBase64String(e));
        } catch (e) {
            throw new FirestoreError(D.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + e);
        }
    }
    /**
     * Creates a new `Bytes` object from the given Uint8Array.
     *
     * @param array - The Uint8Array used to create the `Bytes` object.
     */    static fromUint8Array(e) {
        return new Bytes(ByteString.fromUint8Array(e));
    }
    /**
     * Returns the underlying bytes as a Base64-encoded string.
     *
     * @returns The Base64-encoded string created from the `Bytes` object.
     */    toBase64() {
        return this._byteString.toBase64();
    }
    /**
     * Returns the underlying bytes in a new `Uint8Array`.
     *
     * @returns The Uint8Array created from the `Bytes` object.
     */    toUint8Array() {
        return this._byteString.toUint8Array();
    }
    /**
     * Returns a string representation of the `Bytes` object.
     *
     * @returns A string representation of the `Bytes` object.
     */    toString() {
        return "Bytes(base64: " + this.toBase64() + ")";
    }
    /**
     * Returns true if this `Bytes` object is equal to the provided one.
     *
     * @param other - The `Bytes` object to compare against.
     * @returns true if this `Bytes` object is equal to the provided one.
     */    isEqual(e) {
        return this._byteString.isEqual(e._byteString);
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A `FieldPath` refers to a field in a document. The path may consist of a
 * single field name (referring to a top-level field in the document), or a
 * list of field names (referring to a nested field in the document).
 *
 * Create a `FieldPath` by providing field names. If more than one field
 * name is provided, the path will point to a nested field in a document.
 */ class FieldPath {
    /**
     * Creates a `FieldPath` from the provided field names. If more than one field
     * name is provided, the path will point to a nested field in a document.
     *
     * @param fieldNames - A list of field names.
     */
    constructor(...e) {
        for (let t = 0; t < e.length; ++t) if (0 === e[t].length) throw new FirestoreError(D.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
        this._internalPath = new FieldPath$1(e);
    }
    /**
     * Returns true if this `FieldPath` is equal to the provided one.
     *
     * @param other - The `FieldPath` to compare against.
     * @returns true if this `FieldPath` is equal to the provided one.
     */    isEqual(e) {
        return this._internalPath.isEqual(e._internalPath);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * An immutable object representing a geographic location in Firestore. The
 * location is represented as latitude/longitude pair.
 *
 * Latitude values are in the range of [-90, 90].
 * Longitude values are in the range of [-180, 180].
 */ class GeoPoint {
    /**
     * Creates a new immutable `GeoPoint` object with the provided latitude and
     * longitude values.
     * @param latitude - The latitude as number between -90 and 90.
     * @param longitude - The longitude as number between -180 and 180.
     */
    constructor(e, t) {
        if (!isFinite(e) || e < -90 || e > 90) throw new FirestoreError(D.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + e);
        if (!isFinite(t) || t < -180 || t > 180) throw new FirestoreError(D.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + t);
        this._lat = e, this._long = t;
    }
    /**
     * The latitude of this `GeoPoint` instance.
     */    get latitude() {
        return this._lat;
    }
    /**
     * The longitude of this `GeoPoint` instance.
     */    get longitude() {
        return this._long;
    }
    /**
     * Returns true if this `GeoPoint` is equal to the provided one.
     *
     * @param other - The `GeoPoint` to compare against.
     * @returns true if this `GeoPoint` is equal to the provided one.
     */    isEqual(e) {
        return this._lat === e._lat && this._long === e._long;
    }
    /** Returns a JSON-serializable representation of this GeoPoint. */    toJSON() {
        return {
            latitude: this._lat,
            longitude: this._long
        };
    }
    /**
     * Actually private to JS consumers of our API, so this function is prefixed
     * with an underscore.
     */    _compareTo(e) {
        return __PRIVATE_primitiveComparator(this._lat, e._lat) || __PRIVATE_primitiveComparator(this._long, e._long);
    }
}

/**
 * Matches any characters in a field path string that are reserved.
 */ const pe = new RegExp("[~\\*/\\[\\]]");

/**
 * Wraps fromDotSeparatedString with an error message about the method that
 * was thrown.
 * @param methodName - The publicly visible method name
 * @param path - The dot-separated string form of a field path which will be
 * split on dots.
 * @param targetDoc - The document against which the field path will be
 * evaluated.
 */ function __PRIVATE_fieldPathFromDotSeparatedString(e, t, n) {
    if (t.search(pe) >= 0) throw __PRIVATE_createError(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`, e, 
    /* hasConverter= */ !1, 
    /* path= */ void 0, n);
    try {
        return new FieldPath(...t.split("."))._internalPath;
    } catch (r) {
        throw __PRIVATE_createError(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`, e, 
        /* hasConverter= */ !1, 
        /* path= */ void 0, n);
    }
}

function __PRIVATE_createError(e, t, n, r, i) {
    const s = r && !r.isEmpty(), o = void 0 !== i;
    let _ = `Function ${t}() called with invalid data`;
    n && (_ += " (via `toFirestore()`)"), _ += ". ";
    let a = "";
    return (s || o) && (a += " (found", s && (a += ` in field ${r}`), o && (a += ` in document ${i}`), 
    a += ")"), new FirestoreError(D.INVALID_ARGUMENT, _ + e + a);
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A `DocumentSnapshot` contains data read from a document in your Firestore
 * database. The data can be extracted with `.data()` or `.get(<field>)` to
 * get a specific field.
 *
 * For a `DocumentSnapshot` that points to a non-existing document, any data
 * access will return 'undefined'. You can use the `exists()` method to
 * explicitly verify a document's existence.
 */ class DocumentSnapshot$1 {
    // Note: This class is stripped down version of the DocumentSnapshot in
    // the legacy SDK. The changes are:
    // - No support for SnapshotMetadata.
    // - No support for SnapshotOptions.
    /** @hideconstructor protected */
    constructor(e, t, n, r, i) {
        this._firestore = e, this._userDataWriter = t, this._key = n, this._document = r, 
        this._converter = i;
    }
    /** Property of the `DocumentSnapshot` that provides the document's ID. */    get id() {
        return this._key.path.lastSegment();
    }
    /**
     * The `DocumentReference` for the document included in the `DocumentSnapshot`.
     */    get ref() {
        return new DocumentReference(this._firestore, this._converter, this._key);
    }
    /**
     * Signals whether or not the document at the snapshot's location exists.
     *
     * @returns true if the document exists.
     */    exists() {
        return null !== this._document;
    }
    /**
     * Retrieves all fields in the document as an `Object`. Returns `undefined` if
     * the document doesn't exist.
     *
     * @returns An `Object` containing all fields in the document or `undefined`
     * if the document doesn't exist.
     */    data() {
        if (this._document) {
            if (this._converter) {
                // We only want to use the converter and create a new DocumentSnapshot
                // if a converter has been provided.
                const e = new QueryDocumentSnapshot$1(this._firestore, this._userDataWriter, this._key, this._document, 
                /* converter= */ null);
                return this._converter.fromFirestore(e);
            }
            return this._userDataWriter.convertValue(this._document.data.value);
        }
    }
    /**
     * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
     * document or field doesn't exist.
     *
     * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
     * field.
     * @returns The data at the specified field location or undefined if no such
     * field exists in the document.
     */
    // We are using `any` here to avoid an explicit cast by our users.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(e) {
        if (this._document) {
            const t = this._document.data.field(__PRIVATE_fieldPathFromArgument("DocumentSnapshot.get", e));
            if (null !== t) return this._userDataWriter.convertValue(t);
        }
    }
}

/**
 * A `QueryDocumentSnapshot` contains data read from a document in your
 * Firestore database as part of a query. The document is guaranteed to exist
 * and its data can be extracted with `.data()` or `.get(<field>)` to get a
 * specific field.
 *
 * A `QueryDocumentSnapshot` offers the same API surface as a
 * `DocumentSnapshot`. Since query results contain only existing documents, the
 * `exists` property will always be true and `data()` will never return
 * 'undefined'.
 */ class QueryDocumentSnapshot$1 extends DocumentSnapshot$1 {
    /**
     * Retrieves all fields in the document as an `Object`.
     *
     * @override
     * @returns An `Object` containing all fields in the document.
     */
    data() {
        return super.data();
    }
}

/**
 * Helper that calls `fromDotSeparatedString()` but wraps any error thrown.
 */ function __PRIVATE_fieldPathFromArgument(e, t) {
    return "string" == typeof t ? __PRIVATE_fieldPathFromDotSeparatedString(e, t) : t instanceof FieldPath ? t._internalPath : t._delegate._internalPath;
}

class AbstractUserDataWriter {
    convertValue(e, t = "none") {
        switch (__PRIVATE_typeOrder(e)) {
          case 0 /* TypeOrder.NullValue */ :
            return null;

          case 1 /* TypeOrder.BooleanValue */ :
            return e.booleanValue;

          case 2 /* TypeOrder.NumberValue */ :
            return __PRIVATE_normalizeNumber(e.integerValue || e.doubleValue);

          case 3 /* TypeOrder.TimestampValue */ :
            return this.convertTimestamp(e.timestampValue);

          case 4 /* TypeOrder.ServerTimestampValue */ :
            return this.convertServerTimestamp(e, t);

          case 5 /* TypeOrder.StringValue */ :
            return e.stringValue;

          case 6 /* TypeOrder.BlobValue */ :
            return this.convertBytes(__PRIVATE_normalizeByteString(e.bytesValue));

          case 7 /* TypeOrder.RefValue */ :
            return this.convertReference(e.referenceValue);

          case 8 /* TypeOrder.GeoPointValue */ :
            return this.convertGeoPoint(e.geoPointValue);

          case 9 /* TypeOrder.ArrayValue */ :
            return this.convertArray(e.arrayValue, t);

          case 10 /* TypeOrder.ObjectValue */ :
            return this.convertObject(e.mapValue, t);

          default:
            throw fail();
        }
    }
    convertObject(e, t) {
        return this.convertObjectMap(e.fields, t);
    }
    /**
     * @internal
     */    convertObjectMap(e, t = "none") {
        const n = {};
        return forEach(e, ((e, r) => {
            n[e] = this.convertValue(r, t);
        })), n;
    }
    convertGeoPoint(e) {
        return new GeoPoint(__PRIVATE_normalizeNumber(e.latitude), __PRIVATE_normalizeNumber(e.longitude));
    }
    convertArray(e, t) {
        return (e.values || []).map((e => this.convertValue(e, t)));
    }
    convertServerTimestamp(e, t) {
        switch (t) {
          case "previous":
            const n = __PRIVATE_getPreviousValue(e);
            return null == n ? null : this.convertValue(n, t);

          case "estimate":
            return this.convertTimestamp(__PRIVATE_getLocalWriteTime(e));

          default:
            return null;
        }
    }
    convertTimestamp(e) {
        const t = __PRIVATE_normalizeTimestamp(e);
        return new Timestamp(t.seconds, t.nanos);
    }
    convertDocumentKey(e, t) {
        const n = ResourcePath.fromString(e);
        __PRIVATE_hardAssert(__PRIVATE_isValidResourceName(n));
        const r = new DatabaseId(n.get(1), n.get(3)), i = new DocumentKey(n.popFirst(5));
        return r.isEqual(t) || 
        // TODO(b/64130202): Somehow support foreign references.
        __PRIVATE_logError(`Document ${i} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`), 
        i;
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Metadata about a snapshot, describing the state of the snapshot.
 */ class SnapshotMetadata {
    /** @hideconstructor */
    constructor(e, t) {
        this.hasPendingWrites = e, this.fromCache = t;
    }
    /**
     * Returns true if this `SnapshotMetadata` is equal to the provided one.
     *
     * @param other - The `SnapshotMetadata` to compare against.
     * @returns true if this `SnapshotMetadata` is equal to the provided one.
     */    isEqual(e) {
        return this.hasPendingWrites === e.hasPendingWrites && this.fromCache === e.fromCache;
    }
}

/**
 * A `DocumentSnapshot` contains data read from a document in your Firestore
 * database. The data can be extracted with `.data()` or `.get(<field>)` to
 * get a specific field.
 *
 * For a `DocumentSnapshot` that points to a non-existing document, any data
 * access will return 'undefined'. You can use the `exists()` method to
 * explicitly verify a document's existence.
 */ class DocumentSnapshot extends DocumentSnapshot$1 {
    /** @hideconstructor protected */
    constructor(e, t, n, r, i, s) {
        super(e, t, n, r, s), this._firestore = e, this._firestoreImpl = e, this.metadata = i;
    }
    /**
     * Returns whether or not the data exists. True if the document exists.
     */    exists() {
        return super.exists();
    }
    /**
     * Retrieves all fields in the document as an `Object`. Returns `undefined` if
     * the document doesn't exist.
     *
     * By default, `serverTimestamp()` values that have not yet been
     * set to their final value will be returned as `null`. You can override
     * this by passing an options object.
     *
     * @param options - An options object to configure how data is retrieved from
     * the snapshot (for example the desired behavior for server timestamps that
     * have not yet been set to their final value).
     * @returns An `Object` containing all fields in the document or `undefined` if
     * the document doesn't exist.
     */    data(e = {}) {
        if (this._document) {
            if (this._converter) {
                // We only want to use the converter and create a new DocumentSnapshot
                // if a converter has been provided.
                const t = new QueryDocumentSnapshot(this._firestore, this._userDataWriter, this._key, this._document, this.metadata, 
                /* converter= */ null);
                return this._converter.fromFirestore(t, e);
            }
            return this._userDataWriter.convertValue(this._document.data.value, e.serverTimestamps);
        }
    }
    /**
     * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
     * document or field doesn't exist.
     *
     * By default, a `serverTimestamp()` that has not yet been set to
     * its final value will be returned as `null`. You can override this by
     * passing an options object.
     *
     * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
     * field.
     * @param options - An options object to configure how the field is retrieved
     * from the snapshot (for example the desired behavior for server timestamps
     * that have not yet been set to their final value).
     * @returns The data at the specified field location or undefined if no such
     * field exists in the document.
     */
    // We are using `any` here to avoid an explicit cast by our users.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(e, t = {}) {
        if (this._document) {
            const n = this._document.data.field(__PRIVATE_fieldPathFromArgument("DocumentSnapshot.get", e));
            if (null !== n) return this._userDataWriter.convertValue(n, t.serverTimestamps);
        }
    }
}

/**
 * A `QueryDocumentSnapshot` contains data read from a document in your
 * Firestore database as part of a query. The document is guaranteed to exist
 * and its data can be extracted with `.data()` or `.get(<field>)` to get a
 * specific field.
 *
 * A `QueryDocumentSnapshot` offers the same API surface as a
 * `DocumentSnapshot`. Since query results contain only existing documents, the
 * `exists` property will always be true and `data()` will never return
 * 'undefined'.
 */ class QueryDocumentSnapshot extends DocumentSnapshot {
    /**
     * Retrieves all fields in the document as an `Object`.
     *
     * By default, `serverTimestamp()` values that have not yet been
     * set to their final value will be returned as `null`. You can override
     * this by passing an options object.
     *
     * @override
     * @param options - An options object to configure how data is retrieved from
     * the snapshot (for example the desired behavior for server timestamps that
     * have not yet been set to their final value).
     * @returns An `Object` containing all fields in the document.
     */
    data(e = {}) {
        return super.data(e);
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Reads the document referred to by this `DocumentReference`.
 *
 * Note: `getDoc()` attempts to provide up-to-date data when possible by waiting
 * for data from the server, but it may return cached data or fail if you are
 * offline and the server cannot be reached. To specify this behavior, invoke
 * {@link getDocFromCache} or {@link getDocFromServer}.
 *
 * @param reference - The reference of the document to fetch.
 * @returns A Promise resolved with a `DocumentSnapshot` containing the
 * current document contents.
 */ function getDoc(e) {
    e = __PRIVATE_cast(e, DocumentReference);
    const t = __PRIVATE_cast(e.firestore, Firestore);
    return __PRIVATE_firestoreClientGetDocumentViaSnapshotListener(ensureFirestoreConfigured(t), e._key).then((n => __PRIVATE_convertToDocSnapshot(t, e, n)));
}

class __PRIVATE_ExpUserDataWriter extends AbstractUserDataWriter {
    constructor(e) {
        super(), this.firestore = e;
    }
    convertBytes(e) {
        return new Bytes(e);
    }
    convertReference(e) {
        const t = this.convertDocumentKey(e, this.firestore._databaseId);
        return new DocumentReference(this.firestore, /* converter= */ null, t);
    }
}

/**
 * Converts a {@link ViewSnapshot} that contains the single document specified by `ref`
 * to a {@link DocumentSnapshot}.
 */ function __PRIVATE_convertToDocSnapshot(e, t, n) {
    const r = n.docs.get(t._key), i = new __PRIVATE_ExpUserDataWriter(e);
    return new DocumentSnapshot(e, i, t._key, r, new SnapshotMetadata(n.hasPendingWrites, n.fromCache), t.converter);
}

/**
 * Cloud Firestore
 *
 * @packageDocumentation
 */ !function __PRIVATE_registerFirestore(e, t = !0) {
    !function __PRIVATE_setSDKVersion(e) {
        S$1 = e;
    }(SDK_VERSION), _registerComponent(new Component("firestore", ((e, {instanceIdentifier: n, options: r}) => {
        const i = e.getProvider("app").getImmediate(), s = new Firestore(new __PRIVATE_FirebaseAuthCredentialsProvider(e.getProvider("auth-internal")), new __PRIVATE_FirebaseAppCheckTokenProvider(e.getProvider("app-check-internal")), function __PRIVATE_databaseIdFromApp(e, t) {
            if (!Object.prototype.hasOwnProperty.apply(e.options, [ "projectId" ])) throw new FirestoreError(D.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
            return new DatabaseId(e.options.projectId, t);
        }(i, n), i);
        return r = Object.assign({
            useFetchStreams: t
        }, r), s._setSettings(r), s;
    }), "PUBLIC").setMultipleInstances(!0)), registerVersion(w$1, "4.4.0", e), 
    // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
    registerVersion(w$1, "4.4.0", "esm2017");
}();

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i=t.trustedTypes,s=i?i.createPolicy("lit-html",{createHTML:t=>t}):void 0,e="$lit$",h=`lit$${(Math.random()+"").slice(9)}$`,o="?"+h,n=`<${o}>`,r=document,l=()=>r.createComment(""),c=t=>null===t||"object"!=typeof t&&"function"!=typeof t,a=Array.isArray,u=t=>a(t)||"function"==typeof t?.[Symbol.iterator],d="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,v=/-->/g,_=/>/g,m=RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),p=/'/g,g=/"/g,$=/^(?:script|style|textarea|title)$/i,y=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=y(1),w=Symbol.for("lit-noChange"),T=Symbol.for("lit-nothing"),A=new WeakMap,E=r.createTreeWalker(r,129);function C(t,i){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==s?s.createHTML(i):i}const P=(t,i)=>{const s=t.length-1,o=[];let r,l=2===i?"<svg>":"",c=f;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,y=0;for(;y<s.length&&(c.lastIndex=y,u=c.exec(s),null!==u);)y=c.lastIndex,c===f?"!--"===u[1]?c=v:void 0!==u[1]?c=_:void 0!==u[2]?($.test(u[2])&&(r=RegExp("</"+u[2],"g")),c=m):void 0!==u[3]&&(c=m):c===m?">"===u[0]?(c=r??f,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?m:'"'===u[3]?g:p):c===g||c===p?c=m:c===v||c===_?c=f:(c=m,r=void 0);const x=c===m&&t[i+1].startsWith("/>")?" ":"";l+=c===f?s+n:d>=0?(o.push(a),s.slice(0,d)+e+s.slice(d)+h+x):s+h+(-2===d?i:x);}return [C(t,l+(t[s]||"<?>")+(2===i?"</svg>":"")),o]};class V{constructor({strings:t,_$litType$:s},n){let r;this.parts=[];let c=0,a=0;const u=t.length-1,d=this.parts,[f,v]=P(t,s);if(this.el=V.createElement(f,n),E.currentNode=this.el.content,2===s){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=E.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(e)){const i=v[a++],s=r.getAttribute(t).split(h),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:c,name:e[2],strings:s,ctor:"."===e[1]?k:"?"===e[1]?H:"@"===e[1]?I:R}),r.removeAttribute(t);}else t.startsWith(h)&&(d.push({type:6,index:c}),r.removeAttribute(t));if($.test(r.tagName)){const t=r.textContent.split(h),s=t.length-1;if(s>0){r.textContent=i?i.emptyScript:"";for(let i=0;i<s;i++)r.append(t[i],l()),E.nextNode(),d.push({type:2,index:++c});r.append(t[s],l());}}}else if(8===r.nodeType)if(r.data===o)d.push({type:2,index:c});else {let t=-1;for(;-1!==(t=r.data.indexOf(h,t+1));)d.push({type:7,index:c}),t+=h.length-1;}c++;}}static createElement(t,i){const s=r.createElement("template");return s.innerHTML=t,s}}function N(t,i,s=t,e){if(i===w)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=c(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(!1),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=N(t,h._$AS(t,i.values),h,e)),i}class S{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??r).importNode(i,!0);E.currentNode=e;let h=E.nextNode(),o=0,n=0,l=s[0];for(;void 0!==l;){if(o===l.index){let i;2===l.type?i=new M(h,h.nextSibling,this,t):1===l.type?i=new l.ctor(h,l.name,l.strings,this,t):6===l.type&&(i=new L(h,this,t)),this._$AV.push(i),l=s[++n];}o!==l?.index&&(h=E.nextNode(),o++);}return E.currentNode=r,e}p(t){let i=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class M{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=T,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??!0;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=N(this,t,i),c(t)?t===T||null==t||""===t?(this._$AH!==T&&this._$AR(),this._$AH=T):t!==this._$AH&&t!==w&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):u(t)?this.T(t):this._(t);}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t));}_(t){this._$AH!==T&&c(this._$AH)?this._$AA.nextSibling.data=t:this.$(r.createTextNode(t)),this._$AH=t;}g(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=V.createElement(C(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new S(e,this),s=t.u(this.options);t.p(i),this.$(s),this._$AH=t;}}_$AC(t){let i=A.get(t.strings);return void 0===i&&A.set(t.strings,i=new V(t)),i}T(t){a(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new M(this.k(l()),this.k(l()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){for(this._$AP?.(!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class R{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=T,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=T;}_$AI(t,i=this,s,e){const h=this.strings;let o=!1;if(void 0===h)t=N(this,t,i,0),o=!c(t)||t!==this._$AH&&t!==w,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=N(this,e[s+n],i,n),r===w&&(r=this._$AH[n]),o||=!c(r)||r!==this._$AH[n],r===T?t=T:t!==T&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.O(t);}O(t){t===T?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class k extends R{constructor(){super(...arguments),this.type=3;}O(t){this.element[this.name]=t===T?void 0:t;}}class H extends R{constructor(){super(...arguments),this.type=4;}O(t){this.element.toggleAttribute(this.name,!!t&&t!==T);}}class I extends R{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=N(this,t,i,0)??T)===w)return;const s=this._$AH,e=t===T&&s!==T||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==T&&(s===T||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class L{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){N(this,t);}}const Z=t.litHtmlPolyfillSupport;Z?.(V,M),(t.litHtmlVersions??=[]).push("3.1.1");const j=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new M(i.insertBefore(l(),t),t,void 0,s??{});}return h._$AI(t),h};

const toolbar = (props) => {
    document.getElementById('toolbar').textContent = '';
    j(x`
        <div class="min-w-[20%]">
            ${props.left}
        </div>
        <div class="flex-1"><h1 class="font-bold text-center">${
            props.title
        }</h1></div>
        <div class="min-w-[20%] flex justify-end">
            ${props.right}
        </div>
    `, document.getElementById('toolbar'));
};

const arrowLeft = (opt = {size: "w-6 h-6"}) => x`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="${opt.size}"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>`;

const ENV = 'dev';

const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, user => {
    if (!user) {
        location.href = '/';
    }
});

toolbar({
    left: x`<a href="#" @click="${(e) => {
            e.preventDefault();
            history.back();
        }}">${arrowLeft({size: "size-6"})}</a>`,
    title: '밀롱가 만들기'
});

document.getElementById('new-milonga-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!auth.currentUser) {
        alert('로그인이 필요합니다.');
        return
    }
    
    const docRef = doc(db, `${ENV}.milongas`, document.getElementById('milonga-id').value);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
    } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
    }
});
