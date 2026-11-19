# sim-partysurvive-rerun-b — the launch-party survival-to-the-fight diagnostic, re-run on the launch-rich band

**Verdict: NO-GO, kind NO-PRE-FIGHT-DEATHS** — the judged leg ran
clean on the designated band (8/8 files, 0 instrument errors,
anchor `d00f66f0a` on all 8), but the pool the survey promised
did not survive the substrate change: **2 quad launches, 0
pre-fight deaths**. The survey measured 9 quads on this band
without ALLYSLOT3; under the full substrate (ALLYSLOT3 ported,
the 4th companion now actually fighting) the same seeds launch
9 targeted parties and only 2 of them are quads. Every launched
member who reached a meeting arrived alive (4/4), and the two
launched-member deaths in the leg both happened to the party
that never met its target on an expedition. There is nothing to
classify, so the frozen 0.90 bar cannot be met — and the
instrument proves it rather than guessing. The leg's real answer
is about the designation itself: a launch rate measured on the
survey substrate does not transfer to the full substrate, because
the trajectories diverge the moment a 4th ally fights.

- **Branch:** `sim-partysurvive-rerun-b` (base master `17bb496df`,
  batch ship bump 18:36Z; master had not moved at run end —
  `origin/master` still `17bb496df`, no rebase needed).
  Commits: prereg amendment `562593e89` (frozen 2026-11-19 18:35
  UTC, before any judged sim), port `d00f66f0a` (cherry-pick of
  `f4d1100ee`).
- **Prereg amendment:**
  `evidence/2026-11-19/sim-partysurvive-rerun-b-prereg.md`
  (frozen 18:35 UTC; re-uses the frozen
  `sim-partysurvive-b-prereg.md` with exactly two changes: the
  seed band and the descriptive damage secondary).
- **Analyzer:** `scripts/analyze-partysurvive-b.js`
  (`--selftest` 34/34); **proof test:**
  `scripts/test-partysurvive-b.js` 5/5 (§A green, §B green, §C
  green on the new substrate with the port); **port proof:**
  `scripts/test-allyslot3-b.js` **18/18** on this branch.
- **Corpus:** `evidence/2026-11-19/perseed-partysurvive-rerun-b/`
  (8 files, seeds 106081–106088, 150d, competent verbatim,
  substrate SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1 ALLYSLOT3=1, LAUNCHSURVIVE=1; driver exit 0,
  ~19 min for the leg).
  Analysis: `evidence/2026-11-19/partysurvive-rerun-b-analysis.json`.

**EVIDENCE-ONLY:** the ALLYSLOT3 slot code on this branch is a
coordinator-authorized substrate port (see §1). It must NEVER be
merged to master as a game change. This branch holds it only so
the diagnostic could run; the coordinator lands evidence-only or
releases the branch done-abandoned.

## 1. The port (coordinator-authorized, evidence-only) and the designation

- Cherry-picked `f4d1100ee` (partysurvive's own port of held
  sim-allyslot3-b `7efbf26a8` via sim-fightcap-b `5a5343363`)
  onto this branch as `d00f66f0a`. It applied cleanly — no
  conflicts (the comment-only conflict in `party-wiring.js`
  the fightcap evidence warned about did not recur against
  `17bb496df` either; the cherry-pick auto-merged all four
  files). Verified NOT an ancestor of master before picking
  (`git merge-base --is-ancestor f4d1100ee HEAD` = no).
- Port verification: `ALLYSLOT3` 12× in `fieldFights.js`, 3×
  in `game.js`, 3× in `party-wiring.js`; `ally3Vid` 31× in
  `fieldFights.js` — identical counts to the 1230Z port.
  `scripts/test-allyslot3-b.js` **18/18** on this branch.
- Prereg amendment frozen 18:35 UTC, before any judged sim:
  designated band 106081–106088 (launchfunnel-b: 17 launches,
  9 quads, 4 joined quad meetings per 8 seeds); same floors
  (≥6 quads, ≥3 pre-fight deaths), same 0.90 bar, same 150d
  horizon, competent verbatim; policy sha
  `729af71ccdddff5abf7e8aad555fe820cb2355d6eb9a6ed866e5ac15e94806fd`
  (matches launchfunnel-b's recorded sha — the policy has not
  moved since the survey); new descriptive secondary
  damage-per-launched-meeting (never judged).
- Seed-band freshness: grepped all
  `evidence/*/sim-*-prereg.md` for `10608[1-8]` — the only hit
  is `sim-launchfunnel-b-prereg.md` itself (the designating
  survey, which verified zero prior uses before freezing). The
  band is fresh for re-use AS DESIGNATED.

## 2. Judged numbers (frozen bars)

| Bar | Result |
| --- | --- |
| Pool floor (≥6 quad launches AND ≥3 pre-fight deaths) | **FAIL** — 2 launches, 0 pre-fight deaths, 8 members tracked |
| Classification completeness (≥0.90 classified, top cause named) | **FAIL** — 0/0 = n/a, top cause none (0) |
| Survival curve (share alive at meeting + median days launch→death) | **FAIL** — share alive at meeting 1.000 (4/4); median days launch→death null (no deaths); alive +7d 0.875, +21d 0.500 |
| Instrument (0 errors, 8/8 files, cross-check agrees) | **PASS** — 0 errors, 8/8 files, death-day cross-check 4/4 agree, 0 disagree, 0 unchecked, 0 early-vanish |

Per-seed table (quads / members / meetings joined / alive at
meeting / pre-fight deaths / died in meeting / died no-meeting /
survived no-meeting / launchTrack rows):

| Seed | Quads | Members | Meetings | Alive | Pre-fight | In-meeting | No-meeting deaths | Survived no-meeting | Track rows |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 106081 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 8 |
| 106082 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 106083 | 1 | 4 | 0 | 0 | 0 | 0 | 2 | 2 | 152 |
| 106084 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 82 |
| 106085 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| 106086 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 106087 | 1 | 4 | 4 | 4 | 0 | 0 | 0 | 0 | 101 |
| 106088 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 137 |
| **Total** | **2** | **8** | **4** | **4** | **0** | **0** | **2** | **2** | **481** |

The two launched-member deaths in the leg are both
`died-in-window-no-meeting` deaths, NOT in the judged
denominator — both on seed 106083, pavel_dubinin's quad, which
never met its target on an expedition (see §7 for the story):
**pavel_dubinin** (holder) — launched d88 (Reunion), died d95
(+7d), cause `monster` / field-fight / linked-v4, The Algorithm
(wave 4), in an aid fight; **gen_7zfpp4e** (companion) — launched
d88, died d98 (+10d), cause `the wild`, after fighting the same
three wave-4 fights as pavel and surviving them.

By-cause / by-monster tables are empty (no pre-fight deaths).
Holder vs companion split: 0 / 0. Same-day flags: 0.
No-meeting by-cause: field-fight 1, the-wild 1.

## 3. The designation did not transfer — survey vs re-run on identical seeds

Same seeds, same policy file (sha `729af71ccddd`), same flags
except ALLYSLOT3 — and the launch rate collapses. Counted with
the survey's own definition (a `v4departs` row with
`result: 'launch'` and `targetWave >= 4`; null-target rows
excluded — the raw row count is 150, nearly all untargeted
pairs, which is NOT the survey's count):

| | Survey (no ALLYSLOT3) | Re-run (ALLYSLOT3 ported) |
| --- | --- | --- |
| Targeted wave-4+ launches | 17 | **9** |
| Quad launches | 9 | **2** |
| Trio launches | 8 | 7 |
| 106083 | 10 launches, 6 quads | 4 launches, 1 quad |
| 106084 | 5 launches, 2 quads | 3 launches, 0 quads |
| 106087 | 1 launch, 1 quad | 1 launch, 1 quad (SAME launch) |
| 106088 | 1 launch, 0 quads | 1 launch, 0 quads (SAME launch) |
| 106081 / 106082 / 106085 / 106086 | 0 | 0 |

The trajectories start byte-identical — the first two launch
rows on 106083 (d28 somchai, d31 gen_jbvwr8m) are identical in
both corpora — and diverge once a 4th ally fights: a quad
fight's outcome changes under ALLYSLOT3, deaths change, party
composition changes, and the launches that followed on the
survey's trajectory never happen on this one. The two launches
that DO reproduce exactly (106087 nina→eulogy d116, 106088
fatima→eater d68) are the ones whose villages had no quad
fight before them to diverge on. The survey's designation is
valid for launch rate ON THE SURVEY SUBSTRATE; it is not a
property of the seeds. A re-run that needs launched quads must
either survey under the full substrate or accept that the
designated band is a starting point, not a guarantee — the
prereg amendment's band-risk note said exactly this, and the
evidence confirms it. Filed as finding #2616 (see §10).

Cross-check: the fightcap sense-miss instrument run on THIS
corpus reads the same nothing — meetings 3, sense-full 2,
**Dead 0**, expedition-ended 2. Two independent instruments
agree: no launched companion died before a meeting on this
band. (The `ok: false` on that run is expected:
`reproduceFightcap` checks against the frozen reference table
Dead 10 — it is a reproduction check for the reference corpus,
not a fresh-band expectation.)

## 4. Damage-per-launched-meeting (NEW secondary, descriptive, never judged)

`scripts/damage-per-launched-meeting-b.js` (new for this arm):
for each quad launch's FIRST joined meeting (CORRECTED join),
the meeting row's `mDealt` (total damage the fighting party
dealt in that fight). Output:
`evidence/2026-11-19/partysurvive-rerun-b-damage.json`.

| Meeting | Rounds | mDealt | Outcome | ally3Dealt |
| --- | --- | --- | --- | --- |
| 106087, nina_petrova → eulogy, d116 vs **suburb** | 12 | **673** | vFlee | 77 (nina herself, as 3rd ally) |

**n = 1. Mean 673, median 673, 0 zero-damage meetings.**
Read with the meeting named beside it: the one joined meeting
in the whole leg was NOT against the launch's target. Nina
launched against the Eulogy and her first joined meeting was a
fight Hannah was already in against the Suburb, where Nina
answered the third shout as the 3rd ally and dealt 77 of the
673. The survey's nina instance dealt 0 damage across four
eulogy meetings; under the full substrate the counted meeting
is a different fight entirely, and it dealt real damage. The
secondary measures what the CORRECTED join counts, not what
the launch targeted — on n=1 that distinction IS the result.
Do not cite "673 damage per launched meeting" without the
n=1 and the suburb, not eulogy, beside it.

## 5. Wall numbers (designated band, judged leg)

| | Re-run (judged) | Survey wall, same band | 1230Z fresh band |
| --- | --- | --- | --- |
| Wins | 0/8 | 0/8 | 0/8 |
| National | 0/8 | 0/8 | 0/8 |
| Table | 0/8 | 0/8 | 0/8 |
| Wave 5 reached | **4/8** | 4/8 | 0/8 |
| Wave 4 reached | 8/8 | 8/8 | 8/8 |
| Standing ≥200 | 4/8 | 4/8 | 0/8 |
| Survived 150d | 3/8 | 4/8 | 3/8 |
| Median survival | **141d** (end days; wall gameDays median 140.5d) | 143d | 132.5d |

Per-seed (days / end / maxWave / standing / rank): 106081 89
village-lost / 5 / 360 / regional; 106082 90 village-lost / 4 /
199 / regional; 106083 138 village-lost / 5 / 475 / regional;
106084 125 village-lost / 4 / 199 / regional; 106085 150
survived / 5 / 360 / regional; 106086 150 survived / 4 / 199 /
regional; 106087 144 village-lost / 4 / 199 / regional; 106088
150 survived / 5 / 445 / regional.

The wall is stable across the substrate change on the same
seeds: wave 5 4/8, standing ≥200 4/8, and the median within 2
days of the survey's. The one flip is seed 106087: survived
150d in the survey, lost d144 here (nina's village — see §7).
**Standing 199 on four of eight seeds** (106082, 106084,
106086, 106087) — the 199 stall is the visible ceiling again.
No village reaches national, no seat, no win.

Band-wide villager death causes (85 villager deaths, all causes
across all eight seeds — context, not the judged denominator):
`monster` 28 (33%), `the wild` 25 (29%), `a stranger` 4,
`the arena` 4, thirst 4, starvation 3, contest 3, sickness 2,
`the expedition` 1, The Reunion 1, Big Big 1, Big-Eyes 1.
`the wild` is down from 48% on the 1230Z band but still nearly
a third of all deaths, and the generic `monster` (28) still
leads it — the unstoried classes still dominate the death
ledger.

## 6. Village assessment, in plain words

Eight villages, same seeds the survey watched launch
seventeen times — and under the full rules they launch nine,
only two as fours. It is not that the parties die on the road:
the one quad that met its monster arrived as four, and the
other quad's members fought three wave-4 fights in a week
and killed one of them. It is that adding the fourth fighter
to the fight changes the fight, which changes who lives, which
changes who launches next — the launch rate is not a property
of the seeds, it is a property of the trajectory, and the
trajectory moves when the fight does. Two villages launch at
all in the re-run; six never launch a targeted party, four of
them never launch anything targeted while still reaching wave 4
or 5 and standing 199 or better. The villages that do launch
fight for real — a herald killed in eleven rounds, a suburb
fought for twelve rounds and 673 damage, a fifteen-round
suburb fight for 910 damage on a seed that never launched —
but the launched kills the survey found on other bands do not
reproduce here, and no village on this band wins, reaches
national, or takes a seat. The binding picture is unchanged
from the 1230Z leg, one level up: the pool is thin because the
launch itself is trajectory-fragile, and the standing bar sits
one point out of reach on half the band while the villages
wait.

## 7. Sense-test: three member stories read in the transcripts

**Nina's third shout (seed 106087, d116 — the slot firing in
the wild, and the leg's only joined meeting).** Hannah walks
straight into The Suburb. She strikes for 26, takes Property
Tax and HOA Fines, binds her own wound for +20 HP — and
shouts. Oluwaseyi charges in on the first shout, Brian on the
second, and on the third: "Hannah is still losing — shouts a
third time! Nina charges in!" Nina — the launched holder,
whose own launch that same day targeted the Eulogy — deals 77
damage as the third ally in a twelve-round, 673-damage fight
that ends in a flee at 30% HP. The ALLYSLOT3 seat works
exactly as ported, in a fight the launch never named. The
gate row on that fight reads null, plan target focus_group,
trick unknown — the party fought blind and still dealt the
leg's only real damage.

**Nina's death (seed 106087, d116→d130 — the launch's ending,
fourteen days out).** Nina had already fought the Eulogy three
times before launching (d105, d106 twice, d110 — fled every
time, 128/21/0/0 damage). After the suburb fight she meets the
Eulogy three more times (d129, d130 twice — 0 damage in all
three), and in the last one she dies in round 1: "Nina
contradicts the narration — it says Nina runs — Nina
advances. ... Final Chapter hits Nina for 12 (0 left)." She
used the Eulogy's own trick — contradicting the narration —
and died using it, walking in with 12 HP or less. The survey
had her dying d124; here she dies d130, same shape, same
monster, six days later. The holder died to the monster she
launched against, in a fight the instrument does not count as
a meeting (it is past the first joined meeting). Hannah Kim —
the scholar by d136 — dies the same way stories end here, in
a contest.

**Pavel's week (seed 106083, d88→d95 — the launch that fought
everything and "never met").** Pavel launches d88 as a quad
against the Reunion — three killers, three armed. Day 89 he
evades an Eater on expedition (no contact). Day 94 he kills a
Herald in eleven rounds (529 damage, with Aria and
gen_7zfpp4e beside him) and then fights his actual target,
the Reunion, for three rounds and flees (95 damage). Day 95
he answers an aid call against the Algorithm and dies in
round 1: "Pavel's gear absorbs 41. R1: Engagement hits Pavel
for 12 (0 left)." He walked into that last fight with 12 HP
or less, after two fights the day before. Gen_7zfpp4e fought
all three fights with him, survived them, and died d98 to
`the wild` — no fight row, no wound, no monster named. The
frozen join calls this launch "never met" because none of
the three fights was expedition-origin (world-tick, world-tick,
aid) — the party met its target and killed another wave-4
monster, and the instrument's expedition filter does not see
either. See metric review §9.3: the "never met" label means
"never met on an expedition," and on this leg that label
hides the most fighting any launched party did.

**Fatima's long window (seed 106088, d68 — the launch that
never met, same as the survey).** Fatima launches d68 as a
trio against the Eater and never meets it in the window — the
same as the survey found. But she fights all run: Audit d67
(266 damage), Eater d67 (93), Audit d75, an Editor (wave 5)
d80, and a fifteen-round Suburb fight d115 for **910 damage**
— the biggest single-fight damage in the corpus, by a
villager who never launched a targeted party that met. The
damage wall is not a launched-party wall: the village can
deal 910 damage in a fight and still never kill its launched
target, because the launch and the fighting are different
populations.

## 8. Panel and telemetry (both refused, verbatim)

**Balanced panel** — the builder
(`scripts/build-partysurvive-b-panels.js`) was parametrized
for this re-run: after-seeds / after-run / after-origin are
now argv-overridable, defaults preserving the frozen 1230Z
behavior. Regression check: rebuilding with defaults
reproduces the 1230Z panels byte-identical (before and after).
Re-run panels built
(`partysurvive-rerun-b-panel-before.json.gz`,
`partysurvive-rerun-b-panel-after.json.gz`); the compare
refuses the unpaired comparison, exactly as the prereg
anticipated:

```
# Balanced campaign comparison

**Decision: invalid**

- Unmatched seeds
- Unmatched origin
- Unmatched cases

Invalid comparisons must be repaired before interpretation.
```

Recorded verbatim; wall numbers are reported directly in §5
instead.

**Telemetry deviation check** — refused the recorder corpus,
as the 1230Z leg's did:

```
telemetry-check: refusing recorder-corpus input: all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs. Recorder corpora are compared with sweep-compare tables, never against a run baseline here. Pass --allow-recorder-corpus for a same-shape recorder-vs-recorder compare, or --update-baseline to reseed a baseline from these files.
```

Recorded verbatim; no LOUD lines, no deviation to investigate.

## 9. Metric review

1. **The designation is not a property of the seeds.** The
   frozen ranking picked band 106081–106088 on 17 launches / 9
   quads measured without ALLYSLOT3. Under the full substrate
   the same seeds deliver 9 / 2. The pool floor (6 launches, 3
   deaths) was priced from the reference band's measured rate
   and the survey's designation; both were measured on a
   different substrate than the judged leg. A future survey
   that designates a band for a re-run should survey under the
   re-run's full substrate (port included), or the re-run's
   prereg should price its floor from the substrate it will
   actually run on. As frozen, the verdict is the honest one:
   NO-GO, kind NO-PRE-FIGHT-DEATHS. Filed as finding #2616.
2. **The +7d/+21d shares do not censor at the meeting day,
   though the prereg says they do** (carried from the 1230Z
   metric review §9.2). Nina died d130, fourteen days after
   her d116 launch but fourteen days AFTER the meeting she
   walked out of; Hannah died d136, twenty days after launch
   — both count as "not alive at +21d". The reported 0.875 /
   0.500 read as "alive N days after launch", post-meeting
   deaths included, not "survived the road N days". Not
   re-scored here (metric binding).
3. **"Never met" means "never met on an expedition" — and on
   this leg that hides the most fighting.** `firstMeeting`
   filters `origin === 'expedition'`. Pavel's launch fought
   its target (Reunion, d94, world-tick) and killed a Herald
   (d94, world-tick) and died answering an aid call (d95) —
   three wave-4 fights in the window, zero counted meetings.
   The frozen definition is doing what fightcap-b defined it
   to do, and the 1230Z leg's meetings were expedition-origin
   too, so this is not a regression — but a diagnostic whose
   denominator is "launches with an expedition meeting" will
   keep missing launched parties whose fights happen in the
   wild. A future instrument could count world-tick and aid
   fights as meetings (with the target==mid rule still
   dropped), or report an "any-origin meeting" count beside
   the frozen one. Not re-scored here (metric binding).
4. **The damage secondary's n=1 is a join artifact, not a
   party-damage measurement.** The one counted meeting is a
   suburb fight the launch never targeted, joined as the 3rd
   ally. The survey's nina instance (0 damage across four
   eulogy meetings) and this leg's nina instance (673 in one
   suburb meeting) are both true of the same launch shape —
   they measure different fights. The secondary is descriptive
   and was never judged; on n=1 it describes the join, not
   the damage wall. A future run that wants damage-per-launch
   should define the meeting as "first fight against the
   launch target, any origin" and report that beside the
   frozen join.
5. **The 0.90 bar on a thin pool is moot at n=0** — the
   reference-band note from the first worker stands: on n≈3
   the bar effectively requires classifying all of them. Here
   there was nothing to classify at all, which the judge kind
   names directly.
6. **Same-day launch deaths need a closer look** (carried
   from the first worker): the reference-band pre-fight deaths
   happened on launch day. This leg adds the mirror image:
   both no-meeting deaths walked into their final fight with
   ≤12 HP — the deaths land on already-wounded members, and
   the analyzer cannot tell from the death row alone how
   wounded a member was at launch. A future instrument could
   record holder/member HP at launch from `v4launchTrack`.

## 10. Blanks and findings notes for the coordinator

- **JUDGED VERDICT: NO-GO, kind NO-PRE-FIGHT-DEATHS** — 2 quad
  launches, 0 pre-fight deaths on the designated band;
  instrument green. The question "what kills launched parties
  before the fight" has no answer on this band because nothing
  died before a fight. The reference-band answer (unjudged)
  stands as the only decomposition: 3 deaths, field-fight 2,
  wounds 1, median 0 days.
- **Designation non-transfer (finding #2616, filed in
  `sim-findings.md`):** a survey-designated band's launch rate
  does not reproduce under the full substrate — 17→9 targeted
  launches, 9→2 quads, same seeds, same policy, the only
  change ALLYSLOT3 ported. Future surveys that designate a
  band for a re-run should survey under the re-run's full
  substrate (port included).
- **Standing-199 stall, 4/8 seeds.** Four villages sat at 199,
  one point short of the 200 release bar. Same stall the
  program has seen before; still the visible ceiling on this
  band.
- **Wave 5 opened on 4/8** (same as the survey's wall for this
  band), vs 0/8 on the 1230Z fresh band. Band + substrate,
  not a regression claim — but the wall numbers move a lot
  between bands, and any wall claim needs the band named
  beside it.
- **Out-of-scope gap (note only):** `the wild` is 29% of all
  villager deaths on this band (25/85) and the generic
  `monster` 33% (28/85) — the unstoried classes still dominate
  the death ledger, and the leg's second no-meeting death is
  an unstoried one (gen_7zfpp4e, d98, `the wild`). Same note
  as finding #2607; no new mechanism claimed here.
- **Instrument note:** the panel builder is now
  parametrized (after-seeds / after-run / after-origin argv
  flags, defaults preserving 1230Z behavior; regression check
  byte-identical). The builder fix is a tooling change, not a
  game change.
- **Instrument note:** `firstMeeting` counts expedition-origin
  fights only — pavel's launch fought its target and killed a
  Herald in world-tick fights that the frozen join does not
  see (§9.3). Do not read "never met" as "never fought".
- **Panel / telemetry:** both refused, verbatim in §8. No LOUD
  lines.
- **No `check.js` gate was run** — the port is evidence-only
  substrate, never to be merged; the proof tests
  (`test-partysurvive-b.js` 5/5, `test-allyslot3-b.js` 18/18)
  are the gate for this arm. The ported lever must NEVER be
  merged to master as a game change.
- **Safe-commit index clobber struck once** on this branch
  (after the prereg-amendment commit `562593e89` — the file
  showed staged-deleted + untracked; commit itself correct).
  Repaired with the documented `git ls-tree -r HEAD --
  <paths> | git update-index --add --index-info` pipe;
  verified by `git status` empty + `git diff HEAD` empty +
  hash-object == HEAD blob.
- **Write flap:** no EPERM observed during this run (all
  writes verified by size/readback; driver leg ~19 min, 8/8
  files intact).
