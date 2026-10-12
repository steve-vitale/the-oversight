# Long-run sim: TRAVEL & REGIONAL lever r4 (2026-10-12)

Lever 8, round 4. Worktree `sim-travel-r4`. Canon read first: CANON.md, SCALE.md.
Builds on r1 (grief-coalescing), r2 (viewership), r3 (village names, exiled-beat
death, rep-name honesty). Sibling runs active and untouched: sim-disease-r1
(own worktree), journey-scale-r2 (its `scripts/test-journey-scale-20261012.js`
not touched). Master did not move under this run (800fe384 throughout).

## The lever: "the first gesture is played"

**The blank:** the first gesture (`pendingAccord` — gift 2,000 kcal / the
representative's three days / cold ink) is the designed regional moment: "the
other fire is watching what Haven does FIRST." But no sim policy ever answered
it, so across every long-run sim the gesture sat unplayed — the rep-loan path
unmeasured, the trust deltas unobserved, the copy unread. Instrument gap, not
engine gap: the engine's accord lifecycle was audited and is sound (breakLink
already kills a pending accord aloud + restages via accordUnanswered, 2026-10-10
fix — the hypothesized post-Dawn orphan does NOT exist; verified by code read).

**Exact change** (scripts/policies/winseek.js — sim instrument, not shipped):
new `accordRoad(Game, ctx)`, called first in `diplomacyRoad`: answer the accord
with 'gift' when the pantry holds > 8,000 kcal (same bar as the renegotiation
heuristic), 'visit' when `_availableRepresentative()` can walk, 'cold'
otherwise — a played choice, never silence. Counts only real answers
(`answerAccord` returns truthy), same convention as r3's nationalAnswered fix.

**Same round, same bug class as r3's "A walks into the light"** — two more
`.split(' ')[0]`-on-descriptor sites in regional/away-party copy, both found
by this round's sense-reading of a real transcript:
- `src/js/villager-objectives.js` objReturnEffect: "🚶 Sofia is back — found A."
  → now `this._repName({ id: o.targetVid })` (descriptors used whole)
- `src/js/membership.js` loanedReturnTick: "A walks back in — days at X's fire"
  → same `_repName` treatment
(+1 ontology rule each; docs/ONTOLOGY.md regenerated, 83/83 validated.)

## Before/after on IDENTICAL seeds (12 seeds × 200d, winseek — policy delta only)

| measure | before | after |
|---|---|---|
| gestures played | **0** | **30** (every run) |
| rep loans issued ("walks out to sit at…") | 2 | **10** |
| median / max survival | 30d / 61d | 28d / 84d |
| regional reach | 7/12 | 6/12 |
| national / global / table / won | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |
| foreign polity max size | 3 (2 seeds) | **4 (seed 10, day ~63)** |
| catch-up sim calls | 0–172/seed | 0–289/seed |

The gesture beat now reads in-sim: *"🎁 Haven's first gesture: 2,000 kcal
walks to Thornfield's fire — a gift, no strings. They count it, and they
remember who sent it. (Trust +10.)"* / *"🚶 Sofia walks out to sit at Ashford's
fire for three days — Haven's face, their time. Still ours; membership needs no
presence. (Trust +8.)"* / *"Sofia walks back in — days at Ashford's fire,
served."* The beat is played, the loans are real absences, the returns are
said aloud.

**Seed 10 (after) is the new type specimen:** 67 days, 4 gestures, 2 loans,
regional day ~25, a foreign 4-realm formed (Emberhold+Ashford → Thornfield
bound → The Bloodied bound: *"The region's map is being redrawn — not by
Haven"*), and Haven sitting under 40,500 kcal of tribute arrears — so the
BELONG gate (trust ≥ 50 ✓, arrears 0 ✗) correctly stayed shut. The design
works: the door exists, the debt has teeth, the village just didn't live
clean enough to walk through it.

Proof: `scripts/test-gesture-beat-20261012.js` — 36/36 × 3 seeds (was 33/36
red pre-fix: accordRoad missing, "found A" present). Regressions:
test-membership-20261007 43/43, test-villager-objectives-20261008 16/16,
ontology 83/83.

## Reachability re-verified on current master (before the lever)

| measure | r3 (db2f183a) | r4 before (800fe384) |
|---|---|---|
| survival median / max | 32d / 110d | 30d / 61d |
| regional | 8/12 | 7/12 |
| national / global / table | 0 / 0 / 0 | 0 / 0 / 0 |
| foreign polity max | 4 (1 seed) | 3 (2 seeds) |
| waves reached | ≤ 3 | ≤ 3 |

**Verdict: survival is still the binding constraint** (median 30d vs the
ladder's ~65–90d national pacing). Within the travel systems themselves,
everything binds honestly:
- **Link formation:** healthy — 2–4 active links by day 7–14, courtship with
  real counter-offers (*"They'll take Haven — but the tribute is 6,000
  kcal/week, not 5,000. Take it or leave it."*).
- **Tribute/arrears:** real food both directions. Seeds 1–2 paid 15–16k kcal
  in a week as subordinates; seeds 4/6 accrued 11k/24.75k arrears when
  starving (trust −4/week, *"Arrears grow teeth"*). The ×1.25 national
  routing is proof-tested (test-break-regional-r4 §J) but never fires
  organically — national is unreachable, not the routing.
- **Foreign polities:** engagement-driven growth works at the canon rate
  (pair → 3-fire in ~1–2 engaged weeks; 4-realm needs one more week the
  village usually doesn't get). Drift seeds pairs; stir (capped 12, all four
  kinds firing in long runs) grows them. r4-after seed 10 proves the 4-realm
  forms when the village lives to day 63.
- **Catch-up sim:** REAL and honest — verified by instrumented probe
  (`scripts/probe-catchup-honesty-20261012.js`): first approach on day 20 ran
  the full 20-day sim (roster generated with 6 named people, knowledge
  profile, pantry at earned levels), subsequent approaches tick day-by-day;
  `checkVillageProximity` fires it on every approach ≤ 2 tiles. The design
  rule "on approach, the game runs a catch-up sim of all days since start"
  holds in practice, not just in code.
- **Away parties / representatives:** loans are real (surfaced in awayMembers,
  returns said aloud, deaths abroad handled). The gesture 'visit' path is now
  exercised; demand-answer loans ("the parley at Thornfield, days served")
  show copy variety.

## Sense-testing (transcripts read — Steve 2026-10-11)

- The region lives without Haven: *"🧳 Word of Haven's trade is doing work
  out there — Word comes late, through traders: Thornfield has bound itself
  to Emberhold. The region's map is being redrawn — not by Haven."* Wrong
  rumors too: *"A traveler swears Thornfield is feasting — a whole elk, they
  say. (They're wrong. Thornfield is starving.)"* — delayed, possibly wrong,
  never omniscience, per canon.
- Demands are played: *"📯 The Bloodied calls on the obligation: An extra
  2,500 kcal, now. 'The season is hard.' Honor it, or refuse — both are
  remembered."* → *"You send 2,600 kcal. It hurts. That's rather the point
  of tribute."*
- Unanswered begs have consequences: *"Yuki waits two days at your fire,
  getting thinner. Nobody answers. They walk back to Stonebridge with
  nothing. They'll remember the silence."*
- Night raids from linked villages: *"Kenji of Stonebridge with 2 others,
  and they're not here to talk. 'Your pantry or your blood. Choose.'"*
- **Copy wrinkle (documented, not fixed — same family as r3's r13 note):**
  "Word of Haven's X is doing work out there — Word comes late, through
  traders:" doubles "Word". Reads as voice, left alone.
- The wider `.split(' ')[0]`-on-descriptor pattern exists in ~20 sites across
  the codebase (conversation.js, comms.js, carexplore.js…); r3 fixed
  hierarchy.js, r4 fixed the two travel-visible return lines. A global pass
  is a cross-cutting cleanup, not this lever.

## Village assessment (plain words)

The winseek villages court hard and die young — first links by day 7–14, the
Dawn at day 24–28, then starvation by ~day 30. What's new this round is that
the first impression is finally played: gifts walk out, Sofia sits at
Ashford's fire for three days and comes home, and the other fires remember.
The region climbs alongside: pairs become realms, schisms fire (The Bloodied
itself was a 6-person cannibal splinter, caught up honestly on first
approach), traders carry the news late and sometimes wrong. Seed 10 showed
the whole arc working — a foreign 4-realm, Haven deep in tribute debt, the
BELONG door correctly shut on arrears. The ladder's rungs are all walkable;
the villages just don't live long enough to climb them. That's the food
lever's wall, not travel's — travel's machinery is honest end to end.

## Blanks filled vs documented

- FILLED: the first gesture unplayed in sims (policy instrument) — engine
  audited sound; before/after on identical seeds; proof 36/36 ×3.
- FILLED: "found A" (villager-objectives.js) + "A walks back in"
  (membership.js) — same bug class as r3, sense-found, proof-covered.
- DOCUMENTED: national/global/table/Arc IV/waves 4–5 unreachable organically —
  survival (median 30d) still binds, re-verified on current master.
- DOCUMENTED: "Word of Haven's X … — Word comes late" doubling (voice, left).
- DOCUMENTED: ~20 remaining `.split(' ')[0]`-on-descriptor sites outside
  travel (conversation.js, comms.js, carexplore.js…) — cross-cutting cleanup,
  not this lever.

## Files

- `scripts/policies/winseek.js` — `accordRoad()` + diplomacyRoad hook + export
- `src/js/villager-objectives.js` — "found A" → `_repName` (+ontology rule)
- `src/js/membership.js` — "A walks back in" → `_repName` (+ontology rule)
- `docs/ONTOLOGY.md` — regenerated (83/83)
- `scripts/test-gesture-beat-20261012.js` — 36/36 ×3 seeds (proof)
- `scripts/sweep-travel-r4-20261012.js` — deep telemetry (stir, foreign
  growth, tribute/arrears, catch-up, loans, gestures)
- `scripts/sense-travel-r4-20261012.js`, `scripts/sense-gesture-r4-20261012.js`
  — transcript capture tools
- `scripts/probe-catchup-honesty-20261012.js` — catch-up honesty probe
- `scripts/sweep-travel-r4-{baseline,deep,after}-s1.json` — 12-seed data ×3

`[needs-eyes]`: two player-visible copy fixes (return lines for unnamed
villagers now read whole descriptors).
