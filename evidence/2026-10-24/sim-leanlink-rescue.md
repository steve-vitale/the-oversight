# sim-leanlink-rescue — lean courtship, cap-3, rescue-tend-only (scale-onramp axis)

Run: fleshout-20261024T1615Z, arm sim-leanlink-rescue. Worktree: `~/workspace/worktrees/sim-leanlink-rescue`.
Status: PRE-REGISTERED — header written before any sweep. Results appended below as they land.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/DESIGN.md` §scale: village → regional → national → global,
  transitions are moments not thresholds, never speedrunnable, verbs never change.
- `docs/MEASUREMENT.md` §§9–12, 14–15 bind this run.
- `src/js/hierarchy.js` gates (the mechanism, not a canon doc): national is a polity — LEAD =
  primary of ≥3 seasoned subordinates; seasoned = link 30+ days old AND trust 40+ (formed at 30;
  tending required); one rung per season; proposeLink scores courtship (≥55 accepts, 35–54
  counters with played terms, <35 declines); national/global beats are played with real costs
  and a REFUSE option; national is a live state (dissolve the realm and nationalLive clears).
- NOTE (as instructed, not invented): no canon doc covers the envoy→accord mechanism
  specifically. The mechanism in this arm comes from `src/js/hierarchy.js`,
  `scripts/policies/linkform.js` and `leadcourt.js`, which were read before designing anything.
  `docs/SCALE.md` exists but does not document envoy→accord staging.

## Pairing — defined exactly (the crux)

- Control = `scripts/policies/competent.js` (LEANLINKRESCUE unset).
- Armed = `scripts/policies/leanlinkrescue.js` with `LEANLINKRESCUE=1` (new file; default OFF).
- Armed daily = `competent.daily` + `leanlinkRescueCourtship`. Verified by reading the files
  before sweeping: `competent.daily` contains NO scale verbs at all (proven by
  `scripts/test-sim-leanlink-rescue.js` T1a). So the delta armed-vs-control is EXACTLY the
  rescue courtship, not just the cap difference.
- THE DELTA vs LINKFORM=2, EXACTLY (nothing else changes): subordinate cap 5 → 3, and tends
  ONLY to active Haven-primary links whose trust is BELOW 40 (the seasoned bar), once per week
  (tendedWeek check), pantry > 20,000 kcal. No tends to links at trust ≥ 40. Everything else
  is linkformCourtship verbatim: answer pending counters (sweeten if pantry > 25,000 kcal else
  accept), accords (gift), national beats (shape-mapped pick), global beats (feast), defense
  calls (send if pop >= 5 else refuse); propose from day 25, 1/day, 7-day per-village cooldown,
  pantry > 12,000 kcal, tribute 4,000 kcal/week.
- Do NOT modify competent.js, linkform.js, leadcourt.js, or any src/js. Do NOT flip any default.

## Pre-registration (binding, §14 — judge against this, never re-score mid-run)

- Pilot seeds: FRESH band 73501–73508 × {control, armed} paired = 16 configs. Band verified
  unused at run start (no `s7350*` file, no `perseed-leanlinkrescue/` dir in
  `evidence/2026-10-24/`). Sibling arms use the same band with different policy files — by
  design; the paired comparison is within-arm.
- Confirm ONLY on pilot GO: 73509–73516 × {control, armed}. No confirm spend on a pilot NO-GO.
- Horizon: 180d death-aware (dead villages stop; +10d tail max).
- PRIMARY GO: national armed ≥ 2/8 AND armed national > control national.
- Guardrails (binding — breach = KILLED even if the primary passes):
  - starvation deaths armed ≤ control + 2;
  - median survival armed ≥ 0.8 × control median;
  - no lever-caused death-mode spike (any cause with ≥ 3 deaths in armed and 0 in control must
    be named and judged).
- A GO verdict means GO CANDIDATE, default-OFF only — landing this as competent play is a
  coordinator/Steve call, NOT made by this arm. No default flips.
- Also reported: regional/table/wins, wave reach (1–5), median/max survival, death-cause
  shares, links formed, accords, counters, tend counts AND tend trust distribution (prove
  tends fired only below 40), broken-status links COUNTED as dissolutions (the linkdrive
  correction), and §14c co-primary non-scholar combat deaths.
- Balanced panel (§15): ATTEMPT `scripts/balance-panel.js`; if it cannot ingest this corpus,
  state the inapplicability explicitly and fall back to the identical-seed paired comparison
  judged by the bar above.
- Sense: at least one courtship transcript sequence read in EACH arm and judged below (sense
  runs are separate narration-on runs; their words only are judged, never their numbers).

## §14b pre-pilot substrate checklist (run BEFORE the pilot sweep)

Probe: armed, seed 73501, 60d, `perseed-leanlinkrescue/probe/s73501-armed.json` (NOT part of the
judged pilot corpus). All four checks PASS with one nuance:

- Contact: PASS — proposals fired days 25, 26, 27 (3 links formed, all Haven-primary); 3 accords
  answered; rank reached `regional` by the day-49 weekly sample.
- Pool sizing: PASS with a nuance — 3 other villages exist, all 3 known at day 60, so the cap-3
  polity saturates EXACTLY (pool = cap, zero headroom: unlike linkdrive's 4-village world, no
  4th link can absorb a broken link here). The verdict must be read with that ceiling in mind.
- Verb existence: PASS with a nuance — proposeLink, answerAccord fired in the probe;
  answerCounter / answerNationalChoice / answerGlobalChoice are code-present but not yet staged
  by day 60, which is expected. The rescue-tend verb itself is NOT exercised in the probe:
  tended = 0, because no link dipped below trust 40 — trusts read 40/40/40 at day 28 (formation
  30 + accord/tribute gains) and climb from there (41–52 by day 56). The tend gate is proven
  functionally by the stub test (T5: tends only trust<40 links), but whether dipping links
  occur at all in the pilot band is itself part of what the pilot measures: if trusts never
  dip, rescue-tends ≈ 0 and national must come from proposals + accords alone (the thin-seed
  73403 pattern). hierarchyState read every day by the sweep wrapper without errors.
- Horizon fit: PASS — courtship from day 25, Regional Dawn at bond 21+ days (regional by
  ~day 49), links season at 30+ days (~day 55–57), national needs regional + 30 days
  (earliest ~day 79). 180d leaves ~100d of national window. The calendar is not the binding
  constraint; the HOLD (trust ≥ 40 sustained across 3 links + pantry to feed the tribute) is.
- Probe deaths: 12 (2 scholar, 10 villager, 10 villager combat, 1 starvation) — a live,
  dangerous world, not a quiet one. The probe starvation death is NOT part of the judged
  corpus (probe runs are excluded from the paired comparison).

## Pilot results (16 configs, anchor 34101b3cde24, 180d death-aware)

Paired per-seed table (gameDays = scholar day at end; 181 = survived the full 180d horizon —
day-count off-by-one, identical in both arms; `nat` = FINAL-rank national-or-global;
`peak` = best weekly-sampled rank reached during the run; `table` = progState tableWaiting OR
tableDone; `starv` = starvation deaths; `villCombat` = non-scholar combat deaths):

| seed | arm | days | end | final | peak | nat | table | wave | deaths | starv | villCombat | formed | maxSubs | finalSubs | tended |
|------|-----|------|-----|-------|------|-----|-------|------|--------|-------|------------|--------|----------|-----------|--------|
| 73501 | control | 181 | survived | village | village | 0 | 0 | 4 | 45 | 1 | 38 | 0 | 0 | 0 | 0 |
| 73501 | armed | 180 | survived | regional | national | 0 | 1 | 4 | 51 | 3 | 33 | 3 | 3 | 3 | 12 |
| 73502 | control | 75 | village-lost | village | village | 0 | 0 | 4 | 30 | 0 | 15 | 0 | 0 | 0 | 0 |
| 73502 | armed | 103 | village-lost | regional | regional | 0 | 1 | 4 | 31 | 0 | 13 | 3 | 3 | 3 | 8 |
| 73503 | control | 172 | village-lost | village | village | 0 | 0 | 4 | 56 | 0 | 43 | 0 | 0 | 0 | 0 |
| 73503 | armed | 138 | village-lost | global | global | 1 | 1 | 3 | 41 | 0 | 32 | 3 | 3 | 3 | 5 |
| 73504 | control | 181 | survived | village | village | 0 | 0 | 3 | 42 | 1 | 26 | 0 | 0 | 0 | 0 |
| 73504 | armed | 123 | village-lost | regional | national | 0 | 1 | 4 | 38 | 0 | 30 | 3 | 3 | 3 | 4 |
| 73505 | control | 181 | survived | village | village | 0 | 0 | 4 | 31 | 0 | 21 | 0 | 0 | 0 | 0 |
| 73505 | armed | 167 | village-lost | regional | global | 0 | 1 | 4 | 45 | 0 | 30 | 3 | 3 | 3 | 5 |
| 73506 | control | 174 | village-lost | village | village | 0 | 0 | 3 | 34 | 0 | 23 | 0 | 0 | 0 | 0 |
| 73506 | armed | 181 | survived | regional | global | 0 | 0 | 4 | 29 | 0 | 19 | 3 | 3 | 3 | 13 |
| 73507 | control | 181 | survived | village | village | 0 | 0 | 3 | 32 | 1 | 25 | 0 | 0 | 0 | 0 |
| 73507 | armed | 181 | survived | regional | regional | 0 | 1 | 4 | 47 | 0 | 39 | 4 | 3 | 3 | 21 |
| 73508 | control | 180 | survived | village | village | 0 | 0 | 4 | 32 | 0 | 23 | 0 | 0 | 0 | 0 |
| 73508 | armed | 180 | survived | global | global | 1 | 0 | 4 | 31 | 0 | 24 | 3 | 3 | 3 | 0 |

Totals — control: national 0/8, regional 0/8, global 0/8, table 0/8, won 0/8, exiled 0/8;
ever-national-or-better 0/8; waves 3:3 / 4:5 / 5:0; median survival 180.5d, max 181d;
deaths 302 (scholar 65, villager 237, villager-combat 214); starvation 3; links formed 0;
court counters all 0 (pairing holds).
Totals — armed: FINAL national 2/8 (73503, 73508 global), regional 8/8, table 6/8, won 0/8,
exiled 0/8; EVER-national-or-better 6/8, ever-global 4/8; waves 3:1 / 4:7 / 5:0; median
survival 173.5d, max 181d; deaths 313 (scholar 63, villager 250, villager-combat 220);
starvation 3; links formed 25, broken-status 1 (a foreign village_0-primary link on 73507,
NOT a Haven subordinate — all Haven links stayed active), dissolutions-combined 1; court:
counters 1, accords 23, national answers 10, global answers 8, proposed 25, tended
(attempts) 68, defense calls 0. Zero sweep errors on all 16 files. Waves 1–2 universal (not
tabulated); wave 5 reached in 0/16 either arm — the pre-existing wave-5 wall, not this arm's
question.

Tend trust distribution (68 attempts, all recorded pre-tend trusts): min 10, max 39,
buckets 10–19: 8, 20–29: 8, 30–39: 52; ZERO at or above 40 — the rescue-tend gate held
perfectly in the corpus. By seed: 73501: 12, 73502: 8, 73503: 5, 73504: 4, 73505: 5,
73506: 13, 73507: 21, 73508: 0. Note 73508 reached global with ZERO tends, and 73503 reached
global with 5 — rescue-tending is cheap because most links hold above 40 on accords/tribute
alone. Versus linkdrive's 305 tends, this arm used 22% of the tend volume.

## Verdict: GO CANDIDATE (pilot GO, at the threshold edge; default-OFF only)

Judged against the pre-registered header, no re-scoring:

- PRIMARY GO: national armed 2/8 ≥ 2/8 AND 2 > control 0 → PASSES, exactly at the threshold.
  Fragile by one seed: had either 73503 or 73508 decayed a week earlier, the primary would
  fail on the final-rank count — while the ever-reached count (6/8) is robust. The GO is real
  but thin on the pre-registered definition; see Metric review.
- Starvation guardrail: armed 3 ≤ control 3 + 2 = 5 → PASSES (net diff 0). Paired detail:
  control's day-16 death on 73501 (same villager, same day) recurs identically in armed —
  substrate-determined. Armed 73501 carries 2 extra starvation deaths (days 67, 157, in
  scale-upkeep windows); armed scores 0 on 73504/73507 where control scores 1 each. The bar
  as written binds either way.
- Median guardrail: armed 173.5d ≥ 0.8 × control 180.5d = 144.4d (ratio 0.96) → PASSES.
- Spike guardrail: "the night" 3 armed / 0 control — NAMED and judged NOT lever-caused. No
  courtship verb (propose/tend/answer) moves the scholar, starts a fight, or changes night
  exposure, so there is no causal path from the lever to a night death; the earliest case
  (73503 day 33) predates regional (day 49), before any polity effect exists; all three are
  scholar deaths (the village continues under a successor). The exact engine source of the
  'the night' cause string was not located by grep — recorded honestly, not assumed. The
  spike clause's "if lever-caused, KILLED" does not trigger. Singletons below threshold also
  noted: 'alien' 1, 'Night Court' 1, 'thirst' 1 (all armed, all pre-national days 31–38).
- §14c co-primary: non-scholar combat deaths armed 220 vs control 214 (+6, no spike);
  scholar deaths armed 63 vs control 65 (fewer).
- Kill classification (§14a): no kill. GO CANDIDATE, default-OFF only — landing this as
  competent play is a coordinator/Steve call, NOT made by this arm. No default flips.
- Confirm: pilot GO authorizes the 73509–73516 confirm band, which this run did NOT spend
  (pilot verdict is the deliverable; the confirm is the coordinator's next step, and is
  strongly recommended before any landing discussion given the threshold-edge primary).

## Mechanism: what the lever costs and where it bites

- The rescue-tend thesis holds: tending only dipping links costs a fraction of linkdrive's
  all-links weekly tends (68 attempts vs 305) while keeping most of the reach — final
  national 2/8 vs linkdrive's 7/8, ever-national 6/8 vs linkdrive's 7/8 final (different seed
  bands, so the comparison is directional, not paired). The gap between final (2/8) and ever
  (6/8) is DECAY, not failure to reach: 73501 (national days 77–133, then regional),
  73504 (national, then regional), 73505 and 73506 (global peaks, then regional) all climbed
  and then lost the polity. National is a live state — the HOLD decays when trusts slip
  (73501's trusts fell to 2/20/22 by day 175) even with rescue tends firing. Cap 3 with a
  3-village pool has zero headroom: any dip below the seasoned bar on one link threatens the
  whole polity, where linkdrive's cap-5 headroom absorbed broken links.
- Starvation did NOT repeat linkdrive's breach: the lean tend bill plus tribute did not push
  starvation above control (3 vs 3). The binding cost in this band is not pantry — it is the
  HOLD (trust decay over seasons) and combat attrition (arena + combat dominate death shares
  in both arms, as in linkdrive).
- Tend-attempt honesty correction (instrument finding, now in sim-findings.md): the sweep's
  `tended` counts tendLink CALLS, not successful tends. The engine refuses during a
  subordinate's mourning without setting tendedWeek, so repeated same-trust attempts stack
  (73501 days 68–74 at trust 38; 73507 days 115–121 at trusts 38/10) while no grain moves.
  Effective tends are FEWER than 68, and the pantry cost is lower than the attempt count
  implies. The gate proof (all attempts below 40) is unaffected — refusals also occur below 40.
  The mourning-refusal pattern is itself evidence the HOLD is fragile around speaker deaths:
  the week a link most needs grain is the week grain is refused.
- Table nuance (as linkdrive): table 6/8 armed with won 0/16 — table waiting ≠ win. The
  beat-answering policy stops at waiting; no arm takes the table seat. The full chain
  (table → win) is NOT demonstrated, and that is the next blank, not this arm's.
- Defense calls: 0 staged in all 16 configs — that courtship ingredient is unmeasured in
  this band, not proven absent from the game. Counters: 1 staged (73507) — counter play is
  barely exercised here either.

## Sense verdict (SENSE-TESTING LAW: meaning, coherence, relevance, consequences)

Sense runs are separate narration-on runs (seed 73501, 100d); their WORDS only are judged,
never their numbers.

- ARMED transcript (73 tight-filter lines): a coherent courtship story, and the arm's thesis
  in words. Days 25/26/27 — "⛓️ Larisa brings it home: Emberhold bows to Haven — one
  organization, us primary. Tribute: 4,000 kcal/week. The relationship starts at trust 30.
  Everything from here is earned." Day 27 — "Three fires bow to Haven. But a realm isn't
  leverage — it's seasons. These bonds are young; tend them, keep the trust, and the court
  will come." Day 46 — Regional Dawn: "One fire was a village. Two fires is a NETWORK...
  Try not to starve twice as fast." Day 67 — succession test, villages reacting to a leader
  death: "Emberhold watches to see if Haven holds without its dead — and presses the tribute
  down to 3,000 kcal/week while the chair is empty. They'll test the link. Count on it."
  Day 68 — the drift warning the rescue-tend exists for: "⚠️ Stonebridge's fire is drifting
  from ours... Bonds don't mend themselves; a tended fire remembers who fed it." Day 74 —
  the rescue tend lands exactly on the drifting link: "🌾 Haven sends 1,530 kcal of grain to
  Stonebridge's fire — not tribute, the other way around. Someone's grandmother over there
  will remember who fed her. (Trust +8.)" Day 76 — First Court: "Four fires. One head.
  GOVERNANCE LAYER: online... You built a realm." with a real choice (feast 5,000 kcal shared
  granary / host / cold ink); the policy feasts (day 77: shared granary opens, +10 with each
  fire). Every beat has a real cost, a named speaker, and a consequence. VERDICT: SENSICAL —
  and the warning→tend→court sequence is exactly the rescue-tend mechanism narrated.
- CONTROL transcript (31 lines): ZERO Haven courtship lines — no proposes, no links, no
  tends, no court. But the game itself tells the silent player what is missing, day 90:
  "◈ THE TABLE — the ring of pale light flickers at the edge of the sky... and does not
  come. Not yet. The table is being set for those whose deeds are done, and yours are not
  done. The ledger still wants: a regional standing; the food-thesis deeds. The climb is
  not over." VERDICT: SENSICAL — and the contrast with the armed transcript is itself the
  finding: competent play without courtship hears the climb described and never joins it.
- Repetition notes (documented, not chased — outside this arm; already in the backlog from
  linkdrive, not duplicated): the villager line "My kid asked if the watchers have favorites"
  repeats verbatim across different speakers (Miguel, Hassan, Liam, Nora here); the weekly
  tribute-turn line repeats verbatim (amounts vary; ritual repetition, acceptable).

## Village assessment (assessor's account)

- What the villages looked like: control villages stay single-fire villages — they survive
  the full 181d or die at ~75–174d, never link, never hear a court. Armed villages become
  realms: 3–4 links formed in every seed, courts held, camera feasts eaten — and then most
  still die or decay (5/8 village-lost; 4 of the 6 ever-national villages decayed to
  regional by the end). The scale wall moved: from "never reach national" (0/8 control here,
  0/16 rerunclock) to "reach national/global routinely, but don't yet HOLD it or convert it
  into survival or a win."
- Who thrived and why: villages whose trusts held ≥ 40 through the seasons (73503, 73508
  held global to the end; 73501/73506 survived at regional after national peaks). Who died
  and why: combat attrition everywhere (arena + combat dominate both arms' death shares),
  plus polity decay — the dead armed villages die WITH or AFTER their realms (73503 died at
  global; 73505 died at regional after a global peak).
- What knowledge/capabilities were missing: the win itself (table waiting 6/8, wins 0/16);
  and the HOLD — what keeps a 3-link polity seasoned through speaker deaths and trust decay
  when the tend week refuses grain during mourning. The next blank is hold-durability (and
  then the take-the-table policy), not a stronger courtship drive.
- Blank filled or documented: FILLED in policy (default-OFF candidate) + DOCUMENTED. The
  rescue-tend policy file lands as a default-OFF instrument: it proves cap-3 lean courtship
  reaches national at a fraction of linkdrive's tend cost without breaching the starvation
  bar. Landing it as competent play is a coordinator/Steve call.

## Metric review (§14 — required; revisions apply to the NEXT run, never this one)

- Metrics held: primary + guardrails judged exactly as pre-registered; no re-scoring. The
  spike clause was applied as written (named + judged, not lever-caused, so non-killing).
- Proposed revisions for the NEXT run (not applied here): (1) report ever-reached rank
  alongside final rank — final-rank national (2/8) understates reach (ever 6/8) and hides
  decay; the sibling sim-leanlink arm already filed this as a backlog item, and this run
  independently reproduces it; (2) tend counts should count successful tends only (trust
  moved or tendedWeek set), not calls — mourning refusals inflate the count (filed in
  sim-findings.md by this arm); (3) starvation guardrail should count arm-only deaths
  (matched-substrate deaths like 73501 day 16 pollute both sides); (4) links.dissolved
  should count broken-status links (done here: combined = 1, a foreign link); (5) table
  should split tableWaiting vs tableDone (waiting ≠ win — this run's 6/8 table with 0/16
  wins shows why); (6) defense-call staging should be verified as a precondition before
  counting it as a courtship ingredient (0/16 here); (7) confirm the 'the night' death-cause
  source in the engine so the spike clause can be judged on mechanism, not on absence of a
  causal path.
- Balanced panel (§15): ATTEMPTED and INAPPLICABLE, mechanically proven — running
  `scripts/balance-panel.js --policies leanlinkrescue` fails before any sim with
  "Error: Unknown policy leanlinkrescue" (POLICY_REGISTRY has `competent` and `leadcourt`
  but no `leanlinkrescue`; LEANLINKRESCUE env is not a panel input; panel before/after is
  Game-root based while this lever is env-based). Same finding class as the linkdrive
  panel inapplicability. Fallback used, as prescribed: the identical-seed paired comparison
  judged by the pre-registered bar. The empty panel-attempt dir was removed, not committed.

## Infrastructure notes

- Writes: per-seed JSONs went through the chunked writer subprocess
  (scripts/sim-postunlock2-b-writer.js, read-only reuse — hash-verified). Two EPERM-flap
  incidents, both recovered with no data loss: (a) the armed sweep's first run died at the
  73503 write after 8 writer retries (the sim result existed only in memory and was lost,
  but the seed re-ran deterministically into a valid file); (b) a resume run died in 2.5s at
  startup for reasons never established (a later identical foreground run worked). The
  flap also blocked direct exec-subprocess writes to /tmp and the worktree for ~15 minutes
  while the tool's own file writes kept working — flap scope is process-dependent, not
  filesystem-wide. Mitigation added to the sweep (not the lever): PRINT_JSON=1 prints the
  full per-seed JSON to stdout before the file write, so a write-flap failure loses no data.
- Sense-launch lesson: the first sense launch died instantly because the shell redirect
  targeted a file inside a not-yet-created directory — create the EVID dir before redirecting
  into it (the sweep's own mkdirSync runs too late for the shell's redirect).
- Determinism: the lost 73503 armed run's re-run produced the judged corpus file; the
  linkdrive precedent (byte-identical control re-run) supports treating re-runs as identical,
  but this arm did not itself byte-compare the lost run (its JSON never existed on disk).
- Proof: `node scripts/test-sim-leanlink-rescue.js` — TEST-OK (T1 pairing/delta source
  proof, T2 corpus completeness 16/16, T3 recomputation, T4 no-trace, T5 functional gate
  proof on a stub Game).
- No confirm spend (pilot GO; confirm band 73509–73516 authorized for the coordinator's next
  step). No [needs-eyes] on the landing commit: nothing in this commit changes feel, combat,
  or UI (policy-side default-OFF instrument + evidence + proof only).
