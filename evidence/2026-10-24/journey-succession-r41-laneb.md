# Journey-succession r41 (lane B) — "MEAL-GATE VERIFY" (2026-10-24)

Leg 7 (succession). Pre-registered per MEASUREMENT.md §§9-12, 14.
Run by oversight-playtest-loop-2 (lane B coordinator), worktree journey2-succession.

## Pre-registration

**Leg question:** r38 left the trust-trap as a design datum (seed 20004: d10
death → successor trust 16 → 13 half-ration nights, trust 16→16 no self-heal).
Steve ruled 2026-10-23 (docs/DECISIONS.md): the trust<30 half-ration in
villageMeal is for NEW villagers only — the original body (lineage empty) or
a recent arrival (isNewcomer). A taken-over ESTABLISHED villager eats full at
any trust. "It's about the village not the villager." The ruling is landed on
master. This run VERIFIES it in the wild:
- (a) MG2: across every post-death day on every seed, an established
  successor (bodyIsNew=false) is NEVER half-rationed and NEVER hears
  "Half ration". One violation = REAL BUG (regression of a landed ruling).
- (b) MG1 (unit proof): new-body and newcomer gates still fire — covered by
  scripts/test-succession-meal-gate-20261024.js (12/12 green, incl. a
  RED-demonstration that the instrument is sensitive to the fix).
- (c) regression: funeral arc (M1), vouch contract (M2a), machinery (M4)
  still hold under r37/r38's bars; successor trust-climb vs r38's 16→16.
- (d) people check (M5): sense-read transcripts, successor first-days voice.

**Interesting-finding criteria:**
(a) any established-successor half ration/voice → REAL BUG, fail loudly;
(b) any new-body full ration at trust<30 → GATE BROKEN, real bug;
(c) vouch contract violation → real bug;
(d) trust-climb comparison vs r38's 16→16 (document, not a verdict).

**Seeds:** 20011, 20012, 20013, 20014 (phase A 40d, organic deaths honored;
20011 was pre-registered EARLY_KILL_DAY=12 but the re-run dropped the env var
— deviation documented below; the organic d13 death was honored per the
standing rule), 20015 (EARLY_KILL_DAY=6 — the trust-trap regime re-test).
**Policy:** competent. **Horizon:** phase A → death (organic or scripted via
the REAL playerDeath 'a hushwolf') → successor +14d competent play.
**Instrument:** scripts/journey-succession-r41-20261024.js (r38-derived;
meal-gate audit per post-death day: lastPlayerMeal kcal, bodyIsNew, trust,
half-ration voice; same telemetry contract as
telemetry-baselines/succession.json).

**Binding metrics (§14):**
- MG2 (THE question): 0 violations on every seed — no established successor
  half-rationed or voiced at. A single violation = REAL BUG.
- M1 (funeral arc): ≥3/4 deaths produce (a) the death beat naming the bearer,
  (b) recoverBearer <redacted> 2 days, (c) the burial act completable.
  Kill rule: ≥2/4 deaths with NO recoverBearer → SUBSTRATE-MISSING.
- M2a (vouch contract): on EVERY seed with ≥1 eligible voucher (living
  roster, not the successor, trust ≥ 60 at the funeral), the vouch say line
  fires. A single eligible-but-silent seed = REAL BUG.
- M3 (social echo, r37's bar stands): on ≥3/4 seeds, ≥2 true-name mentions
  of the dead bearer in VILLAGER TALK within 7 days. Descriptor, NOT re-scored.
- M4 (machinery): mantles clean (linOk + moOk) on every death.
- M5 (people check): 0 identity failures across sense-read transcripts.

## What happened

| Seed | Death | Successor trust | MG2 | M1 | M2a | M3 (echo) | M4 | End |
|------|-------|----------------|-----|----|-----|-----------|----|-----|
| 20011 | organic d13 Ella→Francisco | 43→43 | 0 viol | ✓ | n/a (0 elig) | 0 miss | ✓ | 11 alive |
| 20012 | organic d16 Hazel→Oliver (starvation) | 46→44 | 0 viol | ✓ | ✓ (Aki 67 vouched) | 0 miss | ✓ | chain Oliver→Aidan d30; 8 alive |
| 20013 | organic d10 Riley→Harper | 30→19 | 0 viol | ✓ | n/a (0 elig) | 2 ✓ | ✓ | 9 alive |
| 20014 | organic d17 Courtney→Tanisha | 55→47 | 0 viol | ✓ | ✓ (DeAndre/Aurora/Marcus spoke) | 2 ✓ | ✓ | 9 alive |
| 20015 | scripted d7 Angela→Ines | 17→17 | 0 viol | ✓ | n/a (0 elig) | 0 miss | ✓ | chain Ines→Jaber d18; 8 alive |

**MG2: 0 violations on 5/5 runs (60+ audited successor meal-days).** The
discriminating wild cases:
- 20015 (r38's trust-trap regime, re-tested): Ines inherited at trust 17 —
  the exact regime that produced 13 half-ration nights on r38's seed 20004.
  She banked 2000–2349 kcal on all 5 drawn meal-days, zero "Half ration"
  voice. The other 5 audited days she was camp-wild on expedition
  ("You camp wild tonight — no pantry meal", say-dump verified) — no meal
  drawn, not gated.
- 20013: Harper inherited at 30, decayed to 16, and ate FULL shares
  (2000–2300) for 12 straight days at trust 16–30. Two small draws (400,
  150 kcal, d+14/15) with NO voice — room-limited draws
  (want=min(share,room)), honest, not gated. Pre-fix code would have voiced
  "Half ration" at trust 16; it never appeared.
- Across all seeds: halfRation voice count = 0. The gate is lifted for
  established successors and the new-body/newcomer gates are proven intact
  by the unit proof (12/12).

**M1: 5/5.** Every death produced the death beat, the recoverBearer <redacted>
("the grave is dug by the fire"), and a completable burial via the
player-facing API (payRespects + buryCorpse verified through the scripted
d+3 injection on all seeds).

**M2a: contract 2/2.** Both seeds with eligible vouchers fired the vouch
line — 20012's single voucher ("At the grave, Aki speaks for Oliver —
'Hazel trusted them. We saw it. Give them the fire's hearing.' The village
listens.") and 20014's three ("DeAndre, Aurora, Marcus speak for Tanisha").
No eligible-but-silent case.

**M3: 2/5 on the letter (0, 0, 2, 2, 0).** The misses are the short-life
regime (deaths at d7–d16, thin shared history) — same regime-informative
pattern as r37/r38, not a regression. Bar stands (§14); the finding remains
the pattern: echo depth scales with shared history.

**M4: 5/5+.** All mantles linOk + moOk, including two chain mantles
(20012 Oliver→Aidan d30; 20015 Ines→Jaber d18). The chain machinery holds.

**Trust climb vs r38's 16→16:** the food channel is fixed, but trust stays
sticky for low-trust successors — Ines 17→17 (12 days), Harper 30→16→19,
Francisco 43→43, Oliver 46→44, Tanisha 55→47. The successor no longer
starves; the social climb is still slow. Documented as data (no longer
lethal — now a social-design observation, not a trap).

## Village assessment (plain words)

Five villages, all with real deaths — four of the five bearers died
organically in phase A (starvation, combat, the wild), which says the
competent bot's world stays dangerous. The villages mourned mechanically
complete funerals every time: death beats named the bearer, graves were dug
by the fire, and where the predecessor had lived long enough to earn
standing, villagers spoke at the grave — Aki alone for Oliver, three voices
for Tanisha ("Courtney trusted them. We saw it."). Successors stepped into
the office and were fed like the villagers they are: Ines, the least-trusted
successor in the corpus at 17, ate full shares from the communal pantry
while the village around her ran a food surplus ("shelves are full to
bursting", villagers declining to add more). Two villages chained a second
mantle inside the window (Oliver→Aidan, Ines→Jaber) and kept going — the
office outlasts the person, which is the design. Nobody starved because the
village didn't know them; the only hungry days were expedition nights, eaten
from the pack by choice.

## People check

SENSE-TESTING LAW: 20 transcripts sense-read across the five seeds.
- Diana (Twi-only speaker, trust 55–60): honest language-barrier
  conversations — non-verbal, no fabricated shared history, "no shared words
  at all — just eyes, hands, and patience." Reads true, not thin-by-bug.
- Eli d+3 (trust 62): guarded secret ("I'm not from Denver. I'm from
  Columbus, Ohio. The less of me is out there, the less can be used against
  me."), deflection when poked, unresolved-but-planted ending.
- Ruth d+14 (trust 65): regret beat with a real shape ("I regret the
  ordinary days I rushed through... I'd pay anything for one annoyed morning
  now"), boundary-setting when challenged ("I told you the truth. You can
  keep poking it, but it's told."), earned warmth close.
- Aki d+3 (the voucher, trust 64): thread continuity across the death ("We
  never finished talking about what's been happening"), guarded trust test
  ("show up when it costs you something. That's the whole test.").
- Aurora d+3 (trust 73): heavy-day grief-adjacent talk, secret with a cost
  calculus ("I weighed the lie against what the truth would cost them. The
  lie was cheaper."), escalating honest deflections under repeated poking.
- The driver-wandering filler ("Sorry, lost my train of thought") persists
  as documented since r38. The "not from Denver" secret framing repeats
  across villagers (Eli/Columbus, Ruth/Brooklyn, Aurora's variant) — a
  shared content template with distinct payloads; formulaic at the frame
  level, not an identity failure.

**M5: 0 real identity failures.** Two tripwire hits (20013/20014) were
pre-death SYSTEM grant lines addressing the then-player ("built just for
Riley", d8, Riley alive) — instrument false positives; the tripwire now
scans post-death lines only (proven with a logic test in-run).

## Blanks filled / documented

1. **VERIFIED (no src change): the meal-gate ruling holds in the wild.**
   0 violations across 5 runs; the r38 trust-trap regime (trust 17) now eats
   full. Unit proof 12/12 (incl. RED-demonstration). Thread closed.
2. **DOCUMENTED (design data): trust still doesn't climb for low-trust
   successors** (17→17, 30→16→19 over 12–15 days). The lethal channel is
   gone; what remains is slow social earning. For Steve's awareness, not a
   bug.
3. **FIXED (instrument): organic-death day off-by-one.** Deaths are detected
   one runDays-call late; funeral windows built on the detected day missed
   beats fired inside playerDeath (20012's vouch fired d16, window was
   d17–d19 — a false M2a=NO-GO caught by the probe). The instrument now
   captures the true day at playerDeath entry. Committed in the r41 script.
4. **FIXED (instrument): MG2 predicate.** First cut flagged any kcal<1500
   as a violation — false-positived on room-limited draws (400/150, no
   voice) and camp-wild zeros. The gate's signature is the voice
   (voice==share by construction, R41); the predicate is now voice-only,
   with small draws and no-meal days tallied separately.
5. **FIXED (instrument): burial injection at first daysSince ≥ 3** (was
   === 3); a 2-day runDays jump skipped d+3 on 20013 (r38's quirk).
6. **FIXED (instrument): identity tripwire scans post-death lines only**
   (pre-death SYSTEM grants to the then-player false-positived).
7. **DOCUMENTED (standing policy gap): organic burial 0/5 again** — the
   competent bot never buries the bearer <redacted> its own; the rite exists in the
   UI. Same as r37/r38.

## Metric review

- MG2's final form (voice as the gate signature) is the right bar: share
  and voice share one boolean, so the voice is necessary and sufficient.
  The kcal-band heuristic produced false positives; documented above.
- M2a's contract/split (from r38) proved its worth: the 20012 false
  negative was caught and root-caused to the instrument within the run.
- M3's bar keeps missing on short-life regimes (0 mentions at d7–d16
  deaths). Regime-informative, not metric-hostile; bar stands per §14.
- Deviation from plan: 20011's re-run dropped EARLY_KILL_DAY=12 (env var
  omitted in the re-run batch), so it ran a 40d phase A and caught an
  organic d13 death instead of the scripted d12 kill. Honored per the
  standing organic-death rule; 20015 (EARLY_KILL_DAY=6) covers the
  early-kill regime better anyway. No re-score; documented here.

## Reachable / fun / winnable

- **Reachable:** the full funeral arc fires on scripted AND organic deaths
  (4/5 organic this run); the vouch fires when earned (2/2); the meal gate
  behaves per Steve's ruling in every observed regime.
- **Fun:** succession reads as a living village — named grief, funerals
  with speakers, chain mantles that keep the office alive. The handoff is
  never silent; the successor is fed, not punished.
- **Winnable:** neutral for the leg — continuity machinery held on all
  seeds (Codex breadth not re-measured this run; books clean). The
  trust-trap no longer costs lives through the food channel.

## Telemetry

`telemetry-check --baseline telemetry-baselines/succession.json` (5 files,
5 metrics): **quiet — no large deviations.** Baseline stands; not rolled.

## Design calls for Steve

None new from this run. The trust-stickiness observation (§2 above) is data
for his awareness; the 7-day grace-period brief from r38 is superseded by
his 2026-10-23 ruling (implemented and now verified).
