# React Router Setup - Skill Exchange Platform

## Overview
This application uses React Router v6 for client-side routing with a combination of public and protected routes.

## Route Structure

### Public Routes (No Authentication Required)
- `/` - Landing page with hero section and features
- `/explore` - Browse users and their skills
- `/login` - Authentication page (sign in/sign up)

### Protected Routes (Authentication Required)
- `/dashboard` - User dashboard with stats and active exchanges
- `/profile` - Current user's profile
- `/profile/:userId` - View another user's profile
- `/chat` - Messages/chat interface
- `/chat/:conversationId` - Specific conversation

### Error Routes
- `*` (404) - Catch-all for undefined routes

## Authentication Flow

1. **Unauthenticated User**:
   - Can access: `/`, `/explore`, `/login`
   - Redirected to `/login` when accessing protected routes

2. **Authenticated User**:
   - Can access all routes
   - User data stored in localStorage (mock implementation)
   - Redirected to `/dashboard` after login

3. **Logout**:
   - Clears localStorage
   - Redirects to home page (`/`)

## Components

### App.jsx
Main application component with:
- `AuthProvider` wrapper for authentication context
- `Router` configuration
- `ProtectedRoute` component for route guards
- 404 error page

### Route Protection
```jsx
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};
```

### Navigation Components
- **Navbar**: Displays different menu items based on auth status
- **Footer**: Links to main platform sections

## Usage Examples

### Navigating Programmatically
```jsx
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes';

const navigate = useNavigate();
navigate(ROUTES.DASHBOARD);
```

### Creating Links
```jsx
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes';

<Link to={ROUTES.EXPLORE}>Explore Skills</Link>
```

### Accessing Route Parameters
```jsx
import { useParams } from 'react-router-dom';

const { userId } = useParams(); // From /profile/:userId
const { conversationId } = useParams(); // From /chat/:conversationId
```

### Checking Current Route
```jsx
import { useLocation } from 'react-router-dom';

const location = useLocation();
const isActive = location.pathname === '/dashboard';
```

## Route Constants
All route paths are defined in `src/routes/index.js`:

```javascript
export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explore',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  CHAT: '/chat',
};
```

## Layout Structure

### With MainLayout (Navbar + Footer)
- Landing
- Explore
- Dashboard
- Profile
- Chat

### Without Layout
- Login (full-screen form)

## Future Enhancements

1. **Advanced Route Guards**:
   - Role-based access control
   - Route-specific permissions

2. **Lazy Loading**:
   - Code-splitting for better performance
   ```jsx
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   ```

3. **Route Transitions**:
   - Animated page transitions
   - Loading states between routes

4. **Breadcrumbs**:
   - Navigation trail for nested routes

5. **Query Parameters**:
   - Search filters
   - Pagination state
   ```jsx
   /explore?skill=react&level=advanced
   ```

## Testing Routes

1. **Public Access**:
   - Visit `/` - Should show landing page
   - Visit `/explore` - Should show explore page
   - Visit `/login` - Should show login form

2. **Protected Access (Not Logged In)**:
   - Visit `/dashboard` - Should redirect to `/login`
   - Visit `/profile` - Should redirect to `/login`
   - Visit `/chat` - Should redirect to `/login`

3. **Protected Access (Logged In)**:
   - Login via `/login`
   - All protected routes should be accessible
   - Navbar should show authenticated menu

4. **404 Error**:
   - Visit any undefined route (e.g., `/random`)
   - Should show 404 page with "Go Home" button
