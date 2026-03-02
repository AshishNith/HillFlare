/**
 * Wipe ALL data from the database.
 * Removes: Users, Matches, Swipes, CrushSelections, Chats, Messages,
 *          Notifications, Blocks, Reports, Colleges.
 *
 * Usage:  npx tsx src/wipe.ts
 */
import { connectDb } from './config/db';
import { User } from './models/User';
import { Match } from './models/Match';
import { Swipe } from './models/Swipe';
import { CrushSelection } from './models/CrushSelection';
import { Chat } from './models/Chat';
import { Message } from './models/Message';
import { Notification } from './models/Notification';
import { Block } from './models/Block';
import { Report } from './models/Report';
import { College } from './models/College';

const wipe = async (): Promise<void> => {
  await connectDb();
  console.log('[wipe] Connected to database. Wiping ALL data...\n');

  const results = await Promise.all([
    User.deleteMany({}).then((r) => ({ collection: 'Users', deleted: r.deletedCount })),
    Match.deleteMany({}).then((r) => ({ collection: 'Matches', deleted: r.deletedCount })),
    Swipe.deleteMany({}).then((r) => ({ collection: 'Swipes', deleted: r.deletedCount })),
    CrushSelection.deleteMany({}).then((r) => ({ collection: 'CrushSelections', deleted: r.deletedCount })),
    Chat.deleteMany({}).then((r) => ({ collection: 'Chats', deleted: r.deletedCount })),
    Message.deleteMany({}).then((r) => ({ collection: 'Messages', deleted: r.deletedCount })),
    Notification.deleteMany({}).then((r) => ({ collection: 'Notifications', deleted: r.deletedCount })),
    Block.deleteMany({}).then((r) => ({ collection: 'Blocks', deleted: r.deletedCount })),
    Report.deleteMany({}).then((r) => ({ collection: 'Reports', deleted: r.deletedCount })),
    College.deleteMany({}).then((r) => ({ collection: 'Colleges', deleted: r.deletedCount })),
  ]);

  for (const { collection, deleted } of results) {
    console.log(`  ✓ ${collection}: ${deleted} documents removed`);
  }

  const total = results.reduce((sum, r) => sum + r.deleted, 0);
  console.log(`\n[wipe] Done — ${total} total documents removed.`);
  process.exit(0);
};

wipe().catch((error) => {
  console.error('[wipe] Failed:', error);
  process.exit(1);
});
