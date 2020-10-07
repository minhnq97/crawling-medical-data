const { configTest: config_test } = require("./config_test");
const path = require("path");

process.env = process.env || {};
process.env.NODE_ENV = process.env.NODE_ENV || "test";
const _config = {
  PORT: process.env.PORT || 3030,
  PROJECT_DIR: path.join(__dirname, ".."),

  KOA_SECRET: process.env.KOA_SECRET || "koa-secrets",
  DB_NAME: process.env.DB_NAME || "ai-campaign-process",
  DB_CONNECTION_URI:
    process.env.DB_CONNECTION_URI ||
    "mongodb://localhost:27017/ai-campaign-process",
};
if (process.env.NODE_ENV === "test") {
  module.exports = { config: config_test };
} else {
  module.exports = { config: _config };
}
