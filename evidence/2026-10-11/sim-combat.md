# Long-run sim — lever 1: combat & death share (2026-10-11)

## Lever played
**Monster counter discovery ("taught at haven" channel).** `counterTeachable()` in
`src/js/game.js`: the village-slain threshold that unlocks the askAbout
'beasttricks' topic went from **2+ slain of a type → 1+ slain of a type**.
Exact diff: `if ((slain[mdef.id] || 0) >= 2)` → `>= 1`, plus the three
comments that documented the old threshold. Nothing else changed.

**Why this lever, and not a monster nerf (5-question evaluation):**
1. **Real-world anchor:** if the village has killed one of a beast type, someone at
   the fire has seen it die and has a theory. "Nobody's figured out anything clever
   yet" is false after the first kill.
2. **What breaks if wrong:** too free → counters trivialize waves 1–2. Guardrails hold:
   the player must still ASK (topic only appears when teachable), the village must
   still KILL one first (53% wave-2 loss rate — the kill is earned), knowledge gates
   stay ("if you don't know, it doesn't show").
3. **What the sim says:** 20 seeds × 200 days, competent policy, identical seeds —
   counter discoveries 75 → 166 (+121%), wave-3 unlocks 1/20 → 5/20 runs,
   wave-3 fights 0 → 9, total deaths 216 → 192 (−11%). No regressions.
4. **What it feels like:** the village learns together — "the village is the
   protagonist." After the first hushwolf dies, someone at the fire can teach you
   the trick. The teaching line is in-character (see transcript below).
5. **Does it respect the fiction:** yes — the channel is literally named "the village
   learns together" and Steve's 2026-10-10 ruling says villager experiences count.

**Why NOT retuning monster damage:** the sims validate the BALANCING.md anchors.
Wave-1 duels: 39% loss rate at median 56 HP entry — consistent with "at 67 HP: 2/10
survive." Wave-2: 53% loss — the design says "a genuine step up, not reskins."
Nerfing would contradict Steve's explicit wave identities. The combat death share
(65% player / 78% villager) is the designed game, not a malfunction.

## Before / after (identical seeds 1–20, competent policy, 200 days)

| metric | before (threshold 2) | after (threshold 1) |
|---|---|---|
| counter discoveries | 75 | **166** (+121%) |
| wave-3 unlocked (runs) | 1/20 | **5/20** |
| wave-3 fought (runs) | 1/20 | **3/20** |
| wave-3 fights (won/routed/lost) | 0 | 9 (2/3/4) |
| total deaths | 216 | **192** (−11%) |
| player deaths | 149 | 145 |
| villager deaths | 67 | **47** (−30%) |
| player death share | combat 56%, starvation 43% | combat 70%, starvation 28% |
| wave-1 fight loss rate | 69/171 (40%) | 81/190 (43%) |
| wave-2 fight loss rate | 33/61 (54%) | 30/63 (48%) |
| median survival (days) | 67 | 68 |
| runs survived 200d | 3 | 4 |
| wins / table | 0 / 0 | 0 / 0 |
| scale reach | 20/20 village | 20/20 village |

'taught' discoveries (5-seed probe): 9 → 31. 'trick' (accidental): 10 → 8 (flat).
The lever moves exactly the channel it targets.

## Reachability verdict (combat content)
- **Wave 1:** 20/20 runs fight it blow-by-blow. 171–190 fights/sweep. Reachable. ✅
- **Wave 2:** 14–15/20 runs. 61–63 fights/sweep. Reachable. ✅
- **Wave 3:** 1/20 → 3/20 runs fight it (9 fights: spool, callback, focus_group seen).
  Barely reachable — the wave-2 ledger bar (5 pts, kills only) is the blocker, and
  that bar is **lever 2's** (wave unlock pacing), not mine. Reported, not touched. ⚠️
- **Waves 4–5:** 0/20. Not reachable in sims. Same lever-2 note. ❌
- **Counters:** all 30 wave 1–2 counters structurally present (52/52 structural
  checks green); discovery channels 1 (trick) and 2 (taught) both fire in sims;
  channel 3 (codex hint) surfaces on slay. Wave 3–5 counter-less by design. ✅
- **Traps:** 0 crafted, 0 looted in 40 runs — the competent policy never crafts or
  buys traps. Trap *content* exists (deadfall/box/minnow/pit recipes); the sim
  policy doesn't use it. Documented, not fixed (policy blank).
- **Young-link succession:** 0 notes in 40 runs — no inter-village links formed
  (scale stuck at 'village' 40/40), so the grace/renegotiation path never fires
  in sims. The code path exists (hierarchy.js successionCrisis); unreachable in
  sims because regional+ never happens. Documented.
- **Four-realm formation:** realmMax 0/40 runs. Same scale note. ❌
- **Win flag:** 0/40. The deed gate needs waves 3–5; blocked upstream. ❌

## Village assessment (plain words)
The village endures but never thrives. Scholars die every ~8 days (149–164 player
deaths / 20 runs) — two-thirds in honest duels they entered hurt (median 56 HP
vs wave-1, 77 HP vs wave-2), one-third to the overnight starvation spiral. The
mantle passes, the village mourns, a new face picks up the journal — that beat is
beautiful (see transcript). But nobody ever gets powerful: 0 wins, 0 regionals,
wave-3 seen in 3/20 runs. The deaths are SENSIBLE (the duel math matches the
BALANCING.md anchors); what's missing is the climb. The counter lever opens the
wave-3 door a crack (1→5 unlocks). The rest of the climb is lever 2's bar and
lever 8's scale work.

Who thrived: villages that survived to 200d (3–4/20) did it on wave-1 ledger
farming + pantry discipline, not on power. Who died: scholars who met wave-2
nocturnals at 77 HP with no armor and no counters — the moderator alone took 12.

## Sense-testing (transcripts read, not just counts)
**Moderator duel (played, not asserted):** the mute mechanic is real — "🚫 STRIKE
IS MUTED inside the suppression field... (PRIOR VIOLATIONS: 1 — its Notices hit +3
harder." Strike-spam dies in 7 rounds. The counter ('wait') is the honest answer.
**Mantle transfer after the death:** "🕯️ Darius Bauer is dead — combat. The village
stops. Somebody screams. Somebody else starts digging. Ursula picks up the journal.
Their hands shake. Then they open it, and keep writing. 🌟 'MANTLE TRANSFER
DETECTED. ...Oh! New face! Same job! We hardly noticed. (That is a lie. We
noticed. The audience CRIED.)' 📖 The Codex turns a page: Darius Bauer, 1 day."
Sensical, consequential, well-written.
**Beast-tricks teaching (after lever):** "A person, maybe 40s leans in, voice low.
'Here's what we figured out about a hovering shape with a hammer, drawing a circle
on the ground around itself. Wait — silence is a verb it can't moderate...'"
Knowledge-gated descriptor, in-character voice, journal entry fires. ✅
**Mirror stag duel:** telegraphs honest ("MOVE SIDWAYS"), codex learns
("Codex: Confrontation"), 34-damage charge through no armor. Scary, fair. ✅
**Villager behavior flags (documented, not fixed — lever 3/4 territory):**
- askAbout 'village' returns the VERBATIM line "Honestly? holding together,
  somehow." for different villagers on different days — canned repetition.
- Agency XP tracks (tracking/survival/bravery) read 0/0/0 for all six sampled
  villagers at day 30 — the differentiation system isn't accumulating in sims.
- Grief lines ARE varied and good ("David eats apart from the others tonight.
  Marta doesn't look up. The fire feels smaller.").
- Language barrier works ("Marta speaks only Polish. No shared words at all —
  just eyes, hands, and patience.").

## Blanks filled vs documented
**Filled:**
- Death-cause telemetry: the #1 combat-lever metric didn't exist as an aggregate.
  Built `scripts/sweep-combat-lever.js` (death buckets, per-wave outcomes, timing
  bands, counters, traps, succession, trauma, slots) + `tele('craft')`,
  `tele('counter_discovered')`, combat_start/end enrichment (pack, entry HP).
- Policy fought naked: `gearUp()` (equip best weapon/armor owned) in competent.js.
- Policy never asked about beast tricks: asks when `counterTeachable()`.
- The lever itself: 2+ → 1+ slain threshold.
**Documented (not fixed):** wave-3/4/5 + regional + win unreachable (lever 2/8);
trap acquisition 0/40 runs (policy never crafts); young-link succession 0/40
(scale never leaves village); villager dialogue repetition + zero agency XP
(lever 3/4); "vesting" has no code referent — measured as ability-slot unlocks
(mean 6 slots, 2.5–2.9 abilities held) and noted the ambiguity.

## Tests & commits
- `scripts/test-counter-teach-threshold-20261011.js` — 9/9 green (unit + sweep delta).
- `scripts/test-structural-counters-20261011.js` — 52/52 green (no regression).
- `scripts/test-counter-effect-20261011.js` — duel probe (informational).
- `scripts/sense-combat-20261011.js`, `scripts/sense-villagers-20261011.js`,
  `scripts/probe-fights-20261011.js` — sense/probe tooling.
- Sweep evidence: `sweep-out/combat-lever-before.json`, `sweep-out/combat-lever-after.json`
  (also `combat-lever-baseline.json`, `combat-lever-geared.json` — superseded).
- [needs-eyes]: NO — tuning-number change, no feel/combat/UI change. Steve can
  overrule the 2→1 call.
