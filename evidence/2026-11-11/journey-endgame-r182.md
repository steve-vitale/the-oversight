# Journey endgame r182 — RUN NOTE (lane B, 2026-11-11 11:00 CST run; adoption closeout)

Leg 4 (endgame). Rotation-b read 4 at run start; this run plays leg 4 and
writes 5 (social life) at closeout ONLY after a verified landing.

Substrate: master 3abe9ef148714cc7a6ac19d4283b1decf547a7af (worktree HEAD at
registration). Probe-side changes only (probe/analyzer/dark-probe/M2b
scripts r182); zero src/js. Prereg:
evidence/2026-11-11/journey-endgame-r182-prereg.md.

Run-start incidents: `git pull --ff-only` FAILED (standing divergence;
reconciliation in flight — proceeded on local master per precedent).
VM reboot ~17:37Z killed the first driver mid-pass-B (seed 89702);
resume driver run-r182-driver-resume.sh recovered from pass B seed 89702
(seeds independent, fresh process reproduces each seed exactly).
Coordinator timed out ~17:53Z with the resume driver still running
(pass C in flight); adoption coordinator took over after the driver
exited 18:22:58Z (all passes exit 0; M2B 89702/89703 exit 0, 89701/
89704/89705 exit 1 = vacuous-FAIL, see below) and closed out the run.

Analyzers: journey-endgame-r182-analysis-{a,b,c,cwide}.txt.
Per-seed corpora: perseed-endgame-r182[-b/-c/-cwide]/.
Telemetry logs: journey-endgame-r182-telemetry-{a,b,c,cwide}.log.

## Pass A (CAPSTONE unset, BUYOUT unset — matched re-run)

Analyzer verdict: PRIMARY-BINDINGS GO | PRIMARY GO | ALL NO-GO (the ALL
NO-GO is the standing M3-conversion tally, as in r178).

Per-seed (r178 pass A in parens):
- 89701 waves: WON LESSER, ann d90, sat d104 (r178 d91), alive 9,
  ladder peak 3 / stage 3 / counted 81 (r178 78), capstone none,
  deedGate never ok (w5:0; r178 deedGateFirstOk d76 w5:5),
  peakLivingVeterans 2@d47, 0 living at end, uw 4.
- 89702 waves: WON LESSER, ann d90, sat d97 (r178 d90), alive 8, ladder
  3/3/78 (r178 79), deedGateFirstOk d62 (w5:7), peakLivingVeterans 2@d43,
  1 living at end, uw 5 FACED (7 w5 faces).
- 89703 waves: WON LESSER, ann d90, sat d118 (r178 d93), alive 5, ladder
  3/3/56 (r178 74), deedGate never ok (w5:0), peakLivingVeterans 0, uw 4.
- 89704 forcedrift: WON LESSER, ann d90, sat d92 (r178 d90), alive 3,
  ladder 3/3/52 (r178 52), deedGate never ok (w5:1),
  peakLivingVeterans 2@d79, uw 5 FACED (cancellation d81).
- 89705 wavesnw: WON LESSER, ann d90, sat d98 (r178 d99), alive 10,
  ladder 3/3/74 (r178 69), deedGate never ok (w5:0),
  peakLivingVeterans 1@d98, uw 4.

Tally: lesser 5/5, full 0/5 (r178: same). M1 GO, M2 GO, M2b GO (4 dieFlag
fights classified, all with named causal deaths — incl. scholar deaths
89702 d51/d62, 89703 d95), M10 GO, M11 GO (89702 standing peak 461),
M3-conversion NO-GO (armB kills 1 vs armA 6 — standing tally).
M23/M24/M24b/M25/M25c deferred to passes B/C (legs disabled in A).

## Pass B (CAPSTONE=1 BUYOUT=1)

Analyzer verdict: PRIMARY-BINDINGS NO-GO | PRIMARY NO-GO | ALL NO-GO.
NO-GOs: M3-conversion (standing tally, armB 1 vs armA 5),
M21-audit-crosscheck 4/5 (89702 AUDIT-UNPARSED — standing instrument
gap, see below), M23-capstone (see below).

Per-seed:
- 89701: LESSER, sat d104 (r178 pass B: FULL d77 — DOES NOT
  REPRODUCE). No capstone attempts (deedGate never ok, w5:0). Buy-out
  attempts 0 (deedGate never ok, so the in-window rule never fires
  despite pantry 24548 kcal at end).
- 89702: FULL, sat d108, feast_embassy delivered d65 (attempts d62–64
  none-ready, d65 bundle ready; full priced d66). deedGateFirstOk d62.
  NEW full seat in pass B (r178 pass B 89702 was lesser; r178 pass C
  89702 was full d66). Buy-out: 4 attempts, 1 bought — d65/pantry12145
  (the buy and the delivery fall the same day; the buy completed the
  bundle the capstone then delivered). Path defiant, final:terms.
- 89703: LESSER, sat d118, no attempts (deedGate never ok, w5:0).
- 89704: LESSER, sat d92 (r178 pass B: FULL d90 via military_tribute
  d89 Omar Farouk + Rosa Mendez — DOES NOT REPRODUCE). No capstone
  attempts (deedGate never ok, w5:1).
- 89705: LESSER, sat d98, no attempts (deedGate never ok, w5:0).

Tally: full 1/5, lesser 4/5 (r178 pass B: full 2/5, lesser 3/5).
M23: "1 eligible: delivered 1/1, none-ready 3, refused-despite-ready 0,
pricedFull 1/1" — marked NO-GO because the analyzer's literal
attempts==deliveries counts the three honest none-ready attempts (d62–64,
no kind ready yet) as failed attempts. Substance is a pass: 0 refusals
despite readiness, delivery succeeded, full priced. See metric review.
M24 VACUOUS (no tribute delivery). M24b VACUOUS (no scholar+1 seed).

## Pass C (CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1)

Analyzer verdict: PRIMARY-BINDINGS NO-GO | PRIMARY NO-GO | ALL NO-GO.
NO-GOs: M3-conversion (standing tally, armB 1 vs armA 3),
M21-audit-crosscheck 4/5 (89702 AUDIT-UNPARSED — same standing gap),
M25-buyout VACUOUS (record-only this run; 4th vacuous — see metric
review).

Per-seed:
- 89701: LESSER, sat d93, bought d18 (pantry 20511, spent 8130,
  after 12381). Path feared, final:mercy.
- 89702: FULL, sat d92, feast_embassy delivered d78 (full priced d79),
  bought d21 (pantry 26742, spent 8352, after 18390). Path beloved,
  final:audience. (Full a second time on this seed, 13 days earlier
  than pass B's sitting; delivery 13 days later than pass B's d65 —
  the early buy changed the trajectory.)
- 89703: LESSER, sat d98, bought d58 (pantry 18456, spent 8380, after
  10076; two earlier attempts refused: not at Haven d56–57).
- 89704: LESSER, sat d90, bought d29 (pantry 16309, spent 8048, after
  8261; two earlier attempts refused: not at Haven d27–28).
- 89705: LESSER, sat d130, bought d22 (pantry 8394, spent 8394,
  after 0 — the buy took the ENTIRE pantry). See starvation watch.

Tally: full 1/5, lesser 4/5 (r178 pass C: full 2/5 — 89702 d66, 89705
d63; neither r178 pass-C full reproduces on the same day: 89702 full
d79 not d66, 89705 lesser d130 not full d63).
M23 GO (89702 feast_embassy@d78/FULL). M24 VACUOUS. M24b GO
(89702 covered-by-delivery — the scholar+1 seed was covered by a
delivery, not by a named refusal; the honest-refusal path is STILL
unexercised). M25c GO — PRIMARY (5 eligible early-days, 0 skipped,
9 early attempts, 5 bought).

## Pass C-wide (8 fresh seeds 89706–89713, starvation watch)

Analyzer verdict: PRIMARY-BINDINGS NO-GO | PRIMARY NO-GO | ALL NO-GO.
NO-GOs: M3-conversion (standing tally, armB 3 vs armA 8),
M5-voicing-canonical (no forcedrift control seed — out of scope: the
prereg judges the wide pass on M25c + starvation only),
M21-audit-crosscheck 7/8 (89707 AUDIT-UNPARSED — same standing gap),
M25-buyout VACUOUS (record-only).

Per-seed:
- 89706 wavesnw: LESSER, sat d105, bought d41 (21111, spent 8100,
  after 13011), alive 6.
- 89707 wavesnw: FULL, sat d90, feast_embassy delivered d68 (full
  priced d69), bought d44 (24708, spent 8108, after 16600), alive 10.
  Path indispensable. (Fresh seed: no matched control, so the buy's
  necessity for the full seat is not proven — the buy completed the
  bundle, the capstone followed.)
- 89708 waves: NONE, satDay 104, bought d63 (15328, spent 8100, after
  7228), alive 8. The village reached the window end without sitting
  ANY seat (bestSeat none; binding w5 + stage). 26 buy-out attempts,
  1 bought. A survived-unseated outcome — the table offer is standing,
  so it can sit later; the pilot ends at the window.
- 89709 waves: LESSER, sat d98, bought d58 (9734, spent 8234, after
  1500), alive 4 (11 deaths, none starvation).
- 89710 waves: LESSER, sat d90, bought d39 (10174, spent 8274, after
  1900), alive 8, uw 5 FACED, peakLivingVeterans 3.
- 89711 waves: LESSER, sat d102, bought d38 (22767, spent 8136, after
  14631), alive 5.
- 89712 waves: LESSER, sat d92, bought d45 (23245, spent 8465, after
  14780), alive 10.
- 89713 waves: LESSER, sat d116, bought d27 (16336, spent 8166, after
  8170), alive 10.

Tally: full 1/8, lesser 6/8, unseated-survived 1/8. M23 GO (89707
feast_embassy@d68/FULL). M25c GO — PRIMARY (8 eligible early-days,
0 skipped, 67 early attempts, 8 bought).

## Starvation watch (the Joja price)

13/13 early buy-outs fired (5/5 matched, 8/8 wide). Buy-out cost is
~8000–8470 kcal, not a flat 8000; the rule fires whenever pantry ≥8000
at Haven, with no deed-gate plausibility check:
- 89705 pass C: pantry 8394, spent 8394, after 0 — the buy took the
  whole pantry on d22. No starvation deaths followed (4 deaths: wound,
  stranger, monster, stranger), but the village sat lesser only on
  d130 — 108 days after the buy, vs r178 pass C full d63 on this seed.
  The price was time, not lives: a bundle bought for a deed gate that
  never opened (w5:0), on a pantry that never recovered enough to sit
  early.
- 89709 wide: after 1500; 89710 wide: after 1900 — no starvation
  deaths on either.
- One starvation death in the whole corpus: 89707 Zafar Dubey, d58 —
  14 days AFTER a buy that left 16600 kcal. Not a direct pantry
  emptying; the village's pantry had hovered 4–7k through d31–d44
  before the buy, so food stress was pre-existing. Attribution
  uncertain; filed as a watch item, not a Joja kill.
- Verdict: no buy-out starved a village before its seat in this run.
  The edge the watch was built for is real (threshold-edge buys empty
  or gut the pantry: after 0 / 1500 / 1900) and fires on waves-blocked
  seeds where the bundle cannot price anything — filed as a design
  finding (see sim-findings.md).

## Dark probe (re-verify, all 7 variants)

7 variants, failed steps: v1a-loss:D2-twist-fired — bit-identical to
r171/r178 (the standing single failure). v3 walk-out line names Amelia
Moon (sitter=Amelia Moon, all v3 steps ok), D1–D4/D6 hold on the new
substrate.

## M2b sweep (120d, seeds 89701–89705)

- 89701: FAIL vacuous (no scholar-death fight).
- 89702: PASS — 2 scholar-death fights mapped (d51 cancellation, Saiful
  Dutta; d62 reunion, Peyton Michalski; both dieFlag=true, diedInFight
  named, scholarDiedInFight=true).
- 89703: PASS — 1 scholar-death fight mapped (d95 eulogy, Sofia Chen).
- 89704: FAIL vacuous. 89705: FAIL vacuous.
The M2b proof, owed since the r171 adoption, is LIVE AND GREEN: the
property holds on the first seed that produces a scholar-death fight.
The r171 gap (a fast fight with a causal scholar death printing
diedInFight:[]) did NOT recur — all three scholar deaths carried named
diedInFight parties.

## People check

Read in full: 89702 pass C (beloved/full, 176 SAY lines), 89707 wide
(indispensable/full, 52 SAY lines); tails read: 89702 pass B
(defiant/full), 89705 pass C (beloved/lesser, sat d130).
- The full-seat finales read as earned, not defaults. 89702-B
  (defiant/terms): "THE TABLE FALTERS — you put yourself on the stand
  before the room believed you, and the defense took you apart... You
  take the smaller door. It is still a door." / "Name your terms
  anyway... The table learns a new word: no. It practices it badly for
  a century." The war path names Fati (Ugly Beast d107) and Saiful
  (Ugly Bastard d43). 89702-C (beloved/audience): the COMMUNE beat is
  genuinely good — the System asking permission to drop the "nothing"
  messages ("THE GOAT IS FINE"), the scholar answering "The goat is
  fine is somebody's whole day. That's the job." 89707
  (indispensable): "You lowball. The table blinks — nobody lowballs
  *them*." / "Teach them freely." The Architect beat names Desmond
  Clarke ascending through relay doors the village built.
- The lesser finale is honest about the shortfall. 89705-C audit:
  "For a full seat, the ledger still wants: only 0 of 2 different
  wave-5 monsters faced; no capstone deed delivered." The war path
  names Zoe (Ugly Beast d128). The overtime is voiced ("1 week kept
  waiting. Every door's standing −4.").
- Observations (polish, filed): (1) the held-item refrain ("Your gifts
  are not mastered — but they are lived-in, and they are with you. The
  feast was the weapon.") repeats verbatim after EVERY held item, 3–4×
  per transcript; (2) the Scout role ping-pongs — 89702-C hands Scout
  Ivy→Nora→Ivy→Priya across d91–92; (3) the war-path "wave-5 bar
  reads: blood your fighters (1 of 2 veterans)" line appears even on
  full-seat audits, where the seat is already priced — muddies the win;
  (4) "You wait. The light changes. Nothing asks anything of you."
  repeats 3× as idle filler in one window.

## Telemetry deviation check

Baseline: hidden_files/telemetry-baselines/endgame.json (metrics
veterans.unlockedWave, won, peakLivingVeterans).
- Pass A: quiet (5 files, 3 metrics, no large deviations).
- Pass B: quiet. Pass C: quiet.
- C-wide: LOUD — veterans.unlockedWave swung 127%: baseline 15 ->
  current 34 (n=8 files). Investigated: the baseline is the r121 pilot
  sum over FOUR seeds (mean 3.75); the current sum is over EIGHT seeds
  (mean 4.25; two seeds reached uw 5: 89707, 89710). The swing is the
  file-count mismatch plus normal variation, not a deviation. Baseline
  NOT rolled (same as r178).

## SUBSTRATE CAVEAT (adoption closeout, added post-rebase)

The pilot (passes A/B/C/C-wide, dark probe) ran on substrate 3abe9ef14 —
the PRE-reconciliation master. Cursor's villager-brain.js (dawn scorer,
1061 lines) and the rest of the reconciled origin side are ABSENT from
that substrate (verified: the file does not exist at 3abe9ef14; it exists
at the rebase base 3b4aa8123). The phantom-veteran fix (5d16916f4) IS in
the substrate, so the Q2/Q4 findings about the honest veteran count
stand as measured. But the feeder probe showed Cursor's dawn scorer
changes villager mornings substantially (EAT 59 vs 36 on the same panel),
so the pass A/B/C numbers — sat days, wave-5 kill counts, deed-gate
timing — may NOT reproduce on the current post-reconcile master. The
M2B property was re-proven on the rebased tip (3b4aa8123): PASS, but on
a DIFFERENT scholar-death fight (d110 reunion, Mia Andersson) than the
driver run found on the old substrate (d51/d62) — the property holds,
the trajectories differ. A re-run of the matched pilot on the current
master is owed before the Q2/Q4 numbers are treated as current.

## CLOSEOUT INCIDENT — write flap (adoption)

The first safe-commit attempt hit an EPERM write flap (host-level write
denials, ~18:35–19:00Z): `git hash-object -w` and /tmp writes both
denied; the registry heartbeat write was denied too (heartbeat stuck at
18:25:08Z, still inside the 4h reaper window). safe-commit's stale-tree
guard correctly REFUSED the corrupted private index (it would have
deleted 283,097 lines in src/) — nothing was committed, nothing damaged.
Waited for the flap to clear (probe loop: /tmp write + hash-object every
60s), re-heartbeated, re-probed (`git update-ref refs/heads/probe HEAD`),
then committed cleanly at 19:00Z+. Recovery: no manual ref edits, no
--force-delete; if a flap strikes again, probe first and wait it out.

## Gate

`node scripts/check.js --quick` in the worktree: 294 passed, 6 failed in
424s — the 6 are exactly the standing set (measurement-proof staleness
pair, mobile-combat-cadence, occupation-panels, phone-frame-proof stale
receipt, establishment-r20-fixes next-day voice). No new failures, no
load artifacts. Gate verdict: GO.

## Answers to the prereg questions

(1) Pass A reproduces r178 modulo the named deltas: PARTIAL — same
headline (lesser 5/5) but sat days drifted later on 89701 (+13), 89702
(+7), 89703 (+25), and 89701's wave-5 kills went 5 -> 0. See (2).
(2) Phantom-veteran readiness flip: YES — 89701 is the flip. Under the
old rule the dead veterans still counted toward readiness (r178:
deedGateFirstOk d76, w5:5, release happened); under the fixed rule
(5d16916f4) 89701's two veterans peaked d47 and both died before the
window, readiness never reached the release threshold (no M13 release
snap on 89701 in r182; only 89702 snapped, d43 vets=2), no wave-5
fights were ever faced, w5:0, deedGate never ok. Same shape on 89704:
peakLivingVeterans 2@d79, deedGate never ok (w5:1), no tribute — the
r178 pass-B full seat (military_tribute d89) does not reproduce.
(3) Cook/mend ladder grants move ladder: NO systematic lift. Pass-A
ladder counted r178 -> r182: 89701 78->81 (+3), 89702 79->78 (-1),
89703 74->56 (-18), 89704 52->52 (0), 89705 69->74 (+5); peak 3 /
stage 3 on all 5 in both runs. Per-seed moves track the diverged
trajectories, not the grants.
(4) Full seats reproduce in pass B: NO — neither r178 full seat
reproduces (89701 d77, 89704 d90); one new full seat appears instead
(89702 feast_embassy d65). Common cause is (2).
(5) Early buy-out: fires 13/13 (5/5 matched, 8/8 wide); opens a full
seat on the fresh seed 89707 (bundle d44, capstone d68 — necessity
unproven, no control); on the matched 5 it adds no full seat beyond
pass B's 89702. It starves no village before its seat, but see the
starvation watch: threshold-edge buys gut the pantry (89705 after 0,
89709 after 1500, 89710 after 1900) on seeds where the bundle cannot
price anything.
(6) M24b honest-refusal path: STILL unexercised — pass C's scholar+1
seed was covered-by-delivery, no refusal fired anywhere.
(7) M2b: YES — GREEN on 89702 (2 fights) and 89703 (1 fight). Proof
owed since r171 is now live.
(8) Dark re-verify: v3 names Amelia Moon; D1–D4/D6 hold; only the
standing v1a-loss D2 failure recurs, bit-identical to r171/r178.
(9) People check: yes — finales read as earned (see above).
(10) Deltas move w4 kill conversion / survivability / competence:
M3-conversion NO-GO stands (armB 1 vs armA 6 pass A; same direction,
smaller numbers than r178's 2 vs 12). No competence movement claimed.
(11) Diag-layer staleness blank (fullseat-diag.js pre-ladder gate):
carried, not changed here.
(12) Fast-branch diedInFight:[] gap: did NOT recur — all three
scholar deaths carried named diedInFight parties.

## Village assessment (plain words)

Five villages walked to the table's door and four sat down in the lesser
seat; one (89702, twice, and 89707 on the wide band) took the full seat
by feeding the galaxy — the feast bundle, bought with the pantry and
delivered as an embassy, is the working road to the top now that the
tribute road has gone quiet. The tribute never fired anywhere: the two
veterans the old rules would have counted are dead on the seeds that
needed them, and the honest count says the villages were never ready.
That is the fix working as designed, and it costs two full seats the
old, wrong count used to hand out. The villages that sat lesser did so
honestly — the audit names exactly what was missing (wave-5 monsters
never faced, no capstone delivered) — and the one village that bought
its bundle with its last crumb of food survived, but sat three months
late in the lesser seat. The table is reachable; the full seat is
reachable; the road runs through the feast now, and the feast has a
price the villages pay whether or not it opens the door.

Reachable: yes (lesser 12/13 seated across passes; full 3/13).
Fun: the finales read as earned (see people check).
Winnable: the full seat is won on 3/13 runs; the tribute road is
currently shut by the honest veteran count (0 deliveries in 13 runs).

## Metric review

- M23-capstone: the analyzer's literal attempts==deliveries counts
  honest none-ready attempts as failures. Next run: count only
  refusals-despite-ready against the rule (or restate the rule as
  "deliveries == ready-kinds delivered AND 0 refused-despite-ready").
  Do NOT re-score this run — M23 pass B stands NO-GO as printed.
- M21-audit-crosscheck: the full-seat audit line carries no
  "waves 1–3 faced (N/N/N)" clause, so the parser marks every full
  seat AUDIT-UNPARSED (r178 had the same on its full seeds). Next run:
  parse the full-seat audit line, or exempt full seats with a direct
  satWaves check. Do NOT re-score this run.
- M25-buyout: vacuous a fourth straight run (no in-window day with
  pantry>=8000 at Haven and no bundle/kind ready — the early buy-out
  now buys the bundle before the window opens). Next run may drop it
  from the analyzer's printed set entirely.
- M24b: kept — the scholar+1 shape is the live agreement question
  until a seed exercises the refusal.
- M3-conversion: kept (standing tally).
- M5 on the wide pass: out of scope — the wide pass is judged on M25c
  + starvation only; the analyzer should not apply the full metric set
  to it. Next run: gate the wide pass's printed set.

## Findings appended to sim-findings.md

See sim-findings.md (r182 entries, 2026-11-11).
