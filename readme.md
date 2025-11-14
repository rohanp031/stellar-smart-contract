
---


**MilestoneFund - Decentralized Crowdfunding on Soroban**

MilestoneFund is a smart contract and web application proof-of-concept that demonstrates decentralized, milestone-based crowdfunding on the Stellar network using the Soroban smart contract platform.

This project allows creators to raise funds for a project and ensures that backers' funds are only released when the creator meets pre-defined, community-approved milestones.

---

### **Tech Stack**

**Smart Contract (Backend):** Rust with the Soroban SDK
**Frontend:** React with Tailwind CSS
**Wallet Integration:** Freighter (Stellar's web extension wallet)
**Blockchain:** Stellar Network (Testnet)

---

### **Project Structure**

```
.
├── contract/         # Soroban (Rust) smart contract
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs    # The main contract logic
└── frontend/         # React frontend application
    ├── src/
    │   └── App.jsx   # Main React component
    ├── package.json
    
```

---

### **Smart Contract (contract/)**

The **lib.rs** file contains the complete on-chain logic for the crowdfunding platform.

#### **Key Functions**

* **initialize(creator, token, goal, deadline, milestones):**
  Deploys and configures a new project contract. Can only be called once.

* **fund(backer, amount):**
  Allows a user to send funds to the contract. Records their contribution.

* **vote(backer, milestone_index):**
  Allows a user who has contributed funds to vote "Yes" on a specific milestone.

* **release_funds(milestone_index):**
  Can be called by anyone. If a milestone has received >50% of votes (weighted by contribution amount), this function transfers the milestone's associated funds to the creator.

* **claim_refund(backer):**
  If the funding deadline passes and the goal is not met, this allows backers to retrieve their deposited funds.

---

### **How to Build & Deploy (Soroban CLI)**

**Install Soroban CLI:**
Follow the official installation guide.

---

#### **Build the Contract:**

```
cd contract
soroban contract build
```

This will produce a `.wasm` file in the `target/` directory.

---

#### **Deploy to Testnet:**

```
# This is an example; you will need a funded Testnet account
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/milestone_fund.wasm \
  --source YOUR_TESTNET_ACCOUNT \
  --network testnet
```

This will return a **Contract ID** (e.g., `CA...`).

---

#### **Initialize the Deployed Contract:**

```
# You must call `initialize` on your new contract
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --source YOUR_TESTNET_ACCOUNT \
  --network testnet \
  -- \
  initialize \
  --creator YOUR_TESTNET_ACCOUNT_ADDRESS \
  --token YOUR_TOKEN_CONTRACT_ID \
  --goal 10000 \
  --deadline 1234567 \
  --milestones '[{"title": "Milestone 1", "amount": 5000}, {"title": "Milestone 2", "amount": 5000}]'
```

---

### **Frontend (frontend/)**

The React app provides a web interface for interacting with the deployed smart contract.

**Note:** The included `App.jsx` is a mock-up and does not have the Soroban SDK (`@stellar/soroban-client`) fully integrated. It simulates the logic and wallet interactions.

---

### **How to Run**

**Install Dependencies:**

```
cd frontend
npm install
```

**Run the Development Server:**

```
npm run dev
```

This will open the app in your browser at **[http://localhost:5173](http://localhost:5173)**.

---

### **Connecting to the Real Contract**

To make this a fully functional dApp, you would:

* Install the Soroban client:
  `npm install @stellar/soroban-client`
* In `App.jsx`, replace the "simulation" alerts with real contract calls using the soroban-client library.
* Use the **freighter-api** to request transaction signatures from the user's wallet for functions like `fund`, `vote`, and `claim_refund`.

---


