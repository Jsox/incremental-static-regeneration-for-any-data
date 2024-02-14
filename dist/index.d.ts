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
declare class FasterQuery {
    private cachePath;
    private timersToUpdate;
    private timersToDelete;
    static isLogging: boolean;
    constructor(cachePath: string);
    private initializeCacheDirectory;
    private hashFunction;
    private readCache;
    private writeCache;
    private deleteCache;
    private executeFunctionAndWriteCache;
    private updateCacheIfNeeded;
    get<T>(fn: AsyncFunction<T>, options: CacheOptions): AsyncFunction<T>;
}
export default FasterQuery;
