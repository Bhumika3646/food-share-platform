const express = require('express');
const cors = require('cors');

const foodRoutes = require('./routes/foodRoutes');
const requestRoutes = require('./routes/requestRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Food Share Backend Running');
});

app.use('/api/foods', foodRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});