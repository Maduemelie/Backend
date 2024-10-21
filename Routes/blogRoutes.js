const Router = require('express').Router();
const isAuthenticated = require('../utils/authmiddleware.js');
const blogcontroller = require('../controller/blogcontroller');

Router
  .route('/')
  .get(blogcontroller.getAllBlogs)
  .post(isAuthenticated, blogcontroller.createBlog);

Router.route('/:id').get(blogcontroller.getABlog);

Router
  .route('/owner/:id')
  .get(isAuthenticated, blogcontroller.getUserBlogs)
  .put(isAuthenticated, blogcontroller.updateBlog)
  .delete(isAuthenticated, blogcontroller.deleteBlog);

module.exports = Router;
