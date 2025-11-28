export type AppCode = {
  id: number
  content: string
  updatedAt: string
}

export type App = {
  id: number
  name: string
  title: string
  userId: number
  createdAt: string
  updatedAt: string
  templateCode?: AppCode
  styleCode?: AppCode
  scriptCode?: AppCode
}
