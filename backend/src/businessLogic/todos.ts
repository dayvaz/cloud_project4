import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoAccess } from '../dataLayer/todosAccess'
import { S3Access } from '../dataLayer/s3Access'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()
const s3Access = new S3Access()

export async function getAllTodosByUserId(userId: string): Promise<TodoItem[]> {
  return await todoAccess.getAllTodosByUserId(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  const todoId = uuid.v4()

  return await todoAccess.createTodo({
    createdAt: new Date().toISOString(),
    done: false,
    dueDate: createTodoRequest.dueDate,
    name: createTodoRequest.name,
    todoId,
    userId,
    attachmentUrl: ""
  })
}

export async function todoExists(
  todoId: string
): Promise<boolean> {

  return await todoAccess.todoExists (todoId)
}

export async function getTodoItem(
  todoId: string
): Promise<TodoItem> {

  return await todoAccess.getTodoItem(todoId)
}

export async function updateTodo(
    todoId: string,
    userId: string,
    updateTodoRequest: UpdateTodoRequest
  ): Promise<TodoUpdate> {
  
    return await todoAccess.updateTodo(todoId,userId,updateTodoRequest)
}

export async function deleteTodo(
    todoId: string,
    userId: string
  ): Promise<void> {
  
    return await todoAccess.deleteTodo(todoId,userId)
}

export async function  updateTodoUrl(
  todoId: string, 
  userId: string,
  attachmentUrl: string
  ): Promise<void> {
   return await todoAccess.updateTodoUrl(todoId, userId, attachmentUrl)
}


export function getUploadUrl (todoId: string) {
   return s3Access.getUploadUrl(todoId)
} 
