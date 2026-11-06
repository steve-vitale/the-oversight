# Pyrrhic-kill instrumentation — fight-level kill counts stop undercounting the log — PRE-REGISTRATION (arm sim-pyrrhic-b)

Run: fleshout-loop-b-20261106T1630Z (Loop B, second axis). Axis:
winnability chain (wild ally-join → wave-4 kills → veterans →
readiness-5 release → wave-5 facing → full seat). Committed BEFORE any
judged work. INSTRUMENT FIX ONLY: zero src/js, no policy built, no
lever piloted, no gate / price / deed / readyDemand change. The
recorder is the deliverable; the next lever (party damage) is sized
elsewhere, not built here.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md`: wave-4 bands
  damage 35–95, HP 850–1500; "VETERANS — living roster members with a
  recorded kill of a wave-(w-1)+ monster in `state.waveKillLog`"
  (MONSTER-WAVES.md:398). The log is the authority for who killed
  what — which is why the fix reads the log instead of adding a new
  hook. No canon invented here.
- "Monster encounters are fought, not rolled" (CANON.md): the fix
  classifies the fight the engine actually fought from engine
  records — the log entry plus the trace — never a SAY line, never
  an outcome table.
- The 2026-10-17 pyrrhic boundary (finding #466, evidence
  `evidence/2026-10-17/sim-pyrrhic.md`): `recordPyrrhicKill`
  deliberately scores NO wave-unlock deeds (`scoreLedgerKill` is a
  steve-call, still pending) and pays NO loot/carcass. This arm does
  NOT touch that boundary: it only makes the existing log entry
  visible to the fight-level recorder. No deed, no loot, no unlock
  behavior changes.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-06/sim-fightinterior-b.md` (+ prereg), run
  fleshout-loop-b-20261106T1430Z, band 51001–51008, corpus
  `evidence/2026-11-06/perseed-fightinterior-b/` (16 files):
  fight-level kill counts undercount the log — baseline 2 vs 3,
  staged 5 vs 6. Its Metric review names the fix: wrap the pyrrhic
  attribution path or read waveKillLog at tbEnd; split 'unfinished';
  normalize 'routed' → 'rout' in closeTrace. Findings #1811/#1822.
- `scripts/baseline9-analyze-20261106.js` (Loop A arm
  sim-baseline9-a, same day): the kill-channel census already
  classifies pyrrhic as "in waveKillLog but not killsLive" and
  matches log kills to TB rows. This arm's live classifier reuses
  that match shape (same day + mid + killer fought in this fight),
  extended with the during-fight log snapshot so a later same-day
  grind kill cannot false-match an earlier lost fight.

## Ground truth correction (verified from the committed corpus before this prereg)

The brief says "2 of 9 wave-4 kills are pyrrhic". The corpus says
the two undercounted kills are DIFFERENT shapes, and the fix must
cover both — a census over all 16 committed files:

- Total wave-4 kills in the log: 9 (baseline 3, staged 6).
  In killsLive: 8. Fight-level ending 'kill': 7.
- Kill 1 — 51005 staged, day 65, Reunion, by greta_hansen, via
  'companion': TRUE pyrrhic. In waveKillLog, NOT in killsLive (the
  `recordPyrrhicKill` path, `src/js/game.js` ~34032, called from
  tbEnd's 'lost' branch ~45859, writes the log directly and
  bypasses `recordWaveKill` — the instrument's only kill hook).
  Its trace (seq 6) closed through tbEnd as 'lost' → ending
  'scholar-death'. Invisible at fight level AND to killsLive.
- Kill 2 — 51002 baseline, day 80, Strike, by grace_obi, via
  'player': KILL-LOGGED-BUT-NEVER-CLOSED, not pyrrhic-path. It IS
  in killsLive (so `recordWaveKill` ran, via 'player') — but its
  trace (seq 2, 21 rounds, killing blow round 21, beast HP −14)
  never closed through tbEnd: outcome 'unfinished', mHpLeft 0.
  The r21 killing strike has a hit record but NO verb record (the
  verb wrapper's post-call push found the trace already gone — the
  same loss the congtrace arm noted), and the trace was closed as
  'unfinished' when the next fight (Eulogy, same day) opened. The
  engine path that dissolves a fight without tbEnd is known
  (`game.js` ~36590: death mid-crossing dissolves with result
  'dissolved', `tbfight = null`, no tbEnd); the exact interleaving
  on this fight is NOT proven from the corpus and is NOT claimed
  here — the fix covers the observable shape (log entry present +
  beast at 0 HP + trace never closed), whatever dissolved it.
- The corpus holds exactly ONE 'unfinished' trace (this one) and
  exactly ONE log-only kill (greta's). No other 'unfinished' or
  log-only kill exists on the band. The 'village died mid-fight'
  half of the split therefore has ZERO live instances on this band
  — it is implemented and fixture-proven, and reported as such.

## Route choice (b) — read waveKillLog at closeTrace in the recorder

Two routes were offered. I choose (b): the recorder's single close
path (`closeTrace`, in `scripts/fightinterior-instrument-20261106.js`)
reads `Game.state.waveKillLog` at close time and classifies from
the log + the trace. Justification, in order:

1. Route (b) covers BOTH observed shapes with ONE mechanism.
   Route (a) — wrapping the pyrrhic path in `game.js` — would make
   greta's kill visible to killsLive, but cannot fix grace's kill:
   that kill is ALREADY in killsLive; its fight-level miss is a
   close-path problem (the trace never closed through tbEnd), not a
   hook problem. Only a close-time log read sees it.
2. Zero game-code change = zero neutrality risk. The instrument
   family convention is "scripts only, zero src/js" (the
   fightinterior header; the 'routed' correction 304ced6cf was also
   instrument-only). A game.js hook would couple game code to
   instrumentation for an instrumentation concern, and would need
   the neutrality proof (identical trajectories pre/post on
   51001–51008) that route (b) does not need: the recorder adds
   zero RNG draws and zero game-state writes, then as now.
3. The log is the authority (MONSTER-WAVES.md veterans rule), and
   the driver already snapshots it into every per-seed file — the
   re-classification below needs no new data.
4. The Steve-call boundary is untouched: the fix never calls
   `recordWaveKill`, never calls `scoreLedgerKill`, never routes a
   pyrrhic kill through the deed path. It only READS the log the
   engine already wrote.

## The fix (scripts only)

- `scripts/fightinterior-instrument-20261106.js`, `closeTrace` +
  trace-open log snapshot:
  - At trace open, snapshot `waveKillLog.length` (entries appended
    during this fight only are candidates — a later same-day grind
    kill cannot false-match an earlier lost fight).
  - New endings, all in the analyzer taxonomy:
    - outcome 'lost' + a during-fight log entry (wave ≥ 4, same
      day + mid, killer in this fight's fighters) that is NOT in
      killsLive → ending 'pyrrhic-kill'. (The killsLive exclusion
      is belt-and-braces: a `recordWaveKill` entry from a non-TB
      path the same day must never read as pyrrhic.)
    - outcome 'unfinished' + a during-fight log entry (same match)
      + beast at 0 HP (`mHpLeft === 0`) → ending 'kill-unclosed'.
      (The mHpLeft guard stops a same-day kill from a LATER fight
      matching this trace at a stale/finalize close.)
    - outcome 'unfinished' + no match → ending stays
      'unfinished', with `tr.unfinishedKind` split by close path:
      'village-died' (closed at finalize with the village lost),
      'dissolved' (closed stale at the next startCombat while the
      run continued — the fight dissolved without tbEnd),
      'horizon' (closed at finalize with the village alive — the
      horizon arrived mid-fight). The close path is passed into
      closeTrace explicitly; no guessing from state.
  - The 'won' path is unchanged (killsLive match → 'kill',
    else 'rout'). The 'routed' → 'rout' normalization (landed
    304ced6cf) is unchanged in code; a fixture test is ADDED for
    it here (the landing carried no test).
  - No other closeTrace behavior changes. No new RNG draws, no
    game-state writes.
- `scripts/fightinterior-analyze-20261106.js`: ENDINGS gains
  'pyrrhic-kill' and 'kill-unclosed'; a KILL_ENDINGS set
  {kill, pyrrhic-kill, kill-unclosed} is used by `sizeNextLever`
  (a pyrrhic kill IS a dead beast — it counts toward the ceiling)
  and by the kill count; an `unfinishedKind` tally is reported.
  No other analyzer behavior changes.
- New pure classifier exported from the instrument
  (`classifyEnding(trace, logEntries, liveEntries)`) so the
  re-classification below runs the SAME logic as the live close
  path — not a copy.
- `scripts/pyrrhic-reclassify-20261106.js`: applies the classifier
  to the committed corpus and prints per-leg fight-level kill
  counts vs the log, the two named kills' new endings, and the
  'unfinished' split. Pure re-analysis of committed files; it
  writes nothing into the corpus.
- Proof `scripts/test-pyrrhic-20261106.js`: fixture tests for every
  new ending (pyrrhic-kill, kill-unclosed, village-died,
  dissolved, horizon, routed→rout regression, won→kill
  regression, grind false-positive exclusion, mHpLeft guard) +
  the corpus re-classification asserted against the GO numbers +
  live legs to /tmp (throwaway seeds, unjudged): the new
  instrument installs cleanly, records traces with 0 instrument
  errors, determinism byte-identical on repeat, neutrality
  off-vs-on (days/end/kills identical — the instrument still
  changes nothing).

## Question

After this fix, do fight-level kill counts match waveKillLog on
band 51001–51008, with the two undercounted kills visible in their
own ending classes and 'unfinished' split into its shapes?

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- NO new seed band is consumed. Verification is deliberate reuse
  of the committed fightinterior corpus
  (`evidence/2026-11-06/perseed-fightinterior-b/`, 16 files) — the
  same files the undercount was measured on. No judged re-run of
  51001–51008: re-running the band would re-spend 16 sims to
  re-measure a corpus that already contains every field the fix
  needs (traces with day/mid/fighters/outcome/mHpLeft, waveKillLog,
  killsLive).
- Live legs (unjudged, to /tmp, throwaway seeds — the fightinterior
  proof pattern): install + determinism + neutrality only. A live
  leg is NOT expected to produce a pyrrhic kill on demand (2 in 59
  fights on the judged band); the GO is proven by the corpus
  re-classification + fixtures, and the live legs prove the new
  instrument still runs clean.
- Pilot gate: the corpus re-classification IS the pilot (8+8
  already run). No confirm spend exists for an instrument fix.

## Primary metric (binding — GO thresholds)

GO iff ALL hold on the committed corpus after re-classification:
- G1 fight-level kill counts match the log per leg: baseline
  ending-kills (kill + pyrrhic-kill + kill-unclosed) = 3, staged
  = 6; total 9 = log 9. (Before: 2 and 5, total 7.)
- G2 the two named kills are visible in their own endings:
  51005 staged day-65 Reunion by greta_hansen → 'pyrrhic-kill';
  51002 baseline day-80 Strike by grace_obi → 'kill-unclosed'.
- G3 'unfinished' is split: the corpus's single 'unfinished'
  trace resolves to 'kill-unclosed' (G2); every remaining
  'unfinished' trace (zero on this band) carries an
  unfinishedKind in {village-died, dissolved, horizon}; the
  village-died/dissolved/horizon paths are fixture-proven.
- G4 'routed' → 'rout' fixture passes (the landed normalization
  holds), and the 'won' → 'kill' / 'lost' → 'scholar-death'
  regressions pass (no existing ending changes class).
- G5 proof green (`scripts/test-pyrrhic-20261106.js`), including
  the live legs to /tmp with 0 instrument errors and determinism
  byte-identical; neutrality off-vs-on identical (days/end/kills).

A miss on any of G1–G5 is NO-GO, never re-scored (§14). The
corpus is NOT re-run and the evidence numbers are NOT re-cut: if
the re-classification disagrees with the GO, the fix is wrong,
not the band.

## Secondary (reported, never re-scored)

- Per-leg endings table after re-classification (kill / rout /
  scholar-death / scholar-flee / pyrrhic-kill / kill-unclosed /
  unfinished + unfinishedKind tally).
- Wall numbers for the verification legs (live legs to /tmp are
  throwaway seeds, reported as such, not wall numbers — the wall
  numbers are the committed corpus's own, restated from
  sim-fightinterior-b.md: wins 0/8 both legs, national 0/8, table
  0/8, wave-4 unlocks 5/8, wave-5 0/8, median survival 85.5d
  baseline / 105d staged).
- Village assessment in plain words where applicable (the fix
  changes no village's fate — the two kills already happened; the
  recorder now sees them).
- Sense-test: none — no transcript is re-read; the fix touches no
  narration. (The 51005 day-66 burial beat and the 51002 day-80
  kill day were already sense-read in sim-fightinterior-b.md.)

## Seed-freshness record (per local_seed_band_freshness skill)

No new band is consumed, so no freshness check is owed. Deliberate
reuse is declared here: the judged corpus IS
`evidence/2026-11-06/perseed-fightinterior-b/` (16 files,
51001–51008), the same band the undercount was measured on. Live
legs use throwaway seeds to /tmp only (unjudged, not evidence).

## Metric review (per §14; filled at verdict time, not now)

- Whether 'pyrrhic-kill' should stay a distinct ending or fold
  into 'kill' with a pyrrhic flag — the distinct ending keeps the
  analyzer's endings table honest (a lost fight that killed is
  not a won fight), but it splits the kill count across two
  buckets and every future kill-count reader must use
  KILL_ENDINGS, not ending === 'kill'.
- Whether the during-fight log snapshot is the right guard vs the
  killsLive-exclusion alone (the snapshot is timing-precise live,
  but the offline re-classification cannot use it — it leans on
  the mHpLeft guard and the killsLive exclusion instead; if the
  two ever disagree on a future band, the live snapshot wins).
- Whether 'unfinished-dissolved' deserves its own ending rather
  than an unfinishedKind sub-field — the dissolve-without-tbEnd
  path is a real engine shape (game.js ~36590), and a future band
  with many dissolved fights may want it counted, not just noted.
- The 51002 interleaving (kill logged, trace never closed, verb
  row lost) is still unexplained at the engine level: a live
  reproduction pinning the throw/interleave site is owed if any
  future arm needs to trust unclosed-fight traces, but it is NOT
  this arm's GO — the fix covers the shape, not the cause.

## Balanced panel (§15)

No Game-root change exists (zero src/js) and no policy changes —
there is nothing to compare before/after. No compare `.md` is
fabricated. The matched-corpus re-classification (identical 16
files, before/after classifier) IS the comparison, and its output
is attached to the evidence file.

## Telemetry deviation check

Attempted at verdict time; the tool has refused recorder corpora
on every prior killer-chain arm — the refusal, if it recurs, is
the result. The WINSEAT baseline's own regime note forbids
pre-seat comparisons — check it first.

## Proof (re-run, not rewritten)

`scripts/test-pyrrhic-20261106.js` — fixture tests for every new
ending and guard (see "The fix"), the corpus re-classification
asserted against G1–G3, the 'routed' fixture (G4), and live legs
to /tmp (install + determinism + neutrality, G5). Run green on
this worktree before the evidence is committed.

## What this arm is NOT claiming

- It does not claim a lever: no policy is built, no pilot is
  spent, no gate/price/deed change is proposed. No village lives
  longer or kills more because of this fix — the kills already
  happened; only the recorder sees them now.
- It does not claim the pyrrhic deed question is settled: the
  steve-call on wave-unlock deeds for pyrrhic kills (#466) is
  still open, and this fix deliberately does not touch it.
- It does not claim the 51002 interleaving is explained: the
  engine-level cause of "kill logged, trace never closed" is an
  open diagnostic, not this arm's GO.
- It does not re-judge the fightinterior DIAG-NO-GO: the verdict
  stands as measured (D1 missed by the 'routed' string, fixed
  separately in 304ced6cf). This arm fixes the measurement blank
  the NO-GO's metric review named.
- It does not claim the 'village died mid-fight' split is
  live-proven: zero such traces exist on this band; the path is
  fixture-proven only, and is reported as such.
