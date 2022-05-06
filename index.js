const express = require('express');

const userController = require('./controllers/userController');
const categoryController = require('./controllers/categoryController');
const blogPostController = require('./controllers/blogPostController');

const app = express();

app.use(express.json());

app.use('/user', userController.user);
app.use('/login', userController.login);
app.use('/categories', categoryController);
app.use('/post', blogPostController);

app.listen(3000, () => console.log('ouvindo porta 3000!'));

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (request, response) => {
  response.send();
});
