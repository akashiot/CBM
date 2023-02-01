const os = require("os");
const ip = os.networkInterfaces();
const url = ip['Wi-Fi'] ?  ip['Wi-Fi'][0].address : ip['Loopback Pseudo-Interface 1'][1].address;
const ipAddress = url;

console.log("url",ip);

exports.connectionURLS = ipAddress;
exports.baseurl2 = `https://${ipAddress}`;
