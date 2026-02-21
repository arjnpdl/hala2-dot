import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConnections, requestConnection } from '../api/matches'
import { useNotification } from '../contexts/NotificationContext'

export function useConnections() {
  const { data, isLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: getConnections,
  })

  return {
    connections: data || { sent: [], received: [] },
    loading: isLoading,
  }
}

export function useRequestConnection() {
  const queryClient = useQueryClient()
  const { addToast } = useNotification()

  return useMutation({
    mutationFn: ({ targetId, message }) => requestConnection(targetId, message),
    onSuccess: () => {
      queryClient.invalidateQueries(['connections'])
      addToast('Connection request sent', 'success')
    },
    onError: () => {
      addToast('Failed to send connection request', 'error')
    },
  })
}
