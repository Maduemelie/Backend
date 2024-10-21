const blogs = require('../models/blogModel');
const users = require('../models/userModel');

//CREATE A BLOG
const createBlog = async (req, res) => {
  try {
    const { title, description, body, tags } = req.body;
    const { id } = req.user;
    const user = await users.findById(id);
    const author = `${user.firstName} ${user.lastName}`;
    const readingTime = getReadingTime(body);
    const newBlog = new blogs({
      title,
      description,
      body,
      author,
      tags,
      readingTime,
      user: user._id,
    });
    const blogPost = await newBlog.save();
    user.blog = user.blog.concat(blogPost._id);
    await user.save();
    res.status(200).json({ blogPost });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const getReadingTime = (body) => {
  const wordPerMinute = 150;
  const numOfWord = body.split(' ').length;
  const minute = numOfWord / wordPerMinute;
  const readingTime = Math.ceil(minute);
  return ` ${readingTime} Minute Read Time`;
};

//GET A BLOG WITH ITS ID
const getABlog = async (req, res) => {
  try {
    const id = req.params.id;
    const blog = await blogs.findById(id).where({ state: 'published' });
    if (!blog) {
      res.status(404).json('NO blog found!');
    }
    blog.readCount++;
    await blog.save();
    return res.status(200).json(blog);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
//Get All Blogs
const getAllBlogs = async (req, res) => {
  try {
    const queryObj = { ...req.query };

    //FILTERING
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    let query = blogs.find(queryObj);
    //SORTING
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    //PAGINATION
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (req.query.page) {
      const numOfArticle = await blogs
        .countDocuments()
        .where({ state: 'published' });
      if (skip >= numOfArticle) throw new Error('page does not exist');
    }
    query = query.skip(skip).limit(limit);

    const publishedBlogs = await blogs
      .find(query)
      .where({ state: 'published' })
      .populate('user', { firstName: 1, lastName: 1, _id: 1 });

    res.status(200).json(publishedBlogs);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// UPDATE A BLOG
const updateBlog = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    const { title, description, state, tags, body } = req.body;
    const readingTime = getReadingTime(body);

    const blog = await blogs.findById(id);

    if (blog.user._id.toString() === user.id) {
      try {
        const updatedBlog = await blogs.findByIdAndUpdate(
          id,
          { title, description, state, tags, body, readingTime },
          { new: true }
        );

        await updatedBlog.save();
        res.status(200).json(updatedBlog);
      } catch (error) {
        res.status(500).json(error.message);
      }
    } else {
      res.status(401).json('Unauthorized');
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
};
//GETTING PERSONAL BLOGS
const getUserBlogs = async (req, res) => {
  try {
    const userid = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const userBlogs = await blogs
      .find({ user: userid })
      .skip(skip)
      .limit(limit);
    return res.status(200).json(userBlogs);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

// DELETE A BLOG
const deleteBlog = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;

    const blog = await blogs.findById(id);

    if (blog.user._id.toString() === user.id) {
      try {
        await blogs.deleteOne();
        res
          .status(200)
          .json({ status: 'success', message: 'blog deleted successfully' });
      } catch (error) {
        res.status(500).json(error);
      }
    } else {
      res.status(401).json('Unauthorized');
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  createBlog,
  getABlog,
  getAllBlogs,
  updateBlog,
  getUserBlogs,
  deleteBlog,
};
