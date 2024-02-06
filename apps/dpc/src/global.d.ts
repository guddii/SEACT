import type { IStorage } from "@inrupt/solid-client-authn-node";

declare global {
  // eslint-disable-next-line no-var -- var is required in node global scope
  var storage: IStorage | undefined;
}
