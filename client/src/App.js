import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Poll from './components/Poll';
import AdminPanel from './components/AdminPanel';
import WalletConnector from './components/WalletConnector';

function App() {
  const [polls, setPolls] = useState([]);
  const [account, setAccount] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = async (address) => {
    // In a real app, you'd call your backend to verify admin status
    const admins = ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'];
    setIsAdmin(admins.includes(address));
  };

  return (
    <div>
      <WalletConnector 
        onConnect={(address) => {
          setAccount(address);
          checkAdminStatus(address);
        }} 
      />
      
      {isAdmin && <AdminPanel account={account} />}
      
      <div className="polls">
        {polls.map(poll => (
          <Poll key={poll.id} {...poll} account={account} />
        ))}
      </div>
    </div>
  );
}