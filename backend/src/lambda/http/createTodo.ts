import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { getUserId } from "../utils";
import * as middy from "middy";
import { cors } from "middy/middlewares";

const logger = createLogger('createTodo');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event:', event);
  try {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const userId = getUserId(event)
    const newItem = await createTodo(newTodo, userId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
      })
    };
  } catch (error) {
    logger.error("createTodo call error ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error
      })
    }
  }
});

handler.use(
  cors({
    origin: "*",
    credentials: true
  })
);