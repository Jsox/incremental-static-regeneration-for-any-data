type AsyncFunction<T> = (...args: any[]) => Promise<T>;
type CacheOptions = {
    ttl: number;
} & ({
    returnCachedIfExpiredAndUpdate: boolean;
} | {
    autoUpdateDataByInterval: boolean;
} | {
    deleteAfterExpiration: boolean;
});
/**
 * A class for caching results of asynchronous functions.
 */
declare class FasterQuery {
    private cachePath;
    private timersToUpdate;
    private timersToDelete;
    static isLogging: boolean;
    /**
     * Constructs a FasterQuery instance.
     * @param {string} cachePath - The path where cached data will be stored.
     */
    constructor(cachePath: string);
    /**
     * Initializes the cache directory.
     */
    private initializeCacheDirectory;
    /**
     * Generates a hash based on the function and its arguments.
     * @param {AsyncFunction<any>} fn - The asynchronous function.
     * @param {any[]} args - The arguments passed to the function.
     * @returns {Promise<string>} - The generated hash.
     */
    private hashFunction;
    /**
     * Reads cached data from the file system.
     * @param {string} key - The cache key.
     * @returns {Promise<any | null>} - The cached data or null if not found.
     */
    private readCache;
    /**
     * Writes data to the cache in the file system.
     * @param {string} key - The cache key.
     * @param {any} data - The data to be cached.
     */
    private writeCache;
    /**
     * Deletes cached data from the file system.
     * @param {string} key - The cache key.
     */
    private deleteCache;
    /**
     * Executes the function, writes the result to the cache, and returns the result.
     * @param {AsyncFunction<T>} fn - The asynchronous function.
     * @param {any[]} args - The arguments passed to the function.
     * @returns {Promise<any>} - The result of the function.
     */
    private executeFunctionAndWriteCache;
    /**
     * Updates the cache if needed and returns the cached or computed result.
     * @param {string} key - The cache key.
     * @param {AsyncFunction<T>} fn - The asynchronous function.
     * @param {any[]} args - The arguments passed to the function.
     * @param {CacheOptions} options - The caching options.
     * @returns {Promise<any>} - The cached or computed result.
     */
    private updateCacheIfNeeded;
    /**
     * Returns a memoized version of an asynchronous function.
     * @param {AsyncFunction<T>} fn - The asynchronous function to be memoized.
     * @param {CacheOptions} options - The options for caching.
     * @return {AsyncFunction<T>} - A memoized version of the input asynchronous function.
     */
    get<T>(fn: AsyncFunction<T>, options: CacheOptions): AsyncFunction<T>;
    private isDebugging;
    private log;
}
export default FasterQuery;
