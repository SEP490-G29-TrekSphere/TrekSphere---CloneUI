import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';

export function useRejectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      companionGroupService.rejectMember(groupId, memberId),
    onSuccess: (_, { groupId }) => {
      // Invalidate both lists, detail query, and join-requests panel
      queryClient.invalidateQueries({ queryKey: ['matching-groups'] });
      queryClient.invalidateQueries({ queryKey: ['matching-group-detail', groupId] });
      queryClient.invalidateQueries({ queryKey: ['join-requests', groupId] });
    },
  });
}
