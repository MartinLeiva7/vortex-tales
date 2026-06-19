import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';

// Users Table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
});

// Game Progress Table
export const progress = sqliteTable(
  'progress',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    storyId: text('story_id').notNull(),
    currentChapter: integer('current_chapter').notNull(),
    currentNodeId: text('current_node_id').notNull(),
    playtimeSeconds: integer('playtime_seconds').default(0).notNull(),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP').notNull(),
  },
  (table) => ({
    userStoryUnique: unique().on(table.userId, table.storyId),
  })
);

// User Trophies Table
export const userTrophies = sqliteTable(
  'user_trophies',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    storyId: text('story_id').notNull(),
    trophyId: text('trophy_id').notNull(),
    unlockedAt: text('unlocked_at').default('CURRENT_TIMESTAMP').notNull(),
  },
  (table) => ({
    userTrophyUnique: unique().on(table.userId, table.storyId, table.trophyId),
  })
);
