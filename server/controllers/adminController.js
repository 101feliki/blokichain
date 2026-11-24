// Admin actions signed by the server's ADMIN_PRIVATE_KEY wallet.
// Admins can also do these directly from the client with MetaMask.
module.exports = (contract) => {
  const ensureSigner = (res) => {
    if (!contract) {
      res.status(503).json({ error: "ADMIN_PRIVATE_KEY is not set on the server" });
      return false;
    }
    return true;
  };

  return {
    createPoll: async (req, res, next) => {
      if (!ensureSigner(res)) return;
      try {
        const { question, options, durationHours } = req.body || {};
        if (!question || !Array.isArray(options) || options.length < 2 || !(durationHours > 0)) {
          return res.status(400).json({ error: "question, options (2+) and durationHours (> 0) are required" });
        }
        const tx = await contract.createPoll(question, options, durationHours);
        await tx.wait();
        res.status(201).json({ success: true, txHash: tx.hash });
      } catch (err) {
        next(err);
      }
    },

    endPoll: async (req, res, next) => {
      if (!ensureSigner(res)) return;
      try {
        const tx = await contract.endPoll(Number(req.params.id));
        await tx.wait();
        res.json({ success: true, txHash: tx.hash });
      } catch (err) {
        next(err);
      }
    },
  };
};
