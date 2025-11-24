<template>
  <div class="text-input-container">
    <label for="qrcode-text">自定义二维码内容 (可选)</label>
    <div class="input-wrapper">
      <input
        id="qrcode-text"
        v-model="inputText"
        type="text"
        placeholder="留空则使用端口配置的默认文本"
        @input="handleInput"
      />
      <button v-if="inputText" class="clear-button" @click="clearInput">
        ✕
      </button>
    </div>
    <p class="hint">提示: 输入自定义文本后,生成的二维码将使用此文本内容</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Emits {
  (e: 'update', text: string): void
}

const emit = defineEmits<Emits>()
const inputText = ref('')

const handleInput = () => {
  emit('update', inputText.value)
}

const clearInput = () => {
  inputText.value = ''
  emit('update', '')
}
</script>

<style scoped>
.text-input-container {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

input {
  flex: 1;
  padding: 12px 40px 12px 15px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s;
  outline: none;
}

input:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

input::placeholder {
  color: #999;
}

.clear-button {
  position: absolute;
  right: 10px;
  width: 24px;
  height: 24px;
  border: none;
  background-color: #ccc;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s;
}

.clear-button:hover {
  background-color: #999;
}

.hint {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}
</style>
