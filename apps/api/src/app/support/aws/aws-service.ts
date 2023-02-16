import { Injectable } from "@nestjs/common";
import * as AWS from "aws-sdk";
import { ConfigService } from "@nestjs/config";
import { PromiseResult } from "aws-sdk/lib/request";
import { AWSError } from "aws-sdk";
import { DeleteObjectOutput } from "aws-sdk/clients/s3";

@Injectable()
export class AwsService {
    private _s3: AWS.S3;

    constructor(private _configService: ConfigService) {
        const credentials = new AWS.Credentials(
            this._configService.getOrThrow("AWS_ACCESS_KEY"),
            this._configService.getOrThrow("AWS_SECRET_KEY")
        );

        const config = new AWS.Config({ credentials, region: this._configService.get("AWS_REGION") });
        AWS.config.update(config);
        this._s3 = new AWS.S3({ apiVersion: "2006-03-01" });
    }

    async getObjectFromS3(
        params: AWS.S3.Types.GetObjectRequest
    ): Promise<PromiseResult<AWS.S3.GetObjectOutput, AWS.AWSError>> {
        return await this._s3.getObject(params).promise();
    }

    async deleteObjectFromS3(
        params: AWS.S3.Types.DeleteObjectRequest
    ): Promise<PromiseResult<DeleteObjectOutput, AWSError>> {
        return await this._s3.deleteObject(params).promise();
    }
}
