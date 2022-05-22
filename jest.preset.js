const nxPreset = require('@nrwl/jest/preset').default;

const mongoPreset = require("@shelf/jest-mongodb/jest-preset");
const _ = require("lodash");
const merged = _.merge(nxPreset, mongoPreset);

module.exports = { ...merged };
