import { enhanced, onStop } from "@aifivem/lib/server";
import { panel, settings } from "../content";
import { sentences } from "./sentences";

/**
 * The prison area as a server colshape (documented for Enhanced; a Legacy build that ships working colshapes gets
 * it too), so a jailed player who leaves it is checked at once instead of at the next 10 s timer. The timer still
 * runs everywhere: no exit fires for a player who was never inside, sits in another routing bucket or stood outside
 * an edited area. Without colshapes nothing is created.
 */
let shape: number | null = null;
let built = "";

function build(): void {
  const zone = settings.value.zone;
  const key = zone ? JSON.stringify(zone) : "";
  if (key === built) return;
  built = key;
  if (shape !== null) enhanced.deleteColshape(shape);
  shape = zone ? enhanced.polygonColshape(zone) : null;
}

build();
panel.onChange("settings", build);

on("onColshapeExit", (entity: number, id: number) => {
  if (shape === null || id !== shape || !DoesEntityExist(entity)) return;
  // Only the player's own ped: an NPC its client owns does not count.
  const owner = NetworkGetEntityOwner(entity);
  if (owner > 0 && GetPlayerPed(String(owner)) === entity)
    sentences.checkEscape(owner);
});

onStop(() => {
  if (shape !== null) enhanced.deleteColshape(shape);
});
