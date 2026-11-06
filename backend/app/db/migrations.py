import logging

from sqlalchemy import Engine, inspect, text

logger = logging.getLogger(__name__)

# Columns added after the first release. `create_all` creates missing tables but never alters existing ones,
# so databases created by an older version get these added in place.
ADDED_COLUMNS: dict[str, dict[str, str]] = {
    "questions": {"source": "VARCHAR(10) NOT NULL DEFAULT 'bank'"},
    "interview_sessions": {
        "question_source": "VARCHAR(10) NOT NULL DEFAULT 'bank'",
        "ai_evaluation": "JSON",
    },
}


def apply_migrations(engine: Engine) -> None:
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    with engine.begin() as conn:
        for table, columns in ADDED_COLUMNS.items():
            if table not in tables:
                continue
            existing = {column["name"] for column in inspector.get_columns(table)}
            for name, ddl in columns.items():
                if name not in existing:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {ddl}"))
                    logger.info("Added column %s.%s", table, name)
