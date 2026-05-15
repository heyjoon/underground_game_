from game.conditions import check_conditions


def check_ending(state, endings):
    """Return the highest-priority ending once final flags allow ending checks."""
    sorted_endings = sorted(endings, key=lambda ending: ending.get("priority", 0), reverse=True)

    if state.get("hp", 0) <= 0:
        return next((ending for ending in sorted_endings if ending["id"] == "DEATH_HP"), None)

    if state.get("sanity", 0) <= 0:
        return next((ending for ending in sorted_endings if ending["id"] == "DEATH_SANITY"), None)

    final_ready = (
        "FINAL_CHOICE_MADE" in state.get("flags", [])
        or "LAST_MESSAGE_SEEN" in state.get("flags", [])
    )
    if not final_ready:
        return None

    for ending in sorted_endings:
        if ending["id"].startswith("DEATH_"):
            continue
        if check_conditions(state, ending.get("conditions", {})):
            return ending

    return None
