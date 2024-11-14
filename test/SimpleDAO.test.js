const SimpleDAO = artifacts.require("SimpleDAO");
const truffleAssert = require('truffle-assertions');
const { BN, time } = require('@openzeppelin/test-helpers');

contract("SimpleDAO", function (accounts) {
  const [owner, member1, member2, nonMember, recipient] = accounts;
  let dao;

  beforeEach(async () => {
    dao = await SimpleDAO.new();
    // Add members
    await dao.addMember(member1, { from: owner });
    await dao.addMember(member2, { from: owner });
  });

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      const contractOwner = await dao.owner();
      assert.equal(contractOwner, owner, "Owner not set correctly");
    });

    it("Should make owner a member", async () => {
      const isOwnerMember = await dao.members(owner);
      assert.equal(isOwnerMember, true, "Owner should be a member");
    });

    it("Should set correct initial member count", async () => {
      const memberCount = await dao.memberCount();
      assert.equal(memberCount.toNumber(), 3, "Initial member count should be 3");
    });
  });

  describe("Member Management", () => {
    it("Should allow owner to add members", async () => {
      await dao.addMember(nonMember, { from: owner });
      const isMember = await dao.members(nonMember);
      assert.equal(isMember, true, "Member should be added");
    });

    it("Should prevent adding duplicate members", async () => {
      await truffleAssert.reverts(
        dao.addMember(member1, { from: owner }),
        "Already a member"
      );
    });

    it("Should prevent non-owner from adding members", async () => {
      await truffleAssert.reverts(
        dao.addMember(nonMember, { from: member1 }),
        "Not the contract owner"
      );
    });
  });

  describe("Proposal Creation and Voting", () => {
    const proposalDescription = "Test Proposal";
    const proposalAmount = web3.utils.toWei("1", "ether");

    beforeEach(async () => {
      // Fund the DAO
      await web3.eth.sendTransaction({
        from: owner,
        to: dao.address,
        value: web3.utils.toWei("10", "ether")
      });
    });

    it("Should allow members to create proposals", async () => {
      await dao.createProposal(
        proposalDescription,
        proposalAmount,
        recipient,
        { from: member1 }
      );

      const proposal = await dao.proposals(0);
      assert.equal(proposal.description, proposalDescription);
      assert.equal(proposal.amount, proposalAmount);
      assert.equal(proposal.recipient, recipient);
      assert.equal(proposal.executed, false);
    });

    it("Should prevent non-members from creating proposals", async () => {
      await truffleAssert.reverts(
        dao.createProposal(
          proposalDescription,
          proposalAmount,
          recipient,
          { from: nonMember }
        ),
        "Not a DAO member"
      );
    });

    it("Should allow members to vote on proposals", async () => {
      await dao.createProposal(
        proposalDescription,
        proposalAmount,
        recipient,
        { from: member1 }
      );

      await dao.voteOnProposal(0, true, { from: member2 });
      const votes = await dao.proposalVotes(0);
      assert.equal(votes[0].toNumber(), 1, "For votes should be 1");
      assert.equal(votes[1].toNumber(), 0, "Against votes should be 0");
    });

    it("Should prevent double voting", async () => {
      await dao.createProposal(
        proposalDescription,
        proposalAmount,
        recipient,
        { from: member1 }
      );

      await dao.voteOnProposal(0, true, { from: member2 });
      await truffleAssert.reverts(
        dao.voteOnProposal(0, true, { from: member2 }),
        "Already voted"
      );
    });
  });

  describe("Proposal Execution", () => {
    const proposalAmount = web3.utils.toWei("1", "ether");

    beforeEach(async () => {
      // Fund the DAO
      await web3.eth.sendTransaction({
        from: owner,
        to: dao.address,
        value: web3.utils.toWei("10", "ether")
      });

      // Create a proposal
      await dao.createProposal(
        "Test Proposal",
        proposalAmount,
        recipient,
        { from: member1 }
      );
    });

    it("Should execute successful proposals", async () => {
      await dao.voteOnProposal(0, true, { from: owner });
      await dao.voteOnProposal(0, true, { from: member1 });

      // Fast forward time by 3 days
      await time.increase(time.duration.days(3));

      const recipientInitialBalance = new BN(await web3.eth.getBalance(recipient));
      await dao.executeProposal(0);
      const recipientFinalBalance = new BN(await web3.eth.getBalance(recipient));

      assert.equal(
        recipientFinalBalance.sub(recipientInitialBalance).toString(),
        proposalAmount,
        "Transfer amount incorrect"
      );
    });

    it("Should not execute proposals during voting period", async () => {
      await dao.voteOnProposal(0, true, { from: owner });
      await dao.voteOnProposal(0, true, { from: member1 });

      await truffleAssert.reverts(
        dao.executeProposal(0),
        "Voting is still ongoing"
      );
    });

    it("Should not execute failed proposals", async () => {
      await dao.voteOnProposal(0, false, { from: owner });
      await dao.voteOnProposal(0, false, { from: member1 });
      
      await time.increase(time.duration.days(3));

      await truffleAssert.reverts(
        dao.executeProposal(0),
        "Proposal did not pass"
      );
    });

    it("Should not execute proposals twice", async () => {
      await dao.voteOnProposal(0, true, { from: owner });
      await dao.voteOnProposal(0, true, { from: member1 });
      
      await time.increase(time.duration.days(3));

      await dao.executeProposal(0);

      await truffleAssert.reverts(
        dao.executeProposal(0),
        "Proposal already executed"
      );
    });
  });
}); 