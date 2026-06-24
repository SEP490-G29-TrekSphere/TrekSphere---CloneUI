import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '@/shared/layout/MainLayout';

// Lazy loading features
const Dashboard = React.lazy(() => import('@/features/dashboard/Dashboard'));
const Login = React.lazy(() => import('@/features/auth/Login'));

// Basic loading fallback
function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Private/Layout Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          {/* Add more routes here, e.g. <Route path="/trips" element={<Trips />} /> */}
        </Route>
      </Routes>
    </Suspense>
  );
}
