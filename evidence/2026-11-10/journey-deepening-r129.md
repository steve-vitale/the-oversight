# journey-deepening r129 — deepening leg (days 40–80), Lane A

- **Run:** `playtest-loop-a-20261110T234358Z`, scheduled Tue 2026-11-10 17:45 CST (23:45 UTC); run 23:43Z–01:3xZ 2026-11-11.
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2`; advance 2→3 at closeout.
- **Base:** local master `3daa1a9b6`. Branch `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening`.
- **Policy:** competent. Seeds: fresh 100001–100008 (8 seeds); smoke 100000. Freshness verified (0 prior mentions in evidence/docs/scripts/filenames).
- **Prereg:** `evidence/2026-11-10/journey-deepening-r129-prereg.md` (Amendments A1, A2 + after-panel section recorded in-run).

## What this run asked

The Haven-door adjacency line — the answer to "Why can't I do this now?" when a favour is blocked — was one fixed sentence, and the r128 panel counted it the worst repeater (9×). This run asked whether three favour lines repeat verbatim on a fresh deepening panel, and fixed the ones that do:
- **Q1 (primary):** the 1890 favour-block line. **Q1b (added by A2):** the delegated partner wording (water/forage favours). **Q3(a):** the favour-commit away line. **Q3(b):** the "1 liters" cistern pluralization. **Q2:** the place-lesson frame (same defect class r125 fixed for plants).

## Before-panel verdicts (8 seeds + smoke)

- **Q1: REPETITIVE** — total 11 (10 panel-only), distinct 1, maxRepeat 11 (10). One fixed sentence, 10× on the panel seeds.
- **Q1b: REPETITIVE** — total 37 (18 panel-only: 14 bare + 4 "As I said — " reframes), distinct 1. The DOMINANT repeater — nearly twice the 1890 line. A1's "left alone" call was wrong; A2 pulled it into the fix.
- **Q3(a): REPETITIVE** — total 19 (18 panel-only), distinct 1, maxRepeat 19 (18).
- **Q2: NO-FRAMES** — 0 place frames on the whole panel. No fix built.
- **Q3(b): CLEAN** — 0 "1 liters" (the cistern never held exactly 1 liter). The one-line pluralization was still built, per the prereg.
- Carried reads: Q1-VARIETY VARIED (r125 fix holds), Q1-TEACHFRAME NO-FRAMES, Q1-LADDER OPENS+MINTS+HOLDS (9/9 opens, 5/5 tracks, holds 8/9).

## The fix (landed in this commit)

Four variants each, picked STATELESSLY by `convoFavorHash` (stable person key + day + per-pool seq: 11/22/33) — stateless because `convoFavorAction` is documented read-only (it reads the conv map without creating one; the journal path calls it outside any sitting), so the `convoPickCycle` ledger is not available there. The same villager on the same day gets the same variant, which preserves the r21 re-ask reframe ("As I said — ..."); different villagers and days spread across the four wordings. Every variant keeps the truth (block variants: move adjacent, same side of the Haven door; away variants: away from Haven, no dawn meet while out, find me when back). The partner pool is shared by the water and forage delegated actions.
- `src/js/convo-wants.js`: new `convoFavorBlockLine` / `convoFavorPartnerBlockLine` / `convoFavorAwayLine` helpers; wired into the 1890 block, the 1787 away line, and the water-haul cistern pluralization (`liter` vs `liters` in all 3 openers + 3 why-lines).
- `src/js/favor-water.js:95`, `src/js/favor-forage.js:53`: the partner line now calls the shared helper.
- No place-frame fix (Q2 came back NO-FRAMES, as preregistered).
- No toughness/gear/ability tuning — the 2026-11-10 combat-play gate does not bind this run (dialogue variety only).

## After-panel verdicts (same 8 seeds, fixed engine)

Per-seed outcomes IDENTICAL to the before-panel (same days, waves, population) — the fix changes dialogue text only, so this is a true before/after on identical trajectories.
- **Q1: REPETITIVE — NO-GO.** total 10, distinct 4, maxRepeat 6 (`beside` 6, `nextto` 2, `theirside` 1, `rightnext` 1), share 60% ≥ 50%. Improved from 100%/1 wording to 60%/4 wordings, but the bar was missed.
- **Q1b: VARIED.** total 18, distinct 4, maxRepeat 6, share 33%. ✓
- **Q3(a): VARIED.** total 18, distinct 4, maxRepeat 7, share 39%. ✓
- **Q2: NO-FRAMES. Q3(b): CLEAN.** Carried reads hold (VARIETY VARIED, LADDER OPENS+MINTS+HOLDS 8/8, holds 7/8).

**Why Q1 missed:** the 10 firings are 10 DIFFERENT (seed, day, villager) sittings — no re-ask double-counts — and the hash mapped 6 of the 10 distinct inputs to `beside`. A 55-pair aggregate check shows the hash is even in the large (14,14,14,13), so this is a small-sample draw (one bucket ≥6 of 10 happens ~15–20% of the time for any stateless pick), not a systematic hash bias — a shifted hash would just re-roll the dice. Only a stateful rotation would guarantee spread, and the read-only contract blocks it. **The fix lands as a PARTIAL:** Q1b and Q3(a) verified fixed, Q1 improved but still repetitive. No re-roll, no bar change — the miss stands as measured. The rotation-vs-hash question goes to the next run.

## Proof tests (RED→GREEN)

- Analyzer: `scripts/test-journey-deepening-r129-analyzer-20261110.js` — 23/23 GREEN (17 original + 6 A2 share-bar/partner cases). RED verified against the r125 analyzer (`favorBlockId is not a function`, exit 1).
- Fix: `scripts/test-journey-deepening-r129-favor-variety-20261110.js` — 8/8 GREEN on the fixed engine (pool membership, ≥3 distinct variants across roster×days, same-(villager,day) stability, cistern "1 liter"/"2 liters", end-to-end blocked favour action returns a pool reason). RED verified on a temp copy with HEAD (pre-fix) sources (`G.convoFavorBlockLine is not a function`, exit 2).

## People check

The new wordings read like a person giving directions, not a system instruction. Elena (seed 100003, day 54) asked "Why can't I do this now?" and heard "Stand beside them first — same side of the Haven door — then help." The reframe still works: the same villager re-asking hears "As I said — Get to your partner's side of the Haven door and stand next to them — then you can help." Conversations keep their shape (want → ask → blocked reason → resolution none); nothing else in the sitting changed.

## Census (Q5) — plain words

Six of eight villages lived to day 100–101; two were lost (seed 100003 on day 87, seed 100004 on day 88, both after reaching wave 4–5). The six survivors ended with 4–10 people alive (46 total). Every village reached the Standing ladder's top stage by day 60 at the latest, and all five tracks (fight, forage, craft, talk, explore) minted points on every seed. Wave-3 fights happened 2–13 times per village; villagers engaged 6–8 of them each. Regional links formed on every seed (1–4 each, 17 total); bond proposals ran 5–14 per village. The knowledge economy is working: villagers killed, tested, revealed, and cooked monster meat on every seed (22–38 kills, dinners served). Two villages died out entirely — the deepening leg is still lethal, and the deaths came after real fights, not from a single bad day.

## Reachable / fun / winnable (leg verdict)

- **Reachable:** yes — the favour-block, partner, and away lines all fire in ordinary play (10–18× per 8-seed panel), and the fix's variants are all reachable through the same menu choices.
- **Fun:** improved — a villager who blocks you now answers in four different voices instead of one system sentence; the partner and away lines no longer repeat verbatim. The 1890 line still leans on one variant (6/10), so the improvement is partial there.
- **Winnable:** unchanged by this run (dialogue only). The ladder opens and holds on 8/8 seeds; the winnability chain (wave-4 kills → veterans → readiness) is untouched.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest` — 291 passed, 9 failed (17 min, under heavy sibling load). Accounting for all 9: **3 were this run's r113 away-line test** (it pinned the exact away/block lines; updated to the 4-variant pools — now 9/9 passing); **3 were 120s timeouts** (capable-bot, trust-observer-neutrality, table-endings — all pass individually, load artifacts from sibling sims running at the same time); **3 are standing** (establishment-r20 + 2 of mobile-combat-cadence / occupation-panels / phone-frame-proof — pre-existing, arithmetic fits the 9 exactly). No regression from this change. **Balance proof:** the r127 neutral panel (`neutral-r127scholar.json.gz`) is stale against the current tree — pre-existing staleness from tree movement since r127, NOT from this run (the proof's input set is observer files + contract, none of which this run touched). A fresh neutral panel + `balance-proof-update.js` is OWED as a follow-up; this run's change provably cannot affect balance metrics (the after-panel trajectories are identical to the before-panel's). Telemetry: quiet — `telemetry-check.js` on the 8 after-panel seed JSONs (ladder, standing, survival) reported no large deviations; baseline NOT rolled forward (nothing unexplained to absorb).

## Metric review

- The A1 absolute maxRepeat ≤2 bar was unreachable at this firing rate (10–28 firings over 4 variants — even perfect rotation gives maxRepeat ~3–7). A2's share bar (<50%) is the right shape, but at n≈10 it is fragile: one firing flipping changes the verdict (Q1 missed at 6/10). A larger panel (16 seeds) or a per-sitting bar would settle Q1 properly.
- The Q3(b) "fix regardless" call was right: the panel never hit 1 liter, but the proof test proves the line now renders correctly, and the defect was proven by the line's own text + r128's 2×.
- The favour-block instrument (driver picks `dlg:favor_requirements` once per sitting) works: the block fired 10× and the partner line 18× on the panel. The pilot gate (≥1 firing) was met by the smoke seed alone.
- The read-only contract on `convoFavorAction` is a real constraint on variety mechanisms: any future variety fix on a blocked-reason line needs either a stateless pick (hash, small-n noisy) or a way to rotate without writing convo state. Worth a design note for the next run.

## Carried (not this run's to build)

Baraka unvoiced raise (French-only speaker); Stella/Nathan trap-line invitation swallowed by raise-answer template; guest deaths (Bing) prereg; survival-collapse cause (combat side); scholar-payment open item (Steve-call); scale.json baseline regime re-label; 1415Z 17-failure gate attribution (still owed); preserve_food has no villager-side job; taken-kin pod sentence / softens beat / deflect pivot / quiet-place walk / stockpile / night-thread repetition items (r128 counts); Q1 1890-line rotation question (this run's NO-GO — see above).
