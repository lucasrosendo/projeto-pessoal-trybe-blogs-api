// hello-msc/index.js

const express = require('express');
const bodyParser = require('body-parser');

const usersModel = require('../models/users');

const app = express();

app.use(bodyParser.json());

app.post('/users', async (req, res) => {
  const { displayName, email, password, image } = req.body;

  if (!usersModel.isValid(displayName, email, password, image)) {
    return res.status(400).json({ message: 'Dados inválidos' });
  }

  await usersModel.createAuthor(displayName, email, password, image);

  res.status(201).json({ message: 'User created! ' });
});