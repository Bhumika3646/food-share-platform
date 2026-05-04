const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const requestFile = path.join(__dirname, '../data/requests.json');
const foodFile = path.join(__dirname, '../data/foods.json');

function readRequests() {
  const data = fs.readFileSync(requestFile, 'utf-8');
  return JSON.parse(data || '[]');
}

function writeRequests(data) {
  fs.writeFileSync(requestFile, JSON.stringify(data, null, 2));
}

function readFoods() {
  const data = fs.readFileSync(foodFile, 'utf-8');
  return JSON.parse(data || '[]');
}

function writeFoods(data) {
  fs.writeFileSync(foodFile, JSON.stringify(data, null, 2));
}

// Get all requests
router.get('/', (req, res) => {
  const requests = readRequests();
  res.json(requests);
});

// NGO creates request
router.post('/', (req, res) => {
  const { foodId, requestedBy } = req.body;

  if (!foodId || !requestedBy) {
    return res.status(400).json({ message: 'foodId and requestedBy are required' });
  }

  const requests = readRequests();
  const foods = readFoods();

  const foodIndex = foods.findIndex((food) => food.id === foodId);

  if (foodIndex === -1) {
    return res.status(404).json({ message: 'Food item not found' });
  }

  if (foods[foodIndex].status !== 'Available') {
    return res.status(400).json({ message: 'This food is no longer available' });
  }

  const alreadyRequested = requests.find(
    (r) => r.foodId === foodId && r.requestedBy === requestedBy && r.status === 'Pending'
  );

  if (alreadyRequested) {
    return res.status(400).json({ message: 'You already requested this food' });
  }

  // Food becomes pending instead of directly approved
  foods[foodIndex].status = 'Pending Request';
  writeFoods(foods);

  const newRequest = {
    id: Date.now(),
    foodId,
    foodName: foods[foodIndex].foodName,
    postedBy: foods[foodIndex].postedBy,
    requestedBy,
    location: foods[foodIndex].location,
    status: 'Pending'
  };

  requests.push(newRequest);
  writeRequests(requests);

  res.status(201).json(newRequest);
});

// Restaurant accepts or rejects request
router.put('/:id', (req, res) => {
  const { action } = req.body; // accept or reject
  const requestId = parseInt(req.params.id);

  if (!action || !['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Action must be accept or reject' });
  }

  const requests = readRequests();
  const foods = readFoods();

  const requestIndex = requests.findIndex((r) => r.id === requestId);

  if (requestIndex === -1) {
    return res.status(404).json({ message: 'Request not found' });
  }

  const requestItem = requests[requestIndex];

  if (requestItem.status !== 'Pending') {
    return res.status(400).json({ message: 'This request was already processed' });
  }

  const foodIndex = foods.findIndex((f) => f.id === requestItem.foodId);

  if (foodIndex === -1) {
    return res.status(404).json({ message: 'Food item not found' });
  }

  if (action === 'accept') {
    requests[requestIndex].status = 'Accepted';
    foods[foodIndex].status = 'Accepted';
  } else {
    requests[requestIndex].status = 'Rejected';
    foods[foodIndex].status = 'Available';
  }

  writeRequests(requests);
  writeFoods(foods);

  res.json({
    message: `Request ${action}ed successfully`,
    request: requests[requestIndex]
  });
});

module.exports = router;