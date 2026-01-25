import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import * as IssueService from './issue.service';

export const addIssue = catchAsync(async (req, res) => {
  const issue = await IssueService.createIssue(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Issue created successfully',
    data: issue,
  });
});

export const updateIssue = catchAsync(async (req, res) => {
  const issue = await IssueService.updateIssue(req.params.id, req.body);

  if (!issue) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Issue not found',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Issue updated successfully',
    data: issue,
  });
});

export const deleteIssue = catchAsync(async (req, res) => {
  const issue = await IssueService.deleteIssue(req.params.id);

  if (!issue) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Issue not found',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Issue deleted successfully',
    data: issue,
  });
});

export const getAllIssues = catchAsync(async (_req, res) => {
  const issues = await IssueService.getAllIssues();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Issues retrieved successfully',
    data: issues,
  });
});

export const getIssue = catchAsync(async (req, res) => {
  const issue = await IssueService.getIssue(req.params.id);

  if (!issue) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Issue not found',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Issue retrieved successfully',
    data: issue,
  });
});
