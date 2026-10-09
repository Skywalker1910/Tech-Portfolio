import { ArcadeError, validateCountry, validateName } from "./policy";
import { reviewName } from "./moderation";
import { saveScore } from "./repository";
import { validateCompletedRun, verifyRun } from "./runs";

export async function publishScore(body:Record<string,unknown>, dependencies={ reviewName, saveScore }) {
  if (body.publish !== true) throw new ArcadeError("Confirm public score publication.");
  const name=validateName(body.name), country=validateCountry(body.country);
  const ticket=verifyRun(body.ticket);
  const run=validateCompletedRun(body,ticket);
  // The database receives only the server's reviewed name, never the candidate.
  const review=await dependencies.reviewName(name);
  return dependencies.saveScore(ticket,run,review,country);
}
