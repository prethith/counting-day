<template>
  <div class="scoreboard">
    <!-- Alliance bars -->
    <div class="alliance-grid">
      <div
        v-for="(allianceCfg, key) in stateConfig.alliances"
        :key="key"
        class="alliance-card"
        :class="{ winning: isWinning(key) }"
      >
        <div class="alliance-label" :style="{ color: allianceCfg.color }">
          {{ allianceCfg.label }}
        </div>
        <div class="alliance-count">{{ tally[key] ?? 0 }}</div>
        <div class="alliance-desc">{{ allianceCfg.description }}</div>
      </div>

      <!-- Pending -->
      <div class="alliance-card pending-card">
        <div class="alliance-label pending-label">Pending</div>
        <div class="alliance-count">{{ tally.pending ?? 0 }}</div>
        <div class="alliance-desc">Not yet started</div>
      </div>
    </div>

    <!-- Visual bar -->
    <div class="seats-bar-wrap">
      <div class="seats-bar">
        <div
          v-for="(allianceCfg, key) in stateConfig.alliances"
          :key="key"
          class="bar-segment"
          :style="{
            width: barPct(tally[key]) + '%',
            background: allianceCfg.color,
          }"
          :title="`${allianceCfg.label}: ${tally[key] ?? 0} seats`"
        />
        <div
          class="bar-segment bar-pending"
          :style="{ width: barPct(tally.pending) + '%' }"
        />
      </div>

      <!-- Majority marker -->
      <div
        class="majority-line"
        :style="{ left: majorityPct + '%' }"
      >
        <div class="majority-tick" />
        <div class="majority-label">{{ stateConfig.majority }}</div>
      </div>
    </div>

    <!-- Status line -->
    <div class="status-line">
      <span class="declared-count">{{ declared }} declared</span>
      <span class="separator">·</span>
      <span class="counting-count">{{ counting }} counting</span>
      <span class="separator">·</span>
      <span class="total-count">{{ stateConfig.totalSeats }} total seats</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stateConfig: Object,
  tally: Object,
  declared: Number,
  counting: Number,
})

const majorityPct = computed(() =>
  (props.stateConfig.majority / props.stateConfig.totalSeats) * 100
)

function barPct(seats) {
  if (!seats) return 0
  return (seats / props.stateConfig.totalSeats) * 100
}

function isWinning(key) {
  const seats = props.tally?.[key] ?? 0
  return seats >= props.stateConfig.majority
}
</script>

<style scoped>
.scoreboard {
  font-family: var(--font-body);
}

.alliance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.alliance-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 6px;
  text-align: center;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.alliance-card.winning {
  border-color: currentColor;
  box-shadow: 0 0 0 1px currentColor;
}

.alliance-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.pending-label { color: var(--text-muted); }

.alliance-count {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1;
  margin-bottom: 2px;
}

.alliance-desc {
  font-size: 9px;
  color: var(--text-muted);
  line-height: 1.2;
}

/* Seats bar */
.seats-bar-wrap {
  position: relative;
  margin-bottom: 20px;
}

.seats-bar {
  display: flex;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  background: var(--border);
  gap: 1px;
}

.bar-segment {
  height: 100%;
  border-radius: 1px;
  transition: width 0.6s ease;
  min-width: 0;
}

.bar-pending { background: var(--border); }

.majority-line {
  position: absolute;
  top: -4px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.majority-tick {
  width: 1.5px;
  height: 18px;
  background: var(--text-main);
  border-radius: 1px;
}

.majority-label {
  font-size: 9px;
  font-weight: 600;
  color: var(--text-muted);
  margin-top: 1px;
  white-space: nowrap;
}

/* Status line */
.status-line {
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.separator { opacity: 0.4; }

.declared-count { color: var(--text-main); font-weight: 500; }
</style>
