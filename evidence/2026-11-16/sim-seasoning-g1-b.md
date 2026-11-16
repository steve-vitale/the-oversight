# sim-seasoning-g1-b — EVIDENCE (RE-JUDGMENT: seasoning gate G1 under the phase-corrected classifier)

Run: fleshout-loop-b-20261116T2030Z (Loop B), arm sim-seasoning-g1-b
Axis: winnability chain. Tracker blank #5 (seasoning gate G1 ruling),
held by Loop B.
Branch: sim-seasoning-g1-b — worktree ~/workspace/worktrees/sim-seasoning-g1-b
Prereg: evidence/2026-11-16/sim-seasoning-g1-b-prereg.md (FROZEN,
committed with this arm — judged against it as written; the one
imprecision in it is reported under "Prediction check", not silently
fixed).
Base at run: master tip 7bb50f3dc.
Date: 2026-11-16. Type: RE-JUDGMENT — no new sims, no game change, no
default flipped, no lever. The committed corpora from sim-seasoning-b
(band 102201–102208, 150d, 16 configs) are re-read under the corrected
instrument. Zero src/js in the branch diff (verified: worktree src/
matches HEAD blobs; branch commits touch no src/js).

## Canon note

docs/CANON.md was read. **No canon doc covers the seasoning gate
itself** — the manifest lists no diplomacy / covenant / link seasoning
doc. The seasoning rule is defined in code only (hierarchy.js
_linkSeasoned / _covenantPolity / _checkNational, as quoted in the
frozen prereg). Nothing is invented here.

## Verdict: GO (G1 GO, G2 GO, G3 GO) — re-judgment, no game change

- G1 INSTRUMENT VALIDITY (corrected) — GO. Under the phase-corrected
  classifier on the existing 16-file corpus: **unknown 0 band-wide**,
  **0 unknown days**, **9 precursor days** (8 first-staging
  qualification days + 1 re-stage precursor), every staging decision
  classified (staged / seasoning-blocked / other-blocked /
  staged-precursor). The corrected proof's --corpus "unknown 0" check
  PASSES — the check the frozen proof failed (65/66). The frozen
  numbers are reproduced exactly alongside (band unknown=4,
  unclassifiedDays=9) by the untouched frozen exports, whose default
  output re-run is byte-identical to seasoning-b-analysis.json.
- G2 THE MEASUREMENT (corrected) — GO. Corrected per-seed verdicts +
  corrected daysLost (frozen alongside) + corrected decisive blockers
  computed for all 16 configs; seasoning-blocked share reported per
  leg and band-wide under corrected verdicts; wall carries all three
  national reads. Every prereg prediction about a judged number
  matched exactly (daysLost, decisive links, seasoning share, wall
  raw reads); the one imprecision was in a firstOpportunityDay
  prediction that named one seed where four moved by the same rule —
  reported under "Prediction check", no judged number affected.
- G3 LEVER-ONLY — GO. Zero src/js changes in the branch diff; proofs
  green at the recorded baselines (see Proof section).

## G1 ruling, in one plain sentence

The seasoning gate's G1 ruling stands on numbers now, not just on
day-level argument: under the corrected instrument every staging
decision in the corpus is classified and none is left unexplained
(unknown 0), so the gate is a real, voiced, measurable wait — not a
mystery.

## The answer (tracker blank #5)

The frozen arm's GO verdict survives the correction intact — and the
correction changes the numbers by exactly the one day the phase model
predicted, on exactly the four seeds it predicted:

- Courtship leg (armed): **8/8 staged**, as frozen. Corrected
  daysLost **[0, 11, 1, 0, 0, 0, 17, 30]** (median **0.5d**), frozen
  [0, 12, 2, 0, 0, 0, 18, 31] (median 1d). The four seeds where the
  first opportunity came before the answer day each lose exactly one
  day — the qualification day itself, which the frozen definition
  counted as lost although the staging was already decided at that
  day's close.
- Covenant leg (control): **0/8 staged**, as frozen. The single
  seasoning-blocked non-stage (102204, 44 blocked days, 44 censored
  days lost) is byte-for-byte unchanged by the correction — the
  correction only touches staging days, and this seed never staged.
- Seasoning-blocked share of non-stages: **1/8 (12.5%)** band-wide,
  unchanged. Seasoning is still the tax on the road to national, not
  the wall — on this band. The control leg's binding constraint is
  still link formation (7/8 other-blocked), not seasoning.

## Corrected vs frozen numbers

| quantity | frozen | corrected |
|----------|--------|-----------|
| band unknown (seeds) | 4 | **0** |
| unclassified / unknown days | 9 | **0** (9 precursor days) |
| courtship daysLost (staged) | [0, 12, 2, 0, 0, 0, 18, 31], median 1d | **[0, 11, 1, 0, 0, 0, 17, 30], median 0.5d** |
| covenant daysLost (102204, censored) | 44 | 44 (unchanged) |
| decisive non-null (courtship) | 0/8 (all null) | **4/8** (the four link-seasoning seeds; null-by-design on the four rung seeds) |
| seasoning-blocked share | 1/8 = 12.5% | 1/8 = 12.5% (unchanged) |
| D3 engine-agreement | 150/150 blocked, 11/11 staged, 0 misses | same (unchanged) |
| wall national, gated standing ≥200 | covenant 2/8, courtship 0/8 | same + raw read: covenant 6/8, courtship 7/8 |

## Per-seed corrected table (courtship leg — armed)

| seed | verdict | qualDay | answerDay | firstOpp (corr / frozen) | daysLost (corr / frozen) | decisive (corrected) |
|------|---------|---------|-----------|--------------------------|--------------------------|----------------------|
| 102201 | staged | d61 | d62 | d61 / d62 | 0 / 0 | rung (all 3 seasoned by d60; rung met d61) — null by design |
| 102202 | staged | d72 | d73 | d61 / d61 | 11 / 12 | village_spl_26_60773 — age 29→30 on d72 |
| 102203 | staged | d73 | d74 | d72 / d72 | 1 / 2 | village_1 (Stonebridge) — trust 38→46 on d73 |
| 102204 | staged | d63 | d64 | d63 / d64 | 0 / 0 | rung — null by design |
| 102205 | staged | d66 | d67 | d66 / d67 | 0 / 0 | rung — null by design |
| 102206 | staged | d64 | d65 | d64 / d65 | 0 / 0 | rung — null by design |
| 102207 | staged | d78 | d79 | d61 / d61 | 17 / 18 | village_spl_38_6557 — age 29→30 on d78 |
| 102208 | staged | d92 | d93 | d62 / d62 | 30 / 31 | village_spl_31_32776 — age 29→30 on d92 |

Per-seed corrected table (covenant leg — control): identical to the
frozen table on every field. 102204 seasoning-blocked (44 blocked
days, 44 censored days lost; decisive-frozen: village_3, formed d107,
age 43, trust 26 — age met, trust owed 14). The other 7 other-blocked
(no-peer-links / formed-short). No precursor days, no unknown days on
this leg under either instrument.

Re-stage precursors: exactly one — **102207 d142** (answer d143),
the only post-first-staging precursor in the corpus. Its council line
is cut by the 900-line cap (linkLines end d102 on that seed); the
answer event is uncapped and records it. The other two re-stages
(102203 d148, 102206 d134) have no separate precursor day —
qualification and answer fall on the same day (pending snapshot) —
and are classified, not unknown, under both instruments.

## Wall table (national THREE ways, per prereg item 5)

| leg | n | standing≥200 (gated) | standingRaw≥200 (raw) | scaleRank national (final) | nationalEver | table | wins | wave4ever | wave5ever | wave4 kills | wave5 kills | median survival | max | survived |
|-----|---|----------------------|-----------------------|----------------------------|--------------|-------|------|-----------|-----------|-------------|-------------|----------|-----|----------|
| covenant | 8 | 2/8 | **6/8** | 0/8 | 0/8 | 0 | 0 | 8/8 | 2/8 | 28 | 0 | 150.5d | 151d | 7/8 |
| courtship | 8 | 0/8 | **7/8** | 7/8 | 8/8 | 0 | 0 | 8/8 | 0/8 | 20 | 0 | 151d | 151d | 7/8 |

The three national reads still disagree, in the same pattern the
frozen arm reported (findings #2422): the 199 regional cap pins gated
standing at 199 while raw standing runs to 515, so standing≥200 and
national disagree in opposite directions across legs. Carrying the raw
read alongside (item 5) does not resolve the divergence — it makes it
legible: by raw standing the covenant leg would read 6/8 national and
the courtship leg 7/8, while the engine's own scaleRank says 0/8 and
7/8. The gated read is the most misleading of the three on this band
(courtship 0/8 while 8/8 actually reached national). No table, no
wins on either leg; wave 5 reached on 2/8 covenant seeds, 0 kills
anywhere. Total deaths: covenant 567, courtship 472; starvation
deaths 0 on both legs. The one village lost (102206, both legs, d137)
is the only non-survivor.

## Sense-testing (SENSE-TESTING LAW)

The staging lines that decide the qualification days are in the
record, dated the qualification day itself, on all 8 staged seeds —
the founding-council scene plus the Codex line, a pair:

> "🤝 The founding council: speakers from [Stonebridge, Thornfield,
> The Hungry Road] sit in a circle — no throne, no kneeling. This
> league needs its first act. Swear the war-PACT (mutual defense —
> any member's call is answered, or refused aloud), found the shared
> POOL (2,000 kcal a week from every fire into one granary, drawn in
> famine), or WALK from this table for now. Or REFUSE the scale
> itself — stay a fr…" (102202 d72; the record truncates at 400 chars)
>
> "📓 Codex: National beat staged: covenant (4 villages)." (102202 d72)

The same pair appears on d61 (102201: Thornfield, Emberhold,
Stonebridge), d73 (102203: Emberhold, Stonebridge, Thornfield), d63
(102204), d66 (102205), d64 (102206), d78 (102207: Thornfield,
Stonebridge, The Hungry Road II), d92 (102208: Stonebridge,
Thornfield, The Red Table II) — qualification day / answer day in
each case. The corrected classifier reads the answer (uncapped
verbEvents) as authoritative and the staging line as supporting
evidence; both channels agree on all 8 seeds, and the Codex line is
what makes the precursor visible in the capped voice record at all.

The one staging the voice record cannot show is the 102207 d142
re-stage: linkLines end d102 on that seed (cap), so there is no
council line to quote — only the answerNationalChoice event on d143.
The re-stage is classified, not unknown, but it cannot be
sense-tested from the spoken record. That is the same cap bite the
frozen arm recorded (item 4, left as-is by design).

Judgment, unchanged from the frozen arm: the wait reads as a
relationship maturing. The game says on day one of the third bond
that seasons are owed, warns aloud when a bond cools, and convenes
the council the day the bond seasons. Nothing about the gate is
silent — except the blocked covenant wait on 102204, whose voice
record the cap ate (d88), and the 102207 re-stage. The correction
changes no sense verdict; it changes the instrument so the numbers
say what the lines already said.

## Village assessment (what the villages looked like)

Unchanged from the frozen arm — the re-judgment re-reads the same
villages, and no village fact moved. Covenant villages are
diplomatically thin (4/8 never formed a single covenant peer link);
courtship villages are diplomatically alive (8/8 staged, council
scenes on all 8) but half lost national within ~60 days on a
one-point trust dip. Survival is not the story on this band (7/8
survived both legs, median ~151d, 0 starvation deaths); the scale
wall moved (national reached 8/8 armed) without the win moving at
all — no table, no wins, wave 5 barely touched (2/8 covenant seeds
reached it, 0 kills). The one number that moved under the correction
is the seasoning tax: a median half-day wait instead of one day.
Seasoning was never the wall; the correction makes it a smaller tax
than the frozen numbers already said it was.

## Telemetry deviation check (§10)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-16/perseed-seasoning-b-control/seasoning-b-*.json'
--metrics national,table,wins,exiled --sweep-rows` (and the same for
the -on leg): **REFUSED by the tool, exit 2, both legs** — "refusing
recorder-corpus input: all 8 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs. Recorder
corpora are compared with sweep-compare tables, never against a run
baseline here." No LOUD lines were produced, because no compare ran.
The refusal was NOT bypassed with --allow-recorder-corpus: that flag
is for same-shape recorder-vs-recorder compares, and the baseline is
a run baseline — and the baseline's own _regime note warns that this
winseat baseline ("national 12/16, table 16/16, wins 16/16") must
NOT be compared against pre-seat / courtship substrates, where wins
are structurally ~0 and the check would fire a spurious LOUD "wins
disappeared". Forcing the compare would manufacture a regime
artifact. **Baseline NOT rolled.** Wall numbers for this run are the
corrected analysis table above.

## Prediction check (prereg §G2)

Predictions from the frozen evidence's hand analysis, confirmed or
refuted:

- Corrected daysLost [0, 11, 1, 0, 0, 0, 17, 30], median 0.5d —
  CONFIRMED exactly.
- Decisive non-null exactly on 102202 / 102203 / 102207 / 102208
  with the predicted links, null-by-design on the four rung seeds —
  CONFIRMED exactly.
- Seasoning-blocked share 1/8 (12.5%) unchanged — CONFIRMED.
- Wall raw reads covenant 6/8, courtship 7/8 — CONFIRMED.
- Corrected firstOpportunityDay "102201 d61 (frozen d62), all other
  seeds unchanged" — IMPRECISE, reported not hidden. The same
  one-day shift applies to the other three rung seeds (102204 d64→d63,
  102205 d67→d66, 102206 d65→d64): the precursor day is the first
  opportunity day on all four, by the same rule the prereg stated for
  102201. DaysLost is 0 on all four either way, so no judged number
  moved; the prereg named one seed where four moved. The mechanism
  was correctly predicted; the enumeration was not. G2's bar is that
  the corrected numbers are computed and reported, which they are —
  G2 stands.

## Proof

- test-seasoning-g1-b.js (new, this arm): **56/56, 0 failed** —
  static (corrected exports exist, frozen semantics preserved,
  LINK_LINES_CAP still 900, zero src/js), classifySeasoningDayCorrected
  fixtures (precursor / two-snapshot unknown / qualified-first /
  seas-count-mismatch precursor / pass-through), analyzeSeasoningCorrected
  fixtures (P corpus-mirror, A answer-fallback, F qualified-never-staged,
  U two-snapshot run then lapse, L line-only precursor, G staged-after-shadow),
  wall raw-standing read, determinism leg (corrected analysis twice
  identical; corrected CLI twice byte-identical; corrected CLI output
  byte-identical to the committed seasoning-g1-b-analysis.json; frozen
  analysis re-run byte-identical to the committed
  seasoning-b-analysis.json), corpus re-judgment checks (G1 unknown 0,
  daysLost / firstOpp / qualDay / decisive per-seed predictions, wall
  raw reads, D3 unchanged).
- test-seasoning-b.js (frozen, untouched): **59/59, 0 failed**
  (non-corpus mode; D1 live leg 334.4s for 2x150d, seed 102201
  courtship, in-memory determinism); --corpus mode: **65 passed, 1
  failed** — the single failure is the known artifact, "classification
  completeness: unknown 0 band-wide — unknown=4" (the frozen
  instrument, by design; superseded by the corrected instrument's
  corpus check, which passes in test-seasoning-g1-b.js). All other
  corpus checks pass (16/16 files, every record parses with a full
  series and 0 instrument errors, every seed a known verdict, D3
  150/150, 11/11, 0 misses).
- Corrected analysis: `node scripts/analyze-seasoning-b.js --corrected`
  writes evidence/2026-11-16/seasoning-g1-b-analysis.json (determinism
  leg above: byte-identical on re-run).
- Frozen analysis: `node scripts/analyze-seasoning-b.js` re-run from
  the corpora is BYTE-IDENTICAL to
  evidence/2026-11-16/seasoning-b-analysis.json (verified in the proof
  and by direct cmp).
- Branch diff vs master (7bb50f3dc..HEAD): zero src/js (verified via
  read-only git plumbing in the proof).

## Metric review (for the NEXT run — §14 binding)

1. **Prereg enumeration imprecision (this run, not assumed):** the
   prereg predicted the firstOpportunityDay shift on 102201 only;
   the same rule moves it on all four rung seeds. No judged number
   was affected (daysLost 0 on all four either way). Next run: when a
   rule moves a derived field, enumerate every seed the rule touches
   or state the rule without enumerating.
2. **Fixture-modeling correction (found in proof, fixed in the test,
   not in the analyzer):** the first proof draft of fixtures U and L
   failed (54/56) because fakeSeries left the covenant candidate
   present after a link unseasoned — an unphysical record, since
   _covenantPolity returns null when fewer than 3 links are seasoned.
   The analyzer was right to call those days unknown (candidate over
   unseasoned links is genuinely unexplained); the fixtures were
   wrong. Fixed by adding candTo to the fixture builder so the
   candidate goes null when seasoning lapses, mirroring the engine.
   Lesson for future fixture builders: the candidate roll and the
   links roll must agree, as they do in the real corpus (D3 150/150);
   a fixture that disagrees them tests the mismatch path, not the
   intended path. No assertion was loosened: the two failing checks
   now pass on the corrected fixtures at the values the rule predicts
   (U unknownDays [51]; L precursor [50], verdict seasoning-blocked).
3. **Unknown-day operationalization (stated for the record):** "two
   consecutive qualified snapshots, no staging between" is
   implemented as: a should-stage day counts as unknown when the
   previous day was also should-stage AND no staging follows within
   one boundary of it; the first day of a run is qualified-first and
   is never counted. A two-day qualified run that ends in staging
   therefore produces 0 unknown days (fixture P's shape, and the
   corpus's shape); a three-day run ending in staging produces 1.
   The corpus never exercises the three-day case — if a future corpus
   does, that single unknown day is a genuine flag (the phase model
   predicts staging at the close of the FIRST qualified day), not an
   artifact to re-score away.
4. **Item 4 (LINK_LINES_CAP) stands:** cap left at 900, untouched.
   The 102207 d142 re-stage council line is still unquotable. The
   corrected classifier does not need the line (the uncapped answer
   event decides precursor status), so the cap no longer blocks the
   G1 judgment — but any future sense-testing of late re-stages still
   needs either a higher cap on DIAG arms or a separate uncapped
   council channel. Unchanged from the frozen arm's recommendation.
5. **Gated standing is the most misleading of the three national
   reads on this band** (courtship 0/8 gated while 8/8 reached
   national). Future wall tables should lead with scaleRank +
   nationalEver and treat gated standing as the capped instrument it
   is; the raw read is the middle ground, not the truth.
6. **No test was edited to go green.** The frozen test file is
   untouched; the frozen analyzer's exports keep frozen semantics
   (proven by the frozen test + the byte-identical frozen output);
   the two proof failures during development were fixture-modeling
   errors fixed by making the fixtures physical (see item 2), with
   the assertions unchanged in intent and the corrected values
   matching the rule's predictions.

## Convergence state

Seasoning-gate G1 re-judgment: **GO**. The G1 ruling now stands on
numbers: unknown 0 under the corrected instrument, every staging
decision classified, the frozen proof's single failing check passing
under the corrected instrument. Tracker blank #5 closes. The
measurement stands as refined: on band 102201–102208 at 150d,
seasoning blocks 1/8 of covenant non-stages (12.5% band-wide) and
taxes staged courtship seeds a median 0.5 days (was 1 day frozen);
the control leg's binding constraint is link formation (7/8
other-blocked), not seasoning. No game change — zero src/js in the
branch, instrument + proof + evidence only. Committed for the
coordinator to merge --ff-only; merged locally, pending ship (ship
loop owns pushes).

## Files

- Prereg: evidence/2026-11-16/sim-seasoning-g1-b-prereg.md (frozen)
- Instrument: scripts/analyze-seasoning-b.js (additive corrected
  exports + --corrected CLI mode; frozen exports untouched)
- Proof: scripts/test-seasoning-g1-b.js (new; 56/56)
- Corpora (unchanged, committed): evidence/2026-11-16/
  perseed-seasoning-b-control/ (8 files) and perseed-seasoning-b-on/
  (8 files)
- Frozen analysis (unchanged): evidence/2026-11-16/
  seasoning-b-analysis.json (re-run byte-identical)
- Corrected analysis: evidence/2026-11-16/seasoning-g1-b-analysis.json
  (determinism leg: byte-identical on re-run)
- Evidence: this file.
