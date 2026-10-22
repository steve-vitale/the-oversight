# journey-scale r20 — THE COVENANT ROAD (2026-10-22, lane A playtest loop)

Leg: SCALE (days 80–140: regional→national, hierarchy, table approach).
Road played: **COVENANT** (peer league, no primary). The r-line (r12–r19)
proved the belong/trade roads and the table approach aloud; the covenant
road had not been played in the scale window since longsim food r2
(2026-10-11), and never with the courtship-honesty fixes or the Founding
Council pool-pour voicing.

## PRE-REGISTER (MEASUREMENT.md sections 9-12, 14)
- Leg question: does the covenant road play aloud end-to-end in the scale
  window — courtship, the Founding Council beat (pact vs pool), covenant
  crises, defense calls — and can a real player reach national on it?
- Arms (COVENANT_ANSWER): seeds 20001,20002 = 'pact' (mutual defense);
  seeds 20003,20004 = 'pool' (shared-granary founding pour — the road's
  real-food moment, never taken by a policy before).
- Binding metrics (NO-GO never re-scored; revisions under "metric review"):
  - M1 links — >=2/4 seeds form >=2 covenant links.
  - M2 founding — every seed reaching 3 covenant links fires the Founding
    Council beat ALOUD and answers it aloud.
  - M3 crises — every fired covenant crisis / defense call answered aloud.
  - M4 people — >=4 full transcripts sense-read, 0 senseless flags.
  - M5 survival — villages alive+coherent at the decision day (185
    loop-days or death-aware stop, +10d tail max).
- Interesting-finding bar: the pool-pour's real-food debit said aloud; how
  pact's mutual-defense obligation plays vs trade's priced refusal; whether
  the league holds under wave-3/4 pressure; what the covenant crises ask.
- Horizon: DAYCAP=185 loop-days, death-aware stop. PILOT FIRST: 4 seeds
  20001–20004 (fresh, disjoint from r9–r19). Policy: scalecourt (competent +
  covenant-road courtship), no other layers.
- Driver: scripts/journey-scale-r20-20261022.js (new this run). Per-seed
  JSONs + beat captures + transcripts under
  evidence/2026-10-22/journey-scale-r20-covenant/.

## Fixes (this run)

**1. test-socialite-break regression (flagged for this lane, 2026-10-21).**
The r19 NV-winddown delivery (4e44af418) broke two assertions:
"winddown beat survives the player moving on" and "continuer reveals the
queued goodbye". Root cause: the planted scenario ran on a NONVERBAL-thread
conversation, where there is no 'goon' continuer in the UI — every choice is
a gesture, and gestures ARE the continuer there (r19's fix surfaces the beat
on the next gesture, proven by test-nvwinddown-20261021.js). The guard's
actual subject is the verbal continuer. Fix (test-only): the plant scenario
now selects a verbal-thread villager, with a comment cross-referencing the
NV behavior. scripts/test-socialite-break-20261010.js 32/32 GREEN;
test-nvwinddown-20261021.js still GREEN (NV behavior preserved).

**2. Withdrawal copy names the failed bar (r19's documented blank).**
The withdrawal beat always said "THE DEEDS ARE NOT ALL DONE" — a lie when
the seat slipped on integration stage alone (r19's live finding). New
proof-testable `tableWithdrawLine(seat)` in src/js/table.js reads the
lesser-seat detail and names the missing bars ("integration too shallow
(stage 1)", "wave-blood unpaid (2/4, 4/4, 3/3)", etc.), falling back to the
old generic only on unreadable detail. tableScene uses it.
scripts/test-tablewithdraw-20261021.js promotes the old "documented, not a
fail" note to a real assertion + unit voicing for slip/multi-miss/empty
detail — GREEN. scripts/test-tabledeed-20261021.js E3 audit allowlist
extended for the new pure-voicing function — ALL GATES GREEN.
Related suites: test-table-core, test-table-reactor-seat-honesty,
test-tabledeed-20261018 (17/17) — all green.

## The run (pilot, 4 seeds)

- **20001 (pact):** day 186, 7/7 alive, pantry 22k. Three covenants (The
  Hungry Road, Stonebridge, The Bloodied) + 1 trade charter. Founding
  Council staged day 133, war-pact sworn aloud day 134. 20 covenant crises,
  all conceded aloud ("pool share halves for four weeks — bought, honestly,
  and everyone knows the price"). 5 defense calls answered. The realm came
  apart aloud at day 154 (said, both lines) and re-staged/re-sworn at
  155–156 — the live-polity behavior working as canon demands. Pool poured
  weekly engine-side (30.5k kcal over ~7 post-council weeks). Ended national.
- **20002 (pact):** died day 54 — starvation spiral after combat/sickness
  attrition (20 deaths, last two starvation, pantry 0). The scale leg never
  started. Honest death.
- **20003 (pool):** day 185, 11/11 alive, pantry 98k. Three covenants,
  Founding Council fired and answered, 2 crises answered, ended global.
  The pool road feeds.
- **20004 (pool):** died day 144 — wave combat overwhelmed the village
  (38 deaths, player fell 5 times in 8 days). 3 covenants formed, council
  answered, 7 crises answered. The league outlived the village's ability to
  hold the treeline. Honest death.

## Village assessments (plain words)

- **20001:** A league that held. They swore the war-pact, paid every crisis
  in the open, answered every call — and when the realm came apart, the
  System said so and they built it again. They knew their monsters (villager
  kills across wave 1–2), kept the pantry honest, and ended national with
  the granary full. Missing: nothing the road promises and didn't deliver.
- **20002:** A village that never got to choose a road. Sickness took the
  workers, monsters took the hunters, hunger took the rest. The scale leg
  never started — the early game is still lethal, as designed.
- **20003:** A league that thrived. Eleven alive, pantry near 100k, three
  fires bound and a global standing. They knew the pool's terms and paid
  them. The quietest success of the four.
- **20004:** A league that bled out. They did the politics right — three
  bonds, council answered, every crisis conceded aloud — and the treeline
  killed them anyway. Wave pressure is the binding constraint, not diplomacy.

## People check (SENSE-TESTING LAW — 5 transcripts read)

- 20001-day90 Marta (lifeguard, cautious, trust 90, want seek_taken): asked
  about the taken, accepted the player's promise to ask the System —
  grateful, specific, human. Meaningful.
- 20003-day60 Tamika (trail crew lead, sardonic, trust 90, curious): "Have
  you ever hurt someone?" — accepted the honest answer without judgment
  ("I don't keep score on that. Score-keeping is how you stop sleeping.").
  Meaningful.
- 20003-day120 Miriam (rail conductor, anxious, trust 90, ask_favor): nine
  turns on belonging ("I want to be someone's first call, not their last
  resort"). A real want, real voice — BUT the want menu offered no commit
  path, so nine "tell me more"s never advanced it. Thin, not broken; noted
  as a blank (ask_favor resolution options).
- 20003-day150 Miriam (curious): opened with a genuinely funny human
  question, then taught 7 distinct field-knowledge items when the harness
  spammed ask_field. Coherent, varied, no repeats — but the NPC never
  deflects repeated teaching; harness artifact mostly, noted.
- 20004-day90 Kiara (florist, prickly, trust 21, curious): "the free things.
  Turns out they were the expensive ones." Texture, past, invitation ("Come
  get air with me"). A person.
- 0 senseless flags. M4 GO.

## Metrics verdict

- M1 GO: 3/4 seeds formed >=2 covenant links (20001: 3, 20003: 3, 20004: 3;
  20002 died day 54 before courtship).
- M2 GO: 3/3 seeds reaching 3 links fired the Founding Council aloud and
  answered it aloud (2 pact, 1 pool).
- M3 GO: every fired crisis answered aloud (20/20, 2/2, 7/7 per policy ctx;
  beat text confirms aloud answers).
- M4 GO: 5 transcripts, 0 senseless flags.
- M5 PARTIAL: 2/4 villages alive at the decision day; both deaths are
  honest game outcomes (starvation spiral; wave-combat overwhelm), and the
  death-aware stop behaved per method. Not a NO-GO — death is a legal
  outcome — but recorded.

## Telemetry deviation check

- Baseline: hidden_files/telemetry-baselines/scale-covenant.json (r12).
- One LOUD line: markerCounts.leaguePool 24 -> 6 (-75%). INVESTIGATED:
  marker artifact, not a bug. The "league pool grows" say-line is
  intentionally 40%-sampled flavor (`R() < 0.4` in covenantTick); the pour
  itself is weekly engine-side — verified: seed 20001's leaguePoolKcal =
  30,465 at day 186 over ~7 post-council weeks at the league rate. The r12
  baseline counted the same sampled marker over a larger corpus. Baseline
  NOT rolled.
- Metric review: future covenant telemetry should count engine pours
  (leaguePoolKcal deltas or journal notes), not the sampled say-line. The
  say-line is working as designed (flavor sampling); the marker was the
  wrong instrument.

## Reachable / fun / winnable (covenant road)

- Reachable: YES — 3/4 seeds formed leagues; the courtship climb (study +3,
  broadcast +2, time +1/week to the opinion-10 bar) is legible and played
  aloud. One seed stalled at 2 links inside the window (third candidate
  below the bar) — a tuning question for longsim, not a block.
- Fun: YES — the council beat, the crises ("bought, honestly"), the defense
  calls, and the live realm (apart aloud, re-staged aloud) all play as
  theater with real costs. The pool is real food in and out.
- Winnable: YES — 20003 reached global with 11/11 alive; the road feeds its
  walkers. Wave pressure, not diplomacy, is the binding constraint.

## Named next

- ask_favor want resolution: the want menu offers no commit path (nine
  "tell me more"s, want never advances). Small blank for a future run.
- Covenant telemetry marker: count engine pours, not the sampled say-line
  (metric review above).
- Third-link courtship pacing (opinion-10 bar vs one-time +3 study) is a
  longsim tuning question.
