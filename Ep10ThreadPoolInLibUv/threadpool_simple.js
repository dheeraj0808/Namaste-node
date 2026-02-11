// THREAD POOL - SIMPLE EXAMPLE
// =============================
// Thread Pool: A pool of worker threads that handle async I/O tasks
// without blocking the main thread

const fs = require('fs');
const crypto = require('crypto');

console.log('🚀 Starting Thread Pool Demo\n');

// EXAMPLE 1: File Reading with Thread Pool
// ==========================================
console.log('--- Example 1: File Reading ---');
console.log('Main thread starts...');

// These tasks go to the thread pool
// Default thread pool size = 4
fs.readFile('file.txt', 'utf8', (err, data) => {
    console.log('✅ File read task 1 completed');
});

fs.readFile('file.txt', 'utf8', (err, data) => {
    console.log('✅ File read task 2 completed');
});

fs.readFile('file.txt', 'utf8', (err, data) => {
    console.log('✅ File read task 3 completed');
});

fs.readFile('file.txt', 'utf8', (err, data) => {
    console.log('✅ File read task 4 completed');
});

// 5th task waits because thread pool size is 4
fs.readFile('file.txt', 'utf8', (err, data) => {
    console.log('✅ File read task 5 completed (waited for a thread)');
});

console.log('Main thread continues without waiting!\n');

// EXAMPLE 2: CPU-Intensive Task (Crypto Hash)
// =============================================
console.log('--- Example 2: Crypto Hash (Thread Pool) ---');

// pbkdf2 is CPU-intensive and uses thread pool
crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', (err, hash) => {
    console.log('✅ Hash task completed');
});

console.log('Main thread NOT blocked by crypto work!\n');

// KEY CONCEPTS:
// =============
// 1. Thread Pool: libuv maintains 4 threads by default (UV_THREADPOOL_SIZE)
// 2. Async I/O: fs, crypto, dns queries use the thread pool
// 3. Non-blocking: Main thread continues while tasks run in background
// 4. Queueing: If more than 4 tasks, extras wait in queue

// TO TEST THREAD POOL SIZE:
// Change UV_THREADPOOL_SIZE environment variable:
// UV_THREADPOOL_SIZE=2 node threadpool_simple.js
