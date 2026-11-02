# sim-natflag-a — national-flag artifact audit (Loop A 20261102, axis scale-onramp, DIAGNOSIS ONLY)

## Verdict: DIAG-GO — "real reach", bounded (see the bound; it matters)

The 1340Z coordinator warning is superseded in one direction and confirmed
in another:

- SUPERSEDED: the flag is NOT a driver artifact and NOT stale. It is game
  code, set through played beats while the village was alive, and the
  final read faithfully reports live game state.
- CONFIRMED (the bound): the flag alone never granted table eligibility,
  a win, or wave 5 on this seed. A final-read flag after a village-lost
  end must never be cited bare: cite the flip day, the alive-at-flip
  state, and the deedGate breakdown with it (see "Correct check" below).

Prereg: evidence/2026-11-02/sim-natflag-a-prereg.md (commit 87c30e7d6).
Driver: scripts/natflag-driver-20261102-a.js (musterupkeep closecommit
stack reused verbatim; zero src/js changes). Proof test:
scripts/test-natflag-a.js — 19 passed, 0 failed.
Per-seed artifacts: evidence/2026-11-02/perseed-natflag-a/nf-closecommit-s97338-r1.json
and nf-closecommit-s97330-r1.json.
Canon read: docs/CANON.md + docs/SCALE.md (the scale ladder: played
beats, never threshold flips). No canon was invented; titan musters, the
Herald, and bearer succession ordering remain uncovered by any canon doc
(as established by the 1340Z bearerorder arm) and this arm does not touch
them.

## What exactly reads 1 (source, named)

- FIELD: `Game.state.globalLive` (with `nationalLive` beneath it).
- READER: `Game.scaleRank()` (src/js/hierarchy.js:2042-2048) — returns
  `'global'` if `globalLive`, else `'national'` if `nationalLive`, else
  `'regional'` if `networkLive`, else `'village'`. Pure game code.
- DRIVER MAPPING (musterupkeep driver, reused here): rank in
  {national, global} => national flag 1. The driver invents nothing; it
  reports the game's own rank.
- SETTERS: `answerNationalChoice('feast')` sets `nationalLive = true`
  (hierarchy.js:2803); `answerGlobalChoice('feast')` sets
  `globalLive = true` (hierarchy.js:2902). On these runs the answers came
  from the policy stack's own court legs (feastscale's leadcourt +
  windefer's winseek tableRoad — "a competent player answers, never
  leaves mail unread"), i.e. deliberate played answers through the game's
  council verbs, not driver writes.
- WHY DEATH DOES NOT CLEAR IT: `hierarchy.js` never references
  `villageLost` (proof-test assertion). `scaleRank()` measures the
  POLITY — other villages' bonds to Haven — not Haven's living roster.
  The only clearing path is `_checkNational`'s dissolution branch
  (hierarchy.js:2305-2320): when no polity qualifies AND no beat is
  pending, `nationalLive` and `globalLive` clear aloud ("The realm came
  apart"). A dead village's links stay active, so a dead village's realm
  can still qualify — the flag outlives the village by design, not by bug.

## Flip points (97338, closecommit reproduction — matches musterupkeep exactly)

| Day | Rank | What happened | Alive? |
|-----|------|---------------|--------|
| d47 | regional | Regional Dawn; `networkLiveDay` 46 | roster 9, alive |
| d76 | (beat staged) | First Court staged: "Four fires. One head." LEAD shape, Haven + Emberhold + Stonebridge + Thornfield (4 villages) | roster 8, alive |
| d77 | national | Court answered 'feast' → `nationalLive=true`, `nationalDay=77`, `nationalShape='lead'` | roster 8, alive |
| d113 | (beat staged) | Watchers journal line: "the world feed wants Haven" (viewership >= 32 gate in `_checkGlobal`) | roster 5, alive |
| d114 | global | Watchers answered 'feast' → `globalLive=true` | roster 5, alive |
| d122 | global (final read) | Village-lost; final roster 0, fallen 11, `won=false`, `over=true` — realm still intact: polity LEAD size 4, links active at trust 84/88/79 | dead, realm intact |

Note on the global staging lines: the driver's say-line regex caught the
d113 Watchers journal line but missed the staging say-lines ("WORLD IS
WATCHING" contains neither "Watchers" nor "global"). The flip itself is
not in doubt — the daily trace shows `globalLive` false at d113 and true
at d114 with `nationalLive` true throughout — but a future driver
wanting the staging narration should match "WATCHING" too.

## Comparison seed 97330 — the flag is live, not sticky (this is the control)

97330 also reached national (First Court staged d85, `nationalLive`
d86, LEAD, same 4 villages) — then LOST it. At d102 the polity read
already `null`: Thornfield's trust fell to 39, below the seasoned bar
(28+ days AND trust 40+ per subordinate), so the 4-fire realm no longer
qualified. The d102 say-line narrates it ("The realm came apart — no
polity answers to Haven now, and Haven is a free fire again"), and the
d103 trace reads regional, final flag 0. A sticky-flag bug would have
kept 97330 at 1; it did not. 97338 is special only in that its realm
survived to the village's death; 97330 proves the clearing path works.

## Game-path consequences checked (all on the same runs)

- Table deed gate (`deedGateReady()` at final read, 97338): `scale=true`
  BUT `ok=false` — `waves=false` (w1 20, w2 9, w3 2 of 4 needed, w4 3,
  w5 0 of 2 needed). Contests, crises, stage (3), and food deeds all
  true. So scale was the one bar met, not the one blocking — the wave
  deeds blocked the table.
- Table flags: `table=0` on both seeds. Win flag: `won=0` on both.
- Wave gating: maxWave 4 on both; wave 5 never faced (w5 0). Wave 4–5
  unlocks run on Standing since 2026-10-13, NOT on rank — `scaleRank()`
  in game.js:32926/32970 feeds only the scale-pointer narration text.
  Global rank did not unlock wave 5.
- Conclusion: no game path converted this flag into table eligibility,
  a win, or wave-5 access. The flag is a true scale-ladder achievement
  with zero endgame consequence on this seed.

## Sense check (SENSE-TESTING LAW)

Nothing in-game narrates a national standing at the village's death —
because the standing was narrated weeks earlier (First Court d76–77,
Watchers d113–114) and the death itself is narrated by the muster: the
musterupkeep anchored lines for d118–d122 are hunger lines ("The muster
is hungry — 0 of 6,000 kcal fed") and Herald-refusal lines, with the
roster collapsing 5 (d114) → 1 (d121) → 0 (d122). The village simply
died while its allied realm still stood. That reads coherent, not
broken: the rank describes a coalition of four fires, and three of those
fires were still alive when Haven's last villager fell. (No canon doc
covers what a dead Haven's realm means for its allies — left as an open
design question, not invented here.)

## Correct check for future runs (cite this, not the bare flag)

A claim of national reach must carry all three, on the same run:

1. The flip trace: `scaleRank()` by day showing the day national (or
   global) first read, with `nationalDay`/`nationalShape` from state.
2. Alive-at-flip: `villageLost=false` and roster > 0 on the flip day
   (97338: roster 8 at d77, roster 5 at d114).
3. The consequence breakdown: `deedGateReady()` (`scale`, `waves`,
   `ok`), `tableWaiting`/`tableDone`, `won`, and maxWave — so "reached
   national" is never confused with "reached the table" or "won".

The bare final-read flag (`national=1` after village-lost) is a
faithful state read but an insufficient citation on its own: it cannot
distinguish "reached national while alive and died holding it" (97338)
from a hypothetical flag set by no played beat, and it says nothing
about table/win/wave consequences.

## What this means for the scale wall

On this seed the wall is NOT "villages never reach national": the
village reached national at d77 and global at d114 under a competent
policy — then died at d122 with wave 5 never faced and the table deed
gate unmet on wave breadth (w3 2/4, w5 0/2). For the loop's wall
numbers, 97338 correctly counts as national 1 (global, in fact),
table 0, won 0 — with the mechanism named: scale climbed, wave deeds
and survival did not. Whether one seed under a court-answering policy
lifts the standing directive is the coordinator's call, not this arm's;
this arm's finding is that the flag itself is trustworthy when cited
with its flip trace.

## Metric review

The pre-registered metric (the driver-computed final-read flag) proved
to be a faithful read of game state, not a wrong metric — but an
incomplete citation. No re-scoring happened: the verdict classes were
judged as written (DIAG-GO via "real reach with the granting game
path"). The revision for the NEXT run is the three-part citation above
(flip day + alive-at-flip + deedGate breakdown); future natflag-style
drivers should also match "WATCHING" in their scale say-line regex so
the global staging narration is captured, not just its journal line.

## Village assessment (plain words)

Haven spent its first month making friends — three neighboring fires
bound to it by the end of the first season — and in the second season
those friends rode in for a first court and named Haven their head.
By the fourth month the wider world was watching Haven's fire on the
galaxy's screens. And then the village starved and bled out anyway,
chasing a Herald it could never feed, while its allies' villages stood
untouched. The realm outlived the village because a realm is other
people's promises, and other people were still alive to keep them. The
flag that reads 1 at the end is not a glitch in the record — it is the
record of a village that climbed all the way to the top of the ladder
and still died before it could sit at the table, because climbing the
ladder was never the same job as fighting through every wave.

## Files

- evidence/2026-11-02/sim-natflag-a-prereg.md (prereg, commit 87c30e7d6)
- evidence/2026-11-02/sim-natflag-a.md (this file)
- scripts/natflag-driver-20261102-a.js (measurement driver)
- scripts/test-natflag-a.js (proof test, 19/19)
- evidence/2026-11-02/perseed-natflag-a/nf-closecommit-s97338-r1.json
- evidence/2026-11-02/perseed-natflag-a/nf-closecommit-s97330-r1.json
- No src/js changes. No [needs-eyes]: diagnosis only, no feel/combat/UI
  change for Steve to playtest.
