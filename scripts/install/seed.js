const fs = require("fs");
const { clientsAgents, dpcAgents } = require("./config");

const writeCssSeed = (agents) => {
  const seed = [];
  for (const agent of agents) {
    seed.push({
      email: `${agent.name}@example.com`,
      password: "secret!",
      pods: [
        {
          name: agent.name,
        },
      ],
    });
    console.log(`Seed for "${agent.name}@example.com" has been generated`);
  }

  fs.writeFileSync("apps/server/data/seed.json", JSON.stringify(seed, null, 2));
  console.log(`Seed has been written to "./apps/server/data/seed.json"`);
};

(async () => {
  writeCssSeed([...dpcAgents, ...clientsAgents]);
})();
