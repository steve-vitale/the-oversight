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
  s69009 leadfeast: dip 0 -> 170 (diff +170) | post-form diss 2 -> 0 | tends 13+0 -> 46+19 | days 122 -> 121
  s69010 leadfeast: dip 102 -> 170 (diff +68) | post-form diss 0 -> 0 | tends 30+0 -> 7+21 | days 179 -> 131
  s69011 leadfeast: dip 102 -> 102 (diff +0) | post-form diss 0 -> 0 | tends 62+0 -> 55+7 | days 180 -> 180
  s69012 leadfeast: dip 170 -> 102 (diff -68) | post-form diss 0 -> 0 | tends 72+0 -> 12+15 | days 181 -> 98
  s69001 belongfeast: dip 136 -> 136 (diff +0) | post-form diss 1 -> 0 | tends 68+0 -> 2+24 | days 151 -> 124
  s69002 belongfeast: dip 102 -> 102 (diff +0) | post-form diss 0 -> 0 | tends 16+0 -> 62+10 | days 94 -> 181
  s69003 belongfeast: dip 0 -> 0 (diff +0) | post-form diss 0 -> 0 | tends 0+0 -> 0+0 | days 55 -> 55
  s69004 belongfeast: dip 102 -> 102 (diff +0) | post-form diss 0 -> 0 | tends 45+0 -> 27+14 | days 181 -> 139
  s69005 belongfeast: dip 0 -> 170 (diff +170) | post-form diss 1 -> 0 | tends 12+0 -> 41+26 | days 83 -> 140
  s69006 belongfeast: dip 102 -> 136 (diff +34) | post-form diss 0 -> 0 | tends 36+0 -> 21+9 | days 88 -> 175
  s69007 belongfeast: dip 0 -> 0 (diff +0) | post-form diss 1 -> 0 | tends 13+0 -> 0+6 | days 175 -> 132
  s69008 belongfeast: dip 102 -> 136 (diff +34) | post-form diss 0 -> 0 | tends 22+0 -> 22+17 | days 131 -> 99
  s69009 belongfeast: dip 0 -> 170 (diff +170) | post-form diss 2 -> 0 | tends 13+0 -> 46+19 | days 122 -> 121
  s69010 belongfeast: dip 102 -> 170 (diff +68) | post-form diss 0 -> 0 | tends 30+0 -> 7+21 | days 179 -> 131
  s69011 belongfeast: dip 102 -> 102 (diff +0) | post-form diss 0 -> 0 | tends 62+0 -> 55+7 | days 180 -> 180
  s69012 belongfeast: dip 170 -> 102 (diff -68) | post-form diss 0 -> 0 | tends 72+0 -> 12+15 | days 181 -> 98

## PRIMARY (binding): post-formation dissolution events (revised classifier: single-day dip drop magnitude >= 102 after formation)
control 10 vs armed 0. GO bar: armed < baseline.
VERDICT: GO — bar met

## SECONDARY: mean end dip per config
armed mean - control mean = 34.0 dip points. GO bar: >= +34 (one full link).
VERDICT: GO
per-policy: leadfeast mean-diff 34.0, belongfeast mean-diff 34.0

## mechanism engagement (the delta must engage)
tended totals — control: 778 (loop) + 0 (buffer, must be 0) | armed: 590 (loop) + 336 (buffer delta)
control buffer tends = 0 — the delta is armed-only, as designed.
delta ENGAGED: 336 buffer tends fired on the armed leg.

## dip-step classifier reconciliation
every recorded dip step named (formation/dissolution/seasoning/war-composite); 0 composite-34 steps needing names.

## GUARDRAILS
median survival paired diff: -14d (bar: >= -15d) — PASS
starvation deaths: control 20 vs armed 14 (bar: <= control+2) — PASS
death kinds: control {monster:34, starvation:20, villager combat:246, combat:640, expedition:34, contest:14, Big Loud:2, sickness:8, thirst:8, a wound that wouldn't close:6, dehydration:4, ambush:8, the night:2, lockjaw:2}
death kinds: armed   {monster:40, starvation:14, villager combat:218, combat:630, expedition:26, sickness:6, thirst:6, a wound that wouldn't close:2, dehydration:4, contest:8, ambush:8}
no new death kinds (2-event rule) — PASS
wall control: national 16/24 | table 14/24 | wins 0/24 | wave4 0/24 | wave5 0/24 | median 141d
wall armed: national 20/24 | table 18/24 | wins 0/24 | wave4 0/24 | wave5 0/24 | median 131.5d
