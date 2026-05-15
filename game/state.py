from copy import deepcopy


DEFAULT_STATE = {
    "day": 1,
    "turn": 0,
    "location": "을지로 지하상가",
    "hp": 10,
    "food": 5,
    "battery": 4,
    "human": 50,
    "sanity": 70,
    "link": 0,
    "trust_union": 0,
    "trust_blackfog": 0,
    "trust_holylight": 0,
    "sister_trace": 0,
    "mother_aware": 0,
    "items": [],
    "flags": [],
    "visited_events": [],
    "forced_next_event": "M001",
}


STAT_LIMITS = {
    "hp": (0, 10),
    "food": (0, None),
    "battery": (0, None),
    "human": (0, 100),
    "sanity": (0, 100),
    "link": (0, 100),
    "trust_union": (-10, 10),
    "trust_blackfog": (-10, 10),
    "trust_holylight": (-10, 10),
    "sister_trace": (0, 10),
    "mother_aware": (0, 10),
}


def new_state():
    """Create a fresh mutable game state for a new run."""
    return deepcopy(DEFAULT_STATE)
