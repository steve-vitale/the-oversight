# Journey leg ESTABLISHMENT — r221 run note (2026-11-16, Lane A)

## Run
Run id `playtest-a-20261116T0521Z` (scheduled Sun 2026-11-15 22:45
CST). Rotation read `1` (establishment); write `1→2` at closeout
with read-back. **Base:** local master `9fd662db5` (journey landing
r138). Heartbeat loop running (10-min cadence,
`journey-establishment-hbloop-r221.sh`, pid 9369); heartbeat landed
immediately at registration and stayed fresh throughout
(registration itself waited ~5 min on the registry lock, held by
sibling registrations — the known 2026-11-12 self-contention item).
Pre-flight: main tree CLEAN, disk 42%. Lock created by this run
2026-11-16T05:21:54Z. No reaper re-run needed at start (reaper ran
clean at 05:22Z: 12/16 active, nothing removable — all held trees
dirty/active; `vetparty-base-check` detached HEAD sits unregistered,
left alone).

**r217 closeout correction (found this run):** r217's run note
records commits 0138f8583/510bd835c and leaves [MERGE-RESULT]
unfilled — both hashes are NOT ancestors of master. The work DID
land under different hashes (`40fe6eda4` prereg + clones,
`9e3abfbab` anchor fix, `2a3ea11b1` run note + no-close fix, all on
master); the note's hashes were stale pre-rebase records. The
rotation file still read `1`, so r217's `1→2` write never landed
either. This run writes it.

## Pre-registered bars (r221 prereg)
Q1 WANT-RAISE (new — r217 carry: seed 100803 raised zero ask_favor
wants in 42 days). Q2 SITTING CLOSES (standing bar, r217 Q1
thresholds verbatim). Q3 recap paraphrase (report-only, A2 floor).
Carried bars: SPOTTER ≥10 total + every seed >0; LADDER ≥1
villager at 5+ XP on ≥3/4 seeds; FASTER-ID ≥2/4 seeds; END BAR
(broken-live forage closed ≤2 dawns); TRUST GUARD 0 drops (hard);
VILLAGE BAR alive d40 ≥3/4; JAM report-only; STRANDED/TRAVEL/
THREAD carried watches; PEOPLE CHECK (2 held convos, one panel
seed, read in full).

## Analyzer verdicts (r221 panel, seeds 101001–101005, 42d)
- **Q1 WANT-RAISE: GO — 73/348 social sits raised ask_favor
  (21.0%); any-want sits 336/348; zero-raise seeds 0/5.** No seed
  went a leg without a villager asking for help. Thinnest seed
  101002 (3/78, 3.8%) — the fat, healthy village (pantry 98,248
  kcal, 11/12 alive, no sickness): its villagers had little to ask
  for, and its 71/78 any-want sits prove wants were raised — just
  rarely favors. Mechanism, not defect. Per-sit kinds:
  forage_help 33, heal_help 10, sick_help 6, food_share 4,
  **no-kind 20** (see the blank below).
- **Q2 SITTING CLOSES: 0/10 CUT — GO.** 5 engine-ended sittings
  WITH closing beats; 0 other no-close. The goon ask-tag fix and
  the commit-refusal thread-memory fix (the base delta in the Q2
  area) moved nothing here — closes hold on the new base.
- **Q3:** "still where we are" total 2 → THIN-PROBE, report only.
  Canned lines: walked-in 0, pod-dream-open 1, rest 0. Parting pool:
  "See you around." fired once.
- **SPOTTER GO:** 68 total (22/12/15/5/14), 5/5 seeds > 0.
- **LADDER 5/5** (bar ≥3/4). **FASTER-ID GO:** 5/5 seeds, 184
  benefit plays in 239 bump calls.
- **CODEX 131** plants identified at end across 5 seeds.
- **END BAR 11/11** broken-live forage closed ≤2 dawns (every one
  closed same-day). TRUST GUARD 0 drops. VILLAGE BAR 5/5 alive
  d40. JAM 0. STRANDED no-opportunity. TRAVEL no-opportunity.
  THREAD 3/3 paged closed ≤2 dawns. Water 0 broken-live runs.

## Instrument fix landed this run (analyzer clone)
**Per-sit kind tally (pilot catch).** The first analyzer draft
counted ask_favor kinds PER PICK: a sitting's want stays ask_favor
across its turns while only the commit-turn pick carries the favor
kind, so one ask counted many times — and as '(no-kind)' on every
non-commit turn (259 phantom no-kind picks). Fixed to per-sit
(first kinded kind wins; '(no-kind)' only when no pick ever
carried a kind). Panel kinds corrected to forage_help 33,
heal_help 10, sick_help 6, food_share 4, no-kind 20 sits. The
raise counts (73/348) were unaffected — the Q1 verdict stands on
the corrected instrument. Proof test
`scripts/test-journey-establishment-r221-want-raise-20261116.js`
**7/7** (synthetic sits: multi-turn kinded asks count once,
no-kind sits count once, zero-raise seed flags WATCH, work-mode
sits excluded from the denominator).

## The blank: asks that never become anything (documented, not fixed)
**20 of the 73 raised asks (27%) never materialized into a
committable favor in their sitting** — the want stayed ask_favor
for every turn, no favor kind ever attached, result no-offer.
They cluster on villagers in distress and repeat for the same
person across weeks:
- **101004:** Ivy d16/d25/d31, Veronika d30/d34 — both STARVED to
  death d33/d34; Esther d37 (died of sickness d38). Ivy asked for
  help three times while starving and the player was never offered
  a way to help her.
- **101003:** Dale d23/d27/d31 (sick at end; finalFavorLedger null
  — he never had a favor at all), Priya d32.
- **101001:** Zoltan d15/d19/d23/d27 (four sits, same asker).
- **101002:** Thabo d15. **101005:** Tariq d17/d38.
This contradicts the structural claim in `src/js/convo-wants.js`
("If no real need exists, ask_favor.pick returns 0 and the want is
never selected — a contentless favor is structurally impossible"):
the want WAS selected and stayed ask_favor for 11 turns (Dale d23,
verbatim in the sit record) with no favor object ever attached.
The driver re-fetches `convoGet(vid)` fresh every turn, so this is
not an instrument artifact — the game really ran the sitting with
a favorless ask.
**Hypothesis (UNPROVEN):** the unfinished-business seed pre-emptor
selects ask_favor above the weighted pick, and when the seeded
favor is gone the opener returns null ("favor gone — honest
fallback") while the want stays ask_favor for the sitting; the
unresolved ask re-seeds, which would explain the repeats. NOT
proven in code — the seed path was read, not traced live.
**Decision:** no speculative src/js fix. Root-cause first: the
next establishment run takes this as its Q1 with a live trace of
the seed path (or a staged reproduction). The wedge commits only
JOINT kinds by design, so non-joint asks (heal/sick/food) were
never committable through it anyway — but a favorless ask is a
different, deeper gap: the villager wants help the game cannot
name.

## Q4 — census (plain words)
Five villages, 42 days, all alive at day 40 (5/5), waves 3, 3, 2,
4, 3. They are not the same village five times: seed 101002 is
the fat one (pantry 98,248 kcal, 11 of 12 alive, nobody sick);
seed 101004 is the hungry one (pantry bled from 38,740 to ~1,200
kcal and sat there two weeks, two starved, yet it fought to wave
4 and ended with 10 alive after newcomers joined); seed 101003 is
the battered one (three monster deaths, two sick and three
walking wounded at the end, wave 2 only).
- **The dying:** 14 named villagers died across the five villages
  (of 162 death events — the rest are monsters the villagers
  killed, ~30 per village). Causes: monsters 6 (Yazeed, Olivia,
  Dorcas, Natalie, Anthony, Emma), ambush 2 (Wanjiru, Nadia), lost
  in the wild 2 — both the SCHOLAR
  (Charlotte d18 on 101002, Theo d25 on 101004; succession carried
  on both times, villages ending 11 and 10 alive), contest 1
  (Otis d23), starvation 2 (Ivy + Veronika, 101004), sickness 1
  (Esther d38). Nobody else starved. Seed 101003 ends with Dale
  and Henry sick, Shanice at 18 HP, Hannah at 30, Henry at 21.
- **What they knew:** the scholar's plant codex holds 21–31 plants
  per village at end (131 total). Spotter knowledge concentrates
  in one forager per village (Harold 22, Sean 12, Kelsey 15,
  Ethan 5, Pamela 14 XP) — practice earns it, one person per
  village carries the specialty. Seed 101004's Ethan (5 XP) is the
  thin end: that village fought and starved all leg and foraged
  least.
- **What they carried:** alien loot is in circulation (Aroha
  101002: phase sling; Gina: field suture kit; Desmond 101004:
  alien helm + stormcloak), bark armor, bows and spears common,
  most villagers carrying 5–9 items — and keepsakes everywhere
  (photo albums, mothers' rings, a wedding ring, a daughter's
  drawing). Pantries end 14,664–98,248 kcal (daily trace: 101004's
  pantry sat at 1,000–2,000 kcal through d30–d39 — the end number
  14,762 reflects a late recovery, not the thin stretch).
- **Social life:** invitations are taken, roles are promised,
  bonds are proposed in the sittings; the villages read as people
  living together, not rosters. Joint favors are real this panel
  (14 commits across 5 seeds; 11 broken-live runs all ended
  honestly within 2 dawns). The want-raise rate (21%) says
  villagers do ask — the gap is the 20 favorless asks above, not
  silence.

## People check — PASS (seed 101003, Renee + Shanice, read in full)
- **Renee** (glazier): wants space, "a corner nobody needs me
  in". The player listens twice, she asks to walk to the tree
  line — the player accepts (betrayal:accept → the walk, "you
  learn the shape of them a little better"), teaches Wild Black
  Cherry — a real transfer ("And I've been walking past it for
  weeks") — then she turns serious ("Listen. I need you to hear
  this before you go back out there"), the player heeds, she asks
  for a promise, and ends "I should go. Before I overthink this
  conversation too." + "This was good." Meaning, coherence,
  consequence: yes. Nit, not a defect: the thing she needs the
  player to hear is never named — the heed is about an unnamed
  danger. It reads as a worried person asking the player to be
  careful, not as a broken thread.
- **Shanice** (Fisherman): opens with a recall — "You said you
  believe we get through this — the alternative doesn't work.
  Still holding the line?" The player pivots, asks if she needs
  anything; she declines honestly ("No, really — it's handled").
  The player stays silent; the shared silence lands ("You say
  nothing. Neither do they, for a while — and it's fine."). Ends
  "Later." + "They're smiling as you go. 'Come back anytime.'"
  PASS. Same class as r217's Keisha check: the opener asserts
  prior player speech — a thread resume; the wedge sits during the
  42-day leg could have planted it, and the sitting's own
  transcript is coherent, so no fabrication is proven.

## Verdicts (leg: establishment, days 14–40)
- **Reachable:** YES. All five villages play the full 42 days;
  sittings, teaching, favors, contests, waves 2–4 all fire.
- **Fun:** YES. Conversations land, close, and resolve; the
  villages feel inhabited; the hungry seed's starvation story and
  the fat seed's plenty are the same game producing different
  villages.
- **Winnable:** ON TRACK for the leg. Villages survive, gear up,
  kill ~30 monsters each, bank spotter skill, and reach wave 4 on
  1/5 seeds. No village reached national/table — expected at day
  42. The binding watch is the favorless ask: a villager starving
  to death after asking for help three times is a winnability
  question only if the ask was answerable — and this run proves
  the game never named what she needed.

## Metric review (§14)
- **Q1 WANT-RAISE BAR WORKS.** It counts what the live game
  shows: 21% panel rate, no zero-raise seed, with the thin seed
  (101002) explained by village health rather than silence. The
  bar should stay as written for the next establishment run — and
  the next run's Q1 should be the no-kind shape: what fraction of
  raised asks carry a favor, and does the seed path explain the
  favorless ones.
- **Q2 bar WORKS on the new base.** 0/10 CUT with the goon
  ask-tag fix in the game. Keep as written.
- **Q3:** THIN-PROBE (2). The recap reframe is grammar, varied
  across sittings, not the over-represented formulation. No second
  formulation owed.
- **Scholar deaths 2/5 — earns a metric (r138 rule: third panel
  running).** r137: 2, r138: 2 (landing), r217: 2 (establishment),
  r221: 2 (establishment). All four panels sit at exactly 2, and
  r221's two are both "lost in the wild" — same as r217's Lauren.
  Proposed standing bar for the next establishment run: scholar
  deaths ≤2 per 5-seed panel = WATCH (at bar, report causes);
  ≥3 = investigate the wild-travel risk. The deaths are
  legitimate in-fiction (expeditions are dangerous) and succession
  worked both times — this is a watch, not a finding.
- **LADDER pace read, again:** the thin seed (101004, Ethan 5 XP)
  misses pace because it fought and starved all leg — spotter XP
  tracks foraging volume, not time (same mechanism as r210/r217).
  Not a bar failure.
- **Death telemetry names:** the known limitation stands (most
  death events name monsters as "Someone"); the census can say how
  many monsters died, not who killed them. Not a finding.
- **Pantry measures disagree (instrument note):** 101004's
  `pantryKcalEnd` (14,762) vs its daily trace (4,000 at d42) —
  the end snapshot jumps ~10k in the final day, likely a late
  delivery landing after the last daily push. The starvation story
  is proven by the trace (1,000–2,000 kcal for ~10 days), not
  erased by the end number. If a future run leans on pantryEnd,
  it should reconcile the two reads first.

## Telemetry check (§14)
`telemetry-check.js` vs `telemetry-baselines/establishment.json`
(metrics guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths):
- LOUD: guardrails.deaths 604 → 0; guardrails.popAlive 178 → 0;
  guardrails.pantryKcal 1210411 → 0.
- Adjudicated: the KNOWN schema mismatch (prereg-predicted) —
  the driver never emits `guardrails.*` fields, so the checker
  reads missing paths as 0. Not a game change; the r221 panel's
  deaths / pantry are all in-band in the analyzer (5/5 alive
  d40, pantries 14k–98k, 2 starvation deaths on 101004 — a real
  in-game event on a near-empty pantry, not a guardrail move).
  Baseline NOT rolled (prereg: never roll on a mismatch).

## Gate check
`node scripts/check.js --quick` (worktree, `--cacheDirectory=/tmp/jest-cache-playtest`):
**333 passed, 7 failed in 887s** (r217: 329/11; r138: 334/6). **0
attributable to this run** — this run's branch touches no src/js
(scripts + evidence only), and every failure is a standing signature
from r213/r217:
- 3 TIMEOUTS (exit null at 120.1s, check.js kill — no assertion
  failure; same load-flake signature r217 verified passes
  standalone): living-garden, trust-observer-neutrality,
  one-person-army.
- 3 staleness, verified in-worktree with `--only` (same failure
  text as r217): test-measurement-proof-update.js +
  test-measurement-workflow.js — measurement-proof staleness pair
  ("retained neutrality proof covers the current
  Game/controller/harness inputs"; 8 passed, 1 failed); 
  test-phone-frame-proof.js — phone-frame receipt staleness (3
  fails: retained browser input vs current source; boot inputs
  covered; current phone evidence required — index.html).
  Standing; refresh owed via `scripts/balance-proof-update.js` /
  `scripts/phone-frame-proof-update.js` (maintenance, not this run).
- 1 test-ladder-bundle-20261108.js — control "200 monster turns
  WITHOUT delivery fire the ambient raid — fires 0" (78 passed, 1
  failed). KNOWN SUBSTRATE, same signature as r213 deepening and
  r217 (the lingerer guard suppresses the ambient-raid control).
- Proof tests re-run on the final tip: r221 want-raise 7/7, r214
  mood-goodbye 10/10, r139 spotter 35/35. (The r221 proof test is
  a standalone instrument proof like r214/r139's — not green-listed,
  same as its predecessors.)

## Closeout
[MERGE-RESULT — filled at closeout]
