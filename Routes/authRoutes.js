const authcontroller = require('../controller/authcontroller');
const Router = require('express').Router();
const isAuthenticated = require('../utils/authmiddleware.js');

Router.route('/signup').post(authcontroller.signup);
Router.route('/login').post(authcontroller.login);
Router.route('/refresh').post(authcontroller.refreshToken);
Router.route('/:id').get( isAuthenticated, authcontroller.verifyToken);

module.exports = Router;
