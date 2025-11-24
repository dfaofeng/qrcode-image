export interface Coordinate {
  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
}

export interface ImageConfig {
  filename: string
  watermarkCoordinate: Coordinate
}

export interface PortConfig {
  id: string
  name: string
  qrcodeText: string
  images: ImageConfig[]
}

export interface PortConfigData {
  ports: PortConfig[]
}
