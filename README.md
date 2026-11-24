# 🗳️ Blokichain — Decentralized Voting App

A blockchain voting platform where polls and votes live on an Ethereum smart contract, so results are transparent and can't be tampered with. An AI service checks the results for unusual voting patterns.

![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)
![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-%23F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white)

> 🚧 **Status: work in progress.** The smart contract, wallet connection and AI analysis service are written; the poll UI, admin panel and API routes are still being built.

---

## ✨ Features

- **On-chain polls** — admins create polls with a question, options and a time limit
- **One wallet, one vote** — the contract blocks double voting per poll
- **Role-based access** — only admins can create or end polls (OpenZeppelin `AccessControl`)
- **MetaMask login** — users connect their wallet to vote
- **Transparent results** — anyone can read poll results straight from the contract
- **AI anomaly detection** — an Isolation Forest model flags suspicious vote distributions

---

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  React client │────▶│  Express server  │────▶│  VotingSystem.sol  │
│  (MetaMask)   │     │  (ethers.js)     │     │  (Ethereum)        │
└──────────────┘     └────────┬─────────┘     └────────────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │  AI service      │
                     │  (Flask + sklearn)│
                     └──────────────────┘
```

| Folder | What it does |
|---|---|
| `Contracts/` | `VotingSystem` smart contract (Solidity + OpenZeppelin) and Hardhat deploy script |
| `client/` | React app: wallet connector, polls and admin panel |
| `server/` | Express API that talks to the contract through ethers.js |
| `ai-service/` | Flask service that analyses vote results for anomalies |

---

## 📜 Smart Contract

`VotingSystem` (in `Contracts/contracts/Voting.sol`):

| Function | Who | What it does |
|---|---|---|
| `createPoll(question, options, durationHours)` | Admin | Opens a new poll |
| `vote(pollId, option)` | Anyone | Casts one vote per wallet per poll |
| `endPoll(pollId)` | Admin | Closes a poll early |
| `getPollResults(pollId)` | Anyone | Returns vote counts for each option |
| `addAdmin(address)` | Owner | Gives another wallet admin rights |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MetaMask browser extension
- Hardhat (for local blockchain and deployment)

### 1. Clone and install
```bash
git clone https://github.com/101feliki/blokichain.git
cd blokichain
npm install
```

### 2. Deploy the contract
```bash
cd Contracts
npx hardhat node                                   # start a local blockchain
npx hardhat run scripts/deploy.js --network localhost
```
Copy the contract address that is printed.

### 3. Run the server
Create `server/.env`:
```env
INFURA_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=<your deployed contract address>
ADMIN_PRIVATE_KEY=<admin wallet private key>
PORT=5000
```
Then:
```bash
cd server
node server.js
```

### 4. Run the AI service
```bash
cd ai-service
pip install flask numpy scikit-learn joblib
python app.py
```
`POST /analyze` with `{ "results": [12, 8, 3] }` returns totals, percentages and an anomaly score.

### 5. Run the client
```bash
cd client
npm start
```

> ⚠️ Never commit your `.env` file or private keys.

---

## 🗺️ Roadmap

- [x] Voting smart contract with roles and one-vote-per-wallet
- [x] MetaMask wallet connection
- [x] AI anomaly detection service
- [ ] Poll list and voting UI
- [ ] Admin panel for creating and ending polls
- [ ] API routes and poll controller
- [ ] Connect the AI service to live poll results
- [ ] Deploy to a public testnet

---

## 👤 Author

**Felix Kariuki** — [@101feliki](https://github.com/101feliki)
