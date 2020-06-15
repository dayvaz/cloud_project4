import 'source-map-support/register'

import { SNSEvent, SNSHandler, S3Event } from 'aws-lambda';
import "source-map-support/register";

import { getTodoItem, updateTodoUrl } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { S3Access } from '../../dataLayer/s3Access'

const logger = createLogger('updateTodoAttachment');

export const handler: SNSHandler = async (event: SNSEvent) => {
    logger.info('Processing SNS event ', JSON.stringify(event))
    for (const snsRecord of event.Records) {
      const s3EventStr = snsRecord.Sns.Message
      console.log('Processing S3 event', s3EventStr)
      const s3Event: S3Event = JSON.parse(s3EventStr)
  
      for (const record of s3Event.Records) {
        try {
            const todoId = record.s3.object.key;
            const todoItem = await getTodoItem(todoId);

            if (!todoItem) {
                logger.error("Todo item does not exist ", todoId);
                continue;
            }

            await updateTodoUrl(todoId, todoItem.userId, S3Access.getAttachmentUrl(todoId));
        } catch (error) {
            logger.error("Processing event record", error);
        }
      }
    }
  }
  
