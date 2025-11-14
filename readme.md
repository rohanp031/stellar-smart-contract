<p align="center">
  <img src="./logo.png" alt="MilstoneFund Logo" width="300"/>
</p>

# MilestoneFund – Decentralized Crowdfunding on Soroban

MilestoneFund is a smart contract + frontend proof-of-concept demonstrating **decentralized, milestone-based crowdfunding** using **Soroban smart contracts** on the Stellar Network.

The platform ensures that creators can raise funds transparently while backers retain control — **funds are only released when milestones are completed and approved through weighted voting.**

---

## 🚀 Features

- **Decentralized milestone approval**
- **Weighted voting based on contributions**
- **Secure fund release logic**
- **Refunds if funding goals are not met**
- **Testnet-ready deployment**
- **React frontend + Freighter wallet integration (mocked)**

---

## 🧱 Tech Stack

| Component | Technology |
|----------|------------|
| Smart Contract | Rust + Soroban SDK |
| Frontend | React + Vite + Tailwind CSS |
| Wallet | Freighter |
| Blockchain | Stellar Testnet |

---

## 📁 Project Structure

```
.
├── contract/         # Soroban (Rust) smart contract
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs    # Main contract logic
└── frontend/         # React application
    ├── src/
    │   └── App.jsx   # Main React component
    ├── package.json
```

---

# 🧩 Smart Contract Overview (contract/)

The `lib.rs` file implements all crowdfunding logic.

### **Core Contract Functions**

### `initialize(creator, token, goal, deadline, milestones)`
Configures a project. Can only be called once.

### `fund(backer, amount)`
Registers a contribution from a backer.

### `vote(backer, milestone_index)`
Allows contributors to vote YES on a milestone.

### `release_funds(milestone_index)`
Transfers milestone-locked funds to the creator when >50% weighted approval is met.

### `claim_refund(backer)`
If the deadline passes and the goal is unmet, contributors can claim refunds.

---

# 🛠️ Build & Deploy (Soroban CLI)

### **1. Build Contract**

```sh
cd contract
soroban contract build
```

Outputs a `.wasm` file under `target/wasm32-unknown-unknown/release/`.

---

### **2. Deploy to Testnet**

```sh
soroban contract deploy   --wasm target/wasm32-unknown-unknown/release/milestone_fund.wasm   --source YOUR_TESTNET_ACCOUNT   --network testnet
```

Produces a **Contract ID**.

---

### **3. Initialize the Contract**

```sh
soroban contract invoke   --id YOUR_CONTRACT_ID   --source YOUR_TESTNET_ACCOUNT   --network testnet   --   initialize   --creator YOUR_TESTNET_ACCOUNT_ADDRESS   --token YOUR_TOKEN_CONTRACT_ID   --goal 10000   --deadline 1234567   --milestones '[{"title": "Milestone 1", "amount": 5000}, {"title": "Milestone 2", "amount": 5000}]'
```

---

# 🌐 Frontend (frontend/)

The React interface allows users to:

- Connect wallet (mocked for now)
- Fund the project
- Vote on milestones
- View project status
- Trigger fund release or refunds

To make the app fully functional:

```
npm install @stellar/soroban-client freighter-api
```

Then replace mocked logic inside `App.jsx` with real contract calls.

---

# ▶️ Run the Frontend

```sh
cd frontend
npm install
npm run dev
```

Opens: **http://localhost:5173**

---

# 🧭 Testnet Deployment (Live)

| Item | Value |
|------|--------|
| **Contract Address** | `CD6LVDOFXWIH7QQ4ZGVUEJVNXBMFDOPNJANNUEQLPVWK3WPNM44TWYEC` |
| **Network** | Stellar Testnet |
| **WASM Hash** | `937135328dee402bbc48a6cc1603e416a36f9a8fef48de2a48db194206fabc99` |

### 🔗 Explorer Links

- **Contract:**  
  https://stellar.expert/explorer/testnet/contract/CD6LVDOFXWIH7QQ4ZGVUEJVNXBMFDOPNJANNUEQLPVWK3WPNM44TWYEC

- **Deploy Transaction:**  
  https://stellar.expert/explorer/testnet/tx/dc1d77e273455e84bb3b9b498afc65abc75d631345c067d791151c4aac38a4aa

---

## Author
Rohan Poddar – Initial Work

---


# 🤝 Contributing

Pull requests are welcome!

---

# DISCLAIMER
- This is a demonstration project deployed on testnet. Do not use real funds or deploy to mainnet without proper security audits and testing.
