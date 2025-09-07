import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateClientOid(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

export function formatCurrency(amount: string | number, currency: string = 'USDT'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return `${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${currency}`
}

export function truncateString(str: string, length: number = 10): string {
  if (str.length <= length) return str
  return `${str.substring(0, length)}...`
}

export function formatApiKey(key: string): string {
  if (key.length <= 16) return key
  return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`
}

export function validateApiKeyLabel(label: string): boolean {
  return label.length >= 4 && label.length <= 32
}

export function validateIpAddress(ip: string): boolean {
  const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipPattern.test(ip)
}

export function parseIpList(ipText: string): string[] {
  return ipText
    .split('\n')
    .map(ip => ip.trim())
    .filter(ip => ip.length > 0)
    .filter(validateIpAddress)
    .slice(0, 20)
}