import { Types } from 'mongoose';

export interface ILocation {
	_id?: string;
	bus: Types.ObjectId;
	latitude: number;
	longitude: number;
	capturedAt?: Date;
	createdAt?: Date;
	updatedAt?: Date;
}
