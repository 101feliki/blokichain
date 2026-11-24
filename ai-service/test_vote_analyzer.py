import pytest

from analysis.vote_analyzer import analyze


def test_empty_poll():
    a = analyze([0, 0, 0])
    assert a.total_votes == 0 and not a.is_anomaly


def test_normal_poll_not_flagged():
    a = analyze([40, 35, 25])
    assert a.percentages == [40.0, 35.0, 25.0]
    assert a.leader_index == 0
    assert not a.is_anomaly


def test_landslide_flagged():
    assert analyze([95, 3, 2]).is_anomaly


def test_too_even_flagged():
    assert analyze([30, 30, 30]).is_anomaly


def test_vote_count_drop_flagged():
    assert analyze([10, 10], previous=[12, 10]).is_anomaly


def test_bad_input():
    with pytest.raises(ValueError):
        analyze([1, -2])
