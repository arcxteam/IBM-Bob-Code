import { NextRequest, NextResponse } from 'next/server'
import { analyzeWithWatsonx, extractJSON } from '@/lib/watsonx'

interface SecurityFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'injection' | 'auth' | 'crypto' | 'config' | 'dependency' | 'data' | 'error';
  title: string;
  description: string;
  file: string;
  line: number;
  code: string;
  recommendation: string;
  cwe: string;
}

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const systemPrompt = `You are an expert security auditor specializing in application security and OWASP Top 10 vulnerabilities. Analyze the provided code for security vulnerabilities and respond with ONLY a valid JSON array of findings. No markdown, no explanation, no code fences — pure JSON array only.

Each finding object must have:
{
  "id": "unique string id like 'VULN-001'",
  "severity": "critical" | "high" | "medium" | "low" | "info",
  "category": "injection" | "auth" | "crypto" | "config" | "dependency" | "data" | "error",
  "title": "vulnerability title",
  "description": "what the vulnerability is and why it's dangerous",
  "file": "filename where found",
  "line": line number as integer,
  "code": "the vulnerable code snippet",
  "recommendation": "specific fix recommendation with example if possible",
  "cwe": "CWE-XXX"
}

Check for (OWASP Top 10 + common vulnerabilities):
- CRITICAL: SQL injection (CWE-89), command injection (CWE-77), RCE via eval() (CWE-95)
- CRITICAL: Hardcoded credentials/API keys (CWE-798), hardcoded passwords (CWE-259)
- HIGH: XSS — reflected, stored, DOM-based (CWE-79)
- HIGH: Path traversal — ../ in file operations (CWE-22)
- HIGH: Insecure deserialization (CWE-502)
- HIGH: Weak cryptography — MD5, DES, SHA1 for passwords (CWE-327)
- HIGH: Broken authentication — missing auth checks, JWT issues (CWE-287)
- MEDIUM: Missing input validation (CWE-20)
- MEDIUM: Sensitive data exposure in logs or error messages (CWE-209)
- MEDIUM: CSRF vulnerabilities (CWE-352)
- LOW: Missing security headers
- LOW: Verbose error messages exposing stack traces
- INFO: Dependencies that should be updated

Provide ALL findings you detect. If code is clean, return an empty array [].`

    const raw = await analyzeWithWatsonx(systemPrompt, code, {
      temperature: 0.05,
      maxNewTokens: 2000,
    })

    const findings = extractJSON<SecurityFinding[]>(raw)

    if (findings && Array.isArray(findings)) {
      const severityWeights: Record<string, number> = { critical: 25, high: 15, medium: 8, low: 3, info: 0 }
      const totalPenalty = findings.reduce((sum, f) => sum + (severityWeights[f.severity] ?? 0), 0)
      const score = Math.max(0, 100 - totalPenalty)
      return NextResponse.json({ findings, score })
    }

    return NextResponse.json({ findings: [], score: 100 })
  } catch (error) {
    console.error('Security scan error:', error)
    return NextResponse.json({ error: 'Failed to scan for vulnerabilities' }, { status: 500 })
  }
}
