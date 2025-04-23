import { Requirement } from "./requirement";

export interface Epic {
  uuid:string;
  id: string;
  idTitle: string;
  title: string;
  description: string;
  relatedRequirements: Pick<Requirement, 'idTitle'| 'title' | 'description'| 'uuid'|'category'>[];
  selected?: boolean;
}

export type EpicResponse = {
    content: Epic[];
};