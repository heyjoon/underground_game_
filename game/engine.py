import random

from game.conditions import check_conditions
from game.ending import check_ending
from game.event_loader import load_endings, load_events
from game.event_runner import print_divider, run_event
from game.save_load import load_game, save_game
from game.state import new_state


class GameEngine:
    def __init__(self):
        self.events = load_events()
        self.endings = load_endings()
        self.state = None

    def run(self):
        print("잔광 / DOWNLINK 콘솔 MVP v0.1")
        print("1. 새 게임")
        print("2. 불러오기")

        choice = input("> ").strip()
        if choice == "2":
            self.state = load_game()
            if self.state is None:
                print("저장 파일이 없어 새 게임을 시작합니다.")
                self.state = new_state()
        else:
            self.state = new_state()

        while True:
            ending = check_ending(self.state, self.endings)
            if ending:
                self.show_ending(ending)
                save_game(self.state)
                break

            event = self.select_next_event()
            if not event:
                if "ROUTE_COLLAPSED" not in self.state["flags"]:
                    self.state["flags"].append("ROUTE_COLLAPSED")
                ending = check_ending(self.state, self.endings)
                if ending:
                    self.show_ending(ending)
                    save_game(self.state)
                else:
                    print("더 이상 열리는 길이 없습니다. 당신은 지하로 돌아갑니다.")
                break

            result = run_event(self.state, event)
            if result == "quit":
                save_game(self.state)
                print("저장하고 종료합니다.")
                break
            if result == "save":
                save_game(self.state)
                print("저장했습니다.")
                continue

            save_game(self.state)

    def select_next_event(self):
        """Choose the next event, favoring forced story flow before priority bands."""
        forced = self.state.get("forced_next_event")
        if forced and forced in self.events:
            event = self.events[forced]
            if self.is_available(event):
                return event
            self.state["forced_next_event"] = None

        candidates = [event for event in self.events.values() if self.is_available(event)]
        if not candidates:
            return None

        candidates.sort(key=lambda event: event.get("priority", 0), reverse=True)
        top_priority = candidates[0].get("priority", 0)
        top_band = [event for event in candidates if event.get("priority", 0) == top_priority]
        return random.choice(top_band)

    def is_available(self, event):
        """Check repeat rules and event-level conditions."""
        if not event.get("repeatable", False) and event["id"] in self.state.get("visited_events", []):
            return False
        return check_conditions(self.state, event.get("conditions", {}))

    def show_ending(self, ending):
        print_divider()
        print(f"엔딩: {ending['title']}")
        print("-" * 72)
        print(ending["text"])
        print_divider()
