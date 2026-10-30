/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const createJiti = require("jiti");

const jiti = createJiti(__filename, {
  alias: {
    "@": path.resolve(__dirname, "../src"),
    "server-only": path.resolve(__dirname, "./mock-server-only.ts"),
  },
  interopDefault: true,
  esmResolve: true,
});

const testFile = process.argv[2] || "./backend.test.ts";
jiti(path.resolve(__dirname, testFile));
