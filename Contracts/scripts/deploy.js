// Deploys VotingSystem and writes the ABI + address for the client and server.
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const Voting = await hre.ethers.getContractFactory("VotingSystem");
  const voting = await Voting.deploy();
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log(`VotingSystem deployed to: ${address}`);

  // Optional extra admin, e.g. EXTRA_ADMIN=0xabc... npx hardhat run ...
  if (process.env.EXTRA_ADMIN) {
    const tx = await voting.addAdmin(process.env.EXTRA_ADMIN);
    await tx.wait();
    console.log(`Admin role granted to ${process.env.EXTRA_ADMIN}`);
  }

  const artifact = await hre.artifacts.readArtifact("VotingSystem");
  const output = JSON.stringify(
    { address, network: hre.network.name, abi: artifact.abi },
    null,
    2
  );

  const targets = [
    path.join(__dirname, "..", "..", "client", "src", "contracts", "Voting.json"),
    path.join(__dirname, "..", "..", "server", "contracts", "Voting.json"),
  ];
  for (const file of targets) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, output);
    console.log(`Wrote ${path.relative(process.cwd(), file)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
