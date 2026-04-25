const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for the candidate Phase 2
 * @param {Object} candidate - The candidate object
 * @returns {String} Signed JWT token
 */
exports.generatePhase2Token = (candidate) => {
  return jwt.sign(
    { candidateId: candidate._id, email: candidate.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};
