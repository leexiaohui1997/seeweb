export type File = {
  id: number
  key: string
  name: string | null
  type: string
  size: number
  ext: string | null
  private: boolean
  userId: number | null
  createdAt: string
  updatedAt: string
}
