import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';

export function useApproveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => companionGroupService.approveMember(memberId),
    onSuccess: (_, _memberId) => {
      // Invalidate both lists, detail query, and join-requests panel
      queryClient.invalidateQueries({ queryKey: ['matching-groups'] });
      queryClient.invalidateQueries({ queryKey: ['matching-group-detail'] });
      queryClient.invalidateQueries({ queryKey: ['join-requests'] });
    },
  });
}
