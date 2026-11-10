# Journey scale — r127: scholar-counts ladder-band proof (Lane A leg 3)

Run: `laneA-20261110T1045CST` · 2026-11-10 from ~16:46 UTC · base `fe45ff679`
(local master; origin/master diverged, see LOUD items) · worktree `journey-scale`.
Prereg: `journey-scale-r127-prereg.md` (binding; full text committed as
`a36679efa`). Driver: `scripts/journey-scale-r127-20261110.js` (r126 clone +
scholarcount census; committed as `8f9787292`).

**Adoption note (this closeout):** the 10:45 run TIMED OUT at the 2h limit
with the band + control corpora on disk and no run note written. Its
coordinator was dead (no live playtest/fleshout processes, hbloop PID 30989
not running, no processes in the tree; the 18:33:55Z registry heartbeat was a
provably orphan heartbeat). The main session verified that state and handed
the closeout to this adoption. The run's /tmp logs
(`scholarcount-gate-r127.log`, `scholarcount-gate2-r127.log`,
`r127-pilot-97902.log`, `r127-band.log`, `r127-control-band.log`) were swept
with /tmp and are NOT recoverable — the verdicts below are re-derived from
the on-disk evidence dirs, not from the timeout report's claims. The pilot's
substance is recoverable: seed 97902 ran first with no pilot-gate stop
(census rows present, 0 instrument errors, teleOnly 0), and the full band +
control then completed.

**What this run proves:** the landed scholar-counts fix (Steve RULED
2026-11-10: the scholar counts toward the living-veteran bar;
`_ladderLivingVeterans` counts the living scholar, `payable` counts
non-scholar veterans, delivery still pays 2 non-scholar veterans and refuses
honestly with scholar+1 — landed as `fe45ff679`) on the matched ladder band
97901–97904, before/after on identical seeds. No src/js changes in this leg.
No new fix was built on this band.

## Q1 — TRIBUTE FLIP (primary): GO

Seed 97902 flips exactly as predicted. The tribute reads ready on new
(scholar-counting) rules for **13 days, d108–d120**, with legacy (payable)
not-ready the whole window:

| seed | new ready days | legacy ready days | peak new / legacy | scholar-veteran days |
|---|---|---|---|---|
| 97901 | 0 | 0 | 1 / 0 | 7 |
| **97902** | **13 (d108–d120)** | **0** | **2 / 1** | **26** |
| 97903 | 0 | 0 | 1 / 0 | 33 |
| 97904 | 0 | 0 | 1 / 0 | 49 |
| **pooled** | **13** | **0** | — | **115** |

On every flip day the pair stands simultaneously: `new=2 legacy=1
payable=1 trib=ready delivered=-` — the scholar plus one living villager,
both living on the ready day. Delivery is honestly refused throughout
(`delivered=-`): delivery still needs 2 payable veterans, and the pair is
scholar+1. Per the prereg, the refusal is recorded, not counted against
the flip. **Q1 GO by the bar as written (≥1 seed ever-ready NEW with
legacy not-ready, the pair standing simultaneously).**

The other three seeds never read tribute-ready under either rule. 97904
delivered a different capstone instead: `trade_charter` delivered d114
(`everDelivered trade_charter`, firstReadyDay 114), after which its
scholarcount rows read `trib=delivered, payable=-`. Note for future
readers: from d115 the 97904 ladder rows display all three capstones as
`delivered` (`caps: trade_charter=delivered,feast_embassy=delivered,
military_tribute=delivered` with `vets=- charterLinks=- bundle=-`) — that
is the ladder instrument blanking the per-deed blockers once any capstone
is delivered, not three deliveries. The scholarcount JSON is the
authoritative per-deed record: tribute never ready, feast embassy never
ready on 97904.

## Q2 — TRAJECTORY IDENTITY (guardrail): NO-GO as written; the fix itself is proven trajectory-neutral

The prereg's Q2 bar as written demands the band match Arm A (r123/r126)
bit-for-bit: lived 488, deaths 73, cures 56, end days [103,121,131,133].
The band reads:

| | lived days | person deaths | cures | end days |
|---|---|---|---|---|
| Arm A (r123/r126) | 488 | 73 | 56 | [103,121,131,133] |
| **r127 band** | **554** | **72** | **64** | **[109,136,129,180]** |
| r127 control (r126 driver, new base) | 554 | 72 | 64 | [109,136,129,180] |

**Q2 is NO-GO as written — the band does not match Arm A.** The cause is
the base move, not the fix: between Arm A's base `a6ed956f5` and this run's
base `fe45ff679`, 20+ landings moved the game under the panel (vetcount
reconciliation, tendexact, choketrace, proofrefresh, the r125 deepening
conversation fix, the answermail-drive hook, scholardrain instruments, and
the scholarcount fix itself). The control re-run — the r126 driver run on
the NEW base — reproduces the band **exactly**: ladder files 0 diff lines
after label normalization; deathcensus summaries identical seed by seed
(rows 554, deaths 72, teleOnly 0, fallenOnly 0, books close 4/4,
unattributed 0); trust.json census identical except stack-trace paths and
transcript file paths; capture "cured them" counts identical (12/23/17/12).
Every differing file between the two dirs is label/path noise (driver
filename + line number in stack traces, evidence-dir paths) except the
scholarcount instrument itself, which exists only in the band dir.

So the guardrail's *intent* — the scholar-counts fix changes no
trajectory number, because it is a pure read for sim trajectories — is
proven by band == control. The bar *as written* fails because the prereg
was written against a stale base: it named Arm A's frozen numbers as the
comparator instead of a same-base control re-run. **Do not re-score.**
The run did the right thing by running the control; the prereg's Q2 text
is what needs the revision (see Metric review).

The base move changed one village's fate outright: 97904 died d133 on Arm
A and now lives to the d180 cap with 8 villagers alive. The other three
end days moved +6/+15/−2. The survival-collapse attribution arm owns the
deeper why; this run only establishes that the move, not the fix, moved
them.

## Q3 — MECHANISM

| | cures | fever deaths | wound deaths | field-fight deaths | contest deaths | stranger |
|---|---|---|---|---|---|---|
| Arm A | 56 | 1 | 1 | 68 | 3 | 0 |
| **r127 band** | **64** | **1** | **1** | **62** | **7** | **1** |

Buckets use r126's mapping (field-fight = wild + monster + Gavel + night
+ ambush; contest = contest + arena; fever = sickness; wound = "a wound
that wouldn't close"). Per seed: 97901 field-fight 16 / contest 1 / wound
1 / stranger 1 (19 deaths); 97902 field-fight 17 / contest 1 (18);
97903 field-fight 17 / contest 2 (19); 97904 field-fight 12 / contest 3 /
fever 1 (16). Cures counted as "cured them" lines in the capture files —
the method verified against r126's published 7/22/24/3 = 56; r127 reads
12/23/17/12 = 64, band == control.

Veteran-days (scholarcount daily rows, JSON daily sums agree): **new 150
vs legacy 35** pooled (97901 7/0, 97902 61/35, 97903 33/0, 97904 49/0);
scholar-attributable days (new − legacy) **115**. Ready-days pooled:
**new 13, legacy 0**. Deliverable-pair windows (legacy ≥2): **0** — legacy
never reaches 2 on any seed (peak legacy 1, only 97902). The binding
constraint on this band is still two living veterans at once, not who
counts — the fix opens a 13-day ready window on one seed and the delivery
bar (2 payable) still stands between it and a delivered tribute.

One wild confirmation of the r126 fix: 97901 staged **1 alien-bucket
death** (fallen cause 'a stranger', telemetry cause 'alien'), and the two
records agree (teleOnly 0, fallenOnly 0). r126's band staged 0 alien
kills, so its firing was proven only by unit test; here it fired in the
wild and reconciled.

## Q4 — PEOPLE CHECK: clean; both carried defects reproduced

Read in full: d90 transcripts ×3 (97901, 97902, 97903 — 97904's d90 is
present too, 4 total d90 + 3 d120 = 7 transcripts) and raise talks ×8
(97902 ×4, 97903 ×3, 97904 ×1). Senseless count in the d90/d120
transcripts: **0 — clean.**

- The conversations have meaning: a real water favor with a concrete plan
  (Emma 97903 d90: "6 liters, 8 people… We walk together and each carry
  two liters back. Creek water still needs boiling." — "Dawn, then. Bring
  something to carry"); grief that resolves into talk (Brian 97901 d90;
  Rowan 97904 d90); a nonverbal Portuguese sitting that works entirely
  through gesture and caught words (Ines 97903 d120); an honest
  away-from-Haven answer (Morgan 97904 d120: "I'm away from Haven, out on
  the road. I can't promise a dawn meet while I'm out").
- Duc's secret (97902 d90: stole from someone who trusted him) goes
  unfired because the bot accepts the betrayal-framed choice and then
  leaves — a player choice, not an NPC defect; the secret stays planted
  (same shape as r126's Yara note).
- **DEFECT (carried, reproduced): Baraka unvoiced raise ×3 in 3 days**
  (97902 d10–d12, French-only speaker, outcome not-offered every time —
  the raise is never voiced, only nonverbal mime). r126 saw ×6 in 7 days
  (d10–d16); here the raise cycle ends after Tashi's d13 acceptance, so
  the count is 3 in the band's own record. (The control dir briefly
  appeared to hold Baraka d14–d16 files — those five files are stale
  r126-original leftovers, byte-identical to the committed r126 corpus;
  see Evidence hygiene below. They are NOT control events and were
  removed from the control dir.)
- **DEFECT (carried, reproduced): trap-line invitation swallowed by the
  raise-answer template** — Stella 97904 d24 ("Walk my trap line with me?
  Extra hands, extra eyes.") is answered with "All right. Let's ask
  them… carry the proposal to Stonebridge," and Nathan 97903 d102 repeats
  the same shape. The invitation never gets its own answer.
- New observation (filed, not this run's to build): Morgan 97904 d120
  repeats her bond ask verbatim after an "I'm listening" ("Can I ask you
  something? … I want us to stick together. Properly." twice in one
  sitting). The 'goon' filler ("Take your time") lands flat once after a
  complete beat on two sittings (Brian 97901 d90, Rowan 97904 d90) — the
  same pattern r125/r126 noted, carried. Raj 97902 d120 opens a calm-talk
  ("Somebody has to be the calm one") with betrayal:accept/decline as the
  only turn-0 choices — the menu framing fits a betrayal scene, not the
  talk that follows; the sitting itself reads fine.

## Q5 — CENSUS

| seed | lived | alive at end | deaths | cures | stage 2 / 3 | lesser priced | national | full seat |
|---|---|---|---|---|---|---|---|---|
| 97901 | d109 | 0 | 19 | 12 | d20 / d29 | d47 | never | no |
| 97902 | d136 | 0 | 18 | 23 | d20 / d31 | d37 | never | no |
| 97903 | d129 | 0 | 19 | 17 | d14 / d29 | d36 | never | no |
| 97904 | d180 (cap) | **8** | 16 | 12 | d24 / d39 | d46 | never | no |

- **97901:** died d109, nobody left. Stage 3 d29 (peak), lesser priced
  d47, ended stage 2. Deaths are wild kills (12 wild + 4 monster) plus
  the 1 alien 'a stranger' death, 1 wound, 1 contest.
- **97902:** died d136, nobody left. The flip seed (see Q1). 23 cures —
  the most-doctored village on the band. 1 guest death (teleOutOfScope 1;
  the Bing guest-death question still needs its own prereg).
- **97903:** died d129, nobody left. Explore-heavy to the end (explore 53
  counted at death). 17 cures.
- **97904:** **alive at the d180 cap with 8 villagers — the band's only
  survivor.** Stage 3 d39, lesser priced d46, trade_charter delivered
  d114, lesser seat taken, rank global. On Arm A this seed died d133;
  on the new base it survives to the cap.
- Books close on all four seeds; unattributed 0; teleOnly 0; fallenOnly 0.
  **Multi-death days: none on any seed** — where r126's band piled up
  (d64×3, d121×4, d130×4+d131×4, d131×4+d133×3), these villages die one
  at a time. National never fired on any seed; full seat 0/4; lesser seat
  priced 4/4 (d36–d47).

Plain words: the scholar-counts ruling works exactly as ruled — one
village that was one veteran short now reads ready for thirteen days,
with the scholar standing beside the one living villager. But ready is
not delivered: the delivery still wants two villagers who can pay, and
this band never has two at once. Three villages still die in the wild
before day 140; the fourth lives to the cap and takes the lesser seat
through a trade charter, not a tribute. The wall moved one rung on the
readiness read and not at all on delivery.

## Telemetry check

`telemetry-check.js` vs `scale.json` baseline, metrics fightsTotal,
fightsByWave.4, maxGameDay: **1 LOUD line** — fightsByWave.4 −64%
(baseline 289 → current 104). fightsTotal (181) and maxGameDay read
quiet. **Verdict: EXPLAINED, not a bug. Baseline NOT rolled forward.**
The baseline (446/289/646) is a longer-lived band's aggregate (646 lived
days — the r113 regime); this leg's matched band lives 554 days and
fights proportionally less (r126's band read 166/93 against the same
baseline). The LOUD is the known baseline-regime mismatch, not a game
change. Owed: the `scale.json` baseline needs a regime re-label (it is
not this leg's regime), not a silent roll.

## check.js

No `check.js` gate was run in this leg: the scale leg touches no src/js
(the branch is prereg + driver only — `git diff fe45ff679..HEAD -- src/`
empty), and the prereg gates on src/js changes only. The scholar-counts
fix this run proves was itself gated at adoption (296/4 standing, in the
fe45ff679 adoption note). The r171 adoption landed on master mid-closeout
(`4717ed481`, probe-side only, zero src/js); this branch was rebased onto
it before merging (see below) and the scholarcount proof suite was
re-run green after the rebase (test-scholarcount-a.js 16/16).

**The 1415Z 17-failure gate attribution is NOT answered by this run.**
This run ran no check.js gate, and none of its gates (pilot, band,
control) is the 1415Z post-merge gate. It stays owed — stated plainly,
not buried.

## Evidence hygiene (found at adoption, fixed)

The control dir (`journey-scale-r127-control/`) was pre-populated with a
copy of the committed r126 corpus, and the control pass overwrote only
the files it writes. Five raise-talk files (97902-5..9, Baraka d14–d16 +
Tashi d26/d84) survived from the r126 originals — verified byte-identical
to the committed `journey-scale-r126/` corpus — while the control pass's
own record (trust.json census) lists 4 raise talks on 97902. Those five
files describe events that did not happen in the control re-run and were
**deleted from the control dir** at adoption (the originals remain
committed under `journey-scale-r126/`). After the deletion the two dirs
reconcile exactly: every file identical modulo instrument labels, except
the scholarcount instrument (band only).

## Metric review

1. **Q2's bit-identity bar must name a same-base control as its
   comparator.** The prereg froze Arm A's numbers (488/73/56) as the bar,
   but the base moved 20+ landings between Arm A and this run, so the bar
   failed on the base, not on the fix — and the run's own control re-run
   was the evidence that mattered. Next scale prereg: band-vs-control
   identity is the primary Q2 check; Arm A numbers are context only.
   (A miss is a miss: Q2 stands NO-GO as written.)
2. **The control dir must start empty.** Pre-populating it with the old
   corpus left five stale files that briefly read as control events. Next
   run: fresh empty EVIDIR for the control pass, or a post-run sweep that
   deletes any file the pass did not write.
3. **Ladder "caps" display after a delivery** reads all three deeds as
   delivered once any one is delivered (97904 d115+). If a future reader
   needs per-deed truth, the scholarcount JSON (or the deed's own
   firstReadyDay) is the record, not the ladder caps field.
4. No change proposed to Q1 (the flip bar worked exactly as designed —
   predicted seed, predicted window shape), Q3, Q4, or Q5.

## Closeout

- Branch `journey-scale`: prereg `a36679efa`, driver `8f9787292`, this
  note + corpora (evidence commit — see git log). Rebased onto explicit
  master `4717ed481` (r171 adoption, landed mid-closeout; zero src/js, no
  manifest files moved, no proof refresh owed). Proof re-run post-rebase:
  test-scholarcount-a.js 16/16. Merged --ff-only into master (HEAD verified
  moved to the merge commit, branch verified ancestor, in separate
  commands). Worktree released as done-merged, branch deleted. Rotation-a 3→0. Playtest lock was already gone at adoption and
  stayed gone; no lock was recreated.
- Carried (not this run's to build): Baraka unvoiced raise; Stella/Nathan
  trap-line swallow; guest-death (Bing) prereg; survival-collapse cause
  (combat side); scholar-payment open item (steve-call); scale.json
  baseline regime re-label; 1415Z 17-failure gate attribution (still
  owed).
