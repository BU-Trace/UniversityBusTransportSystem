import mongoose, { ClientSession } from 'mongoose';

/**
 * Executes the provided callback inside a MongoDB transaction, ensuring
 * consistent start/commit/abort handling and session cleanup.
 */
export const runWithTransaction = async <T>(
  operation: (session: ClientSession) => Promise<T>
): Promise<T> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const result = await operation(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Failed to abort transaction:', abortError);
      }
    }
    throw error;
  } finally {
    await session.endSession();
  }
};
