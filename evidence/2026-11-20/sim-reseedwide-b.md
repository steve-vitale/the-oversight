# sim-reseedwide-b — the WIDER BAND + LONGER WINDOW for the #2626 expiry follow bars

**Verdict: GO (combined). The wider band + longer window bought two more
expiries, and both behaved exactly like the last arm's two — one fast
re-seed, one slow one — so at n=2 the follow shares are REPORTED, not
judged, per the frozen prereg; and the combined-fix judgment passes on
every leg: dead-target launches 0 on both armed legs, re-seeds firing
(3 on A, 15 on B), guardrail passing both bands.** The expiry
follow-through is still unproven at n=2 — this verdict says so in one
line — but the fix it measures is the same fix, doing the same thing,
on a fresh band at a longer horizon. The fix stays HELD and unmerged
on this verdict; the coordinator call now has four expiries of
evidence across the two arms (2/4 re-seeded within 7 days), not two.

**The answer in one paragraph.** The reseedexpiry arm measured the
expiry half at n=2 and missed its 7-day bar by half a holder (1/2).
This arm doubled the seeds (16 fresh) and stretched the window
(180 days) to buy denominator. It bought exactly two more expiries —
the rate is stable at ~1 per 8 armed seeds — one fast, one slow.
Amina (106603) lost her Spool hunt d28 when Diana killed the last
Spool on camera, and was back out hunting Buffering three days
later with Diana beside her. Fernando (106610) killed his own
Chorus Line on camera d36, was told d38 his hunt for the same kind
was called off, waited eight days for a rumor, and went back out
after Buffering d46 with Desmond. Both holders fought again within
the window by the instrument's definition (they launched); neither
closed with Buffering on the record — Amina fled two other beasts
and died d41, Fernando fled or evaded three and died d77 in the
wild. The re-seed half holds dead-0 on both new legs, and the
guardrail passes both bands. The 7-day bar keeps measuring the
rumor supply's timing, not the mechanism — and the supply gave one
fast rumor and one slow one again.

## 1. The two expiries

| | 106603 d28 | 106610 d38 |
|---|---|---|
| Holder | Amina Diallo (`amina_diallo`) | Fernando Vega (`gen_q3stxjy`) |
| Plan target (dead) | spool, wave 3 | chorus_line, wave 3 |
| Rumor pool at the commit | 0 — empty | 0 — empty |
| Beat | "Amina was ready to hunt Spool — but the fire says that kind is already put down, and no one has seen another trail. The hunt is called off." | "Fernando was ready to hunt Chorus Line — but the fire says that kind is already put down, and no one has seen another trail. The hunt is called off." |
| `planExpiries` cross-check | 1 | 1 |
| Re-seeded within 7d | **Yes** — d31 (3d later), null → buffering, launch with Diana | **No** — re-seeded d46 (8d later), null → buffering, launch with Desmond |
| Fought a wave-3+ beast within 14d | **Yes** — within 3d, via reseed-launch | **Yes** — within 8d, via reseed-launch |
| Post-expiry hold fired | — | d39 (three hold rows) |

**Amina's story, in plain words.** Amina met a Spool in the wild d26
and fled it — she had seen the kind and lived. Diana killed a Spool
on camera d27 ("That's a veteran kill, folks. REMEMBER the name.").
Amina was ready to hunt Spool d28 and the fire called it off: the
kind was already put down and nobody had seen another trail. Three
days later a Buffering rumor reached the village — the only rumor in
her pool — and she launched after it with Diana, the veteran, beside
her. On the way out she fled a Redactor the same day; she fled a
Gavel d40, still hunting Buffering; she died to a monster d41. She
went back out hunting within three days and stayed out hunting until
she died. She never closed with Buffering on the record.

**Fernando's story, in plain words.** Fernando fled a Chorus Line
d36 — and killed one on camera the same day ("Fernando just put down
Chorus Line... on CAMERA"). Two days later the fire called off his
hunt for the same kind: he had put down the last known one himself.
His plan held d38–39 (three hold rows, no targetless launch). Eight
days after the expiry — one day past the frozen 7-day bar — a
Buffering rumor arrived and he launched after it with Desmond. Out
hunting he fled a Gavel d51 and evaded an Audit d55 and a Strike
d57, all while Buffering was his target. He died in the wild d77
(as the scholar of that life). Like Amina, he went hunting and met
beasts — but Buffering itself is not on his fight record.

**One voice note.** Fernando killed his own expiry target, and the
beat still says "the fire says that kind is already put down" — true
words, but a "you already killed it" beat would read truer. Minor;
the mechanism is consistent and the words are honest. Recorded in
metric review, not charged to the verdict.

**One silence.** Neither expired-plan re-seed speaks. The expiry
speaks ("the hunt is called off") and the commit-time re-seed
speaks — Shuai d43: "Shuai was ready to hunt The Redactor — but
the fire says that kind is already put down. The hunt turns to The
Focus Group instead." But Amina's d31 launch has no line at all
(the day's only line is Diana's kill beat) and Fernando's d46 has
no lines at all. The return from expiry launches without a word.
Steve's no-silent-actions law makes this a real gap, not a quibble:
appended as a new open finding. It does not touch the verdict —
the launches are real and counted — but the player would never
know the hunter went back out.

## 2. Judged numbers — the frozen bars (pooled across both sub-bands)

The analyzer's pooled verdict is `REPORTED`, kind `LOW-N` (the new
`--min-expiries 3` extension working as frozen): expiries n=2 < 3,
so the three follow bars are reported, not judged.

| Bar | Frozen bar (prereg) | Observed | Verdict |
|---|---|---|---|
| Instrument (pooled) | 0 errors; all band dirs 8 files | 0 errors; 2 dirs × 8 files | **PASS** |
| Gate (pooled) | 0 missing, 0 mismatch, classified ok | 0 / 0 / ok | **PASS** |
| Expiry-rule (pooled) | 0 mismatches | 0 | **PASS** |
| Pool-agreement (pooled) | 0 replica-vs-real disagreements | 0 | **PASS** |
| Dead-commits (pooled) | > 0 | 25 pooled | **PASS** |
| Post-expiry targetless (pooled) | 0 — REPORTED, not judged (n < 3) | 0 | reported |
| Re-seed within 7d (pooled) | ≥ 2/3 — REPORTED, not judged (n < 3) | **1/2 = 0.500** | reported |
| Fight again within 14d (pooled) | ≥ 2/3 — REPORTED, not judged (n < 3) | **2/2 = 1.000** | reported |

**Combined-fix judgment (frozen — this is what the arm's GO hinges
on at n < 3):**

| Element | Frozen bar | Observed | Verdict |
|---|---|---|---|
| Re-seed half, dead-target launches | 0 on BOTH armed legs | A 0 (20 launches: 0 dead / 18 live / 2 unknown), B 0 (39 launches: 0 dead / 39 live / 0 unknown) | **PASS** |
| Re-seed commits | reported per leg | A 3, B 15 (retargeted launches, analyzer count) | reported |
| Guardrail band A | survived ≥ ctl−1, median ≥ ctl−5d, starvation ≤ ctl+1 | 2 vs 3; 157 vs 155d; 4 vs 6 | **PASS** |
| Guardrail band B | survived ≥ ctl−1, median ≥ ctl−5d, starvation ≤ ctl+1 | 1 vs 1; 147.5 vs 135d; 2 vs 6 | **PASS** |
| Instrument + survey | clean, dead-commits > 0 | clean, 25 pooled | **PASS** |

**GO requires the combined-fix judgment. It passes → verdict GO
(combined).** Per sub-band (legacy single-leg judge, for the
record): A DIAG-GO (its one expiry re-seeded in 3d), B NO-GO RESEED
(its one expiry re-seeded in 8d). The pooled n=2 is the verdict;
the per-band split is the same knife-edge the last arm saw, one
holder per band.

**Survived means endReason 'survived' (reached 180d alive).**
The analyzer's wall `survived` counts days ≥ 150 — a legacy 150d
threshold, stale at this horizon (a village lost d171 counts as
"survived" under it). The guardrail above is judged on the honest
180d count; the legacy count (A 4/4, B 4/4) is reported as a
cross-check and also passes. See metric review §5 item 4.

## 3. The survey — the rumor-pool floor

| | Sub-band A (106601–106608) | Sub-band B (106609–106616) |
|---|---|---|
| Dead-target commits (armed) | 6 | 19 |
| Pool floor (min poolN) | **0** (1 commit — the expiry) | **0** (1 commit — the expiry) |
| Pool median | 4 | 5 |
| Pool distribution | {0: 1, 4: 3, 5: 1, 7: 1} | {0: 1, 1: 4, 2: 2, 3: 1, 4: 1, 5: 3, 6: 1, 8: 1, 9: 2, 11: 2, 12: 1} |
| Expiries | 1 | 1 |
| Launches (armed) | 20 (dead 0, live 18, unknown 2) | 39 (dead 0, live 39) |
| Re-seed commits (armed) | 3 | 15 |

Band B's nearest misses: 106611 d88, visjoin_77, target herald
(wave 4), pool 1 — a single reunion rumor — launched on it;
106612 d52, tariq_mahmood, target redactor, pool 1 (spool) — held,
then re-seeded to callback d61. The pool empties only in the
first-days-after-first-kill window, and only when the village has
fought exactly one wave-3+ type. The longer window did not widen
the window: 2 expiries in 16 armed seeds, the same ~1-per-8 rate
as the last arm, and the dead-commit count (25) is the survey's
denominator — the condition's neighborhood was well observed.

**Control comparison (never judged — the armed judge applied to
lever-off data returns NO-GO INSTRUMENT by construction).** The
control legs saw 110 dead-target commits pooled (vs 25 armed):
without the re-seed, a plan keeps re-committing the same dead
target day after day. Pool disagreements 61 on control are the
expected lever-off behavior (pool-0 dead commits that launch),
not an instrument failure. The control number that matters is
the contrast: the re-seed retargets away from dead targets, so
armed legs stop re-committing them.

## 4. Wall numbers

| | A control | A armed | B control | B armed |
|---|---|---|---|---|
| wins | 0 | 0 | 0 | 0 |
| national | 0 | 0 | 0 | 0 |
| table | not observed | not observed | not observed | not observed |
| wave 5 unlocked | 6/8 | 5/8 | 3/8 | 3/8 |
| wave 4 unlocked | 8/8 | 8/8 | 8/8 | 8/8 |
| standing ≥ 200 | 6 | 5 | 3 | 3 |
| survived 180d | 3/8 | 2/8 | 1/8 | 1/8 |
| median survival (gameDays) | 155d | 157d | 135d | 147.5d |
| starvation deaths | 6 | 4 | 6 | 2 |

Starvation is cause 'starvation' across all deaths (B control
includes 2 scholar starvations; B armed 1). The standing-199
stall is everywhere: 8/16 armed seeds end at standing 199, the
wave-5 door held — A 106604/106605/106607, B
106610/106611/106612/106613/106616. The strongest armed villages
are 106614 (standing 645, wave 5, lost d159) and 106609 (standing
520, survived 180d) — and 106609's control twin died d62, the
widest trajectory split in the run (ctl d62 vs armed 180d; 106610
flips the other way, ctl d158 vs armed d100; 106612 ctl d92 vs
armed d172). The lever reshuffles trajectories hard — the same
shape as the prior arms — but the guardrail passes both bands
this time: survival counts sit within one seed of control and
medians are up on both bands.

Balanced panels: both sub-bands review_required, 8 paired cases,
no material signal on any observed metric (band A village deaths
paired delta +0.625, interval −0.75 to 2.25; band B +2.75,
interval −12.375 to 16.875; community loss +0.125 band A, 0 band
B; wins/national 0/0 both). The lever touches 2 plans in 16
seeds; no wall claim is made.

## 5. Metric review

1. **n=2 again, at twice the seeds and 30 more days.** The wider
   band + longer window bought exactly two more expiries — the
   expiry rate is stable at ~1 per 8 armed seeds, and the
   follow-through split is identical to the last arm (one fast,
   one slow). The n ≥ 3 floor did its job: this arm does not call
   a 1/2 share a pass or a fail. Cross-arm tally, reported as
   context and NOT the verdict: reseedexpiry 1/2 + reseedwide
   1/2 = 2/4 re-seeded within 7d across the two arms — still
   short of 2/3, and both misses are the same shape (a holder
   who waited 8 and 14 days for a rumor). The 7-day bar keeps
   measuring the rumor supply's timing, not the mechanism. Any
   future expiry measurement needs a rumor-poor band by
   construction or a still wider screen; a third 16-seed band
   would most likely return n=2 again.
2. **"Fought again" is launch-based, and the transcripts show
   the gap.** `holdersFightAgain` counts a re-seed launch as
   fighting again. Both holders launched and went out and met
   beasts — but neither has a recorded blow-by-blow fight with
   the re-seeded target inside the window: Amina's record is
   three flights and a death; Fernando's is a flight and two
   evades and a death in the wild. The bar's name overstates
   what it measures: re-engagement (going back out), not a
   completed fight. The next run on this question should require
   a fought encounter row (rounds > 0) for "fought again".
   This does not change this verdict — the shares are reported,
   not judged, at n=2 — but it changes what a future GO would
   mean.
3. **The expired-plan re-seed is silent.** Expiry speaks, the
   commit-time re-seed speaks ("The hunt turns to The Focus
   Group instead"), the expired-plan re-seed launches without a
   word on either holder's day. No-silent-actions gap; new
   finding appended to sim-findings.md.
4. **The analyzer's wall `survived` is horizon-stale.** It
   counts days ≥ 150, a legacy 150d threshold; at 180d a village
   lost d171 counts as "survived". The guardrail here is judged
   on endReason 'survived' (the honest 180d count) with the
   legacy count as a cross-check (also passing). The next 180d
   arm should either update the wall or keep judging on
   endReason — and say which in its prereg.
5. **The control pooled INSTRUMENT verdict is an artifact, not
   a failure.** The control legs were analyzed with the armed
   judge (default); pool-0 dead commits launch on control
   because the lever is off — 61 disagreements, 110 dead
   commits. The prereg says control is never judged; the
   contrast (110 vs 25 dead commits) is itself evidence the
   re-seed works.
6. **The 7-day bar's knife-edge is now a three-arm pattern.**
   reseed 0 expiries (METRIC-BROKEN), reseedexpiry 1/2,
   reseedwide 1/2. The bar is fair as frozen — it measures
   whether the village's rumor supply restocks a holder within a
   week — but the answer is now stable: about half the time it
   does, about half it takes 8–14 days. A coordinator call to
   re-derive the bar (14-day re-seed, or a supply-aware bar)
   would be a design decision, not a re-score of this run.

## 6. Instrument, proof, and notes

- **Prereg:** `evidence/2026-11-20/sim-reseedwide-b-prereg.md`
  (commit `616fbd531`), frozen before any judged sim. Base: the
  HELD `sim-reseedexpiry-b` tip `9c8f83d44`, rebased onto
  current master `faa5d65a9` (new tip `91e815132`, clean rebase,
  5 commits, no conflicts; the held reseed lever verified
  present after the rebase, unchanged by this arm). Bands
  106601–106616 fresh (verified across preregs, findings,
  tracker, corpus dir names — zero hits); policy
  `1884c8852d38`; substrate SENSEEXPED=1 PARTYSIZE4=1
  VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1; 180d death-aware.
- **Instrument:** driver `scripts/reseedwide-driver-b.js`
  (180d port of the reseedexpiry driver — horizon + naming
  only) + analyzer `scripts/analyze-reseedexpiry-b.js`
  (judgePooled `--min-expiries` extension) + panel builder
  `scripts/build-reseedwide-b-panels.js`. Proof test
  `scripts/test-reseedwide-b.js` **28/28**; analyzer selftest
  **57/57** (52 + new §H, 5 checks); reseedexpiry proof suite
  re-run **58/58** (no regression). Instrument commit
  `3a6ac430a`.
- **Legs:** sub-band A armed (8 seeds, exit 0); sub-band A
  control — INTERRUPTED by a machine restart after 3 seeds
  (106601–106603 written and verified valid, 0 errors, anchor
  `3a6ac430a2e4`; no live process after the restart, uptime 1
  min); the remaining 5 seeds re-run under the same RUN/OUTDIR
  (the driver refuses to overwrite, so the 3 completed files
  were never re-run), exit 0. Sub-band B armed (8 seeds, exit
  0, slow — ~17 min under sibling load) and sub-band B control
  (8 seeds, exit 0). All 32 files, anchor `3a6ac430a2e4` on
  every file, 0 instrument errors, policy `1884c8852d38`.
- **Balanced panels:** `reseedwide-b-panel-106601.md` and
  `reseedwide-b-panel-106609.md` — both review_required, 8
  paired cases, no material signal (see §4).
- **Telemetry check:** `telemetry-check.js` with the absolute
  baseline path refused recorder-corpus input with exit 2 on
  both armed dirs (designed refusal, same as the 1705Z/1830Z/
  2015Z/2130Z arms); no LOUD lines, baseline NOT rolled.
- **No check.js --quick on this branch:** sibling gates were
  running and the discipline forbids a third concurrent run;
  this arm carries no src/js changes, and its own gates (proof
  28/28, selftest 57/57, 0 instrument errors on all legs) all
  pass.
- **Safe-commit index clobber (twice this run):** after the
  prereg commit and after the instrument commit, the worktree's
  main index showed the committed files as deleted + untracked
  (the known clobber class). Both commits verified correct by
  hash (`616fbd531`, `3a6ac430a`); the index was repaired with
  `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`, then verified with `git status --short` empty
  + `git diff HEAD` empty + hash-object == HEAD blob per file.

## 7. Blanks and findings notes for the coordinator

- **JUDGED VERDICT: GO (combined)** — n=2 < 3, so the expiry
  follow shares are reported, not judged (re-seed within 7d
  1/2, fight again within 14d 2/2, post-expiry targetless 0);
  the combined-fix judgment passes on every element (dead-0 on
  both armed legs, re-seed commits 3 + 15, guardrail both
  bands, instrument clean, 25 dead commits). The expiry
  follow-through stays unproven at this n; the verdict says so.
- **Finding #2626 stays OPEN.** The fix is unlanded, and the
  expiry half is now measured on 32 armed seeds across two arms
  (4 expiries, 2/4 re-seeded within 7d, 4/4 fought again within
  14d by the launch-based definition, 0 post-expiry targetless
  launches, guardrail passing on all four bands). The
  coordinator call is now: land the combined fix on the
  re-seed half + guardrail (dead-0 everywhere, guardrail 4/4),
  or re-derive the 7-day bar (the supply, not the mechanism,
  is what misses), or run a rumor-poor band by construction.
  A third wide band is not recommended — it would most likely
  return n=2 again.
- **New open finding appended:** the expired-plan re-seed
  launches silently (no beat on the re-seed day for either
  holder) — no-silent-actions gap.
- **Branch:** `sim-reseedexpiry-b`, evidence commit (this
  file) below the instrument `3a6ac430a` and prereg
  `616fbd531`, on the rebased tip `91e815132`. HELD unmerged:
  the verdict is GO (combined) and the branch sits on the held
  reseed lever, which this arm does not re-judge or merge.
  The coordinator merges or holds.
