import { MuseService } from "./MuseService";

let singleton: MuseService | null = null;
export const getMuseService = () => (singleton ??= new MuseService());