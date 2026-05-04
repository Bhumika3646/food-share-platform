const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const userFile = path.join(__dirname, '../data/users.json');

function readUsers() {
  const data = fs.readFileSync(userFile, 'utf-8');
  return JSON.parse(data || '[]');
}

function writeUsers(data) {
  fs.writeFileSync(userFile, JSON.stringify(data, null, 2));
}

router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const users = readUsers();
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    role
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json({
    message: 'Registration successful',
    user: newUser
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const users = readUsers();
  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({
    message: 'Login successful',
    user
  });
});

module.exports = router;