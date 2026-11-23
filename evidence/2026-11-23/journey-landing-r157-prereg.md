# journey-landing r157 — PREREG (Lane A, leg 0 LANDING)

**Run id:** `playtest-20261123T2245Z` (scheduled Mon 2026-11-23 15:45 CST;
started 16:45 CST — late start, no schedule change).
**Base:** local master `1a7a5b647` at worktree registration (fleshout
20261123T2015Z adoption round record; scale r276 + endgame r275 merges
already in).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg:
establishment.
**Lock:** `playtest-loop.lock`, run_id `playtest-20261123T2245Z`, created
2026-11-23T22:45:00Z. Delete at closeout in the same call as its read,
only if run_id matches.

## Pre-flight

`git status --short` at run start: EMPTY (verified in main tree at
22:41Z). Disk 49% (fine). `git pull --ff-only`: already up to date.
`worktree-reap.sh`: ran, removed nothing; 11 LOUD lines, all active
trees with uncommitted changes, never auto-removed (active 12/16).
Write flap: watchdog ALL-OK from 22:38Z through run start (window
22:14–22:32Z cleared ~22:28Z, reported in the 22:40Z scale r276
closeout). Registration took ~5.5 min (slow host, sibling load) but
succeeded; worktree at `1a7a5b647`, verified with `pwd`. Heartbeat
via setsid nohup hbloop, 10-min cadence (first beat landed 22:50:58Z).

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1382–1391** (next after r156's 1372–1381).
Full-evidence grep (`evidence/`, `*.md`, `1382[–-]1391|1382|1391`,
plus a `*-prereg.md` sweep for `1382` and a `138[0-9]` cross-check):
zero band namings. All hits incidental: PID `13820` in
`journey-deepening-r184-prereg.md`, commit-hash fragment `d0ed41382`
in `journey-scale-r273-prereg.md` and
`sim-departsafe-rejudge-a-prereg.md`, kcal/seconds/hash fragments
elsewhere. No prereg names 1382–1391. **Band 1382–1391 is fresh.**
Prior landing bands: 1372–1381 (r156), 1362–1371 (r155), 1352–1361
(r154), 1342–1351 (r153), 1332–1341 (r152), 1272–1281 (r149),
1262–1271 (r148), 1252–1261 (r147), 1242–1251 (r146), 1232–1241
(r145), 1212–1221 (r143), 1192–1201 (r142), 1182–1191 (r141),
1172–1181 (r140), 1162–1171 (r139), 1142–1151 (r121–r138, deliberate
reuse), 1122–1131 (r119), 1083–1092, 1073–1082, 1063–1072, 1053–1062,
1043–1052, 897–906 (contaminated), 887–896, 867–876, 857–866, 847–856,
837–846, 817–826, 797–806, 777–786.

## Base delta vs r156's merge `4cd566b21` (src/js)

- journey-endgame r275 (`9456a8e2c`): **dead-whisper fix + Voice-collapse
  fix-the-fix** — `registerDeath` marks `vpOf().dead` (corpses.js) +
  godverbs godBefore capture. Landing-relevant: death registration in
  census (all r156 deaths were registered; this changes the dead-mark
  path, watch the census).
- journey-succession r268 (`331a9b5ee`): **stage-2 prefixed retry in
  topic2Ask** (table-dry fix). Landing-relevant: conversation paths —
  a retry shape inside the ask flow.
- journey-crisis r274 (`a44b47320`): **DOWNEDTWICE dedup** (aidAllyDown
  per-ally+day) + **FIGHT-STALL nearest-affordable-edge flee**. Landing-
  relevant: combat — stall 9→2 after-panel on the crisis leg.
- Version bump only (`6d8478d00`).
- Evidence-only since r156: scale r276 panel (Q1 QUIET, stand-down fix
  never fired band-wide, orphaned invite lines 1/11), deepening r275
  re-panel tooling, sim-musterask-a DIAG-GO, sim-departsafe-rejudge-a GO
  (lever stays HELD), round records.

## The blank this run fills — M-PR1 residual (r156 filed)

**In plain words:** one sitting on r156 (seed 1375, Landon, day 26)
asked the player plainly for help — and at no point was there any way
to say yes. Same cut as r155, narrowed to a single route.

**Mechanism pinned (r156 transcript + code trace):** the favor was
already established from an earlier sitting, so the opener takes the
follow-up branch (`convo-wants.js` ~697) and sets `c.want.stage = 2`
directly. The r156 fix lives inside `convoWantEngage`'s `stage < 2`
guard, so when the player picks [dlg:help] and engage runs a moment
later, the stage is already 2 and the thread flip is skipped — the
thread stays `'request'`. The request-thread [dlg:more] depth path
delivers the favor's depth lines but never flips the thread either
(unlike the deferred-opener path, which does — the Panom contrast,
1377 d28), so `convoWantMenu`'s coherence gate stays closed for the
whole sitting and the commit menu never appears. Landon asks, the
player asks for more four times, hears the whole depth ("That's...
pretty much all of it, honestly."), winds down ("I should go. You
know where to find me."), and the favor ends 'stated' with no way to
say yes.

**Fix shape (r156's prescription):** move the thread flip out of the
`stage < 2` guard in `convoWantEngage` — flip whenever engage lands
at stage 2. One place; the only new behavior is for engages landing
when the stage was already 2 (the pre-established-favor route), which
is exactly the defect. Proof: extend the r156 proof test with a
pre-established-favor + request-thread staging (new test file
`scripts/test-landing-r157-commit-menu-residual-20261123.js`).

**Mechanism refined (transcript-read, pre-panel):** the r156 Landon
transcript (`landing-r156-after/journey-landing-r62-transcript-1375-
day26.txt`, read in full this run) pins the exact turn sequence. The
sitting opens pre-empted by a linkraise + betrayal offer — the want
sits at stage 0 with no favor attached, thread 'request', the favor
living only in the ledger. The player picks [dlg:help] at stage 0
(NOT stage 2 — the HONEST REPEAT early return is not the route);
engageBeat's deferred branch calls the opener, whose follow-up branch
sets stage 2 directly and returns "I still need help with the pantry
run."; the turn handler then calls `convoWantEngage('engage')` with
the stage already 2, so the r156 flip inside the guard is skipped.
The [dlg:more] depth path then delivers the favor's depth lines via
the request-thread engageBeat fallback (`conversation.js` ~4310)
without flipping either. The fix at `convoWantEngage` covers the
route as actually driven; no change to the [dlg:help] early return or
the [dlg:more] depth path is needed for this defect. Proof-test
staging reproduces this exact state (stage 0, fromSeed, no favor
attached, thread 'request') and goes RED→GREEN on the fix alone.

## The leg's question

Does the r156 residual route close on the r157 panel — M-PR1
never-offered among established sittings → 0, with no other dialogue
regression? **Interesting if:** the residual recurs via a third route;
M-PR1 regresses above its 15% bar; the fix changes any other
dialogue behavior on the regression watch (bridges, heed, naming,
outing chain, contests).

## Metrics (binding; r156 set + adopted decisions below)

- **M1 ALIVE-D14:** 10/10 alive at d28.
- **M2 SYSTEM CONTACT:** 10/10 by d9.
- **M3 FIGHT-LOG:** 0 unknown triggers.
- **Zero-DMG refused-turns (BINDS):** 0 refused turns; raw zero-DMG
  reported with the v4 split (stoodThroughByChoice / refusedTurns).
- **Practice:** movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- **Pocket (BINDS):** 0 pocket fights, stuckTurns 0.
- **D1:** 0 garbled-label renders.
- **HEED-V (BINDS):** 0 warned-but-unresolved; legacy HEED counter
  DROPPED (see decisions).
- **M-PR1 (bar ≤ 15%):** never-offered among established sittings
  (settled excluded per the decided R122 rule).
- **Bridges:** 0 repeats in every pool.
- **R66 HUNGRY:** starvationDeaths 0; hungry-at-horizon reported.
- **Scholar deaths ≤ 2.**
- **silentTurns / dry-line proxies:** 0 empty THEM lines, nodloop
  LOOP=0, mimeShown=0.
- **Watches (not bars):** namebeast told-watch (pair check binds per
  decision 1); told-but-never-named count + list; statedAfterPick;
  pool variety (distinct link-accept / heed-beat lines per panel);
  contest ledger (22 fired / ended / open-at-horizon accounting);
  Q1b deflect (13th carry — no deflect sitting fired on r156).

## Metric-review decisions made BEFORE this run (r156 items adopted)

1. **Namebeast told-watch wording — ADOPTED:** the clause is pinned
   to the r152 defect (the vote opening a DIFFERENT beast). Adjudicate
   on the pair check (told beast named = pass); a day-late vote naming
   the RIGHT beast is an investigation item, not a failure.
2. **Told-but-never-named beasts — WATCH ONLY:** report the count +
   list each run; the census addition (per-beast tell/kick/name days)
   stays an instrument proposal for a later run, not this run.
3. **FIGHTALLY2 wording — ADOPTED (restated):** "ends with the scholar
   contributing nothing (no strikes, no moves — the stood-through
   shape)". As written it would flag an honest combat story (r156
   1377 d19, scholar struck twice at 0 dmg vs a flying kite out of
   melee reach, fight won).
4. **HEED legacy counter — DROPPED:** the counter keys on a marker the
   current heed shape doesn't emit (reads 0 while 5 heeded sittings
   exist). Report HEED-V alone.
5. **Q1 panel watch (resume-takes) — DROPPED as uninstrumented:** no
   resume-take count in the analyzers log or any census JSON; same
   class as r155's dropped r267/r268 watches. Needs an instrument or
   stays dropped.
6. **StatedAfterPick at the "interesting if" line — WATCH ONLY:** r156
   hit ≥6 exactly (6, all honest away-guard refusals). No action; the
   count is at the line, not over it.
7. **Pool-variety watch — ADDED (watch, not bar):** distinct
   link-accept lines and distinct heed-beat lines per panel. No bar
   covers cross-seed pool reuse; D2 reads 0.
8. **M-PR1 residual fix shape — THIS RUN'S BLANK** (see above).
9. **Contest-death ledger item — STAYS FILED for a builder arm:**
   r155 CONFIRMED (contest ending by participant death never emits
   `contest_end`, ledger endDay stays null); proposed fix is one line
   (emit `contest_end` from `_contestDie`). One blank per run holds —
   NOT this run's fix.
10. **Q1b deflect — 13TH CARRY:** no deflect sitting fired on r156
    (0 [dlg:subject] picks across the warn_you sittings; 10 [dlg:heed]
    picks). Remains a design question; no fix unless a deflect sitting
    shows a new defect shape — else document and carry.
11. **Carried r156 metric-review items 1–8** (see r156 run note) —
    unchanged except as decided above.

## Panel

Driver `scripts/journey-landing-r157-20261123.js` (r156 driver verbatim
except OUTDIR, header, default seeds — fresh band 1382–1391). DAYS=28
(days 1–14 judged, horizon d28). Analyzers
`evidence/2026-11-23/journey-landing-r157-analyzers.sh` (15 analyzers,
r156 order). Policy: r156 control verbatim. Pilot seeds 1382–1385;
expand to the full band only if the pilot shows the leg's question is
live (M-PR1 residual shape present or absent with a readable cause).

## Telemetry

Baseline `hidden_files/telemetry-baselines/landing-split.json`
(landing.json is SUPERSEDED — pre-split deaths series; do not compare
against it). Metrics: `systemDay,villagerDeaths,monsterKills,
folTelemetry.fires,starvAutopsies`. r156 panel values for the record:
monsterKills 415, villagerDeaths 9, starvationDeaths 0.
