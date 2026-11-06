# Midnight-spanning kill matching — the fight recorder counts kills logged the next day — PRE-REGISTRATION (arm sim-midnightkill-b)

Run: fleshout-loop-b-20261106T1730Z (Loop B, second axis, arm 3 of 3).
Axis: winnability chain (wild ally-join → wave-4 kills → veterans →
readiness-5 release → wave-5 facing → full seat). Committed BEFORE any
judged re-match. INSTRUMENT FIX ONLY: scripts/* recorder/matcher code
only, zero src/js, no policy built, no lever piloted, no gate / price /
deed / readyDemand change. The recorder is the deliverable; no village
lives longer or kills more because of this fix — the kills already
happened; only the recorder sees them now.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md`: wave-4 bands
  damage 35–95, HP 850–1500; "VETERANS — living roster members with a
  recorded kill of a wave-(w-1)+ monster in `state.waveKillLog`"
  (MONSTER-WAVES.md:398). The log is the authority for who killed
  what — which is why the fix joins the trace to the log instead of
  adding a new hook. No canon invented here.
- "Monster encounters are fought, not rolled" (CANON.md): the fix
  classifies the fight the engine actually fought from engine
  records — the log entry plus the trace — never a SAY line, never
  an outcome table.
- The 2026-10-17 pyrrhic boundary (finding #466): `recordPyrrhicKill`
  deliberately scores NO wave-unlock deeds and pays NO loot/carcass.
  This arm does NOT touch that boundary: it only changes WHEN a log
  entry may match a trace (fight day ± 1 instead of fight day only).
  No deed, no loot, no unlock behavior changes.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-06/sim-partydamage-b.md` (+ prereg), run
  fleshout-loop-b-20261106T1630Z, band 87001–87008, corpus
  `evidence/2026-11-06/perseed-partydamage-b/` (16 files): armed
  wave-4 TB kill rate 2/24 = 8.3% by the log, but only 1/24 = 4.2%
  by same-day matching — the 87004 d117/118 kill (Nadia Khoury vs
  Influencer, fight day 117, kill logged day 118) was classified
  'rout' with mHpLeft 0. Its metric review names the fix: match
  kills across the midnight boundary (fight day ± 1) instead of
  same-day only. The 1630Z B run's blank (5).
- `evidence/2026-11-06/sim-fightinterior-b.md` (+ prereg), run
  fleshout-loop-b-20261106T1430Z, band 51001–51008, corpus
  `evidence/2026-11-06/perseed-fightinterior-b/` (16 files):
  fight-level kills 7 recorded, 9 pyrrhic-corrected = log 9
  (sim-pyrrhic-b, `evidence/2026-11-06/sim-pyrrhic-b.md`).
- `evidence/2026-11-06/sim-pyrrhic-b.md` (+ prereg): the shared
  classifier (`classifyEnding`, `matchLogKill`, `normKill`) exported
  from `scripts/fightinterior-instrument-20261106.js`, and the
  read-only re-classifier pattern (`scripts/pyrrhic-reclassify-20261106.js`)
  this arm follows. The pyrrhic re-classification runs the SAME
  logic as the live close path — not a copy.
- Findings 2026-11-05 (staypolicy-a + tbretreat-b): two further
  midnight-spanning kills on OTHER corpora — seed 99241 baseline
  (15-round wave-4 kill, fight day 72, kill logged day 73) and seed
  99723 armed reunion kill (fought day 53, logged day 54). They
  motivate the fix; they are NOT re-matched here (different corpora,
  out of scope — this arm re-matches the two committed corpora below
  only).

## Ground truth (verified from the committed corpora before this prereg)

Census over the 32 committed files (ending counts + log totals;
no ±1 re-match has been run):

- Partydamage corpus, ARMED leg (87001–87008): 24 wave-4 traces —
  endings kill 1, rout 1, scholar-death 22; wave-4 log kills 2.
  The unmatched log kill is the Nadia kill: trace seq 1, day 117,
  mid `influencer`, outcome `won`, ending `rout`, mHpLeft 0,
  9 rounds, fighters `[visjoin_96, nadia_khoury]`; the log holds
  `{"d":118,"mid":"influencer","w":4,"by":"nadia_khoury","via":"player"}`
  and killsLive holds the same entry with `day:118`. Same beast,
  same killer, fight spanning midnight — the same-day matcher
  misses it by one day.
- Partydamage corpus, BASELINE leg: 30 wave-4 traces — endings
  kill 3, rout 1, scholar-death 26; wave-4 log kills 3. The single
  'rout' has no log kill behind it on either adjacent day (log
  3 = matched 3); it is expected to stay 'rout' — a same-day
  false-match guard, not a recovery target.
- Fightinterior corpus (51001–51008): baseline 25 traces (kill 2,
  scholar-death 21, scholar-flee 1, unfinished 1), staged 34 traces
  (kill 5, scholar-death 28, raw 'routed' 1); log kills 3 + 6 = 9.
  The pyrrhic re-classification already reads 9 = 9 with same-day
  matching, so no midnight-spanning kill is unaccounted for here —
  the ±1 join must NOT add a match on this corpus. It is the
  no-false-match control: any 10th match is a false match by
  construction (matched > log).
- All 113 wave-4 traces across both corpora carry `mids` (the
  monster ids present at fight open), and every killsLive /
  waveKillLog entry carries `mid` — the same-beast guard is
  checkable on every candidate.

## The fix (scripts only)

The kill matcher is the 'won'-branch join in `closeTrace` plus the
log matchers in the fightinterior classifier and the partydamage
analyzer's pyrrhic matcher — the partydamage/fightinterior
recorder lineage. In every one, the day predicate changes from
`kill.day === trace.day` to `|kill.day − trace.day| ≤ 1`, AND the
same-beast guard is added where it was missing: the kill's `mid`
must be one of the trace's `mids` (falling back to `tr.mid` when a
trace carries no `mids` list, and to the old day+fighter+wave check
only when the trace carries no monster id at all — no corpus trace
is in that case). The ±1 window without the mid guard would widen
the old loose matcher's hole (a 'won' rout trace could match a
field/contest kill by the same fighter on an adjacent day); the
mid guard closes it. Guards that stay: wave ≥ 4, killer in this
fight's fighters list, and — for the pyrrhic/unclosed paths — the
killsLive exclusion and the mHpLeft === 0 guard.

- `scripts/fightinterior-instrument-20261106.js` — shared pure
  classifier `classifyEnding` / `matchLogKills` / `matchLogKill`:
  'won' branch joins killsLive on ±1 day + mid + fighter;
  `matchLogKills` joins the log on ±1 day (mid + fighter already
  required). The live during-fight log snapshot (`_logLenAtOpen`)
  is unchanged — it is timing-precise and already bounds
  candidates to entries written during the fight. Exported, so the
  re-classification runs the SAME logic as the live close path.
- `scripts/partydamage-instrument-20261106.js` — the 'won' matcher
  in `closeTrace` becomes the exported pure function
  `matchWonKill(trace, liveEntries)` (±1 day + mid + fighter +
  wave ≥ 4), used by the live close path and by the reclassifier.
  No pyrrhic port: the partydamage instrument's 'lost'/'unfinished'
  handling is unchanged (out of scope); the reclassifier reconciles
  every wave-4 log entry against a matched trace, so any hidden
  pyrrhic shape would surface as an unreconciled log kill instead
  of being silently dropped.
- `scripts/partydamage-analyze-20261106.js` — the 'unfinished'
  pyrrhic matcher joins the log on ±1 day + mid + fighter (it
  previously joined same-day with no mid check), exported as a pure
  function so the reclassifier uses the SAME logic.
- `scripts/midnightkill-reclassify-20261106.js` (new, read-only):
  applies the new matcher to both committed corpora and prints
  per-leg before/after matched kills vs the log, the named
  recovered kills with their verification, unclassified and
  ambiguous counts, and the GO verdict object. It writes nothing
  into either corpus.
- Proof `scripts/test-midnightkill-20261106.js`: fixture tests for
  the ±1 join (synthetic midnight-spanning fight matches; same-day
  still matches; an unrelated adjacent-day kill does NOT match —
  different mid; same mid but killer not in fighters does NOT
  match; a day+2 kill does NOT match; 'routed' → 'rout' and
  'won' → 'kill' regressions; pyrrhic ±1 still works) + the corpus
  re-classification asserted against the GO numbers + live legs to
  /tmp (throwaway seeds, unjudged): the new instruments install
  cleanly, record traces with 0 instrument errors, determinism
  byte-identical on repeat, neutrality off-vs-on (days/end/kills
  identical — the instrument still changes nothing).

## Question

After the ±1-day kill join, do the matched kill counts on the two
committed corpora equal the log counts, with the Nadia d117/d118
kill recovered, zero false matches, and zero unclassified or
ambiguous traces?

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- NO new seed band is consumed. Verification is deliberate reuse
  of the two committed corpora (`evidence/2026-11-06/perseed-partydamage-b/`
  and `evidence/2026-11-06/perseed-fightinterior-b/`, 16 files each)
  — the same files the undercount was measured on. No judged re-run
  of either band: re-running would re-spend 32 sims to re-measure
  corpora that already contain every field the fix needs (traces
  with day/mid/mids/fighters/outcome/mHpLeft, waveKillLog,
  killsLive).
- Live legs (unjudged, to /tmp, throwaway seeds — the pyrrhic
  proof pattern): install + determinism + neutrality only. A live
  leg is NOT expected to produce a midnight-spanning kill on demand
  (1 in 24 fights on the partydamage band); the GO is proven by the
  corpus re-classification + fixtures, and the live legs prove the
  new instruments still run clean.
- Pilot gate: the corpus re-classification IS the pilot (8+8
  already run, twice over). No confirm spend exists for an
  instrument fix.

## Primary metric (binding — GO thresholds)

GO iff ALL hold on the committed corpora after re-classification:
- (a) Partydamage corpus: the matcher recovers the Nadia d117/d118
  kill — matched armed kills 1/24 → 2/24, matching the log-based
  8.3% (2/24). Baseline matched stays 3/30 = log 3/30 (its 'rout'
  stays 'rout').
- (b) Fightinterior corpus: matched total 9 = log total 9 (the
  pyrrhic-corrected count: baseline 3, staged 6). No 10th match.
- (c) ZERO false matches — every newly matched kill verified
  against its fight trace (same beast, same fighters, fight
  spanning midnight). Each recovered kill is named in the evidence
  file with its trace fields and its log entry.
- (d) Unclassified 0, ambiguous 0 across both corpora after
  re-classification. (Ambiguous = a trace matching more than one
  distinct kill entry, or one log kill claimed by more than one
  trace.)

A miss on any of (a)–(d) is NO-GO, never re-scored (§14). The
corpora are NOT re-run and the evidence numbers are NOT re-cut: if
the re-classification disagrees with the GO, the fix is wrong, not
the bands. The partydamage NO-GO verdict (armed 8.3% < 10%) is
unchanged by this fix — 2/24 is still below the bar; this arm
corrects the instrument, not the verdict.

## Secondary (reported, never re-scored)

- Per-leg endings tables after re-classification for both corpora.
- Wall numbers restated from the corpora's own evidence files
  (these corpora are already judged; restate, do not re-judge):
  partydamage — wins 0/8 both legs, national 0/8, table 0/8,
  wave-4 unlocks 6/8, wave-5 unlocks 1/8 baseline / 0/8 armed,
  median survival 92.5d baseline / 84.5d armed; fightinterior —
  wins 0/8 both legs, national 0/8, table 0/8, wave-4 unlocks 5/8,
  wave-5 0/8, median survival 85.5d baseline / 105d staged.
- Village assessment in plain words where applicable (the fix
  changes no village's fate — the kills already happened; the
  recorder now sees them).
- Sense-test: none — no transcript is re-read; the fix touches no
  narration. (The Nadia d117/118 kill day was already sense-read
  in sim-partydamage-b.md: the kill passed silently while the
  System celebrated a different, wave-3 kill.)

## Seed-freshness record (per local_seed_band_freshness skill)

No new band is consumed, so no freshness check is owed. Deliberate
reuse is declared here: the judged corpora ARE
`evidence/2026-11-06/perseed-partydamage-b/` (87001–87008) and
`evidence/2026-11-06/perseed-fightinterior-b/` (51001–51008), the
same bands the undercounts were measured on. Live legs use
throwaway seeds to /tmp only (unjudged, not evidence).

## Metric review (per §14; filled at verdict time, not now)

- Whether the ±1 window is wide enough: a fight can span more
  than one midnight only if it runs past a full day boundary
  twice — the longest TB fight on either corpus is 121 rounds in
  one day; no trace spans two midnights, and the window is ±1 by
  construction, not by observation. If a future band shows a
  two-midnight fight, the window, not the verdict, is revisited.
- Whether the mid guard belongs in the 'won' branch live, or only
  offline: it is added live (it is the same-beast check the ±1
  window needs), but it changes the match predicate for future
  corpora — a kill whose mid is missing from the trace's `mids`
  (a monster joining mid-fight, if the engine ever does that)
  would no longer match. The fallback (no monster id on the trace
  at all) preserves the old behavior; a mid present on the kill
  but absent from `mids` is a non-match by design, and any such
  case on a future band is a finding, not a silent drop.
- Whether the partydamage instrument should also gain the pyrrhic
  classification the fightinterior instrument has: deliberately
  NOT ported here (out of scope — this arm is the ±1 join). The
  reclassifier's log reconciliation is the guard that no pyrrhic
  shape hides on the partydamage band; a future arm may port the
  classifier and should then re-run this reclassification as its
  regression.
- The 99241 / 99723 midnight kills (staypolicy-a + tbretreat-b)
  are NOT verified here — their corpora are not re-matched. If a
  later arm re-matches those corpora with this matcher, the
  recovered counts should be reported against this prereg's
  method, not re-derived.

## Balanced panel (§15)

No Game-root change exists (zero src/js) and no policy changes —
there is nothing to compare before/after. No compare `.md` is
fabricated. The matched-corpus re-classification (identical 32
files, before/after matcher) IS the comparison, and its output is
attached to the evidence file.

## Telemetry deviation check

Attempted at verdict time; the tool has refused recorder corpora
on every prior killer-chain arm — the refusal, if it recurs, is
the result. The WINSEAT baseline's own regime note forbids
pre-seat comparisons — check it first.

## Proof (re-run, not rewritten)

`scripts/test-midnightkill-20261106.js` — fixture tests for the ±1
join and every guard (see "The fix"), the corpus re-classification
asserted against (a)–(d), and live legs to /tmp (install +
determinism + neutrality). Run green on this worktree before the
evidence is committed. The fightinterior proof
(`scripts/test-fightinterior-20261106.js`), the partydamage proof
(`scripts/test-partydamage-20261106.js`), and the pyrrhic proof
(`scripts/test-pyrrhic-20261106.js`) are re-run green as
regressions on the final tree.

## What this arm is NOT claiming

- It does not claim a lever: no policy is built, no pilot is
  spent, no gate/price/deed change is proposed. No village lives
  longer or kills more because of this fix — the kills already
  happened; only the recorder sees them now.
- It does not claim the partydamage NO-GO is overturned: armed
  2/24 = 8.3% is still below the 10% bar. The instrument is
  corrected; the verdict stands.
- It does not claim the 99241 / 99723 kills are recovered: those
  corpora are not re-matched here.
- It does not claim the partydamage instrument now classifies
  pyrrhic kills: that port is explicitly out of scope. The
  reclassifier's log reconciliation is the guard, and any
  unreconciled log kill would be reported as a finding, not
  absorbed.
- It does not claim a live midnight-spanning kill was observed
  end-to-end: live legs prove the instrument still runs clean;
  the midnight behavior is proven by fixtures + the committed
  corpus re-match.
