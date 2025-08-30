


# 🪙 Simple Blockchain in Go

A minimal blockchain implementation written in **Golang**, featuring:

- Genesis block creation  
- Block & chain validation  
- Proof-of-Work mining  
- HTTP API (powered by Gorilla Mux)  

This is a learning project to understand blockchain fundamentals — **not for production use**.

---

### Install Dependencies

This project uses Gorilla Mux for HTTP routing:

```bash
go get -u github.com/gorilla/mux
```

### Run the Project

```bash
go run main.go
```

Server starts on **[http://localhost:8080](http://localhost:8080)**

---

## 🌐 API Endpoints

### ➤ Get Blockchain

```bash
curl -s http://localhost:8080/blocks | jq
```

**Response Example:**

```json
[
  {
    "index": 0,
    "timestamp": "2025-08-30 12:00:00 +0000 UTC",
    "data": "Genesis Block",
    "prevHash": "",
    "hash": "000af3...",
    "nonce": 0
  }
]
```

---

### ➤ Mine a New Block

```bash
curl -X POST -H "Content-Type: application/json" \
-d '{"data":"Hello Blockchain"}' \
http://localhost:8080/mine
```

**Response Example:**

```json
{
  "index": 1,
  "timestamp": "2025-08-30 12:01:23.456789 +0000 UTC",
  "data": "Hello Blockchain",
  "prevHash": "000af3...",
  "hash": "000c91...",
  "nonce": 5321
}
```

---

## 🧑‍💻 Testing with GoLand HTTP Client

GoLand has a built-in REST client, so you don’t need `curl` or Postman.

1. Create a file in your project root: **`requests.http`**
2. Add the following content:

```http
### Get Blockchain
GET http://localhost:8080/blocks

### Mine a New Block
POST http://localhost:8080/mine
Content-Type: application/json

{
  "data": "Hello from GoLand"
}
```

3. Open `requests.http` in GoLand.
4. Click the **Run Request** (▶️) link above each request.
5. View results directly in the IDE — JSON is nicely formatted automatically.

---

## 🔒 Features

* **Validation** → Ensures blocks and chain are consistent
* **Proof-of-Work** → Simple mining algorithm with configurable difficulty
* **REST API** → Interact with blockchain using `curl`, Postman, or GoLand HTTP Client

---

## 🛠 Next Steps

* [ ] Add **P2P networking** to sync multiple nodes
* [ ] Implement **wallets & transactions** (cryptographic signatures)
* [ ] Add **consensus mechanism** across nodes
* [ ] Store blockchain to **disk** (BoltDB/Badger)

---

## ⚠️ Disclaimer

This is a **learning project**. Do **not** use this code in production for financial or sensitive applications.




