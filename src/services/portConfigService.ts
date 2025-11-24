import type { PortConfig, PortConfigData } from '../types'

class PortConfigService {
  private portConfigs: PortConfig[] = []

  async loadPortConfig(): Promise<PortConfigData> {
    try {
      const response = await fetch('/config/ports.json')
      if (!response.ok) {
        throw new Error(`加载端口配置失败: ${response.statusText}`)
      }
      
      const data: PortConfigData = await response.json()
      
      // 验证配置数据
      this.validatePortConfig(data)
      
      this.portConfigs = data.ports
      return data
    } catch (error) {
      throw new Error(`加载端口配置失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  getPortConfig(portId: string): PortConfig | undefined {
    return this.portConfigs.find(port => port.id === portId)
  }

  private validatePortConfig(data: PortConfigData): void {
    if (!data || !Array.isArray(data.ports)) {
      throw new Error('配置文件格式错误: 缺少 ports 数组')
    }

    data.ports.forEach((port, index) => {
      if (!port.id || !port.name || !port.qrcodeText) {
        throw new Error(`端口配置 ${index} 缺少必要字段 (id, name, qrcodeText)`)
      }

      if (!Array.isArray(port.images) || port.images.length === 0) {
        throw new Error(`端口 ${port.id} 缺少图片配置`)
      }

      port.images.forEach((image, imgIndex) => {
        if (!image.filename) {
          throw new Error(`端口 ${port.id} 的图片 ${imgIndex} 缺少 filename`)
        }

        if (!image.watermarkCoordinate) {
          throw new Error(`端口 ${port.id} 的图片 ${image.filename} 缺少 watermarkCoordinate`)
        }

        const coord = image.watermarkCoordinate
        if (typeof coord.x !== 'number' || typeof coord.y !== 'number') {
          throw new Error(`端口 ${port.id} 的图片 ${image.filename} 坐标无效`)
        }
      })
    })
  }
}

export const portConfigService = new PortConfigService()
