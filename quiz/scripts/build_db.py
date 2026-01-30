#!/usr/bin/env python3
"""Convert merged_problems.json → SQLite database."""

import argparse
import json
import sqlite3
import os
import urllib.request
import tempfile

PROBLEMS_URL = "https://github.com/mcaupybugs/leetcode-problems-db/raw/refs/heads/master/merged_problems.json"

SCHEMA = """
CREATE TABLE IF NOT EXISTS problems (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    source          TEXT NOT NULL DEFAULT 'leetcode',
    source_id       TEXT NOT NULL,
    slug            TEXT NOT NULL,
    title           TEXT NOT NULL,
    difficulty      TEXT NOT NULL CHECK(difficulty IN ('Easy','Medium','Hard')),
    description     TEXT NOT NULL DEFAULT '',
    examples        TEXT NOT NULL DEFAULT '[]',
    constraints     TEXT NOT NULL DEFAULT '[]',
    hints           TEXT NOT NULL DEFAULT '[]',
    python3_snippet TEXT NOT NULL DEFAULT '',
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(source, slug)
);

CREATE TABLE IF NOT EXISTS topics (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS problem_topics (
    problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    topic_id   INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    PRIMARY KEY (problem_id, topic_id)
);

-- FTS5 for title search
CREATE VIRTUAL TABLE IF NOT EXISTS problems_fts USING fts5(
    title,
    content=problems,
    content_rowid=id
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS problems_ai AFTER INSERT ON problems BEGIN
    INSERT INTO problems_fts(rowid, title) VALUES (new.id, new.title);
END;

CREATE TRIGGER IF NOT EXISTS problems_ad AFTER DELETE ON problems BEGIN
    INSERT INTO problems_fts(problems_fts, rowid, title) VALUES ('delete', old.id, old.title);
END;

CREATE TRIGGER IF NOT EXISTS problems_au AFTER UPDATE ON problems BEGIN
    INSERT INTO problems_fts(problems_fts, rowid, title) VALUES ('delete', old.id, old.title);
    INSERT INTO problems_fts(rowid, title) VALUES (new.id, new.title);
END;
"""


def main():
    parser = argparse.ArgumentParser(description="Build problems.db from merged_problems.json")
    parser.add_argument("--json", default=os.path.join(os.path.dirname(__file__), "..", "..", "merged_problems.json"),
                        help="Path to merged_problems.json")
    parser.add_argument("--db", default=os.path.join(os.path.dirname(__file__), "..", "problems.db"),
                        help="Path to output SQLite database")
    parser.add_argument("--download", action="store_true",
                        help="Download merged_problems.json from GitHub instead of reading a local file")
    args = parser.parse_args()

    db_path = os.path.abspath(args.db)

    if args.download:
        print(f"Downloading from {PROBLEMS_URL}...")
        with urllib.request.urlopen(PROBLEMS_URL) as resp:
            data = json.loads(resp.read())
    else:
        json_path = os.path.abspath(args.json)
        print(f"Reading {json_path}...")
        with open(json_path) as f:
            data = json.load(f)

    questions = data["questions"] if isinstance(data, dict) else data
    print(f"Found {len(questions)} problems")

    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.executescript(SCHEMA)

    topic_cache = {}
    imported = 0

    for q in questions:
        title = q.get("title", "")
        source_id = str(q.get("frontend_id", q.get("problem_id", "")))
        slug = q.get("problem_slug", "")
        difficulty = q.get("difficulty", "Medium")
        description = q.get("description", "")
        examples = json.dumps(q.get("examples", []))
        constraints = json.dumps(q.get("constraints", []))
        hints = json.dumps(q.get("hints", []))
        snippets = q.get("code_snippets", {})
        python3_snippet = snippets.get("python3", "")

        if not title or not slug:
            continue

        cursor = conn.execute("""
            INSERT INTO problems (source, source_id, slug, title, difficulty, description, examples, constraints, hints, python3_snippet)
            VALUES ('leetcode', ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(source, slug) DO UPDATE SET
                source_id=excluded.source_id,
                title=excluded.title,
                difficulty=excluded.difficulty,
                description=excluded.description,
                examples=excluded.examples,
                constraints=excluded.constraints,
                hints=excluded.hints,
                python3_snippet=excluded.python3_snippet,
                updated_at=datetime('now')
        """, (source_id, slug, title, difficulty, description, examples, constraints, hints, python3_snippet))

        problem_id = cursor.lastrowid
        # On conflict, lastrowid may be 0; fetch it
        if not problem_id:
            row = conn.execute("SELECT id FROM problems WHERE source='leetcode' AND slug=?", (slug,)).fetchone()
            problem_id = row[0]

        # Clear existing topic associations
        conn.execute("DELETE FROM problem_topics WHERE problem_id=?", (problem_id,))

        # Insert topics
        for topic_name in q.get("topics", []):
            if topic_name not in topic_cache:
                conn.execute("INSERT OR IGNORE INTO topics (name) VALUES (?)", (topic_name,))
                row = conn.execute("SELECT id FROM topics WHERE name=?", (topic_name,)).fetchone()
                topic_cache[topic_name] = row[0]
            conn.execute("INSERT OR IGNORE INTO problem_topics (problem_id, topic_id) VALUES (?, ?)",
                         (problem_id, topic_cache[topic_name]))

        imported += 1

    # Rebuild FTS index
    conn.execute("INSERT INTO problems_fts(problems_fts) VALUES ('rebuild')")
    conn.commit()
    conn.close()

    print(f"Imported {imported} problems into {db_path}")
    size_mb = os.path.getsize(db_path) / (1024 * 1024)
    print(f"Database size: {size_mb:.1f} MB")


if __name__ == "__main__":
    main()
