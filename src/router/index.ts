import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/subaccounts',
      name: 'subaccounts',
      component: () => import('../views/SubAccountsView.vue'),
    },
    {
      path: '/transfers',
      name: 'transfers',
      component: () => import('../views/TransfersView.vue'),
    },
    {
      path: '/deposits',
      name: 'deposits',
      component: () => import('../views/DepositsView.vue'),
    },
    {
      path: '/rebates',
      name: 'rebates',
      component: () => import('../views/RebatesView.vue'),
    },
  ],
})

export default router
