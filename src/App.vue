<template>
  <div class="app-container">
    <header class="app-header">
      <h1>二维码图片生成工具</h1>
      <p class="subtitle">选择端口,自动生成带二维码的图片</p>
    </header>

    <main class="app-main">
      <div v-if="state.error" class="error-banner">
        ❌ {{ state.error }}
      </div>

      <div class="control-panel">
        <PortSelector
          :ports="state.portConfigs"
          :selected-port="state.selectedPortId"
          @select="handlePortSelect"
        />

        <TextInput @update="handleTextUpdate" />

        <GenerateButton
          :disabled="!state.selectedPortId"
          :loading="state.loading"
          @generate="handleGenerate"
        />
      </div>

      <ImagePreview
        :images="state.composedImages"
        :loading="state.loading"
      />

      <DownloadButton
        v-if="state.composedImages.length > 0"
        :disabled="state.composedImages.filter(img => img.success).length === 0"
        :images="state.composedImages"
        @download="handleDownload"
      />

      <CoordinateEditor />
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'
import type { AppState } from './types'
import PortSelector from './components/PortSelector.vue'
import TextInput from './components/TextInput.vue'
import GenerateButton from './components/GenerateButton.vue'
import ImagePreview from './components/ImagePreview.vue'
import DownloadButton from './components/DownloadButton.vue'
import CoordinateEditor from './components/CoordinateEditor.vue'
import { portConfigService } from './services/portConfigService'
import { qrcodeGeneratorService } from './services/qrcodeGenerator'
import { imageComposerService } from './services/imageComposer'
import { downloadService } from './services/downloadService'

// 应用状态
const state = reactive<AppState>({
  portConfigs: [],
  selectedPortId: undefined,
  qrcodeUrl: undefined,
  composedImages: [],
  loading: false,
  error: undefined
})

// 自定义二维码文本
const customQrcodeText = ref('')

// 初始化应用
onMounted(async () => {
  try {
    const data = await portConfigService.loadPortConfig()
    state.portConfigs = data.ports
  } catch (error) {
    state.error = error instanceof Error ? error.message : '加载配置失败'
  }
})

// 选择端口
const handlePortSelect = (portId: string) => {
  state.selectedPortId = portId
  state.composedImages = []
  state.error = undefined
}

// 更新自定义文本
const handleTextUpdate = (text: string) => {
  customQrcodeText.value = text
}

// 生成图片
const handleGenerate = async () => {
  if (!state.selectedPortId) {
    state.error = '请先选择端口'
    return
  }

  state.loading = true
  state.error = undefined
  state.composedImages = []

  try {
    // 获取端口配置
    const portConfig = portConfigService.getPortConfig(state.selectedPortId)
    if (!portConfig) {
      throw new Error('端口配置不存在')
    }

    // 生成二维码 - 使用自定义文本或端口配置的文本
    const qrcodeText = customQrcodeText.value || portConfig.qrcodeText
    state.qrcodeUrl = await qrcodeGeneratorService.generate(qrcodeText, {
      width: 300,
      height: 300,
      errorCorrectionLevel: 'M'
    })

    // 合成图片
    const composedImages = await imageComposerService.composePortImages(
      portConfig,
      state.qrcodeUrl
    )

    state.composedImages = composedImages

    // 检查是否有失败的图片
    const failedCount = composedImages.filter(img => !img.success).length
    if (failedCount > 0) {
      state.error = `${failedCount} 张图片生成失败,请查看详情`
    }
  } catch (error) {
    state.error = error instanceof Error ? error.message : '生成失败'
  } finally {
    state.loading = false
  }
}

// 下载图片
const handleDownload = async () => {
  try {
    await downloadService.downloadBatch(state.composedImages)
  } catch (error) {
    state.error = error instanceof Error ? error.message : '下载失败'
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
}

.app-container {
  min-height: 100vh;
  padding: 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px 20px;
  background: linear-gradient(135deg, #42b983 0%, #35a372 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.2);
}

.app-header h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
}

.app-main {
  max-width: 1600px;
  margin: 0 auto;
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-banner {
  padding: 15px 20px;
  background-color: #fff5f5;
  border: 2px solid #ff6b6b;
  border-radius: 8px;
  color: #ff6b6b;
  margin-bottom: 20px;
  font-weight: 500;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 24px;
  }

  .app-main {
    padding: 20px;
  }
}
</style>
