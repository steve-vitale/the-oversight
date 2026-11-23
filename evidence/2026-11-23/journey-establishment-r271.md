# Journey establishment r271 — run note

Leg 1 (establishment, days 14–40, 42-day horizon). Run
`playtest-loop-a-20261123T0145Z`, Lane A. Base master `c2c6ed9eb`
(journey-endgame r270). Fresh seed band 101975–101978 (pilot 101975,
panel replayed all 4 on the final driver after a driver-only
instrument fix — see below). Prereg:
`evidence/2026-11-23/journey-establishment-r271-prereg.md`.
Driver/analyzer: `scripts/journey-establishment-r271-20261123.js`,
`scripts/analyze-journey-establishment-r271-20261123.js`.
Panel: `.../hidden_files/evidence/2026-11-23/journey-establishment-r271-panel.log`
(302 lines), per-seed JSONs + convo transcripts in the same directory.

## Verdicts

| Bar | Result | Verdict |
|---|---|---|
| Q1 STRANDED-CLOSE RE-PANEL | 0 stranded runs on 4/4 seeds | NO-OPPORTUNITY — mechanism carried by r268/r269 proof tests |
| Q2 MOOT-CLOSE LIVE | 0 moot-close rows panel-wide (0 evictions) | NO-OPPORTUNITY — mechanism carried by r269 proof test (36/36) |
| SLEEP-RETRY (driver) | 29 retries, 29 advanced the day; sleep+0 repeats 0 (r268: 8 repeats worst seed) | WORKS — the r268 driver artifact is gone |
| DAY-DESYNC | 4 events, 4 attributed / 0 unattributed; net drift +1/seed (was −1/0) | ANSWERED — new mechanism named (daily-phase roll, see below) |
| SPOTTER | 21 total, 4/4 seeds >0 | GO |
| LADDER | 3/4 (bar ≥3/4) | GO (r268 was 2/4) |
| FASTER-ID | 3/4, 68 benefit plays in 124 bump calls | GO |
| END (broken-live closes ≤2 dawns) | 8/8 | GO |
| VILLAGE (alive at d40) | 4/4 | GO |
| Q2 sittings | 0/8 CUT | GO |
| Q1b want-raise | 73/286 = 25.5%, no zero-raise seed | GO |
| Q1 favorless rate | 3/73 = 4.1% | GO |
| Q5 exile warning | 3 exiles, HEARD 3, PRESENT 0, UNHEARD 0 | GO |
| COUNTER labels | 106 lines, 0 comma-clause, 0 em-dash | PASS |
| WARN-HEED | 27 sittings, 17 delivered, 0 engaged-unnamed | GO |
| WINPLAN (carried) | planSeeds 18, departures 51, 4/4 seeds | GO |
| LAUNCHVOICE (carried) | 47 depart beats, 4/4 seeds; beats ≤ departures every seed | GO |
| SILENT-ARRIVAL (re-read) | 4 arrivals: 1 narrated by name, 3 spoken under descriptive arrival names | RE-READ — instrument gap, not game silence (see below) |

## Census (plain words)

Four villages, all alive at day 40. 101975 is the strongest: 11 of 12
alive, wave 4 reached, standing 125, 4 plans seeded, 18 departures,
78 party fights — but the pantry is thin (4.3k kcal). 101976: 9 alive,
wave 3, standing 75, pantry ~18.7k, 5 plans, 15 departures, 88 fights;
scholar Soo died in the arena on day 30. 101977 is the roughest: 8
alive, wave 3, standing 75, 5 plans, 14 departures — and three scholar
deaths (Nancy and Arjun the same day, day 20, in the wild — a
succession that died the day it inherited — then Finn on day 39 on
expedition). 101978 is the thinnest and the proudest: 7 alive, wave 4,
standing 135 (highest on the panel), pantry only 1.8k, 4 departures —
and a triple exile on day 20, when the moot sent Jorge, Ivy, and Henry
away in one sitting. No village reached wave 5; no trio or quad ever
departed (51 departures, all pairs) — the trio gap from r265 §6 is
still open. Villagers fought in parties, taught each other, proposed
bonds (20–34 per seed), and the three exiles were all warned in
advance through the case threads the village had been holding.

## People check (8 sittings, 0 CUT, read in full)

101975 Amelia (star-naming secret, plant taught, a repay want raised
but stalled twice on "Still on that debt" — the debt never lands; the
ending owes it, not a cut). 101975 Leonard (teaching continues from a
past lesson — Persimmon found where the player said — new plant taught,
invite accepted, homesick for Columbus, Ohio; a joke lands). 101976 Leo
(foraging-help ask; honest road deferral — away from Haven, can't
promise a dawn meet, find me when I'm back — with a clear next step).
101976 Yaotl (stockpile share, alien potlucks, "Post-apocalyptic
foraging was not on the syllabus"). 101977 Kevin (a stitched opener —
"Okay, hear me out — Hey — I found some Wild Ramps"; a secret
thinking-place shown, Hickory Nuts taught, invite accepted with trust).
101977 Emma (the strongest sitting: "Have you ever hurt someone?"
— the player answers honestly, Emma thanks them for telling her, then
her own rule: "I don't keep score on that. Score-keeping is how you
stop sleeping."). 101978 Everett (a want to understand what happened;
guarded, then opens up — shock, spite, shared food). 101978 Julia
(taken-kin pod dreams about Lavrin; the player promises to ask the
System, and the close plants it: "If it answers — you'll tell me?
Whatever it says."). All eight have a want, options that engage or
deflect it, and endings that resolve, plant, or owe. No fabricated
shared history. Canned lines: pod-dream-open 1 (Julia),
recap-paraphrase 1 distinct / 2 raw; walked-in 0. One instrument
caveat, not a game defect: the pick-list rendering truncates Julia's
"I don't know." to "I don't k" — the full transcript below it is
complete.

## Sleep-retry — works; the desync changed shape

29 retries, 29 advanced the day (3/2/10/14 per seed); sleep+0 repeats
are 0 on the whole panel (r268's worst seed had 8 repeats). The r268
driver artifact — sleep refused honestly, driver never retried — is
gone. What remains is a NEW, systematic shape: exactly one skip per
seed, all identical — d3→d5 on loop days [1,2], attributed to the
DAILY phase (daily +1, sleep +1). Mechanism, named with a code
pointer: on the first two loop days, `policy.daily`'s own actions
(`scripts/policies/competent.js` daily() — forage trips + walk-home)
roll the day past midnight, so the day advances in the daily phase
and again at sleep; the first sleep is then refused "barely dawn"
at the rolled clock position and the retry waits and sleeps. The
game is behaving honestly — the scholar worked a two-dawn day —
and the driver's one-loop-day-per-game-day counting is what
desyncs. Net drift is +1 per seed (game ran 43 days over 42 loop
days); no bar depends on exact day counts. Follow-up for the next
run: the opening-days daily spill is worth one probe (which daily()
action crosses midnight), but it is a measurement footnote, not a
game-clock bug.

## SILENT-ARRIVAL — the blank was instrument deafness (re-read)

First reading: 4 arrivals, 4 silent. Wrong. The game's two
roster-join voices both name the joiner, but the analyzer's regex
never learned them: membership.js "🚶 X walks in — pack light, eyes
wide. Haven grows by one." and betrayal.js visitor-invite "X grins
wide. Haven grows by one." Fix (driver-only instrument change):
regex gains "walks in" + "Haven grows by one", and the analyzer's
join gains a ±1-day window (the line fires the day the person walks
in; the dawn roster diff sees them the next day — systematic on all
4 arrivals). The panel replayed all 4 seeds on the fixed driver;
replay JSONs are byte-identical except arrivalLines (verified by
diff). Re-read: Diana d38 NARRATED ("🚶 Diana Osei walks in — ...
Haven grows by one. (9 souls.)"). The other three stay SILENT by
the name test, but the lines are there: Gael d33 ("a tired cook
walks in", d32), Zerihun d35 ("a lean teacher walks in", d34),
Said d33 ("A frightened family cries — relief, mostly. Haven grows
by one.", d32). The remaining gap is NAME EVOLUTION: the line uses
the name known at arrival (descriptive), the analyzer matches the
name known at end of run (learned proper name). Follow-up for the
next run: capture the arrival-time name in rosterArrivals so the
join can match it. The blank as a game defect is CLOSED — arrivals
are announced by name; what remains is an instrument join.

## Metric review (for the next run)

- **Q1/Q2 NO-OPPORTUNITY twice running** (r265: 0 stranded runs;
  r271: 0 stranded runs, 0 evictions): the re-panel question is
  still unanswered live. If a third band strands nothing, the
  stranding rate itself becomes the question — how often does a
  run strand at all?
- **F2 scholar deaths 5** (r268: 3; bar says ≥3 = investigate):
  investigated — all away-from-Haven deaths (arena 1, wild 3,
  expedition 1), 3/5 on one seed (101977, incl. same-day
  succession churn d20). No haven-edge death (all last dawns at
  Haven, deaths out in the world). No new signal; watch continues.
- **LADDER recovered**: 3/4 after r268's 2/4 — the thinning was a
  band effect, not a slowdown.
- **WARN-HEED recovered and holding**: 17/27 delivered, 0
  engaged-unnamed. The warn_you DEFLECT still never fired (12th
  carry) — the deflect path remains untested.
- **Q5 triple exile**: one moot, three exiles (101978 d20), all
  HEARD via the case-thread-held proxy, 0 warning lines before.
  The proxy is doing the hearing, not a spoken warning — worth
  watching whether a triple exile ever gets a spoken advance line.
- **Trio gap still open**: 51 departures, 0 trios, 0 quads.
- **F5 floor absent on this band**: thinnest 12.9%, fattest 31.9%.
- **SETTLED/DRY2/SELFWIT quiet**: 0/0/0. r152 FIX 2 settled re-ask
  still untested (settledFavorLines 0 on all seeds).
- **BOWCRAFT thinning**: 7 bows equipped (r268: 12; r265: 20) —
  report-only, but the third straight fall is worth a line in the
  next run's watch.
- **Q1b/Q1 healthy**: want-raise 25.5%, favorless 4.1%.

## Gate and telemetry

- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`
  in the worktree: **339 passed, 5 failed in 436s** — the identical
  standing-5 set as r249 (339/5) and r251 (339/5): measurement-proof-update,
  measurement-workflow (retained neutrality proof), phone-frame-proof
  (stale retained browser inputs / phone receipt), and the two
  deed-attainment 120s timeouts (living-garden, one-person-army).
  **0 attributable to this run** — this run changed no src/js, no data,
  no index.html (driver/analyzer/evidence only), and the set matches
  the sibling gates byte-for-byte in identity. Gate log:
  `.../hidden_files/evidence/2026-11-23/journey-establishment-r271-gate.log`.
- Telemetry check vs `telemetry-baselines/establishment.json` (spotter,
  ladder, standing, wave, pantry) — 3 LOUD lines, all the KNOWN schema
  mismatch (the journey driver never emits `guardrails.*` fields, so the
  checker reads them as 0; verified absent on all 4 JSONs; c3.starvationDeaths
  quiet at 0, matching the baseline's 0). Explained, not a bug — baseline
  NOT rolled.

## Reachable / fun / winnable (leg 1)

Reachable: yes — plans ignite on unseen seeds, departures flow, the
launch beat speaks on every departure, and the village routines
(teaching, bonds, favors, contests, arrivals announced by name) all
fire. Fun: yes — the eight sittings read like people, with secrets,
debts, grief, and jokes that land; Emma's sitting is the best in this
leg's recent panels. Winnable: the chain still stalls at the trio gap
(no party of three ever departed) and at wave 4 (two seeds reached it,
none passed it) — the winnability push continues upstream of this leg.
The stranded-close and moot-close fixes remain unproven live for lack
of opportunity, not for lack of mechanism.

## Files

- Driver/analyzer: `scripts/journey-establishment-r271-20261123.js`,
  `scripts/analyze-journey-establishment-r271-20261123.js` (sleep-retry,
  mootCloseTele, arrivalLines regex + join window, desync label fix).
- Prereg + run note: `evidence/2026-11-23/` (prereg, this note).
- Analyzer fork proof: `.../hidden_files/r271-analyzer-proof/`
  (r268-baseline.log reproduces the committed r268 panel log
  byte-for-byte; r271 fork reproduces every old-bar number; new
  lines only: MOOT-CLOSE, SLEEP-RETRY, relabeled bars).
- Panel evidence: `.../hidden_files/evidence/2026-11-23/`
  (panel log, per-seed JSONs, convo transcripts, per-seed logs,
  pre-fix panel log kept as
  `journey-establishment-r271-panel-prefixed-regex.log`).
