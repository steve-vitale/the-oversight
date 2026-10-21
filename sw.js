/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'e4336473a-20261021-111509';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=e4336473a-20261021-111509",
  "./src/js/engine/modifiers.js?v=e4336473a-20261021-111509",
  "./src/js/engine/calories.js?v=e4336473a-20261021-111509",
  "./src/js/engine/day.js?v=e4336473a-20261021-111509",
  "./src/js/engine/forage.js?v=e4336473a-20261021-111509",
  "./src/js/engine/combat.js?v=e4336473a-20261021-111509",
  "./src/js/audio-registry.js?v=e4336473a-20261021-111509",
  "./src/js/game.js?v=e4336473a-20261021-111509",
  "./src/js/encounters.js?v=e4336473a-20261021-111509",
  "./src/js/conversation.js?v=e4336473a-20261021-111509",
  "./src/js/convo-mood.js?v=e4336473a-20261021-111509",
  "./src/js/convoTopics.js?v=e4336473a-20261021-111509",
  "./src/js/convo-wants.js?v=e4336473a-20261021-111509",
  "./src/js/convo-dialogue.js?v=e4336473a-20261021-111509",
  "./src/js/convo-beats.js?v=e4336473a-20261021-111509",
  "./src/js/convo-scene.js?v=e4336473a-20261021-111509",
  "./src/js/voice-piper.js?v=e4336473a-20261021-111509",
  "./src/js/voice-system.js?v=e4336473a-20261021-111509",
  "./src/js/examine.js?v=e4336473a-20261021-111509",
  "./src/js/equipment.js?v=e4336473a-20261021-111509",
  "./src/js/journal.js?v=e4336473a-20261021-111509",
  "./src/js/party.js?v=e4336473a-20261021-111509",
  "./src/js/favor-water.js?v=e4336473a-20261021-111509",
  "./src/js/party-formal.js?v=e4336473a-20261021-111509",
  "./src/js/truth.js?v=e4336473a-20261021-111509",
  "./src/js/galactic-cast.js?v=e4336473a-20261021-111509",
  "./src/js/contests.js?v=e4336473a-20261021-111509",
  "./src/js/broadcast.js?v=e4336473a-20261021-111509",
  "./src/js/contestEngine.js?v=e4336473a-20261021-111509",
  "./src/js/alienPlayers.js?v=e4336473a-20261021-111509",
  "./src/js/storage.js?v=e4336473a-20261021-111509",
  "./src/js/perceive.js?v=e4336473a-20261021-111509",
  "./src/js/carexplore.js?v=e4336473a-20261021-111509",
  "./src/js/justice.js?v=e4336473a-20261021-111509",
  "./src/js/food.js?v=e4336473a-20261021-111509",
  "./src/js/betrayal.js?v=e4336473a-20261021-111509",
  "./src/js/corpses.js?v=e4336473a-20261021-111509",
  "./src/js/corruption.js?v=e4336473a-20261021-111509",
  "./src/js/lifeseed.js?v=e4336473a-20261021-111509",
  "./src/js/spawn-knack.js?v=e4336473a-20261021-111509",
  "./src/js/trial-deeds.js?v=e4336473a-20261021-111509",
  "./src/js/practice-deeds.js?v=e4336473a-20261021-111509",
  "./src/js/tracks.js?v=e4336473a-20261021-111509",
  "./src/js/villager-build.js?v=e4336473a-20261021-111509",
  "./src/js/progression.js?v=e4336473a-20261021-111509",
  "./src/js/waveLedger.js?v=e4336473a-20261021-111509",
  "./src/js/standing.js?v=e4336473a-20261021-111509",
  "./src/js/feastBuff.js?v=e4336473a-20261021-111509",
  "./src/js/ledger.js?v=e4336473a-20261021-111509",
  "./src/js/exposure.js?v=e4336473a-20261021-111509",
  "./src/js/abilityActions.js?v=e4336473a-20261021-111509",
  "./src/js/buildarounds.js?v=e4336473a-20261021-111509",
  "./src/js/foodPower.js?v=e4336473a-20261021-111509",
  "./src/js/monsterBehaviors.js?v=e4336473a-20261021-111509",
  "./src/js/partyTactics.js?v=e4336473a-20261021-111509",
  "./src/js/sigW3a.js?v=e4336473a-20261021-111509",
  "./src/js/statusEffects.js?v=e4336473a-20261021-111509",
  "./src/js/sigW3b.js?v=e4336473a-20261021-111509",
  "./src/js/metaProgression.js?v=e4336473a-20261021-111509",
  "./src/js/sigW3c.js?v=e4336473a-20261021-111509",
  "./src/js/sigW4.js?v=e4336473a-20261021-111509",
  "./src/js/sigW5.js?v=e4336473a-20261021-111509",
  "./src/js/villager-agency.js?v=e4336473a-20261021-111509",
  "./src/js/fieldFights.js?v=e4336473a-20261021-111509",
  "./src/js/party-wiring.js?v=e4336473a-20261021-111509",
  "./src/js/party-bond.js?v=e4336473a-20261021-111509",
  "./src/js/villager-objectives.js?v=e4336473a-20261021-111509",
  "./src/js/villager-mapmem.js?v=e4336473a-20261021-111509",
  "./src/js/codex-people.js?v=e4336473a-20261021-111509",
  "./src/js/membership.js?v=e4336473a-20261021-111509",
  "./src/js/gardenCultivation.js?v=e4336473a-20261021-111509",
  "./src/js/havenGrowth.js?v=e4336473a-20261021-111509",
  "./src/js/shelter.js?v=e4336473a-20261021-111509",
  "./src/js/hierarchy.js?v=e4336473a-20261021-111509",
  "./src/js/scaleDiscovery.js?v=e4336473a-20261021-111509",
  "./src/js/comms.js?v=e4336473a-20261021-111509",
  "./src/js/table.js?v=e4336473a-20261021-111509",
  "./src/js/pods.js?v=e4336473a-20261021-111509",
  "./src/js/titans.js?v=e4336473a-20261021-111509",
  "./src/js/finale-campaign.js?v=e4336473a-20261021-111509",
  "./src/js/godhood.js?v=e4336473a-20261021-111509",
  "./src/js/pantheon.js?v=e4336473a-20261021-111509",
  "./src/js/records.js?v=e4336473a-20261021-111509",
  "./src/js/table-feared.js?v=e4336473a-20261021-111509",
  "./src/js/table-indispensable.js?v=e4336473a-20261021-111509",
  "./src/js/table-beloved.js?v=e4336473a-20261021-111509",
  "./src/js/table-witness.js?v=e4336473a-20261021-111509",
  "./src/js/table-assimilated.js?v=e4336473a-20261021-111509",
  "./src/js/table-defiant.js?v=e4336473a-20261021-111509",
  "./src/js/relay-ext.js?v=e4336473a-20261021-111509",
  "./src/js/relay-dialogue.js?v=e4336473a-20261021-111509",
  "./src/js/table-relay.js?v=e4336473a-20261021-111509",
  "./src/js/safetynets.js?v=e4336473a-20261021-111509",
  "./src/js/villageAgency.js?v=e4336473a-20261021-111509",
  "./src/js/memdepth.js?v=e4336473a-20261021-111509",
  "./src/js/overtime.js?v=e4336473a-20261021-111509",
  "./src/js/network-campaign.js?v=e4336473a-20261021-111509",
  "./src/js/debug-scenarios.js?v=e4336473a-20261021-111509",
  "./src/js/keepsakes.js?v=e4336473a-20261021-111509",
  "./src/js/skill-teaching.js?v=e4336473a-20261021-111509",
  "./src/js/world.js?v=e4336473a-20261021-111509",
  "./src/js/nomad.js?v=e4336473a-20261021-111509",
  "./src/js/nomad-wild.js?v=e4336473a-20261021-111509",
  "./src/js/nomad-scenes.js?v=e4336473a-20261021-111509",
  "./src/js/nomad-drive.js?v=e4336473a-20261021-111509",
  "./src/js/temperature.js?v=e4336473a-20261021-111509",
  "./src/js/godpath.js?v=e4336473a-20261021-111509",
  "./src/js/godverbs.js?v=e4336473a-20261021-111509",
  "./src/js/endingKey.js?v=e4336473a-20261021-111509",
  "./src/js/telemetry-hooks.js?v=e4336473a-20261021-111509",
  "./src/js/feel.js?v=e4336473a-20261021-111509",
  "./src/js/build.js?v=e4336473a-20261021-111509",
  "./src/js/whereAreWe.js?v=e4336473a-20261021-111509",
  "./src/js/drama.js?v=e4336473a-20261021-111509",
  "./src/js/move-anim.js?v=e4336473a-20261021-111509",
  "./src/js/presentation.js?v=e4336473a-20261021-111509",
  "./src/js/sprites.js?v=e4336473a-20261021-111509",
  "./src/js/tile-scenes.js?v=e4336473a-20261021-111509",
  "./src/js/regional-audio.js?v=e4336473a-20261021-111509",
  "./src/js/favor-company.js?v=e4336473a-20261021-111509",
  "./src/js/timeSettlement.js?v=e4336473a-20261021-111509",
  "./src/js/app.js?v=e4336473a-20261021-111509",
  "./src/js/feel-audio.js?v=e4336473a-20261021-111509",
  "./manifest.json?v=e4336473a-20261021-111509",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=e4336473a-20261021-111509",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=e4336473a-20261021-111509",
  "./src/data/alienPlayers.json?v=e4336473a-20261021-111509",
  "./src/data/animals.json?v=e4336473a-20261021-111509",
  "./src/data/arrivalText.json?v=e4336473a-20261021-111509",
  "./src/data/background_survivors.json?v=e4336473a-20261021-111509",
  "./src/data/biomes.json?v=e4336473a-20261021-111509",
  "./src/data/books.json?v=e4336473a-20261021-111509",
  "./src/data/build-notes.json?v=e4336473a-20261021-111509",
  "./src/data/cell_defs.json?v=e4336473a-20261021-111509",
  "./src/data/characterGen.json?v=e4336473a-20261021-111509",
  "./src/data/climates.json?v=e4336473a-20261021-111509",
  "./src/data/contests.json?v=e4336473a-20261021-111509",
  "./src/data/cooking.json?v=e4336473a-20261021-111509",
  "./src/data/events.json?v=e4336473a-20261021-111509",
  "./src/data/evolutions.json?v=e4336473a-20261021-111509",
  "./src/data/favor-rules.json?v=e4336473a-20261021-111509",
  "./src/data/feast-surge.json?v=e4336473a-20261021-111509",
  "./src/data/foreignSpeech.json?v=e4336473a-20261021-111509",
  "./src/data/gardening.json?v=e4336473a-20261021-111509",
  "./src/data/godpaths.json?v=e4336473a-20261021-111509",
  "./src/data/items.json?v=e4336473a-20261021-111509",
  "./src/data/justiceVoice.json?v=e4336473a-20261021-111509",
  "./src/data/knowledge.json?v=e4336473a-20261021-111509",
  "./src/data/lifeseeds.json?v=e4336473a-20261021-111509",
  "./src/data/locations.json?v=e4336473a-20261021-111509",
  "./src/data/monsterBehaviors.json?v=e4336473a-20261021-111509",
  "./src/data/monsters.json?v=e4336473a-20261021-111509",
  "./src/data/nameCultures.json?v=e4336473a-20261021-111509",
  "./src/data/originPicker.json?v=e4336473a-20261021-111509",
  "./src/data/plants.json?v=e4336473a-20261021-111509",
  "./src/data/presentation.json?v=e4336473a-20261021-111509",
  "./src/data/recipes.json?v=e4336473a-20261021-111509",
  "./src/data/regions.json?v=e4336473a-20261021-111509",
  "./src/data/relicEnhancements.json?v=e4336473a-20261021-111509",
  "./src/data/reward-economy.json?v=e4336473a-20261021-111509",
  "./src/data/schemas.json?v=e4336473a-20261021-111509",
  "./src/data/statusEffects.json?v=e4336473a-20261021-111509",
  "./src/data/synergies.json?v=e4336473a-20261021-111509",
  "./src/data/table-beats.json?v=e4336473a-20261021-111509",
  "./src/data/table-endings.json?v=e4336473a-20261021-111509",
  "./src/data/titans.json?v=e4336473a-20261021-111509",
  "./src/data/tracks.json?v=e4336473a-20261021-111509",
  "./src/data/villagers.json?v=e4336473a-20261021-111509",
  "./src/data/wave-ledger.json?v=e4336473a-20261021-111509"
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
