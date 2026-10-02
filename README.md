# AI-Powered Blockchain Charity Donation System

Academic prototype for transparent charity donations using blockchain, smart contracts, milestone tracking, evidence references, and AI-assisted anomaly monitoring.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB-ready (in-memory fallback for demo)
- Blockchain: Solidity + Hardhat
- Wallet: MetaMask / ethers.js
- Evidence: IPFS-ready API hook
- AI: Python + scikit-learn (Isolation Forest)

## Quick start

### 1. Backend
```bash
cd backend
npm install
npm run dev
```
Runs on `http://localhost:4000`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal.

### 3. Smart contract
```bash
npm install
npx hardhat compile
npx hardhat node
# in another terminal
npx hardhat run scripts/deploy.js --network localhost
```
Copy the deployed address into `frontend/.env` as `VITE_CONTRACT_ADDRESS` and the ABI from `artifacts/` if you want live wallet integration.

### 4. AI service
```bash
cd ai
python -m venv .venv
# activate it, then:
pip install -r requirements.txt
python app.py
```
Runs on `http://localhost:5000`.

## Important
This is an academic prototype. Use a blockchain test network and test funds. The AI service flags anomalies for human review; it does not prove fraud.

## Project structure
- `frontend/` React/Vite web UI and MetaMask donation integration
- `backend/` Express API with MongoDB-ready persistence and demo fallback
- `contracts/` Solidity smart contract
- `test/` Hardhat contract test
- `scripts/` deployment script
- `ai/` Flask + Isolation Forest anomaly-monitoring service
- `data/` sample transaction data

## Live blockchain integration
1. Start a local Hardhat node.
2. Deploy the contract with `npm run deploy`.
3. Put the printed address in `frontend/.env` as `VITE_CONTRACT_ADDRESS`.
4. Add the local Hardhat network to MetaMask and import one of the Hardhat test accounts.
5. Start the backend, AI service, and frontend.
6. Use the Donate button with a campaign ID matching the on-chain campaign.

The demo campaign cards are supplied by the backend and are not automatically created on-chain. For a full live demo, create the corresponding campaigns in the contract first or extend the admin UI to call `createCampaign`.
