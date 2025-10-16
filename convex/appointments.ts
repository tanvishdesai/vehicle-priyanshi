import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createAppointment = mutation({
  args: {
    serviceId: v.id("services"),
    vehicleType: v.union(v.literal("car"), v.literal("motorbike")),
    vehicleModel: v.string(),
    vehiclePlate: v.string(),
    scheduledDate: v.number(),
    pickupRequired: v.boolean(),
    pickupAddress: v.optional(v.string()),
    dropoffRequired: v.boolean(),
    dropoffAddress: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    const appointmentId = await ctx.db.insert("appointments", {
      userId,
      serviceId: args.serviceId,
      vehicleType: args.vehicleType,
      vehicleModel: args.vehicleModel,
      vehiclePlate: args.vehiclePlate,
      scheduledDate: args.scheduledDate,
      pickupRequired: args.pickupRequired,
      pickupAddress: args.pickupAddress,
      dropoffRequired: args.dropoffRequired,
      dropoffAddress: args.dropoffAddress,
      status: "scheduled",
      notes: args.notes,
      totalPrice: service.basePrice,
    });

    // Create reminder for 24 hours before appointment
    await ctx.db.insert("reminders", {
      userId,
      appointmentId,
      type: "appointment_reminder",
      message: `Your ${service.name} appointment is scheduled for tomorrow`,
      scheduledFor: args.scheduledDate - 24 * 60 * 60 * 1000,
      sent: false,
    });

    return appointmentId;
  },
});

export const getUserAppointments = query({
  args: {},
  handler: async (ctx): Promise<any[]> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      appointments.map(async (appointment) => {
        const service = await ctx.db.get(appointment.serviceId);
        return {
          ...appointment,
          service,
        };
      })
    );
  },
});

export const updateAppointmentStatus = mutation({
  args: {
    appointmentId: v.id("appointments"),
    status: v.union(
      v.literal("scheduled"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment || appointment.userId !== userId) {
      throw new Error("Appointment not found");
    }

    await ctx.db.patch(args.appointmentId, {
      status: args.status,
    });
  },
});
