# Incremental Data Revalidation for any slow function.
The purpose of this script is to immediately and very quickly (a few milliseconds) return result of execution slow functions and update the data in the cache after the data is returned.

For example, you have ```fetch```, the request is executed for 200 milliseconds and each client waits for data to load, although the data is updated once an hour. This script, after the first execution, caches the data and returns the result of the previous execution in ~5 milliseconds.
This is similar to revalidation of static data in recent versions next.js.
## Installation
```javascript
npm i get-incremental-cached-data
```
or
```javascript
yarn add get-incremental-cached-data
```
## Example
> see ```examples``` dir for more examples. 
```javascript
import ISR from 'get-incremental-cached-data';

const url = 'https://slow.site/with/slow/backend';
const slowFunctionWithQueryData = () => fetch(url);

const isr = new ISR(slowFunctionWithQueryData, {
    key: url,
    cacheTime: 30 * 1000,
});

let data = await isr.getData();
```

## Constructor

### first argument

Asynchronous Function (fetching, calculating, etc...)
Must return some data.

```javascript
const slowFunctionWithQueryData = () => fetch('https://slow.site/with/slow/backend');
```

### second argument

Object of options

```javascript
options = {
    cacheTime = 5 * 1000, // Time from first execution, then script will re-execute function. Returning CACHED data (Boolean, Time in milliseconds)
    criticalCacheTime = 60 * 60 * 1000, // Time, after first execution, then cache is cleaned/ Function executed always (Milliseconds)
    key, // Unique key in cache (String)
    onComplete:(data): any = null, // Do something with data from first function (Function)
    isLogging = false, // Show logs or not (Boolean)
    noCache = false, // if true - no magic (Boolean)
    clearCache = false, // If true - ALL cache will be cleaned before execution (Boolean)
}
```

## Methods

`getData` - async, returning data

## How it works



-   First execution: _executing function, returning result, result is caching_
-   Second execution:
    -   If `cacheTime` **<** then time from first execution - _returning result from cache_
    *   If `cacheTime` **>** then time from first execution: **immediately** _returning result from cache, re-executing function and putting result to cache_
-   If `criticalCacheTime` **>** then time from last execution: like in _First execution_
