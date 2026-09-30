import { DEFAULT_EXPERIENCE, DEFAULT_PROJECTS } from "../lib/content/defaults";
import { LEGACY_PROFILE_PROJECT_IDS, syncSourceControlledProfile } from "../lib/content/profile-sync";

const apply = process.argv.includes("--apply");

async function main() {
  console.log(`${apply ? "Applying" : "Previewing"} the source-controlled portfolio catalog:`);
  for (const project of DEFAULT_PROJECTS) {
    console.log(`  upsert project ${project.id}: ${project.title}`);
  }
  for (const role of DEFAULT_EXPERIENCE) {
    console.log(`  upsert experience ${role.id}: ${role.title}`);
  }
  for (const id of LEGACY_PROFILE_PROJECT_IDS) {
    console.log(`  delete legacy project ${id}`);
  }

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply after verifying the target AWS environment.");
    return;
  }

  const result = await syncSourceControlledProfile();

  console.log(`\nSynchronized ${result.projects} projects and ${result.experience} experience records.`);
  console.log(`Removed ${result.removed} legacy project record.`);
  console.log("Reindex RAG after the content sync so BB-8 retrieves the updated profile.");
}

main().catch((error) => {
  console.error("Profile content sync failed:", error);
  process.exitCode = 1;
});
