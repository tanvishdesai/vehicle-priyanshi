import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  services: defineTable({
    name: v.string(),
    description: v.string(),
    basePrice: v.number(),
    estimatedDuration: v.number(), // in minutes
    category: v.union(v.literal("maintenance"), v.literal("repair"), v.literal("wash"), v.literal("inspection")),
    vehicleType: v.union(v.literal("car"), v.literal("motorbike"), v.literal("both")),
  }),

  appointments: defineTable({
    userId: v.id("users"),
    serviceId: v.id("services"),
    vehicleType: v.union(v.literal("car"), v.literal("motorbike")),
    vehicleModel: v.string(),
    vehiclePlate: v.string(),
    scheduledDate: v.number(),
    pickupRequired: v.boolean(),
    pickupAddress: v.optional(v.string()),
    dropoffRequired: v.boolean(),
    dropoffAddress: v.optional(v.string()),
    status: v.union(
      v.literal("scheduled"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
    totalPrice: v.number(),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_date", ["scheduledDate"]),

  serviceReports: defineTable({
    appointmentId: v.id("appointments"),
    userId: v.id("users"),
    serviceDate: v.number(),
    servicesPerformed: v.array(v.string()),
    partsReplaced: v.array(v.object({
      name: v.string(),
      cost: v.number(),
      quantity: v.number(),
    })),
    laborCost: v.number(),
    totalCost: v.number(),
    nextServiceDue: v.optional(v.number()),
    recommendations: v.optional(v.string()),
    mechanicNotes: v.optional(v.string()),
    aiGeneratedReport: v.optional(v.string()),
    generatedAt: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_appointment", ["appointmentId"]),

  reminders: defineTable({
    userId: v.id("users"),
    appointmentId: v.optional(v.id("appointments")),
    type: v.union(v.literal("upcoming_service"), v.literal("appointment_reminder")),
    message: v.string(),
    scheduledFor: v.number(),
    sent: v.boolean(),
  }).index("by_user", ["userId"])
    .index("by_scheduled", ["scheduledFor"])
    .index("by_sent", ["sent"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
