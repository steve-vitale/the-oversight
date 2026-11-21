/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'c7be183e0-20261121-173558';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=c7be183e0-20261121-173558",
  "./src/js/engine/modifiers.js?v=c7be183e0-20261121-173558",
  "./src/js/engine/calories.js?v=c7be183e0-20261121-173558",
  "./src/js/engine/day.js?v=c7be183e0-20261121-173558",
  "./src/js/engine/forage.js?v=c7be183e0-20261121-173558",
  "./src/js/engine/combat.js?v=c7be183e0-20261121-173558",
  "./src/js/audio-registry.js?v=c7be183e0-20261121-173558",
  "./src/js/text.js?v=c7be183e0-20261121-173558",
  "./src/js/game.js?v=c7be183e0-20261121-173558",
  "./src/js/encounters.js?v=c7be183e0-20261121-173558",
  "./src/js/conversation.js?v=c7be183e0-20261121-173558",
  "./src/js/convo-mood.js?v=c7be183e0-20261121-173558",
  "./src/js/convoTopics.js?v=c7be183e0-20261121-173558",
  "./src/js/naming-rite.js?v=c7be183e0-20261121-173558",
  "./src/js/convo-wants.js?v=c7be183e0-20261121-173558",
  "./src/js/convo-dialogue.js?v=c7be183e0-20261121-173558",
  "./src/js/convo-beats.js?v=c7be183e0-20261121-173558",
  "./src/js/convo-scene.js?v=c7be183e0-20261121-173558",
  "./src/js/voice-piper.js?v=c7be183e0-20261121-173558",
  "./src/js/voice-system.js?v=c7be183e0-20261121-173558",
  "./src/js/examine.js?v=c7be183e0-20261121-173558",
  "./src/js/equipment.js?v=c7be183e0-20261121-173558",
  "./src/js/journal.js?v=c7be183e0-20261121-173558",
  "./src/js/party.js?v=c7be183e0-20261121-173558",
  "./src/js/favor-water.js?v=c7be183e0-20261121-173558",
  "./src/js/favor-forage.js?v=c7be183e0-20261121-173558",
  "./src/js/favor-outing.js?v=c7be183e0-20261121-173558",
  "./src/js/party-formal.js?v=c7be183e0-20261121-173558",
  "./src/js/truth.js?v=c7be183e0-20261121-173558",
  "./src/js/galactic-cast.js?v=c7be183e0-20261121-173558",
  "./src/js/contests.js?v=c7be183e0-20261121-173558",
  "./src/js/broadcast.js?v=c7be183e0-20261121-173558",
  "./src/js/contestEngine.js?v=c7be183e0-20261121-173558",
  "./src/js/alienPlayers.js?v=c7be183e0-20261121-173558",
  "./src/js/storage.js?v=c7be183e0-20261121-173558",
  "./src/js/perceive.js?v=c7be183e0-20261121-173558",
  "./src/js/carexplore.js?v=c7be183e0-20261121-173558",
  "./src/js/justice.js?v=c7be183e0-20261121-173558",
  "./src/js/food.js?v=c7be183e0-20261121-173558",
  "./src/js/betrayal.js?v=c7be183e0-20261121-173558",
  "./src/js/corpses.js?v=c7be183e0-20261121-173558",
  "./src/js/corruption.js?v=c7be183e0-20261121-173558",
  "./src/js/lifeseed.js?v=c7be183e0-20261121-173558",
  "./src/js/spawn-knack.js?v=c7be183e0-20261121-173558",
  "./src/js/trial-deeds.js?v=c7be183e0-20261121-173558",
  "./src/js/practice-deeds.js?v=c7be183e0-20261121-173558",
  "./src/js/tracks.js?v=c7be183e0-20261121-173558",
  "./src/js/villager-build.js?v=c7be183e0-20261121-173558",
  "./src/js/progression.js?v=c7be183e0-20261121-173558",
  "./src/js/waveLedger.js?v=c7be183e0-20261121-173558",
  "./src/js/standing.js?v=c7be183e0-20261121-173558",
  "./src/js/ladder.js?v=c7be183e0-20261121-173558",
  "./src/js/feastBuff.js?v=c7be183e0-20261121-173558",
  "./src/js/ledger.js?v=c7be183e0-20261121-173558",
  "./src/js/exposure.js?v=c7be183e0-20261121-173558",
  "./src/js/abilityActions.js?v=c7be183e0-20261121-173558",
  "./src/js/buildarounds.js?v=c7be183e0-20261121-173558",
  "./src/js/foodPower.js?v=c7be183e0-20261121-173558",
  "./src/js/monsterBehaviors.js?v=c7be183e0-20261121-173558",
  "./src/js/partyTactics.js?v=c7be183e0-20261121-173558",
  "./src/js/sigW3a.js?v=c7be183e0-20261121-173558",
  "./src/js/statusEffects.js?v=c7be183e0-20261121-173558",
  "./src/js/sigW3b.js?v=c7be183e0-20261121-173558",
  "./src/js/metaProgression.js?v=c7be183e0-20261121-173558",
  "./src/js/sigW3c.js?v=c7be183e0-20261121-173558",
  "./src/js/sigW4.js?v=c7be183e0-20261121-173558",
  "./src/js/sigW5.js?v=c7be183e0-20261121-173558",
  "./src/js/villager-agency.js?v=c7be183e0-20261121-173558",
  "./src/js/win-plan.js?v=c7be183e0-20261121-173558",
  "./src/js/npc-triggers.js?v=c7be183e0-20261121-173558",
  "./src/js/fieldFights.js?v=c7be183e0-20261121-173558",
  "./src/js/party-wiring.js?v=c7be183e0-20261121-173558",
  "./src/js/party-bond.js?v=c7be183e0-20261121-173558",
  "./src/js/villager-objectives.js?v=c7be183e0-20261121-173558",
  "./src/js/villager-goals.js?v=c7be183e0-20261121-173558",
  "./src/js/villager-brain.js?v=c7be183e0-20261121-173558",
  "./src/js/bond-initiation.js?v=c7be183e0-20261121-173558",
  "./src/js/villager-mapmem.js?v=c7be183e0-20261121-173558",
  "./src/js/codex-people.js?v=c7be183e0-20261121-173558",
  "./src/js/fallen-memorial.js?v=c7be183e0-20261121-173558",
  "./src/js/graves.js?v=c7be183e0-20261121-173558",
  "./src/js/membership.js?v=c7be183e0-20261121-173558",
  "./src/js/gardenCultivation.js?v=c7be183e0-20261121-173558",
  "./src/js/havenGrowth.js?v=c7be183e0-20261121-173558",
  "./src/js/shelter.js?v=c7be183e0-20261121-173558",
  "./src/js/hierarchy.js?v=c7be183e0-20261121-173558",
  "./src/js/scaleDiscovery.js?v=c7be183e0-20261121-173558",
  "./src/js/comms.js?v=c7be183e0-20261121-173558",
  "./src/js/table.js?v=c7be183e0-20261121-173558",
  "./src/js/pods.js?v=c7be183e0-20261121-173558",
  "./src/js/titans.js?v=c7be183e0-20261121-173558",
  "./src/js/finale-campaign.js?v=c7be183e0-20261121-173558",
  "./src/js/godhood.js?v=c7be183e0-20261121-173558",
  "./src/js/pantheon.js?v=c7be183e0-20261121-173558",
  "./src/js/records.js?v=c7be183e0-20261121-173558",
  "./src/js/table-feared.js?v=c7be183e0-20261121-173558",
  "./src/js/table-indispensable.js?v=c7be183e0-20261121-173558",
  "./src/js/table-beloved.js?v=c7be183e0-20261121-173558",
  "./src/js/table-witness.js?v=c7be183e0-20261121-173558",
  "./src/js/table-assimilated.js?v=c7be183e0-20261121-173558",
  "./src/js/table-defiant.js?v=c7be183e0-20261121-173558",
  "./src/js/relay-ext.js?v=c7be183e0-20261121-173558",
  "./src/js/relay-dialogue.js?v=c7be183e0-20261121-173558",
  "./src/js/table-relay.js?v=c7be183e0-20261121-173558",
  "./src/js/safetynets.js?v=c7be183e0-20261121-173558",
  "./src/js/villageAgency.js?v=c7be183e0-20261121-173558",
  "./src/js/memdepth.js?v=c7be183e0-20261121-173558",
  "./src/js/overtime.js?v=c7be183e0-20261121-173558",
  "./src/js/network-campaign.js?v=c7be183e0-20261121-173558",
  "./src/js/debug-scenarios.js?v=c7be183e0-20261121-173558",
  "./src/js/keepsakes.js?v=c7be183e0-20261121-173558",
  "./src/js/skill-teaching.js?v=c7be183e0-20261121-173558",
  "./src/js/person-trust.js?v=c7be183e0-20261121-173558",
  "./src/js/companion-score.js?v=c7be183e0-20261121-173558",
  "./src/js/world.js?v=c7be183e0-20261121-173558",
  "./src/js/nomad.js?v=c7be183e0-20261121-173558",
  "./src/js/nomad-wild.js?v=c7be183e0-20261121-173558",
  "./src/js/nomad-scenes.js?v=c7be183e0-20261121-173558",
  "./src/js/nomad-drive.js?v=c7be183e0-20261121-173558",
  "./src/js/temperature.js?v=c7be183e0-20261121-173558",
  "./src/js/godpath.js?v=c7be183e0-20261121-173558",
  "./src/js/godverbs.js?v=c7be183e0-20261121-173558",
  "./src/js/endingKey.js?v=c7be183e0-20261121-173558",
  "./src/js/telemetry-hooks.js?v=c7be183e0-20261121-173558",
  "./src/js/finishLog.js?v=c7be183e0-20261121-173558",
  "./src/js/feel.js?v=c7be183e0-20261121-173558",
  "./src/js/build.js?v=c7be183e0-20261121-173558",
  "./src/js/whereAreWe.js?v=c7be183e0-20261121-173558",
  "./src/js/drama.js?v=c7be183e0-20261121-173558",
  "./src/js/move-anim.js?v=c7be183e0-20261121-173558",
  "./src/js/presentation.js?v=c7be183e0-20261121-173558",
  "./src/js/sprites.js?v=c7be183e0-20261121-173558",
  "./src/js/tile-scenes.js?v=c7be183e0-20261121-173558",
  "./src/js/regional-audio.js?v=c7be183e0-20261121-173558",
  "./src/js/favor-company.js?v=c7be183e0-20261121-173558",
  "./src/js/timeSettlement.js?v=c7be183e0-20261121-173558",
  "./src/js/app.js?v=c7be183e0-20261121-173558",
  "./src/js/feel-audio.js?v=c7be183e0-20261121-173558",
  "./manifest.json?v=c7be183e0-20261121-173558",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=c7be183e0-20261121-173558",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=c7be183e0-20261121-173558",
  "./src/data/alienPlayers.json?v=c7be183e0-20261121-173558",
  "./src/data/animals.json?v=c7be183e0-20261121-173558",
  "./src/data/arrivalText.json?v=c7be183e0-20261121-173558",
  "./src/data/background_survivors.json?v=c7be183e0-20261121-173558",
  "./src/data/biomes.json?v=c7be183e0-20261121-173558",
  "./src/data/books.json?v=c7be183e0-20261121-173558",
  "./src/data/build-notes.json?v=c7be183e0-20261121-173558",
  "./src/data/cell_defs.json?v=c7be183e0-20261121-173558",
  "./src/data/characterGen.json?v=c7be183e0-20261121-173558",
  "./src/data/climates.json?v=c7be183e0-20261121-173558",
  "./src/data/contests.json?v=c7be183e0-20261121-173558",
  "./src/data/cooking.json?v=c7be183e0-20261121-173558",
  "./src/data/events.json?v=c7be183e0-20261121-173558",
  "./src/data/evolutions.json?v=c7be183e0-20261121-173558",
  "./src/data/favor-rules.json?v=c7be183e0-20261121-173558",
  "./src/data/feast-surge.json?v=c7be183e0-20261121-173558",
  "./src/data/foreignSpeech.json?v=c7be183e0-20261121-173558",
  "./src/data/gardening.json?v=c7be183e0-20261121-173558",
  "./src/data/godpaths.json?v=c7be183e0-20261121-173558",
  "./src/data/items.json?v=c7be183e0-20261121-173558",
  "./src/data/justiceVoice.json?v=c7be183e0-20261121-173558",
  "./src/data/knowledge.json?v=c7be183e0-20261121-173558",
  "./src/data/ladder-capstones.json?v=c7be183e0-20261121-173558",
  "./src/data/lifeseeds.json?v=c7be183e0-20261121-173558",
  "./src/data/locations.json?v=c7be183e0-20261121-173558",
  "./src/data/monsterBehaviors.json?v=c7be183e0-20261121-173558",
  "./src/data/monsters.json?v=c7be183e0-20261121-173558",
  "./src/data/nameCultures.json?v=c7be183e0-20261121-173558",
  "./src/data/originPicker.json?v=c7be183e0-20261121-173558",
  "./src/data/pellet-boost.json?v=c7be183e0-20261121-173558",
  "./src/data/plants.json?v=c7be183e0-20261121-173558",
  "./src/data/presentation.json?v=c7be183e0-20261121-173558",
  "./src/data/recipes.json?v=c7be183e0-20261121-173558",
  "./src/data/regions.json?v=c7be183e0-20261121-173558",
  "./src/data/relicEnhancements.json?v=c7be183e0-20261121-173558",
  "./src/data/reward-economy.json?v=c7be183e0-20261121-173558",
  "./src/data/schemas.json?v=c7be183e0-20261121-173558",
  "./src/data/statusEffects.json?v=c7be183e0-20261121-173558",
  "./src/data/synergies.json?v=c7be183e0-20261121-173558",
  "./src/data/table-beats.json?v=c7be183e0-20261121-173558",
  "./src/data/table-endings.json?v=c7be183e0-20261121-173558",
  "./src/data/titans.json?v=c7be183e0-20261121-173558",
  "./src/data/tracks.json?v=c7be183e0-20261121-173558",
  "./src/data/villagers.json?v=c7be183e0-20261121-173558",
  "./src/data/wave-ledger.json?v=c7be183e0-20261121-173558"
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
