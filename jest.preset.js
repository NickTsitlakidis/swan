const nxPreset = require("@nrwl/jest/preset").default;

const mongoPreset = require("@shelf/jest-mongodb/jest-preset");
const merged = Object.assign(nxPreset, mongoPreset);

module.exports = { ...merged };
