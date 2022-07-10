import { Injectable } from "@nestjs/common";
import * as AWS from "aws-sdk";
import { isNil } from "lodash";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AwsService {
    private _s3: AWS.S3;

    constructor(private _configService: ConfigService) {
        const credentials = new AWS.Credentials(
            this._configService.get("AWS_ACCESS_KEY"),
            this._configService.get("AWS_SECRET_KEY")
        );

        const config = new AWS.Config({ credentials, region: this._configService.get("AWS_REGION") });
        AWS.config.update(config);
    }

    getS3(): AWS.S3 {
        if (isNil(this._s3)) {
            this._s3 = new AWS.S3({ apiVersion: "2006-03-01" });
        }

        return this._s3;
    }
}
