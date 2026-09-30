import { DEFAULT_EXPERIENCE, DEFAULT_PROJECTS } from "../lib/content/defaults";
import { deleteContent, saveContent } from "../lib/content/repository";

const LEGACY_PROJECT_IDS = ["r2d2-transformer"];
const apply = process.argv.includes("--apply");

async function main() {
  console.log(`${apply ? "Applying" : "Previewing"} the source-controlled portfolio catalog:`);
  for (const project of DEFAULT_PROJECTS) {
    console.log(`  upsert project ${project.id}: ${project.title}`);
  }
  for (const role of DEFAULT_EXPERIENCE) {
    console.log(`  upsert experience ${role.id}: ${role.title}`);
  }
  for (const id of LEGACY_PROJECT_IDS) {
    console.log(`  delete legacy project ${id}`);
  }

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply after verifying the target AWS environment.");
    return;
  }

  for (const project of DEFAULT_PROJECTS) {
    await saveContent("projects", project);
  }
  for (const role of DEFAULT_EXPERIENCE) {
    await saveContent("experience", role);
  }
  for (const id of LEGACY_PROJECT_IDS) {
    await deleteContent("projects", id);
  }

  console.log(`\nSynchronized ${DEFAULT_PROJECTS.length} projects and ${DEFAULT_EXPERIENCE.length} experience records.`);
  console.log(`Removed ${LEGACY_PROJECT_IDS.length} legacy project record.`);
  console.log("Reindex RAG after the content sync so BB-8 retrieves the updated profile.");
}

main().catch((error) => {
  console.error("Profile content sync failed:", error);
  process.exitCode = 1;
});
