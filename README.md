Educational project for the course Introduction to Finance. Not a real product, service or investment offer. Do not use with real funds.

# TrueDoc: CertificateRegistry (prototype)

Final Project prototype for the hypothetical startup **TrueDoc**, a blockchain platform where universities issue diploma and certificate hashes and employers verify them in seconds. The startup, clients and data are invented.

## What the prototype does

`CertificateRegistry` is one small Solidity smart contract. For each certificate it stores only four things: the **hash**, the **issuer** address, the **issue date** and the **status**. Certificate files and personal data are never stored on-chain.

| Function | Who can call it | What it does |
| --- | --- | --- |
| `registerUniversity(address)` / `removeUniversity(address)` | Admin | Adds or removes a university account |
| `issue(hash)` | Registered university | Saves the hash, issuer and date (status Valid) |
| `revoke(hash)` | The university that issued it | Sets the status to Revoked |
| `verify(hash)` | Anyone | Returns NotFound, Valid or Revoked (free read, no consensus needed) |
| `pause()` / `unpause()` | Admin | Stops or restarts issuing |

The admin cannot issue certificates. In a real deployment the admin account would be a 2-of-3 multisignature wallet; in this prototype it is a plain test account.

## How to run (local network only)

Requirements: Node.js 18 or newer.

```bash
npm install
npx hardhat test              # runs the 8 unit tests on the local Hardhat Network
npx hardhat run scripts/demo.js   # step-by-step demo of the main use case
```

Everything runs on **Hardhat Network**, a local blockchain on your computer, with test accounts created by the tool. No wallet, key, token or real money is needed. No public testnet was used, so there is no testnet contract address.

## Unit tests

1. A registered university can issue a certificate, and `verify()` shows it as valid.
2. An unregistered account cannot issue.
3. The admin cannot issue certificates.
4. The same hash cannot be issued twice.
5. Only the issuing university can revoke; the status then becomes Revoked.
6. `verify()` returns NotFound for an unknown hash.
7. Issuing stops while the contract is paused and works again after unpause.
8. Only the admin can register universities and pause.

## Demo video

[[demo video link](https://drive.google.com/file/d/1IyiDgEG8UuO-7vNPW8_wrfdEDPMNshKw/view?usp=vids_web)]

## Credits and licences

- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) (`AccessControl`, `Pausable`), MIT licence.
- [Hardhat](https://hardhat.org/), MIT licence.
- AI coding assistant: [name the tool, the exact model and the parts of the code it helped with].

## Safety notes

- Never deploy this to a main network or connect it to real funds.
- Never commit private keys, seed phrases or a `.env` file (`.env` is listed in `.gitignore`).
- Use only invented test data.
