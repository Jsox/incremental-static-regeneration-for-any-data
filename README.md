# FasterQuery

FasterQuery is a simple yet powerful utility for caching the 
results of asynchronous functions in Node.js applications.
It provides a convenient way to store and retrieve the output of functions,
reducing the need for repetitive computations and improving overall
application performance.

## Features

- **Flexible Caching Options**: FasterQuery offers various caching options, including time-to-live (TTL) expiration and automatic updates by interval.
- **File System Storage**: Results are stored in the file system, ensuring persistence across application restarts.
- **Debugging Support**: Integrated logging functionality allows developers to track cache hits, misses, and updates for debugging purposes.
- **Easy Integration**: With a straightforward API, FasterQuery can be seamlessly integrated into existing projects with minimal configuration.

## Installation

You can install FasterQuery via npm:

```bash
npm install faster-query
```

## Usage

### Function: `get`

#### Purpose:
The `get` function returns a memoized version of an asynchronous function with caching options.

#### Parameters:
- `fn` (`AsyncFunction<T>`): The asynchronous function to be memoized.
- `options` (`CacheOptions`): The caching options to customize the behavior of the cache.

#### Returns:
- `AsyncFunction<T>`: A memoized version of the input asynchronous function.

#### Description:
The `get` function accepts an asynchronous function (`fn`) and caching options (`options`). It returns a new asynchronous function that wraps the original function (`fn`) with caching logic based on the provided options. This memoized function automatically caches the results of the original function and retrieves them from the cache when the same set of arguments is provided, thus improving performance by avoiding redundant computations.

#### Example Usage:
```typescript
const cachedAsyncFunction = fasterQueryInstance.get(asyncFunctionToMemoize, {
    ttl: 60 * 60, // hour
    returnCachedIfExpiredAndUpdate: true
});
```
## CacheOptions
**ttl (Time To Live)** (defaults to 60 seconds): Determines the lifespan of cached data in seconds. After this time elapses, the data is considered expired and may be updated or deleted depending on other parameters.

**returnCachedIfExpiredAndUpdate** (defaults to false): If set to true, and the cached data has expired (more time has passed than ttl), the expired value is immediately returned from the cache and then updated by invoking the function and updating the cache.

**autoUpdateDataByInterval** (defaults to false): If set to true, cached data will be automatically updated at regular intervals === TTL. This ensures that the cached data remains fresh by periodically invoking the function and updating the cache.

**deleteAfterExpiration** (defaults to false): If set to true, the cached data will be deleted after it expires. This is useful for scenarios where expired data should not be retained in the cache.
```typescript
import FasterQuery from 'faster-query';
const cached = new FasterQuery('/path/to/cache');

export const cachedDataBySlug = await cached.get(async (slug: string) => dbQuery(slug), {
    ttl: 60 * 60, // hour
    autoUpdateDataByInterval: true // alwais fast answer and data not older then 1 hour
})
//---
const result = await cachedDataBySlug('slug/to/get/data');
```
or 

```typescript
import FasterQuery from 'faster-query';

const cached = new FasterQuery('/path/to/cache');

const getDataBySlug = async (slug: string) => {
    return dbQuery(slug);
};

export const cachedDataBySlug = await cached.get(getDataBySlug, {
    ttl: 60, // seconds
    autoUpdateDataByInterval: true,
});
//---
const result = await cachedDataBySlug('slug/to/get/data');
```

