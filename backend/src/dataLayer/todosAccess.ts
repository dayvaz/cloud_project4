import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from "../utils/logger"


const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('todoAccess');



export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosTableIndexId = process.env.TODO_ID_INDEX,) {
  }

  async getAllTodosByUserId(userId: String): Promise<TodoItem[]> {
    logger.info('Getting all todos')
    try{
      const result = await this.docClient.query({
          TableName: this.todosTable,
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: {
              ':userId': userId
          }
      }).promise()

      return Promise.resolve(result.Items as TodoItem[]);
    } catch (error) {
      return Promise.reject(error);
    }
  }


  async createTodo(todo: TodoItem): Promise<TodoItem> {
    try {
        logger.info("Creating a new todo", todo);

        const params: DocumentClient.PutItemInput = {
            TableName: this.todosTable,
            Item: todo
        };

        await this.docClient.put(params).promise();
        return Promise.resolve(todo as TodoItem);
    } catch (error) {
        return Promise.reject(error);
    }
}


  async updateTodoUrl(todoId: string, userId: string, attachmentUrl: string): Promise<void> {
    try {
        logger.info(`Updating attachment url of the todo: ${todoId} to url: ${attachmentUrl}`)

        const params: DocumentClient.UpdateItemInput = {
            TableName: this.todosTable,
            Key: {
              "userId": userId,
              "todoId": todoId
            },
            UpdateExpression: "set #a = :a",
            ExpressionAttributeNames: {
                '#a': 'attachmentUrl',
            },
            ExpressionAttributeValues: {
                ":a": attachmentUrl
            }
        };

        await this.docClient.update(params).promise();
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
  }

  async updateTodo(todoId: string, userId: string, item: TodoUpdate): Promise<TodoUpdate> {
    try {
        logger.info(`Updating todo with id: ${todoId}`)

        const params: DocumentClient.UpdateItemInput = {
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #a = :a, #b = :b, #c = :c",
            ExpressionAttributeNames: {
                '#a': 'name',
                '#b': 'dueDate',
                '#c': 'done'
            },
            ExpressionAttributeValues: {
                ":a": item.name,
                ":b": item.dueDate,
                ":c": item.done
            },
            ReturnValues: "UPDATED_NEW"
        }

        const updatedItem = await this.docClient.update(params).promise()
        return Promise.resolve(updatedItem.Attributes as TodoUpdate)
    } catch (error) {
        return Promise.reject(error);
    }
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    try {
        logger.info(`Deleting todo with id: ${todoId}`);

        const params: DocumentClient.DeleteItemInput = {
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            }
        };

        await this.docClient.delete(params).promise();
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
  }

  

  async  getTodoItem(todoId: string): Promise<TodoItem>  {
    logger.info('Checking if todo exists')
    try {
      const result = await this.docClient.query({
          IndexName: this.todosTableIndexId,
          TableName: this.todosTable,
          KeyConditionExpression: "todoId = :todoId",
          ExpressionAttributeValues: {
              ':todoId': todoId
          }
        }).promise();

        logger.info('getTodoItem result: ', result)

        if (result.Items && result.Items.length) {
          return Promise.resolve(result.Items[0] as TodoItem);
        }else{
          return Promise.resolve(undefined);
        }
      }catch (error) {
        return Promise.reject(error);
    }
  }


  async  todoExists(todoId: string): Promise<boolean> {
    logger.info('Checking if todo exists')

    const result = await this.docClient.query({
        IndexName: this.todosTableIndexId,
        TableName: this.todosTable,
        KeyConditionExpression: "todoId = :todoId",
        ExpressionAttributeValues: {
            ':todoId': todoId
        }
      }).promise();
  
    logger.info('Get todo: ', result)
    return !!result.Items
  }

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
