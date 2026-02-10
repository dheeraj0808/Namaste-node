/*
=============================================================
             THREAD POOL IN LIBUV - DETAILED EXPLANATION
=============================================================

libuv ek library hai jo Node.js ko asynchronous I/O operations 
dene ke liye use hoti hai. 

THREAD POOL KYA HAI?
- Thread pool ek collection hai multiple threads ka
- Default mein libuv 4 threads use karta hai (CPU cores ke anusar)
- Blocking operations ke liye ye threads use hote hain
- jaise: File I/O, DNS lookups, Crypto operations, etc.

=============================================================
*/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log(`\n${'='.repeat(60)}`);
console.log('THREAD POOL DEMONSTRATION');
console.log(`${'='.repeat(60)}\n`);

/*
EXAMPLE 1: File Reading Operations
- File operations default mein thread pool use karte hain
- Agar 5 files read karni ho aur 4 threads ho, 
  to 1 file wait karega jab tak pehli complete ho
*/

console.log('📂 EXAMPLE 1: File Reading (Multiple Async Operations)\n');

const filesToRead = [
    '/Users/ujjwalpratap/Desktop/NamasteNode/app.js',
    '/Users/ujjwalpratap/Desktop/NamasteNode/crud.js',
    '/Users/ujjwalpratap/Desktop/NamasteNode/README.md',
];

const startTime = Date.now();

filesToRead.forEach((file, index) => {
    fs.readFile(file, 'utf-8', (err, data) => {
        if (err) {
            console.log(`❌ Error reading file ${index + 1}: ${err.message}`);
        } else {
            const timeTaken = Date.now() - startTime;
            console.log(`✅ File ${index + 1} read (${timeTaken}ms) - Size: ${data.length} bytes`);
        }
    });
});

/*
EXAMPLE 2: Crypto Operations (CPU-Intensive)
- Crypto operations bhi thread pool use karte hain
- Ye blocking operations hain, isliye thread pool mein jate hain
*/

console.log('\n\n🔐 EXAMPLE 2: Crypto Operations (CPU Intensive)\n');

const passwords = ['password123', 'mypass456', 'secret789', 'admin@123'];
const cryptoStart = Date.now();

passwords.forEach((password, index) => {
    crypto.pbkdf2(password, 'salt', 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) {
            console.log(`❌ Crypto Error ${index + 1}: ${err.message}`);
        } else {
            const timeTaken = Date.now() - cryptoStart;
            console.log(`✅ Password ${index + 1} hashed (${timeTaken}ms) - Hash: ${derivedKey.toString('hex').substring(0, 20)}...`);
        }
    });
});

/*
EXAMPLE 3: DNS Lookup (Network Operation via Thread Pool)
- DNS lookups thread pool ke through jate hain
- Network operations async hote hain
*/

console.log('\n\n🌐 EXAMPLE 3: DNS Lookups\n');

const dns = require('dns');
const domainsToLookup = ['google.com', 'github.com', 'stackoverflow.com'];
const dnsStart = Date.now();

domainsToLookup.forEach((domain, index) => {
    dns.lookup(domain, (err, address, family) => {
        if (err) {
            console.log(`❌ DNS Error ${index + 1}: ${err.message}`);
        } else {
            const timeTaken = Date.now() - dnsStart;
            console.log(`✅ Domain ${index + 1} (${timeTaken}ms) - ${domain} -> ${address} (IPv${family})`);
        }
    });
});

/*
=============================================================
THREAD POOL SIZE KAISE CHANGE KARTE HAIN?
=============================================================
*/

console.log('\n\n⚙️  THREAD POOL SIZE CONFIGURATION\n');

// Method 1: Environment Variable
console.log('Method 1: Set UV_THREADPOOL_SIZE environment variable');
console.log('$ UV_THREADPOOL_SIZE=8 node script.js');
console.log('\nCurrent thread pool size:', process.env.UV_THREADPOOL_SIZE || 'Default (4)');

// Method 2: Code mein set karna (file load hone se pehle)
// NOTE: Ye alag file mein likhna padega jo thread pool se pehle import ho
console.log('\nMethod 2: Code mein set karna (must be before any async I/O):');
console.log(`process.env.UV_THREADPOOL_SIZE = 8;`);

/*
=============================================================
THREAD POOL QUEUE - PRACTICAL EXAMPLE
=============================================================

Agar 8 async operations hain aur thread pool size 4 hai:
- Time 0ms: Operations 1,2,3,4 - threads pe assign
- Time T ms: Operations 5,6,7,8 - queue mein wait
- Jab koi operation complete hota hai, queue se next operation liya jata hai
*/

console.log('\n\n📊 EXAMPLE 4: Queue Demonstration (8 Operations, 4 Threads)\n');

const operations = [];

for (let i = 1; i <= 8; i++) {
    const promise = new Promise((resolve) => {
        const operation = `Operation ${i}`;
        console.log(`⏳ ${operation} - Queue/Thread pool mein add hua`);

        // Simulating blocking operation
        crypto.pbkdf2(`data${i}`, 'salt', 100000, 64, 'sha512', () => {
            const elapsed = Date.now() - cryptoStart;
            console.log(`✅ ${operation} - Complete! (${elapsed}ms)`);
            resolve();
        });
    });
    operations.push(promise);
}

Promise.all(operations).then(() => {
    console.log('\n✨ Sab operations complete!');
});

/*
=============================================================
THREAD POOL KA ASAR - HEAVY OPERATIONS
=============================================================
*/

console.log('\n\n💪 EXAMPLE 5: Heavy vs Light Operations\n');

console.log('Light Operation (Non-blocking - Direct event loop):');
setTimeout(() => {
    console.log('  ✅ setTimeout 0ms complete - Main thread se handle');
}, 0);

console.log('\nHeavy Operation (Blocking - Thread pool):');
crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', () => {
    console.log('  ✅ Crypto hashing complete - Thread pool se handle');
});

/*
=============================================================
SUMMARY
=============================================================

✅ THREAD POOL USE KARTE HAIN:
  - File I/O operations (fs.readFile, fs.writeFile, etc.)
  - Crypto operations (crypto.pbkdf2, crypto.randomBytes, etc.)
  - DNS lookups (dns.lookup)
  - Compression (zlib)
  - Some async operations

❌ THREAD POOL USE NAHI KARTE:
  - setTimeout / setInterval
  - setImmediate
  - Promise callbacks
  - Network I/O (mostly)
  - Callbacks in event loop

⚙️ BEST PRACTICES:
  1. Default 4 threads usually sufficient hai
  2. CPU-bound tasks ke liye thread pool size badha sakte ho
  3. Production mein monitoring karo thread pool usage ko
  4. Very heavy operations ko worker threads use karte ho
  5. UV_THREADPOOL_SIZE ko pehle se set karo

=============================================================
*/

console.log('\n\n📖 THREAD POOL CONCEPTS:\n');
console.log(`
1. LIBUV EVENT LOOP
   ↓
2. BLOCKING OPERATION DETECTED (File read, Crypto, DNS, etc.)
   ↓
3. THREAD POOL MEIN ASSIGN (Queue se available thread pakad kar)
   ↓
4. THREAD BACKGROUND MEIN WORK KARTA HAI
   ↓
5. CALLBACK READY
   ↓
6. EVENT LOOP MEIN CALLBACK EXECUTE
   ↓
7. USER KO RESULT MILTA HAI
`);
