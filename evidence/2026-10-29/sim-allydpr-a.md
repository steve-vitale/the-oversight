# sim-allydpr-a — PRICE THE ALLY-DPR FLIP THRESHOLD PER JOINED FIGHT

Run: flesh-out loop, follow-up to run fleshout-20261029T1715Z, landed by
adoption run fleshout-20261029T1915Z. Axis: scale-onramp (blocking axis,
converging, NOT converged). Worker: sim-allydpr-a.
DIAG ONLY — zero src/js changes, zero default flips, zero game-code
changes, zero joining rewire, zero ally-rule change. The queued narration
fix (joined drive-off ends have no end line) is NOTED, not built.
Preregistration (binding, committed BEFORE any judged analysis):
evidence/2026-10-29/sim-allydpr-a-prereg.md (commit 54220a42c).
Analyzer: scripts/test-allydpr-a.js (recompute + price + judge;
exits 1 by design on this run).
VERDICT: DIAG-NO-GO / INSUFFICIENT-DATA on the corpus. The exact
shout-time price the brief asked for is priced for 0 of the 24 joined
fights, because the corpus rows carry none of its inputs (no shout
round, no HP at shout, no per-round damage — see field gaps). That is a
corpus finding, not a failed run: the analyzer recomputes every
tilejoin headline exactly (see checks below), and the pre-registered
end-state proxy — reported as PROXY everywhere, never as the shout-time
price — still answers the brief's directional question, and the answer
is unambiguous: the gap is NOT ~1.5x. It is ~3–5x+ and far beyond.

## Plain words first

An ally who answers a shout deals almost nothing against the monster
that is already winning. Across the 24 joined fights, allies dealt 137
damage total — about 6 per fight — while the monsters they faced still
had, on average, far more health left than that when the fight ended.
Priced the only way the corpus allows (how much more ally damage, over
the same window, would have had to land to zero the monster's remaining
health), the middle joined fight needs its ally damage multiplied by
about 17 times to turn into a kill. Only 2 of 24 fights sit within 1.5x,
and both are fights that already ended in a kill. Nothing else is even
within 3x except four near-miss drive-offs and one death. At wave 4 the
picture is absurd: allies strike for 3–4 damage against monsters with
450–625 health still standing — a 155x median. One ally, however strong
its entrance, cannot carry a gap that wide; making the ally hit 50%
harder would change essentially nothing on this band.

And nearly a third of joins never get a blow in at all. In 7 of 24
joined fights the ally charges in and the fight ends in the same
breath — the fighter was already below the flee floor when they
shouted, so the ally never strikes (ally damage 0, ally damage taken
0). Those fights are not a damage problem; they are a timing problem.
No damage multiplier prices a window of zero rounds.

## Header (pre-registered) vs result

- DIAG-GO BAR (primary): >= 20 of 24 joined fights priced with a finite
  SHOUT-TIME multiplier, with median and <=1.5x / <=3x / <=5x shares
  reported.
  RESULT: 0/24 primarily priced → FAIL. The median and shares below
  are PROXY numbers (end-state sufficient price), reported because the
  prereg required them reported, not because they pass the bar.
- RECOMPUTE CHECKS (analyzer, not hand-copy): 24 U joined fights, ON
  U fought 250, index-join errors 0, joined outcomes 2 vKill / 4 mFlee /
  15 vFlee / 3 vDie, ally dealt total 137, ally taken total 296.
  RESULT: all 6 checks PASS — the corpus is exactly the tilejoin
  corpus, and the tilejoin headlines reproduce byte-for-byte in
  aggregate. The pricing failure is a field gap, not a corpus mismatch.
- SENSE BAR: >= 3 joined-fight transcripts read end to end and judged.
  RESULT: 6 transcripts read (Farid, Vasyl, Paola, Chen, Sandile,
  Mia — see sense notes) → PASS.
- DIAG-GO BAR overall: primary FAIL → DIAG-NO-GO / INSUFFICIENT-DATA.
  No re-scoring: the proxy does not rescue the primary bar.

## The field gaps (why the exact price is 0/24)

Per joined fight, corpus rows (fieldparty + tilejoin + w4dpr rows,
index-joined) carry: seed/day/fighter/monster/wave/caller, total
rounds, outcome, intent, everHopeless, calledHelp, joinedAllyVid,
fedVids, mHpStart, mHpLeft, total mDealt, vTaken, allyDealt,
allyTaken, vHpLeft, allyHpLeft, allyFirst (a NAME, no round),
minHpFrac, breakline branch. They do NOT carry: shout round; monster
HP at shout; leader HP at shout; leader HP max; per-round leader or
ally damage; DPR at shout for either side; rounds remaining / rtd at
shout; flee floor or mBreak fraction for the fight; ally strike count
or ally active-round count. Tilejoin rows alone lack mHpStart/mHpLeft
entirely. Sense logs exist for only 13 of the 24 joined fights (first
two fed+calledHelp fights per seed) and, even there, leader HP at shout
is confounded by field-medicine +20 lines with no running total — so
sense reconstruction is partial, hand-parsed, and does not count
toward the primary bar by prereg design. A future arm that wants the
exact shout-time price must FIRST extend the recorder with shout
round, HP/vHp at shout, and per-round damage. That is instrument work,
not a game change, and it is the ranked next step below.

## Headline: proxy prices (PROXY — end-state sufficient price for the kill)

Definition (prereg): vKill → 1.0x (already flipped); otherwise
k_proxy = 1 + mHpLeft / allyDealt over the same observed ally window;
allyDealt = 0 → infinite (ally never struck). Sufficient for the kill,
ignoring second-order effects (an earlier mBreak drive-off, reduced
incoming damage) — so k_proxy is a sufficient, not necessary,
multiplier for the KILL specifically. Survival-flip (flee → drive-off)
is cheaper and is NOT what k_proxy prices; see metric review.

- Proxy finite: 17/24. Proxy infinite (ally never struck): 7/24.
- Proxy MEDIAN (finite only): 17.33x.
- Shares <= 1.5x: 2/17 finite (11.8%); 2/24 overall (8.3%). Both are
  the two fights that already ended in kills (k = 1.0). NO non-kill
  fight is within 1.5x.
- Shares <= 3x: 6/17 finite (35.3%); 6/24 overall (25.0%). The four
  additions over 1.5x: moderator drive-off 1.69x, anaconda drive-off
  1.88x, Farid drive-off 2.50x, spool death 2.90x — three of the four
  are fights the village already survived (drive-offs).
- Shares <= 5x: 6/17 finite (35.3%); 6/24 overall (25.0%) — identical
  to <= 3x, because no proxy price falls between 2.90x and 6.50x.
- The gap is therefore NOT the brief's ~1.5x branch (entry strength is
  NOT the live question for the median joined fight) and NOT merely
  the ~3–5x branch either: the median joined fight needs ~17x, and
  11 of 17 finite prices exceed 5x. One ally cannot carry this gap
  on the kill-flip reading. Any arm that still wants the entry-strength
  question must argue it for the near-miss drive-offs only, not for
  joined fights in general — and that is a Steve-call before any
  one-ally change, as the brief required.

### Proxy prices by wave (the pooled median hides a gradient)

- Wave 1 (n=9, finite 6): median 4.50x. Closest band, still above 3x.
- Wave 2 (n=2, finite 2): median 6.84x (1.69x drive-off, 12.00x flee).
- Wave 3 (n=10, finite 7): median 26.43x.
- Wave 4 (n=3, finite 2, 1 infinite): median 154.75x (152.00x death,
  157.50x death). Wave-4 joined fights are not close: allies strike
  for 3–4 damage against 453–626 HP still standing.
- A future arm must pre-register wave splits: the pooled 17.33x mixes
  a 4.5x wave-1 band with a 155x wave-4 band, and no single multiplier
  describes both.

### Branch split (where DPR pricing breaks down)

- KILL 2, DRIVE-OFF 4, HOPELESS-BRANCH 8, FLOOR-BRANCH 7, PARTY-DEATH 3.
- ALL 7 allyDealt=0 fights are FLOOR-BRANCH, and ALL 7 FLOOR-BRANCH
  fights have allyDealt=0: on this band, floor ⟺ ally never strikes,
  exactly. The ally joins in the shout pass and the fighter flees on
  the floor in the same pass, before any further round. 7/24 = 29.2%
  of joins are timing/floor failures, not damage failures.
- The 8 HOPELESS-BRANCH fights are the clean DPR cases: the ally
  struck, the trajectory stayed hopeless, the fighter fled anyway.
  Their proxy prices run 12.00x–49.50x (plus one 21.67x, one 17.33x —
  see table); none is within 5x.

### Counterfactual context (report-only, per tilejoin metric review)

- OFF addressable pool, recomputed by the analyzer: 11 fights, 11 fled,
  0 kills, 0 deaths. Joined fights against that shape: 2 kills, 4
  drive-offs, 15 flees, 3 deaths.
- Joined-death share (guard read, not a leg): 3/24 = 12.5%, vs 0/11
  in the OFF addressable pool. Joins convert some would-be flees into
  kills/drive-offs (6/24) at the cost of deaths in 3/24 — the mixed
  picture tilejoin already reported, unchanged here.
- Band wall numbers (report-only for this diverging prototype, never
  a verdict): OFF wins 6, deaths 240; ON wins 3, deaths 311 (tilejoin
  evidence). Not re-judged here.

## Per-fight price table (PROXY; primary = UNPRICEABLE for every row)

k_proxy = 1.0 for vKill; else 1 + mHpLeft / allyDealt; inf when
allyDealt = 0. Sorted here by seed/day as in the corpus, not by price.

| Seed | Day | Fighter vs monster (wave) | R | Outcome / branch | mHpStart → left | mDealt | Ally dealt / taken | k_proxy |
|-----:|----:|---------------------------|---:|------------------|----------------:|-------:|-------------------:|--------:|
| 75101 | 25 | Farid vs hushwolf (w1) | 3 | mFlee / DRIVE-OFF | 50 → 9 | 41 | 6 / 7 | 2.50x |
| 75101 | 26 | Vasyl vs gallowdeer (w1) | 3 | vFlee / HOPELESS | 150 → 124 | 26 | 6 / 0 | 21.67x |
| 75101 | 52 | Oliver vs gallowdeer (w1) | 3 | mFlee / DRIVE-OFF | 68 → 33 | 35 | 6 / 39 | 6.50x |
| 75101 | 94 | Desmond vs buffering (w3) | 3 | vFlee / HOPELESS | 210 → 194 | 16 | 4 / 0 | 49.50x |
| 75101 | 100 | gen_pz654xh vs buffering (w3) | 3 | vFlee / HOPELESS | 116 → 98 | 18 | 6 / 0 | 17.33x |
| 75102 | 40 | gen_0x2wi4u vs gallowdeer (w1) | 2 | vFlee / FLOOR | 134 → 88 | 46 | 0 / 0 | inf |
| 75103 | 107 | Sanne vs suburb (w4) | 2 | vFlee / FLOOR | 341 → 323 | 18 | 0 / 0 | inf |
| 75104 | 75 | Yara vs gallowdeer (w1) | 3 | vFlee / HOPELESS | 150 → 117 | 33 | 4 / 21 | 30.25x |
| 75104 | 75 | Chantal vs gallowdeer (w1) | 2 | vFlee / FLOOR | 117 → 101 | 16 | 0 / 0 | inf |
| 75104 | 88 | Chantal vs belltoad (w1) | 2 | vFlee / FLOOR | 45 → 16 | 29 | 0 / 0 | inf |
| 75105 | 18 | gen_jm418sb vs anaconda_empress (w1) | 6 | mFlee / DRIVE-OFF | 90 → 14 | 76 | 16 / 19 | 1.88x |
| 75105 | 19 | Mia vs hushwolf (w1) | 3 | vKill / KILL | 50 → 0 | 50 | 4 / 7 | 1.00x |
| 75105 | 62 | gen_8yf6fyg vs redactor (w3) | 3 | vFlee / HOPELESS | 260 → 212 | 48 | 6 / 0 | 36.33x |
| 75105 | 70 | Vasyl vs spool (w3) | 7 | vFlee / HOPELESS | 280 → 178 | 102 | 7 / 78 | 26.43x |
| 75105 | 70 | Vasyl vs spool (w3) | 8 | vDie / PARTY-DEATH | 178 → 38 | 140 | 20 / 48 | 2.90x |
| 75105 | 73 | Caleb vs spool (w3) | 5 | vFlee / FLOOR | 210 → 185 | 25 | 0 / 0 | inf |
| 75105 | 73 | Mia vs callback (w3) | 5 | vKill / KILL | 153 → 0 | 153 | 10 / 40 | 1.00x |
| 75106 | 26 | gen_embnvnq vs moderator (w2) | 9 | mFlee / DRIVE-OFF | 150 → 20 | 130 | 29 / 37 | 1.69x |
| 75106 | 38 | gen_4uem561 vs voice_mimic_radio (w2) | 3 | vFlee / HOPELESS | 65 → 33 | 32 | 3 / 0 | 12.00x |
| 75107 | 103 | Chen vs audit (w4) | 3 | vDie / PARTY-DEATH | 506 → 453 | 53 | 3 / 0 | 152.00x |
| 75108 | 69 | gen_r7aa18u vs callback (w3) | 3 | vFlee / HOPELESS | 171 → 126 | 45 | 3 / 0 | 43.00x |
| 75108 | 69 | gen_cugi4hf vs callback (w3) | 6 | vFlee / FLOOR | 126 → 24 | 102 | 0 / 0 | inf |
| 75108 | 75 | Ava vs eulogy (w4) | 3 | vDie / PARTY-DEATH | 675 → 626 | 49 | 4 / 0 | 157.50x |
| 75108 | 113 | visjoin_111 vs callback (w3) | 2 | vFlee / FLOOR | 181 → 166 | 15 | 0 / 0 | inf |

Reading notes on the table: ally strikes run 3–6 damage per blow
(allyDealt 3–7 over a whole short fight, 16–29 over a long one), while
leaders strike for roughly 10–24 — the ally is about a quarter of a
leader's damage rate, against monsters that still hold 100+ HP in
most losing fights. The two 1.00x rows are the kills themselves, not
evidence that 1x suffices elsewhere. The 2.90x spool death is the only
death within 3x, and even it is a kill-flip price, not a survival
price (the beast would likely have broken — mFlee — well before
reaching 0 HP; the corpus cannot price that break point).

## Sense-testing law (6 transcripts read end to end)

S1 — Farid vs hushwolf, s75101 d25, mFlee (tilejoin's S1, re-read).
Farid fights two rounds alone, binds his own wound, shouts when losing,
Vasyl charges in, takes a hit, lands 6 damage, monster left at 9 HP —
and the log STOPS. No drive-off end line: the fight's success is
unnarrated. The join reads as a person answering a shout; the ending
does not read at all. This is the queued narration blank, confirmed a
second time, still not built here.

S2 — Vasyl vs gallowdeer, s75101 d26, vFlee. Vasyl shouts after binding
a wound; Thao charges in, strikes for 6 (monster 124 left), and Vasyl
"sees how this ends — and runs while running still works." Honest to
the point of bleakness: the ally's blow changes nothing legible, and
the fighter says so by running. The join is people; the outcome is a
correct verdict on a 21.67x gap.

S3 — Paola vs gallowdeer, s75102 d40, vFlee, FLOOR-BRANCH, allyDealt 0.
Paola strikes twice, shouts, "Terrence charges in!" — and the log
ENDS. No third round, no flee line, no consequence at all: the ally's
entrance is narrated and then the fight silently ceases to exist in
the transcript (the engine ends it on the flee floor in the same
morale pass, with no log line). This is a second, worse narration
blank riding on the floor branch: a join with zero narrated
consequence. Noted, not built.

S4 — Chen vs audit, s75107 d103, vDie (wave 4). Chen strikes for 19
and 15 against a 506-HP audit, shouts with the monster at 472 HP,
Valeria charges in and strikes for 3, and the next monster hit kills
Chen (0 left). The call reads as desperation, honestly answered and
honestly futile: 3 damage against 453 remaining HP is not a rescue in
any telling. The 152x proxy is not an abstraction here; it is visible
in the transcript as a token blow.

S5 — Sandile vs moderator, s75106 d26, mFlee, 9 rounds. The long
counter-example: Sandile shouts after round 2 (monster 129 left),
Fatima joins and deals a steady 3–6 per round for seven rounds, the
monster is ground down to 20 HP — and again the log stops with no end
line. The joined fight that works best (1.69x proxy, a genuine
drive-off earned over 9 rounds) is also the one whose ending is
missing. A reader of the log alone cannot tell the beast fled.

S6 — Mia vs hushwolf, s75105 d19, vKill. Mia shouts with the monster
at 28 HP; Kayla charges in, takes a hit, and lands the killing blow
(4 damage to 4 HP): "The lead falls — the pack's coordination
shatters." This is the one shape where a small ally contribution
decides a fight: finishing a nearly-dead monster. It reads as people
precisely because the numbers are close — the exception that shows
what the other 22 fights lack: a monster within one ally blow of
falling.

Sense judgment overall: joins read as people answering shouts in every
transcript; endings read honestly when they exist (flee, death, kill)
and do not exist at all for drive-offs and floor-flees after a shout.
The narration blanks are confined to endings, not to the join beat.

## Ranked next steps (with numbers — no src/js built here)

1. EXTEND THE RECORDER BEFORE ANY FURTHER DPR PRICING (instrument
   work, no game change). Add to the field-fight recorder, for every
   fight: shout round, monster HP and leader HP at the shout moment,
   per-round leader/ally damage, and the fight's mBreak fraction.
   Without these, the next arm re-runs this verdict (0/24 exact
   prices). With them, the exact shout-time formula in the prereg can
   finally be evaluated — and, crucially, the SURVIVAL-flip price
   (damage needed to reach mBreak and drive the beast off, not to
   kill it) can be priced alongside the kill-flip price. Do not
   pre-register another kill-flip-only arm: the kill-flip median is
   17.33x and the survival question is the one that matters for
   village survival.
2. DO NOT TOUCH THE ONE-ALLY RULE OR ALLY ENTRY STRENGTH ON THIS
   EVIDENCE. A 1.5x entry-strength change moves zero non-kill fights
   across the kill-flip bar (0/22 non-kills within 1.5x) and, on the
   proxy, would need ~17x at the median and ~155x at wave 4 to flip
   kills. If entry strength is ever revisited, it needs a Steve-call
   and a survival-flip (not kill-flip) bar — and it must first answer
   the floor branch, not the damage branch.
3. THE FLOOR BRANCH IS A SEPARATE, STEVE-CALL QUESTION (7/24 joins,
   29.2%, ally never strikes). Options the next design discussion must
   choose between, not implement silently: (a) a shouted ally gets at
   least one strike before the floor flee is honored; (b) the shout is
   suppressed when the leader is already below the flee floor (no
   futile call, no silent join); (c) leave it — the futile call is
   itself honest tragedy. This arm measures the branch's size; it does
   not pick an option.
4. WRITE THE MISSING END LINES (cheap narration fix, ranked below
   pricing work, NOT built here): drive-off ends after a joined fight
   (S1, S5) and floor-flees after a shout (S3) currently end the log
   with no line. One honest line each ("the beast breaks and runs";
   "they run, the ally's charge coming too late") makes joined-fight
   endings legible. Narration only, no behavior change.

## Metric review (for the NEXT run — nothing re-scored here)

- KILL-FLIP vs SURVIVAL-FLIP. The brief's formula prices the kill
  (HP at shout / rounds available). Villages survive on drive-offs
  too: 4 of 24 joined fights already end in mFlee, and the survival
  question is what damage reaches mBreak, not 0 HP. The kill-flip
  proxy therefore OVERSTATES the survival gap, by an amount the corpus
  cannot compute (no mBreak per fight). Proposed revision: the next
  arm's primary is the survival-flip price (mHpLeft minus the mBreak
  threshold amount, over the ally window), with kill-flip reported as
  context. The 17.33x headline must not be quoted as "the survival
  gap" — it is the kill gap.
- PROXY IS SUFFICIENT, NOT NECESSARY. k_proxy assumes the ally window
  stays the same length and ignores the trajectory feedback (more
  ally damage → trajectory ceases to be hopeless → the fight lasts
  longer → more total damage). A true flip multiplier could be lower
  than k_proxy, especially for the near-miss drive-offs. The proxy is
  directional: it rules OUT the 1.5x branch and rules IN "far above
  5x at the median," but it does not pin the median to 17.33x exactly.
- POOLED MEDIAN HIDES THE WAVE GRADIENT. Wave-1 median 4.50x vs
  wave-4 median 154.75x is a 34x spread inside one headline number.
  Proposed revision: pre-register wave splits (and a wave-1/2-only
  sensitivity) for any future DPR arm; do not report a pooled median
  alone.
- FLOOR-BRANCH CONFLATION. Pooling floor fights (ally window zero)
  with hopeless fights (ally window positive) in one "joined fights"
  denominator mixes two different failures. Proposed revision: report
  floor-branch joins as their own line (n, share, Steve-call pending)
  and price DPR only over hopeless-branch + death + drive-off fights
  with allyDealt > 0.
- PRIMARY BAR UNREACHABLE WITH THE CURRENT RECORDER. The prereg's
  >= 20/24 primary bar was the right bar for the question and the
  wrong bar for this corpus — no arm can pass it without recorder
  fields that do not exist. Proposed revision: either extend the
  recorder first (step 1 above) and keep the bar, or pre-register the
  end-state proxy as the primary WITH its sufficient-not-necessary
  and kill-not-survival limits stated in the prereg itself. Do not
  silently promote a proxy to primary after seeing its numbers.
- SENSE-SLOT COVERAGE. Only 13/24 joined fights have transcripts
  (first two fed+calledHelp fights per seed); 11 joined fights,
  including both wave-4 deaths' companions and the 2.90x spool death,
  have no log. Sense claims in this file rest on the 6 transcripts
  actually read, not on the 24.

## Convergence note

Scale-onramp stays converging, NOT converged. This arm moves no wall
number — by design (diag only) and by measurement: it replaces
tilejoin's "joins do not flip losing fights" with a priced reason.
The blocking mechanism is no longer "mates never join" (tilejoin
proved they can) nor "joins are slightly too weak" (this arm rules
that out: median kill-flip 17.33x, wave-4 154.75x, 29% of joins never
striking). The next arm that claims movement on this axis must either
change what a join is for (survival-flip, floor timing, party
formation) or prove, with recorder fields that exist, that the
survival-flip gap is bridgeable — not re-price the kill gap.

## Infrastructure notes

- No container EPERM flap on the analysis leg; the analyzer runs in
  ~1s on the committed corpus (no new sims — this arm re-analyzes the
  tilejoin corpus by design).
- Safe-commit index clobber hit the prereg commit (54220a42c) as
  "D + ??" on the same file — repaired via HEAD-blob cacheinfo with
  hash verification (worktree hash = HEAD blob 9114e74c), never reset,
  never forced, commit verified correct, status empty after repair.
- Analyzer exits 1 by design (DIAG-NO-GO / INSUFFICIENT-DATA on the
  primary bar); recompute checks all PASS.
- No live verification, no push, no bump: this arm reports "ready for
  coordinator merge, pending ship" per assignment. The batch ship job
  owns pushes.

## Files

- Corpus (unchanged, tilejoin arm): evidence/2026-10-29/perseed-tilejoin-a/
  on/s75101–s75108-fresh.json + summary.json; off/ likewise.
- Analyzer: scripts/test-allydpr-a.js (recompute PASS; primary 0/24;
  proxy median 17.33x; exits 1 on the primary bar by design).
- Prereg: evidence/2026-10-29/sim-allydpr-a-prereg.md (54220a42c).
- This evidence: evidence/2026-10-29/sim-allydpr-a.md.
