import { Request, Response } from 'express';
import * as RouteService from './route.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';

export const addRoute = catchAsync(async (req: Request, res: Response) => {
  const route = await RouteService.createRoute(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Route created successfully',
    data: route,
  });
});
//  --- IGNORE ---
export const updateRoute = catchAsync(async (req: Request, res: Response) => {
  const route = await RouteService.updateRoute(req.params.id, req.body);
  if (!route) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Route not found',
      data: null,
    });
  }
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Route updated successfully',
    data: route,
  });
});

export const deleteRoute = catchAsync(async (req: Request, res: Response) => {
  const route = await RouteService.deleteRoute(req.params.id);
  if (!route) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Route not found',
      data: null,
    });
  }
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Route deleted successfully',
    data: route,
  });
});

export const getAllRoutes = catchAsync(async (_req: Request, res: Response) => {
  const routes = await RouteService.getAllRoutes();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Routes retrieved successfully',
    data: routes,
  });
});
