import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums

export const analysisStatusEnum = pgEnum('analysis_status', [
  'DONE',
  'PENDING',
  'FAILED',
]);

export const sentimentEnum = pgEnum('sentiment', [
  'positive',
  'negative',
  'neutral',
]);

export const overallSentimentEnum = pgEnum('overall_sentiment', [
  'positive',
  'negative',
  'neutral',
  'mixed',
]);

// Auth Tables

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)]
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)]
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)]
);

// Businesses

export const businesses = pgTable('businesses', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type'),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reviews

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').references(() => businesses.id, {
    onDelete: 'cascade',
  }),
  campaignId: integer('campaign_id').references(() => campaigns.id, {
    onDelete: 'set null',
  }),
  rating: integer('rating').notNull(),
  text: text('text').notNull(),
  overallSentiment: overallSentimentEnum('overall_sentiment'),
  analysisStatus: analysisStatusEnum('analysis_status')
    .notNull()
    .default('PENDING'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Review Aspects

export const reviewAspects = pgTable('review_aspects', {
  id: serial('id').primaryKey(),
  reviewId: integer('review_id')
    .notNull()
    .references(() => reviews.id, {
      onDelete: 'cascade',
    }),
  name: text('name').notNull(),
  sentiment: sentimentEnum('sentiment').notNull(),
  evidence: text('evidence').notNull(),
});

// Relations

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  businesses: many(businesses),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  user: one(user, {
    fields: [businesses.userId],
    references: [user.id],
  }),
  reviews: many(reviews),
  campaigns: many(campaigns),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  business: one(businesses, {
    fields: [campaigns.businessId],
    references: [businesses.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  business: one(businesses, {
    fields: [reviews.businessId],
    references: [businesses.id],
  }),
  campaign: one(campaigns, {
    fields: [reviews.campaignId],
    references: [campaigns.id],
  }),
  aspects: many(reviewAspects),
}));

export const reviewAspectsRelations = relations(reviewAspects, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewAspects.reviewId],
    references: [reviews.id],
  }),
}));
