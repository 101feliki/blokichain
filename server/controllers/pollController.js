const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:5001";

const toPoll = (id, p) => ({
  id,
  question: p.question,
  options: [...p.options],
  creator: p.creator,
  isOpen: p.isOpen,
  endTime: new Date(Number(p.endTime) * 1000).toISOString(),
  totalVotes: Number(p.totalVotes),
});

const parseId = (req) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 0) {
    const err = new Error("Poll id must be a non-negative integer");
    err.status = 400;
    throw err;
  }
  return id;
};

module.exports = (contract) => {
  const loadPoll = async (id) => toPoll(id, await contract.getPoll(id));
  const loadResults = async (id) => (await contract.getPollResults(id)).map(Number);

  return {
    listPolls: async (_req, res, next) => {
      try {
        const count = Number(await contract.pollCount());
        const polls = await Promise.all([...Array(count).keys()].map(loadPoll));
        res.json(polls.reverse());
      } catch (err) {
        next(err);
      }
    },

    getPoll: async (req, res, next) => {
      try {
        res.json(await loadPoll(parseId(req)));
      } catch (err) {
        next(err);
      }
    },

    getResults: async (req, res, next) => {
      try {
        const id = parseId(req);
        const [poll, results] = await Promise.all([loadPoll(id), loadResults(id)]);
        res.json({ ...poll, results: poll.options.map((option, i) => ({ option, votes: results[i] })) });
      } catch (err) {
        next(err);
      }
    },

    getAnalysis: async (req, res, next) => {
      try {
        const id = parseId(req);
        const results = await loadResults(id);
        const { data } = await axios.post(`${AI_SERVICE_URL}/analyze`, { results }, { timeout: 5000 });
        res.json({ pollId: id, ...data });
      } catch (err) {
        if (err.code === "ECONNREFUSED") {
          err.status = 503;
          err.message = "AI service is not running";
        }
        next(err);
      }
    },
  };
};
