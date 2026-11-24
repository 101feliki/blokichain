import React, { useEffect, useState } from "react";

const short = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`;

const WalletConnector = ({ account, onConnect }) => {
  const [error, setError] = useState("");

  useEffect(() => {
    if (!window.ethereum) return;
    const handler = (accounts) => onConnect(accounts[0] || "");
    window.ethereum.on("accountsChanged", handler);
    // Reconnect silently if the site was already authorised.
    window.ethereum.request({ method: "eth_accounts" }).then(handler).catch(() => {});
    return () => window.ethereum.removeListener("accountsChanged", handler);
  }, [onConnect]);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask!");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      onConnect(accounts[0] || "");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="wallet">
      {account ? (
        <span className="badge">Connected: {short(account)}</span>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default WalletConnector;
