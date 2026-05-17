/**
 * Health Check Endpoint
 * AROMA — AI-powered Repository & Object Model Analyzer
 * IBM Bob Hackathon 2026
 *
 * This endpoint verifies IBM watsonx.ai connectivity and returns system status.
 * Used for monitoring, deployment validation, and debugging.
 */

import { NextResponse } from "next/server";
import { callWatsonx } from "@/lib/watsonx";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * 
 * Checks IBM watsonx.ai connectivity by sending a minimal test prompt.
 * Returns system status including model ID and timestamp.
 * 
 * @returns {
 *   status: 'ok' | 'error',
 *   watsonx: 'connected' | 'disconnected',
 *   model: string,
 *   timestamp: string,
 *   error?: string
 * }
 */
export async function GET() {
  try {
    // Verify watsonx.ai connectivity with a minimal test prompt
    await callWatsonx(
      [
        {
          role: "system",
          content: "You are a health check assistant.",
        },
        {
          role: "user",
          content: "Respond with 'OK' if you can read this message.",
        },
      ],
      {
        maxNewTokens: 10,
        temperature: 0.1,
      }
    );

    return NextResponse.json({
      status: "ok",
      watsonx: "connected",
      model: process.env.WATSONX_MODEL_ID ?? "ibm/granite-4-h-small",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[health] watsonx.ai connectivity check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        watsonx: "disconnected",
        model: process.env.WATSONX_MODEL_ID ?? "ibm/granite-4-h-small",
        timestamp: new Date().toISOString(),
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during health check",
      },
      { status: 503 }
    );
  }
}
