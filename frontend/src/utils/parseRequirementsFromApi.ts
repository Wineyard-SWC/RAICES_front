import { Requirement } from "@/types/requirement";
import {v4 as uuid4} from "uuid";

export function parseRequirementsFromAPI(data: any): Requirement[] {
    const normalizePriority = (priority: string): Requirement['priority'] => {
      switch (priority.toLowerCase()) {
        case 'alta':
          return 'High';
        case 'media':
          return 'Medium';
        case 'baja':
          return 'Low';
        default:
          return 'Medium';
      }
    };
  
    const funcionales = data.content?.funcionales || [];
    const noFuncionales = data.content?.no_funcionales || [];
  
    const mapToRequirement = (req: any): Requirement => ({
      id: req.id,
      idTitle: req.id, 
      title: req.title,
      description: req.description,
      priority: normalizePriority(req.priority),
      category: req.category,
      uuid: req.uuid || uuid4()
    });
  
    return [...funcionales.map(mapToRequirement), ...noFuncionales.map(mapToRequirement)];
  }