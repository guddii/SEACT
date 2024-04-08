import { AGENTS } from "../config/agents";
import { toUrlString } from "../utils/url-helper.ts";

const namespace = `${toUrlString(AGENTS.DPC.storage)}/ns/log#`;

export const LOG = {
  AccessLog: `${namespace}AccessLog`,
  date: `${namespace}date`,
  accessor: `${namespace}accessor`,
  application: `${namespace}application`,
  resource: `${namespace}resource`,
  action: `${namespace}action`,
  PREFIX_AND_NAMESPACE: {
    log: namespace,
  },
};
