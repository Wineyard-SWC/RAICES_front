import { Epic } from '@/types/epic';

export const reorderEpicIds = (epics: Epic[]): Epic[] => {
  return epics
    .sort((a, b) => a.idTitle.localeCompare(b.idTitle))
    .map((epic, index) => {
      const newIdTitle = `EPIC-${String(index + 1).padStart(3, '0')}`;
      return {
        ...epic,
        id: newIdTitle,
        idTitle: newIdTitle,
      };
    });
};
