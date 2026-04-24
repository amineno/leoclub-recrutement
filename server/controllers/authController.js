const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Check if account is locked
    const isLocked = admin.lockUntil && admin.lockUntil > Date.now();
    if (isLocked) {
      const remainingTime = Math.ceil((admin.lockUntil - Date.now()) / 60000);
      return res.status(403).json({ 
        message: `Compte bloqué. Réessayez dans ${remainingTime} minutes.` 
      });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      admin.loginAttempts = (admin.loginAttempts || 0) + 1;
      if (admin.loginAttempts >= 5) {
        admin.lockUntil = Date.now() + 15 * 60 * 1000;
      }
      await admin.save();
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Reset attempts on success
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Erreur de configuration serveur' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findById(req.user.id);
    
    if (email) admin.email = email;
    if (password) admin.password = password;
    
    await admin.save();
    res.json({ message: 'Profil mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
