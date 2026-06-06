import { useMutation } from "@tanstack/react-query";
import { updateBoxLocation } from "../../api/storage/fetchBoxesData";

export function useMoveBoxes() {
  return useMutation({
    mutationFn: (boxes) =>
      Promise.all(
        boxes.map(({ boxQr, oldRack, newRack }) =>
          updateBoxLocation({ boxQr, oldRack, newRack }),
        ),
      ),
  });
}
