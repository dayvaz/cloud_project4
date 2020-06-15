import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { deleteTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { getUserId } from "../utils";
import * as middy from "middy";
import { cors } from "middy/middlewares";

const logger = createLogger('deleteTodo');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  logger.info("Processing event: ", event)
  try {
    const todoId = event.pathParameters.todoId

    const userId = getUserId(event)

    await deleteTodo(todoId,userId)

    return {
      statusCode: 200,
      body: ""
    }
  } catch (error) {
    logger.error("deleteTodo call error ", error);
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

