
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { 
  createResume, 
  getResumes, 
  getResumeById, 
  updateResume,
  deleteResume,
  scoreResume,
  saveDraft,
  finalizeResume
} = require('../controllers/resumeController');

// Real auth middleware for backend security
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
              return res.status(401).json({ message: 'User not found' });
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        // Fallback for development/preview if NO JWT_SECRET is set or for mock testing
        if (process.env.NODE_ENV === 'development') {
           req.user = { _id: '654321098765432109876543' }; // Mock ID
           return next();
        }
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

router.route('/').post(protect, createResume).get(protect, getResumes);
router.route('/:id').get(protect, getResumeById).put(protect, updateResume).delete(protect, deleteResume);
router.post('/score', protect, scoreResume);
router.post('/save-draft', protect, saveDraft);
router.put('/:id/finalize', protect, finalizeResume);

module.exports = router;
