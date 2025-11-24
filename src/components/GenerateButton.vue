<template>
  <button
    class="generate-button"
    :disabled="disabled || loading"
    @click="handleGenerate"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <span>{{ loading ? '生成中...' : '生成图片' }}</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean
  loading?: boolean
}

interface Emits {
  (e: 'generate'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleGenerate = () => {
  emit('generate')
}
</script>

<style scoped>
.generate-button {
  padding: 12px 30px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background-color: #42b983;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.generate-button:hover:not(:disabled) {
  background-color: #35a372;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.generate-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
