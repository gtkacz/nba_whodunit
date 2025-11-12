/**
 * Get a data file URL that respects the base URL for GitHub Pages deployment
 * @param path - The path relative to the data folder (e.g., 'teams.json' or 'csv/ATL.csv')
 * @returns The full URL with base URL prefix
 */
export function getDataUrl(path: string): string {
  const base = import.meta.env.BASE_URL
  // Remove trailing slash from base if present, then add data path
  const basePath = base.endsWith('/') ? base.slice(0, -1) : base
  return `${basePath}/data/${path}`
}

