import { getContainerResources } from "../find-storage.ts";

describe("get container resources", () => {
  it("get container resources from webId", () => {
    const urls = getContainerResources(
      new URL("http://localhost:4000/client/profile/card#me"),
    );

    expect(urls.map((url) => url.href)).toEqual([
      "http://localhost:4000/client/profile/",
      "http://localhost:4000/client/",
    ]);
  });

  it("get container resources from folder", () => {
    const urls = getContainerResources(
      new URL("http://localhost:4000/client/profile/card/"),
    );

    expect(urls.map((url) => url.href)).toEqual([
      "http://localhost:4000/client/profile/card/",
      "http://localhost:4000/client/profile/",
      "http://localhost:4000/client/",
    ]);
  });

  it("get container resources form a resource that do not have any", () => {
    const urls = getContainerResources(new URL("http://localhost:4000/client"));

    expect(urls.map((url) => url.href)).toEqual([]);
  });
});
