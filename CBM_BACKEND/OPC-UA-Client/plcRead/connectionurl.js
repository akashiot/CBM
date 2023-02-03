const ip = require("ip");
const url = ip.address();

exports.connectionURLS = url;
exports.baseurl2 = `https://${url}`;