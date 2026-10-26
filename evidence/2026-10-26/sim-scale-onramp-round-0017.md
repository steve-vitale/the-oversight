# sim-scale-onramp-round-0017 — coordinator evidence (axis scale-onramp)

Run: fleshout-20261026T0017Z (loop A). No lock and no live claim at run
start — the sibling loop B had no live claim either (its 2330Z claim was
already retired to .DEAD), so this run worked scale-onramp (converging)
without touching any sibling work. Claim file
`lever-claims/fleshout-20261026T0017Z.json` written before any sims,
deleted at closeout; lock created at 00:17Z, deleted at closeout.

## What this run was for

The 2315Z run's next blanks, in order: (1) feast-draw yield measurement
(draw frequency / wave targeting vs lottery ticket); (2) wound-closure
pricing paper arm, then Steve ruling on met-below-line finishing
(defender-finish stays KILLED). This run took blank (1) as two DIAG arms
on the shared band, and left blank (2) carried (see Next blanks).

Both arms are MEASUREMENT ONLY — zero `src/js` diff, zero default flips.
Neither arm moves the wall itself; both settle mechanism questions the
wall depends on. The rotation file (`longsims-rotation.txt`, currently 3)
was NOT advanced: the convergence directive overrides the rotation, and
scale-onramp is still not converged.

## Shared band and the control-band finding (read first)

Seeds 73671–73678, tableseat-nowait policy (LEANLINKRESCUE=1,
TABLESEATNOWAIT=1), 180d death-aware horizon — the published control band
from w5chain-a / spawnsrc-a / poolpres-a / w4funnel-a / nonworldkill-a:
deaths 234, national-ever 7/8, wins 4/8, wave-4 6/8, wave-5 0/8, raids 85,
raiders 361, pool 1,494, median survival 135d.

THE PUBLISHED CONTROL BAND NO LONGER REPRODUCES ON CURRENT MASTER.
Both arms independently measured the same deviation on current master:
deaths 260 (not 234), national-ever 6/8 (not 7/8), median 143d (not 135d),
raiders 352 (not 361), pool 1,527 (not 1,494), pool wave-3+ 132 (not 107),
wave-4 5/8 (not 6/8); wins 4/8, table 4/8, entered 4/8, raids 85, wave-5 0/8
unchanged. The deviation concentrates in seeds 73674 and 73675; the other
six seeds reproduce seed-for-seed exactly. Both arms excluded their own
recorders with recorder-free baseline proofs on BOTH moved seeds
(73674: 163d won/30 deaths identical armed vs recorder-free; 73675:
180d survived/38 deaths identical). The cause is base drift between
nonworldkill-a's base (acbc0c933) and current master (4f5f3b614) —
UNBISECTED; no single commit is blamed here. Census legs below were
judged on the current-base corpus, never against the stale control, and
no metric was re-scored mid-run. THE NEXT ARM MUST RE-BASELINE THE
SHARED CONTROL ON CURRENT MASTER BEFORE JUDGING ANYTHING AGAINST IT.

## Arm 1 — sim-feastdraw-a (deb6b925a, proof 16/16 post-rebase + on merged master): DIAG-GO

Question: is the feast draw a real veteran funnel or a lottery ticket?

- Classification leg PASS: 12 grants, 5 spawned draws, 5 face rows,
  0 drive-offs, 5 nonworldkill feast-draw starts — unclassified 0,
  recorder errors 0.
- Yield rates computed: draws per fresh grant 1.0 (5/5), faced rate 1.0
  (5/5, all faced same day under this always-face policy), kill rate 0.8
  (4/5), veterans per draw 0.2 (1 wave-4 kill / 5 draws). Wave
  distribution: w1 1, w2 2, w3 1, w4 1.
- Strike join PASS, full chain: 73678 grant d115 → draw strike w4 →
  face d115 → fight fmgpspioy_8fe9s5 (scholar solo, 52/100 HP vs strike
  1178) → end won → newLog strike w4 by elif_demir via 'player'.
  Same fight id in every row.

Answer, in plain words: the village buys a ticket with a feast and the
smoke chooses the monster. One draw per fresh feast, always faced the
same day here, usually lethal (4 of 5 kills) — but only 1 draw in 5 was
the big wave-4 kind. At this band's rate (5 draws in 8 seeds), a second
wave-4 veteran through draws alone takes roughly another 8 seeds. The
draw is a real funnel with a lottery ticket's shape, not a reliable tap.

Side findings (all DIAG, none fixed here): all 7 refused feast grants
were refused by the fusion-reactor ceiling, never the devotion gate —
the ceiling gates the draw funnel before it starts. Cast-veteran is not
produced veteran: 3 draws carried castMonster's veteran flag (w2/w1/w2)
and produced 0 wave-4 kills; the strike (veteran flag false) produced the
only one. Drive-off, harness-fallback, and unmet-expired branches were
never exercised under the always-face policy — yield rates are
conditional on that policy. unlockedWave at draw time was not recorded,
so wave-appropriateness is proven by distribution only, not per draw.

Sense read: the strike thread reads as a real arrival (real feast, real
multiplier, same-day facing, blow-by-blow solo kill at half health) —
but villagers barely appear in draw fights (4 of 5 solo); the
watch-with-brands beat is never seen under this policy.

Evidence: evidence/2026-10-26/sim-feastdraw-a.md +
perseed-sim-feastdraw-a/ (deb6b925a). Recorder:
scripts/policies/feastdraw-diag.js. Proof: scripts/test-feastdraw-a.js.

## Arm 2 — sim-tbmelt-a (779781d32 + addendum a43bddbcf, proof 16/16 post-rebase + on merged master): census legs GO, control gate NO-GO

Question (backlog #1054): when a TB fight lifts an unrelated world
monster off the player tile and never restores it, how often does that
monster melt unfought — and does the melt ever eat a wave-4 monster?

- Control gate FAILED (the stale-band finding above, recorder excluded
  on both moved seeds). Judged on the current-base corpus instead.
- Leg (a) GO: all 8 tile-mismatch lifts classified by door,
  unclassified 0.
- Leg (b) GO: all 88 lifts accounted — restored 12, bystander-melted 7,
  killed 41, fought-melt 28 — unaccounted 0.
- Leg (c) GO: melt rate + wave breakdown computed; wave-4 melts: NONE.
- Leg (d) GO: all 5 known mismatch fights from nonworldkill-a
  reproduce; none moved.

The melt numbers (128 TB initiations, seeds 73671–73678): 7 bystander
melts = 5.5% of TB fights, 0.875 per seed. By door: wanderer-pending 4,
contest-arena 3, all other doors 0 (world-bump never melts a bystander
— the tile monster IS the fight). By wave: w1 4, w2 2, w3 1, w4 0, w5 0.
No melted monster carried a veteran flag; no titan melts. THE MELT IS
NOT A WAVE-4 VETERAN-FUNNEL LEAK ON THIS BAND. It did eat one wave-3
monster (73677 d63 spool, 170 HP, via a contest-arena bulldozer fight
it never got to have) — one standing point lost, silently: no tbEnd
line ever names a melting bystander. Two-sided case for Steve's ruling:
the spool loss vs a 1-HP lingering besieger (73671 d114 bright_idea)
whose melt arguably HELPED the village by clearing a siege. The rate is
too small to move the wall (0 wave-4 melts).

Context that is NOT a leak: 28 fought-melts (world-origin fighters
alive but not restored on fled/lost/routed — the documented "wild
monsters melt away" rule, working as written); 12 restores (all
lingering, all on 'lost'); 41 kills (all on 'won'); true direct-build
ends exactly 2. Method bonus: resolving adopted (same-call routed)
fights' mids via the engine rule (arg || pendingMonsterId) found 2
extra mismatches nonworldkill-a's world-origin-unresolved class hid —
future recorders should adopt the rule.

Sense read: the 73677 d63 spool thread in plain words — a wave-3
monster vanishes mid-arena-fight with no line spoken about it. Villager
spot check: 5 of 7 melt fights were solo scholar; nothing robotic; the
melt is a fight-start side effect villagers never see.

Evidence: evidence/2026-10-26/sim-tbmelt-a.md +
perseed-sim-tbmelt-a/ (779781d32 + a43bddbcf). Recorder:
scripts/policies/tbmelt-diag.js. Proof: scripts/test-tbmelt-a.js.
No melt fix was designed or landed — the spare-or-not question stays
Steve's ruling.

## The village, in plain words

Same village as the last several bands, seen through two new lenses:
feasts pull monsters to the haven's edge and the player usually kills
them, but the smoke rarely sends the big wave-4 kind — the band's only
wave-4 kill still comes through a feast draw, and the world funnel
produced no wave-4 kill on this base either. Monsters standing on the
player's tile almost never melt out from under a fight, and when they
do it is small fry, never a wave-4. Villagers act like people in the
margins (solo scholar fights, one villager beside her in a melt fight);
nothing in either corpus reads robotic. The wall itself did not move:
national still only through the policy instruments, wins still only
through the lesser seat, wave 5 still unborn (0/8), full seat 0/8.

## Wall numbers (judged corpora, current-base band — both arms identical)

national-ever 6/8, national-final 5/8, table 4/8, entered 4/8, wins 4/8
(lesser seat only), wave-4 5/8, wave-5 0/8, full seat 0/8, Arc IV 4/8,
median survival 143d, deaths 260 (villager combat 62.3%, player arena
12.3%, starvation 9, sickness 6.2%).

## Telemetry deviation check

Ran `node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-26/perseed-sim-feastdraw-a/*.json' --metrics
national,table,wins,exiled`: 3 LOUD lines (national 12 -> 0, table
16 -> 4, wins 16 -> 0), ALL the known recorder-row ingestion artifact
class (checker reads top-level panel paths the recorder rows do not
carry; per-seed rows carry nationalEver/entered/won; WINSEAT baseline vs
pre-seat substrate; n=10 files incl. summaries). Analyzer-proven counts
are national-ever 6/8, table 4/8, wins 4/8. Baseline NOT rolled, no new
investigation — the counting-mismatch item is already open in the
backlog (#1009).

## Metric review (docs/MEASUREMENT.md §14 — mandatory)

- Pre-registered headers bound both arms. The control-reproduction
  precondition FAILED on both arms for the same proven reason (base
  drift, recorder excluded). The arms judged their census legs on the
  current-base corpus and reported the control failure loudly instead of
  re-scoring against a friendlier metric or forcing a match. That is the
  correct handling, and it is recorded here rather than hidden.
- Proposed revision for the NEXT run (not applied to this one): every
  arm header must first publish a fresh control band on current master
  (a re-baseline step) before any control comparison is written. The
  shared-band numbers in older evidence files are stale until
  re-published.
- Balanced panel: no compare .md — scripts/balance-panel.js cannot
  ingest per-seed recorder corpora (known limitation, carried); the
  sweep-compare tables + analyzer outputs in the arm evidence files are
  the §15 fallback.

## Infrastructure

- Master moved 5 times under this run (journey-social r54, sim-saystub-b,
  sim-onzero9754-b, sibling B coordinator evidence e7c890c57,
  journey-establishment r40) — zero file overlap with either arm; both
  arms rebased clean (feastdraw twice, tbmelt once), proofs re-run green
  after every rebase and on merged master.
- Safe-commit index-clobber variant hit both worker commits and both
  tbmelt commits — repaired via HEAD-blob cacheinfo each time, commits
  verified correct (file counts + hashes) before merging.
- Worktree registration ran slow (~3.4 min for two trees, the known
  worktree-operation slowness class); heartbeats verified in the
  registry after landing, not trusted blindly.
- No container EPERM flap blocked this run's writes. A sibling B
  coordinator's untracked evidence file appeared in the main tree
  mid-run and was committed by its owner before closeout — left alone
  throughout, never staged or deleted; main tree clean at closeout.
- Final reap: 6/16 active trees, all other owners' (uncommitted changes
  reported, never touched). Both arm trees released done-merged,
  worktrees removed, branches deleted.
- check.js --quick NOT run: both landed commits are DIAG-only with zero
  src/js diff and their own proofs green on merged master (same standing
  as the 2330Z run).

## Convergence state

scale-onramp stays converging (NOT converged): two mechanism questions
settled (feast-draw yield, melt rate), no lever moved, no new content
reached, wave 5 still 0/8 — and the shared control band itself is now
proven stale, which blocks the next judgment until re-baselined.
food-economy stays converging (untouched; sibling loop B). The standing
directive stands until the tracker records scale-onramp converged on
measured evidence.

## Next blanks, in order

1. RE-BASELINE the shared control band on current master (both arms
   proved it stale; the next arm publishes a fresh control first and
   judges against that, not the 234-death band).
2. Drive-off-policy feast-draw arm: price the face/decline choice
   (drive-off / harness-fallback / unmet-expired branches unexercised).
3. Feast-draw unlockedWave-at-draw recording (per-draw
   wave-appropriateness, not just distribution).
4. Fusion-reactor ceiling on feast grants (7/7 refusals gate the draw
   funnel before it starts).
5. Melt ruling for Steve (spool loss vs bright_idea siege relief;
   spare-or-not; rate too small to move the wall).
6. Wound-closure pricing paper arm, then Steve ruling on met-below-line
   finishing (carried; defender-finish stays KILLED).
7. The still-gated old-core mechanism (Steve rulings) + defender-fight
   narration boilerplate (carried).

Merged locally, pending ship. No version bump, no push — the batch ship
job owns deploys. Claim deleted; lock deleted.
