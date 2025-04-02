import { Requirement } from "./requirement";

export interface Epic {
  id: number;
  idTitle: string;
  title: string;
  description: string;
  relatedRequirements: Pick<Requirement, 'idTitle'| 'title' | 'description'>[];
}