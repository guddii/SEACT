export const generateAgents = (name: string, amountOfAgents = 1): string[] => {
  return Array.from({ length: amountOfAgents }, (_, index) => {
    const patchedIndex = index + 1;
    return `${name}${patchedIndex}`;
  });
};
