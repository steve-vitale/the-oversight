# sim-strandfix-morning-b — paired compare (NOT an official panel run)

§15 DEVIATION (stated on its face): the official balance-panel driver cannot express this arm — its policies are sweep-compare registry policies, not the nighttravel+woodcarry+woodwarm strand stack, and the 23-metric contract has no strand-length / recovery-cost / conversion metrics (same standing as sim-fedexile-b and sim-tickbudget-b). This compare pairs control (kcalshort driver) and variant (strandfix driver, STRANDFIX=1) legs seed-by-seed on the pre-registered metrics, plus guardrail metrics (survival, death causes, wave reach). The panel is the instrument here in paired form; the pre-registered GO bars in the prereg are the judge. This is a DESIGN measurement — no behavior is landed or enabled by this arm.

## guard leg (WOODWARM=0)
- control still evenings: 3; variant still evenings: 4; fall: -1
- converted both-evenings: 0; converted ticks-plus-both (not counted toward bar (b) under the strict reading): 0
  - seed 15003: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 2->2; deaths 6->6
  - seed 15009: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 2->2; deaths 8->8
  - seed 15091: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 2->2; deaths 15->15
  - seed 15211: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 2->2; deaths 13->13
  - seed 15215: still 3 -> 4 (fall -1); control strands [[7,8,9]]; variant strands [[7,8,9,10]]; daysAlive 30->30; end survived->survived; waves 1->3; deaths 6->12
  - seed 15220: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 2->2; deaths 15->15
  - seed 15221: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 1->1; deaths 8->8
  - seed 15337: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 2->2; deaths 8->8
  - seed 15376: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 2->2; deaths 7->7
  - seed 15439: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 3->3; deaths 18->18
  - death seed 15003: bearer <redacted> null -> null delay null CENSORED sameCause true
  - death seed 15009: bearer <redacted> 18 -> 18 delay 0 sameCause true
  - death seed 15091: bearer <redacted> 8 -> 8 delay 0 sameCause true
  - death seed 15211: bearer <redacted> null -> null delay null CENSORED sameCause true
  - death seed 15215: bearer <redacted> null -> null delay null CENSORED sameCause true
  - death seed 15220: bearer <redacted> null -> null delay null CENSORED sameCause true
  - death seed 15221: bearer <redacted> 31 -> 31 delay 0 sameCause true
  - death seed 15337: bearer <redacted> null -> null delay null CENSORED sameCause true
  - death seed 15376: bearer <redacted> 17 -> 17 delay 0 sameCause true
  - death seed 15439: bearer <redacted> null -> null delay null CENSORED sameCause true

## on leg (WOODWARM=1)
- control still evenings: 10; variant still evenings: 11; fall: -1
- converted both-evenings: 0; converted ticks-plus-both (not counted toward bar (b) under the strict reading): 0
  - seed 15003: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 2->2; deaths 6->6
  - seed 15009: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 2->2; deaths 8->8
  - seed 15091: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 2->2; deaths 15->15
  - seed 15211: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 2->2; deaths 13->13
  - seed 15215: still 10 -> 11 (fall -1); control strands [[7,8,9,10,11,12,13,14,15,16]]; variant strands [[7,8,9,10,11,12,13,14,15,16,17]]; daysAlive 30->30; end survived->survived; waves 1->2; deaths 8->14
  - seed 15220: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 2->2; deaths 15->15
  - seed 15221: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 1->1; deaths 8->8
  - seed 15337: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 2->2; deaths 8->8
  - seed 15376: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 2->2; deaths 7->7
  - seed 15439: still 0 -> 0 (fall 0); control strands []; variant strands []; daysAlive 30->30; end survived->survived; waves 3->3; deaths 18->18
  - death seed 15003: bearer <redacted> null -> null delay null CENSORED sameCause true
  - death seed 15009: bearer <redacted> 18 -> 18 delay 0 sameCause true
  - death seed 15091: bearer <redacted> 8 -> 8 delay 0 sameCause true
  - death seed 15211: bearer <redacted> null -> null delay null CENSORED sameCause true
  - death seed 15215: bearer <redacted> 17 -> null delay null CENSORED sameCause false
  - death seed 15220: bearer <redacted> null -> null delay null CENSORED sameCause true
  - death seed 15221: bearer <redacted> 31 -> 31 delay 0 sameCause true
  - death seed 15337: bearer <redacted> null -> null delay null CENSORED sameCause true
  - death seed 15376: bearer <redacted> 17 -> 17 delay 0 sameCause true
  - death seed 15439: bearer <redacted> null -> null delay null CENSORED sameCause true

## GO inputs
- pair falls: [{"leg":"guard","controlStill":3,"variantStill":4,"fall":-1,"eitherStrands":true,"variantStrands":true},{"leg":"on","controlStill":10,"variantStill":11,"fall":-1,"eitherStrands":true,"variantStrands":true}]
- GO-A (either-strands denominator): false; GO-A (variant-strand-only denominator): false
- GO-B converted both-evenings total: 0 -> false
- GO overall (either-strands reading): false
- DET-GATE guard: true; on: true
