import type { IStorage } from "@inrupt/solid-client-authn-node";
import { InMemoryStorage } from "@inrupt/solid-client-authn-core";

export const getStorage = (): IStorage => {
  if (!globalThis.storage) {
    globalThis.storage = new InMemoryStorage();
    Object.freeze(globalThis.storage);
  }
  return globalThis.storage;
};
