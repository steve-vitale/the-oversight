# Journey succession r43 — THE OFFICE VS THE VILLAGE (lane B, pre-registration 2026-10-24)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
r39/r41 verified the meal-gate ruling in the wild; r42 proved the successor
LIVES as the scholar (parity equal, function signals on 4/4, 30d). r42 left
one named question: low-trust successors flatline — Addison 28→20→21 over
30d, Ines 17→17 (r41), Miguel 18→18 (r39) — while the village kept feeding
them. This run asks whether that flatline is real, or whether r39–r42
measured the wrong dial.

## The two dials (read the code before judging the number)

- OFFICE dial = `village.trust[newId]` after the handoff. ledger.js
  playerDeath sets it by formula: 40% of the dead bearer's office entry +
  40% of the successor's own pre-death entry + vouch bonus (max +16),
  floor 10. This is what r39–r42 quoted as "successor trust".
- VILLAGE dial = `village.trust[other]` for each other living villager:
  how much each villager trusts the new scholar. Convo and deed gains land
  on the villager acted on (game.js teaching: words raise a learner's trust
  only to 40; above 40, actions not words), not on the office entry. So
  the office entry need not move when the village warms — and the village
  dial is the one that decides vouch eligibility, meal standing, and
  everyday standing.

## Leg question

Over 30 post-death days of competent play, does the VILLAGE warm to a
low-trust successor even when the OFFICE entry flatlines — and which deeds,
if any, move either dial? The instrument records both dials at the mantle
and at d+7/+14/+30, plus a deed ledger: every post-death teachPlant /
giveFood / treatVillager / comfort / donateToPantry call, with the
target's trust before and after (wrappers forward every call unchanged).

## What counts as an interesting finding

- Office flat + village climbs (mean +3 or more): r42's flatline was a
  dial artifact. The village DOES warm; the office entry just doesn't
  track it. (Then: what, if anything, SHOULD move the office entry?)
- Both flat despite a non-empty deed ledger: deeds genuinely don't move
  village trust under competent play — root-cause then (which deed paths
  exist, which the policy actually fires, whether gains are capped out).
- Office climbs via a named deed class (e.g. villager-taught scholar
  lessons landing on the office entry): name the channel.
- Any parity / machinery / meal-gate regression: REAL BUG, fail loudly.
- A successor-era transcript that is senseless: the dialogue lane's,
  reported, not fixed here.

## Seeds / policy / horizon

Seeds 24001–24004 (fresh band: no prior succession script or succession
evidence file uses 240xx). Policy: competent (same as r41/r42).
Horizon: phase A competent, then 30d competent play as the successor.
Death-aware stop (+10d tail).
- 24001, 24002: EARLY_KILL_DAY=10 — force the low-trust regime (r39's
  d12 kill gave trust 28; r41's d7 kill gave 17).
- 24003, 24004: standard 40d phase A — contrast regime; successors may
  arrive with higher standing.
Kill via the REAL playerDeath ('a hushwolf') unless the mantle passes
organically in phase A (honored per the standing rule).
Convo checkpoints: d+3, +7, +14, +30 (2 top-trust villagers each).

## Bindings (§14 — a miss is NO-GO, never re-scored mid-run)

- T1 (the question's readability): both dials readable at the mantle and
  at a panel with d+≥14, on 4/4 seeds. If a dial is unreadable → 
  SUBSTRATE-MISSING, reported, not re-scored.
- T2 (deed ledger lives): ≥1 post-death deed call recorded on ≥3/4
  seeds. If the ledger is empty everywhere → INSTRUMENT-MISSING.
- Classification rule (fixed now, not fitted later): climb = delta ≥ +3,
  flat = within ±2, fall = ≤ −3, mantle panel vs last panel. Village
  delta is on the mean; office delta is on the entry.
- S5 stay-green (r41/r42 regressions): M1 funeral arc ≥3/4, M4 machinery
  4/4 (linOk + moOk), MG2 meal gate 0 voice violations on 4/4 seeds.
  Meal audit is voice-only: a small draw with no voice is a
  room-limited draw, not gating (r42 metric review — the smallDraw tally
  is dropped from the verdict).
- S6 people: 0 identity failures across sense-read transcripts. The
  identity wire now carries the grief exclusion (reminiscence about the
  dead — "is gone", "always took the burnt piece" — is not
  misaddressing); raw and filtered counts are both reported.

## Informational

- F1: office + village mean/median/n≥60/n≥40/n<30 at every panel.
- F2: per-villager movers (|delta| ≥ 5, mantle → last panel).
- F3: deed summary per deed type (calls, mean trust delta, positive
  count) — teaching is expected to cap at 40 per learner.
- F4: pantry trend, roster alive/fallen, chain mantles, scholar function
  signals (r42's S3, kept as regression context only).
- F5: census in plain words; transcripts sense-read, not counted.

## Canon

No new canon invented. Governing texts: docs/COHERENCE-SPINE.md (parity
rule), src/js/villager-build.js mantleBecome (office keeps trust, ledger,
Codex; the body keeps its own build), src/js/ledger.js playerDeath
(inheritance formula + vouch rule), src/js/game.js trustGainProgressive
(0–50 full rate; 50–75 half; 75–90 quarter) and the teaching cap
(words to 40, actions beyond). No standalone succession canon doc exists;
if this run finds a rule with no doc, it is reported, not invented.

## Known instrument limits (declared now)

- Per-villager tables key on first names; a duplicate first name on one
  roster would collide in the movers map. Movers with no mantle record
  are excluded, not guessed.
- If a chain mantle fires, ledger panels follow the living bearer
  (Game.villagerId), so the verdict's office comparison spans bearers;
  the chain is flagged in the notes and the seed is read with care.
- Convo-driven trust gains are not attributed per turn; they appear only
  in checkpoint diffs. The deed ledger covers direct deed APIs only.

## Metric review

(written after the run)
