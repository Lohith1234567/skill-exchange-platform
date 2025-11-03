// Route paths configuration
export const ROUTES = {
  // Public routes
  HOME: '/',
  EXPLORE: '/explore',
  LOGIN: '/login',
  
  // Protected routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  CHAT: '/chat',
};

// Navigation menu items
export const PUBLIC_NAV_ITEMS = [
  { label: 'Explore', path: ROUTES.EXPLORE },
];

export const PROTECTED_NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD },
  { label: 'Explore', path: ROUTES.EXPLORE },
  { label: 'Messages', path: ROUTES.CHAT },
  { label: 'Profile', path: ROUTES.PROFILE },
];
