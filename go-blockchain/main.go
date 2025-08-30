package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/mux"
)

////////////////////////////////////////////////////////
// BLOCK STRUCT & BASIC BLOCKCHAIN LOGIC
////////////////////////////////////////////////////////

// Block represents a single block in the blockchain
type Block struct {
	Index     int    `json:"index"`     // position of the block in the chain
	Timestamp string `json:"timestamp"` // when the block was created
	Data      string `json:"data"`      // payload (e.g., transactions)
	PrevHash  string `json:"prevHash"`  // hash of the previous block
	Hash      string `json:"hash"`      // current block's hash
	Nonce     int    `json:"nonce"`     // used for Proof-of-Work
}

// Blockchain is just a slice of Blocks
var Blockchain []Block

// difficulty controls mining difficulty (number of leading zeros required in hash)
const difficulty = 3

////////////////////////////////////////////////////////
// HASHING & BLOCK CREATION
////////////////////////////////////////////////////////

// calculateHash generates the SHA256 hash of a block's contents
func calculateHash(block Block) string {
	record := fmt.Sprintf("%d%s%s%s%d", block.Index, block.Timestamp, block.Data, block.PrevHash, block.Nonce)
	h := sha256.New()
	h.Write([]byte(record))
	hashed := h.Sum(nil)
	return hex.EncodeToString(hashed)
}

// mineBlock performs Proof-of-Work by finding a hash with required difficulty
func mineBlock(block Block) Block {
	for {
		block.Hash = calculateHash(block)
		// Check if hash has required number of leading zeros
		if block.Hash[:difficulty] == strings.Repeat("0", difficulty) {
			fmt.Println("✅ Block mined:", block.Hash)
			break
		} else {
			block.Nonce++ // increment nonce and try again
		}
	}
	return block
}

// generateBlock creates a new block using the previous block's hash and mines it
func generateBlock(oldBlock Block, data string) Block {
	newBlock := Block{
		Index:     oldBlock.Index + 1,
		Timestamp: time.Now().String(),
		Data:      data,
		PrevHash:  oldBlock.Hash,
		Nonce:     0,
	}
	return mineBlock(newBlock)
}

// createGenesisBlock creates the first block in the chain
func createGenesisBlock() Block {
	genesisBlock := Block{
		Index:     0,
		Timestamp: time.Now().String(),
		Data:      "Genesis Block",
		PrevHash:  "",
		Nonce:     0,
	}
	genesisBlock.Hash = calculateHash(genesisBlock)
	return genesisBlock
}

////////////////////////////////////////////////////////
// VALIDATION FUNCTIONS
////////////////////////////////////////////////////////

// isBlockValid ensures new block correctly references the old one
func isBlockValid(newBlock, oldBlock Block) bool {
	if oldBlock.Index+1 != newBlock.Index {
		return false
	}
	if oldBlock.Hash != newBlock.PrevHash {
		return false
	}
	if calculateHash(newBlock) != newBlock.Hash {
		return false
	}
	return true
}

// isBlockchainValid checks the entire chain for validity
func isBlockchainValid(chain []Block) bool {
	for i := 1; i < len(chain); i++ {
		if !isBlockValid(chain[i], chain[i-1]) {
			return false
		}
	}
	return true
}

////////////////////////////////////////////////////////
// HTTP API HANDLERS
////////////////////////////////////////////////////////

// getBlockchain returns the blockchain as JSON
func getBlockchain(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Blockchain)
}

// writeBlock mines a new block with user-provided data
func writeBlock(w http.ResponseWriter, r *http.Request) {
	var data struct {
		Data string `json:"data"`
	}
	_ = json.NewDecoder(r.Body).Decode(&data)

	newBlock := generateBlock(Blockchain[len(Blockchain)-1], data.Data)

	if isBlockValid(newBlock, Blockchain[len(Blockchain)-1]) {
		Blockchain = append(Blockchain, newBlock)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newBlock)
}

// runServer starts the HTTP server
func runServer() {
	router := mux.NewRouter()
	router.HandleFunc("/blocks", getBlockchain).Methods("GET")
	router.HandleFunc("/mine", writeBlock).Methods("POST")
	fmt.Println("🚀 Server started at http://localhost:8080")
	http.ListenAndServe(":8080", router)
}

////////////////////////////////////////////////////////
// MAIN FUNCTION
////////////////////////////////////////////////////////

func main() {
	// Step 1: Create Genesis Block
	genesis := createGenesisBlock()
	Blockchain = append(Blockchain, genesis)

	// Step 2: Launch HTTP API server
	go runServer()

	// Keep program running
	select {}
}
