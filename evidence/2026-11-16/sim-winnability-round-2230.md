# sim-winnability-round-2230 — coordinator evidence (Loop B adoption)

Run `fleshout-loop-b-20261116T2230Z` (Loop B), axis winnability chain.
Timed-out round; both arms finished in-tree but the coordinator died
before closeout. The adoption ran in the main session: medicduty-b was
complete and committed (merge backgrounded, then re-based and landed
by the adoption); wave5face-b had corpora + analysis + sense file
uncommitted and no evidence file (finished, committed, and landed by
the adoption).

## Arms

### sim-medicduty-b — DIAG GO (tracker blank #6)

**LANDED `302640180`** (prereg + instrument + evidence + corpora; proof
re-run 74/74 on the rebased tip). Fresh band 102801–102808, 150d,
competent verbatim. All 4 frozen bars hold: 208/208 attempts
classified, unknown 0; corpus 16/16 parse; proof 74/74; wall numbers
both legs. D2 full-band: 0 divergences.

The medic-duty starvation is REAL on a fresh band, but rarer and
narrower than the haventarget band suggested — and it is not the
dominant zero-launch cause here. Medic-duty blocks are 6 of 208
attempts (2.9%, vs 26/198 = 13.1% on the haventarget band). Zero
starved seeds by the frozen definition (same holder re-picked ≥3 times
AND 0 launches): Asher on 102807 was re-picked twice and launched
nothing — a near miss, not a starve. Zero-launch seeds are 3/8, but
only one is medic-duty-attributable; the other two (102803, 102806)
never attempted a launch at all in 150 days — a different, unmeasured
mechanism (expedition ignition). On 4 of 6 medic-duty blocks a
launch-eligible non-duty villager existed and was never tried —
candidate-selection failure, not pool exhaustion.

New finding, filed to the findings backlog (line 2462): the companion
call clobbers a live expedition. `startExpedition` has no already-out
guard, so the companion leg of a `party_launch` overwrites whatever
expedition the companion is already on — 12 landed calls replaced a
live record, 2 distinguishable orphans losing 806 / 873 kcal of
finds, 10 same-part replacements folded silently into the first
launch's row.

Wall (both legs identical): national by standing 3/8, by rank 0/8,
table 0, wins 0, wave-4 8/8, wave-5 3/8, median 150d, wave-4 kills
22, deaths 629. Evidence: `evidence/2026-11-16/sim-medicduty-b.md`.

### sim-wave5face-b — DIAG GO (tracker blank #8)

**LANDED `266cc85b0`** (prereg + instrument + Correction 1 + evidence
+ corpora + sense file; proof 47/47 on the rebased tip —
`scripts/test-wave5face-b-20261116.js`; the worker's
log records 42/42 at instrument time; the Correction 1 fixtures raised
it to 47). Band 102701–102708 reused from stand199, horizon 200d,
competent verbatim. All 4 frozen bars hold: 8/8 valid corpora, 0
instrument errors, reconciliation clean; proof green; facing answered
for 5/5 released seeds; wall numbers both legs. D2 full-band: 0
divergences. 150d-prefix vs the committed stand199 ON corpus: 8/8
identical — the r140 policy/conversation changes moved nothing on
this band.

**5 of 5 released seeds faced wave 5 by d200** (first facing 0–15
days after release), 15 engagements, 3 killed / 8 fled / 4 died.
102706 — the seed this arm exists for — released d151 and faced 3
wave-5 types starting d158 (Nielsen, Timeslot, Editor), killed 4
wave-5 monsters without a killed engagement (repeat-type dedupe /
unseen paths), lost d183. The released set grew to 5 (102703 released
d154, a genuine horizon effect). But nobody survives the open door:
0/8 alive at d200, national by rank 0/8, table 0, wins 0. The facing
is real; the wave-5 surviving is not. 102702's three facings each
cost a villager's life that day (3 engagements, 3 death-days, 0
kills).

Sense leg: 102706 re-run with `captureSysSay`, trajectory identical
(0 diffs, 181/181 days). The release is voiced with fanfare ("the
Producers have greenlit the fifth draft"); the fight itself reads as
a repeated tick ("✂️ RERUN ×4 The Editor's turn" ×60+). Documented
as a sense observation.

Adoption finding: the prereg's Correction 1 note claims corrected
outcome totals killed 3 / fled 10 / died 2. **Wrong — the corrected
corpus and the analyzer's re-derivation say killed 3 / fled 8 /
died 4** (`outcomeRederiveMismatches: 0`). The corrected `died` rule
also flips 102702 d98 Rerun and d155 Cancellation from fled to died
(real villager wild-deaths those days that v1's kind-read missed),
not only the Nielsen flip the note names. The on-disk analysis.json
was the stale v1 output; the adoption overwrote it with the corrected
analyzer run. The facing verdict is unchanged (5/5). Full account in
the arm evidence. Evidence:
`evidence/2026-11-16/sim-wave5face-b.md`.

## Round wall

| | medicduty band 102801–102808 | wave5face band 102701–102708 |
|---|---|---|
| National by standing ≥200 | 3/8 | 5/8 |
| National by scaleRank | 0/8 | 0/8 |
| Table (seat taken) | 0/8 | 0/8 |
| Wins | 0/8 | 0/8 |
| Wave-4 reached | 8/8 | 8/8 |
| Wave-5 unlocked | 3/8 | 5/8 |
| Wave-5 faced (released) | — | 5/5 |
| Median survival | 150d | 139d |
| Survived | 5/8 | 0/8 |

The wall has not moved: no table, no wins on either band. The round's
yield is diagnostic — the medic-duty starvation is real but narrow
(and not the dominant zero-launch cause), the wave-5 facing question
is closed with a yes, and two new mechanisms are named for the next
arms (expedition ignition on zero-attempt seeds; the companion-call
expedition clobber).

## Metric review (prereg §14)

1. **Medicduty's starved bar is a near-miss instrument, not a miss.**
   Asher re-picked twice, bar ≥3. The bar did its job (it kept a
   2-re-pick seed from counting as starved), and the near miss is
   reported, not rounded up. A future bar could judge re-picks ≥2
   with 0 launches as "grounded" — but that would be a new bar, not
   a re-score of this one.
2. **Wave5face's corrected totals needed the corpus, not the note.**
   The prereg's Correction 1 narrative undercounted the died flips
   (see the arm evidence). Lesson: a correction's claimed totals
   must be re-derived by the analyzer before the evidence is
   written — the adoption did that here.
3. **The wave-5 kill count is not readable off engagements.**
   w5kills 7 vs engagement-kills 3 (repeat-type dedupe + unseen
   paths). Any next arm judging wave-5 kills must wrap the kill
   paths directly.
4. **Telemetry check refused recorder-corpus input on both arms'**
   per-seed corpora (same documented refusal as the 1515Z / 1631Z /
   1730Z / 2215Z checks); baseline NOT rolled.

## Infrastructure

- The 2230Z round timed out at the 2h cron limit; its lock
  (`fleshout-loop-b.lock`, run `fleshout-loop-b-20261116T2230Z`)
  and claim (`fleshout-loop-b-20261116T2230Z.json`) are deleted /
  closed with this evidence file.
- Medicduty-b's background ff-merge did not land (master moved
  under it when trickshare landed on top of the ship bump). The
  adoption rebased it onto `7eaac5524`, re-ran proof 74/74, merged
  ff-only (`302640180`), released the tree, deleted the branch.
- Wave5face-b's worker was cancelled before writing the evidence
  file. The adoption re-ran the analyzer (corrected totals),
  verified the sense file on disk, wrote the evidence file,
  committed, rebased onto `302640180`, re-ran proof 47/47
  (`scripts/test-wave5face-b-20261116.js`), merged
  ff-only (`266cc85b0`), released the tree, deleted the branch.
- Safe-commit index clobber struck the wave5face evidence commit
  (19 files staged-deleted + untracked duplicates) — repaired via
  ls-tree pipe, commit verified correct. The medicduty merge commit
  itself was clean.
- No host write-flap EPERM this run. Disk 47% at adoption start.

## Next

- **Expedition ignition DIAG** (the next medicduty follow-up): why
  do 102803/102806 never attempt a launch in 150 days — no commit,
  commit-but-no-depart, or chance roll? Needs a commit/attempt row
  (who held the commit, what the depart returned) before the
  zero-attempt mechanism can be judged.
- **Companion-call clobber** (findings backlog line 2462): should a
  companion call skip a villager who is already out, or wait for
  their return? A design question for the departures owner.
- **Wave-5 surviving** (the next wave5face follow-up): facing is
  closed; surviving the facing is now the binding link — 0/8 alive
  at d200 on a band where 5/5 released faced.
