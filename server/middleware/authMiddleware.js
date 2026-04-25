const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.protectCandidate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ message: 'No candidate token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.candidateId) return res.status(401).json({ message: 'Invalid candidate token format' });
    req.candidateAuth = { id: decoded.candidateId };
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    console.log('Received raw token:', token);
    res.status(401).json({ message: 'Token is not valid or expired. Please request a new link.' });
  }
};
