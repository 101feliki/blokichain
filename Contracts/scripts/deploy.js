// scripts/deploy.js
async function main() {
  const Voting = await ethers.getContractFactory("VotingSystem");
  const voting = await Voting.deploy();
  
  await voting.deployed();
  console.log("Contract deployed to:", voting.address);
  
  // Add initial admin
  await voting.addAdmin("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
}