
export interface IStopage {
	_id?: string;
	stopage_id?: string;
	name: string;
	latitude: number;
	longitude: number;
	isActive?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}
