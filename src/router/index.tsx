import React, { Suspense } from 'react';
import { createBrowserRouter, createHashRouter, RouterProvider, Outlet } from 'react-router-dom';
import DefaultLayout from '../layouts/DefaultLayout';
import DashboardView from '../views/DashboardView';
import { Login } from '../views/Login';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import AdminCommunicationView from '@/views/AdminBasicSettingsView';

// Lazy load components
const SubAccountsView = React.lazy(() => import('../views/SubAccountsView'));
const TransfersView = React.lazy(() => import('../views/TransfersView'));
const DepositsView = React.lazy(() => import('../views/DepositsView'));
const WithdrawalsView = React.lazy(() => import('../views/WithdrawalsView'));
const RebatesView = React.lazy(() => import('../views/RebatesView'));
const UsersView = React.lazy(() => import('../views/UsersView'));
const KycSubmissionsView = React.lazy(() => import('../views/KycSubmissionsView'));
const TradingPairsView = React.lazy(() => import('../views/TradingPairsView'));
const AdminManagementView = React.lazy(() => import('../views/AdminManagementView'));
const AdminAdvancedSettingsView = React.lazy(() => import('../views/AdminAdvancedSettingsView'));

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
  );
};

export const router = createHashRouter([
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
      },
      {
        path: '/trading-pairs',
        element: <TradingPairsView />
      },
      {
        path: '/admin-management',
        element: <AdminManagementView />
      },
      {
        path: '/communication',
        element: <AdminCommunicationView />
      },
      {
        path: '/advanced-settings',
        element: <AdminAdvancedSettingsView />
      }
    ]
  }
]);

// Router provider component
const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;