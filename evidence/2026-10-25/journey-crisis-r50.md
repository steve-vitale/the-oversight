# Journey crisis r50 — THE SORTIE, TAKEN (lane B, leg 6)

Direct handoff from r48/r49's carried caveat: 0 sorties across 10 seeds.
The gorge text offers a sortie nobody had ever taken in a measured run,
so this run INTERVENES: whenever a lingerer set is present at a day
boundary, the driver answers it with `Game.answerLingerer('sortie')` —
the exact beat-panel call app.js makes — up to twice per lingerer
object (second only if it still lingers 3+ days after the first).
Endure is the control only where a sortie is refused (no fighters)
or a set is truncated by horizon/village death.

Pre-registration: `hidden_files/evidence/2026-10-25/journey-crisis-r50-prereg.md`
Instrument: `scripts/journey-crisis-r50-sortie-20261025.js` (new; r49's
say-capture + convo driver, plus a sortie driver: pantry before/after
the synchronous call, fieldFight wrap flagged to the call only,
object-identity lingering snapshots before/after, gorge-after check).
Policy: oracleV2, 120d death-aware (+10d tail).
Per-seed records: `hidden_files/evidence/2026-10-25/journey-crisis-r50-seed{9405..9409}.{json,log}`
plus sheltered-transcript txt files (33 convos driven).

## Headline verdict: THE SORTIE WORKS. The verb is real.

Across 5 seeds, 46 raids, 32 unmet lingerer lines, 52 gorge nights,
148 defended fights and 23 sortie attempts, the sortie behaves
exactly as its button promises: real fighters (2–3 named villagers,
never the player, never the dead), real rations (84,475 kcal paid
panel-wide, every kcal accounted for to the unit), real blow-by-blow
fights (26 fights, every one voiced, no silent outcomes, no outcome
outside {vKill, mFlee, vFlee}), and honest aftermaths (cleared
treelines go quiet; failed sorties leave the gorge running and the
party hurt; refused sorties say the bench is bare). The 10-seed
zero-sortie gap is closed: the verb was never broken, only never
taken — the bot never took it, and now a driver has, 23 times.

## Pre-registered verdicts (§14 — bindings, not re-scores)

- M1 sortie reach: GO — attempts on 5/5 seeds (23 total), ok:true on
  5/5 seeds (17 ok, 6 refused for no fighters). The 6 refusals are
  documented reach, not missing reach: 9407 d112, 9408 d112+d115,
  9409 d26+d118+d121, each with the voiced bench-bare line.
- M2 fight honesty: GO — 26/26 sortie fights have an outcome in
  {vKill 2, mFlee 16, vFlee 8} AND a voiced fight line in the same
  call (verified after widening the match past the three verbs in
  the first pass: vFlee voices as "The Loud-Eyes mauled Mason (-29
  health) over 3 rounds... the party falls back"; mFlee with damage
  as "stood down... bloodied but breathing"; mFlee at 0 rounds as
  "stared down... not a scratch"). No vDie fired — see open items;
  the outcome set held, so this is not a re-score.
- M3 price honesty: SPLIT, reported honestly — the binding equality
  holds 23/23 (pantry-after = pantry-before − paid, exactly, on
  every attempt including refusals at 0). The formula clause (paid
  = 2000 × muster) does NOT hold as written, for honest reasons
  found in code, not in a re-cut: `_removePantryKcal` takes whole
  units, so paid overshoots cost when the pantry is full (6,136 for
  a 3-fighter 6,000-cost march) and pays short when the pantry is
  thin (2,501 for 2 fighters; 2,460 for 3; 0 for 3 fighters on 9406
  d64, when the stores were empty). The sortie line voices the
  actual paid every time ("(6,136 kcal from the stores)",
  "(0 kcal from the stores)"), so the player is never misled —
  but the metric's formula must be revised for the next run (see
  metric review). No code changed on this evidence: the behavior is
  the documented whole-unit doctrine, not a bug.
- M4 aftermath honesty: GO with two recorded nuances — (a) 0
  gorges for a cleared object while it stays cleared (the one
  name-matched flag, 9408 cliffhanger gorging d112–116, is a
  RE-DRAFT, not a still-gorging cleared lingerer: the same object
  returned as a new lingerer in the d112 raid after being driven
  off d103, and gorged only as the new episode — see below);
  (b) a treeline cleared by sortie resolves the raid crisis
  'fought' when a raid crisis is live, and says only "The treeline
  is quiet" when the crisis already resolved (9407: crisis resolved
  d112 via the ally path while lingerers still held the treeline;
  the d115 clearing sortie correctly resolved nothing, because
  there was nothing live to resolve).
- M5 people check: GO — 33 convos driven panel-wide, 0 fabrication
  flags (bar was ≥20).
- M6 regression (r47/r48 filter holds): GO — 0 corpse-drafted
  (minimum draft hp 1, as in r49) and 0 dead fighters in any sortie
  line (dead-before names checked against every sortie line).

## What the sorties actually did (panel totals)

- 23 attempts: 17 ok, 6 refused (no fighters). 26 fights: 16 mFlee,
  2 vKill, 8 vFlee, 0 vDie. 0 leader deaths in any sortie.
- Hurt is real even in defeat: vFlee leaders took 16–66 damage
  (29, 35, 24, 39, 60, 16, 36, 37); vKill leaders took 16 and 54.
  mFlee at 0 rounds (hp-1 beasts backing off) cost nothing — but
  mFlee with rounds cost up to 66 (9407 d118: Jesse stood down the
  Redactor, 6 rounds, 66 taken, and it still fled).
- The big-beast sorties are the story: 9406's Terms of Service
  (hp 340) beat back TWO sorties (vFlee 29, then vFlee 35 three days
  later) and was finally answered by the 6-day moved-on valve, not
  by force. 9406's d119 sortie cleared FIVE lingerers in one march
  (four stare-downs + a vKill at 54 taken). 9408's Quinn took 65
  driving off the Focus Group, then fell back from the Ad Break
  (16) — the same march, both outcomes, both voiced.
- Sorties teach: "COUNTER LEARNED" lines fire inside sortie fights
  (Loud-Eyes loophole, Ad Break look-away, Redactor go-quiet) — the
  march doubles as knowledge gain, and the relief beat follows
  ("stands up by the fire... triage, rations, hunt, or rally").

## Three mechanisms the panel proved (not just measured)

1. DRIVEN-OFF LINGERERS RETURN. A beast driven off (lingering=false)
   re-enters the wild pool and can raid again, go unmet again, and
   linger again — the same object: 9407 rut_king (driven off d115,
   lingering again d118), 9408 cliffhanger (driven off d103, gorging
   again d112–116 as a new episode). The sortie's own line is honest
   about this ("It's still out there, somewhere") — the return is
   the system working as voiced, not a leak. Any future
   gorge-after check MUST key on lingering episodes, not names:
   name matching false-flags exactly here (r48's trap, third
   sighting).
2. THE CRISIS CAN OUTLIVE ITS RESOLUTION — IN REVERSE. 9407's raid
   crisis resolved 'fought' d112 while lingerers still held the
   treeline; the d115 clearing sortie then had no crisis to
   resolve. The treeline and the crisis are separate state, and the
   sortie handles both branches honestly. A future instrument must
   not assume cleared-treeline ⇒ fresh resolution.
3. THE SORTIE MARCHES UNFED. When the pantry cannot pay, the sortie
   still marches and voices the shortfall (9406 d64: 3 fighters,
   0 kcal; 9408 d103: 2 fighters, 2,501 kcal against a 4,000 cost).
   The button promises "fighters, rations, real risk" and the line
   corrects the ration part aloud. Whether an unfed march should be
   refused is a design question for Steve, not a bug found here —
   recorded as an open item, not fixed.

## Per-seed summaries

- 9405: 7 raids, 4 unmet, 0 gorge (both lingerer sets sortied at
  first sight, before any gorge night), 2 sorties, both cleared
  (d66: two hp-1 hushwolves stared down, 6,136 kcal; d97: Sam
  killed the Living Wire, 16 taken, + a stare-down, 4,104 kcal).
  Village scattered, game-over ~d99 (arena attrition + starvation
  in the corpses list, not sortie deaths). 4 convos, 0 fab.
- 9406: 13 raids, 9 unmet, 16 gorge, 7 sorties (the repeat-sortie
  pole: Terms of Service beaten back twice, Ad Break twice, then a
  5-clear d119 march). Survived to horizon, 8 alive, pantry
  39,246. 8 convos, 0 fab.
- 9407: 11 raids, 7 unmet, 9 gorge, 4 attempts (1 refused, bench
  bare d112; d115 cleared 2; d118 cleared 2 including the returned
  rut_king). Survived to horizon, 5 alive, pantry 13,247. 8 convos.
- 9408: 8 raids, 6 unmet, 19 gorge, 5 attempts (2 refused d112/d115
  as the village bled out; d75 march: Quinn 65 + 16 across two
  fights). Wiped (0 alive at end, game-over) — the refusals ARE the
  story: no bench left, no sortie possible, gorge running to the
  end. 6 convos, 0 fab.
- 9409: 7 raids, 6 unmet, 8 gorge, 5 attempts (3 refused: d26, d118,
  d121 — a thin village throughout; d96 broke with 37 taken, d99
  cleared the returned gavel). Survived to horizon, 2 alive,
  pantry 0. 7 convos, 0 fab.

## Village assessment (plain words)

The sortie turns the siege from a weather event into a decision. When
the village has fighters, it can buy the treeline back at a stated
price in food and blood — sometimes cheap (a stare-down), sometimes
ruinous (two failed marches against one beast, 12,000 kcal and two
maulings, and the beast still there). When the bench is bare, the
game says so plainly and the village endures or dies with the gorge
running — 9408's end is not a sortie failure, it is the absence of
anyone left to send. The two villages that lived did so with stores
from 13k to 39k; the two that died did so with empty pantries and no
bench. Survival here is whether anyone is left standing and anything
is left to eat, not a single number.

## Transcripts (sense-testing: 33 convos, 0 fabrication flags)

Read in full on 9405 (4) and 9406 (8); spot-checked the rest. The wants
are real: Leo Lee's taken best friend Penelope ("We had plans. Stupid,
small, beautiful plans... the pods, rows deep, humming") with a
planted promise ("I'll ask the System about the pods" — "Even asking
is more than the silence"); trust negotiated slowly ("I don't
distrust anyone exactly — I just haven't finished trusting most of
them yet"). The carried driver-loop artifact recurs once (9408-d75:
recap hammered 5×, NPC escalates honestly — "We're going in circles
a bit" — then exits); same class as r49's note, policy artifact, no
fix from this leg.

## Reachable / fun / winnable (crisis leg)

- Reachable: YES — sorties attempted on 5/5 seeds, refused honestly
  on 3/5, cleared treelines on 5/5. The verb is on the beat panel
  every lingerer night; a human player sees it before the first
  gorge, as this driver did.
- Fun: YES — the sortie is the siege's best decision: priced in the
  open, fought blow-by-blow, with counter-knowledge and a relief
  beat as aftermath. The hp-1 stare-downs are the one soft spot: a
  march against near-dead stragglers can feel free (0 rounds, 0
  damage) — but the ration price is never free, and the next beast
  in the same march can still maul (9408 d75).
- Winnable: YES — 3/5 villages reached horizon; the 2 that didn't
  were earned (attrition + empty pantries + bare benches), and
  neither lost a leader to a sortie.

## Metric review (§14)

No metric was re-scored mid-run. Revisions proposed for the NEXT
crisis run:
1. M3's formula must become: pantry-after = pantry-before − paid
   EXACTLY (binding, held 23/23), with paid = the actual whole-unit
   draw: cost ≤ paid ≤ cost + largest-item-kcal when the pantry
   covers cost, 0 ≤ paid < cost when it doesn't. The "paid =
   2000 × muster" clause is retired — it contradicts the documented
   whole-unit doctrine in hierarchy.js `_removePantryKcal`.
2. Instrument notes (not metric changes): (a) refused attempts were
   counted in lingerBook sorties-per-object — the next instrument
   must count only ok:true attempts there; (b) muster size derived
   as round(paid/2000) is unreliable when the pantry is short —
   read muster size from the sortie line's named party instead;
   (c) gorge-after checks must key on lingering EPISODES (clear →
   re-draft is a new episode), never on names.
3. Open items carried forward (documented, not fixed — none met a
   fix bar this run): (i) vDie never fired in 174 measured fights
   (26 sortie + 148 defended) — the lethal sortie path ("carries
   the body home" + grief beat) is code-complete but unexercised;
   a targeted weak-leader-vs-strong-beast proof is the r51
   question. (ii) Unfed marches (paid 0 / short) proceed — Steve's
   call whether the button should refuse when stores can't feed
   the march. (iii) Endure-then-sortie (gorge history first, sortie
   second) was not the path tested here — this driver sortied at
   first sight; a delayed-sortie panel would test the other
   competent-player shape.

## Telemetry check

New channel seeded: `hidden_files/telemetry-baselines/crisis-sortie.json`
(sorties 23, raids 46, gorgeNights 52, convosDriven 33, fabricHits 0,
sortieFights 26). The ok/refused split (17/6), fight-outcome split
(vKill 2, mFlee 16, vFlee 8, vDie 0), paid total (84,475 kcal) and
delta-exact count (23/23) live in the per-seed JSONs and this note,
not in the baseline file. The seeding run's LOUD lines are the
expected first-run artifact (baseline started as {}); the re-check
against the seeded baseline is quiet (exit 0). The
crisis-quietlinger baseline was NOT rolled (r48/r49 precedent:
different channel).

## Regressions

No src/js change this run (observe + intervene-through-public-API leg
outcome: the verb works, no blank met its fix bar), so no proof test
is owed. Instrument self-proof: pantry-delta equality 23/23, fight
voice 26/26, dead-muster 0. `check.js --quick` in the worktree: **279
passed, 8 failed in 1312s** (full log: checkquick-r50.log). Seven
match r49's known set exactly (measurement-comparison,
measurement-proof-update, measurement-workflow, mobile-combat-cadence,
occupation-panels, phone-frame-proof, parity-20261014) — other lanes'
areas, flagged not fixed, r49 precedent. The eighth is NEW since r49:
`godpath/test-hide-discovery.js` — "counter butchering keeps material
and lesson on the counter until pickup" (24 passed, 1 failed,
deterministic on two standalone re-runs in this worktree). This run
touched zero src/js files (worktree status shows only the two new
files below), and the test does not load the new instrument, so the
failure is pre-existing on master c737198d7 — a sibling-landing
regression between r49's base and this tip, flagged LOUDLY here for
the owning lane, not fixed in this leg run.

## Landing note

Master moved during this run (c737198d7 → f17276d50, a coordinator
evidence commit — see below), so the branch was rebased onto the new
master in the worktree (clean, 2 new files only, no conflicts) and
the proof re-run: seed 9409 on the rebased base reproduces the panel
record EXACTLY (5 attempts: 3 refused no-fighters, d96 broke 37
taken, d99 cleared gavel; 7 raids, 6 unmet, 8 gorge, 7 convos).
The panel measurements above were taken on base c737198d7; the
rebased instrument behaves identically on the new tip because the
intervening commit touched evidence only (verified with
`git show --stat f17276d50`). Safe-commit index clobber DID strike
after the first commit (staged-deletion variant, same class as
r49's): the worktree index showed both committed files staged as
deleted while the worktree files were byte-identical to HEAD. The
commit itself was correct throughout; repaired with
`git update-index --add --cacheinfo` of the two HEAD blobs, then
verified `git status --short` empty + `git diff HEAD` empty before
rebasing.

## Files

- Instrument (to commit): scripts/journey-crisis-r50-sortie-20261025.js
- This note (to commit): evidence/2026-10-25/journey-crisis-r50.md
- Pre-registration: hidden_files/evidence/2026-10-25/journey-crisis-r50-prereg.md
- Per-seed records (workspace, uncommitted — r47–r49 precedent):
  hidden_files/evidence/2026-10-25/journey-crisis-r50-seed{9405..9409}.{json,log}
  + sheltered-transcript txt files
- Telemetry baseline (workspace): hidden_files/telemetry-baselines/crisis-sortie.json
