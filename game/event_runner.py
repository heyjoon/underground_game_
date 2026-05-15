from game.conditions import check_conditions
from game.effects import apply_effects


def print_divider():
    print("\n" + "=" * 72 + "\n")


def show_state(state):
    print_divider()
    print(f"DAY {state['day']} / TURN {state['turn']} / 위치: {state['location']}")
    print("-" * 72)
    print(
        f"HP {state['hp']} | FOOD {state['food']} | BATTERY {state['battery']} | "
        f"HUMAN {state['human']} | SANITY {state['sanity']} | LINK {state['link']}"
    )
    print(
        f"UNION {state['trust_union']} | BLACKFOG {state['trust_blackfog']} | "
        f"HOLYLIGHT {state['trust_holylight']} | SISTER {state['sister_trace']} | "
        f"MOTHER {state['mother_aware']}"
    )
    print("아이템:", ", ".join(state["items"]) if state["items"] else "없음")
    print("최근 플래그:", ", ".join(state["flags"][-8:]) if state["flags"] else "없음")


def run_event(state, event):
    """Print one event, receive a valid choice, and mutate the game state."""
    state["location"] = event.get("location", state.get("location", "알 수 없음"))
    show_state(state)
    print(f"[{event['id']}] {event['title']}")
    print("-" * 72)
    print(event["text"])

    choices = [
        choice for choice in event.get("choices", [])
        if check_conditions(state, choice.get("conditions", {}))
    ]

    print("\n선택지")
    for idx, choice in enumerate(choices, start=1):
        print(f"{idx}. {choice['text']}")

    while True:
        raw = input("\n번호 선택 / 저장 s / 종료 q > ").strip().lower()
        if raw == "q":
            return "quit"
        if raw == "s":
            return "save"
        if not raw.isdigit():
            print("숫자를 입력하세요.")
            continue

        selected = int(raw) - 1
        if selected < 0 or selected >= len(choices):
            print("없는 선택지입니다.")
            continue
        choice = choices[selected]
        apply_effects(state, choice)
        if event["id"] not in state["visited_events"]:
            state["visited_events"].append(event["id"])

        print_divider()
        print(choice.get("result_text", "결과가 적용되었습니다."))
        input("\n계속하려면 Enter...")
        return "continue"
