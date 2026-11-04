# Journey endgame r128 — PRE-REGISTRATION (lane B, 2026-11-04 10:00 CST run, written before any play)

Leg 4 (endgame). Rotation-b read 4 at run start (this run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing —
a failed run does not advance the leg, per r103/r104/r105/r109/r110/
r118/r121/r124 precedent). Run number basis: the Lane B counter is
shared across legs — latest completed is r127 (succession, landed
2026-11-04). This run is r128. Slug: journey2-endgame-r128 (NOT
journey2-endgame: that slug is held by an older dead-but-dirty tree
and must not be clobbered; see r121/r124 prereg).

Run-start incidents (infrastructure, not measurement):
- NO LOCK at run start (playtest-loop-2.lock absent); main tree clean
  (0 files), disk 29%. Lock created 2026-11-04T15:55:47Z by this run.
- REGISTRY CONTENTION / SLOW CHECKOUT: worktree-register ran its own
  reap (~80s) then git worktree add's reset --hard checked out a
  multi-GB evidence tree under heavy sibling I/O (sim-bankfood-a
  safe-commit hammering update-index at the same time). The first
  register invocation was killed by its own `timeout 600` wrapper
  mid-checkout (16:08Z); git's worktree-add process survived the
  wrapper kill and kept checking out, but the register script was
  dead so no registry entry was written (heartbeat correctly failed
  "not registered"). Outcome: attempt 1's orphaned worktree-add kept checking out after
  the wrapper kill (it wrote ~6.7GB before the wrapper died) but was
  then killed by a full service/VM restart at ~16:17Z (uptime reset),
  which also wiped this run's background sessions. Attempt 2 (16:14,
  no wrapper) died in the same restart. Attempt 3 failed fast: the
  leftover dir (36,661 files) made git worktree add refuse, so the
  leftover dir was removed with rm -rf (own failed path, unregistered,
  branch untouched) and attempt 4 (16:23Z, no wrapper) succeeded:
  fallback branch attach (branch already existed), checkout ~11 min
  (multi-GB evidence tree), registry entry active 16:23:57Z, heartbeat
  verified landed 16:36:12Z after registry-lock contention with Lane
  A's heartbeat loop (both lanes' heartbeats queued on the flock for
  minutes, then cleared unaided — contention, not a dead lock).
  Heartbeat loop running with a readable log file, never /dev/null.
  Never hand-edit REGISTRY.json.
- R120 HELD WORK — DO NOT TOUCH: unchanged from r121/r124. The
  journey2-endgame tree is dirty in the registry's older record;
  read-only status counts only, never copied, never merged. Needs
  main-session inspection (standing item, not this run's).

SUBSTRATE: r118 EXACTLY — capable + deedhunt + vetcommit + greedy
deferral (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive
+ fullseat-diag + vetguard on waves seeds; forcedrift control clean.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1, TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware
(+10d tail max on a dead village, never ticked to fill the leg).
Probe: scripts/probe-endgame-r128-20261104.js (r124 probe verbatim
EXCEPT renames r124->r128, evidence dir 2026-11-04/
perseed-endgame-r128, header, and the TWO read-only instruments
below). Analyzer: scripts/analyze-endgame-r128-20261104.js (r124
analyzer verbatim EXCEPT input dir, r124->r128, and the
HURTRETURN/FALLEN sections below). Instrument + evidence only for
the pilot; any blank fix decided AFTER the pilot, on its own proof
test — if it touches seat logic or any gate, do NOT land it (gating
freeze, Steve 2026-10-27 16:53, stands).

HEAD DELTA SINCE r124 (base 33900dfaa -> 71041af7d, src only):
- betrayal.js +12 (journey-social r125): ambush-murder victims now
  enter village.fallen (they previously vanished from the village's
  own death record while registerDeath made corpse+grief+case).
  Death-record only; no gate, price, or deed change.
- game.js +28/-1 (sim-hurthome-fix-a, [needs-eyes] in its own
  commit): hurt travelers (hp 1..7, alive, trip with an end date,
  walk-outs excluded) return at the next travel tick instead of
  when the trip clock runs out, with a SAY line ("returns from
  the wilds hurt (health N/100) — the trip cut short") when the
  bearer is at Haven to see it. Gameplay-affecting but narrow:
  away-villager fates can move, so a headline flip on a seed is
  attributable here first, not to the road.
- game.js holdbeatfix-b (order-only): the waveKillLog entry block
  moved BEFORE checkWaveUnlockBeat inside the kill beat, so the
  unlock beat a kill triggers now counts that kill (before: the
  beat read the pre-kill veteran count, e.g. "0 of 2 veterans"
  inside the kill that made veteran #1). Block unchanged —
  dedupe, 1000-entry cap, channel counters identical. Expected
  effect: unlock-beat wording only; if a beat also gates an
  unlock, that is a same-run investigation item (read the beat
  function before claiming either way).
- build.js version bump only. Everything else in the range is
  evidence/tooling (tendseason, tendfloor, approach arms, landing
  r97, succession r127, scale r96, crisis r126, social r125,
  deepening r94, establishment r85/r86) — no other src change.
The pilot comparison to r124 is therefore a matched
reproduction check under three small landings, not a new road
claim: any road flip (full seat, uw5, face) CONTRADICTS the
small-delta reading and becomes a same-run investigation item.
Any headline flip must first be tested against hurt-return
fate movement on that seed.

PILOT SEEDS (deliberate reuse, matched to r124/r121): 89701
(waves), 89702 (waves), 89704 (forcedrift control), 89705
(wavesnw). Pilot first per staged methodology: if the leg's
question shows nothing interesting in the pilot, document and
move on — no full 7-seed sweep burned.

R124 BASELINE (per-seed, for the matched pilot table):
- 89701 waves: announced d140, sat d141, WON LESSER (feared/light,
  final:mercy), 16 fights (2 vKill, 10 talkDown, 1 vFlee, 1 mFlee,
  2 otherEnd), uw4, standing 199, peakVet 1@d51, kills algorithm
  d50 + strike d113.
- 89702 waves: announced d107, sat d107, WON LESSER (beloved/light,
  final:audience), 11 fights (2 vKill, 3 mFlee, 4 vFlee, 2 otherEnd),
  uw4, standing 199, peakVet 1@d78, kills eater d78 + eater d101.
- 89704 forcedrift: village-lost/scattered d61, 0 fights, uw3,
  standing 25, 18 death channels (16 unique vid+day).
- 89705 wavesnw: announced d90, sat d104, WON LESSER (beloved/light,
  final:quiet), 16 fights (1 vKill, 12 mFlee, 2 vDie, 1 vFlee), uw4,
  standing 199, peakVet 1@d104, sit-day deaths Diana d104 (wild) +
  Scarlett d104 (combat).

R128 QUESTION: on current HEAD, does the endgame pilot reproduce
r124's road exactly (lesser only, uw5 0, standing 199-capped by
the defer5 mechanism, veterans 1/2) — with differences confined
to (a) hurt-return SAY lines and any fate movement they cause,
(b) unlock-beat veteran counts that now include the triggering
kill, (c) fallen-census ambush entries — and do the sit-day-death
pattern and 89705's dissolve-heavy fight shape persist a further
run?

R128 NEW INSTRUMENTS (read-only, no policy change):
1. HURTRETURN scan (probe-side, FIRENARR pattern): scan the FULL
   SAY capture for "returns from the wilds hurt" lines, logged
   with day (via dayBounds) + line. The announce-sliced transcript
   cannot show these (they fire mid-run, pre-announce), so the
   scan must be probe-side, never transcript-grep. Sense bar:
   each firing must sit beside a trip return for a hurt villager
   (hp shown 1..7); a firing on a walk-out return or with hp >7
   is a same-run investigation item.
2. FALLEN-villagerId (probe-side mapping fix, read-only): the
   probe's censusOf fallen mapping reads e.vid || e.id; the new
   r125 ambush entries carry villagerId (not vid/id), so they
   read as id=null. Change to e.vid || e.villagerId || e.id so
   the analyzer can count ambush-fallen entries and dedupe by
   vid+day. No game state is read or written beyond the existing
   census read.
Analyzer adds: HURTRETURN-captured (every JSON carries a
hurtreturn array; counts descriptive) and FALLEN-ambush (fallen
entries with cause 'ambush' counted per seed; the r125 fix is
CONFIRMED only if an ambush death in the run appears in fallen
with its villagerId — a run with no ambush death leaves this
unmeasured, not failed).

INTERESTING FINDING (what would count): any full-seat win; any
wave-5 unlock or face; any mFlee carrying monFled=true on a
non-flee kind; any sit-day death (sixth instance of the class);
a 89705 fight-shape flip away from dissolve-heavy (or toward it
further); any hurt-return misfire (walk-out pulled home, hp>7
firing, or a hurt villager left away past the trip clock);
any ambush death missing from fallen; any unlock beat that
still reads the pre-kill veteran count (holdbeatfix-b miss);
any transcript passage that is senseless, robotic, or
self-contradictory (a blank to fix or document).

BINDINGS (pilot-scaled from r124; metric binding §14 — a miss is
NO-GO, never re-scored mid-run):
- M1-guard: >=3/4 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal).
- M2-census: every census fight carries a named outcome; engine
  opens == census fights (no policy-only opens unexplained).
- MFLEE-routed-coverage: 100% of mFlee fights carry gotAwayLines
  array + closeSnapResult field.
- KILL-ANATOMY-coverage: >=90% of multi-turn census fights carry
  anatomy.
- M5-voicing-canonical: sitting seeds carry canonical voicing
  (table/announce/sit lines present) or a named fallback. A control
  dead before the window with NO relay final in the block is
  INFO/vacuous, not NO-GO (per r121 metric review).
- M10-fullseat-gap: every sitting seed's full-seat gap is named
  (which bars short, with numbers).
- M11-standing-peak: standing peak reported for 4/4 seeds.
- FIRENARR-captured: every pilot JSON carries a firenarr array
  (instrument health; counts are descriptive, not a bar).
- HURTRETURN-captured: every pilot JSON carries a hurtreturn
  array (instrument health; counts are descriptive, not a bar).
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  full-seat count across the 4 pilot seeds. M3b-peak and
  M4-wave5-or-full / W5-question are likewise tallies this run:
  their analyzer NO-GO on a closed road is the expected road
  reading, not a pilot failure (same reading as r121/r124).
- HEADLINE-REPRODUCTION (descriptive, not a gate — the delta is
  gameplay-affecting via hurt-return): per-seed announce/sat/
  seat/final/fight-outcome/standing/peakVet vs r124, with every
  difference attributed to (a)/(b)/(c) above or flagged
  UNATTRIBUTED for same-run investigation. An unattributed road
  flip blocks any "reproduces" claim.

METRIC REVIEW: (filled after the pilot — if a metric proves wrong,
the revision is proposed here for the NEXT run, never applied
mid-run.)
