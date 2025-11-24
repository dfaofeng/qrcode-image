import type { PortConfig } from './port'

export interface ComposedImage {
  imageUrl: string
  filename: string
  originalFilename: string
  success: boolean
  error?: string
}

export interface AppState {
  portConfigs: PortConfig[]
  selectedPortId?: string
  qrcodeUrl?: string
  composedImages: ComposedImage[]
  loading: boolean
  error?: string
}
