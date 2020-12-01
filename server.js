const express = require('express');
const morgan = require('morgan'); // for development , give info about each request
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

dotenv.config({
    path: './config/index.env'
});

// MongoDb
const connectDB = require('./config/db');
connectDB();

app.use(morgan('dev'));
app.use(cors());

// routes
app.use('/api/user', require('./routes/auth.route'));
app.use('/api/category', require('./routes/category.route'));

app.get('/', (req, res) => {
    res.send('test route => home page');
});

//Page Not Found
app.use((req, res) => {
    res.status(404).json({
        msg: 'Page Not Found'
    })
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});