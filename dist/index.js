"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
const util_1 = __importDefault(require("util"));
const mkdir = util_1.default.promisify(fs.mkdir);
const readFile = util_1.default.promisify(fs.readFile);
const writeFile = util_1.default.promisify(fs.writeFile);
const unlink = util_1.default.promisify(fs.unlink);
/**
 * A class for caching results of asynchronous functions.
 */
class FasterQuery {
    /**
     * Constructs a FasterQuery instance.
     * @param {string} cachePath - The path where cached data will be stored.
     */
    constructor(cachePath) {
        this.timersToUpdate = new Map();
        this.timersToDelete = new Map();
        this.cachePath = cachePath;
        this.initializeCacheDirectory();
    }
    /**
     * Initializes the cache directory.
     */
    initializeCacheDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield mkdir(this.cachePath, { recursive: true });
            }
            catch (error) {
                console.error('Error creating cache directory:', error);
            }
        });
    }
    /**
     * Generates a hash based on the function and its arguments.
     * @param {AsyncFunction<any>} fn - The asynchronous function.
     * @param {any[]} args - The arguments passed to the function.
     * @returns {Promise<string>} - The generated hash.
     */
    hashFunction(fn, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const hash = crypto.createHash('md5');
            hash.update(fn.toString());
            hash.update(JSON.stringify(args));
            return hash.digest('hex');
        });
    }
    /**
     * Reads cached data from the file system.
     * @param {string} key - The cache key.
     * @returns {Promise<any | null>} - The cached data or null if not found.
     */
    readCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield readFile(`${this.cachePath}/${key}.json`, 'utf8');
                return JSON.parse(data);
            }
            catch (error) {
                return null;
            }
        });
    }
    /**
     * Writes data to the cache in the file system.
     * @param {string} key - The cache key.
     * @param {any} data - The data to be cached.
     */
    writeCache(key, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield writeFile(`${this.cachePath}/${key}.json`, JSON.stringify(data), 'utf8');
            }
            catch (error) {
                console.error('Error deleting cache:', error);
            }
        });
    }
    /**
     * Deletes cached data from the file system.
     * @param {string} key - The cache key.
     */
    deleteCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield unlink(`${this.cachePath}/${key}.json`);
            }
            catch (error) {
                console.error('Error deleting cache:', error);
            }
        });
    }
    /**
     * Executes the function, writes the result to the cache, and returns the result.
     * @param {AsyncFunction<T>} fn - The asynchronous function.
     * @param {any[]} args - The arguments passed to the function.
     * @returns {Promise<any>} - The result of the function.
     */
    executeFunctionAndWriteCache(fn, args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield fn(...args);
                const key = yield this.hashFunction(fn, args);
                yield this.writeCache(key, { result, timestamp: Date.now() });
                return result;
            }
            catch (error) {
                console.error('Error executing function and writing cache:', error);
                throw error; // Propagate the error
            }
        });
    }
    /**
     * Updates the cache if needed and returns the cached or computed result.
     * @param {string} key - The cache key.
     * @param {AsyncFunction<T>} fn - The asynchronous function.
     * @param {any[]} args - The arguments passed to the function.
     * @param {CacheOptions} options - The caching options.
     * @returns {Promise<any>} - The cached or computed result.
     */
    updateCacheIfNeeded(key, fn, args, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ttl = 'ttl' in options ? options.ttl : 60 * 60;
                const autoUpdateDataByInterval = 'autoUpdateDataByInterval' in options
                    ? options.autoUpdateDataByInterval
                    : false;
                const returnCachedIfExpiredAndUpdate = 'returnCachedIfExpiredAndUpdate' in options
                    ? options.returnCachedIfExpiredAndUpdate
                    : false;
                const deleteAfterExpiration = 'deleteAfterExpiration' in options
                    ? options.deleteAfterExpiration
                    : false;
                if (autoUpdateDataByInterval) {
                    if (!this.timersToUpdate.has(key)) {
                        this.timersToUpdate.set(key, ttl);
                        this.log(`SCHEDULED UPDATE: ${fn.name}(${args})`, ttl, this.timersToUpdate.keys());
                        setInterval(() => __awaiter(this, void 0, void 0, function* () {
                            this.log(`UPDATED DATA IN SCHEDULE: ${fn.name}(${args})`, `every (${ttl}-2) sec`);
                            yield this.executeFunctionAndWriteCache(fn, args);
                        }), (ttl - 2) * 1000);
                    }
                }
                if (deleteAfterExpiration) {
                    if (!this.timersToDelete.has(key)) {
                        // {
                        //     clearTimeout(this.timersToDelete.get(key)!);
                        // }
                        this.timersToDelete.set(key, setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                            yield this.deleteCache(key);
                            this.log(`DELETED DATA: ${fn.name}(${args})`, ttl);
                        }), ttl * 1000));
                    }
                }
                const cachedData = yield this.readCache(key);
                if (cachedData !== null) {
                    const currentTime = Date.now();
                    const cacheTime = cachedData.timestamp;
                    if (currentTime - cacheTime <= ttl * 1000) {
                        this.log(`CACHE HIT: ${fn.name}(${args})`, ttl * 1000, currentTime - cacheTime, '<=', ttl * 1000);
                        return cachedData.result;
                    }
                    else if (returnCachedIfExpiredAndUpdate) {
                        this.log(`CACHE EXPIRED - return Cached and update: ${fn.name}(${args})`, ttl * 1000, currentTime - cacheTime, '>', ttl * 1000);
                        this.executeFunctionAndWriteCache(fn, args);
                        return cachedData.result;
                    }
                }
                this.log(`CACHE MISS for ${key}`, ttl);
                return yield this.executeFunctionAndWriteCache(fn, args);
            }
            catch (error) {
                console.error('Error updating cache if needed:', error);
                throw error; // Propagate the error
            }
        });
    }
    /**
     * Returns a memoized version of an asynchronous function.
     * @param {AsyncFunction<T>} fn - The asynchronous function to be memoized.
     * @param {CacheOptions} options - The options for caching.
     * @return {AsyncFunction<T>} - A memoized version of the input asynchronous function.
     */
    get(fn, options) {
        return (...args) => __awaiter(this, void 0, void 0, function* () {
            try {
                const key = yield this.hashFunction(fn, args);
                return yield this.updateCacheIfNeeded(key, fn, args, options);
            }
            catch (error) {
                console.error('Error getting memoized function:', error);
                throw error; // Propagate the error
            }
        });
    }
    isDebugging() {
        return process.env.NODE_ENV === 'development' || FasterQuery.isLogging;
    }
    log(...args) {
        if (this.isDebugging())
            console.log(new Date().toLocaleString(), 'CACHED:V2 DEBUG: ', ...args);
    }
}
FasterQuery.isLogging = false;
exports.default = FasterQuery;
