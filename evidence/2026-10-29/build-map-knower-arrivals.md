# build-map — knower-trace audit + 0-arrivals investigation

Arm: MAP GROUNDWORK ONLY. Audit + investigation. NO game-code change was
made in this arm: the only commits are the prereg, two proof/investigation
scripts, and this report. Base at spawn: master `2342b764c`.
Worktree `build-map`, branch `build-map`. Prereg:
`evidence/2026-10-29/build-map-knower-arrivals-prereg.md` (committed BEFORE
any measured run, commit `3d1e7815`).

Plain-words summary: (1) A village is "known" today by two yes/no flags on
the village itself — heard-of, or visited — with no record of WHO heard or
visited. One anonymous rumor opens the gate for everybody, and the game's
own villager systems read that same flag as if every villager knew. Peer
deals (covenant/trade) skip the gate entirely. (2) Nobody arrived in
establishment runs r44–r52 because nobody ever said yes: applications sat
in a full inbox, the village never got thin enough for its auto-recruit,
and the driver never talks to visitors. The arrival chain itself works —
say yes and the person joins a few days later. What does NOT exist yet is
a walk-in anyone can see: today an arrival just appears at the fire.

## 1. KNOWER-TRACE AUDIT — VERDICT: DOES NOT TRACE CLEANLY (leaks found)

### 1.1 What the code actually does

The gate is one function, `knowsVillage(v)` (`src/js/hierarchy.js:348`):

```js
knowsVillage(v) {
  if (!v || v.id === 'haven') return true;
  return !!(v.generated || v.rumored);
}
```

It takes a village, never a knower. The two flags live ON the shared
`otherVillage` object (`src/js/game.js` village creation sets
`generated: false`; `rumored` starts unset). There is no per-villager
store for village knowledge anywhere in `src/js/` — searched for
`knownVillages`, `heardOf`, `knower`, `perKnower`, `villagerKnows` (the
only `villagerKnows*` is plants, §1.4). The only writers of the flags
are:

- RUMOR: `maybeVillageRumor` (`src/js/game.js:10200`), called once per
  village per player day from `endDay` (`game.js:31733`). On a roll it
  sets `village.rumored = true`, `village.rumorDay = scholar.day`, and
  pushes one entry to `scholar.rumors` reading "A traveler passed through
  yesterday, talking about a village to the <dir> called <name>." The
  teller is anonymous by construction — there is no teller field to
  record, and the flag is set at ROLL time, before the player ever reads
  the rumor.
- VISIT: `catchUpSim` (`src/js/game.js:9928`) sets `village.generated =
  true`. Its callers are all player-position verbs: `checkVillageProximity`
  (`game.js:10395`, player within 2 tiles), `villageTalk`,
  `guestMeal`, and joined-village ticks (`betrayal.js:2297,2650,2733,2845`,
  `membership.js:822`, `game.js:10246,10401`). So "visited" does trace to
  a specific actor — the PLAYER — but the trace is not stored as such:
  it is the same shared boolean a rumor sets.

### 1.2 Traces that HOLD

- K1 (proof, all 3 seeds): `proposeLink` (`hierarchy.js:523`) and
  `proposeAlliance` (`membership.js:754`) refuse an unknown village with
  "You don't know them well enough to propose anything." The gate works
  as a player-facing guard.
- The visit trace's ACTOR is specific (the player, via proximity or
  face-to-face verbs — `villageTalk` refuses beyond distance 1,
  `betrayal.js:2725-2737`). Nothing in the audit found a villager's
  walk or a villager's conversation setting `generated`/`rumored`.
- No villager-to-villager gossip spread of village knowledge exists at
  all: the only `rumored` writers are `maybeVillageRumor` and debug
  scenarios. So villagers cannot learn of a village through gossip
  today — the gap is absence of a spread mechanism, not a spread bug.
- The 2026-10-09 regional-audit fix still holds: the Haven panel no
  longer lists unmet villages (the gate is what hides them).

### 1.3 Leaks found (exact locations)

LEAK 1 — RUMOR OPENS THE GATE FOR EVERYONE, ANONYMOUSLY.
`game.js:10200-10224` (`maybeVillageRumor`) + `hierarchy.js:348`
(`knowsVillage`). Proof K2, seeds 7/42/99: after the real rumor roll
fires, `rumored=true`, `rumorDay` set, one `scholar.rumors` entry with
NO teller — and `knowsVillage` already returns true, while no
per-villager record exists. Every NPC system below then reads that flag
as village knowledge. A ledger entry built on this flag WILL make a
village known to villagers who never heard of it.

LEAK 2 — THE SAME FLAG IS READ AS VILLAGER KNOWLEDGE BY NPC SYSTEMS.
All of these call the player-gate `knowsVillage` with no knower:
- `villageAgency.js:305` — a foreign village's famine act (beg/raid)
  fires only `if (this.knowsVillage(v))`, i.e. a starving neighbor acts
  on Haven's rumor/visit flag as if it knew Haven.
- `villageAgency.js:1009` (`_vaPetitionConsequences`) — opinion moves
  "with every village that knows you," iterated over the same flag.
- `villageAgency.js:1295` (`queueVillageEventRumor`) — event rumors are
  queued only for known villages, again on the shared flag.
- `hierarchy.js:2060` (`_foreignEyes`) — contest outcomes nudge opinion
  of "the villages that know Haven" (flag-gated).
- `hierarchy.js:2102` (`_foreignPolitySim`) — off-screen polity drift
  candidacy is flag-gated.
- `hierarchy.js:2810` (`worldFeed`) — the global-stage feed picks from
  flag-known villages.
- `convoTopics.js:1037` (`t2gen_neighbors`) and
  `scaleDiscovery.js:152` (`_sdKnownVillages`) — neighbor topics and
  scale pointers filter on the flag (player-facing surfaces, so less
  severe, but still not per-knower: a villager the player talks to can
  discuss a village only the player heard of).

LEAK 3 — PEER PROPOSALS SKIP THE GATE ENTIRELY.
`hierarchy.js:2864` (`_proposePeer`, shared by `proposeCovenant` /
`proposeTrade`): no `knowsVillage` call anywhere in the function. Its
only bars are opinion ≥10 and the shut door (≤−20). Proof K4, seeds
42/99: on a village with `generated=false`, `rumored` falsy, raising
opinion to 10+ via `_nudgeOpinion` alone let the proposal reach
courtship — seed 42 countered, seed 99 FORMED a covenant (link
`link_mgpsphcz442`, trust 30) with "Stonebridge," a village never heard
of or visited. Note the opinion it gates on is itself village-level
(`ov.opinion`, movable by broadcasts/`_foreignEyes` without any visit).
Seed 7 skipped K4 only because the K3 walk generated the second village
too (proximity radius, §1.5). This contradicts `hierarchy.js:114`'s
comment that peer proposals are "never knowledge-gated" only in the
sense that the comment ADMITS it — the design doc (§A3 item 18) already
flagged this as an unstated split between gated proposals and ungated
beats. It is a leak against perception law even though it is documented
behavior: a polity-level bond must not form with an unheard-of village.

LEAK 4 — REGION REGISTRY, SAME CLASS, WITH HALF A PROVENANCE.
`world.js:269` (`hearOfRegion`): sets `known=true` + `heardDay` +
`heardWhy` ('landing' / 'origin' / 'trail' from `nomad-scenes.js:194`
at keepsake trail level 2). Proof K6, all 3 seeds: the entry stores why
and when but NO knower and NO `toldBy`. The trail learner is the bearer
in practice, but the registry does not say so — any future reader of
`world.regions[id].known` inherits the same village-wide assumption.
("Landing"/"origin" grants are system facts, not learned knowledge, and
are fine as such; the gap is only the missing knower on learned entries.)

CONFIRMED-BY-DESIGN (not scored as a surprise leak): `raidVillage`
(`hierarchy.js:3415`) says "Never knowledge-gated" in its own comment
and proof K5 (seeds 7/99) mustered a war party against an unknown village
(`pendingRaid` set). A raid needs no introduction in fiction — you can
march on strangers — but under perception law the muster still needs a
perceivable route and target knowledge (where they ARE comes from the
home-board tile, which is map knowledge, not rumor knowledge). Flagged
here so the next build decision does not mistake it for gated.

### 1.4 The precedent the ledger design should copy

Per-knower provenance ALREADY EXISTS in this codebase, for map memory:
`src/js/villager-mapmem.js` — `state.village.mapmem[vid].sites[]` entries
carry `{ nx, ny, kind, ref, seenDay, spoilBy, secondhand, toldBy }`, and
`mapmemTell` copies a site to a listener marked `secondhand: true,
toldBy: tellerVid` with a fuzzed value (hearsay is approximate — canon).
Plants have the same shape: `villagerKnowsPlants` (`food.js:1515`) unions
per-villager `familiar` / `taught` / `plantKnowledge`. Village knowledge
is the only knowledge kind with no per-villager store at all.

### 1.5 Side observation (not a leak, recorded for the next build)

`checkVillageProximity` generates EVERY village within 2 tiles, not just
the approached one: in proof seed 7 the walk to village A also flipped
village B to `generated=true`, which is why K4 skipped there. Radius
generation is defensible (you saw the neighboring fire), but a
per-knower ledger must record it as "seen from nearby on day D," not as
a visit, or arrival-courtship credit (§B4.3) will over-count drive-bys.

### 1.6 Per-knower provenance ledger DESIGN (for the next build decision)

Do NOT retrofit flags. New store, mirroring map memory, e.g.
`state.village.villageLore[vid][villageId] = { how, day, toldBy,
secondhand }`:
- `how: 'visit'` — writer: `catchUpSim`/`checkVillageProximity`, knower
  = the traveler (player today; any villager once villagers travel).
  A proximity-radius generation writes `how: 'seen-nearby'`, not
  `'visit'`.
- `how: 'rumor'` — writer: `maybeVillageRumor`, but the entry is created
  for the HEARER only when the rumor is actually delivered/read (today
  the flag is set at roll time — the design must move the grant to
  delivery, or the ledger inherits the pre-read leak). `toldBy` =
  the traveler NPC id once travelers are people; until then
  `toldBy: 'traveler-anonymous'` is honest but must NOT count as an
  introduction for courtship credit.
- `how: 'told'` — writer: a gossip-spread step modeled on `mapmemTell`
  (listener copy marked `secondhand: true`, value fuzzed — a told-about
  village's name/direction may be wrong, per trader/rumor canon).
- Readers change signature: `knowsVillage(v, knowerId)` reads
  `villageLore[knowerId][v.id]`; the player-facing gate passes
  `knowerId = villagerId`. NPC systems pass their own villager id or
  the foreign village's speaker id — never the bare flag.
- Migration: existing saves keep `generated`/`rumored` as the PLAYER's
  legacy entries (`how: 'legacy'`) so no live game loses its diplomacy;
  NPC systems start with EMPTY lore and learn only through the spread
  step. That asymmetry is the point: villagers who never heard of a
  village must not act as if they had.
- Peer proposals (`_proposePeer`) gain the same `knowsVillage(v,
  knowerId)` gate as `proposeLink` — or a Steve ruling keeps them
  ungated explicitly (see §3, one line).
- Arrival-courtship credit (§B4.3) keys off `how: 'visit'` entries for
  the ARRIVER only (or an in-person introduction: arriver present +
  introduced by someone the village knows). A rumor or told entry never
  grants it.

Fix design only — NO code for this was written in this arm, per task.

## 2. ESTABLISHMENT 0-ARRIVALS INVESTIGATION — FINDING: DECISION-GATED, NOT SUPPLY-GATED

### 2.1 The metric, exactly

Establishment drivers count an "arrival" as a living villager id present
at a dawn check that was not in the start census. No other intake counts:
no births exist; the driver never accepts applications, never invites
visitors, never answers petitions. So the metric measures exactly one
pipeline: remote applications accepted (by player or auto-recruit) +
`arriveDay` reached.

### 2.2 The pipeline (all `src/js/membership.js` unless noted)

1. `considerApplications` (:336, daily via `membershipDaily` :994 riding
   `endDay`): if exiled, no; if inbox ≥3, STOP (inbox cap 3); else
   probability `p = max(0, (notability−40)/100) + viewership/200`, with a
   0.08/day floor while roster <8 ("desperation is loud"). On success,
   `genApplicant` (:362) builds an applicant — 70% a background survivor,
   else a light drifter — and pushes to `m.applications`, narrated as
   "they haven't set foot here."
2. `acceptApplication` (:444): removes from inbox, sets
   `arriveDay = day + 2 + floor(R()*3)`, pushes to `m.arrivals`, says
   "Accepted. <name> is walking. They'll reach Haven in a few days."
3. `arrivalTick` (:600, daily): when `day >= arriveDay`, pushes the id to
   the roster, hydrates the person (`ensureRosterPerson`), sets trust
   20, records `arrivedDay`, says "<name> walks in."
4. `villageAutoRecruit` (:507, daily, ONE intake/day max): returns
   immediately unless roster <8 AND housing room >0. Then it takes the
   best-scoring pending application (judged, score ≥50, room not hostile
   ≥60 against) or a waiting curious/fleeing visitor (never hostile or
   shady). A thin village that never drops below 8 NEVER auto-recruits.
5. Visitors (`betrayal.js:3223` `considerStrangers`, daily): same
   notability math, same 0.08 thin floor, one at a time, gone by
   `leavesDay` (next day for traders). Joining needs a player
   `visitorInteract 'invite'` or auto-recruit's visitor branch.

### 2.3 Measured runs (prereg §2; read-only arm + counterfactual arm)

Investigation script `scripts/investigate-arrivals-20261029.js`, panel
seeds 209/228/238/239, 60 days, competent policy, r52 day-loop shape.
Raw JSONs (goal hidden files, evidence 2026-10-29):
`build-map-arrivals-readonly-20261029.json`,
`build-map-arrivals-counterfactual-20261029.json`.

READ-ONLY ARM (no accept by driver/policy):
- 209: roster 12→10 (min 10). Inbox fills to cap 3 by day 16 and NEVER
  drains. accept=0, autoRecruit calls=60 with roster<8 ZERO times,
  arrival completions=0, strangers spawned=12, visitor invites=0.
- 228: roster 12→11 (min 11). Inbox cap 3 by day 11, never drains.
  accept=0, roster<8 calls=0, completions=0, strangers=14, invites=0.
- 238: roster 12→10 (min 10). Inbox cap 3 by day 12, never drains.
  accept=0, roster<8 calls=0, completions=0, strangers=18, invites=0.
- 239: roster 12→7 (min 7). Inbox cap 3 from day 13. Roster hits 7 on
  day 57 (deaths accumulate past the 42-day window); autoRecruit then
  accepts chen_wei (day 58) and tom_baker (day 59); pending=2 at day 61,
  arrival completions=0 ONLY because arriveDays (accept+2..4 → days
  60–63) fall after the window ends.
- All seeds: `considerApplications` fired daily (60 calls);
  `genApplicant` fired exactly 3× per seed — the cap, not demand, stops
  generation. Notability sat at 55–80, room at 4–14: neither food nor
  roof gates anything here.

COUNTERFACTUAL ARM (`ACCEPT_ONE=1`, separate processes): one early
accept per seed — 209 Mateo Alvarez (day 11 → arriveDay 13), 228 Owen
Smith (day 8 → 10), 238 David Kim (day 9 → 13), 239 Nathan Lee (day 9 →
11). ALL FOUR are on the end roster (verified by id), each with exactly
one `arrivalTick` completion. 239 additionally shows an autoRecruit
accept (chen_wei, day 52) completing too. The accept→arrive chain works
on every seed; the 0 is purely that no decision is ever made while the
roster is healthy.

### 2.4 Why r44–r52 showed 0 (reconciled with their JSONs)

r44–r52 guardrails show minAlive 9–11 on every seed — the roster NEVER
crosses the autoRecruit threshold inside the 42-day window, and the
establishment driver/policy contains no accept/visitor call at all
(verified by grep: no `acceptApplication`/`visitorInteract` in the r52
driver or the competent policy). So: supply exists (3 applications
waiting + 10–18 visitors per 60 days), decisions do not. My 60-day run
extends past the window and 239 proves the threshold mechanism: thin
the roster and autoRecruit fires on its own. This is NOT a broken
arrival system and NOT a missing faucet — it is a healthy-roster
village with a full inbox nobody opens. (Prereg bars A1–A4/B1: A1 as
written — "accept calls = 0" — technically FAILS on 239 because
autoRecruit's internal accepts count; the corrected statement is
"no DIRECT (player/policy) accept on any seed; autoRecruit accepts
only after roster <8." A2/A3/A4/B1 hold as written.)

### 2.5 What "arrivals" look like today — and why that fails perception law

Even the WORKING path is not perceivable: `acceptApplication` narrates
"is walking" but creates no board position, no route, no tile, no
approach anyone can meet, watch, or intercept; `arrivalTick` then pushes
the id straight onto the roster ("walks in"). Same for visitors:
`considerStrangers` narrates "Riders on the ridge" / "Someone walks in"
but the visitor object has no position — it pops into `v.visitors` and,
on invite, straight onto the roster. The narration CLAIMS a walk the
engine never performs. Any "arrival faucet" that spawns roster ids would
repeat this exact violation, which is why it stays outlawed.

### 2.6 Perceivable-arrival DESIGN (for the next build decision, not built)

The mechanism supports this design without a faucet, because every
piece already exists except the walk itself:
1. ORIGIN: an accepted applicant (or an invited visitor) gains a real
   origin: their `fromVillage` when present (village-to-village
   applicants already carry one, `membership.js:388-396`); otherwise
   the nearest beyond-edge tile in the direction they were heard from
   (rumor direction exists in the rumor text; the applicant record
   should store it — today it does not).
2. APPROACH: on accept, spawn a WALKER, not a roster id — a person object
   placed on a board/beyond tile at the map edge (or at the origin
   village's tile), moving toward haven with the existing villager
   movement (`npcSetNode` return-walk pattern from fixall-map slice 2
   already steps through beyond coordinates; the player `walkHome`
   pathing is the other precedent). One tile per day-part or per day,
   visible on the board, named ("Mateo Alvarez is on the road — two
   days out"), interceptable (talk, turn away, danger on the road is
   real: the road can kill, per PROGRESSION call-for-help canon).
3. ARRIVAL: only when the walker STEPS ONTO the haven tile does
   `arrivalTick`'s roster push fire (trust 20, `arrivedDay`, member
   reactions — all unchanged). If the walker dies or turns back, the
   arrival never happens and the village hears why (the "word travels"
   narration already exists for refusals).
4. VISITORS use the same walker: a stranger at the tree line is a tile
   at the tree line first, a fire-side guest second. `leavesDay` becomes
   the day they walk away, not a despawn.
5. GATING (unchanged, no numbers proposed here): autoRecruit's roster<8
   + room>0 + score≥50 + non-hostile-room rules stand; the player accept
   path stands. The ONLY change is that "walking" becomes a walk. No
   hard arrival requirement and no courtship-advantage numbers are
   proposed (default soft-only stands, per task).
6. What the design needs first (dependency, not a build): the knower
   ledger (§1.6) — a walker arriving "from Stonebridge" must not hand
   Stonebridge to villagers who never met the walker; the walker's
   origin is known to whoever SEES them arrive, then spreads by the
   told-step.

## 3. Steve calls still genuinely needed (one line each)

- Q0(a) (carried, NOT decided here): road TRAVEL never forfeits, only final DEPARTURE forfeits — leg-village links still wait on this.
- Peer proposals: gate covenant/trade on knower-traced knowledge like proposeLink, or keep them explicitly ungated?
- Perceivable arrivals: approve the walker design (§2.6) — an accepted applicant walks in over days on real tiles — as the next build slice?

## 4. Method notes / caveats

- Knower proof: `scripts/test-knower-trace.js`, seeds 7/42/99, PASS with
  2 skips (seed 7 K4: K3's radius walk generated village B too; seed 42
  K5: no unknown unlinked village left — both skips are themselves
  evidence about radius generation and village clustering, §1.5).
- Arrivals runs mirror the r52 loop shape but omit r52's post-census
  convo/outgoing probes (they run after census and cannot affect the
  pipeline counts); the 60-day window (vs 42) is what lets 239 thin to
  7 — that divergence from r52's 239 (minAlive 9) is the finding, not
  a mismatch: deaths past day 42 are what open the autoRecruit gate.
- Node proof scripts cannot prove DOM clicks or phone feel; no browser
  claim is made. No `check.js` full run was required for an audit-only
  arm (no `src/` changed); the two proof scripts are the verification.
- EPERM flap: worktree registration queued ~25 min on the registry lock
  (sibling registrations ahead); the fresh tree briefly showed 52,575
  staged deletions mid-checkout, but a post-checkout `git status` was
  empty and `git diff HEAD` empty — transient checkout state, NOT the
  safe-commit clobber. The real clobber DID hit after the prereg commit
  (3 files staged-deleted + untracked) and was repaired with
  `update-index --add --cacheinfo` after byte-verification; tree
  verified clean after.
