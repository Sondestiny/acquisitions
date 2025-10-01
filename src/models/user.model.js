import { pgTable, timestamp, serial, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', {length: 255}).notNull(),
    email: varchar('email', {length: 255}).notNull().unique(),
    password: varchar('name', {length: 255}).notNull(),
    role: varchar('name', {length: 50}).notNull().default('user'),
    created_at: timestamp().defaultNow().notNull(),
    update_at: timestamp().defaultNow().notNull(),
})