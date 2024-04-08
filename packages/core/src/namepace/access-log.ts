import type { Session } from "@inrupt/solid-client-authn-node";
import type {
  SolidDataset,
  WithServerResourceInfo,
  WithResourceInfo,
} from "@inrupt/solid-client";
import {
  saveFileInContainer,
  buildThing,
  getFile,
  universalAccess,
} from "@inrupt/solid-client";
import { RDF, RDFS, XSD } from "@inrupt/vocab-common-rdf";
import type { Agent } from "../models/agent";
import { readOrCreatePublicResource } from "../solid/read-or-create-public-resource.ts";
import { toUrlString, updateUrl } from "../utils/url-helper.ts";

async function createAccessLogNamespaceVocab(
  agent: Agent,
  session: Session,
): Promise<SolidDataset & WithServerResourceInfo> {
  const resource = updateUrl("/ns/log", agent.storage);
  return readOrCreatePublicResource({
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
  vocab: WithResourceInfo,
  agent: Agent,
  session: Session,
): Promise<WithResourceInfo> {
  const container = updateUrl("/ns/", agent.storage);
  const fileName = "log.shex";
  const sourceIri = toUrlString(updateUrl(`/${fileName}`, container));
  const contentType = "text/shex";

  try {
    await getFile(sourceIri, session);
  } catch (e) {
    const file = new File(
      [
        `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xml: <http://www.w3.org/XML/1998/namespace>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX shx: <http://www.w3.org/ns/shex#>
PREFIX log: <${vocab.internal_resourceInfo.sourceIri}#>

<#AccessLogShape> {
  log:date xsd:dateTime ;
  log:accessor IRI ;
  log:application xsd:string ;
  log:application xsd:string ;
  log:resource xsd:string ;
  log:action xsd:string 
}`,
      ],
      fileName,
      {
        type: contentType,
      },
    );
    const response = await saveFileInContainer(toUrlString(container), file, {
      slug: file.name,
      contentType: file.type,
      fetch: session.fetch,
    });
    await universalAccess.setPublicAccess(
      response.internal_resourceInfo.sourceIri,
      { read: true },
      session,
    );
  }

  return {
    internal_resourceInfo: {
      sourceIri,
      isRawData: true,
      contentType,
    },
  };
}

async function createAccessLogNamespaceTree(
  shex: WithResourceInfo,
  agent: Agent,
  session: Session,
): Promise<WithResourceInfo> {
  const container = updateUrl("/ns/", agent.storage);
  const fileName = "log.tree";
  const sourceIri = toUrlString(updateUrl(`/${fileName}`, container));

  try {
    await getFile(sourceIri, session);
  } catch (e) {
    const file = new File(
      [
        `PREFIX st: <http://www.w3.org/ns/shapetrees#> .
PREFIX log-shex: <${shex.internal_resourceInfo.sourceIri}#>.

<#AccessLogRegistrationTree>
  a st:ShapeTree ;
  st:expectsType st:Container ;
  st:contains <#AccessLogTree> .

<#AccessLogTree>
  a st:ShapeTree ;
  st:expectsType st:Resource ;
  st:shape log-shex:AccessLogShape .`,
      ],
      fileName,
    );
    const response = await saveFileInContainer(toUrlString(container), file, {
      slug: file.name,
      fetch: session.fetch,
    });
    await universalAccess.setPublicAccess(
      response.internal_resourceInfo.sourceIri,
      { read: true },
      session,
    );
  }

  return {
    internal_resourceInfo: {
      sourceIri,
      isRawData: true,
    },
  };
}

export interface AccessLogNamespace {
  vocab: SolidDataset & WithServerResourceInfo;
  shex: WithResourceInfo;
  tree: WithResourceInfo;
}

export async function createAccessLogNamespace(
  agent: Agent,
  session: Session,
): Promise<AccessLogNamespace> {
  const vocab = await createAccessLogNamespaceVocab(agent, session);
  const shex = await createAccessLogNamespaceShex(vocab, agent, session);
  const tree = await createAccessLogNamespaceTree(shex, agent, session);

  return {
    vocab,
    shex,
    tree,
  };
}
