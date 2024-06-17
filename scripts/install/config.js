const generateAgent = (name) => {
  console.log(`Config for " ${name} has been generated`);
  return { name: `${name}` };
};

const generateAgents = (name, amountOfAgents = 1) => {
  return Array.from({ length: amountOfAgents }, (_, index) => {
    const patchedIndex = index + 1;
    return generateAgent(`${name}${patchedIndex}`);
  });
};

module.exports = {
  clientsAgents: [generateAgent("client"), ...generateAgents("client", 100)],
  dpcAgents: [generateAgent("dpc")],
};
