require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const apiRoutes = require("./routes/api");

const { RPC_URL = "http://127.0.0.1:8545", ADMIN_PRIVATE_KEY, PORT = 5000 } = process.env;

const contractFile = path.join(__dirname, "contracts", "Voting.json");
if (!fs.existsSync(contractFile)) {
  console.error("contracts/Voting.json not found. Deploy the contract first: cd Contracts && npm run deploy:local");
  process.exit(1);
}
const { address, abi } = JSON.parse(fs.readFileSync(contractFile, "utf8"));
const contractAddress = process.env.CONTRACT_ADDRESS || address;

// Read-only contract for public endpoints; signer-backed contract for admin endpoints (optional).
const provider = new ethers.JsonRpcProvider(RPC_URL);
const readContract = new ethers.Contract(contractAddress, abi, provider);
const adminContract = ADMIN_PRIVATE_KEY
  ? new ethers.Contract(contractAddress, abi, new ethers.Wallet(ADMIN_PRIVATE_KEY, provider))
  : null;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok", contract: contractAddress }));
app.use("/api", apiRoutes({ readContract, adminContract }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.shortMessage || err.message });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT} (contract ${contractAddress})`));
