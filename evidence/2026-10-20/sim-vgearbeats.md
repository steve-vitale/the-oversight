# sim-vgearbeats — voice for the veteran channel (flesh-out loop, 2026-10-20, arm sim-vgearbeats)

**JUDGED GO.** Run: fleshout-20261020T2015Z (proof + corpus + sense). Axis: scale-onramp (the blocking axis).
POLICY-SIDE NARRATION LEVER — zero src/js changes. New file scripts/policies/vgearbeats.js (default OFF, VGEARBEATS=1, composes OUTSIDE the landed VGEAR layer).

Canon: docs/CANON.md (no-silent-actions — the blank), docs/MONSTER-WAVES.md (wave-4 roster, readiness gate, VILLAGER XP LAW).

## The blank (sim-villagergear named next #699)

The VGEAR layer's own beats are invisible in fiction: no beat marks a weapon donation to the armory, a fighter-staging invite, or a veteran scholar's yield-hold. By Steve's no-silent-actions rule the village can't see the arming happen — the companions just show up armed. This run fills the blank with voice, and nothing else.

## The layer (scripts/policies/vgearbeats.js, VGEARBEATS=1, default OFF)

Narration-only wrapper, OUTSIDE the VGEAR wrapper: `withVGearBeats(VG.vgearLead/vgearBelong)`. Keyed on the layer's OWN counters (ctx.vgDonations, ctx.vgInvitesOk, ctx.vgYields) — it OBSERVES, never alters: pure game reads + Game.say lines only. Observation machinery is call-through (a donateWeapon hook capturing the weapon's display name; the invite vid comes from the layer's own ctx._vgStagePick; the yield companion from a pre-turn engagedCompanions snapshot) — zero behavior change, zero RNG draws, zero state writes (Game.say writes Game.log, the text stream, never Game.state).

Three beats, deterministic line selection (FNV-1a hash of the stretch key — the kinresolve-det lesson; NO Math.random in the narration path):

1. **Donation** — "You lay the {weapon} on the armory rack. The village arms — one edge at a time." / "The {weapon} joins the armory. Yours, given to whoever needs it next." Names the actual weapon (hook-captured).
2. **Invite** — "You ask {N} to stand ready. When the heralds come, you want them beside you." / "{N} agrees to stand ready — a nod, nothing more. The fire pops." Names the actual villager.
3. **Yield** — "You hold your strike — {N} has the angle. Let them finish it." / "You lower your weapon and wait. This kill belongs to {N}." Names the engaged companion.

Dedupe (the raidgarrison lesson — sim-raidgarrison 2026-10-20: the muster beat fired 24x because the dedupe key included the day):
- One beat per event type per day max (rate cap).
- The dedupe key is the STRETCH, never the day: donation → the arming-drive epoch (armory below target; restock-then-deplete opens a new epoch); invite → (staging episode, villager); yield → the fight (crisis id). One beat per stretch, then quiet. Same-stretch repeat = guardrail violation.

DESIGN CALLS (Steve 2026-10-07 — documented, he can overrule):
1. Coverage is measured per STRETCH (epochs-with-donations / (episode,vid) pairs / fights-with-yield), because the beats are per-stretch by the dedupe requirement. Raw per-occurrence ratios are reported alongside for transparency.
2. The engine already says generic verb lines ("Left your X in the armory", "🤝 N joins your party") — these beats add the LAYER's fiction (the drive, the staging, the hold), not a duplicate confirm. In the transcript they read as confirm-then-beat; acceptable (sense section).
3. Voice is second-person scholar + named villagers/weapons, matching the game's SAY voice.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the corpus)

**PRIMARY:** ≥75% of arming events get a visible beat — operationalized per design call #1 as stretch coverage: (epochs-with-donations beaten + (episode,vid) pairs beaten + fights-with-yield beaten) / (stretches with events). A miss is NO-GO, never re-scored (§14).
**GUARDRAILS (all must hold):** zero same-stretch repeats; behavior-neutral det-gate (per-day trajectory hashes byte-identical vs VGEAR-only on paired seeds); no RNG draws in narration; no game-state writes; say-stream visibility (every counted beat appears in the say stream); sense PASS.
**Corpus:** 4 fresh seeds (64023–64026 — filename-unused in evidence/ verified before the sweep) × {leadfeast, belongfeast} × {vgear (VGEAR=1), vbeats (VGEAR=1+VGEARBEATS=1)} = 16 runs, 180d death-aware, the w5doormeasure substrate env (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 KILLDISC unset, SEATDRIVE=0, VGEAR=1 both arms; VETREL/REPOSITION unset → inert). The 8 vbeats runs are the coverage corpus; the 8 vgear runs are the det-gate pairs.
**Horizon:** 180d death-aware (dead villages stop, +10d tail) — matches the vgear pilot (wave-4 kills happen in the door window).
**§15:** before/after is VGEAR-only vs VGEAR+beats on identical seeds — the instrument is the per-seed JSON corpus + trajectory hashes (no panel; narration-only layer, no balance claim).
**KILL PROTOCOL:** NO-GO → layer deleted zero-trace; instruments + evidence land with the verdict.
**SENSE-TESTING:** re-run the richest beats seed with say restored; read the full window around the first donation/invite beats; judge whether the beats read like people; sample lines in evidence.

## Proof

scripts/test-vgearbeats.js — RED→GREEN on the layer (RED phase: layer absent → exit 1; kill-protocol INFO-SKIP if deleted with VGEARBEATS_KILLED=1):
- A1 gate honesty (both flags unset → pure delegation: no _vgBeats ctx keys, no hook install, no say); A2 beats require VGEAR (VGEARBEATS=1 + VGEAR unset → silent).
- B1 donation beat names the weapon; B2 same-epoch donation → no repeat (the raidgarrison lesson); B3 new epoch (restock→deplete) → beats again; B4 one donation beat/day max; B5 failed donation (counter unmoved) → no beat.
- C1 invite beat names the villager; C2 same (episode,vid) → no repeat; C3 one invite beat/day max; C4 new staging episode → same villager beats again.
- D1 yield beat names the companion; D2 same fight second yield → no repeat; D3 new fight → beats again; D4 one yield beat/day max across fights.
- E1 no RNG draws (Math.random poisoned → all three beats still fire); E2 no game-state writes (Game.state JSON byte-identical across beats); E2b deterministic line selection (same key → same line, both variants reachable).
- F det-gate (real harness, VGEAR=1): beats on/off per-day trajectory hashes byte-identical on s711 + s712 (60d); beats-on deterministic across re-runs.
- **21/21 PASS, 0 fail** (final run; an earlier run caught a real bug — `x | -1` is -1 for every x, so the day-cap never engaged — fixed via explicit dayCapped comparison, then B4/C3/D4 green).
- `node scripts/check.js --quick` after the change: 253 passed, 4 failed — all 4 pre-existing and unrelated (measurement-workflow neutrality-proof staleness; phone-frame-proof browser-receipt staleness on index.html etc.). This change adds 4 new files under scripts/ only; no src/js, no index.html — it cannot affect either failing area.

## Results (JUDGED — corpus complete, 8 vgear + 8 vbeats)

**PRIMARY: GO — stretch coverage 1.000 over 43 stretches (bar ≥ 0.75).**
- Donation: 15/15 epochs-with-donations beaten.
- Invite: 28/28 (episode,vid) pairs beaten.
- Yield: 0/0 — no yield events in the corpus (the yield conditions are rare in sims; the beat is unit-proven D1–D4, same caveat the vgear evidence carried for the yield mechanic itself).
- Occurrence-level (transparency, not the judge): 0.439 (43 beats / 98 layer events) — the gap is the per-stretch dedupe working as required (multi-donation epochs, same-day double invites).

**GUARDRAILS — all pass:**
- Zero same-stretch repeats: every firedDon epoch count == 1; every firedInv key unique; yield beats land on distinct days. PASS.
- Behavior-neutral det-gate: 8/8 paired seeds trajectory-identical (per-day dayHash). PASS.
- No RNG draws in narration (E1), no game-state writes (E2). PASS.
- Say-stream visibility: 16/16 runs beatLinesSay == beats counters; beatErrors == 0. PASS.
- Sense: PASS (below).

**Wall numbers (vgear vs vbeats — byte-identical behavior):** national 3→3; table 5→5; wins 0→0; wave4 6→6; wave5 0→0; w4villagerKills 2→2; median game-days 117→117; death causes (vbeats arm): combat 197, villager-combat 56, monster 17, expedition 12, sickness 9, starvation 8. The narration layer moves nothing — as designed.

**TELEMETRY DEVIATION CHECK:** `telemetry-check.js` fired one LOUD: "wins disappeared: baseline 16 → current 0". INVESTIGATED — regime artifact, not a bug: the scale-wall.json baseline's own `_regime` block says "DO NOT compare pre-seat substrates against this baseline — wins are structurally ~0 there" (baseline is the SEATDRIVE=1 winseat regime, ~100% wins; this corpus is SEATDRIVE=0 pre-seat). Baseline NOT rolled forward. Verdict: explained.

## Village assessment

Eight villages, all lost (median 117 game-days), on the pre-seat substrate with the VGEAR layer arming them. The beats make the arming visible for the first time: the armory drive cycles through 1–4 epochs per run (donations 3–13/run — the scholar keeps feeding spares as the engine's villagerGearDay distributes them), and the staging episode stands up 3–10 invites once wave-4 unlocks. What the beats reveal: the drive is STEADY, not spiky — a slow drip of edges into village hands across ~100 days, which is why the companions "just show up armed" felt so invisible before. The staging reads as the village's answer to the heralds: Luis, Tashi, Priya, Nora, Ignacio, Adaeze — named people asked to stand ready, not stat-bags.

Who died and why: combat dominates (197 scholar-side, 56 villager-combat) — the substrate's known endgame profile; starvation 8 (low); no new death modes. Two villager wave-4 kills landed (s64023 leadfeast, s64025 leadfeast — the VGEAR channel working). The beats change nothing about any of this — the villages live and die exactly as the VGEAR-only runs do, now with the arming narrated.

The blank is filled: donations, invites, and (when they occur) yield-holds now have voice. The yield-hold remains unobserved in sim fiction (0 corpus events) — documented, not a verdict change.

## Sense (SENSE-TESTING LAW)

Re-ran s64024/leadfeast (richest: 3 donation epochs + 9 invite pairs) with say restored + sysSay audible; wrote evidence/2026-10-20/vgearbeats-transcripts/leadfeast-s64024.txt (windows d30–34, d84–88).

- The d32 donation beat lands in a real moment: the scholar strips a dead traveler's pack ("Taken: Work Gloves x1, Bow x1, Sharpened stick x1... Your hands know what they did. (+8 trauma)"), the engine confirms "Left your Sharpened stick in the armory. Anyone who needs it can take it.", and the layer beats: "The Sharpened stick joins the armory. Yours, given to whoever needs it next." Confirm-then-beat — a mild echo, but the second sentence is new fiction (the giving), not a restatement. Reads like a person, one beat at a time.
- The d86 invite window: two villagers accept the same day — "🤝 Tashi joins your party. '...Fine. This had better be worth it.'" / "🤝 Luis joins your party. 'Okay. Yeah. I trust you.'" — and the layer beats once (the 1/day cap): "You ask Luis to stand ready. When the heralds come, you want them beside you." Tashi's staging stays silent that day (the required trade-off). The beat follows the acceptance — reads as the ask remembered after the yes. Coherent.
- No repeats anywhere in either window — the stretch dedupe holds in fiction, not just in ctx.
- Deterministic variants both surface across the corpus ("You lay the Hatchet on the armory rack..." / "The Hatchet joins the armory..."; "You ask Nora..." / "Priya agrees to stand ready — a nod, nothing more.").
- Caveat: the yield beat has no in-fiction observation this run (0 yield events across 16 runs — the scholar is rarely a veteran AND in a wave-4 fight with an engaged companion at ≤20% in sims). Unit-proven (D1–D4); in-fiction yield voice remains unobserved, same as the vgear evidence noted for the mechanic.

Verdict on sense: PASS. The beats read like people doing the arming, not systems announcing it.

## Metric review (§14 — binding, never re-scored)

Primary judged GO on the pre-registered stretch operationalization: 1.000 ≥ 0.75 over 43 stretches. No re-scoring was needed. One metric-design note for the NEXT narration run: the occurrence-level ratio (0.439) will always trail the stretch coverage by construction — the dedupe requirement forces it. If a future arm wants occurrence-level ≥75%, the dedupe requirement itself must be relaxed (Steve's call) — the two cannot both hold when stretches contain multiple events. Proposed for the next run, not applied here.

## Named nexts

1. Yield-hold voice unobserved in sim fiction (0 yield events in 16 runs). The beat is unit-proven; a targeted scenario (veteran scholar + staged companion + wave-4 fight) could put it in front of eyes.
2. Engine-line echo: the donation beat always lands adjacent to the engine's "Left your X in the armory" confirm. Currently reads as confirm-then-beat; if Steve finds it stuttery on his phone, the beat's first sentence could be cut to just the fiction clause.
3. Same-day double invites: the 1/day cap silences the second villager's staging (observed: Tashi on d86). By requirement; flag only if it reads wrong in play.
4. The scale wall stands: national 3→3, wins 0→0 on this substrate. This arm is narration-only by design — the wall needs a different lever next.

## Convergence

GO on the pre-registered set (stretch coverage 1.000, all guardrails green, det-gate 8/8). The layer is behavior-neutral by construction and measurement — it narrates the proven VGEAR channel without touching it. Axis scale-onramp remains not-converged (the wall is untouched by design here); the arm's contribution is fiction legibility for the veteran channel, which the axis needs for the w5 door to read as earned. The layer stays default-OFF (VGEARBEATS=1 to enable), pending ship.
