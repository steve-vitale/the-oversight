# sim-leanlink-rescue-confirm — CONFIRM of sim-leanlink-rescue (scale-onramp axis)

Run: fleshout-20261024T1822Z, arm sim-leanlink-rescue-confirm. Worktree:
`~/workspace/worktrees/sim-rescueconfirm`. Coordinator's confirm step for the
pilot GO CANDIDATE in `evidence/2026-10-24/sim-leanlink-rescue.md` (run
fleshout-20261024T1615Z). That file was read in full FIRST, before any sweep
below. This file's header was written BEFORE any confirm sweep.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/DESIGN.md` §scale: village → regional →
  national → global; transitions are moments not thresholds, never speedrunnable,
  verbs never change.
- `docs/MEASUREMENT.md` §§9–12, 14–15 bind this run.
- NOTE (as instructed, not invented): no canon doc covers the envoy→accord
  mechanism specifically. The mechanism comes from `src/js/hierarchy.js` and
  `scripts/policies/linkform.js`, `leadcourt.js`, which were read before the
  pilot designed anything; this confirm designs nothing new and changes no
  mechanism. `docs/SCALE.md` exists but does not document envoy→accord staging.
- This confirm is POLICY-SIDE ONLY: it does NOT modify competent.js, linkform.js,
  leadcourt.js, or any src/js. It does NOT flip any default. The armed policy
  (`scripts/policies/leanlinkrescue.js`, LEANLINKRESCUE=1, default OFF) is reused
  verbatim from the pilot commit; the sweep (`scripts/sim-leanlink-rescue-sweep.js`)
  is reused verbatim with a separate EVID dir so the confirm corpus never mixes
  with the pilot corpus.

## Pairing — defined exactly (copied from the pilot)

- Control = `scripts/policies/competent.js` (LEANLINKRESCUE unset).
- Armed = `scripts/policies/leanlinkrescue.js` with `LEANLINKRESCUE=1`
  (lean courtship, cap-3, rescue-tend-only: tends ONLY to active Haven-primary
  links whose trust is BELOW 40, once per week, pantry > 20,000 kcal; propose
  from day 25, 1/day, 7-day per-village cooldown, pantry > 12,000 kcal,
  tribute 4,000 kcal/week).
- Armed daily = `competent.daily` + `leanlinkRescueCourtship`. The delta
  armed-vs-control is EXACTLY the rescue courtship (proven by
  `scripts/test-sim-leanlink-rescue.js` T1: competent.daily contains NO scale
  verbs at all).

## Pre-registration (binding, §14 — copied from the pilot's confirm band and guardrails exactly; judge against this, never re-score mid-run)

- Confirm seeds: 73509–73516 × {control, armed} paired = 16 configs.
  Band verified unused at run start (no `s73509*`–`s73516*` file in
  `evidence/2026-10-24/` before this run; confirm corpus lives in the separate
  dir `evidence/2026-10-24/perseed-leanlinkrescue-confirm/`).
- Horizon: 180d death-aware (dead villages stop; +10d tail max).
- PRIMARY GO: national armed ≥ 2/8 AND armed national > control national.
  (`national` = FINAL rank national-or-global, exactly as the pilot defined it.
  Ever-reached national-or-better is reported alongside, never substituted.)
- Guardrails (binding — breach = KILLED even if the primary passes):
  - starvation deaths armed ≤ control + 2;
  - median survival armed ≥ 0.8 × control median;
  - no lever-caused death-mode spike (any cause with ≥ 3 deaths in armed and
    0 in control must be named and judged).
- A GO verdict means GO CANDIDATE, default-OFF only — landing this as competent
  play is a coordinator/Steve call, NOT made by this arm. No default flips.
- Also reported: end-state national AND ever-reached national-or-better side
  by side, wave reach (1–5), regional/table/wins, median/max survival,
  death-cause shares, starvation counts, tend counts (reported as ATTEMPTS —
  the policy counts tendLink calls, and the engine refuses some during
  mourning without moving trust), links formed, accords, counters, broken-status
  links COUNTED as dissolutions (the linkdrive correction), and §14c co-primary
  non-scholar combat deaths.
- Balanced panel (§15): ATTEMPT `scripts/balance-panel.js`; if it cannot ingest
  this corpus, state the inapplicability explicitly and fall back to the
  identical-seed paired comparison judged by the bar above (the pilot's panel
  attempt failed mechanically with "Unknown policy leanlinkrescue").
- Sense: at least one courtship transcript sequence read in EACH arm and judged
  below (sense runs are separate narration-on runs; their words only are
  judged, never their numbers).
- Sensitivity check (DISCLOSED, NEVER verdict-changing): seeds 73517–73520 ×
  {control, armed} may additionally be run, reported in a separate section,
  and NEVER used to overturn the 73509–73516 verdict in either direction.

## Anchor note (recorded before sweeping, not hidden)

- Confirm anchor: this worktree's HEAD at run start (recorded in the results
  section; per-seed JSONs carry `anchorCommit`). It differs from the pilot's
  anchor (34101b3cde24) because the pilot ran in its own worktree. The confirm
  verdict is valid anyway: control and armed are paired on the SAME anchor
  within the confirm band, so the judged comparison is control-vs-armed, not
  pilot-vs-confirm. Pilot-vs-confirm totals are directional only, never paired.

## Results — confirm band 73509–73516 (16 configs, anchor 01487cafe07b)

Confirm anchor: `01487cafe07b48603b2aa0b5443084192897de4b` (this worktree's HEAD
at run start; per-seed JSONs carry it; the proof test asserts anchor uniformity
across the corpus). All 16 confirm configs completed with zero sweep errors
(after the session-death resume described under Infrastructure notes).
`gameDays` 181 = survived the full 180d horizon (same day-count off-by-one as
the pilot, identical in both arms). `nat` = FINAL-rank national-or-global;
`peak` = best weekly-sampled rank reached during the run; `table` = progState
tableWaiting OR tableDone; `starv` = starvation deaths; `villCombat` =
non-scholar combat deaths; `tended` = tendLink ATTEMPTS (see the tend-attempt
note in the pilot evidence — the engine refuses some during mourning without
moving trust).

Paired per-seed table:

| seed | arm | days | end | final | peak | nat | table | wave | deaths | starv | villCombat | formed | maxSubs | finalSubs | tended |
|------|-----|------|-----|-------|------|-----|-------|------|--------|-------|------------|--------|----------|-----------|--------|
| 73509 | control | 104 | village-lost | village | village | 0 | 0 | 4 | 44 | 0 | 32 | 0 | 0 | 0 | 0 |
| 73509 | armed | 181 | survived | global | global | 1 | 1 | 3 | 35 | 0 | 25 | 3 | 3 | 3 | 41 |
| 73510 | control | 181 | survived | village | village | 0 | 0 | 4 | 30 | 0 | 24 | 0 | 0 | 0 | 0 |
| 73510 | armed | 173 | village-lost | regional | global | 0 | 1 | 4 | 45 | 1 | 32 | 3 | 3 | 3 | 51 |
| 73511 | control | 181 | survived | village | village | 0 | 0 | 4 | 31 | 1 | 21 | 0 | 0 | 0 | 0 |
| 73511 | armed | 181 | survived | global | global | 1 | 0 | 2 | 18 | 0 | 12 | 3 | 3 | 3 | 0 |
| 73512 | control | 181 | survived | village | village | 0 | 0 | 4 | 36 | 0 | 27 | 0 | 0 | 0 | 0 |
| 73512 | armed | 181 | survived | global | global | 1 | 1 | 4 | 52 | 0 | 41 | 4 | 3 | 3 | 16 |
| 73513 | control | 181 | survived | village | village | 0 | 0 | 3 | 28 | 0 | 23 | 0 | 0 | 0 | 0 |
| 73513 | armed | 146 | village-lost | regional | global | 0 | 1 | 5 | 50 | 0 | 40 | 3 | 3 | 3 | 0 |
| 73514 | control | 181 | survived | village | village | 0 | 0 | 4 | 32 | 0 | 26 | 0 | 0 | 0 | 0 |
| 73514 | armed | 181 | survived | global | global | 1 | 0 | 4 | 31 | 0 | 28 | 3 | 3 | 3 | 0 |
| 73515 | control | 181 | survived | village | village | 0 | 0 | 4 | 48 | 0 | 34 | 0 | 0 | 0 | 0 |
| 73515 | armed | 142 | village-lost | global | global | 1 | 1 | 4 | 37 | 0 | 26 | 3 | 3 | 3 | 0 |
| 73516 | control | 181 | survived | village | village | 0 | 0 | 4 | 29 | 0 | 23 | 0 | 0 | 0 | 0 |
| 73516 | armed | 104 | village-lost | global | global | 1 | 0 | 4 | 29 | 0 | 18 | 3 | 3 | 3 | 14 |

Totals — control: FINAL national 0/8, ever-national-or-better 0/8, regional
0/8, table 0/8, won 0/8, exiled 0/8; waves 3:1 / 4:7 / 5:0; median survival
181d, max 181d; deaths 278 (scholar 51, villager 227, villager-combat 210);
starvation 1; links formed 0; court counters all 0 (pairing holds).
Totals — armed: FINAL national 6/8 (all global: 73509, 73511, 73512, 73514,
73515, 73516), regional 8/8, table 5/8, won 0/8, exiled 0/8;
EVER-national-or-better 8/8 (73510 and 73513 peaked global, then decayed to
regional); waves 2:1 / 3:1 / 4:5 / 5:1; median survival 177d, max 181d;
deaths 297 (scholar 61, villager 236, villager-combat 222); starvation 1;
links formed 25, broken-status 0, dissolutions-combined 0; court: counters 2,
accords 24, national answers 11, global answers 10, proposed 25, tended
(attempts) 122, defense calls 0. Zero sweep errors on all 16 files.

Death-cause shares (totals across 8 seeds):
- control: villager combat 89, combat 103, the arena 41, monster 15,
  expedition 10, the expedition 2, dehydration 4, starvation 1, sickness 5,
  a wound that wouldn't close 1, contest 4, ambush 2, the night 1.
- armed: villager combat 69, combat 132, the arena 54, monster 16,
  expedition 7, contest 5, a wound that wouldn't close 3, the night 1,
  starvation 1, dehydration 2, sickness 5, ambush 2.
Combat in all its names (combat + villager combat + arena + monster + ambush)
dominates both arms, as in the pilot. Every armed cause also appears in
control — there is no armed-only cause at all, let alone a spike.

Tend trust distribution (122 attempts, all recorded pre-tend trusts): min 29,
max 39, buckets 20–29: 1, 30–39: 121; ZERO at or above 40 — the rescue-tend
gate held perfectly in the confirm corpus, as in the pilot. By seed: 73509:
41, 73510: 51, 73511: 0, 73512: 16, 73513: 0, 73514: 0, 73515: 0, 73516: 14.
Four armed seeds reached global with ZERO tends (73511, 73513, 73514, 73515),
and the heaviest-tended seed (73510, 51 attempts) still decayed from global to
regional. Reach in this band comes from proposals + accords, not from tend
volume; tend volume does not predict the hold. Same-trust repetition stacks
recur (73509: trust 35 ten times running; 73510: trusts 32/37 alternating for
dozens of attempts) — the pilot's mourning-refusal finding, reproduced, not
new: the counted attempts overstate effective tends, and the pantry cost is
lower than the attempt count implies.

## Verdict: GO CONFIRMED (confirm GO, with margin — default-OFF only)

Judged against the pre-registered header, no re-scoring:

- PRIMARY GO: national armed 6/8 ≥ 2/8 AND 6 > control 0 → PASSES, with
  margin. The pilot's threshold-edge fragility is retired on this band: the
  final-rank count (6/8) and the ever-reached count (8/8) agree directionally,
  and the margin is four seeds, not one.
- Starvation guardrail: armed 1 ≤ control 1 + 2 = 3 → PASSES (net diff 0).
  The single armed starvation death is on 73510; control's single starvation
  death is on 73511 — different seeds, no shared-substrate pair to note.
- Median guardrail: armed 177d ≥ 0.8 × control 181d = 144.8d (ratio 0.98) →
  PASSES.
- Spike guardrail: NO candidate — no cause has ≥ 3 deaths in armed and 0 in
  control (in fact no armed cause is absent from control at all). The clause
  does not trigger.
- §14c co-primary: non-scholar combat deaths armed 222 vs control 210 (+12,
  no spike); scholar deaths armed 61 vs control 51 (+10 — the armed villages
  lose more scholars, see Village assessment).
- Kill classification (§14a): no kill. GO CONFIRMED, default-OFF only —
  landing this as competent play is a coordinator/Steve call, NOT made by
  this arm. No default flips.
- Balanced panel (§15): ATTEMPTED and INAPPLICABLE, mechanically proven —
  `node scripts/balance-panel.js --policies leanlinkrescue --out <dir>` fails
  before any sim with "Error: Unknown policy leanlinkrescue" (POLICY_REGISTRY
  has `competent` and `leadcourt` but no `leanlinkrescue`; the LEANLINKRESCUE
  env gate is not a panel input). Same finding class as the pilot. Fallback
  used, as prescribed: the identical-seed paired comparison judged by the
  pre-registered bar.

## Mechanism: what the confirm adds to the pilot's story

- The pilot's decay gap (final 2/8 vs ever 6/8) NARROWS but does not close:
  final 6/8 vs ever 8/8. Two villages still climb to global and decay
  (73510, 73513), but six now HOLD global/national to the end — including
  73516, which dies at day 104 AT global (the village dies with the polity
  intact, not after losing it). The HOLD is stronger on this band than the
  pilot band, for no reason this arm can attribute to a mechanism change
  (same policy, different seeds): the hold's fragility is seed-dependent, and
  the pilot band happened to be a hard-hold band.
- Wave 5 reached in 1/8 armed (73513) and 0/8 control — the first wave-5
  sighting in any rescue corpus band (pilot: 0/16). It arrives with a global
  peak and a village death at day 146: wave 5 is reachable, not survivable,
  on this seed. The pre-existing wave-5 wall stands as a wall, with one
  crack in it.
- No link broke in the confirm (0 dissolved, 0 broken-status, vs the pilot's
  1 foreign broken link). Cap-3 saturation did not bite here: every armed
  seed held 3/3 Haven subordinates at the end (73512 formed 4 links but held
  3 subs — the 4th was a non-Haven-primary link).
- The survival cost of the climb is visible and must be named: armed
  villages survive the horizon only 4/8 vs control 7/8, and lose more scholars
  (61 vs 51). The climb does not buy survival — it buys rank. Combat
  attrition kills armed villages at global/regional just as it kills control
  villages at village. The scale wall as originally framed ("never reach
  national") is down on this band; what stands now is the survival wall
  behind it (reach without survival, table without a win).
- Table nuance (as the pilot): table 5/8 armed with won 0/16 — table waiting
  ≠ win. The beat-answering policy stops at waiting; no arm takes the table
  seat. The full chain (table → win) is NOT demonstrated, and that is the
  next blank, not this arm's.
- Defense calls: 0 staged in all 16 confirm configs (0/32 across pilot +
  confirm) — that courtship ingredient remains unmeasured in these bands,
  not proven absent from the game. Counters: 2 staged (73512, 73516) —
  counter play is barely exercised here either.

## Sensitivity check — seeds 73517–73520 (DISCLOSED, NEVER verdict-changing)

Reported separately, as pre-registered. This section did NOT enter the verdict
above and cannot overturn it in either direction. Full per-seed JSONs live in
the same confirm corpus dir (`perseed-leanlinkrescue-confirm/s73517*`–
`s73520*`); three armed files were rebuilt from PRINT_JSON stdout after the
EPERM flap blocked the writer (see Infrastructure notes) and verified by parse
+ field checks + the sweep's own resume criteria.

| seed | arm | days | end | final | peak | nat | table | wave | deaths | starv | villCombat | formed | tended |
|------|-----|------|-----|-------|------|-----|-------|------|--------|-------|------------|--------|--------|
| 73517 | control | 63 | village-lost | village | village | 0 | 0 | 3 | 25 | 3 | 16 | 0 | 0 |
| 73517 | armed | 63 | village-lost | village | village | 0 | 0 | 3 | 25 | 3 | 16 | 0 | 0 |
| 73518 | control | 181 | survived | village | village | 0 | 0 | 3 | 55 | 1 | 44 | 0 | 0 |
| 73518 | armed | 82 | village-lost | regional | regional | 0 | 0 | 3 | 30 | 3 | 18 | 3 | 1 |
| 73519 | control | 49 | village-lost | village | village | 0 | 0 | 2 | 16 | 3 | 11 | 0 | 0 |
| 73519 | armed | 181 | survived | regional | global | 0 | 1 | 4 | 34 | 0 | 25 | 3 | 26 |
| 73520 | control | 181 | survived | village | village | 0 | 0 | 3 | 26 | 0 | 21 | 0 | 0 |
| 73520 | armed | 181 | survived | national | national | 1 | 0 | 3 | 25 | 0 | 20 | 4 | 2 |

Sensitivity totals — final national armed 1/4 vs control 0/4;
ever-national-or-better armed 2/4 (73519 global peak, 73520 national held
from day 98 to day 175) vs control 0/4; table armed 1/4 vs 0/4; wins 0/8;
starvation armed 6 vs control 7; median survival armed 131.5d vs control
122d. Direction: consistent with the confirm (armed ≥ control on national,
starvation within). Notes: 73517 is substrate-identical in both arms (same
63 days, same 25 deaths, 0 links — the village dies before courtship can
matter, and the armed run adds nothing); 73518 armed dies at day 82 at
regional with 3 starvation deaths while its control survives — the one
sensitivity seed where the armed village does worse on survival, and its
starvation count (3) is the highest single-seed armed count in any rescue
band; 73520 armed is the cleanest hold in the whole rescue program (national
day 98 → day 175, 25 deaths, 0 starvation, only 2 tend attempts — a polity
that holds on accords and a rich pantry, not on tending).

## Sense verdict (SENSE-TESTING LAW: meaning, coherence, relevance, consequences)

Sense runs are separate narration-on runs (seed 73509, 100d, sense corpus dir
`perseed-leanlinkrescue-confirm-sense/`); their WORDS only are judged, never
their numbers.

- ARMED transcript (92 tight-filter lines): a coherent courtship story that
  matches the pilot's sense arc beat for beat, with two additions. Days
  25/26/27 — "⛓️ Nancy brings it home: Emberhold bows to Haven — one
  organization, us primary. Tribute: 4,000 kcal/week. The relationship starts
  at trust 30. Everything from here is earned." Day 27 — "Three fires bow to
  Haven. But a realm isn't leverage — it's seasons." Day 46 — Regional Dawn
  ("One fire was a village. Two fires is a NETWORK... Try not to starve
  twice as fast") plus the first rescue tends the same day ("🌾 Haven sends
  1,612 kcal of grain to Stonebridge's fire — not tribute, the other way
  around. Someone's grandmother over there will remember who fed her.
  (Trust +8.)"). Succession tests recur through the run — "Emberhold watches
  to see if Haven holds without its dead — and presses the tribute down to
  3,000 kcal/week while the chair is empty" (days 46, 54, 71, 89, with the
  pressed amount falling each time: 3,000 → 2,250 → 1,688 → 1,266 — the
  villages test harder as the chair stays empty, and the narration says so).
  Day 71 — the drift warning ("⚠️ Emberhold's fire is drifting from ours...
  Bonds don't mend themselves; a tended fire remembers who fed it.").
  Day 85 — First Court with a real choice (feast 5,000 kcal shared granary /
  host / cold ink), day 86 the shared granary opens (+10 with each fire),
  day 88 Mateo at the fire: "Speakers rode in, ate our grain, and called us
  a realm. A REALM. I keep saying it to hear how it sounds." Day 90 — the
  feast for the cameras ("Haven feasts for the cameras — 5,408 kcal of
  theater... Somewhere, the table makes a note."). VERDICT: SENSICAL — and
  the succession-test escalation (falling pressed tribute) is a
  consequence-bearing detail the pilot's sense run did not surface.
- CONTROL transcript (10 lines): ZERO Haven courtship lines — no proposes,
  no links, no tends, no court. But the game itself tells the silent player
  what is missing, day 90: "◈ THE TABLE — the ring of pale light flickers at
  the edge of the sky... and does not come. Not yet. The table is being set
  for those whose deeds are done, and yours are not done. The ledger still
  wants: a regional standing; the food-thesis deeds. The climb is not over."
  VERDICT: SENSICAL — and the contrast with the armed transcript is itself
  the finding, as in the pilot.
- Repetition notes (documented, not chased — outside this arm; already in
  the backlog from linkdrive/pilot, not duplicated): the villager line "My
  kid asked if the watchers have favorites" repeats verbatim across
  different speakers (Nancy, Gunther, Quinn, Mateo here); the weekly
  tribute-turn line repeats verbatim (amounts vary; ritual repetition,
  acceptable); Wren of Thornfield's aid offer repeats verbatim across visits
  (formulaic but functional — the aid beat, not courtship).

## Village assessment (assessor's account)

- What the villages looked like: control villages stay single-fire villages
  — 7/8 survive the full horizon, never link, never hear a court. Armed
  villages become realms: 3–4 links formed in every seed, courts held, camera
  feasts eaten — and then half still die (4/8 village-lost), two of them at
  global. The scale wall moved again from the pilot: from "reach national
  routinely, but don't yet HOLD it" (pilot) to "reach global routinely and
  hold it more often than not, but still die to combat attrition and still
  never win."
- Who thrived and why: villages whose trusts held high through the seasons
  (73509/73511/73512/73514 survived at global; 73520 in sensitivity held
  national from day 98 on a rich pantry with almost no tending). Who died and
  why: combat attrition everywhere (arena + combat dominate both arms' death
  shares), plus polity decay on 73510/73513 — the dead armed villages die
  WITH or AFTER their realms, not for lack of them.
- What knowledge/capabilities were missing: the win itself (table waiting
  5/8 confirm + 1/4 sensitivity, wins 0/24 across confirm + sensitivity);
  and survival at scale — what keeps a realm's people alive through the
  arena and the monster pressure once the polity exists. The next blank is
  survival-at-scale (and then the take-the-table policy), not a stronger
  courtship drive.
- Blank filled or documented: CONFIRMED in policy (default-OFF candidate) +
  DOCUMENTED. The pilot's GO CANDIDATE is now a confirmed candidate: cap-3
  lean courtship with rescue-tend-only reaches national/global at a fraction
  of linkdrive's tend cost without breaching the starvation bar, on two
  independent seed bands (pilot 73501–73508: final 2/8, ever 6/8; confirm
  73509–73516: final 6/8, ever 8/8; sensitivity 73517–73520: final 1/4, ever
  2/4 — all directionally consistent, none contradicting). Landing it as
  competent play remains a coordinator/Steve call.

## Metric review (§14 — required; revisions apply to the NEXT run, never this one)

- Metrics held: primary + guardrails judged exactly as pre-registered; no
  re-scoring. The spike clause had no candidate this run, so no judgment call
  was needed (contrast the pilot's 'the night' judgment).
- The median-guardrail question is CONTESTED by the sibling measurement arm
  (recorded here as instructed, without re-scoring this verdict): is median
  survival the right guardrail when the armed villages deliberately trade
  survival for rank (armed 4/8 survived vs control 7/8, yet the median
  guardrail passes at 0.98 because the deaths cluster at 104–173d)? The
  guardrail as written passes either way on this band, so the contest does
  not change this verdict — but a future run should decide whether the
  guardrail should be median, survival-rate, or scholar-death based. This
  run takes no position beyond recording the question.
- Proposed revisions for the NEXT run (not applied here): (1) report
  ever-reached rank alongside final rank — retained from the pilot; the
  confirm shows why (final 6/8 vs ever 8/8; sensitivity 73519's global peak
  with a regional final); (2) tend counts should count successful tends only
  (trust moved or tendedWeek set), not calls — mourning refusals inflate the
  count (reproduced here: 73509's 35×10 stack, 73510's 32/37 alternation);
  (3) starvation guardrail should count arm-only deaths (the sensitivity
  seed 73517's identical 3/3 starvation deaths in both arms pollute both
  sides); (4) table should split tableWaiting vs tableDone (waiting ≠ win —
  this run's 5/8 table with 0/24 wins across confirm + sensitivity shows
  why); (5) defense-call staging should be verified as a precondition before
  counting it as a courtship ingredient (0/32 across pilot + confirm);
  (6) the HOLD needs its own metric — final-vs-ever decay (2/8 confirm,
  1/4 sensitivity) is currently visible only by comparing two columns.

## Infrastructure notes

- Control sweep session death: the first control sweep's exec session was
  cleared mid-run (after seed 73512, no DONE line, no process left). The
  sweep's resume logic (skip files that parse with matching seed/arm/anchor/
  days/deaths) recovered cleanly: the re-run skipped 73509–73512 and ran
  73513–73516, finishing DONE with ran=4/resumed=4. No data loss.
- EPERM flap, sensitivity leg (the long pole of this run): after the confirm
  sweeps completed cleanly, the container EPERM write flap blocked the writer
  subprocess for the whole sensitivity-armed leg (first failure at the 73518
  write after 8 writer retries; three separate writer probes over ~1h all
  failed with WRITER-FAIL EPERM, exit 3, on both /tmp and evidence-dir
  targets). Recovery used the sweep's PRINT_JSON fallback exactly as designed:
  the full per-seed JSON prints to stdout BEFORE the file write, so the
  73518/73519/73520 armed JSONs were rebuilt verbatim from captured stdout
  via the tool file-write channel (which the flap does not block) and
  verified by parse + field checks + the sweep's own resume criteria
  (seed/arm/anchor/daysRequested/deaths array). Honest limit: the rebuilt
  files were NOT byte-compared against a writer-produced original, because
  no such original exists — the writer never produced one. A post-flap
  deterministic re-run should byte-compare them; the sims are deterministic,
  so a re-run must reproduce them exactly.
- SIGPIPE lesson (new, from this run): NEVER pipe sweep output through
  `head` — the first 73519 armed run died mid-print when head closed the
  pipe (PIPE-EXIT=1), losing that sim's JSON. The re-run without a pipe
  captured the full JSON and its header fields matched the killed run's
  partial print, supporting determinism.
- Redirect lesson (new, from this run): a redirect to a NOT-YET-EXISTING log
  file failed instantly once under the flap (empty log, EXIT=1 in 2s, node
  never ran). The workaround that worked was no redirect at all (session
  output) for the flap-period runs. Pre-creating the log file via the tool
  channel before redirecting may also work; untested.
- Determinism note: the 73519 armed sim ran twice (killed run + full run)
  and matched on every header field visible in the killed run's partial
  print (181d, regional, table 1, maxWave 4); the 73518 armed sim ran once
  (its JSON survived only in the log). No byte-compare was possible for
  either, for the reason above.
- Proof: `node scripts/test-sim-leanlink-rescue-confirm.js` — TEST-OK (T1
  pairing/delta source proof, T2 confirm corpus complete 16/16, T3
  recomputation of the pre-registered verdict, T4 no-trace, T5 functional
  gate proof on a stub Game; sensitivity corpus reported separately at 8/8).
- No [needs-eyes] on this commit: nothing in it changes feel, combat, or UI
  (no policy file modified at all in this run — the armed policy is reused
  verbatim from the pilot commit; this commit adds only the confirm proof
  test, the confirm evidence, and the confirm + sensitivity + sense corpora).

