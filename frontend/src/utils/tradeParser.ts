import type { ParsedTrade, TradeStep } from '@/types/draft'

export function parseDraftTrade(tradeString: string | null): ParsedTrade | null {
  if (!tradeString || tradeString.trim() === '') {
    return null
  }

  const steps: TradeStep[] = []
  const parts = tradeString.split(' to ')

  for (let i = 0; i < parts.length - 1; i++) {
    const from = parts[i]?.trim().split(' ').pop() || ''
    const to = parts[i + 1]?.trim().split(' ')[0] || ''

    if (from && to) {
      steps.push({ from, to })
    }
  }

  const finalTeam = steps[steps.length - 1]?.to || ''

  return {
    original: tradeString,
    steps,
    finalTeam
  }
}
