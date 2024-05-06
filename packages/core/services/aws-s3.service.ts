import { DeleteObjectsCommand, ListObjectsCommand, ObjectCannedACL, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { UploadedFileDto } from '@core/dtos';
import { Injectable } from '@nestjs/common';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import * as https from 'https';
import type { IFile } from '@core/interfaces';
import { myNanoid, ResDto } from 'shared';
import { getUTCDate } from '@core/utils/getUTCDate';

type S3Config = {
  endpoint: string;
  bucketApiVersion: string;
  bucketRegion: string;
  bucketName: string;
  accessKey: string;
  secretKey: string;
};

@Injectable()
export class AwsS3Service {
  private readonly s3: S3;

  constructor(private readonly s3Config: S3Config) {
    this.s3 = new S3({
      endpoint: this.s3Config.endpoint,
      apiVersion: this.s3Config.bucketApiVersion,
      region: this.s3Config.bucketRegion,
      credentials: {
        accessKeyId: this.s3Config.accessKey,
        secretAccessKey: this.s3Config.secretKey,
      },
      requestHandler: new NodeHttpHandler({
        httpsAgent: new https.Agent({
          secureProtocol: 'TLSv1_2_method',
        }),
      }),
    });
  }

  async uploadImage(imageId: string, file: IFile, bucketName: string, folder = ''): Promise<UploadedFileDto> {
    const fileExtension = file.mimetype.split('/')[1];
    const newFolder = (bucketName.split('/')[1] || '') + folder + '/' + getUTCDate();
    const key = newFolder + '/' + `${imageId}.${fileExtension}`;

    console.log('key', key, bucketName, newFolder);
    const uploadedFile = await this.s3.putObject({
      Bucket: bucketName.split('/')[0],
      Body: file.buffer,
      // ACL: 'public-read',
      Key: key,
      ContentType: file.mimetype,
    });

    return {
      key,
      bucket: bucketName.split('/')[0],
      region: this.s3Config.bucketRegion,
      objectId: uploadedFile.VersionId!,
      url: `${bucketName}/${key}`,
    };
  }

  async generatePutObjectUrl(key: string, contentType: string): Promise<string> {
    const putObjectParams = {
      Bucket: this.s3Config.bucketName.split('/')[0],
      Key: this.s3Config.bucketName.split('/')[1] + '/' + key,
      ACL: ObjectCannedACL.public_read,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(putObjectParams);

    return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  async deleteImage(key: string): Promise<ResDto> {
    try {
      const result = await this.s3.deleteObject({
        Bucket: this.s3Config.bucketName.split('/')[0],
        Key: key,
      });

      return {
        success: result.DeleteMarker as boolean,
        message: 'Success',
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      };
    }
  }

  async deleteMultiImages(keys: string[]): Promise<ResDto> {
    try {
      const command = new DeleteObjectsCommand({
        Bucket: this.s3Config.bucketName.split('/')[0],
        Delete: {
          Objects: keys.map((key) => ({
            Key: key,
          })),
        },
        BypassGovernanceRetention: true,
      });

      const { Deleted } = await this.s3.send(command);

      return {
        success: true,
        data: Deleted?.map((d, index) => `${index + 1} - ${d.Key}`) || [],
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      };
    }
  }

  async getAllObjects(bucketName: string): Promise<Array<string | undefined>> {
    const listObjectsParams = {
      Bucket: bucketName,
      MaxKeys: 1000,
    };

    const command = new ListObjectsCommand(listObjectsParams);

    try {
      const response = await this.s3.send(command);

      return response.Contents?.map((object) => object.Key) || [];
    } catch (error) {
      // Handle any errors that occur during the operation
      console.error('Error listing objects:', error);

      throw error; // You may want to handle or log the error accordingly
    }
  }
}
