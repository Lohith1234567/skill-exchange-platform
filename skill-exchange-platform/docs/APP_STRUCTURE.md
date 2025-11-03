# App.jsx Structure Guide

## Complete React Router Implementation

The `App.jsx` file is the root component that sets up the entire routing architecture for the Skill Exchange Platform.

## Key Features

### 1. Authentication Provider Wrapper
```jsx
<AuthProvider>
  {/* All routes wrapped in auth context */}
</AuthProvider>
```
- Provides authentication state to entire app
- Manages login/logout functionality
- Stores user information

### 2. Protected Route Component
```jsx
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};
```
- Guards routes that require authentication
- Redirects to login if not authenticated
- Uses localStorage for session (TODO: replace with real auth)

### 3. Route Organization

#### Public Routes with Layout
```jsx
<Route path="/" element={<MainLayout />}>
  <Route index element={<Landing />} />
  <Route path="explore" element={<Explore />} />
</Route>
```
- Accessible without authentication
- Includes Navbar and Footer via MainLayout

#### Authentication Route (No Layout)
```jsx
<Route path="/login" element={<Login />} />
```
- Full-screen login/signup form
- No navbar or footer for cleaner UX

#### Protected Routes with Layout
```jsx
<Route
  path="/"
  element={
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  }
>
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="profile" element={<Profile />} />
  <Route path="profile/:userId" element={<Profile />} />
  <Route path="chat" element={<Chat />} />
  <Route path="chat/:conversationId" element={<Chat />} />
</Route>
```
- Require authentication
- Include Navbar and Footer
- Support dynamic URL parameters

#### 404 Error Route
```jsx
<Route path="*" element={<NotFoundPage />} />
```
- Catches all undefined routes
- Shows custom 404 page with navigation

## How It Works

### 1. User Visits Public Route
```
User → / → Landing Page (with layout)
User → /explore → Explore Page (with layout)
```

### 2. User Attempts Protected Route (Not Authenticated)
```
User → /dashboard → ProtectedRoute Check → Redirect to /login
```

### 3. User Logs In
```
User → /login → Form Submit → Store User in localStorage → Navigate to /dashboard
```

### 4. Authenticated User Navigation
```
User → /dashboard → ProtectedRoute Check → Dashboard Page (with layout)
User → /profile → Profile Page
User → /chat → Chat Page
```

### 5. User Logs Out
```
User → Clicks Logout → Remove from localStorage → Navigate to /
```

## Integration with Other Components

### Navbar Integration
```jsx
// Navbar.jsx uses routes and checks auth
import { ROUTES } from '../../routes';

const isLoggedIn = localStorage.getItem('user') !== null;
const navItems = isLoggedIn ? PROTECTED_NAV_ITEMS : PUBLIC_NAV_ITEMS;
```

### Login Integration
```jsx
// Login.jsx navigates after successful auth
import { ROUTES } from '../../routes';

const handleSubmit = (e) => {
  // ... authentication logic
  localStorage.setItem('user', JSON.stringify(user));
  navigate(ROUTES.DASHBOARD);
};
```

### MainLayout Integration
```jsx
// MainLayout wraps pages with Navbar and Footer
const MainLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Outlet /> {/* Child routes render here */}
    </main>
    <Footer />
  </div>
);
```

## Best Practices Applied

1. **Centralized Route Constants**: All paths in `src/routes/index.js`
2. **Component-Based Route Guards**: Reusable `ProtectedRoute` component
3. **Layout Composition**: Nested routes with `<Outlet />` for DRY code
4. **Clear Route Hierarchy**: Logical grouping of public/protected routes
5. **Error Handling**: 404 catch-all route with helpful UI
6. **Type Safety Ready**: Structure supports TypeScript if needed

## Testing Checklist

- [ ] Landing page loads at `/`
- [ ] Explore page loads at `/explore`
- [ ] Login page loads at `/login`
- [ ] Protected routes redirect to login when not authenticated
- [ ] Dashboard loads after login
- [ ] Profile page loads for authenticated users
- [ ] Chat page loads for authenticated users
- [ ] Navbar shows correct items based on auth status
- [ ] Logout redirects to home page
- [ ] 404 page shows for invalid routes
- [ ] All navigation links work correctly

## Next Steps for Production

1. Replace localStorage auth with JWT tokens
2. Add API integration for authentication
3. Implement refresh token logic
4. Add loading states during route transitions
5. Implement lazy loading for code splitting
6. Add route-level error boundaries
7. Add analytics/tracking on route changes
8. Implement role-based access control (RBAC)
