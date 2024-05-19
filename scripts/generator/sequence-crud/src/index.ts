import type { Actor } from "xstate";
import { createActor } from "xstate";
import { log } from "@seact/core";
import _ from "lodash";
import ProbabilityQueue from "probability-queue";
import { machine } from "./machine.ts";

interface Sequence {
  resource: string;
  value: string;
}

enum Action {
  Create = "create",
  Read = "read",
  Update = "update",
  Delete = "delete",
}

interface CrudProbability {
  action: Action;
  score: number;
}

function updateActors(actors: Actor<typeof machine>[]): Actor<typeof machine> {
  const index = actors.length;
  const id = `${index}`;
  const actor = createActor(machine, { id });

  actor.start();
  actors[index] = actor;

  return actors[index];
}

function updateSequence(
  actor: Actor<typeof machine>,
  actors: Actor<typeof machine>[],
  sequence: Sequence[],
): void {
  const resource = actor.id;
  const value = actor.getSnapshot().value;
  sequence.push({ resource, value });
}

function getActorsInDeleted(
  value: string,
  actors: Actor<typeof machine>[],
): Partial<typeof actors> {
  return actors.filter((actor) => actor.getSnapshot().value === value);
}

function getActorsWithoutDeleted(
  value: string,
  actors: Actor<typeof machine>[],
): Partial<typeof actors> {
  return actors.filter((actor) => actor.getSnapshot().value !== value);
}

function generateProbabilisticCrudSequence(): Sequence[] {
  const sequence: Sequence[] = [];
  const actors: Actor<typeof machine>[] = [];

  const pq = new ProbabilityQueue<CrudProbability>("score");
  pq.insert({ action: Action.Create, score: 1 });
  pq.insert({ action: Action.Read, score: 10 });
  pq.insert({ action: Action.Update, score: 2 });
  pq.insert({ action: Action.Delete, score: 2 });

  // Initial actor
  const initialActor = updateActors(actors);
  updateSequence(initialActor, actors, sequence);

  // Loop
  for (let step = 0; step < 20; step++) {
    const action = pq.pick()?.action;
    if (action) {
      if ([Action.Create].includes(action)) {
        const actorsInDeleted = getActorsInDeleted("Deleted", actors);
        const randomInt = _.random(0, actorsInDeleted.length);
        let actor = actorsInDeleted[randomInt];

        if (typeof actor !== "undefined") {
          actor.send({ type: action });
        } else {
          actor = updateActors(actors);
        }

        updateSequence(actor, actors, sequence);
      }

      if ([Action.Read, Action.Update, Action.Delete].includes(action)) {
        const actorsWithoutDeleted = getActorsWithoutDeleted("Deleted", actors);
        const randomInt = _.random(0, actorsWithoutDeleted.length - 1);
        const actor = actorsWithoutDeleted[randomInt];

        if (typeof actor !== "undefined") {
          actor.send({ type: action });
          updateSequence(actor, actors, sequence);
        }
      }
    }
  }

  return sequence;
}

function toAsciidoc(sequence: Sequence[]): string {
  const transformSequence = (action: Sequence): string =>
    `${action.value.charAt(0).toUpperCase()}~${action.resource}`;
  return `${sequence.map(transformSequence).join("~")}~`;
}

log(toAsciidoc(generateProbabilisticCrudSequence()));
