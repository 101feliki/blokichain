import React, { useEffect, useState } from "react";
import { getReadContract, getWriteContract, readableError } from "../contract";

const Poll = ({ poll, account, onVoted }) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!account) return setHasVoted(false);
    getReadContract()
      .hasVoted(account, poll.id)
      .then(setHasVoted)
      .catch(() => {});
  }, [account, poll.id]);

  const vote = async (option) => {
    setBusy(true);
    setError("");
    try {
      const contract = await getWriteContract();
      const tx = await contract.vote(poll.id, option);
      await tx.wait();
      setHasVoted(true);
      onVoted?.();
    } catch (err) {
      setError(readableError(err));
    } finally {
      setBusy(false);
    }
  };

  const canVote = account && poll.isOpen && !hasVoted && !busy;

  return (
    <article className="poll">
      <div className="poll-head">
        <h3>{poll.question}</h3>
        <span className={poll.isOpen ? "status open" : "status closed"}>{poll.isOpen ? "Open" : "Closed"}</span>
      </div>
      <p className="muted">
        {poll.totalVotes} vote{poll.totalVotes === 1 ? "" : "s"} · ends {new Date(poll.endTime).toLocaleString()}
      </p>

      <ul className="options">
        {poll.options.map((option, i) => {
          const pct = poll.totalVotes ? Math.round((poll.results[i] / poll.totalVotes) * 100) : 0;
          return (
            <li key={i}>
              <div className="bar" style={{ width: `${pct}%` }} />
              <span className="label">
                {option} <strong>{pct}%</strong> ({poll.results[i]})
              </span>
              {canVote && (
                <button className="small" onClick={() => vote(i)}>
                  Vote
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {!account && poll.isOpen && <p className="muted">Connect your wallet to vote.</p>}
      {hasVoted && <p className="muted">You have voted in this poll.</p>}
      {busy && <p className="muted">Waiting for confirmation...</p>}
      {error && <p className="error">{error}</p>}
    </article>
  );
};

export default Poll;
