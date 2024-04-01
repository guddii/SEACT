import type { Session } from "@inrupt/solid-client-authn-node";
import type {
  AccessModes,
  SolidDataset,
  WithServerResourceInfo,
} from "@inrupt/solid-client";
import { buildThing, universalAccess } from "@inrupt/solid-client";
import { RDF, RDFS, XSD } from "@inrupt/vocab-common-rdf";
import type { Agent } from "../models/agent";
import { VOCAB } from "../vocab";
import { readOrCreateResource } from "../solid/read-or-create-resource";
import { toUrlString, updateUrl } from "../utils/url-helper.ts";

async function createAccessLogNamespaceVocab(
  agent: Agent,
  session: Session,
): Promise<SolidDataset & WithServerResourceInfo> {
  const resource = updateUrl("/ns/log", agent.storage);
  return readOrCreateResource({
    resource,
    session,
    thingCallbackPairs: [
      {
        name: "AccessLog",
        callback: (thing) =>
          buildThing(thing)
            .addUrl(RDF.type, RDFS.Class)
            .addStringEnglish(RDFS.label, "AccessLog")
            .build(),
      },
      {
        name: "date",
        callback: (thing) =>
          buildThing(thing)
            .addUrl(RDF.type, RDF.Property)
            .addStringEnglish(RDFS.label, "Accessed at")
            .build(),
      },
      {
        name: "accessor",
        callback: (thing) =>
          buildThing(thing)
            .addUrl(RDF.type, RDF.Property)
            .addStringEnglish(RDFS.label, "Accessing agent")
            .build(),
      },
      {
        name: "application",
        callback: (thing) =>
          buildThing(thing)
            .addUrl(RDF.type, RDF.Property)
            .addStringEnglish(RDFS.label, "Accessing application")
            .build(),
      },
      {
        name: "resource",
        callback: (thing) =>
          buildThing(thing)
            .addUrl(RDF.type, RDF.Property)
            .addStringEnglish(RDFS.label, "Accessed resource")
            .build(),
      },
      {
        name: "action",
        callback: (thing) =>
          buildThing(thing)
            .addUrl(RDF.type, RDF.Property)
            .addStringEnglish(RDFS.label, "Action")
            .build(),
      },
    ],
    prefixes: {
      ...RDF.PREFIX_AND_NAMESPACE,
      ...XSD.PREFIX_AND_NAMESPACE,
    },
    createHeader: true,
  });
}

async function createAccessLogNamespaceShex(
  agent: Agent,
  session: Session,
): Promise<SolidDataset & WithServerResourceInfo> {
  const resource = updateUrl("/ns/shex/log", agent.storage);
  return readOrCreateResource({
    resource,
    session,
    thingCallbackPairs: [
      {
        name: "AccessLogShape",
        callback: (thing) =>
          buildThing(thing)
            .addUrl(VOCAB.LOG.date, XSD.dateTime)
            .addUrl(VOCAB.LOG.accessor, XSD.anyURI)
            .addUrl(VOCAB.LOG.application, XSD.string)
            .addUrl(VOCAB.LOG.action, XSD.string)
            .addUrl(VOCAB.LOG.resource, XSD.string)
            .build(),
      },
    ],
    prefixes: {
      ...VOCAB.LOG.PREFIX_AND_NAMESPACE,
      ...XSD.PREFIX_AND_NAMESPACE,
    },
  });
}

async function createAccessLogNamespaceTree(
  agent: Agent,
  session: Session,
  shexUrl: string,
): Promise<SolidDataset & WithServerResourceInfo> {
  const resource = updateUrl("/ns/tree/log", agent.storage);
  return readOrCreateResource({
    resource,
    session,
    thingCallbackPairs: [
      {
        name: "AccessLogRegistrationTree",
        callback: (thing) =>
          buildThing(thing)
            .addUrl(RDF.type, VOCAB.ST.ShapeTree)
            .addUrl(VOCAB.ST.expectsType, VOCAB.ST.Container)
            .addUrl(VOCAB.ST.contains, `${toUrlString(resource)}#AccessLogTree`)
            .build(),
      },
      {
        name: "AccessLogTree",
        callback: (thing) =>
          buildThing(thing)
            .addUrl(RDF.type, VOCAB.ST.ShapeTree)
            .addUrl(VOCAB.ST.expectsType, VOCAB.ST.Resource)
            .addUrl(VOCAB.ST.shape, `${shexUrl}#AccessLogShape`)
            .build(),
      },
    ],
    prefixes: {
      ...VOCAB.ST.PREFIX_AND_NAMESPACE,
    },
  });
}

export interface AccessLogNamespace {
  vocab: SolidDataset & WithServerResourceInfo;
  vocabAcl: AccessModes | null;
  shex: SolidDataset & WithServerResourceInfo;
  shexAcl: AccessModes | null;
  tree: SolidDataset & WithServerResourceInfo;
  treeAcl: AccessModes | null;
}

export async function createAccessLogNamespace(
  agent: Agent,
  session: Session,
): Promise<AccessLogNamespace> {
  const vocab = await createAccessLogNamespaceVocab(agent, session);
  const vocabAcl = await universalAccess.setPublicAccess(
    vocab.internal_resourceInfo.sourceIri,
    { read: true },
    session,
  );

  const shex = await createAccessLogNamespaceShex(agent, session);
  const shexAcl = await universalAccess.setPublicAccess(
    shex.internal_resourceInfo.sourceIri,
    { read: true },
    session,
  );

  const tree = await createAccessLogNamespaceTree(
    agent,
    session,
    shex.internal_resourceInfo.sourceIri,
  );
  const treeAcl = await universalAccess.setPublicAccess(
    tree.internal_resourceInfo.sourceIri,
    { read: true },
    session,
  );

  return {
    vocab,
    vocabAcl,
    shex,
    shexAcl,
    tree,
    treeAcl,
  };
}
