require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('src'));
app.use(express.static('build/contracts'));

app.get('*', (req, res) => {
    res.status(404);
    res.send('Ooops... this URL does not exist');
});

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`);
});