// controllers/adminController.js
module.exports = (contract) => ({
  createPoll: async (req, res) => {
    try {
      const { question, options, durationHours } = req.body;
      const tx = await contract
        .connect(getSigner(req.walletAddress))
        .createPoll(question, options, durationHours);
      
      await tx.wait();
      res.json({ success: true, txHash: tx.hash });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  endPoll: async (req, res) => {
    try {
      const tx = await contract
        .connect(getSigner(req.walletAddress))
        .endPoll(req.params.id);
      
      await tx.wait();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
});

function getSigner(walletAddress) {
  return new ethers.Wallet(
    process.env.ADMIN_PRIVATE_KEY,
    contract.provider
  );
}