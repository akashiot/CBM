const os = require("os");
const ip = os.networkInterfaces();
const url = ip.WiFi ?  ip.WiFi[0].address : ip['Loopback Pseudo-Interface 1'][1].address;
const ipAddress = url;

exports.connectionURLS = ipAddress;
exports.baseurl2 = `https://${ipAddress}`;
