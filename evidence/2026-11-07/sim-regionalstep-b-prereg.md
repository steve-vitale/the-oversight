# sim-regionalstep-b — why does scale never leave `village`? Decomposing the regional gate — PRE-REGISTRATION (arm sim-regionalstep-b)

Run: fleshout-loop-b-20261107T0930Z (Loop B). Axis: scale-onramp /
winnability chain (wild ally-join → wave-4 kills → veterans →
readiness-5 release → wave-5 facing → full seat). Committed BEFORE any
judged sim. DIAG only, zero src/js, zero policy edits: replay the frozen
policy `scripts/policies/competent-stageally-a.js` (unmodified) with a
regional-gate recorder that reads live gate state every day. No lever is
changed, no gate/price/deed/readyDemand is touched.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/SCALE.md` (the scale ladder,
  designed 2026-10-10, Steve-approved): village → regional →
  national → global, one rung per season (1 season = 30 days), a
  moment not a threshold. REGIONAL bar: Haven's first bond is 21+
  days old — three weeks of knowing them. The first gesture (gift
  2,000 pantry kcal / send the representative 3 days / cold ink)
  stages at link formation, but the Regional Dawn itself
  (`networkLive`, the System's NETWORK announcement) waits for the
  bond to age 21+ days. Regional before ~day 25 is impossible.
  NATIONAL bar: a polity is one primary with ≥3 SEASONED
  subordinates (30+ days old AND trust 40+), or one of the six roads
  (LEAD / BELONG / COVENANT / TRADE / CONQUEST / REFUSE). `scaleRank()`
  reads only the `globalLive` / `nationalLive` / `networkLive` flags —
  standing points do not enter it.
- `src/js/hierarchy.js` rules, read from code (not invented):
  `stageFirstAccord` (the gesture stages at link formation;
  `_fireRegionalDawn` fires when a bond is 21+ days old, via
  `stageFirstAccord` for an already-old bond or `_checkRegional`
  daily while `_regionalPending` holds); `proposeLink` scores the
  courtship (`judgeLink`: base 38 + representative standing/2 max
  20 + opinion/2 + ally +15 + strength term, ±10 RNG) — ≥55 accepts,
  35–54 counters (played: accept / sweeten / walk), <35 declines
  (−5 opinion, banks `courtshipDeclined`, climb verbs +1 harder
  28 days); `proposeLink` is knowledge-gated (`knowsVillage`,
  knower-traced 2026-10-29) and player-only (Steve 2026-10-26);
  opinion ≤ −20 means the door is shut and the knock goes
  unanswered. Courtship moves opinion: study their codex (+3, once),
  deeds the region hears (+2 per contest win), old slights fade
  +1/week. Peer proposals (covenant/trade) need opinion ≥ 10.
  `src/js/bond-initiation.js` (landed 2026-11-06): an NPC raises a
  link idea (`npcLinkRaiseTick` — needs the villager's trust ≥ 20,
  a `build_standing` goal weight ≥ 1, and ≥1 village in that
  villager's lore); the raise stages as a talk request and EXPIRES
  after 2 days unanswered; accepting (`acceptLinkRaise`) tells the
  bearer <redacted> lore, then calls `proposeLink` as the player.
  `src/js/standing.js`: the diplomacy source counts only SEASONED
  REGIONAL+ links (a link inside a regional-scale polity) — a lone
  seasoned bond scores 0 diplomacy.
- No canon invented here. If the recorder finds a gate the canon
  docs do not name, the evidence file says so instead of inventing
  canon.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-07/sim-sitstep-b.md` (+ prereg, committed
  30f364275): seed 53006 staged held a living pair 42 days (51 on
  the dab55c69 re-run), standing 440 (415), wave 5 unlocked/faced,
  5 wave-5 kills, survived 150d — and NEVER sat: exactly two bars
  missing on all pair days, scale stuck at `village` and the feast
  surge never spent. `networkLive` never fired on ANY seed on ANY
  day of the band — no seed's village ever grew past one fire. The
  recorder showed the outcome (no Dawn), not the attempts. This arm
  is sitstep-b's next blank #1: decompose the regional gate.
- `evidence/2026-11-07/sim-stageally-confirm2-b.md` (+ prereg,
  committed 74059c4d): the staged leg the replay reproduces — 53006
  staged 150d, standing 440, 11 wave-4+ kills, 42 pair days on base
  41007b9d4 (51 pair days / 415 / 8 kills on dab55c69).
- Master has moved since the sitstep re-run: dab55c69 → 32d79b713
  (journey-establishment r109 landings + sim-capabledeed-a). The
  staged trajectory is fragile (trajfrag-b: one extra RNG draw flips
  3 of 4 seeds), so the 53006 numbers below are a comparison, not a
  promise — see the guard rule.

## The question, as a chain (read from code, to be measured per day)

Regional requires every link in order — the recorder classifies
each no-regional day by the FIRST failing link, so the verdict is a
named sub-gate, not a post-hoc label:

1. KNOW — the scholar knows ≥1 other village (`knowsVillage`:
   lore, visit, or delivered rumor; generated villages count).
2. COURTSHIP — some known village is propose-ready: its
   deterministic `judgeLink` components (base 38 + rep standing/2
   + opinion/2 + ally +15 + strength term, tribute 4,000 as the
   app.js default) could reach the counter band even at best-case
   RNG (det + 10 ≥ 35). NOTE: `judgeLink` itself draws RNG
   (`R() * 20 - 10`), so the recorder NEVER calls it live — it
   recomputes the deterministic components and reports the ±10
   band. A village is "could-counter" iff det + 10 ≥ 35,
   "could-accept" iff det − 10 ≥ 55.
3. ATTEMPT — `proposeLink` was ever called (wrapped count), or a
   link raise was ever accepted (`acceptLinkRaise` count). The
   policy's own code is READ, not modified: grep shows no
   `proposeLink` / `acceptLinkRaise` call in `competent.js` or
   `competent-stageally-a.js`, and `chooseConversationChoice` picks
   only invite/answer/goon/subject — `link:accept` is never picked.
   If the attempt count stays 0 while a village is courtship-ready,
   that IS the finding, measured not assumed.
4. COUNTER — a staged counter (`pendingCounter`) was answered
   (`answerCounter` count). An unanswered counter is its own gate:
   the negotiation happened and nobody sat at the table.
5. LINK — a link formed (`hierarchyState()` active link count ≥ 1,
   ever). Declines / shut doors / knowledge refusals are counted
   separately via the `proposeLink` return values.
6. GESTURE — the first accord staged (`pendingAccord` /
   `_regionalPending` / `accordUnanswered` flags; first-accord day
   recorded). `_formLink` stages it at formation, so a formed link
   with no accord flags is itself a finding.
7. SEASONING — the oldest active bond is 21+ days old
   (days-to-dawn = 21 − age, shown per day).
8. DAWN — `networkLive` fired (`_checkRegional` found a 21+ day
   bond). `scaleRank()` → `regional`.

## Method

- Replay band 53001–53008 staged with the frozen policy, 150d
  death-aware, same driver shape as the sitstep replay (daily
  snapshot in the wrapped `policy.daily`, recorder installed on the
  same instrument chain). Band 53001–53008 is DELIBERATELY REUSED
  (a re-run, not a fresh band — the same trajectories as
  sitstep-b/confirm2; this is a re-read, not a fresh band) —
  document the reuse; the 8-seed corpus is the pilot size and the
  only spend (DIAG arms take no confirm spend beyond the replay
  itself).
- Recorder `scripts/regionalstep-instrument-20261107.js`: reuses
  the sitstep instrument verbatim (require, not a copy) and adds
  per-day regional-gate fields — scale rank, `networkLive` /
  `networkLiveDay`, `_regionalPending`, `pendingAccord` (day),
  `accordUnanswered`, `pendingCounter` (target/day), `scaleRefused`,
  full link list (id, other village, kind, status, formation day,
  age, trust, tribute, arrears, conquered), active/broken/ever
  link counts, oldest active link age + days-to-dawn, first-link
  day, first-accord day, standing breakdown
  (`villageStanding()`: total / war / diplomacy / plenty / links /
  feasts), per-village rows (id, name, known-to-scholar, opinion,
  codex studied, courtship-declined day, linked, deterministic
  judge score + band for both the as-primary and as-subordinate
  offers), raise-eligible villager count (trust ≥ 20, build_standing
  weight ≥ 1, ≥1 village in lore — the `npcLinkRaiseTick`
  precondition), pending link raises (vid → village, day) +
  decided/expired raise history (`linkRaiseState`), scholar
  talk targets per day (wrapped `talkTo`, to test whether a raiser
  was ever talked to inside the 2-day window), and counting wraps
  on `proposeLink` / `answerCounter` / `answerAccord` /
  `acceptLinkRaise` / `declineLinkRaise` / `proposeCovenant` /
  `proposeTrade` / `raidVillage` (call + day + return-shape).
  Pure reads + counting wraps only; zero game-state writes, zero
  RNG draws (the deterministic judge recomputation calls no
  RNG-drawing function); a recording failure is counted in
  `instrumentErrors` and the original call's result is returned
  untouched.
- Analyzer `scripts/regionalstep-analyze-20261107.js`: per-seed
  no-regional-day tallies by first failing sub-gate, the share of
  53006's no-regional days each gate explains, the 53007 contrast,
  first-known / first-courtship-ready / first-attempt / first-link /
  first-accord / seasoning timelines, wall numbers (national /
  table / wins, wave 4–5 unlocks, median survival).
- Proof `scripts/test-regionalstep-20261107.js`: fixture tests for
  the gate classifier (every link in the chain + edge cases), a
  fake-Game test that the diplomacy wraps count calls and pass
  results through, and a live smoke leg (53006 staged, 150d, /tmp)
  asserting the recorder runs, every daily row carries a gate,
  and instrument errors are 0. Green BEFORE the judged run and
  after every rebase.

## Pre-registered metric (binds the run)

- PRIMARY: classify the blocking sub-gate on every no-regional
  seed-day (a daily row with scale `village` at snapshot).
  DIAG-GO iff a single named gate — or one named ordered pair of
  adjacent chain links (e.g. {courtship-no-attempt,
  counter-unanswered}) — explains the no-regional state on ≥ 80%
  of measured no-regional seed-days, with per-day gate state shown
  in the corpus (not a post-hoc label). Name the lever that would
  open it, or flag Steve-call if it is a design decision (e.g. the
  propose verbs being player-only while the policy never proposes).
- SECONDARY: the 53007 contrast (same classification on its
  no-regional days — same gate, or a different one?); the
  first-link/first-accord/seasoning timeline on 53006; the
  raise-window read (raises staged vs raises ever answered in
  time).
- GUARD: instrument errors 0 on all 8 seeds. The judged legs are
  COMPARED to the sitstep-r2 staged headlines on 53006 (150d,
  standing 415, 8 wave-4+ kills, 51 pair days, wave 5 unlocked) —
  a divergence is REPORTED per seed as a master-move finding, not
  a stop condition and not a re-cut: the primary is defined on the
  measured no-regional seed-days of THIS corpus, so it stays
  judgeable whatever the fragile staged trajectory did on the new
  master. (Differs from sitstep's hard guard deliberately: the
  question here is the gate chain, which is trajectory-independent
  in structure; stopping on a master move would waste the run.
  The proof's live leg pins the sitstep-r2 numbers as an early
  warning; if it fails, the expectation is re-pinned to the new
  master's numbers with the master-move named, same as sitstep's
  re-pin after the vetkilltale landing — the re-pin changes an
  instrument expectation, never the metric.)
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run. If the metric proves wrong, write it under "metric
  review" in the evidence file and propose the revision for the next
  run. Every evidence file carries a "metric review" section.

## Balanced panel (§15)

DIAG arms take no panel — the comparison here is per-day gate
state inside one replayed leg, not a before/after lever
comparison. No compare `.md` is fabricated; say so honestly in the
evidence file, as prior DIAG arms did.

## Corpus

`evidence/2026-11-07/perseed-regionalstep-b/` (8 staged files,
seeds 53001–53008). Evidence:
`evidence/2026-11-07/sim-regionalstep-b.md` (lever played,
before/after numbers — replay vs sitstep-r2 staged headlines —
reachability verdict, village assessment in plain words, blanks
filled or documented, metric review, wall numbers).
