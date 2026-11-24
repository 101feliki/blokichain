import React, { useCallback, useEffect, useState } from "react";
import Poll from "./components/Poll";
import AdminPanel from "./components/AdminPanel";
import WalletConnector from "./components/WalletConnector";
import { getReadContract, isDeployed, loadPolls, readableError } from "./contract";

function App() {
  const [polls, setPolls] = useState([]);
  const [account, setAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isDeployed) return;
    setLoading(true);
    try {
      setPolls(await loadPolls());
      setError("");
    } catch (err) {
      setError(readableError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Admin status comes from the contract's ADMIN_ROLE, not a hard-coded list.
  useEffect(() => {
    if (!account || !isDeployed) return setIsAdmin(false);
    getReadContract()
      .isAdmin(account)
      .then(setIsAdmin)
      .catch(() => setIsAdmin(false));
  }, [account]);

  if (!isDeployed) {
    return (
      <main className="container">
        <h1>Blokichain</h1>
        <p className="error">
          No contract found. Run <code>npm run deploy:local</code> in the <code>Contracts</code> folder first.
        </p>
      </main>
    );
  }

  return (
    <main className="container">
      <header className="header">
        <h1>Blokichain</h1>
        <WalletConnector account={account} onConnect={setAccount} />
      </header>

      {isAdmin && <AdminPanel onChange={refresh} />}

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading polls...</p>}
      {!loading && polls.length === 0 && <p>No polls yet.</p>}

      <section className="polls">
        {polls.map((poll) => (
          <Poll key={poll.id} poll={poll} account={account} onVoted={refresh} />
        ))}
      </section>
    </main>
  );
}

export default App;
