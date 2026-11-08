# One-Person Army / outmatched_kill — seeded attainment panel

Measure-only. No combat, food, garden, region, or Muse policy retunes.

## Identity

| Field | Value |
|---|---|
| Tip | `origin/master` at branch cut `a038cf151` (dawn honesty #30 present) |
| Script | `scripts/godpath/test-one-person-army-deed-attainment.js` |
| Seeds | screening 16: `7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9` |
| Authored deed | `outmatched_kill` — alone, take a real wound from a foe that opened above your full HP bar, then kill it |
| Raw | `evidence/2026-11-08/one-person-army-deed-attainment-panel.{json,log}` |
| Companion unit | `scripts/godpath/test-brawler-deed.js` (36/0) |

## Verdict

**Hardness, not missing wiring.**

The gate is live: stripping the authored deed restores synergy proxies (failing
control 16/16), and stripping `finishApexHunt` earns no book on a prepared kill
(16/16). Prepared juggernaut bloodied solo clears the deed and ascends
One-Person Army 16/16. Weaker body, unbloodied kill, and helper each void it
16/16. A short natural juggernaut lean (21 endDays, juggernaut kit, no prepared
outmatched fight) never observes, completes, or ascends (0/16). That matches
prove-out baseline census #2: juggernaut seen once, `one_person_army` holders
zero — class path is rare and the lived fight is the bottleneck, not an unwired
deed. Do not retune combat from this panel.

## Panel summary (16/16)

| Arm | Result |
|---|---|
| Wiring armed blocks synergy proxy | 16/16 |
| Failing control: deed removed → synergy opens | 16/16 |
| Restored deed blocks again | 16/16 |
| Failing control: strip `finishApexHunt` → no book | 16/16 |
| Prepared juggernaut bloodied solo → complete + ascend | 16/16 |
| Hardness: weaker / unbloodied / helper void | 16/16 each |
| Natural lean complete / ascended / observed | **0 / 0 / 0** |

## Hardness shape (why juggernaut almost never gods)

1. Opening prey HP must exceed the fighter's opening **maximum** HP on a fresh
   (unwounded) body — already-wounded door re-entries do not count.
2. The fighter must take actual damage (`_taken` / field `vTaken`) before the
   kill; an unbloodied solo earns nothing.
3. Any helper voids it (present companion, field support). No Pack Hunt route
   (unlike `apex_hunt`).
4. Class opportunity itself is rare on the prove-out bank (`juggernaut` 1/64);
   even with a forced juggernaut kit for 21 days, the world does not hand the
   bloodied outmatched solo.

Combat calibration and policy lean stay **Muse**. Optional follow-up: typed
`godpath_deed` event-id census on a full campaign panel (instrument).
