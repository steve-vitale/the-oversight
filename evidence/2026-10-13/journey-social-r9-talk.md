# journey-social r9 — talk-requests, NPC-asks-YOU arc, NPC-NPC bonds (2026-10-13)

**Pre-register:** three blanks from r8. Leg question: do NPC-initiated talk requests fire
in natural play? Does a full asked→answered→referenced arc fire? Do villager pairs develop
measurable relationships, or is the village spokes-around-the-player?
Interesting finding = any blank dead or sense-broken. Seeds [505,606,707,808], DAYCAP=100
loop-days, socialite policy (competent + talks/feasts/moots), one full driveOne convo per
villager per day (r7 pattern, prefers gq:; ans: question answers taken when the NPC asks).

**Horizon note (death-aware):** villages died on seeds 505 (d66), 707 (d38), 808 (d44)
under the socialite policy; seed 606 survived to d86. Sim stopped at death, no dead-village ticking.

Script: `scripts/journey-social-r9-talk-20261013.js`
Per-seed JSON: `evidence/2026-10-13/journey-social-r9-talk-{505,606,707,808}.json`
Aggregate: `evidence/2026-10-13/journey-social-r9-talk.json`

---

## BLANK 1 — NPC-initiated talk requests: FIRES

`v.talkRequests` is created at three sites and all of them fire in natural play:

| site | code | observed |
|---|---|---|
| day-1 nudge | betrayal.js:340 `dayOneNudge()` (fires at first endDay) | answered day 2 on seeds 707 (Pablo), 808 (Marcus) |
| villagerInitiative "they come to you" | game.js:15429–15430, 16% when NPC steps to player | **33 fires** across 4 runs (3 / 18 / 8 / 4) |
| overheard pull-in | game.js:17247–17248 ("wants you to join the conversation") | writes directly (bypasses talkReason hook); folded into expiry counts |

**Reasons observed in the wild** (talkReason lines, 33 fires):
- `"Can we talk?" … sits down near you. "Just... talk. Like people used to."` (default, most common)
- `"Can we talk?" … glances around first. "People are saying things. About you. Is any of it true?"` (gossip confrontation — fires when the NPC heard negative gossip about the player; 7× on seed 606)
- `"Can we talk?" … keeps their voice low. "The stores. Have you looked at the stores? We're running thin."` (pantry-low; fired d48/d67/d72 on seed 606 when pantry dipped)

**Lifecycle:** 22 of the requests were answered (driven same/next day; answering marks
`treq.delivered=true` and the request renders as the conversation's opener, priority 1 —
conversation.js:2115–2120, ahead of wants/secrets). 32 expired via `expireTalkRequests`
(undelivered > 2 days deleted, delivered > 3 days — by design, "villagers are people, not popups").
Seed 606 example — James fires d19, d20, d21: same-villager re-fires *overwrite* the pending
entry (keyed by vid) rather than queueing; a quiet player would just see the latest one rot.

**Verdict: FIRES.** Not unfireable content. The gossip-confrontation and pantry-low reasons
are genuinely reactive (they read live game state). Watch item: re-fires overwrite rather
than queue — acceptable, but a player who ignores James for a week only ever owed him one chat.

---

## BLANK 2 — the NPC-asks-YOU arc: FIRES, with one fabricated-history miss

**Asked:** 397 bespoke questions asked across 36 qids, all answered (397/397 — the driver
answers; honest_pass was never needed). "First conversation always includes one" holds:
**41/47 first full convos (87%)** included a question (misses were language-barrier/nonverbal convos).

**Recalled:** only **q_origin** (5) and **q_trust** (5) have `recall` lines in
characterGen.json — the other 34 questions, including the other four canon ones
(plans/fears/missing/worldview), are asked and answered and **never referenced again**.
docs/CONVERSATIONS.md's "answers are remembered (conv.answered) and referenced later" is
true for 2 of 36 questions.

### Complete arc — seed 505, Nia, q_origin (asked d12 → answered d12 → referenced d16)

**Ask convo (day 12):**
- NPC: "About the pantry run — the need hasn't gone anywhere. I'm still asking."
- YOU: "About what's been happening — we never finished."
- NPC: "I just said — did you miss it?"
- YOU: "About that favor — we never finished."
- NPC: "I just told you — what else is on your mind?"
- YOU: "About what you promised..."
- NPC: "We've covered this one. Ask me something else."
- YOU: "Hold on, back up. Then what?" *(×2 — driver picked the continuer twice; harness artifact)*
- NPC: **"Where are you from — originally? Before all this."**
- YOU: "I'm from Columbus, Ohio."
- NPC: **Nods slowly. "Columbus, Ohio. I'll remember that. Everybody's from somewhere that isn't here."**
- YOU: "I'll do it."
- NPC: "Good. Where the american hazelnut grows thick, before the heat sets in. Pack and knife. We travel light."

**Recall convo (day 16) — opens with:**
- NPC: **"You told me you're from Columbus, Ohio. Do you think about it much?"**
- YOU: "Yes."
- NPC: "Right. That's what I figured — which is why I asked you, not them. Seen worse."
- *(thread resumes, winddown, "Want to come with me?" → "...Fine. This had better be worth it." — coherent recruit beat)*

**Line-by-line sense judgment:**
- The question pivots naturally out of small talk. ✓
- The answer fills `{region}` from the player's real homeRegion (Columbus, Ohio). ✓
- The react *promises memory* ("I'll remember that") and the day-16 opener *delivers it*,
  quoting the exact answer back. The reference is gated on `a_tell` only
  (conversation.js:2230) — a vague/deflected answer correctly produces no recall. ✓
- "which is why I asked you, not them" is vague filler (asked you *what*?) — mildly
  disconnected, generic-ack residue, not a fabrication. Acceptable.
- No fabricated shared history in this arc: everything the NPC claims was actually said. ✓

### The miss — q_trust recall fabricates the player's words

The q_trust recall condition is `if (c.answered.q_trust && !c.recalled.q_trust)` —
**any** answer triggers it, but the recall text is written for ONE answer:

- NPC asks "Can I trust you? I mean really."
- All 10 observed q_trust answers were `a_earn` = **"I hope to earn it."**
- Days later the NPC opens: **"You told me to watch what you do. I have been. So far, so good."**

"You told me to watch what you do" is the `a_actions` answer ("Watch what I do."), **not**
what the player said. For `a_earn` ("I hope to earn it") and `a_yes` ("Yes") players this is
a misquote — the NPC attributes words the player never spoke. Per the conversation quality
bar (no fabricated shared history), the recall needs to be answer-specific:
`a_earn` → "You said you hoped to earn it — …", `a_yes` → "You said yes…",
`a_actions` → current text. This is a real, small, fixable bug, not unfireable content.

**Verdict: FIRES — but two gaps.** (1) q_trust recall misquotes non-`a_actions` answers
(fabricated-history class). (2) 34/36 questions have no recall at all; the doc promise
"referenced later" only holds for origin + trust. The origin arc itself is the gold standard
and sense-tests clean.

---

## BLANK 3 — NPC-NPC relationship arcs: friendship FIRES, rivalry is near-dead

Bonds (`v.bonds["a|b"]`, read by `pairAffinity`) move a lot — and almost entirely upward.

**Reason histogram, 1234 bondAdd events across 4 seeds:**
lingering meal 819 (66%) · feast 326 (26%) · visit 83 (7%) · grievance 6 (0.5%)

**Top-5 pair movements (final |v|, depth −3..+3 sediment):**

seed 505 (d66):
| pair | v | depth | events | causes |
|---|---|---|---|---|
| Waimarie \| Carlos | +48 | +1 | 22 | meal 16, visit 4, feast 2 |
| Waimarie \| Lena | +37 | +1 | 18 | meal 13, feast 3, visit 2 |
| David \| Amara | +35 | +1 | 18 | meal 17, feast 1 |
| Carlos \| James | +29 | +1 | 9 | visit 6, meal 2, feast 1 |
| David \| Waimarie | +26 | +1 | 15 | meal 11, feast 4 |

seed 606 (d86, survived):
| pair | v | depth | events | causes |
|---|---|---|---|---|
| Salma \| Lena | +100 | +3 | 68 | meal 52, feast 12, visit 4 |
| David \| Salma | +76 | +3 | 43 | meal 30, feast 12, visit 1 |
| David \| Lena | +70 | +2 | 38 | meal 24, feast 11, visit 3 |
| Salma \| Olusegun | +69 | +2 | 37 | meal 32, feast 5 |
| Olusegun \| Sofia | +37 | +1 | 21 | meal 16, feast 5 |

seed 707 (d38):
| pair | v | depth | events | causes |
|---|---|---|---|---|
| Raul \| Fausto | +69 | +2 | 34 | meal 24, visit 7, feast 3 |
| James \| Lena | +31 | +1 | 15 | meal 10, feast 3, visit 2 |
| David \| Lena | +24 | +0 | 12 | meal 9, feast 2, visit 1 |
| Frieda \| Pablo | +21 | +0 | 11 | meal 10, feast 1 |
| Raul \| Pablo | +18 | +0 | 10 | meal 8, feast 2 |

seed 808 (d44):
| pair | v | depth | events | causes |
|---|---|---|---|---|
| Lena \| Sofia | +43 | +1 | 23 | meal 20, feast 3 |
| Fernando \| Debbie | +42 | +1 | 23 | meal 22, feast 1 |
| Vera \| Fernando | +38 | +1 | 20 | meal 18, feast 2 |
| Vera \| Sofia | +31 | +1 | 11 | meal 5, visit 5, feast 1 |
| James \| Lena | +30 | +1 | 16 | meal 11, feast 4, visit 1 |

**Rivalry:** 6 grievance events (−7 each) total, all via `recordGrievance` (betrayal.js:185):
d23 David→James, d24 Hana→James (505); d24 Sofia→Marcus, d33 David→Marcus (606);
d28 David→Vera, d37 James→Claudia (808). James and David and Marcus recur as friction
points — the *people* are consistent — but −7 against +50–130 of meal-warmth is noise.
Conflicts with tension (e.g. 707's David|James tension 30) do **not** themselves move bonds;
only recorded grievances do, and grievances barely fire in cooperative play.
`npcMootTick` ticked 235× and convened **0** NPC-NPC moots (no NPC-accused open cases —
expected for a socialite run; the moot path needs the justice leg).

**Verdict: friendship FIRES (strongly — pairs hit +100/depth+3 by day 86), rivalry is
near-dead.** The village is not spokes-around-the-player: NPCs befriend each other through
shared meals/feasts/visits with per-pair causes and sediment. But docs/CONVERSATIONS.md's
"conflict fallout (favoritism noticed, old wounds unfold)" has no measurable teeth in
natural cooperative play — negative movement is 0.5% of events and gets swamped.
Needs work if Steve wants real rivalries: tension should bleed into bonds, not only
recorded grievances.

---

## Per-blank verdicts

| blank | verdict |
|---|---|
| 1 — NPC-initiated talk requests | **FIRES** — 33 natural fires, 3 reactive reasons, day-1 nudge + pull-in also live; expiry by design |
| 2 — NPC-asks-YOU arc | **FIRES with gaps** — complete asked→answered→referenced arc captured and sense-clean for q_origin; q_trust recall **misquotes** non-`a_actions` answers (fabricated-history class, fixable); 34/36 questions never referenced later |
| 3 — NPC-NPC relationship arcs | **Friendship FIRES, rivalry near-dead** — bonds reach +100/depth+3 with clear causes (meals/feasts/visits); only 6/1234 events negative; conflict fallout unfelt |

**Caveats:** driver answers every question (a cooperative socialite, not a real player's
selectivity); q_trust answers were all `a_earn` because the driver takes the first
non-opt-out choice — other aids' recalls are unobserved. No fixes committed (probe only).
