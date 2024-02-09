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

const writeEnv = async ({ name }) => {
  const agent = {
    name,
    NAME: name.toUpperCase(),
    email: `${name}@example.com`,
    password: "secret!",
    storage: `http://proxy.localhost:4000/${name}`,
    webId: `http://proxy.localhost:4000/${name}/profile/card#me`
  }

  const { authorization } = await login(agent);

  const { id, secret } = await generateToken(
    { authorization },
    agent,
  );

  fs.appendFileSync(".env", `\n# ${agent.NAME} Agent (generated)\n`);
  fs.appendFileSync(".env", `${agent.NAME}_WEB_ID="${agent.webId}"\n`);
  fs.appendFileSync(".env", `${agent.NAME}_STORAGE="${agent.storage}"\n`);
  fs.appendFileSync(".env", `${agent.NAME}_ID="${id}"\n`);
  fs.appendFileSync(".env", `${agent.NAME}_SECRET="${secret}"\n`);
};

(async () => {
  await writeEnv({ name: "client" });
  await writeEnv({ name: "dpc" });
})();
