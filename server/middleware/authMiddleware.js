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
    console.error('--- JWT FAILURE DETECTED ---');
    console.error('Error Type:', error.name);
    console.error('Error Msg:', error.message);
    console.error('Secret check (length):', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'UNDEFINED');
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Lien expiré. Merci de demander un nouveau lien.' });
    }
    return res.status(401).json({ message: 'Lien invalide ou compromis (Invalid Signature).' });
  }
};
