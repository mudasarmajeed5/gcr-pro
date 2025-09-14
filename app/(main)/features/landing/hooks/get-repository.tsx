"use client"

import { useEffect, useState } from "react"

type RepoStats = {
    stars: number
    forks: number
    contributors: number
}

type UseGetRepositoryResult = {
    data: RepoStats | null
    loading: boolean
}

export default function useGetRepository(
    owner: string = "mudasarmajeed5",
    repo: string = "gcr-pro"
): UseGetRepositoryResult {
    const [data, setData] = useState<RepoStats | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchRepoData = async () => {
            try {
                setLoading(true)

                const [repoRes, contributorsRes] = await Promise.all([
                    fetch(`https://api.github.com/repos/${owner}/${repo}`),
                    fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=1`)
                ])

                if (!repoRes.ok) throw new Error("Failed to fetch repository data.")
                if (!contributorsRes.ok) throw new Error("Failed to fetch contributors data.")

                const repoData = await repoRes.json()
                const linkHeader = contributorsRes.headers.get("Link")

                const contributorsCount = linkHeader
                    ? extractTotalFromLinkHeader(linkHeader)
                    : 1

                setData({
                    stars: repoData.stargazers_count,
                    forks: repoData.forks_count,
                    contributors: contributorsCount,
                })
            } catch (err) {
                console.error(`${(err as Error).message || "Unknown error"}`)
            } finally {
                setLoading(false)
            }
        }

        fetchRepoData()
    }, [owner, repo])

    return { data, loading }
}

function extractTotalFromLinkHeader(linkHeader: string): number {
    const match = linkHeader.match(/&page=(\d+)>; rel="last"/)
    return match ? parseInt(match[1], 10) : 1
}
