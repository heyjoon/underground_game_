import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from game.conditions import check_conditions
from game.effects import apply_effects
from game.ending import check_ending
from game.event_loader import load_endings, load_events
from game.state import new_state


ROUTES = {
    "true": [
        ("M001", 0),
        ("H001", 0),
        ("S001", 1),
        ("M002", 1),
        ("M003", 0),
        ("N002", 0),
        ("M005", 1),
        ("M008", 0),
        ("N014", 0),
        ("F020", 0),
        ("H020", 0),
        ("M011", 0),
        ("H018", 0),
        ("N015", 2),
        ("M014", 2),
        ("M015", 0),
    ],
    "reconnect": [
        ("M001", 0),
        ("H001", 0),
        ("S001", 1),
        ("M002", 1),
        ("M003", 0),
        ("N002", 0),
        ("M005", 1),
        ("M008", 0),
        ("N014", 0),
        ("F020", 0),
        ("H020", 0),
        ("M011", 0),
        ("H018", 0),
        ("N015", 2),
        ("M014", 0),
        ("M015", 0),
    ],
    "manager": [
        ("M001", 0),
        ("H001", 0),
        ("S001", 1),
        ("M002", 0),
        ("M003", 0),
        ("N002", 0),
        ("M005", 1),
        ("M008", 0),
        ("N014", 2),
        ("F020", 0),
        ("M011", 0),
        ("H018", 0),
        ("N015", 0),
        ("M014", 1),
        ("M015", 0),
    ],
}

EXPECTED = {
    "true": "TRUE_END",
    "reconnect": "END_E_RECONNECT",
    "manager": "END_D_MANAGER",
}


def run_route(name, steps):
    events = load_events()
    endings = load_endings()
    state = new_state()

    for event_id, choice_index in steps:
        event = events[event_id]
        if not check_conditions(state, event.get("conditions", {})):
            raise AssertionError(f"{name}: event locked: {event_id}")

        choice = event["choices"][choice_index]
        if not check_conditions(state, choice.get("conditions", {})):
            raise AssertionError(f"{name}: choice locked: {event_id} #{choice_index + 1}")

        apply_effects(state, choice)
        if event_id not in state["visited_events"]:
            state["visited_events"].append(event_id)

    ending = check_ending(state, endings)
    if not ending:
        raise AssertionError(f"{name}: no ending")
    if ending["id"] != EXPECTED[name]:
        raise AssertionError(f"{name}: expected {EXPECTED[name]}, got {ending['id']}")
    return ending["id"], state


def main():
    for name, steps in ROUTES.items():
        ending_id, state = run_route(name, steps)
        print(
            f"{name}: {ending_id} "
            f"(human={state['human']}, link={state['link']}, sanity={state['sanity']}, mother={state['mother_aware']})"
        )


if __name__ == "__main__":
    main()
