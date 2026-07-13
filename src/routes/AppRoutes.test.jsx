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
