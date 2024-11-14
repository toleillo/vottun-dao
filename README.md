# SimpleDAO Smart Contract

A decentralized autonomous organization (DAO) smart contract that enables collective decision-making and fund management on the EVM compatible blockchains .

--------------------------------

Network: Polygon Amoy

TX: [0x7e79c2d1518b85949df25bae5f82840f46fd487176c45e854e8cc6ef9c1d56cf](https://www.oklink.com/amoy/tx/0x7e79c2d1518b85949df25bae5f82840f46fd487176c45e854e8cc6ef9c1d56cf)

Contract: [0xC83B645244912a2eE95EdBcdCfB33666E2C26824] https://www.oklink.com/amoy/address/0xC83B645244912a2eE95EdBcdCfB33666E2C26824

---

### What is SimpleDAO?

SimpleDAO is a secure and transparent implementation of a DAO that allows members to:
- Create and vote on proposals
- Manage collective funds
- Execute approved proposals
- Maintain decentralized governance

### 👥 Membership

- Only approved members can participate
- Each member has equal voting power (one vote per proposal)
- The owner can add new members

### 💰 How Money Works

#### Getting Money In

- Anyone can send money (ETH) to the DAO
- All funds are stored safely in the smart contract 
- The contract keeps track of exactly how much money it has

#### Spending Money
1. A member must create a proposal stating:
   - How much money they want to spend
   - Who should receive the money
   - Why they want to spend it (description)
2. The proposal can't ask for more money than the DAO has

### 🗳️ Voting Process

#### 1. Making a Proposal
- Any member can create a spending proposal
- Each proposal includes:
  - What the money is for
  - How much to spend
  - Who gets the money

#### 2. Voting Period
- Voting lasts for 3 days
- Members can vote either:
  - "Yes" (support)
  - "No" (against)
- Each member can only vote once per proposal
- You can't change your vote after submitting it

#### 3. Winning Requirements
For a proposal to pass and money to be sent:
1. The voting period must be over (3 days)
2. More people must vote "Yes" than "No"
3. The DAO must still have enough money to pay


### ⚠️ Important Notes

- All decisions are final once executed
- You can't cancel your vote
- Proposals can't be changed once created
- The voting period can't be extended
