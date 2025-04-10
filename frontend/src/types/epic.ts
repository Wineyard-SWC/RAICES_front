import { Requirement } from "./requirement";

export interface Epic {
  id: string;
  idTitle: string;
  title: string;
  description: string;
  relatedRequirements: Pick<Requirement, 'idTitle'| 'title' | 'description'>[];
  selected?: boolean;
}

export type EpicResponse = {
    content: Epic[];
};