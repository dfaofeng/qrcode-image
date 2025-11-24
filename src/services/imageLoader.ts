class ImageLoaderService {
  private readonly SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'webp']

  async loadImage(path: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      // 如果是 data URL (base64),直接加载
      const isDataUrl = path.startsWith('data:')
      
      // 验证图片格式 (data URL 不需要验证)
      if (!isDataUrl && !this.isValidImageFormat(path)) {
        reject(new Error(`不支持的图片格式: ${path}`))
        return
      }

      const img = new Image()
      
      img.onload = () => {
        resolve(img)
      }
      
      img.onerror = () => {
        reject(new Error(`图片加载失败: ${path}`))
      }
      
      // 先设置 src,不设置 crossOrigin 避免本地文件跨域问题
      img.src = path
    })
  }

  async loadImages(paths: string[]): Promise<HTMLImageElement[]> {
    const promises = paths.map(path => this.loadImage(path))
    
    try {
      return await Promise.all(promises)
    } catch (error) {
      throw new Error(`批量加载图片失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  private isValidImageFormat(path: string): boolean {
    const extension = path.split('.').pop()?.toLowerCase()
    return extension ? this.SUPPORTED_FORMATS.includes(extension) : false
  }
}

export const imageLoaderService = new ImageLoaderService()
