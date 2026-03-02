import { connectDb } from './config/db';
import mongoose from 'mongoose';

async function fix() {
  await connectDb();
  const db = mongoose.connection.db!;
  const col = db.collection('matches');

  // List all indexes
  const indexes = await col.indexes();
  console.log('Current indexes:', JSON.stringify(indexes, null, 2));

  // Drop the bad index (user1 + user2 instead of user1Id + user2Id)
  for (const idx of indexes) {
    if (idx.key && (idx.key.user1 !== undefined || idx.key.user2 !== undefined)) {
      console.log('Dropping stale index:', idx.name);
      await col.dropIndex(idx.name!);
      console.log('Dropped!');
    }
  }

  // Also drop all matches data to clean up
  const deleted = await col.deleteMany({});
  console.log('Deleted', deleted.deletedCount, 'match documents');

  // Verify
  const after = await col.indexes();
  console.log('Indexes after fix:', JSON.stringify(after, null, 2));

  process.exit(0);
}

fix().catch((e) => {
  console.error(e);
  process.exit(1);
});
