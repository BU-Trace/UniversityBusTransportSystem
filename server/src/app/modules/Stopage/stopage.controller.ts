import catchAsync from '../../utils/catchAsync';
import { StatusCodes } from 'http-status-codes';
import * as StopageService from './stopage.service';
import respondOrNotFound from '../../utils/respondOrNotFound';

export const addStopage = catchAsync(async (req, res) => {
  const stopage = await StopageService.createStopage(req.body);
  respondOrNotFound(res, stopage, {
    successMessage: 'Stopage created successfully',
    notFoundMessage: 'Stopage creation failed',
    successStatusCode: StatusCodes.CREATED,
  });
});

export const updateStopage = catchAsync(async (req, res) => {
  const stopage = await StopageService.updateStopage(req.params.id, req.body);
  respondOrNotFound(res, stopage, {
    successMessage: 'Stopage updated successfully',
    notFoundMessage: 'Stopage not found',
  });
});

export const deleteStopage = catchAsync(async (req, res) => {
  const stopage = await StopageService.deleteStopage(req.params.id);
  respondOrNotFound(res, stopage, {
    successMessage: 'Stopage deleted successfully',
    notFoundMessage: 'Stopage not found',
  });
});

export const getAllStopages = catchAsync(async (_req, res) => {
  const stopages = await StopageService.getAllStopages();
  respondOrNotFound(res, stopages, {
    successMessage: 'Stopages retrieved successfully',
    notFoundMessage: 'Stopages not found',
  });
});
