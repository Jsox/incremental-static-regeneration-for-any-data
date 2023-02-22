# faster-query

The purpose of this script is to immediately and very quickly (a few milliseconds) return result of execution slow functions from cache and update the data in the cache **after** the data is returned.

For example, you have `fetch`, the request is executed for 200 milliseconds and each client waits for data to load, although the data is updated once an hour. This script, after the first execution, caches the data and returns the result of the previous execution in ~5 milliseconds.
This is similar to **getStaticProps** with `revalidate` in recent versions next.js.

## Installation

```javascript
npm i faster-query
```

or

```javascript
yarn add faster-query
```

## Example

> see `examples` dir for more examples.

```javascript
import ISR from 'faster-query';

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
    key, // Unique key in cache (String, Buffer, Array or Uint8Array)
    onComplete = function(data: any) :any, // Do something with data from first function (Function)
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

# --- По-русски ---

Цель этого скрипта - немедленно и очень быстро (несколько миллисекунд) вернуть результат выполнения медленных функций из кеша и обновить данные в кэше **после того**, как данные будут возвращены.

Например, у вас есть `fetch`, запрос выполняется в течение 200 миллисекунд, и каждый клиент ожидает загрузки данных, хотя данные обновляются раз в час. Этот скрипт после первого выполнения кэширует данные и возвращает результат предыдущего выполнения через ~5 миллисекунд.
Это похоже на **getStaticProps** с параметром `revalidate` в последних версиях next.js .

## Установка

```javascript
npm i faster-query
```

или

```javascript
yarn add faster-query
```

## Пример

> В папке `examples` есть пару примеров.

```javascript
import ISR from 'faster-query';

const url = 'https://slow.site/with/slow/backend';
const slowFunctionWithQueryData = () => fetch(url);

const isr = new ISR(slowFunctionWithQueryData, {
    key: url,
    cacheTime: 30 * 1000,
});

let data = await isr.getData();
```

## Constructor

### Первый аргумент класса

Медленная Асинхронная функция (запрос данных с бекенда, например)

```javascript
const slowFunctionWithQueryData = () => fetch('https://slow.site/with/slow/backend');
```

### Второй аргумент

Объект настроек выполнения

```javascript
options = {
    cacheTime = 5 * 1000, // Время с момента первого выполнения, затем скрипт повторно выполнит функцию. Возврат **кешированных** данных (Boolean, время в миллисекундах)
    criticalCacheTime = 60 * 60 * 1000 , // Время, после первого выполнения, когда кэш очистится / Функция выполняется всегда (миллисекунды)
    key, // Уникальный ключ в кэше (строка, буфер, массив или Uint8Array)
    onComplete = function(data: any) :any, // Операции с данными из первой функции (Function)
    isLogging = false, // Показывать отладку в консоли или нет (Boolean)
    noCache = false, // если true - никакой магии (Boolean)
    clearCache = false, // Если true - **весь** кэш будет очищен перед выполнением (Boolean)
}
```

## Методы класса

`getData` - асинхронная, возврат данных

## Как это работает

- Первое выполнение: _выполняется функция, возвращается результат, результат кэшируется_
- Вторая и последующие выполнения:
- - Если `cacheTime` **<** времени с момента первого выполнения - _возвращается результат из кэша_
* Если `cacheTime` **>**, времени с момента первого выполнения: **немедленно** _возвращается результат из кэша, а затем выполняется функция и результат помещается в кэш_
- Если `criticalCacheTime` **>** времени с момента последнего выполнения: все работает как при _первом выполнении_
