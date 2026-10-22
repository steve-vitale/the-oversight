/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'ab5f8db3e-20261022-113126';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=ab5f8db3e-20261022-113126",
  "./src/js/engine/modifiers.js?v=ab5f8db3e-20261022-113126",
  "./src/js/engine/calories.js?v=ab5f8db3e-20261022-113126",
  "./src/js/engine/day.js?v=ab5f8db3e-20261022-113126",
  "./src/js/engine/forage.js?v=ab5f8db3e-20261022-113126",
  "./src/js/engine/combat.js?v=ab5f8db3e-20261022-113126",
  "./src/js/audio-registry.js?v=ab5f8db3e-20261022-113126",
  "./src/js/game.js?v=ab5f8db3e-20261022-113126",
  "./src/js/encounters.js?v=ab5f8db3e-20261022-113126",
  "./src/js/conversation.js?v=ab5f8db3e-20261022-113126",
  "./src/js/convo-mood.js?v=ab5f8db3e-20261022-113126",
  "./src/js/convoTopics.js?v=ab5f8db3e-20261022-113126",
  "./src/js/convo-wants.js?v=ab5f8db3e-20261022-113126",
  "./src/js/convo-dialogue.js?v=ab5f8db3e-20261022-113126",
  "./src/js/convo-beats.js?v=ab5f8db3e-20261022-113126",
  "./src/js/convo-scene.js?v=ab5f8db3e-20261022-113126",
  "./src/js/voice-piper.js?v=ab5f8db3e-20261022-113126",
  "./src/js/voice-system.js?v=ab5f8db3e-20261022-113126",
  "./src/js/examine.js?v=ab5f8db3e-20261022-113126",
  "./src/js/equipment.js?v=ab5f8db3e-20261022-113126",
  "./src/js/journal.js?v=ab5f8db3e-20261022-113126",
  "./src/js/party.js?v=ab5f8db3e-20261022-113126",
  "./src/js/favor-water.js?v=ab5f8db3e-20261022-113126",
  "./src/js/party-formal.js?v=ab5f8db3e-20261022-113126",
  "./src/js/truth.js?v=ab5f8db3e-20261022-113126",
  "./src/js/galactic-cast.js?v=ab5f8db3e-20261022-113126",
  "./src/js/contests.js?v=ab5f8db3e-20261022-113126",
  "./src/js/broadcast.js?v=ab5f8db3e-20261022-113126",
  "./src/js/contestEngine.js?v=ab5f8db3e-20261022-113126",
  "./src/js/alienPlayers.js?v=ab5f8db3e-20261022-113126",
  "./src/js/storage.js?v=ab5f8db3e-20261022-113126",
  "./src/js/perceive.js?v=ab5f8db3e-20261022-113126",
  "./src/js/carexplore.js?v=ab5f8db3e-20261022-113126",
  "./src/js/justice.js?v=ab5f8db3e-20261022-113126",
  "./src/js/food.js?v=ab5f8db3e-20261022-113126",
  "./src/js/betrayal.js?v=ab5f8db3e-20261022-113126",
  "./src/js/corpses.js?v=ab5f8db3e-20261022-113126",
  "./src/js/corruption.js?v=ab5f8db3e-20261022-113126",
  "./src/js/lifeseed.js?v=ab5f8db3e-20261022-113126",
  "./src/js/spawn-knack.js?v=ab5f8db3e-20261022-113126",
  "./src/js/trial-deeds.js?v=ab5f8db3e-20261022-113126",
  "./src/js/practice-deeds.js?v=ab5f8db3e-20261022-113126",
  "./src/js/tracks.js?v=ab5f8db3e-20261022-113126",
  "./src/js/villager-build.js?v=ab5f8db3e-20261022-113126",
  "./src/js/progression.js?v=ab5f8db3e-20261022-113126",
  "./src/js/waveLedger.js?v=ab5f8db3e-20261022-113126",
  "./src/js/standing.js?v=ab5f8db3e-20261022-113126",
  "./src/js/feastBuff.js?v=ab5f8db3e-20261022-113126",
  "./src/js/ledger.js?v=ab5f8db3e-20261022-113126",
  "./src/js/exposure.js?v=ab5f8db3e-20261022-113126",
  "./src/js/abilityActions.js?v=ab5f8db3e-20261022-113126",
  "./src/js/buildarounds.js?v=ab5f8db3e-20261022-113126",
  "./src/js/foodPower.js?v=ab5f8db3e-20261022-113126",
  "./src/js/monsterBehaviors.js?v=ab5f8db3e-20261022-113126",
  "./src/js/partyTactics.js?v=ab5f8db3e-20261022-113126",
  "./src/js/sigW3a.js?v=ab5f8db3e-20261022-113126",
  "./src/js/statusEffects.js?v=ab5f8db3e-20261022-113126",
  "./src/js/sigW3b.js?v=ab5f8db3e-20261022-113126",
  "./src/js/metaProgression.js?v=ab5f8db3e-20261022-113126",
  "./src/js/sigW3c.js?v=ab5f8db3e-20261022-113126",
  "./src/js/sigW4.js?v=ab5f8db3e-20261022-113126",
  "./src/js/sigW5.js?v=ab5f8db3e-20261022-113126",
  "./src/js/villager-agency.js?v=ab5f8db3e-20261022-113126",
  "./src/js/fieldFights.js?v=ab5f8db3e-20261022-113126",
  "./src/js/party-wiring.js?v=ab5f8db3e-20261022-113126",
  "./src/js/party-bond.js?v=ab5f8db3e-20261022-113126",
  "./src/js/villager-objectives.js?v=ab5f8db3e-20261022-113126",
  "./src/js/villager-mapmem.js?v=ab5f8db3e-20261022-113126",
  "./src/js/codex-people.js?v=ab5f8db3e-20261022-113126",
  "./src/js/membership.js?v=ab5f8db3e-20261022-113126",
  "./src/js/gardenCultivation.js?v=ab5f8db3e-20261022-113126",
  "./src/js/havenGrowth.js?v=ab5f8db3e-20261022-113126",
  "./src/js/shelter.js?v=ab5f8db3e-20261022-113126",
  "./src/js/hierarchy.js?v=ab5f8db3e-20261022-113126",
  "./src/js/scaleDiscovery.js?v=ab5f8db3e-20261022-113126",
  "./src/js/comms.js?v=ab5f8db3e-20261022-113126",
  "./src/js/table.js?v=ab5f8db3e-20261022-113126",
  "./src/js/pods.js?v=ab5f8db3e-20261022-113126",
  "./src/js/titans.js?v=ab5f8db3e-20261022-113126",
  "./src/js/finale-campaign.js?v=ab5f8db3e-20261022-113126",
  "./src/js/godhood.js?v=ab5f8db3e-20261022-113126",
  "./src/js/pantheon.js?v=ab5f8db3e-20261022-113126",
  "./src/js/records.js?v=ab5f8db3e-20261022-113126",
  "./src/js/table-feared.js?v=ab5f8db3e-20261022-113126",
  "./src/js/table-indispensable.js?v=ab5f8db3e-20261022-113126",
  "./src/js/table-beloved.js?v=ab5f8db3e-20261022-113126",
  "./src/js/table-witness.js?v=ab5f8db3e-20261022-113126",
  "./src/js/table-assimilated.js?v=ab5f8db3e-20261022-113126",
  "./src/js/table-defiant.js?v=ab5f8db3e-20261022-113126",
  "./src/js/relay-ext.js?v=ab5f8db3e-20261022-113126",
  "./src/js/relay-dialogue.js?v=ab5f8db3e-20261022-113126",
  "./src/js/table-relay.js?v=ab5f8db3e-20261022-113126",
  "./src/js/safetynets.js?v=ab5f8db3e-20261022-113126",
  "./src/js/villageAgency.js?v=ab5f8db3e-20261022-113126",
  "./src/js/memdepth.js?v=ab5f8db3e-20261022-113126",
  "./src/js/overtime.js?v=ab5f8db3e-20261022-113126",
  "./src/js/network-campaign.js?v=ab5f8db3e-20261022-113126",
  "./src/js/debug-scenarios.js?v=ab5f8db3e-20261022-113126",
  "./src/js/keepsakes.js?v=ab5f8db3e-20261022-113126",
  "./src/js/skill-teaching.js?v=ab5f8db3e-20261022-113126",
  "./src/js/world.js?v=ab5f8db3e-20261022-113126",
  "./src/js/nomad.js?v=ab5f8db3e-20261022-113126",
  "./src/js/nomad-wild.js?v=ab5f8db3e-20261022-113126",
  "./src/js/nomad-scenes.js?v=ab5f8db3e-20261022-113126",
  "./src/js/nomad-drive.js?v=ab5f8db3e-20261022-113126",
  "./src/js/temperature.js?v=ab5f8db3e-20261022-113126",
  "./src/js/godpath.js?v=ab5f8db3e-20261022-113126",
  "./src/js/godverbs.js?v=ab5f8db3e-20261022-113126",
  "./src/js/endingKey.js?v=ab5f8db3e-20261022-113126",
  "./src/js/telemetry-hooks.js?v=ab5f8db3e-20261022-113126",
  "./src/js/feel.js?v=ab5f8db3e-20261022-113126",
  "./src/js/build.js?v=ab5f8db3e-20261022-113126",
  "./src/js/whereAreWe.js?v=ab5f8db3e-20261022-113126",
  "./src/js/drama.js?v=ab5f8db3e-20261022-113126",
  "./src/js/move-anim.js?v=ab5f8db3e-20261022-113126",
  "./src/js/presentation.js?v=ab5f8db3e-20261022-113126",
  "./src/js/sprites.js?v=ab5f8db3e-20261022-113126",
  "./src/js/tile-scenes.js?v=ab5f8db3e-20261022-113126",
  "./src/js/regional-audio.js?v=ab5f8db3e-20261022-113126",
  "./src/js/favor-company.js?v=ab5f8db3e-20261022-113126",
  "./src/js/timeSettlement.js?v=ab5f8db3e-20261022-113126",
  "./src/js/app.js?v=ab5f8db3e-20261022-113126",
  "./src/js/feel-audio.js?v=ab5f8db3e-20261022-113126",
  "./manifest.json?v=ab5f8db3e-20261022-113126",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=ab5f8db3e-20261022-113126",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=ab5f8db3e-20261022-113126",
  "./src/data/alienPlayers.json?v=ab5f8db3e-20261022-113126",
  "./src/data/animals.json?v=ab5f8db3e-20261022-113126",
  "./src/data/arrivalText.json?v=ab5f8db3e-20261022-113126",
  "./src/data/background_survivors.json?v=ab5f8db3e-20261022-113126",
  "./src/data/biomes.json?v=ab5f8db3e-20261022-113126",
  "./src/data/books.json?v=ab5f8db3e-20261022-113126",
  "./src/data/build-notes.json?v=ab5f8db3e-20261022-113126",
  "./src/data/cell_defs.json?v=ab5f8db3e-20261022-113126",
  "./src/data/characterGen.json?v=ab5f8db3e-20261022-113126",
  "./src/data/climates.json?v=ab5f8db3e-20261022-113126",
  "./src/data/contests.json?v=ab5f8db3e-20261022-113126",
  "./src/data/cooking.json?v=ab5f8db3e-20261022-113126",
  "./src/data/events.json?v=ab5f8db3e-20261022-113126",
  "./src/data/evolutions.json?v=ab5f8db3e-20261022-113126",
  "./src/data/favor-rules.json?v=ab5f8db3e-20261022-113126",
  "./src/data/feast-surge.json?v=ab5f8db3e-20261022-113126",
  "./src/data/foreignSpeech.json?v=ab5f8db3e-20261022-113126",
  "./src/data/gardening.json?v=ab5f8db3e-20261022-113126",
  "./src/data/godpaths.json?v=ab5f8db3e-20261022-113126",
  "./src/data/items.json?v=ab5f8db3e-20261022-113126",
  "./src/data/justiceVoice.json?v=ab5f8db3e-20261022-113126",
  "./src/data/knowledge.json?v=ab5f8db3e-20261022-113126",
  "./src/data/lifeseeds.json?v=ab5f8db3e-20261022-113126",
  "./src/data/locations.json?v=ab5f8db3e-20261022-113126",
  "./src/data/monsterBehaviors.json?v=ab5f8db3e-20261022-113126",
  "./src/data/monsters.json?v=ab5f8db3e-20261022-113126",
  "./src/data/nameCultures.json?v=ab5f8db3e-20261022-113126",
  "./src/data/originPicker.json?v=ab5f8db3e-20261022-113126",
  "./src/data/plants.json?v=ab5f8db3e-20261022-113126",
  "./src/data/presentation.json?v=ab5f8db3e-20261022-113126",
  "./src/data/recipes.json?v=ab5f8db3e-20261022-113126",
  "./src/data/regions.json?v=ab5f8db3e-20261022-113126",
  "./src/data/relicEnhancements.json?v=ab5f8db3e-20261022-113126",
  "./src/data/reward-economy.json?v=ab5f8db3e-20261022-113126",
  "./src/data/schemas.json?v=ab5f8db3e-20261022-113126",
  "./src/data/statusEffects.json?v=ab5f8db3e-20261022-113126",
  "./src/data/synergies.json?v=ab5f8db3e-20261022-113126",
  "./src/data/table-beats.json?v=ab5f8db3e-20261022-113126",
  "./src/data/table-endings.json?v=ab5f8db3e-20261022-113126",
  "./src/data/titans.json?v=ab5f8db3e-20261022-113126",
  "./src/data/tracks.json?v=ab5f8db3e-20261022-113126",
  "./src/data/villagers.json?v=ab5f8db3e-20261022-113126",
  "./src/data/wave-ledger.json?v=ab5f8db3e-20261022-113126"
];
// END GENERATED OFFLINE ASSETS

self.addEventListener('install', e => {
  // Cache everything fresh for this version, then sit in "waiting" —
  // do NOT skipWaiting here; the page decides when to switch.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Only cache successful same-origin basics; game data is versioned by CACHE.
        // AUDIO RUNTIME CACHE (2026-10-12): voice lines are 14MB — too heavy to
        // precache at install, but the fetch handler never stored them, so the
        // offline PWA lost all voice after first install. Cache audio responses
        // at runtime: play once online, then it works offline.
        try {
          const ct = resp.headers.get('content-type') || '';
          if (resp.ok && (ct.indexOf('audio/') === 0 || e.request.url.indexOf('/src/audio/') !== -1)) {
            const copy = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
          }
        } catch (err) { /* cache failure must never break playback */ }
        return resp;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        throw new Error('offline');
      });
    })
  );
});
