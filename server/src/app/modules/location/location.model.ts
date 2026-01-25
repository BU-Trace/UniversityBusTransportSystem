import mongoose, { Schema } from 'mongoose';

const LocationSchema = new Schema(
	{
		bus: {
			type: Schema.Types.ObjectId,
			ref: 'Bus',
			required: true,
		},
		latitude: {
			type: Number,
			required: true,
		},
		longitude: {
			type: Number,
			required: true,
		},
		capturedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

export const Location = mongoose.model('Location', LocationSchema);
