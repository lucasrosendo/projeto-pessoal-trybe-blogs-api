const express = require('express');
const bodyParser = require('body-parser');

const usersModel = require('./models/users');

const app = express();

app.use(bodyParser.json());

app.post('/users', async (req, res) => {
  const { displayName, email, password, image } = req.body;

  const create = await usersModel.create(displayName, email, password, image);

  return res.status(201).send(create);
});

app.listen(3000, () => console.log('ouvindo porta 3000!'));

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (request, response) => {
  response.send();
});
