import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerSeason } from "../../api/season";
import { QUERY_KEYS } from "../../lib/constants";

export function useRegisterSeason(season) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => registerSeason(season),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.season.all,
      });
    },
  });
}
