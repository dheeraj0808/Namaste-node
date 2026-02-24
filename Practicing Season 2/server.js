const express = require ("express");

const app = express();

const PORT = process.env.PORT || 3000;

// order of the api call is most most important
app.get('/ab?c', (req, res) => {
    res.send(' optional testing of ab?c');
});
// in the above case, ? means the character before it is optional
// if we hit /abc or /ac, it will match this route

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/hello/2', (req, res) => {
    res.send('this is hello 2');
});

app.get('/hello', (req, res) => {
    res.send('this is simple hello');
});



app.get('/xyz', (req, res) => {
    res.send('this is a random xyz page');
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

