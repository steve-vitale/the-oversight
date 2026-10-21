# Journey-succession r34 (lane B) — "THE OPEN BOOK IN THE WILD + THE DARK HEIR" (2026-10-21)

Leg 7 (succession). Pre-registered per MEASUREMENT.md §§9-12, 14.

## Pre-registration

**Leg question — two halves:**
- **Q1 (reachability, unorchestrated):** the open book says "the promises died with their maker; the needs didn't. What you do about them is yours to decide." r28 PROVED the re-take machinery with ORCHESTRATE=1 (forced a new favor+promise with the needy villager in a 4-day window). Never proven: does the inherited re-ask (inherited-line / want-seed follow-up naming the dead bearer) surface in NORMAL successor play — no forced favors post-death, just a curious player who talks to people?
- **Q2 (canon proof):** docs/CORRUPTION.md claims "picking (or inheriting, on mantle-passing) a villager with a malicious hidden trait fires a psycho bundle — flashback, inner voice, starting corruption 20, early tells surfaced." `mantleWatch()` implements it; only unit coverage existed (`psychoIntro` direct call in test-corruption-20261009). NEVER proven end-to-end through a real death.

**Interesting-finding criteria:**
(a) M2 met → the open book is reachable in the wild; document channel mix.
(b) M2 misses → name the cause class (gate/priority/expiry/driver) → BLANK, not a bug.
(c) M3 broken → REAL BUG (canon-claimed beat).
(d) identity failures / fabrications → REAL BUG.
(e) breadth drops → REAL BUG.

**Seeds:** 9901–9904 (Q1), 9905 (Q2, DARK_HEIR=1). **Policy:** competent.
**Horizon:** phase A d1–9, one forced favor+promise ~d10–12 (real machinery; DECISION forced, mechanism real), scripted kill ~d10–14 via the REAL playerDeath ('a hushwolf'), successor +35d. Death-aware stop.
**Binding metrics:**
- M1: ≥3/4 mantles pass cleanly on 9901–9904. Kill rule: fails on ≥2/4 → SUBSTRATE-MISSING.
- M2: on ≥2/4 seeds, ≥1 ORGANIC re-ask naming the dead bearer fires in a post-death successor-driven convo. Seeds where the forced promise went moot or the needy villager died are EXCLUDED (r27 finding (e)).
- M3: on 9905, the psycho bundle fires end-to-end (flashback + inner voice + tell quirk + corruption 20 + darkPath + _psychoIntroFired).
- M4: 0 identity failures + 0 fabricated-history lines in sense-read transcripts.
- M5: Codex breadth does not drop across any death.

**Mid-run instrument correction (documented, not a metric change):** after the 9901/9902 pilots, the forcing kind set was narrowed from {food_share, forage_help, heal_help, sick_help, stay_close} to {food_share, heal_help, sick_help, water_haul, stay_close}. Reason: the Codex favor-action contract (dedc46db7, merged 2026-10-20) made forage_help/snare_mend/watch_shift explicitly UNKEEPABLE — honest blocker, no playable joint action, "close this unavailable job (no penalty)". Forcing an unkeepable kind would test a path the game deliberately closed. 9902 ran with the old set but forced nothing (no setup-eligible need); unaffected.

## What happened

**M1: 4/4 GO.** Deirdre→Marcus (9901, d12), Cameron→Deon (9902, d14), Carmen→Hunter (9903, d11), Jenny→Greta (9904, d10). linOk + moOk on all. Bonus organic handoffs: Marcus→Jae (9901, d31 combat), Deon→Landon (9902, d33 combat) — the chain machinery held through back-to-back deaths. Villages alive at horizon (8–10 living).

**M2: MISS on the bar (1/3 eligible) — but the finding is richer than the bar.** Per-seed:
- 9901: EXCLUDED — the promisee (Marcus) became the heir (moot path, r27's fix working); Marcus later died in combat and the chain continued honestly.
- 9902: **GO, and fully organic** — no forced promise at all (no setup-eligible need pre-death), yet on d16 Landon re-asked the successor Deon unprompted: *"I asked Cameron about the pantry run — Cameron's gone. Still need hands. Are you in?"* The want-seed follow-up channel fires in the wild, naming the dead bearer. The book IS reachable in normal play.
- 9903: MISS — forced Stan/heal_help released cleanly (favor 'asked', inhFrom stamped), Stan stayed alive 35 days, the successor talked to him 4 times, the re-ask never fired. **Cause class: the Simone zombie** (r28/r29's deferred blank, Steve's call): Stan's injury healed → `convoFindFavorNeed` found no current need → `ask_favor.pick` returned 0 → the opener (which holds both the inherited-ask branch AND the moot-flip) never ran. The released favor sits at 'asked' forever — not live, not moot, not closed. Mechanism now precisely named (was: "no daily sweep"; now: the moot-flip lives inside a never-selected opener).
- 9904: MISS pre-fix — and the miss exposed a **REAL BUG (fixed this run, see below).** Forced Terry/food_share released cleanly; by d+2 Terry's hunger was resolved but the pantry was low, so the successor's convo selected ask_favor for a NEW forage_help need. The opener's kind-changed branch marked the released food_share favor 'moot' on the detached object and the vid-keyed ledger overwrite buried it — **the open book's entry ("share food with Terry — they're going hungry") vanished with no honest line**, replaced by the new ask. The code's own comment promises "the follow-up says so honestly"; the implementation didn't.

**M3: GO — canon proven end-to-end for the first time.** 9905: Ruth (forced malicious/long_smile, trust topped to 77) inherited from Rebecca on d9; the next per-part `mantleWatch` fired the complete bundle: the FLASHBACK line, the personalized tell note ("except Aubrey, who smiled. Just a beat too long. You covered it by fetching water, quick and helpful."), the quirk surfacing ("People will notice: smiles a beat too long when someone gets hurt."), the INNER VOICE line, corruption=20, darkPath=true, _psychoIntroFired=true. linOk + moOk. Ruth later died in combat (d36) → Dante, cleanly. Sense-read (Chris, trust 93, d+21): the village treats Ruth normally — warm, confiding, no monster-framing. Correct per canon: "The fiction acknowledges what you are without handing you a villain manual."

**M4: GO** — 0 identity failures, 0 fabricated-history lines across all sense-read transcripts (9901 Carlos/Hunter, 9902 Hugo×2, 9903 Stan/Hugo/Ray, 9904 Terry/Lorenzo, 9905 Chris). The dead are mourned by name; successors are addressed as themselves.

**M5: GO** — Codex breadth rose on every seed: 22→55, 27→54, 24→53, 28→52, 21→54.

## The bug: the silent replacement (REAL BUG, FIXED)

**Root cause** (proven live on 9904, then in the proof test): `ask_favor`'s opener, kind-changed branch (`src/js/convo-wants.js`): when the released inherited favor's kind ≠ the villager's current need kind, the old code did `oldF.state = 'moot'` on the object and fell through to `convoBuildFavor` + `convoStoreFavor` — and since `favorLedger` is keyed by vid (one favor per villager), the new favor overwrote the old. The moot was marked but never spoken; the book's entry evaporated.

**Fix** (src/js/convo-wants.js, +18/-1): the kind-changed branch now builds a `mootPrefix` — `"Never mind {oldF.short} — we got it handled. Thanks anyway. "` — and folds it into the opening quote ahead of the new ask: *"Never mind the food I needed — we got it handled. Thanks anyway. Pantry's thin and getting thinner. Forage with me tomorrow?..."* One breath, close-then-open, the way people actually talk.

**Proof:** `scripts/test-succession-honest-moot-20261021.js` — 11/11 GREEN on fixed code; RED-verified 9/11 on pre-fix code via patch-revert (the 2 failures are exactly the bug: no honest moot line; the structural assertions — moot marked, ledger replaced — pass on both, proving the bug was precisely the silence).

**Regression:** favor-action contract 36/36, succession-promisee-bearer 14/14, succession-open-book 10/10+2/2 (case3 fixture skip, pre-existing), succession-grief 22/22, succession-youre-not-x 11/11, succession-seed-inherit 6/6, honest-moot 11/11. `check.js --only succession` run in background (result pending at commit time — see run note addendum).

## Village assessment (plain words)

Five villages, all alive at the horizon (8–10 living each). The mantles passed cleanly everywhere, including two organic combat deaths mid-run — the chain is the normal case. The open book worked as designed at every handoff (every released promise named honestly). In the wild, the book's entries resolve three ways: re-asked and kept or declined (9902's Landon re-ask — the channel works), healed into a quiet zombie (9903's Stan — the deferred sweep question), or — before this run's fix — silently replaced when the need changed shape (9904's Terry — now spoken aloud). Ruth's village never learned what she is; Chris confided in her about the Lottery at trust 93 while the inner voice counted fear as respect. The Codex grew on every seed. Nothing was lost that the village didn't mark — except, pre-fix, Terry's entry, which is why the fix exists.

## People check

Full transcripts on every sense read (SENSE-TESTING LAW). Standouts: Hugo d+7 (9902) — "I dreamed Cameron was still here. Woke up angry at the dream. Stupid." / "We bury, we grieve, we keep going. There's no step four."; Stan d+21 (9903, trust 90) — thread resume across the death ("We never finished talking about each other — we got cut off, 3 days back"), a show memory ("They took you — Beastmaster, on the screens"); Carlos d+7 (9901) — "Deirdre always took the burnt piece. Said someone had to. I take it now." The favor-requirements honesty (Codex contract) works in dialogue: "Why can't I do this now?" → "You need edible, unspoiled food in your pack. Food in the pantry must be collected first." / "There is no playable joint foraging outing yet." — the fourth-wall phrasing is deliberate and consistent across the five unsupported kinds (disclosure, not a leak; verified in code). The driver-wandering filler ("Sorry, lost my train of thought", "Hm. Never mind — go on") persists as documented. One composition note: the d+35 Hunter transcript (9901) is warm but long on filler — social-loop territory, not succession's.

## Blanks filled / documented

1. **FIXED (src/js): the silent replacement** — honest moot, proof test 11/11 RED→GREEN (above).
2. **PROVEN (no src change): the dark-heir psycho bundle** — CORRUPTION.md's canon claim now has its first end-to-end proof (9905). No code changed; the machinery was already correct.
3. **DOCUMENTED (design consequence): the narrowed re-take surface.** Since dedc46db7 (Codex favor-action contract, merged 2026-10-20), forage_help/snare_mend/watch_shift are explicitly unkeepable — r28's signature forage_help close (Wei, 8303) is not reproducible on the current tip BY DESIGN. The open book's "what you do about them is yours to decide" now covers food/wound/illness/water/company needs; the other three get the honest blocker + no-penalty close. Whether that narrowing is acceptable is Steve's call — the machinery is honest about it, which is what the contract was for.
4. **DOCUMENTED (standing): the Simone zombie, mechanism sharpened.** 9903 shows the exact chain: need heals → no current need → ask_favor weight 0 → the opener (home of both the inherited-ask and the moot-flip) never selected → released favor sits at 'asked' indefinitely. Still Steve's call whether a daily sweep (or deadline expiry) should close these.

## Metric review

M2 missed on the letter (1/3 eligible seeds ≥ the ≥2/4 bar) — NOT re-scored. The bar stands for the next run. What the run actually established: the organic channel works in the wild (9902), and both misses have named cause classes (zombie → Steve's deferred sweep call; silent replacement → fixed). M5's week2-deadBearerMentions came out 0/5 — the metric counts say-log name mentions in week 2; grief lives in conversations, not say lines, on this profile. Not a failure of the game (transcripts are full of the dead), but the metric's instrument is say-only — noted for the next run's instrument, not re-scored here. No metric revisions proposed beyond that note.

## Reachable / fun / winnable

- **Reachable:** the mantle passes every time (7/7 incl. 3 organic); the open book names every released promise; the re-ask fires in real play (9902); the psycho bundle fires on a dark heir (9905).
- **Fun:** the successor's weeks read as a living village — grief with texture, resumed threads, confessions, a dark heir the village trusts at 93 while the inner voice does its arithmetic. The honest moot keeps the book's promise: nothing the village marked vanishes silently anymore.
- **Winnable:** neutral — continuity machinery, held everywhere (Codex breadth up on all seeds, trust floors intact, books clean at end: 0 open promises on 9901/9903/9904).

## Telemetry

telemetry-check vs telemetry-baselines/succession.json: run after evidence write (see run note). Per-seed tele JSONs: journey-succession-r34-tele-990{1,2,3,4,5}.json. Baseline NOT rolled (mixed profiles: Q1 + dark-heir; deaths.bearer 1–2 vs baseline 5 by construction).

## Design calls for Steve

1. The re-take surface narrowed to 5 favor kinds by the favor-action contract (forage/snare/watch unkeepable) — is that the right call, or should the open book's promise cover them via future playable actions (ROADMAP lists requirements)?
2. The Simone zombie (released 'asked' favor, need healed, never mooted — no daily sweep): 9903 demonstrates it cleanly. Still your call.
3. Standing from r31–r33: office visibility (shoes-now rarity) and socially-silent funerals.
