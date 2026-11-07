# sim-winnability-round-0930 — Loop B 0930Z coordinator evidence (axis scale-onramp / winnability chain — 1 arm ADOPTED + 1 arm LANDED, merged locally pending ship)

Run: fleshout-loop-b-20261107T0930Z · Axis: scale-onramp / winnability chain ·
Base at open: master 32d79b713 · Base at close: master 6a59ed7fe (+ coordinator
evidence commit, below) · Main tree clean at close.

## Stale-lock recovery at open

Deleted the 0530Z B lock (4h01m old; its only registered tree
sim-stageally-stab-b heartbeat 07:26:02Z, 2h05m stale; no file writes
<15min in its worktree; no live coordinator) — dead per guard. Claim
retired to .DEAD with disposition note. Its arms resolved: sitstep-b
LANDED (7d261d1b7 + 1dafd5a49), firstkiller-b LANDED (e9ada3770 +
59238bcca), stageally-stab-b STRANDED — adopted by this run (arm 1
below). Loop A 0715Z claim live at open (lingergorge / mootsummon /
capabledeed + finishersize repair), NOT touched; a new Loop A run
(fleshout-2026-11-07T1021Z) started mid-run and holds the A lock now —
NOT touched either.

## Re-point queue disposition (recorded in the claim at plan time)

- (1) arm-2 toggle — CLOSED (toggle-confirm family closed 0630Z; see
  sim-winnability-round-0230.md / -0420.md). Not re-run.
- (2) flee-repair build — NOT built here. The tracker (0420Z blanks
  #11) lists the flee-repair port as a Steve call, and branch
  sim-fleerepair-a is held work from an earlier run. No build without
  Steve's ruling.
- (3) standing accumulation on gear-ready seeds — this run's arm 2
  answers its scale half: standing 440 did not open regional, because
  the door was never knocked on.

## Arm 1 — sim-stageally-stab-b ADOPTION (stranded 0530Z arm)

Rebased the stranded branch (b0b813019, base f043aa772) onto master
32d79b713 clean, 6 commits replayed, new tip ed070c955. Proof re-run
green on the rebased tip: scripts/test-stageally-stab-20261107.js
43/43. Merged --ff-only; tree released done-merged; branch deleted.
Verdict stands as the worker left it: DIAG-NO-GO — staged flips 5/8,
baseline 5/8, gap 0; no staged-specific amplifier, fragility is
policy-general; bisection not run (bar failed at part 1). Corpus
32/32 pilot legs + analyzer output on master;
evidence/2026-11-07/sim-stageally-stab-b.md. Tracker 0420Z blank (2),
stageally stability, is answered by this landing: the mechanism half
finds no staged-specific amplifier — the confirm/confirm2 flip is
policy-general fragility, not a staged subsystem. No src/js in the
landing (DIAG instrument + corpus + evidence only).

## Arm 2 — sim-regionalstep-b (DIAG, zero src/js)

Worker branch sim-sitstep-53006-b, 3 commits (prereg 98605d40d,
tooling 09c3e3cf8, evidence+corpus 597907155). Rebased onto
ed070c955 clean, new tip 6a59ed7fe; proof re-run green 29/29 on the
rebased tip (incl. the live 53006 determinism leg — the replay
reproduces the sitstep-r2 staged headlines on the new base, so the
stab-b merge did not shift the instrument). Merged --ff-only; tree
released done-merged; branch deleted.

**Verdict: DIAG-GO.** Scale never leaves `village` because nobody
ever asks. On band 53001–53008 (deliberately reused, 150d, frozen
staged policy), the single named gate `courtship-no-attempt`
explains 148/149 (99.3%) of 53006's no-regional days (bar ≥80%)
and 931/940 (99.0%) band-wide, with per-day gate state in the
corpus. Villages are known by day 3–5, courtship-ready the same
day, and would accept a link outright from about day 9 (best
deterministic judge 80–96, worst-case RNG still ≥55) — yet
`proposeLink` was called 0 times on all 8 seeds, 0 links ever
formed, so no accord staged, no bond seasoned, no Dawn. Standing
is irrelevant to the door (diplomacy 0 on every seed; 53006's 415
= war 375 + plenty 40).

The raise path is doubly closed: villagers bring the idea
themselves — 82 link raises staged, 80 expired, 0 accepted, 0
refused. (1) The scholar reaches the raiser inside the 2-day
window only ~37% of the time; (2) even when they do talk, the
policy can never answer — `talkRound` walks out with zero
exchanges and the invite-ask picker has no `link:accept` door.
Clean case: Rosa raises on day 5 (53006), the scholar talks to
her day 6, the raise expires day 9.

Evidence: evidence/2026-11-07/sim-regionalstep-b.md;
corpus evidence/2026-11-07/perseed-regionalstep-b/ (8 files);
prereg evidence/2026-11-07/sim-regionalstep-b-prereg.md;
proof scripts/test-regionalstep-20261107.js 29/29.

Caveats (from the worker, recorded in the arm evidence): the
first judged driver invocation's session was lost after 5 seeds;
53006–53008 were re-run cleanly with identical numbers (53006
matches the proof's live leg exactly). Safe-commit index clobber
hit on all three worker commits, repaired via HEAD-blob cacheinfo
each time, verified clean. The `diploLines` say-capture regex is
noisy ("according to" reads as "accord", the kitchen counter as
"counter") — the verdict rests on live state (wraps +
`hierarchyState()`), not say lines; recorded in the evidence's
metric review. No new sim-findings backlog items from this arm.

## Wall numbers (this run's judged corpus)

National / table / wins: **0 / 0 / 0** · Wave 4 unlocks 7/8 ·
Wave 5 unlocks 1/8 (53006), faced 1/8, kills on 1 seed (2 kills,
53006) · Median survival **114.5d** (survivals 88, 89, 92, 106,
123, 150, 150, 150) · Max survival 150d (3 seeds). The winnability
chain runs wild ally-join → wave-4 kills → veterans → readiness-5
release → wave-5 facing, and stops at the seat on scale + the
feast deed — and scale stops at the ask.

## Village assessment (plain words)

The village can now do the hard part and still go nowhere. On
53006 it banks a living pair of wave-4 killers for 51 days, kills
five wave-5 monsters, survives the full 150 days with standing
415 — and never once asks a neighboring village to join up, even
though every neighbor would have said yes from about day 9, and
even though the villagers themselves keep bringing the idea to
the scholar (82 times across the band) and getting silence back.
The seat fails on two deeds, and both are now decomposed: scale
fails because the ask never happens; the feast surge fails
because it is never spent in a real fight. Neither is a numbers
problem — no standing total and no kill count opens either door.
The next arm is the link-forming drive the evidence names.

## Telemetry deviation check

Not run — both arms are DIAG (frozen policy + pure-read
recorders, zero src/js, zero Game-root change). Per the sitstep-b
precedent, DIAG arms take no balanced panel and no telemetry
deviation check applies; no compare `.md` is fabricated. Wall
numbers are reported directly above.

## Infrastructure

Worktree registration slow under sibling load (~5.5 min).
Registration + proof runs backgrounded and delivered normally.
The stab-b adoption heartbeat hung once (registry flock
contention); the tree was released clean anyway. Safe-commit
index clobber hit the worker's three commits (repaired via
HEAD-blob cacheinfo, verified clean) and did NOT hit the
coordinator commit. No EPERM flap this run. Master did not move
under this run after the stab-b merge (ed070c955 → 6a59ed7fe are
this run's own merges). Main tree clean at closeout.

## Convergence state

- Axis scale-onramp / winnability chain: **converging (NOT
  converged)**. The seat's two blocking deeds are now both
  decomposed to named mechanisms (scale = the unasked question;
  feast surge = never spent in a real fight), and the pair +
  wave-5 facing half of the chain is proven reachable — but no
  village has reached regional, no seat has been earned, wins
  remain 0 everywhere. The directive stands until the tracker
  records this axis converged on measured evidence.
- food-economy: converging (NOT converged), untouched by this run
  (Loop A live).

Next blanks, in order: (1) the link-forming drive, as a lever —
propose on courtship-ready villages (as-subordinate scores higher
everywhere; joining is the easier door) and answer link raises
inside their 2-day window via a real conversation; policy-side
only, a measurement instrument — the propose verbs stay
player-only per Steve's 2026-10-26 ruling; the arm must then
watch the two untested gates, the 21-day seasoning and
`_checkRegional`; (2) the feast drive — hold a feast and spend
the surge in a real fight on a wave-4-reaching seed (leadfeast
family); (3) the sit action, once a seat exists — a takeseat arm
on a seed (or a lever) that actually earns a seat; (4) Reunion
draw/mirror as the arena lethality lever — Steve call; (5)
first-killer survival — pairs form through production speed, not
longevity; (6) veteran-kill hype line for non-wave-4 kills +
accept lines repeat verbatim (third sighting); (7) durable-pair
re-judge — Loop A 0221Z landed NO-GO, loop call; (8) FINISHER-SIZE
build — Loop A live, do not duplicate; (9) measurement neutrality
proof refresh #1353 (Oct 29 stale); (10) balance levers — Steve
call; flee-repair port — Steve call; pellet-bearer (#1819) —
Steve call.

Claim deleted; lock deleted.
