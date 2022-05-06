const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { JWT_SECRET } = process.env;

const { BlogPost } = require('../models');
const { Category } = require('../models');
const { User } = require('../models');

const blogPost = express.Router();

function verifyToken(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) return res.status(401).json({ message: 'Token not found' });

  try {
    const { data } = jwt.verify(authorization, JWT_SECRET);
    req.userId = data;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Expired or invalid token' });
  }
}

function verifyPost(req, res, next) {
  const { title, content } = req.body;

  if (!title) return res.status(400).json({ message: '"title" is required' });
  if (!content) return res.status(400).json({ message: '"content" is required' });

  next();
}

async function verifyCategories(req, res, next) {
  const { categoryIds } = req.body;

  if (!categoryIds || categoryIds.length < 1) {
    return res.status(400).json({ message: '"categoryIds" is required' });
  }

  const cat = await Category.findAll({ where: { id: categoryIds } });

  if (cat.length !== categoryIds.length) { 
    return res.status(400).json({ message: '"categoryIds" not found' });
  }

  next();
}

async function create(req, res) {
  const { title, content } = req.body;
  const { userId } = req;
  try {
    const newPost = await BlogPost.create({ userId, title, content });

    return res.status(201).json(newPost);
  } catch (e) {
    return res.status(500).json({ message: 'Server error, try again in a few minutes' });
  }
}

async function getAll(_req, res) {
  try {
    const posts = await BlogPost.findAll({
      include: [
        { model: User,
          as: 'user',
          attributes: { exclude: ['password'] },
        },
        { model: Category, as: 'categories' },
      ],
    });

    return res.status(200).json(posts);
  } catch (e) {
    console.log(`\n\n*${e.message}*\n\n`);
    return res.status(500).json({ message: 'Server error, try again in a few minutes' });
  }
}

blogPost.post('/',
  verifyToken,
  verifyPost,
  verifyCategories,
  create)
.get('/',
  verifyToken,
  getAll);

module.exports = blogPost;