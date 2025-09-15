import { useState, useEffect } from 'react'

interface LanguageStat {
  language: string;
  bytes: number;
  percentage: number;
  lines: number;
}

interface LanguageStats {
  totalBytes: number;
  totalLines: number;
  languages: LanguageStat[];
}

interface RepoData {
  stars: number;
  forks: number;
  contributors: number;
  languages?: LanguageStats;
}

const useGetRepository = () => {
  const [data, setData] = useState<RepoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const owner = 'mudasarmajeed5'
  const repo = 'gcr-pro'
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`

  const fetchLanguageStats = async (): Promise<LanguageStats | null> => {
    try {
      const response = await fetch(`${baseUrl}/languages`)
      const languages = await response.json()
      
      if (!response.ok) {
        throw new Error('Failed to fetch language stats')
      }

      // Calculate total bytes
      const totalBytes = Object.values(languages as Record<string, number>).reduce(
        (sum: number, bytes: number) => sum + bytes, 
        0
      )
      
      // Convert to array with percentages and format
      const languageStats: LanguageStat[] = Object.entries(languages as Record<string, number>)
        .map(([language, bytes]) => ({
          language,
          bytes,
          percentage: parseFloat(((bytes / totalBytes) * 100).toFixed(1)),
          lines: Math.round(bytes / 30) // Rough estimate: ~25 characters per line
        }))
        .sort((a, b) => b.bytes - a.bytes) // Sort by bytes (descending)

      return {
        totalBytes,
        totalLines: Math.round(totalBytes / 30),
        languages: languageStats
      }
    } catch (error) {
      console.error('Error fetching language stats:', error)
      return null
    }
  }

  const fetchBasicStats = async () => {
    try {
      const response = await fetch(baseUrl)
      const repoInfo = await response.json()
      
      if (!response.ok) {
        throw new Error('Failed to fetch repository data')
      }

      return {
        stars: repoInfo.stargazers_count || 0,
        forks: repoInfo.forks_count || 0,
      }
    } catch (error) {
      console.error('Error fetching basic stats:', error)
      return { stars: 0, forks: 0 }
    }
  }

  const fetchContributors = async (): Promise<number> => {
    try {
      const response = await fetch(`${baseUrl}/contributors`)
      const contributors = await response.json()
      
      if (!response.ok) {
        throw new Error('Failed to fetch contributors')
      }

      return Array.isArray(contributors) ? contributors.length : 0
    } catch (error) {
      console.error('Error fetching contributors:', error)
      return 0
    }
  }

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [basicStats, contributorsCount, languageStats] = await Promise.all([
        fetchBasicStats(),
        fetchContributors(),
        fetchLanguageStats()
      ])

      const repoData: RepoData = {
        ...basicStats,
        contributors: contributorsCount,
        ...(languageStats && { languages: languageStats })
      }

      setData(repoData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching repository data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  return { data, loading, error, refetch: fetchAllData }
}

export default useGetRepository