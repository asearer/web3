import { useState } from "react";
import { BrowserProvider, Contract, parseUnits, formatUnits } from "ethers";
import MyTokenAbi from "../../artifacts/contracts/MyToken.sol/MyToken.json";

function App() {
  // -----------------------------
  // State variables
  // -----------------------------
  const [provider, setProvider] = useState(null); // BrowserProvider
  const [signer, setSigner] = useState(null);     // connected signer
  const [contract, setContract] = useState(null); // MyToken contract instance
  const [account, setAccount] = useState(null);   // connected account
  const [balance, setBalance] = useState(0);      // token balance
  const [isOwner, setIsOwner] = useState(false);  // owner check

  // Transfer form state
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // Mint form state
  const [mintTo, setMintTo] = useState("");
  const [mintAmount, setMintAmount] = useState("");

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

  // -----------------------------
  // Connect MetaMask wallet
  // -----------------------------
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const prov = new BrowserProvider(window.ethereum);
        await prov.send("eth_requestAccounts", []); // triggers MetaMask popup
        const signer = await prov.getSigner();
        const account = await signer.getAddress();

        const tokenContract = new Contract(contractAddress, MyTokenAbi.abi, signer);

        setProvider(prov);
        setSigner(signer);
        setContract(tokenContract);
        setAccount(account);

        await updateBalance(tokenContract, account);
        await checkOwner(tokenContract, account);
      } catch (err) {
        console.error(err);
        alert("Failed to connect wallet.");
      }
    } else {
      alert("MetaMask not detected! Please install it.");
    }
  };

  // -----------------------------
  // Update balance
  // -----------------------------
  const updateBalance = async (contract, account) => {
    const bal = await contract.balanceOf(account);
    setBalance(formatUnits(bal, 18));
  };

  // -----------------------------
  // Check if connected account is owner
  // -----------------------------
  const checkOwner = async (contract, account) => {
    const ownerAddress = await contract.owner();
    setIsOwner(ownerAddress.toLowerCase() === account.toLowerCase());
  };

  // -----------------------------
  // Transfer tokens
  // -----------------------------
  const transferTokens = async () => {
    if (!contract) return;
    try {
      const tx = await contract.transfer(
        transferTo,
        parseUnits(transferAmount, 18)
      );
      await tx.wait();
      alert(`Transferred ${transferAmount} MTK to ${transferTo}`);
      updateBalance(contract, account);
    } catch (err) {
      console.error(err);
      alert("Transfer failed!");
    }
  };

  // -----------------------------
  // Mint tokens (owner only)
  // -----------------------------
  const mintTokens = async () => {
    if (!contract) return;
    try {
      const tx = await contract.mint(
        mintTo,
        parseUnits(mintAmount, 18)
      );
      await tx.wait();
      alert(`Minted ${mintAmount} MTK to ${mintTo}`);
      updateBalance(contract, account);
    } catch (err) {
      console.error(err);
      alert("Mint failed. Make sure you are the owner!");
    }
  };

  // -----------------------------
  // JSX UI
  // -----------------------------
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>MyToken dApp</h1>

      {/* Connect Wallet */}
      {!account ? (
        <button onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <div>
          <p><strong>Connected account:</strong> {account}</p>
          <p><strong>Balance:</strong> {balance} MTK</p>

          {/* Transfer Form */}
          <h3>Transfer Tokens</h3>
          <input
            type="text"
            placeholder="Recipient address"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
          <button onClick={transferTokens}>Transfer</button>

          {/* Mint Form (Owner Only) */}
          {isOwner && (
            <>
              <h3>Mint Tokens (Owner Only)</h3>
              <input
                type="text"
                placeholder="Recipient address"
                value={mintTo}
                onChange={(e) => setMintTo(e.target.value)}
              />
              <input
                type="text"
                placeholder="Amount"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
              />
              <button onClick={mintTokens}>Mint</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;




