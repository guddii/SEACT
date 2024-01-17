import { log } from "core";
import { createServer } from "./server";

const port = 4000;
const server = createServer();

server.listen(port, () => {
  log(`api running on ${port}`);
});
