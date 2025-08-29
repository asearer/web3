import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import NFTAbi from "./abi/NFTRandomizer.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_RANDOM_NFT_ADDRESS;

export default function App() {
    // MetaMask / blockchain state
    const [_provider, setProvider] = useState(null); // currently unused but kept for dev/debug
    const [_signer, setSigner] = useState(null);     // same as above
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);

    // NFT minting state
    const [salt, setSalt] = useState("12345"); // selected salt for minting
    const [_traits, setTraits] = useState(null); // unused, reserved for preview details
    const [_previewUri, setPreviewUri] = useState(""); // unused, reserved for preview display
    const [myTokens, setMyTokens] = useState([]);

    // Gallery previews
    const [galleryPreviews, setGalleryPreviews] = useState([]); // array of {salt, svg, traits}

    // -----------------------------
    // Connect MetaMask and set contract
    // -----------------------------
    const connect = async () => {
        if (!window.ethereum) return alert("Install MetaMask.");
        const p = new BrowserProvider(window.ethereum);
        await p.send("eth_requestAccounts", []);
        const s = await p.getSigner();
        setProvider(p);
        setSigner(s);

        const c = new Contract(CONTRACT_ADDRESS, NFTAbi.abi, s);
        setContract(c);
        const addr = await s.getAddress();
        setAccount(addr);

        // Production: fetch all tokens owned by this account
        try {
            const balance = await c.balanceOf(addr);
            const tokens = [];
            for (let i = 0; i < balance; i++) {
                const tokenId = await c.tokenOfOwnerByIndex(addr, i);
                tokens.push(tokenId.toString());
            }
            setMyTokens(tokens);
        } catch (err) {
            console.warn("Auto-fetch owned tokens failed:", err);
        }
    };

    // -----------------------------
    // Generate single preview
    // -----------------------------
    const generatePreview = async (randomSalt = null) => {
        if (!contract || !account) return null;
        const s = randomSalt ?? BigInt(Math.floor(Math.random() * 1_000_000));
        const preview = await contract.previewTraits(account, s);
        const svg = await contract.previewSVG(account, s);
        return {
            salt: s.toString(),
            svg,
            traits: {
                colorIdx: Number(preview[0].toString()),
                shapeIdx: Number(preview[1].toString()),
                rarity: Number(preview[2].toString()),
            },
        };
    };

    // -----------------------------
    // Generate gallery of previews
    // -----------------------------
    const generateGallery = async (count = 5) => {
        const previews = [];
        for (let i = 0; i < count; i++) {
            const p = await generatePreview();
            previews.push(p);
        }
        setGalleryPreviews(previews);
    };

    // -----------------------------
    // Mint NFT using selected salt
    // -----------------------------
    const mint = async (mintSalt) => {
        if (!contract) return;
        const s = BigInt(mintSalt || salt);

        const tx = await contract.mint(s, { value: 0 }); // production: set value if mintPrice > 0
        const receipt = await tx.wait();

        const transferEvent = receipt.events.find((e) => e.event === "Transfer");
        const tokenId = transferEvent ? transferEvent.args.tokenId.toString() : null;
        if (tokenId) setMyTokens((p) => [...p, tokenId]);
    };

    // -----------------------------
    // Select a gallery preview
    // -----------------------------
    const selectPreview = (preview) => {
        setSalt(preview.salt);
        setPreviewUri(preview.svg);
        setTraits(preview.traits);
    };

    // Generate gallery on load
    useEffect(() => {
        if (contract && account) generateGallery(6); // generate 6 previews
    }, [contract, account]);

    return (
        <div style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
            <h1>Random On-Chain NFT Gallery (Demo)</h1>

            {!account ? (
                <button onClick={connect}>Connect MetaMask</button>
            ) : (
                <div>
                    <p><strong>Account:</strong> {account}</p>
                </div>
            )}

            <section style={{ marginTop: 20 }}>
                <h2>Preview Gallery</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 120px)", gap: 12 }}>
                    {galleryPreviews.map((p, idx) => (
                        <div
                            key={idx}
                            style={{
                                border: salt === p.salt ? "2px solid #4caf50" : "1px solid #ddd",
                                borderRadius: 8,
                                padding: 4,
                                cursor: "pointer",
                            }}
                            onClick={() => selectPreview(p)}
                            title={`Salt: ${p.salt}`}
                        >
                            <img src={p.svg} alt={`preview-${idx}`} style={{ width: 120, height: 120, borderRadius: 6 }} />
                            <small>Rarity: {p.traits.rarity}/100</small>
                        </div>
                    ))}
                </div>
                <button onClick={() => generateGallery(6)} style={{ marginTop: 8 }}>Regenerate Previews</button>
            </section>

            <section style={{ marginTop: 20 }}>
                <h2>Mint Selected</h2>
                <p>Selected Salt: {salt}</p>
                <button onClick={() => mint(salt)} disabled={!account || !salt}>Mint NFT</button>
            </section>

            <section style={{ marginTop: 20 }}>
                <h2>My Mints (this session)</h2>
                {myTokens.length === 0 ? <p>No tokens minted yet.</p> : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 180px)", gap: 12 }}>
                        {myTokens.map((id) => <TokenCard key={id} id={id} contract={contract} />)}
                    </div>
                )}
            </section>
        </div>
    );
}

function TokenCard({ id, contract }) {
    const [img, setImg] = useState("");

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const uri = await contract.tokenURI(Number(id));
                const payload = uri.split(",")[1];
                const json = atob(payload);
                const data = JSON.parse(json);
                if (mounted) setImg(data.image);
            } catch (err) {
                console.error(err);
            }
        })();
        return () => { mounted = false; };
    }, [id, contract]);

    return (
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>#{id}</div>
            {img ? <img src={img} alt={`#${id}`} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 6 }} /> : "Loading..."}
        </div>
    );
}


