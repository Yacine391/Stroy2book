import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple in-memory autosave store (to be replaced by backend or localStorage)
type Project = {
  id: string
  title: string
  author: string
  content: string
  updatedAt: number
}

const autosaveStore: Record<string, Project> = {}

export function autosaveProject(project: Project) {
  autosaveStore[project.id] = { ...project, updatedAt: Date.now() }
}

export function listProjects(): Project[] {
  return Object.values(autosaveStore).sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getProject(id: string): Project | undefined {
  return autosaveStore[id]
}

export function duplicateProject(id: string): Project | undefined {
  const p = autosaveStore[id]
  if (!p) return undefined
  const copy: Project = { ...p, id: `${p.id}-copy-${Date.now()}`, title: `${p.title} (copie)`, updatedAt: Date.now() }
  autosaveStore[copy.id] = copy
  return copy
}

export function deleteProject(id: string): boolean {
  if (autosaveStore[id]) {
    delete autosaveStore[id]
    return true
  }
  return false
}