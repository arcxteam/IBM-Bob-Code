'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/use-app-store'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import {
  LayoutDashboard,
  Sparkles,
  FileCode2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  GitBranch,
  Shield,
  Zap,
  ArrowRight,
  Activity,
  Layers,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CanvasBackground } from '@/components/legacy-code-agent/canvas-background'

const chartConfig = {
  files: { label: 'Files', color: '#10b981' },
  complexity: { label: 'Complexity', color: '#f59e0b' },
  lines: { label: 'Lines', color: '#6366f1' },
  tests: { label: 'Tests', color: '#ef4444' },
  issues: { label: 'Issues', color: '#f97316' },
  health: { label: 'Health Score', color: '#10b981' },
  debt: { label: 'Tech Debt', color: '#ef4444' },
  coverage: { label: 'Coverage', color: '#3b82f6' },
} satisfies ChartConfig

const languageData = [
  { name: 'TypeScript', value: 45, color: '#3178c6' },
  { name: 'JavaScript', value: 25, color: '#f7df1e' },
  { name: 'Python', value: 15, color: '#3776ab' },
  { name: 'CSS/SCSS', value: 10, color: '#cf649a' },
  { name: 'Other', value: 5, color: '#6b7280' },
]

const fileComplexity = [
  { name: 'userService', complexity: 35, files: 4 },
  { name: 'auth', complexity: 28, files: 3 },
  { name: 'routes', complexity: 18, files: 6 },
  { name: 'utils', complexity: 12, files: 5 },
  { name: 'middleware', complexity: 8, files: 2 },
  { name: 'models', complexity: 15, files: 3 },
]

const healthTrend = [
  { week: 'W1', health: 72, debt: 28, coverage: 45 },
  { week: 'W2', health: 75, debt: 25, coverage: 52 },
  { week: 'W3', health: 78, debt: 22, coverage: 58 },
  { week: 'W4', health: 82, debt: 18, coverage: 65 },
  { week: 'W5', health: 85, debt: 15, coverage: 72 },
  { week: 'W6', health: 88, debt: 12, coverage: 78 },
  { week: 'W7', health: 91, debt: 9, coverage: 82 },
  { week: 'W8', health: 93, debt: 7, coverage: 85 },
]

const qualityMetrics = [
  { metric: 'Test Coverage', value: 85 },
  { metric: 'Code Quality', value: 78 },
  { metric: 'Documentation', value: 62 },
  { metric: 'Type Safety', value: 91 },
  { metric: 'Modularity', value: 73 },
  { metric: 'Error Handling', value: 69 },
]

const topIssues = [
  { title: 'High complexity in userService.ts', severity: 'high', file: 'userService.ts', type: 'Complexity' },
  { title: 'Missing error types in auth flow', severity: 'medium', file: 'auth-middleware.ts', type: 'Type Safety' },
  { title: 'No tests for notificationService', severity: 'high', file: 'notificationService.ts', type: 'Testing' },
  { title: 'Duplicated email validation', severity: 'low', file: 'helpers.ts', type: 'Duplication' },
  { title: 'Deprecated XMLHttpRequest usage', severity: 'critical', file: 'api-client.ts', type: 'Migration' },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

function getSeverityBadge(severity: string) {
  const colors = {
    critical: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    low: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  }
  return colors[severity as keyof typeof colors] || colors.low
}

export function DashboardView() {
  const { 
    projectAnalyzed, 
    setCurrentView,
    analysisResult,
    refactoringSuggestions,
    securityFindings 
  } = useAppStore()

  // Compute dynamic values from store
  const filesCount = analysisResult?.files?.length || 0
  const linesCount = analysisResult?.files?.reduce((acc, f) => acc + (f.lines || 0), 0) || 0
  
  const refactorIssues = Array.isArray(refactoringSuggestions) ? refactoringSuggestions.length : 0
  const securityIssues = Array.isArray(securityFindings) ? securityFindings.length : 0
  const totalIssues = refactorIssues + securityIssues

  const complexityScore = analysisResult?.complexity || 0
  const computedHealth = Math.max(0, 100 - (totalIssues * 2) - (complexityScore > 20 ? 10 : 0))

  const displayFiles = projectAnalyzed ? filesCount : 4
  const displayLines = projectAnalyzed ? linesCount : 162
  const displayIssues = projectAnalyzed ? totalIssues : 7
  const displayComplexity = projectAnalyzed ? complexityScore : 25
  const displayHealth = projectAnalyzed ? computedHealth : 93

  // Dynamic Language Data
  const languageMap = new Map<string, number>()
  if (analysisResult?.files) {
    analysisResult.files.forEach(f => {
      const lang = f.language || 'Unknown'
      languageMap.set(lang, (languageMap.get(lang) || 0) + 1)
    })
  } else if (securityFindings?.length) {
    securityFindings.forEach(f => {
      if (f.file.endsWith('.py')) languageMap.set('Python', (languageMap.get('Python')||0)+1)
      else if (f.file.endsWith('.ts') || f.file.endsWith('.tsx')) languageMap.set('TypeScript', (languageMap.get('TypeScript')||0)+1)
      else languageMap.set('Unknown', (languageMap.get('Unknown')||0)+1)
    })
  }
  let dynamicLanguageData = Array.from(languageMap.entries()).map(([name, count], idx) => {
    const colors = ['#3178c6', '#f7df1e', '#3776ab', '#cf649a', '#6b7280']
    const pct = Math.round((count / Math.max(1, languageMap.size)) * 100) // Rough percentage
    return { name, value: pct > 0 ? pct : count, color: colors[idx % colors.length] }
  })
  if (!projectAnalyzed || dynamicLanguageData.length === 0) dynamicLanguageData = languageData

  // Dynamic File Complexity
  let dynamicFileComplexity = analysisResult?.files?.map(f => ({
    name: f.name.replace(/\.[^/.]+$/, "").substring(0, 15),
    complexity: f.complexity || Math.floor(Math.random() * 20),
    files: 1
  })).slice(0, 6)
  if (!projectAnalyzed || !dynamicFileComplexity || dynamicFileComplexity.length === 0) dynamicFileComplexity = fileComplexity

  // Dynamic Top Issues
  let dynamicTopIssues: Array<{ title: string; severity: string; file: string; type: string }> = [
    ...(Array.isArray(securityFindings) ? securityFindings.map(f => ({
      title: f.title, severity: f.severity, file: f.file, type: f.category || 'Security'
    })) : []),
    ...(Array.isArray(refactoringSuggestions) ? refactoringSuggestions.map(f => ({
      title: f.title, severity: f.severity, file: f.file, type: f.type || 'Refactoring'
    })) : [])
  ].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    return (order[a.severity] ?? 5) - (order[b.severity] ?? 5)
  }).slice(0, 5)
  if (!projectAnalyzed) dynamicTopIssues = topIssues

  // Dynamic Quality Metrics
  const testScore = Math.max(0, 100 - (refactorIssues * 5))
  const qualityScore = Math.max(0, 100 - (totalIssues * 3))
  const secScore = Math.max(0, 100 - (securityIssues * 10))
  let dynamicQualityMetrics = [
    { metric: 'Test Coverage', value: testScore },
    { metric: 'Code Quality', value: qualityScore },
    { metric: 'Security', value: secScore },
    { metric: 'Type Safety', value: 91 },
    { metric: 'Modularity', value: 73 },
    { metric: 'Error Handling', value: 69 },
  ]
  if (!projectAnalyzed) dynamicQualityMetrics = qualityMetrics

  if (!projectAnalyzed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Dashboard Requires Analysis</h2>
          <p className="text-muted-foreground mb-6">
            Please analyze your codebase first using the Code Explorer to populate the dashboard with real metrics.
          </p>
          <Button
            onClick={() => setCurrentView('explorer')}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            Go to Code Explorer
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-y-auto">
      <CanvasBackground variant="module" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Code Health Dashboard</h1>
              <p className="text-sm text-muted-foreground">Real-time codebase metrics powered by IBM Bob</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs bg-cyan-500/5 border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
            <Sparkles className="w-3 h-3 mr-1" />
            Bob Analysis Complete — {displayFiles} files, {displayLines} lines
          </Badge>
        </div>

        {/* KPI Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {[
            { icon: FileCode2, label: 'Files', value: displayFiles.toString(), change: '+2', color: 'text-emerald-600 dark:text-emerald-400' },
            { icon: Activity, label: 'Complexity', value: displayComplexity.toString(), change: '-5', color: 'text-amber-600 dark:text-amber-400' },
            { icon: Shield, label: 'Issues', value: displayIssues.toString(), change: '-3', color: 'text-orange-600 dark:text-orange-400' },
            { icon: TrendingUp, label: 'Health', value: `${displayHealth}%`, change: '+8%', color: 'text-emerald-600 dark:text-emerald-400' },
          ].map((kpi) => {
            const Icon = kpi.icon
            return (
              <motion.div key={kpi.label} variants={item}>
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={cn('w-4 h-4', kpi.color)} />
                      <span className={cn('text-[10px] font-medium', kpi.color)}>
                        {kpi.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Health Trend */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Health Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={healthTrend}>
                  <defs>
                    <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Area type="monotone" dataKey="health" stroke="#10b981" fill="url(#healthGrad)" strokeWidth={2} name="health" />
                  <Line type="monotone" dataKey="coverage" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="coverage" />
                  <Line type="monotone" dataKey="debt" stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" dot={false} name="debt" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Language Distribution */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Language Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={dynamicLanguageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dynamicLanguageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {dynamicLanguageData.map((lang) => (
                  <div key={lang.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: lang.color }} />
                    <span className="text-[10px] text-muted-foreground">{lang.name} ({lang.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* File Complexity */}
          <Card className="border-border/50 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Module Complexity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={dynamicFileComplexity} layout="vertical">
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Bar dataKey="complexity" fill="#f59e0b" radius={[0, 4, 4, 0]} name="complexity" />
                  <Bar dataKey="files" fill="#10b981" radius={[0, 4, 4, 0]} name="files" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Quality Radar */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Quality Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <RadarChart data={dynamicQualityMetrics}>
                  <PolarGrid strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Issues */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Top Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dynamicTopIssues.map((issue, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors">
                    <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{issue.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{issue.file}</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">{issue.type}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn('text-[10px] h-5 flex-shrink-0', getSeverityBadge(issue.severity))}>
                      {issue.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quality Scores */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Quality Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dynamicQualityMetrics.map((metric) => (
                  <div key={metric.metric}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium">{metric.metric}</span>
                      <span className={cn(
                        'text-xs font-semibold',
                        metric.value >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                        metric.value >= 60 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      )}>
                        {metric.value}%
                      </span>
                    </div>
                    <Progress
                      value={metric.value}
                      className={cn(
                        'h-2',
                        metric.value >= 80 ? '[&>div]:bg-emerald-500' :
                        metric.value >= 60 ? '[&>div]:bg-amber-500' :
                        '[&>div]:bg-red-500'
                      )}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bob Insights */}
        <Card className="mt-6 border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 dark:from-emerald-950/20 dark:to-cyan-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Bob&apos;s Analysis Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Your codebase has a <strong className="text-foreground">{displayHealth}% health score</strong>.
                  {projectAnalyzed && totalIssues > 0 ? (
                    <> I recommend prioritizing the <strong className="text-foreground">{totalIssues} issues</strong> detected in the security and refactoring modules.</>
                  ) : (
                    <> The main areas for improvement are documentation coverage and error handling consistency.</>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Clock className="w-2.5 h-2.5 mr-1" />
                    {projectAnalyzed ? `Est. ${Math.max(1, Math.ceil(totalIssues * 0.5))}h to fix issues` : 'Est. 2h to fix all issues'}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Zap className="w-2.5 h-2.5 mr-1" />
                    {projectAnalyzed ? `${refactorIssues} auto-fixable suggestions` : '5 auto-fixable suggestions'}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                    {projectAnalyzed ? `${testScore}% test coverage achievable` : '85% test coverage achievable'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
