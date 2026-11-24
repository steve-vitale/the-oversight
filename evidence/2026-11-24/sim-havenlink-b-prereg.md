# Haven-link foreign-polity membership — Loop B, run fleshout-loop-b-20261124T0630Z, arm sim-havenlink-b (DIAG)

Axis: winnability chain (re-point 2026-11-03). DIAG-ONLY arm: zero
src/js changes (neutral recorder only — the standing instrument
reused verbatim plus pure reads and call-through wraps; if a hook
proves necessary it would be a neutral recorder, env-gated,
default OFF, proof-tested — none is expected).

## Ground truth (read first)

`evidence/2026-11-24/sim-standing-gearready-b.md` §(c) and "Next
blanks" #3. The standing pilot (band 109301–109308, anchor
`f74931e6`) found: a foreign polity exists (count 1) on all 6
regional seeds while Haven's polity stays null; max 1 link per
village; 0 counting links; `pendingNational` NEVER present. The
named next blank: "record foreign-polity MEMBERSHIP (is Haven's
one link to the foreign primary? what would joining cost?) — this
arm recorded the count only."

Per-seed pilot link targets (from the pilot per-seed JSONs, link
keys `?|haven|<village>` — all Haven-primary, kind null):
109301→village_3 (d27, trust 53 end, seasoned), 109302→village_0
(d27, trust 54, seasoned), 109303→village_0 (d36, trust 17 end,
unseasoned), 109304→village_1 (d59, trust 26, unseasoned),
109305→none, 109306→village_0 (d20, trust 35 end, unseasoned),
109307→village_0 (d25, trust 81 end, seasoned),
109308→village_1 (d39, trust 33 end, unseasoned). The foreign
primary's identity and membership are NOT in the pilot corpus.

## The question, pinned down

(a) Is Haven's one link to the foreign polity's primary — i.e.
does the BELONG road's precondition (a realm to join) already
have Haven holding its hand?
(b) Who IS the foreign polity: primary + full membership list,
per seed, per day — and is Haven among them (member /
subordinate) on any day?
(c) What would joining cost — the join/subordinate path as the
game offered it on this band: a staged Binding beat (swear
3,000 kcal / serve 7 days / walk), a counter asking Haven to
bow (tribute price named), or an actual subordinate link
formed — or "no join path offered", with the reason stated.

## Join / BELONG rule, as found in code (re-read at this anchor)

From `docs/SCALE.md` + `src/js/hierarchy.js` (unchanged in the
BELONG path since the standing anchor — no hierarchy.js change
in `e5dd61e96..HEAD`):
- A polity is one primary with >= 3 seasoned subordinates.
  Seasoned = 30+ days old AND trust 40+ (conquered: season only).
- BELONG: Haven is a subordinate in good standing to a primary
  whose realm holds >= 4 villages: link trust >= 50, arrears 0,
  link age >= 14 days. Read by `polityOf(primaryId)` — size =
  2 + foreign subs; `polityOf('haven')` returns null for BELONG,
  use `_belongPolity()` / `_havenPolity()`.
- The join verb is `proposeLink(target, {asSubordinate: true,
  tributeKcalPerWeek})`: score >= 55 accepts and `_formLink`
  makes Haven subordinate (tribute as offered); 35–54 stages a
  counter whose terms ask Haven to bow at
  `max(offered, 6000)` kcal/week when Haven proposed as
  subordinate, or 5,000 kcal/week when Haven proposed as
  primary; < 35 declines. The competent policy NEVER calls
  `proposeLink` as subordinate (grep: no proposeLink call in
  `scripts/policies/competent.js` — the pilot's single link each
  seed comes from villager-initiated bonds,
  `src/js/bond-initiation.js`, accepted through conversation).
  The counter-answer path (`COUNTER_ANSWER`, default OFF) is
  NOT enabled — default env throughout.
- The Binding beat (staged by `_checkNational` when a polity
  qualifies, one rung per season: regional >= 30 days old):
  SWEAR — oath sealed with 3,000 kcal (trust +12, proportional
  if the pantry is thin); SERVE — seven days of the speaker's
  life at their court (trust +8); WALK — break the link, stay a
  free fire (refuses the scale with it). Every beat also offers
  REFUSE (permanent, `state.scaleRefused`).
- Foreign polities (`state.foreignPolities`, entries
  `{primary, subs[], day}`) form off-screen in
  `_foreignPolitySim` (weekly, needs `networkLive`): drift
  ~12%/week seeds a pair; engagement (banked `stirRegion`
  beats) grows the largest polity by one binder a week. Drift
  never builds past one pair; realmhood needs engagement.
  Candidacy reads the foreign village's own traced knowledge
  of Haven (`villageKnowsVillage(v.id, 'haven')`).

## Calibration gate — the anchor moved since the pilot

The pilot anchor was `f74931e6` (prereg HEAD `e5dd61e96`). Two
src/js changes landed since: `bf73c94d9` (departname — beat
names in `win-plan.js`, voice-only) and `2b9cadcfb`
(rearm-witness — wild-corpse expedition witness channel, a
behavior change on expedition). Either could move a
trajectory, so the replay is NOT assumed to reproduce: the
reproduction check below is binding, and a divergence ABANDONS
the replay (it is not an instrument failure and not a
re-scored verdict — the fresh band becomes the judged leg).

## Seed-band freshness (§3 — verified before choosing)

- Replay band 109301–109308: the pilot band itself (replay by
  design, not a fresh band).
- Fallback fresh band 109325–109332 (pilot, 8 seeds). Token
  check: grep for `10932[5-9]` / `10933[0-2]` with digit
  boundaries across ALL of `evidence/` returns 10 files — all
  inspected, all matches are kcal values (`pantryKcal`
  109329/109325, `freshKcal` 109325, `pantry` 109331, `kept`
  109330), NOT seeds. No `.md` file names any of 109325–109332.
  Claims/tracker check: grep for `109325`–`109332` in
  `hidden_files/lever-claims/` (live + .DEAD) and
  `hidden_files/convergence-tracker.md` returns ZERO hits.
  Contaminated-band list (standing prereg + journey-landing
  record): 897–906, 1301–1304, 917–926, 1001–1010, 1101–1110,
  1201–1210, 2001–2010, 3001–3010, 1033–1042, 1043–1052,
  1053–1062, 1063–1072, 1073–1082, 1083–1092. 109325–109332
  is in none of them. NOT 109309–109324: that band is the
  sibling arm sim-standing-confirm-b's unspent confirm band
  (coordinator claim fleshout-loop-b-20261124T0630Z) — never
  duplicate a live claim.
- Pilot-band seed tokens 109301–109308 appear as seeds ONLY in
  the standing arm's own files (prereg, evidence, round notes);
  the two October JSON hits for "109302"/"109311" are a float
  (`-3.5735257109302916`) and a pantry kcal value (109311),
  not seeds.

## Pre-registration (binding, §11/§14)

- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM
  (the CURRENT file at this anchor), default env. No env
  overrides. COUNTER_ANSWER stays OFF (default).
- Seeds (replay pilot): 109301–109308. Horizon: 150 days,
  death-aware (dead villages stop simulating; never a fixed
  200d).
- Fallback: if ANY seed fails the reproduction check below,
  STOP the replay, say so plainly, and run the fresh band
  109325–109332 instead as the judged leg (same policy, same
  horizon, same instrument). The replay corpus is kept as
  evidence of the divergence, never judged.
- Balanced panel (§15): INAPPLICABLE — pure diagnostic, no
  before/after change; no comparison is fabricated.
- Primary metric: per-seed foreign-polity membership
  classification completeness (see DIAG-GO bar), NOT a reach
  count.
- Primary questions: (a)–(c) above, per seed per day.
- Instrument: the standing instrument reused verbatim
  (`scripts/standing-gearready-b-instrument-20261124.js`,
  zero src/js) PLUS a havenlink layer that adds, per snapshot,
  pure reads only: full `foreignPolities()` entries (primary +
  subs + day, copied), Haven's links with the far end named
  (village id + display name via `_ovName`), each link's role
  (Haven primary / subordinate / peer), whether the far end
  is a foreign primary, Haven's BELONG-bar state against that
  primary (trust / arrears / age / foreign-polity size, with
  the missing bars named), `_belongPolity()` /
  `_havenPolity()` results, `pendingAccord`, and
  `otherVillages` (id + name + opinion, end of run). Event
  streams: `_formLink` wrap (day, target, asSubordinate,
  tribute, call-path marker), `stageNationalBeat` /
  `answerNationalChoice` wraps (shape, choice, cost), and a
  link/polity say-line stream (accord, courtship, binding,
  oath, tribute, "bound itself", court, Binding). All wraps
  call-through, RNG-neutral, error-reporting; the snapshot
  NEVER calls `villageStandingTotal()` or `unlockedWave()`
  (the reused standing snapshot already guarantees this).
- Reproduction check (binding): for each replay seed, the
  standing analyzer's `summarizeSeed` on the new JSON must
  match the pilot JSON on ALL of: days, endReason, scaleRank,
  maxWave, endUnlockedWave, bestCapped, doorOpenDay,
  daysAt199. Any mismatch on any seed = replay abandoned,
  fresh band judged instead.

## DIAG-GO bar (pre-registered; no threshold on reach counts)

GO requires ALL of:
1. Instrument validity: proof test
   `scripts/test-havenlink-b-20261124.js` green BEFORE the
   judged leg (fixture tests: foreign-primary identification,
   membership listing, BELONG-bar gap decomposition, join-offer
   classification incl. counter terms and Binding costs,
   link-formation event capture, reproduction-field
   comparison; plus a live-harness smoke with a real loaded
   game); 0 instrument errors on every judged seed; all
   per-seed JSONs carry ONE anchor commit (the instruments
   commit); 0 orphan link-formation events (every `_formLink`
   call has a matching link row in a later snapshot, or is
   explained).
2. Every regional seed classified — 0 UNCLASSIFIED. Per
   regional seed the evidence states, with the per-day
   evidence behind it:
   - Haven's link target NAMED (village id + display name)
     and whether that village IS the foreign polity's
     primary (yes/no, with the foreign primary named);
   - foreign-polity membership STATED (primary + full subs
     list, max size reached, first/last day seen) and whether
     Haven is among the members (member / subordinate / not
     a member — never assumed from the count);
   - the join/subordinate path STATED: one of `binding-staged`
     (shape belong, day, choice offered, cost: swear 3,000
     kcal / serve 7 days), `counter-offered` (day, tribute
     price named), `subordinate-link-formed` (day, tribute),
     or `no-join-path-offered` (with the reason: e.g. Haven
     never courted the foreign primary; no counter named
     Haven bowing; no Binding staged) — plus, when Haven's
     link IS to the foreign primary, the BELONG-bar gap
     (trust / arrears / age / size, each met-or-short per day).
   The 2 never-regional seeds classify under their own
   branch (no foreign polity / no link, or link to a
   non-primary village) — still 0 UNCLASSIFIED.
3. Reproduction (replay leg only): all 8 seeds match the
   pilot on every reproduction field above; OR the replay
   is abandoned on the first mismatch and the fresh band
   (109325–109332) is run and judged instead, with the
   switch stated plainly in the evidence. A judged replay
   with any silent divergence is DIAG-NO-GO.
4. Sense-test: at least two seeds' link stories read end to
   end from the link/polity say-lines + formation events
   (who linked whom, when, what the System said) and judged
   for meaning/coherence — quoted in the evidence file.

A miss on any leg is DIAG-NO-GO and is reported as such; no
metric is re-scored mid-run (§14). No threshold is set on how
many villages link to the foreign primary or are offered a
join — this is a diagnostic.

## Sense-testing law

Transcripts are read: link-formation lines, accord/courtship
lines, foreign-polity rumor lines ("bound itself"), national
beat lines, and the counter lines per seed are judged for
meaning, coherence, repetition, and robotic behavior — never
just counts. The sense sample lives in the per-seed JSONs
(`linkLines`, `linkEvents`, `joinOffers`) and is quoted in the
evidence file.

## Deliverables

- `scripts/havenlink-b-instrument-20261124.js`,
  `scripts/havenlink-b-driver-20261124.js`,
  `scripts/havenlink-b-analyze-20261124.js`,
  `scripts/test-havenlink-b-20261124.js` (proof: membership
  classification, BELONG-bar gaps, join-offer classification,
  link-event capture, reproduction comparison, live-harness
  smoke) — green BEFORE the judged leg.
- Per-seed JSONs under
  `evidence/2026-11-24/perseed-havenlink-b/` (replay) and, only
  if the replay is abandoned,
  `evidence/2026-11-24/perseed-havenlink-b-fresh/`.
- Evidence `evidence/2026-11-24/sim-havenlink-b.md` with a
  per-seed membership table, the sense-test, a "metric review"
  section (§14; no in-run re-scoring), and the wall numbers
  (wins / national / table / wave-5 unlocks + faced / median
  survival).
- Zero src/js changes. No push, no bump, no live verification
  (coordinator merges --ff-only; ship loop owns deploys).
- Do NOT duplicate Loop A's scale-onramp work (launchdiag /
  departname, live this run) — this arm is the BELONG-road
  membership question from the standing pilot, not the launch
  funnel.
