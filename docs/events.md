# Event System

## Loop

The web version uses a day-based random survival loop:

```text
Start day
-> increment dayCount
-> check CRITICAL events first
-> if none, choose a category by day-range probability
-> select a valid event from that category
-> show event text and visible choices
-> apply stat/counter/flag changes
-> show result
-> next day
```

## Categories

- `STORY`: Main-story fragments. Rare and conditional.
- `SURVIVAL`: Food, oxygen, health, parts, power.
- `WORLD`: Low-impact world texture and era detail.
- `LIGHT`: Small warmth, humor, and fragile hope with occasional resource cost.
- `RAIDER`: Human threat, mostly indirect pressure.
- `DISEASE`: Infection, quarantine, bad water, medicine shortage.
- `ANOMALY`: Mystery and true-ending clues.
- `CRITICAL`: Forced crisis events from counter thresholds.

## Day Weights

### Days 1-5

- SURVIVAL 35
- WORLD 25
- LIGHT 20
- RAIDER 8
- ANOMALY 7
- STORY 5

### Days 6-12

- SURVIVAL 32
- WORLD 18
- LIGHT 12
- RAIDER 15
- DISEASE 10
- ANOMALY 8
- STORY 5

### Days 13+

- SURVIVAL 28
- RAIDER 15
- DISEASE 13
- ANOMALY 14
- STORY 15
- WORLD 7
- LIGHT 8

RAIDER should stay at 15% late-game. Raiders are not random mobs; they are pressure that accumulates into disaster.

## Counters

- `dayCount`: survival days
- `hungerPressure`: food pressure
- `oxygenPressure`: oxygen pressure
- `mentalPressure`: psychological pressure
- `raiderThreat`: accumulated raider pressure
- `diseaseThreat`: disease and infection risk
- `systemFailure`: facility/system breakdown
- `hopeLevel`: community morale and future possibility
- `truthFlag`: true-ending clue access

## CRITICAL Thresholds

- `raiderThreat >= 6`: raider intrusion
- `systemFailure >= 6`: central power core overload
- `mentalPressure >= 6`: mental collapse event
- `diseaseThreat >= 6`: quarantine closure or infection spread
- `hungerPressure >= 6`: ration riot
- `oxygenPressure >= 6`: oxygen purification failure
- `truthFlag >= 5`: world truth / true-ending clue

After a CRITICAL event:

- reduce the related counter
- add a recent flag like `raiderRaid_recent`
- prevent immediate repeat

## Event JSON Shape

Events live in `data/random_events.json`.

```json
{
  "id": "W08",
  "title": "날씨 안내 방송",
  "category": "WORLD",
  "rarity": "COMMON",
  "minDay": 1,
  "maxDay": 0,
  "requiredFlags": [],
  "blockedFlags": [],
  "counterMin": {},
  "text": "...",
  "choices": [
    {
      "label": "방송을 듣는다.",
      "resultText": "맑음이라는 말이 지하에 고였다.",
      "statChanges": {},
      "counterChanges": {"truthFlag": 1},
      "addFlags": [],
      "removeFlags": [],
      "nextEventId": null
    }
  ]
}
```

## UI Rules

- Show title, event body, and choice buttons.
- Hide unavailable choices.
- Do not show hidden counters in normal play.
- Do not show exact stat/counter deltas in normal play.
- Show result text after a choice.
- Then offer `다음 날`.

## Current Data Count

`data/random_events.json` currently contains:

- SURVIVAL: 12
- WORLD: 12
- LIGHT: 16
- RAIDER: 7
- DISEASE: 5
- ANOMALY: 6
- STORY: 5
- CRITICAL: 7

Total: 70 events.
