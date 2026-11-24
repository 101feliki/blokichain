# Blokichain — Decentralized Voting App

A blockchain voting platform where polls and votes live on an Ethereum smart contract, so results are transparent and can't be tampered with. An AI service checks the results for unusual voting patterns.

![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)
![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-FFF100?style=for-the-badge&logo=hardhat&logoColor=black)

> **Status:** working end to end on a local Hardhat chain: smart contract (with tests), API server, AI analysis service and React client.

---

## Features

- **On-chain polls** — admins create polls with a question, options and a time limit
- **One wallet, one vote** — the contract blocks double voting per poll
- **Role-based access** — only admins can create or end polls (OpenZeppelin `AccessControl`)
- **MetaMask login** — users connect their wallet to vote
- **Transparent results** — anyone can read poll results straight from the contract
- **Vote analysis** — the AI service flags unusual results (landslides, perfectly even splits, sudden swings, counts going down)

---

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  React client │────▶│  Express server  │────▶│  VotingSystem.sol  │
│  (MetaMask)   │     │  (ethers.js)     │     │  (Ethereum)        │
└──────────────┘     └────────┬─────────┘     └────────────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │  AI service      │
                     │  (Flask)          │
                     └──────────────────┘
```

| Folder | What it does |
|---|---|
| `Contracts/` | `VotingSystem` smart contract (Solidity + OpenZeppelin) and Hardhat deploy script |
| `client/` | React app: wallet connector, polls and admin panel |
| `server/` | Express API that talks to the contract through ethers.js |
| `ai-service/` | Flask service that analyses vote results for anomalies |

---

## Smart Contract

`VotingSystem` (in `Contracts/contracts/Voting.sol`):

| Function | Who | What it does |
|---|---|---|
| `createPoll(question, options, durationHours)` | Admin | Opens a new poll |
| `vote(pollId, option)` | Anyone | Casts one vote per wallet per poll |
| `endPoll(pollId)` | Admin | Closes a poll early |
| `getPollResults(pollId)` | Anyone | Returns vote counts for each option |
| `addAdmin(address)` | Owner | Gives another wallet admin rights |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MetaMask browser extension

### 1. Contracts: test and deploy to a local chain
```bash
cd Contracts
npm install
npm test                 # runs the contract tests
npm run node             # terminal 1: local blockchain on http://127.0.0.1:8545
npm run deploy:local     # terminal 2: deploys and writes Voting.json to client/ and server/
```
The deployer account becomes the owner and first admin. To make another wallet an admin, set `EXTRA_ADMIN=0xYourAddress` before deploying.

### 2. AI service
```bash
cd ai-service
pip install -r requirements.txt
python app.py            # http://127.0.0.1:5001
```
`POST /analyze` with `{ "results": [12, 8, 3] }` returns percentages, the leader, concentration, entropy and any warning flags. Run `pytest` for its tests.

### 3. API server
```bash
cd server
npm install
npm start                # http://127.0.0.1:5000
```
Optional environment variables: `RPC_URL`, `CONTRACT_ADDRESS`, `AI_SERVICE_URL`, `PORT`. To enable the admin endpoints, set both `ADMIN_PRIVATE_KEY` (wallet the server signs with) and `ADMIN_API_KEY` (sent in the `x-admin-key` header).

| Endpoint | Description |
|---|---|
| `GET /api/polls` | All polls, newest first |
| `GET /api/polls/:id` | One poll |
| `GET /api/polls/:id/results` | Vote counts per option |
| `GET /api/polls/:id/analysis` | Results checked by the AI service |
| `POST /api/admin/polls` | Create a poll (admin key required) |
| `POST /api/admin/polls/:id/end` | End a poll (admin key required) |

### 4. Client
```bash
cd client
npm install
npm start                # http://localhost:3000
```
In MetaMask, add the Hardhat network (RPC `http://127.0.0.1:8545`, chain ID `31337`) and import one of the test accounts that `npm run node` prints. Admin wallets see the admin panel automatically.

> Never commit private keys. The Hardhat test accounts are public and only for local use.

---

## Roadmap

- [x] Voting smart contract with roles, custom errors and one-vote-per-wallet
- [x] Contract tests
- [x] MetaMask wallet connection
- [x] Poll list, live results and voting UI
- [x] Admin panel for creating and ending polls
- [x] API server with read and admin endpoints
- [x] Vote analysis service with tests
- [ ] Deploy to a public testnet (Sepolia)
- [ ] Store result snapshots so the analysis can compare over time

---

## Author

**Felix Kariuki** — [@101feliki](https://github.com/101feliki)
