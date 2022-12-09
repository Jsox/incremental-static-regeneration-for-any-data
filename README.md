# Incremental Static Data Regeneration for any slow function.

## Example
```javascript
const ISR = require('ISR');

const slowFunctionWithQueryData = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(testData);
        }, 1000);
    });
};

const isr = new ISR(slowFunctionWithQueryData, {
    key: 'func/1',
    cacheTime: 3000,
    isLogging: true,
});

let data = await isr.getData();
```


## Constructor

### first argument
Function (fetching, calculating, etc...)
```javascript
const slowFunctionWithQueryData = () => (fetch('https://slow.site/with/slow/backend'))
```

### second argument
Object
```javascript
options = {
    cacheTime = 5 * 1000, // Time from first execution, then script will re-execute function. Returning CACHED data (Milliseconds)
    criticalCacheTime = 60 * 60 * 1000, // Time, after first execution, then cache is cleaned/ Function executed always (Milliseconds)
    key, // Unique key in cache (String)
    onComplete = null, // Function to be called with first argument from execution of first argument function (Function)
    isLogging = false, // Show logs or not (Boolean)
    noCache = false, // if true - no magic (Boolean)
    clearCache = false, // If true - cache will be cleaned (Boolean)
}
```
## Methods
```getData``` - async, returning data
## How it works
+ First execution: *executing function, returning result, result is caching*
+ Second execution:
    - If ```cacheTime``` **<** then time from first execution - *returning result from cache*
    + If ```cacheTime``` **>** then time from first execution: **immediately** *returning result from cache, re-executing function and putting result to cache*
+ If ```criticalCacheTime``` **more** then time from first execution: *executing function, returning result, result is caching*

