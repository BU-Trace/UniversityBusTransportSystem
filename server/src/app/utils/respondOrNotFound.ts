import { StatusCodes } from 'http-status-codes';
import { Response } from 'express';
import sendResponse from './sendResponse';

type ResponseOptions = {
  successMessage: string;
  notFoundMessage: string;
  successStatusCode?: number;
};

const respondOrNotFound = <T>(
  res: Response,
  entity: T | null | undefined,
  { successMessage, notFoundMessage, successStatusCode = StatusCodes.OK }: ResponseOptions
) => {
  if (!entity) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: notFoundMessage,
      data: null,
    });
  }

  return sendResponse(res, {
    statusCode: successStatusCode,
    success: true,
    message: successMessage,
    data: entity,
  });
};

export default respondOrNotFound;
