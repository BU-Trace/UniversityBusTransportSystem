import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { DashboardServices } from './dashboard.service';

const getStats = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardServices.getDashboardStats();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Dashboard stats fetched successfully',
    data: result,
  });
});

export const DashboardController = {
  getStats,
};
