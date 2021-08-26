const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const verifiedUser = users.find(user => user.username === username)

  if (!verifiedUser) {
    return response.status(404).json({ error: 'User Not Found' })
  }

  request.verifiedUser = verifiedUser

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const id = uuidv4();


  const userAlreadyExists = users.find(user => user.username === username)


  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists' })
  }

  user = {
    id,
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user).send()
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { verifiedUser } = request

  return response.json(verifiedUser.todos).send()
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { verifiedUser } = request

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }

  verifiedUser.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const id = request.params;
  const { verifiedUser } = request;

  const filteredTodo = verifiedUser.todos.find(todo => todo.id === id)
  if (!filteredTodo) {

    return response.status(404).json({ error: 'Todo Not Found' })

  }

  filteredTodo.title = title;
  filteredTodo.deadline = new Date(deadline)


  return response.status(200).json(filteredTodo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const id = request.params
  const { verifiedUser } = request


  const filteredTodo = verifiedUser.todos.find(todo => todo.id === id)

  if (!filteredTodo) {
    return response.status(404).json({ error: 'Todo Not Found' })
  }

  filteredTodo.done = true

  return response.status(200).json(filteredTodo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const id = request.params
  const { verifiedUser } = request

  const filteredTodoIndex = verifiedUser.todos.findIndex(todo => todo.id === id)

  if (filteredTodoIndex === -1) {
    return response.status(404).json({ error: 'Todo Not Found' })
  }

  verifiedUser.splice(filteredTodoIndex, 1)

  return response.status(204)
});

module.exports = app;