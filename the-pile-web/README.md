# The Pile Web Frontend

**Next.js 14 Application for The Pile Gaming Backlog Tracker**

A modern, responsive web application that transforms your Steam gaming backlog into an interactive experience, complete with humorous reality checks and satisfying amnesty animations.

## 🎮 Core Features

### 🔐 Authentication Flow
- **Steam OAuth Integration**: Seamless login via Steam OpenID
- **JWT Token Management**: Automatic token refresh and session handling
- **Protected Routes**: Authentication guards for private pages
- **User Context**: Global user state management with React Context
- **Logout Handling**: Clean session termination with token cleanup

### 📊 Interactive Pile Visualization
- **3D Pile Rendering**: Real-time Three.js visualization using React Three Fiber
- **Color-coded Status System**: 
  - 🔴 **Red Cubes**: Unplayed games (shame incarnate)
  - 🟡 **Yellow Cubes**: Currently playing
  - 🟢 **Green Cubes**: Completed games
  - ⚫ **Gray Cubes**: Abandoned games
  - 🟣 **Purple Cubes**: Amnesty granted
- **Interactive Controls**: Orbit controls for 360° pile inspection
- **Performance Optimization**: Level-of-detail rendering for large collections
- **Mobile Responsive**: Touch-friendly controls on mobile devices

### 🎯 Dashboard Analytics
- **Real-time Statistics Cards**: Live updates of shame metrics
- **Completion Timeline**: Visual progress tracking over time
- **Money Wasted Counter**: Running total of unplayed game costs
- **Genre Breakdown**: Pie charts of buying vs playing preferences
- **Reality Check Alerts**: Humorous notifications about pile growth

### 🕊️ Amnesty Experience
- **Satisfying Animations**: Games float away with Framer Motion physics
- **Reason Documentation**: Optional guilt-free explanations
- **Cemetery View**: Memorial gallery of amnesty-granted games
- **Undo Mechanism**: Change your mind within 24 hours
- **Social Validation**: Share your amnesty decisions

### 🧠 Insights Dashboard
- **Pattern Recognition**: Visual charts of buying behaviors
- **Recommendation Engine**: Personalized advice for pile management
- **Trend Analysis**: Historical view of pile evolution
- **Genre Comparison**: What you buy vs what you actually play
- **Achievement System**: Gamified milestones for pile reduction

## 🏗️ Technical Architecture

### 🗂️ Project Structure
```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Auth route group
│   │   ├── login/         # Steam login page  
│   │   └── callback/      # OAuth callback handler
│   ├── pile/              # Main pile dashboard
│   ├── stats/             # Statistics and insights
│   ├── cemetery/          # Amnesty memorial
│   ├── layout.tsx         # Root layout with providers
│   ├── globals.css        # Global styles and animations
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   │   ├── button.tsx    # Customizable button component
│   │   ├── card.tsx      # Container components
│   │   └── input.tsx     # Form input components
│   ├── pile-visualization.tsx  # 3D pile renderer
│   ├── stats-cards.tsx   # Dashboard statistics
│   ├── amnesty-modal.tsx # Amnesty granting interface
│   └── navigation.tsx    # App navigation
├── lib/                  # Utilities and configuration
│   ├── api.ts           # API client with axios
│   ├── auth-provider.tsx # Authentication context
│   ├── query-provider.tsx # TanStack Query setup
│   ├── utils.ts         # Utility functions
│   └── constants.ts     # App constants
├── hooks/               # Custom React hooks
│   ├── use-auth.ts     # Authentication hook
│   ├── use-pile.ts     # Pile data management
│   ├── use-stats.ts    # Statistics queries
│   └── use-local-storage.ts # Persistent state
├── types/              # TypeScript definitions
│   ├── index.ts        # Main type definitions
│   ├── api.ts          # API response types
│   └── auth.ts         # Authentication types
└── styles/             # Additional styling
    ├── pile.css        # 3D visualization styles
    └── animations.css  # Custom animations
```

### 🎨 Design System

**Color Palette:**
```css
:root {
  /* Dark theme optimized for gamers */
  --background: 224 71% 4%;           /* Deep slate */
  --foreground: 213 31% 91%;          /* Light text */
  --primary: 210 40% 98%;             /* White accents */
  --secondary: 222.2 84% 4.9%;        /* Dark surface */
  
  /* Pile-specific colors */
  --pile-shame: #dc2626;              /* Red - unplayed */
  --pile-playing: #eab308;            /* Yellow - playing */
  --pile-completed: #16a34a;          /* Green - completed */
  --pile-abandoned: #6b7280;          /* Gray - abandoned */
  --pile-amnesty: #7c3aed;           /* Purple - amnesty */
}
```

**Typography:**
- **Font**: Inter (system font fallback)
- **Scale**: Tailwind's default type scale
- **Responsive**: Fluid typography with viewport units
- **Accessibility**: Meets WCAG contrast requirements

**Component Design:**
- **shadcn/ui Base**: Customizable, accessible components
- **Consistent Spacing**: 4px grid system via Tailwind
- **Animation System**: Framer Motion with reduced-motion support
- **Mobile-first**: Responsive design from mobile to desktop

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your API URL
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── auth/           # Authentication pages
│   ├── pile/           # Main pile dashboard
│   ├── stats/          # Statistics and reality check
│   └── cemetery/       # Amnesty granted games
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   └── pile-visualization.tsx
├── lib/               # Utilities and providers
│   ├── api.ts         # API client
│   ├── auth-provider.tsx
│   └── query-provider.tsx
├── hooks/             # Custom React hooks
└── types/             # TypeScript type definitions
```

### 🔧 State Management Architecture

**Authentication State:**
```typescript
interface AuthContext {
  user: User | null              // Current user data
  isLoading: boolean            // Auth check in progress
  login: () => Promise<void>    // Initiate Steam OAuth
  logout: () => void           // Clear session and redirect
}
```

**Data Fetching Strategy:**
```typescript
// TanStack Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // 5 minutes
      cacheTime: 1000 * 60 * 30,   // 30 minutes
      retry: 2,                     // 2 retry attempts
      refetchOnWindowFocus: false,  // Don't refetch on tab focus
    },
  },
})

// Custom hooks for API calls
const { data: pile, isLoading } = useQuery({
  queryKey: ['pile', filters],
  queryFn: () => pileApi.getPile(filters),
  enabled: !!user,
})
```

**Local Storage Strategy:**
```typescript
// Persistent settings
interface LocalSettings {
  pileViewMode: '3d' | 'list'     // User preference
  lastSyncTime: number            // Cache timestamp
  amnestyHistory: string[]        // Recent amnesty grants
  onboardingComplete: boolean     // Tutorial status
}
```

### 📱 Responsive Design System

**Breakpoint Strategy:**
```css
/* Mobile-first approach */
.pile-container {
  @apply p-4;                    /* Mobile: 16px padding */
  
  @screen md: {
    @apply p-6;                  /* Tablet: 24px padding */
  }
  
  @screen lg: {
    @apply p-8;                  /* Desktop: 32px padding */
  }
  
  @screen xl: {
    @apply p-12;                 /* Large: 48px padding */
  }
}
```

**Touch Optimization:**
- Minimum 44px touch targets
- Gesture support for pile navigation
- Optimized viewport settings
- Reduced motion for battery saving

### 🎭 Animation System

**Amnesty Animation Sequence:**
```typescript
const amnestyVariants = {
  initial: { 
    scale: 1, 
    y: 0, 
    opacity: 1,
    rotateY: 0 
  },
  floating: {
    scale: 0.8,
    y: -50,
    opacity: 0.7,
    rotateY: 360,
    transition: { duration: 1.5, ease: "easeOut" }
  },
  disappeared: {
    scale: 0.1,
    y: -200,
    opacity: 0,
    transition: { duration: 1, ease: "easeIn" }
  }
}
```

**Performance Optimizations:**
- Transform-only animations (GPU accelerated)
- `will-change` CSS property for heavy animations
- AnimatePresence for enter/exit transitions
- Reduced motion support via `prefers-reduced-motion`

## 📄 Key Pages & Components

### 🏠 Landing Page (`/`)
- **Hero Section**: Animated demo pile with call-to-action
- **Feature Showcase**: Interactive feature explanations  
- **Social Proof**: Testimonials from pile sufferers
- **Responsive Design**: Mobile-optimized layout

### 🔐 Authentication Flow

**Steam Login (`/auth/steam`):**
```typescript
export default function SteamAuthPage() {
  const { login } = useAuth()
  
  useEffect(() => {
    login() // Auto-redirect to Steam
  }, [])
  
  return <LoadingSpinner />
}
```

**OAuth Callback (`/auth/callback`):**
```typescript
export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      localStorage.setItem('auth_token', token)
      router.push('/pile')
    }
  }, [])
}
```

### 🏔️ Pile Dashboard (`/pile`)

**Key Components:**
- **PileVisualization**: 3D scene with game cubes
- **StatusCards**: Real-time statistics display
- **QuickActions**: Import, sync, and navigation buttons
- **GamesList**: Alternative list view for accessibility

**Performance Features:**
- Virtual scrolling for large game lists
- Lazy loading of game images
- Progressive enhancement for 3D features
- Fallback to 2D visualization on low-end devices

### 📊 Statistics Dashboard (`/stats`)

**Reality Check Section:**
```typescript
const RealityCheckCard = ({ data }: { data: RealityCheck }) => (
  <Card className="reality-check-glow">
    <CardHeader>
      <CardTitle className="text-red-400">Brutal Reality Check</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-4xl font-bold mb-2">
        {data.completion_years.toFixed(0)} years
      </div>
      <p className="text-slate-400">
        to finish your backlog at current pace
      </p>
    </CardContent>
  </Card>
)
```

**Interactive Charts:**
- Recharts for data visualization
- Animated transitions between states
- Responsive chart sizing
- Color-coded by game status

### 🕊️ Cemetery View (`/cemetery`)

**Amnesty Memorial:**
- Grid layout of amnesty-granted games
- Hover effects with amnesty reasons
- Search and filter capabilities
- "Resurrection" feature (undo amnesty)

### 🎨 UI Component Library

**Base Components (shadcn/ui):**
```typescript
// Customized Button with pile-specific variants
interface ButtonProps {
  variant: 'default' | 'outline' | 'ghost' | 'amnesty' | 'shame'
  size: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  amnesty?: boolean  // Special styling for amnesty actions
}

// Animated Card with glow effects
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, glowColor, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        glowColor && `shadow-[0_0_15px_${glowColor}]`,
        className
      )}
      {...props}
    />
  )
)
```

**Custom Hooks:**

```typescript
// useAuth - Authentication management
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

// usePile - Pile data management with optimistic updates
export const usePile = (filters?: PileFilters) => {
  const { data, isLoading, error, mutate } = useQuery({
    queryKey: ['pile', filters],
    queryFn: () => pileApi.getPile(filters),
  })
  
  const grantAmnesty = useMutation({
    mutationFn: ({ gameId, reason }: AmnestyRequest) =>
      pileApi.grantAmnesty(gameId, reason),
    onSuccess: () => {
      mutate() // Refresh pile data
    },
  })
  
  return { pile: data, isLoading, error, grantAmnesty }
}

// useLocalStorage - Persistent state management
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])
  
  return [storedValue, setValue] as const
}
```

## Deployment

This app is configured for Railway deployment. The `railway.json` file contains the deployment configuration.

Required environment variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Development

Run the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Type checking:
```bash
npm run type-check
```

Linting:
```bash
npm run lint
```