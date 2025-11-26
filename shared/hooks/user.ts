export function useUser() {
  const isLogin = computed(() => false)

  return {
    isLogin,
  }
}
