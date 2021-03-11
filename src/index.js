const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user=> user.username === username);
  if (!user){
    return response.status(400).json({
      error: 'Usuario nao existente'
    });
  }
 request.user = user;

 return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyInUse = users.find(user=> user.username === username);
  if (userAlreadyInUse){
    return response.status(400).json({
      error: "Usuario ja existente"
    });
  }
  
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date,
  }
  
  user.todos.push(todo);
  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const upadateTodo = user.todos.find(todoId => todoId.id === id);

  if (!upadateTodo) {
    return response.status(404).json({ error: 'Todo does not exists' });
  }

  upadateTodo.title = title;
  upadateTodo.deadline = deadline;

  return response.status(201).json(upadateTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const patchTodo = user.todos.find(todoId => todoId.id === id);

  if (!patchTodo) {
    return response.status(404).json({ error: 'Todo does not exists' });
  }

  patchTodo.done = true;

  return response.status(201).json(patchTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const deleteTodo = user.todos.find(todoId => todoId.id === id);

  if (!deleteTodo) {
    return response.status(404).json({ error: 'Todo does not exists' });
  }

  user.todos.splice(deleteTodo, 1);

  return response.status(204).send();
});

module.exports = app;