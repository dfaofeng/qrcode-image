<template>
  <div class="port-selector">
    <h3>选择端口</h3>
    <div class="port-list">
      <div
        v-for="port in ports"
        :key="port.id"
        class="port-item"
        :class="{ active: selectedPort === port.id }"
        @click="selectPort(port.id)"
      >
        <div class="port-name">{{ port.name }}</div>
        <div class="port-info">{{ port.qrcodeText }}</div>
        <div class="port-images">{{ port.images.length }} 张图片</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PortConfig } from '../types'

interface Props {
  ports: PortConfig[]
  selectedPort?: string
}

interface Emits {
  (e: 'select', portId: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const selectPort = (portId: string) => {
  emit('select', portId)
}
</script>

<style scoped>
.port-selector {
  margin-bottom: 20px;
}

h3 {
  margin-bottom: 15px;
  color: #333;
}

.port-list {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.port-item {
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 150px;
}

.port-item:hover {
  border-color: #42b983;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.port-item.active {
  border-color: #42b983;
  background-color: #f0fdf4;
}

.port-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.port-info {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.port-images {
  font-size: 12px;
  color: #999;
}
</style>
