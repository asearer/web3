# Random On-Chain NFT (Demo)

This project demonstrates **on-chain randomized NFTs** using **Hardhat**, **Solidity**, **ERC-721**, and a **Vite/React frontend**. All traits and SVG images are generated on-chain.

> ⚠️ This is a **demo/educational project**. For production, consider using Chainlink VRF for secure randomness and IPFS for metadata storage.

---

## 🛠 Features

- **ERC-721 NFT** with randomized traits:
  - Colors, shapes, rarity
  - Fully on-chain metadata + SVG
- **Preview before minting**
- **Minting NFTs**
- **Gallery of previews**
- **Local testing with Hardhat**
- **MetaMask integration**
- Frontend built with **Vite + React**  
- Event-driven display of minted NFTs  

---

## ⚡ Tech Stack

- **Solidity** (0.8.28)
- **Hardhat** for smart contract compilation, testing, and deployment
- **OpenZeppelin** contracts
- **React + Vite** frontend
- **Ethers.js** for blockchain interaction
- **MetaMask** for wallet connection

---

## 📦 Getting Started

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd random-nft
````

---

### 2. Install dependencies

```bash
# Backend
npm install

# Frontend
cd frontend
npm install
```

---

### 3. Configure Environment

Create a `.env` file in the frontend folder:

```env
VITE_RANDOM_NFT_ADDRESS=<DEPLOYED_CONTRACT_ADDRESS>
```

> Replace `<DEPLOYED_CONTRACT_ADDRESS>` with the address after deploying the contract locally or on a testnet.

---

### 4. Run Hardhat Local Node

```bash
npx hardhat node
```

> This starts a local blockchain on `http://127.0.0.1:8545` with pre-funded test accounts.

---

### 5. Deploy Contract

```bash
npx hardhat run scripts/deploy.js --network localhost
```

> Save the deployed contract address and add it to your `.env` file.

---

### 6. Run Frontend

```bash
cd frontend
npm run dev
```

Open your browser at `http://localhost:5173` (or the port Vite outputs).

---

## 🧪 Testing

Run all tests:

```bash
npx hardhat test
```

You should see:

* Lock contract tests passing
* NFTRandomizer minting & preview tests passing

---

## 🔑 MetaMask Setup (Local Testing)

1. Install MetaMask browser extension.
2. Create a new wallet (keep seed phrase secure).
3. Add a **Hardhat local network**:

| Field        | Value                                          |
| ------------ | ---------------------------------------------- |
| Network Name | Hardhat Localhost                              |
| RPC URL      | [http://127.0.0.1:8545](http://127.0.0.1:8545) |
| Chain ID     | 31337                                          |
| Currency     | ETH                                            |

4. Import one of Hardhat’s pre-funded accounts using its **private key**.
5. Connect MetaMask to the frontend by clicking **Connect MetaMask**.

---

## 🖼 Frontend Usage

1. **Connect MetaMask**
2. **Preview NFTs**

    * Random salts generate preview images and traits
    * Click a preview to select it
3. **Mint NFTs**

    * Selected salt is sent to the contract
4. **View Your Mints**

    * See all NFTs minted during this session

---

## ⚙️ Notes

* **On-chain randomness** uses `block.prevrandao` + salt (educational demo only)
* **Production deployment** should use **Chainlink VRF**
* **mintPrice** is set to 0 by default; adjust in the contract for paid mints
* Traits and SVGs are deterministic based on token ID
* Base64 JSON metadata is returned via `tokenURI()`

---

## 🔮 Future Improvements

* Integrate with **IPFS** for image storage
* Use **ERC-1155** for batch NFTs
* Add **trait rarity balancing**
* Include **event-driven updates** for a live frontend gallery
* Deploy to **testnet/mainnet**

