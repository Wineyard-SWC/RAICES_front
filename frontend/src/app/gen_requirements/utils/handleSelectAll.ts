import { Requirement } from "@/types/requirement";

export default function handleSelectAll(
  requirements: Requirement[],
  setSelectedIds: (ids: string[]) => void
) {
  const allRequirementIds = requirements.map(req => req.uuid);
  setSelectedIds(allRequirementIds);
}
