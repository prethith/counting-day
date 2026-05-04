<template>
  <div class="state-selector">
    <button
      v-for="(cfg, key) in registry"
      :key="key"
      class="state-tab"
      :class="{ active: modelValue === key }"
      @click="$emit('update:modelValue', key)"
    >
      <span class="tab-short">{{ cfg.shortLabel }}</span>
      <span class="tab-long">{{ cfg.label }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  registry: Object,
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.state-selector {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 1px;
  flex-shrink: 0;
}

.state-selector::-webkit-scrollbar { display: none; }

.state-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  flex-shrink: 0;
}

.state-tab:hover {
  background: var(--bg-card);
  color: var(--text-main);
}

.state-tab.active {
  background: var(--text-main);
  color: var(--bg-main);
  border-color: var(--text-main);
}

.tab-short { display: none; }
.tab-long { display: inline; }

@media (max-width: 480px) {
  .tab-short { display: inline; }
  .tab-long { display: none; }

  .state-tab { padding: 6px 10px; }
}
</style>
