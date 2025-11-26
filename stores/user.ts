export interface UserInfo {
  id: number
  username: string
  isAdmin: boolean
}

export async function useUser() {
  const user = useState<UserInfo | null>('user', () => null)
  const isLogin = computed(() => user.value !== null)
  const username = computed(() => user.value?.username || '')

  const loading = ref(false)
  const requestFetch = useRequestFetch()
  const fetchUser = async () => {
    if (loading.value) {
      return
    }

    try {
      loading.value = true
      const response = await requestFetch('/api/auth/me', {
        method: 'GET',
      })

      if (!response.success) {
        throw new Error(response.message)
      }

      user.value = response.data
    } catch (error: any) {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  await callOnce(fetchUser)

  return {
    user,
    isLogin,
    username,
    fetchUser,
  }
}
