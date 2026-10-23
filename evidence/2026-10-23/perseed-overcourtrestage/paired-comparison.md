# overcourtrestage paired comparison (the §15 instrument attachment)

Per-config (seed, policy, control-dip, armed-dip, diff, post-form dissolutions control|armed):
  s68901 leadfeast: dip 102 -> 0 (diff -102) | post-form diss 0 -> 1 | days 180 -> 142
  s68902 leadfeast: dip 0 -> 0 (diff +0) | post-form diss 0 -> 1 | days 94 -> 106
  s68903 leadfeast: dip 102 -> 0 (diff -102) | post-form diss 0 -> 0 | days 94 -> 73
  s68904 leadfeast: dip 102 -> 0 (diff -102) | post-form diss 0 -> 0 | days 148 -> 117
  s68905 leadfeast: dip 0 -> 0 (diff +0) | post-form diss 1 -> 0 | days 181 -> 113
  s68906 leadfeast: dip 0 -> 0 (diff +0) | post-form diss 1 -> 0 | days 161 -> 177
  s68907 leadfeast: dip 0 -> 136 (diff +136) | post-form diss 1 -> 0 | days 92 -> 123
  s68908 leadfeast: dip 102 -> 102 (diff +0) | post-form diss 0 -> 0 | days 109 -> 85
  s68909 leadfeast: dip 102 -> 0 (diff -102) | post-form diss 0 -> 1 | days 151 -> 174
  s68910 leadfeast: dip 102 -> 170 (diff +68) | post-form diss 0 -> 0 | days 136 -> 181
  s68911 leadfeast: dip 102 -> 102 (diff +0) | post-form diss 0 -> 0 | days 111 -> 158
  s68912 leadfeast: dip 102 -> 170 (diff +68) | post-form diss 0 -> 0 | days 110 -> 180
  s68901 belongfeast: dip 0 -> 0 (diff +0) | post-form diss 0 -> 1 | days 177 -> 142
  s68902 belongfeast: dip 0 -> 0 (diff +0) | post-form diss 0 -> 1 | days 111 -> 106
  s68903 belongfeast: dip 0 -> 0 (diff +0) | post-form diss 0 -> 0 | days 102 -> 73
  s68904 belongfeast: dip 34 -> 0 (diff -34) | post-form diss 0 -> 0 | days 181 -> 117
  s68905 belongfeast: dip 0 -> 0 (diff +0) | post-form diss 0 -> 0 | days 150 -> 113
  s68906 belongfeast: dip 34 -> 0 (diff -34) | post-form diss 0 -> 0 | days 90 -> 177
  s68907 belongfeast: dip 0 -> 136 (diff +136) | post-form diss 0 -> 0 | days 108 -> 123
  s68908 belongfeast: dip 0 -> 102 (diff +102) | post-form diss 0 -> 0 | days 119 -> 85
  s68909 belongfeast: dip 0 -> 0 (diff +0) | post-form diss 0 -> 1 | days 103 -> 174
  s68910 belongfeast: dip 34 -> 170 (diff +136) | post-form diss 0 -> 0 | days 94 -> 181
  s68911 belongfeast: dip 0 -> 102 (diff +102) | post-form diss 0 -> 0 | days 141 -> 158
  s68912 belongfeast: dip 0 -> 170 (diff +170) | post-form diss 0 -> 0 | days 101 -> 180

## PRIMARY (binding): mean end dip per config
armed mean - control mean = 18.4 dip points. GO bar: >= +34 (one full link).
VERDICT: NO-GO — bar missed (a miss is NO-GO, never re-scored §14)
per-policy: leadfeast mean-diff -11.3, belongfeast mean-diff 48.2

## SECONDARY: post-formation dissolution events
control 3 vs armed 6. GO bar: armed < baseline.
VERDICT: NO-GO

## dip-step classifier reconciliation
LOUD: 4 configs have 34-multiple steps needing names: [{"seed":68904,"arm":"armed","pol":"leadfeast","steps":[{"day":111,"step":-136,"cls":"composite-34","note":"34-multiple -136 (needs naming)"}]},{"seed":68906,"arm":"armed","pol":"leadfeast","steps":[{"day":138,"step":-136,"cls":"composite-34","note":"34-multiple -136 (needs naming)"}]},{"seed":68904,"arm":"armed","pol":"belongfeast","steps":[{"day":111,"step":-136,"cls":"composite-34","note":"34-multiple -136 (needs naming)"}]},{"seed":68906,"arm":"armed","pol":"belongfeast","steps":[{"day":138,"step":-136,"cls":"composite-34","note":"34-multiple -136 (needs naming)"}]}]

## GUARDRAILS
median survival paired diff: 13.5d (bar: >= -15d) — PASS
starvation deaths: control 8 vs armed 8 (bar: <= control+2) — PASS
death kinds: control {villager combat:212, monster:42, combat:674, expedition:62, the expedition:2, ambush:13, contest:11, alien:1, starvation:8, sickness:6, lockjaw:1, Big Loud:1, Speedbump:2, a wound that wouldn't close:4, Choir Toad:1, Inspiration:2, The Callback:1, The Understudy:1, experiment:1, The Reunion:1, the night:2}
death kinds: armed   {villager combat:204, monster:46, combat:702, expedition:56, contest:20, ambush:12, The Loud Beast:2, sickness:4, lockjaw:2, starvation:8, Speedbump:2, a wound that wouldn't close:4, Choir Toad:2, alien:2, The Mountain Lord:2, Glasswing Darter:2, the night:2}
LOUD: new death kinds on armed (>=2 events): The Loud Beast, The Mountain Lord, Glasswing Darter
wall control: national 11/24 | table 19/24 | wins 0/24 | wave4 0/24 | wave5 0/24 | median 111d
wall armed: national 10/24 | table 22/24 | wins 0/24 | wave4 0/24 | wave5 0/24 | median 132.5d
