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
Object.defineProperty(exports, "__esModule", { value: true });
const cache = require('memory-cache');
const md5 = require('md5');
class ISR {
    constructor(func, options) {
        const { noCache = false, cacheTime = 5 * 1000, criticalCacheTime = 60 * 60 * 1000, key, onComplete = undefined, isLogging = false, clearCache = false, } = options;
        this.clearCache = false;
        this.exists = false;
        this.cacheTime = cacheTime;
        this.noCache = noCache;
        this.criticalCacheTime = criticalCacheTime;
        this.cache = cache;
        this.md5 = md5;
        this.func = func;
        this.onComplete = onComplete;
        this.isLogging = isLogging;
        this.now = Date.now();
        if (clearCache)
            this.cache.clear();
        if (!key) {
            throw new Error('ISR Error: need {options.key = uniqueKey}');
        }
        this.key = this.md5(key);
        this.data = null;
    }
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            this.now = Date.now();
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.log('starting ISR');
                if (!this.noCache) {
                    this.exists = yield this.cache.get(this.key);
                    this.log({
                        'Cache exists': this.exists,
                    });
                }
                if (this.exists) {
                    let parsed = this.exists.parsed;
                    this.log({
                        'Time difference': this.now - parsed,
                    });
                    let diff = this.now - parsed;
                    if (diff > this.criticalCacheTime) {
                        this.log('Cache time critical');
                        this.data = yield this.getDataAndPutToCache();
                        resolve(this.data);
                    }
                    if (diff > this.cacheTime) {
                        this.log('Cache revalidation');
                        this.getDataAndPutToCache();
                    }
                    this.log('Data returned from cache for ', Date.now() - this.now, 'ms');
                    resolve(this.exists.data);
                }
                else {
                    this.log('getDataAndPutToCache');
                    this.data = yield this.getDataAndPutToCache();
                    resolve(this.data);
                }
            }));
        });
    }
    getDataAndPutToCache() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log('---', 'start getDataAndPutToCache', '---');
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                let result;
                try {
                    result = yield this.func();
                    this.log('Result of execution:', {
                        result,
                    });
                    if (this.onComplete) {
                        try {
                            result = yield this.onComplete(result);
                            this.log('Result of execution onComplete:', {
                                onComplete: typeof this.onComplete,
                            });
                        }
                        catch (error) {
                            this.log('Error onComplete: ', error === null || error === void 0 ? void 0 : error.message);
                        }
                    }
                }
                catch (error) {
                    this.log({
                        errorMessage: error === null || error === void 0 ? void 0 : error.message,
                        errorFull: error,
                    });
                    this.cache.del(this.key);
                    this.log('---', 'end getDataAndPutToCache', '---');
                    resolve(((_a = this.exists) === null || _a === void 0 ? void 0 : _a.data) || null);
                }
                if (!result) {
                    this.cache.del(this.key);
                    this.log('---', 'end getDataAndPutToCache', '---');
                    resolve(null);
                    return;
                }
                let toCache = {
                    parsed: this.now,
                    data: result,
                };
                this.log('Executed for', Date.now() - this.now, 'ms');
                this.cache.put(this.key, toCache, this.criticalCacheTime);
                this.log('---', 'end getDataAndPutToCache', '---');
                resolve(toCache.data);
            }));
        });
    }
    log(f, s = '', t = '') {
        if (this.isLogging)
            console.log(f, s, t);
    }
}
exports.default = ISR;
