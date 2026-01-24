export interface IBus {
  _id?: string;
  name: string;
  type: 'single-decker' | 'double-decker';
  createdAt?: Date;
  updatedAt?: Date;
}
