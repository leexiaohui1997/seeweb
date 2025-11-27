import { getErrorMessage } from '~/shared/utils/common'

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 复制是否成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }

    // 降级方案：使用传统的 execCommand 方法
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    textarea.setSelectionRange(0, text.length)

    const successful = document.execCommand('copy')
    document.body.removeChild(textarea)

    return successful
  } catch (error) {
    ElMessage.error(`复制到剪贴板失败: ${getErrorMessage(error)}`)
    return false
  }
}
