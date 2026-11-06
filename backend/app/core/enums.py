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


class QuestionSource(StrEnum):
    BANK = "bank"
    AI = "ai"


class SessionQuestionSource(StrEnum):
    AI = "ai"
    MIXED = "mixed"
    BANK = "bank"


class EvaluationSource(StrEnum):
    AI = "ai"
    RULE_BASED = "rule_based"


class SessionStatus(StrEnum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
