# Journey leg: ENDGAME (days 140+) — 2026-10-11 (run 3)

Rotation 4 → 5. Worktree `journey-endgame`. Stale-lock recovery: none needed
(no lock). Main tree untouched until landing.

## Mission

Play the endgame leg as a competent player. The endgame-table build (2026-10-11)
filed one gap for this loop: **verify with long sims that competent play lands
the lesser seat ~day 100–130, and retune the bars if not.**

## Method

- `scripts/sweep-winpath.js` (existing win-path funnel): 16 seeds × 200 days,
  policies `competent` (survival-focused) and `winseek` (deed-seeking).
- Targeted diagnostics for the feast-surge chain and the freeload exile.
- Proof test for the shareFood wiring fix.
- Table-scene transcript read (sense-check).

Canon read first: CANON.md, TABLE.md.

## Village assessment (plain words)

**Competent policy (16 seeds):** median 72d, max 111d. Villages die of combat
(69) and villager-combat (81) first, starvation (27) second. 15/16 reach arc 3,
0/16 reach arc 4. 8/16 unlock wave 3; 2/16 (seeds 10, 16) meet the 4/4/3
faced bar. 0/16 reach regional — the policy never pursues links. 0/16 reach
the lesser seat.

**Winseek policy (16 seeds, before fix):** median 42d. 11/16 reach regional
(the climb works when pursued). 0/16 lesser seat. Seed 12 diagnosed: exiled
day 17 for freeloading (20k takes / 0 gives by day 22), which blocked the
feast road entirely.

**Winseek (after fix):** median 41d, 10/16 regional, 0/16 lesser seat.
The exile is gone; the feast buff now grants (5× on seed 12) but is never
used in combat.

## Blanks filled

### 1. shareFood() wired (GAME FIX)

The ledger's `shareFood(kcal, toName)` had ZERO callers (UNWIRED 2026-10-08).
Donations built trust but never the moral ledger (`foodShared`/`foodStance`)
that the table prices on. The beats describe feeding ("for the winter you
fed us"), but only teaching moved the number.

**Wired:** `donateToPantry` (game.js), `giveFood` base (game.js), carexplore.js
`giveFood` override (the live path). The automatic homecoming pool split stays
unwired BY DESIGN: "We pool food here" is the standing custom — norms don't
move the moral ledger, or 'sharer' would be automatic.

**Contract:** <200 kcal = not a real gift (matches the generous-XP bar);
1 point per 1000 kcal; village-memory moment only at ≥1000 kcal (moments cap
at 30 and each nudges viewership +1 — a moment per gift would flood both).

**Proof:** `scripts/test-sharefood-wiring-20261011.js` — 12/12.
Regressions: test-table-core 31/31, test-ledger 93/95 (2 pre-existing mantle
failures, documented in endgame-table.md), ontology 83/83.

### 2. winseek policy: freeload exile (POLICY FIX)

Winseek never donated (no haul — it fights instead of foraging), so the
freeload pipeline correctly exiled it (takes 20k, gives 0). The exile is
legitimate — the village is right to exile a non-contributing eater — so the
fix is in the policy, matching the scale-leg precedent (d9d2bcc4).

**Fixed:** huntPatrol and feastRoad now skip when the player is a net drain
(>3000 kcal). The policy contributes first, deed-seeks second.

### 3. winseek policy: feastRoad string-check bug (POLICY FIX)

`feastRoad` checked `typeof r === 'string' && r.indexOf('held') >= 0`, but
`hostFeast()` returns `{ok: true, ...}`. `_lastFeastDay` never set → the
policy feasted DAILY (50 attempts in one run), draining the pantry. Fixed to
`r && r.ok`. Now weekly as intended.

### 4. winseek policy: feast→fight coordination (POLICY)

After a feast grants the buff, `feastFight` patrols while feasted (the window
decays at dawn). Previously: 5 granted buffs, 0 used — the policy feasted
then slept.

## Reachability verdict: lesser seat

**0/48 runs** (16 competent + 32 winseek) reach the lesser seat. Bar-by-bar:

| Bar | Competent | Winseek | Notes |
|-----|-----------|---------|-------|
| waves 4/4/3 | 2/16 | 0/16 | wave-3 fights are the bottleneck |
| contests 2+ | 3/16 | 3/16 | reachable but unreliable |
| crises 2+ | 16/16 | 16/16 | easy |
| regional | 0/16 | 10/16 | policy gap, not game gap |
| stage ≥2 | 16/16 | 16/16 | easy |
| food deeds | 0/16 | 0/16 | feastSurgeUsed never; sentiment 16/16 |

**feastSurgeUsed analysis:** The MECHANIC is proven (unit test: arm → grant →
combat → strike marks it). The 3-step chain (channel keepsakes → host feast →
fight before dawn) is too hard for the policy to hit reliably. A real player
COULD do it, but 0/48 suggests the bar is overtuned for "competent non-god
play." **Design call for Steve:** lengthen the buff window, or soften the
lesser-seat food-deed bar.

**Wave-3 fights:** Competent gets 2/16 to 3 distinct wave-3 fights; winseek
0/16 (dies faster). The wave-3 unlock pacing + survival is the other binding
constraint.

## People check (transcript read)

**Table scene (lesser seat, synthetic):** The System voice lands. "◈ THE TABLE
— it is not a table. It's a ring of pale light, and around it, things with
too many angles to be faces... 'HUMANITY PRESENTS ITS CASE.'" The audit reads
the run aloud with real numbers. All 7 paths named and priced (◈/◇) in the
prompt; only earned ones are clickable. The Assimilated path: "Comfort, on
their terms... It's such a gentle trap. That's what makes it a trap." Beats
have meaning (kitchens/archives/nurseries). **Passes the sense test.**

## Verdict: reachable / fun / winnable

- **Reachable: NO.** 0/48 reach the lesser seat. The road exists (regional
  10/16, waves 2/16, contests 3/16) but the bars don't close. Binding:
  feastSurgeUsed (0/48) and wave-3 fights.
- **Fun: YES.** The table scene, the audit, the 7 paths — the writing is
  strong and the System voice is distinct. The problem is access, not quality.
- **Winnable: not demonstrated.** No seed reached the table.

## Files

- Fix: `src/js/ledger.js` (shareFood contract + wiring), `src/js/game.js`
  (donateToPantry, giveFood), `src/js/carexplore.js` (override)
- Proof: `scripts/test-sharefood-wiring-20261011.js` (12/12)
- Policy: `scripts/policies/winseek.js` (drain gate, feast string fix,
  feastFight coordination)
- Ontology: `docs/ONTOLOGY.md` (auto-regenerated)
- Sweeps: /tmp/wp-endgame-r3.json (competent), /tmp/wp-endgame-r3b.json
  (winseek fixed), /tmp/wp-endgame-r3c.json (winseek morning-feast experiment,
  reverted — hurt survival)
