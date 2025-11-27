const authRoutes = [/^\/workspace(\/.*)*$/]

export default defineNuxtRouteMiddleware(async to => {
  // 只对需要鉴权的页面进行鉴权
  if (!authRoutes.some(route => route.test(to.path))) {
    return
  }

  // 获取用户信息
  const { isLogin } = await useUser()

  // 如果未登录，重定向到登录页面
  if (!isLogin.value) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath, // 保存原始路径，登录后可以重定向回来
      },
    })
  }
})
