import { setup } from "xstate";

export const machine = setup({
  types: {
    events: {} as
      | { type: "read" }
      | { type: "update" }
      | { type: "delete" }
      | { type: "create" },
  },
  schemas: {
    events: {
      read: {
        type: "object",
        properties: {},
      },
      update: {
        type: "object",
        properties: {},
      },
      delete: {
        type: "object",
        properties: {},
      },
      create: {
        type: "object",
        properties: {},
      },
    },
  },
}).createMachine({
  context: {},
  id: "ResourceLifecycle",
  initial: "Created",
  states: {
    Created: {
      on: {
        read: {
          target: "Read",
        },
        update: {
          target: "Updated",
        },
        delete: {
          target: "Deleted",
        },
      },
    },
    Read: {
      on: {
        read: {
          target: "Read",
        },
        update: {
          target: "Updated",
        },
        delete: {
          target: "Deleted",
        },
      },
    },
    Updated: {
      on: {
        update: {
          target: "Updated",
        },
        read: {
          target: "Read",
        },
        delete: {
          target: "Deleted",
        },
      },
    },
    Deleted: {
      on: {
        create: {
          target: "Created",
        },
      },
    },
  },
});
