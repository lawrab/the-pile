# Centralized Button & Icon System

## Overview
We've created a centralized button and icon system to ensure consistent spacing, alignment, and sizing across all components.

## Core Components

### 1. Enhanced Button Component (`ui/button.tsx`)
- Added `gap-2` to base button class for automatic spacing between icons and text
- No more manual `mr-2`, `ml-2` spacing needed

### 2. ButtonIcon Component (`ui/button-icon.tsx`)
```tsx
import { ButtonIcon } from '@/components/ui/button-icon'
import { Play } from 'lucide-react'

// Standard icon with proper sizing
<ButtonIcon icon={Play} size="md" />

// Sizes: "sm" (h-3.5 w-3.5), "md" (h-4 w-4), "lg" (h-5 w-5)
```

### 3. IconButton Component (`ui/icon-button.tsx`)
```tsx
import { IconButton } from '@/components/ui/icon-button'
import { Play, Download, Loader2 } from 'lucide-react'

// Basic icon button
<IconButton icon={Play} size="lg">
  Play Now
</IconButton>

// Loading button (auto-detects Loader2 and adds spin)
<IconButton icon={isLoading ? Loader2 : Download} disabled={isLoading}>
  {isLoading ? 'Downloading...' : 'Download'}
</IconButton>

// Icon on the right
<IconButton icon={ExternalLink} iconPosition="right">
  Open in Steam
</IconButton>
```

## Migration Examples

### Before (Manual Spacing)
```tsx
<Button>
  <Download className="mr-2 h-4 w-4" />
  Download Game
</Button>

<Button disabled={isLoading}>
  {isLoading ? (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  ) : (
    <Play className="mr-2 h-5 w-5" />
  )}
  {isLoading ? 'Loading...' : 'Play Now'}
</Button>
```

### After (Centralized System)
```tsx
<IconButton icon={Download} iconSize="md">
  Download Game
</IconButton>

<IconButton 
  icon={isLoading ? Loader2 : Play} 
  disabled={isLoading}
  iconSize="lg"
>
  {isLoading ? 'Loading...' : 'Play Now'}
</IconButton>
```

## Key Benefits

1. **Consistent Spacing**: Automatic `gap-2` spacing between icons and text
2. **Standardized Sizing**: Three consistent icon sizes (sm/md/lg)
3. **Auto-Loading Detection**: Loader2 icons automatically get `animate-spin`
4. **Better Alignment**: Icons properly centered with text
5. **Less Code**: No manual margin classes needed
6. **Type Safety**: TypeScript ensures proper icon prop usage

## Size Guidelines

- **sm buttons** → **sm icons** (h-3.5 w-3.5) - For compact UI
- **default buttons** → **md icons** (h-4 w-4) - Standard size
- **lg buttons** → **lg icons** (h-5 w-5) - Prominent actions

## Common Patterns

```tsx
// Primary action with large icon
<IconButton icon={Play} size="lg" iconSize="lg" variant="default">
  Play Now
</IconButton>

// Secondary action with standard icon  
<IconButton icon={Settings} size="sm" variant="outline">
  Settings
</IconButton>

// Loading state
<IconButton 
  icon={isSubmitting ? Loader2 : Save} 
  disabled={isSubmitting}
>
  {isSubmitting ? 'Saving...' : 'Save Changes'}
</IconButton>

// Icon-only button
<IconButton icon={X} size="sm" variant="ghost" />
```

## Migration Checklist

- [ ] Replace `Button + manual icon` with `IconButton`
- [ ] Remove all `mr-2`, `ml-2`, `mr-1` classes from icons
- [ ] Standardize icon sizes using `iconSize` prop
- [ ] Use `Loader2` for loading states (auto-spin)
- [ ] Test button alignment and spacing