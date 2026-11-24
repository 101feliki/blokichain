const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("VotingSystem", function () {
  let voting, owner, voter1, voter2, outsider;

  beforeEach(async function () {
    [owner, voter1, voter2, outsider] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("VotingSystem");
    voting = await Voting.deploy();
    await voting.createPoll("Best language?", ["Go", "TypeScript", "Java"], 24);
  });

  it("creates a poll with its options", async function () {
    expect(await voting.pollCount()).to.equal(1n);
    const poll = await voting.getPoll(0);
    expect(poll.question).to.equal("Best language?");
    expect(poll.options).to.deep.equal(["Go", "TypeScript", "Java"]);
    expect(poll.isOpen).to.equal(true);
  });

  it("counts votes and blocks double voting", async function () {
    await voting.connect(voter1).vote(0, 1);
    await voting.connect(voter2).vote(0, 1);
    expect(await voting.getPollResults(0)).to.deep.equal([0n, 2n, 0n]);
    await expect(voting.connect(voter1).vote(0, 2)).to.be.revertedWithCustomError(voting, "AlreadyVoted");
  });

  it("rejects invalid options and unknown polls", async function () {
    await expect(voting.connect(voter1).vote(0, 9)).to.be.revertedWithCustomError(voting, "InvalidOption");
    await expect(voting.connect(voter1).vote(5, 0)).to.be.revertedWithCustomError(voting, "PollNotFound");
  });

  it("only admins can create and end polls", async function () {
    await expect(voting.connect(outsider).createPoll("Q", ["a", "b"], 1)).to.be.reverted;
    await voting.addAdmin(outsider.address);
    await voting.connect(outsider).createPoll("Q", ["a", "b"], 1);
    expect(await voting.pollCount()).to.equal(2n);
  });

  it("closes voting after endPoll or when time runs out", async function () {
    await voting.endPoll(0);
    await expect(voting.connect(voter1).vote(0, 0)).to.be.revertedWithCustomError(voting, "PollClosed");

    await voting.createPoll("Short poll", ["yes", "no"], 1);
    await time.increase(2 * 60 * 60);
    await expect(voting.connect(voter1).vote(1, 0)).to.be.revertedWithCustomError(voting, "PollClosed");
  });
});
