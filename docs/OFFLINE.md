# Offline boot maintenance

The service worker caches exact URLs from the current entry page, manifest,
and live JSON inventory. Run `node scripts/build-offline-assets.js` after
changing index script/link URLs, manifest icons/start URL, or adding/removing
live src/data JSON files. Then run `node scripts/build-offline-assets.js --check`.
The generator updates only the marked ASSETS block; it never stamps a version.
The release script refreshes that block after stamping URLs. Running the release
script remains Steve's call.

`node scripts/test-offline-assets.js` executes the real service-worker handlers
in a CacheStorage fixture: actual install, activation, exact-query cache hits,
all entry scripts and live JSON with a stopped network, navigation fallback,
wrong-build query refusal, and missing-dependency rejection. It is required by
`test-sw-audio-cache-20261012.js`, which runs in both quick and full checks.
Audio Lab's full check also verifies generated precache freshness.

For native verification, use a fresh local origin and actual browser service
worker. Wait for installation and verify the controller and exact cache entries.
Stop the owned local server, verify direct HTTP fails, then reload the actual
root page, create an expedition through normal controls, take an action, reload,
and Continue the saved expedition. Record DOM, console and phone screenshot.
A Node cache fixture alone does not establish native installation or saved-game
continuity. A stopped site server is narrower than disabling all device network.

Keep optional audio binaries out of install precaching: online playback stores
those at runtime. Unheard recordings need network. The installer still waits
for the page's explicit update choice; this repair does not change activation
or cache-retirement behavior. Test updates from an already installed version
separately when shipping; fresh-origin boot is not an upgrade-path certificate.

Current evidence: evidence/2026-10-17/offline-boot-audit.md. This repairs boot
availability without changing Game rules, simulation inputs or the release
version. Native checks establish one expedition/action/save flow, not campaign
completion or playstyle viability.
