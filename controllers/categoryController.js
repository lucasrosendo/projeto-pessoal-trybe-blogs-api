const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { JWT_SECRET } = process.env;

const { Category } = require('../models');

const category = express.Router();

function verifyToken(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).json({ message: 'Token not found' });
  try {
    jwt.verify(authorization, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Expired or invalid token' });
  }
}

async function create(req, res) {
  const { name } = req.body;
  try {
    if (!name) return res.status(400).json({ message: '"name" is required' });
    const newCategory = await Category.create({ name });
    return res.status(201).json(newCategory);
  } catch (e) {
    return res.status(500).json({ message: 'Server error, try again in a few minutes' });
  }
}

async function getAll(_req, res) {
  try {
    const categoriesList = await Category.findAll();
    return res.status(200).json(categoriesList);
  } catch (e) {
    return res.status(500).json({ message: 'Server error, try again in a few minutes' });
  }
}

category.post('/',
  verifyToken,
  create)
.get('/',
  verifyToken,
  getAll);

module.exports = category;