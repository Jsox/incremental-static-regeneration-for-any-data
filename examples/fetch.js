const https = require('https');
import ISR from '../ISR.js';

const url = 'https://jsonplaceholder.typicode.com/users';

const slowFunctionWithQueryData = async () => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let body = '';
            res.on('data', (d) => {
                body += d;
            });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (error) {
                    console.log(error.message);
                }
            });
        });
    });
};

const onComplete = (result) => {
    return result.sort(function (row1, row2) {
        const k1 = row1['username'],
            k2 = row2['username'];
        return k1 > k2 ? 1 : k2 > k1 ? -1 : 0;
    });
};

const isr = new ISR(slowFunctionWithQueryData, {
    key: url,
    cacheTime: 3000,
    isLogging: false,
    onComplete: onComplete,
});

//!SECTION Testing

async function test() {
    let startedTime = Date.now();

    let data = await isr.getData();
    let data2;
    let data3;

    console.log('Got First time query for: ', Date.now() - startedTime, 'ms');
    console.log('--------------');

    setTimeout(async () => {
        startedTime = Date.now();
        data2 = await isr.getData();
        console.log('Got Second time query for: ', Date.now() - startedTime, 'ms');
        console.log('--------------');
    }, 2000);

    setTimeout(async () => {
        startedTime = Date.now();
        data3 = await isr.getData();
        console.log('Got Third time query for: ', Date.now() - startedTime, 'ms');
    }, 3001);

    return;
}

test();
