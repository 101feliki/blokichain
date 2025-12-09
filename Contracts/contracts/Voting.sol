// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract VotingSystem is Ownable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    struct Poll {
        string question;
        string[] options;
        mapping(uint => uint) votes;
        address creator;
        bool isActive;
        uint endTime;
    }
    
    Poll[] public polls;
    mapping(address => mapping(uint => bool)) public hasVoted;
    
    event PollCreated(uint pollId);
    event VoteCast(uint pollId, uint option);
    event PollEnded(uint pollId);
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }
    
    function createPoll(
        string memory _question, 
        string[] memory _options,
        uint _durationHours
    ) public onlyRole(ADMIN_ROLE) {
        uint pollId = polls.length;
        Poll storage newPoll = polls.push();
        newPoll.question = _question;
        newPoll.options = _options;
        newPoll.creator = msg.sender;
        newPoll.isActive = true;
        newPoll.endTime = block.timestamp + (_durationHours * 1 hours);
        
        emit PollCreated(pollId);
    }
    
    function vote(uint _pollId, uint _option) public {
        require(polls[_pollId].isActive, "Poll is not active");
        require(block.timestamp < polls[_pollId].endTime, "Poll has ended");
        require(_option < polls[_pollId].options.length, "Invalid option");
        require(!hasVoted[msg.sender][_pollId], "Already voted");
        
        polls[_pollId].votes[_option]++;
        hasVoted[msg.sender][_pollId] = true;
        emit VoteCast(_pollId, _option);
    }
    
    function endPoll(uint _pollId) public onlyRole(ADMIN_ROLE) {
        polls[_pollId].isActive = false;
        emit PollEnded(_pollId);
    }
    
    function getPollResults(uint _pollId) public view returns (uint[] memory) {
        uint[] memory results = new uint[](polls[_pollId].options.length);
        for (uint i = 0; i < polls[_pollId].options.length; i++) {
            results[i] = polls[_pollId].votes[i];
        }
        return results;
    }
    
    function addAdmin(address _admin) public onlyOwner {
        grantRole(ADMIN_ROLE, _admin);
    }
}
