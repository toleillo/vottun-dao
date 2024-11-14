// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleDAO {
    struct Proposal {
        address proposer;
        string description;
        uint256 amount;
        address payable recipient;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
        uint256 endTime;
    }

    address public owner;
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => bool) public members;
    mapping(uint256 => mapping(address => bool)) public votes; // Tracks if a member has voted on a proposal

    uint256 public voteDuration = 3 days;
    uint256 public memberCount;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    modifier onlyMember() {
        require(members[msg.sender], "Not a DAO member");
        _;
    }

    constructor() {
        owner = msg.sender;
        members[owner] = true;
        memberCount = 1;
    }

    // Allow the owner to add members to the DAO
    function addMember(address _member) public onlyOwner {
        require(!members[_member], "Already a member");
        members[_member] = true;
        memberCount++;
    }

    // Propose a new action for the DAO, such as transferring funds
    function createProposal(
        string memory _description,
        uint256 _amount,
        address payable _recipient
    ) public onlyMember returns (uint256) {
        require(_amount <= address(this).balance, "Insufficient DAO funds");

        Proposal storage proposal = proposals[proposalCount];
        proposal.proposer = msg.sender;
        proposal.description = _description;
        proposal.amount = _amount;
        proposal.recipient = _recipient;
        proposal.endTime = block.timestamp + voteDuration;

        proposalCount++;
        return proposalCount - 1;
    }

    // Members can vote on proposals
    function voteOnProposal(uint256 _proposalId, bool support) public onlyMember {
        Proposal storage proposal = proposals[_proposalId];

        require(block.timestamp < proposal.endTime, "Voting has ended");
        require(!votes[_proposalId][msg.sender], "Already voted");

        votes[_proposalId][msg.sender] = true;

        if (support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
    }

    // Execute proposal if it passes
    function executeProposal(uint256 _proposalId) public onlyMember {
        Proposal storage proposal = proposals[_proposalId];

        require(block.timestamp >= proposal.endTime, "Voting is still ongoing");
        require(!proposal.executed, "Proposal already executed");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal did not pass");

        proposal.executed = true;
        proposal.recipient.transfer(proposal.amount);
    }

    // Allow the contract to receive funds
    receive() external payable {}

    // Helper functions to check voting results
    function proposalVotes(uint256 _proposalId) public view returns (uint256 forVotes, uint256 againstVotes) {
        Proposal storage proposal = proposals[_proposalId];
        return (proposal.votesFor, proposal.votesAgainst);
    }
}
