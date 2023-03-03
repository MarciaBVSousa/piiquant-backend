const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];  // Split 'bearer' from token and get the token
        const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);  // Decode token , passing the token string and encode secret key
        const userId = decodedToken.userId;
        if( req.body.userId && req.body.userId !== userId ){
            throw 'Invalid user';
        } else {
            req.auth = { userId };
            next();
        };
    } catch {
        res.status(401).json({
            error: new Error('Unauthorized request!')
        })
    }
};