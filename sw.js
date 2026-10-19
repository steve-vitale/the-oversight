/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'b57b21f28-20261019-233721';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=b57b21f28-20261019-233721",
  "./src/js/engine/modifiers.js?v=b57b21f28-20261019-233721",
  "./src/js/engine/calories.js?v=b57b21f28-20261019-233721",
  "./src/js/engine/day.js?v=b57b21f28-20261019-233721",
  "./src/js/engine/forage.js?v=b57b21f28-20261019-233721",
  "./src/js/engine/combat.js?v=b57b21f28-20261019-233721",
  "./src/js/audio-registry.js?v=b57b21f28-20261019-233721",
  "./src/js/game.js?v=b57b21f28-20261019-233721",
  "./src/js/encounters.js?v=b57b21f28-20261019-233721",
  "./src/js/conversation.js?v=b57b21f28-20261019-233721",
  "./src/js/convo-mood.js?v=b57b21f28-20261019-233721",
  "./src/js/convoTopics.js?v=b57b21f28-20261019-233721",
  "./src/js/convo-wants.js?v=b57b21f28-20261019-233721",
  "./src/js/convo-dialogue.js?v=b57b21f28-20261019-233721",
  "./src/js/convo-beats.js?v=b57b21f28-20261019-233721",
  "./src/js/convo-scene.js?v=b57b21f28-20261019-233721",
  "./src/js/voice-piper.js?v=b57b21f28-20261019-233721",
  "./src/js/voice-system.js?v=b57b21f28-20261019-233721",
  "./src/js/examine.js?v=b57b21f28-20261019-233721",
  "./src/js/equipment.js?v=b57b21f28-20261019-233721",
  "./src/js/journal.js?v=b57b21f28-20261019-233721",
  "./src/js/party.js?v=b57b21f28-20261019-233721",
  "./src/js/party-formal.js?v=b57b21f28-20261019-233721",
  "./src/js/truth.js?v=b57b21f28-20261019-233721",
  "./src/js/galactic-cast.js?v=b57b21f28-20261019-233721",
  "./src/js/contests.js?v=b57b21f28-20261019-233721",
  "./src/js/broadcast.js?v=b57b21f28-20261019-233721",
  "./src/js/contestEngine.js?v=b57b21f28-20261019-233721",
  "./src/js/alienPlayers.js?v=b57b21f28-20261019-233721",
  "./src/js/storage.js?v=b57b21f28-20261019-233721",
  "./src/js/perceive.js?v=b57b21f28-20261019-233721",
  "./src/js/carexplore.js?v=b57b21f28-20261019-233721",
  "./src/js/justice.js?v=b57b21f28-20261019-233721",
  "./src/js/food.js?v=b57b21f28-20261019-233721",
  "./src/js/betrayal.js?v=b57b21f28-20261019-233721",
  "./src/js/corpses.js?v=b57b21f28-20261019-233721",
  "./src/js/corruption.js?v=b57b21f28-20261019-233721",
  "./src/js/lifeseed.js?v=b57b21f28-20261019-233721",
  "./src/js/spawn-knack.js?v=b57b21f28-20261019-233721",
  "./src/js/trial-deeds.js?v=b57b21f28-20261019-233721",
  "./src/js/practice-deeds.js?v=b57b21f28-20261019-233721",
  "./src/js/tracks.js?v=b57b21f28-20261019-233721",
  "./src/js/villager-build.js?v=b57b21f28-20261019-233721",
  "./src/js/progression.js?v=b57b21f28-20261019-233721",
  "./src/js/waveLedger.js?v=b57b21f28-20261019-233721",
  "./src/js/standing.js?v=b57b21f28-20261019-233721",
  "./src/js/feastBuff.js?v=b57b21f28-20261019-233721",
  "./src/js/ledger.js?v=b57b21f28-20261019-233721",
  "./src/js/exposure.js?v=b57b21f28-20261019-233721",
  "./src/js/abilityActions.js?v=b57b21f28-20261019-233721",
  "./src/js/buildarounds.js?v=b57b21f28-20261019-233721",
  "./src/js/foodPower.js?v=b57b21f28-20261019-233721",
  "./src/js/monsterBehaviors.js?v=b57b21f28-20261019-233721",
  "./src/js/partyTactics.js?v=b57b21f28-20261019-233721",
  "./src/js/sigW3a.js?v=b57b21f28-20261019-233721",
  "./src/js/statusEffects.js?v=b57b21f28-20261019-233721",
  "./src/js/sigW3b.js?v=b57b21f28-20261019-233721",
  "./src/js/metaProgression.js?v=b57b21f28-20261019-233721",
  "./src/js/sigW3c.js?v=b57b21f28-20261019-233721",
  "./src/js/sigW4.js?v=b57b21f28-20261019-233721",
  "./src/js/sigW5.js?v=b57b21f28-20261019-233721",
  "./src/js/villager-agency.js?v=b57b21f28-20261019-233721",
  "./src/js/fieldFights.js?v=b57b21f28-20261019-233721",
  "./src/js/party-wiring.js?v=b57b21f28-20261019-233721",
  "./src/js/party-bond.js?v=b57b21f28-20261019-233721",
  "./src/js/villager-objectives.js?v=b57b21f28-20261019-233721",
  "./src/js/villager-mapmem.js?v=b57b21f28-20261019-233721",
  "./src/js/codex-people.js?v=b57b21f28-20261019-233721",
  "./src/js/membership.js?v=b57b21f28-20261019-233721",
  "./src/js/havenGrowth.js?v=b57b21f28-20261019-233721",
  "./src/js/shelter.js?v=b57b21f28-20261019-233721",
  "./src/js/hierarchy.js?v=b57b21f28-20261019-233721",
  "./src/js/scaleDiscovery.js?v=b57b21f28-20261019-233721",
  "./src/js/comms.js?v=b57b21f28-20261019-233721",
  "./src/js/table.js?v=b57b21f28-20261019-233721",
  "./src/js/pods.js?v=b57b21f28-20261019-233721",
  "./src/js/titans.js?v=b57b21f28-20261019-233721",
  "./src/js/finale-campaign.js?v=b57b21f28-20261019-233721",
  "./src/js/godhood.js?v=b57b21f28-20261019-233721",
  "./src/js/pantheon.js?v=b57b21f28-20261019-233721",
  "./src/js/records.js?v=b57b21f28-20261019-233721",
  "./src/js/table-feared.js?v=b57b21f28-20261019-233721",
  "./src/js/table-indispensable.js?v=b57b21f28-20261019-233721",
  "./src/js/table-beloved.js?v=b57b21f28-20261019-233721",
  "./src/js/table-witness.js?v=b57b21f28-20261019-233721",
  "./src/js/table-assimilated.js?v=b57b21f28-20261019-233721",
  "./src/js/table-defiant.js?v=b57b21f28-20261019-233721",
  "./src/js/relay-ext.js?v=b57b21f28-20261019-233721",
  "./src/js/relay-dialogue.js?v=b57b21f28-20261019-233721",
  "./src/js/table-relay.js?v=b57b21f28-20261019-233721",
  "./src/js/safetynets.js?v=b57b21f28-20261019-233721",
  "./src/js/villageAgency.js?v=b57b21f28-20261019-233721",
  "./src/js/memdepth.js?v=b57b21f28-20261019-233721",
  "./src/js/overtime.js?v=b57b21f28-20261019-233721",
  "./src/js/network-campaign.js?v=b57b21f28-20261019-233721",
  "./src/js/debug-scenarios.js?v=b57b21f28-20261019-233721",
  "./src/js/keepsakes.js?v=b57b21f28-20261019-233721",
  "./src/js/skill-teaching.js?v=b57b21f28-20261019-233721",
  "./src/js/world.js?v=b57b21f28-20261019-233721",
  "./src/js/nomad.js?v=b57b21f28-20261019-233721",
  "./src/js/nomad-wild.js?v=b57b21f28-20261019-233721",
  "./src/js/nomad-scenes.js?v=b57b21f28-20261019-233721",
  "./src/js/nomad-drive.js?v=b57b21f28-20261019-233721",
  "./src/js/temperature.js?v=b57b21f28-20261019-233721",
  "./src/js/godpath.js?v=b57b21f28-20261019-233721",
  "./src/js/godverbs.js?v=b57b21f28-20261019-233721",
  "./src/js/endingKey.js?v=b57b21f28-20261019-233721",
  "./src/js/telemetry-hooks.js?v=b57b21f28-20261019-233721",
  "./src/js/feel.js?v=b57b21f28-20261019-233721",
  "./src/js/build.js?v=b57b21f28-20261019-233721",
  "./src/js/whereAreWe.js?v=b57b21f28-20261019-233721",
  "./src/js/drama.js?v=b57b21f28-20261019-233721",
  "./src/js/move-anim.js?v=b57b21f28-20261019-233721",
  "./src/js/presentation.js?v=b57b21f28-20261019-233721",
  "./src/js/sprites.js?v=b57b21f28-20261019-233721",
  "./src/js/tile-scenes.js?v=b57b21f28-20261019-233721",
  "./src/js/regional-audio.js?v=b57b21f28-20261019-233721",
  "./src/js/app.js?v=b57b21f28-20261019-233721",
  "./src/js/feel-audio.js?v=b57b21f28-20261019-233721",
  "./manifest.json?v=b57b21f28-20261019-233721",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=b57b21f28-20261019-233721",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=b57b21f28-20261019-233721",
  "./src/data/alienPlayers.json?v=b57b21f28-20261019-233721",
  "./src/data/animals.json?v=b57b21f28-20261019-233721",
  "./src/data/arrivalText.json?v=b57b21f28-20261019-233721",
  "./src/data/background_survivors.json?v=b57b21f28-20261019-233721",
  "./src/data/biomes.json?v=b57b21f28-20261019-233721",
  "./src/data/books.json?v=b57b21f28-20261019-233721",
  "./src/data/build-notes.json?v=b57b21f28-20261019-233721",
  "./src/data/cell_defs.json?v=b57b21f28-20261019-233721",
  "./src/data/characterGen.json?v=b57b21f28-20261019-233721",
  "./src/data/climates.json?v=b57b21f28-20261019-233721",
  "./src/data/contests.json?v=b57b21f28-20261019-233721",
  "./src/data/cooking.json?v=b57b21f28-20261019-233721",
  "./src/data/events.json?v=b57b21f28-20261019-233721",
  "./src/data/evolutions.json?v=b57b21f28-20261019-233721",
  "./src/data/feast-surge.json?v=b57b21f28-20261019-233721",
  "./src/data/foreignSpeech.json?v=b57b21f28-20261019-233721",
  "./src/data/godpaths.json?v=b57b21f28-20261019-233721",
  "./src/data/items.json?v=b57b21f28-20261019-233721",
  "./src/data/justiceVoice.json?v=b57b21f28-20261019-233721",
  "./src/data/knowledge.json?v=b57b21f28-20261019-233721",
  "./src/data/lifeseeds.json?v=b57b21f28-20261019-233721",
  "./src/data/locations.json?v=b57b21f28-20261019-233721",
  "./src/data/monsterBehaviors.json?v=b57b21f28-20261019-233721",
  "./src/data/monsters.json?v=b57b21f28-20261019-233721",
  "./src/data/nameCultures.json?v=b57b21f28-20261019-233721",
  "./src/data/originPicker.json?v=b57b21f28-20261019-233721",
  "./src/data/plants.json?v=b57b21f28-20261019-233721",
  "./src/data/presentation.json?v=b57b21f28-20261019-233721",
  "./src/data/recipes.json?v=b57b21f28-20261019-233721",
  "./src/data/regions.json?v=b57b21f28-20261019-233721",
  "./src/data/relicEnhancements.json?v=b57b21f28-20261019-233721",
  "./src/data/reward-economy.json?v=b57b21f28-20261019-233721",
  "./src/data/schemas.json?v=b57b21f28-20261019-233721",
  "./src/data/statusEffects.json?v=b57b21f28-20261019-233721",
  "./src/data/synergies.json?v=b57b21f28-20261019-233721",
  "./src/data/table-beats.json?v=b57b21f28-20261019-233721",
  "./src/data/table-endings.json?v=b57b21f28-20261019-233721",
  "./src/data/titans.json?v=b57b21f28-20261019-233721",
  "./src/data/tracks.json?v=b57b21f28-20261019-233721",
  "./src/data/villagers.json?v=b57b21f28-20261019-233721",
  "./src/data/wave-ledger.json?v=b57b21f28-20261019-233721"
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
