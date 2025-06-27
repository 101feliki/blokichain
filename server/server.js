require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/api');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Blockchain connection
const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = require('./contracts/Voting.json').abi;
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Routes
app.use('/api', adminRoutes(contract));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));