# Journey endgame r72 — EVIDENCE (lane B, completed 2026-10-30)

## Run provenance — read this first

This run ADOPTED a dead run. The 01:00 CDT scheduled run found the
previous Lane B run's lock (run_id 2026-10-30T03:55:00Z) with its
registered worktree `journey2-endgame` heartbeat 62 minutes stale
(04:53Z vs 05:55Z now) — dead by the overlap guard, not live. Per the
guard: lock deleted, stale-lock recovery noted here, and this run
continued the same worktree/slug (re-registering would collide) with a
fresh heartbeat, rather than discarding the prior run's real work.

What the prior run had already done before dying: pre-registration
(`evidence/2026-10-29/journey-endgame-r72-prereg.md`, committed
b15197428) plus the probe/analyzer instruments, and the full 7-seed
probe run (180d, death-aware). What it had NOT done: analysis,
sense-read, evidence note, commit of per-seed data, merge, rotation
write. This run did all of that. No seed was re-run; the per-seed
JSONs below are the prior run's probe output, analyzed here.
Substrate exactly as pre-registered (r71 substrate + 3 new read-only
instruments). ZERO src/js changes (gating freeze, Steve 2026-10-27
16:53, stands).

Seeds: 88951–88953 waves (Arm A), 88954 forcedrift control,
88955–88957 waves + NOWALKIN_W4 (Arm B). Analyzer:
`scripts/analyze-endgame-r72-20261030.js`, full output in
`evidence/2026-10-29/journey-endgame-r72-analysis.txt`. The analyzer
exits 1 on PRIMARY NO-GO by design — that exit code IS the verdict,
not a crash.

## Village assessment, in plain words

Five villages won the lesser seat, none won the full seat, none met a
wave-5 monster, one village died outright, one was turned away by the
table itself.

- 88951 (waves): won lesser, feared pledge. Only 3 deaths, plenty of
  armor (8) and tricks (19), but zero wave-4 kills and zero living
  veterans — it sat at wave 3 with wave-4 breadth 0/3. A strong,
  well-equipped village that never became a veteran village.
- 88952 (waves): the village died before the window ever opened
  (3 early deaths, wave 2). An honest death, not a system failure —
  the run ends there, no filler days ticked.
- 88953 (waves): survived with the harshest toll (16 deaths) and the
  sharpest story in the block (see below): its player had taken the
  fusion-reactor pellet, so the village never hungered, never feasted,
  never surged — and the table, pricing the run, found nothing it
  could price and did not come. It talked down all three wave-4
  meetings it had instead of fighting them.
- 88954 (forcedrift control): won lesser, relay-dark — merged with
  the machine (see sense-read). 2 deaths, 4 wave-4+ kills, the only
  control-style feast chain in the block (8 feasts, all armed, 15
  grants, all granted). Its gated standing sat at exactly 199 for
  87 days while its raw standing ran to 532.
- 88955 (wavesnw): won lesser, witness path. 15 deaths; all three
  committed wave-4 fights were lost or fled (2 villagers died, 1
  fled). Reached the table anyway — the lesser seat does not demand
  wave-4 kills, and this village proves it again.
- 88956 (wavesnw): won lesser, beloved path. 9 deaths; its one
  wave-4 kill (an Algorithm) came on day 104, the very day it sat.
  One living veteran at the end (Onni Korhonen).
- 88957 (wavesnw): won lesser, beloved path. 14 deaths; one wave-4
  kill (an Influencer, day 79), but its veteran was dead by the end
  (peak 1 on day 80, 0 at close).

The shape of the wall is unchanged: every waves seed reads wave-5
breadth 0/2, and no seed peaked at 2 living veterans (peaks 0, 0, 0,
0, 1, 1). The villages that win are well-armed and well-tricked but
not veteran villages — the full seat's veteran bar and wave-5 breadth
bar are both still unmet, on every seed.

## Leg questions, answered

1. FULL SEAT LAST MILE — no third shape, no progress. No fresh seed
   faced a second distinct wave-5 type (wave-5 faced: 0 on all six),
   none earned the full seat. The two r71 shapes persist: breadth-
   short (88951: w3 3/4, w4 0/3; 88956: w3 3/4, w4 1/3) and
   veteran-survival + w5-breadth short (88955/88957: veterans 0 at
   close, w5 0/2).
2. PEAK LIVING VETERANS, third block — NO. 0/6 peaked >= 2. This
   breaks the r68+r71 pattern (each block peaked >= 2 somewhere).
   Small counts, but the direction is down, not up.
3. RELEASE-DAY SNAPSHOT — vacuous. No seed reached uw=5, so no
   snapshot could exist. M13 vacuous GO.
4. NOWALKIN REPLICATION, sixth block — Arm B wins this block
   (kills 2 vs 0). Series tally now 3–3 Arm A (r60 A, r61 B, r65 B,
   r68 A, r71 A, r72 B). The direction has now flipped three times
   in the series. No lever fate — kill discipline holds.
5. RELAY-BRANCH TALLY — one relay final in the block: the control,
   dark (88954, noticed, 1 band crossing, 47 verbs, 7 communes).
   Series now dark 5, grey 1, light 1. No second grey or light
   observation. The waves seeds' own finals were feared, witness,
   beloved, beloved — all light-voiced, none relay.
6. FEAST-CHAIN CENSUS + GRANT LOG — the grant log answers r71's
   question, and the answer is NOT refusal. Across the block there
   was exactly ONE refused grant: 88953's sole call, refused by the
   reactor ceiling (its player carried the pellet). Every other
   grant was granted (control 15/15, 88956 6/6, the rest 1/1).
   The waves choke is upstream of the grant: waves seeds almost
   never HOLD a scale feast (feasts 0 on all six waves seeds;
   feast-surge feasts 1–6), even while devotion reads armed on
   28–164 post-daily samples. Armed devotion with no feast to grant
   is the gap — the next run's feast question should ask why scale
   feasts are not held on waves arms, not why grants refuse.
7. DECLINE vs SILENT NO-SHOW — no decline at all in the block
   (same as r71). The one non-announced surviving seed, 88953, is
   a WITHDRAWAL, voiced, with a named cause (see sense-read) — the
   table itself did not come. Not a decline-and-return, not a
   silent no-show. M14 GO: all six waves seeds classified.
8. GHOST LINES — no recurrence. 220 back-with lines scanned across
   the block, 0 hits (third straight clean block after r71's 250).
9. 199 MECHANISM — CONFIRMED, and it is the mechanism, not a
   coincidence. Three seeds derived a gated peak of exactly 199
   with raw peaks far above 200 and a defer5/cap hold on the record:
   88954 control (raw 532, 87 days at 199), 88955 (raw 222, 24 days),
   88956 (raw 297, 16 days). The gated total is held at t5−1 by the
   readiness deferral / plenty cap while the raw standing runs
   past it. The 199 attractor from r68+r71 now has its mechanism
   named. Full-seat max standing never exceeded 199 on any seed.
10. AUDIT CROSS-CHECK — holds 5/5. Every sat seed's audit line
    parses and equals satWaves exactly on all five counts (M21 GO).
    Census-vs-audit deltas read as repeat fights, not gaps: the
    control's census 9 vs audit types 6 is repeated meetings
    (Reunion twice, Eulogy twice, Suburb fled twice), otherEnd 0
    everywhere. M21's new instrument works as pre-registered.

## Pre-registered verdict

PRIMARY: NO-GO — driven by M2, M3b-peak, and M4 together.

- GO: M1 (7/7 resolved), M2c (census == engine+policy opens 6/6,
  0 errors), M2d (3 uncommitted fights, all classified
  never-observed), M2b (4 villager deaths attributed, all named),
  M5 (control crossed + voiced), M5b (1 relay final tabulated),
  M6 (deferred sat guard named: losses), M10 (full-seat gaps named
  4/4), M11 (peaks reported 6/6), M12 (readiness-bar records 4/4,
  short bars named), M13 vacuous (no uw=5), M14 (invite
  classification 6/6), M15 (feast census 7/7), M16 (dusk census 7/7,
  away-shares 12–83%), M17 (surge spends named 7/7 — all combat,
  player + villagers banking), M18 (ghost scan 7/7, 0 hits),
  M19 (grant log 7/7, the single refusal classified reactor),
  M20 (standing trace 7/7, mechanism classified per seed),
  M21 (audit cross-check 5/5), REG r35/r37 (5/5 each).
- NO-GO: M2 (Arm A with fights 1/3 — 88951 and 88952 recorded zero
  committed wave-4 fights), M3b-peak (0/6 peaked >= 2 living
  veterans), M4 (0/6 wave-5 unlock or full seat).
- TALLY ONLY (not PRIMARY-gating): M3 conversion GO (Arm B 2 kills
  vs Arm A 0); M4b conjunction 0/6 (no seed both unlocked wave 5
  and announced — unsurprising, since none unlocked wave 5).
- VACUOUS (labeled, not counted as proof): M8 (0 mFlee fights —
  conditional binding does not gate), M13 (no uw=5).
- M9 SUPPLY: 80 blocked wave-4 arrivals counted across 7 seeds
  (per seed 3–22), every one carrying the verified contention line
  ("stops at the boundary — pacing, unwilling. Something else is
  already here. It's still out there."). Judged GO against the code
  rule: the single-occupant boundary rule firing as designed, not a
  spawn failure. 88953's 22 blocked arrivals alongside 3 talked-down
  meetings show contention is heaviest exactly where meetings are
  being refused — worth watching, not a bug claim on this evidence.

M2 reading per the carried metric review: M2 measures fight
coverage, not winnability — 88951 won lesser with zero wave-4
fights, the same pattern as r68's 88933. The M2 NO-GO is a coverage
miss, not a leg failure on its own. The PRIMARY NO-GO rests
together on coverage + veteran peak + wave-5/full, all three
missing at once.

## People check (M7: GO — 2 beats sense-read in full, 0 senseless flags)

Beat 1 — 88954 relay-dark finale (transcript window, announce
through sitting). The merge is a real choice with a named price:
the System offers the village's children as "little warm nodes"
and the player says yes; the pods open "not like morning, like a
barracks"; Brayden's son and Cahit's sister are in that row, and
both men "will remember the exact shape of your hand when you did
it." The village does not cheer — "never been this quiet" — and
the System "is delighted, and it doesn't understand why nobody
else is." The dark cost lands on the food thesis too: "you don't
eat anymore; the thought is quaint." The OUTSHONE coda (Rosa
Mendez acted boldly while you watched) is honest about the
player's passivity. The NPC (the System) wants something, the
option engages it, the ending resolves and owes. Sensical.

Beat 2 — 88953 table withdrawal (day 90). The table does not come
because the run, priced honestly, has nothing to price: "NO HUNGER
ON THE RECORD — THE PELLET HUMS WHERE THE FIRE SHOULD BE. NO
FEAST, NO SURGE, NOTHING HERE WE CAN PRICE." The transcript shows
the cause is a real run fact — the player took the fusion-reactor
pellet at line 2259 ("You will never be hungry again") — and the
ledger names exactly what is missing (the food-thesis deeds) while
leaving the door open ("the mantle may pass to hungrier hands;
the table will still be here"). The reactor's bargain has a table
price, and the game says so in its own voice. Sensical, and the
most consequential beat in the block: a single item choice closed
the endgame road, legibly.

No fabricated shared history, no filler loops, no static menus in
either beat. 0 senseless flags.

## Reachable / fun / winnable (leg verdict)

- REACHABLE: yes for the lesser seat (5/7 won it across feared,
  witness, beloved, and relay-dark paths); no for the full seat and
  wave 5 (0/6, third block running with the same wall).
- FUN: the finale beats are strong — the relay-dark merge and the
  reactor withdrawal are both memorable, consequential, and voiced
  in the game's own terms. The field-fight texture is thinner: two
  Arm A seeds never met a committed wave-4 fight at all.
- WINNABLE: the lesser seat is winnable by a competent player on
  this substrate; the full seat is not yet demonstrated winnable
  on any seed in this series. That is the leg's standing verdict,
  unchanged by r72.

## Blank filled / documented

No game fix this run — and deliberately none. The instruments
answered their questions (199 mechanism confirmed, grant refusal
ruled out as the waves choke, audit cross-check validated), and
none of the answers is a bug: the 199 hold is the standing formula
working as coded, the reactor withdrawal is designed coherence,
the blocked arrivals are the contention rule firing. The blank
this run fills is the r72 analysis itself, which the prior run
died before writing. What it documents for the next run: (a) ask
why scale feasts are not HELD on waves arms (not why grants
refuse); (b) the veteran-peak direction is down (0/6 after two
blocks at >= 2 somewhere) — watch whether r73 recovers it before
treating it as a trend; (c) the reactor pellet is now a known
endgame-road closer — a player-facing consequence worth keeping
visible, not a bug to fix.

## Metric review (for the NEXT run, not this one)

- M2's Arm A clause keeps behaving as a coverage metric, not a
  winnability metric (88951 won lesser with 0 fights). Keep the
  bar; never read an M2 NO-GO alone as a leg failure.
- M19/M20/M21 (the three new r72 instruments) all worked first
  time: grant classification, standing-trace derivation, and
  audit==satWaves equality. Keep all three; M20's mech199
  classification is now a solved question, not a watch item —
  future runs report it as regression only.
- M16's dusk census keeps its regression-only role; away-shares
  spread 12–83% with no new hypothesis attached.
- M9's blocked-arrival count (80) needs a comparison bar before
  it can judge anything: propose the next run pre-register a
  contention-share (blocked / (blocked + committed)) rather than
  a raw count.
- NOWALKIN tally 3–3 after six blocks: the series has flipped
  direction three times. Any lever-fate claim on this tally would
  be drift; keep it a tally.
- Telemetry baseline: still the r37-era 2-metric snapshot
  (maxTier/satPenalty) whose own note forbids comparing pre-seat
  corpora against it. This run's check LOUD lines (won 0->5,
  announceDay newly appeared) are the same stale-baseline artifact
  as r48–r71: EXPLAINED, baseline NOT rolled. The re-seed proposal
  stands: re-seed from a same-regime (lesser-seat) corpus and
  record the regime in the baseline note.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/endgame.json --current
'evidence/2026-10-29/perseed-endgame-r72/*.json' --metrics
won,announceDay,satSeatKind` → LOUD: won newly appeared
(baseline 0 -> current 5, n=7); LOUD: announceDay newly appeared
(baseline 0 -> current 466, n=7). Verdict: EXPLAINED — the baseline
file contains only maxTier/satPenalty from an older regime and
says so itself; won/announceDay are not in it at all. Not a bug,
baseline not rolled.

## Addendum — quick-check stalled, killed (2026-10-30 ~06:10 CDT)

`node scripts/check.js --quick` produced zero output in 7+ minutes at
~0.2% CPU while sibling node/jest runs (sim-evadeshape-a sweep,
journey-scale pilot, phase-shawl proof) were active in other
worktrees — consistent with the known never-run-concurrent-jest
contention, not with a failure in this run's work. It was killed
(SIGTERM) rather than left blocking the landing. This run changed
zero code (evidence .md/.txt only); the applicable verification is
the analyzer rerun above (completed, PRIMARY NO-GO verdict as
designed) plus node-readable evidence files. The quick check is
therefore deferred, not waived for code — there is no code to gate.
