# sim-stand199-b — evidence (DIAG: the standing-199 stall)

Run: fleshout-loop-b-20261116T2030Z (Loop B), axis winnability chain, arm
sim-stand199-b — DIAG: standing stalls at exactly 199 on 5 of 8 seeds
(Loop B arm sim-haventarget-b finding, evidence/2026-11-16/
sim-haventarget-b.md §Wall numbers / §Village assessment; findings
backlog line 2445). Branch `sim-stand199-b` (worktree
`~/workspace/worktrees/sim-stand199-b`). Frozen prereg:
`evidence/2026-11-16/sim-stand199-b-prereg.md` (commit 4479b6e78).
Instrument: `scripts/standing199-instrument-20261110.js` (REUSED from
arm sim-standing199-a — proven on band 170233–170240), driver
`scripts/stand199-driver-20261116.js`, analyzer
`scripts/stand199-analyze-20261116.js`, proof
`scripts/test-stand199-b.js` (commit 8297e0dd7). Anchor (both legs):
`8297e0dd7`. Policy: competent verbatim, sha256 `74a890f0844e…` (full:
`74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`).
Band 102701–102708 (8 seeds, fresh — see prereg seed-freshness
record), horizon 150d death-aware, OFF leg first (recorder off) then
ON leg (recorder on). No balanced panel (DIAG, no game change). No
canon doc covers the standing / scale system specifically (prereg
CANON GAP, recorded not invented); docs/TABLE.md is the closest (the
table prices the run; the full seat keeps the national bar + wave
bars). No host write-flap hit during this run (all 16 corpus writes
`wrote: true`, 0 `@@FALLBACK`).

## VERDICT — DIAG GO

All 5 frozen GO bars hold (see §GO bars). The instrument is valid and
the table is trustworthy. The verdict is the per-seed table itself:

**The 199 stall is the defer5 combat-readiness deferral — a stage
gate, not a cap and not a contribution that stops counting — and on
this band the gate opens 4/8 times.** Every pinned seed pins on
`defer5` with **veterans the only short bar at first pin** (8/8
seeds); the plenty-cap hold fires **0 days**; no contribution stops
before the pin — war is still growing on the first-pin day on all 8
seeds and keeps growing under the pin on 7/8. The four released seeds
differ from the four pinned seeds in READINESS, not in any standing
contribution: every release lands on the exact day the second living
veteran arrives. The 199 stall and the national trust-lapse are
DIFFERENT mechanisms: pins happen on all 8 seeds while national is
never reached on any of them (0 lapses to compare — the lapse table
is empty because the polity never forms).

## The answer, in plain words

The number 199 is `t5 − 1`: wave 5 unlocks at standing 200, and
`villageStandingTotal()` (`src/js/standing.js`) holds the gated total
at 199 while the village's real fighting strength is not ready. The
village earns standing past 200 in blood and bread, and then waits at
the fifth door for a second living wave-4 killer. On this band the
wait is the whole story:

- **The pin is always the veterans bar.** First-pin short bars:
  veterans alone on 8/8 seeds (armor, weapons and tricks all met at
  first pin — 102701 pins at 8 armored / 8 armed / 30 tricks / 1
  veteran; 102708 at 8 / 10 / 24 / 0). The village spends 856
  snapshot-days with 3 of 4 readiness bars met, and 205 days with
  exactly one living veteran (demand 2). Twelve veteran deaths
  across the band keep the pair from ever coinciding on the pinned
  seeds.
- **No contribution stops.** War's last gain comes AFTER the first
  pin on 7/8 seeds (102703: last war gain d142, pin d84; 102701:
  d111, pin d86). The one exception, 102708, stops gaining war the
  day the pin starts — but its capped total already cleared 200, so
  the pin is still the deferral, not a points shortfall: the village
  simply stopped killing while pinned, then died. Diplomacy is 0 on
  every snapshot of every seed (one link per village at most, never
  regional+ — see §Diplomacy sidebar). Plenty plateaus are feast
  gaps, not a cap: the plenty cap (100 toward wave 5) never binds —
  0 cap days, and the one seed with plenty 100 at peak (102705)
  still has capped 300 ≥ 200.
- **Releases are same-day second-veteran arrivals, 4/4.** 102701
  d102, 102702 d98, 102704 d115, 102706 d151 — on each, the day the
  veteran count first reaches 2 IS the release day. One release
  veteran is a `visjoin_134` incomer (102706): a stranger who walked
  in off the road already blooded, as on the 170233 band. After
  release the peak ratchet grandfathers the door open: 102701 ends
  readiness-5 unready again (10 post-release days with 2 veterans
  but another bar broken) and stays released; 102706 releases on the
  final snapshot day (d151) and survives to horizon.
- **The 295/420 shape is the released shape.** The haventarget
  band's two released seeds (295, 420) are what 102701/102702/102704/
  102706 look like after the ratchet fires: gated == raw, 350–400.
  They do not differ from the pinned seeds in any one contribution —
  war ranges overlap in kind (released peak war 300–375, pinned
  200–275; the released villages simply killed more) and diplomacy
  is 0 and plenty 0–100 on both sides. The difference is the
  veteran pair coinciding, not the points.

## Per-seed table (ON leg)

| seed | days | end | class | peak raw (day) | pin199 days (first) | first-pin short bars | ready5 days | release day | vet-1 days | vet deaths |
|---:|---|---|---|---:|---:|---|---|---:|---:|---:|---:|
| 102701 | 126 | lost | released | 370 (d111) | 16 (d86) | veterans (1/2) | 10 | d102 | 16 | 3 |
| 102702 | 150 | survived | released | 395 (d138) | 28 (d70) | veterans (0/2) | 1 | d98 | 44 | 3 |
| 102703 | 150 | survived | defer5 | 275 (d142) | 68 (d84) | veterans (1/2) | 0 | — | 59 | 1 |
| 102704 | 146 | lost | released | 350 (d137) | 41 (d74) | veterans (1/2) | 5 | d115 | 37 | 4 |
| 102705 | 132 | lost | defer5 | 300 (d86) | 75 (d57) | veterans (1/2) | 0 | — | 7 | 1 |
| 102706 | 150 | survived | released | 400 (d151) | 69 (d82) | veterans (0/2) | 1 | d151 | 12 | 0 |
| 102707 | 126 | lost | defer5 | 265 (d96) | 54 (d72) | veterans (0/2) | 0 | — | 30 | 0 |
| 102708 | 106 | lost | defer5 | 240 (d81) | 32 (d73) | veterans (0/2) | 0 | — | 0 | 0 |

Classes: released 4, defer5 4, plenty-cap 0, standing-short 0,
mixed-199 0, defer4-pin 0 (0 pin-99 days in the whole corpus — wave 4
releases cleanly once raw hits 100), unclassified 0. Total pin-199
days 383, all defer5, 0 cap days.

## Per-contribution stop table (which contribution stops, when)

Last-gain day per contribution; plateau days at end = end day minus
last-gain day. "Still growing at first pin" = last-gain day >=
first-pin day.

| seed | class | war last-gain (plateau) | diplomacy last-gain | plenty last-gain (plateau) | war growing at pin? |
|---:|---|---|---|---|---|
| 102701 | released | d111 (15d) | never (0 throughout) | d59 (67d) | yes |
| 102702 | released | d138 (13d) | never (0 throughout) | d75 (76d) | yes |
| 102703 | defer5 | d142 (9d) | never (0 throughout) | never (0 throughout) | yes |
| 102704 | released | d137 (9d) | never (0 throughout) | never (0 throughout) | yes |
| 102705 | defer5 | d82 (49d) | never (0 throughout) | d86 (45d) | yes |
| 102706 | released | d151 (0d) | never (0 throughout) | d148 (3d) | yes |
| 102707 | defer5 | d96 (29d) | never (0 throughout) | d78 (47d) | yes |
| 102708 | defer5 | d73 (32d) | never (0 throughout) | d81 (24d) | yes (same day) |

No seed's war stops before its pin. Diplomacy never starts on any
seed. Plenty stops are feast gaps (the last feast lands weeks before
the end on most seeds), never a cap bite — capped already clears 200
whenever plenty plateaus.

## Released-vs-pinned contribution comparison (H3)

Best-day (peak-raw) splits, war / diplomacy / plenty:

- Released (n=4): war 300–375 (mean 343.75), diplomacy 0–0,
  plenty 0–100 (mean 35); peak raw 350–400.
- Pinned (n=4): war 200–275 (mean 225), diplomacy 0–0,
  plenty 0–100 (mean 45); peak raw 240–300.

No contribution differs in kind: diplomacy is 0 on both sides,
plenty ranges are identical, war differs only in amount (the
released villages killed more — 5–6 wave-4 kills vs 0–5 — not in a
different source). The release is a readiness event, not a points
event: every released seed's release day is the day its veteran
count first reached 2 (d102/d98/d115/d151), and no pinned seed ever
has a 2-veteran day while its other bars hold.

## H4 — the 199 stall vs the national trust-lapse

Different mechanisms, separated on this corpus in the strongest
sense: the pin table is full (383 pin-days on 8/8 seeds) while the
lapse table is EMPTY — national is never reached on any seed
(nationalEver 0/8, nationalDays 0, lapses 0, re-stages 0), so there
is no lapse for a pin to coincide with.

- The stall lives in `src/js/standing.js` (`villageStandingTotal`,
  defer5 hold): it gates the wave-5 door on combat readiness. Its
  precondition is only capped standing ≥ 200, which 8/8 seeds meet.
- The lapse lives in `src/js/hierarchy.js` (`scaleRank` reads the
  live `state.nationalLive` flag; a polity needs ≥ 3 seasoned
  subordinates, 30+ days AND trust 40+ via `_linkSeasoned` /
  `polityOf`): it gates the national scale flag on link trust. Its
  precondition — a 3-link polity — never forms here: max 1 link per
  village on all 8 seeds, seasoned on 4, regional+ on 0 (one link
  can never be a realm). So the lapse mechanism cannot even start,
  while the pin mechanism fires on every seed. A pin without any
  national at all is the separation the prereg asked for.
- Corroboration from the seasoning band: there the two readings
  diverged in the opposite direction (courtship leg national 8/8
  with gated standing 199 on 7/8 — national held while pinned).
  Both directions now measured: pinned-with-national and
  pinned-without-national. The stall and the lapse are independent
  gates that happen to share a victim (the full seat, which needs
  both the wave bars and national scale).

## Diplomacy sidebar (the standing split, all 8 seeds)

- **Diplomacy reads 0 on every snapshot of every seed** — at peak
  raw and at end. War carries 100% of the standing that exists on
  102703/102704, and war + bread on the other six.
- Links: max 1 per village on all 8 seeds (kind null, plain
  haven↔village); seasoned on 4 seeds (102701 trust 40, 102702
  trust 46, 102706 trust 47, 102707 trust 58) but regional+ on 0 —
  no `polityOf` exists, so the seasoned link still scores 0. The
  standaccum-b / standing199-a / standing99107-b shape holds
  verbatim on current master: one link can never be a polity.
- The System's stage pitch promises bonds as a road ("Get me
  STANDING — blood, bonds, or bread") while bonds read 0
  everywhere. That tension stands.

## Wall numbers — both legs (scale wall)

OFF and ON wall fields agree exactly per seed (D2 full-band: 0
divergences — see §GO bars). One table for both legs:

| | value |
|--|-------|
| national by standing ≥200 (gated) | 4/8 (the 4 released seeds) |
| national by scaleRank | 0/8 (all regional at end) |
| national ever (nationalLive any day) | 0/8 |
| table | 0/8 |
| wins | 0/8 |
| wave 4 unlocked | 8/8 |
| wave 5 unlocked | 4/8 (102701, 102702, 102704, 102706) |
| wave 5 faced (wave-5 kills) | 2/8 (102701: 2 kills, 102704: 1 kill — the first wave-5 kills on any standing band; 170233–170240 and 99101–99108 had 0) |
| median survival | 139d (days 106, 126, 126, 132, 146, 150, 150, 150) |
| survived to horizon | 3/8 |
| wave-4 kills (total) | 24 |
| deaths (samples, total) | 618 |
| deaths (memorial roll, notable) | 108 — the wild 57 (52.8%), monster 20, contest 6, arena 6, a stranger 5, starvation 3, Gavel 2, and 1 each: lockjaw, thirst, ambush, "Buffering", "Spool", "Headlight Harry", "Big-Eyes", "The Focus Group", "The Reunion" |

## Sense-testing

**The standingLine rows are honest on every pin and release day.**
They name the raw number, the split (war/bonds/bread), both
thresholds, and exactly the short bars — e.g. 102701 d86: *"Standing
220 (war 200 · bonds 0 · bread 20) — wave 4 at 100, wave 5 at 200 —
HELD at wave 4: the fifth draft waits (blood your fighters (1 of 2
veterans))"*, and the release-day lines carry no hold note,
correctly (102701 d102: *"Standing 295 (war 275 · bonds 0 · bread
20) — wave 4 at 100, wave 5 at 200"*). No silent gate was found. The
wave-5 title ("The Producers") never leaks in a hold line. The
pilot's `Game.say` tap caught 0 lines on all 8 seeds — the hold beat
speaks through `sysSay`, as the standing199-a arm found — so the
sense read below comes from the supplementary sense leg
(`scripts/stand199-sense-20261116.js`, seed 102703, first pin d84,
`loadGame({captureSysSay})`, trajectory verified identical to the ON
corpus on all common days, 0 value diffs).

**The hold beats, read aloud (sense leg, seed 102703).** The beats,
in call order from the first pin (d84): *"📡 The fifth draft stays
in the wings. It wants a village that can fight — blood your
fighters (1 of 2 veterans)."* then weekly reminders — *"stays in the
wings — blood your fighters (1 of 2 veterans)"* — tracking the bar
as veterans live and die (1 → 0 → 1 across the run: two reminders
name 0 of 2). The beat is not mislabeled and does not misfire; it is
the same voice the defer5gate / standing199-a sense seeds heard.
What it never says is the near-miss: no beat for a village that
ALMOST has it (102703 sits at 1 veteran for 59 days and ends the
run still waiting; 102705's 75-day pin passes with only the weekly
reminder). The #2067 near-miss-path question stands, undecided
here. The wave-release lines also read correctly in order (Wave 2,
3, 4 talent releases, then the Mirror Draft opening).

## Village assessment (plain words)

Eight villages played competently for three to five months. Four of
them walked up to the fifth door and knocked — and the knock is
always the same sentence: one living wave-4 killer, waiting for a
second who keeps dying, or never arrives. One village waited 75 days
at that door; another waited 68. Four villages walked through, each
on the exact day a second killer stood alive beside the first — once
that second killer was a stranger who walked in off the road already
blooded. Two of the four that walked through went on to kill
wave-5 monsters — the first wave-5 kills any standing band has
measured — before their villages fell anyway. Nobody built a second
bond with another village — eight villages manage one link each at
most — so the bonds half of the standing bar stays at zero
everywhere, and the four links that do ripen are lone courtships,
not realms, and score nothing. Feasts are rare treats, not a road.
Nobody won, nobody reached national, nobody sat at the table — the
scale wall stands, but the fifth door is no longer shut: 4/8 open it
now, where the haventarget band opened 2/8 and the knowledge-b band
opened 0/8. The wall moved one rung on base moves alone, again —
and the binding constraint is now named to the day and the person:
two living wave-4 killers, at the same time.

## GO bars (frozen prereg §Primary metric)

1. **8/8 seeds classified, 0 unclassified** — PASS. Released 4,
   defer5 4; pin class + per-contribution stop verdict + H4 row on
   every seed.
2. **Corpus 16/16 files parse** — PASS. 8 OFF + 8 ON, one file per
   seed per leg; all parse as JSON, 0 instrument errors on every
   file.
3. **Proof green** — PASS. `node scripts/test-stand199-b.js`:
   **32 passed, 0 failed** on the instrument tip (commit
   8297e0dd7). D1 determinism + D2 neutrality green inside the
   proof (60d, seed 102701); D2 full-band 0 divergences confirmed
   by the analyzer (OFF vs ON daily signatures + wall fields,
   identical per seed).
4. **Wall numbers reported, both legs** — PASS. Table above; OFF
   identical to ON per D2.
5. **Measurement bar** — PASS. Every pinned seed carries first-pin
   day, first-pin short bars, pin-days, and per-contribution
   last-gain days; every released seed carries its release day and
   the veteran-arrival day it matches (identical on 4/4); the
   released-vs-pinned contribution comparison is stated per
   contribution (war differs in amount only, diplomacy 0 both,
   plenty identical ranges); the H4 table is reported per seed
   (pins on 8/8, lapses on 0/8 — national never reached).

## Metric review (do NOT re-score; for the next run)

- **H1 confirmed, cap leg 0 days again.** The plenty-cap hold
  fired on 0 days across the band, the third band in a row (0 on
  170233–170240, 0 on 99101–99108). The cap is fixture-proven and
  would fire had any seed's capped total lagged its raw past 200 —
  but plenty never exceeds 100 toward wave 5 on a band where feasts
  are this rare. The cap is a live guardrail that never binds in
  competent play; it is not the stall.
- **No contribution stops before the pin.** War is still growing on
  the first-pin day on 8/8 seeds. The "contribution that stops
  counting" framing from the haventarget finding is answered: the
  gated number is held by the readiness deferral while the raw
  number keeps climbing underneath it. The one partial exception
  (102708, war flat from the pin day) is points exhaustion AFTER
  the pin, not its cause — capped already cleared 200 that day.
- **H3 answered: readiness, not points.** Released vs pinned splits
  overlap in kind on every contribution; the release is a veteran
  coincidence. A next arm pricing a lever should price the veteran
  pair, not the points.
- **H4 answered, but weakly tested in one direction.** The lapse
  table is empty because national never forms on this band — the
  separation is real (pins without national) but the seasoning
  band's opposite direction (national held while pinned) is what
  makes the independence two-sided. No fresh DIAG is owed: both
  directions are now measured across the two bands.
- **Wave-5 facing is now measured (kills, not unlocks).** 2/8 seeds
  killed wave-5 monsters (3 kills total) — the first on any
  standing band. Engagement without a kill is still unmeasured (no
  w5faced field in the reused snapshots); a next arm that needs the
  facing should wrap a wave-5 engagement entry point, as the
  standing199-a metric review already noted.
- **102706's release lands on the post-horizon snapshot (d151).**
  The run's day count is 150; the release is recorded on the
  driver's final snapshot after the day-150 close (veterans reach 2
  that day via visjoin_134). The release is real (peak ratchet
  fired, gated 400), but a horizon-censoring note belongs here: the
  door opened on the last possible day. A longer horizon would say
  whether 102706 then faces wave 5 or collapses under the open
  door like 99102 did.
- **Median survival is NOT the horizon cap on this band** (139d,
  3/8 survived) — the death distribution is real here, unlike the
  170233 band (150d cap, 4 censored). The 150d horizon was right
  for the pin question (first pins d57–86, releases d98–151).
- **Say-tap channel gap, again.** The pilot's `Game.say` tap caught
  0 lines on all 8 seeds; the hold beats live on `sysSay` and need
  `captureSysSay` with the trajectory-identity guard. The sense leg
  is the correct channel for the next arm that needs System voice.
- **No metric was moved mid-run.** The GO bar was judged exactly
  as pre-registered. The analyzer's pooled median is the standard
  median (the standing99107-b metric-review fix — upper-middle
  retired).

## The named next lever (do NOT build in this arm)

**Veterans alive TOGETHER — the binding bar, 383 pin-days.** The
lever is whatever keeps two wave-4 killers alive at the same time
long enough for the door to open: killer survival after the blood
(99102's first veteran died the day after; 102701's pair took 16
pin-days to form), veteran overlap (pairs never coincide on the
pinned seeds — 205 days at exactly one veteran), or a bar that
counts a dead veteran's kill once (the VETSHAPE instrument,
`src/js/standing.js` — default OFF, living-only — is the existing
shape-change candidate; Steve's #427 readiness-gate call owns the
decision). Coordinate with, do not duplicate, the win-fielddmg and
win-allyjoin lanes. The diplomacy-zero (one link can never be a
polity) and feast-rate (plenty thin) findings are separate blanks
with their own owners (sim-diplo-verb-b answered the verb; the
build question is the link-formation rate).

## Telemetry deviation check (body step 10)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-16/perseed-stand199-b-on/*.json' --metrics
national,table,wins,exiled` REFUSED the corpus: "refusing
recorder-corpus input: all 9 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs" (the 9th
row is the sense file, matched by the glob). No LOUD line fired; no
deviation is claimed. The baseline itself (`scale-wall.json`, regime
"winseat", national 12/16 / wins 16/16) carries a DO NOT compare
note for pre-seat substrates — wins are structurally ~0 there and
the check would fire a spurious LOUD. The check is not applicable
to this corpus shape; the wall numbers above are the report. Same
outcome as the standing99107-b arm.

## Findings for the backlog

- **199 IS THE DEFERVETERANS GATE, AND IT OPENS NOW (4/8).**
  Defer5 with veterans the only short bar at first pin on 8/8
  seeds; plenty-cap 0 days; releases d98/d102/d115/d151, each on
  the second veteran's arrival day. The door's binding constraint
  is two living wave-4 killers at once. (This arm.)
- **WAVE-5 KILLS MEASURED FOR THE FIRST TIME ON A STANDING BAND
  (3 kills, 2/8 seeds).** 102701 (2 kills) and 102704 (1 kill)
  fought wave 5 after release; prior standing bands had 0 wave-5
  kills. Unlock is not facing, but facing now has a number. (This
  arm.)
- **NATIONAL NEVER FORMS ON THIS BAND (0/8 ever) — THE POLITY
  NEVER STARTS.** Max 1 link per village, seasoned on 4, regional+
  on 0. The H4 separation is measured, but the deeper blank is the
  link-formation rate (sim-diplo-verb-b's verb answer stands; the
  build question is still open). (This arm.)
- **102706 RELEASES ON THE FINAL DAY (d151).** The door opened on
  the post-horizon snapshot; whether the village then faces wave 5
  or collapses under the open door is unmeasured — a longer horizon
  (or a follow-up on the released seed) is owed before the release
  is called a win. (This arm.)

## Proof and landing

- Proof: `scripts/test-stand199-b.js` — 32/32 PASS (fixtures +
  live harness smoke + D1/D2 legs). Re-run post-commit below.
- Commits (this worktree branch sim-stand199-b; coordinator merges
  via --ff-only; merged locally, pending ship — no push, no bump,
  no live verification by this worker):
  - 4479b6e78 sim-stand199-b prereg (before any judged sim)
  - 8297e0dd7 sim-stand199-b instruments + proof 32/32 (zero src/js)
  - (pilot + evidence commit below)
- Files: prereg + evidence in `evidence/2026-11-16/
  sim-stand199-b*.md`; analysis `evidence/2026-11-16/
  stand199-b-analysis.json` (+ `.log`); per-seed JSON in
  `evidence/2026-11-16/perseed-stand199-b-off/` (8 files) and
  `evidence/2026-11-16/perseed-stand199-b-on/` (8 pilot files + 1
  sense file, anchor 8297e0dd7); scripts
  `stand199-driver-20261116.js`, `stand199-analyze-20261116.js`,
  `stand199-sense-20261116.js`, `test-stand199-b.js`.
- Index-clobber note: safe-commit.sh left staged-as-deleted entries
  in the worktree index after both commits (prereg + instruments);
  repaired each time via `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info` after hash-object
  verification (all blobs matched HEAD), and verified `git status`
  empty + `git diff HEAD` empty. The commits themselves were always
  correct.
- Worktree state at handoff: only committed work; no uncommitted
  leftovers beyond the pilot + evidence commit below (verified
  before reporting).

## Diff check

Zero `src/` changes in the branch diff (`git diff --stat HEAD --
src/` empty) — DIAG, recorder wraps only (scripts-side). No game
change, no lever, no balance change. Nothing to land as gameplay;
the evidence + corpora are the deliverable.
