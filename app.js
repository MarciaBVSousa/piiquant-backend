require('dotenv').config();

const mongoose = require('mongoose');
mongoose.connect(process.env.connect)
    .then(() => {
        console.log('Successfully connected to database');
    })
    .catch(() => {
        console.log('Unable to connect to database');
    });

const express = require('express');
const app = express();

const path = require('path');

const userRoutes = require('./routes/user');
const sauceRotes = require('./routes/sauces');

const helmet = require('helmet');
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});


app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRotes);


module.exports = app;
