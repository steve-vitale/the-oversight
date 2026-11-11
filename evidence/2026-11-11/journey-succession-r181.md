# Journey succession r181 — Lane B, leg 7 (succession) — RUN NOTE

**Run:** r181 (next Lane B number after r180 crisis) ·
**Leg:** 7 succession · **Branch:** journey2-succession ·
**Base:** master ae53134ae (sim-kinfirst-b) at run start ·
**Rotation-b:** 7 at run start, writes 4 (endgame next) at closeout ·
**Prereg:** evidence/2026-11-11/journey-succession-r181-prereg.md.

## Standing state — ADOPTION of a timed-out run

The 08:00 Lane B occurrence timed out at the 3600s execution
limit mid-panel. This note is finished by the main-session
adoption coordinator; nothing below is a new run.

What the original run completed before the timeout: prereg,
pilot seed 34211 clean, seeds 34212–34216 run, people-check
sampled (34211 d+3 Frieda/Ismael/Domingo; 34212 d+3
STRANGER-Owen; 34213 d+3/d+30 Aurora — conversations
meaningful, no dry lines, ask:lately fix holds).

What the adoption verified and did: the timeout report said
seeds 34216–34218 were pending, but 34216 was COMPLETE on
disk (valid stdout.json, tele json, full transcripts) — the
report was wrong about it. Only 34217 (0-byte stdout.json —
killed mid-write), 34218 (no files), and the smoke 33998 (no
files) were actually missing. The adoption re-ran exactly those
three, with the same prereg policies (34217/34218:
EARLY_KILL_DAY=40 POST_DAYS=70; smoke: EARLY_KILL_DAY=5
POST_DAYS=25), all exit 0 with tele files written. No complete
seed was re-run. The adoption then ran the analyzer, the
telemetry check, the family proofs, and the gate, and wrote
this note.

Worktree journey2-succession registered 14:01:44Z; the registry
showed last_heartbeat None — the run never heartbeated. The
adoption heartbeated immediately (14:24:44Z) and between every
seed run. No check.js or journey2-succession processes were
running at adoption. Lock playtest-loop-2.lock (run_id
2026-11-11T13:55:24Z, the 08:00 occurrence) held through the
adoption; deleted at closeout after verification.

Master moved during the run and adoption (reconciliation merge
+ Loop B 1131Z landings + Lane A scale adoption landing around
it); the branch is rebased onto the explicit master SHA at
closeout. No code change was planned going in and none landed:
this run is a second fresh-panel confirmation under the
revised MANTLE-FINE rules, plus the smoke-bar revision
validation. No src/js change.

## Panel

Driver scripts/journey-succession-r181-20261111.js (r177 driver,
rename only), analyzer scripts/analyze-journey-succession-r181-
20261111.js (r177 analyzer, rename only — carries the revised
MANTLE-FINE rules). Seeds: FRESH BAND 34211–34218
(EARLY_KILL_DAY=40, POST_DAYS=70) + smoke 33998 (EARLY_KILL_DAY=5,
POST_DAYS=25). Pilot seed 34211 ran clean first; the remaining
seeds ran sequentially (34217 15:02–15:10Z, 34218 15:25–15:28Z,
smoke 15:28–15:29Z, all exit 0). Analyzer:
evidence/2026-11-11/journey-succession-r181-analyzer.txt.

Per-seed tele (deaths.bearer / alive / fallen / stage / mentions):

| seed | bearer | alive | fallen | stage | mentions | over |
|------|--------|-------|--------|-------|----------|------|
| 34211 | 2 | 10 | 2 | 3 | 4 | no |
| 34212 | 1 | 10 | 2 | 3 | 4 | no |
| 34213 | 3 | 8 | 4 | 3 | 4 | no |
| 34214 | 3 | 9 | 3 | 3 | 4 | no |
| 34215 | 1 | 8 | 7 | 3 | 5 | yes |
| 34216 | 1 | 8 | 4 | 3 | 5 | no |
| 34217 | 4 | 8 | 4 | 3 | 4 | no |
| 34218 | 10 | 5 | 12 | 3 | 4 | no |
| 33998 smoke | 1 | 11 | 1 | 3 | 2 | no |

Panel means (8 fresh seeds): bearer 3.1, alive 8.3, fallen 4.8,
stage 3.0, mentions 4.3. Against the telemetry baseline (7.6 /
3.8 / 14.3 / 3.0 / 4.2) and the r177 panel means (6.0 / 6.5 /
9.1 / 3.0 / 4.5): this band ran less bloody still — one seed
bled hard (34218: 10 bearer deaths), the other seven held 8–10
alive. Band variance, not a fix effect: no src change in this
run targets deaths, and the deaths are wild/arena/contest/
night, same classes as r177's read.

## Panel verdicts vs pre-registered bars

- **MANTLE-FINE (binding, revised r170 rules): PASS.** Deaths
  observed 26 (village-over excluded: 0; flippedImmediate=false:
  0; fineLatency>=2: 0; fineLatency==1 unexplained: 0;
  held-briefly same-day cascade bearers: 0; coarse>fine sampling
  gaps: 0; day-skips total: 0). Every bearer death with a living
  successor flipped synchronously at return; every chain handoff
  has coarseLatency 0. The revised bar is now confirmed on a
  SECOND fresh panel — the r169 letter-FAIL stays standing
  history, and the revision is the bar going forward.
- **DRY CENSUS (binding): PASS.** 3 fellBack entries across the
  9 seeds: 34212 d17 Abdulaziz, pick dlg:doubt ("...What's that
  supposed to mean?" Their voice goes careful. — a real
  deflection beat, transcript-verified below); 34213 d71 Eric,
  pick alive:want:seek_taken ("Still nothing on Kevin. I told
  you about the pods — I keep thinking about them. The humming.
  Some nights I'm sure it's a dream." — a real expedition
  answer, transcript-verified below); 34216 d10 Chantal
  («C'est quoi, cet endroit ? Où sommes-nous ?» — the r81
  nonverbal-gesture foreign-language narration, honest by
  design). 0 dry lines anywhere (no "...Sorry, lost my train
  of thought." in any fellBack key). 0 ask:lately fellBack —
  the r170 fix holds on a second fresh panel. 0 dlg:more
  fellBack. 0 AGENCY-DRY / TEACH-DRY / OPENER-DRY. The carried
  same-class sites (convoThreadBeat `exh` closers, base `more`
  choice) stayed dry-free in the wild for the fourth straight
  panel.
- **CAP-NC (descriptive): INSUFFICIENT-DATA.** Bonded-by-deadline
  0/0 eligible seeds (denominator < 3). Descriptive bondedEver
  2/2 probe-opened seeds (Borys on 34215, Pola on 34218).
  CAP-D14: 0 bonded-d14 of 9 (4 no-stranger-pool, 4
  not-bonded-by-d14, 1 village-ended-before-d14). OPP:
  unbonded talk-requests 1 (Tom d51, 34215); FIRST-bearer new
  bonds on undriven days 1; NPC-NPC new bonds 45; newcomer
  arrivals 8; FIRST-bearer newcomer bonds 1 vs pre-existing 0;
  selfReq day-entries 0 (r133 purge holds).
- **CONTROLS (binding, REVISED per r177 metric review):
  PASS.** Smoke 33998 headline: deaths 1, alive 11, fallen 1,
  stage 3, mentions 2 — identical to r177 (and r161/r165/r166/
  r169). Pick rank 1 and funeral INCALL true on all 9 seeds.
  selfReq 0 everywhere. DeAndre speaks the trapline line (d+7:
  "an old trapline — I'll show you on the map sometime. It's
  real."). The r161 agency fix holds. Second-order smoke
  counters moved again (pantryEnd 14108 -> 21052, deedCalls
  30 -> 25, bumpCalls 732 -> 722, bumpWithReason 723 -> 709,
  trustOfficeDelta 12 -> 11, trustVillageDelta 48.2 -> 48.6,
  callMovesWithDonation 0 -> 1, callMovesSoloOffice 1 -> 0,
  callMovesMoverNamed 2 -> 3, armorBarkLast 4 -> 6) — expected
  under the revised bar: master moved through r178/r179/r180
  (r180's Q3 voice-line stacking fixes in conversation.js /
  convo-wants.js) plus the kinfirst/standfirst merges since
  r177, all conversation-ledgering changes. The 5 headline
  numbers are unchanged. The r177-proposed smoke-bar revision
  is VALIDATED by this run: headlines hold while second-order
  counters move.

## Village assessment (plain words)

Eight villages, one story with different endings. Seven held
together: eight to ten people alive at the end of the window,
the pantry fed, the mantle passing hand to hand without a
stumble — 26 bearer deaths, every one of them handed over
cleanly to someone still living. Two villages stand out. On
seed 34218 the bearer died ten times over: Vera to Thao at d42,
then Elijah, Anthony, Raul, Hassan, Benoit (a same-day cascade
with Raul), Liam, Thabo, Teresa, Sari — a massacre that still
ended with five alive and the mantle never once stumbling. On
seed 34215 the village itself gave out early: Jalen to Riana
at d41, newcomer Borys arrived at d+4 and bonded with the new
bearer, but the pantry ran to zero and the village ended
around d52 with eight alive and seven fallen. The mantle still
passed cleanly. Seed 34212 lost its bearer young and
organically (Jamal to Theo, d14, the wild) and carried on to
ten alive. Seed 34214 lost Nicole to the night at d23, then
Chloe to the wild and Helga to a contest on back-to-back days
(d76, d77). Nobody was left holding a dead person's job: the
one place a party role could have stuck after a death, it
didn't — Sari takes Scout from Thao with a real handoff on
34218. What the villages knew: the table is coming, the old
trapline is real, the dead are mourned by name (Guadalupe,
Archana, Liam). What was missing: nothing structural this run
— the conversations spoke honestly, the newcomers arrived (8
across the panel) and two bonded with their bearer, the bonds
formed (45 new NPC-NPC bonds) even if the first-bearer's
newcomer bonds stayed thin (1 newcomer vs 0 pre-existing for
first-bearers — the standing CAP-NC thinness, denominator 0
this panel, not a new finding).

## PEOPLE CHECK (sense — transcripts read in full)

- Frieda d+3 (34211): mourning Guadalupe ("Guadalupe is gone
  and the world just... continues. That's the part I can't
  stand."), teaches Jerusalem Artichoke, declines an invite
  with a reason ("Not right now. I've got my own things to
  handle."). Meaningful throughout; no dry line.
- Owen d+3 stranger probe (34212): asks for foraging help with
  a concrete reason (the stores won't stretch past tomorrow),
  deflects a confrontation ("Nope. No."), accepts a refusal
  ("...Okay. I'll figure it out."). A stranger who reads as a
  person, not a menu.
- Aurora d+30 (34213): teaches plants (Yarrow, Soursop, Banyan
  Fig), asks for wound help with a concrete reason (a cut
  getting worse — "If it festers I'm no good to anyone"), and
  takes "I can't right now" gracefully ("Right. I get it.").
  The ask:lately fix is visible in the wild: no parroting, the
  talk goes on from there.
- Sari d+53 (34218): mourning Archana ("Archana owed me a
  favor. I keep thinking about collecting. Stupid."), takes
  the Scout role from Thabo with a real handoff ("Thabo nods,
  stepping back. 'Scout is yours now.'"), sleep gone strange
  ("I sleep in short shifts at odd hours now."). The richest
  sitting on the chain-heavy seed.
- DeAndre d+7 + d+14 (smoke 33998): the trapline line is spoken
  at d+7; at d+14 he resumes the conversation cut off 7 days
  back ("We never finished talking about what's been
  happening"), teaches Masoor Lentil, and closes honestly
  ("Good — what's been happening, settled. Feels better said
  out loud.").

No transcript on this panel fabricated shared history, looped
filler, or dried. The conversation quality bar holds.

## Reachable / fun / winnable (succession leg)

REACHABLE: yes — every death on the panel handed the mantle to
a living successor synchronously, including through a 10-death
cascade and a village-ending collapse. FUN: yes — the
successor's second life plays: mourning, teaching, roles,
invites, and honest refusals all fire in the transcripts.
WINNABLE: the leg does not block the win path — succession
itself is not the choke; the villages that survive their
handoff keep playing toward the table. (No full-seat attempts
fall inside this leg's window; the win chain is judged on the
endgame leg.)

## Fixes landed this run

None — no src/js change. This run was a fresh-panel judgment
run, finished by adoption; its findings are the MANTLE-FINE
second confirmation, the dry census pass, and the smoke-bar
revision validation above.

## Family proofs

r146/r147/r151/r155/r157/r161/r166/r169/r170 9/9 ALL GREEN on
the pre-rebase tip (node runs, logs evidence/2026-11-11/
journey-succession-r181-family-*.log; no FAIL in any log).

## Telemetry

Ran on the 8 panel tele files (evidence/2026-11-11/
journey-succession-r181-tele-342*.json). Two LOUD lines, both
the KNOWN summation artifact (r151/r155/r157/r161/r166/r169/
r170/r177 precedent — the checker sums across files while the
baseline holds per-seed means): deaths.bearer 229% (baseline
7.6 -> current 25, n=8) and census.fallen 166% (baseline 14.3
-> current 38, n=8). Per-seed means: bearer 3.1, alive 8.3,
fallen 4.8, stage 3.0, mentions 4.3 — against baseline 7.6 /
3.8 / 14.3 / 3.0 / 4.2 and r177's means 6.0 / 6.5 / 9.1 / 3.0 /
4.5. The alive/fallen moves are band variance (one seed,
34218, carried 10 of the 25 bearer deaths; the rest ran 1–4
each). No real deviation; baseline NOT rolled forward.

## Gate

DONE at closeout (2026-11-11 ~16:07Z). One gate run on the
pre-rebase tip (base ae53134ae): **285 passed, 15 failed in
1839s** (30.6 min — the slowest gate this cycle; load average
~8–12 throughout, with the reconciliation coordinator's
16-seed × 150-day balance-panel refresh running concurrently).
Log evidence/2026-11-11/journey-succession-r181-checkquick.log.

The 15 failures split 6 standing + 9 load artifacts, zero new
attributable failures — adjudicated GO:

- STANDING 6 (documented pre-existing set): measurement-proof
  staleness pair (test-measurement-proof-update +
  test-measurement-workflow — "Proof source inputs are not
  current"; the proof is stale since r129/r176/r130/r125 src/js
  changes and the reconciliation proof regen 7733d5cd0 should
  re-green it on the merged tip), mobile-combat-cadence,
  occupation-panels, phone-frame-proof (stale receipt),
  establishment-r20-fixes (racks-full next-day voice:
  expected 2, got 1).
- LOAD ARTIFACTS 9, every one re-run standalone GREEN:
  comfort-arc (gate 120.3s timeout; standalone exit 0, 85s),
  measurement-cache-flags (gate 93.2s; standalone exit 1 twice,
  then exit 0 4/4 in 32s — mechanism PROVEN: the test
  spawnSyncs balance-panel.js with a 30s kill; under load a
  1-day 7-seed panel run exceeds 30s and all four assertions
  cascade-fail; a manual panel run on this tip took 17s and
  exited 0), solo-campaign-endings (120.2s; standalone exit 0,
  106s), trust-observer-neutrality (gate exit 1 at 62.0s on a
  bare spawn Error; standalone first exceeded the 180s cap
  mid-run with seed-11 assertions passing, re-run exit 0 6/6
  in 79s — mechanism PROVEN: children spawnSync with a 60s
  kill), time-save-crashes (120.0s; standalone exit 0, 69s),
  synergy-stall (120.1s; standalone exit 0, 106s),
  throttlefeast (120.2s; standalone exit 0, 72s), capable-bot
  (120.2s; standalone exit 0 in 128s — slower than the 120s
  gate budget even alone, which is why it times out in-gate),
  table-endings (120.1s; standalone exit 0, 97s).

No gate 2 after the rebase: this run is measurement-only
(zero src/js), the rebase adds only other runs' already-gated
commits on top of uniquely-named r181 evidence files, and the
9 family proofs (the run's proof tests) were re-run on the
rebased tip — all GREEN (logs
journey-succession-r181-family-r*-closeout.log). A second
30-minute full gate would re-verify other people's work.

## Rotation

7 -> 4 (endgame next). Advanced at closeout; verified the file reads 4.

## Metric review

- MANTLE-FINE under the revised r170 rules is CONFIRMED on a
  SECOND fresh panel (26/26 synchronous handoffs, 0 real
  deferrals, 0 day-skips). The revised bar stands for future
  runs; the r169 letter-FAIL stays standing history.
- The day-skip instrument correction stays open (r166/r169/
  r170/r177/r181: zero day-skips across ~142 deaths / 25 seeds /
  ~1300 sleeps, no deterministic staging path) — carried, not
  implemented. The instrument has now had five straight panels
  with nothing to detect; a future run may judge whether the
  correction is still worth building or the bar should be
  dropped to a watch.
- CAP-NC denominator: stays descriptive (r181: 0 eligible).
  A decisive verdict needs a longer panel or a band with
  earlier arrivals — a future run's question, not this run's.
- SMOKE BAR REVISION (r177-proposed, ADOPTED in this run's
  prereg): VALIDATED — headlines hold (1/11/1/3/2) while
  second-order counters move again with dialogue-ledgering
  changes (r180's Q3 fixes). The revision stands for future
  runs; the r181 smoke tele (pantryEnd 21052, deedCalls 25,
  bumpCalls 722) is the new reference.
- Same-class dry sites (convoThreadBeat `exh` closers, base
  `more` choice): dry-free for the fourth straight panel. The
  watch continues; the r170 design call already covers them
  for a future run if one dries.
