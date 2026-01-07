import { z } from 'zod';
import { Stopage } from './stopage.model';

export const stopageSchema = z.object({
	name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
	latitude: z.number()
		.min(-90, { message: 'Latitude must be between -90 and 90' })
		.max(90, { message: 'Latitude must be between -90 and 90' }),
	longitude: z.number()
		.min(-180, { message: 'Longitude must be between -180 and 180' })
		.max(180, { message: 'Longitude must be between -180 and 180' }),
	isActive: z.boolean().optional(),
});

export const generateNextStopageId = async (): Promise<string> => {
	const latest = await Stopage.findOne({}, {}, { sort: { stopage_id: -1 } });
	let nextId = 1;
	if (latest && latest.stopage_id) {
		const match = latest.stopage_id.match(/stopage_(\d+)/);
		if (match) {
			nextId = parseInt(match[1], 10) + 1;
		}
	}
	return `stopage_${nextId}`;
};
