import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as coursesApi from '@/services/api/courses'

export function useQuiz(quizId: string | undefined) {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => coursesApi.getQuiz(quizId!),
    enabled: !!quizId,
  })
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      quizId,
      answers,
    }: {
      quizId: string
      answers: { questionId: string; selectedIndex: number }[]
    }) => coursesApi.submitQuiz(quizId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['lesson'] })
    },
  })
}
