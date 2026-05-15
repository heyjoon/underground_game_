def check_conditions(state, conditions):
    """Return True when every condition rule is satisfied by the state."""
    if not conditions:
        return True

    for stat, value in conditions.get("min", {}).items():
        if state.get(stat, 0) < value:
            return False

    for stat, value in conditions.get("max", {}).items():
        if state.get(stat, 0) > value:
            return False

    items = set(state.get("items", []))
    flags = set(state.get("flags", []))

    if not set(conditions.get("has_items", [])).issubset(items):
        return False
    if set(conditions.get("missing_items", [])).intersection(items):
        return False
    if not set(conditions.get("has_flags", [])).issubset(flags):
        return False
    if set(conditions.get("missing_flags", [])).intersection(flags):
        return False

    any_flags = conditions.get("any_flags", [])
    if any_flags and not set(any_flags).intersection(flags):
        return False

    any_items = conditions.get("any_items", [])
    if any_items and not set(any_items).intersection(items):
        return False

    return True


def condition_summary(conditions):
    """Build a short Korean hint shown next to locked choices."""
    if not conditions:
        return ""

    parts = []
    for stat, value in conditions.get("min", {}).items():
        parts.append(f"{stat}>={value}")
    for stat, value in conditions.get("max", {}).items():
        parts.append(f"{stat}<={value}")
    for item in conditions.get("has_items", []):
        parts.append(f"item:{item}")
    for flag in conditions.get("has_flags", []):
        parts.append(f"flag:{flag}")
    for flag in conditions.get("any_flags", []):
        parts.append(f"any flag:{flag}")
    return ", ".join(parts)
