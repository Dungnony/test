# 📊 Project Structure & Architecture

## 🏗️ Architecture Overview

```
Frontend (React) <---> Axios HTTP Client <---> Backend API (Spring Boot)
     ↓                                              ↓
Redux Store (State)                           Database (JPA)
     ↓
Components (UI)
```

## 📂 Detailed Folder Structure

```
duancuoikifrontend/
├── public/                      # Static assets
├── src/
│   ├── components/              # Reusable React components
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx          # Route guard with role check
│   │   ├── common/
│   │   │   ├── Button.tsx                  # Reusable button (primary/secondary/danger/success)
│   │   │   ├── Card.tsx                    # Card container component
│   │   │   ├── Input.tsx                   # Form input with label & error
│   │   │   ├── LoadingSpinner.tsx          # Loading indicator
│   │   │   ├── Modal.tsx                   # Modal dialog component
│   │   │   └── Table.tsx                   # Data table component
│   │   └── layout/
│   │       ├── Layout.tsx                  # Main layout wrapper
│   │       └── Navbar.tsx                  # Navigation bar with auth menu
│   │
│   ├── pages/                   # Page-level components (routes)
│   │   ├── auth/
│   │   │   └── LoginPage.tsx               # Login form (username/password + OAuth)
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx           # Dashboard with summary stats
│   │   ├── students/
│   │   │   ├── StudentsPage.tsx            # Student list with search
│   │   │   ├── StudentFormPage.tsx         # Create/Edit student form
│   │   │   └── StudentHistoryPage.tsx      # Student enrollment history
│   │   ├── courses/
│   │   │   ├── CoursesPage.tsx             # Course list
│   │   │   └── CourseFormPage.tsx          # Create/Edit course form
│   │   ├── enrollments/
│   │   │   └── EnrollmentPage.tsx          # Enroll student to course
│   │   ├── certificates/
│   │   │   └── CertificatesPage.tsx        # Issue certificate (Admin/Staff)
│   │   └── statistics/
│   │       └── StatisticsPage.tsx          # Statistics by province & year
│   │
│   ├── redux/                   # Redux state management
│   │   ├── store.ts                        # Redux store configuration
│   │   ├── authSlice.ts                    # Auth state (token, user, role)
│   │   └── hooks.ts                        # Typed useAppDispatch & useAppSelector
│   │
│   ├── services/                # API communication layer
│   │   ├── api.ts                          # Axios instance + interceptors
│   │   └── index.ts                        # API functions (auth, student, course, etc.)
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts                        # All DTOs matching backend
│   │
│   ├── utils/                   # Utility functions
│   │   ├── dateUtils.ts                    # Date formatting & conversion
│   │   ├── roleUtils.ts                    # Role checking (isAdmin, isStaff)
│   │   └── helpers.ts                      # Error handling, status display
│   │
│   ├── App.tsx                  # Main app with React Router routes
│   ├── main.tsx                 # Entry point (render with Redux Provider)
│   ├── index.css                # Global styles with Tailwind directives
│   └── vite-env.d.ts            # Vite type declarations
│
├── .eslintrc.cjs                # ESLint configuration
├── .gitignore                   # Git ignore rules
├── index.html                   # HTML template
├── package.json                 # Dependencies & scripts
├── postcss.config.js            # PostCSS config for Tailwind
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript config
├── tsconfig.node.json           # TypeScript config for Vite
├── vite.config.ts               # Vite configuration
├── README.md                    # Full documentation
└── QUICKSTART.md                # Quick start guide
```

## 🔄 Data Flow

### Authentication Flow

```
1. User enters credentials
   ↓
2. LoginPage → authService.login()
   ↓
3. API call to POST /api/auth/login
   ↓
4. Backend validates & returns JWT + role
   ↓
5. Redux: dispatch setCredentials({ token, username, role })
   ↓
6. Save to localStorage
   ↓
7. Navigate to /dashboard
   ↓
8. ProtectedRoute checks isAuthenticated
   ↓
9. All subsequent API calls include Authorization header
```

### CRUD Flow (Example: Create Student)

```
1. User fills StudentFormPage
   ↓
2. Form submit → studentService.create(data)
   ↓
3. Axios interceptor adds Authorization header
   ↓
4. API call to POST /api/v1/students
   ↓
5. Backend creates student with auto-generated MSV
   ↓
6. Returns StudentDTO
   ↓
7. Navigate to /students
   ↓
8. StudentsPage loads fresh data
```

## 🎨 Component Hierarchy

```
App
├── BrowserRouter
│   ├── Routes
│   │   ├── LoginPage (public)
│   │   └── ProtectedRoute (authenticated)
│   │       └── Layout
│   │           ├── Navbar
│   │           └── Page Content
│   │               ├── DashboardPage
│   │               ├── StudentsPage
│   │               │   ├── Card
│   │               │   ├── Input (search)
│   │               │   └── Table
│   │               │       └── Student rows
│   │               ├── StudentFormPage
│   │               │   ├── Card
│   │               │   └── Input fields
│   │               ├── CoursesPage
│   │               ├── EnrollmentPage
│   │               ├── CertificatesPage
│   │               └── StatisticsPage
```

## 🔐 Security Implementation

### JWT Token Management

- **Storage**: `localStorage` (keys: `token`, `username`, `role`)
- **Interceptor**: Axios request interceptor adds `Authorization: Bearer <token>`
- **Expiry**: Backend token expires in 10 hours
- **Refresh**: On 401 error, clear localStorage & redirect to `/login`

### Role-Based Access Control

```tsx
// In ProtectedRoute component
if (!isAuthenticated) return <Navigate to="/login" />;
if (requireAdmin && role !== "ROLE_ADMIN") return <Navigate to="/dashboard" />;
if (requireAdminOrStaff && !["ROLE_ADMIN", "ROLE_STAFF"].includes(role))
  return <Navigate to="/dashboard" />;
```

### API Error Handling

```tsx
// In Axios response interceptor
if (error.response?.status === 401) {
  localStorage.clear();
  window.location.href = "/login";
}
```

## 🎯 Key Technical Decisions

### Why Redux Toolkit?

- Simple auth state management across app
- Persist auth to localStorage
- Typed hooks for type safety

### Why Axios over Fetch?

- Interceptors for global request/response handling
- Automatic JSON transformation
- Better error handling

### Why Tailwind CSS?

- No pre-built UI library (theo yêu cầu đề bài)
- Utility-first approach
- Custom components built from scratch
- Responsive by default

### Why TypeScript?

- Type safety for API DTOs
- Better IDE support
- Catch errors at compile time
- Required by đề bài

### Why Vite over CRA?

- Faster dev server (HMR)
- Faster build times
- Modern tooling
- Better DX

## 📊 State Management Strategy

### Redux Store Structure

```ts
{
  auth: {
    token: string | null,
    username: string | null,
    role: string | null,
    isAuthenticated: boolean
  }
}
```

### Local Component State

- Form data (useState)
- Loading states
- Error messages
- Search/filter states

**When to use Redux vs useState?**

- **Redux**: Global state (auth, user info)
- **useState**: Local/temporary state (form inputs, UI state)

## 🚀 Performance Considerations

### Code Splitting

- React Router lazy loading (can be added later)
- Dynamic imports for heavy pages

### API Optimization

- Parallel requests with `Promise.all()`
- Search debouncing (can be added)
- Pagination (backend support needed)

### Rendering Optimization

- React.memo for expensive components (can be added)
- useCallback for event handlers (can be added)
- Keys for list rendering (already implemented)

## 🧪 Testing Strategy (Future Enhancement)

### Unit Tests

- Utility functions (dateUtils, roleUtils, helpers)
- Redux reducers & actions

### Integration Tests

- API service functions
- Component + API interaction

### E2E Tests

- Full user flows (login → CRUD → logout)
- Cypress or Playwright

## 📦 Build & Deployment

### Development

```bash
npm run dev  # Vite dev server on :3000
```

### Production

```bash
npm run build       # TypeScript compile + Vite build
npm run preview     # Preview production build
```

### Deployment Options

1. **Vercel/Netlify**: Auto-deploy from GitHub
2. **AWS S3 + CloudFront**: Static hosting
3. **Nginx**: Serve `dist/` folder + reverse proxy to backend
4. **Docker**: Multi-stage build with nginx

### Environment Variables

```env
VITE_API_URL=http://localhost:8080/api
```

Access in code:

```ts
const API_BASE_URL = import.meta.env.VITE_API_URL;
```

## 🔗 Integration with Backend

### API Contract

- Base URL: `http://localhost:8080/api`
- Content-Type: `application/json`
- Authorization: `Bearer <JWT_TOKEN>`

### DTO Mapping

All TypeScript interfaces in `src/types/index.ts` match backend DTOs exactly:

- `StudentDTO` ↔ Java `StudentDTO`
- `CourseDTO` ↔ Java `CourseDTO`
- `EnrollmentDTO` ↔ Java `EnrollmentDTO`
- etc.

### Date/Time Handling

- Backend: Java `LocalDate` / `LocalDateTime`
- Frontend: ISO strings (`YYYY-MM-DD` / `YYYY-MM-DDTHH:mm:ss`)
- Conversion: `dateUtils.ts` utilities

## 📝 Coding Conventions

### Naming

- **Components**: PascalCase (`StudentFormPage.tsx`)
- **Files**: camelCase or kebab-case
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase

### File Organization

- One component per file
- Export default for components
- Named exports for utilities
- Index files for barrel exports

### TypeScript

- Explicit types for function parameters
- Return types for public functions
- Interfaces over types (for DTOs)
- Enums for constants

---

**Last Updated**: November 2025
