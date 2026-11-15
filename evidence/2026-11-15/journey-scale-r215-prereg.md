# journey-scale r215 — PRE-REGISTER (lane A, leg 3 SCALE, national on-ramp on current master)

**Run id:** `playtest-loop-a-scale-r215-20261115T1945Z` (lock run_id
`oversight-playtest-loop-20261115T194500Z`).
**Run:** scheduled Sun 2026-11-15 13:45 CST (2026-11-15 19:45 UTC); lock
created 19:44:28Z.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `7ab6e2546` at worktree registration.
**Pre-flight:** main tree clean (`git status --short` empty, 0 files),
disk 41%, lock absent (no stale-lock recovery), `git pull` already up
to date at 7ab6e2546. Reap: ran clean (12/16 active; dirty trees left
alone per reaper rules). Worktree `journey-scale` registered ~19:47Z
(registration took ~2.5 min — the box is slow); heartbeat landed
19:48:46Z, hbloop `~/workspace/worktrees/journey-scale-hbloop-r215.sh`
(10-min cadence) launched 19:48Z.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run — it measures the on-ramp and reads people; any fix it
finds is dialogue/narration-scoped, or it is documented, not built.
**DELIVER OVER MEASURE (2026-11-01):** this run measures the national
on-ramp on current master after a day of landings (see below), and fills
the two blanks r207 owed this run (spotter d90 snapshot + wave-5 instance
ids — both driver/instrument, no game change).

## Standing context (read before scoring)

- **r207 scale (landed 2026-11-15, master 0116c16e7):** national 0/4 on
  fresh seeds 135601–135604; survived **0/4** (r206: 2/4); regional 4/4;
  lived-days 461 vs 3-band rolling mean 500 (-7.8%, HOLD — the re-base
  works); lesser seat priced 4/4; **wave-5 fights 31, kills 0** (the
  r206 herald shape, one wave up: Editor/Spoiler pace at the boundary,
  fought repeatedly without dying); tribute READY-UNPAYABLE twice
  (135602 ready d97, 0/6 attempts; 135604 ready d64, 0/14 attempts —
  veterans-short both); no delivery this band (r206 delivered once).
  The herald itself dies now (1 herald kill each on 135602/135603/
  135604). Nod-loop re-proven (worst 3x, 7/9 sittings — the thin-out's
  signature). Secret:* picker PROVEN LIVE (Galym 135602 d90 kept
  confidence). Spotter snapshot LANDED as an instrument but UNREADABLE
  (end-only snapshot on a 0/4-survival band returns empty rosters —
  a d90 snapshot is owed to the next run, i.e. this one). Telemetry:
  1 LOUD line (fightsByWave.4 -60%: 178 → 71); investigated (band
  composition + collapse-heavy band, no combat code changed);
  **baseline NOT rolled** (5-band sequence shows the metric is
  noise-dominated on 4-seed panels). Gate 335/5 GO after adjudication
  (0 attributable).
- **What changed in the game since r207's base (9fa74d252 → 7ab6e2546):**
  four src/js landings, one of which touches survival:
  - sim-gorgeprice2-b (dc8cbd3f3): **CASCADE lingerer guard** (+16
    lines game.js — the lingerer holds the treeline). The 1615Z
    scale-onramp round credits this guard with the matched-band
    baseline rising to 8/8 (fresh band 3/8 + matched band 8/8, one
    guard apart) and names it the single-diff attribution for the
    collapse regime ending on master tip (a guard-removal ablation
    would be the deciding test — a bisect arm, not this leg). This
    panel is the scale leg's first read of the guard's effect on
    survival: if this band survives markedly better than r207's 0/4,
    the guard is the prime suspect, not a panel artifact.
  - journey-endgame r211 (c09a9f732 + 676430c3a): **doubled-quote fixes**
    (sysSay strip + quoteWrap on relic/ability/Callback paths).
    Display-only; the people check may read cleaner transcripts.
  - journey-establishment r214 (c89ac24b3): **plain parting for
    neutral/friendly sittings** [needs-eyes] (convoMoodGoodbye plain
    pool). Dialogue-scoped; the people check may read it.
  - The rest is evidence/scripts-only (transplant 6b/7b/8fam, wave5kill-b
    DIAG GO, establishment r213, deepening r212/r213, proof refresh
    round 20).
- **The wall (tracker, scale-onramp — converging, NOT converged):** on
  the 1615Z round's judged corpora (24 configs), survived 8/8 on the
  matched band (guard) vs 3/8 fresh; national 0/24, table 0/24, wins
  0/24, wave-5 8/24, wave-4 24/24, median 150d. The binding gap moved
  from survival to veterans — only 1/8 wave-5 ready, 6/8 short on
  living veterans. Family 8 CLOSED as a carrier suspect; family 7
  brain-side UNMEASURED (both measurement routes gate-STOPped). This
  run plays the scheduled scale leg; its panel is a fresh-band wall
  reading on the guarded master, not a bisect step.
- **Scale canon (docs/SCALE.md):** national is a POLITY — one primary with
  ≥3 SEASONED subordinates (30+ days old, trust 40+), or BELONG (valued
  subordinate in a ≥4-village realm), COVENANT (≥3 seasoned peer links),
  TRADE (≥3 seasoned trade links), CONQUEST, or REFUSE. Ladder stage 3
  (National Standing, points) is NOT national (polity rank) — the r134
  panel reached stage 3 on points while staying regional. Q1 measures the
  polity (natgate `nat=true`), with ladder stage as the secondary read.
- **Carried gaps (not this run's to build):** daily-play chooser never
  takes invites (verbal or mimed) — lane decision owed; hunger scatter
  2 bands running (r197/r204, none r206/r207); sickness-without-a-
  healer collapse (healerDays 13–125 on r207, thinnest on the
  shortest-lived seed); tribute road gated behind a second payable veteran
  (M23 revision now an instrument reading; the game rule stands; 0
  deliveries r207); "left someone behind" / "Okay. You don't have to
  have an answer." line-pool reuse (sixth band running); raise-talk
  closers formulaic ("All right — let's ask them." echo ×6); flag-emoji
  openers systematic in all -nv sittings; "Don't tell the others.
  Everyone needs one place." thinking-spot line (sixth band running);
  nonverbal closing pool thin ("They press their palms together..." ×3);
  **Rufina opener stutter** ("About your plan here — So what's your plan
  here? Just... get through it?" — the seed-note prefix doubles the
  curious question; carried as a dialogue polish note); herald linger /
  wave-4 variety collapse (herald kills now land, 3 on r207's band —
  the fight side moved, the linger side did not); **wave-5 linger
  (NEW r207): Editor/Spoiler pace at the boundary, 31 fights, 0 kills
  — the r206 herald shape, one wave up; spawn/encounter question with
  instance ids still owed — this run's blank #2**; OVE-48 revert-vs-keep
  DECIDED KEEP (Nov 14 0215Z); culpritbisect narrowed 15A–15F (tracker
  blanks — bisect steps, not a journey leg).

## The blanks to fill this run (both r207-owed, driver/instrument only)

**1. Spotter d90 snapshot.** r207's Q5 spotter line was NOT MEASURABLE —
the r139 wiring grants spotter XP silently and the instrument snapshots
foodXp only at seed end (census.spotterWatch); all four r207 villages
were extinct, so every snapshot read an empty roster. The fix is
driver-only: census() gains a `spotterSnapshot()` helper (same shape),
called at d90 in policy.daily into `spotterWatch90` AND at seed end
(the r207 end-only read stays). The analyzer's SPOTTER section reads
both; the d90 line is the binding one on a collapse-heavy band. Proof
cases (20) + (23-adjacent): d90 snapshot with 2 spotters counted while
the end snapshot reads empty.

**2. Wave-5 instance ids.** r207's finding — 31 wave-5 fights, 0 kills,
the same linger lines now spoken by the Editor and the Spoiler — left
the one-vs-successive question open: the corpus carries no monster
instance ids, so "one monster pacing the boundary" vs "successive fresh
spawns" was unanswerable. The engine assigns NO instance id to wild
monsters (verified this run: `spawnWorldMonster` builds
`{id,tx,ty,wave,mx,my,hp,...}` with no seq; only lingering raiders get
a stable `lingerKey` via `lingerKeyFor`, havenGrowth.js:827-840; and
`startCombat` instantiates the fight by species id, NOT from the tile
entity). The fix is driver-only: the driver wraps `startCombat`
(pre-call tile-entity read via `playerMonster()` / `scholar.monster`,
plus `pendingMonsterId` / `feastDraw` for pending-instantiated fights)
and `fieldFight` (the `m` entity arg), recording the entity fingerprint
(lingerKey, id, tile, position, hp, veteran) per fight, plus a daily
`worldMonsters()` census. The analyzer's W5-INSTANCE section groups
wave-5 fights by lingerKey (hard identity) and reads the wild
hp-trajectory against the daily census — a fought-and-survived beast
keeps its wounds, a fresh spawn is full HP — and names the shape per
seed: ONE / SUCCESSIVE / MIXED / UNANSWERED (measurement only, never
a gate). Proof cases (21a) MIXED + (21b) SUCCESSIVE + (22) missing file
→ unavailable.

**3. (Conditional, after the panel.) Rufina opener stutter.** The seed
opener composes `"About {seedNote} — {spoken}"` (conversation.js:3483);
for the curious `q_plan` want the note is "your plan here"
(convo-wants.js:498) while the question itself is "So what's your plan
here? Just... get through it?" (characterGen.json:5365) — the prefix
doubles the question. IF this band's transcripts show the stutter
again, the fix is dialogue-scoped: in the seed-line composition, when
the spoken part already contains the seedNote (case-insensitive), use
the opener line as-is instead of prefixing "About {note} — " — the
same "don't double-prefix" pattern as the existing `alreadyNamed`
guard (convoFavorHead). Proof test + a post-fix transcript re-check on
one seed; NOT a panel re-run. If the stutter does not recur, the note
stays carried.

## Q1 (PRIMARY) — NATIONAL ON-RAMP: measure it on current master

**Question:** in a competent 140d panel on fresh seeds, how many villages
reach national (a polity lives, `nat=true` in the natgate file), and when they
don't, what is the single binding constraint per seed — the closest road
(LEAD/COVENANT/TRADE seasoned counts), what it lacks, the pending shape,
the belong good flag, or collapse before the national window? SECONDARY:
does the CASCADE lingerer guard's landing move survival vs r207's 0/4 —
a marked survival rise names the guard as the prime suspect (single-diff
attribution from the 1615Z round), not a panel artifact.

**Interesting-finding rule (binding):** the run is informative iff EITHER
≥1/4 seeds reach national (GO — the on-ramp is open on current master, the
wall moved) OR 0/4 AND the analyzer names a per-seed blocker for every
seed (NO-GO on the wall, blocker named — the finding IS the blocker). 0/4
with no diagnosable constraint (e.g. all seeds die before d60 with no links
at all) = INCOMPLETE — document and move on, do not re-score the panel
against a friendlier metric.

**What would overturn the picture:** ≥2/4 national, or a full seat, or a
seed whose blocker is a named defect with a narrow fix (that becomes the
run's blank — fix + proof, or document in sim-findings.md). A survival
rise to ≥3/4 with the guard as the only survival-relevant landing would
also overturn the collapse picture — record it as a guard-attribution
read, not a gate verdict.

## Q2 — REGRESSION GUARDS (fail the run if any breaches)

- r134 spoken-raise: 0 not-offered-spoken raise talks AND ≥1 properly
  answered (the analyzer's classifier; exit 2 if the band has no raise
  talks at all — INCOMPLETE, not a verdict).
- Vetbar: 0 days where readiness veterans != ladder veterans per wave 4
  and wave 5.
- Trap-line: 0 defect sittings (mime shown, no nv:answer at turn 0).
- Betrayal sibling: 0 turn-0 betrayal:accept offers without the invite
  label in the sitting's opening THEM lines.
- Nod-loop (r132 re-proof): 0 sittings with a streak of ≥4 consecutive
  identical nv: react gestures (nod/smile/pointself, excluding
  nv:listen, which progresses); max streak reported per sitting.
- Lived-days within ±25% of the **3-band rolling mean 478**
  ((r204 419 + r206 555 + r207 461)/3 = 478.33 → 478; guardrail 359–598)
  — **rolled forward one band from r207's 500, recorded here before the
  panel runs** (the rolling window moves with the bands; r207's 461
  replaces r197's 526 in the window). No alive/dead flip without an
  attributed cause.
- Lesser seat priced ≥3/4.

## Q3 — BARAKA / DAILY-PLAY MIME (read-only, carried)

Count in the panel's say-captures: daily-play mimes shown vs
nv:accept/betrayal:accept taken in daily play (capture lower bound + betray
watch off-day events). Expected 0 daily accepts — the gap, confirmed.
Record the lane decision owed; no build claimed. Baraka re-check: any
comm-'none' villager with a staged raise in the band, and what happened.

## Q4 — PEOPLE CHECK (d90/d120 + nonverbal + raise talks, in full)

Read in full: the d90/d120 transcripts AND the explicit nonverbal sittings
AND all raise talks. Bar: senseless 0 for the raise-answer class (a spoken
raise answered with the words that fit what was said; no English YOU lines
in a no-words sitting; no nod loops past the answer). NEW surfaces this
run: the r214 plain parting (neutral/friendly sittings must close plainly,
not cut); the r211 quote fixes (no doubled quotes in transcripts); the
r209 deferred-ask ledger guard + favor-block noBeat — any favor-blocked
sitting must read coherently; the r208 lapsed-want thread — a lapsed want
must name the current favor. The r132 nod-loop thinning and the r201
favor-want settle gate are re-checked, not re-litigated as defects.
**Stutter watch:** any seed-opener line of the shape "About X — <the
same X as a question>" is a live recurrence of the Rufina stutter —
record it with the want + seedNote for blank #3.

## Q5 — CENSUS (plain words)

Per-seed: who lived/died, what they knew (monster meat, places, links),
what was missing. Standard scale census fields (ladder stage, lesser/full
seat, national, deaths by cause, books close). Spotter read: villagers
with foodXp.spotter > 0 / spotter skill ≥ 1 per seed — d90 FIRST (the
binding read on a collapse-heavy band), end second. Funeral-mend watch:
any funeral/mourning shape change vs r207's band (deaths by cause
+ mourning beats in the capture). **W5-INSTANCE read:** per seed, the
wave-5 shape (ONE / SUCCESSIVE / MIXED / UNANSWERED) with the
hp-trajectory evidence behind it.

## Panel

- **Seeds: FRESH 135605–135608** (freshness verified below). One seed per
  process (r183 adoption: driver multi-seed state leak).
- **Horizon:** DAYCAP=140, death-aware stop (+10d tail max).
- **Policy:** `scalecourt-traderoad-r113-linkraise-sit` (same as
  r131/r132/r133/r134/r195/r196/r197/r204/r206/r207) — NO chooser change
  in this run beyond the r207 secret:* ENGAGE addition (kept).
- **Driver:** `scripts/journey-scale-r215-20261115.js` (r207 driver cloned:
  labels/EVIDIR/seed list only + spotterSnapshot/d90 + fight-instance
  wrappers + daily monsterWatch census).
- **Analyzer:** `scripts/analyze-journey-scale-r215-20261115.js` (r207
  analyzer cloned + lived-days control re-based to the 3-band rolling
  mean 478 + SPOTTER d90 read + NEW W5-INSTANCE section, measurement
  only).
- **Proof:** `scripts/test-journey-scale-r215-analyzer-20261115.js` — the
  real analyzer on synthetic corpora (r207's 47 assertions + new cases:
  (20) d90 spotter counted with empty end snapshot; (21a) w5 MIXED;
  (21b) w5 SUCCESSIVE; (22) missing w5inst → unavailable; (23) control
  478 named). **60/60 green before the panel runs.**
- **Pilot:** seed 135605 first. Pilot gates: crash, census errors > 0,
  0 census rows, reconciliation residual != 0, teleOnly > 0,
  0 trustset rows by d60, 0 national-gate rows, or no vetbar rows by
  d60 → STOP and diagnose (INCOMPLETE, not a verdict). Pilot ALSO
  gates the new instruments: 0 fightInst rows by d60 on a seed with
  fights, or an empty monsterWatch, or an empty spotterWatch90 at d90
  on a living roster → STOP and diagnose the instrument (the panel
  must not run blind on the two blanks it owes).

## Seed freshness

135605–135608: 0 hits naming the band in any dated prereg
(`grep -rlE '13560[5-8]' evidence/ --include='*prereg*'`, all dates,
run 2026-11-15 in the worktree) and 0 hits in any .md note under
evidence/ (`grep -rlE '13560[5-8]' evidence/ --include='*.md'`).
Forbidden-band lists naming 13560x: none (the lists found name
73641–73648, 73671–73678, 871xx — sim-scale-onramp-round-0615.md:123).
Recent preregs use only 135601–135604 (r207's band). Fresh band
confirmed before the panel runs. No game fixture seed is needed this
run (the analyzer proof uses synthetic corpora, no staged game).

## Metric review (to fill at closeout)

- Q1: the interesting-finding rule as written (national count + per-seed
  blocker; guard-attribution read as a secondary).
- Q2: the guards as written (lived-days control rolled forward to the
  3-band mean 478 — the roll itself is this run's metric change,
  recorded here before the panel ran, per the rolling-mean practice;
  nod-loop guard carried).
- Q3/Q4/Q5: as written. Spotter: d90 read is NEW — first live read of
  the r139 wiring on a possibly-living roster. W5-INSTANCE: NEW section
  — first entity-grouped read of the wave-5 linger.
- Telemetry: scale.json baseline is the r204 3-band roll (241/178/468);
  r207's LOUD line (w4 -60%) stands as band noise until this band
  judges the center — evaluate after this panel.

## CLOSEOUT — run 2026-11-15T1945Z (this run)

(To fill at closeout.)
