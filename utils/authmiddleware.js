const jwt = require('jsonwebtoken');
const users = require('../models/userModel');

//PROTECTING ROUTES

const isAuthenticated = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json('Unauthorized!. Please login');
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const user = await users.findById(decodedToken.id);
  if (!user) {
    return res.status(401).json('authorization not found');
  }
  req.user = user;
  next();
};

module.exports = isAuthenticated;
