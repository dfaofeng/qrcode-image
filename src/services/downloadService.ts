import JSZip from 'jszip'
import type { ComposedImage } from '../types'

class DownloadService {
  downloadImage(imageUrl: string, filename: string): void {
    try {
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      throw new Error(`下载图片失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async downloadBatch(images: ComposedImage[]): Promise<void> {
    try {
      // 过滤出成功的图片
      const successImages = images.filter(img => img.success && img.imageUrl)

      if (successImages.length === 0) {
        throw new Error('没有可下载的图片')
      }

      // 创建 ZIP 文件
      const zip = new JSZip()

      // 将所有图片添加到 ZIP
      for (const image of successImages) {
        const response = await fetch(image.imageUrl)
        const blob = await response.blob()
        zip.file(image.filename, blob)
      }

      // 生成 ZIP 文件
      const zipBlob = await zip.generateAsync({ type: 'blob' })

      // 下载 ZIP 文件
      const zipUrl = URL.createObjectURL(zipBlob)
      const timestamp = new Date().getTime()
      this.downloadImage(zipUrl, `qrcode_images_${timestamp}.zip`)

      // 清理 URL
      setTimeout(() => URL.revokeObjectURL(zipUrl), 100)
    } catch (error) {
      throw new Error(`批量下载失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
}

export const downloadService = new DownloadService()
