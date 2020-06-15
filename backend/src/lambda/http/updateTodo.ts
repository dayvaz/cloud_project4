import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { getUserId } from "../utils";
import * as middy from "middy";
import { cors } from "middy/middlewares";

const logger = createLogger('updateTodo');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Processing event:', event);

    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    const userId = getUserId(event)
    await updateTodo(todoId, userId, updatedTodo)

    return {
      statusCode: 200,
      body: ""
    }
  } catch (error) {
    logger.error("getAllTodosByUserId call error ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error
      })
    };
  }
});

handler.use(
  cors({
    origin: "*",
    credentials: true
  })
);