<template>
  <Teleport to="body">
    <Transition name="sheet-backdrop">
      <div
        v-if="modelValue"
        class="sheet-backdrop"
        @click="$emit('update:modelValue', false)"
      />
    </Transition>

    <div
      class="bottom-sheet"
      :class="{ open: modelValue, peek: !modelValue && peekMode }"
      ref="sheetRef"
    >
      <!-- Drag handle -->
      <div
        class="sheet-handle-wrap"
        @click="toggleSheet"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div class="sheet-handle" />
      </div>

      <!-- Content -->
      <div class="sheet-content" ref="contentRef">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  peekMode: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue'])

const sheetRef = ref(null)
const contentRef = ref(null)

let startY = 0
let startTranslate = 0
let isDragging = false

function toggleSheet() {
  emit('update:modelValue', !props.modelValue)
}

// Drag-to-dismiss
function onTouchStart(e) {
  if (contentRef.value?.scrollTop > 0) return
  isDragging = true
  startY = e.touches[0].clientY
}

function onTouchMove(e) {
  if (!isDragging) return
  const delta = e.touches[0].clientY - startY
  if (delta < 0) return // don't drag up
  if (sheetRef.value) {
    sheetRef.value.style.transform = `translateY(${delta}px)`
  }
}

function onTouchEnd(e) {
  if (!isDragging) return
  isDragging = false
  const delta = e.changedTouches[0].clientY - startY
  if (sheetRef.value) {
    sheetRef.value.style.transform = ''
  }
  if (delta > 80) {
    emit('update:modelValue', false)
  }
}
</script>

<style scoped>
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 40;
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
}

.sheet-backdrop-enter-active,
.sheet-backdrop-leave-active { transition: opacity 0.25s; }
.sheet-backdrop-enter-from,
.sheet-backdrop-leave-to { opacity: 0; }

.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--bg-main);
  border-radius: 18px 18px 0 0;
  transform: translateY(calc(100% - 56px));
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  max-height: calc(100vh - var(--header-h) - 8px);
  max-height: calc(100dvh - var(--header-h) - 8px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 32px rgba(0,0,0,0.15);
}

.bottom-sheet.open {
  transform: translateY(0);
}

.bottom-sheet.peek {
  transform: translateY(calc(100% - 56px));
}

.sheet-handle-wrap {
  padding: 10px 0 6px;
  display: flex;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.sheet-handle {
  width: 36px;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
}

.sheet-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 16px 32px;
}
</style>
