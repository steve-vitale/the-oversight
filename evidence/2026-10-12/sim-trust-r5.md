# Long-run sim — trust & social lever r5: LEADERSHIP LINE POOLS + CONTENDER ESCALATION ARC (2026-10-12)

Lever index 5 (trust & social), round 5. Canon read first: docs/CANON.md,
docs/CONVERSATIONS.md, docs/PARTY.md. Trust != reputation held throughout.
This round fills the two blanks r4 documented (not invented — r4's words).

## The two blanks (r4 evidence/2026-10-11/sim-trust-r4.md)

1. **Leadership line pools.** r4: stand-ground / yield / rally / askSupport /
   friction / challenge-raise lines were single templates — the stand-down
   line fired verbatim 14× in a 73-day run.
2. **Contender escalation arc.** r4: a repeatedly-stood-down contender never
   changed — 14 identical confrontations, never gave up / left / grudgingly
   respected.

## The lever played (src/js/game.js, +~200 lines)

**Line pools** — every leadership line is now a pool, in-character, no
fabricated shared history, no filler:
- standGround: 5-line early / 4-line mid / 3-line late pools. The TONE shifts
  with the contender's stand-down count — the 5th confrontation does not
  sound like the 1st ("Fine. Your funeral." → "You keep winning these…"
  → "I don't even know why I bother anymore.").
- yieldChallenge 4 lines, askSupport 4 lines, friction 3→6 lines,
  challenge-raise 1→4 lines, rally 3→5 lines, takeover 1→2 lines.

**Stream-neutrality discipline** (new, and load-bearing for the measurement):
`Game.leadPick(key, cid, pool)` is a ZERO-Math.random-draw deterministic
rotation (stable per-(line-type, contender) start offset via `_hashStr`,
then round-robin — the conversation.js "cycle in varying order" discipline).
It is used everywhere the OLD code consumed no random draw (raises,
stand-downs, yields, asks, takeovers, arc beats). `Game.leadLine` (1 draw,
no-immediate-repeat) is used only where the old code already drew
(friction, rally). Mid-run discovery: the first implementation drew a
random everywhere and the cosmetic change butterfly-shifted the sim stream
(competent trustEndMean 11.36 → 30.63 on identical seeds — pure noise).
After the refactor: **competent runs are bit-identical before/after on all
12 seeds** (trust, days, end reasons, death causes), so the engager deltas
below are the arc treatment, not stream noise.

**Contender escalation arc** — each contender keeps a rivalry ledger
(`v.contendArc[cid] = {stoodDown, yielded, state}`; dead ids pruned). From
stand-down #4, each confrontation has a rising chance to close the arc
(0.08 → 0.45 by #9):
- **(a) grudging respect** — stops challenging (leadershipFriction skips
  resolved arcs), heat stops building, trust floor settles with a small
  honest +6 bump; memory recorded.
- **(b) refocus** — drops the lead goal for their own work (intense→protect,
  prickly→survive, else prove; set on both the person record and bgGoals);
  narrated in their voice.
- **(c) the splinter** — rare by design: only when never yielded to,
  holding no domain, and trust ≤ 25. They walk out — their own things,
  no theft (canon: violence is desperate; theft allowed but socially
  punished — here there is none). Never silent: a leave beat, two real
  witnesses seeded into the departure gossip (the r2/r3 pattern, so the
  rumor travels), witness memories, `removeVillager(cid, 'splinter')`
  (existing hygiene clears heat/challenge/allies/positions).

## Before/after (identical seeds — 12 seeds × 2 policies × 200d = 24 runs)

Harness: `scripts/sweep-trust-r5.js` (r4 fork + arc telemetry).
Raw: `sweep-out/trust-r5-before.json` (pristine code) /
`sweep-out/trust-r5-after.json`.

| | competent (control) | engager BEFORE | engager AFTER |
|---|---|---|---|
| challenges answered | 0 / 0 | 89 (84 stood, 5 yielded) | **49** (46 stood, 3 yielded) |
| contender cascade runs | 0 / 0 | 0 | 0 |
| takeovers (est) | 2 / 2 | −5 | −3 |
| trust end mean | 11.36 / 11.36 | 6.43 | **12.76** |
| share trust 65+ | 0.083 / 0.083 | 0.042 | 0.083 |
| survival median / max | 66/157 / 66/157 | 63 / 128 | 70 / 124 |
| wins | 0 / 0 | 0 | 0 |
| **arc: respect / refocus / leave / open** | — | — | **2 / 1 / 0 / 5** (8 contenders, max 9 stand-downs) |

The answered-count drop (89→49) is the design working, not a bug:
resolved rivalries END — a respected/refocused contender stops challenging,
so fewer confrontations arise and fewer −5 stand-grounds land (trust
6.43→12.76). The cascade stays answered (0/8 both), takeovers ~0 both.
Survival is unchanged in shape (all 24 runs village-lost; the wall is
still food/monsters — monsters ~50% of villager deaths, player deaths
combat ~65-70% / starvation ~25%).

The leave arc fired **0 times in 24 seeds** (forced-test proven, see
below). It is genuinely rare as briefed — resolution itself needs 4+
stand-downs, then a 0.15 outcome roll behind the trust≤25 / never-yielded /
no-domain gates. Documented as a tuning knob, not a bug: raise the 0.15
or lower the n≥4 threshold if Steve wants to see it more often.

## Reachability verdict

- **The full rivalry lifecycle is now reachable in sims**: challenge →
  repeated stand-downs with shifting tone → resolution (respect/refocus/
  splinter). 8 contenders tracked across 12 engager seeds; 3 resolved by
  day 200, 5 still grinding (the designed "banked, not gone" tail).
- **The splinter is reachable but rare** — proven by forced test
  (leave beat, roster removal, exiles how='splinter', witnessed departure
  gossip); 0 natural occurrences in 24 seeds is the designed rarity, and
  the 12-seed extension scan (seeds 13–24: 3 refocus, 2 respect, 7 open)
  confirms the distribution.
- **No regressions**: the r4 toolkit still fires (coalitions, rallies,
  merit yields/stands, domain respect); takeovers and cascades stay at
  zero under engagement.

## Sense-testing (SENSE-TESTING LAW — transcripts read)

`scripts/sense-trust-r5-20261012.js`. Seed 11, 80 days (Marcus, 4
stand-downs): friction lines genuinely cycle ("Interesting. Nobody asked
me." / the silent arms-crossed beat / "Orders are orders." / "…again."),
raises vary ("We need to talk…" / "I want a say… A real say." /
"plants themself… Say it out loud." / "Who put YOU in charge?"),
stand-downs shift tone with the count ("Your crew, your mess" →
"Whatever. It's your call — until it isn't" → "You keep winning these"
→ "Not worth it. Not today."). Allies vary too ("doesn't speak for me" /
"Picking sides already? Fine. Yours." / "don't make me regret it.").

Seed 13 (refocus, resolved d18): the 6th stand-down lands the late tier
("I don't even know why I bother anymore. But Marcus is still standing
here."), then the resolution beat in the same confrontation: "Marcus
stops cornering you. 'I'm done with this. proving myself — that's mine
now. You keep the rest.' They mean it." No friction or challenges from
Marcus afterward — the rivalry visibly ends. (Caught and fixed in this
run: the first draft said "proving themself" in the contender's own
mouth — now "proving myself".)

Seed 21 (respect, resolved d14): "Later, by the fire, Ladaporn catches
your eye and gives a single slow nod. No words. The rivalry is over —
or at least, they've set it down."

**Flags (documented, not fixed):**
1. Leave-arc tuning: 0 natural occurrences in 24 seeds. The gates and the
   0.15 roll are per the brief ("genuine rare arc, not a churn
   mechanic"), but if Steve wants the beat visible in ordinary play,
   raise the roll or start the resolution ramp at n≥3.
2. takeoversEst still goes negative when yielded leads die (r4-documented;
   needs the challenge-lifecycle event log, not end-state arithmetic).
3. `Game.delegateTask` still does not exist (r4-documented policy dead
   path in competent.js).

## Village assessment

Seed 13's village: Marcus appointed himself the opposition in week one —
6 confrontations across 18 days, each answered, the coalition visibly
growing (Luz, then Samuel: "I've got your back. Just don't make me
regret it."). On day 18, after the sixth stand-down, he set it down:
"I'm done with this." The village kept the worker and lost the war —
Marcus now proves himself instead of cornering the player at the fire.
That is the arc the design always promised: the rivalry goes somewhere.

Who thrived: the engaged-with (allies remembered, respect bumped). Who
died: everyone eventually — monsters first, then the logistics trio; the
leadership game changes the SOCIAL outcome, not the survival curve,
which is exactly this lever's scope.

## Blanks filled vs documented

**FILLED (this run):**
- Leadership line pools (r4 blank 1): 7 line sites pooled, tone tiers
  on stand-downs, stream-neutral (competent bit-identical 12/12).
  Proof: `scripts/test-leadership-pools-20261012.js` **20/20 × 3 seeds**.
- Contender escalation arc (r4 blank 2): respect / refocus / splinter
  with gates, narration, gossip, and hygiene. Proof:
  `scripts/test-contend-arc-20261012.js` **21/21 × 3 seeds** (forced
  rolls: leave/refocus/respect, both leave gates, terminality,
  friction suppression with control, dead-id pruning).

**DOCUMENTED (not this run):** leave-arc rarity tuning; takeoversEst
negativity; the `delegateTask` dead path (all three carried from r4).

## Proof & regressions

- `scripts/test-leadership-pools-20261012.js`: 20/20 × 3 seeds
  (leadLine/leadPick no-repeat + determinism + 0-draw proof, tier
  shift, arc counters, all 7 sites varied).
- `scripts/test-contend-arc-20261012.js`: 21/21 × 3 seeds (below-
  threshold silence, forced leave/refocus/respect, leave gates ×2,
  friction suppression with pre-respect control, terminality, pruning).
- Regressions: gossip-norepeat 17/17, gossip-drama 5/5, agency-lever
  17/17, agency-teachv 20/20, convo-engine-trust 7/7, social-gossip
  9/9. Ontology 83/83.

## Files

- `src/js/game.js` — leadLine/leadPick/_contendArc/_maybeResolveContendArc
  + 7 pooled line sites + respect-skip in leadershipFriction (+~200/−7)
- `scripts/sweep-trust-r5.js` — r4 fork + arc telemetry (before/after)
- `scripts/test-leadership-pools-20261012.js` — proof (new)
- `scripts/test-contend-arc-20261012.js` — proof (new)
- `scripts/sense-trust-r5-20261012.js` — sense capture (new)
- `sweep-out/trust-r5-before.json` / `trust-r5-after.json` — raw 24-run data
- `sweep-out/sense-r5-seed{10,11,13}.log` — sense transcripts
