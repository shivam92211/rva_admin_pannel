import React, { Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import DashboardView from '../views/DashboardView'
import { Login } from '../views/Login'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'

// Lazy load components
const SubAccountsView = React.lazy(() => import('../views/SubAccountsView'))
const TransfersView = React.lazy(() => import('../views/TransfersView'))
const DepositsView = React.lazy(() => import('../views/DepositsView'))
const WithdrawalsView = React.lazy(() => import('../views/WithdrawalsView'))
const RebatesView = React.lazy(() => import('../views/RebatesView'))
const UsersView = React.lazy(() => import('../views/UsersView'))
const KycSubmissionsView = React.lazy(() => import('../views/KycSubmissionsView'))

// Protected layout wrapper component
const ProtectedLayoutWrapper: React.FC = () => {
  return (
    <ProtectedRoute>
      <DefaultLayout>
        <Suspense fallback={<div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>}>
          <Outlet />
        </Suspense>
      </DefaultLayout>
    </ProtectedRoute>
  )
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <ProtectedLayoutWrapper />,
    children: [
      {
        path: '/',
        element: <DashboardView />
      },
      {
        path: '/dashboard',
        element: <DashboardView />
      },
      {
        path: '/subaccounts',
        element: <SubAccountsView />
      },
      {
        path: '/transfers',
        element: <TransfersView />
      },
      {
        path: '/deposits',
        element: <DepositsView />
      },
      {
        path: '/withdrawals',
        element: <WithdrawalsView />
      },
      {
        path: '/rebates',
        element: <RebatesView />
      },
      {
        path: '/users',
        element: <UsersView />
      },
      {
        path: '/kyc-submissions',
        element: <KycSubmissionsView />
      }
    ]
  }
])

// Router provider component
const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />
}

export default AppRouter