import { z } from 'zod';
import { Issue } from './issue.model';
import { IIssue } from './issue.interface';

const issueSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['bug', 'feature', 'complaint', 'other']).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  reporter: z.any().nullable().optional(),
  relatedBus: z.any().nullable().optional(),
  relatedRoute: z.any().nullable().optional(),
  submittedByRole: z.enum(['superadmin', 'admin', 'driver']).optional(),
  contactInfo: z.string().optional(),
  solution: z.string().optional(),
});

const updateSchema = issueSchema.partial();

const generateNextIssueId = async (): Promise<string> => {
  const latest = await Issue.findOne({}, {}, { sort: { issue_id: -1 } });
  let nextId = 1;

  if (latest?.issue_id) {
    const match = latest.issue_id.match(/issue_(\d+)/);
    if (match) nextId = parseInt(match[1], 10) + 1;
  }

  return `issue_${nextId}`;
};

export const createIssue = async (payload: IIssue) => {
  const data = issueSchema.parse(payload);
  const issue_id = await generateNextIssueId();

  const issue = await Issue.create({ ...data, issue_id });
  return issue;
};

export const updateIssue = async (id: string, payload: Partial<IIssue>) => {
  if (Object.keys(payload).length) {
    updateSchema.parse(payload);
  }

  const issue = await Issue.findByIdAndUpdate(id, payload, { new: true });
  return issue;
};

export const deleteIssue = async (id: string) => {
  return await Issue.findByIdAndDelete(id);
};

export const getAllIssues = async () => {
  return await Issue.find().sort({ createdAt: -1 });
};

export const getIssue = async (id: string) => {
  return await Issue.findById(id);
};
