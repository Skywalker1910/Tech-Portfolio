import { DEFAULT_EXPERIENCE, DEFAULT_PROJECTS } from "../lib/content/defaults";
import { saveContent } from "../lib/content/repository";

async function main() {
  for (const project of DEFAULT_PROJECTS) await saveContent("projects", project);
  for (const role of DEFAULT_EXPERIENCE) await saveContent("experience", role);
  console.log(`Seeded ${DEFAULT_PROJECTS.length} projects and ${DEFAULT_EXPERIENCE.length} experience records.`);
}
main().catch((error) => { console.error("Content seed failed:", error); process.exitCode = 1; });
