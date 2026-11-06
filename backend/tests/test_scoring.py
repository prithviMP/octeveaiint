import pytest

from app.services.scoring_service import calculate_percentage, performance_band


@pytest.mark.parametrize(
    ("percentage", "level"),
    [
        (100, "Excellent"),
        (90, "Excellent"),
        (89.99, "Good"),
        (75, "Good"),
        (74.99, "Average"),
        (50, "Average"),
        (49.99, "Needs improvement"),
        (0, "Needs improvement"),
    ],
)
def test_performance_bands(percentage, level):
    assert performance_band(percentage).level == level


@pytest.mark.parametrize(
    ("correct", "total", "expected"),
    [(8, 10, 80.0), (2, 3, 66.67), (0, 5, 0.0), (0, 0, 0.0)],
)
def test_calculate_percentage(correct, total, expected):
    assert calculate_percentage(correct, total) == expected
