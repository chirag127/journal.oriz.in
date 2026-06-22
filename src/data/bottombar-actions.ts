import type { BottomBarAction } from '@chirag127/astro-chrome/BottomBar.astro'
export const bottomBarActions: BottomBarAction[] = [
  { icon: '⌂', label: 'Home', href: '/' },
  { icon: '☼', label: 'Today', href: '/today/' },
  { icon: '#', label: 'Tags', href: '/by-tag/' },
  { icon: '⌕', label: 'Search', href: '/search/' },
  { icon: '☰', label: 'Menu', href: '#sb-toggle' },
]
