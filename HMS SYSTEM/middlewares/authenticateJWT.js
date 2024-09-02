const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

module.exports = authenticateJWT;
