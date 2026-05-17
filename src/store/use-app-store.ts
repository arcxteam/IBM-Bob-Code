import { create } from 'zustand'

export type AppView = 'hero' | 'explorer' | 'flowtracer' | 'refactor' | 'docgen' | 'dashboard' | 'security'

export interface AnalysisResult {
  architecture: string
  dependencies: string[]
  complexity: number
  files: FileAnalysis[]
  suggestions: string[]
}

export interface FileAnalysis {
  name: string
  path: string
  language: string
  lines: number
  complexity: number
  functions: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface RefactorSuggestion {
  id: string
  type: 'pattern' | 'boilerplate' | 'migration' | 'optimization'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  code: string
  suggestion: string
  file: string
  line: number
}

export interface GeneratedDoc {
  id: string
  type: 'readme' | 'api-doc' | 'test' | 'comment'
  title: string
  content: string
  language?: string
}

interface AppState {
  currentView: AppView
  setCurrentView: (view: AppView) => void

  codeInput: string
  setCodeInput: (code: string) => void
  isAnalyzing: boolean
  setIsAnalyzing: (val: boolean) => void
  analysisResult: AnalysisResult | null
  setAnalysisResult: (result: AnalysisResult | null) => void
  selectedFile: string | null
  setSelectedFile: (file: string | null) => void

  chatMessages: ChatMessage[]
  addChatMessage: (message: ChatMessage) => void
  clearChatMessages: () => void
  isChatLoading: boolean
  setIsChatLoading: (val: boolean) => void

  refactoringSuggestions: RefactorSuggestion[]
  setRefactoringSuggestions: (suggestions: RefactorSuggestion[]) => void
  isRefactoring: boolean
  setIsRefactoring: (val: boolean) => void

  generatedDocs: GeneratedDoc[]
  setGeneratedDocs: (docs: GeneratedDoc[] | ((prev: GeneratedDoc[]) => GeneratedDoc[])) => void
  isGenerating: boolean
  setIsGenerating: (val: boolean) => void

  projectAnalyzed: boolean
  setProjectAnalyzed: (val: boolean) => void

  securityFindings: SecurityFinding[]
  setSecurityFindings: (findings: SecurityFinding[] | ((prev: SecurityFinding[]) => SecurityFinding[])) => void
  isSecurityScanning: boolean
  setIsSecurityScanning: (val: boolean) => void
}

export interface SecurityFinding {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  category: 'injection' | 'auth' | 'crypto' | 'config' | 'dependency' | 'data' | 'error'
  title: string
  description: string
  file: string
  line: number
  code: string
  recommendation: string
  cwe?: string
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'hero',
  setCurrentView: (view) => set({ currentView: view }),

  codeInput: '',
  setCodeInput: (code) => set({ codeInput: code }),
  isAnalyzing: false,
  setIsAnalyzing: (val) => set({ isAnalyzing: val }),
  analysisResult: null,
  setAnalysisResult: (result) => set({ analysisResult: result }),
  selectedFile: null,
  setSelectedFile: (file) => set({ selectedFile: file }),

  chatMessages: [],
  addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  clearChatMessages: () => set({ chatMessages: [] }),
  isChatLoading: false,
  setIsChatLoading: (val) => set({ isChatLoading: val }),

  refactoringSuggestions: [],
  setRefactoringSuggestions: (suggestions) => set({ refactoringSuggestions: suggestions }),
  isRefactoring: false,
  setIsRefactoring: (val) => set({ isRefactoring: val }),

  generatedDocs: [],
  setGeneratedDocs: (docs) => set((state) => ({ generatedDocs: typeof docs === 'function' ? docs(state.generatedDocs) : docs })),
  isGenerating: false,
  setIsGenerating: (val) => set({ isGenerating: val }),

  projectAnalyzed: false,
  setProjectAnalyzed: (val) => set({ projectAnalyzed: val }),

  securityFindings: [],
  setSecurityFindings: (findings) => set((state) => ({ securityFindings: typeof findings === 'function' ? findings(state.securityFindings) : findings })),
  isSecurityScanning: false,
  setIsSecurityScanning: (val) => set({ isSecurityScanning: val }),
}))
