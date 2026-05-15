from game.state import STAT_LIMITS


def clamp_stat(name, value):
    low, high = STAT_LIMITS.get(name, (None, None))
    if low is not None:
        value = max(low, value)
    if high is not None:
        value = min(high, value)
    return value


def apply_effects(state, choice):
    """Apply the selected choice's effects and update the next-event pointer."""
    for stat, delta in choice.get("effects", {}).items():
        if isinstance(delta, (int, float)):
            state[stat] = clamp_stat(stat, state.get(stat, 0) + delta)

    for item in choice.get("items_add", []):
        if item not in state["items"]:
            state["items"].append(item)

    for item in choice.get("items_remove", []):
        if item in state["items"]:
            state["items"].remove(item)

    for flag in choice.get("flags_on", []):
        if flag not in state["flags"]:
            state["flags"].append(flag)

    for flag in choice.get("flags_off", []):
        if flag in state["flags"]:
            state["flags"].remove(flag)

    next_event = choice.get("next_event")
    if next_event and next_event not in ("random", "ending_check"):
        state["forced_next_event"] = next_event
    else:
        state["forced_next_event"] = None

    state["turn"] += 1
    if state["turn"] > 0 and state["turn"] % 6 == 0:
        state["day"] += 1
        state["food"] = clamp_stat("food", state.get("food", 0) - 1)

    return state
