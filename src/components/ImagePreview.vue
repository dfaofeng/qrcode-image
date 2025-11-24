<template>
  <div class="image-preview">
    <h3>预览结果</h3>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在生成图片...</p>
    </div>

    <div v-else-if="images.length === 0" class="empty-state">
      <p>请选择端口并点击生成按钮</p>
    </div>

    <div v-else class="preview-grid">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="preview-item"
        :class="{ error: !image.success }"
      >
        <div v-if="image.success" class="image-container">
          <img :src="image.imageUrl" :alt="image.filename" />
          <div class="image-info">
            <span class="filename">{{ image.filename }}</span>
          </div>
        </div>
        <div v-else class="error-container">
          <div class="error-icon">❌</div>
          <div class="error-message">
            <p class="filename">{{ image.originalFilename }}</p>
            <p class="error-text">{{ image.error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComposedImage } from '../types'

interface Props {
  images: ComposedImage[]
  loading?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.image-preview {
  margin-top: 30px;
}

h3 {
  margin-bottom: 20px;
  color: #333;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #42b983;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .preview-grid {
    grid-template-columns: 1fr;
  }
}

.preview-item {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.preview-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-item.error {
  border-color: #ff6b6b;
  background-color: #fff5f5;
}

.image-container {
  display: flex;
  flex-direction: column;
}

.image-container img {
  width: 100%;
  height: auto;
  display: block;
}

.image-info {
  padding: 10px;
  background-color: #f9f9f9;
}

.filename {
  font-size: 14px;
  color: #666;
  word-break: break-all;
}

.error-container {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 15px;
}

.error-icon {
  font-size: 32px;
}

.error-message {
  flex: 1;
}

.error-text {
  font-size: 12px;
  color: #ff6b6b;
  margin-top: 5px;
}
</style>
