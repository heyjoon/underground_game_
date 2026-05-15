import json
from pathlib import Path


DATA_FILES = [
    "events_main.json",
    "events_humanity.json",
    "events_noise.json",
    "events_faction.json",
    "events_survival.json",
]


def load_json(path):
    """Read a UTF-8 JSON file and return its decoded value."""
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_events(data_dir="data"):
    """Load every event from data/*.json into an id-indexed dictionary."""
    root = Path(data_dir)
    events = {}
    for filename in DATA_FILES:
        path = root / filename
        if not path.exists():
            continue
        for event in load_json(path):
            event_id = event["id"]
            if event_id in events:
                raise ValueError(f"Duplicate event id: {event_id}")
            events[event_id] = event
    return events


def load_endings(data_dir="data"):
    path = Path(data_dir) / "endings.json"
    if not path.exists():
        return []
    return load_json(path)
