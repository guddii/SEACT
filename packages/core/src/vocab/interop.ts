const namespace = `http://www.w3.org/ns/solid/interop#`;

export const INTEROP = {
  Agent: `${namespace}Agent`,
  DataRegistration: `${namespace}DataRegistration`,
  DataRegistry: `${namespace}DataRegistry`,
  hasDataRegistration: `${namespace}hasDataRegistration`,
  hasRegistrySet: `${namespace}hasRegistrySet`,
  registeredAt: `${namespace}registeredAt`,
  registeredBy: `${namespace}registeredBy`,
  registeredShapeTree: `${namespace}registeredShapeTree`,
  updatedAt: `${namespace}updatedAt`,
  PREFIX_AND_NAMESPACE: {
    interop: namespace,
  },
};
