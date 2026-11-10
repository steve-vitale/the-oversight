# OVE-101 — God army-scale wiring classify

**Verdict:** `GOD_ARMY_SCALE_PARTIAL`

**Tip:** PR #74 `cursor/ove-97-dialog-tip-sampler-5901` @ `b114f39c056d22d6a0ae1d5b884c859dbc73dd9f`
**Branch:** `cursor/ove-101-god-army-scale-classify-0489`
**Scope:** classify / evidence only. No Game, Muse, or policy edits.

## Finding

- `god.scale.army` is unread for settlement (copied in `godhood.js`; asserted present by `validate.js`).
- Ascended-god army effects that change play are fight-local verb hooks, not coalition logistics:
  - Shepherd: LIVE\* multi-echo in titan fights (`ARMY/TITAN` proof).
  - Garden / Voice: OVERLAP — Haven feed / Be Heard day-rally also buffs `isOurs` coalition blades in fights; foreign villages and march upkeep unwired.
- Titan/Network/Finale muster has no ascended-god lean.
- 7/10 army prose lines remain TEXT-only.

## Census (army axis only)

| God | Class |
|---|---|
| one_person_army | TEXT |
| undying_ward | TEXT |
| apex_predator | TEXT |
| shepherd_of_the_dead | LIVE\* (fight-local) |
| the_between | TEXT |
| all_seeing | TEXT |
| voice_of_the_relay | OVERLAP (Haven, not foreign villages) |
| unkillable | TEXT |
| market_god | TEXT |
| living_garden | OVERLAP (Haven mouths + fight fed; not 50-mouth march engine) |

## Recommended next wiring slice

Voice of the Relay Be Heard → linked/allied foreign villages same day.
Orthogonal to OVE-99 Garden feast contest lean. Do not retarget Shepherd/Garden fight-local hooks.

## Store result

Project `docs/ove-101-god-army-scale-classify-result.md`
