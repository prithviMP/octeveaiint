from datetime import UTC, datetime
from typing import Annotated

from pydantic import AfterValidator


def _ensure_utc(value: datetime) -> datetime:
    # SQLite drops tzinfo on read; every stored timestamp is UTC.
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value


UTCDateTime = Annotated[datetime, AfterValidator(_ensure_utc)]
