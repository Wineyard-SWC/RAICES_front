import { Epic } from '@/types/epic';
import { v4 as uuid4} from "uuid";

export const parseEpicsFromAPI = (rawResponse: any, existingRequirements: any[] = []): Epic[] => {

  if (!rawResponse || !Array.isArray(rawResponse.content)) return [];

  const reqMap = new Map(existingRequirements.map(req => [req.idTitle, req]));

  return rawResponse.content.map((item: any, index: number): Epic => ({
    uuid: item.uuid || uuid4(),
    id: item.id ?? `${index + 1}`,
    idTitle: item.id ?? `EPIC-${String(index + 1).padStart(3, '0')}`,
    title: item.title ?? '',
    description: item.description ?? '',
    relatedRequirements: Array.isArray(item.related_requirements)
      ? item.related_requirements.map((req: any) => {
          const existingReq = req.id ? reqMap.get(req.id) : null;
          
          return {
            idTitle: req.id || '',
            title: req.title?.split(':')[0] || '', 
            description: req.description?.split(':')[1]?.trim() ?? req.description,
            uuid: existingReq?.uuid || req.uuid || uuid4(),
            category : req.category || (req.id?.includes('-NF-') ? 'No Funcional' : 'Funcional'),
          };
        })
      : [],
  }));
};