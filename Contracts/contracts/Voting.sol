// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title VotingSystem
/// @notice Admin-created polls with one vote per wallet per poll.
contract VotingSystem is Ownable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Poll {
        string question;
        string[] options;
        mapping(uint256 => uint256) votes;
        address creator;
        bool isActive;
        uint256 endTime;
        uint256 totalVotes;
    }

    Poll[] private polls;
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    event PollCreated(uint256 indexed pollId, string question, uint256 endTime);
    event VoteCast(uint256 indexed pollId, uint256 option, address indexed voter);
    event PollEnded(uint256 indexed pollId);

    error PollNotFound(uint256 pollId);
    error PollClosed(uint256 pollId);
    error InvalidOption(uint256 option);
    error AlreadyVoted(address voter, uint256 pollId);
    error InvalidPoll(string reason);

    modifier pollExists(uint256 _pollId) {
        if (_pollId >= polls.length) revert PollNotFound(_pollId);
        _;
    }

    constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function createPoll(
        string memory _question,
        string[] memory _options,
        uint256 _durationHours
    ) external onlyRole(ADMIN_ROLE) returns (uint256 pollId) {
        if (bytes(_question).length == 0) revert InvalidPoll("empty question");
        if (_options.length < 2) revert InvalidPoll("need at least 2 options");
        if (_durationHours == 0) revert InvalidPoll("duration must be > 0");

        pollId = polls.length;
        Poll storage newPoll = polls.push();
        newPoll.question = _question;
        newPoll.options = _options;
        newPoll.creator = msg.sender;
        newPoll.isActive = true;
        newPoll.endTime = block.timestamp + (_durationHours * 1 hours);

        emit PollCreated(pollId, _question, newPoll.endTime);
    }

    function vote(uint256 _pollId, uint256 _option) external pollExists(_pollId) {
        Poll storage poll = polls[_pollId];
        if (!poll.isActive || block.timestamp >= poll.endTime) revert PollClosed(_pollId);
        if (_option >= poll.options.length) revert InvalidOption(_option);
        if (hasVoted[msg.sender][_pollId]) revert AlreadyVoted(msg.sender, _pollId);

        hasVoted[msg.sender][_pollId] = true;
        poll.votes[_option]++;
        poll.totalVotes++;
        emit VoteCast(_pollId, _option, msg.sender);
    }

    function endPoll(uint256 _pollId) external onlyRole(ADMIN_ROLE) pollExists(_pollId) {
        polls[_pollId].isActive = false;
        emit PollEnded(_pollId);
    }

    function addAdmin(address _admin) external onlyOwner {
        _grantRole(ADMIN_ROLE, _admin);
    }

    function removeAdmin(address _admin) external onlyOwner {
        _revokeRole(ADMIN_ROLE, _admin);
    }

    // ---------- Views ----------

    function pollCount() external view returns (uint256) {
        return polls.length;
    }

    function getPoll(uint256 _pollId)
        external
        view
        pollExists(_pollId)
        returns (
            string memory question,
            string[] memory options,
            address creator,
            bool isOpen,
            uint256 endTime,
            uint256 totalVotes
        )
    {
        Poll storage poll = polls[_pollId];
        return (
            poll.question,
            poll.options,
            poll.creator,
            poll.isActive && block.timestamp < poll.endTime,
            poll.endTime,
            poll.totalVotes
        );
    }

    function getPollResults(uint256 _pollId) external view pollExists(_pollId) returns (uint256[] memory results) {
        Poll storage poll = polls[_pollId];
        results = new uint256[](poll.options.length);
        for (uint256 i = 0; i < poll.options.length; i++) {
            results[i] = poll.votes[i];
        }
    }

    function isAdmin(address _account) external view returns (bool) {
        return hasRole(ADMIN_ROLE, _account);
    }
}
