'use client'

import { useState } from 'react'
import { useAppStore, type AppView } from '@/store/use-app-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  Code2,
  GitBranch,
  Wrench,
  FileText,
  LayoutDashboard,
  Sparkles,
  Bot,
  ChevronLeft,
  Menu,
  Terminal,
  Zap,
  Shield,
  ShieldCheck,
  BookOpen,
  TestTube2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeroSection } from '@/components/legacy-code-agent/hero-section'
import { CodeExplorer } from '@/components/legacy-code-agent/code-explorer'
import { FlowTracer } from '@/components/legacy-code-agent/flow-tracer'
import { SmartRefactor } from '@/components/legacy-code-agent/smart-refactor'
import { DocGenerator } from '@/components/legacy-code-agent/doc-generator'
import { DashboardView } from '@/components/legacy-code-agent/dashboard'
import { SecurityScanner } from '@/components/legacy-code-agent/security-scanner'
import { CanvasBackground } from '@/components/legacy-code-agent/canvas-background'

const navItems: { id: AppView; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'hero', label: 'Home', icon: Sparkles, description: 'Overview' },
  { id: 'explorer', label: 'Code Explorer', icon: Code2, description: 'Analyze architecture' },
  { id: 'flowtracer', label: 'Flow Tracer', icon: GitBranch, description: 'Trace code flows' },
  { id: 'refactor', label: 'Smart Refactor', icon: Wrench, description: 'Auto-refactoring' },
  { id: 'docgen', label: 'Docs & Test A/B', icon: FileText, description: 'Generate docs & tests' },
  { id: 'security', label: 'Security Scan', icon: ShieldCheck, description: 'Vulnerability detection' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Code health metrics' },
]

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { currentView, setCurrentView } = useAppStore()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-background animate-pulse" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden"
          >
            <h1 className="font-bold text-sm tracking-tight">Bob Agent</h1>
            <p className="text-[10px] text-muted-foreground">Legacy Code Master</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
              Modules
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentView(item.id)
                  onNavigate?.()
                }}
                className={cn(
                  'w-full justify-start gap-3 h-auto py-2.5 px-3 rounded-lg transition-all duration-200',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', isActive && 'text-emerald-600 dark:text-emerald-400')} />
                {!collapsed && (
                  <div className="text-left">
                    <p className="text-xs font-medium leading-tight">{item.label}</p>
                    <p className={cn('text-[10px] leading-tight', isActive ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-muted-foreground/70')}>
                      {item.description}
                    </p>
                  </div>
                )}
              </Button>
            )
          })}
        </div>

        {/* Bob Features Badge */}
        {!collapsed && (
          <div className="mt-6 mx-1 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/50 dark:border-emerald-800/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center">
                <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Powered by IBM Bob</span>
            </div>
            <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/60 leading-relaxed">
              Full repository context AI for intelligent code analysis and refactoring.
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Terminal className="w-3 h-3" />
            <span>IBM Bob Hackathon 2026</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [collapsed, setCollapsed] = useState(false)
  const { currentView } = useAppStore()

  const renderView = () => {
    switch (currentView) {
      case 'hero': return <HeroSection />
      case 'explorer': return <CodeExplorer />
      case 'flowtracer': return <FlowTracer />
      case 'refactor': return <SmartRefactor />
      case 'docgen': return <DocGenerator />
      case 'dashboard': return <DashboardView />
      case 'security': return <SecurityScanner />
      default: return <HeroSection />
    }
  }

  return (
    <div className="min-h-screen flex bg-background relative">
      {/* Canvas Background for non-hero pages */}
      {currentView !== 'hero' && <CanvasBackground variant="module" />}
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 flex-shrink-0',
          collapsed ? 'w-[68px]' : 'w-[240px]'
        )}
      >
        <SidebarContent collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -right-3 z-10 w-6 h-6 rounded-full bg-border border border-background shadow-sm flex items-center justify-center hover:bg-accent transition-colors hidden lg:flex"
          style={{ transform: 'translateY(-50%)' }}
        >
          <ChevronLeft className={cn('w-3 h-3 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 lg:hidden bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[260px] p-0">
          <VisuallyHidden>
            <SheetTitle>Navigation</SheetTitle>
          </VisuallyHidden>
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="h-full w-full flex flex-col"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
