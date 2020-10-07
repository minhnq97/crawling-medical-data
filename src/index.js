const { config } = require("./config");
require("./db/mongo_connection");
const { NodeHelper } = require("./lib/node_helper");
console.log(`listening on port ${config.PORT}`);
require("./onetime/crawl_cac_cau_hoi_benh.js");
NodeHelper.systemShowStatus();
