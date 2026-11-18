/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'a48b2405c-20261118-182021';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=a48b2405c-20261118-182021",
  "./src/js/engine/modifiers.js?v=a48b2405c-20261118-182021",
  "./src/js/engine/calories.js?v=a48b2405c-20261118-182021",
  "./src/js/engine/day.js?v=a48b2405c-20261118-182021",
  "./src/js/engine/forage.js?v=a48b2405c-20261118-182021",
  "./src/js/engine/combat.js?v=a48b2405c-20261118-182021",
  "./src/js/audio-registry.js?v=a48b2405c-20261118-182021",
  "./src/js/text.js?v=a48b2405c-20261118-182021",
  "./src/js/game.js?v=a48b2405c-20261118-182021",
  "./src/js/encounters.js?v=a48b2405c-20261118-182021",
  "./src/js/conversation.js?v=a48b2405c-20261118-182021",
  "./src/js/convo-mood.js?v=a48b2405c-20261118-182021",
  "./src/js/convoTopics.js?v=a48b2405c-20261118-182021",
  "./src/js/naming-rite.js?v=a48b2405c-20261118-182021",
  "./src/js/convo-wants.js?v=a48b2405c-20261118-182021",
  "./src/js/convo-dialogue.js?v=a48b2405c-20261118-182021",
  "./src/js/convo-beats.js?v=a48b2405c-20261118-182021",
  "./src/js/convo-scene.js?v=a48b2405c-20261118-182021",
  "./src/js/voice-piper.js?v=a48b2405c-20261118-182021",
  "./src/js/voice-system.js?v=a48b2405c-20261118-182021",
  "./src/js/examine.js?v=a48b2405c-20261118-182021",
  "./src/js/equipment.js?v=a48b2405c-20261118-182021",
  "./src/js/journal.js?v=a48b2405c-20261118-182021",
  "./src/js/party.js?v=a48b2405c-20261118-182021",
  "./src/js/favor-water.js?v=a48b2405c-20261118-182021",
  "./src/js/favor-forage.js?v=a48b2405c-20261118-182021",
  "./src/js/favor-outing.js?v=a48b2405c-20261118-182021",
  "./src/js/party-formal.js?v=a48b2405c-20261118-182021",
  "./src/js/truth.js?v=a48b2405c-20261118-182021",
  "./src/js/galactic-cast.js?v=a48b2405c-20261118-182021",
  "./src/js/contests.js?v=a48b2405c-20261118-182021",
  "./src/js/broadcast.js?v=a48b2405c-20261118-182021",
  "./src/js/contestEngine.js?v=a48b2405c-20261118-182021",
  "./src/js/alienPlayers.js?v=a48b2405c-20261118-182021",
  "./src/js/storage.js?v=a48b2405c-20261118-182021",
  "./src/js/perceive.js?v=a48b2405c-20261118-182021",
  "./src/js/carexplore.js?v=a48b2405c-20261118-182021",
  "./src/js/justice.js?v=a48b2405c-20261118-182021",
  "./src/js/food.js?v=a48b2405c-20261118-182021",
  "./src/js/betrayal.js?v=a48b2405c-20261118-182021",
  "./src/js/corpses.js?v=a48b2405c-20261118-182021",
  "./src/js/corruption.js?v=a48b2405c-20261118-182021",
  "./src/js/lifeseed.js?v=a48b2405c-20261118-182021",
  "./src/js/spawn-knack.js?v=a48b2405c-20261118-182021",
  "./src/js/trial-deeds.js?v=a48b2405c-20261118-182021",
  "./src/js/practice-deeds.js?v=a48b2405c-20261118-182021",
  "./src/js/tracks.js?v=a48b2405c-20261118-182021",
  "./src/js/villager-build.js?v=a48b2405c-20261118-182021",
  "./src/js/progression.js?v=a48b2405c-20261118-182021",
  "./src/js/waveLedger.js?v=a48b2405c-20261118-182021",
  "./src/js/standing.js?v=a48b2405c-20261118-182021",
  "./src/js/ladder.js?v=a48b2405c-20261118-182021",
  "./src/js/feastBuff.js?v=a48b2405c-20261118-182021",
  "./src/js/ledger.js?v=a48b2405c-20261118-182021",
  "./src/js/exposure.js?v=a48b2405c-20261118-182021",
  "./src/js/abilityActions.js?v=a48b2405c-20261118-182021",
  "./src/js/buildarounds.js?v=a48b2405c-20261118-182021",
  "./src/js/foodPower.js?v=a48b2405c-20261118-182021",
  "./src/js/monsterBehaviors.js?v=a48b2405c-20261118-182021",
  "./src/js/partyTactics.js?v=a48b2405c-20261118-182021",
  "./src/js/sigW3a.js?v=a48b2405c-20261118-182021",
  "./src/js/statusEffects.js?v=a48b2405c-20261118-182021",
  "./src/js/sigW3b.js?v=a48b2405c-20261118-182021",
  "./src/js/metaProgression.js?v=a48b2405c-20261118-182021",
  "./src/js/sigW3c.js?v=a48b2405c-20261118-182021",
  "./src/js/sigW4.js?v=a48b2405c-20261118-182021",
  "./src/js/sigW5.js?v=a48b2405c-20261118-182021",
  "./src/js/villager-agency.js?v=a48b2405c-20261118-182021",
  "./src/js/win-plan.js?v=a48b2405c-20261118-182021",
  "./src/js/npc-triggers.js?v=a48b2405c-20261118-182021",
  "./src/js/fieldFights.js?v=a48b2405c-20261118-182021",
  "./src/js/party-wiring.js?v=a48b2405c-20261118-182021",
  "./src/js/party-bond.js?v=a48b2405c-20261118-182021",
  "./src/js/villager-objectives.js?v=a48b2405c-20261118-182021",
  "./src/js/villager-goals.js?v=a48b2405c-20261118-182021",
  "./src/js/villager-brain.js?v=a48b2405c-20261118-182021",
  "./src/js/bond-initiation.js?v=a48b2405c-20261118-182021",
  "./src/js/villager-mapmem.js?v=a48b2405c-20261118-182021",
  "./src/js/codex-people.js?v=a48b2405c-20261118-182021",
  "./src/js/fallen-memorial.js?v=a48b2405c-20261118-182021",
  "./src/js/graves.js?v=a48b2405c-20261118-182021",
  "./src/js/membership.js?v=a48b2405c-20261118-182021",
  "./src/js/gardenCultivation.js?v=a48b2405c-20261118-182021",
  "./src/js/havenGrowth.js?v=a48b2405c-20261118-182021",
  "./src/js/shelter.js?v=a48b2405c-20261118-182021",
  "./src/js/hierarchy.js?v=a48b2405c-20261118-182021",
  "./src/js/scaleDiscovery.js?v=a48b2405c-20261118-182021",
  "./src/js/comms.js?v=a48b2405c-20261118-182021",
  "./src/js/table.js?v=a48b2405c-20261118-182021",
  "./src/js/pods.js?v=a48b2405c-20261118-182021",
  "./src/js/titans.js?v=a48b2405c-20261118-182021",
  "./src/js/finale-campaign.js?v=a48b2405c-20261118-182021",
  "./src/js/godhood.js?v=a48b2405c-20261118-182021",
  "./src/js/pantheon.js?v=a48b2405c-20261118-182021",
  "./src/js/records.js?v=a48b2405c-20261118-182021",
  "./src/js/table-feared.js?v=a48b2405c-20261118-182021",
  "./src/js/table-indispensable.js?v=a48b2405c-20261118-182021",
  "./src/js/table-beloved.js?v=a48b2405c-20261118-182021",
  "./src/js/table-witness.js?v=a48b2405c-20261118-182021",
  "./src/js/table-assimilated.js?v=a48b2405c-20261118-182021",
  "./src/js/table-defiant.js?v=a48b2405c-20261118-182021",
  "./src/js/relay-ext.js?v=a48b2405c-20261118-182021",
  "./src/js/relay-dialogue.js?v=a48b2405c-20261118-182021",
  "./src/js/table-relay.js?v=a48b2405c-20261118-182021",
  "./src/js/safetynets.js?v=a48b2405c-20261118-182021",
  "./src/js/villageAgency.js?v=a48b2405c-20261118-182021",
  "./src/js/memdepth.js?v=a48b2405c-20261118-182021",
  "./src/js/overtime.js?v=a48b2405c-20261118-182021",
  "./src/js/network-campaign.js?v=a48b2405c-20261118-182021",
  "./src/js/debug-scenarios.js?v=a48b2405c-20261118-182021",
  "./src/js/keepsakes.js?v=a48b2405c-20261118-182021",
  "./src/js/skill-teaching.js?v=a48b2405c-20261118-182021",
  "./src/js/person-trust.js?v=a48b2405c-20261118-182021",
  "./src/js/companion-score.js?v=a48b2405c-20261118-182021",
  "./src/js/world.js?v=a48b2405c-20261118-182021",
  "./src/js/nomad.js?v=a48b2405c-20261118-182021",
  "./src/js/nomad-wild.js?v=a48b2405c-20261118-182021",
  "./src/js/nomad-scenes.js?v=a48b2405c-20261118-182021",
  "./src/js/nomad-drive.js?v=a48b2405c-20261118-182021",
  "./src/js/temperature.js?v=a48b2405c-20261118-182021",
  "./src/js/godpath.js?v=a48b2405c-20261118-182021",
  "./src/js/godverbs.js?v=a48b2405c-20261118-182021",
  "./src/js/endingKey.js?v=a48b2405c-20261118-182021",
  "./src/js/telemetry-hooks.js?v=a48b2405c-20261118-182021",
  "./src/js/finishLog.js?v=a48b2405c-20261118-182021",
  "./src/js/feel.js?v=a48b2405c-20261118-182021",
  "./src/js/build.js?v=a48b2405c-20261118-182021",
  "./src/js/whereAreWe.js?v=a48b2405c-20261118-182021",
  "./src/js/drama.js?v=a48b2405c-20261118-182021",
  "./src/js/move-anim.js?v=a48b2405c-20261118-182021",
  "./src/js/presentation.js?v=a48b2405c-20261118-182021",
  "./src/js/sprites.js?v=a48b2405c-20261118-182021",
  "./src/js/tile-scenes.js?v=a48b2405c-20261118-182021",
  "./src/js/regional-audio.js?v=a48b2405c-20261118-182021",
  "./src/js/favor-company.js?v=a48b2405c-20261118-182021",
  "./src/js/timeSettlement.js?v=a48b2405c-20261118-182021",
  "./src/js/app.js?v=a48b2405c-20261118-182021",
  "./src/js/feel-audio.js?v=a48b2405c-20261118-182021",
  "./manifest.json?v=a48b2405c-20261118-182021",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=a48b2405c-20261118-182021",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=a48b2405c-20261118-182021",
  "./src/data/alienPlayers.json?v=a48b2405c-20261118-182021",
  "./src/data/animals.json?v=a48b2405c-20261118-182021",
  "./src/data/arrivalText.json?v=a48b2405c-20261118-182021",
  "./src/data/background_survivors.json?v=a48b2405c-20261118-182021",
  "./src/data/biomes.json?v=a48b2405c-20261118-182021",
  "./src/data/books.json?v=a48b2405c-20261118-182021",
  "./src/data/build-notes.json?v=a48b2405c-20261118-182021",
  "./src/data/cell_defs.json?v=a48b2405c-20261118-182021",
  "./src/data/characterGen.json?v=a48b2405c-20261118-182021",
  "./src/data/climates.json?v=a48b2405c-20261118-182021",
  "./src/data/contests.json?v=a48b2405c-20261118-182021",
  "./src/data/cooking.json?v=a48b2405c-20261118-182021",
  "./src/data/events.json?v=a48b2405c-20261118-182021",
  "./src/data/evolutions.json?v=a48b2405c-20261118-182021",
  "./src/data/favor-rules.json?v=a48b2405c-20261118-182021",
  "./src/data/feast-surge.json?v=a48b2405c-20261118-182021",
  "./src/data/foreignSpeech.json?v=a48b2405c-20261118-182021",
  "./src/data/gardening.json?v=a48b2405c-20261118-182021",
  "./src/data/godpaths.json?v=a48b2405c-20261118-182021",
  "./src/data/items.json?v=a48b2405c-20261118-182021",
  "./src/data/justiceVoice.json?v=a48b2405c-20261118-182021",
  "./src/data/knowledge.json?v=a48b2405c-20261118-182021",
  "./src/data/ladder-capstones.json?v=a48b2405c-20261118-182021",
  "./src/data/lifeseeds.json?v=a48b2405c-20261118-182021",
  "./src/data/locations.json?v=a48b2405c-20261118-182021",
  "./src/data/monsterBehaviors.json?v=a48b2405c-20261118-182021",
  "./src/data/monsters.json?v=a48b2405c-20261118-182021",
  "./src/data/nameCultures.json?v=a48b2405c-20261118-182021",
  "./src/data/originPicker.json?v=a48b2405c-20261118-182021",
  "./src/data/pellet-boost.json?v=a48b2405c-20261118-182021",
  "./src/data/plants.json?v=a48b2405c-20261118-182021",
  "./src/data/presentation.json?v=a48b2405c-20261118-182021",
  "./src/data/recipes.json?v=a48b2405c-20261118-182021",
  "./src/data/regions.json?v=a48b2405c-20261118-182021",
  "./src/data/relicEnhancements.json?v=a48b2405c-20261118-182021",
  "./src/data/reward-economy.json?v=a48b2405c-20261118-182021",
  "./src/data/schemas.json?v=a48b2405c-20261118-182021",
  "./src/data/statusEffects.json?v=a48b2405c-20261118-182021",
  "./src/data/synergies.json?v=a48b2405c-20261118-182021",
  "./src/data/table-beats.json?v=a48b2405c-20261118-182021",
  "./src/data/table-endings.json?v=a48b2405c-20261118-182021",
  "./src/data/titans.json?v=a48b2405c-20261118-182021",
  "./src/data/tracks.json?v=a48b2405c-20261118-182021",
  "./src/data/villagers.json?v=a48b2405c-20261118-182021",
  "./src/data/wave-ledger.json?v=a48b2405c-20261118-182021"
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
