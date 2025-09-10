import React, { Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import DashboardView from '../views/DashboardView'

// Lazy load components
const SubAccountsView = React.lazy(() => import('../views/SubAccountsView'))
const TransfersView = React.lazy(() => import('../views/TransfersView'))
const DepositsView = React.lazy(() => import('../views/DepositsView'))
const RebatesView = React.lazy(() => import('../views/RebatesView'))

// Layout wrapper component
const LayoutWrapper: React.FC = () => {
  return (
    <DefaultLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
    </DefaultLayout>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutWrapper />,
    children: [
      {
        path: '/',
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
        path: '/rebates',
        element: <RebatesView />
      }
    ]
  }
])

// Router provider component
const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />
}

export default AppRouter