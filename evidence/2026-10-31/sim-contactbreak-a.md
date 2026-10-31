# sim-contactbreak-a — the contact-break class, measured from the landed fieldfinish2 corpus (DIAG-GO)

Run: Loop A worker, axis scale-onramp (converging, NOT converged),
run fleshout-20261031T2058Z. Arm type: DIAG, analyzer-only.
NO new sims, NO game harness loads, ZERO src/js changes.
Pre-registration: evidence/2026-10-31/sim-contactbreak-a-prereg.md
(committed BEFORE any judged analysis, commit 004e57d8c;
only a schema probe ran before it). Analyzer:
scripts/contactbreak-analyze-20261031.js. Proof test:
scripts/test-contactbreak-20261031.js (40 passed, 0 failed).

## Question (from sim-fieldfinish2-a)

The fieldfinish2 prereg EXPLICITLY excluded a second lever family:
finishing a beast that is met already below its break line (the
contact/volley break fires before any fought round). This arm
measures how big that excluded class is, from the landed corpus
alone, so a future BUILD arm knows whether it is worth building.
It builds nothing, judges no gate, and changes no game code.

## Corpus (this arm's base, and nothing else)

- BASELINE leg (PRIMARY): evidence/2026-10-31/perseed-fieldfinish2-baseline-pilot/leadfeast/*.json
- Lever leg (secondary): evidence/2026-10-31/perseed-fieldfinish2-pilot/leadfeast/*.json

8 seeds per leg, the fieldfinish2 pilot set. Numbers below come
only from these two directories. They are NOT judged against
fieldkill-a's corpus or any other base. The fieldfinish2 verdict
(PILOT NO-GO, game code reverted) stands unchanged; this arm
re-uses its corpus, it does not re-judge its lever.

## Classifier (per prereg, applied to EVERY wave-3 row)

CONTACT iff ALL of: mHpStart < 0.15 * mMaxHp (the wave >= 2
break line), rounds <= 1, mDealt == 0, outcome in {mFlee,
evade}. FOUGHT iff classifiable and any condition fails.
UNCLASSIFIED iff any needed field is missing or non-numeric
(never derived — mHpStart is NOT reconstructed from mDealt +
mHpLeft). Threshold counts below are DESCRIPTIVE ONLY: they
size a future gate, they do not judge one.

## Headline numbers (per leg, never pooled)

| Metric | Baseline leg | Lever leg |
| --- | ---: | ---: |
| Total wave-3 field meetings | 104 | 71 |
| CONTACT n (share) | 27 (26.0%) | 0 (0.0%) |
| FOUGHT n (share) | 62 (59.6%) | 64 (90.1%) |
| UNCLASSIFIED n (share) | 15 (14.4%) | 7 (9.9%) |
| Reconciliation (CONTACT+FOUGHT+UNCLASSIFIED = total) | 27+62+15 = 104 ✓ | 0+64+7 = 71 ✓ |

## The contact class in detail (baseline leg; lever leg has none)

- mHpStart distribution (n = 27): median 4 HP, Q1 1 HP,
  Q3 28.5 HP, min 1 HP, max 36 HP. Sorted values:
  1×13, 4, 16×3, 28×3, 29×4, 33, 36×2.
- Descriptive thresholds (within the contact class only):
  mHpStart <= 15 HP: 14 of 27; <= 30 HP: 24 of 27;
  <= 45 HP: 27 of 27 (the whole class — every contact
  beast sits at or below 36 HP, as the 15% line on
  240–300 HP maxima requires).
- All 27 contact rows: rounds 0, outcome mFlee, mDealt 0.
  The rounds <= 1 bound never actually admitted a rounds-1
  row in this corpus — that edge of the classifier is
  untested by real rows, not validated by them.
- Conditions 1–3 alone pick out exactly the contact set on
  both legs: there are ZERO below-break-line rows that fail
  the other conditions (baseline 0, lever 0). The outcome
  restriction never excluded a row here; no row met
  conditions 1–3 and ended vKill, vDie, or vFlee.
- By monster: callback 10, chorus_line 7, spool 7,
  redactor 3. No gavel, focus_group, terms_of_service,
  buffering, or ad_break contact rows appear — but see the
  unclassified note below: evade rows without HP fields
  include those types, so type coverage may be wider than
  the classified counts show.
- By intent: engage 26, learn 1. The class is not a
  learn-only artifact; villagers out to fight meet broken
  beasts and still watch them leave.
- By seed: 87123 contributes 12 of 27, 87140 contributes
  7, 87104 and 87115 contribute 2 each, 87124 contributes
  4, and 87109 / 87119 / 87127 contribute 0. The headline
  26% is seed-concentrated, not evenly spread: two seeds
  carry 19 of 27 meetings. A future BUILD arm must not
  quote 26% as a uniform rate.
- The lever leg's zero is NOT proof the class does not
  exist — the baseline leg proves it does (27 meetings).
  The lever leg is a diverged leg (fieldfinish2-a.md: it
  won earlier at lower scale, so its wave-3 meetings are
  a different, later-window sample), and on it no
  classifiable wave-3 beast was ever met below the break
  line at all: the lowest met fraction is 0.157 (seed
  87109, day 89, spool, met at 44/280 HP, fought 4 rounds,
  mFlee) — just above the 0.15 line. Only 2 lever rows
  sit below a 0.20 fraction. Read the legs separately:
  baseline says the class is real and large; lever says
  a diverged trajectory can starve it to zero.

## Unclassified rows (counted, never dropped)

- Baseline: 15 rows, all with reason missing:mHpStart,
  mMaxHp. Lever: 7 rows, same reason. No other field is
  ever missing.
- Sensitivity the prereg forbids folding in, stated
  plainly: 9 of the baseline 15 and 4 of the lever 7
  unclassified rows are contact-shaped on their visible
  fields (outcome evade, rounds 0, mDealt 0) — only the
  HP fields are missing. If those rows were contact,
  the baseline contact count would be 36/104 (34.6%)
  instead of 27/104 (26.0%), and the lever count would
  be 4/71 (5.6%) instead of 0/71. They stay UNCLASSIFIED
  in the judged counts: the prereg bans deriving HP, and
  the bias direction is stated rather than corrected.
  A future recorder should capture mHpStart/mMaxHp on
  evade rows, because evades are exactly where the
  contact class hides.
- The other unclassified rows are fought rows whose HP
  fields are missing (baseline: 5 vFlee + 1 mFlee with
  damage dealt; lever: 1 vDie, 2 vFlee with damage) —
  missing HP fields are not exclusive to the contact
  shape, but the evade concentration (9/15, 4/7) is.

## Log validation (prereg sample rule: census + controls)

- CONTACT census: all 27 baseline contact logs read.
  Every one carries exactly one drive-off line of the
  form "<Name> drove <Monster> off with the bow — it
  broke before it ever closed." Zero strike lines, zero
  damage lines, zero disagreements, zero wording gaps.
  The lever class is empty, so its census is vacuous
  (0 checked, 0 disagreements).
- Negative controls: first 3 FOUGHT rows per leg read.
  Baseline controls are real fought rounds (e.g. seed
  87104 day 140, callback, "R2: Elif strikes for 12");
  lever controls likewise (strikes, peacemaker stand-down
  with a fought round). Zero control disagreements.
- No row was moved by the resolution rule. The
  classifier and the logs agree everywhere they were
  both checked.

## Sense-testing (SENSE-TESTING LAW — logs read in full)

Two contact logs, quoted whole (each log is one or two
lines — that brevity is itself part of the reading):

1. Seed 87104, day 148, The Callback met at 1 HP of 260:
   "Weronika drove The Callback off with the bow — it
   broke before it ever closed."
2. Seed 87115, day 84, The Callback met at 36 HP of 260:
   "Dmitri has Crude bow but no arrows — the string stays
   drawn, useless."
   "Dmitri drove The Callback off with the bow — it broke
   before it ever closed."

In plain words: a beast already broken on sight running
away reads as believable — a Callback at 1 HP of 260 is
a dying thing, and a villager showing a drawn bow is
enough reason for it to go. But the meeting reads as
thin, twice over. First, in 10 of the 27 contact logs
the game itself says the villager has no arrows, and
then in the very next line says the bow drove the beast
off — the beast flees from an empty threat, and the
narration does not notice the contradiction. Second,
the same wounded types keep reappearing at 1 HP across
days (seed 87123 alone has 12 contact meetings): the
world keeps re-serving a beast nobody can finish, so
the meeting repeats instead of resolving. A villager
who meets a 1-HP beast a dozen times and never puts it
down does not read as a person making a choice; it
reads as a rule firing.

What a finish would have to look like to read as earned
rather than granted: it must cost a real action, not
fire automatically on sight. The villager should have
to close and strike, or loose an actual arrow, spending
a round in which the beast could still hit back — and
a no-arrows bow must not count as the instrument of a
finish. At 1 HP that bar is nearly free, so the honest
fiction is a put-down, not a fight; at 28–36 HP the
beast still has teeth, and a finish should carry risk.
A rule that converts on sight, with no action spent,
would read as granted even where the numbers justify
it. This is a CANDIDATE shape for a future BUILD arm,
never a landed change and never a recommendation to
lower the break line: the break line is load-bearing
villager protection (fieldfinish2-a.md), and a
contact-finish rule must be paired with the same
survivability thinking the committed-finish arm
carried.

## What a contact-finish rule would have to convert (candidate only)

On the baseline leg: 27 meetings in 8 seeds (26.0% of
wave-3 field meetings), of which 13 sit at 1 HP, 14 at
<= 15 HP, and 24 at <= 30 HP. A rule scoped to the
contact class would have to convert meetings where no
blow has yet landed — a wider, sight-based lever than
the committed-finish rule, which is exactly why
fieldfinish2 excluded it. The lever leg's 0 shows the
class can vanish on a diverged trajectory, so a BUILD
arm must pre-register its baseline on the leg it will
actually be judged against, and must not pool legs.
The unclassified evade rows (9 baseline, 4 lever) are
the class's dark matter: any future rule's true reach
is between the classified count and the classified +
contact-shaped-unclassified count (baseline 27–36,
lever 0–4).

## Verdict: DIAG-GO

Both GO conditions hold on both legs: 100% of wave-3
rows are classified CONTACT vs FOUGHT or explicitly
UNCLASSIFIED with reason (baseline 27/62/15, lever
0/64/7), and all counts reconcile to corpus totals
(104 and 71). Proof test 40 passed, 0 failed on this
branch. No effect threshold applies to a DIAG arm: the
baseline 26% and the lever 0% are both measured
answers, and the divergence between them is reported,
not averaged away.

## Metric review (mandatory, §14)

- The classifier behaved: its outcome and rounds
  conditions never bound in this corpus (all contact
  rows are rounds-0 mFlee; no below-break row fails
  them), so the class as measured is really "met below
  the break line, fled on contact." A future arm that
  wants rounds-1 meetings in the class must find them
  first — they do not occur here.
- The missing-HP-field bias is the metric's weak spot:
  evade rows systematically lack mHpStart/mMaxHp, and
  evades are where contact-shaped rows concentrate.
  The judged share is therefore a floor, not a point
  estimate, on both legs. Next recorder revision should
  capture HP fields on evade rows before any BUILD arm
  judges a contact-finish rule.
- The lever-leg zero is a divergence artifact warning,
  not a second measurement of the same quantity: after
  fieldfinish2's low-wave kill divergence, the lever
  leg's wave-3 window differs from baseline's. Future
  DIAG arms on diverged corpora must report legs
  separately, as done here, and must not pool.
- Quartiles use linear interpolation on sorted values
  (index = p * (n - 1)), per prereg. With 13 of 27 values
  at 1 HP, the median (4) and Q1 (1) describe a
  two-humped class (near-dead at 1 HP vs wounded at
  16–36 HP) better read as two groups than as one
  spread: 14 rows at <= 15 HP, 13 rows at 16–36 HP.

## Wall numbers (unchanged — this arm judges no lever)

This DIAG arm does not re-judge scale reach. The wall
numbers on this corpus stand as reported in
sim-fieldfinish2-a.md (baseline: national 7/8, table
7/8, wins 7/8, wave-4 4/8, wave-5 0/8; lever: national
2/8, table 7/8, wins 7/8, wave-4 5/8, wave-5 0/8; full
seat 0, wave 5 reached 0 on both legs). Arc reach,
four-realm formation, trap acquisition by source,
counter discovery rates, and young-link succession
survival are NOT in this corpus — reported as
unmeasured, not as zero.

## Blanks filled or documented

- FILLED (measured): the size of the contact-break
  class the fieldfinish2 prereg excluded — 27/104
  (26.0%) on the baseline leg, 0/71 on the diverged
  lever leg, with a 27–36 / 0–4 range once
  contact-shaped unclassified rows are acknowledged.
- DOCUMENTED (for a future BUILD arm, not built here):
  the candidate shape in "What a contact-finish rule
  would have to convert" above, including the
  no-arrows narration contradiction (10/27 logs) and
  the evade-row HP-capture recorder gap.
- NOT re-opened: the committed-finish NO-GO, the
  break line itself, or any gate threshold.
