import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'positions',
      component: () => import('@/views/PositionList.vue'),
      meta: { title: '岗位信息' },
    },
    {
      path: '/position/:id',
      name: 'position-detail',
      component: () => import('@/views/PositionDetail.vue'),
      meta: { title: '岗位详情' },
    },
    {
      path: '/timeline',
      name: 'timeline',
      component: () => import('@/views/TimelineView.vue'),
      meta: { title: '考试时间线' },
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/FavoritesView.vue'),
      meta: { title: '我的收藏' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: { title: '关于本站' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, _from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 80 }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = (to.meta.title as string) || '岗位信息'
  document.title = `${title} · 陕西省公务员考试信息平台`
})

export default router
