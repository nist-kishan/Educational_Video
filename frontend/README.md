# EduVid Frontend

Modern, responsive React frontend for the Educational Video Platform.

## Tech Stack

- **React 19** - UI library
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client

## Features

✅ Responsive design (mobile, tablet, desktop)  
✅ Dark/Light mode with persistence  
✅ Smooth animations & transitions  
✅ Skeleton loaders for loading states  
✅ Premium UI with modern design  
✅ Redux state management  
✅ Protected routes  
✅ Email verification flow  
✅ Profile management  
✅ Dashboard with analytics  

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Header.jsx      # Navigation header
│   ├── Footer.jsx      # Footer component
│   └── SkeletonLoader.jsx  # Loading skeletons
├── pages/              # Page components
│   ├── Welcome.jsx     # Landing page
│   ├── Dashboard.jsx   # User dashboard
│   └── Profile.jsx     # User profile
├── store/              # Redux store
│   ├── index.js        # Store configuration
│   ├── authSlice.js    # Auth reducer & thunks
│   └── themeSlice.js   # Theme reducer
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update VITE_API_URL in .env
VITE_API_URL=http://localhost:5000/api
```

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Components

### Header
- Sticky navigation with logo
- Theme toggle (dark/light)
- Mobile responsive menu
- Auth buttons/user menu
- Smooth animations

### Footer
- Company information
- Quick links
- Social media
- Contact info
- Newsletter signup

### SkeletonLoader
- SkeletonCard - Card loading state
- SkeletonText - Text loading state
- SkeletonProfile - Profile loading state
- SkeletonGrid - Grid of skeletons

## Pages

### Welcome (Landing)
- Hero section with CTA
- Features showcase
- Testimonials
- Statistics
- Responsive grid layout

### Dashboard
- Welcome message
- Stats cards
- Course grid with progress
- Learning analytics
- Skeleton loaders while loading

### Profile
- User information display
- Edit profile form
- Change password modal
- Delete account modal
- Success/error alerts

## Redux Store

### Auth Slice
```javascript
// State
{
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  success: null,
  emailVerified: false
}

// Async Thunks
- registerUser(userData)
- loginUser(credentials)
- getUserProfile()
- updateUserProfile(userData)
- verifyEmail(token)
- changePassword(passwordData)
- deleteAccount(password)

// Actions
- clearError()
- clearSuccess()
- logout()
```

### Theme Slice
```javascript
// State
{
  mode: 'light' | 'dark',
  colors: { light: {...}, dark: {...} }
}

// Actions
- toggleTheme()
- setTheme(mode)
```

## Styling

### Tailwind CSS
- Utility-first approach
- Dark mode support
- Responsive breakpoints
- Custom colors & spacing

### Dark Mode
- Automatic detection
- Manual toggle in header
- Persisted in localStorage
- Applied to all components

### Animations
- Framer Motion for smooth transitions
- Hover effects on interactive elements
- Page transitions
- Loading animations
- Staggered children animations

## Authentication Flow

1. **Register**
   - User fills registration form
   - Redux dispatches registerUser thunk
   - Tokens stored in localStorage
   - Verification email sent
   - Redirect to dashboard

2. **Login**
   - User enters credentials
   - Redux dispatches loginUser thunk
   - Tokens stored in localStorage
   - Redirect to dashboard

3. **Email Verification**
   - User clicks link in email
   - Token passed to verify endpoint
   - Email marked as verified
   - User can access all features

4. **Logout**
   - User clicks logout
   - Redux clears auth state
   - Tokens removed from localStorage
   - Redirect to home

## API Integration

All API calls use axios with:
- Base URL from VITE_API_URL
- Authorization header with token
- Error handling & user feedback
- Loading states via Redux

Example:
```javascript
const response = await axios.post(
  `${API_URL}/auth/login`,
  credentials,
  { headers: { Authorization: `Bearer ${token}` } }
);
```

## Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Components
- Flexible grid layouts
- Mobile-first approach
- Touch-friendly buttons
- Optimized images
- Readable typography

## Performance

- Code splitting with React Router
- Lazy loading components
- Optimized animations
- Efficient re-renders with Redux
- Skeleton loaders for perceived performance

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=EduVid
```

## Troubleshooting

### API Connection Issues
- Ensure backend is running on port 5000
- Check VITE_API_URL in .env
- Verify CORS settings on backend

### Theme Not Persisting
- Check localStorage is enabled
- Clear browser cache
- Check browser console for errors

### Animations Not Working
- Ensure Framer Motion is installed
- Check browser supports CSS transforms
- Verify GPU acceleration is enabled

## Next Steps

1. Create Login/Register pages
2. Add course listing page
3. Build course player
4. Add enrollment system
5. Create tutor dashboard
6. Build admin panel

## Support

For issues or questions:
- Check Redux DevTools for state
- Review browser console for errors
- Verify API responses in Network tab
- Check component props in React DevTools

## License

MIT
