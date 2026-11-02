# Loop B 1030Z round — food-economy: homeward-step re-port PILOT GO + fed-at-home wild-death DIAG-GO

Run fleshout-loop-b-20261102T103020Z, axis food-economy (Loop B lane).
Claim written before any sims; deleted at closeout. Pre-flight: main
tree clean, disk 25%, reaper removed nothing sibling-owned (all active
trees sibling-owned or dirty, correctly refused). Loop A not live at
run start (no fleshout-loop.lock, no live claim); a sibling Loop A run
(fleshout-20261102T1030Z, scale-onramp, mustergap + creekdetour)
started the same minute — its lane NOT touched, its mustergap arm
landed on master mid-run (a0608ed09) and its creekdetour tree was
still live at this run's closeout, untouched throughout.

## Arm sim-homewardstep-rpt-b (0933Z blank 1)

Worker branch sim-homewardstep-rpt-b, rebased onto a0608ed09 clean
3/3, proof re-run 48/48 on the rebased tip, merged --ff-only
(commits prereg a778f93ed, port 300ab0b44, evidence caabea434).
Worktree released done-merged, branch deleted. Predecessor held
branch sim-homewardstep-b read via `git show` only, never touched.

PILOT GO for the FULL GUARD on a qualifying band — with a stated
caveat, not a buried one. Screening (fresh bands only, 8-seed
bands, budget 8, every band disclosed): 62301: 0, 62401: 1,
62501: 0, 62601: 0, 62701: 0, 62801-62808: 3 — QUALIFIES (first
qualifier; 62901/63001 never screened). Episodes: 62804 days 8-13
at (7,1), 62807 days 10-12 at (8,3), 62808 days 22-29 at (4,0).

Pilot (judged band 62801-62808, 30d, competent vs
competent-homewardstep-b, identical seeds): PRIMARY prevented 3/3
(armed episodes 0); B1 away day-ends 26 -> 3; B2 new-or-worsened
none; B4 failed-trip share 0.525 -> 0.508; B5 haul 201.8 -> 258.9
(1.28x) with per-seed floor worst 1.00x (the per-seed haul guard
decided up front in prereg, after the 62003 B5 failure); B6 median
survival 30d both; veto-created pockets 0. No confirm spend made
(prereg: pilot GO goes to the coordinator for a 12-16 seed
confirm decision) — this round records the pilot and does NOT
spend a confirm on it.

CAVEAT (in the worker evidence, preserved here): homeward vetoes
= 0 on the judged band. All 96 armed vetoes were inherited
outward vetoes, and trace review proves all three preventions
came from outward diversion before the homeward entry step. This
pilot proves the FULL GUARD prevents pockets on a qualifying
band; it does NOT prove the homeward extension adds anything over
the outward guard. The extension's only firing evidence remains
the unjudged 61807 diagnostic. Next prereg (appended to the
findings backlog): an outward-only ablation vs the full guard on
band 62801-62808, so the extension's own vetoes are the measured
thing. Other flags: arrival-conditioned false-close proxy v2
vindicated (v1 fires 4, v2 fires 0, all 4 v1 fires non-arrivals —
second independent confirmation of the 62001 artifact class); one
sense flag, not a bar failure — on 62808 the same step is
silently refused 3x/day for 20+ days (68 vetoes, 66 silent) while
the scholar ends every day home and fed (veto-budget blank).

Panel (§15, context only): combined campaign 16 cases,
sourcesStable, neutrality matched, survived 8/8 both, won/
national/table 0 both (expected 30d pre-seat profile, not a
regression), wave 2 on 7/8 both; policy-split compare INVALID
("Unmatched policies/cases") by structural design, attached
as-is, not overridden.

## Arm sim-wilddeath-cause-b (0933Z blank 3)

Worker branch sim-wilddeath-b, rebased onto caabea434 (after the
first merge, per the 0605Z lesson) clean 3/3, proof re-run 11/11
on the rebased tip, merged --ff-only (commits prereg 16c7b4373,
instrument 4585c1995, results a06d1b5b3). Worktree released
done-merged, branch deleted. Held sim-stepwalk-b tree never
entered (read via `git show` only); the stepwalk policy was
loaded for diagnostics only from a /tmp extract and is NOT
committed in this branch. No stepwalk re-confirm was run or
claimed, per the brief.

DIAG-GO. Plain words: the scholar is not starving in the wild.
She is home, fed, by the fire — and a Highbeam Deer comes
through the door with a raid, and she has to fight it in her own
house with a kitchen knife. She loses, and the village writes
"the wild" in its book of the dead. The label is true about WHAT
killed her (a wild thing) but silent about WHERE — she died
defending home, not wandering. The death line names no place; it
omits where, it does not lie about where. The transcript is
explicit: "CRISIS — THE BREACH. It got INSIDE."

Trace evidence, all 5 cases, same mechanism: recorded cause
(tele / fallen / corpse, all agreeing) = 'the wild'; proximate
cause = lost turn-based fight vs Highbeam Deer (gallowdeer) at
tile (4,4), Haven; raw `playerDeath` arg is 'the wild' (never
falsy), stack through `tbEnd`, live fight with a monster fighter
and no hostile fighter — the `tbFightDeathCause` proven-wild
branch, the only live producer of that exact string found in a
full call-site census. Cases: 61901 day 10 Aaliyah Levy (day 9:
(4,4), 1099 kcal, 100 HP; deer alive 129/160); 61407 day 26 Hilda
Banerjee (day 25: (4,4), 2050 kcal, 100 HP; deer alive 104/160);
judged band 62201-62208 (baseline competent only, 30d,
DEPOSITGATE=0): 62202 day 23 Gladys Ward, 62203 day 25 Ellis
Rossi, 62205 day 10 Declan Deng — all at (4,4), fed, deer alive.
Both named cases reproduce on current master (same scholar, day,
cause as the stepwalk corpora). Negative controls: 62208's two
player deaths trace to dehydration and 'the expedition' — the
instrument distinguishes, not just labels. Ruled out with
evidence: fallback label (raw arg never falsy, no live falsy
call site); disease/wound lag (sick record null, health
100-110 at last day-end -> 0 in one fight); starvation lag
(death-moment kcal 1000-2351; overnight honestCause would read
'starvation', never 'the wild'); stale/succession artifact
(every death joins to the dying scholarKey on day, fallen,
corpse, and place). Canon note: no canon doc covers death-cause
recording (manifest checked; DISEASES/MONSTER-WAVES/PARTY
consulted, none specifies cause strings) — stated in the
prereg, not invented around. Instrument limits (metric review):
the hurtVillager trail is blind to turn-based fight damage
(fighter HP bypasses it; hurtTail empty on all 5 wild deaths —
the fight snapshot compensates); row-level sayLines keep only
the last 200 lines, so the per-death 80-line pre-tail + 20-line
post-call tail are the reliable transcript sources.

Wall (judged band, 30d pre-seat window — expected 0s, not a
regression): national 0/8, table 0/8, wins 0/8, median survival
30d (all 8 survived to day 30 via succession), maxWave 2 on 7/8.
Player-death census: 'the wild' 3, 'dehydration' 1, 'the
expedition' 1. Panel (context only): single-policy competent
campaign, 8 cases, sourcesStable, neutrality matched on proof
seed 62201, won 0/8 — agrees with driver tables.

Findings appended (3): homeward-extension ablation next prereg;
silent-veto repetition (62808); fed-at-home wild death =
Haven-breach deer fight, with a steve-call candidate (whether a
raid monster fighting a solo scholar inside Haven is intended,
given havens are the ONLY unbreakable structures) and the
place-in-record design question.

## Telemetry deviation check

- Homeward pilot corpora: telemetry-check PARSE REFUSAL
("Unexpected non-whitespace character after JSON", whole-file
JSON parse vs one-object-per-line driver rows) — same refusal
class as prior runs, NOT a metric deviation.
- Wilddeath judged corpus: 3 LOUD lines (national 12 -> 0,
table 16 -> 0, wins 16 -> 0) are REGIME artifacts of a 30d
pre-seat window vs a WINSEAT baseline — same class as the
leg2drift 1630Z run. Baseline NOT rolled, no new investigation.

## Wall (this round, in-window only)

National / table / wins 0 both legs both arms (expected 30d
pre-seat profile, not a regression); median survival 30d both.
Full seat 0 / wave 5 fought 0 stand (Loop A lane), UNCHANGED in
substance.

## Infrastructure

No EPERM flap. Rebase 3/3 clean on both arms; ff-only merges
clean; merges verified alone before any chained release/remove
step. Index clobber hit both workers' commits and was repaired
by the workers (commits verified correct, trees clean); it did
NOT hit the coordinator commit this round (verified via
`git show --stat` after commit and clean `git status`).
Coordinator evidence committed from its own registered worktree
(sim-food-round-b), merged --ff-only, tree released, branch
deleted. Main tree clean at closeout. Sibling Loop A creekdetour
tree still live at closeout — NOT touched.

food-economy stays converging (NOT converged): the full guard is
now proven on a qualifying band, and the fed-at-home death
mystery is solved as a Haven-breach fight — but the homeward
extension itself is still unproven, no gate change landed, no
default flipped. scale-onramp untouched (sibling Loop A lane).
Next blanks, in order: (1) homeward-extension ablation
(outward-only vs full guard on band 62801-62808); (2) stepwalk
re-confirm under a NEXT prereg deciding pooled failed-trip
tolerance vs fresh band under the same hard bar; (3) Haven-breach
intent (steve-call candidate) + place-in-record design question;
(4) 60501-shape roadwork-credit band (still owed); (5) guard +
return-capability pairing OR veto-budget expedition abort,
decided up front; (6) sensor non-pantry collapse signal;
(7) gatediseng confirm band 76701-76712; (8)
pantry-cap-as-garden-bottleneck (74007); (9) standing-load
remainder; (10) pack-full refusal narration; (11) HUNGER WINTER
relief passivity (steve-call candidate); (12) shelling
default-flip call; (13) P3 reset follow-ups; (14)
patrol-departure narration; (15) garden/fish/traps early path;
(16) creek clearance wood-bound; (17) rubble daytime-clearing
habit; (18) washed_out scramble narration; (19) 96-tick bridge
edge; (20) 120d window only on a new horizon-cut episode.
0933Z blank 1 (homeward re-port) is now ANSWERED for the full
guard and REFRAMED for the extension (ablation owed); 0933Z
blank 3 (fed-at-home wild death cause) is FILLED.
Claim deleted; lock deleted.
Merged locally, pending ship (both arms: pilot GO + diagnosis).
