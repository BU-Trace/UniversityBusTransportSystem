import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import * as BusService from './bus.service';

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
  if (!bus) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Bus not found',
      data: null,
    });
  }
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bus updated successfully',
    data: bus,
  });
});

export const deleteBus = catchAsync(async (req, res) => {
  const bus = await BusService.deleteBus(req.params.id);
  if (!bus) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Bus not found',
      data: null,
    });
  }
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bus deleted successfully',
    data: bus,
  });
});

export const getAllBuses = catchAsync(async (req, res) => {
  const buses = await BusService.getAllBuses();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Buses fetched successfully',
    data: buses,
  });
});
