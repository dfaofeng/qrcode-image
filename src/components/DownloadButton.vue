<template>
  <button
    class="download-button"
    :disabled="disabled"
    @click="handleDownload"
  >
    <span class="icon">📥</span>
    <span>下载所有图片 (ZIP)</span>
  </button>
</template>

<script setup lang="ts">
import type { ComposedImage } from '../types'

interface Props {
  disabled?: boolean
  images: ComposedImage[]
}

interface Emits {
  (e: 'download'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleDownload = () => {
  emit('download')
}
</script>

<style scoped>
.download-button {
  padding: 12px 30px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background-color: #3b82f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.download-button:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.download-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

.icon {
  font-size: 20px;
}
</style>
