import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBoxLocation } from "../../api/storage/fetchBoxesData";
import { QUERY_KEYS } from "../../lib/constants";

export function useMoveBoxes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boxes) =>
      Promise.all(
        boxes.map(({ boxQr, oldRack, newRack }) =>
          updateBoxLocation({ boxQr, oldRack, newRack }),
        ),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rack.all });
    },
  });
}
