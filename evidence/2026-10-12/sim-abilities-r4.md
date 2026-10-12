# Long-run sim — LEVER 9 ROUND 4: trial deed grants (2026-10-12)

Canon read first: docs/CANON.md (Human skills ≠ alien abilities lane rule),
docs/SYSTEMS.md (stale 2026-10-05 — verified against code). Builds on
sim-abilities-r3.md (r3: trial cadence retune; "synergies 4/51 reachable, legs
are the scarcity; evolution decoration; this lever is spent").

## The blank (confirmed real, not invented)

`src/data/abilities.json` declares 9 abilities with `unlock.type === 'trial'`
and named trials (`win_a_fight`, `intimidate_someone`, `hear_10_rumors`,
`stop_a_fight`, `discover_5_locations`, `catch_3_lies`,
`take_50_damage_in_one_fight`; plus `iron_stomach` / `adrenaline_surge` with
only the detail strings "Trial of Hunger/Blood survived"). **No code path
ever granted any of them to the player** — `unlock.trial` was read nowhere.
The unlock ladder's "trials" rung was 9 data-declared abilities deep and
entirely decorative. (Occupations grant a few as background abilities —
dispatcher_911 → eagle_eye, firefighter/soldier → adrenaline_control,
programmer → evidence_board — but the System itself never granted one.)

Same class of dead rung, documented not filled: 5 `practice`-type abilities
(stalk, blood_trail, ambush, war_cry, haymaker — villager-kit-only) and the
`discovery`-type soft_step ("Traverse 20 tiles undetected"). Their triggers
are ambiguous; inventing practice conditions is a bigger design call.

## The lever: trial deed grants (exact numbers)

New module `src/js/trial-deeds.js` (self-attaching mixin, @ontology header,
84/84 systems validated). The player's deed-earned System grants — the
mirror of the villager deed-XP grant path (`villagerGainXP` /
`NPC_ABILITY_KITS`, Steve 2026-10-09): **the data names the trial, the engine
wires the deed. Same deeds → same grants, no RNG.**

Deed → ability, with thresholds:
- `win_a_fight` ×1 → adrenaline_control (tbEnd, player in fight, alive)
- `take_50_damage_in_one_fight` (per-fight, ≥50 via new `_taken` ledger in
  tbDamage, player survives) → trade_of_blows
- `blood_trial` (end fight ≤25% max HP, alive — the honest reading of
  "Trial of Blood survived") → adrenaline_surge
- `hunger_trial` ×3 (eat `safe === false` meals with no poisoning — the honest
  reading of "Trial of Hunger survived") → iron_stomach
- `intimidate_someone` ×1 → intimidating_presence (intimidate returns
  yielded/fled)
- `hear_10_rumors` ×10 → gossip_network (player "catches fragments by the
  fire" in spreadGossip)
- `stop_a_fight` ×1 → peacemaker (mediateConflict resolves)
- `discover_5_locations` ×5 → eagle_eye (new distinct 'visited' tile in
  markSeen)
- `catch_3_lies` ×3 → evidence_board (confession outcomes in truth.js, both
  confrontation paths)

Grant rules (same as the villager mirror): deeds accrue from day one; grants
wait for `systemArrived` (day 7) — `checkPendingTrialDeeds()` fires crossed
thresholds on arrival. Idempotent (`hasAbility` covers background too, so a
firefighter never gets a duplicate win_a_fight grant). **Six-slot law holds:**
full slots = honest System refusal copy naming the slots, never overflow.
Priced gifts pay `abilityOnAcquire` costs; every grant recomputes synergies.
Human skills never granted — the pool is `unlock.type === 'trial'`, alien-only.

Design calls (Steve 2026-10-07: make the call, document it, he can overrule):
hunger_trial → 3 suspect meals (not 1 — eating one bad meal is an accident;
three is a gut), blood_trial → ≤25% HP (not just "survived" — the trial is
*almost dying*). Arena/contest fights route through tbEnd, so they count —
one choke point, no special-casing.

## Proof

`scripts/test-trial-deeds-20261012.js`: **62/62 green.** Mapping for all 9
trials; thresholds fire (2 ≠ 3 lies, 9 ≠ 10 rumors); pre-arrival counting
with no grant, pending pass fires on arrival; idempotent; full-slots refusal
names the slots (6/6 stays 6/6); background-held trial ability never
duplicates; markSeen re-visit doesn't double-count; all 9 hook sites asserted
against source; recomputeActiveSynergies runs on grant; grant narration
sense-read (System voice, names the deed, no "undefined"); 9 deeds fill
exactly 6 slots, the 7th refused honestly.

Regressions: test-synergy-hygiene-20261011 9/9, test-ability-evolution 26/26,
test-trial-cadence-20261011 23/23, ontology 84/84.

## Before/after (identical seeds, god policy, 200-day horizon, 12 seeds)

| Metric | Before (master) | After | Δ |
|---|---|---|---|
| Mean abilities held | 3.58 | **5.58** | **+2.00** |
| Max abilities | 6 | 6 | — |
| Unique synergies discovered | 4 | **6** | +2: clean_kill, sees_the_weave |
| Total synergy discoveries | 11 | 10 | noise |
| Runs with ≥1 synergy | 9/12 | 7/12 | noise |
| Mean synergy attempts | 2.83 | 2.67 | — |
| Mean resonance | 99.4 | 130.1 | +31% |
| Max resonance | 187 | 317 | +70% |
| Trial offers/completes | 111 / 26 | 91 / 28 | noise |
| Trial gifts | 25 | 14 | slots fill from deeds first (see below) |
| Median days survived | 71 | 67 | noise |
| Wave reach | 1:1 2:3 3:8 | 1:1 2:6 3:5 | noise |
| Villager abilities | 539 | 511 | noise |

Per-seed deed evidence: gossip_network in 11/12 runs (fire fragments are
thick), iron_stomach in 6/12 (suspect meals common), eagle_eye in 5/12,
adrenaline_control in 6/12 (first fight win), trade_of_blows in 3/12.
peacemaker, evidence_board, intimidating_presence never fired — the god
policy never mediates, never confronts lies, never intimidates. Those are
policy blind spots, not broken rungs: a real player does all three.

The trial-gift drop (25→14) is the 6-slot economy working honestly: deed
grants fill slots first, so audience-trial gifts get refused more. Slots are
now a real economy (mean 5.58 held) instead of capacity-rich decoration.

## Reachability verdict (updated vs r3)

- **Trial abilities: 9/9 now reachable** (was 0/9). The ladder's trials rung
  is live: deeds → System grants, narrated, slot-honest.
- **Synergies: 6 of 51 seen in competent sims** (was 4). clean_kill
  (dead_aim+tracker path) and sees_the_weave (eagle_eye+third_eye) are new —
  both were structurally blocked behind trial legs. 45 remain unseen; the
  practice-type legs (ambush/stalk/blood_trail/war_cry/haymaker) still gate
  the_long_con entirely and several paths — documented, not this run.
- **6-slot economy: filling.** Mean 5.58, max 6, refusals honest. Not full —
  slots 5–6 arrive with integ 65–80, which long runs reach; the economy now
  bites (deeds compete with trial gifts for the same slots).
- **Evolution: NOT decoration anymore.** r3's verdict predates the 6/12 XP
  retune (2026-10-11): a 60-day probe staged green_thumb's evolution choice
  (sovereign/hearth). It stages at L3; sims reach L3 now. The choice waits on
  the player by design (never auto-granted) — sims don't pick, so none
  complete in harness. Real-player territory.
- **Unlock ladder: all rungs live.** knack (slot 1) → day-7 gift →
  trial deeds (new) → audience trials → contest prize lanes → reactive offers
  → evolution choices at L3 → godhood builds.

## Villagers act like people? (trial-adjacent, sense read)

Transcript read (25-day run, seed 4242): the pending pass fires pre-arrival
deeds at the exact moment of arrival — "◈ TRIAL RECOGNIZED — the System has
been watching. Ten rumors through the fire-smoke. You LISTEN..." lands
*before* "🌟 THE SKY SPLITS OPEN" — the System arrives, looks at what you've
done, and grants. Coherent. Villager grants read human: "◈ THE SYSTEM has
been watching Felicia — 4 careful work. It offers Steady Hands. Earned, not
given." alongside "Seif is showing Lena how to tie a snare. Hands patient."
and gossip fragments with distortion tails. No robotic leakage.

New blank documented: **the village has no reaction beat to the player's
trial grants** — same class as r3's audience-trial finding. The grant
narrates to the room (this.say), but no villager congratulates, gossips
about, or gains notability from your trial abilities. Lever 3/5 territory,
not built here (one lever per run).

## Village assessment (plain words)

Twelve villages, all village-lost (median 67 days). The System's deed-watch
is visible now: scholars come home from fights with Adrenaline Control,
from suspect meals with Iron Stomach, from the fire with Gossip Network —
seed 7's scholar ran 6 abilities into cornered_fury territory (rage +
iron_stomach, unstoppable's first path warming). Who thrived: foragers who
ate what they shouldn't and lived (iron_stomach L3 in 5 runs — the gut is
a build now). Who died: everyone, to combat and the food wall, same as r3 —
the new abilities are utility/survival, not power; survival is within noise
of baseline, which is honest for this lever (it fills the ladder, it doesn't
retune combat). The binding mid-game constraint stays food (per the pacing
law), not slots.

## Blanks filled / documented

FILLED: 9 trial-type abilities wired to real deed sites (module + 9 hook
sites + pending pass); tbDamage player `_taken` ledger (mirrors the villager
one); evolution reachability re-verified live (stages at L3 — r3's
"decoration" verdict retired).
DOCUMENTED: practice-type (5) + discovery soft_step still unwired (ambiguous
triggers, bigger design call); occupation background grants blur the
human≠alien lane (dispatcher_911 → eagle_eye as background — pre-existing,
flagged not fixed); villager reaction beat to player trial grants missing
(lever 3/5); peacemaker/evidence_board/intimidating_presence untested by the
god policy (needs a mediating/confronting/intimidating policy or a real
player).
