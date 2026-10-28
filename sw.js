/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'add0c5df5-20261028-172523';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=add0c5df5-20261028-172523",
  "./src/js/engine/modifiers.js?v=add0c5df5-20261028-172523",
  "./src/js/engine/calories.js?v=add0c5df5-20261028-172523",
  "./src/js/engine/day.js?v=add0c5df5-20261028-172523",
  "./src/js/engine/forage.js?v=add0c5df5-20261028-172523",
  "./src/js/engine/combat.js?v=add0c5df5-20261028-172523",
  "./src/js/audio-registry.js?v=add0c5df5-20261028-172523",
  "./src/js/text.js?v=add0c5df5-20261028-172523",
  "./src/js/game.js?v=add0c5df5-20261028-172523",
  "./src/js/encounters.js?v=add0c5df5-20261028-172523",
  "./src/js/conversation.js?v=add0c5df5-20261028-172523",
  "./src/js/convo-mood.js?v=add0c5df5-20261028-172523",
  "./src/js/convoTopics.js?v=add0c5df5-20261028-172523",
  "./src/js/naming-rite.js?v=add0c5df5-20261028-172523",
  "./src/js/convo-wants.js?v=add0c5df5-20261028-172523",
  "./src/js/convo-dialogue.js?v=add0c5df5-20261028-172523",
  "./src/js/convo-beats.js?v=add0c5df5-20261028-172523",
  "./src/js/convo-scene.js?v=add0c5df5-20261028-172523",
  "./src/js/voice-piper.js?v=add0c5df5-20261028-172523",
  "./src/js/voice-system.js?v=add0c5df5-20261028-172523",
  "./src/js/examine.js?v=add0c5df5-20261028-172523",
  "./src/js/equipment.js?v=add0c5df5-20261028-172523",
  "./src/js/journal.js?v=add0c5df5-20261028-172523",
  "./src/js/party.js?v=add0c5df5-20261028-172523",
  "./src/js/favor-water.js?v=add0c5df5-20261028-172523",
  "./src/js/favor-forage.js?v=add0c5df5-20261028-172523",
  "./src/js/party-formal.js?v=add0c5df5-20261028-172523",
  "./src/js/truth.js?v=add0c5df5-20261028-172523",
  "./src/js/galactic-cast.js?v=add0c5df5-20261028-172523",
  "./src/js/contests.js?v=add0c5df5-20261028-172523",
  "./src/js/broadcast.js?v=add0c5df5-20261028-172523",
  "./src/js/contestEngine.js?v=add0c5df5-20261028-172523",
  "./src/js/alienPlayers.js?v=add0c5df5-20261028-172523",
  "./src/js/storage.js?v=add0c5df5-20261028-172523",
  "./src/js/perceive.js?v=add0c5df5-20261028-172523",
  "./src/js/carexplore.js?v=add0c5df5-20261028-172523",
  "./src/js/justice.js?v=add0c5df5-20261028-172523",
  "./src/js/food.js?v=add0c5df5-20261028-172523",
  "./src/js/betrayal.js?v=add0c5df5-20261028-172523",
  "./src/js/corpses.js?v=add0c5df5-20261028-172523",
  "./src/js/corruption.js?v=add0c5df5-20261028-172523",
  "./src/js/lifeseed.js?v=add0c5df5-20261028-172523",
  "./src/js/spawn-knack.js?v=add0c5df5-20261028-172523",
  "./src/js/trial-deeds.js?v=add0c5df5-20261028-172523",
  "./src/js/practice-deeds.js?v=add0c5df5-20261028-172523",
  "./src/js/tracks.js?v=add0c5df5-20261028-172523",
  "./src/js/villager-build.js?v=add0c5df5-20261028-172523",
  "./src/js/progression.js?v=add0c5df5-20261028-172523",
  "./src/js/waveLedger.js?v=add0c5df5-20261028-172523",
  "./src/js/standing.js?v=add0c5df5-20261028-172523",
  "./src/js/feastBuff.js?v=add0c5df5-20261028-172523",
  "./src/js/ledger.js?v=add0c5df5-20261028-172523",
  "./src/js/exposure.js?v=add0c5df5-20261028-172523",
  "./src/js/abilityActions.js?v=add0c5df5-20261028-172523",
  "./src/js/buildarounds.js?v=add0c5df5-20261028-172523",
  "./src/js/foodPower.js?v=add0c5df5-20261028-172523",
  "./src/js/monsterBehaviors.js?v=add0c5df5-20261028-172523",
  "./src/js/partyTactics.js?v=add0c5df5-20261028-172523",
  "./src/js/sigW3a.js?v=add0c5df5-20261028-172523",
  "./src/js/statusEffects.js?v=add0c5df5-20261028-172523",
  "./src/js/sigW3b.js?v=add0c5df5-20261028-172523",
  "./src/js/metaProgression.js?v=add0c5df5-20261028-172523",
  "./src/js/sigW3c.js?v=add0c5df5-20261028-172523",
  "./src/js/sigW4.js?v=add0c5df5-20261028-172523",
  "./src/js/sigW5.js?v=add0c5df5-20261028-172523",
  "./src/js/villager-agency.js?v=add0c5df5-20261028-172523",
  "./src/js/npc-triggers.js?v=add0c5df5-20261028-172523",
  "./src/js/fieldFights.js?v=add0c5df5-20261028-172523",
  "./src/js/party-wiring.js?v=add0c5df5-20261028-172523",
  "./src/js/party-bond.js?v=add0c5df5-20261028-172523",
  "./src/js/villager-objectives.js?v=add0c5df5-20261028-172523",
  "./src/js/villager-mapmem.js?v=add0c5df5-20261028-172523",
  "./src/js/codex-people.js?v=add0c5df5-20261028-172523",
  "./src/js/fallen-memorial.js?v=add0c5df5-20261028-172523",
  "./src/js/graves.js?v=add0c5df5-20261028-172523",
  "./src/js/membership.js?v=add0c5df5-20261028-172523",
  "./src/js/gardenCultivation.js?v=add0c5df5-20261028-172523",
  "./src/js/havenGrowth.js?v=add0c5df5-20261028-172523",
  "./src/js/shelter.js?v=add0c5df5-20261028-172523",
  "./src/js/hierarchy.js?v=add0c5df5-20261028-172523",
  "./src/js/scaleDiscovery.js?v=add0c5df5-20261028-172523",
  "./src/js/comms.js?v=add0c5df5-20261028-172523",
  "./src/js/table.js?v=add0c5df5-20261028-172523",
  "./src/js/pods.js?v=add0c5df5-20261028-172523",
  "./src/js/titans.js?v=add0c5df5-20261028-172523",
  "./src/js/finale-campaign.js?v=add0c5df5-20261028-172523",
  "./src/js/godhood.js?v=add0c5df5-20261028-172523",
  "./src/js/pantheon.js?v=add0c5df5-20261028-172523",
  "./src/js/records.js?v=add0c5df5-20261028-172523",
  "./src/js/table-feared.js?v=add0c5df5-20261028-172523",
  "./src/js/table-indispensable.js?v=add0c5df5-20261028-172523",
  "./src/js/table-beloved.js?v=add0c5df5-20261028-172523",
  "./src/js/table-witness.js?v=add0c5df5-20261028-172523",
  "./src/js/table-assimilated.js?v=add0c5df5-20261028-172523",
  "./src/js/table-defiant.js?v=add0c5df5-20261028-172523",
  "./src/js/relay-ext.js?v=add0c5df5-20261028-172523",
  "./src/js/relay-dialogue.js?v=add0c5df5-20261028-172523",
  "./src/js/table-relay.js?v=add0c5df5-20261028-172523",
  "./src/js/safetynets.js?v=add0c5df5-20261028-172523",
  "./src/js/villageAgency.js?v=add0c5df5-20261028-172523",
  "./src/js/memdepth.js?v=add0c5df5-20261028-172523",
  "./src/js/overtime.js?v=add0c5df5-20261028-172523",
  "./src/js/network-campaign.js?v=add0c5df5-20261028-172523",
  "./src/js/debug-scenarios.js?v=add0c5df5-20261028-172523",
  "./src/js/keepsakes.js?v=add0c5df5-20261028-172523",
  "./src/js/skill-teaching.js?v=add0c5df5-20261028-172523",
  "./src/js/world.js?v=add0c5df5-20261028-172523",
  "./src/js/nomad.js?v=add0c5df5-20261028-172523",
  "./src/js/nomad-wild.js?v=add0c5df5-20261028-172523",
  "./src/js/nomad-scenes.js?v=add0c5df5-20261028-172523",
  "./src/js/nomad-drive.js?v=add0c5df5-20261028-172523",
  "./src/js/temperature.js?v=add0c5df5-20261028-172523",
  "./src/js/godpath.js?v=add0c5df5-20261028-172523",
  "./src/js/godverbs.js?v=add0c5df5-20261028-172523",
  "./src/js/endingKey.js?v=add0c5df5-20261028-172523",
  "./src/js/telemetry-hooks.js?v=add0c5df5-20261028-172523",
  "./src/js/feel.js?v=add0c5df5-20261028-172523",
  "./src/js/build.js?v=add0c5df5-20261028-172523",
  "./src/js/whereAreWe.js?v=add0c5df5-20261028-172523",
  "./src/js/drama.js?v=add0c5df5-20261028-172523",
  "./src/js/move-anim.js?v=add0c5df5-20261028-172523",
  "./src/js/presentation.js?v=add0c5df5-20261028-172523",
  "./src/js/sprites.js?v=add0c5df5-20261028-172523",
  "./src/js/tile-scenes.js?v=add0c5df5-20261028-172523",
  "./src/js/regional-audio.js?v=add0c5df5-20261028-172523",
  "./src/js/favor-company.js?v=add0c5df5-20261028-172523",
  "./src/js/timeSettlement.js?v=add0c5df5-20261028-172523",
  "./src/js/app.js?v=add0c5df5-20261028-172523",
  "./src/js/feel-audio.js?v=add0c5df5-20261028-172523",
  "./manifest.json?v=add0c5df5-20261028-172523",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=add0c5df5-20261028-172523",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=add0c5df5-20261028-172523",
  "./src/data/alienPlayers.json?v=add0c5df5-20261028-172523",
  "./src/data/animals.json?v=add0c5df5-20261028-172523",
  "./src/data/arrivalText.json?v=add0c5df5-20261028-172523",
  "./src/data/background_survivors.json?v=add0c5df5-20261028-172523",
  "./src/data/biomes.json?v=add0c5df5-20261028-172523",
  "./src/data/books.json?v=add0c5df5-20261028-172523",
  "./src/data/build-notes.json?v=add0c5df5-20261028-172523",
  "./src/data/cell_defs.json?v=add0c5df5-20261028-172523",
  "./src/data/characterGen.json?v=add0c5df5-20261028-172523",
  "./src/data/climates.json?v=add0c5df5-20261028-172523",
  "./src/data/contests.json?v=add0c5df5-20261028-172523",
  "./src/data/cooking.json?v=add0c5df5-20261028-172523",
  "./src/data/events.json?v=add0c5df5-20261028-172523",
  "./src/data/evolutions.json?v=add0c5df5-20261028-172523",
  "./src/data/favor-rules.json?v=add0c5df5-20261028-172523",
  "./src/data/feast-surge.json?v=add0c5df5-20261028-172523",
  "./src/data/foreignSpeech.json?v=add0c5df5-20261028-172523",
  "./src/data/gardening.json?v=add0c5df5-20261028-172523",
  "./src/data/godpaths.json?v=add0c5df5-20261028-172523",
  "./src/data/items.json?v=add0c5df5-20261028-172523",
  "./src/data/justiceVoice.json?v=add0c5df5-20261028-172523",
  "./src/data/knowledge.json?v=add0c5df5-20261028-172523",
  "./src/data/lifeseeds.json?v=add0c5df5-20261028-172523",
  "./src/data/locations.json?v=add0c5df5-20261028-172523",
  "./src/data/monsterBehaviors.json?v=add0c5df5-20261028-172523",
  "./src/data/monsters.json?v=add0c5df5-20261028-172523",
  "./src/data/nameCultures.json?v=add0c5df5-20261028-172523",
  "./src/data/originPicker.json?v=add0c5df5-20261028-172523",
  "./src/data/plants.json?v=add0c5df5-20261028-172523",
  "./src/data/presentation.json?v=add0c5df5-20261028-172523",
  "./src/data/recipes.json?v=add0c5df5-20261028-172523",
  "./src/data/regions.json?v=add0c5df5-20261028-172523",
  "./src/data/relicEnhancements.json?v=add0c5df5-20261028-172523",
  "./src/data/reward-economy.json?v=add0c5df5-20261028-172523",
  "./src/data/schemas.json?v=add0c5df5-20261028-172523",
  "./src/data/statusEffects.json?v=add0c5df5-20261028-172523",
  "./src/data/synergies.json?v=add0c5df5-20261028-172523",
  "./src/data/table-beats.json?v=add0c5df5-20261028-172523",
  "./src/data/table-endings.json?v=add0c5df5-20261028-172523",
  "./src/data/titans.json?v=add0c5df5-20261028-172523",
  "./src/data/tracks.json?v=add0c5df5-20261028-172523",
  "./src/data/villagers.json?v=add0c5df5-20261028-172523",
  "./src/data/wave-ledger.json?v=add0c5df5-20261028-172523"
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
