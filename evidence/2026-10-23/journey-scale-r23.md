# Journey SCALE r23 — THE MERCY-GRACE RE-MEASUREMENT (2026-10-23)

**Run id:** journey-scale-r18-20261023T0746Z (oversight-playtest-loop, lane A). Worktree: `journey-scale` (base master@0472177d0, registered, heartbeat <15min, released post-merge).

**Rotation:** read 3 at run start → leg 3 = SCALE (days 80–140: regional→national, hierarchy, table approach). Writes 3→0 on completion.

**Canon read:** CANON.md (standing rules), SCALE.md (Iron Court, MERCY-GRACE, rebellion/sabotage while trust<30, duress tribute, ×1.25 polity logistics), SCALE-DISCOVERY.md. No new canon invented. Canon gap note (carried from r7): the kind answer's pre-fix copy promised "a season" it didn't deliver — the fix's copy under test today.

## Pre-registration (MEASUREMENT.md §§9–12, 14 — written BEFORE the pilot ran)

**Why this run:** journey-scale r7 (2026-10-18) played the conquest road and found the Iron Court MERCY trap: the beat promises eased links "a season," but MERCY cleared the conquered flags, flipping the hold bar from season-only (conquest) to season+trust-40 (lead) overnight, while +8 on strike-trust 15 lands at 23 — short of 40. The kind answer was a trap; 0/3 mercy/yoke seeds held national to run end (pre-fix). The fix landed in-commit (MERCY-GRACE: eased links carry mercyUntil=day+30; the trust component of the seasoned bar is waived for polity membership while grace holds; after the season the LEAD bar applies honestly — dissolve aloud if unearned; hierarchy.js). **The 8 committed r7 seeds are PRE-fix measurements — the grace window's effect on a full run is NOT yet re-measured. R23 closes that item.**

**Leg question:** post-MERCY-GRACE, does the Iron Court's MERCY answer hold the war-realm for a season (mercyUntil=day+30), letting a tending player earn the trust-40 bar — i.e., is the kind answer no longer a trap?

**Binding metrics (NO-GO never re-scored; revisions go to "metric review"):**
- M1 staging — ≥2/4 seeds stage the Iron Court by d140 (GO). Else NO-GO with the named structural blocker.
- M2 hold — of mercy-answered seeds staging national, ≥half still hold nationalLive 30 game-days after the mercy answer, OR dissolve aloud with the unearned trust bar named in the line.
- M3 mechanics — ≥1/4 seeds show a conquest mechanic beyond the court: a raid answered, a revolt/sabotage marker, a duress tribute week, or tend-climb movement on a mercy link (trust sampled weekly).
- M4 people — ≥4 full transcripts sense-read in the scale window (days 80–140), 0 senseless flags.
- M5 winnable — ≥2/4 seeds end with national held OR reach d140 (death-aware stop).

**Interesting-finding bar:** the mercy answer's beat text (does the kind answer read honestly about the season's terms?); the trust trajectory of eased links (15/25+8 → toward 40); the grace-expiry dissolve (if any) said aloud with the bar named; rebellion/sabotage under trust<30; raid cost lines said plainly.

**Horizon:** DAYCAP=160 loop-days targeting ~140 game-days (r5's ~25% fight-blocked-sleep tax), death-aware stop (+10d tail max). **PILOT FIRST:** 4 seeds 60001–60004 (fresh; r22 used 40001–40004, r19 19001–19008, r7 9501–9508). **Policy:** warcourt (competent + conquest force play; raids from day 35, terms-first), WARCOURT_RAID=1, IRONCOURT_ANSWER=mercy on all seeds (IRON_FORCE env may override per seed). **Script:** scripts/journey-scale-r23-20261023.js (modeled on the r7 script; new mercyEvents + weekly mercyWatch instruments; full src/js list in index.html order, minus DOM-only; Math.random seeded before eval via sim-harness).

## Metric review

- **Harness bug found and fixed in-run (harness-only, zero gameplay effect):** the first pilot pass omitted `ctx.conquestEvents = []` initialization — the verb-record push threw (caught), silently dropping all raid/answer/tend verb logs. Gameplay calls precede the push, so trajectories are unchanged. Fixed with a one-line init + comment, then RE-RAN all 4 seeds: summary stats identical to the first pass (same days, ends, waves, w3fights, pop — deterministic reproduction), and the verb logs now record 50/7/24/11 verbs per seed. The mercy measurements below come from the re-run; the first pass's numbers matched exactly.
- **Telemetry LOUD line, investigated, EXPLAINED, baseline NOT rolled:** `markerCounts.firstCourt` 5 → 1 (-80%). The baseline was seeded from a lead-road run; on the conquest road the national beat is the Iron Court, not the First Court — the single hit is 60004's d141 re-stage as a LEAD court answered 'feast'. Road difference, not a bug. The scale baseline is road-specific; future conquest runs should compare against a conquest-road reference, not this lead-road one. Proposal for r24: seed `scale-conquest.json` from this run's aggregate.
- **Harness gap documented (not fixed this run):** the conversation picker (ENGAGE lists) doesn't cover `speak_back` or `nv:*` choices, so two transcripts (Elif 60001-d140, Kairat 60004-d120) are zero-turn leaves against non-shared-language NPCs. The game content is real and wired (conversation.js: three speak-back bands with trust gains, journal entries, temperament-aware reactions — verified in source). Picker extension belongs to the conversation-depth lane (deepening r16 just touched the picker); filed here as a documented observation.
- **Tooling observation for the shared fight driver:** the r7-derived fight driver's `flee()` hammers `tbBarrierExit` and each failure emits a say-line into the capture — 60003 logged 4.58M `stalemateFled` increments and the capture flooded past the 1.5MB dump truncation (the JSON markers, computed on the full in-memory capture, stayed reliable). Deepening r16's consumed-push flee fix (committed to master) addresses exactly this; the journey-scale r-line scripts still carry the old driver. Suggest porting the fix to the shared driver or the scale scripts — not done here (scope; would change combat trajectories mid-run).
- M1's "structural blocker" framing held for 60002 (muster failures, not a bar problem — the honest non-staging path, same as r7's 9501).
- No metric revisions proposed for the leg question itself — the metrics measured what was asked.

## Metric verdicts (binding)

**Leg answer: YES — the kind answer is no longer a trap.** Post-grace, MERCY holds the war-realm for the promised season and a tending player earns the trust-40 bar; the one realm that dissolved did so exactly at grace expiry, aloud, one point short — and the same three fires were courted straight back into a lead realm two days later.

- **M1 staging — GO (3/4).** Iron Court staged by d140: 60001 d94, 60003 d108, 60004 d108. 60002 never staged: only 2 conquests ever held (d68 raid → link; d87/d94/d101 musters failed — pop/hp/pantry gates; d114 second link). The war-realm never reached 3 active conquered fires — the honest non-staging path (r7's 9501 pattern), not a bar bug.
- **M2 hold — GO.** Mercy seeds: 60001 held 59 game-days (d94→d153, national ON at end); 60004 held 31 game-days (d108→d139 dissolve at grace expiry, aloud); 60003 held 24 game-days until the village's honest combat death (national ON at death — the realm outlived the village). ≥half held ≥30d ✓.
- **M3 mechanics — GO.** Raids answered on 4/4 seeds (verb logs: 50/7/24/11 conquest verbs). Revolt/sabotage markers in the full capture on 60002/3/4; sabotage said aloud on 60004 ("Stonebridge's tribute arrives light — half the grain 'lost on the road.' Nobody believes it. Sabotage wears a thin mask."). Tend-climb: 15 tendLink verbs on 60003 (d108–d115); trust trajectories in the weekly mercyWatch (60001: 47/33/16 → 60/46/45; 60004: 50/29/46 → 65/39/54).
- **M4 people — GO.** 8 transcripts sense-read (60001 d80/d100/d120/d140, 60002 d100, 60003 d100, 60004 d80/d120), 0 senseless flags.
- **M5 winnable — GO (3/4).** 60001 + 60004 end with national held at d153; 60003 ends with national ON at its d132 death; 60002 survives d121 regional.

**The mercy arcs, in plain words:**
- **60001 — the clean hold.** Three raids (2 terms-yielded, 1 strike), mercy d94 at trusts 47/33/16 → +8 → 55/41/24 with mercyUntil=d124. The player tends; by grace expiry the links read 55/53/44 — all above the 40 bar. National holds through d153 (59 days). The beat's promise kept, verbatim.
- **60004 — the honest dissolve and the courtship rebound.** Three bloodless terms-yields, mercy d108 (50/29/46 → 58/37/54, grace to d138). Trust climbs to 65/43/53 by d133 — but one link dips to 39 at the d139 day-boundary check, one point short of 40. "◈ The realm came apart — no polity answers to Haven now, and Haven is a free fire again." Two days later the same three fires — now courtship links — stage a LEAD court, answered with a shared-granary FEAST. The war-realm dissolved; the relationships didn't.
- **60003 — the war road's price.** Four raids (all terms-yielded; one link revolted and broke aloud mid-run, re-raided d77). Mercy d108. Wave 4 unlocked on the war road (r7's secondary finding replicated). The village died in combat d131–132 with national ON — the realm outlived the village. 0 death-honesty mislabels.
- **60002 — the road not taken.** Two conquests, musters failing on strength gates, no court. Survived d121 as a regional free fire. The offer's absence is honest.

**Beat text (sense-read, committed):** the Iron Court staging ("The speakers of Stonebridge, Thornfield, Ashford kneel because they lost — not because they chose... the realm is listening for what kind of conqueror you are") and the mercy answer ("They might, in a season — the realm holds them one season on the yoke's shadow. Earn their trust to 40 by then, or it comes apart") both read as written drama, and the engine honored the promise exactly.

## Village assessments (plain words)

- **60001:** Eight alive at d153, wave 3, global (viewers 38), national ON. The war-realm held and the village thrived — Exaucee the paramedic, Wei the beekeeper, Zhibek the hunter among the living. 32 deaths across the run's succession chain, all recorded. A conqueror's village that learned to tend.
- **60002:** Seven alive at d121, wave 3, regional, national off. Ingrid the physical-therapy aide, Chantal the pharmacist, Jeptoo the nurse — a healer-heavy village that raided twice and couldn't muster a third war party. Never climbed; nobody starving.
- **60003:** Wiped d131–132 in wave-4 combat — the only seed to unlock wave 4, and the war road's combat ledger filled the gate that starved the diplomacy roads (r7's secondary, replicated). National was ON when the last villager fell. 34 deaths, every cause recorded, 0 mislabels. An honest ending.
- **60004:** Eight alive at d153, wave 3, global (viewers 35), national ON — via the dissolve-and-rebound: war-realm → free fire → lead realm in three days. Kairat the pottery instructor, Wanjiru the wild-food forager, Fumio the hunter. The village that lost a realm and courted it back.

## People check

8/8 transcripts sensical. The standouts: Felicia's seek_taken arc across three sittings (d80 promise → d100 teaching → d120 grief: "Hear me out — You're kind. Don't let this place change that." — the NPC reacting to the player's conquest); Lucia's ask_favor deflection with a real consequence ("...Okay. I'll figure it out. They won't ask twice."); Ingrid's restraint ("I don't talk about that... Someday. Not today."); Fumio's origin exchange ("I still dream in its weather... furious at the sky for the swap."). Two zero-turn leaves (Elif, Kairat) are honest no-shared-language encounters — the game's speak_back path is real but the harness never tries it (documented above).

## Blanks filled or documented

1. **CLOSED — r7's open item: the mercy grace re-measurement.** The kind answer is no longer a trap: 59d and 31d holds, one honest at-expiry dissolve, one hold-until-death. The MERCY-GRACE fix (58179595e-era) is verified on full runs, not just the proof test.
2. **DOCUMENTED — harness picker gap:** speak_back/nv:* never exercised (game content verified wired in source; picker extension is the conversation lane's).
3. **DOCUMENTED — shared fight-driver flee spam:** r-line scale scripts still carry the pre-r16 flee driver (4.58M barrier-hurl say-lines flooded one seed's capture past dump truncation). Suggest porting deepening r16's consumed-push fix to the shared driver.
4. **DOCUMENTED — scale telemetry baselines are road-specific:** the scale.json baseline (lead-road) flagged a LOUD deviation on a conquest run that was pure road difference. Proposal: seed scale-conquest.json from this run.

## Reachable / fun / winnable (scale leg)

- **Reachable:** the conquest road stages on 3/4 competent seeds (raids from d35, terms-first, Iron Court ~d94–108). The fourth seed's non-staging was honest (insufficient strength), not a wall.
- **Fun:** the Iron Court beats read as written drama; the mercy season is a real tending game with a visible trust clock; the dissolve-and-rebound arc (60004) is the system at its most alive. Rebellion/sabotage fire under trust<30 with said-aloud lines.
- **Winnable:** 3/4 villages reach d140+ or hold national at death; the war road uniquely feeds the wave-4 gate (60003). The mercy road converts conquest into a held realm — the "force, not climbing" path now has a playable on-ramp to national that holds.
