/**
 * Derived from pinguarmy/ai-chat-exporter, MIT.
 * Copyright (c) 2024 AI Chat Exporter Contributors.
 * Source d760b045dd19ae17af4f21c7765e1c14e5d29671: src/lib/filename.ts.
 * Changes: JavaScript only; consumers apply an additional path/device-name guard.
 * Full license: lib/licenses/pinguarmy-ai-chat-exporter.txt.
 */
const WINDOWS_RESERVED_BASENAMES = new Set([
  'con', 'prn', 'aux', 'nul',
  ...Array.from({ length: 9 }, (_, i) => `com${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `lpt${i + 1}`),
]);
export function sanitizeFilename(text) {
  const sanitized = String(text || '')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^\.+/, '')
    .replace(/[.\s]+$/, '')
    .substring(0, 200)
    .replace(/[.\s]+$/, '');
  return sanitized.split('-')
    .map(segment => WINDOWS_RESERVED_BASENAMES.has(segment.toLowerCase()) ? `_${segment}` : segment)
    .join('-');
}
