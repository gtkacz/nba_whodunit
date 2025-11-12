export interface Team {
  abbreviation: string
  name?: string
  logoUrl: string
}

export type TeamAbbreviation =
  | 'ATL' | 'BKN' | 'BOS' | 'CHI' | 'CHA' | 'CLE' | 'DAL' | 'DEN' | 'DET' | 'GSW'
  | 'HOU' | 'IND' | 'LAC' | 'LAL' | 'MEM' | 'MIA' | 'MIL' | 'MIN' | 'NOP' | 'NYK'
  | 'OKC' | 'ORL' | 'PHI' | 'PHX' | 'POR' | 'SAC' | 'SAS' | 'TOR' | 'UTA' | 'WAS'
