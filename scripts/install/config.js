const generateAgents = (name, amountOfAgents = 1) => {
  return Array.from({ length: amountOfAgents }, (_, index) => {
    const patchedIndex = index + 1;
    if (patchedIndex === 1) {
      console.log(`Config for "${name}" has been generated`);
      return { name: name };
    }
    console.log(`Config for " ${name}${patchedIndex} has been generated`);
    return { name: `${name}${patchedIndex}` };
  });
};

module.exports = {
  clientsAgents: generateAgents("client", 100),
  dpcAgents: generateAgents("dpc"),
};
