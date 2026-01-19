import { Types } from 'mongoose'
import type { PaginationMeta } from '@silveredge/shared'
import { SandboxProject, type ISandboxProject } from './sandboxProject.model'
import { ApiError } from '../../utils/ApiError'
import { parsePaginationParams, buildPaginationMeta } from '../../utils/pagination'
import type { CreateProjectInput, UpdateProjectInput, ListProjectsQuery } from './sandbox.schema'

const MAX_PROJECTS_PER_STUDENT = 10

export interface ProjectListResult {
  projects: ISandboxProject[]
  meta: PaginationMeta
}

export async function listProjects(
  studentId: string,
  query: ListProjectsQuery
): Promise<ProjectListResult> {
  const { page, limit, skip } = parsePaginationParams(query)

  const filter: Record<string, unknown> = {
    studentId: new Types.ObjectId(studentId),
  }

  if (query.language) {
    filter.language = query.language
  }

  const [projects, total] = await Promise.all([
    SandboxProject.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    SandboxProject.countDocuments(filter),
  ])

  return {
    projects,
    meta: buildPaginationMeta(total, page, limit),
  }
}

export async function getProjectById(
  studentId: string,
  projectId: string
): Promise<ISandboxProject> {
  const project = await SandboxProject.findOne({
    _id: new Types.ObjectId(projectId),
    studentId: new Types.ObjectId(studentId),
  })

  if (!project) {
    throw ApiError.notFound('Project')
  }

  return project
}

export async function createProject(
  studentId: string,
  input: CreateProjectInput
): Promise<ISandboxProject> {
  // Check project limit
  const existingCount = await SandboxProject.countDocuments({
    studentId: new Types.ObjectId(studentId),
  })

  if (existingCount >= MAX_PROJECTS_PER_STUDENT) {
    throw ApiError.badRequest(`Maximum of ${MAX_PROJECTS_PER_STUDENT} projects allowed`)
  }

  const project = await SandboxProject.create({
    studentId: new Types.ObjectId(studentId),
    name: input.name,
    description: input.description,
    language: input.language,
    code: input.code || '',
  })

  return project
}

export async function updateProject(
  studentId: string,
  projectId: string,
  input: UpdateProjectInput
): Promise<ISandboxProject> {
  const project = await SandboxProject.findOne({
    _id: new Types.ObjectId(projectId),
    studentId: new Types.ObjectId(studentId),
  })

  if (!project) {
    throw ApiError.notFound('Project')
  }

  if (input.name !== undefined) {
    project.name = input.name
  }
  if (input.description !== undefined) {
    project.description = input.description
  }
  if (input.code !== undefined) {
    project.code = input.code
  }

  await project.save()
  return project
}

export async function deleteProject(studentId: string, projectId: string): Promise<void> {
  const project = await SandboxProject.findOne({
    _id: new Types.ObjectId(projectId),
    studentId: new Types.ObjectId(studentId),
  })

  if (!project) {
    throw ApiError.notFound('Project')
  }

  await project.deleteOne()
}
