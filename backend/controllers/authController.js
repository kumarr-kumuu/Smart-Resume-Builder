
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
exports.signup = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'You must sign up first — this account doesn’t exist.' });
    }

    if (await user.matchPassword(password)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        plan: user.plan,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send OTP for password reset
// @route   POST /api/auth/send-otp
exports.sendOTP = async (req, res) => {
  const { phone } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this mobile number.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 300000; // 5 mins
    await user.save();

    // In production, integrate with SMS API (e.g., Twilio)
    console.log(`[OTP SENT] To ${phone}: ${otp}`);

    res.json({ message: 'OTP sent to your verified mobile number' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  const { phone, code } = req.body;
  try {
    const user = await User.findOne({ 
      phone, 
      otpCode: code, 
      otpExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password after OTP verification
// @route   PUT /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  const { phone, code, password } = req.body;
  try {
    const user = await User.findOne({ 
      phone, 
      otpCode: code, 
      otpExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Unauthorized reset attempt' });
    }

    user.password = password;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
