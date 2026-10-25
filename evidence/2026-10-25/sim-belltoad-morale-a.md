# sim-belltoad-morale-a — LEVER: trick-aware morale must not hold a non-progressing trick (candidate 2 from sim-belltoad-a)

Run: fleshout-20261025T1418Z, arm sim-belltoad-morale-a. Candidate 2
ONLY — candidate 3 (strike-or-flee fallback after the 2-shout cap) is
NOT touched, NOT bundled. The shout cap (2) and candidate-1 chorus-break
behavior are untouched.

Worktree: ~/workspace/worktrees/sim-belltoad-morale-a (coordinator merges;
KILLED arms are not merged — see verdict).

## PRE-REGISTRATION (binding — written BEFORE any armed sweep, docs/MEASUREMENT.md §§9–12, 14–15)

- Lever: src/js/fieldFights.js trick-aware morale ONLY (the COUNTERWIRE
  block ~1470). When the trick is NON-PROGRESSING (defined below), the
  hopeless suppression is skipped: hopeless stays true and the normal
  hopeless branch runs (help call if allies near, else vFlee, with
  war_cry/rally as the existing honest alternatives), plus a
  narrating log line for the abandonment (no silent actions).
- NON-PROGRESSING, precisely and conservatively — ALL four must hold
  at a round-end morale check:
  (a) rec.trickLog has >= 2 entries (the trick was repeated across
      rounds, not merely tried once);
  (b) rec.mDealt === 0 (zero damage dealt all fight, villager + ally);
  (c) the lead monster's HP is unchanged from fight entry
      (members[0].hp === rec.leadHpEntry, recorded at members build;
      volley/ambush damage therefore counts as progress, correctly);
  (d) NO termination counter is still advancing toward its
      threshold: redactorQuiet < 3, focusBore < 3, tosRead < 2, or
      eulogyContradicts < 3 each mean the trick IS progressing and
      the hold is KEPT. Shout/whiff/dance-style pure-mitigation tricks
      have no counter, so they CAN be lifted — they neither damage
      nor advance any termination, which is exactly the ranked
      candidate's "deals no damage AND does not end the fight".
- UNTOUCHED: the 2-shout cap, trickDisrupt application (candidate 1),
  villagerTrickAction's offer of tricks, the >25% HP floor on the
  hold, and every other system. `git diff` must show fieldFights.js
  only.
- Substrate: tableseat-nowait (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) +
  deathcensus-diag fight recorder (runOne from
  scripts/test-deathcensus-diag-sweep.js, recorder pid 'armed').
- Seeds: 73671–73678 (8 seeds, the pilot band). Control AND armed on
  identical seeds. Control = current master (candidate 1 already in).
- Horizon: death-aware, 180d (dead villages stop +10d tail max via
  runDays), never a fixed 200d.
- PRIMARY: other 0-dealt multi-round deaths 1 → 0 (control count
  below).
- Guards (1332Z legs + corrected guard wording):
  - (G-bell) belltoad engage-intent deaths armed <= control (1) —
      no new belltoad death; the brief's "staying 0" premise does NOT
      hold on current master (control is 1, see below), so the
      gateable form is no-new-death, stated here before arming;
  - (G-set) armed other-class death set ⊆ control's (death set in
      the class identical-or-subset, per the 1332Z correction — never
      "all survive");
  - (G2) total villager deaths armed <= control + 2;
  - (G3) national-ever armed >= control − 2;
  - (G4) wins-excluded median armed >= 0.8 × control median;
  - (G-wave4) wave-4 reach armed >= control − 1;
  - (G-cost) starvation/sickness cost rate armed <= control + 0.2
      per 100 village-days (same counting rule both configs);
  - (G5) probe: control sweep reproduces the candidate-1-era pair
      class OR the difference is explained by trajectory movement
      (see control replication note — the pair is gone on current
      master); DIAG replay census-matches all 8 control seeds.
- KILL CLAUSE (stated here, before arming — not a mid-run re-score):
  if the armed sweep shows the guarded death sets identical to control
  AND the DIAG shows zero hold→vDie fights, the verdict is KILLED
  (inert on this band: no non-progressing-trick death exists to fix),
  with PRIMARY reported literally as 1 → 1 (miss by absence of
  target, not by adverse effect). A PRIMARY miss WITH a changed
  guarded death set is NO-GO, not KILL. Total-death drift via a
  single-seed cascade is reported separately and does not by itself
  re-label the verdict (see Metric review).
- IMPLEMENTATION CORRECTIONS (both made after an armed sweep, both
  bug fixes to the lever's implementation, neither a bar change —
  the bars above never moved):
  (C1) Post-outcome overwrite: the first armed sweep rewrote
      trick-set mFlee outcomes (terms_of_service dismissals) as
      vFlee, because morale runs at round end even after the trick
      already ended the fight, and the lift removed the hold that
      used to suppress the overwrite. Fix: the lift requires
      !rec.outcome — a trick that already ended the fight is a
      success, not a non-progressing trick, and morale must not
      rewrite it.
  (C2) Signature-state counters: the v1 counter list missed two
      advancing counters that live in signature state, not
      villager-phase rec fields — spool recording (sigW3b spRec,
      3 turns) and nielsen ratings (sigW5 niR, draining toward
      sign-off at <=10). Both were added to the advancing list.
      The spool's completed-but-unpaid window (recording 3/3 at a
      round-end check, before the first post-trick strike) still
      trips the label — see the spool finding under Verdict; it
      does not change the verdict and is left as a definition note
      rather than chased through a fourth sweep.
- Sense check: read at least one armed transcript end-to-end for a
  villager who abandons a non-progressing trick (lift log line) — or,
  if no lift fires anywhere in the armed band, report that honestly
  and quote instead a hold-correctly-kept fight. (Outcome: exactly
  one lift fired in the band, on a spool fight — quoted below.)
- Sense check: read at least one armed transcript end-to-end for a
  villager who abandons a non-progressing trick (lift log line) — or,
  if no lift fires anywhere in the armed band, report that honestly
  and quote instead a hold-correctly-kept fight.
- Kill protocol: if KILLED/NO-GO, revert all game code before
  committing (measurement record + proof script only, no game-code
  commit), per kill protocol.
- Balanced panel (§15): same documented class as prior runs —
  balance-panel.js compare requires panel outputs, not recorder
  corpora; the identical-seed deathcensus corpus below is the
  comparison of record. Attempted only if it accepts corpora; the
  failure class is reported, not papered over.
- Canon: docs/CANON.md read first. docs/MONSTER-WAVES.md lists Choir
  Toad in the wave-1 roster but carries no belltoad counter entry
  (known gap from sim-belltoad-a) — nothing invented; counter data
  lives in src/data/monsters.json (shout, "Break the chorus").

## CONTROL REPLICATION (current master, before arming)

Control corpus: evidence/2026-10-25/perseed-sim-belltoad-morale-a/
(s<seed>-control.json). DIAG replay (--diag) census-matches all 8
seeds (days, gameDays, deaths, resolve + direct fight keys) — G5 PASS.

TRAJECTORY MOVEMENT WARNING (explains every difference from
sim-belltoad-fix-a's corpus): master moved under this band since
1332Z (post-flee threshold landing + sibling work). The d67/d68
pair is GONE — seed 73677 now runs 143d (was 117d armed in fix-a)
with different fights; the old pair's villagers do not fight
belltoad on d67/d68 at all. Control here is therefore judged
against ITSELF (armed on identical seeds), never against fix-a's
numbers. The brief's expectation "belltoad engage-intent deaths 0"
does NOT reproduce on current master: control has 1.

| Metric (control, current master) | Value |
|---|---|
| Belltoad engage-intent deaths | 1 (73677 d38 liam_davis, r=2, dealt 8, taken 79, entry 0.76 — NOT 0-dealt, died before any morale check) |
| Other 0-dealt multi-round rows (deaths) | 15 (1) — the death is 73674 d90 paparazzo diana_osei, r=2, dealt 0, taken 29, entry 0.26, intent LEARN |
| Total villager deaths | 200 (per seed 27, 23, 23, 16, 21, 29, 33, 28) |
| National-ever | 7/8 |
| Table invited / wins | 4/8 / 4/8 |
| Wave 4 / wave 5 | 6/8 / 0/8 |
| Median days / wins-excluded median | 135 / 180 |

## DIAG FINDING (pre-arming, on control trajectories — read before judging the lever)

DIAG replay (--diag, census-matched, 22 fights whose log contains
"holds the line"): ZERO end in vDie. Every hold fight ends vFlee
or mFlee. The morale hold, on this band, never precedes a death.

What the 22 holds are: terminating/counter tricks whose hold is
correctly kept under the definition above (focus_group bore ×3,
redactor quiet ×4, terms examine ×3 — all end mFlee/vFlee), and
damage-dealing fights where the hold fired but the fighter later
struck (belltoad d14 dealt 24, belltoad d44 dealt 28, sanjun dealt
69, buffering dealt 4, spool dealt 19, callback farewell fights
dealt 14–54). Under the pre-registered definition, NONE of the 22
final states qualifies as non-progressing (all have mDealt > 0 or a
counter advancing) — so the only way the armed code can change an
outcome is via an EARLIER round-end check (e.g. a belltoad fight
0-dealt at end of R2 that strikes in R3+). The armed sweep is the
empirical test of that; the DIAG bounds the death effect to zero
for final-state holds and rules out any hold→vDie target.

CODE-ORDER PROOF (why both control deaths are out of reach for ANY
morale-only lever): morale runs only at round ends with round >= 2,
and a mid-round death breaks before morale (vHp <= 0 → vDie → break).
A rounds=2 vDie therefore died during round 2, before the FIRST
morale check ever ran — no hold fired, none could be lifted. Both
control deaths are rounds=2. The paparazzo death is additionally
learn-intent, and the learn-flee branch needs round >= 3 — the
fighter had no flee opportunity at all before dying. That is a
separate blank (2-round pre-morale kills), NOT this arm — see
backlog items at the end.

## VERDICT: KILLED (inert on this band — no non-progressing-trick death exists to fix; do NOT merge, do NOT land)

PRIMARY misses by absence of target, exactly as the KILL CLAUSE
anticipated: other-class deaths 1 → 1 (same row both configs:
73674 d90 paparazzo diana_osei, rounds=2, pre-morale — unreachable
by any morale lever), belltoad engage-intent deaths 1 → 1 (same row:
73677 d38 liam_davis, rounds=2, dealt 8 — not a trick death at all),
guarded death sets identical, no new death class. The DIAG found
zero hold→vDie fights in the band (22 hold fights, all vFlee/mFlee).
Candidate 2's target — a death caused by morale holding a
non-progressing trick — does not occur on seeds 73671–73678.

The lever is not perfectly inert in implementation: exactly ONE lift
fired in the whole band (spool, seed 73671 d173 Dale Hoffman), and
it is a definition misfire, not a fix — see the spool finding
below. Its cascade moved one seed's trajectory (73671: total deaths
27 → 24, wave reach 4 → 3, finalPop 4 → 5) while every wall leg
stayed within guard. That cascade is noise from a misfire, not a
measured effect of the lever's purpose, and it is the reason the
verdict is KILLED (no target here) rather than a clean "no effect
whatsoever". Game code is REVERTED before commit (kill protocol) —
this branch carries measurement only.

- PRIMARY: other-class deaths 1 → 1. MISS by absence of target (KILL CLAUSE).
- G-bell: belltoad engage deaths 1 → 1 (identical row). PASS (no new death).
- G-set: other-class death set identical, no new death. PASS.
- G2: total villager deaths 200 → 197 (all of the delta is the
  73671 spool cascade; per-seed: 27→24 on 73671, all others
  identical). PASS (<= 202).
- G3: national-ever 7/8 → 7/8. PASS.
- G4: wins-excluded median 180 → 180. PASS.
- G-wave4: wave-4 reach 6/8 → 5/8 (73671's cascade). PASS (>= 5).
- G-cost: starvation/sickness rate 1.914 → 1.914 /100vd. PASS.
- G5: control DIAG census-matches all 8 seeds; armed DIAG
  census-matches all 8 armed seeds. PASS.

THE SPOOL FINDING (the one lift, and why the definition is not
landable as written): Dale Hoffman vs a spool, seed 73671 d173,
entry 49 HP. Control: 5 rounds, dealt 19, taken 26, fled at 23 HP.
Under the v1 definition the lift fired at end of round 2
(recording 2/3, 0 dealt, lead untouched) and Dale fled untouched at
49 HP. Under the corrected definition (spool recording excluded
while < 3) the lift fired at end of round 3 instead — recording
complete (3/3), still 0 dealt, still untouched — and Dale fled at
49 HP before ever striking. The spool's trick is a timed setup
(record 3, then replay, then strike); at the round-3 check the trick
is complete but unpaid, and the hopeless formula is degenerate at
0 damage taken (it divides by max(1, 0) and calls an unharmed
fighter hopeless). The "non-progressing" label therefore misfires
on exactly the trick whose progress is deferred past the check.
A future revisit of this definition must exclude spool entirely
(or require vTaken > 0 for the lift) — and, more importantly, must
find a band where a hold actually precedes a death before it can
pass PRIMARY anywhere. No fourth sweep was run to polish this:
the verdict does not depend on it (no death is at stake in any
spool lift), and sweeping until the corpus looks clean would be
tuning, not measurement.

## The change (REVERTED before commit — described here for the record, not landed)

src/js/fieldFights.js ONLY (final v3 form; 29 insertions + spool/
nielsen exclusion + outcome guard — never committed as game code):
- rec.leadHpEntry recorded at members build (fight-entry lead HP).
- Morale block: when hopeless + trickLog non-empty + HP > 25%, the
  hold is now conditional. Lift (hopeless stands, normal branch
  runs, narrating line logged) when trickLog >= 2 entries AND
  mDealt === 0 AND lead HP === leadHpEntry AND no termination
  counter advancing (redactorQuiet < 3, focusBore < 3, tosRead < 2,
  eulogyContradicts < 3, spool spRec < 3, nielsen niR > 10) AND
  rec.outcome unset. Otherwise the original hold line and
  suppression, byte-identical behavior.
- UNTOUCHED throughout: 2-shout cap, trickDisrupt (candidate 1),
  villagerTrickAction's trick offers, the >25% hold floor, and
  every other system. check.js --only fieldfight on the v3 tree:
  2 passed, 0 failed (informational — code reverted, not landed).

## Before/after numbers (identical seeds 73671–73678, 180d death-aware; final v3 armed corpus)

Per-seed corpus: evidence/2026-10-25/perseed-sim-belltoad-morale-a/
(s<seed>-control.json, s<seed>-armed.json). Proof:
`node scripts/test-belltoad-morale-a.js --analyze` (exit 1 ONLY on
the PRIMARY 1<1 line — the KILL signature; every guard passes).

| Metric | Control | Armed (v3) |
|---|---|---|
| PRIMARY: other 0-dealt multi-round deaths | 1 (73674 d90 paparazzo) | 1 (identical row) |
| Other 0-dealt multi-round rows | 15 | 18 (cascade rows, same 1 death) |
| Belltoad engage-intent deaths | 1 (73677 d38 liam, r=2, dealt 8) | 1 (identical row) |
| Total villager deaths | 200 (27, 23, 23, 16, 21, 29, 33, 28) | 197 (24, 23, 23, 16, 21, 29, 33, 28) |
| National-ever | 7/8 | 7/8 |
| Table invited / wins | 4/8 / 4/8 | 4/8 / 4/8 |
| Wave 4 / wave 5 | 6/8 / 0/8 | 5/8 / 0/8 |
| Median days / wins-excluded median | 135 / 180 | 135 / 180 |
| Starvation/sickness /100vd | 1.914 (20 events) | 1.914 (20 events) |

Per-seed days identical on all 8 seeds; 7/8 seeds' corpora
byte-identical. Only 73671 differs (the spool cascade from
d173 onward). First-armed-sweep note (v1, superseded): total deaths
193, wins 5/8, wave-4 6/8 — that run's divergence was the C1
post-outcome bug (terms mFlee rewritten as vFlee), fixed by the
outcome guard; its numbers are NOT the result of record. Second
sweep (v2, outcome guard, pre-spool-exclusion): total deaths 200,
all wall legs identical to control, 7/8 seeds byte-identical —
the v2→v3 change moved only the spool flee from round 2 to round 3.

## Reachability verdict

No reachability change. Waves 1–5, arcs, regional → national, the
table, the win flag: identical reach except 73671's wave-4 reach
lost to the spool cascade (6/8 → 5/8), which is trajectory noise
from a single early flee, not a lever effect on reachability. The
scale wall is untouched by this arm, as expected: candidate 2 is
a fight-morality lever, and it fixed no death here.

## Village assessment in plain words

On seven of eight seeds, the village is indistinguishable with or
without this lever — same days, same deaths, same wins, same
national reach. The village does not notice candidate 2 at all.
On the eighth seed, one villager (Dale) walks away from a spool
three rounds early, healthy and untouched, and the village's
later days reshuffle around that absence: a few deaths move days,
one wave-4 reach is lost, the pantry ends fuller. Nothing about
the village's life changes in a way anyone could call an
improvement or a harm — it is one early walk-away echoing through
a deterministic world. The two deaths the run was supposed to
address never belonged to this lever in the first place: both
villagers died in round 2, before the game ever asked whether
they should hold or run. A lever about holding cannot save someone
who never got to the decision.

Villagers acting like people: the hold fights that DO occur read
correctly — Chantal boring a focus_group to sleep over three
rounds ("recites bus schedules... counts ceiling tiles... describes
paint drying") while the log says she "holds the line — working
the trick, not the damage race" is a person committing to a plan
that works (the murmur leaves at 3/3). The one lift reads as a
person changing tactics in words, but the tactic judgment is
wrong in the world: Dale abandons a silence that was working
(the spool recorded him twice, hit him for nothing) because the
rule only sees "no damage, nothing moved". The sentence is human;
the decision is not yet wise.

## SENSE-TESTING LAW: the abandonment transcript (v2 lift; v3 differs only in round)

Seed 73671 d173, Dale Hoffman vs a spool, entry 49 HP, armed code
(v2 — lift at round 2; v3 lifts at round 3 with the same lines):

> "R1: the spool watches Dale — recording (1/3). It does not attack."
> "R1: Replay hits Dale for 0 (49 left)"
> "R1: Dale gives the spool nothing — waits, breathes, checks a strap. (Feeding it silence.)"
> "R2: the spool watches Dale — recording (2/3). It does not attack."
> "R2: Replay hits Dale for 0 (49 left)"
> "R2: Dale gives the spool nothing — waits, breathes, checks a strap. (Feeding it silence.)"
> "Dale sees the trick is getting nowhere — no damage, nothing moved — and stops working it."
> "Dale sees how this ends — and runs while running still works."
> Outcome: vFlee, 2 rounds (v2) / 3 rounds (v3), dealt 0, taken 0, 49 HP left.

Judgment: the LINES read as a person — "sees the trick is getting
nowhere... runs while running still works" is a believable change
of mind, not a mechanical flip. The DECISION does not read as a
person who was paying attention: the spool told him twice, in the
log itself, that it was recording (1/3, 2/3), and it hit him for
nothing. A fighter watching a machine record him, unharmed, is not
watching a trick fail — he is watching it work. The lift's
narration is honest about the damage race and blind to the
recording count. That blindness is the definition defect, stated
plainly: a future version of this rule must see progress counters
(spool recording, nielsen ratings) as progress, not just damage
and HP. Control's version of this fight (5 rounds, dealt 19, fled
at 23 HP after striking) is the fight the trick was building
toward — Dale was never in danger in either version, which is
also why this misfire costs nothing and proves nothing about
safety.

Contrast, hold correctly kept (control = armed, seed 73673 d74,
Chantal vs focus_group, 3 rounds, dealt 0, taken 39, mFlee):

> "R1: Chantal is deliberately boring — recites bus schedules. The eye-heads droop. (1/3)"
> "R2: Chantal is deliberately boring — counts ceiling tiles. A mouth-head yawns. (2/3)"
> "Chantal holds the line — working the trick, not the damage race."
> "R3: Chantal is deliberately boring — describes paint drying, in detail. The murmur thins. (3/3)"
> "R3: the murmur drifts off — nobody is watching. They LEAVE. (Bored out of the room.)"

The hold here is the trick working, round by round, to a payoff
the fighter can see coming (1/3 → 2/3 → 3/3). This is what the
counter exclusion protects, and it is why the exclusion list —
not the lift — is the load-bearing part of candidate 2.

## Metric review

- PRIMARY judged as pre-registered (1 → 0); the miss is reported
  literally (1 → 1) and the verdict follows the pre-registered
  KILL CLAUSE (guarded death sets identical + zero hold→vDie in
  DIAG), not a re-score. No metric was swapped to manufacture a
  pass: every guard is reported on its pre-registered wording
  except G-bell, whose corrected form (armed <= control, not
  "staying 0") was itself written into the pre-registration BEFORE
  arming, because the control is 1, not 0, on current master.
- The analyze script initially encoded the stale "staying 0"
  wording for G-bell and a gated control==0 check; both were
  corrected to the pre-registered forms before the verdict was
  read (the pre-registration text predates all armed sweeps and
  governs; the script was the bug, not the bar).
- G4 in the FIRST armed sweep missed by one day (143 < 144) on a
  composition artifact: the armed band had one more win, so the
  wins-excluded set shrank from 4 seeds to 3 and the median-of-n
  moved — per-seed non-win days were identical. That sweep was
  superseded by the C1 fix; the final sweep's G4 passes exactly
  (180 = 180). Recorded here so the artifact is visible, not
  because it gates anything now.
- Balanced panel (§15): not run as a panel compare, on the
  documented error class (balance-panel.js compare requires panel
  outputs, not recorder corpora; sixth-plus sighting). The
  identical-seed deathcensus corpus is the comparison of record.
- Open question for the NEXT candidate-2 revisit (not answered
  here): is there ANY band where a morale hold precedes a death?
  This band has none. A future arm should first run the DIAG
  hold-capture on its band and only implement if a hold→vDie
  fight exists — otherwise it will re-prove this kill.

## Side findings (documented, not chased — coordinator owns the backlog)

- Post-outcome morale: terms_of_service mFlee fights (r=2, mFlee set
  in the villager phase when tosRead hits 2) still carry a "holds
  the line" log line — the morale block runs at round end even
  after the trick already ended the fight. Log-only on current
  evidence (the outcome stays mFlee because the hold suppresses
  the overwrite); whether the monster phase also acts after a
  trick-set outcome is unproven here and left for a future DIAG.
  Not this arm: candidate 2 does not touch morale-block ordering.
  (C1 exists because this quirk interacts with any lift.)
- The old 1332Z other-class deaths (focus_group d125, eulogy
  d86/d87) do not exist on current trajectories — same movement
  class as the vanished belltoad pair. Nothing in this run re-scores
  them.
- Gavel confess repeatability unexamined: confess's gate does not
  check a fired flag, so it could repeat across rounds like the
  spool/nielsen cases; no gavel fight occurs in this band, so no
  lift behavior was observed. A future use of this definition
  should audit it before relying on the counter list.

## Files

- Proof + measurement: scripts/test-belltoad-morale-a.js (--sweep
  control|armed, --analyze, --diag with DIAGMODE=control|armed,
  --replay; --analyze exits 1 ONLY on the PRIMARY line)
- Evidence: this file (evidence/2026-10-25/sim-belltoad-morale-a.md)
- Corpus: evidence/2026-10-25/perseed-sim-belltoad-morale-a/
  (s73671–s73678 control + armed-v3, 16 files)
- Game code: NONE committed (KILLED — fieldFights.js reverted
  before commit; the v3 change is described above for the record)
- Sense replay logs (working copies, not committed):
  /tmp/belltoad-morale-diag.log (control DIAG),
  /tmp/belltoad-morale-armed-diag.log (v2 armed DIAG, Dale lift),
  /tmp/belltoad-morale-armed-sweep*.log (sweep logs)

## Side findings (documented, not chased)

- Post-outcome morale: terms_of_service mFlee fights (r=2, mFlee set
  in the villager phase when tosRead hits 2) still carry a "holds
  the line" log line — the morale block runs at round end even
  after the trick already ended the fight. Log-only on current
  evidence (the outcome stays mFlee because the hold suppresses
  the overwrite); whether the monster phase also acts after a
  trick-set outcome is unproven here and left for a future DIAG.
  Not this arm: candidate 2 does not touch morale-block ordering.
- The old 1332Z other-class deaths (focus_group d125, eulogy
  d86/d87) do not exist on current trajectories — same movement
  class as the vanished belltoad pair. Nothing in this run re-scores
  them.

## Files (to be filled)
