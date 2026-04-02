import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import * as BusService from './bus.service';
import respondOrNotFound from '../../utils/respondOrNotFound';

export const addBus = catchAsync(async (req, res) => {
  const bus = await BusService.createBus(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Bus created successfully',
    data: bus,
  });
});

export const updateBus = catchAsync(async (req, res) => {
  const bus = await BusService.updateBus(req.params.id, req.body);

  respondOrNotFound(res, bus, {
    successMessage: 'Bus updated successfully',
    notFoundMessage: 'Bus not found',
  });
});

export const deleteBus = catchAsync(async (req, res) => {
  const bus = await BusService.deleteBus(req.params.id);

  respondOrNotFound(res, bus, {
    successMessage: 'Bus deleted successfully',
    notFoundMessage: 'Bus not found',
  });
});

export const getAllBuses = catchAsync(async (_req, res) => {
  const buses = await BusService.getAllBuses();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Buses retrieved successfully',
    data: buses,
  });
});

export const getSingleBus = catchAsync(async (req, res) => {
  const bus = await BusService.getSingleBus(req.params.id);

  respondOrNotFound(res, bus, {
    successMessage: 'Bus retrieved successfully',
    notFoundMessage: 'Bus not found',
  });
});
