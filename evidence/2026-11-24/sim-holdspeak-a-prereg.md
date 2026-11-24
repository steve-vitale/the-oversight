# Prereg — sim-holdspeak-a (Loop A run fleshout-20261124T0715Z)

**Arm:** make held departures speak — when a departure is held, the
fireside says why in plain words (finding #2713; tracker scale-onramp
axis; design call by the run coordinator, Steve can overrule: a hold
SHOULD speak).

**Base:** `60f6e7436` (master tip at worktree creation; worktree
`sim-holdspeak-a`, zero branch commits at prereg time).

## Grounding: what a "hold" is on this base (read from the code, not assumed)

Finding #2713 (sim-departsafe-a, 16 seeds 107601–107616) measured the
SAFETY CHECK holding 44 departures with zero hold wording in beat
lines. **The safety check is NOT on master**: it lives held on branch
`sim-departsafe-a` (commit `e9dcc0ffe`), env-gated `DEPARTSAFE=1`,
never landed — landing as default-OFF is a coordinator/Steve call
per the sim-departsafe-rejudge-a evidence, and this arm does NOT land
it. There are no safety-check holds to voice on master, and voicing a
check that never runs would be a null arm.

The holds that DO occur on master are the win-plan hold verdicts in
`vbrainExecuteDepart` (`src/js/villager-brain.js`), and those are what
this arm voices. Census on the frozen departname before-corpus (19
seeds, competent, 150d — `evidence/2026-11-22/perseed-departname-a-before/`):
**463 `result: 'hold'` departCalls vs 450 launches**, all source
`brain`, up to 3 holds per (seed, day, vid) (one per agency tick) —
208 distinct (seed, day, vid) hold-days. By commit action:
`party_launch` 438, `party_wait` 24, `veteran_guard` 1, `gear_hold` 0.
The three hold shapes, enumerated from the code:

- **H1 — hold-action commit** (`vbrainExecuteDepart` returns `'hold'`
  for a `gear_hold` / `party_wait` / `veteran_guard` commit,
  `winPlanCands`): `gear_hold` = plan stage `gear`, holder unarmed
  AND unarmored — real reason **kit** (consideration note: "hold for
  kit"); `party_wait` = stage `party`, no companion at Haven — real
  reason **no companion** ("none at haven"); `veteran_guard` = stage
  `table`, holder has a wave-4+ kill, no companion — real reason
  **no companion yet** ("no party yet"). Silent today: no `say()` at
  the hold return.
- **H2 — expired-plan held** (`winPlanCommitDeadTarget` returns
  `'held'`): the plan's target died, the expiry beat already spoke
  once ("the hunt is called off"), and the plan sits targetless in
  stage `party` re-bidding every day while no rumor or lived fight
  re-seeds a target — real reason **no trail**. Silent on every
  held day after the expiry day.
- **H3 — party_launch execute-fail** (`startExpedition` for the holder
  returns without an expedition record, and the homebody handoff
  finds no walking companion to take the plan): the holder is blocked
  by `startExpedition`'s own gates — **sick** (`village.sick[vid]`),
  **hurt** (`villagerHealCheck`: HP < 70 with no medicine and no
  healer at hand — the check itself has side effects and is NEVER
  re-called to classify; the hurt predicate is re-read purely from
  `health[vid] < 70`), or **cannot walk** (`npcMaxDist < 1`) — and
  no walker could take the plan. Silent at the hold return (the
  commit-time homebody/holder voice may have spoken the range-0 fact
  at dawn for that pair, but the failed departure + failed handoff
  that day is unvoiced).

The held lever's safety-check reasons (for the record, NOT on master:
`unarmed`, `unarmored`, `armorP<N`, `sick`, `hp<70`, `range0`,
`party-too-small`) are a different cause set from a different hook.
The voice helper built here takes a cause struct that includes those
reason keys, so when/if the lever lands, its holds speak through the
same path — the exact wiring (call the helper with the
`departSafeCheck` fails at the lever's `'hold'` return in
`vbrainExecuteDepart`) is documented in the evidence, not
implemented here, because the lever code is not in this tree.

## Fix (planned, not yet landed at prereg time)

In `src/js/villager-brain.js`, one helper `holdVoice(self, vid, c,
cause)` speaking at each of the three `return 'hold'` sites in
`vbrainExecuteDepart`, plus a module-local `holdName(self, vid)`
following the departname-a `beatName` convention (true first name:
`npcName` first — prefers a bestowed calledName — then
`disp`/`displayName`, then `'Someone'`; never a stranger descriptor,
never `undefined`).

- Lines name the holder by true first name and the REAL hold reason,
  read at voice time, never invented: H1 re-reads the live gap
  (`gearRead` for kit — "no weapon and no armor" / "still no armor"
  / "still no weapon" as the live reading says; `findCompanion` for
  the companion waits); H2 names the missing trail; H3 names the
  holder's block (sick / hurt / cannot walk) and that no one could
  take the plan. A cause that cannot be determined from pure reads
  is spoken generally ("couldn't get out") and counted as
  `execute:unknown` in the audit — expected ~0; if it ever fires,
  the audit says so.
- Every hold line ends with the shared closer "— the party waits."
  (the capture token, parallel to the departure beat's "— the fire
  marks the trail."). The driver gains `HOLD_BEAT_RE` and a
  `holdLines` stream; the analyzer joins hold verdicts to hold lines
  by (seed, day, vid).
- Dedup: at most one hold line per (holder, day) across all three
  shapes — first hold of the day speaks, later ticks that day are
  silent. Design call, recorded: a hold is a daily fact ("waits
  another day"), not a permanent one, so the homebody/holder
  once-per-pair-forever dedup would re-silence a party held for
  weeks, while un-deduped 3-ticks-a-day voicing would spam. The
  dedup map lives on the brain state beside `homebodySaid` /
  `holderSaid` and is read by nothing but this check.
- Text-only by design: `say()` consumes no RNG; the helper writes no
  game state except its own dedup map; no `revealName` / knowledge
  marking (whether hearing a hold line should teach the scholar the
  name is the same open question as the departure beat's, recorded
  in evidence, not decided here). No hold verdict, launch, death, or
  standing number may move.

## Instrument

- **Driver:** `scripts/dawnchoke-driver-a.js`, extended (not reused
  unchanged — this arm NEEDS the new streams): the `Game.say` wrap
  gains `HOLD_BEAT_RE = /— the party waits\./` capturing `holdLines`
  (`{day, vid, text}` — vid parsed from the line's leading name is
  NOT trusted; the join key is (day, holder-first-name) matched
  against the hold verdict's holder name, see analyzer), and the
  `vbrainExecuteDepart` wrap gains `holdCause` on every `'hold'`
  departCall row, classified driver-side without touching game code:
  H1 from the commit's `winPlanAction`; H2 vs H3 by whether
  `startExpedition(vid)` was called during the depart call (a
  `startExpedition` wrap counts holder calls per depart call); H3
  sub-cause from pure reads of `Game.state` (sick map, health,
  `npcMaxDist`). Driver validation BEFORE the pilot: one seed from
  the departname band (107601) on control code — departCalls /
  beatLines / deaths byte-identical to the frozen corpus apart from
  the added fields.
- **Analyzer:** `scripts/analyze-holdspeak-a.js` (new, modeled on
  `analyze-departname-a.js`, with its own selftest): joins each
  distinct (seed, day, vid) hold-day to `holdLines` of that day
  naming that holder, classifies each line's reason family by token
  (kit / companion / no-trail / sick / hurt / cannot-walk /
  unknown), and reports voiced share + reason-match per cause.
- **Policy:** competent verbatim (`scripts/policies/competent.js`),
  unmodified.
- **Horizon:** 150d death-aware (`DAYS=150`; runs end early on
  won/over — never a fixed 200d).
- **Substrate env (identical on both legs):**
  `GUNRATE=1 CELLGATE=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1
  VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1`,
  `MODE=ctl`; `KILLBUNDLE`, `LEND`, `PRESENCE`, `HPGATE`, `PINQUAD`,
  `PROFILEGATE4` all unset. Same substrate as departname-a.
- **Legs:** before = base code, `RUN=holdspeak-a-before`,
  `OUTDIR=perseed-holdspeak-a-before`; after = fixed code,
  `RUN=holdspeak-a-after`, `OUTDIR=perseed-holdspeak-a-after`.
  The ONLY difference between legs is the fix. Corpora under
  `evidence/2026-11-22/` (the driver hardcodes the date dir;
  departname-a precedent).
- **Band (fresh):** 109409–109416 (8 seeds). Freshness verified
  2026-11-24: zero hits in dated `.md` evidence files and
  filenames for any of 109409–109416 (the only 10940x hits are
  109401–109403 in journey-deepening-r278 and a kcal float); does
  NOT reuse 107633–107648, 107601–107616, or Loop B's live band
  109309–109324.
- **Extension rule (frozen):** if the pilot hold-day denominator is
  < 5, the run is NOT judged on it — extend the band with seeds
  109417–109424 (freshness re-verified first) and record the
  amendment in this prereg BEFORE running them. Census expectation
  is ~11 hold-days/seed (~87 on 8 seeds), so the extension should
  not trigger.

## Frozen GO bars

- **B1 — holds voiced with the real reason:** on the pilot band,
  **≥ 80% of distinct (seed, day, vid) hold-days produce a hold
  line naming that holder**, AND on a sampled audit of the lines
  (≥ 10 lines, or all lines if fewer; sampled across every cause
  family present) the reason named matches the verdict's actual
  cause on **100%** of sampled lines. A hold line naming the wrong
  reason (says "kit" when the hold was health) is a defect, not a
  pass. Hold-days whose verdict is a `winPlanDepart` `'hold'` (none
  in the 19-seed census — all holds were source `brain`) count as
  unvoiced if any appear, and are reported separately, not hidden.
- **B2 — no regression (text-only proof):** per-seed total deaths
  identical before vs after; per-seed `v4departs` launch counts
  identical; departure-beat line counts identical per seed and
  total; every after beat line equals its before counterpart except
  the added hold lines (hold lines are a new stream, not edits to
  existing lines).
- **B3 — sense test:** read the hold lines aloud as a player at the
  fireside: every line reads as people waiting for kit or health
  ("Mara's ankle is still bad, so the party waits another day"),
  never as a system message; quote the best and worst lines in the
  evidence file.
- **B4 — proof test + gate:** `scripts/test-holdspeak-a.js` green on
  new code; its hold-voicing assertions RED on old code
  (`git show 60f6e7436:src/js/villager-brain.js`); analyzer selftest
  green; `node scripts/check.js --quick` green, or pre-existing
  failures only, adjudicated individually.

**Verdict rule:** GO iff B1+B2+B3+B4 all pass. A miss is NO-GO, never
re-scored against a friendlier metric mid-run. If the pilot is GO,
confirm on 16 fresh seeds (band to be verified fresh at that point,
recorded as a prereg amendment before the confirm runs).

## Amendment 1 — confirm band (recorded BEFORE the confirm runs)

Pilot verdict GO (B1 36/36 voiced, 0 mismatches; B2 exact identity; B3
pass; B4 adjudicated pass — see evidence file §8). Confirm band:
**109417–109432** (16 seeds). Freshness verified 2026-11-24: zero hits in
dated `.md` evidence files and filenames for any of 109417–109432
(excluding this arm's own files, which name 109417–109424 only as the
frozen extension rule). Does NOT reuse 107633–107648, 107601–107616,
109309–109324 (Loop B live), or the pilot band 109409–109416.
Same legs as the pilot (150d death-aware, competent policy, identical
substrate env; before = base code `RUN=holdspeak-a-confirm-before`,
after = fixed code `RUN=holdspeak-a-confirm-after`,
`OUTDIR=perseed-holdspeak-a-confirm-before/after` under
`evidence/2026-11-22/`). Same bars B1–B4 judged on the confirm corpora
by the same analyzer; a confirm miss overturns the pilot GO.

## Convergence state

`converging` — the fix is a text-only voice for a measured silence
(463 holds / 0 hold lines on the census corpus); the band check is
the judge.

## Metric review

(To be filled at judgment time. If the metric proves wrong, the
revision is proposed here for the NEXT run, not applied to this one.)
