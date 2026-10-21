# sim-killtime — kill-time attribution census (flesh-out loop, run fleshout-20261021T0915Z, axis scale-onramp)

Backlog #753 (measurement correction, filed by sim-twovets-r2). The veteran-channel discipline — "scholar wave-4 kills = 0, villager wave-4 kills = N" — rested on waveKillLog attribution using END-OF-RUN Game.villagerId. Succession churn is heavy on the winning substrate (s64712: 6 bearer changes by d87) and s64712's d74 "scholar" wave-4 kill was actually by ethan_hunt while the bearer was caleb_jones — a COMPANION kill misattributed as scholar (the killer only became scholar at d87). Instrument: scripts/killtime-census-20261021.js on top of killdisc v1/v2 (pure reads, zero game-state writes, zero RNG draws; zero src/js; no policy changes). Daily bearer-vid census; every waveKillLog w>=4 entry (day, by) joined against THAT DAY's census — never the end-of-run roster. The killdisc instrument's own kill-time ctx.scholarVid (captured at the exact kill moment) cross-checks the daily census; on disagreement the exact capture wins and the disagreement is flagged.

Canon: docs/CANON.md + docs/MONSTER-WAVES.md (wave-5 readiness gate; VILLAGER XP LAW — villager kills score the ledger exactly like the player's). No doc covers the attribution instrument itself — it is measurement tooling, not game canon; said here instead of inventing.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9-12, 14-15 — written BEFORE the re-runs)

**PRIMARY (DIAG-GO):** the s64712 phantom case attributes correctly (kill -> ethan_hunt, companion) AND every wave-4+ kill in the twovets corpus is attributed with 0 unexplained (kill with day+mid but unresolvable wave, or join failure), 0 instrumentErrors.
**GO:** known-case GREEN + 100% attribution on the twovets corpus + corrected counts filed.
**Minimum:** the twovets corpus fully processed. vgearconfirm = secondary; if its per-seed evidence can't be joined, document the gap and re-run or report the limitation (never silently drop).
**DELIVERABLE:** corrected veteran-channel numbers for both corpora (scholar wave-4 kills, villager wave-4 kills, per-arm) + CLAIM-FLIP VERDICT: does any published claim change? (twovets: "0 scholar wave-4 kills in 16 armed runs"; vgearconfirm: "4/16 vs 0/16, GO" — state whether the verdicts hold under kill-time attribution.) If a published GO flips, FAIL LOUD.
**Policies/substrate:** match each corpus exactly (twovets: VCE vs TV stacks, env FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1; vgearconfirm: per its evidence file). Sweep FAILS LOUD on env mismatch.
**§15 note:** no before/after — measurement correction, not a lever. Note #752's mislabel ("playerDeaths" in the panel contract is computed as total combat deaths) wherever playerDeaths appears; the contract is NOT changed (Steve's call).

## Proof (scripts/test-killtime-20261021.js)

Gates: E0 shape (5/5); E1 det-gate — killtime-on vs off byte-identical trajectories, 2 seeds x 60d on the vgear substrate (noinstr-vs-noinstr stability pre-check per repo standard), census populated, 0 instrumentErrors; E2 env-gate — the sweep exits 2 with "SWEEP STOP" on env mismatch (proven by running it with KILLDISC unset); E3 read-only static scan — zero RNG draws, zero Game-state writes outside the install-time Game.sleep wrapper replacement, no empty catches; E4 RED->GREEN synthetic fixtures — forged succession (killer becomes scholar AFTER the kill day) attributes to the killer under kill-time and flips under end-of-run; unresolvable-wave and missing-census-day kills go `unexplained` with honest reasons; killdisc ctx.scholarVid fallback rescues census gaps; E5 KNOWN-CASE — the corpus-faithful s64712 anchor re-run: the d134 Zoey kill flips (end-of-run says villager since end-scholar is ethan_hunt; kill-time says scholar since the kill-day bearer was Zoey), 0 unexplained, 0 instrumentErrors, kill rows byte-match the corpus.

**Result: 38/38 PASS, 0 fail** (log: /tmp/killtime-proof7.log — rerun: `FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 node scripts/test-killtime-20261021.js`). All gates green BEFORE the corpus re-runs, per protocol.

## Corpus re-runs (scripts/sweep-killtime-20261021.js → evidence/2026-10-21/perseed-killtime/)

The landed per-seed corpora are aggregate-only (no waveKillLog, no daily census), so every kill-bearing config was re-run with the killtime census instrument. **Corpus-faithful bases:** re-runs execute at each corpus's own anchor commit in scratch registered trees (killtime-anchor-v @ 0713c9398beb for vgearconfirm; killtime-anchor-t @ 9c634ebac2e6 for twovets) — current HEAD's trajectory for s64712 vgear-leadfeast dies at d48 vs the corpus's d142 win, so current-HEAD re-runs are NOT corpus-faithful. The scratch trees carry only uncommitted scratch copies of the instrument + runner (+ vgearconfirm.js policy, byte-identical to the landed one); they are released at closeout, nothing commits from them.

- twovets: 4 control kill-bearing configs re-run (control = VCE.armedFor VGEAR=1 stack; ARM=vgear in the runner). The armed config is NOT re-runnable — twovets.js was deleted per kill protocol; its single kill (Nikos d75 via=companion) is attributed from the corpus's own kill-time bearerAtKill (ava_garcia), stated explicitly.
- vgearconfirm: all 10 kill-bearing configs re-run (1 control + 9 armed) + all 4 s64712 configs (phantom hunt).
- **Fidelity: 17/17 re-run kill rows byte-match the corpus kill rows (day/mid/by/via).** The instrument perturbs nothing and the re-runs ARE the corpus runs.
- **Attribution: 20/20 wave-4+ kill rows attributed, 0 unexplained, 0 instrumentErrors** (twovets 7/7 re-run + 1/1 corpus-armed; vgearconfirm 13/13).
- 2 day-boundary successions caught by the ctx cross-check (censusMismatch: s64710 d96 — bearer changed mid-day, exact kill-time capture used; s64843 d111 — same). 0 via/vid disagreements: **the game's via channel is fully honest** (via=player ⟺ killer was the bearer that day, in all 20 rows).

## Corrected numbers (scripts/analyze-killtime-20261021.js)

| corpus | arm | end-of-run attribution | kill-time attribution |
|---|---|---|---|
| twovets (16 runs/arm) | control | 2 scholar / 5 villager | **5 scholar / 2 villager** (Phimpa, Brian) |
| twovets | armed | — | **0 scholar / 1 villager** (Nikos) |
| vgearconfirm (32 runs/arm) | control | 1 scholar / 0 villager | **1 scholar / 0 villager** |
| vgearconfirm | vgear | 2 scholar / 10 villager | **7 scholar / 5 villager** (Victor, Fatima, Devon, Nolan, Asiri) |

Flips found (all villager→scholar under end-of-run misattribution; kill-time correct):
- twovets control: Elif d79, Catalina d99, Ava d75 (via=player kills by the kill-day bearer; succession later moved the mantle).
- vgearconfirm armed: Marcus d75, Mateo d61, Zoey d134, Mykola d96, Ingrid d81 (same pattern).
- s64712 vgear-leadfeast d134 (Zoey, via=player): end-of-run scholar is ethan_hunt (mantle at d142) — end-of-run attribution would call Zoey's scholar kill a VILLAGER kill. Kill-time: scholar. The phantom's own seed, the same person, the same succession mechanism — opposite direction.

## CLAIM-FLIP VERDICT

1. **twovets "0 scholar wave-4 kills in 16 armed runs": HOLDS.** Kill-time confirms 0/16 (1 genuine villager kill by Nikos). The published numbers were already kill-time (bearerAtKill) — confirmed, not changed.
2. **vgearconfirm GO "2/16 vs 0/16": HOLDS.** The primary is the w5vetsMax readiness census, independent of kill attribution. No re-score.
3. **vgearconfirm "5 villager wave-4 kills (via=companion)": CONFIRMED.** All 5 via=companion kills were by non-bearers at kill time (Victor, Fatima, Devon, Nolan, Asiri).
4. **vgearconfirm "the scholar's own wave-4 kill supplied the other veteran slot": CONFIRMED.** All 7 via=player kills were by the kill-day bearer — genuine scholar kills.
5. **The open finding is CLOSED with no flip:** the landed vgearconfirm corpus carries NO phantom scholar kills. The naive end-of-run reading (10 villager / 2 scholar) was wrong; the published via-based reading (5/7) was already honest.

**No published GO flips. No FAIL LOUD required.** The arm's most important output is that the worry was unfounded — the veteran-channel numbers stand.

## The s64712 phantom (known-case) — honest accounting

The literal d74 ethan_hunt companion kill from the twovets-r2 diag is **not reproducible**: it exists in neither the corpus trajectory at the vgearconfirm anchor (that run has a single d134 kill) nor on current HEAD (the run dies at d48). It was observed on the twovets-r2 rebase-window base, whose trajectory no longer exists on any available base. What IS proven:
- (a) E4 synthetic RED→GREEN on the exact phantom shape (d74, by=ethan_hunt via=companion, bearer caleb_jones, end-scholar ethan_hunt): end-of-run says scholar (RED), kill-time says companion (GREEN), flip recorded.
- (b) The real s64712 run's d134 kill demonstrates the identical mechanism with the identical person: end-of-run scholar IS ethan_hunt, and end-of-run attribution misattributes Zoey's scholar kill — kill-time corrects it.
- (c) 8 real flips across both corpora, all succession-churn artifacts, all corrected.

## Sense-testing

The flips read as the village-as-protagonist story, not artifacts: s64843 — Elif takes the mantle d34, kills the Strike d79 as the scholar; Catalina takes it d85, kills d99; Farid takes it d111 and kills the same day. Successions are the fiction; the instrument follows the mantle, not the person. No robotic or repeated patterns in the attribution itself.

## Metric review (§14)

1. **Known-case prong (partial):** the literal phantom is base-specific and unreproducible; the mechanism is proven three ways (E4 synthetic, real s64712 d134 flip, 8 corpus flips). The DIAG-GO's letter ("phantom attributes correctly") is satisfied on the mechanism; the instance is documented as unrecoverable. Proposed: no revision — future diag finds should pin the base commit in the finding.
2. **Fresh verification sweep (8 seeds 64911–64918): NOT run — decision documented.** The brief allowed it only if instrument-vs-corpus agreement needed it. Agreement is 17/17 kill-row fidelity, 0 unexplained, 0 instrumentErrors, 0 via disagreements. A fresh sweep would measure a new sample, not correct the corpora — out of scope for a measurement-correction arm.
3. **#752 panel "playerDeaths" mislabel:** this arm runs no panel (§15: no before/after — measurement correction, not a lever). The mislabel is noted here per the brief; the contract is unchanged (Steve's call).
4. **Twovets-armed re-run impossibility:** documented, not a gap — the corpus's own kill-time bearerAtKill covers the single kill; re-running would require resurrecting kill-protocol-deleted code.

## Phantom-hunt confirmation (independent verification, same run)

The brief authorized one re-run of s64712 with the instrument to reproduce the literal d74 ethan_hunt companion kill. The original arm concluded the trajectory existed only on a transient "rebase-window" base. An independent re-run was attempted on the twovets-r2 base itself (9c634ebac, the base named in sim-twovets.md's header), all 4 s64712 configs, scratch tree `killtime-anchor9` (released at closeout), vgearconfirm substrate env FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 KILLDISC=1 (VGEAR=1 on armed). Per-seed JSONs: evidence/2026-10-21/perseed-killtime/{control,vgear}-{leadfeast,belongfeast}-s64712-9c634ebac.json.

**Result: the literal d74 ethan_hunt kill does not reproduce on 9c634ebac either.** Trajectories diverge by base (control-belongfeast won at d122 with 2 wave-4 kills; on the vgearconfirm anchor the same config had 0). The same succession-churn misattribution mechanism fires on this base, in both directions of the phantom family:
- control-belongfeast-s64712: Benoit takes the mantle d66, kills the Influencer d97 AND d108 as the scholar; Habiba d109, Yuki d118 (end). End-of-run attribution says "villager" (end-scholar Yuki); kill-time says scholar. 2 flips, 0 unexplained, 0 errors.
- vgear-leadfeast-vgear-s64712: Caleb takes the mantle d72, kills the Algorithm d73 as the scholar; Nandini d82 (end). End-of-run says "villager"; kill-time says scholar. 1 flip, 0 unexplained, 0 errors. (Caleb-as-bearer-at-kill echoes the phantom's shape — caleb_jones was the kill-day bearer in the original d74 report — but the killer here is Caleb himself, via=player, not ethan_hunt.)
- control-leadfeast-s64712: village lost d55, 0 wave-4 kills. vgear-belongfeast-vgear-s64712: village lost d44, 0 wave-4 kills.

**Verdict: the metric-review item 1 conclusion stands, independently confirmed on a second base.** The d74 ethan_hunt trajectory is transient (observed in the twovets-r2 rebase window, unrecoverable on 9c634ebac, 0713c9398beb, or current HEAD). The mechanism is now proven on three bases: E4 synthetic fixture, the vgearconfirm-anchor corpus (8 flips), and 9c634ebac (3 flips). The DIAG-GO letter remains satisfied on the mechanism.

## Convergence

`converged` for backlog #753 (measurement correction): the instrument exists, is proven (38/38 proof gates green), both corpora are re-attributed with 0 unexplained / 0 errors, corrected numbers are filed, and no published claim flips. The veteran-channel numbers the scale-onramp axis reasons about are now kill-time honest. #753 → fixed.
