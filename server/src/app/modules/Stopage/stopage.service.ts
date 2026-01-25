import { Stopage } from './stopage.model';
import { IStopage } from './stopage.interface';
import { generateNextStopageId, stopageSchema } from './stopage.util';

export const createStopage = async (payload: IStopage) => {
  stopageSchema.parse(payload);
  const stopage_id = await generateNextStopageId();
  const stopage = await Stopage.create({ ...payload, stopage_id });
  return stopage;
};

export const updateStopage = async (id: string, payload: Partial<IStopage>) => {
  if (payload.name || payload.latitude || payload.longitude || payload.isActive !== undefined) {
    stopageSchema.partial().parse(payload);
  }
  const stopage = await Stopage.findByIdAndUpdate(id, payload, { new: true });
  return stopage;
};

export const deleteStopage = async (id: string) => {
  return await Stopage.findByIdAndDelete(id);
};

export const getAllStopages = async () => {
  return await Stopage.find();
};
