# Long-run sim — trust & social lever (2026-10-11)

Lever index 5 (trust & social). Canon read first: docs/CANON.md, docs/CONVERSATIONS.md, docs/PARTY.md.

## The lever played

**Pre-System follower-volunteer trust threshold: 65 → 50** (`src/js/party.js`
`followerCheck`, one line + comment). `docs/PARTY.md` updated to match.

Why this one: the "I'm coming with you" beat (pre-System, days 1–6, trust-gated,
no UI) was mathematically dead in its window — measured **0 volunteers in
8×30-day competent sims**, max day-6 trust 56 < 65. A documented feature that
can never fire is a blank. 50 is the 'friendly' trust-band floor and sits above
the 40 words-cap, so deeds — not just talk — earn a follower. No `[needs-eyes]`:
no feel/combat/UI change, just a dead gate opened to its designed level.

## Measurement first (before)

New harness: `scripts/sweep-trust-lever.js` — trust/social telemetry over
long horizons (trust distribution per 10 days, per-rumor gossip reach,
moot/petition counts + outcomes, challenges raised/yielded/stood-ground,
betrayals, promises, trust-gain reasons, leadership/taskLeads, bonds).
Baseline: 12 seeds × 2 policies (competent, socialite) × 200 days
(`sweep-out/trust-lever-baseline.json`).

| System | Baseline verdict |
|---|---|
| Trust gains | Survivors climb (day-80 mean 71, share@65+ 62%) — almost entirely via **villager-duty** bumpTrust (+1–2/duty: creek water, fish, garden, cook, wood). Progressive curve works as designed. |
| Conversation trust | **0 resolveConsequence calls in 24 runs.** Policies open convos and instantly leave (`talkTo` → `endConvo('left')`); the 40-words cap never binds. The convo engine's trust channel is unmeasured in sims — policy gap, not game gap. |
| Gossip spread | Healthy (per-rumor tracking, `sweep-out/trust-lever-gossipprobe.json`): meanMaxHeard 5–7, meanSpread ~5, ~70% of rumors reach 4+ hearers. Initial end-state sampling (meanHeard 0.6) was biased — corrected. 'order' gossip dominates (168–230/run: every delegation is observed, by design). 'departure'/'return' are seeded with `heard=[]` — born dead, never spread (documented blank, below). |
| Moots | Work when driven: socialite conducted 27, all 27 accepted. Competent: 32 turned away at the door (beds full), 0 moots. Reachable; policy-engagement gated. |
| Leadership | **13.5 challenges/run raised**, 0 answered by policies → all auto-resolve via contender domain-takeover after 8 parts. Cascade confirmed on seeds 9/4/11: one contender takes garden→fish→water→cook inside the first month. Full player toolkit exists and is UI-afforded (rally cools heat, askSupport, yieldChallenge, standGround) — the cascade is the no-response equilibrium, largely policy. 'gave orders over a contender' penalties: ~42/run — the hottest social loop in the game by volume. |
| Betrayal | **0/24 runs.** `betrayalSweep` only considers `travelingWith()`; policies travel alone and never invite → no candidates. Decoration in sims. |
| Promises | **0/24.** Policies never make them. |
| Scale ladder | Villages discovered 7/7 in a 200-day survivor; `judgeLink` scores 62–83 (≥55 = accept). The social→scale ladder is reachable in principle; policies never call `proposeLink`. Not the wall. |

## After (identical seeds)

Follower probe (8 seeds, competent, 30 days — the pre-System window):

| | threshold 65 (before) | threshold 50 (after) |
|---|---|---|
| volunteer events | **0** | **4** (seeds 1, 3, 5, 7) |
| max day-6 trust | 56 | 56 (unchanged — the change is the gate, not the gains) |

"Uncommon but real" — the designed rarity, now actually reachable. In-fiction
trace (seed 1): d6 `🚶 Scarlett: "I'm coming with you." (No discussion. Just
fact.)` — the beat fires with its proper narration.

Proof: `scripts/test-follower-threshold-20261011.js` — 4 pass × 3 seeds
(SEED=20261011, 7, 99): trust 49 never volunteers; trust 50 can; 'alone'-goal
villagers never volunteer even at 90; post-System check inert; cap of 2 held.

Regression: `playtests/test_social_actions.js` 29/31 (the 1 fail, "promise
stored", fails identically on the pristine tree — pre-existing);
`test-convo-engine-trust.js` 5/7 and `test-party-tactics` harness error also
fail identically pre-change. No regressions from this change.

## Sense-testing (SENSE-TESTING LAW)

`scripts/sense-trust-convos.js` — 3 full multi-turn transcripts at trust
12/38/62, read end to end:

- **Wants work.** The pantry ask ("Will you forage with me tomorrow?") develops
  over turns, commits to a plan ("East treeline, first light. Bring a pack."),
  and resolves to a recorded promise (`want: ask_favor stage=3 resolution=promised`).
- **Voice lands.** Prickly Rocco on a redundant question: "I just said — did
  you miss it?" Subject-change handled in character ("Forget I said anything.
  What did you want?").
- **Flags (documented, not in this lever):**
  1. Two NPCs opened with the *verbatim identical* pantry-ask line on the same
     day ("The pantry's nearly bare. Will you forage with me tomorrow?"). The
     shared need justifies shared content, but verbatim repetition across
     villagers reads robotic — the want line pools need per-NPC variation.
  2. `voice: null` for all three sampled villagers (personality populated,
     voice not) — the voice generator field is unpopulated.
  3. Backstory grammar glitch: "Tamika learned reading the sky counting the
     seconds…" (missing "by").
  4. `origin: '?'` on the person card while backstories name real cities
     (Columbus/Peoria/Toledo) — display field unpopulated.
  5. Closings stack 2–3 beats ("Don't forget…" + "First light…" + "Come back
     anytime") — each meaningful, but the pile-up softens the goodbye.

## Village assessment

Across the baseline the village looks like this: trust is earned the slow way,
duty by duty — the villagers who haul water, work the creek, and keep the
kitchen going are the ones who trust you by day 60 (mean 62, a third devoted).
Nobody talks their way there; words cap at 40 and in sims nobody even tries.
The fire is full of news — mostly about you giving orders. Ambitious villagers
(Gledys, Marcus…) watch you delegate and, unanswered, quietly take the garden,
then the fish crew, then the water. Nobody betrays, nobody promises, nobody
follows you into the wild — until now. With the gate at 50, Scarlett finally
says "I'm coming with you" on day 6. The village finally has a follower.

## Blanks filled vs documented

**Filled:** pre-System follower volunteering (threshold 65→50) — dead beat now
alive; proof test + before/after on identical seeds.

**Documented (not this lever):**
- Conversation-trust channel dead in sims (`rcCalls=0`): policies need real
  multi-turn conversations before the words-cap / wants / promise systems can
  be honestly measured. Tooling work for a future run.
- Betrayal 0/24 and promises 0/24: reachability unknown — needs policy
  engagement (travel with party, make promises) before any tuning call.
- 'departure'/'return' gossip seeded with `heard=[]`: expedition departures
  never become village news — small gossip-spread blank.
- Sense flags 1–5 above (want-line repetition, null voice, backstory grammar,
  null origin display, closing pile-up).
- Pre-existing test failures (fail on pristine tree): `test_social_actions`
  "promise stored", `test-convo-engine-trust` 2 fails, `test-party-tactics`
  harness error.
