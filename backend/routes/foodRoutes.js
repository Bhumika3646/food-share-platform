const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const foodFile = path.join(__dirname, '../data/foods.json');

function readFoods() {
  const data = fs.readFileSync(foodFile, 'utf-8');
  return JSON.parse(data || '[]');
}

function writeFoods(data) {
  fs.writeFileSync(foodFile, JSON.stringify(data, null, 2));
}

router.get('/', (req, res) => {
  const foods = readFoods();
  res.json(foods);
});

router.post('/', (req, res) => {
  const { foodName, quantity, location, expiryTime, postedBy } = req.body;

  if (!foodName || !quantity || !location || !expiryTime || !postedBy) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const foods = readFoods();

  const now = new Date();
  const expiry = new Date(expiryTime);
  const diffHours = (expiry - now) / (1000 * 60 * 60);

  let priority = 'Low';
  if (diffHours <= 2) {
    priority = 'High';
  } else if (diffHours <= 5) {
    priority = 'Medium';
  }

  const newFood = {
    id: Date.now(),
    foodName,
    quantity,
    location,
    expiryTime,
    postedBy,
    priority,
    status: 'Available'
  };

  foods.push(newFood);
  writeFoods(foods);

  res.status(201).json(newFood);
});

module.exports = router;