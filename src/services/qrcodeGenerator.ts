import QRCode from 'qrcode'
import type { QRCodeOptions } from '../types'

class QRCodeGeneratorService {
  async generate(text: string, options?: QRCodeOptions): Promise<string> {
    if (!text || text.trim() === '') {
      throw new Error('二维码内容不能为空')
    }

    try {
      const qrcodeOptions = {
        width: options?.width || 300,
        height: options?.height || 300,
        errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
        margin: options?.margin || 1,
        color: {
          dark: '#000000',  // 二维码前景色(黑色)
          light: '#00000000' // 二维码背景色(透明)
        }
      }

      const dataUrl = await QRCode.toDataURL(text, qrcodeOptions)
      return dataUrl
    } catch (error) {
      throw new Error(`生成二维码失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
}

export const qrcodeGeneratorService = new QRCodeGeneratorService()
