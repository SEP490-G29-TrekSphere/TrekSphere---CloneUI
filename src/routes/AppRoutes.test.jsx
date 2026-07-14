import React from 'react';
import { PATHS } from '../constants';
import AppRoutes from './AppRoutes';

jest.mock('react-router-dom', () => {
  if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('node:util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
  }
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    Route: ({ path, element }) => (
      <div data-testid="route" data-path={path}>
        {element}
      </div>
    ),
    Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  };
});

jest.mock('./ProtectedRoute', () => {
  const ProtectedRouteMock = ({ children }) => <div data-testid="protected-route">{children}</div>;
  return {
    __esModule: true,
    default: ProtectedRouteMock,
  };
});

jest.mock('./RequireRole', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="require-role">{children}</div>,
}));

jest.mock('../shared/layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="main-layout">{children}</div>,
}));

jest.mock('../shared/layout/PublicLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="public-layout">{children}</div>,
}));

jest.mock('../shared/ui/ScrollManager', () => ({
  ScrollManager: () => null,
}));

// Mock feature barrel exports — these are static imports of AppRoutes.tsx
// but we only test the route configuration, not the page implementations.
jest.mock('@/features/admin', () => ({
  __esModule: true,
  AccountDetail: () => null,
  AccountList: () => null,
  AdminLayout: ({ children }) => children,
  AdminSidebar: () => null,
  AdminTopbar: () => null,
  AdminDashboard: () => null,
  ApplicationDetails: () => null,
  Applications: () => null,
}));

jest.mock('@/features/home/pages/Home', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/auth/pages/Login', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/auth/pages/Register', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/auth/pages/VerifyEmail', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/auth/pages/ForgotPassword', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/auth/pages/ResetPassword', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/auth/pages/ChangePassword', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/dashboard/pages/Dashboard', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/notifications/pages/Notifications', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/tours/pages/ListTours', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/tours/pages/TourDetails', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/news/pages/BlogList', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/news/pages/BlogDetails', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/profile/pages/ViewProfile', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/profile/pages/EditProfile', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/trekker-community/pages/MyBlogList', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/chat/pages/ChatList', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/shared/layout/AdminLayout', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

// Recursive search helper to find a Route element by its path configuration
function findRouteElement(node, path) {
  if (!node) return null;
  if (node.props && node.props.path === path) {
    return node;
  }
  if (node.props?.children) {
    const children = React.Children.toArray(node.props.children);
    for (const child of children) {
      const found = findRouteElement(child, path);
      if (found) return found;
    }
  }
  return null;
}

describe('AppRoutes Route Configurations', () => {
  it('should register the chat route wrapped in ProtectedRoute', () => {
    // Render the AppRoutes JSX configuration tree
    const elementTree = AppRoutes();

    // Search for the PATHS.CHAT route element
    const chatRoute = findRouteElement(elementTree, PATHS.CHAT);

    // Assert path exists
    expect(chatRoute).toBeTruthy();
    expect(chatRoute.props.path).toBe(PATHS.CHAT);

    // Assert it wraps the route with ProtectedRoute Mock
    expect(chatRoute.props.element.type.name).toBe('ProtectedRouteMock');
  });
});
