# journey-landing r144 — PREREG (Lane A, leg 0 LANDING)

**Run id:** journey-landing-20261118T0920Z (scheduled Wed 2026-11-18 02:45 CST).
**Base:** local master at run start (`6fb98f473`, journey-scale r239 closeout).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch `journey-landing`).
Heartbeat at registration (~09:28Z); heartbeat loop re-armed every 10 min for
the whole run (nohup, log `~/workspace/worktrees/journey-landing-hbloop-r144.out`).
Lock: no stale lock (none present at run start); fresh lock created
2026-11-18T09:21:13Z (run_id playtest-a-20261118T0920Z).

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1222–1231**. Searched `evidence/**/*.md` for "1222" —
hits are all non-landing sim notes (sim-seatvoice, sim-vetrel,
sim-belltoad-cand3-b, sim-cultnest-b, sim-chorus-a); no landing prereg or
run note names any seed in 1222–1231. Searched for the exact band strings
"1222–1231" / "1222-1231" — zero hits. Landing preregs name bands
1212–1221 (r143), 1192–1201 (r142), 1182–1191 (r141), 1172–1181 (r140),
1162–1171 (r139), 1142–1151 (r121–r138, deliberate reuse), 1122–1131
(r119), 1083–1092, 1073–1082, 1063–1072, 1053–1062, 1043–1052, 897–906
(contaminated), 887–896, 867–876, 857–866, 847–856, 837–846, 817–826,
797–806, 777–786. (October JSON corpora contain "1222" as a substring of
other numbers — kcal/feastscale/deepening/courtkill/wave5/teachC sweeps,
none a landing run.) Band 1222–1231 is fresh; no prereg, forbidden list,
or contaminated list names it.

## Q1 (PRIMARY) — regression watch on the post-r143 master, fresh band

Since r143's base (`1aba45367`), `src/js/` changed in 12 files
(`git diff 1aba45367..HEAD -- src/js/`, 697 insertions, 59 deletions).
Landing-domain changes in the watch:

- `fieldFights.js` +274 — sim-fightallycap-b (dded39f58, [needs-eyes]):
  **FIGHTALLY2, a second ally slot in the fight engine.** Landing has
  real fights in the first fortnight, so this is the sharpest watch:
  fight counts, zero-DMG invariant, fight-log unknowns, flee/pocket
  turns, and whether a second ally ever actually joins a landing fight
  (and reads sensibly when it does). sim-fleerepair2-b (59439c437):
  **FLEEREPAIR2** flee repair — watch fleeStuckTurns / pocket fights.
  sim-profilegate-b (39e8f10f4, then reverted 0da095c78): lever reverted,
  src back to master — expect no landing signal. sim-homebodyvoice-a
  (b7236b65f), sim-holdervoice-b (c3cbd100e), sim-aguard-a (7f9ff9c94):
  voice/guard lines — watch transcripts for bare-name or unvoiced lines.
- `convoTopics.js` +87, `conversation.js` +25, `convo-dialogue.js` +42 —
  succession r232 (ef7e6d86c, [needs-eyes]): **REL-MOURN**,
  relationship-aware mourning lines. Watch: every mourning line names
  the current lately dead, no `{mname}` or empty-name render, template
  spread sane. Social-life r235 (9d5a45fcc, [needs-eyes]): **DRY3 fix** —
  pre-check ledger-blocked lines at three dry sites. Watch: 0 dry lines.
- `truth.js` +43 — r143's own F1 fix (already-confessed confront
  deflect spends the choice). Watch: verbatimRepeats 0 on the fresh band
  (the fix holds, not just on r143's seeds).
- `titans.js` +155, `villager-brain.js` +79, `villager-agency.js` +18,
  `win-plan.js` +21, `game.js` +6, `party-wiring.js` +4 — journey-deepening
  r236 muster-growth dawn line + fightally/profilegate wiring. Titans and
  the muster live past the landing window; watch only for an early-muster
  oddity, none expected.
- `build.js` 2+- — version stamp churn, no landing signal.

**Interesting if:** any r143 bar moves on the fresh band; a second ally
joins a landing fight and the fight reads wrong (or the slot never fires
where the old engine would have put a body); a mourning line names the
wrong dead person, comes out empty, or the same template re-serves once
per corpse; any dry line in a transcript; any plan oddity after a death
or departure; a second starvation death (r142's R66 miss — the margin
question, not a re-score); scholar deaths > 2; revised M-PR1 > 15%;
statedAfterPick ≥ 6; hungry-at-horizon moves from 4/10 either way; any
village starts a win-plan inside 28d (plan watch); any death leaves a
stale plan trace; the r143 F1 shape recurs (any confront deflect looping
verbatim).

**Bars (bind, r143 bars carried, with r143 metric-review item 1 adopted):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG invariant PASS.
- Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- Pocket: 0 pocket fights BINDS; stuckTurns reported as watch.
- D1 watch: 0 garbled-label renders.
- HEED: legacy count reported; **HEED-V = 0 BINDS**.
- M-PR1 (revised per r143 metric review item 1): never-offered among
  established ask_favor sittings ≤15%, where "established" now excludes
  `resolution=unestablished` sittings regardless of final stage; raw
  analyzer rate + max per-seed never-offered reported as watch.
- Personal bridge: 0 repeats in a sitting. Small bridge: 0 repeats.
- Presshop farUnreached REPORTED only.
- R66 HUNGRY: starvation deaths 0, starvingWarnings 0.
- 1130-d6 amnesia shape: 0 recurrences. Miriam line: 0 "That's settled".
  Deflect-fallback: 0 `fellBack`.
- Nodloop: LOOP=0.
- Q1 panel watch: resume-takes of deflected question-wants re-pose the
  question — report the count; a take that still ends in the generic
  acknowledgment is a Q1 failure on live data. verbatimRepeats 0,
  verbatimRepeatsExempted = re-poses observed; spot-check each exempted
  line against its transcript (a non-re-pose exemption is a Q1 failure).
- **Scholar deaths: ≤2 per 10-seed panel.** Report count, day, cause,
  succession latency per death.
- **silentTurns (phantom-line detector): 0 on the panel.**
- **Mourning watch (r232):** every mourning line names the current lately
  dead; no `{mname}` or empty-name render; the same template does not
  re-serve once per corpse (count firings per template).
- **Dry-line watch (r235/r230):** 0 dry (empty-content) lines in the
  panel's transcripts.
- **FIGHTALLY2 watch:** count landing fights where a second ally joins;
  report the fight-log trigger class for each; any fight with 2 allies
  that ends zero-DMG or stuck is a Q1 failure on live data.
- Pilot first: seeds 1222–1225; expand to all 10 unless the pilot is
  broken (a broken pilot is a loud failure, not a quiet skip).

## Q2 — People check (M5, sense-read)

Read 5 full transcripts from the panel. Bar: each sitting shows the NPC
wanting something, options engaging or deflecting it, endings resolving /
planting / owing. No fabricated shared history, no filler loops, no static
menus. Include a mourning sitting if the panel produces one (r232 watch —
read it for the name worn and the template spread). Include a warn_you
sitting if the panel produces one — read it for the deepen + 'heeded'
resolution. Include a stage-0 ask_favor sitting with dlg:help if one fires
— read it for the r231 deferred-ask guard (the live ask stated, not the
settled line). Include a resume-take sitting if the panel produces one
(Q1 watch) and read it for the re-pose AND for any drift-note tail quoted
as memory. Include a C3d recap sitting if one fires (recap naming the live
want with an empty thread log). Include a fight transcript with a second
ally if one fires — read it for whether the ally's presence reads as a
person joining, not a stat appearing.

**r231 deferred-ask guard — targeted probe (r143 metric review item 2):**
panel luck has now failed twice to fire the trigger case (live need +
settled short-circuit). If this panel also fails to fire it, write the
proof test this run (stage-0 want with a known live favor, press
dlg:help, read the line) instead of carrying the item a third time.

## Q3 — Telemetry

`telemetry-check.js` on the panel vs
`telemetry-baselines/landing-split.json` (re-pinned r136: 81/9/217/15/0).
LOUD lines are same-run investigation items. Baseline is NOT rolled
unless the panel carries new information.

## Q4 — Gate

`node scripts/check.js --quick` in the worktree
(`--cacheDirectory=/tmp/jest-cache-playtest`); adjudicate every failure
against pristine HEAD. 0 attributable is the bar.

## Policies / seeds

- Landing panel: seeds 1222–1231, 28d, r144 driver
  (scripts/journey-landing-r144-20261118.js — r143 driver verbatim
  except header/seeds/OUTDIR).
- Corpus: `landing-r144-after` under the goal hidden_files evidence
  dir (`evidence/2026-11-18/`).
- No threshold, bar, price, or gate changes in this run except the
  M-PR1 denominator revision above (proposed in r143's metric review).
  If the panel surfaces a further game defect, fix in the worktree with
  a proof test, or document and carry.

## Carried (unchanged)

- Teach the shared chooser to take nv:accept (r197 lane decision owed).
- Olivia bridge repeat + goal-pool repeat (r141 F2) — fix owed in the
  bridge-memory build arm with its own panel; NOT this run. Did not
  recur on r142 (verbatimRepeats 0, goal pool 1 serving, 0 repeats) or
  r143.
- Fights 21 vs 12 vs 17 vs 7 vs 16 — open question, matched-band A/B
  owed (same seeds, profile-gate bypass on/off), before any claim about
  the bypass or the band. (Profilegate lever has since been reverted;
  the question may be moot — revisit if fight counts move sharply.)
- Hungry-at-horizon watch: r137/r138 4/10, r139 6/10, r140 6/10,
  r141 5/10, r142 4/10, r143 5/10 (BEFORE) / 4/10 (AFTER-FIX).
- Stated same-day need with no commit path (r141 F1, 1189-d14) —
  design question (dawn-meet-shaped commit vs same-day accept),
  documented for Steve/design call, not fixed here. Did not recur on
  r142 or r143.
- NV sittings share one closing template (observation only).
- Analyzer vs transcript streak count (r134 carry).
- `test-convo-engine-trust.js` verbatim closeLine 6 pass/1 fail
  pre-existing on pristine (observation).
- Measurement-proof + phone-frame-proof staleness pair (standing;
  refresh owed via the update scripts — maintenance, not this run,
  unless this run's gate shows them moved).
- Hunt H0-ESTABLISHED: hunt assignments resolve, first rung (8 reps)
  still out of reach in 28d. (r142 reads H1 — same rung, no
  assignments at all; see r142 F3.)
- Lead-in nit (r139/r140/r141/r142/r143): topic answers repeat their
  lead-in within a sitting. Observation only; worth a look when the
  bridge pool gets its per-sitting memory.
- R66 margin question (r142 F1): a scholar at home with a full pantry
  lived hand-to-mouth for three weeks and died on a 934-kcal nightly
  deficit. Balance/policy arm question — meal share vs daily burn for a
  Haven-bound scholar, and whether the competent policy should bank food
  during the day. Not this run.
