

import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import * as StopageService from './stopage.service';

export const addStopage = catchAsync(async (req, res) => {
	const stopage = await StopageService.createStopage(req.body);
	sendResponse(res, {
		statusCode: StatusCodes.CREATED,
		success: true,
		message: 'Stopage created successfully',
		data: stopage,
	});
});

export const updateStopage = catchAsync(async (req, res) => {
	const stopage = await StopageService.updateStopage(req.params.id, req.body);
	if (!stopage) {
		return sendResponse(res, {
			statusCode: StatusCodes.NOT_FOUND,
			success: false,
			message: 'Stopage not found',
			data: null,
		});
	}
	sendResponse(res, {
		statusCode: StatusCodes.OK,
		success: true,
		message: 'Stopage updated successfully',
		data: stopage,
	});
});

export const deleteStopage = catchAsync(async (req, res) => {
	const stopage = await StopageService.deleteStopage(req.params.id);
	if (!stopage) {
		return sendResponse(res, {
			statusCode: StatusCodes.NOT_FOUND,
			success: false,
			message: 'Stopage not found',
			data: null,
		});
	}
	sendResponse(res, {
		statusCode: StatusCodes.OK,
		success: true,
		message: 'Stopage deleted successfully',
		data: stopage,
	});
});

export const getAllStopages = catchAsync(async (_req, res) => {
	const stopages = await StopageService.getAllStopages();
	sendResponse(res, {
		statusCode: StatusCodes.OK,
		success: true,
		message: 'Stopages retrieved successfully',
		data: stopages,
	});
});
