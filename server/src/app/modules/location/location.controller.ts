import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import * as LocationService from './location.service';

export const addLocation = catchAsync(async (req, res) => {
  const location = await LocationService.createLocation(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Location saved successfully',
    data: location,
  });
});

export const updateLocation = catchAsync(async (req, res) => {
  const location = await LocationService.updateLocation(req.params.id, req.body);

  if (!location) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Location not found',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Location updated successfully',
    data: location,
  });
});

export const deleteLocation = catchAsync(async (req, res) => {
  const location = await LocationService.deleteLocation(req.params.id);

  if (!location) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Location not found',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Location deleted successfully',
    data: location,
  });
});

export const getAllLocations = catchAsync(async (_req, res) => {
  const locations = await LocationService.getAllLocations();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Locations retrieved successfully',
    data: locations,
  });
});

export const getLocation = catchAsync(async (req, res) => {
  const location = await LocationService.getLocation(req.params.id);

  if (!location) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Location not found',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Location retrieved successfully',
    data: location,
  });
});

export const getLatestLocationByBus = catchAsync(async (req, res) => {
  const location = await LocationService.getLatestLocationByBus(req.params.busId);

  if (!location) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'No location found for this bus',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Latest location retrieved successfully',
    data: location,
  });
});
