# sim-peoplefood-b — do villagers act like people around food? (flesh-out loop B, 2026-10-17)

Axis: food-economy. Run: fleshout-loop-b-20261017T0100Z (worker sim-leanwinter-b).
Substrate shared with sim-leanwinter-b: FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT
(pre-seat), policies leadfeast/belongfeast, 180d death-aware, 8 fresh seeds
5101–5108 x 2 roads = 16 runs. ZERO game-code changes; instruments read-only.

## Why (SENSE-TESTING LAW, Steve 2026-10-11)
Counts prove a feast fired; they don't prove it felt like people eating
together. This arm samples villager food behavior out of the same 16 runs
the starvation census ran on and reads 2–4 full transcripts: feasts,
sharing/giving, refusal beats, hungry grumbling, feast openers. Judged on
meaning, coherence, personhood — do villagers act like people around food,
or is the fiction robotic, static, or repeated?

## Method
- scripts/sweep-leanwinter-20261017.js captured bounded food beats
  (say/sysSay filtered by /feast|ration|hungr|starv|meal|cook|grumb|eat|share|
  gave|give|food|dinner|breakfast|pantry/i, cap 6000/run) into
  evidence/2026-10-17/leanwinter-b-foodbeats/<policy>-s<seed>.json, each with
  {day, src, text}.
- Sense-read selection: (1) beats mentioning feasts + opener lines;
  (2) beats mentioning sharing/giving; (3) beats around refusal or
  half-ration; (4) grumbling/hunger voice. Prefer runs with starvation
  deaths nearby (the census identifies them) — grief changes the register.
- Verdict per transcript: MEANING (do the lines engage the situation?),
  COHERENCE (do consecutive beats belong to one scene?), PERSONHOOD
  (would a player believe these are people?).

## Metric review
Sense reads are judgment, not metrics. One instrument gap noted: the beats
filter catches text but not the drama-beat CHOICE (the scholar's actual
share/refuse decision on the Elena beat is a policy action, not a say —
the transcript shows the ask, never the answer). A future sense run on
begging should instrument the choice, not just the beat.

## Sense reads (4 full transcripts read)

### 1. Feast openers — leadfeast-s5103 (255 feast beats in run; 180 across 16)
MEANING: the opener names real state — who opened the pantry, the exact
pieces eaten, who ate, the kcal cost. The policy-side feast reads as a
genuine communal act with a real price tag (-2,030 to -3,200 kcal).
COHERENCE: consecutive beats belong to one scene; the feast lands at
evening, the village eats.
PERSONHOOD — FAIL: all 180 feast beats across all 16 runs carry the SAME
two sentences byte-identical: "Somebody laughs so hard they cry. For one
evening, nobody is surviving — they're just together." A lean-winter
feast with the pantry at 5 days of fresh reads word-for-word identical
to a harvest feast. The emotional register never varies — not for
mourning feasts, not for winter. Filed as a finding.

### 2. Bowls and sharing — belongfeast-s5104 (and all runs)
The daily bowl beat is "🍲 X has their bowl and their own thoughts.
Neither one is being shared." — 89 beats across 16 runs, the NAME
varies, the sentence never does. It is an ANTI-sharing beat: it asserts
private eating as the norm every single day, while the village's own
ledger runs on communal bowls. The sentence undercuts the fiction of
the communal meal the policy layer enforces (the scholar is declined
bowls, villagers share food VOLUNTARILY on camera — "They share food
VOLUNTARILY. No cameras forced this", itself byte-identical across runs).
COHERENCE: the bowl beat contradicts the communal-bowl mechanics it sits
beside. Filed as a finding.

### 3. The starvation window — leadfeast-s5106, days 50–77 (the run that
carries 75% of the census's starvation deaths)
MEANING — PASS, the strongest food fiction in the sample. d50: "🌿 Ilyas
checks the pantry before heading out — ~10 days of fresh on hand, but
someone has gone hungry three days running. The hungry eat first: keeps
working the fish nets instead of turning to other work." A named person
responds to a named state (pantry days + a hungry villager) with a named
decision. d52–57: as the shelves fill, Ilyas and Jesse switch OFF the
fish nets to stone/wood/water — adaptive labor, narrated with the reason
("The pantry can't take more; the wild will keep."). d58: "💀 Isaac
starved. Slowly. The village is 9 now." — then the village keeps fishing
(meals +371 to +2,425 kcal) while d70 Rafael and d75 Elif starve. The
tension is voiced, not hidden: d74 "Henry went to sleep hungry. Nobody
says anything." d75 "Elif went to sleep hungry. Nobody says anything."
The silence is the beat — guilt, avoidance, a village that can see the
gap and doesn't close it. d71: "Half rations for three days, voted and
held — or a hard hunt now, hungry, to fill the bins before it's
choosing-who-eats." The ration vote names its own stakes. d77:
"Haven couldn't hold. On the third hungry day, people started walking —
in different directions. The scattering, again." The village dissolves
with narrative weight, not a mechanical flag.
COHERENCE: the whole arc — full shelves, raids draining them, voted
rations, quiet hunger, deaths, dissolution — reads as one tragedy.
PERSONHOOD: PASS. This is villagers acting like people around food:
adapting labor, voting rations, failing each other quietly.

### 4. Refusal and begging — belongfeast-s5105
The feast-BUFF refusal beat ("🍖 The feast is warm and good — but your
reactor hums its steady note underneath, and the fire never catches.
1.25x, always, is all there is. (Feast buff refused: the reactor is a
ceiling as well as a floor.)") is mechanics-explained-in-fiction and
reads as earned, not arbitrary. The begging beat is a full drama scene:
"🥣 Elena of Stonebridge stands at your fire, thinner than pride allows.
'Stonebridge is eating bark. We're asking — 1,986 kcal, whatever you can
spare. We'll remember it.'" + "(They beg — give from the beats row, or
refuse aloud. If they once fed you, refusing costs double.)" — the ask
has a name, a number, a consequence; the choice is the player's. (Gap:
the transcript shows the ask, not the answer — see metric review.)
The spoiled-stores mutter ("Should've smoked that. Fresh stuff keeps a
day or two on the shelf — the smoke rack is right there.") is
knowledge-honest and teaches the preservation ladder — but 989 beats
across 16 runs carry the identical mutter. A good beat repeated into a
wall. Filed as a finding.

## Findings filed
- [open] feast beats' emotional prose is static (180/180 identical).
- [open] the bowl beat asserts private eating, contradicting communal mechanics.
- [open] the spoiled-stores mutter is knowledge-honest but repeated into a wall
  (989 beats, identical mutter).

All appended to sim-findings.md (appended only, no other loop's lines touched).

## Convergence
converging (sense reads delivered; the static-prose findings are the named
next for any narration pass on food beats).
