import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'

// ============================================================================
// Mutation with Invalidation Helper
// ============================================================================

export interface MutationInvalidationConfig {
  /** Query keys to invalidate after successful mutation */
  lists?: () => QueryKey
  /** Query key for a specific detail - invalidates on update/delete */
  detail?: (id: string) => QueryKey
}

/**
 * Creates a mutation hook with automatic query invalidation.
 *
 * @example
 * export function useCreateUser() {
 *   return createMutationWithInvalidation(
 *     (payload: CreateUserPayload) => createUser(payload),
 *     { lists: () => userKeys.lists() }
 *   )
 * }
 */
export function useInvalidatingMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidation: MutationInvalidationConfig,
  options?: {
    getId?: (variables: TVariables) => string | undefined
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (_, variables) => {
      if (invalidation.lists) {
        queryClient.invalidateQueries({ queryKey: invalidation.lists() })
      }
      if (invalidation.detail && options?.getId) {
        const id = options.getId(variables)
        if (id) {
          queryClient.invalidateQueries({ queryKey: invalidation.detail(id) })
        }
      }
    },
  })
}

// ============================================================================
// CRUD Mutations Factory
// ============================================================================

export interface CrudKeyConfig {
  lists: () => QueryKey
  detail: (id: string) => QueryKey
}

export interface CrudConfig<TEntity, TCreate, TUpdate> {
  create: (input: TCreate) => Promise<TEntity>
  update: (input: TUpdate) => Promise<TEntity>
  delete: (id: string) => Promise<void>
  keys: CrudKeyConfig
  getUpdateId: (input: TUpdate) => string
}

/**
 * Creates standard CRUD mutation hooks with proper invalidation.
 *
 * @example
 * const { useCreate, useUpdate, useDelete } = createCrudMutations({
 *   create: createUser,
 *   update: updateUser,
 *   delete: deleteUser,
 *   keys: userKeys,
 *   getUpdateId: (input) => input.id,
 * })
 */
export function createCrudMutations<TEntity, TCreate, TUpdate>(
  config: CrudConfig<TEntity, TCreate, TUpdate>
) {
  function useCreate() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: config.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: config.keys.lists() })
      },
    })
  }

  function useUpdate() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: config.update,
      onSuccess: (_, variables) => {
        const id = config.getUpdateId(variables)
        queryClient.invalidateQueries({ queryKey: config.keys.lists() })
        queryClient.invalidateQueries({ queryKey: config.keys.detail(id) })
      },
    })
  }

  function useDelete() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: config.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: config.keys.lists() })
      },
    })
  }

  return { useCreate, useUpdate, useDelete }
}

// ============================================================================
// Query Key Helpers
// ============================================================================

/**
 * Standard query key factory pattern for consistent key generation.
 *
 * @example
 * export const userKeys = createQueryKeys('users')
 * // userKeys.all => ['users']
 * // userKeys.lists() => ['users', 'list']
 * // userKeys.list({ role: 'teacher' }) => ['users', 'list', { role: 'teacher' }]
 * // userKeys.details() => ['users', 'detail']
 * // userKeys.detail('123') => ['users', 'detail', '123']
 */
export function createQueryKeys<TListParams = unknown>(entity: string) {
  return {
    all: [entity] as const,
    lists: () => [...[entity], 'list'] as const,
    list: (params: TListParams) => [...[entity], 'list', params] as const,
    details: () => [...[entity], 'detail'] as const,
    detail: (id: string) => [...[entity], 'detail', id] as const,
  }
}
