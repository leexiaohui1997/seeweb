export function getErrorMessage(error: any): string {
  return error?.data?.message ?? error?.message ?? error ?? '未知错误'
}
