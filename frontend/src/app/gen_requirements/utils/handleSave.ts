import { Requirement } from "@/types/requirement";
import { printError } from "@/utils/debugLogger";
import { postRequirements } from "@/utils/postRequirements";

export default async function handleSave(
  requirements: Requirement[],
  selectedIds: string[],
  projectId: string | null
) {
  try {
    const selectedRequirements = requirements.filter(req => selectedIds.includes(req.uuid));
    
    const cleaned = selectedRequirements.map(r => ({
      idTitle: r.idTitle,
      uuid: r.uuid,
      title: r.title,
      description: r.description,
      priority: r.priority,
      epicRef: r.epicRef,
      projectRef: projectId
    }));

    await postRequirements(cleaned, projectId!);
  } catch (error) {
    printError("Error while saving requirements:", error);
  }
}
