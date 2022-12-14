"use strict";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const s3 = new S3Client({});

import { middyfy } from "@libs/lambda";

const uploadNft = async (event: { body: { key: string; contentType: string } }) => {
    const body = event.body;

    const { key, contentType } = body;
    console.log(JSON.stringify(body));

    let [imageName, extension] = contentType.split("/");

    const Key = `${key}.${extension}`;

    // Get signed URL from S3
    const s3Params = {
        Bucket: process.env.S3_BUCKET_UPLOAD,
        ContentType: contentType,
        Key
    };
    /* const uploadURL = await s3.getSignedUrlPromise("putObject", s3Params); */

    const s3Uri = `https://${process.env.S3_BUCKET_UPLOAD}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}.${extension}`;
    const command = new PutObjectCommand(s3Params);
    // Create the presigned URL.
    const signedUrl = await getSignedUrl(s3, command, {
        expiresIn: 300
    });

    const response = JSON.stringify({
        uploadURL: signedUrl,
        s3Uri
    });
    return response;
};

export const main = middyfy(uploadNft);
