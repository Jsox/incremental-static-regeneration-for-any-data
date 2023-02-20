/// <reference types="node" />
declare const cache: any;
declare const md5: any;
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
    constructor(func: () => Promise<any>, options: IOptions);
    getData(): Promise<any>;
    getDataAndPutToCache(): Promise<unknown>;
    log(f: any | unknown, s?: any | unknown, t?: any | unknown): void;
}
export {};
