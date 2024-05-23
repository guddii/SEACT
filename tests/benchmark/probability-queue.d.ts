declare class ProbabilityQueue<T> {
  constructor(weightField: keyof T, idField?: keyof T);
  update(): void;
  insert(element: T): void;
  remove(eid: T): void;
  probability(element): number;
  pick(): T | null;
}

declare module "probability-queue" {
  export = ProbabilityQueue;
}
