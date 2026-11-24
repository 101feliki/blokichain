import React, { useState } from "react";
import { getWriteContract, readableError } from "../contract";

const AdminPanel = ({ onChange }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [hours, setHours] = useState(24);
  const [endId, setEndId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const run = async (action, success) => {
    setBusy(true);
    setMessage("");
    try {
      const contract = await getWriteContract();
      const tx = await action(contract);
      await tx.wait();
      setMessage(success);
      onChange?.();
      return true;
    } catch (err) {
      setMessage(readableError(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const createPoll = async (e) => {
    e.preventDefault();
    const cleaned = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || cleaned.length < 2) return setMessage("Add a question and at least 2 options.");
    const ok = await run((c) => c.createPoll(question.trim(), cleaned, Number(hours)), "Poll created.");
    if (ok) {
      setQuestion("");
      setOptions(["", ""]);
    }
  };

  const endPoll = (e) => {
    e.preventDefault();
    if (endId === "") return;
    run((c) => c.endPoll(Number(endId)), `Poll ${endId} ended.`);
  };

  return (
    <section className="admin">
      <h2>Admin panel</h2>
      <form onSubmit={createPoll}>
        <input placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
        {options.map((opt, i) => (
          <input
            key={i}
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) => setOptions(options.map((o, j) => (j === i ? e.target.value : o)))}
          />
        ))}
        <div className="row">
          <button type="button" className="secondary" onClick={() => setOptions([...options, ""])}>
            Add option
          </button>
          <label>
            Duration (hours)
            <input type="number" min="1" value={hours} onChange={(e) => setHours(e.target.value)} />
          </label>
          <button type="submit" disabled={busy}>
            Create poll
          </button>
        </div>
      </form>

      <form onSubmit={endPoll} className="row">
        <input type="number" min="0" placeholder="Poll ID" value={endId} onChange={(e) => setEndId(e.target.value)} />
        <button type="submit" className="secondary" disabled={busy}>
          End poll
        </button>
      </form>

      {message && <p className="muted">{message}</p>}
    </section>
  );
};

export default AdminPanel;
