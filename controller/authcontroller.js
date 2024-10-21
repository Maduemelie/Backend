const users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Define a function to create a token
const signToken = (id, expiresIn) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

// SIGN UP NEW USERS
const signup = async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;
    if (!(email && firstName && lastName && password)) {
      return res.status(400).send('All input is required');
    }
    const oldUser = await users.findOne({ email });
    if (oldUser) {
      return res.status(409).send('User already exists. Please login.');
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new users({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashPassword,
    });
    const user = await newUser.save();
    const accessToken = signToken(user._id, '15m'); // 15 minutes
    const refreshToken = signToken(user._id, '7d'); // 7 days

    const userWithoutPassword = { ...user.toObject(), password: undefined };
    res
      .status(200)
      .json({ accessToken, refreshToken, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN USERS
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(400).json('Wrong details, try again');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json('Wrong password, try again');
    }
    const accessToken = signToken(user._id, '15m'); // 15 minutes
    const refreshToken = signToken(user._id, '7d'); // 7 days

    const userWithoutPassword = { ...user.toObject(), password: undefined };
    res
      .status(200)
      .json({ accessToken, refreshToken, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REFRESH TOKEN
const refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).send('Refresh token is required');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await users.findById(decoded.id);
    if (!user) {
      return res.status(401).send('Invalid refresh token');
    }
    const newAccessToken = signToken(user._id, '15m'); // 15 minutes
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).send('Invalid refresh token');
  }
};
 const verifyToken = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      return res.status(401).json({ error: 'Token expired' });
    }

    const user = await users.findById(decoded.id);
     const userWithoutPassword = { ...user.toObject(), password: undefined };

    res.json({ user : userWithoutPassword });
  } catch (error) {
    console.error('Error verifying token', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { signup, login, refreshToken, verifyToken };
