# Journey endgame r198 — ADOPTION run note (Lane B, 2026-11-13 23:00 CST occurrence)

Leg 4 (endgame). This run ADOPTED the timed-out 22:00 CST r198 run; it did not
start a new leg-4 run. Rotation-b still reads 4 at this note's writing — it
advances to 5 (social life) ONLY after a verified landing of a COMPLETE r198;
a partial adoption does not advance the leg (prereg, r135/r138/r140/r194
precedent).

## Adoption (stale-lock recovery)

- Previous r198 run (lock run_id 2026-11-14T03:56:19Z) TIMED OUT at 22:57 CST /
  04:57Z. Registry heartbeat 04:40:43Z (17 min stale at the 23:00 check); no
  process with cwd in the tree (verified by /proc scan); newest write
  04:55:10Z (pass-B recovery tail). DEAD per the 15-minute rule — lock
  deleted, "stale-lock recovery" recorded here.
- This run (lock run_id 2026-11-14T05:00:45Z) adopted the existing tree
  `journey2-endgame` (branch tip 72425fef6) instead of registering a new one.
  Heartbeat landed 05:04:27Z (verified readback, status active). Later
  heartbeats were blocked by the second flap window + REGISTRY.lock
  contention (see below); the tree's heartbeat is stale at closeout but the
  reaper removes at ~4h stale, so no removal risk inside this run.
- Recovered state: prereg + instruments + M23/M2c proof tests committed
  (72425fef6); pass A complete GO; pass B 89701–89703 done + 89704 partial
  (0-byte JSON); passes C/C-wide/dark lost to the 22:47–22:50 CST flap window;
  dark dir held only v1a/v1b. No game-code fix emerged from the pilot, so no
  src/js change was made by either the original run or this adoption.

## What the adoption did

- Verified pass A: PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO (analyzer exit 0,
  04:42:40Z). Telemetry check QUIET vs the r188 baseline (5 files, 3 metrics,
  no large deviations; baseline NOT rolled).
- Dark probe RE-RUN (adopt): EXIT 0, 7/7 variants, failed steps exactly
  v1a-loss:D2-twist-fired — bit-identical to r171/r178/r182/r185/r188/r194.
  v3 still names Amelia Moon. DARK RE-VERIFIED.
- Pass B adopt re-run: deterministic reproduction (89701 matches the recovery
  run's values exactly: sat d92, lesser/feared, deedGate day 92 ok:false
  w5:0, ladder counted 69). Killed at 05:16:51Z by a NEW flap window (below)
  after 89701/89702 completed; 89703's JSON was truncated to 0 bytes by the
  flap mid-write; 89704/89705 never ran.
- Pass C adopt: never started — the probe died in 5s at flap onset; outdir
  never created. C-wide: CUT (never started; first in the prereg cut order).
- LESSON (own goal, record for the next run): the first adopt chain ran the
  probe WITHOUT the five diag-gate env vars (FULLSEAT/VETCOMMIT/
  CAPABLE_GREEDY/ARMORYDRIVE/CAPABLE_VETGUARD) and both probes exited 2 in
  ~1s with "SWEEP STOP: FULLSEAT=1 required". The corrected chain (all five
  set) ran pass B cleanly until the flap killed it. The env gate is in the
  probe header (lines 298–306); the recovery commands below include it.

## Pass A vs r194 — headline difference (same-run investigation item)

- Sat days moved EARLIER on 4/5 seeds: 110→92, 116→100, 97→90, 90→90,
  115→90. Census fights differ (89701: 19→7 fights, vetFights 220→50,
  final mercy→pledge, surge d60→never; 89702: 12→4 fights; 89703: 6→11
  fights, causalDeaths 0→4; 89705: w5max 1→5, wave 5 faced five times,
  final quiet→pledge). 89704 (forcedrift) is BIT-IDENTICAL on every field.
- The probe is verified behaviorally identical in pass A: diff vs the r194
  probe shows ONLY the two named pass-B/C sections (§NO-OVER-ATTEMPT guard,
  §REFUSAL-WINDOW recording — both inert with CAPSTONE unset) plus
  header/PLAN/EVID renames. The divergence is a GAME-CODE effect, not a
  probe artifact.
- Leading hypothesis (NOT proven): the narration-dedup deltas changed
  say-variant RNG consumption and shifted the seeded stream on waves seeds —
  steeple-a (6daaafae4) skips say calls once per (fight, monster), and
  strikefall-a (12d263736) defers death lines past the player strike line
  (its diff touches a `Math.random() < 0.6` hushwolf branch, though the draw
  itself is unchanged — only `say` → `_deathSay`). Forcedrift never hits
  those paths, so it stays identical. Recorded as the hypothesis to test, not
  a claim; a same-run investigation item per the prereg, never a road claim.
- Verdicts UNCHANGED: lesser 5/5, full 0/5, village-lost 0/5, uw sum 22,
  ladder peak 3 on all seeds. 89705 IMPROVED (wave-5 faced 5× vs 1× in r194).
  Telemetry sums (uw 22, won 5, peakVet 7) are EXACTLY r194's — same regime.

## People check (pass-A transcripts; 89703/89704/89705 read in full)

- 89704 relay/dark finale: coherent and consequential — the pods open "not
  like morning. Like a barracks", Poran's brother in the row, the village
  going quiet, the System delighted and not understanding why nobody else is.
  The audit names real deeds (waves 15/6/5, 8 wave-4, 3 wave-5, 8 contests,
  4 crises); the full-seat gap is named honestly (no capstone deed delivered).
- 89705 feared/light finale: "Pledge the terror" resolves; the Oversight coda
  (the little ones still napping in rows of humming glass) lands; the
  Architect beat for Leo Martin ("the galaxy will remember the god's name.
  The village will remember who built the door").
- 89703 beloved/light finale: the Relay appointment costs honestly ("Hauwa
  was the weakest forager, and everyone knows it. The appointment stings —
  resentment moves through the fire like smoke"); Sofia's quiet tip about
  food moving before the moot; spending the last love on the unfilmed
  villages and the dead nobody named.
- Deltas (a) retribution-death-line deferral, (c)/(d) steeple + strikefall
  dedup: UNEXERCISED in the announce→end windows (0 RETRIBUTION mentions in
  all five transcripts; no steeple/rage lines) — corpus gap, carried, not a
  verdict. (b)/(e)/(f) live in conversation turns, also unexercised here.
- No 159-turn Algorithm fight recurrence (longest r198 fight: 27 turns,
  89701 vKill). The war-path wave-5 bar line on LESSER-seat audits is the
  correct shortfall naming, NOT the r188 full-seat defect.
- Verdict: the finales read as people. REACHABLE yes (5/5 sat), FUN yes
  (the finales land), WINNABLE yes-rarely via the bought-bundle road (r194
  pass C: full 2/5) — the tribute road still never fires, and the full seat
  on pass A stays 0/5 by design (no delivery policy).

## Flap window 2 (23:16 CST– , 05:16Z– )

- NEW true flap: first failed watcher cycle 05:17:05Z (A=FAIL@write EPERM
  errno=1, B=FAIL update-ref rc=128, E=FAIL@write, G/H/I FAIL); still
  failing at 05:27:36Z (7 consecutive failed cycles). Same signature as all
  prior windows; load low (1.2–3.1), exonerated again. Root cause still
  unestablished (host-side, per the 2026-11-12 finding).
- Casualties: pass-B probe FATAL EPERM writing 89704 (05:16:51Z); 89703's
  JSON truncated to 0 bytes mid-write; pass-C probe died at startup;
  heartbeat writes denied (registry hb stuck at 05:04:27Z — re-heartbeat
  immediately when writes clear); `git update-ref` probe fails (rc=128).
  Small plain writes still work (verified 05:28Z: small create/read/delete
  OK) — the denial hits atomic/git/large writes.
- CLOSEOUT: still active at 05:34:42Z (12 consecutive failed watcher cycles,
  ~18 min). This adoption CLOSES PARTIAL (see Closeout below) — no commit
  was attempted while the write probe fails, per the flap-response skill.

## Metric review (§14)

- M23-CAPSTONE (REVISED): UNJUDGED on the adopt corpus — pass B incomplete
  (no 89704 delivery attempt in the adopt corpus). The committed proof test
  (scripts/test-m23-revision-r198.js, log journey-endgame-r198-proof-m23.log:
  ALL PASS) still covers the rule on r194 corpora. Carried to r199.
- M25c / M24b: UNJUDGED — pass C never ran. Carried.
- CORPUS-PURITY: pass A GO (5/5 valid JSONs); pass B NO-GO as it stands
  (0-byte 89703 JSON + missing 89704/89705) — an instrument casualty of the
  flap, not a game verdict. Regenerate deterministically (commands below).
- Telemetry: QUIET; baseline NOT rolled (r198 sums = r194 sums exactly).
- Sat-day shift: the prereg's "interesting finding" fired — recorded above as
  a same-run investigation item with the dedup-RNG hypothesis. If r199
  reproduces the shift on the same substrate, it is a real game-code
  trajectory change, not noise; the M1/M2 bindings still GO, so it does not
  change the leg verdict.

## Closeout — PARTIAL (adoption closed 23:36 CST / 05:36Z, flap still active)

- NOT merged, rotation NOT advanced (stays 4). The r198 committed core
  (A+B+C) is incomplete: pass A verified GO, dark re-verified, pass B 2/5
  valid in the adopt corpus, pass C 0/5, C-wide CUT. Per the prereg, a
  partial run does not advance the leg.
- NO commit attempted: the `git update-ref` write probe fails (rc=128) under
  the active flap, and the flap-response skill says stop writing when the
  probe fails. No safe-commit, no merge, no release — nothing forced.
- HELD: branch journey2-endgame (72425fef6, prereg + instruments + proofs)
  and worktree ~/workspace/worktrees/journey2-endgame (registered, status
  active, heartbeat stale at 05:04:27Z — re-heartbeat FIRST on the next
  adoption; the reaper removes at ~4h stale). All evidence in the tree is
  uncommitted; the next Lane B occurrence adopts this tree (stale-lock
  recovery again) and finishes B/C with the recovery commands below.
  This adoption's heartbeat loop (started 05:09Z, re-heartbeats every ~7 min)
  was left running as the tree's lifeline until the next adoption starts its
  own loop — kill it then, or let both run (idempotent).
- BACKUP: this run note is copied to the goal hidden_files
  (r198-adoption-backup/journey-endgame-r198.md — verified byte-identical)
  so the analysis survives even if the tree is reaped before the next
  adoption; the per-seed JSONs are deterministic regenerations (same seeds
  + substrate + probe) and were not copied. (The dark-adopt and analyzer
  log copies were refused by the flap — 0-byte husks removed; both logs are
  regenerable from the corpora/probe in seconds.)
- MAIN-TREE FLAP DAMAGE (found at closeout 05:36Z, REPORTED LOUDLY, NOT
  repaired by this run — the body forbids main-tree writes, and the flap is
  still active): docs/ONTOLOGY.md and sw.js in ~/workspace/the-scattering
  are TRUNCATED TO 0 BYTES (sw.js emptied 05:29Z, ONTOLOGY.md 05:32Z, mid
  flap-window-2 — a sibling writer's writes were truncated; this run never
  wrote to the main tree — it was clean at run start). Nothing is lost: both
  blobs are intact in HEAD f59b4b674. Restore AFTER the flap clears, in the
  main tree: `git checkout HEAD -- docs/ONTOLOGY.md sw.js`, then verify
  `git status --short` empty. The next landing is BLOCKED until this is
  repaired (a dirty main tree fails pre-flight).
- C-wide: CUT. Dark: re-verified. Pass B: 2/5 valid in the adopt corpus
  (89701/89702), 89703 truncated to 0 bytes, 89704/89705 missing.
  Pass C: 0/5.

## Recovery commands (next run — in the worktree, AFTER writes clear)

```bash
cd ~/workspace/worktrees/journey2-endgame   # or the next run's adopted tree
# REQUIRED probe gate env (the probe exits 2 without all five):
export FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1
# Pass B remainder (89701/89702 valid; regenerates truncated 89703 + 89704/89705):
SEEDS=89703,89704,89705 CAPSTONE=1 BUYOUT=1 EVIDDIR=evidence/2026-11-14/perseed-endgame-r198-b node scripts/probe-endgame-r198-20261114.js
# Pass C full (outdir does not exist yet):
SEEDS=89701,89702,89703,89704,89705 CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 EVIDDIR=evidence/2026-11-14/perseed-endgame-r198-c node scripts/probe-endgame-r198-20261114.js
# Analyzers (exit 0 = ALL GO):
ANALYZEDIR=evidence/2026-11-14/perseed-endgame-r198-b node scripts/analyze-endgame-r198-20261114.js
ANALYZEDIR=evidence/2026-11-14/perseed-endgame-r198-c node scripts/analyze-endgame-r198-20261114.js
# Then: run note update, safe-commit, ff-only merge, release, rotation 4->5.
# C-wide (stretch, 8 fresh seeds 89714-89721) only if the window allows.
```

## Completion — this run (Lane B 01:00 CST 2026-11-14, second adoption; r198 CLOSED COMPLETE)

- This run adopted the r198 tree a second time (lock run_id
  journey2-endgame-20261114-0655Z; stale-lock recovery — registry heartbeat
  05:04:27Z, no live process, VM replaced 05:04–05:06Z). Heartbeat landed
  07:00:01Z immediately after adoption (readback verified, field is
  `heartbeat_at`); hb loop `journey2-endgame-hbloop-r199.sh` re-heartbeats
  every 5 min (log evidence/2026-11-14/journey-endgame-r199-hb.log).
- Main tree clean at run start (ONTOLOGY.md/sw.js flap damage repaired by
  the main session 00:07–00:08 CST); disk 41%. Reaper SKIPPED on the held
  registry lock (5th consecutive skip — known lock self-contention, open
  item, not this run's to fix). Flap watcher ALL-OK 06:41–06:56Z; writes
  clear at run start.
- VM REPLACEMENT #2 (~07:06–07:07Z, new boot id 76881aa4): killed the first
  recovery chain mid-pass-C (after pass-C 89701 completed 07:05) AND the
  flap watcher (log stops 07:06:36Z; watchdog cron owns its restart) AND
  the hb loop. Recovered by re-heartbeating FIRST (07:15:14Z, verified),
  restarting the hb loop (07:15:21Z), and re-running the corrected chain.
  Nothing was lost: all files persist across replacements; the chain's
  pass-B 89703 + pass-C 89701 JSONs survived intact.

### RELAYGREY finding (recovery-command bug, this run)

- The adoption note's recovery commands omitted RELAYGREY=1. The probe
  exits 2 on the forcedrift plan without it (probe header line 283 names
  the canonical env; the gate is at probe line 466). The first chain
  completed pass-B 89703, then stopped at 89704 with
  `SWEEP STOP: RELAYGREY=1 required for the forcedrift plan` (PASS_B_RC=2),
  and pass C stopped the same way after 89701–89703. The corrected chain
  (chain2, all six vars incl. RELAYGREY=1) completed pass B 89704/89705
  (RC 0) and pass C 89702–89705 (RC 0). LESSON for the next run: the
  probe's env is SIX vars, not five — FULLSEAT, VETCOMMIT, CAPABLE_GREEDY,
  ARMORYDRIVE, CAPABLE_VETGUARD, RELAYGREY. TELEMETRY_FULL is inert in
  this probe (never read; only a comment + a balance-panel flag name).

### Pass B (complete, 5/5) — analyzer RC=1, sole failure M23 (see metric review)

- 89701/89702/89703 BIT-IDENTICAL to pass A on every headline field (sat,
  seat, path, branch, alive, ladder, capstone, buyout, deedGate) — the
  probe is deterministic across the CAPSTONE/BUYOUT flags when no
  delivery fires, as designed.
- 89704 scholar+1: 3 attempts d87/d88/d89, all 'veterans-short'; refusal
  recorded; M24b GO. 89705: feast_embassy delivered d68, priced FULL.
- Tally: lesser 4/5, full 1/5 (89705), lost 0/5. M23 NO-GO as printed:
  "2 eligible: delivered 1/2, none-ready 0, exempt-refused 3,
  NON-EXEMPT-refused-despite-ready 0, pricedFull 1/2 — 89704:none |
  89705:feast_embassy@d68/FULL". M24 GO VACUOUS (no tribute delivery).
  M25c GO (leg disabled on B). Everything else GO, incl. CORPUS-PURITY
  5/5, M2c, M21, KILL-ANATOMY 31/31, MFLEE 13/13.
- §NO-OVER-ATTEMPT: zero 'over' attempts on every pass — the guard works.
- §REFUSAL-WINDOW: 89704 pass-B transcript starts at the first refusal
  (firstRefusalCapIdx 14144 < announceCapIdx 14538; 442 SAY lines d87→end);
  capstoneRefusalVoicing carries 3 entries, each `"lines": []` — the
  in-sim slice is honestly empty, exactly as the prereg's honest limit
  predicted (the refusal voicing lives in app.js, not the node engine).
  The app.js-only voicing remains the carried gap.

### Pass C (complete, 5/5) — analyzer RC=0: PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO

- M23 GO: "2 eligible: delivered 2/2, none-ready 0, exempt-refused 0,
  NON-EXEMPT-refused-despite-ready 0, pricedFull 2/2 —
  89703:feast_embassy@d87/FULL | 89704:feast_embassy@d69/FULL".
- M25c GO: 5 eligible early-days, 0 skipped, 22 early attempts, 5 bought
  (89701 d44, 89702 d30, 89703 d41, 89704 d30, 89705 d34 — all
  dg-not-ok, all at Haven, pantry 9211–27999 at buy).
- Tally: lesser 3/5, full 2/5 (89703 d92, 89704 d90), lost 0/5. M24 GO
  VACUOUS; M24b GO VACUOUS (no scholar+1 seed on pass C — the early
  buyout changed 89704's trajectory so the shape never arose).
- Starvation: 89701 bought d44 with pantry-after 875 — zero starvation
  deaths. 89704 bought d30 (pantry-after 19837) then suffered a d53–62
  supply crunch: 4 thirst deaths (Jorge d53, Nikos d54, Henrik d60,
  Roberto d61) + 2 starvation (Rosa Mendez d60, Omar Farouk d62). The
  crunch is thirst-led with a full pantry behind it — NOT buyout-caused
  (pantry 19,837 after the buy; 4,404 at sit). Named here as a finding
  for the water-economy question (open item), not a metric miss.
- Pass-C trajectory shift (buyout-early perturbation) CONFIRMED as known
  r194 behavior, not a new divergence: r194 pass C 89701 sat d128 vs
  pass A d110 (path feared→beloved, ladder 58→95); r198 pass C 89701 sat
  d99 vs pass A d92 (feared→beloved, ladder 69→61, buyAtt 8). The
  early-buyout attempts perturb the trajectory (RNG consumption in the
  attempt path); the matched pass-C comparison is vs r194 pass C, not
  vs pass A. Verdicts reproduce r194's shape (lesser 3/5, full 2/5).
- 89705 pass C LOST its wave-5 faces vs pass A/B (uw5 NEVER-ARRIVED,
  sat lesser) — the buyout-early trajectory closed its wave-5 road.
  89703 pass C GAINED wave-5 faces (rerun d76, editor d87) and the full
  seat — the same perturbation opening a road elsewhere.
- 159-turn Algorithm fight: NO recurrence. Longest fight this run: 80
  turns (89703 pass C, rerun d76, outcome vDie + flee — a villager died
  and the rest got away; its SAY lines sit before the announce window,
  so the transcript cannot show whether it read as stuck).

### People check (transcripts read in full)

- 89704 pass B (448 lines, relay/dark lesser): the refusal days ARE in
  the widened window — the d88 raid (Editor + Spoiler, Eulogy
  contradictions, counters learned from lived fights), the d89 walk-in
  talk-down, "Poran won't meet your eye... Promises rot. (-15 trust)".
  The finale lands (pods "not like morning. Like a barracks", Poran's
  brother in the row, the village going quiet, the System delighted and
  not understanding why). The audit names the gap honestly (no capstone
  deed delivered) and the war-path line names the wave-5 bar correctly
  on a lesser seat.
- 89705 pass B (56 lines, indispensable full): "A full seat... The table
  rises when you enter." The treaty beats are consequential (lowball /
  refuse / keep the ramp; "Mutual need means mutual leaving"). Aurora
  catching herself re-teaching White Oak Acorns is a human touch.
- 89703 pass C (152 lines, indispensable full): "That night, they bring
  Grace home... the filling of it is yours." "Zoe waits two days at your
  fire, getting thinner. Nobody answers... They'll remember the
  silence." Looting has a cost ("Your hands know what they did. (+14
  trauma)"). The full seat reads as earned.
- 89704 pass C (60 lines, relay/dark FULL): "the village grieves you
  while you're alive, and you feel their grief the way weather feels
  rain... The System finally says your name right." Seif speaks only
  Arabic — "No shared words at all — just eyes, hands, and patience" —
  and the level-up counts "18 words shared at the fire". The war-path
  names Rosa (d55) and Omar (d47) — the same two who starved d60/d62.
- FINDINGS (documented, not fixed in this run — see metric review):
  (a) REPETITION: identical SAY lines repeat verbatim — the d90
  Blackberry eat-loop (~20× "Took Blackberry (dried)... You eat
  Blackberry (65 kcal)"), "You wait. The light changes. Nothing asks
  anything of you." (×6), "Still full. (Eat, test a lump, or leave
  some.)" (×15), the Hassan-cook duty line (×4), the Knife-roll gift
  line (×3), the REROUTE line (×3). Batching repeated identical SAY
  lines into one line would read as a person, not a macro. Needs its
  own prereg + proof; out of this completion run's scope.
  (b) The Indispensable middle beats read as if all three happened
  (lowball / refuse / trade the ramp) before the final pick contradicts
  the third ("with the ramp intact") — a transcript-linearization quirk.
  (c) Doubled quotes on SYSTEM lines (""...""), minor rendering quirk.
  (d) Three identical 175× Blackberry stacks listed separately (stacks
  not merging).
- Deltas (a) retribution-death-line deferral, (c)/(d) steeple +
  strikefall dedup: STILL UNEXERCISED in the announce→end windows (0
  RETRIBUTION mentions in all B/C transcripts) — corpus gap, carried.
  (b)/(e)/(f) live in conversation turns, also unexercised here.

### Metric review (§14)

- M23-CAPSTONE (REVISED): the analyzer's M23 implementation does NOT
  implement its own prereg text. `capNoRefusal` (analyzer line ~1290)
  is `capEligible.every(x => x.refusedNonExempt === 0 && x.delivered)`
  — it demands delivery from EVERY eligible seed. The prereg text and
  the analyzer's own comment block both say GO iff ≥1 eligible seed
  delivered AND tableSeat() priced 'full' on ≥1 delivered seed AND
  zero non-exempt refusals on any eligible seed. Pass B's mixed case
  (89705 delivered + priced full, 89704 eligible-undelivered with all
  refusals exempt, 0 non-exempt) is GO by the prereg text and NO-GO by
  the code. The printed NO-GO stands for this run (no re-scoring
  mid-run); the proposed fix for r199 is to drop `&& x.delivered` from
  `capNoRefusal` (the VACUOUS clause already handles the
  delivered-0/all-exempt case). This is the exact shape the revision was
  written for — the scholar+1 seed must not fail M23 — and the code
  still fails it. Likely provenance: the `&& x.delivered` is a carryover
  from the pre-revision rule.
- M25c / M24b / M2c / CORPUS-PURITY: HOLD (all GO on their passes).
- Telemetry: QUIET vs the r188 baseline (pass A, 5 files, 3 metrics);
  baseline NOT rolled (r198 pass-A sums uw 22, won 5, peakVet 7 =
  r194's exactly, same regime).
- C-wide: CUT (two VM replacements consumed the window; the committed
  core A+B+C is complete; C-wide was first in the prereg cut order).
  Fresh band 89714–89721 stays unused for a later run.
- Pass-B M23 NO-GO does not change the leg verdict: pass C is ALL GO,
  pass A is ALL GO, and the pass-B game behavior was correct (89704's
  refusal is the ruled scholar+1 shape, M24b GO; 89705 delivered and
  priced FULL). The NO-GO is a metric-implementation miss, recorded
  here, fix proposed for r199.

### Verdicts

- REACHABLE yes (5/5 sat on every pass; the table, the ladder, the
  bundle and the capstone roads all fire in-sim). FUN yes (the finales
  land — relay/dark and indispensable/light both read as earned, with
  real grief and real social cost on the way). WINNABLE yes-rarely via
  the bought-bundle road (pass C full 2/5; pass B full 1/5) — the
  tribute road still never fires (M24 VACUOUS again), and the full seat
  on pass A stays 0/5 by design (no delivery policy).
- Village assessment (plain words): all five villages survived to the
  table; nobody scattered. The wave-4 wall still holds for the waves
  seeds (0/3 face wave 5 on pass A/B; the full seats come from the
  forcedrift control and the buyout-perturbed trajectories, not from
  wild wave-5 kills). The villages that sat full did it by buying the
  feast bundle early and delivering the embassy — the road works, but
  it runs on the pantry, and one village paid for the early buy with a
  thirst-led crunch a month later. The scholar+1 shape (89704) is the
  honest edge: the bar counts the scholar, the payment cannot take
  them, and the game says so out loud in the refusal — it just cannot
  say it where the player can hear it (app.js-only voicing, carried).

### Closeout (this run)

- Files: prereg + instruments + proof tests (72425fef6, already
  committed); this completion adds the pass-B/C corpora, analyzer logs
  (chain + chain2), the completion addendum to this note, and the
  chain/hbloop scripts. Safe-commit, rebase onto master 63c051206,
  proof-test re-run, ff-only merge, release, rotation 4→5 (social life
  next) — each verified below at landing time.

## Files

- Prereg + instruments + proof tests: committed 72425fef6 (branch
  journey2-endgame).
- Pass A corpus: evidence/2026-11-14/perseed-endgame-r198/ (5 JSONs +
  transcripts, analyzer log journey-endgame-r198-a-analyzer.log — ALL GO).
- Dark corpus: evidence/2026-11-14/perseed-endgame-r198-dark/ (7 variants,
  adopt log journey-endgame-r198-dark-adopt.log — only v1a-loss:D2-twist-fired).
- Pass B complete: evidence/2026-11-14/perseed-endgame-r198-b/ (5 JSONs +
  transcripts; analyzer RC=1, sole failure M23 — see metric review).
- Pass C complete: evidence/2026-11-14/perseed-endgame-r198-c/ (5 JSONs +
  transcripts; analyzer RC=0, ALL GO).
- C-wide: CUT (never started; fresh band 89714–89721 unused).
- Proof logs: journey-endgame-r198-proof-m23.log (ALL PASS),
  journey-endgame-r198-proof-m2c.log (ALL PASS).
- Chain logs: journey-endgame-r198-chain.log (original run),
  journey-endgame-r198-adopt-chain.log + adopt-chain2.log (first adoption),
  journey-endgame-r199-chain.log (this run: RELAYGREY stop, killed by the
  07:06Z VM replacement) + journey-endgame-r199-chain2.log (this run:
  corrected, B/C complete, analyzers B RC=1 / C RC=0),
  journey-endgame-r199-hb.log (heartbeat loop, restarted after the
  replacement).
- Scripts: journey-endgame-r199-chain.sh, journey-endgame-r199-chain2.sh,
  journey2-endgame-hbloop-r199.sh (tree root, this run).
