# sim-linkdrive — LINKFORM=2 overcourt on a competent substrate (scale-onramp axis)

Run: fleshout-20261024T1347Z, arm sim-linkdrive. Worktree: `~/workspace/worktrees/sim-linkdrive`.
Base anchor at start: `eb75e0244` (full HEAD recorded in every per-seed JSON; sibling arms sit on
`00de00d12` while master has since moved — the within-arm paired comparison is base-consistent
regardless, so a base difference does not invalidate the verdict).
Status: PRE-REGISTERED — header written before any sweep. Results appended below as they land.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/DESIGN.md` §scale: village → regional → national → global,
  transitions are moments not thresholds, never speedrunnable, verbs never change.
- `docs/MEASUREMENT.md` §§9–12, 14–15 bind this run. `src/js/hierarchy.js` gates (the canon the
  lever plays against): national is a polity — LEAD = primary of ≥3 seasoned subordinates;
  seasoned = link 30+ days old AND trust 40+ (formed at 30; tending required); one rung per season
  (national cannot stage until regional for a full season, networkLiveDay + 30); Regional Dawn at
  bond 21+ days; proposeLink scores courtship (≥55 accepts, 35–54 counters with played terms,
  <35 declines); counter-terms played, never rolled; national/global beats are played with real
  costs and a REFUSE option; national is a live state (dissolve the realm and nationalLive clears).
- LINKFORM=1 history (2026-10-23, sim-links-diag): KILLED at pilot — cadence (propose from day 15,
  2/day, tend every 3 days, always sweeten) BACKFIRED (starvation 6 vs 2, dissolutions 4 vs 1).
  The binding is the HOLD, not the attempt rate. Mode 1 is never used here in any form; no policy
  defaults are changed by this arm.

## Pairing — defined exactly (the crux)

- Control = `scripts/policies/competent.js` (LINKFORM unset).
- Armed = `scripts/policies/linkform.js` with `LINKFORM=2` (overcourt).
- linkform mode-2 daily = `competent.daily` + `linkformCourtship`. Verified by reading both files
  before sweeping: `competent.daily` contains NO scale verbs at all — no `proposeLink`,
  `tendLink`, `answerCounter`, `answerAccord`, `answerNationalChoice`, `answerGlobalChoice`, or
  `hierarchyState` (it does answer the fire-network aid beats, a different system, and takes
  System ability offers). `leadcourt.js` (mode 0, NOT used as control — it answers a different
  question) shares linkformCourtship's answering/tending code verbatim except the subordinate cap.
- So the delta armed-vs-control is EXACTLY the mode-2 courtship: answer pending counters
  (sweeten if pantry > 25,000 kcal else accept), accords (gift), national beats (shape-mapped
  pick), global beats (feast); tend Haven-primary links weekly when pantry > 20,000 kcal;
  propose from day 25, 1/day, 7-day per-village cooldown, tribute 4,000 kcal/week, subordinate
  cap 5 (overcourt) instead of leadcourt's 3. It is NOT just the cap difference — control has
  no courtship at all, so the delta is the whole courtship with the overcourt cap.
- Do NOT use leadcourt (mode 0) as control. Do NOT flip any default. Do NOT change linkform.js
  or competent.js (both read-only for this arm).

## Pre-registration (binding, §14 — judge against this, never re-score mid-run)

- Pilot seeds: FRESH band 73401–73408 × {control, armed} paired = 16 configs. Band verified unused
  at run start (no `s7340*` or `linkdrive` file in `evidence/2026-10-24/`, no `perseed-linkdrive/` dir).
- Confirm (ONLY on pilot GO, §9): 73409–73416 × {control, armed} = 16 more. No confirm spend on a
  pilot NO-GO.
- Horizon: 180d death-aware (dead villages stop; runDays engine endings; no fixed-200d extension).
- PRIMARY GO: national armed ≥ 2/8 AND armed national > control national.
- Guardrails (binding — breach = KILLED even if the primary passes):
  - median survival armed ≥ 0.8 × control median;
  - starvation deaths armed ≤ control + 2;
  - no lever-caused death-mode spike (any death cause with ≥ 3 deaths in armed and 0 in control
    must be named and judged — if lever-caused, KILLED).
- Killed arms leave no trace of the lever: LINKFORM env needs no new policy file (armed is
  linkform.js + env), so a kill means no landing — but instruments + evidence + proof DO land
  documenting the kill.
- A GO verdict means GO CANDIDATE, default-OFF, only — landing this as competent play is a
  coordinator/Steve call, NOT made by this arm (precedent: singletier signal GO). No default flips.
- Also reported: regional/table/wins, wave reach, median/max survival, death-cause shares, link
  formation counts, accord counts, trust trajectories. §14c: villager (non-scholar) combat deaths
  are co-primary alongside scholar metrics.
- Balanced panel (§15): ATTEMPTED; if `scripts/balance-panel.js` cannot ingest this corpus (the
  prior singletier/foreignhelp finding), state the inapplicability explicitly and fall back to the
  identical-seed paired comparison judged by the pre-registered bar above.
- Sense: at least one courtship transcript sequence read in EACH arm and judged below (sense runs
  are separate narration-on runs; their words only are judged, never their numbers).

## §14b pre-pilot substrate checklist (run BEFORE the pilot sweep)

Probe: armed, seed 73401, 60d, `perseed-linkdrive/probe/s73401-armed.json` (NOT part of the judged
pilot corpus). All four checks PASS — the pilot is not measuring nothing.

- Contact: PASS — proposals fired days 25, 26, 35 (3 links formed, all Haven-primary, trust 30 at
  formation); 3 accords answered; 16 tends; rank reached `regional` by the day-49 weekly sample.
- Pool sizing: PASS with a nuance — 4 other villages exist, 3 known at day 60; the national bar
  needs only ≥3 seasoned subs, so the pool covers the bar. Nuance: the overcourt cap of 5 cannot
  saturate in a 4-village world (max 4 subs even if all known) — vs leadcourt's cap 3, the
  overcourt headroom in this seed is exactly ONE extra link (the 4th). The verdict must be read
  with that ceiling in mind: a 5-link polity is not on the table here.
- Verb existence: PASS — proposeLink, tendLink, answerAccord all fired in the probe;
  answerCounter / answerNationalChoice / answerGlobalChoice are code-present (linkform.js,
  hierarchy.js) but not yet staged by day 60, which is expected (counters arrive on proposals,
  national/global beats only after a seasoned polity). hierarchyState read every day by the
  sweep wrapper without errors.
- Horizon fit: PASS — courtship from day 25, Regional Dawn at bond 21+ days (regional by ~day 49),
  links season at 30+ days (day-25 links season ~day 55), national needs regional + 30 days
  (earliest ~day 79). 180d leaves ~100d of national window. The calendar is not the binding
  constraint; the HOLD (trust ≥ 40 sustained across 3 links + pantry to feed the tribute) is.
- Probe trust trajectory (weekly): day 28 trusts [56, 56]; day 35 [65, 65, 30]; day 42 [66, 70, 49];
  day 49 [69, 77, 52]; day 56 [78, 90, 61] — weekly tends lift trust fast, so the seasoning bar
  (40) is cleared early on tended links. Probe deaths: 15 (1 scholar, 14 villager, 10 villager
  combat) — the substrate is a live, dangerous world, not a quiet one.

## Pilot results (16 configs, anchor eb75e0244ff6, 180d death-aware)

Paired per-seed table (gameDays = scholar day at end; 181 = survived the full 180d horizon —
day-count off-by-one, identical in both arms; `table` = progState tableWaiting OR tableDone):

| seed | arm | days | end | rank | nat | table | wave | deaths | starv | villCombat | formed | maxSubs | finalSubs |
|------|-----|------|-----|------|-----|-------|------|--------|-------|------------|--------|----------|-----------|
| 73401 | control | 181 | survived | village | 0 | 0 | 4 | 43 | 0 | 29 | 0 | 0 | 0 |
| 73401 | armed | 135 | village-lost | global | 1 | 1 | 4 | 50 | 1 | 32 | 3 | 3 | 3 |
| 73402 | control | 181 | survived | village | 0 | 0 | 3 | 38 | 1 | 31 | 0 | 0 | 0 |
| 73402 | armed | 181 | survived | global | 1 | 0 | 4 | 53 | 1 | 43 | 5 | 5 | 5 |
| 73403 | control | 181 | survived | village | 0 | 0 | 3 | 36 | 0 | 28 | 0 | 0 | 0 |
| 73403 | armed | 135 | village-lost | national | 1 | 0 | 4 | 36 | 2 | 24 | 5 | 5 | 5 |
| 73404 | control | 119 | village-lost | village | 0 | 0 | 3 | 28 | 0 | 24 | 0 | 0 | 0 |
| 73404 | armed | 117 | village-lost | global | 1 | 1 | 4 | 42 | 0 | 30 | 5 | 5 | 5 |
| 73405 | control | 181 | survived | village | 0 | 0 | 4 | 26 | 0 | 17 | 0 | 0 | 0 |
| 73405 | armed | 181 | survived | national | 1 | 0 | 4 | 44 | 0 | 33 | 4 | 4 | 4 |
| 73406 | control | 110 | village-lost | village | 0 | 0 | 4 | 39 | 0 | 25 | 0 | 0 | 0 |
| 73406 | armed | 146 | village-lost | global | 1 | 1 | 4 | 43 | 0 | 27 | 6 | 5 | 4 |
| 73407 | control | 112 | village-lost | village | 0 | 0 | 4 | 42 | 0 | 31 | 0 | 0 | 0 |
| 73407 | armed | 181 | survived | global | 1 | 1 | 3 | 43 | 1 | 31 | 5 | 5 | 5 |
| 73408 | control | 114 | village-lost | village | 0 | 0 | 4 | 31 | 0 | 17 | 0 | 0 | 0 |
| 73408 | armed | 136 | village-lost | regional | 0 | 1 | 3 | 37 | 0 | 26 | 5 | 4 | 3 |

Totals — control: national 0/8, regional 0/8, global 0/8, table 0/8, won 0/8, exiled 0/8;
waves 3:3 / 4:5; median survival 150d, max 181d; deaths 283 (scholar 55, villager 228,
villager-combat 202); starvation 1; links formed 0; court counters all 0 (pairing holds).
Totals — armed: national 7/8, regional 8/8, global 5/8, table 5/8, won 0/8, exiled 0/8;
waves 3:2 / 4:6; median survival 141d, max 181d; deaths 348 (scholar 66, villager 282,
villager-combat 246); starvation 5; links formed 38, vanished 0 (see broken-link correction
below); court: counters 2, accords 28, national answers 8, global answers 5, proposed 38,
tended 305, defense calls 0. Zero sweep errors on all 16 files. Waves 1–2 universal (not
tabulated); wave 5 reached in 0/16 either arm — the pre-existing wave-5 wall, not this arm's
question.

## Verdict: KILLED-AT-PILOT (binding guardrail breach; primary GO passed)

Judged against the pre-registered header, no re-scoring:

- PRIMARY GO: national armed 7/8 ≥ 2/8 AND 7 > control 0 → PASSES. The concept works
  decisively: on this substrate, a link/courtship drive moves national from 0 to 7/8 (and
  global to 5/8, table to 5/8) where pure competent reached 0/16 in rerunclock and 0/8 here.
- Median guardrail: armed 141d ≥ 0.8 × control 150d = 120d (ratio 0.94) → PASSES.
- Starvation guardrail: armed 5 ≤ control 1 + 2 = 3? NO — diff +4 → BREACH. Binding rule:
  breach = KILLED even if the primary passes. Verdict is therefore KILLED-AT-PILOT.
- Spike guardrail: "the phoenix link" 3 armed / 0 control — NAMED and judged NOT lever-caused.
  It is a godhood/show mechanic (a villager burns via the phoenix link; src/js/game.js
  phoenix-link path), not a courtship verb: all 3 deaths are one show event on days 176–178
  in seed 73405. Courtship stages no phoenix links. It rides on reaching national (a show
  beat in a high-rank village), not on tribute/tend spending — so the spike clause's
  "if lever-caused, KILLED" does not trigger on it. (Caveat recorded: show exposure does
  grow with rank, so the spike is a consequence of success, not a lever cost.)
- Kill classification (§14a): GUARDRAIL KILL, not concept-dead on the primary. The concept
  succeeded; the pre-registered cost bar failed. No confirm spend: pilot NO-GO means the
  73409–73416 confirm band is NOT run, per the header.
- Robustness of the breach (no re-scoring, just checking the kill isn't an artifact):
  control's only starvation death (73402 day 35, villager rafael_torres) recurs IDENTICALLY
  in armed 73402 day 35 — substrate-determined, not lever-caused. Excluding that matched
  death, armed-only starvation deaths are still 4 vs control-only 0, still above the +2
  allowance. The breach survives the fairest causal adjustment; the bar as written binds
  either way.

## Mechanism: what the lever costs and where it bites

- The lever's food upkeep is real: tribute 4,000 kcal/week/link + tend 1,500 kcal/week/link +
  accord gifts. At 5 links that is 27,500 kcal/week before the village eats. The System
  itself says it at the Regional Dawn: "Try not to starve twice as fast."
- Starvation deaths (all villagers, never the scholar): 73401 d43, 73402 d35 (matched in
  control — substrate), 73403 d115 + d121, 73407 d160. The early two precede/overlap
  formation (substrate hunger). The late three sit in scale-upkeep windows: 73407's pantry
  collapsed 51,077 → 5,160 kcal between days 147–168 while trusts held 85–100, with the
  starvation on day 160 inside the collapse; 73403's two deaths came in a thin-pantry realm
  (pantry mostly 1k–19k, tends never fired because the tend gate needs >20,000 kcal).
- Tends are NOT the load-bearing ingredient on thin-pantry seeds: 73403 reached national
  with tended = 0 all run (pantry never cleared the tend gate), via proposals + accord
  answers + national answers alone, with trusts holding 38–67. On rich seeds tends do the
  heavy lifting (73407: 133 tends; trusts to 100).
- Broken-link correction (instrument honesty): the corpus field `links.dissolved = 0`
  counts links that VANISHED from hierarchyState only. Links in `broken` status at end DID
  occur: 73406 (2: one foreign village_2-primary link, one Haven link at trust 16) and
  73408 (2: one village_0-primary, one Haven link at trust 19). The overcourt HOLD mechanism
  still shows: 73406 held global with 4 active subs despite 2 broken links (5-link headroom
  absorbed the loss — exactly the overcourt thesis); 73408 degraded regional (4 → 3 active
  subs, trusts to 0, pantry 0 by day 126) but did not fully dissolve. Future runs should
  count broken-status links as dissolutions; this run reports both numbers and does not
  re-score on the corrected count.
- Table nuance: the sweep's `table` flag is progState tableWaiting OR tableDone — the Arc-IV
  seat bar (arc ≥ 4 + full/lesser seat), not national-answered only. Seed 73408 reached
  table = 1 with ZERO national answers and a final rank of regional: the table prices the
  run, it is not national-gated. Won = 0/16 in both arms: table waiting ≠ win. The policy
  answers beats but never takes the table seat — the full chain (table → win) is NOT
  demonstrated by either arm, and that is the next blank, not this arm's.
- Defense calls: 0 staged in all 16 configs — that courtship ingredient is unmeasured in
  this band, not proven absent from the game.

## Sense verdict (SENSE-TESTING LAW: meaning, coherence, relevance, consequences)

Sense runs are separate narration-on runs (seed 73401, 100d); their WORDS only are judged,
never their numbers.

- ARMED transcript (103 tight-filter lines): a coherent courtship story, not a count.
  Day 25/26/35 — "⛓️ August brings it home: Emberhold bows to Haven — one organization, us
  primary. Tribute: 4,000 kcal/week. The relationship starts at trust 30. Everything from
  here is earned." Day 35 — "Three fires bow to Haven. But a realm isn't leverage — it's
  seasons. These bonds are young; tend them, keep the trust, and the court will come."
  Weekly tends — "Haven sends 1,500 kcal of grain to Emberhold's fire — not tribute, the
  other way around. Someone's grandmother over there will remember who fed her.
  (Trust +8.)" Tribute wagons turn at the gate when shelves are full ("Eat well... That IS
  your tribute this week. (Trust +1.)") — the engine refusing tribute honestly, which is
  why trusts climb on tends, not tribute. Day 46 — Regional Dawn: "One fire was a village.
  Two fires is a NETWORK. Coordination layer: online... Try not to starve twice as fast."
  Day 76 — First Court: "Four fires. One head. GOVERNANCE LAYER: online... You built a
  realm." with a real choice (feast 5,000 kcal shared granary / host / cold ink); the policy
  feasts (day 77: shared granary opens, +10 with each fire; "Codex: The Watchers: the world
  feed wants Haven."), day 78: "Haven feasts for the cameras — 5,028 kcal of theater...
  Somewhere, the table makes a note." Every beat has a real cost, a named speaker, and a
  consequence. VERDICT: SENSICAL — the courtship reads as played diplomacy, not a meter.
- CONTROL transcript (600 broad-filter lines, scanned for courtship keywords): ZERO Haven
  courtship lines — no proposes, no links, no tends, no court. But the WORLD climbs around
  the silent player: traders report "three fires walk as ONE now. They've got a speaker for
  SPEAKERS" and "FOUR fires under one head. They call it a REALM. Tribute flows uphill like
  a river"; foreign speakers send runners about shared grounds. The scale-blind village hears
  the climb and never joins it. VERDICT: SENSICAL — and the contrast with the armed transcript
  is itself the finding: competent play without courtship is deaf to the scale game while
  the world plays it.
- Repetition notes (documented, not chased — outside this arm): the weekly tend line repeats
  verbatim (amounts vary; ritual repetition, acceptable); the villager line "My kid asked if
  the watchers have favorites" repeats verbatim across different speakers (Nina, Dakota, Elif,
  Stan) — villager-dialogue repetition, a finding for the backlog, not a courtship bug.

## Village assessment (assessor's account)

- What the villages looked like: control villages stay single-fire villages — they survive
  the full 181d or die at ~110–119d, never link, never hear a court. Armed villages become
  realms: 3–5 links formed in every seed, trusts climbing to 100, courts held, camera feasts
  eaten — and then most still die (5/8 village-lost) of combat attrition, not starvation.
  The dead armed villages die WITH their realms (final ranks global/national on 73401/03/04/06).
  The scale wall moved: from "never reach national" (0/16 rerunclock, 0/8 control here) to
  "reach national/global routinely, but don't yet convert it into survival or a win."
- Who thrived and why: early formers that held trusts ≥ 40 through the seasons (73402, 73407
  survived at global; 73405 survived at national). Who died and why: pantry-thin realms
  (73408: pantry 0 by day 126, trusts 0 on two links) and combat attrition everywhere — arena
  + combat deaths dominate death shares in BOTH arms (control: arena 50, combat 102, villager
  combat 78; armed: arena 60, combat 150, villager combat 65), so the armed villages' extra
  deaths (+65 total) are mostly more combat exposure at higher rank, not the starvation
  guardrail's story — except for the 5 starvation deaths the bar counts.
- What knowledge/capabilities were missing: the win itself. No arm takes the table seat; the
  beat-answering policy stops at waiting. The next blank is a take-the-table policy, not a
  stronger courtship drive.
- Blank filled or documented: DOCUMENTED, not fixed — and deliberately so. A kill leaves no
  trace of the lever (LINKFORM env needs no new policy file; no policy file was created or
  modified; zero src/js changes). What lands is the instruments + this evidence + the proof
  test documenting that (a) courtship moves national off 0, (b) its upkeep breaches the
  pre-registered starvation bar, and (c) the hold mechanism (5-link headroom absorbing
  broken links) works as theorized.

## Metric review (§14 — required; revisions apply to the NEXT run, never this one)

- Metrics held: primary + guardrails judged exactly as pre-registered; no re-scoring. The
  spike clause was applied as written (named + judged, not lever-caused, so non-killing).
- Proposed revisions for the NEXT run (not applied here): (1) starvation guardrail should
  count arm-only deaths (matched-substrate deaths like 73402 d35 pollute both sides);
  (2) links.dissolved should count broken-status links, not just vanish-from-list;
  (3) table should split tableWaiting vs tableDone (waiting ≠ win — this run's 5/8 table
  with 0/16 wins shows why); (4) defense-call staging should be verified as a precondition
  before counting it as a courtship ingredient (0/16 here); (5) median gameDays uses scholar
  day at end (181 for survived 180d runs — consistent across arms, harmless).
- Balanced panel (§15): ATTEMPTED and INAPPLICABLE, mechanically proven — running
  `scripts/balance-panel.js --policies linkform` fails before any sim with
  "Error: Unknown policy linkform" (POLICY_REGISTRY has `competent` but no `linkform`;
  LINKFORM env is not a panel input; panel before/after is Game-root based while this lever
  is env-based). This is the same finding class as the prior singletier/foreignhelp panel
  inapplicability. Fallback used, as prescribed: the identical-seed paired comparison judged
  by the pre-registered bar. The empty panel-attempt dir was removed, not committed.

## Infrastructure notes

- Writes: all per-seed JSONs went through the chunked writer subprocess
  (scripts/sim-postunlock2-b-writer.js, read-only reuse — hash-verified, no 0-byte corpses).
  One failure: the first armed sense write failed under the EPERM flap (broad-filter body +
  120s writer timeout). Fixed by tightening the sense filter to courtship beats and raising
  the writer timeout to 600s; the re-run succeeded. No judged data was lost (sense is
  non-judged; the pilot corpora wrote cleanly throughout).
- Determinism: control seed 73401 re-run in a separate process into
  `perseed-linkdrive/determinism/` is BYTE-IDENTICAL to the pilot file (sha256
  ea283cd3361b680376b13b8876e9273e613f4c2ce8d4fb2fdd52070483e07273, both runs).
- Proof: `node scripts/test-sim-linkdrive.js` — TEST-OK (T1 pairing/delta source proof,
  T2 corpus completeness, T3 recomputation, T4 no wrapper policy file).
- No confirm spend (pilot NO-GO). No policy files created or modified (linkform.js and
  competent.js read-only for this arm; no scripts/policies/linkdrive.js wrapper was needed
  or created). No [needs-eyes] on the landing commit: the verdict is KILLED, and nothing
  in this commit changes feel, combat, or UI (instruments + evidence + proof only).

## Findings for the backlog (recorded here; NOT appended to sim-findings.md by this arm —
## the arm's file list excludes that shared file, so the coordinator owns the append)

- [open] 2026-10-24 — villager dialogue — the line "My kid asked if the watchers have
  favorites" repeats verbatim across different speakers (Nina, Dakota, Elif, Stan) in the
  73401 sense transcripts (sim-linkdrive sense runs).
- [open] 2026-10-24 — scale/win-path — no beat-answering policy takes the table seat:
  table waiting reached 5/8 armed with won 0/16; the take-the-table policy is the next blank
  (sim-linkdrive pilot).
- [open] 2026-10-24 — measurement — tableWaiting/tableDone conflation and vanish-only
  links.dissolved counting (see Metric review); defense calls never staged in the 73401–73408
  band (sim-linkdrive pilot).

