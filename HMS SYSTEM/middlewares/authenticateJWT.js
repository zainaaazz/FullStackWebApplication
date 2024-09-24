const jwt = require('jsonwebtoken');

const authenticateJWT = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        
        if (authHeader) {
            const token = authHeader.split(' ')[1];

            if (token) {
                jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                    if (err) {
                        return res.status(403).json({ error: 'Forbidden' });
                    }

                    if (roles.length && !roles.includes(user.UserRole)) {
                        return res.status(403).json({ error: 'Access denied' });
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
};

module.exports = authenticateJWT;
