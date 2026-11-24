"""Statistical checks on poll results.

The service only sees vote counts per option, so it looks for distributions
that are unusual for a fair poll: one option taking almost everything,
results that are suspiciously close to perfectly even, or a sudden jump
compared with the previous snapshot of the same poll.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, asdict, field


@dataclass
class Analysis:
    total_votes: int
    percentages: list[float]
    leader_index: int | None
    margin_pct: float
    concentration: float          # Herfindahl index: 1/n (even) .. 1 (one option)
    normalized_entropy: float     # 0 (one option) .. 1 (perfectly even)
    chi_square_p_value: float | None
    flags: list[str] = field(default_factory=list)

    @property
    def is_anomaly(self) -> bool:
        return bool(self.flags)

    def to_dict(self) -> dict:
        d = asdict(self)
        d["is_anomaly"] = self.is_anomaly
        return d


def _chi_square_p_value(results: list[int]) -> float | None:
    """p-value of a chi-square test against an even split (Wilson-Hilferty approximation)."""
    n, k = sum(results), len(results)
    if n == 0 or k < 2:
        return None
    expected = n / k
    chi2 = sum((o - expected) ** 2 / expected for o in results)
    dof = k - 1
    z = ((chi2 / dof) ** (1 / 3) - (1 - 2 / (9 * dof))) / math.sqrt(2 / (9 * dof))
    return round(0.5 * math.erfc(z / math.sqrt(2)), 6)


def analyze(results: list[int], previous: list[int] | None = None, min_votes: int = 20) -> Analysis:
    if not results or any((not isinstance(v, int)) or v < 0 for v in results):
        raise ValueError("results must be a non-empty list of non-negative integers")

    total = sum(results)
    k = len(results)
    if total == 0:
        return Analysis(0, [0.0] * k, None, 0.0, 0.0, 0.0, None, [])

    shares = [v / total for v in results]
    ranked = sorted(range(k), key=lambda i: results[i], reverse=True)
    leader = ranked[0]
    margin = shares[leader] - (shares[ranked[1]] if k > 1 else 0)
    hhi = sum(s * s for s in shares)
    entropy = -sum(s * math.log(s) for s in shares if s > 0) / math.log(k) if k > 1 else 0.0
    p_value = _chi_square_p_value(results)

    flags: list[str] = []
    if total >= min_votes:
        if shares[leader] >= 0.9:
            flags.append("one option has 90%+ of all votes")
        if k > 2 and entropy > 0.999 and max(results) - min(results) <= 1:
            flags.append("results are almost perfectly even, which is rare in real polls")
    if previous and len(previous) == k and sum(previous) > 0:
        new_votes = [c - p for c, p in zip(results, previous)]
        added = sum(new_votes)
        if any(v < 0 for v in new_votes):
            flags.append("vote counts went down since the last snapshot")
        elif added >= min_votes and max(new_votes) / added >= 0.95:
            flags.append("95%+ of new votes since the last snapshot went to one option")

    return Analysis(
        total_votes=total,
        percentages=[round(s * 100, 2) for s in shares],
        leader_index=leader,
        margin_pct=round(margin * 100, 2),
        concentration=round(hhi, 4),
        normalized_entropy=round(entropy, 4),
        chi_square_p_value=p_value,
        flags=flags,
    )
