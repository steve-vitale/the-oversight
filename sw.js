/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'e984314d9-20261021-014853';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=e984314d9-20261021-014853",
  "./src/js/engine/modifiers.js?v=e984314d9-20261021-014853",
  "./src/js/engine/calories.js?v=e984314d9-20261021-014853",
  "./src/js/engine/day.js?v=e984314d9-20261021-014853",
  "./src/js/engine/forage.js?v=e984314d9-20261021-014853",
  "./src/js/engine/combat.js?v=e984314d9-20261021-014853",
  "./src/js/audio-registry.js?v=e984314d9-20261021-014853",
  "./src/js/game.js?v=e984314d9-20261021-014853",
  "./src/js/encounters.js?v=e984314d9-20261021-014853",
  "./src/js/conversation.js?v=e984314d9-20261021-014853",
  "./src/js/convo-mood.js?v=e984314d9-20261021-014853",
  "./src/js/convoTopics.js?v=e984314d9-20261021-014853",
  "./src/js/convo-wants.js?v=e984314d9-20261021-014853",
  "./src/js/convo-dialogue.js?v=e984314d9-20261021-014853",
  "./src/js/convo-beats.js?v=e984314d9-20261021-014853",
  "./src/js/convo-scene.js?v=e984314d9-20261021-014853",
  "./src/js/voice-piper.js?v=e984314d9-20261021-014853",
  "./src/js/voice-system.js?v=e984314d9-20261021-014853",
  "./src/js/examine.js?v=e984314d9-20261021-014853",
  "./src/js/equipment.js?v=e984314d9-20261021-014853",
  "./src/js/journal.js?v=e984314d9-20261021-014853",
  "./src/js/party.js?v=e984314d9-20261021-014853",
  "./src/js/favor-water.js?v=e984314d9-20261021-014853",
  "./src/js/party-formal.js?v=e984314d9-20261021-014853",
  "./src/js/truth.js?v=e984314d9-20261021-014853",
  "./src/js/galactic-cast.js?v=e984314d9-20261021-014853",
  "./src/js/contests.js?v=e984314d9-20261021-014853",
  "./src/js/broadcast.js?v=e984314d9-20261021-014853",
  "./src/js/contestEngine.js?v=e984314d9-20261021-014853",
  "./src/js/alienPlayers.js?v=e984314d9-20261021-014853",
  "./src/js/storage.js?v=e984314d9-20261021-014853",
  "./src/js/perceive.js?v=e984314d9-20261021-014853",
  "./src/js/carexplore.js?v=e984314d9-20261021-014853",
  "./src/js/justice.js?v=e984314d9-20261021-014853",
  "./src/js/food.js?v=e984314d9-20261021-014853",
  "./src/js/betrayal.js?v=e984314d9-20261021-014853",
  "./src/js/corpses.js?v=e984314d9-20261021-014853",
  "./src/js/corruption.js?v=e984314d9-20261021-014853",
  "./src/js/lifeseed.js?v=e984314d9-20261021-014853",
  "./src/js/spawn-knack.js?v=e984314d9-20261021-014853",
  "./src/js/trial-deeds.js?v=e984314d9-20261021-014853",
  "./src/js/practice-deeds.js?v=e984314d9-20261021-014853",
  "./src/js/tracks.js?v=e984314d9-20261021-014853",
  "./src/js/villager-build.js?v=e984314d9-20261021-014853",
  "./src/js/progression.js?v=e984314d9-20261021-014853",
  "./src/js/waveLedger.js?v=e984314d9-20261021-014853",
  "./src/js/standing.js?v=e984314d9-20261021-014853",
  "./src/js/feastBuff.js?v=e984314d9-20261021-014853",
  "./src/js/ledger.js?v=e984314d9-20261021-014853",
  "./src/js/exposure.js?v=e984314d9-20261021-014853",
  "./src/js/abilityActions.js?v=e984314d9-20261021-014853",
  "./src/js/buildarounds.js?v=e984314d9-20261021-014853",
  "./src/js/foodPower.js?v=e984314d9-20261021-014853",
  "./src/js/monsterBehaviors.js?v=e984314d9-20261021-014853",
  "./src/js/partyTactics.js?v=e984314d9-20261021-014853",
  "./src/js/sigW3a.js?v=e984314d9-20261021-014853",
  "./src/js/statusEffects.js?v=e984314d9-20261021-014853",
  "./src/js/sigW3b.js?v=e984314d9-20261021-014853",
  "./src/js/metaProgression.js?v=e984314d9-20261021-014853",
  "./src/js/sigW3c.js?v=e984314d9-20261021-014853",
  "./src/js/sigW4.js?v=e984314d9-20261021-014853",
  "./src/js/sigW5.js?v=e984314d9-20261021-014853",
  "./src/js/villager-agency.js?v=e984314d9-20261021-014853",
  "./src/js/fieldFights.js?v=e984314d9-20261021-014853",
  "./src/js/party-wiring.js?v=e984314d9-20261021-014853",
  "./src/js/party-bond.js?v=e984314d9-20261021-014853",
  "./src/js/villager-objectives.js?v=e984314d9-20261021-014853",
  "./src/js/villager-mapmem.js?v=e984314d9-20261021-014853",
  "./src/js/codex-people.js?v=e984314d9-20261021-014853",
  "./src/js/membership.js?v=e984314d9-20261021-014853",
  "./src/js/gardenCultivation.js?v=e984314d9-20261021-014853",
  "./src/js/havenGrowth.js?v=e984314d9-20261021-014853",
  "./src/js/shelter.js?v=e984314d9-20261021-014853",
  "./src/js/hierarchy.js?v=e984314d9-20261021-014853",
  "./src/js/scaleDiscovery.js?v=e984314d9-20261021-014853",
  "./src/js/comms.js?v=e984314d9-20261021-014853",
  "./src/js/table.js?v=e984314d9-20261021-014853",
  "./src/js/pods.js?v=e984314d9-20261021-014853",
  "./src/js/titans.js?v=e984314d9-20261021-014853",
  "./src/js/finale-campaign.js?v=e984314d9-20261021-014853",
  "./src/js/godhood.js?v=e984314d9-20261021-014853",
  "./src/js/pantheon.js?v=e984314d9-20261021-014853",
  "./src/js/records.js?v=e984314d9-20261021-014853",
  "./src/js/table-feared.js?v=e984314d9-20261021-014853",
  "./src/js/table-indispensable.js?v=e984314d9-20261021-014853",
  "./src/js/table-beloved.js?v=e984314d9-20261021-014853",
  "./src/js/table-witness.js?v=e984314d9-20261021-014853",
  "./src/js/table-assimilated.js?v=e984314d9-20261021-014853",
  "./src/js/table-defiant.js?v=e984314d9-20261021-014853",
  "./src/js/relay-ext.js?v=e984314d9-20261021-014853",
  "./src/js/relay-dialogue.js?v=e984314d9-20261021-014853",
  "./src/js/table-relay.js?v=e984314d9-20261021-014853",
  "./src/js/safetynets.js?v=e984314d9-20261021-014853",
  "./src/js/villageAgency.js?v=e984314d9-20261021-014853",
  "./src/js/memdepth.js?v=e984314d9-20261021-014853",
  "./src/js/overtime.js?v=e984314d9-20261021-014853",
  "./src/js/network-campaign.js?v=e984314d9-20261021-014853",
  "./src/js/debug-scenarios.js?v=e984314d9-20261021-014853",
  "./src/js/keepsakes.js?v=e984314d9-20261021-014853",
  "./src/js/skill-teaching.js?v=e984314d9-20261021-014853",
  "./src/js/world.js?v=e984314d9-20261021-014853",
  "./src/js/nomad.js?v=e984314d9-20261021-014853",
  "./src/js/nomad-wild.js?v=e984314d9-20261021-014853",
  "./src/js/nomad-scenes.js?v=e984314d9-20261021-014853",
  "./src/js/nomad-drive.js?v=e984314d9-20261021-014853",
  "./src/js/temperature.js?v=e984314d9-20261021-014853",
  "./src/js/godpath.js?v=e984314d9-20261021-014853",
  "./src/js/godverbs.js?v=e984314d9-20261021-014853",
  "./src/js/endingKey.js?v=e984314d9-20261021-014853",
  "./src/js/telemetry-hooks.js?v=e984314d9-20261021-014853",
  "./src/js/feel.js?v=e984314d9-20261021-014853",
  "./src/js/build.js?v=e984314d9-20261021-014853",
  "./src/js/whereAreWe.js?v=e984314d9-20261021-014853",
  "./src/js/drama.js?v=e984314d9-20261021-014853",
  "./src/js/move-anim.js?v=e984314d9-20261021-014853",
  "./src/js/presentation.js?v=e984314d9-20261021-014853",
  "./src/js/sprites.js?v=e984314d9-20261021-014853",
  "./src/js/tile-scenes.js?v=e984314d9-20261021-014853",
  "./src/js/regional-audio.js?v=e984314d9-20261021-014853",
  "./src/js/app.js?v=e984314d9-20261021-014853",
  "./src/js/feel-audio.js?v=e984314d9-20261021-014853",
  "./manifest.json?v=e984314d9-20261021-014853",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=e984314d9-20261021-014853",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=e984314d9-20261021-014853",
  "./src/data/alienPlayers.json?v=e984314d9-20261021-014853",
  "./src/data/animals.json?v=e984314d9-20261021-014853",
  "./src/data/arrivalText.json?v=e984314d9-20261021-014853",
  "./src/data/background_survivors.json?v=e984314d9-20261021-014853",
  "./src/data/biomes.json?v=e984314d9-20261021-014853",
  "./src/data/books.json?v=e984314d9-20261021-014853",
  "./src/data/build-notes.json?v=e984314d9-20261021-014853",
  "./src/data/cell_defs.json?v=e984314d9-20261021-014853",
  "./src/data/characterGen.json?v=e984314d9-20261021-014853",
  "./src/data/climates.json?v=e984314d9-20261021-014853",
  "./src/data/contests.json?v=e984314d9-20261021-014853",
  "./src/data/cooking.json?v=e984314d9-20261021-014853",
  "./src/data/events.json?v=e984314d9-20261021-014853",
  "./src/data/evolutions.json?v=e984314d9-20261021-014853",
  "./src/data/feast-surge.json?v=e984314d9-20261021-014853",
  "./src/data/foreignSpeech.json?v=e984314d9-20261021-014853",
  "./src/data/gardening.json?v=e984314d9-20261021-014853",
  "./src/data/godpaths.json?v=e984314d9-20261021-014853",
  "./src/data/items.json?v=e984314d9-20261021-014853",
  "./src/data/justiceVoice.json?v=e984314d9-20261021-014853",
  "./src/data/knowledge.json?v=e984314d9-20261021-014853",
  "./src/data/lifeseeds.json?v=e984314d9-20261021-014853",
  "./src/data/locations.json?v=e984314d9-20261021-014853",
  "./src/data/monsterBehaviors.json?v=e984314d9-20261021-014853",
  "./src/data/monsters.json?v=e984314d9-20261021-014853",
  "./src/data/nameCultures.json?v=e984314d9-20261021-014853",
  "./src/data/originPicker.json?v=e984314d9-20261021-014853",
  "./src/data/plants.json?v=e984314d9-20261021-014853",
  "./src/data/presentation.json?v=e984314d9-20261021-014853",
  "./src/data/recipes.json?v=e984314d9-20261021-014853",
  "./src/data/regions.json?v=e984314d9-20261021-014853",
  "./src/data/relicEnhancements.json?v=e984314d9-20261021-014853",
  "./src/data/reward-economy.json?v=e984314d9-20261021-014853",
  "./src/data/schemas.json?v=e984314d9-20261021-014853",
  "./src/data/statusEffects.json?v=e984314d9-20261021-014853",
  "./src/data/synergies.json?v=e984314d9-20261021-014853",
  "./src/data/table-beats.json?v=e984314d9-20261021-014853",
  "./src/data/table-endings.json?v=e984314d9-20261021-014853",
  "./src/data/titans.json?v=e984314d9-20261021-014853",
  "./src/data/tracks.json?v=e984314d9-20261021-014853",
  "./src/data/villagers.json?v=e984314d9-20261021-014853",
  "./src/data/wave-ledger.json?v=e984314d9-20261021-014853"
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
