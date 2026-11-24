import { ethers } from "ethers";
import deployment from "./contracts/Voting.json";

export const isDeployed = Boolean(deployment.address && deployment.abi?.length);

// Read-only access through the user's wallet provider (or a local node if no wallet).
export function getReadContract() {
  const provider = window.ethereum
    ? new ethers.BrowserProvider(window.ethereum)
    : new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8545");
  return new ethers.Contract(deployment.address, deployment.abi, provider);
}

// Write access: transactions are signed in MetaMask.
export async function getWriteContract() {
  if (!window.ethereum) throw new Error("Please install MetaMask!");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(deployment.address, deployment.abi, signer);
}

export async function loadPolls() {
  const contract = getReadContract();
  const count = Number(await contract.pollCount());
  const polls = await Promise.all(
    [...Array(count).keys()].map(async (id) => {
      const [p, results] = await Promise.all([contract.getPoll(id), contract.getPollResults(id)]);
      return {
        id,
        question: p.question,
        options: [...p.options],
        isOpen: p.isOpen,
        endTime: Number(p.endTime) * 1000,
        totalVotes: Number(p.totalVotes),
        results: results.map(Number),
      };
    })
  );
  return polls.reverse();
}

// Turns contract revert data into a readable message.
export function readableError(err) {
  return err?.revert?.name || err?.shortMessage || err?.reason || err?.message || "Transaction failed";
}
