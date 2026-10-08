# ⚡ Solana BPF Loader Universal Smart Contract Indexer & Radar

> **L-Kunnach L-Kbir d Solana**: The absolute Single Source of Truth for all 75,500+ smart contracts deployed on the Solana blockchain.

---

## 🌟 The Core Architecture

In Solana's execution runtime, smart contracts cannot be deployed into thin air. Every deployed smart contract is an account on-chain whose owner (`program.owner`) is strictly mandated by the runtime to be the **BPF Upgradeable Loader**:

```
BPFLoaderUpgradeab1e11111111111111111111111
```

By querying the Solana Mainnet Beta RPC via a single `getProgramAccounts` invocation filtered with `{ dataSize: 36 }`, you retrieve every Program account registered across Solana's entire history:

- **Total Lifetime Deployed Programs**: `75,510+` smart contracts
- **Data Size Constraint**: `36 Bytes` (4 bytes Program state enum + 32 bytes ProgramData account public key)

---

## 🛡️ The 3-Tier Sieve (Filtering Signal from Noise)

Out of 75,510+ smart contracts, over 90% are abandoned student homework, dead hackathon experiments, or ephemeral scam bots.

This indexer implements a 3-step verification sieve:

1. **Jupiter Commercial Registry**:
   Cross-references with `https://api.jup.ag/swap/v1/program-id-to-label` to isolate contracts with verified trading liquidity, routing integrations, and active automated market makers (Raydium, Pump.fun, Orca, Meteora, Sanctum, etc.).

2. **Anchor IDL PDA Verification**:
   Derives the canonical Anchor IDL Program Derived Address:
   ```javascript
   const [idlPda] = PublicKey.findProgramAddressSync(
     [Buffer.from("anchor:idl"), programId.toBuffer()],
     programId
   );
   ```
   If this PDA exists and contains schema byte data on-chain, the program is a structured, production-grade protocol.

3. **Live 48-Hour RPC Signatures**:
   Queries `getSignaturesForAddress` to distinguish currently active protocols from dormant contracts.

---

## 🚀 Quick Start

### Installation
```bash
git clone https://github.com/elyousfired/solana-bpf-indexer.git
cd solana-bpf-indexer
npm install
npm start
```

Open `http://localhost:3006` in your browser.

---

## 📡 API Endpoints

- `GET /api/bpf/stats`: Total BPF registered programs and architecture constants.
- `GET /api/bpf/catalog?filter=all&search=...`: Searchable, paginated directory of verified commercial protocols.
- `GET /api/bpf/inspect?programId=...`: Real-time on-chain inspection of any Solana Program address (verifies BPFLoader ownership, derives Anchor IDL PDA, returns recent transaction stream).
- `GET /api/bpf/jupiter-labels`: Live dictionary of Jupiter commercial protocol mappings.

---

## 📜 License
MIT
