const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { JWT_SECRET } = process.env;

const { User } = require('../models');

const user = express.Router();
const login = express.Router();

function verifyDisplayName(req, res, next) {
  const { displayName } = req.body;
  if (displayName.length < 8) {
    return res.status(400).json({
      message: '"displayName" length must be at least 8 characters long',
    });
  }
  next();
}

async function verifyEmail(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: '"email" is required' });
    const emailRegex = /\w{1,}@\w{1,}\.\w{1,}/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '"email" must be a valid email' });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error, try again in a few minutes' });
  }
}

function verifyPassword(req, res, next) {
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: '"password" is required' });
  if (password.length < 6) {
    return res.status(400).json({ message: '"password" length must be 6 characters long' });
  }
  next();
}

async function create(req, res) {
  try {
    const retrievedUser = await User.findOne({ where: { email: req.body.email } });
    if (retrievedUser) return res.status(409).json({ message: 'User already registered' });
    const newUser = await User.create(req.body);

    const token = jwt.sign({ data: newUser.id }, JWT_SECRET);

    return res.status(201).json({ token });
  } catch (err) {
    return res.status(500).json({ message: 'Server error, try again in a few minutes' });
  }
}

function tryEmail(req, res, next) {
  const { email } = req.body;

  if (email === '') return res.status(400).json({ message: '"email" is not allowed to be empty' });
  if (!email) return res.status(400).json({ message: '"email" is required' });
  const emailRegex = /\w{1,}@\w{1,}\.\w{1,}/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Campos inválidos' });
  }
  next();
}

function tryPassword(req, res, next) {
  const { password } = req.body;
  if (password === '') {
    return res.status(400).json({ message: '"password" is not allowed to be empty' });
  }
  if (!password) return res.status(400).json({ message: '"password" is required' });
  next();
}

async function doLogin(req, res) {
  const { email, password } = req.body;
  const validUser = await User.findOne({ where: { email, password } });
  if (!validUser) return res.status(400).json({ message: 'Invalid fields' });
  const token = jwt.sign({ data: validUser.id }, JWT_SECRET);

  return res.status(200).json({ token });
}

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

async function getAll(_req, res) {
  // setando atributos de forma a evitar que vazem informações sensiveis
  const attributes = ['id', 'displayName', 'email', 'image'];
  const users = await User.findAll({ attributes });
  return res.status(200).json(users);
}

async function getById(req, res) {
  const { id } = req.params;
  const attributes = ['id', 'displayName', 'email', 'image'];
  try {
    const retrievedUser = await User.findByPk(id, { attributes });
    if (!retrievedUser) return res.status(404).json({ message: 'User does not exist' });
    return res.status(200).json(retrievedUser);
  } catch (e) {
    return res.status(500).json({ message: 'Server error, try again in a few minutes' });
  }
}

user.post('/',
  verifyDisplayName,
  verifyEmail,
  verifyPassword,
  create)
.get('/',
  verifyToken,
  getAll)
.get('/:id',
  verifyToken,
  getById);

login.post('/',
  tryEmail,
  tryPassword,
  doLogin);

module.exports = {
  user,
  login,
};