import type { Coordinate, PortConfig, ComposedImage } from '../types'
import { createCanvas, getCanvasContext, drawImage, canvasToBlobUrl } from '../utils/canvas'
import { imageLoaderService } from './imageLoader'

class ImageComposerService {
  async compose(
    baseImage: HTMLImageElement,
    qrcodeImage: HTMLImageElement,
    coordinate: Coordinate
  ): Promise<string> {
    try {
      // 创建与原图相同尺寸的 Canvas
      const canvas = createCanvas(baseImage.width, baseImage.height)
      const ctx = getCanvasContext(canvas)

      // 绘制原图
      drawImage(ctx, baseImage, 0, 0)

      // 检查坐标是否超出边界
      const qrWidth = coordinate.width || qrcodeImage.width
      const qrHeight = coordinate.height || qrcodeImage.height
      const rotation = coordinate.rotation || 0

      if (coordinate.x + qrWidth > baseImage.width || coordinate.y + qrHeight > baseImage.height) {
        console.warn('二维码坐标超出图片边界，将自动调整')
      }

      // 如果有旋转角度,需要使用变换
      if (rotation !== 0) {
        ctx.save()
        // 移动到二维码中心点
        ctx.translate(coordinate.x + qrWidth / 2, coordinate.y + qrHeight / 2)
        // 旋转
        ctx.rotate((rotation * Math.PI) / 180)
        // 绘制二维码(从中心点绘制)
        drawImage(ctx, qrcodeImage, -qrWidth / 2, -qrHeight / 2, qrWidth, qrHeight)
        ctx.restore()
      } else {
        // 无旋转,直接绘制
        drawImage(ctx, qrcodeImage, coordinate.x, coordinate.y, qrWidth, qrHeight)
      }

      // 转换为 Blob URL
      return await canvasToBlobUrl(canvas, 'image/png', 0.95)
    } catch (error) {
      throw new Error(`图片合成失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async composePortImages(
    portConfig: PortConfig,
    qrcodeUrl: string
  ): Promise<ComposedImage[]> {
    const results: ComposedImage[] = []

    // 加载二维码图片
    const qrcodeImage = await imageLoaderService.loadImage(qrcodeUrl)

    for (const imageConfig of portConfig.images) {
      try {
        // 加载原图
        const imagePath = `/img/${imageConfig.filename}`
        const baseImage = await imageLoaderService.loadImage(imagePath)

        // 合成图片
        const composedUrl = await this.compose(
          baseImage,
          qrcodeImage,
          imageConfig.watermarkCoordinate
        )

        // 生成下载文件名
        const filename = this.generateFilename(imageConfig.filename)

        results.push({
          imageUrl: composedUrl,
          filename,
          originalFilename: imageConfig.filename,
          success: true
        })
      } catch (error) {
        results.push({
          imageUrl: '',
          filename: imageConfig.filename,
          originalFilename: imageConfig.filename,
          success: false,
          error: error instanceof Error ? error.message : '未知错误'
        })
      }
    }

    return results
  }

  private generateFilename(originalFilename: string): string {
    const parts = originalFilename.split('.')
    const extension = parts.pop()
    const name = parts.join('.')
    return `${name}_qrcode.${extension}`
  }
}

export const imageComposerService = new ImageComposerService()
