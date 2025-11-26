// 简单的 Toast 消息工具
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message
  
  // 添加样式
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: '10000',
    animation: 'slideIn 0.3s ease-out',
    maxWidth: '400px',
    wordBreak: 'break-word'
  })
  
  // 根据类型设置背景色
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6'
  }
  toast.style.backgroundColor = colors[type]
  
  // 添加动画样式
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style')
    style.id = 'toast-styles'
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }
  
  document.body.appendChild(toast)
  
  // 3秒后自动消失
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}
