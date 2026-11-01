# Creature audio and Audio Lab upkeep

The Lab is tools/audio-lab.html. Serve the repository over HTTP and open that
page; its filters and Play buttons are tested at390×844. Each creature has
one labeled entry with a fiction-based derivation and explicit provenance.
GAP means a recording is missing or unregistered; it does not certify that
someone searched every source. Preserve existing attribution caveats.

Silent-contact retargeting (2026-10-26 review): encounter.proximityAudio=false
prevents the shared scanner from announcing a new adjacent target for the
turtle, anaconda and tiger. It does not suppress actual attack/pain voices or
ordinary deer/mimic notices. Do not infer silence from a rush/ambush pattern:
some callers and lures are intentionally vocal. The automatic shared-kit
test-silent-proximity-audio.js proves all three authored flags, real queue
priority, unchanged resources/time, vocal contrasts and pain notices. Existing
regional141 checks remain unchanged; run them at default/7/42.

The native dispatcher check uses bundled Playwright on NODE_PATH:

```sh
node evidence/2026-10-26/prepare-silent-audio-phone-r3.cjs <new-fixture.json>
node evidence/2026-10-26/silent-proximity-audio-phone-r3.cjs <new-positive-directory>
node evidence/2026-10-26/silent-proximity-audio-phone-control-r3.cjs <new-negative-directory>
node evidence/2026-10-26/review-silent-audio-phone-r1.cjs <new-positive-directory> <new-negative-directory> <new-review.json>
```

The recipe deliberately reads its declared silent-audio-phone-fixture-r3.json;
the first command is for independently reproducing/inspecting that prepared
scene, not silently substituting an alternate fixture. It retains real Haven
exit costs and leaves one canonical adult companion outdoors. A prepared
startCombat/position/queue setup forces an actual two-target scanner switch;
subsequent turns use trusted Study/Strike/Wait through actual endings. Both
phone sizes switch targets without a scanner voice. Production voices start
running native Web Audio sources with finite nonzero buffers attributable to
that exact voice call, following resolved contact or an actual authored Rerun
declaration. A valid direct telegraph may sound before damage; scanner calls
must remain silent. Both final R3 fights end in defeat, not victories. Removing
only the tiger flag in disposable browser data fails the precise retarget
silence assertion; retain that failed trace and inspect it with the reviewer.
Loaded response bytes and rendered phone screenshots are retained. Earlier
solo R1/R2 pilots do not prove retargeting. The audio observers forward
the real damage options and sound methods; they do not finish turns or change
RNG, budgets, HP or prices. This is not natural discovery, physical-device
listening, sound-quality judgment, native tiger saved Continue or universal
combat clearance; the separate ordinary combat/save suites cover their cases.

For a monster roster, audio-hook or curated-description change:

1. Keep the actual encounter noticeAudio/aggroAudio keys and registered voice
   aligned. Regional voices live in src/js/regional-audio.js; the production
   app installs them on its existing effects mixer. Instant ambush/rush voices
   follow contact. Do not add an early cue to make a silent attack easier.
2. Add/update the curated Lab entry. Regional entries derive from the shared
   module; other entries live in scripts/build-audiolab-data.js. Use real
   recording/source/license claims only when the asset and provenance exist.
3. Run `node scripts/build-audiolab-data.js`, then
   `node scripts/build-audiolab-data.js --check`. Check mode reads without
   writing and ignores only the generation timestamp. A stale payload fails.
4. Run `node scripts/test-blitz-audiolab.js`. It requires the freshness check
   and shared regional runtime proof, verifies every current monster has one
   entry, and checks assets, synth hooks, derivations and the phone filter
   container. This test is already on the full green list.
5. For shared regional renderer changes, run
   `node scripts/test-regional-audio.js` with default seed,7 and42. Extend
   its expected registration coverage when adding voices. Its actual combat
   driver must emit the configured events; its prepared instant-move contrast
   must retain silence before contact. An empty event log is a failure.
6. Verify the native game dispatcher/mixer and Lab controls. Observe source
   creation, nonzero finite PCM, mute, stop, phone filter selection and graph
   cleanup. The node proof's audio sink observes game events; it does not
   replace native dispatch validation. Use one sticky filter container so
   the two filter rows cannot cover each other's buttons after scrolling.

The Lab and game use the same regional renderer. The game port owns volume,
mute and music ducking; the renderer uses private deterministic noise and
never reads gameplay RNG. Voices are short, cancellable and disconnect after
ending. Legacy synths without a shared Lab renderer remain visibly marked
in-game only; this regional unit does not claim universal synth preview.
An extracted CombatAudio fixture must load its production regional dependency.

Keep the shared module in index.html. The service-worker ASSETS block is
now generated from actual entry/manifest/live JSON inputs; follow docs/OFFLINE.md
after dependency changes. This supersedes the installer defect recorded in
regional-audio-offline-followup.json. Native phone boot/action/saveContinue
with the local server stopped is retained in offline-boot-audit.md; optional
audio binaries still require online playback before runtime-cache availability.
Release/version stamping remains Steve's call.

Game/data changes still require the standard real observer-neutral proof,
matched16 screen and distinct64 holdout, all23 metrics, quick/full checks,
and ontology/region validation as applicable. Keep original state hashes:
audio deduplication metadata can change a saved combat snapshot even when
the complete observations and metrics match. Replay and explain that change;
do not silently exclude another field from the comparison hash.

Automated graph and PCM checks establish functioning playback, not sound
quality, human reaction time or balance. Record listening/audibility judgments
as needs-eyes. See evidence/2026-10-17/regional-audio-audit.md for the current
proof, source identities, limitations and remaining publication gates.
