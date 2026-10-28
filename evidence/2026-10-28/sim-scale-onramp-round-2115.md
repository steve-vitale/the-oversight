# sim-scale-onramp-round-2115 — coordinator evidence

Run: fleshout-20261028T2115Z (loop A). Axis: scale-onramp (blocking axis,
converging, NOT converged). Sibling loop B live throughout on food-economy
(2126Z run: prestage3tap GO + morningpersist GO landed, nighttravel KILLED
at pilot and HELD unmerged by B; new B tree sim-dawnhall-b active at
closeout) — NOT touched, no B file committed, no B branch merged here.
Master moved under this run from sibling lanes (B 2126Z evidence 118d865eb,
journey r62/r64) — zero file overlap with either arm, both arms rebased
clean onto current master before merging, proofs re-run green after rebase.

## Plain words first

Two questions, both answered with measurements, neither with a game change.
First: can the village's wandering pairs hit hard enough to kill a wave-4
beast? No — not with anything a villager can actually earn and carry. The
best honest pair the game allows deals about 48 damage a round, and a fresh
beast needs 57–80 to die inside the 15-round fight. Tricks don't fix it:
the ones that work end the fight by driving the beast off, not by killing
it, and one of them actually halves the pair's damage. Second: when a beast
is wounded by one pair and met again later, does it ever get finished?
No — across 21 chained beasts and 52 chain meetings, not one was killed.
The wounded beasts just stay wounded, and nobody in the story ever remarks
that they met the same beast twice. So the wall has two measured halves now:
pairs can't hit hard enough, and wounds don't accumulate into kills, because
every meeting is a fresh accident rather than a return.

## Arms

### Arm 1 — sim-fieldability-a: DIAG-GO (damage ceiling; build killed by measurement, not opinion)

Audit first, per its prereg (commit a2af44926, before any judged sweep):
no single narrow wiring of an existing system plausibly moves a wild field
party to 57–80 sustained DPR. Fixture DPR over 3-round fights flatters
one-shot sources; kill math must use sustained DPR (strike mean x fed
power 1.25 + ally 4.5/round), formula verified against fixtures (godslayer
61.7 measured vs 61.25 predicted; worldbreaker 82.7 vs 82.5).

Ceiling (fed, 2 fighters; kill rounds for 850 / 1100 HP):

| config | sustained DPR | kill 850 | kill 1100 |
|---|---|---|---|
| fire spear | 22.0 | 38.6 | 50.0 |
| hunting spear | 30.75 | 27.6 | 35.8 |
| machete | 34.5 | 24.6 | 31.9 |
| machete + bow + arrows (plausible wild best) | 48.25 (+32 volley once) | 17.6 | 22.8 |
| hardlight knife | 40.75 | 20.9 | 27.0 |
| hunting + all damage abilities | ~39.5 | 21.5 | 27.8 |
| machete+bow + all damage abilities (godhood-tier holder) | ~62.7 | 13.6 | 17.5 |
| godslayer spear (tier-4 apex loot) | 65.75 | 12.9 | 16.7 |
| worldbreaker maul (tier-4 apex loot) | 87.0 | 9.8 | 12.6 |

Findings: tricks are not damage (eater poison = mFlee at 0 DPR, a
drive-off win that fails the kill frame, needs trick known + spoiled food
carried; influencer focus_followers halves party DPR 15.2 vs 28.1 baseline
while shrinking the monster's buff — a survival lever; audit inefficient
DPR 18.9, fights extend to 6 rounds, still flee; reunion novelty DPR
21.2). Spear occupies the ranged slot (new): autoEquip keys on wkind
spear, so hunting-spear+bow is not a real dual config — the bow is
dropped, volley null, DPR byte-identical to spear alone. Fed power
(feastburn parity) is already spent: the 1.25x topped-up mult is inside
every number. A second ally doesn't exist in code (one join per fight)
and would add only ~4.5/round anyway. Volley is a one-shot (+32 total =
+2.1/round over 15 rounds).

Control gate reproduced the 1528Z/1942Z shape exactly (meetings 1272,
judgedA 24, judgedB 18, formed 0, field kills 0; per-seed judgedA 75106: 15,
75108: 9, rest 0). Corpus: evidence/2026-10-28/perseed-fieldability-a/.
Wall (control band, reported not claimed as movement): national ever 7/8,
final 6/8; table invited 4/8, entered 3/8; wins 3/8, all lesser, full seat
0/8; wave-4 reach 6/8, wave-5 0/8; median survival 146d; deaths 286;
starvation 1.

Sense COHERENT, one narration blank: machete+bow vs fresh audit — volley
(2/3 hit, 32), three strikes for 41/45/41, ally's single 5-damage blow,
a 65 hit on the ally, then "sees how this ends — and runs while running
still works" with the beast at 936/1100; the arithmetic is visible in the
fiction. Blank: the influencer party's exit has no retreat line — the
HP-floor flee branch logs nothing, unlike the hopeless branch — and its
ally joined on the final round and never struck (zero-strike form of the
one-strike cap).

Proof (re-run green post-rebase): scripts/test-fieldability-a-audit.js
AUDIT-COMPLETE (12 configs x 2 beasts x 5 rng seeds + 5 trick cells x 5
seeds); scripts/test-fieldability-a-sense.js SENSE-SHAPE PASS; node --check
clean on all three scripts. No jest in this arm. Zero src/js diff.
Commits (rebased): a2af44926 prereg, 11fed85fd evidence.

### Arm 2 — sim-chainkill-a: DIAG-GO (wounded-beast chaining census)

Diagnosis only — zero src/js, zero policy changes, zero default flips.
Prereg 8133b755e before any judged census. Primary question: does any
chained wounded beast ever get finished with a kill? No — proven absence
in every corpus checked. Pooled: 21 chains, 52 chain meetings, 842
villager-observed damage, 0 kills, 1 drive-off, 20 still-alive, OTHER=0.

Primary band (16 seeds 75101–75116, same substrate as the 8-seed band,
fieldparty-form-diag recorder only): 42 judged meetings = 9 unchained
singletons + 33 chain meetings in 13 chains: KILL 0, DRIVE-OFF 0,
STILL-ALIVE 13, BEAST-GONE 0, OTHER 0. Lengths: 2-meeting x8, 3-meeting x3,
4-meeting x2. Chain damage total 386, max 78, median chain DPR 6.0/round
(range 0–26). Terminal HPs 501–1177 (median 900). Links 20, flagged links 6
(all AMBIGUOUS — multiple meetings sharing one HP value; zero FORK, zero
IMPOSSIBLE-LINK), flagged chains 4, ordering anomalies 0. All chains solo
(formed 0 on this band). At 80/round all 13 primary terminal beasts fit
the 15-round cap; at 57/round only 3/13 fit (501, 555, 839) — the 57 end
does not finish chained beasts. Cap-fit is not a kill: the herald-294
fixture needed only 10.4 rounds at fixture DPR yet fled at round 3
(hopeless trajectory fires first).

Secondary (never pooled): fieldfeed-armed — 4 chains, all STILL-ALIVE, no
flags; the known chain 850→817→790 ends at 790, never continues.
Shoutgate-armed — 4 chains (3 STILL-ALIVE, 1 DRIVE-OFF), no flags;
deepest wound anywhere: herald 350→294→241→204 (146 damage, 3 formed
parties, 11 days, still alive); the only drive-off: a herald at 29 HP
stood down twice with 0 damage struck, never converted to a kill.

Control-shape gate PASS: 16/16 rows, recorder errs 0, overflow 0;
judgedA 42 formed 0 kills 0, judgedB 31 formed 0 kills 0. First-8 subset
reproduces retreatdiag fresh exactly (75106: 15, 75108: 9, others 0).
Analyzer also reproduces the published shoutgate herald chain and the
fieldfeed 850→817→790 exactly.

Wall (16-seed band; reported, NOT claimed as movement): wins 4/16, all
lesser, full seat 0/16; national ever 13/16, final 9/16; table invited
10/16, entered 4/16; wave-4 reach 11/16, wave-5 0/16; median days 180
(horizon-capped: 8 runs reached 180d); deaths 600, starvation deaths 4.
Top death causes: villager combat 235, villager-vs-villager combat 160,
player the wild 87, villager expedition 35, villager monster 32.

Sense MIXED: each fight reads as coherent people judging a fight (shout
when losing, one ally strike, "sees how this ends" retreat), but the chain
thread is unnarrated — no log marks a re-met beast as the same wounded
one, and no chain shows a deliberate return despite return-to-fight memory
existing in code. Chains are accidental re-meetings. Sense fixture carry
verified exactly (850→770→700, 150 total damage, beast left at 82% HP).

Proof (re-run green post-rebase): scripts/test-chainkill-a.js MACHINE
LEGS PASS (census, control-shape, classification); scripts/test-chainkill-a-sense.js
CHAIN-SENSE PASS; node --check clean on all three scripts. No 10.8-min
sweep re-run at landing (corpus committed; analyzer re-run validates the
legs on the rebased tree). Zero src/js diff. Commits (rebased): 8133b755e
prereg, e215066af instruments, 1517fc396 corpus + evidence.

## Wall (this run's judged corpora)

Fieldability control: wins 3/8 lesser, full 0/8, wave-5 0/8, median 146d.
Chainkill band: wins 4/16 lesser, full 0/16, wave-5 0/16, median 180d
(horizon-capped). No wave-4 field kill anywhere. No wall movement is
claimed from measurement alone.

## Telemetry deviation check (loop body step 10)

Fieldability corpus: LOUD national 12→0, table −75% (16→4), wins 16→0.
Chainkill corpus: LOUD national 12→0, wins 16→0. All the known artifact
class (checker reads bare top-level fields; per-seed rows carry
nationalEver/entered/won; WINSEAT baseline vs pre-seat substrate). True
numbers are the wall numbers above. Baseline NOT rolled.

## Metric review (for the NEXT run — never a mid-run re-score)

- DRIVE-OFF vs KILL: fieldability's kill+DPR frame excludes the eater
  poison drive-off (mFlee at 0 DPR), while retreatdiag defined success as
  kill OR drive-off. The next damage/party prereg must state explicitly
  whether drive-off counts as success — it is a win state in code, and
  the frame choice changes the verdict class.
- CHAIN IDENTITY is HP-arithmetic only: at 0 damage the arithmetic is
  trivial (same HP = same beast is an assumption, not a proof), and the
  recorder carries no beast id (world monsters have no _spawnSeq). A
  future chain arm that needs identity certainty must add a spawn id or
  restrict to damage>0 links; this census flags the ambiguous links
  rather than hiding them.
- PANEL NOTE (standing): scripts/balance-panel.js has no census-ingest
  mode. Paired before/after tables on identical seeds/substrate are the
  §15 substitute, as in prior rounds. No panel artifact claimed.
- check.js --quick NOT re-run by the coordinator: zero src/js in either
  merged branch, zero green-list files touched; B's 1730Z full check
  profile (275/15, all adjudicated pre-existing) and the journey lanes'
  recent check-quick runs stand as the recent profile.

## Blanks filled or documented

- FILLED (diagnosis): the damage ceiling (nothing earnable reaches
  57–80 sustained; wild best 48.25) and the chaining blank (21 chains,
  0 kills, 1 drive-off, terminal HPs 501–1177).
- DOCUMENTED (findings backlog, not chased here): spear occupies the
  ranged slot (bow dropped, volley null); silent HP-floor flee (no
  retreat line); chain-thread narration blank (re-met beast never
  marked as the same wounded one); chain identity needs damage>0 or a
  spawn id.
- NOT re-judged: perceptform-a NO-GO, retreatdiag-a DIAG-GO, shoutgate-a
  NO-GO, fieldfeed-a pilot-GO-only all stand as published.

## Coordinator decision (documented for Steve to overrule)

TILE-PRESENT JOINING NEEDS NO STAMP: the next party arm should
preregister "every ally actually standing on the tile joins from the
start," judged on kills, never staying. Reason: under the perception law
(villagers know who's around only through their senses), an ally standing
on the same tile is seen — sight is the perception, and no co-departure
stamp is needed to justify joining. The stamp question (whether
tile-mate-outing-status counts as "same outing") is moot for this rule:
co-presence, not shared departure, is what the fighter perceives at fight
time. Yardstick from this run: at the projected 57.25 sustained DPR
(machete+bow leader 48.25 + 2 allies at 9.0), only 3/13 chain-terminal
beasts fit the cap — so the arm must report party size achieved and
survival rounds alongside kills, or it will over-claim.

## Infrastructure

- Safe-commit index clobber hit both workers' commits; repaired via
  HEAD-blob cacheinfo each time with hash verification, never git reset.
  No clobber on the coordinator merges or evidence commit (verified:
  status shows only the ONTOLOGY transient after each step).
- docs/ONTOLOGY.md at 0 bytes in the main tree for the whole run
  (touched 18:55Z, same transient as 2026-10-24 and the 1730Z/1736Z/1942Z
  rounds) — left alone throughout, never reset, never committed; NOT
  this run's dirt. A sibling doc-sync writer owns it.
- No .git EPERM flap this run. No ref surgery. No push, no bump, no live
  verification (ship-loop line). Trees released done-merged, branches
  deleted, main tree clean except the ONTOLOGY transient at closeout.

## Convergence

scale-onramp stays converging (NOT converged): the damage lever is now
closed as a narrow build and chaining is measured end to end with a
ranked next step — but no wave-4 field kill has happened, the full seat
is still 0, and wave 5 is still 0. The directive stands until the tracker
records this axis converged on measured evidence.

Next blanks, in order: (1) TILE-PRESENT PARTY (every ally on the tile
joins from the start; coordinator decision above; judge kills, report
party size + survival rounds); (2) SORTIE-DPR measurement (mustered
parties may already be the killers — measure before building);
(3) DELIBERATE RETURNS via travel-to-known-monsters (chainkill rank 3);
(4) narration blanks (silent HP-floor flee; unnarrated chain thread);
(5) THRESHOLD loosening LAST, harmful alone. food-economy stays
converging (untouched; sibling loop B lane). Rotation left at 3
(convergence work does not cycle it).
