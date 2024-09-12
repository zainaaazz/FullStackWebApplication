const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    // Extract the token from the Authorization header
    const authHeader = req.headers['authorization'];
    
    if (authHeader) {
        // The token format should be "Bearer <token>"
        const token = authHeader.split(' ')[1];

        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (err) {
                    return res.status(403).json({ error: 'Forbidden' });
                }
                req.user = user;
                next();
            });
        } else {
            return res.status(401).json({ error: 'Unauthorized: Bearer token missing' });
        }
    } else {
        return res.status(401).json({ error: 'Unauthorized: Authorization header missing' });
    }
};

module.exports = authenticateJWT;
