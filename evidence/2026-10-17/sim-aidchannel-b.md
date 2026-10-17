# sim-aidchannel-b — aid-verb channel diagnostic (flesh-out loop B, 2026-10-17)

Axis: food-economy. Run: fleshout-loop-b-20261017T0004Z. Master 0adefbb4.

## The filed blank this fills
sim-aidfeastint-b (2026-10-16) filed: the aid verb is road-dependent — 0
aids on 16 belong runs despite 796+ trigger-days; belongseek never forms
haven-primary thin-subordinate links; aid is a relationship verb
(Game.tendLink requires link.primary === 'haven', active, weekly).
DIAGNOSTIC, zero game-code changes: REUSES sim-wallcensus-b's 16 per-seed
runs (fresh seeds 4201–4208, base courtship policies, SEATDRIVE=0) — no
second sweep.

## Pre-registration (binding, MEASUREMENT.md §14)
- PRIMARY = 100% aid-fire attribution across the 16 runs (every tendLink
  fire attributed to the correct road via the record's own policyId;
  filename/array-position attribution is the schema-drift class — the
  analyzer throws LOUD on a record with no road), 0 instrument errors.
- REPLICATION GATE: belong roads ≈ 0 aids with no links formed
  (replicates the filed finding on fresh seeds); lead roads fire where
  links exist.
- Three measurements over the same 16 runs + beat captures:
  1. aid verb fires by road (tendLink invocations, kcal moved),
  2. haven-primary thin-subordinate link formation by road (formed count,
     active-days, first-seen/trust),
  3. trigger-day exposure where links are absent (fresh-days > 4 — the
     aiddrain overstock trigger — split by link-present vs link-absent
     run-days).
- VERDICT named, one of: "structurally road-dead on belong" (trigger open
  on many belong days but links never form — the channel cannot exist) vs
  "trigger-starved" (belong forms links but the trigger rarely opens).
- SENSE: read 2 lead-road aid transcripts + 1 refusal-ish beat; judge them
  as people (SENSE-TESTING LAW).

## Metric review
The verdict taxonomy held — the data separated cleanly (belong: 1,186
trigger-days, 0 links; lead: 1,128 with-link trigger-days, 24 links,
865 tends). No metric proved wrong; no revision proposed. One labeling
correction (not a metric change): the sweep JSON's
`links.havenPrimaryActiveDays` counts daily census SAMPLES, not link-days
(1440 lead / 1351 belong sample-days). The analyzer now reports link-days
as an upper bound computed from formed-day → run end (~3,712 lead / 0
belong) and labels the sample count honestly. The pre-registered metrics
(formations, fires, trigger split) were unaffected.

## Instruments
- scripts/analyze-aidchannel-20261017.js — reads the 16 per-seed JSONs,
  prints fires/links/trigger split + gates + verdict. attributeRoad()
  exported for the RED-pinned proof.
- Tend-link fire recording + link census live inside
  scripts/sweep-wallcensus-20261017.js's instrument stack (read-only
  wrappers; instrument errors counted).

## Results
Analyzer run 2026-10-17 over the 16 sim-wallcensus-b per-seed JSONs.

LEADCOURT (n=8): 865 tendLink invocations (attempts), 1,155,940 kcal of
real grain moved, 8/8 runs with ≥1 fire. 24 primary-haven links formed
(3/3 per run — the policy's full courtship complement), ~3,712 link-days
(upper bound). Trigger (fresh-days > 4): 1,312 days — 184 noLink (the
pre-formation days 1–23, courtship starts d25), 1,128 withLink.

BELONGSEEK (n=8): 0 tendLink invocations, 0 kcal, 0/8 runs. 0
primary-haven links formed. Trigger: 1,186 days — ALL with no links.

PRIMARY (100% attribution, 0 instrument errors): GO — 16/16 records
attributed via their own policyId; 0 instrument errors.
REPLICATION GATE: belong 0 tends / 0 links formed — the filed finding
replicates on fresh seeds 4201–4208. Lead fires where links exist: YES.

## Verdict
STRUCTURALLY ROAD-DEAD ON BELONG. The overstock trigger stood open on
1,186 belong run-days with zero haven-primary links to receive it —
every one of those days the channel was absent, not starved. This is not
a trigger problem and not a verb problem (aidfeastint-b's B3 fixture
already proved the aid fires on belong when a link exists). The
belongseek membership dynamics never propose as primary — the village's
relationships, not the driver's gates, close the channel. Where the
relationships don't exist, the aid verb is decoration. Filed blank
closed; the design fact stands on fresh seeds.

## Villagers as people
Two lead-road aid transcripts (leadcourt-s4201):
- d26: "🌾 Haven sends 1,500 kcal of grain to Emberhold's fire — not
  tribute, the other way around. Someone's grandmother over there will
  remember who fed her. (Trust +8.)"
- d31: "🌾 Haven sends 1,600 kcal of grain to The Hungry Road's fire —
  not tribute, the other way around. Someone's grandmother over there
  will remember who fed her. (Trust +8.)"
Named recipients, honest varying amounts (1,500–4,000 observed across
the run — over-removal on big-unit stacks, the same honest variance the
aiddrain arm documented), the trust effect said aloud. The aid reads as
a relationship act, not a transfer — "not tribute, the other way
around" is doing real social work.

One refusal-ish beat (d56): "They're burying their speaker — grain can
wait a week; grief can't. Tending resumes when the mourning lifts."
The mourning deferral is said aloud with a cause; the policy retried
daily through the mourning week (the 60 refused attempts inside the 865
— each narrated, none silent). People-like: grief pauses the ledger,
and the engine says so.

Repetition note (filed, not chased): the tend beat is byte-identical
except amount/recipient — the pre-existing tend-beat voice repetition
documented in sim-aidfeastint-b.

## Blanks filled / documented
- **FILLED (diagnostic)**: the aidfeastint-b filed blank — "the aid verb
  is road-dependent" — is now a measured verdict on fresh seeds with no
  driver layers: structurally road-dead on belong (1,186 trigger-days,
  0 links), alive on lead (24 links, 865 tend attempts, 1.16M kcal).
- **MECHANISM**: the channel closes at link formation, not at the verb
  or the trigger. belongseek's policy never proposes as primary, so no
  haven-primary links ever exist for the aid verb to act on. Any future
  aid-on-belong design must form the relationship first (or redefine the
  verb's channel) — tuning the trigger or the tend amount changes nothing.
- No game-code changes (diagnostic; read-only instruments only).
