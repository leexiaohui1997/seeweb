export type CodeType = 'template' | 'script' | 'style'

export type Code = {
  id: number
  userId: number
  type: CodeType
  content: string
  appId: number | null
  createdAt: string
  updatedAt: string
}
