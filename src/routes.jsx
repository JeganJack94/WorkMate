import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LearnMore from './pages/LearnMore';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Stocks from './pages/Stocks';
import Checklist from './pages/Checklist';
import Reports from './pages/Reports';
import ProofReports from './pages/ProofReports';
import StockReports from './pages/StockReports';
import ReportsLayout from './pages/ReportsLayout';
import Settings from './pages/Settings';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Public Route wrapper component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (user) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: 'learn-more',
    element: <LearnMore />,
  },
  {
    path: 'login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    )
  },
  {
    path: 'signup',
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    )
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'projects',
        element: <Projects />
      },
      {
        path: 'stocks',
        element: <Stocks />
      },
      {
        path: 'checklist',
        element: <Checklist />
      },
      {
        path: 'reports',
        element: <ReportsLayout />,
        children: [
          {
            index: true,
            element: <Reports />
          },
          {
            path: 'proof',
            element: <ProofReports />
          },
          {
            path: 'stock',
            element: <StockReports />
          }
        ]
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  }
]);

export default router;