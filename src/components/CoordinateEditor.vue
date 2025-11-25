<template>
    <div class="coordinate-editor">
        <h3>坐标编辑器</h3>
        <p class="description">
            💡 操作提示: 拖动方框移动 | 滚轮缩放 | 拖动蓝色圆点旋转 | 拖动右下角调整大小
        </p>

        <div class="editor-container">
            <div class="image-wrapper" ref="imageWrapper">
                <img v-if="imageSrc" :src="imageSrc" alt="预览图片" @load="handleImageLoad" ref="imageElement" />

                <div 
                    v-if="imageLoaded" 
                    class="qrcode-box" 
                    :style="qrcodeBoxStyle" 
                    @mousedown="startDrag"
                    @wheel.prevent="handleWheel"
                >
                    <div class="resize-handle" @mousedown.stop="startResize"></div>
                    <div class="rotate-handle" @mousedown.stop="startRotate"></div>
                    <div class="coordinates-display">
                        <div>显示: X:{{ Math.round(coordinate.x) }} Y:{{ Math.round(coordinate.y) }}</div>
                        <div>实际: X:{{ Math.round(coordinate.x * imageScale) }} Y:{{ Math.round(coordinate.y * imageScale) }}</div>
                        <div>W: {{ Math.round(coordinate.width) }} ({{ Math.round(coordinate.width * imageScale) }})</div>
                        <div>H: {{ Math.round(coordinate.height) }} ({{ Math.round(coordinate.height * imageScale) }})</div>
                        <div>R: {{ Math.round(coordinate.rotation || 0) }}° | 缩放: {{ imageScale.toFixed(2) }}x</div>
                    </div>
                </div>
            </div>

            <div class="controls">
                <div class="control-group">
                    <label>选择图片:</label>
                    <select v-model="selectedImage" @change="handleImageChange">
                        <option value="">-- 选择图片 --</option>
                        <option v-for="img in availableImages" :key="img" :value="img">
                            {{ img }}
                        </option>
                    </select>
                </div>

                <div class="coordinate-inputs">
                    <div class="input-group">
                        <label>X:</label>
                        <input type="number" v-model.number="coordinate.x" @input="updateBox" />
                    </div>
                    <div class="input-group">
                        <label>Y:</label>
                        <input type="number" v-model.number="coordinate.y" @input="updateBox" />
                    </div>
                    <div class="input-group">
                        <label>宽度:</label>
                        <input type="number" v-model.number="coordinate.width" @input="updateBox" />
                    </div>
                    <div class="input-group">
                        <label>高度:</label>
                        <input type="number" v-model.number="coordinate.height" @input="updateBox" />
                    </div>
                    <div class="input-group full-width">
                        <label>旋转角度 (度):</label>
                        <input type="range" min="0" max="360" v-model.number="coordinate.rotation" @input="updateBox" />
                        <input type="number" min="0" max="360" v-model.number="coordinate.rotation" @input="updateBox" class="rotation-input" />
                    </div>
                </div>

                <button class="apply-button" @click="applyCoordinate" :disabled="!selectedImage">
                    应用坐标
                </button>

                <div v-if="appliedCoordinate" class="result">
                    <h4>生成的配置:</h4>
                    <pre>{{ JSON.stringify(appliedCoordinate, null, 2) }}</pre>
                    <button class="copy-button" @click="copyToClipboard">复制配置</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { Coordinate } from '../types'
import { portConfigService } from '../services/portConfigService'

const imageWrapper = ref<HTMLDivElement>()
const imageElement = ref<HTMLImageElement>()
const selectedImage = ref('')
const imageSrc = ref('')
const imageLoaded = ref(false)
const isDragging = ref(false)
const isResizing = ref(false)
const isRotating = ref(false)
const dragStart = reactive({ x: 0, y: 0, rotation: 0 })
const appliedCoordinate = ref<any>(null)
const imageScale = ref(1) // 图片缩放比例

const coordinate = reactive<Coordinate & { width: number; height: number; rotation?: number }>({
    x: 100,
    y: 100,
    width: 150,
    height: 150,
    rotation: 0
})

// 可用的图片列表 - 从配置文件动态加载
const availableImages = ref<string[]>([])

// 加载图片列表
onMounted(async () => {
    try {
        const data = await portConfigService.loadPortConfig()
        const imageSet = new Set<string>()
        
        // 从所有端口配置中提取图片文件名
        data.ports.forEach(port => {
            port.images.forEach(img => {
                imageSet.add(img.filename)
            })
        })
        
        availableImages.value = Array.from(imageSet).sort()
    } catch (error) {
        console.error('加载图片列表失败:', error)
        // 如果加载失败,使用默认列表
        availableImages.value = [
            '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg',
            '9.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg'
        ]
    }
})

const qrcodeBoxStyle = computed(() => ({
    left: `${coordinate.x}px`,
    top: `${coordinate.y}px`,
    width: `${coordinate.width}px`,
    height: `${coordinate.height}px`,
    transform: `rotate(${coordinate.rotation || 0}deg)`
}))

const handleImageChange = () => {
    if (selectedImage.value) {
        imageSrc.value = `/img/${selectedImage.value}`
        imageLoaded.value = false
        appliedCoordinate.value = null
    }
}

const handleImageLoad = () => {
    imageLoaded.value = true
    
    // 计算图片缩放比例
    if (imageElement.value) {
        const naturalWidth = imageElement.value.naturalWidth
        const displayWidth = imageElement.value.width
        imageScale.value = naturalWidth / displayWidth
    }
}

const startDrag = (e: MouseEvent) => {
    if (!imageWrapper.value) return

    isDragging.value = true
    const rect = imageWrapper.value.getBoundingClientRect()

    // 记录鼠标相对于方框左上角的偏移
    dragStart.x = e.clientX - rect.left - coordinate.x
    dragStart.y = e.clientY - rect.top - coordinate.y

    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e: MouseEvent) => {
    if (!isDragging.value || !imageWrapper.value || !imageElement.value) return

    const rect = imageWrapper.value.getBoundingClientRect()
    const imgRect = imageElement.value.getBoundingClientRect()

    // 计算相对于图片容器的新位置
    let newX = e.clientX - rect.left - dragStart.x
    let newY = e.clientY - rect.top - dragStart.y

    // 限制在图片实际尺寸范围内
    const maxX = imgRect.width - coordinate.width
    const maxY = imgRect.height - coordinate.height

    newX = Math.max(0, Math.min(newX, maxX))
    newY = Math.max(0, Math.min(newY, maxY))

    coordinate.x = newX
    coordinate.y = newY
}

const stopDrag = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
}

const startResize = (e: MouseEvent) => {
    isResizing.value = true
    dragStart.x = e.clientX
    dragStart.y = e.clientY

    document.addEventListener('mousemove', onResize)
    document.addEventListener('mouseup', stopResize)
}

const onResize = (e: MouseEvent) => {
    if (!isResizing.value || !imageWrapper.value) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    const rect = imageWrapper.value.getBoundingClientRect()
    let newWidth = coordinate.width + deltaX
    let newHeight = coordinate.height + deltaY

    // 限制最小尺寸和最大尺寸
    newWidth = Math.max(50, Math.min(newWidth, rect.width - coordinate.x))
    newHeight = Math.max(50, Math.min(newHeight, rect.height - coordinate.y))

    coordinate.width = newWidth
    coordinate.height = newHeight

    dragStart.x = e.clientX
    dragStart.y = e.clientY
}

const stopResize = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', onResize)
    document.removeEventListener('mouseup', stopResize)
}

// 旋转控制
const startRotate = (e: MouseEvent) => {
    if (!imageWrapper.value) return
    
    isRotating.value = true
    const rect = imageWrapper.value.getBoundingClientRect()
    
    // 计算中心点
    const centerX = coordinate.x + coordinate.width / 2
    const centerY = coordinate.y + coordinate.height / 2
    
    // 计算初始角度
    const startAngle = Math.atan2(
        e.clientY - rect.top - centerY,
        e.clientX - rect.left - centerX
    )
    
    dragStart.rotation = (coordinate.rotation || 0) - (startAngle * 180) / Math.PI
    
    document.addEventListener('mousemove', onRotate)
    document.addEventListener('mouseup', stopRotate)
}

const onRotate = (e: MouseEvent) => {
    if (!isRotating.value || !imageWrapper.value) return
    
    const rect = imageWrapper.value.getBoundingClientRect()
    
    // 计算中心点
    const centerX = coordinate.x + coordinate.width / 2
    const centerY = coordinate.y + coordinate.height / 2
    
    // 计算当前角度
    const currentAngle = Math.atan2(
        e.clientY - rect.top - centerY,
        e.clientX - rect.left - centerX
    )
    
    let newRotation = dragStart.rotation + (currentAngle * 180) / Math.PI
    
    // 标准化角度到 0-360
    newRotation = ((newRotation % 360) + 360) % 360
    
    coordinate.rotation = newRotation
}

const stopRotate = () => {
    isRotating.value = false
    document.removeEventListener('mousemove', onRotate)
    document.removeEventListener('mouseup', stopRotate)
}

// 滚轮缩放
const handleWheel = (e: WheelEvent) => {
    if (!imageWrapper.value || !imageElement.value) return
    
    const delta = e.deltaY > 0 ? -10 : 10
    const imgRect = imageElement.value.getBoundingClientRect()
    
    let newWidth = coordinate.width + delta
    let newHeight = coordinate.height + delta
    
    // 限制最小和最大尺寸
    newWidth = Math.max(30, Math.min(newWidth, imgRect.width - coordinate.x))
    newHeight = Math.max(30, Math.min(newHeight, imgRect.height - coordinate.y))
    
    coordinate.width = newWidth
    coordinate.height = newHeight
}

const updateBox = () => {
    // 输入框更新时触发
}

const applyCoordinate = () => {
    // 将显示坐标转换为实际图片坐标
    const scale = imageScale.value
    
    appliedCoordinate.value = {
        filename: selectedImage.value,
        watermarkCoordinate: {
            x: Math.round(coordinate.x * scale),
            y: Math.round(coordinate.y * scale),
            width: Math.round(coordinate.width * scale),
            height: Math.round(coordinate.height * scale),
            rotation: Math.round(coordinate.rotation || 0)
        }
    }
}

const copyToClipboard = () => {
    const text = JSON.stringify(appliedCoordinate.value, null, 2)
    navigator.clipboard.writeText(text).then(() => {
        alert('配置已复制到剪贴板!')
    })
}
</script>

<style scoped>
.coordinate-editor {
    margin-top: 30px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
}

h3 {
    margin-bottom: 10px;
    color: #333;
}

.description {
    color: #666;
    margin-bottom: 20px;
    font-size: 14px;
}

.editor-container {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 20px;
}

@media (min-width: 1400px) {
    .editor-container {
        grid-template-columns: 1fr 400px;
    }
}

.image-wrapper {
    position: relative;
    background-color: #fff;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    min-height: 400px;
    display: inline-block;
}

.image-wrapper img {
    display: block;
    max-width: 100%;
    height: auto;
}

.qrcode-box {
    position: absolute;
    border: 3px solid #42b983;
    background-color: rgba(66, 185, 131, 0.2);
    cursor: move;
    box-shadow: 0 0 10px rgba(66, 185, 131, 0.5);
}

.qrcode-box:hover {
    background-color: rgba(66, 185, 131, 0.3);
}

.resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    background-color: #42b983;
    cursor: nwse-resize;
    border-radius: 0 0 4px 0;
}

.rotate-handle {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 20px;
    background-color: #3b82f6;
    border-radius: 50%;
    cursor: grab;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.rotate-handle:active {
    cursor: grabbing;
}

.coordinates-display {
    position: absolute;
    top: 5px;
    left: 5px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 8px;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.4;
    pointer-events: none;
}

.controls {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.control-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.control-group label {
    font-weight: 600;
    color: #333;
}

.control-group select {
    padding: 10px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 14px;
}

.coordinate-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.full-width {
    grid-column: 1 / -1;
}

.full-width input[type="range"] {
    width: 100%;
    margin-bottom: 5px;
}

.rotation-input {
    width: 100px;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.input-group label {
    font-size: 12px;
    font-weight: 600;
    color: #666;
}

.input-group input {
    padding: 8px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 14px;
}

.apply-button {
    padding: 12px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
}

.apply-button:hover:not(:disabled) {
    background-color: #35a372;
}

.apply-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.result {
    background-color: #fff;
    padding: 15px;
    border-radius: 6px;
    border: 2px solid #42b983;
}

.result h4 {
    margin-bottom: 10px;
    color: #333;
}

.result pre {
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
    margin-bottom: 10px;
}

.copy-button {
    padding: 8px 16px;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}

.copy-button:hover {
    background-color: #2563eb;
}

@media (max-width: 1024px) {
    .editor-container {
        grid-template-columns: 1fr;
    }
}
</style>
