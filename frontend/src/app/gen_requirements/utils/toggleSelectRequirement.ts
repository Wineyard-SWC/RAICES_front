import { printError } from "@/utils/debugLogger";
import { Dispatch, SetStateAction } from "react";

export default function toggleSelectRequirement(
  reqUuid: string,
  setSelectedIds: Dispatch<SetStateAction<string[]>>
) {
  if (!reqUuid) {
    printError("Attempted to toggle selection on requirement with undefined UUID");
    return;
  }

  setSelectedIds(prev =>
    prev.includes(reqUuid) ? prev.filter(id => id !== reqUuid) : [...prev, reqUuid]
  );
}
