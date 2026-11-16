# journey-landing r140 — PREREG (Lane A, leg 0 LANDING)

**Run id:** journey-landing-20261116T1445Z (scheduled Mon 2026-11-16 14:45 CST).
**Base:** local master at run start (`7bb50f3dc`, sim-winnability-round-1730).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch `journey-landing`).
Heartbeat at registration (21:03:27Z after a write-flap EPERM delayed the first
attempt past the 15-min mark — see infrastructure notes); heartbeat loop
re-armed every 10 min for the whole run. Lock: no stale lock (none present at
run start); fresh lock created 2026-11-16T20:44:05Z (run_id
loop-a-20261116T204405Z).

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1172–1181**. Searched `evidence/` for exact band namings
("1172–1181", "1172-1181", "seeds 1172", "band 1172") — **zero hits**.
The "1172" greps that returned were incidental numbers (pantry kcal 11720,
pk 117273, "Garden harvest" 117200) in old JSON corpora, not band namings.
Landing preregs name bands 1162–1171 (r139), 1142–1151 (r121–r138, deliberate
reuse), 1122–1131 (r119), 1083–1092, 1073–1082, 1063–1072, 1053–1062,
1043–1052, 897–906 (contaminated), 887–896, 867–876, 857–866, 847–856,
837–846, 817–826, 797–806, 777–786. Band 1172–1181 is fresh; no prereg,
forbidden list, or contaminated list names it. The r139 band (1162–1171)
is NOT reused: r140 is a before/after fix run on its OWN fresh band
(same seeds before and after the fix — the honest comparator), not a
within-run reuse of r139's band.

## Q1 (PRIMARY) — regression watch on the post-r139 master + F1 heed fix, before/after on identical seeds

Since r139's base (`2fd2dad1f`), `src/js/` changed in exactly four files
(`git diff 2fd2dad1f..HEAD -- src/js/`, 140 insertions, 11 deletions):

- `conversation.js` +63, `convo-dialogue.js` +38, `convo-wants.js` +48:
  four conversation-domain builds, all directly in the landing leg's
  dialogue domain — the r140 panel is the live watch for all four:
  - succession r224 F4a/F4b/F4c dry-line fixes (2e3142e74)
  - endgame r225 F5 settled-favor variants (3ba7f0516)
  - establishment r225 stage-0 want is not live — favorless asks no
    longer resolve as refused unheard (83c7dc3c7)
  - social-life r226 F6 dry-opener guard — ledger-blocked lines fall to
    a fresh phrasing, never the dry line (03fee239a)
- `build.js`: version stamp only.
- Net zero: trickteach lever + revert, gatelever lever + revert (game.js
  restored to base in both cases).

**The build work this run (r139 metric review, fix owed): F1 — warn_you
heed goes silent.** Both warn_you sittings on the r139 panel hit it: the
player picks "I'll be careful", the NPC cycles 3 acknowledgment lines,
then goes silent — the no-repeat ledger in `sayLine` blocks the 4th+
picks and the heed handler passes no fallback, so `sayLine` returns null
and the turn speaks nothing; the want never leaves stage 2. Fix shape
(r139, adopted): heed deepens on the 4th pick, same shape as the stay
fix — the fear gets said out loud (5-variant deepen pool) and the want
resolves as 'heeded' via `convoWantEngage(vid, 'commit')` (the warn_you
def already maps commit → 'heeded' with closeLine "Good. Just — be
careful. I mean it.") — plus a lazy fallback on the heed `sayLine` so a
blocked heed still speaks instead of going silent. Proof test: staged
warn_you, 8 heed picks (r139's forced-want probe shape, as a real test
on the shared kit): heeds 1–3 spoken distinct, heed 4 deepens, want
resolves 'heeded', zero silent turns, no verbatim repeat.

**Instrument work this run (r139 metric review, fix owed):**
- Phantom-line detector in the driver: after each convoTurn, count turns
  where `r.line` is non-null but the transcript gains no THEM entry —
  `MET.silentTurns` (the driver file logging `r.line` masked F1's silent
  turns by printing lines the player never saw).
- Fight-driver budget-refusal stop (scripts/policies/competent.js,
  shared): `closeStep` + `beastStrikeTarget` stop trying tiles once
  `moveLeft` is spent — r139's 1168-d20 flag (42 failed moves, all "No
  movement left this turn") was the policy re-issuing a move to every
  adjacent tile after the budget was spent. Proof test on the policy
  (stub Game): moveLeft 0 → zero tbPlayerMove calls, returns 'stuck'.
  The analyzer keeps its definition; if the fix works it reads 0.

**Order (before/after on identical seeds):** pilot seeds 1172–1175 on
current master FIRST (BEFORE), then the two fixes + proof tests, then
the same 4 seeds again (AFTER), then the full 10-seed panel with the
fixes. A fix that moves any other MET aggregate between BEFORE and
AFTER is a finding, not a silent pass.

**Interesting if:** any r139 bar moves on the fresh band; any F4/F5/
stage-0/F6 fix fails live (dry line spoken, favorless ask refused
unheard, ledger-blocked line falling to the dry line); any warn_you
sitting goes silent on BEFORE; any heed sitting fails to resolve on
AFTER; any stuck-fight flag survives the policy fix on AFTER; any
silentTurns > 0 on AFTER.

**Bars (bind, identical to r139, judged against r132/r134/r135/r136/r137/r138/r139):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG invariant PASS.
- Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- Pocket watch: 0 pocket fights, 0 stuck turns.
- D1 watch: 0 garbled-label renders.
- HEED: legacy count reported; **HEED-V = 0 BINDS**.
- M-PR1: max per-seed never-offered ≤ 1 (r129 bar).
- Personal bridge: 0 repeats in a sitting. Small bridge: 0 repeats.
- Presshop farUnreached REPORTED only (r137 proposal adopted).
- R66 HUNGRY: starvation deaths 0, starvingWarnings 0.
- 1130-d6 amnesia shape: 0 recurrences. Miriam line: 0 "That's settled".
  Deflect-fallback: 0 `fellBack`.
- Nodloop: LOOP=0.
- Q1 panel watch: resume-takes of deflected question-wants re-pose the
  question — report the count; a take that still ends in the generic
  acknowledgment is a Q1 failure on live data. verbatimRepeats 0,
  verbatimRepeatsExempted = re-poses observed; spot-check each exempted
  line against its transcript (a non-re-pose exemption is a Q1 failure).
- **Scholar deaths BINDS from this run (r139 metric review, metric
  EARNED — r137: 2, r138: 2, r139: 1): ≤1 scholar death per 10-seed
  panel.** Report count, day, cause, succession latency per death.
- **silentTurns (new, phantom-line detector): 0 on the AFTER panel.**
  BEFORE is reported, not bound (it is the instrument proving F1).
- Pilot first: seeds 1172–1175; expand to all 10 unless the pilot is
  broken (a broken pilot is a loud failure, not a quiet skip).

## Q2 — People check (M5, sense-read)

Read 5 full transcripts from the AFTER panel. Bar: each sitting shows the
NPC wanting something, options engaging or deflecting it, endings
resolving / planting / owing. No fabricated shared history, no filler
loops, no static menus. Include at least one resume-take sitting if the
panel produces one (Q1 watch) and read it for the re-pose AND for any
drift-note tail quoted as memory. Include a warn_you sitting if the
panel produces one — read it for the deepen + 'heeded' resolution.

## Q3 — Telemetry

`telemetry-check.js` on the AFTER panel vs
`telemetry-baselines/landing-split.json` (re-pinned r136: 81/9/217/15/0).
LOUD lines are same-run investigation items. Baseline is NOT rolled
unless the panel carries new information.

## Q4 — Gate

`node scripts/check.js --quick` in the worktree
(`--cacheDirectory=/tmp/jest-cache-playtest`); adjudicate every failure
against pristine HEAD. 0 attributable is the bar.

## Policies / seeds

- Landing panel: seeds 1172–1181, 28d, r140 driver (r139 driver verbatim
  except OUTDIR, header, default seeds, + phantom-line detector).
- BEFORE corpora: `landing-r140-before`; AFTER corpora:
  `landing-r140-after`. Both under the goal hidden_files evidence dir
  (same layout as r139).
- No threshold, bar, price, or gate changes in this run except the
  scholar-death bar binding above (earned r139, proposed in r139's
  metric review) and the new silentTurns bar on AFTER. If the panel
  surfaces a further game defect, fix in the worktree with a proof test,
  or document and carry.

## Carried (unchanged)

- Teach the shared chooser to take nv:accept (r197 lane decision owed).
- Olivia bridge repeat — fix owed in a build arm with its own panel
  (per-sitting bridge memory or a bar revision); NOT this run — the fix
  touches shared pick-cycle machinery used by every pool.
- Fights 21 vs 12 (r139) — open question, matched-band A/B owed (same
  seeds, profile-gate bypass on/off), before any claim about the bypass
  or the band. Carried; r140's BEFORE/AFTER is a different comparison
  (same seeds, fix on/off) and does not answer it.
- Hungry-at-horizon watch: r137/r138 4/10, r139 6/10. Report the r140
  count; a move in either direction is a Q1 finding.
- Favors broken 4 vs 1 (r139) — watch item; watch r140 before calling
  it a rise.
- NV sittings share one closing template (observation only).
- Analyzer vs transcript streak count (r134 carry).
- `test-convo-engine-trust.js` verbatim closeLine 6 pass/1 fail
  pre-existing on pristine (observation).
- Measurement-proof + phone-frame-proof staleness pair (standing;
  refresh owed via the update scripts — maintenance, not this run,
  unless this run's gate shows them moved).
- Hunt H0-ESTABLISHED: hunt assignments resolve, first rung (8 reps)
  still out of reach in 28d.
- Lead-in nit (r139): topic answers repeat their lead-in within a
  sitting ("Good question." x2; "You want to know about that? Okay."
  x3). Observation only; worth a look when the bridge pool gets its
  per-sitting memory.
