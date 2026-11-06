import logging
import random
import re
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass

from pydantic import BaseModel, Field

from app.core.enums import AnswerOption, Difficulty, DifficultyFilter, QuestionSource
from app.models import Question
from app.services.ai import gemini

logger = logging.getLogger(__name__)

BATCH_SIZE = 10
MAX_WORKERS = 6
TOPIC_MAX = 150
OPTION_MAX = 500

SYSTEM_INSTRUCTION = (
    "You write multiple-choice questions for technical interview practice aimed at students and junior "
    "software engineers. Every question has exactly four options and exactly one unambiguously correct answer. "
    "Distractors are plausible but clearly wrong to someone who knows the topic. Never use 'all of the above' "
    "or 'none of the above', and never prefix options with letters. Explanations are one to three sentences "
    "and say why the correct answer is right."
)

_LETTER_PREFIX = re.compile(r"^\(?[A-Da-d][\).:\-]\s+")


class GeneratedQuestion(BaseModel):
    topic: str = Field(description="Short topic label, e.g. 'Binary search' or 'Event loop'.")
    difficulty: Difficulty
    question: str
    options: list[str] = Field(min_length=4, max_length=4, description="Four answer options without letter prefixes.")
    correct_answer: AnswerOption = Field(description="Letter of the correct option: A, B, C or D.")
    explanation: str


class GeneratedQuestionSet(BaseModel):
    questions: list[GeneratedQuestion]


@dataclass(frozen=True)
class SubjectRequest:
    code: str
    name: str
    count: int


def _difficulty_instruction(difficulty: DifficultyFilter) -> str:
    if difficulty == DifficultyFilter.MIXED:
        return "Mix difficulties: roughly a third Easy, a little under half Medium, and the rest Hard."
    return f"Every question must be {difficulty.value} difficulty."


def _build_prompt(subject: SubjectRequest, count: int, difficulty: DifficultyFilter, batch: int, batches: int) -> str:
    variety = f" This is batch {batch} of {batches}; cover different topics from the other batches." if batches > 1 else ""
    return (
        f"Write {count} multiple-choice questions on {subject.name} ({subject.code}). "
        f"{_difficulty_instruction(difficulty)} Cover a varied range of topics that come up in real interviews, "
        f"and avoid trivia.{variety}"
    )


def _clean(item: GeneratedQuestion, subject: str, difficulty: DifficultyFilter, rng: random.Random) -> Question | None:
    question = item.question.strip()
    topic = item.topic.strip()[:TOPIC_MAX]
    explanation = item.explanation.strip()
    options = [_LETTER_PREFIX.sub("", option.strip()) for option in item.options]

    if not question or not topic or not explanation:
        return None
    if len(options) != 4 or any(not option or len(option) > OPTION_MAX for option in options):
        return None
    if len({option.casefold() for option in options}) != 4:
        return None
    if difficulty != DifficultyFilter.MIXED and item.difficulty.value != difficulty.value:
        return None

    correct_text = options["ABCD".index(item.correct_answer.value)]
    rng.shuffle(options)
    return Question(
        subject=subject,
        topic=topic,
        difficulty=item.difficulty.value,
        question_text=question,
        option_a=options[0],
        option_b=options[1],
        option_c=options[2],
        option_d=options[3],
        correct_answer="ABCD"[options.index(correct_text)],
        explanation=explanation,
        source=QuestionSource.AI.value,
    )


def _generate_batch(
    subject: SubjectRequest, count: int, difficulty: DifficultyFilter, batch: int, batches: int
) -> list[GeneratedQuestion]:
    try:
        result = gemini.generate_structured(
            _build_prompt(subject, count, difficulty, batch, batches),
            GeneratedQuestionSet,
            system_instruction=SYSTEM_INSTRUCTION,
        )
    except gemini.AIUnavailableError:
        return []
    return result.questions[:count]


def generate_questions(
    subjects: list[SubjectRequest], difficulty: DifficultyFilter, rng: random.Random | None = None
) -> dict[str, list[Question]]:
    """Generate unsaved questions per subject. A subject can come back short (or empty) if Gemini fails."""
    rng = rng or random.Random()
    jobs: list[tuple[SubjectRequest, int, int, int]] = []
    for subject in subjects:
        sizes = [BATCH_SIZE] * (subject.count // BATCH_SIZE)
        if subject.count % BATCH_SIZE:
            sizes.append(subject.count % BATCH_SIZE)
        jobs.extend((subject, size, index, len(sizes)) for index, size in enumerate(sizes, start=1))

    if not jobs:
        return {}

    with ThreadPoolExecutor(max_workers=min(MAX_WORKERS, len(jobs))) as pool:
        outputs = list(pool.map(lambda job: _generate_batch(job[0], job[1], difficulty, job[2], job[3]), jobs))

    generated: dict[str, list[Question]] = {subject.code: [] for subject in subjects}
    seen: set[str] = set()
    for (subject, _size, _batch, _batches), items in zip(jobs, outputs, strict=True):
        for item in items:
            question = _clean(item, subject.code, difficulty, rng)
            if question is None:
                continue
            key = " ".join(question.question_text.casefold().split())
            if key in seen:
                continue
            seen.add(key)
            generated[subject.code].append(question)

    for subject in subjects:
        generated[subject.code] = generated[subject.code][: subject.count]
        if len(generated[subject.code]) < subject.count:
            logger.info("Gemini produced %d/%d questions for %s", len(generated[subject.code]), subject.count, subject.code)
    return generated
