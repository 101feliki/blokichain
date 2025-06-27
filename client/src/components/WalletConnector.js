import { useState } from 'react';

const WalletConnector = ({ onConnect }) => {
  const [error, setError] = useState('');

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask!");
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      onConnect(accounts[0]);
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (newAccounts) => {
        onConnect(newAccounts[0] || '');
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <button onClick={connectWallet}>
        Connect Wallet
      </button>
      {error && <p className="error">{error}</p>}
      {account && <p>Connected: {account}</p>}
    </div>
  );
};