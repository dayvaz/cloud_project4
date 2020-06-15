import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getAllTodosByUserId } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { getUserId } from "../utils";
import * as middy from "middy";
import { cors } from "middy/middlewares";

const logger = createLogger('getTodos');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info("Processing event", event);
    const userId = getUserId(event)
    const todos = await getAllTodosByUserId(userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    };
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
    origin: "*"
  })
);

