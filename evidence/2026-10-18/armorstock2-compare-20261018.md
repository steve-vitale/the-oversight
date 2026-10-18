# sim-armorstock2 — balanced before/after (§15-deviation compare)

pairs: 16 (control+armed on identical seeds x {leadseat, belongseat})

## PRIMARY (binding): paired deferral-margin delta, qualifying (non-winning, both-deferred) pairs

qualifying pairs: 4/16 — belongseat-s5102117, belongseat-s5212219, leadseat-s5102117, leadseat-s5212219
per-pair deltas (armed − control margin pieces): [0, 0, 0, 1]
median paired delta: 0.00 (GO needs >= +1.0, >= 6 pairs)
**verdict: UNMEASURABLE (<6 qualifying pairs — pre-registered measurability floor; file the census as the diagnostic)**

## SECONDARY (report-only)

all-pairs median delta (incl. winning runs): 0.00 (n=16)
deferral coverage: control 16/16, armed 16/16
wave-4 unlock share (contact check): control 1/16, armed 1/16
wins: control 12/16, armed 11/16
national: control 0/16, armed 0/16

### leg engagement (armed, 16 runs)
recovered=18 crafted=2 (tries 2, fails 0) wore=8 successions=51 recoveryTries=47
reservePeak total=7
median reserve (trophy in scholar pack, end): control 0 vs armed 0
median scholar worn P (end): control 16 vs armed 16

## GUARDRAILS

starvation deaths: control 0 vs armed 0
median survival (harness days): control 141 vs armed 141 (kill if armed < control−10)
median gameDays (report-only; vetrel clock-stall confounds): control 90 vs armed 90
villager (non-scholar) combat deaths (§14c co-primary): control 408 vs armed 401 (kill if armed > control×1.25 = 510.0)
death causes control: {"villager combat":122,"ambush":4,"expedition":33,"Rut King":1,"combat":231,"sickness":1,"Highbeam Deer":2,"The Understudy":1,"alien":9,"contest":9,"dehydration":5,"monster":37,"Hummice":2,"the night":2,"Sunbasker":1,"Nostalgia":1,"a wound that wouldn't close":1,"Headlight Harry":1,"Loud-Eyes":1,"Bulldozer":1,"Grief Counselor":1}
death causes armed: {"villager combat":120,"ambush":4,"expedition":33,"Rut King":1,"combat":222,"sickness":1,"Highbeam Deer":2,"The Understudy":1,"alien":11,"contest":7,"dehydration":5,"monster":38,"Hummice":2,"the night":2,"Nostalgia":1,"a wound that wouldn't close":1,"Headlight Harry":1,"Loud-Eyes":1,"Bulldozer":1,"Grief Counselor":1}
new-on-armed causes: none

## §15 deviation noted
Official balance-panel driver cannot express the pre-registered PRIMARY (the 23-metric contract has no deferral-margin, reserve, or scholar-armor metrics); paired statistics above run on the pre-registered metrics directly. The official panel compare (armorstock2-panel-compare.md) covers the contract metrics as the guardrail instrument.
