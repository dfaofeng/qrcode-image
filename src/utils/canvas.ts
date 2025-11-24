export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

export function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('无法获取 Canvas 2D 上下文')
  }
  return ctx
}

export function drawImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | HTMLCanvasElement,
  x: number,
  y: number,
  width?: number,
  height?: number
): void {
  if (width !== undefined && height !== undefined) {
    ctx.drawImage(image, x, y, width, height)
  } else {
    ctx.drawImage(image, x, y)
  }
}

export async function canvasToBlobUrl(canvas: HTMLCanvasElement, type = 'image/png', quality = 0.95): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          resolve(url)
        } else {
          reject(new Error('Canvas 转换为 Blob 失败'))
        }
      },
      type,
      quality
    )
  })
}

export function revokeBlobUrl(url: string): void {
  URL.revokeObjectURL(url)
}
