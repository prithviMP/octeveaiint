from enum import StrEnum


class Difficulty(StrEnum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


class DifficultyFilter(StrEnum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"
    MIXED = "Mixed"


class AnswerOption(StrEnum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"


class SessionStatus(StrEnum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
