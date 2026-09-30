import { DEFAULT_EXPERIENCE, DEFAULT_PROJECTS } from "./defaults";
import { deleteContent, saveContent } from "./repository";

export const LEGACY_PROFILE_PROJECT_IDS = ["r2d2-transformer"];

export async function syncSourceControlledProfile() {
  for (const project of DEFAULT_PROJECTS) await saveContent("projects", project);
  for (const role of DEFAULT_EXPERIENCE) await saveContent("experience", role);
  for (const id of LEGACY_PROFILE_PROJECT_IDS) await deleteContent("projects", id);

  return {
    projects: DEFAULT_PROJECTS.length,
    experience: DEFAULT_EXPERIENCE.length,
    removed: LEGACY_PROFILE_PROJECT_IDS.length,
  };
}
