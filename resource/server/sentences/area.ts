import {
  createColshape,
  deleteColshape,
  onColshape,
} from "@aifivem/lib/server";
import { panel, settings } from "../content";
import { sentences } from "./sentences";

/**
 * The prison area as a FiveM colshape (lib `createColshape`, players only; FiveM deletes it when this resource
 * stops), so a jailed player who leaves it is checked at once instead of at the next 10 s timer. The timer still
 * runs: no exit fires for a player who was never inside.
 */
let shape: number | null = null;
let unsubscribe: (() => void) | null = null;
let built = "";

function onExit(entity: number, inside: boolean): void {
  if (inside || !DoesEntityExist(entity)) return;
  const owner = NetworkGetEntityOwner(entity);
  if (owner > 0 && GetPlayerPed(String(owner)) === entity)
    sentences.checkEscape(owner);
}

function build(): void {
  const zone = settings.value.zone;
  const key = zone ? JSON.stringify(zone) : "";
  if (key === built) return;
  built = key;
  unsubscribe?.();
  if (shape !== null) deleteColshape(shape);
  shape = zone ? createColshape(zone) : null;
  unsubscribe = shape !== null ? onColshape(shape, onExit) : null;
}

build();
panel.onChange("settings", build);
