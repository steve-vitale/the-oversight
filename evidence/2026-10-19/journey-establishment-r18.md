# Journey leg: ESTABLISHMENT (days 14–40) r18 — 2026-10-19 (18:45 CDT run)

**Run provenance:** clean scheduled run (no lock at start; rotation read 1).
Leg 1 = establishment; rotation advances to 2 at landing. Executed the
**r17 wild-surfacing-rate harness** (`scripts/journey-establishment-r17-20261019.js`,
landed 12:12 UTC but never run) as `scripts/journey-establishment-r18-20261019.js`
(pure rename; RED-verified probe logic untouched). 6 seeds x 42d (DAYS=42,
death-aware), competent policy PINNED, one process per seed.
Seeds: 61, 82, 103, 124 (r1–r16 comparability) + 901, 902 (fresh).

Canon read: CANON.md, CONTESTS.md (the show: contests are its teeth, TV is
its gossip; casting is notability-weighted, player taken first when castable),
CONVERSATIONS.md. No new canon.

**Base:** local master 8e33dde78 (ship-loop batch, incl. journey-landing r29).

## PRE-REGISTER (inherited from the r17 pre-registration — documented in the
harness header before execution; never executed until this run)

- **Question:** does the show surface in the village's gossip economy during
  establishment — do aired contests produce NAMED gossip lines in the wild?
- **Interesting:** named contest gossip (win/survive/die, names attached)
  within 3 days of airing = the show lives at the fire. Entries seeded but
  never surfaced = a surfacing/weighting blank. Entries never seeded = a
  seeding defect.
- **Binding metrics:**
  - M1 wild surfacing rate: >=8 aired events; rate = aired contests with
    >=1 NAMED gossip line within 3d / aired. GO if >=25%; NO-GO if <10%
    (10–25% band = METRIC-REVIEW per the harness).
  - M2 r16 fixes hold: pantry atom <=500 ALL seeds; ZERO placeholder
    champion lines; ZERO null-line renders in held convos.
  - M3 people: >=6 full transcripts sense-read, 0 senseless.

## METRIC VERDICT

- M1 wild surfacing rate — **GO (exactly at the boundary): 6/24 = 25.0%**
  (24 aired across 6 seeds, >=8 requirement met). But the distribution is
  the finding: **20 player wins -> 6 surfaced (30%); 4 player losses -> 0
  surfaced (0%)**. Losses are invisible in the gossip economy.
- M2 r16 fixes hold — **GO.** atom 400–500 all seeds; records verdict GO
  (0 placeholder champion lines); null-render scan GO (0).
- M3 people — **GO.** 9 transcripts sense-read (below), 0 senseless.

## HEADLINE: player losses seeded no contest gossip — fixed

The loss breakdown (pre-registered as "concrete lever proposal, NOT landed
— gossip weighting is Steve's call") split into two halves:

1. **Seeding defect (FIXED this run, not a weighting question):** in
   `_contestEnd`'s loss branch, a villager loss seeds
   `_cxGossip('survived', ac.participant, contest.name)` — "surviving is
   news too" — but a PLAYER loss seeded nothing. The entry never existed,
   so no weighting could surface it. This is the same class as the r16
   player-win seed fix ("previously only villager wins seeded gossip").
   All 4 r18 losses (The Blood Tithe x3, The Witness x1) hit this hole.
   Fix: one `_cxGossip('survived', 'player', contest.name)` call in the
   player-loss branch, symmetric with r16. The render for
   contest_survived with dims.who='player' already existed ("You" via the
   wname special-case). Proof test RED->GREEN 4/4.
2. **Surfacing weight (Steve's call, NOT landed):** even seeded wins
   surface only 30% within 3 days; entries lose to the ambient pool
   (departure/return/dark gossip dominates surfaced types). Concrete
   proposals for his call: (a) recency/salience boost for
   source==='contest' entries for ~3 days post-airing; (b) a dedicated
   fireside beat the night after a contest airs ("the fire talks about
   the show"), not gated on the player asking. See metric review.

Nuance for the verdict: the content IS reachable — `[alive:event:show]`
"The show — did you see it?" fires in conversation and names the contest
and the taken ("They took you — The Sorting, on the screens. The whole
fire watched."). The gap is only ambient surfacing, not availability.

## VILLAGE ASSESSMENT (plain words, pre-fix data)

**Seed 61 — the brawler.** 9/12 alive d44, 15 deaths (11 villager-combat —
hard world), pantry 99k. Pilot d18; Duel d20 (won), Exchange d23 (won),
Blood Tithe d38 (lost) — the lost one left no gossip trace (the hole).
**Seed 82 — the calm kitchen.** 12 alive, 12 deaths, pantry 62k. 2 contests.
**Seed 103 — the winning streak.** 9 alive, 10 deaths, pantry 60k. 5
contests, 4 wins (Riddle Me This + The Cache surfaced as named gossip —
"Did you hear? You won Riddle Me This on the cameras.").
**Seed 124 — the lean survivor.** 10 alive, 15 deaths, pantry 40k. 5
contests incl. 2 losses, 0 surfaced.
**Seed 901 — Ivy's Lottery.** 10 alive, 8 deaths, pantry 87k, 1 starvation
death with cause recorded. The Lottery surfaced twice + Ivy's own
first-person line ("I won The Lottery. On camera. People won't shut up
about it — and honestly? Neither will I.").
**Seed 902 — the show week.** 9 alive, 13 deaths, pantry 28k. 5 contests,
2 surfaced (The Auction, Duel — both wins).

**Who leads:** trust-60+ tiers on every seed (r16 pattern holds).
**Who is miserable:** nobody at trust 0 flagged this run.
**What is missing:** a village where the show's defeats are talked about
— every loss this run was gossip-silent (fixed for the future).

Death causes are all labeled and coherent (combat, expedition, monster,
starvation x1, "Grief Counselor" = a wave-2 monster per monsters.json —
not a bug, verified). 6/6 villages alive at day 44.

## PEOPLE CHECK (9 transcripts sense-read, 0 senseless)

1. 61 Wilhelm (vintner): origin answer remembered ("Columbus, Ohio. I'll
   remember that"); sick-row beat honest ("2 down with a wringing-out
   sickness"); night-noises question human.
2. 61 Kate (dry cleaner): pods dream + Taken nephew ("I do not know what
   cozy means at that scale" — canon KIN.md); refuses to re-confess.
3. 61 Ursula (gardener): taken-kin grief, trap-line invite ("Don't tell
   the others"), escalating confrontation pushback ("I'm not confessing
   it twice") — a person, not a job title.
4. 901 Debbie (lifeguard): trust question ("Noted. I'll watch too");
   show line names The Sorting ("The whole fire watched. Nobody knew
   where to look").
5. 901 Ethel (Chef): hidden-injury confession ("I've been hiding an
   injury. I'm ashamed"); show line: "Came back like nothing happened.
   It wasn't nothing."
6. 901 Paloma (truck driver): regret deflect shutters; confrontation
   produces a REAL confession ("I don't actually want to belong
   somewhere. I want to be remembered... That person isn't real.");
   post-confession show question gets a flat dodge ("Sorry, lost my
   train of thought") — reads as a human dodge after vulnerability,
   not a bug. Noted, not flagged.
7. 103 Erin (PT aide): "How to be hungry and keep going anyway" /
   "The fundamental skill. Everything else is decoration."
8. 103 Ruth (plumber): agency:ask_field teaching works (Night Court
   cue, duck cue, Cattail); Taken sister; pods dream.
9. 103 Kristine (Sailor): `[ask:gossip]` chain serves departure/return
   gossip, never contest gossip — the weighting half of the finding,
   from the player's seat.

Hard-flag scan: 0 fallback lines, 0 phantom names, 0 verbatim repeats,
0 fabricated-history flags. Menus all within the r16 cap.

## BLANKS FILLED / DOCUMENTED

1. **FILLED (game bug): the silent player loss.** `_contestEnd` loss
   branch, player path: no `_cxGossip` seed. One-line fix in
   src/js/contests.js, symmetric with the r16 player-win seed.
   Proof: `scripts/test-cx-gossip-player-loss-r18.js` — RED (control
   passes: villager loss seeds; bug: player loss seeds 0) -> GREEN 4/4.
   Post-fix 1-seed confirmation (124): sim healthy (d44, m2/m3/m5 GO).
   NOTE: the fix consumes one Math.random draw per player loss
   (the `heard` pick), so post-fix seed sequences diverge from pre-fix —
   expected, not a regression. No [needs-eyes] (gossip narration only,
   no feel change).
2. **Documented (design, Steve's call):** contest-gossip surfacing
   weight — 30% of wins surface within 3d; losses would now seed but
   face the same weight. Two concrete lever proposals above; NOT landed.
3. **Verified working (not a bug):** `[alive:event:show]` names the
   contest + the taken in direct conversation (3/3 seeds probed) — the
   show is reachable by asking; only ambient surfacing lags.
4. **Verified not a bug:** "Grief Counselor" death cause is a wave-2
   monster (monsters.json), consistent with "Highbeam Deer" labeling.

## REACHABLE / FUN / WINNABLE

- **Reachable:** pilots + 2–5 contests on 6/6 seeds; all wins produce
  real prizes (records + pantry + fan lanes); show-talk available on
  ask; ambient contest gossip on 3/6 seeds.
- **Fun:** the leg's texture holds — a chef hiding an injury, a driver
  confessing the person she performs, Ivy bragging about the Lottery,
  a win remembered by name at the fire. The silent-loss hole was the
  one real wart on the show's texture; fixed.
- **Winnable:** 6/6 villages alive through 8–18 deaths each; pantries
  28–99k; succession carrying.

## METRIC REVIEW

M1 recorded as GO (6/24 = 25.0% >= 25%), at the exact boundary — not
re-scored. The 10–25% METRIC-REVIEW band exists in the harness for the
middle case; the aggregate landed exactly on GO. The metric's weakness
is now visible: it counts wins and losses together, but the engine
treats them asymmetrically (wins seed, losses didn't). Proposal for the
NEXT run: split M1 — M1a (win surfacing rate, bind >=25%) and M1b
(loss/defeat surfacing rate, bind >=25% now that the seed fix landed;
pre-fix it would have been 0% by construction). Also consider widening
the window for losses (defeat-talk may legitimately lag the 3-day
window — shame is slower than triumph).

## TELEMETRY

`node scripts/telemetry-check.js` vs
hidden_files/telemetry-baselines/establishment.json (4 baseline seeds
61/82/103/124): **quiet** — 7 metrics, no large deviations. Baseline
stands; no roll-forward.

## Files

- Run note: this file (`evidence/2026-10-19/journey-establishment-r18.md`)
- Harness: `scripts/journey-establishment-r18-20261019.js` (r17 probe,
  executed for the first time)
- Proof test: `scripts/test-cx-gossip-player-loss-r18.js` (RED->GREEN 4/4)
- Fix: `src/js/contests.js` (player-loss contest_survived seed)
- Census JSON + contest transcripts + held convos (6 seeds):
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-19/journey-establishment-r18-*`
- Post-fix confirmation seed 124:
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-19-postfix/journey-establishment-r18-seed124.*`
