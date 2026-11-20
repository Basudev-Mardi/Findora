const app = require("./app");
const { env } = require("./config/env");

app.listen(env.port, () => {
  console.log(
    `[findora-backend] Running on http://localhost:${env.port} (mode: ${env.dataMode})`
  );
});
