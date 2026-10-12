# Long-run sim — trust & social lever r4: LEADERSHIP CONTENTION (2026-10-11)

Lever index 5 (trust & social), round 4. Canon read first: docs/CANON.md,
docs/CONVERSATIONS.md, docs/PARTY.md. Trust != reputation held throughout.

Queue-jump justification (per brief): lever 6 (contests) was worked 4× today;
HEAD 7ca9cc33 landed the trust-r3 gossip-witness changes, and r1–r3 left the
leadership policy gap as the documented open blank — this round fills it.

Prior rounds: r1 gossip spread (b07cac97), r2 follower threshold 65→50
(caaa5baa), r3 born-dead departure/return gossip → 2 witnesses (7ca9cc33).

## The lever played

**A contender-engagement policy** — the first policy that answers leadership
challenges instead of letting every one auto-resolve into a contender
domain-takeover after 8 parts. New file `scripts/policies/contender-engager.js`
(built on competent, so survival behavior is held constant):

1. **Answer the challenge the same day-part** (upkeep hook): coalition first
   (askSupport from up to 2 trusted villagers, trust≥50), then a MERIT call —
   **yield** to competence (`villagerCompetence ≥ 1.2`, or ≥1.0 with trust≥30:
   they run the domain well, working it every part, +10 trust) or **stand
   ground** against someone who'd mismanage it (competence < 1.0: −5 trust,
   heat banked not gone — the designed trade).
2. **Pre-emptive rally**: one speech a day when contender heat ≥ 2 (rally
   cools heat by 2, cools challenge age by 2 — the designed toolkit, previously
   100% unmeasured in sims).
3. **Respect yielded domains**: wraps `Game.assignTask` to refuse assigning
   anyone OVER a contender-held domain (taskLead) — the 'gave orders over a
   contender' friction loop is what starts these fires.

No game-code balance change. The policy is the instrument; the game is untouched
(except the two rendering fixes below).

**Two rendering fixes** (both sense-confirmed this run, both r2/r3-documented):
1. `src/js/game.js` spreadGossip: "X telling Y about Y" → pronoun-aware
   reflexive ("Lena telling Sujon about themself", "Rosa telling James about
   himself"). Uses the existing `v.pro || hash-fallback` pattern.
2. `src/js/convoTopics.js` t2fol_oldworld: "What I miss most? the noise." →
   "The noise." (capitalized).

[needs-eyes]: both fixes change player-visible copy in the social stream.

## Before/after (identical seeds — 8 seeds × 2 policies × 200d = 16 runs)

Harness: `scripts/sweep-trust-r4.js` (fork of r2 + leadEngage counters,
takeoversEst, maxCascade). Raw: `sweep-out/trust-r4.json`.

| | competent (before) | contender-engager (after) |
|---|---|---|
| challenges faced | 109 challenge-days, **0 answered** | **52 answered** (48 stood ground, 4 yielded) |
| coalition built | 0 allies | **88 allies** via askSupport |
| rallies | 0 | 166 (heat-cooling, ≤1/day) |
| domains respected | 0 | 24 refused assignments over taskLeads |
| contender takeovers (est) | 2 | **~0** (−3 artifact, see below) |
| cascade runs (one contender ≥2 domains) | **1/8** | **0/8** |
| maxCascade mean | 0.25 | 0.13 |
| trust end mean | 17.26 | **36.15** (share@65+: 0.063→0.283) |

The matched-pair proof — **seed 2**: competent's contender `gen_iyzpqba` took
**garden→fish inside 21 days** (the r1/r2 cascade, reproduced); the engager on
the identical seed **yielded fish honestly** (+10 trust, contender works the
domain every part) — one domain, earned, no cascade.

Secondary systems: survival median 60d (engager) vs 63d (competent), all 16
runs village-lost, 0 wins both. Player deaths: combat 59% vs 40%, starvation
34% vs 51% — the binding wall is still food/monsters (the mid-game wall),
not leadership. The engagement changes the SOCIAL outcome, not the survival
curve — which is exactly the lever's scope.

Death causes (villagers): monsters 44–52%, thirst 15–20%, starvation 11–20% —
unchanged shape vs r2.

Notes on the numbers:
- `takeoversEst = endTaskLeads − policyYields` is crude: 4 yields but only 1
  lead alive at end (yielded holders died in village-lost runs) → −3. The
  per-run matched analysis is the honest read: **zero unanswered takeovers
  under engagement** (every challenge answered the same day-part; none ever
  reached age 8).
- `challengesRaised` (challenge-days sampled at daily time) undercounts for
  an answering policy — challenges die in upkeep before the daily sample.
  `leadEngage.challengesAnswered` (52) is the honest "faced" count.

## Reachability verdict

- **The full leadership toolkit is now measured for the first time**:
  rally/askSupport/standGround/yieldChallenge all fire in long sims with
  their designed effects (heat −2, coalition recorded, +10/−5 trust via
  bumpTrust, taskLead domains that work every part). 52/52 challenges
  answered; the no-response equilibrium is a policy choice, not a game gap.
- **The contender cascade is answerable**: 0/8 cascade runs under engagement
  vs the reproduced cascade on the matched seed. Yielding to competence is
  the pressure valve the design intended — the contender gets a real domain,
  the village gets real labor, the player keeps the relationship.
- **'gave orders over a contender'** (~42/run in r1) remains the hottest
  social loop; the engager cools it with rallies but does not avoid
  delegating — friction is by design ("nothing you do is neutral").

## Sense-testing (SENSE-TESTING LAW — transcripts read)

`scripts/sense-trust-r4-20261012.js` — seed 11, 73 days, 14 challenges, all
stood ground vs Marcus. The arc reads as **real human rivalry**:

> d4:3 `A man, maybe 40s, with tattooed arms steps closer. "We need to talk. About who's actually running things here."`
> d5:0 `Marcus holds your gaze, then looks away. "Fine. Your funeral." This isn't over — but it's quiet. For now.`
> d8:0 `Lena considers it, then nods. "Yeah. Marcus doesn't speak for me." You feel the ground firm up under you a little.`
> d8:0 `Marcus holds your gaze, then looks away. "Fine. Your funeral." ...`
> d11:0 `Lena considers it, then nods...` / d11:0 `Rosa considers it, then nods. "Yeah. Marcus doesn't speak for me."` / d11:0 `"Fine. Your funeral."`

Heat builds through delegation ("Interesting. Nobody asked me." / "Why are
YOU giving orders?"), rallies cool it ("We're still here," you say, simply...
someone laughs — surprised, real), the coalition visibly grows (Lena, then
Rosa back you), and Marcus keeps coming back — which is the designed "banked,
not gone" behavior, and it reads that way.

**Flags (documented, not fixed — design scope):**
1. The standGround line ("Fine. Your funeral...") fires **verbatim 14×** —
   leadership resolution lines are single templates; the r1 "no repeats"
   discipline never covered them. Same for the 3 friction one-liners cycling.
2. **No escalation path for repeated challenges**: Marcus challenged 14 times
   in 73 days and never gave up, left, or got co-opted except by yield. A
   human leader's 14th confrontation would not sound like the 1st. The
   system needs an arc for the unyielding contender (grudging respect?
   departure? a bigger confrontation?) — design work, not a tune.

**Fix verification in the wild** (same run): 19 reflexive fragments
("Rosa telling James about himself.", "Emma telling Rosa about herself."),
**0** "telling Y about Y" doublings (was 4+ in the pre-fix sense run).

## Village assessment

Seed 11's village: Marcus (tattooed arms, bold, lead-goal) appointed himself
the opposition in the first week and never stopped — 14 confrontations, each
answered, each costing him 5 trust and buying the village Lena's and Rosa's
open backing. The village talked about it the way villages do: not in the
challenge lines, but in the fire-fragments about Marcus traveling the gossip
chain for weeks. Nobody reached devoted (90+); the engager's trust sat higher
(36 vs 17) because words were actually spoken — rallies and coalitions are
the designed words-channel, and the 40-words cap held (trust gains per rally
+3 through the resolver, no farming observed).

Who thrived: the engaged-with — Lena and Rosa, asked for support, remembered
as allies. Who died: everyone eventually — monsters first (44–52%), then the
logistics trio. The leadership game is now playable and legible; the village
still dies to the same wall as every other lever this week. That wall is not
this lever's.

## Blanks filled vs documented

**FILLED:**
- The leadership policy gap (r1–r3 documented): challenges 0% answered →
  contender-engager answers 52/52 on identical seeds; cascade 1/8 → 0/8.
  Proof: `scripts/test-contender-engager-20261012.js` **25/25 × 3 seeds**.
- "X telling Y about Y" fragment → pronoun-aware reflexive (game.js).
- "What I miss most? the noise." → capitalized (convoTopics.js).

**DOCUMENTED (not this run):**
- Leadership one-liners are single templates (verbatim 14× standGround) —
  needs line pools like the r1 gossip-frag tails got.
- No escalation arc for the repeatedly-stood-down contender (14 identical
  confrontations; never gives up / leaves / grudgingly respects).
- takeoversEst goes negative when yielded leads die — needs a proper
  challenge-lifecycle event log instead of end-state arithmetic.
- `Game.delegateTask` does not exist — competent.js calls it in try/catch
  (garden knower-staffing silently falls through to assignBest). Pre-existing
  policy dead path; the garden still gets staffed, but not by the knower.

## Proof & regressions

- `scripts/test-contender-engager-20261012.js`: 25/25 × 3 seeds
  (20261012, 7, 99) — yield/stand-ground branches vs real villagerCompetence,
  merit-rule honesty, domain respect, rally cooling, both rendering fixes.
- Regressions (worktree): gossip-norepeat 17/17, gossip-drama 5/5,
  social-gossip r1 9/9, agency-lever 17/17, agency-teachv 20/20,
  convo-engine-trust 7/7. Ontology: 82/82 validated.

## Files

- `scripts/policies/contender-engager.js` — the policy (new)
- `scripts/sweep-trust-r4.js` — the measurement harness (new)
- `scripts/sense-trust-r4-20261012.js` — sense-transcript capture (new)
- `scripts/test-contender-engager-20261012.js` — proof test (new)
- `sweep-out/trust-r4.json` — raw 16-run data
- `src/js/game.js` — gossip fragment reflexive rendering (+10/−2)
- `src/js/convoTopics.js` — capitalization fix (1 line)
