import { Request, Response } from 'express';
import * as RouteService from './route.service';
import catchAsync from '../../utils/catchAsync';
import { StatusCodes } from 'http-status-codes';
import respondOrNotFound from '../../utils/respondOrNotFound';

export const addRoute = catchAsync(async (req: Request, res: Response) => {
  const route = await RouteService.createRoute(req.body);
  respondOrNotFound(res, route, {
    successMessage: 'Route created successfully',
    notFoundMessage: 'Route creation failed',
    successStatusCode: StatusCodes.CREATED,
  });
});
//  --- IGNORE ---
export const updateRoute = catchAsync(async (req: Request, res: Response) => {
  const route = await RouteService.updateRoute(req.params.id, req.body);
  respondOrNotFound(res, route, {
    successMessage: 'Route updated successfully',
    notFoundMessage: 'Route not found',
  });
});

export const deleteRoute = catchAsync(async (req: Request, res: Response) => {
  const route = await RouteService.deleteRoute(req.params.id);
  respondOrNotFound(res, route, {
    successMessage: 'Route deleted successfully',
    notFoundMessage: 'Route not found',
  });
});

export const getAllRoutes = catchAsync(async (_req: Request, res: Response) => {
  const routes = await RouteService.getAllRoutes();
  respondOrNotFound(res, routes, {
    successMessage: 'Routes retrieved successfully',
    notFoundMessage: 'No routes found',
  });
});
