# journey-deepening r183 — deepening leg (days 40–80), Lane A

- **Run:** `playtest-loop-a-20261111T2045Z`, scheduled Wed 2026-11-11 14:45 CST (20:45 UTC). **TIMED OUT at the 2h cron deadline** — after-panel, run note, gate, commit, release, rotation advance, and lock cleanup were completed by the main-session adoption (see `journey-deepening-r183-adoption.md`).
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advance 2→3 done by the adoption after landing.
- **Base:** local master `d33ca69f9`. Origin divergence note: local master is ahead of origin/master (unpushed loop landings) — no reconciliation, no merge of origin/master, no push; the ship loop / main session owns it.
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening`.
- **Policy:** competent. Seeds: fresh **100018–100025** (8 seeds); smoke 100026. Freshness verified in the prereg (0 hits in all `evidence/` `*.md`, `scripts/`, filenames).
- **Horizon:** DAYCAP=100 (mid-game, waves 2–3; MEASUREMENT §10). CONVO_DAYS [45, 60, 80].
- **Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability tuning until the fight-play census lands. This run touches dialogue-variety code only, so the gate does not bind it (same as r129/r130).

## Q1 (PRIMARY) — PLACE-LESSON FRAME VARIETY

**The defect, carried from r130.** The place-lesson line (`src/js/villager-agency.js` ~1175) was ONE fixed frame — `"${taughtPlace} — I'll show you on the map sometime. It's real."` — with only the place name swapped. In r130's before-panel, Brooklyn (seed 100011, d45) spoke it twice in one sitting with two different places; the metric read VARIED (maxSameFrame 2 < 3) so no fix was built. Same defect class r125 fixed for plants (7× in one sitting).

**Before-panel: NO-FRAMES** — 0 place frames on the whole 8-seed panel (r129 shape, not r130's 2 frames). Per the pre-registered decision, this does NOT block the fix: r130 already proved the defect in the wild, and the fix is the carried r125-class repair. The proof test proves the rotation mechanism; the after-panel measures whether fired frames vary.

**The fix (built this run).** New `convoTeachPlaceLine(vid, placeName)` in `src/js/villager-agency.js`, mirroring `convoTeachPlantLine` (r125): four frames, picked by frame-index rotation on the villager's convo state (`c.teachPlaceFramesUsed` — a separate ledger key from the plant one, so the two rotations never interfere); an unused frame is picked at random, the pool resets only once all four have been used. Falls back to a random frame when the convo state is unavailable. The place name stays in every frame — the lesson stays specific. The four frames are exactly the wordings the r129/r130 analyzer already normalizes (`PLACE_FRAME_PATTERNS`):
- `"${place} — trace it with your finger. That's where it is, and it's real."`
- `"${place} — I'll mark it on your map when we're back. It's real, I've stood there."`
- `"${place} — walk it with me sometime and you'll know the ground. It's real."`
- `"${place} — remember the shape of it. It's real, and it's worth knowing."`

The pre-fix frame is retired. Call site: `villager-agency.js` ~1175 (`else if (taughtPlace)`) calls `this.convoTeachPlaceLine(vid, taughtPlace)`. No other line changes; the places pool (`expeditionSign`, 5 places) and the pop-once spending are untouched. No toughness/gear/ability tuning.

**Proof test:** `scripts/test-journey-deepening-r183-place-rotation-20261111.js` — **16/16 GREEN**, RED-verified on the pre-fix engine (adoption re-verified: exit 0). Analyzer proof test `scripts/test-journey-deepening-r183-analyzer-20261111.js` — **23/23 GREEN**.

**After-panel: NO-FRAMES again** — 0 place frames on the whole clean after-panel. The place lesson is rare: 0 frames across 16 seed-runs (before + after). The binding bar (maxSameFrame < 3 with distinctFrames ≥ 2 when frames fire) is **unexercised in the wild**. The mechanism is proven by the proof test; wild confirmation is still pending. The after-panel trajectories are **byte-identical to the before-panel on all 8 seeds** (verified by `cmp` — the fix changes nothing when the lesson doesn't fire), so the after-panel doubles as a clean no-regression check: every verdict identical (see below), survival identical (7/8), census identical.

**Verdict: FIX LANDED, mechanism proven, wild confirmation still owed.** The lesson fires so rarely that an 8-seed panel cannot exercise the rotation — a targeted probe (a scripted sitting with a villager who knows places) would confirm it in the wild faster than another panel.

## Q2 (SECONDARY, carried re-verify, read-only)

Favour-block / partner-block / away lines under the r130 rotation:

- **Favour-block: REPETITIVE both panels** — before total 6, after total 7 (the +1 is a `favorblock-rightnext` firing recovered from the 20 transcripts the before-panel lost to the flap — see Adoption findings); distinct 2, maxRepeat 4 both (`favorblock-nextto` 4/6 → 4/7). **Diagnosis (prereg A2, stands): NOT a regression on the r130 rotation.** All firings are from different villagers, each exactly 1 firing per sitting (maxRepeat 1 per sitting) — no villager repeated a variant. The 4× `nextto` are first-picks across 4 different villagers, and per r130 A2 the panel-wide first-pick distribution is uniform-random under BOTH mechanisms — the rotation governs per-villager repeats, never first-picks. At n=6–7 the share bar is verdict-unstable (r130 A1: r129 60% vs r130 31% on the same mechanism). The rotation is visibly working in the wild on the same panel: per-villager guarantee holds perfectly (0 within-sitting repeats).
- **Partner-block: VARIED both** — total 10, distinct 4, maxRepeat 3, share 30%. Identical before/after.
- **Away: VARIED both** — total 6, distinct 4, maxRepeat 2. Identical before/after.

## Q3 (census) — the villages in plain words

7/8 villages survived to day 100+; one lost (seed 100020, day 77, scatter-hunger — pantry empty, 5 people left alive when the village scattered). Survivors ended with 2–9 people alive. Every village reached wave 2 (first wave-2 kills day 14–34); 35–64 beasts slain each; the Codex grew 62–96 entries everywhere. Teaching is alive: Bark armor taught on 6/8 seeds, plus Snare, Pit Trap, Crossbow, Sling, Biriba, White Oak Acorns learned villager-to-villager. End pantries on survivors: 3,170–26,987 kcal. Deaths are the usual shape — the wild and monsters, a few ambushes; no starvation deaths on survivors, no thirst, no sickness deaths.

Per seed: 100018 survived d101 (7 alive, 26,987 kcal, 62 beasts); 100019 survived d100 (9 alive, 5,000 kcal, 62 beasts); 100020 lost d77 (scatter-hunger); 100021 survived d100 (8 alive, 7,723 kcal, 35 beasts); 100022 survived d100 (2 alive, 3,170 kcal, 40 beasts — the thinnest survival); 100023 survived d101 (8 alive, 13,275 kcal, 64 beasts); 100024 survived d101 (5 alive, 8,715 kcal, 58 beasts); 100025 survived d101 (9 alive, 10,553 kcal, 45 beasts).

## Q4 (carried, read-only)

- LADDER: opens 8/8, mints 5/5 tracks, holds 8/8, firstDays all 14. Identical before/after.
- REQUESTS: staged 57, decided 42, expired 14, REACHED. Identical.
- LANGGATE: NOT-REPRODUCED (offers 52, decisions 42, 0 'none'). Identical.
- LANGARC: ARC-FIRES (5 sittings, 2 grants, 2 flips, 0 unmatched). SECRET holds (openers 6, addressing 6, teachPicks 5). VARIETY varied (answered 6, distinct 4, maxRepeat 2, maxSameFrame 1). TEACHFRAME no-frames (0 plant frames). REPLAY 0. MENU-FLIP 0. DEBRIEF 1/1 attributed (scatter-hunger ×1). CISTERN clean (0 bad, 0 good).
- GOALJOIN: HEALTHY on every track except knowledge (GOALS-FAULT, capture 0 — 1 top, 0 lined). TRUST carried (r119 verdict stands).

## Metric review (closeout)

- Whether the before-panel re-observed the place-frame repeat (r130: maxSameFrame 2) or read NO-FRAMES (r129 shape) — **NO-FRAMES, r129 shape** — and whether the fix proceeded on the pre-registered decision — **yes, it did** (r130 already proved the defect; the proof test proves the mechanism).
- Whether the after-panel shows distinct place frames (distinctFrames ≥ 2) with maxSameFrame 1 in multi-lesson sittings — **no: NO-FRAMES again, 0 firings in 16 seed-runs**. The bar is unexercised, not failed. Next step is a targeted probe, not another panel.
- Whether the proof test's within-sitting rotation (4 distinct frames, 5th differs from 4th) matches the wild behaviour — **untested in the wild** (0 firings). The proof test is the evidence.
- Whether Q2 favour lines stayed VARIED (r130 rotation holds) — **favour-block reads REPETITIVE panel-wide on both panels, but the per-sitting read (maxRepeat 1 everywhere, 0 within-sitting repeats) shows the rotation holding**; the panel-wide share bar is unstable at n=6–7 and should not be read as a regression. Partner and away stayed VARIED.

## Carried (not this run's to build)

Baraka unvoiced raise (French-only speaker); Stella/Nathan trap-line invitation swallowed by raise-answer template; guest deaths (Bing) prereg; survival-collapse cause (combat side — the Loop B bisect is the top job next); scholar-payment open item (Steve-call); scale.json baseline regime re-label; 1415Z 17-failure gate attribution (still owed); preserve_food has no villager-side job; taken-kin pod sentence / softens beat / deflect pivot / quiet-place walk / stockpile / night-thread repetition items (r128 counts); r171 M2b scholar-open proof still owed; measurement-proof refresh (fresh neutral panel + `balance-proof-update.js`) — this run's change is dialogue-only, so the pair is carried, not rebuilt (the r181 `src/js/game.js` change already re-staled it; the next refresh round re-points).

## Adoption findings (main session, see adoption note)

1. **Driver multi-seed state leak (instrument defect, filed open):** running 2 seeds in one driver process diverges the second seed from a fresh single-seed run. Rule going forward: run journey-deepening seeds one-per-process until the driver resets state between seeds.
2. **Before-panel transcript corpus incomplete (flap artifact):** the before-panel captured 90/110 panel transcripts (20 sittings' transcripts lost to write refusals). The clean after-panel recovered them; the only verdict change is favour-block total 6→7. No verdict moved.
3. **Timeout:** the run timed out at the 2h cron deadline; the adoption completed the after-panel, run note, gate, commit, release, rotation, and lock cleanup.
