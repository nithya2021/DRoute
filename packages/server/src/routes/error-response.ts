import { Response } from 'express';

export function serverError(res: Response, context: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${context}]`, message);
  res.status(500).json({ error: context, details: message });
}
