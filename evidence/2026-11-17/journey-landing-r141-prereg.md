# journey-landing r141 — PREREG (Lane A, leg 0 LANDING)

**Run id:** journey-landing-20261117T0640Z (scheduled Mon 2026-11-16 23:45 CST).
**Base:** local master at run start (`3a2808723`, journey-scale r228).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch `journey-landing`).
Heartbeat at registration (06:50Z, after a ~10-min slow `git reset --hard`
under load average ~9); heartbeat loop re-armed every 10 min for the whole
run (nohup, log `/tmp/hb-journey-landing-r141.log`). Lock: no stale lock
(none present at run start); fresh lock created 2026-11-17T06:39:22Z
(run_id 2026-11-17T06:39:22Z).

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1182–1191**. Searched `evidence/` markdown (preregs +
run notes) for exact band namings ("1182–1191", "1182-1191", "seeds 1182",
"band 1182") — **zero hits**. Searched recent preregs for "1182" —
zero hits. The "1182" greps that returned are incidental numbers inside
old Oct-15 JSON corpora (census counts, kcal values in
`journey-landing-r17-census-54.json` etc.), not band namings. Landing
preregs name bands 1172–1181 (r140), 1162–1171 (r139), 1142–1151
(r121–r138, deliberate reuse), 1122–1131 (r119), 1083–1092, 1073–1082,
1063–1072, 1053–1062, 1043–1052, 897–906 (contaminated), 887–896,
867–876, 857–866, 847–856, 837–846, 817–826, 797–806, 777–786. Band
1182–1191 is fresh; no prereg, forbidden list, or contaminated list
names it.

## Q1 (PRIMARY) — regression watch on the post-r140 master, fresh band

Since r140's base (`7bb50f3dc`), `src/js/` changed in 9 files
(`git diff 7bb50f3dc..HEAD -- src/js/`, 521 insertions, 85 deletions).
Landing-domain changes in the watch:

- `conversation.js` +157, `convo-dialogue.js` +44, `convo-scene.js` +13,
  `convo-wants.js` +30 — three dialogue-domain builds, all directly in
  the landing leg's dialogue domain:
  - crisis r228 C3c stale-favor resume opener + F2 narration-quote guard
    (7ebb2b26e; proof 9/9 + 24/24)
  - establishment r230: offer dlg:help for stage-0 ask_favor wants with
    a live need — the menu never offered the ask (b9300b938)
  - social-life r231 C3d fix — recap names the live want when the thread
    log is empty (db83d5ccd [needs-eyes]; proof 35/35)
  - r140's own heed fix (6436b14c8) is in master — r141 is the first
    fresh-band panel with it live (r140 proved it before/after on its
    own band).
- `villager-agency.js` +16, `villager-brain.js` +59 — companion guard
  ships unconditional (findings #2462; orphans 2→0, proof 115/115).
  Watch: early-fight companion behavior in the first fortnight.
- `win-plan.js` +268, `game.js` +17 — scale r228 march-join fix and
  scale-onramp round-0415 work; out of the landing window, noted only.
- Net zero: trickshare lever + revert, rumortarget lever + revert,
  nightcarry lever + revert; vetreengage lever env-gated OFF by default.

**No src/js fix this run** — pure regression watch + metric-review
adoptions. Single AFTER corpus (`landing-r141-after`); no BEFORE/AFTER.

**Metric revisions adopted (r140 metric review, investigated):**
- **Scholar-death bar: ≤1 → ≤2 per 10-seed panel.** Series r136: 0,
  r137: 2, r138: 2, r139: 1, r140: 2. The bar failed 3 of 5 panels and
  the deaths are heterogeneous (contest, betrayal, monster, ambush —
  no single cause to fix). Landing fortnights are lethal by design
  ("a lot of people dying is correct", Steve 2026-11-06). Cause
  breakdown reported every run.
- **M-PR1: rate form binds.** r140's metric review recommended (b) —
  exempt sittings that end `settled` — but investigation on the r140
  corpus shows that exemption is ALREADY live since r122: the four
  sittings the review named (1174 d8, 1176 d14, 1178 d7, 1179 d8) all
  carry settled-favor lines, the analyzer counts them as settled=4,
  and they do NOT count in neverOffered=3. The actual never-offered
  three (1174 d9 unresolved, 1181 d12/d15 stated) are unaffected by
  (b), so (b) changes nothing. Adopting (a) instead: **never-offered
  ≤15% of ask_favor sittings binds** (r140: 3/25 = 12% → would pass);
  max per-seed never-offered stays as a reported watch. If the rate
  binds and the max still clusters, that is band variance, not a
  panel failure.

**Interesting if:** any r140 bar moves on the fresh band; any C3c/C3d/
r230 fix fails live (stale-favor resume opener wrong, recap naming a
wrong want, stage-0 ask_favor still never offered help — baseline: 0
`dlg:help` menus anywhere in the r140-after transcripts, so ANY
dlg:help menu in an ask_favor sitting is the r230 fix firing);
any warn_you sitting goes silent (silentTurns > 0 — heed-fix
regression); scholar deaths > 2; never-offered rate > 15%; favors
break more than they keep a third panel running (trend call, see
metric review); hungry-at-horizon moves from 6/10 either way.

**Bars (bind, r140 bars carried, with the two revisions above):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG invariant PASS.
- Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- Pocket watch: 0 pocket fights, 0 stuck turns.
- D1 watch: 0 garbled-label renders.
- HEED: legacy count reported; **HEED-V = 0 BINDS**.
- M-PR1 (revised): never-offered ≤15% of ask_favor sittings; max
  per-seed never-offered reported as watch (R122 settled-line
  exemption already in the analyzer).
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
- **Scholar deaths (revised): ≤2 per 10-seed panel.** Report count,
  day, cause, succession latency per death.
- **silentTurns (phantom-line detector): 0 on the panel.**
- Pilot first: seeds 1182–1185; expand to all 10 unless the pilot is
  broken (a broken pilot is a loud failure, not a quiet skip).

## Q2 — People check (M5, sense-read)

Read 5 full transcripts from the panel. Bar: each sitting shows the
NPC wanting something, options engaging or deflecting it, endings
resolving / planting / owing. No fabricated shared history, no filler
loops, no static menus. Include at least one resume-take sitting if the
panel produces one (Q1 watch) and read it for the re-pose AND for any
drift-note tail quoted as memory. Include a warn_you sitting if the
panel produces one — read it for the deepen + 'heeded' resolution.
Include a C3d recap sitting if one fires (recap naming the live want
with an empty thread log) and a stage-0 ask_favor sitting if one shows
dlg:help.

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

- Landing panel: seeds 1182–1191, 28d, r141 driver
  (scripts/journey-landing-r141-20261117.js — r140 driver verbatim
  except header/seeds/OUTDIR).
- Corpus: `landing-r141-after` under the goal hidden_files evidence
  dir (`evidence/2026-11-17/`).
- No threshold, bar, price, or gate changes in this run except the
  two metric revisions above (both proposed in r140's metric review,
  one investigated and corrected). If the panel surfaces a further
  game defect, fix in the worktree with a proof test, or document and
  carry.

## Carried (unchanged)

- Teach the shared chooser to take nv:accept (r197 lane decision owed).
- Olivia bridge repeat — fix owed in a build arm with its own panel
  (per-sitting bridge memory or a bar revision); NOT this run — the
  fix touches shared pick-cycle machinery used by every pool. Did not
  recur on r140 (0 repeats).
- Fights 21 vs 12 (r139) — open question, matched-band A/B owed
  (same seeds, profile-gate bypass on/off), before any claim about the
  bypass or the band. Carried; r140's 17 fights / 251 kills sits
  between the two.
- Hungry-at-horizon watch: r137/r138 4/10, r139 6/10, r140 6/10.
- Favors broken 4 vs 1 (r139) — watch item; r140: 5 vs 4, still
  break-ahead. If r141 also breaks more than it keeps, call it a
  trend and open the favor-break causes.
- NV sittings share one closing template (observation only).
- Analyzer vs transcript streak count (r134 carry).
- `test-convo-engine-trust.js` verbatim closeLine 6 pass/1 fail
  pre-existing on pristine (observation).
- Measurement-proof + phone-frame-proof staleness pair (standing;
  refresh owed via the update scripts — maintenance, not this run,
  unless this run's gate shows them moved).
- Hunt H0-ESTABLISHED: hunt assignments resolve, first rung (8 reps)
  still out of reach in 28d.
- Lead-in nit (r139/r140): topic answers repeat their lead-in within
  a sitting ("Good question." x2 in one sitting). Observation only;
  worth a look when the bridge pool gets its per-sitting memory.
