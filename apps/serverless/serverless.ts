import type { AWS } from "@serverless/typescript";

import uploadNFT from "@functions/uploadNFT";

const serverlessConfiguration: AWS = {
    service: "serverless",
    frameworkVersion: "3",
    plugins: ["serverless-esbuild"],
    provider: {
        name: "aws",
        region: "eu-central-1",
        runtime: "nodejs18.x",
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
            NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
            S3_BUCKET_UPLOAD: "upload-nft-bucket"
        }
    },
    // import the function via paths
    functions: { uploadNFT },
    package: { individually: true },
    custom: {
        esbuild: {
            bundle: true,
            minify: false,
            sourcemap: true,
            target: "node18",
            define: { "require.resolve": undefined },
            platform: "node",
            concurrency: 10
        }
    }
};

module.exports = serverlessConfiguration;
