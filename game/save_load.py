import json
from pathlib import Path


SAVE_PATH = Path("saves/save_01.json")


def save_game(state, path=SAVE_PATH):
    """Persist the current state as readable JSON."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(state, handle, ensure_ascii=False, indent=2)


def load_game(path=SAVE_PATH):
    """Load a saved state, or return None if there is no save file yet."""
    if not path.exists():
        return None
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)
