# Playtest Results

## 2026-06-17 Automated Runs

Tool:

```powershell
node tools/simulate_web_runs.cjs 100 truth 20260617 --brief
node tools/simulate_web_runs.cjs 100 survival 20260617 --brief
node tools/simulate_web_runs.cjs 100 random 20260617 --brief
```

The simulator mirrors the web loop:

- day count
- CRITICAL priority
- progress events
- random event selection
- hidden counters
- crisis/death handling
- ending priority

## 100 Runs

### Truth-Seeking Player

This player tends to pick truth, anomaly, broadcast, and AI negotiation options while still avoiding obvious stat damage.

- Total: 100
- Average ending day: 34.86
- True route locked: 68
- Character true endings: 58
- Decompression accident: 10
- Ordinary survivor ending: 29
- Other bad endings: 3

Ending spread:

- `TRUE_HARIN_ROAD`: 22
- `TRUE_SEOJIN_GREEN`: 21
- `TRUE_TAEO_RELEASE`: 15
- `BAD_DECOMPRESSION`: 10
- `END_A_SURVIVOR`: 29
- `BAD_HUNGER`: 1
- `BAD_MADNESS`: 2

### Survival Player

This player tends to preserve visible stats and reduce hidden pressure.

- Total: 100
- Average ending day: 29.93
- True route locked: 28
- Character true endings: 27
- Decompression accident: 1
- Ordinary survivor ending: 67
- Other endings: 5

Ending spread:

- `END_A_SURVIVOR`: 67
- `TRUE_SEOJIN_GREEN`: 12
- `TRUE_HARIN_ROAD`: 10
- `TRUE_TAEO_RELEASE`: 5
- `BAD_DECOMPRESSION`: 1
- `END_E_RECONNECT`: 3
- `END_D_MANAGER`: 1
- `BAD_MADNESS`: 1

### Random Player

This player chooses visible options at random.

- Total: 100
- Average ending day: 27.29
- True route locked: 44
- Character true endings: 35
- Decompression accident: 9
- Bad endings: 51

Ending spread:

- `TRUE_HARIN_ROAD`: 13
- `TRUE_SEOJIN_GREEN`: 11
- `TRUE_TAEO_RELEASE`: 11
- `BAD_DECOMPRESSION`: 9
- `BAD_MADNESS`: 30
- `BAD_COLLAPSE`: 7
- `BAD_INHUMAN`: 3
- `BAD_HUNGER`: 2
- `END_A_SURVIVOR`: 6
- `END_D_MANAGER`: 4
- `END_E_RECONNECT`: 4

## 1000 Run Confidence Check

### Truth-Seeking Player

- True route locked: 674 / 1000
- Character true endings: 591 / 1000
- Decompression accident: 80 / 1000
- True ending rate after lock: about 87.7%
- Decompression rate after lock: about 11.9%

### Survival Player

- True route locked: 306 / 1000
- Character true endings: 277 / 1000
- Decompression accident: 29 / 1000
- True ending rate after lock: about 90.5%
- Decompression rate after lock: about 9.5%

### Random Player

- True route locked: 409 / 1000
- Character true endings: 354 / 1000
- Decompression accident: 53 / 1000
- True ending rate after lock: about 86.6%
- Decompression rate after lock: about 13.0%

## Findings

- The 30-turn ordinary ending target works. Non-true-route runs usually end around days 26-30.
- The 40-turn true ending target works. Character true endings resolve on day 40.
- Character true endings all appear in 100-run testing.
- `T39 감압 사고` originally appeared too often because it was a normal eligible CRITICAL event after true-route lock. It now requires `TRUE_ROUTE_RISK_ACTIVE`.
- After the fix, the true-route accident rate is close to the intended 90/10 target.
- Random play still dies often, especially by `BAD_MADNESS`. This may be acceptable if random clicking should be punished, but can be softened later by adding more sanity recovery or an extra sanity crisis buffer.

## Current Recommendation

Keep the current true-route structure:

- ordinary endings by 30 turns
- true-route lock by 30 turns
- 40-turn character true endings
- one 10% accident roll between days 31-39

Next tuning target, if needed:

- reduce early `BAD_MADNESS` in random play
- add more character-specific safe choices
- make non-true endings more varied than `END_A_SURVIVOR`
