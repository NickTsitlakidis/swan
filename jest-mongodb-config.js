module.exports = {
    mongodbMemoryServerOptions: {
        binary: {
            version: "6.0.4",
            skipMD5: true
        },
        instance: {
            dbName: "unit-mongo"
        },
        autoStart: false
    }
};
