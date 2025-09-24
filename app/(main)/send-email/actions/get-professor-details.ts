'use server'

import { google } from "googleapis"
import { auth } from "@/auth"

export interface Professor {
  courseId: string
  courseName: string
  id: string
  name: string
  email: string
}

// Cache setup
const professorsCache = new Map<string, { data: Professor[]; timestamp: number }>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes (professors change rarely)

// Cache helper functions
function getCachedProfessors(userId: string): Professor[] | null {
  const cached = professorsCache.get(userId)
  if (!cached) return null
  
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    professorsCache.delete(userId)
    return null
  }
  
  return cached.data
}

function setCachedProfessors(userId: string, data: Professor[]) {
  professorsCache.set(userId, { data, timestamp: Date.now() })
}

function generateEmailFromName(fullName: string): string {
  if (!fullName) return "unknown@students.au.edu.pk"

  let parts = fullName.trim().toLowerCase().split(/\s+/)

  // remove prefixes like Mr, Ms, Mrs, Dr, Prof
  const prefixes = ["mr", "mr.", "ms.", "ms", "mrs", "dr", "dr.", "prof", "sir", "madam", "muhammad"]
  if (prefixes.includes(parts[0])) {
    parts = parts.slice(1)
  }

  if (parts.length === 1) {
    return `${parts[0]}@students.au.edu.pk`
  }

  if (parts.length >= 2) {
    return `${parts[0]}.${parts[1]}@students.au.edu.pk`
  }

  return "unknown@students.au.edu.pk"
}

export async function getAllProfessors(): Promise<Professor[]> {
  const session = await auth()

  if (!session?.accessToken) {
    throw new Error("No valid session or access token found. Please log in with Google.")
  }

  const userId = session.user?.id || session.user?.email || 'default'
  
  // Check cache first
  const cachedData = getCachedProfessors(userId)
  if (cachedData) {
    return cachedData
  }

  console.log(`🔄 Fetching fresh professors data for user: ${userId}`)

  // Setup OAuth client
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: session.accessToken })

  const classroom = google.classroom({ version: "v1", auth: oauth2Client })

  try {
    // Step 1: Get all ACTIVE courses the student is enrolled in
    const { data: { courses = [] } } = await classroom.courses.list({
      courseStates: ["ACTIVE"],
    })

    if (!courses.length) {
      const emptyResult: Professor[] = []
      setCachedProfessors(userId, emptyResult)
      return emptyResult
    }

    // Step 2: Fetch teachers for all courses in parallel
    const teacherRequests = courses.map(async (course) => {
      try {
        const { data: { teachers = [] } } = await classroom.courses.teachers.list({
          courseId: course.id!,
        })

        return teachers.map((t) => {
          const fullName = t.profile?.name?.fullName ?? "Unknown"
          return {
            courseId: course.id!,
            courseName: course.name ?? "Unknown Course",
            id: t.userId ?? "",
            name: fullName,
            email: generateEmailFromName(fullName),
          }
        })
      } catch (error) {
        console.warn(`Failed to fetch teachers for course ${course.id}:`, error)
        return []
      }
    })

    // Step 3: Wait for all requests
    const results = await Promise.all(teacherRequests)

    // Step 4: Flatten results into one array
    const professors = results.flat()
    
    // Cache the results
    setCachedProfessors(userId, professors)
    
    return professors

  } catch (error) {
    console.error("Error fetching professors:", error)
    throw new Error("Failed to fetch professors data")
  }
}