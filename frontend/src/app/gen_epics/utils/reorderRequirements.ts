import { Requirement } from "@/types/requirement";

export function reorderRequirementIds(requirements: any[]) {
    const funcionales = requirements
      .filter(r => r.idTitle.startsWith('REQ-') && !r.idTitle.startsWith('REQ-NF-'))
      .sort((a, b) => a.idTitle.localeCompare(b.idTitle));
  
    const noFuncionales = requirements
      .filter(r => r.idTitle.startsWith('REQ-NF-'))
      .sort((a, b) => a.idTitle.localeCompare(b.idTitle));
  
    funcionales.forEach((req, i) => {
      const newId = `REQ-${String(i + 1).padStart(3, '0')}`;
      req.idTitle = newId;
      req.id = newId;
      req.category = 'Funcional';
    });
  
    noFuncionales.forEach((req, i) => {
      const newId = `REQ-NF-${String(i + 1).padStart(3, '0')}`;
      req.idTitle = newId;
      req.id = newId;
      req.category = 'No Funcional';
    });
  
    return [...funcionales, ...noFuncionales];
  }