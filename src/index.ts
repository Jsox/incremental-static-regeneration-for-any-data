import * as fs from 'fs';
import * as crypto from 'crypto';
import util from 'util';

const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);

type AsyncFunction<T> = (...args: any[]) => Promise<T>;

type CacheOptions = {
    ttl: number;
} & (
    | { returnCachedIfExpiredAndUpdate: boolean }
    | { autoUpdateDataByInterval: boolean }
    | { deleteAfterExpiration: boolean }
    );

/**
 * A class for caching results of asynchronous functions.
 */
class FasterQuery {
    private cachePath: string;
    private timersToUpdate = new Map<string, number>();
    private timersToDelete = new Map<string, NodeJS.Timeout>();
    static isLogging = false;

    /**
     * Constructs a FasterQuery instance.
     * @param {string} cachePath - The path where cached data will be stored.
     */
    constructor(cachePath: string) {
        this.cachePath = cachePath;
        this.initializeCacheDirectory();
    }

    /**
     * Initializes the cache directory.
     */
    private async initializeCacheDirectory() {
        try {
            await mkdir(this.cachePath, { recursive: true });
        } catch (error) {
            console.error('Error creating cache directory:', error);
        }
    }

    /**
     * Generates a hash based on the function and its arguments.
     * @param {AsyncFunction<any>} fn - The asynchronous function.
     * @param {any[]} args - The arguments passed to the function.
     * @returns {Promise<string>} - The generated hash.
     */
    private async hashFunction(
        fn: AsyncFunction<any>,
        args: any[],
    ): Promise<string> {
        const hash = crypto.createHash('md5');
        hash.update(fn.toString());
        hash.update(JSON.stringify(args));
        return hash.digest('hex');
    }

    /**
     * Reads cached data from the file system.
     * @param {string} key - The cache key.
     * @returns {Promise<any | null>} - The cached data or null if not found.
     */
    private async readCache(key: string): Promise<any | null> {
        try {
            const data = await readFile(
                `${this.cachePath}/${key}.json`,
                'utf8',
            );
            return JSON.parse(data);
        } catch (error) {
            return null;
        }
    }

    /**
     * Writes data to the cache in the file system.
     * @param {string} key - The cache key.
     * @param {any} data - The data to be cached.
     */
    private async writeCache(key: string, data: any): Promise<void> {
        try {
        await writeFile(
            `${this.cachePath}/${key}.json`,
            JSON.stringify(data),
            'utf8',
        );
    } catch (error) {
        console.error('Error deleting cache:', error);
    }
    }

    /**
     * Deletes cached data from the file system.
     * @param {string} key - The cache key.
     */
    private async deleteCache(key: string): Promise<void> {
        try {
            await unlink(`${this.cachePath}/${key}.json`);
        } catch (error) {
            console.error('Error deleting cache:', error);
        }
    }

    /**
     * Executes the function, writes the result to the cache, and returns the result.
     * @param {AsyncFunction<T>} fn - The asynchronous function.
     * @param {any[]} args - The arguments passed to the function.
     * @returns {Promise<any>} - The result of the function.
     */
    private async executeFunctionAndWriteCache<T>(
        fn: AsyncFunction<T>,
        args: any[],
    ): Promise<any> {
        try {
            const result = await fn(...args);
            const key = await this.hashFunction(fn, args);
            await this.writeCache(key, { result, timestamp: Date.now() });
            return result;
        } catch (error) {
            console.error('Error executing function and writing cache:', error);
            throw error; // Propagate the error
        }
    }

    /**
     * Updates the cache if needed and returns the cached or computed result.
     * @param {string} key - The cache key.
     * @param {AsyncFunction<T>} fn - The asynchronous function.
     * @param {any[]} args - The arguments passed to the function.
     * @param {CacheOptions} options - The caching options.
     * @returns {Promise<any>} - The cached or computed result.
     */
    private async updateCacheIfNeeded<T>(
        key: string,
        fn: AsyncFunction<T>,
        args: any[],
        options: CacheOptions,
    ): Promise<any> {
        try {
            const ttl = 'ttl' in options ? options.ttl : 60 * 60;
            const autoUpdateDataByInterval =
                'autoUpdateDataByInterval' in options
                    ? options.autoUpdateDataByInterval
                    : false;
            const returnCachedIfExpiredAndUpdate =
                'returnCachedIfExpiredAndUpdate' in options
                    ? options.returnCachedIfExpiredAndUpdate
                    : false;
            const deleteAfterExpiration =
                'deleteAfterExpiration' in options
                    ? options.deleteAfterExpiration
                    : false;

            if (autoUpdateDataByInterval) {
                if (!this.timersToUpdate.has(key)) {
                    this.timersToUpdate.set(key, ttl);
                    log(
                        `SCHEDULED UPDATE: ${fn.name}(${args})`,
                        ttl,
                        this.timersToUpdate.keys(),
                    );
                    setInterval(
                        async () => {
                            log(
                                `UPDATED DATA IN SCHEDULE: ${fn.name}(${args})`,
                                `every (${ttl}-2) sec`,
                            );
                            await this.executeFunctionAndWriteCache(fn, args);
                        },
                        (ttl - 2) * 1000,
                    );
                }
            }

            if (deleteAfterExpiration) {
                if (this.timersToDelete.has(key)) {
                    clearTimeout(this.timersToDelete.get(key)!);
                }

                this.timersToDelete.set(
                    key,
                    setTimeout(async () => {
                        await this.deleteCache(key);
                        log(`DELETED DATA: ${fn.name}(${args})`, ttl);
                    }, ttl * 1000),
                );
            }

            const cachedData = await this.readCache(key);

            if (cachedData !== null) {
                const currentTime = Date.now();
                const cacheTime = cachedData.timestamp;
                if (currentTime - cacheTime <= ttl * 1000) {
                    log(
                        `CACHE HIT: ${fn.name}(${args})`,
                        ttl * 1000,
                        currentTime - cacheTime,
                        '<=',
                        ttl * 1000,
                    );
                    return cachedData.result;
                } else if (returnCachedIfExpiredAndUpdate) {
                    log(
                        `CACHE EXPIRED - return Cached and update: ${fn.name}(${args})`,
                        ttl * 1000,
                        currentTime - cacheTime,
                        '>',
                        ttl * 1000,
                    );
                    await this.executeFunctionAndWriteCache(fn, args);
                    return cachedData.result;
                }
            }
            log(`CACHE MISS for ${key}`, ttl);
            return await this.executeFunctionAndWriteCache(fn, args);
        } catch (error) {
            console.error('Error updating cache if needed:', error);
            throw error; // Propagate the error
        }
    }

    /**
     * Returns a memoized version of an asynchronous function.
     * @param {AsyncFunction<T>} fn - The asynchronous function to be memoized.
     * @param {CacheOptions} options - The options for caching.
     * @return {AsyncFunction<T>} - A memoized version of the input asynchronous function.
     */
    get<T>(fn: AsyncFunction<T>, options: CacheOptions): AsyncFunction<T> {
        return async (...args: any[]): Promise<any> => {
            try {
                const key = await this.hashFunction(fn, args);
                return await this.updateCacheIfNeeded(key, fn, args, options);
            } catch (error) {
                console.error('Error getting memoized function:', error);
                throw error; // Propagate the error
            }
        };
    }
}

function isDebugging(): boolean {
    return process.env.NODE_ENV === 'development' || FasterQuery.isLogging;
}

function log(...args: any) {
    if (isDebugging())
        console.log(new Date().toLocaleString(), 'CACHED:V2 DEBUG: ', ...args);
}

export default FasterQuery;
