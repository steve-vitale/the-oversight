# trustbuffer paired comparison (the §15 instrument attachment)

Per-config (seed, policy, control-dip, armed-dip, diff, post-form dissolutions control|armed, tends control|armed+buffer):
  s69001 leadfeast: dip 136 -> 136 (diff +0) | post-form diss 1 -> 0 | tends 68+0 -> 2+24 | days 151 -> 124
  s69002 leadfeast: dip 102 -> 102 (diff +0) | post-form diss 0 -> 0 | tends 16+0 -> 62+10 | days 94 -> 181
  s69003 leadfeast: dip 0 -> 0 (diff +0) | post-form diss 0 -> 0 | tends 0+0 -> 0+0 | days 55 -> 55
  s69004 leadfeast: dip 102 -> 102 (diff +0) | post-form diss 0 -> 0 | tends 45+0 -> 27+14 | days 181 -> 139
  s69005 leadfeast: dip 0 -> 170 (diff +170) | post-form diss 1 -> 0 | tends 12+0 -> 41+26 | days 83 -> 140
  s69006 leadfeast: dip 102 -> 136 (diff +34) | post-form diss 0 -> 0 | tends 36+0 -> 21+9 | days 88 -> 175
  s69007 leadfeast: dip 0 -> 0 (diff +0) | post-form diss 1 -> 0 | tends 13+0 -> 0+6 | days 175 -> 132
  s69008 leadfeast: dip 102 -> 136 (diff +34) | post-form diss 0 -> 0 | tends 22+0 -> 22+17 | days 131 -> 99
  s69001 belongfeast: dip 136 -> 136 (diff +0) | post-form diss 1 -> 0 | tends 68+0 -> 2+24 | days 151 -> 124
  s69002 belongfeast: dip 102 -> 102 (diff +0) | post-form diss 0 -> 0 | tends 16+0 -> 62+10 | days 94 -> 181
  s69003 belongfeast: dip 0 -> 0 (diff +0) | post-form diss 0 -> 0 | tends 0+0 -> 0+0 | days 55 -> 55
  s69004 belongfeast: dip 102 -> 102 (diff +0) | post-form diss 0 -> 0 | tends 45+0 -> 27+14 | days 181 -> 139
  s69005 belongfeast: dip 0 -> 170 (diff +170) | post-form diss 1 -> 0 | tends 12+0 -> 41+26 | days 83 -> 140
  s69006 belongfeast: dip 102 -> 136 (diff +34) | post-form diss 0 -> 0 | tends 36+0 -> 21+9 | days 88 -> 175
  s69007 belongfeast: dip 0 -> 0 (diff +0) | post-form diss 1 -> 0 | tends 13+0 -> 0+6 | days 175 -> 132
  s69008 belongfeast: dip 102 -> 136 (diff +34) | post-form diss 0 -> 0 | tends 22+0 -> 22+17 | days 131 -> 99

## PRIMARY (binding): post-formation dissolution events (revised classifier: single-day dip drop magnitude >= 102 after formation)
control 6 vs armed 0. GO bar: armed < baseline.
VERDICT: GO — bar met

## SECONDARY: mean end dip per config
armed mean - control mean = 29.8 dip points. GO bar: >= +34 (one full link).
VERDICT: NO-GO
per-policy: leadfeast mean-diff 19.8, belongfeast mean-diff 19.8

## mechanism engagement (the delta must engage)
tended totals — control: 424 (loop) + 0 (buffer, must be 0) | armed: 350 (loop) + 212 (buffer delta)
control buffer tends = 0 — the delta is armed-only, as designed.
delta ENGAGED: 212 buffer tends fired on the armed leg.

## dip-step classifier reconciliation
every recorded dip step named (formation/dissolution/seasoning/war-composite); 0 composite-34 steps needing names.

## GUARDRAILS
median survival paired diff: -13.5d (bar: >= -15d) — PASS
starvation deaths: control 16 vs armed 14 (bar: <= control+2) — PASS
death kinds: control {monster:10, starvation:16, villager combat:160, combat:378, expedition:24, contest:12, Big Loud:2, sickness:6, thirst:6, a wound that wouldn't close:2, dehydration:2, ambush:4, the night:2}
death kinds: armed   {monster:30, starvation:14, villager combat:136, combat:414, expedition:18, sickness:6, thirst:6, a wound that wouldn't close:2, dehydration:2, contest:8, ambush:4}
no new death kinds (2-event rule) — PASS
wall control: national 10/16 | table 10/16 | wins 0/16 | wave4 0/16 | wave5 0/16 | median 112.5d
wall armed: national 12/16 | table 12/16 | wins 0/16 | wave4 0/16 | wave5 0/16 | median 135.5d
