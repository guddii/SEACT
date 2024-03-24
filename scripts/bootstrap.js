const fs = require("fs");

const ACCOUNT_URL = "http://proxy.localhost:4000/.account/";

const login = async ({ email, password }) => {
  const indexResponse = await fetch(ACCOUNT_URL);
  const { controls } = await indexResponse.json();

  const response = await fetch(controls.password.login, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return response.json();
};

const generateToken = async ({ authorization }, { webId }) => {
  const indexResponse = await fetch(ACCOUNT_URL, {
    headers: { authorization: `CSS-Account-Token ${authorization}` },
  });
  const { controls } = await indexResponse.json();

  const response = await fetch(controls.account.clientCredentials, {
    method: "POST",
    headers: {
      authorization: `CSS-Account-Token ${authorization}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name: `${new Date().toISOString()}`,
      webId,
    }),
  });

  return response.json();
};

const generateAgentWithCredentials = async ({ name }) => {
  const agent = {
    name,
    email: `${name}@example.com`,
    password: "secret!",
    storage: `http://proxy.localhost:4000/${name}`,
    webId: `http://proxy.localhost:4000/${name}/profile/card#me`,
  };

  const { authorization } = await login(agent);

  const credential = await generateToken({ authorization }, agent);

  return {
    ...agent,
    ...credential,
  };
};

const writeAgentToEnv = (agents) => {
  for (const agent of agents) {
    const NAME = agent.name.toUpperCase();
    fs.appendFileSync(".env", `\n# ${NAME} Agent (generated)\n`);
    fs.appendFileSync(".env", `${NAME}_WEB_ID="${agent.webId}"\n`);
    fs.appendFileSync(".env", `${NAME}_STORAGE="${agent.storage}"\n`);
    fs.appendFileSync(".env", `${NAME}_ID="${agent.id}"\n`);
    fs.appendFileSync(".env", `${NAME}_SECRET="${agent.secret}"\n`);
  }
};

const writeAgentToPrivateHttpClientEnv = (agents) => {
  const dev = {};
  for (const agent of agents) {
    dev[`${agent.name}Id`] = agent.id;
    dev[`${agent.name}Secret`] = agent.secret;
  }

  fs.writeFileSync(
    "tests/http/http-client.private.env.json",
    JSON.stringify({ dev }, null, 2),
  );
};

(async () => {
  const client = await generateAgentWithCredentials({ name: "client" });
  const dpc = await generateAgentWithCredentials({ name: "dpc" });

  writeAgentToEnv([dpc]);
  writeAgentToPrivateHttpClientEnv([client, dpc]);
})();
