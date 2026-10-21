# Journey — crisis leg r40 (lane B): the interruption collision (2026-10-21)

Run: oversight-playtest-loop-2, 16:00 CDT. Rotation-b read **6** at start →
leg 6 (crisis). Base 620e6dc17. Worktree journey2-crisis.

**Stale-lock recovery:** the 15:00 CDT run's lock was live (19:55:30Z) but its
registry heartbeat was 49 min stale and its worktree had no writes in 25+ min
→ dead run per the overlap guard. Lock deleted, run's untracked work archived
to `hidden_files/stale-recovery/2026-10-21-r39/` (r39 pre-register + full
instrument script, zero results). r39's question was adopted whole as r40 —
no reason to re-scope a dead run's unplayed question.

Prior art: r32 (outbreak), r34 (famine social fabric), r35 (siege social
fabric), r36 (compound), r37 (aftermath: scattering/dead-proposer/hunger),
r38 (siege aftermath: spontaneous mourning 47/47, lingerer fixes — M1/M2/M4/M5
GO, M6 schema aligned). r38 named next: record scholar fight outcomes against
lingering entities (instrument note, minor).

Standing posture (2026-10-21): Steve decision 2026-10-21 (commit 86ded881d):
SURPLUSFEED governor REMOVED, not merely kept off; replacement direction
(behavioral production deprioritization) is a design thread, not an
implementation order. Sibling lanes have dirty surplusfeed-related trees —
NOT touched this run; documented only.

## PRE-REGISTER (written before any play)

**Leg question:** Contests are UNAVOIDABLE (Steve 2026-10-05: "No matter where
you are or what you're doing, when the time comes you go through the
sequence") and raids are reactive (havenRaidTick: pantry+monsters+cooldown).
When the two collide — a grab on a raid day, a raid on a contest day, a
lingering siege while the stars are on camera — does the village hold, or
does something stick? Do taken villagers defend raids from the arena (the
village defended by people light-years away)? Does anyone acknowledge the
collision?

**Canon:** docs/CONTESTS.md (played not RNG; unavoidable), docs/MONSTER-WAVES.md
(fought not rolled), Steve: "violence desperate and traumatic, not power
fantasy".

**Interesting-finding bars (any):** (a) a contest-taken villager records a
{raid:true} defense engagement on their contest day — defending from the
arena; (b) the player fights a raid while mid-contest-sequence; (c) zero
say-lines acknowledge a same-day raid+contest; (d) a contestant dies in the
arena during a collision and the village's mourning machinery double-fires or
misfires.

**Seeds:** 101, 202, 303 (pilot; continuity with r35/r38). **Policy:** oracleV2
(competent). **Horizon:** establish 20d + 70d window (90d), death-aware stop
(+10d tail max). **Staging:** none — the pilot confirms collision density
before judging; if M1 misses, stage (force raid on next contest day / force
contest during a lingering episode) rather than re-score.

**Bound metrics (§14):**
- M1 (collisions are lived): ≥3 collision events across the pilot (contest day
  with a lingering episode open at d, a raid crisis open at d, or a raid fired
  d−1..d+1; or a raid firing on a day a roster villager was contest-taken).
  GO if met (else restage, never re-score).
- M2 (no stuck state): 100% of collisions leave no stuck state — no contest
  left unresolved at day end, no raid crisis open >10d after a collision, no
  lingering episode ending 'unresolved-at-window-end' that began at a
  collision. GO if 100%.
- M3 (no silent deaths): 100% of person deaths during collision windows
  (day ±1) get registerDeath kind:'person' + a spontaneous mourning signal
  within 7d (r38's proven M3a channel). GO if 100%.
- M4 (the village fights on): ≥50% of collision raids have ≥1 defender
  engagement (resolveWildMonsterEncounter {raid:true}). GO if met.
- M5 (no theater): 0 fabricated-history lines in sampled collision transcripts.
  GO if 0.

**Instrument:** scripts/journey-crisis-r40-collision-20261021.js (r39 fork:
fireContest/contestInterruption instruments, tick-order capture on contest
days, per-collision lately convos with a witness).

## Results

Pilot (3 seeds, ~18–30s each): 14/13/10 contests, 6/7/7 raids, 22/31/29 raid
fights, 1/0/0 lingering episodes, 11/9/7 person deaths.

**Collisions: 3 — [101:d46, 303:d30, 303:d64].** No defending-from-the-arena
(bar a miss). No mid-contest raid fights (bar b miss). **Bar c HIT: zero
say-lines acknowledged any same-day raid+contest** — raids and grabs landed
as completely separate beats (sayLog verified: seed 303 d30 raid block, then
an unrelated SYSTEM season-finale line; seed 303 d63 raid block, d64 grab,
no connective tissue). The d64 case is the felt one: 5 villagers drive off a
raid at the door d63; the next day the player + 3 more are taken for Hollow
Belly — and nobody says a word about the overlap. Bar d: no contestant died
in an arena during a collision window (Willie's death d45 was the raid
itself; registerDeath fired exactly once — the d46 "The Callback killed
Willie in 3 rounds" say line is the raid's own fight narration arriving a
day late, not a second death).

| Metric | Result | Verdict |
|---|---|---|
| M1 collisions lived | 3 across pilot (bar ≥3) | GO (at bar) |
| M2 no stuck state | all contests resolved with takes; all episodes resolved | GO |
| M3 no silent deaths | 101:d45 Willie → mourning d46 + tribute/grief d48 | GO |
| M4 village fights on | 3/3 collision raids had ≥1 defender engagement | GO |
| M5 no theater | 3/3 lately transcripts, 0 fabricated history | GO |

**People check (sense-testing, full transcripts read):** Courtney (101, d48)
grieves real losses — "We lost Willie and Ananya. I do the headcount without
thinking. Then I think." — while asking for sickness help; Joshua (303, d31)
is hungry and asks to be fed; Paola (303, d66) small-talks about shared
stew and teaching Wild Ramps. Coherent, wants are real, no fabricated shared
history. PASS. (Minor: the favor_requirements "no longer available" loop
reads slightly robotic when the driver re-picks it 3× — driver artifact, not
engine.)

**Village census (plain words):** seed 101's village barely survived — pop 3,
pantry 5.5k kcal by d91 after 11 deaths; the raid d45 killed Willie at the
door while 4 others drove the raiders off, and the next day's Gauntlet grab
took the player. Seed 303 thrived — pop 9, pantry 74.6k kcal, raids met at
the door every time (4–5 driven off each). The collision bends the village's
*story* (a grab right after a bleeding night) but doesn't break its body —
the raids themselves are the killer, and the door holds.

## Fix: raid/contest collision acknowledgment

**Blank filled:** neither direction of the collision was ever acknowledged.
Fix (2 files, 28 insertions):
- `src/js/contests.js` fireContest: if the last raid was today or yesterday,
  the System admits it watched: "📺 We watched the raid too. Fine doorway
  work. The show goes on regardless — the audience loves a tired hero."
- `src/js/havenGrowth.js` havenRaidTick: if a contest was announced today or
  yesterday, village voice: "🕯️ The treeline is still torn up from the raid
  when the System's light comes for them. Nobody is ready. The light doesn't
  wait."
- Shared once-per-day ack flag (`v._raidContestAckDay`) so a two-direction
  collision day says it exactly once.

**Proof:** scripts/test-raid-contest-collision-ack.js — 5/5 green on the fix
(contest-direction ack fires; once-per-day; no ack when raid 10d ago;
raid fires under forced conditions; raid-direction ack fires). Before/after
verified: the two ack assertions FAIL on stashed pre-fix code. Instrument
script (r40-collision) + evidence retained.

## Reachable / Fun / Winnable

- **Reachable:** yes — collisions emerge from the existing scheduling
  (2/week contest budget vs reactive raids); 3 lived in a 3-seed pilot.
- **Fun:** the collision was *felt but unsaid* — now said. The System's
  "audience loves a tired hero" line lands in the chilling-benefactor
  register and makes the collision a story beat instead of a scheduling
  coincidence.
- **Winnable:** collision windows added no deaths; both villages ended
  alive (one fragile, one thriving). The door holds.

## metric review

M1's bar (≥3) hit exactly 3 — the pilot was at the floor of the bar, so the
question's collision density is real but thin; a fuller multi-seed run would
firm it up. M5's transcript driver kept missing ask:lately picks (pool
dilution) — a future run should force the lately pick rather than rely on
the sampler. No metric revisions proposed for the next run.
