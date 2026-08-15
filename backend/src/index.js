require('dotenv').config();
const express = require('express');
const cors = require('cors');
const quoteRoutes = require('./routes/quoteRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/quotes', quoteRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});