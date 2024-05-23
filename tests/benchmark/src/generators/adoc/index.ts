import type { Sequence } from "../sequence";

export function toAsciidoc(sequence: Sequence[]): string {
  const transformSequence = (action: Sequence): string => {
    return `${action.value.charAt(0).toUpperCase()}~${action.resource}`;
  };
  return `${sequence.map(transformSequence).join("~ ")}~`;
}
