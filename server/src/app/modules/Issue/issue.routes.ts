import express from 'express';
import * as IssueController from './issue.controller';

const router = express.Router();

router.post('/', IssueController.addIssue);
router.put('/:id', IssueController.updateIssue);
router.delete('/:id', IssueController.deleteIssue);
router.get('/', IssueController.getAllIssues);
router.get('/:id', IssueController.getIssue);

export default router;
