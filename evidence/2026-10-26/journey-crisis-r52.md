# Journey crisis r52 — ENDURE-THEN-SORTIE (lane B, leg 6)

Direct handoff from r50's metric review §3(iii), untested until now:
r50 sortied at first sight, r51 drove the same rule to a lethal
outcome. This run plays the other competent-player shape: let the
lingerers gorge first (at least 3 nights), then send the march.

Pre-registration: `hidden_files/evidence/2026-10-26/journey-crisis-r52-prereg.md`
Instrument: `scripts/journey-crisis-r52-delayed-20261026.js` (r50 driver
with the ONLY decision change being the delayed rule: first sortie
per object at day - firstSeenDay >= 3; second sortie 3+ days after
the first, r50 rule; same oracleV2 policy, same convo driver verbatim
so timelines stay comparable) + `scripts/analyze-crisis-r52-delayed-20261026.js`.
Policy: oracleV2, 120d death-aware (+10d tail).
Per-seed records: `hidden_files/evidence/2026-10-26/journey-crisis-r52-delayed-seed{9405..9409}.{json,log}`
plus sheltered transcripts. No src/js change this run (instrument only).

## Headline verdict: WAITING COSTS TWICE THE MARCH — AND STILL CLEARS

Across 5 seeds, 50 raids, 73 gorge nights, 11 delayed-sortie attempts
(8 ok, 3 refused bench-bare), the delayed sortie works exactly like
a first-sight one — same fights, same price honesty, same clear —
but the wait itself is the price. The panel gorged away 86,959 kcal
while waiting, against 44,817 kcal paid in sortie rations: waiting
cost roughly twice the march, before the march was even paid. The
clearest case is 9406 (the sortie-rich seed): 29 gorge nights,
32,816 kcal gorged, two bench-bare refusals (d110, d120) while the
treeline held, and the village ends at 2,050 kcal with 5 alive —
against r50's first-sight 9406 (16 gorge nights, 39,246 kcal, 8
alive). Timelines diverge after the first lingerer decision, so
that comparison is indicative, not a controlled A/B — but the
direction is unambiguous: every night you wait, the treeline eats,
and the bench you were waiting to use can bleed out first.

## Pre-registered verdicts (§14 — bindings, not re-scores)

- D1 delayed episode exists: GO — 11/11 attempts waited >= 3
  nights (3, 3, 3, 18, 21, 4, 3, 3, 4, 3, 3). The pilot alone met
  it (8/8), so the expansion to 9408/9409 ran as pre-registered.
- D2 delayed sortie clears: GO — 7/8 ok attempts end with
  remaining == 0. The one non-clear is honest: 9406 d123 breaks on
  vFlee (60 taken, then 43 taken) with Terms of Service still
  holding. No object cleared by a delayed sortie gorges again in
  the same episode (episode-keyed). The analyzer's 3
  name-matched "gorge after clear" lines are the r50 trap, fourth
  sighting: they are a LATER raider (The Big Beast, from the d94
  raid) gorging after the heron was cleared d86 — not the cleared
  object. Name matching is not episode identity; the bar holds
  on identity.
- D3 price honesty: GO — pantry-after = pantry-before - paid
  EXACTLY on 8/8 ok attempts (and 0 on all 3 refusals). The r50
  revised whole-unit formula holds on the delayed panel too.
- D4 crisis resolution: INCONCLUSIVE (not GO, not FAIL — see
  below). Every delayed clear voices "The treeline is quiet," but
  no delayed clear produced a same-day 'fought' resolution. That
  matches r50's mechanism 2 (the crisis usually resolves at raid
  defense, while lingerers persist after it), but this run did not
  snapshot aidCrisis() live state at sortie time, so it cannot
  prove whether a crisis was live at any clear. The instrument
  gap, not the game, is what's inconclusive — see metric review.
- D5 drift valve honesty: GO, with a counting note — the valve
  fires on schedule (9406: two "melts back" lines d113, one
  'moved-on' resolution d126 for Terms of Service after 6
  nights). The day-difference count reads 7 for the d113 pair
  because firstSeen is the boundary AFTER the raid night and the
  melts line fires at the next dawn; the gorge count inside the
  window is 6, matching the code (day - lingerSince > 6).
  No episode gorges past the valve window.
- D6 people check: GO — 33 convos driven panel-wide, 0
  fabrication flags (r50 regex). Four read in full below.
- D7 aftermath honesty: GO — 0 corpse-drafted lingerers
  (lingerBook draftHp minimum 1, as in r49/r50), 0 dead fighters
  in any muster line, 0 deaths during any delayed sortie, and
  no dead leader acts after death (no vDie fired in this panel
  at all, so the post-death bar is vacuous here — stated, not
  hidden).

## The third exit from lingering (found, explained, not a bug)

Nine "drift" records in the pilot were disappearances in 0–2
nights with no melts line and no moved-on resolution. Investigated
in the say lines, they are a third, legitimate exit: the lingering
monster LEAVES THE TREELINE TO FOLLOW THE PLAYER. The oracle bot's
daily roaming draws it off ("It followed you," "You're on your
own," "flagging — it won't follow much further"), it is fought or
stared down in the wild, and it is removed (fled across a boundary,
lost trail, or killed) — so it stops lingering and stops gorging,
with no sortie, no drift line, and no crisis resolution. That is
the world working as voiced, and it is why a delayed sortie
sometimes finds nothing to march against: the treeline emptied
itself while you waited. It also means "drift" as this instrument
records it (gone at the next boundary) conflates three exits —
sortie-clear (flagged), drift-valve (melts/moved-on), and
player-drawn-off (wild encounter lines). Next run's instrument
must classify by those three, not by disappearance alone.

## Panel totals (5 seeds)

- Attempts 11: ok 8, refused 3 (all bench-bare, voiced).
- Sortie fights 13: mFlee 12, vFlee 1, vKill 0, vDie 0.
- Paid in rations: 44,817 kcal. Gorged while waiting: 86,959 kcal
  over 73 nights. Per seed paid/gorged: 9405 4,000/4,768;
  9406 9,728/32,816; 9407 12,183/20,477; 9408 12,432/14,445;
  9409 6,474/14,453.
- Raids 50. Convos 33, fabrications 0.
- Endings: 9405 horizon (6 alive, 14,426 kcal); 9406 horizon
  (5 alive, 2,050 kcal); 9407 game-over d99 (0 alive, attrition +
  arena, not a sortie death); 9408 horizon (7 alive, 31,011);
  9409 horizon (7 alive, 38,941).

## Village assessment (plain words)

Waiting turns the siege from a decision into a tax. When the
village has fighters and stores, the delayed march still buys the
treeline back — 9409's d105 march clears three lingerers in one
go (two stare-downs, one 42-damage stand) and the village ends
fat at 38,941 kcal. When the village is thin, waiting eats it
alive: 9406's bench goes bare twice while the gorge runs, the
d123 march finally goes out wounded and falls back, and the
village ends on 2,050 kcal — alive, but with nothing left to
lose. 9407's wipe is not a sortie story at all: the village
bled out in the arena and to wounds/sickness while two delayed
marches cleared their treelines cleanly. The lesson for a real
player is legible in the game's own prices: endure when you must,
march when you can, and never wait so long that the wait eats
the march.

## People check (transcripts read in full)

- 9406 d116 Mason (after the d105 clear + d110 refusal): real
  mourning — "Somchai always took the burnt piece. Said someone
  had to. I take it now." A repeat invite is deflected honestly
  ("I just said — did you miss it?"). A want (grief, company),
  engaged, resolved by leaving. No fabrication.
- 9409 d109 Aria (after the d105 3-clear): grief for Ursula —
  "Ursula is gone and the world just... continues. That's the
  part I can't stand," memory doubt ("I can't tell if I'm
  remembering it right"), picking up Ursula's share of the work.
  Real want, real ending ("We bury, we grieve, we keep going.
  There's no step four."). No fabrication.
- 9406 d121 Mason: thin but coherent — fire-tending ("I keep
  the fire lit where it sits"), table foreboding ("Something's
  on its way"). No fabrication; a quiet beat, not a dead one.
- 9407 d84 Vyacheslav: thin stall ("So." / "Well.") + a recap
  loop the NPC handles honestly ("Still on that personal
  stuff."). Driver artifact class (r49/r50/r51), not fabrication;
  the NPC never invents shared history to fill the stall.
- 0 fabrication flags across all 33 convos.

## Reachable / fun / winnable (crisis leg)

- Reachable: YES — delayed sorties attempted on 5/5 seeds, ok
  on 5/5, cleared on 4/5 (9406's one break is a fought fall-back,
  not missing reach). A human who waits 3 nights meets the same
  verb r50 met at first sight.
- Fun: YES, tensely — the wait is a real gamble with a visible
  price (each gorge night says the kcal aloud), and the delayed
  march pays it off or punishes it in the open. The stare-down
  heaviness (12/13 fights mFlee, most 0 rounds) is the soft spot
  r50 already named: a march against near-dead stragglers feels
  free except for the ration price — and now, plus the gorge
  price you already paid to wait.
- Winnable: YES — 4/5 villages reached horizon; the one wipe
  (9407) was earned attrition, not a delayed-sortie death.

## Metric review (§14)

No metric was re-scored mid-run. Notes for the NEXT run:
1. D4 needs an instrument fix, not a game fix: snapshot
   `Game.aidCrisis()` live state (and its resolved flag) at
   every sortie call, so "cleared while live" is provable. Until
   then D4 stays inconclusive on delayed panels.
2. Drift classification must split three exits — sortie-clear,
   drift-valve (melts/moved-on), player-drawn-off (wild-encounter
   lines + removal) — instead of one "gone at next boundary"
   bucket. The removal wrap should also capture the caller's
   context, or the drawn-off exit stays inferable only from
   say lines.
3. Gorge-after checks must stay episode-keyed, never
   name-matched (r50 lesson, fourth sighting this run).
4. Open items carried forward (documented, not fixed): (i)
   dead discoverer's orphaned fireside entry (r51, Steve's call);
   (ii) unfed marches proceed (r50, Steve's call); (iii) the
   stare-down soft spot (marches against hp-1 stragglers feel
   free — r50 note, no fix bar met here either).

## Telemetry check

Baseline `hidden_files/telemetry-baselines/crisis-sortie.json`
(r50 seeded, r51 checked, NOT rolled by r51 or this run) vs the
r52 5-file glob: `telemetry-check: quiet (5 files, 6 metrics, no
large deviations)` — no LOUD lines, so no same-run investigation
was triggered. Panel numbers for the reader's own judgment:
sorties 11 vs baseline 23, gorge nights 73 vs 52, convos 33 =
33, fabrications 0 = 0, sortie fights 13 vs 26. The checker
reports quiet on its bands; the raw deltas are the delayed
rule's expected shape (fewer sorties because waiting loses
episodes to drawn-off/drift, more gorge nights because waiting
is the intervention) and are NOT rolled into the baseline, which
remains r50's first-sight reference.

## Regressions

No src/js change this run (instrument only: driver + analyzer),
so no proof test is owed (r50 precedent). `check.js --only
crisis` in the worktree: 11 passed, 3 failed in 45s — the 3
failures match r51's proven pre-existing set exactly
(sleep-crisis-bedtime `Text is not defined`, util-raid-crisis
`aidCrisis is not a function`, winpath-crisis-kinds
`resolveAidCrisis is not a function` — all old-harness drift,
none load the new instruments). Blitz-crisis, which timed out
in r51, passed here in 44s.

## Landing note

Base master@f97b3d09a at registration. Worktree
`journey2-crisis`, branch `journey2-crisis`, registered
2026-10-26T17:03:08Z, heartbeat verified on read-back.
Pre-flight: main tree dirty on first check only by a 0-byte
sibling probe file (`scripts/__probe__.tmp`, created 16:55 UTC,
gone by 17:02 UTC) — waited the prescribed 10m, re-checked
clean, then pulled (already up to date), reaped (nothing
removed, 7 LOUD dirty trees left untouched), and registered.
Lock `playtest-loop-2.lock` created 2026-10-26T16:56:37Z (no
prior lock existed); deleted at closeout.
