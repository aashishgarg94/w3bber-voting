# w3bber-voting

Decentralized rating and voting platform for the Internet built on the **Solana** blockchain.

![Solana + Anchor](https://img.shields.io/badge/Solana-Anchor-blueviolet)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Hackathon 2023](https://img.shields.io/badge/Solana%20Global%20Hackathon-4th%20Place-orange)

w3bber‑voting is an on‑chain rating layer: anyone can create a poll, cast a stake‑weighted vote, and reveal tamper‑proof results that any website/app can reference.

---

## Table of Contents
- [Overview](#-overview)
- [Architecture](#-architecture)
- [Key On‑Chain Instructions](#-key-on-chain-instructions)
- [Quick Start](#-quick-start)
- [Example Client Usage](#-example-client-usage)
- [Directory Layout](#-directory-layout)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🚀 Overview

- **On‑chain trust for ratings** across domains, apps, and communities.  
- Built with **Anchor** for clean Solana programs and IDLs.  
- **Stake‑weighted voting** to discourage spam/Sybil behavior.  
- Transparent, auditable, and inexpensive at Solana scale.

---

## 🧱 Architecture

- **Program (smart contract):** Rust + Anchor (under `programs/w3bber-voting/`).  
- **Client:** Lightweight TypeScript helpers and Anchor client calls.  
- **Migrations/Deploy:** Anchor `migrations/deploy.ts`.  
- **Tests:** Anchor Mocha/TS tests to validate program flows.

> _Note:_ Program ID and cluster can be configured via Anchor/CLI as usual when deploying.

---

## 🧩 Key On‑Chain Instructions

From `programs/w3bber-voting/src/lib.rs` and `src/instructions/*`:

- `create_poll` — initialize a new poll (title/metadata).  
- `update_poll_data` — update poll metadata.  
- `cancel_poll` — cancel an active poll.  
- `create_voter` — register a voter account.  
- `create_vote` — cast a vote with optional token stake/weight.  
- `update_vote` — modify a previously cast vote (while open).  
- `reveal_poll` — finalize and reveal results.

All instruction handlers are defined in `src/instructions/*.rs`, with shared state in `src/state`.

---

## ⚡ Quick Start

### Prerequisites
- **Rust + Cargo**
- **Solana CLI** (`solana --version`)
- **Anchor CLI** (`anchor --version`)
- **Node.js** (with Yarn or npm)

### Build & Deploy (local validator)

```bash
# 1) Start a local validator (in a separate terminal)
solana-test-validator

# 2) Build the Anchor program
anchor build

# 3) Deploy (uses Anchor.toml config & local validator by default)
anchor deploy
```

### Run Tests

```bash
anchor test
```

> If you’re on a fresh local validator, you may need an airdrop:  
> `solana airdrop 2`

---

## 🧪 Example Client Usage

```ts
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { W3bberVoting } from "../target/types/w3bber_voting";

// Set provider (local or custom cluster)
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.W3bberVoting as Program<W3bberVoting>;

// 1) Create a poll
await program.methods
  .createPoll("Rate this website")
  .rpc();

// 2) Cast a vote (1–5) with optional stake-weighting
await program.methods
  .createVote("5", new anchor.BN(1)) // e.g., "5" stars, stake = 1
  .rpc();

// 3) Reveal results when ready
await program.methods
  .revealPoll( /* optional args */ )
  .rpc();
```

> The actual accounts/PDAs, seeds, and parameters should match the instruction definitions in the program’s IDL (`target/idl/w3bber_voting.json`).

---

## 🗂️ Directory Layout

```
w3bber-voting/
│
├── programs/
│   └── w3bber-voting/        # Anchor program (Rust)
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs
│           ├── instructions/
│           └── state/
│
├── migrations/               # Deploy scripts (Anchor)
├── tests/                    # Anchor tests (TypeScript)
└── (client / app)            # Optional UI or TS helpers
```

---

## 🗺️ Roadmap

- [ ] Website plug‑in / widget for attaching ratings to domains.  
- [ ] Cross‑site identity + reputation.  
- [ ] DAO‑style governance for poll management.  
- [ ] Mobile wallet UX & deep links.

---

## 🤝 Contributing

1. **Fork** the repository  
2. **Create** a feature branch  
3. **Commit** changes with clear messages  
4. **Open** a Pull Request (describe your changes and testing steps)

---

## 📜 License

MIT © 2023–2025 Aashish Garg

---

## 🙌 Acknowledgements

- Built with the **Anchor** framework on **Solana**  
- **Solana Global Hackathon 2023** — *4th place* 🏆  
- Thanks to the community for feedback and tooling
