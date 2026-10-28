# sim-scale-onramp round 0221 — lethality re-measured on the post-wound2 base: GO, parity exact

Run: flesh-out loop, run fleshout-20261028T0221Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4lethality-rebase.
Loop B live on food-economy the whole run (2352Z claim, arms
sim-raidcapture-b + sim-refusalprecheck-b, NOT touched); tackle-all /
journey / gap / panel trees NOT touched. This run took the 0144Z
round's next blank (1) in order: the lethality re-measurement on the
post-tackle-wound2 base. It did NOT take blank (2) (whether waiting
matters on bands where the seat stays unready longer) — that job is
now the next blank.

## Plain words first

On current code, wave-4 fights are still almost all hopeless in the
same specific way: the typical fight scratches the monster for about
2% of its health, and field fights never get past about 3.5% in one
fight. Two fights got past half the monster's health, and none killed
anything — 67 fights, 0 kills. The wound-carryover change did not
change this picture: the scholar now walks into turn-based fights
wounded, but the monster never does — its health is rebuilt fresh
every fight, so a near-kill still does not stick. A wounded monster
in the world still melts or walks away instead of being left there
to finish. The measurement itself is now solid: this band matches
the fresh channel baseline fight for fight, so future arms can trust
it as a comparison point.

## Arm sim-w4lethality-rebase (prereg 732c4ebe7, evidence + corpus c70ce1c80)

DIAG / MEASUREMENT ONLY — zero src/js, zero default flips, no
[needs-eyes]. Seeds 75101-75108, tableseat-nowait substrate VERBATIM
(LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware), instruments
copied from the w4lethality stack (originals untouched, differing
only in corpus dir, labels, and loadGame label). Base e7e7e3472,
POST-wound2: tackle-wound2 (ac9f1987b) verified as an ancestor of
the base. Master did not move under the run; no rebase needed.
Coordinator re-ran the proof on the worktree AND on merged master:
identical numbers both times (validator exit 0).

VERDICT GO on all six legs: (a) 8/8 valid, recorder errors 0;
(b) 67/67 fights complete (28/28 TB joined, 39/39 field, supplement
gaps 0); (c) parity vs perseed-w4channel-rebaseline/ PASS, EXACT —
per-seed days, gameDays, won, waveReach, nationalEver/Final, table,
entered, deathTotal, courtship combined (121, 8/8 active), and fight
counts by channel all match; the rebaseline headline 69 vs this
census's 67 is reconciled, not a divergence (the 69 counts 2
raftdraft fieldFight rows with no seq join, present in BOTH corpora
but not fights in the parity vocabulary); (d) distribution computed,
closest loss named (see below); (e) >50% answered: 2/67, kills 0 so
literal = substantive; (f) SENSE pass with the 0144Z fallback applied
and disclosed (75104 threadless, supplemented by 75103).

## Wall numbers (THIS band only, never pooled)

National ever/final 7/8 / 5/8; table invited/entered 6/8 / 3/8;
wins 3/8 (3 lesser / 0 full); wave-4 unlock 5/8; wave-5 0/8; median
survival 162d upper / 154d conventional (days 90, 114, 132, 146,
162, 177, 180, 180); starvation deaths 2 (both 75108); deaths 299
(villager combat 106, villager-vs-villager 80, player arena 53,
expedition 22, villager monster 19, ambush 4, villager sickness 3,
rest singles). Per-seed ends: 75101 won lesser d132 (w4, national);
75102 village-lost d177 (w4, global); 75103 survived d180 (w4,
regional, invited never entered); 75104 won lesser d90 (w3,
national); 75105 won lesser d162 (w3, global); 75106 village-lost
d146 (w4, regional); 75107 survived d180 (w3, global, never
tabled); 75108 village-lost d114 (w4, regional).

## The lethality table, re-measured

67 fights, all losses, 0 kills, 0 evades: 28 TB + 39 field
(35 villager-field, 4 raid-defender). Median losing fight 1.6% of
max HP (TB-only 4.4%, field-only 1.1%); 21 zero-damage fights; only
5/67 over 20%; field/raid never exceed 3.5% in one fight; other
channel max 12.1%. Closest loss (by HP left AND by % left, no
second candidate): 75101 d131 Influencer, non-world-TB, 618 damage
of 897 max HP (68.9%), 279 HP left (31.1%), 9 rounds, fighter HP
-36, lost. Second >50% fight: 75103 d117 Audit, player-tb-world,
715 of 1214 (58.9%), 499 HP left, 17 rounds, lost — then melted
(lost-fight dissolution, NOT a kill). Kills 0; killer table EMPTY;
0 living wave-4 killers at end on all 8 seeds. Kill-time scholar
identity is unanswerable on this band (no kills); the lethality
band's end-state-identity caveat stands unamended.

## Wound2 answers (measured, not assumed)

- TB monster fighter HP is rebuilt per fight (75103 d117 audit:
  world instance 825/1100, TB fighter 1214/1214; 75102 reunion
  seq 21: world 300/1200, five fresh fighters 1203-1367 in one day,
  290 total damage, zero accumulation).
- Player fighter HP DOES enter TB fights wounded — below max in
  10/28 fights (as low as 9/100, 75108 d110). Caveat in the arm
  evidence: this band alone cannot prove wound2 CAUSED the
  below-max entries (no pre-wound2 TB-start-HP table exists); what
  is proven is the asymmetry — the scholar carries wounds in, the
  monster never does.
- Field damage persists (75106 influencer 637->607->580->555 with
  no gaps; 75108 eulogy holds 11 damage across six meetings) but
  caps at ~33/fight.
- Near-kills still do not accumulate: TB losses end in melt or
  departure (75103 eater restored d118 then departed d119; 75102
  reunion melted d174; 75103 suburb/algorithm/suburb melted
  d129/d159/d179), never in a wounded instance left to finish.
- Herald 175-HP item: NOT FOUND — zero herald field rows and zero
  herald TB starts on all 8 seeds, though heralds are born on 3
  seeds (75102 seq 23, 75103 seq 39, 75106 seq 48) and sit at full
  700 HP at run end, never fought. BUT the gap CLASS recurs on
  five other instances with no recorded fight row between them:
  -250 (75106 seq 47 algorithm), -160 (75106 seq 55 eulogy), -225
  (75106 seq 57 eulogy), -300 (75108 seq 28 reunion), -300
  (75108 seq 29 reunion), plus a same-day 65-HP wobble on 75106
  seq 55 (740 field vs 675 TB on d129). The herald-175 item is
  re-framed, not closed; see backlog.

## Sense

75104 (fixed seed): NO wave-4 thread — 0 arrivals, 0 faced types,
0 Mirror Draft mentions, ends d90 with the lesser-seat AUDIT beat
("waves 1-3 faced (16/7/5)"). The lesser seat is an exit from the
funnel, not a step through it. 75103 (supplement, 9 engaged
arrivals on both corpora): Mirror Draft opens d68; Strike musters
the village inside d70; Eater paces the treeline; Eulogy drawn by
the feast d126; Herald raids allied villages nightly (trust -5,
d92-d177) while never being fought by the village — matching the
corpus (herald at full 700 HP at end). Cost marked by name: "The
Algorithm killed Elijah in 1 round. The village mourns." No beat
marks any near-kill; the village has no language or behavior for
finishing a wounded monster. Repetition notes (not verdict items):
cook-line chorus, keepsake echo, treeline chorus, identical
fight-start line 33 times on 75103.

## Metric review

- This run does NOT re-judge the w4lethality corpus or its
  DIAG-NO-GO verdict, and does NOT re-judge the rebaseline corpus
  or its GO verdict. It measures a new band and judges parity only
  against the rebaseline corpus, per the 0144Z coordinator rule.
- The lethality band's headline divergence from this band (days
  match on only 2/8 seeds) is a finding, not a verdict item: the
  base moved (wound2 + tackle batch) between the bands, as the
  0144Z rule anticipates — a baseline is a statement about a code
  base, not a timeless constant.
- Balanced-panel exception stands (no corpus-ingest mode in
  balance-panel.js); no panel artifact was fabricated. Panel
  comparison is the instrument for before/after game changes;
  this was a DIAG measurement, judged against its prereg legs.
- No metric revision proposed for the next run. The next run's
  prereg must keep the parity rule (rebaseline corpus only) and
  the sense-supplement rule (75104 + most-engaged seed when
  75104 is threadless).

## Telemetry deviation check (coordinator, on merged master)

`telemetry-check.js --baseline scale-wall.json --current
'evidence/2026-10-27/perseed-w4lethality-rebase/*.json' --metrics
national,table,wins,exiled` → 3 LOUD lines (national 12->0,
table -62% 16->6, wins 16->0, n=10 files). Verdict: KNOWN ARTIFACT,
baseline NOT rolled — (a) baseline WINSEAT regime forbids
comparison to a tableseat-nowait census substrate; (b) field-shape
artifact (per-seed rows carry nationalEver/entered/won, not
top-level national/table/wins; summary+analysis are the 9th/10th
files). Real wall numbers are in the table above. No exiled LOUD
line.

## Infrastructure

Safe-commit index clobber hit BOTH worker commits (bogus staged
deletions, commits themselves correct — verified by stat + hash
before merge); coordinator proof re-runs used --out to /tmp, so no
analysis.json timestamp churn was committed. No EPERM flap. No
jest (zero src/js; arm proofs are the attributable verification).
Registry-lock contention at registration (waited out, ~40s).
Main tree clean at closeout (c70ce1c80). Merged locally, pending
ship. No push, no bump, no live verification (ship-loop line).

scale-onramp stays converging (NOT converged): lethality is now
re-measured on current code with exact parity, but no lethality
fix has landed, kills are still 0, wins still come only through
the lesser seat, the full seat is still 0, and wave 5 still
unlocks nowhere. The directive stands until the tracker records
this axis converged on measured evidence. food-economy stays
converging (untouched; sibling B loop live). Rotation left at 3
(axis work, not lever rotation — no rotation advance claimed).
Claim deleted; lock deleted.
