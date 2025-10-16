import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listServices = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("services").collect();
  },
});

export const getServicesByCategory = query({
  args: { category: v.union(v.literal("maintenance"), v.literal("repair"), v.literal("wash"), v.literal("inspection")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();
  },
});

export const seedServices = mutation({
  args: {},
  handler: async (ctx) => {
    const existingServices = await ctx.db.query("services").first();
    if (existingServices) return;

    const services = [
      {
        name: "Regular Oil Change",
        description: "Complete oil and filter change with multi-point inspection",
        basePrice: 45,
        estimatedDuration: 30,
        category: "maintenance" as const,
        vehicleType: "both" as const,
      },
      {
        name: "Full Service",
        description: "Comprehensive maintenance including oil change, brake check, and fluid top-up",
        basePrice: 120,
        estimatedDuration: 90,
        category: "maintenance" as const,
        vehicleType: "both" as const,
      },
      {
        name: "Brake Service",
        description: "Brake pad replacement and brake system inspection",
        basePrice: 180,
        estimatedDuration: 120,
        category: "repair" as const,
        vehicleType: "both" as const,
      },
      {
        name: "Premium Car Wash",
        description: "Exterior wash, interior cleaning, and wax application",
        basePrice: 35,
        estimatedDuration: 45,
        category: "wash" as const,
        vehicleType: "car" as const,
      },
      {
        name: "Motorbike Wash & Detail",
        description: "Complete cleaning and detailing for motorcycles",
        basePrice: 25,
        estimatedDuration: 30,
        category: "wash" as const,
        vehicleType: "motorbike" as const,
      },
      {
        name: "Annual Safety Inspection",
        description: "Comprehensive safety and emissions inspection",
        basePrice: 75,
        estimatedDuration: 60,
        category: "inspection" as const,
        vehicleType: "both" as const,
      },
    ];

    for (const service of services) {
      await ctx.db.insert("services", service);
    }
  },
});
