/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'dad2255de-20261025-234517';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=dad2255de-20261025-234517",
  "./src/js/engine/modifiers.js?v=dad2255de-20261025-234517",
  "./src/js/engine/calories.js?v=dad2255de-20261025-234517",
  "./src/js/engine/day.js?v=dad2255de-20261025-234517",
  "./src/js/engine/forage.js?v=dad2255de-20261025-234517",
  "./src/js/engine/combat.js?v=dad2255de-20261025-234517",
  "./src/js/audio-registry.js?v=dad2255de-20261025-234517",
  "./src/js/text.js?v=dad2255de-20261025-234517",
  "./src/js/game.js?v=dad2255de-20261025-234517",
  "./src/js/encounters.js?v=dad2255de-20261025-234517",
  "./src/js/conversation.js?v=dad2255de-20261025-234517",
  "./src/js/convo-mood.js?v=dad2255de-20261025-234517",
  "./src/js/convoTopics.js?v=dad2255de-20261025-234517",
  "./src/js/naming-rite.js?v=dad2255de-20261025-234517",
  "./src/js/convo-wants.js?v=dad2255de-20261025-234517",
  "./src/js/convo-dialogue.js?v=dad2255de-20261025-234517",
  "./src/js/convo-beats.js?v=dad2255de-20261025-234517",
  "./src/js/convo-scene.js?v=dad2255de-20261025-234517",
  "./src/js/voice-piper.js?v=dad2255de-20261025-234517",
  "./src/js/voice-system.js?v=dad2255de-20261025-234517",
  "./src/js/examine.js?v=dad2255de-20261025-234517",
  "./src/js/equipment.js?v=dad2255de-20261025-234517",
  "./src/js/journal.js?v=dad2255de-20261025-234517",
  "./src/js/party.js?v=dad2255de-20261025-234517",
  "./src/js/favor-water.js?v=dad2255de-20261025-234517",
  "./src/js/party-formal.js?v=dad2255de-20261025-234517",
  "./src/js/truth.js?v=dad2255de-20261025-234517",
  "./src/js/galactic-cast.js?v=dad2255de-20261025-234517",
  "./src/js/contests.js?v=dad2255de-20261025-234517",
  "./src/js/broadcast.js?v=dad2255de-20261025-234517",
  "./src/js/contestEngine.js?v=dad2255de-20261025-234517",
  "./src/js/alienPlayers.js?v=dad2255de-20261025-234517",
  "./src/js/storage.js?v=dad2255de-20261025-234517",
  "./src/js/perceive.js?v=dad2255de-20261025-234517",
  "./src/js/carexplore.js?v=dad2255de-20261025-234517",
  "./src/js/justice.js?v=dad2255de-20261025-234517",
  "./src/js/food.js?v=dad2255de-20261025-234517",
  "./src/js/betrayal.js?v=dad2255de-20261025-234517",
  "./src/js/corpses.js?v=dad2255de-20261025-234517",
  "./src/js/corruption.js?v=dad2255de-20261025-234517",
  "./src/js/lifeseed.js?v=dad2255de-20261025-234517",
  "./src/js/spawn-knack.js?v=dad2255de-20261025-234517",
  "./src/js/trial-deeds.js?v=dad2255de-20261025-234517",
  "./src/js/practice-deeds.js?v=dad2255de-20261025-234517",
  "./src/js/tracks.js?v=dad2255de-20261025-234517",
  "./src/js/villager-build.js?v=dad2255de-20261025-234517",
  "./src/js/progression.js?v=dad2255de-20261025-234517",
  "./src/js/waveLedger.js?v=dad2255de-20261025-234517",
  "./src/js/standing.js?v=dad2255de-20261025-234517",
  "./src/js/feastBuff.js?v=dad2255de-20261025-234517",
  "./src/js/ledger.js?v=dad2255de-20261025-234517",
  "./src/js/exposure.js?v=dad2255de-20261025-234517",
  "./src/js/abilityActions.js?v=dad2255de-20261025-234517",
  "./src/js/buildarounds.js?v=dad2255de-20261025-234517",
  "./src/js/foodPower.js?v=dad2255de-20261025-234517",
  "./src/js/monsterBehaviors.js?v=dad2255de-20261025-234517",
  "./src/js/partyTactics.js?v=dad2255de-20261025-234517",
  "./src/js/sigW3a.js?v=dad2255de-20261025-234517",
  "./src/js/statusEffects.js?v=dad2255de-20261025-234517",
  "./src/js/sigW3b.js?v=dad2255de-20261025-234517",
  "./src/js/metaProgression.js?v=dad2255de-20261025-234517",
  "./src/js/sigW3c.js?v=dad2255de-20261025-234517",
  "./src/js/sigW4.js?v=dad2255de-20261025-234517",
  "./src/js/sigW5.js?v=dad2255de-20261025-234517",
  "./src/js/villager-agency.js?v=dad2255de-20261025-234517",
  "./src/js/npc-triggers.js?v=dad2255de-20261025-234517",
  "./src/js/fieldFights.js?v=dad2255de-20261025-234517",
  "./src/js/party-wiring.js?v=dad2255de-20261025-234517",
  "./src/js/party-bond.js?v=dad2255de-20261025-234517",
  "./src/js/villager-objectives.js?v=dad2255de-20261025-234517",
  "./src/js/villager-mapmem.js?v=dad2255de-20261025-234517",
  "./src/js/codex-people.js?v=dad2255de-20261025-234517",
  "./src/js/fallen-memorial.js?v=dad2255de-20261025-234517",
  "./src/js/graves.js?v=dad2255de-20261025-234517",
  "./src/js/membership.js?v=dad2255de-20261025-234517",
  "./src/js/gardenCultivation.js?v=dad2255de-20261025-234517",
  "./src/js/havenGrowth.js?v=dad2255de-20261025-234517",
  "./src/js/shelter.js?v=dad2255de-20261025-234517",
  "./src/js/hierarchy.js?v=dad2255de-20261025-234517",
  "./src/js/scaleDiscovery.js?v=dad2255de-20261025-234517",
  "./src/js/comms.js?v=dad2255de-20261025-234517",
  "./src/js/table.js?v=dad2255de-20261025-234517",
  "./src/js/pods.js?v=dad2255de-20261025-234517",
  "./src/js/titans.js?v=dad2255de-20261025-234517",
  "./src/js/finale-campaign.js?v=dad2255de-20261025-234517",
  "./src/js/godhood.js?v=dad2255de-20261025-234517",
  "./src/js/pantheon.js?v=dad2255de-20261025-234517",
  "./src/js/records.js?v=dad2255de-20261025-234517",
  "./src/js/table-feared.js?v=dad2255de-20261025-234517",
  "./src/js/table-indispensable.js?v=dad2255de-20261025-234517",
  "./src/js/table-beloved.js?v=dad2255de-20261025-234517",
  "./src/js/table-witness.js?v=dad2255de-20261025-234517",
  "./src/js/table-assimilated.js?v=dad2255de-20261025-234517",
  "./src/js/table-defiant.js?v=dad2255de-20261025-234517",
  "./src/js/relay-ext.js?v=dad2255de-20261025-234517",
  "./src/js/relay-dialogue.js?v=dad2255de-20261025-234517",
  "./src/js/table-relay.js?v=dad2255de-20261025-234517",
  "./src/js/safetynets.js?v=dad2255de-20261025-234517",
  "./src/js/villageAgency.js?v=dad2255de-20261025-234517",
  "./src/js/memdepth.js?v=dad2255de-20261025-234517",
  "./src/js/overtime.js?v=dad2255de-20261025-234517",
  "./src/js/network-campaign.js?v=dad2255de-20261025-234517",
  "./src/js/debug-scenarios.js?v=dad2255de-20261025-234517",
  "./src/js/keepsakes.js?v=dad2255de-20261025-234517",
  "./src/js/skill-teaching.js?v=dad2255de-20261025-234517",
  "./src/js/world.js?v=dad2255de-20261025-234517",
  "./src/js/nomad.js?v=dad2255de-20261025-234517",
  "./src/js/nomad-wild.js?v=dad2255de-20261025-234517",
  "./src/js/nomad-scenes.js?v=dad2255de-20261025-234517",
  "./src/js/nomad-drive.js?v=dad2255de-20261025-234517",
  "./src/js/temperature.js?v=dad2255de-20261025-234517",
  "./src/js/godpath.js?v=dad2255de-20261025-234517",
  "./src/js/godverbs.js?v=dad2255de-20261025-234517",
  "./src/js/endingKey.js?v=dad2255de-20261025-234517",
  "./src/js/telemetry-hooks.js?v=dad2255de-20261025-234517",
  "./src/js/feel.js?v=dad2255de-20261025-234517",
  "./src/js/build.js?v=dad2255de-20261025-234517",
  "./src/js/whereAreWe.js?v=dad2255de-20261025-234517",
  "./src/js/drama.js?v=dad2255de-20261025-234517",
  "./src/js/move-anim.js?v=dad2255de-20261025-234517",
  "./src/js/presentation.js?v=dad2255de-20261025-234517",
  "./src/js/sprites.js?v=dad2255de-20261025-234517",
  "./src/js/tile-scenes.js?v=dad2255de-20261025-234517",
  "./src/js/regional-audio.js?v=dad2255de-20261025-234517",
  "./src/js/favor-company.js?v=dad2255de-20261025-234517",
  "./src/js/timeSettlement.js?v=dad2255de-20261025-234517",
  "./src/js/app.js?v=dad2255de-20261025-234517",
  "./src/js/feel-audio.js?v=dad2255de-20261025-234517",
  "./manifest.json?v=dad2255de-20261025-234517",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=dad2255de-20261025-234517",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=dad2255de-20261025-234517",
  "./src/data/alienPlayers.json?v=dad2255de-20261025-234517",
  "./src/data/animals.json?v=dad2255de-20261025-234517",
  "./src/data/arrivalText.json?v=dad2255de-20261025-234517",
  "./src/data/background_survivors.json?v=dad2255de-20261025-234517",
  "./src/data/biomes.json?v=dad2255de-20261025-234517",
  "./src/data/books.json?v=dad2255de-20261025-234517",
  "./src/data/build-notes.json?v=dad2255de-20261025-234517",
  "./src/data/cell_defs.json?v=dad2255de-20261025-234517",
  "./src/data/characterGen.json?v=dad2255de-20261025-234517",
  "./src/data/climates.json?v=dad2255de-20261025-234517",
  "./src/data/contests.json?v=dad2255de-20261025-234517",
  "./src/data/cooking.json?v=dad2255de-20261025-234517",
  "./src/data/events.json?v=dad2255de-20261025-234517",
  "./src/data/evolutions.json?v=dad2255de-20261025-234517",
  "./src/data/favor-rules.json?v=dad2255de-20261025-234517",
  "./src/data/feast-surge.json?v=dad2255de-20261025-234517",
  "./src/data/foreignSpeech.json?v=dad2255de-20261025-234517",
  "./src/data/gardening.json?v=dad2255de-20261025-234517",
  "./src/data/godpaths.json?v=dad2255de-20261025-234517",
  "./src/data/items.json?v=dad2255de-20261025-234517",
  "./src/data/justiceVoice.json?v=dad2255de-20261025-234517",
  "./src/data/knowledge.json?v=dad2255de-20261025-234517",
  "./src/data/lifeseeds.json?v=dad2255de-20261025-234517",
  "./src/data/locations.json?v=dad2255de-20261025-234517",
  "./src/data/monsterBehaviors.json?v=dad2255de-20261025-234517",
  "./src/data/monsters.json?v=dad2255de-20261025-234517",
  "./src/data/nameCultures.json?v=dad2255de-20261025-234517",
  "./src/data/originPicker.json?v=dad2255de-20261025-234517",
  "./src/data/plants.json?v=dad2255de-20261025-234517",
  "./src/data/presentation.json?v=dad2255de-20261025-234517",
  "./src/data/recipes.json?v=dad2255de-20261025-234517",
  "./src/data/regions.json?v=dad2255de-20261025-234517",
  "./src/data/relicEnhancements.json?v=dad2255de-20261025-234517",
  "./src/data/reward-economy.json?v=dad2255de-20261025-234517",
  "./src/data/schemas.json?v=dad2255de-20261025-234517",
  "./src/data/statusEffects.json?v=dad2255de-20261025-234517",
  "./src/data/synergies.json?v=dad2255de-20261025-234517",
  "./src/data/table-beats.json?v=dad2255de-20261025-234517",
  "./src/data/table-endings.json?v=dad2255de-20261025-234517",
  "./src/data/titans.json?v=dad2255de-20261025-234517",
  "./src/data/tracks.json?v=dad2255de-20261025-234517",
  "./src/data/villagers.json?v=dad2255de-20261025-234517",
  "./src/data/wave-ledger.json?v=dad2255de-20261025-234517"
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
