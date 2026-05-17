import { execSync } from "child_process";
import { writeFileSync, mkdirSync, existsSync, appendFileSync } from "fs";
import { join } from "path";

const SESSIONS_DIR = join(__dirname, "sessions");
const LOG_FILE = join(__dirname, "bob-proxy.log");

if (!existsSync(SESSIONS_DIR)) mkdirSync(SESSIONS_DIR, { recursive: true });

interface BobProxyOptions {
  maxCoins?: number;
  chatMode?: "advanced" | "code" | "ask" | "plan";
  approvalMode?: "default" | "auto_edit" | "yolo";
  timeout?: number;
}

interface BobProxyResult {
  success: boolean;
  output: string;
  coinsUsed?: number;
  sessionId?: string;
  error?: string;
  duration: number;
  fallback: boolean;
}

function log(msg: string) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  appendFileSync(LOG_FILE, line);
  console.log(line.trim());
}

export function runBobShell(
  prompt: string,
  options: BobProxyOptions = {}
): BobProxyResult {
  const {
    maxCoins = 5,
    chatMode = "advanced",
    approvalMode = "default",
    timeout = 60000,
  } = options;

  const startTime = Date.now();

  const sessionId = `bob-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const sessionFile = join(SESSIONS_DIR, `${sessionId}.json`);

  const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/`/g, "\\`");
  const cmd = `bob --chat-mode ${chatMode} --approval-mode ${approvalMode} --max-coins ${maxCoins} -o json -p "${escapedPrompt}"`;

  log(`[BOB-PROXY] Starting session ${sessionId}`);
  log(`[BOB-PROXY] Command: bob --chat-mode ${chatMode} --max-coins ${maxCoins}`);

  try {
    const projectRoot = join(__dirname, "..");
    const output = execSync(cmd, {
      cwd: projectRoot,
      timeout,
      maxBuffer: 10 * 1024 * 1024,
      encoding: "utf-8",
    });

    const duration = Date.now() - startTime;

    const result: BobProxyResult = {
      success: true,
      output: output.trim(),
      sessionId,
      duration,
      fallback: false,
    };

    writeFileSync(sessionFile, JSON.stringify(result, null, 2));
    log(`[BOB-PROXY] Success: ${sessionId} (${duration}ms)`);

    return result;
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const errMsg = error instanceof Error ? error.message : String(error);

    log(`[BOB-PROXY] Failed: ${sessionId} - ${errMsg.slice(0, 200)}`);

    const result: BobProxyResult = {
      success: false,
      output: "",
      sessionId,
      error: errMsg,
      duration,
      fallback: true,
    };

    writeFileSync(sessionFile, JSON.stringify(result, null, 2));

    return result;
  }
}

export { SESSIONS_DIR, LOG_FILE };
