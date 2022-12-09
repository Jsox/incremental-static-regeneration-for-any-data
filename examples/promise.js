import ISR from '../ISR.js';

const testData = {
    id: '1',
    name: 'test',
    time: Date.now(),
};

const slowFunctionWithQueryData = () => {
    return new Promise((resolve, reject) => {
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

async function test() {
    let startedTime = Date.now();

    let data = await isr.getData();
    let data2;
    let data3;

    console.log('First', data);
    console.log('Got First time query for: ', Date.now() - startedTime, 'ms');
    console.log('--------------');

    setTimeout(async () => {
        startedTime = Date.now();
        data2 = await isr.getData();
        console.log('Second', data2);
        console.log('Got Second time query for: ', Date.now() - startedTime, 'ms');
        console.log('--------------');
    }, 2000);

    setTimeout(async () => {
        startedTime = Date.now();
        data3 = await isr.getData();
        console.log('After cache expires', data3);
        console.log('Got Third time query for: ', Date.now() - startedTime, 'ms');
    }, 3001);

    return;
}

test();
