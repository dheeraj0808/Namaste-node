// one full cycle of event loop is called a tick
// javascript is single threaded but it can do async work using event loop and thread pool
// libuv is a library that provides a thread pool for performing async work
// it is used by node.js to perform async work

const crypto = require('crypto');

console.time('hashing');
crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', () => {
    console.timeEnd('hashing');
});

// this will print the time taken to perform the hashing operation
// if we run this code multiple times, we will see that the time taken is not consistent
// this is because the hashing operation is performed in a separate thread and the main thread is not blocked
// so the time taken to perform the hashing operation can vary depending on the load on the thread pool and other factors