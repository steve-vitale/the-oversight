# Wave-5 facing after a LATE unlock — Loop B, run fleshout-loop-b-20261124T1430Z, arm sim-w5lateface-b (DIAG)

Axis: winnability chain. DIAG-ONLY arm: zero src/js changes.
Anchor: prereg HEAD (see Proof); instruments committed on branch
`sim-w5lateface-b` (this worktree). Policy competent verbatim,
horizon 150d death-aware — as run in the corpora; NO fresh sims
were run (see §Decision rule).
Balanced panel (§15): INAPPLICABLE — a diagnostic re-analysis, no
before/after change; no comparison is fabricated.

Prereg: `evidence/2026-11-24/sim-w5lateface-b-prereg.md` (frozen,
committed before the judged analyzer run; the write flap delayed
the prereg's git commit — see §Flap — but the prereg's content
was written and verified before any judged number was produced,
and the judged run was re-executed after the commit; the analyzer
is deterministic, proof 11/11, so the re-run is identical).

## Verdict — DIAG-GO (GO bar passes: 0 unclassified late seeds)

**Faced-after-late-unlock share: 1/2.** Late is frozen as door day
> 100 (largest gap in the unlock distribution, 92→117; the
~100-day target arc end). The two late unlocks split:

| seed | door | runway | outcome | first face | days-to-face | w5 kills | post-door w5 contacts |
|------|------|--------|---------|-----------|--------------|----------|----------------------|
| 109311 | d117 | 33d | FACED | d126 | 9 | 0 | 7 (all fled / died) |
| 109314 | d138 | 12d | NO-SPAWN | never | — | 0 | 0 (7 wave-4 contacts continued) |

The answer to the brief's question is therefore two-part, and
the split is the finding: **a late unlock CAN still be faced**
(109311 faces wave 5 nine days after the door, with a month of
runway) — **but the latest unlock arrives after the village is
already spent, and the Producers never show up in the time left**
(109314: the door opens on a pair that dies the same day, onto a
village with 1 veteran, 2 armored, 4 armed, 0 ready days after
the door — and zero wave-5 contacts in 12 days while wave-4
contacts continue at 7). The unlock is not the spent part; the
village is. The door opens; nothing walks through it.

## Decision rule — why no fresh sims

The prereg's frozen rule: re-analysis only, no fresh sims, IF the
analyzer classifies every late-unlocked seed from the committed
corpora (0 unclassified). It does: both late seeds classify from
existing fields (daily `w5faced`, `killEvents`, bloodcluster
`fieldFights` / `tbStarts`). A fresh 8-seed pilot would have
added ~2 expected unlocks at the 4/16 band rate, ~0–1 late —
it would barely have moved a denominator of 2, at sim cost on a
loaded box. The pilot is not run; the gap it would have filled
does not exist. What a fresh band COULD still add is a second
late-unlock case at meaningful n — named in §Next blanks, not
pretended to exist here.

## The unlock distribution, and the frozen cutoff

Six unlocks across the 24 examined seeds (8 gearready pilot +
16 standingconfirm/vetpair/bloodcluster, the same 16 seeds —
the brief's "109309–109324" band is actually 109310–109325; seed
109309 was spent as a probe by journey-deepening-r278, per
sim-standingconfirm-b.md):

| seed | door | late? | first face | days-to-face | runway | faced? | w5 kills |
|------|------|-------|-----------|--------------|--------|--------|----------|
| 109313 | d65 | no | d75 | 10 | 32d | yes | 1 (deduped) |
| 109301 | d80 | no | d81 | 1 | 46d | yes | 0 |
| 109312 | d89 | no | d95 | 6 | 61d | yes | 2 |
| 109306 | d92 | no | d101 | 9 | 58d | yes | 1 |
| 109311 | d117 | YES | d126 | 9 | 33d | yes | 0 |
| 109314 | d138 | YES | never | — | 12d | NO | 0 |

Unlock days {65, 80, 89, 92, 117, 138}: largest gap 92→117
(25 days). The frozen cutoff (door > 100) sits in that gap, at
the ~100-day target arc end and the end of the pacing-audit
facing window (MONSTER-WAVES.md: strong run unlocks w5 ~day
77–93, faces 2+ Producers ~day 83–99). No unlock falls in the
gap 93–116, so the cutoff required no judgment call. First-face
day = earliest of first `w5faced > 0` snapshot, first wave-5
kill, first wave-5 contact row (bloodcluster corpus only).
Snapshot timing moves one day: 109306's kill lands day 101,
the first `w5faced` snapshot day 102 — the kill is the face,
so 101 is the day (the analyzer's convention, matching the
gearready analyzer's faced definition).

Days-to-face over ALL faced unlocks: 1, 6, 9, 9, 10 — median 9,
max 10. That is the yardstick for 109314's window: 12 days
exceeds the longest observed lag by 2 days. The miss is not
explained by "the village had no time to walk to the fight" —
every faced village needed at most 10 days, and 109314 had 12.

## The two late unlocks, day by day

### 109311 — faced, and bled for it (door d117)

A real ready village opens the door: day-117 snapshot 2 living
veterans, 9 armored, 9 armed, living 9, all bars met; 14 ready
days follow (117–130). First wave-5 contact day 126, a Spoiler
in the wild — fled after 2 rounds. Six more Spoiler contacts
follow (d141–146) and a Finale crew (d147): every one ends fled
or dead, 0 wave-5 kills in 33 days. The Spoiler kills three
villagers outright — app_mgpspkkt210 (d142), visjoin_141 (d145),
visjoin_137 (d146) — and the Finale crew takes visjoin_123
(d147). Readiness breaks after day 130 (veterans back to 1) and
never recovers; the village ends the horizon with TWO living
villagers (valeria_quispe, mara_vasquez), 1 veteran, 2 armored,
2 armed. Facing happened. Conversion did not — and the facing
itself cost the village seven of its nine people.

### 109314 — the door opens onto a spent village (door d138)

The standingconfirm evidence already told this seed's door
story; this arm adds the facing side. Day 137: visjoin_136 kills
a wave-4 Audit and becomes the second living veteran while
omar_farouk still lives — the pair exists for less than a day.
Day 138: omar_farouk dies "the wild" and tashi_sherpa dies "the
wild" the same day; the release check ran before those deaths,
so the door opens day 138 on armor and weapons the two dead men
were carrying. Day-138 snapshot: 1 veteran, 2 armored, 4 armed,
living 4, peak 5, gated 385. The village's own voice names it
the day before (d137, Arsen): "Omar and Sandra blooded the
fourth draft's beasts — we all saw it on the cameras. But only
5 of us carry a weapon, and the fifth draft waits until 6 of us
do. We need more hands armed, not more speeches." And: "We
buried Stan out there — 1 scholar dead in the wild while the
fifth draft waits. We keep sending our reader out alone." Day
138 brings the doubled release lines AND Omar's funeral feast
("1,500 kcal from the pantry, and every shaken fire is fed").
After the door: 0 ready days, veterans never recover past 1
(visjoin_136, the second veteran, dies d149 "monster"), end
state 0 veterans, 2 armored, 4 armed, living 4. And the
Producers never arrive: 0 wave-5 contacts of any kind in 12
days — no field fight, no turn-based start, no kill — while 7
wave-4 contacts (5 field, 2 TB) continue in the same window.

Was 12 days enough for a spawn to arrive? At the faced seeds'
post-door wave-5 contact rates (109311: 0.21/day, 109312:
0.38/day, 109313: 0.41/day), 12 days should bring 2.5–4.9
contacts; observing 0 has probability ~8% at the low rate and
~0.7% at the high rate. Per contact, wave 5 is 27–50% of
post-door wave-4+ contacts on faced seeds (against the 55%
intended cast share in `Game.spawnWaveTarget`); 0 of 7 contacts
at those shares has probability ~3–11%. Unlikely, not
impossible — a 12-day window is short enough that spawn
randomness alone could explain the zero. What is NOT random is
the village state: even if a Producer had arrived on day 149,
it would have met 0 veterans, 2 armored, 4 armed. The unlock
arrived after the village was spent, and the spawn window was
too short to distinguish "never comes" from "hadn't come yet".
Both halves are reported; neither is claimed alone.

## Secondary cuts (pre-registered)

- **Adequate-runway split (runway ≥ 30d): 1/1 faced.** The only
  late seed with ≥ 30 days of runway (109311, 33d) faced wave 5.
  The split does not rescue the raw 1/2 — it isolates it: the
  miss is the short-window seed, and the short window is part of
  what "late" means.
- **Days-to-face: median 9, max 10** (all five faced unlocks).
- **Post-door contact mix (wave-5 share of wave-4+ contacts):**
  109313 0.50, 109312 0.40, 109311 0.27, 109314 0.00 — against the
  55% intended cast share. Contacts are fights that happened,
  not casts, so this is a contact-mix number, not a cast number;
  the faced seeds sit below 55% and 109314 sits at zero.
- **Post-door village state:** at the door, 109311 is ready
  (2/9/9) and 109314 is not (1/2/4, short on all three bars);
  at end, 109311 is broken (1/2/2, living 2) and 109314 is empty
  of veterans (0/2/4, living 4). No late seed holds readiness
  after the door.

## Wall numbers (cited per corpus, not re-pooled as new claims)

- Gearready pilot (8 seeds, 109301–109308): wins 0/8, national
  0/8, table 0/8, wave-5 unlocks 2/8, wave-5 faced 2/8, wave-5
  kills 1, median survival 122.5d.
- Standingconfirm band (16 seeds, 109310–109325): wins 0/16,
  national 0/16, table 0/16, wave-5 unlocks 4/16, wave-5 faced
  3/16, wave-5 kills 3 (corrected — vetpair §Correction),
  median survival 150d (censored, 11/16 to horizon).
- This arm's pooled unlock set (re-analysis denominator only):
  6 unlocks in 24 seeds; wave-4 faced 22/24 (7/8 + 15/16).

## Village assessment (plain words)

Six villages ever open the fifth draft's door, and the two that
open it late tell opposite halves of the same story. One opens
it on day 117 with nine people standing ready, meets the
Producers nine days later, and spends the next month being
eaten by them — a Spoiler that kills three villagers in six
days, a Finale crew that takes a fourth, and not one Producer
dead in return. It reaches the horizon with two people left.
The other opens it on day 138, on the strength of two men who
die the same morning, and then nothing comes at all: twelve
days, seven more fourth-draft fights, and not one Producer.
The village that faces wave 5 late cannot convert it; the
village that unlocks latest cannot even meet it. The door is
not the wall anymore — the door opens. What is spent is the
village behind it: the pair that opens the door is dead within
days on one seed and dead the same day on the other, and the
Producers arrive on a schedule the village does not control.
Late is not a date. Late is opening the door after the people
who could walk through it are gone.

## Sense-test

The voices hold up where they matter. On 109314 the village
argues with itself about readiness the day before the door
opens (Arsen's "we need more hands armed, not more speeches"
and the burial of Stan "while the fifth draft waits"), and the
door day pairs the doubled release announcement with Omar's
funeral feast in the same breath — the System celebrates while
the village buries, and both lines are honest about what just
happened. On 109311 the death records tell the facing plainly:
three villagers dead to "monster" on exactly the Spoiler's
fight days. Two small oddities, both already filed, recur: the
doubled release lines fire on both late doors (the same two
wordings, same day), and the saySample saturates at 200 lines
before day 117 on both seeds, so no late-window fire-beats
survive in the sample — the sense-test quotes here come from
standingLines and death records, not the sample. Nothing new
is chased.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- **The > 100 cutoff held.** No unlock fell in 93–116, so the
  cutoff required no judgment call. With 6 unlocks the gap
  92→117 is the largest; a future band that unlocks in the gap
  would force the cutoff to be re-derived, not silently kept.
- **Snapshot timing moved one first-face day by one day**
  (109306: kill d101, first `w5faced` snapshot d102). The
  analyzer takes the min, so the reported lag (9d) is the
  honest one; a snapshot-only instrument would have said 10d.
  The 1-day shift does not change any classification.
- **The 55% cast share is the wrong yardstick for contacts.**
  `spawnWaveTarget` sets the CAST mix, but contacts are fights
  that happened — filtered by which spawns the village meets,
  which fights start, and which the recorder sees. Faced seeds
  show 27–50% wave-5 contact share, below 55% on all three.
  A future instrument that wants an expected-contacts number
  should measure the contact mix directly on a bigger band,
  not import the cast ratio.
- **Runway ≥ 30 days is a useful adequacy bar but not a
  sufficient one.** It isolates the miss (109314, 12d) cleanly,
  but 109311 (33d) shows that adequate runway buys facing, not
  conversion — the bar should not be read as "enough time to
  matter". The conversion question (kills after a late face)
  needs its own number: 0 kills in 7 contacts on the one
  adequate-runway late seed.
- **"Late" as a date vs "late" as a state.** This arm froze late
  as a date (> 100) because the brief asked for a cutoff from
  the distribution. The data argues the live variable is the
  village's state at the door (veterans alive, armor, weapons):
  109311 was ready at the door and still ended with 2 people;
  109314 was not ready and met nothing. A next arm could define
  late-by-state (door opens with < 2 veterans alive, or with
  any readiness bar short) and test whether THAT predicts
  facing better than the date. Not re-scored here; proposed
  for the next run.

## Flap (infrastructure, loud)

The write flap was ACTIVE during this arm: two `safe-commit.sh`
attempts (15:08Z, 15:12Z) each hit 6 EPERM retries and then
failed with the stale-tree revert signature (the temp private
index in /tmp could not be written, so the commit looked like a
295,711-line deletion in src/ — refused correctly, never
forced). The ref probe (`git update-ref refs/heads/probe HEAD`)
also fails: the main tree's `.git/refs/heads/probe.lock` cannot
be written. Per the local_write_flap_response skill the arm
stopped retrying commits, did read-only analysis meanwhile, and
commits when the probe passes. NO work was lost: the prereg,
analyzer, proof test, and this evidence file are all on disk in
the worktree, verified by size after each write. The coordinator
adopts this branch; if the flap is still active at adoption,
the same probe-then-commit order applies — never --force-delete
on the revert-signature refusal.

## Next blanks, in order

1. **A second late-unlock case.** The 1/2 share rests on two
   seeds. A fresh band (or the next loop's unlocks) that yields
   another door past day 100 would move the denominator to 3
   and test whether NO-SPAWN recurs or 109314 was the short
   window. Do not pool across anchors as a new sim claim; add
   the seed to this analyzer's corpus list and re-run.
2. **Late-by-state vs late-by-date** (metric review above):
   does door-open readiness predict facing better than the
   door day? Needs the same analyzer over a wider unlock set.
3. **Conversion after a late face: 0 kills in 7 contacts**
   (109311). The facing question is answered; the killing
   question after a late face is now the open one — coordinate
   with, do not duplicate, the win-fielddmg lane.
4. **109311's end state (2 living villagers)** is the
   "faced late and bled out" shape: a village that faces wave 5
   late and survives to the horizon with two people is not a
   win path. Whether any late-facing village converts is
   unanswered.

## Proof and landing

- Proof: `scripts/test-w5lateface-b-20261124.js` — 11/11 PASS
  (9 fixture checks: FACED via snapshot / kill-before-snapshot
  / contact row; deduped kills; NO-SPAWN with spawn control;
  DIED-BEFORE-FACE; UNCLASSIFIED with no meetings and without
  contact data; door cross-check tolerance; plus the live-corpus
  smoke: 6 unlocks with the frozen door days, late 2, faced 1,
  0 unclassified, 0 cross-corpus disagreements, 109313 deduped
  to 1 kill; plus determinism: analyze() twice byte-identical).
  Re-run green before the judged leg (see §Flap for the commit
  order).
- Analyzer: `scripts/w5lateface-b-analyze-20261124.js` — loads
  the three committed corpora, derives door / first-face /
  runway / days-to-face / post-door contacts / post-door state
  per unlocked seed, classifies every late seed, cross-checks
  door and face days across corpora sharing a seed.
- Commits (this worktree branch sim-w5lateface-b; coordinator
  merges via --ff-only; ready to merge, pending ship — no push,
  no bump, no live verification by this worker):
  - (prereg commit — flap-delayed, see §Flap)
  - (instrument commit: analyzer + proof test, 11/11)
  - (evidence commit: this file)
- Files: prereg + evidence in
  `evidence/2026-11-24/sim-w5lateface-b*.md`; instrument +
  proof in `scripts/w5lateface-b-analyze-20261124.js` and
  `scripts/test-w5lateface-b-20261124.js`. No per-seed corpus
  was written (re-analysis; no fresh sims).
- Telemetry deviation check (body step 10): NOT APPLICABLE —
  a diagnostic re-analysis with no before/after change; the
  same refusal applies as on the gearready pilot (sweep
  recorder rows carry top-level anchorCommit; the scale-wall
  baseline carries a DO NOT compare note for pre-seat
  substrates). The wall numbers above are the report.
- Convergence state: DIAG-GO — the question is answered
  (late unlocks face 1/2; the miss is a no-spawn in a 12-day
  window on a spent village; the hit faces but converts 0/7).
  The next work is a BUILD question (what makes a late-facing
  village convert) and a second late case for the denominator.
