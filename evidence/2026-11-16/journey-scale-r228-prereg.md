# journey-scale r228 — PRE-REGISTER (lane A, leg 3 SCALE, titan-muster MARCH lever: matched A/B panel on r227's powered subset)

**Run id:** `playtest-loop-a-scale-r228-20261116T2318Z` (lock run_id
`loop-a-20261116T2318Z`).
**Run:** scheduled Mon 2026-11-16 22:45 CST (04:45 UTC); lock created
05:19:48Z. **Flap delay (recorded, not hidden):** first worktree
registration FAILED 05:21–05:23Z on the host write flap
(`git worktree add`: 5 file-write EPERMs + `fatal: Could not reset
index file to revision 'HEAD'`); probes failed 05:24Z (git update-ref
+ plain file write, both EPERM) and the flap watcher logged FAIL
05:22–05:24Z; 10-min wait + re-probe PASSED 05:35:50Z (watcher ALL-OK
05:33:50Z — window ~12 min); registration retried and landed ~05:55Z
after an 18.5-min checkout under registry-lock contention with Loop B
0430Z (three concurrent registrations). Heartbeat landed at
registration; hbloop `~/workspace/worktrees/journey-scale-hbloop-r228.sh`
(9-min cadence) launched 05:55Z.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `410fb8109` at prereg time.
**Pre-flight:** main tree clean (`git status --short` empty, 0 files),
disk 45%, lock absent (no stale-lock recovery), `git pull` already up
to date. Reap: SKIPPED (registry lock held by another reaper run,
consecutive skips: 2) — no cleanup this run; 15 worktrees listed.
Worktree `journey-scale` registered ~05:55Z; heartbeat landed
immediately after registration.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run. The march step is a POLICY change (the competent
player drives existing game verbs — walking to a known tile) — zero
`src/js` change in this run.
**DELIVER OVER MEASURE (2026-11-01):** this run BUILDS the r227-owed
lever (a driver-side march step completing the muster) and measures it
on a matched panel — a lever test with a real change in the player's
repertoire, not a re-proof.
**Time-box (stated up front):** hard stop ~06:45Z (2h cron from the
04:45Z schedule). The panel is the POWERED SUBSET by design — the two
seeds where r227's muster completed (135613 ready 29d, 135614 ready
8d); 135615/135616 never completed a muster, so the march is inert
there and they add runtime, not information. The `--quick` gate is
launched in the background right after the build commit; the analyzer
proof tests are the binding suite for this driver-only change, and the
gate result is reported if it lands before closeout — if it does not,
the run note says so and the merge waits for it (no landing over an
unfinished gate).

## Standing context (read before scoring)

- **r227 scale (landed 2026-11-16, master 410fb8109):** Q1 MUSTER
  NO-GO — the call sounded, the muster completed twice (135613: called
  d85, 11/10, ready 29d, committed Benoit Lambert; 135614: ready 8d),
  but **0 titans slain on either arm** (outcomes log, authoritative):
  a complete muster sat ready for 29 days while nothing marched — the
  driver has no march step, nobody walks to the lair, and the engine's
  meeting flow never engaged the coalition. The muster is half a lever;
  the march is the missing half. In real play the player IS the march
  step, so the sim understates a real player — but the muster alone, as
  pre-registered, slays nothing. **Blank owed to this run:** muster +
  march, with its own prereg. The r227 metric review adds: the GO
  branch must count ENGINE-slain titans only (the outcomes log) — a
  field mauling (135613's Herald, killed by Nino Kapanadze d114) does
  NOT count as slain; and a future cost bar should include muster
  hunger days and trust movement while it stands.
- **The mechanism (verified from code before this prereg):** the Herald
  is a placed world monster (`titanPlace`: `spawnWorldMonster('herald',
  tx, ty)`; lair tile readable via `Game.worldMonsters()` as
  `tx,ty`); `titanWrapCombat` wraps `Game.startCombat` — with a
  complete muster the fight proceeds and allies are injected
  (`titanInjectAllies`); the sim harness resolves a pending encounter
  by calling `Game.startCombat(pendingMonsterId)` after the policy's
  daily (`sim-harness.js` driveContests). The competent policy's
  `walkTo(Game, hx, hy)` (`scripts/policies/competent-nofallback.js`,
  exported) walks tile-to-tile via `travelTargets`/`travelTo` with
  honest travel costs and encounter risk; `travelTo` stops at
  blockages and the engine sets `pendingEncounter` when the scholar
  meets a monster. The r223 evidence (104 startCombat refusals on
  135614) proves scholar↔Herald meetings DO happen on the lair tile
  and DO reach startCombat — the meeting path works; only the seeking
  is missing. The pilot settles whether walking to the lair tile
  produces a meeting reliably.
- **What changed in the game since r227's base:** nothing — this run's
  base IS r227's landing (410fb8109). The r227 band is therefore a
  valid matched control source on this base with zero base drift.
- **The wall (tracker, scale-onramp):** national 0/28 on the judged
  corpora; the binding gap is veterans / seasoned links. A slain titan
  is the lever's own outcome — whether it moves veterans/tribute is
  the downstream read, judged on the B−A difference, not assumed.
- **Scale canon (docs/SCALE.md):** national is a POLITY — one primary
  with ≥3 SEASONED subordinates (30+ days old, trust 40+), or BELONG,
  COVENANT, TRADE, CONQUEST, or REFUSE. Ladder stage 3 (points) is
  NOT national. Q1 measures the polity (natgate `nat=true`), ladder
  stage secondary.
- **Titan canon:** NO canon doc covers titans/muster (r226's canon
  note). Mechanism grounded in `src/js/titans.js` +
  `src/data/titans.json`: Herald wave 4, minAllies 10, omen stages
  0→1→2 (located); `soundTitanCall`, `titanCommitOwn` (two-tap, up
  to 3 Haven blades, 1000 kcal/day each), `titanMusterReady`,
  `titanStandDown`, `titanWrapCombat` (hard-refuses `startCombat`
  without a complete muster), `state.titans.outcomes` (the engine's
  own per-engagement log: refused / fought → slain / fled).
- **Carried gaps (not this run's to build):** daily-play chooser never
  takes invites (verbal or mimed) — lane decision owed; hunger
  scatter; sickness-without-a-healer collapse; "left someone behind"
  / "Okay. You don't have to have an answer." line-pool reuse;
  raise-talk closers formulaic; "Don't tell the others. Everyone
  needs one place." thinking-spot line; nonverbal closing pool thin;
  sortie gates (min/sum HP caps) — gate call owed, not made; the
  sortie step stays INERT in both arms this run. The muster step's
  fidelity caveat (driver sounds/commits from anywhere; real play
  needs the player at camp) stands, and the march narrows it: the
  march itself IS the walk, performed honestly with travel costs —
  the remaining caveat is discoverability (would a real player notice
  the lair tile and choose to go?).

## Q1 (PRIMARY) — TITAN-MUSTER MARCH LEVER: matched A/B panel

**Question:** when the competent policy marches a READY muster to the
lair — walking the scholar to the titan's tile the moment the
coalition is completable — does the coalition fight start, does the
Herald die, and do wave-4 kills, living veterans, tribute readiness,
and national move — against the same seeds run with the muster but
without the march?

**Arms (matched seeds 135613–135614, one seed per process):**
- **Arm A — control:** the r227 arm-B policy verbatim (muster step ON,
  march step OFF). Replicates r227's muster arm on the same base; the
  base is identical, so this is a pure replication check.
- **Arm B — muster + march:** the r227 arm-B policy PLUS the march step
  (see below). The march step is the ONLY policy difference between
  the arms.

**The march step (driver-side, policy only, no src/js change):**
called once per policy day, after the muster step, for each titan with
omen stage ≥2, a live world monster, and a READY muster
(`titanMusterReady`):
- Sanctity (partyfinish.sanctityOk): no fight/encounter/table in flight
  (`G.over`, `G.tbfight` live, `G.pendingEncounter`, `tableActive()`,
  sleeping/insideTent) — else record a `held` row with the reason.
- Read the lair tile from `Game.worldMonsters()` (the monster's live
  `tx,ty` — titans never wander, but the read is live, never cached).
- If the scholar is already on the lair tile (`map.px/py == tx/ty`),
  record an `on-tile` row and do nothing — the world's own ticking
  and the scholar's work on the tile are the meeting path.
- Else walk there with the competent `walkTo` (require from
  `scripts/policies/competent-nofallback.js`, NOT a copy — honest
  travel costs, encounter risk, blockage stops). Record from/to,
  arrived (`map.px/py == lair` after the walk), and whether a pending
  encounter with the titan's monster id is now set (the harness
  resolves it after daily via `startCombat`).
- The step never marches without a ready muster (walking to the Herald
  unmustered is the status quo — refusals, not a fight), never outfits
  allies, never touches the finale/nielsen campaign gates.
- Every ready-muster day records exactly one marchWatch row
  (marched / on-tile / held + the first failing reason); absence of a
  row IS the no-ready-muster day. The driver snapshots `state.titans`
  at seed end (omens, musters, slain, outcomes — the engine's own
  engagement log). The existing startCombat/fieldFight wrappers
  already record the fight instances; the analyzer joins march rows
  to outcomes by day.

**Fidelity caveats (frozen here, read with the verdict):** the driver
marches from anywhere — in real play the player must first be
somewhere they can walk from, which is everywhere, so this caveat is
weaker than the muster step's camp-verb one; the walk itself is
honest (travel costs, encounter risk, blockage stops). The step never
outfits allies (no gear transfer). A positive result still needs a
discoverability read (would a real player find the lair tile and
choose to walk there?) before it is claimed as game winnability.

**Interesting-finding rule (binding):** the run is informative iff
ANY of these holds:
(a) arm B fights ≥1 titan (outcomes `fought`) AND slays ≥1 titan
(ENGINE `slain` in the outcomes log — field maulings do NOT count,
per the r227 metric-review correction) with the march-completed
fights named (GO — the lever moves the titan link; the downstream
question becomes veterans/tribute/national);
(b) 0 titans fought on B AND every B seed with a ready muster carries
a named reason (never arrived / arrived but no meeting / meeting
refused / fight lost) — NO-GO on the lever, reason named;
(c) a muster marches and the coalition fight is lost — the cost is
the finding (the lever fires and fails in combat).
INCOMPLETE iff the step never fires on a seed where a muster is ready
(instrument failure — the marchWatch + outcomes catch it), or a
corpus is corrupt. A wave-5 KILL on either arm overturns the
r207/r215/r219 "fought, never killed" shape (already overturned once
on r227 B 135616 — a second one still counts as shape evidence). A
titan slain on arm A would overturn the r227 blank itself (the
control must stay 0 for the A/B read to attribute to the step — if A
slays one, say so and judge the lever on the B−A difference, not on
B alone).

**Cost bar (frozen — the price of the lever, judged with Q1):**
- lived-days (B) within ±25% of lived-days (A) — the same
  guardrail shape as Q2, arm-vs-arm.
- No village collapses on B that survived on A without an
  attributed cause (march/muster deaths named in the run note).
- Committed Haven blades who die are COUNTED (from the muster
  ledger joined to the death census) and reported against the kill
  gain — they are the price, not a hidden cost. Starvation deaths
  (B) ≤ (A) + 1 band-wide (the muster upkeep is 1000 kcal/day per
  blade — if the pantry pays for the muster with starvation, the
  bar catches it).
- REPORTED (not a fail bar — r227 metric-review owed item): muster
  hunger days (days the standing muster was fed < its need) and the
  trust movement on mustered links while a muster stands, per arm.

## Q2 — REGRESSION GUARDS (fail the run if any breaches, EITHER arm)

- r134 spoken-raise: 0 not-offered-spoken raise talks AND ≥1 properly
  answered per arm (the analyzer's classifier; exit 2 if an arm has no
  raise talks at all — INCOMPLETE, not a verdict).
- Vetbar: 0 days where readiness veterans != ladder veterans per wave 4
  and wave 5, per arm.
- Trap-line: 0 defect sittings (mime shown, no nv:answer at turn 0),
  per arm.
- Betrayal sibling: 0 turn-0 betrayal:accept offers without the invite
  label in the sitting's opening THEM lines, per arm.
- Nod-loop (r132 re-proof): 0 sittings with a streak of ≥4 consecutive
  identical nv: react gestures (nod/smile/pointself, excluding
  nv:listen, which progresses); max streak reported per sitting, per arm.
- Lived-days (arm A) within ±25% of the **per-seed mean of the 3-band
  rolling band 119** ((r207 461 + r215 522 + r219 444)/3 = 476 total over
  4 seeds → 476/4 = 119 per seed; guardrail 89–149) — a 2-seed panel
  compares per-seed means, not sums; a 2-seed sum can never reach a
  4-seed rolling total. The rolling window does NOT move this run (r227's
  band is the matched control source, not a new band to roll in; the
  next FRESH band rolls it). No alive/dead flip on arm A vs r227's muster
  arm without an attributed cause (the base is identical — a flip needs
  a mechanism read, not a shrug).
- Lesser seat priced ≥1/2 per arm (2-seed panel: a 0/2 is a breach).

## Q3 — BARAKA / DAILY-PLAY MIME (read-only, carried)

Count in the panel's say-captures: daily-play mimes shown vs
nv:accept/betrayal:accept taken in daily play (capture lower bound + betray
watch off-day events), per arm. Expected 0 daily accepts — the gap,
confirmed. Record the lane decision owed; no build claimed. Baraka re-check: any
comm-'none' villager with a staged raise in the band, and what happened.

## Q4 — PEOPLE CHECK (d90/d120 + nonverbal + raise talks, in full)

Read in full: the d90/d120 transcripts AND the explicit nonverbal sittings
AND all raise talks, on BOTH arms (the march step must not change how
people talk — the muster/council lines are the only new say-lines the
step may add; read them where they land). Bar: senseless 0 for the
raise-answer class (a spoken raise answered with the words that fit
what was said; no English YOU lines in a no-words sitting; no nod
loops past the answer). Re-check surfaces: the r214 plain parting,
the r211 quote fixes, the r209 deferred-ask ledger guard +
favor-block noBeat, the r208 lapsed-want thread, the r137
want-thread resume, the r218 commit-refusal noBeat, the r216
funeral-mend partial line, the r219 goon ask-tag fix, the r223
drift-note filter. **Stutter watch:** any seed-opener line of the
shape "About X — <the same X as a question>" is a live recurrence
of the Rufina stutter — record it with the want + seedNote.
**March-voice check (new):** the march must read as a village walking
out to meet a threat, not as a teleport — quote the march lines where
they land (the walk itself is silent engine movement; the say-lines
around the meeting are the check).

## Q5 — CENSUS (plain words)

Per-seed, per arm: who lived/died, what they knew (monster meat,
places, links), what was missing. Standard scale census fields
(ladder stage, lesser/full seat, national, deaths by cause, books
close). Spotter read: villagers with foodXp.spotter > 0 / spotter
skill ≥ 1 per seed — d90 FIRST (the binding read), end second.
Funeral-mend watch: any funeral/mourning shape change vs r227's
band. **W5-INSTANCE read:** per seed, per arm, the wave-5 shape
(ONE / SUCCESSIVE / MIXED / UNANSWERED) with the hp-trajectory
evidence behind it. **Sortie ledger:** the step is inert in both
arms — linger presence is read from the monster census, not the
sortie file.

## Panel

- **Seeds: MATCHED 135613–135614** (the r223/r227 band's POWERED
  SUBSET, reused BY DESIGN — a paired A/B comparison, judged against
  the same-run control arm, not against the historical band; the r227
  corpora are a replication reference only). One seed per process
  (r183 adoption: driver multi-seed state leak). **Two arms (A/B),
  4 sims.**
- **Horizon:** DAYCAP=140, death-aware stop (+10d tail max).
- **Policy:** `scalecourt-traderoad-r113-linkraise-sit` (same as
  r131/r132/r133/r134/r195/r196/r197/r204/r206/r207/r215/r219/r223/r227)
  + muster step (BOTH arms, r227 verbatim) + march step (arm B only).
  No chooser change beyond the r207 secret:* ENGAGE addition (kept).
  The r226 agency lecture cap is NOT ported to the scale driver (it
  would move the control arm's fight counts vs r227 — the lecture
  wart stays a people-check observation this run).
- **Driver:** `scripts/journey-scale-r228-20261116.js` (r227 driver
  cloned: labels/seeds/EVIDIR only + MARCH step + marchWatch ledger
  + titanEnd snapshot (carried) + verb wraps (carried); sortie step
  inert in both arms; filenames arm-prefixed
  `journey-scale-r228-a|b-…`).
- **Analyzer:** `scripts/analyze-journey-scale-r228-20261116.js`
  (r227 analyzer cloned + MARCH section: per-arm march ledger
  summary, march→fight join (fought/slain on march days vs
  non-march days, per seed), A/B deltas for wave-4 kills / living
  veterans / tribute / national, cost-bar read incl. muster hunger
  days + trust movement; all guard sections run per arm).
- **Proof:** `scripts/test-journey-scale-r228-analyzer-20261116.js`
  — the real analyzer on synthetic corpora (r227's assertions
  carried, renumbered + new march cases: B marches and slays / B
  marches, arrives, no meeting / B marches, fight lost / A slays
  (control overturn) / march corpus missing / cost-bar breach).
  **Green before the panel runs.**
- **Pilot:** arm B seed 135613 first, then arm A seed 135613.
  Pilot gates: crash, census errors > 0, 0 census rows,
  reconciliation residual != 0, teleOnly > 0, 0 trustset rows by
  d60, 0 national-gate rows, or no vetbar rows by d60 → STOP and
  diagnose (INCOMPLETE, not a verdict). March pilot gates (arm B
  only): ≥1 marchWatch row on a ready-muster day, titanEnd
  snapshot present, 0 verb-wrap errors, and the march ARRIVES at
  the lair tile at least once (arrival is the step's own proof —
  no arrival, no panel).

## Seed freshness

135613–135614: the band is REUSED from r223/r227 BY DESIGN (matched
panel). Verified before this prereg: the band is named in dated
preregs only by r223's and r227's
(`grep -rlE '135613|135614' evidence/ --include='*prereg*'`), and in
no other dated run note except r223's and r227's. No game fixture seed
is needed this run (the analyzer proof uses synthetic corpora, no
staged game).

## Telemetry decision (carried from r227, unchanged)

The per-run telemetry check uses `--metrics maxGameDay` only,
against the scale.json baseline (468), run PER ARM (control arm A
first — it should read close to r227's muster arm 556; march arm B
second). The fight metrics stay dropped (r223's decision: band noise
AND refused-meeting counting on titan-heavy seeds). Baseline NOT
rolled on a QUIET read; a LOUD line is a same-run investigation item
(explained vs real bug) BEFORE any roll.

## Metric review (to fill at closeout)

- Q1: the interesting-finding rule as written (ENGINE-slain only,
  march-completed fights named; cost bar as written, incl. the new
  reported hunger/trust fields).
- Q2: the guards as written, per arm (lived-days control is the
  per-seed mean 119 — the rolling window does NOT move on a matched
  band; lesser-seat bar is 1/2 on this 2-seed panel).
- Q3/Q4/Q5: as written. Spotter: d90 read is the binding read (fifth
  live band). W5-INSTANCE: per seed per arm.
- Telemetry: maxGameDay only, per arm (decision above).
- Gate: `--quick` launched in background after the build commit;
  report whether it landed before closeout.
