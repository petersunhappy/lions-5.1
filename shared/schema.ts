import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with role-based access
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("athlete"), // 'athlete' or 'admin'
  fullName: text("full_name").notNull(),
  profilePicture: text("profile_picture"),
  position: text("position"), // Basketball position for athletes
  createdAt: timestamp("created_at").defaultNow(),
});

// Athletes performance and stats
export const athletes = pgTable("athletes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  height: text("height"),
  weight: text("weight"),
  sleepHours: text("sleep_hours"),
  overallPerformance: text("overall_performance").default("0"),
  lastTraining: timestamp("last_training"),
});

// Training exercises
export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // 'basketball', 'aerobic', 'strength'
  videoUrl: text("video_url"),
  metrics: jsonb("metrics").$type<{
    repetitions?: number;
    duration?: number;
    distance?: number;
    accuracy?: number;
    difficulty?: string;
  }>(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
});

// Training sessions
export const trainingSessions = pgTable("training_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull().references(() => athletes.id),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id),
  results: jsonb("results").$type<{
    repetitions?: number;
    duration?: number;
    distance?: number;
    accuracy?: number;
    completed: boolean;
  }>(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Events and calendar
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").notNull(), // 'training', 'game', 'meeting'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  mandatory: boolean("mandatory").default(false),
  createdBy: varchar("created_by").notNull().references(() => users.id),
});

// Gallery media
export const gallery = pgTable("gallery", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  mediaType: text("media_type").notNull(), // 'image' or 'video'
  url: text("url").notNull(),
  album: text("album").default("general"),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Best of the week
export const bestOfWeek = pgTable("best_of_week", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull().references(() => athletes.id),
  weekStart: timestamp("week_start").notNull(),
  achievements: jsonb("achievements").$type<{
    shooting?: string;
    rebounds?: string;
    assists?: string;
    description?: string;
  }>(),
  setBy: varchar("set_by").notNull().references(() => users.id),
});

// Live streams
export const liveStreams = pgTable("live_streams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  youtubeUrl: text("youtube_url").notNull(),
  isActive: boolean("is_active").default(false),
  scheduledFor: timestamp("scheduled_for"),
  category: text("category").default("nbb"), // 'nbb' or 'nba'
  createdBy: varchar("created_by").notNull().references(() => users.id),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAthleteSchema = createInsertSchema(athletes).omit({ id: true });
export const insertExerciseSchema = createInsertSchema(exercises).omit({ id: true });
export const insertTrainingSessionSchema = createInsertSchema(trainingSessions).omit({ id: true, completedAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const insertGallerySchema = createInsertSchema(gallery).omit({ id: true, uploadedAt: true });
export const insertBestOfWeekSchema = createInsertSchema(bestOfWeek).omit({ id: true });
export const insertLiveStreamSchema = createInsertSchema(liveStreams).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Athlete = typeof athletes.$inferSelect;
export type InsertAthlete = z.infer<typeof insertAthleteSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type GalleryItem = typeof gallery.$inferSelect;
export type InsertGalleryItem = z.infer<typeof insertGallerySchema>;
export type BestOfWeek = typeof bestOfWeek.$inferSelect;
export type InsertBestOfWeek = z.infer<typeof insertBestOfWeekSchema>;
export type LiveStream = typeof liveStreams.$inferSelect;
export type InsertLiveStream = z.infer<typeof insertLiveStreamSchema>;
