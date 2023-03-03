const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');


exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then((hash) => {
            const user = new User({
                email: req.body.email,
                password: hash
            });

            user.save()
            .then(() => res.status(201).json({ message: 'User registered!' }))
            .catch(() => res.status(500).json({ error: new Error('Unable to register!') }))
        })
        .catch(() => { res.status(500).json({
            error: new Error('Could not register')
            })
        });
};

exports.login = (req, res, next) => {
    User.findOne( {email: req.body.email} )
    .then((user) => {
        if(!user) {
            return res.status(401).json({
                error: new Error('User not found!')
            })
        };

        bcrypt.compare(req.body.password, user.password)
        .then((valid) => {
            if(!valid) {
                return res.status(401).json({
                    error: new Error('Unauthorized!')
                })
            };

            const token = jwt.sign(
                { userId: user._id },
                process.env.TOKEN_KEY,
                { expiresIn: '24h' }
            );

            res.status(200).json({
                userId: user._id,
                token: token
            })
        })

        .catch(() => {
            res.status(500).json({
                error: new Error('Something happened. Could not login')
            })
        })
    })

    .catch(() => {
        res.status(500).json({
            error: new Error('Could not login')
        })
    })
};