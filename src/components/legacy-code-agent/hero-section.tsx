'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/use-app-store'
import {
  Code2, GitBranch, Wrench, FileText, LayoutDashboard,
  ArrowRight, Sparkles, Zap, Shield, BookOpen,
  Cpu, Layers, BarChart3, Terminal, Eye,
  Workflow, Search, FileCode2, Globe, Lock,
  ChevronRight, Play, ShieldCheck, Bug,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CanvasBackground } from '@/components/legacy-code-agent/canvas-background'

/* ─────────── Animated Counter ─────────── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => {
    if (inView) animate(count, target, { duration: 2, ease: 'easeOut' })
  }, [inView, count, target])

  return <span ref={ref}>{rounded.get()}{suffix}</span>
}

/* ─────────── Typing Terminal ─────────── */
const terminalLines = [
  { prefix: '$', text: 'bob analyze ./legacy-monolith --full-context', delay: 0 },
  { prefix: '', text: '', delay: 800 },
  { prefix: '⟐', text: 'Scanning 847 files across 12 modules...', delay: 1200, color: 'text-amber-400' },
  { prefix: '⟐', text: 'Mapping dependency graph...', delay: 2000, color: 'text-amber-400' },
  { prefix: '⟐', text: 'Detected 23 deprecated patterns', delay: 2800, color: 'text-red-400' },
  { prefix: '⟐', text: 'Found 14 cross-module coupling issues', delay: 3400, color: 'text-yellow-400' },
  { prefix: '✓', text: 'Analysis complete — 93% health score', delay: 4200, color: 'text-emerald-400' },
  { prefix: '', text: '', delay: 4800 },
  { prefix: 'bob', text: 'I found 7 high-priority refactoring opportunities.', delay: 5000, color: 'text-cyan-400' },
  { prefix: 'bob', text: 'Shall I generate the fix patches?', delay: 5800, color: 'text-cyan-400' },
]

function TerminalMockup() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [blinking, setBlinking] = useState(true)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inView = useInView(terminalRef, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!inView) return
    const timers: ReturnType<typeof setTimeout>[] = []
    terminalLines.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), line.delay))
    })
    timers.push(setTimeout(() => setBlinking(false), 7000))
    return () => timers.forEach(clearTimeout)
  }, [inView])

  return (
    <div ref={terminalRef} className="relative rounded-xl overflow-hidden border border-border/60 bg-zinc-950 shadow-2xl shadow-black/30">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800/60">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-[10px] text-zinc-500 ml-2 font-mono truncate">bob-agent — ~/legacy-monolith</span>
      </div>
      {/* Terminal body */}
      <div className="p-4 font-mono text-xs leading-relaxed min-h-[200px] sm:min-h-[260px]">
        {terminalLines.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="flex gap-2"
          >
            {line.prefix && (
              <span className={cn('font-bold flex-shrink-0', line.color || 'text-emerald-400')}>
                {line.prefix}
              </span>
            )}
            <span className={cn(line.color || 'text-zinc-300', !line.prefix && 'text-zinc-500')}>
              {line.text}
            </span>
          </motion.div>
        ))}
        {blinking && visibleLines > 0 && (
          <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-2" />
        )}
      </div>
    </div>
  )
}

/* ─────────── Floating Orbs Background ─────────── */
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-500/[0.07] rounded-full blur-[100px] animate-pulse" />
      <div className="absolute top-1/4 -left-32 w-[400px] h-[400px] bg-teal-500/[0.05] rounded-full blur-[80px]" />
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-cyan-500/[0.04] rounded-full blur-[60px]" />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}

/* ─────────── Feature Data ─────────── */
const features = [
  {
    icon: Search, title: 'Architecture Explorer', view: 'explorer' as const,
    description: 'Instantly understand complex codebases with AI-powered architecture mapping and dependency visualization.',
    gradient: 'from-emerald-500/20 to-black-500/20',
    iconColor: 'text-emerald-500',
    borderHover: 'hover:border-emerald-500/30',
    tag: 'Fast Onboarding',
  },
  {
    icon: GitBranch, title: 'Flow Tracer', view: 'flowtracer' as const,
    description: 'Chat with Bob to trace data flows across services, endpoints, and modules in your entire repository.',
    gradient: 'from-blue-500/20 to-black-500/20',
    iconColor: 'text-blue-500',
    borderHover: 'hover:border-blue-500/30',
    tag: 'Interactive',
  },
  {
    icon: Wrench, title: 'Smart Refactoring', view: 'refactor' as const,
    description: 'Auto-detect deprecated patterns, code smells, and generate atomic cross-file fixes with confidence.',
    gradient: 'from-amber-500/20 to-black-500/20',
    iconColor: 'text-amber-500',
    borderHover: 'hover:border-amber-500/30',
    tag: 'Auto-fix',
  },
  {
    icon: FileText, title: 'Docs & Test A/B', view: 'docgen' as const,
    description: 'Generate production-ready README, API docs, test suites, and inline comments — not generic templates.',
    gradient: 'from-rose-500/20 to-black-500/20',
    iconColor: 'text-rose-500',
    borderHover: 'hover:border-rose-500/30',
    tag: 'Context-Aware',
  },
  {
    icon: LayoutDashboard, title: 'Health Dashboard', view: 'dashboard' as const,
    description: 'Real-time code quality metrics, complexity trends, test coverage, and technical debt monitoring.',
    gradient: 'from-cyan-500/20 to-black-500/20',
    iconColor: 'text-cyan-500',
    borderHover: 'hover:border-cyan-500/30',
    tag: 'Live Metrics',
  },
  {
    icon: ShieldCheck, title: 'Security Scanner', view: 'security' as const,
    description: 'Detect hardcoded secrets, SQL injection, XSS, weak crypto, and OWASP Top 10 vulnerabilities with AI precision.',
    gradient: 'from-violet-500/20 to-black-500/20',
    iconColor: 'text-violet-500',
    borderHover: 'hover:border-violet-500/30',
    tag: 'OWASP Top 10',
  },
]

const howItWorks = [
  { step: 'Upload', icon: Globe, title: 'Paste or Upload Code', desc: 'Drop your codebase or paste code snippets directly into any module.' },
  { step: 'Analyze', icon: Sparkles, title: 'Bob Analyzes Everything', desc: 'Full repository context AI reads all files, dependencies, and architecture.' },
  { step: 'Insights', icon: Eye, title: 'Get Actionable Insights', desc: 'Receive architecture maps, refactoring suggestions, docs, and tests.' },
  { step: 'Deploy', icon: Workflow, title: 'Ship with Confidence', desc: 'Apply fixes, generate tests, and deploy higher-quality code faster.' },
]

const bobCapabilities = [
  { icon: Layers, title: 'Full Context', desc: 'Reads entire repos — not isolated files' },
  { icon: Search, title: 'Intent-Aware', desc: 'Understands WHY code exists' },
  { icon: Lock, title: 'Atomic Changes', desc: 'Cross-file refactoring confidence' },
  { icon: Zap, title: 'Instant Results', desc: 'Analysis in seconds, not hours' },
]

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

/* ═══════════════════════════════════════════════════════════════ */
export function HeroSection() {
  const { setCurrentView } = useAppStore()

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden bg-background relative">
      {/* Global Canvas 2D grain texture — covers entire landing page */}
      <CanvasBackground variant="landing" className="fixed inset-0 z-[1]" />

      {/* ═══ HERO ═══ */}
      <section className="relative w-full overflow-hidden pt-8 pb-4 sm:pt-12 sm:pb-8 lg:min-h-[100vh] lg:flex lg:items-center">

        <div className="relative z-10 w-full px-4 sm:px-6 md:px-12 lg:px-20 lg:py-20">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left — Copy */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <Badge variant="outline" className="mb-6 px-3 py-1 text-[11px] font-medium bg-emerald-500/[0.07] border-emerald-500/20 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                IBM BOB Hackathon 2026
              </Badge>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.1] mb-5">
                Turn Legacy Code into Clarity.{' '}
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  Stop Refactoring. Start Evolving.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
                <strong className="text-foreground">AROMA w/ IBM BOB</strong> is an Autonomous Code Architect that transcends basic assistance.
                It deciphers legacy logic to deliver actionable insights and automated refactoring—generating full documentation while ensuring mission critical reliability through deep-layer testing into
                <span className="text-emerald-600 dark:text-emerald-400 font-medium"> Your Codebase.</span>
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => setCurrentView('explorer')}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/20 px-7 h-11 text-sm font-semibold"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Start Analyzing
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentView('flowtracer')}
                  className="px-7 h-11 text-sm font-semibold border-border/60"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Try Flow Tracer
                </Button>
              </div>

              {/* Micro-stats under CTA */}
              <div className="flex items-center gap-6 mt-8">
                {[
                  { val: '50+', label: 'Files per scan' },
                  { val: '6', label: 'AI modules' },
                  { val: '< 3s', label: 'Analysis time' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-lg font-bold text-foreground">{s.val}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Terminal Demo (visible on all screen sizes) */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <TerminalMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="relative w-full px-4 sm:px-6 md:px-12 lg:px-20 py-20 bg-gradient-to-b from-emerald-100/60 via-teal-50/50 to-emerald-50/40 dark:from-emerald-950/20 dark:via-teal-950/15 dark:to-emerald-950/10">
        {/* Section grain — teal tinted */}
        <CanvasBackground variant="subtle" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <Badge variant="secondary" className="mb-3 text-[10px] font-semibold uppercase tracking-wider">How it works</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">From code to clarity in four steps</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">Bob handles the complexity so you can focus on building.</p>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step) => {
              const Icon = step.icon
              return (
                <motion.div key={step.step} variants={item} className="group text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-black-500/20 dark:from-emerald-500/30 dark:to-black/40 mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600/80 dark:text-emerald-400/80 mb-2">{step.step}</div>
                  <h3 className="text-sm font-bold mb-2">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURES SLIDER ═══ */}
      <section className="relative w-full overflow-hidden py-20 bg-gradient-to-br from-teal-50/70 via-emerald-50/50 to-cyan-50/60 dark:from-teal-950/20 dark:via-emerald-950/15 dark:to-cyan-950/12">
        {/* Section grain — module variant */}
        <CanvasBackground variant="module" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <Badge variant="secondary" className="mb-3 text-[10px] font-semibold uppercase tracking-wider">Modules</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Six AI-powered modules, one mission</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">Each module deeply leverages IBM Bob&apos;s full repository context AI — not surface-level snippets.</p>
          </motion.div>

          <div className="flex overflow-hidden mt-10">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 35 }}
              className="flex gap-16 min-w-max px-8"
            >
              {[...features, ...features].map((f, idx) => {
                const Icon = f.icon
                return (
                  <div
                    key={`${f.title}-${idx}`}
                    className="flex items-center gap-6 cursor-pointer group/feature w-[450px]"
                    onClick={() => setCurrentView(f.view)}
                  >
                    <div className={cn('w-16 h-16 rounded-3xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover/feature:scale-110 group-hover/feature:rotate-3 transition-all duration-500 flex-shrink-0', f.gradient)}>
                      <Icon className={cn('w-8 h-8', f.iconColor)} />
                    </div>
                    <div className="flex-1">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600/70 dark:text-emerald-400/70 mb-1">{f.tag}</span>
                      <h3 className="font-bold text-xl mb-2 group-hover/feature:text-emerald-600 dark:group-hover/feature:text-emerald-400 transition-colors">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{f.description}</p>
                      <div className="flex items-center text-xs font-semibold text-emerald-600/60 dark:text-emerald-400/60 group-hover/feature:text-emerald-600 dark:group-hover/feature:text-emerald-400 transition-colors mt-3">
                        <span>Open module</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover/feature:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ BOB CAPABILITIES ═══ */}
      <section className="relative w-full px-4 sm:px-6 md:px-12 lg:px-20 py-20 bg-gradient-to-br from-emerald-50/60 via-cyan-50/40 to-teal-50/60 dark:from-emerald-950/15 dark:via-cyan-950/10 dark:to-teal-950/12">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="relative overflow-hidden border-emerald-500/15 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-cyan-50/60 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-cyan-950/20">
              {/* Subtle grid */}
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <CardContent className="relative z-10 p-6 sm:p-8 md:p-10">
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-2xl font-bold mb-3">Powered by IBM Bob</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-10 max-w-2xl">
                    IBM Bob is a full repository context AI. It doesn&apos;t guess — it <strong className="text-foreground">understands</strong>. Every file, every dependency, every architectural decision is part of the analysis.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                    {bobCapabilities.map((cap) => {
                      const Icon = cap.icon
                      return (
                        <div key={cap.title} className="flex flex-col items-center text-center group">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/20 to-black-500/20 dark:from-emerald-500/30 dark:to-black/30 shadow-md flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-[5deg] transition-all duration-500">
                            <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <p className="text-base font-bold mb-2">{cap.title}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{cap.desc}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="relative w-full px-4 sm:px-6 md:px-12 lg:px-20 py-20 bg-gradient-to-br from-emerald-100/70 via-teal-100/60 to-cyan-50/60 dark:from-emerald-950/25 dark:via-teal-950/20 dark:to-cyan-950/15">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center relative z-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Ready to master your codebase?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm mb-8">
            No setup required. Paste your code and let Bob do the heavy lifting.
          </p>
          <div className="flex items-center justify-center">
            <Button
              size="lg"
              onClick={() => setCurrentView('explorer')}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/20 px-8 h-11 text-sm font-semibold"
            >
              <Terminal className="w-4 h-4 mr-2" />
              Open Code Explorer
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative px-4 sm:px-6 md:px-12 py-16 bg-gradient-to-b from-emerald-50/40 to-emerald-100/30 dark:from-emerald-950/15 dark:to-emerald-950/20">
        <div className="max-w-5xl mx-auto">
          {/* Footer columns — centered */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-center">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">Product</h4>
              <ul className="space-y-2.5">
                {['Code Explorer', 'Flow Tracer', 'Smart Refactor', 'Doc Generator'].map(item => (
                  <li key={item}><span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">Features</h4>
              <ul className="space-y-2.5">
                {['Security Scanner', 'Health Dashboard', 'AI Analysis', 'Auto Testing'].map(item => (
                  <li key={item}><span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">Company</h4>
              <ul className="space-y-2.5">
                {['About', 'Blog', 'Careers', 'Contact'].map(item => (
                  <li key={item}><span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Licenses'].map(item => (
                  <li key={item}><span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{item}</span></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar — fully centered */}
          <div className="pt-8 border-t border-emerald-200/30 dark:border-emerald-800/20 text-center">
            <p className="text-[11px] text-muted-foreground mb-1">
              Built for IBM Bob Hackathon 2026 — Turn ideas into impact, faster.
            </p>
            <p className="text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} Greyscope&amp;Co. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
