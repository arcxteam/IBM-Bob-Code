const BOB_PROXY_URL = process.env.BOB_PROXY_URL || ""

function extractBobOutput(raw: string): string {
  const markers = raw.split("---output---")
  if (markers.length < 2) return raw
  const content = markers.slice(1, -1).join("---output---").trim()
  const firstBracket = content.search(/[\[{]/)
  if (firstBracket === -1) return content
  const sub = content.slice(firstBracket)
  const isOpen = sub[0] === "["
  const open = isOpen ? "[" : "{"
  const close = isOpen ? "]" : "}"
  let depth = 0
  for (let i = 0; i < sub.length; i++) {
    if (sub[i] === open) depth++
    if (sub[i] === close) depth--
    if (depth === 0) return sub.slice(0, i + 1)
  }
  return sub
}

export async function callBobProxy(
  prompt: string,
  options?: { chatMode?: string; maxCoins?: number }
): Promise<{ output: string; success: boolean }> {
  if (!BOB_PROXY_URL) {
    console.log("[bob-proxy] No BOB_PROXY_URL configured, skipping proxy")
    return { output: "", success: false }
  }

  console.log("[bob-proxy] Attempting Bob Proxy:", BOB_PROXY_URL)

  try {
    const res = await fetch(`${BOB_PROXY_URL}/api/bob`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no code fences.`,
        chatMode: options?.chatMode || "advanced",
        maxCoins: options?.maxCoins || 3,
      }),
      signal: AbortSignal.timeout(90000),
    })

    if (!res.ok) {
      console.error("[bob-proxy] HTTP error:", res.status)
      return { output: "", success: false }
    }

    const data = await res.json()
    if (data.success && data.output) {
      const cleaned = extractBobOutput(data.output)
      console.log("[bob-proxy] Success via Bob Shell, session:", data.sessionId)
      return { output: cleaned, success: true }
    }

    console.error("[bob-proxy] No output from Bob Shell:", data.error || "unknown")
    return { output: "", success: false }
  } catch (err) {
    console.error("[bob-proxy] Connection failed:", err instanceof Error ? err.message : err)
    return { output: "", success: false }
  }
}
