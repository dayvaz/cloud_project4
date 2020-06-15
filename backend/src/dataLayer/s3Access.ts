import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from "../utils/logger"

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('s3Access');


export class S3Access {

    constructor(
      private readonly s3 = new XAWS.S3({signatureVersion: 'v4'}),
      private readonly bucketName = process.env.TODOS_S3_BUCKET,
      private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
    }


    getUploadUrl(todoId: string) {

        logger.info(`Creating upload url for todoId: ${todoId}`)
        if (!todoId) {
            return "";
        }

        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: this.urlExpiration
        })
    }

    static getAttachmentUrl(todoId: string): string {
        return `https://${process.env.TODOS_S3_BUCKET}.s3.amazonaws.com/${todoId}`;
    }
}
