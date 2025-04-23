import { Requirement } from "@/types/requirement";

export function inferRequirementCategory(idTitle: string): 'Funcional' | 'No Funcional' {
    if (idTitle.startsWith('REQ-NF')) {
      return 'No Funcional';
    }
    return 'Funcional';
}
  
export function normalizeRequirementsCategory(requirements: any[]): any[] {
    return requirements.map((req) => ({
      ...req,
      category: inferRequirementCategory(req.idTitle),
    }));
}

export function generateNextRequirementId(
    allRequirements: Requirement[],
    category: 'Funcional' | 'No Funcional'
  ): string {
    const prefix = category === 'Funcional' ? 'REQ' : 'REQ-NF';
  
    const sameTypeReqs = allRequirements.filter(req =>
      (req.category === category || inferRequirementCategory(req.idTitle) === category)
    );
  
    const numbers = sameTypeReqs.map(req => {
      const match = req.idTitle.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    });
  
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNumber = maxNumber + 1;
  
    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
}