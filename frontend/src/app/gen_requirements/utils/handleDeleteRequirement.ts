import { Dispatch, SetStateAction } from "react";
import { Requirement } from "@/types/requirement";
import { Epic } from "@/types/epic";

export default function handleDeleteRequirement(
  deletedId: string,
  setRequirements: Dispatch<SetStateAction<Requirement[]>>,
  setSelectedIds: Dispatch<SetStateAction<string[]>>,
  setEpics: Dispatch<SetStateAction<Epic[]>>
) {
  setRequirements((prev) => prev.filter((r) => r.uuid !== deletedId));

  setSelectedIds((prev) => prev.filter((id) => id !== deletedId));

  setEpics((prev) =>
    prev.map((epic) => ({
      ...epic,
      relatedRequirements:
        epic.relatedRequirements?.filter((req) => req.uuid !== deletedId) ?? [],
    }))
  );
}
