const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.listen(PORT, () => {
    console.log(`you are server is running on ${PORT}`);
});

app.get('/char/:charNo/books/:bookId', (req, res) => {
    res.end('Who 100 !');
});
app.get('*', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8'); 
    res.send({'a': 'Who 100 !'});
});