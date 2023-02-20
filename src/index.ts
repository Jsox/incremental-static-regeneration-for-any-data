const cache = require('memory-cache');
const md5 = require('md5');

interface IOptions {
    cacheTime?: number;
    noCache?: boolean;
    criticalCacheTime?: number;
    onComplete?: (v: unknown) => any | undefined;
    key: string | Buffer | [] | Uint8Array;
    isLogging?: boolean;
    clearCache?: boolean;
}
export default class ISR {
    cacheTime: number;
    noCache: boolean;
    criticalCacheTime: number;
    now: number;
    cache: typeof cache;
    md5: typeof md5;
    func: () => Promise<any>;
    onComplete?: (v: unknown) => any | undefined;
    key: string | Buffer | [] | Uint8Array;
    data: any;
    exists: any;
    isLogging: boolean;
    clearCache: boolean;

    constructor(func: () => Promise<any>, options: IOptions) {
        const {
            noCache = false,
            cacheTime = 5 * 1000,
            criticalCacheTime = 60 * 60 * 1000,
            key,
            onComplete = undefined,
            isLogging = false,
            clearCache = false,
        } = options;

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

        if (clearCache) this.cache.clear();

        if (!key) {
            throw new Error('ISR Error: need {options.key = uniqueKey}');
        }
        this.key = this.md5(key);
        this.data = null;
    }

    async getData(): Promise<any> {
        this.now = Date.now();

        return new Promise(async (resolve) => {
            this.log('starting ISR');
            if (!this.noCache) {
                this.exists = await this.cache.get(this.key);
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
                    this.data = await this.getDataAndPutToCache();
                    resolve(this.data);
                }
                if (diff > this.cacheTime) {
                    this.log('Cache revalidation');
                    this.getDataAndPutToCache();
                }
                this.log('Data returned from cache for ', Date.now() - this.now, 'ms');
                resolve(this.exists.data);
            } else {
                this.log('getDataAndPutToCache');
                this.data = await this.getDataAndPutToCache();
                resolve(this.data);
            }
        });
    }

    async getDataAndPutToCache() {
        this.log('---', 'start getDataAndPutToCache', '---');
        return new Promise(async (resolve) => {
            let result;
            try {
                result = await this.func();
                this.log('Result of execution:', {
                    result,
                });
                if (this.onComplete) {
                    try {
                        result = await this.onComplete(result);
                        this.log('Result of execution onComplete:', {
                            onComplete: typeof this.onComplete,
                        });
                    } catch (error: any) {
                        this.log('Error onComplete: ', error?.message);
                    }
                }
            } catch (error: any) {
                this.log({
                    errorMessage: error?.message,
                    errorFull: error,
                });
                this.cache.del(this.key);
                this.log('---', 'end getDataAndPutToCache', '---');
                resolve(this.exists?.data || null);
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
        });
    }

    log(f: any | unknown, s: any | unknown = '', t: any | unknown = '') {
        if (this.isLogging) console.log(f, s, t);
    }
}
