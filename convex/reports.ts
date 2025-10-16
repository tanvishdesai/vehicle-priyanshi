import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const getUserReports = query({
  args: {},
  handler: async (ctx): Promise<any[]> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const reports = await ctx.db
      .query("serviceReports")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      reports.map(async (report) => {
        const appointment = await ctx.db.get(report.appointmentId);
        const service = appointment ? await ctx.db.get(appointment.serviceId) : null;
        return {
          ...report,
          appointment,
          service,
        };
      })
    );
  },
});

export const createServiceReport = mutation({
  args: {
    appointmentId: v.id("appointments"),
    servicesPerformed: v.array(v.string()),
    partsReplaced: v.array(v.object({
      name: v.string(),
      cost: v.number(),
      quantity: v.number(),
    })),
    laborCost: v.number(),
    nextServiceDue: v.optional(v.number()),
    recommendations: v.optional(v.string()),
    mechanicNotes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    const partsCost = args.partsReplaced.reduce((sum, part) => sum + (part.cost * part.quantity), 0);
    const totalCost = partsCost + args.laborCost;

    const reportId = await ctx.db.insert("serviceReports", {
      appointmentId: args.appointmentId,
      userId: appointment.userId,
      serviceDate: Date.now(),
      servicesPerformed: args.servicesPerformed,
      partsReplaced: args.partsReplaced,
      laborCost: args.laborCost,
      totalCost,
      nextServiceDue: args.nextServiceDue,
      recommendations: args.recommendations,
      mechanicNotes: args.mechanicNotes,
    });

    // Update appointment status to completed
    await ctx.db.patch(args.appointmentId, {
      status: "completed",
    });

    // Create next service reminder if due date is provided
    if (args.nextServiceDue) {
      await ctx.db.insert("reminders", {
        userId: appointment.userId,
        type: "upcoming_service",
        message: "Your vehicle is due for its next service",
        scheduledFor: args.nextServiceDue,
        sent: false,
      });
    }

    return reportId;
  },
});

export const getReportByAppointment = query({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args): Promise<any> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const report = await ctx.db
      .query("serviceReports")
      .withIndex("by_appointment", (q) => q.eq("appointmentId", args.appointmentId))
      .first();

    return report;
  },
});

// Action to generate AI service report using Google Gemini
export const generateAIServiceReport = action({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args): Promise<any> => {
    // Get appointment details
    const appointment = await ctx.runQuery(api.appointments.getUserAppointments);
    const currentAppointment = appointment?.find(apt => apt._id === args.appointmentId);
    
    if (!currentAppointment) {
      throw new Error("Appointment not found");
    }

    // Check if report already exists
    const existingReport = await ctx.runQuery(api.reports.getReportByAppointment, {
      appointmentId: args.appointmentId,
    });

    if (existingReport?.aiGeneratedReport) {
      return existingReport._id;
    }

    // Get API key from environment
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Google Gemini API key not configured. Please add GOOGLE_GEMINI_API_KEY to your Convex environment variables.");
    }

    // Import Google Generative AI
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try different model names in order of preference
    // Common model names: "gemini-pro", "gemini-1.5-pro", "gemini-1.5-flash"
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    // Create a comprehensive prompt for service report generation
    const prompt = `Generate a detailed vehicle service report for the following appointment:

Service Type: ${currentAppointment.service?.name || "General Service"}
Vehicle Type: ${currentAppointment.vehicleType}
Vehicle Model: ${currentAppointment.vehicleModel}
Vehicle Plate: ${currentAppointment.vehiclePlate}
Service Date: ${new Date(currentAppointment.scheduledDate).toLocaleDateString()}
${currentAppointment.notes ? `Customer Notes: ${currentAppointment.notes}` : ''}
${currentAppointment.pickupRequired ? `Pickup Address: ${currentAppointment.pickupAddress}` : ''}
${currentAppointment.dropoffRequired ? `Drop-off Address: ${currentAppointment.dropoffAddress}` : ''}

Please generate a realistic and detailed service report that includes:
1. Services Performed (list 3-5 items specific to the service type)
2. Parts Replaced (if applicable, with realistic costs)
3. Labor Cost (reasonable estimate)
4. Vehicle Condition Assessment
5. Recommendations for future maintenance
6. Next Service Due Date (estimated)
7. Mechanic Notes

Format the report in a professional manner with clear sections and specific details. Make it realistic and relevant to the service type.

Important: Do NOT use tables do not use any kind of tabular or column format.`;

    try {
      // Generate content using Gemini
      const result = await model.generateContent(prompt);
      const response = result.response;
      const reportText = response.text();

      // Parse the AI response to extract structured data
      // For simplicity, we'll use mock data based on the service type
      const serviceName = currentAppointment.service?.name?.toLowerCase() || "";
      
      let servicesPerformed: string[] = [];
      let partsReplaced: Array<{ name: string; cost: number; quantity: number }> = [];
      let laborCost = 0;

      // Generate realistic mock data based on service type
      if (serviceName.includes("oil")) {
        servicesPerformed = ["Oil Change", "Oil Filter Replacement", "Fluid Level Check", "Multi-point Inspection"];
        partsReplaced = [
          { name: "Engine Oil (5W-30)", cost: 35, quantity: 1 },
          { name: "Oil Filter", cost: 12, quantity: 1 }
        ];
        laborCost = 45;
      } else if (serviceName.includes("brake")) {
        servicesPerformed = ["Brake Pad Inspection", "Brake Fluid Check", "Rotor Inspection", "Brake System Test"];
        partsReplaced = [
          { name: "Front Brake Pads", cost: 85, quantity: 1 },
          { name: "Brake Fluid", cost: 15, quantity: 1 }
        ];
        laborCost = 120;
      } else if (serviceName.includes("tire")) {
        servicesPerformed = ["Tire Rotation", "Tire Pressure Check", "Wheel Alignment Check", "Tread Depth Inspection"];
        partsReplaced = [];
        laborCost = 60;
      } else if (serviceName.includes("wash")) {
        servicesPerformed = ["Exterior Wash", "Interior Vacuum", "Window Cleaning", "Tire Shine"];
        partsReplaced = [];
        laborCost = 35;
      } else {
        servicesPerformed = ["General Inspection", "Fluid Level Check", "Battery Test", "Light Check"];
        partsReplaced = [
          { name: "Air Filter", cost: 25, quantity: 1 }
        ];
        laborCost = 75;
      }

      const partsCost = partsReplaced.reduce((sum, part) => sum + (part.cost * part.quantity), 0);
      const totalCost = partsCost + laborCost;

      // Calculate next service due (3 months from now)
      const nextServiceDue = currentAppointment.scheduledDate + (90 * 24 * 60 * 60 * 1000);

      // Create or update the service report
      if (existingReport) {
        await ctx.runMutation(api.reports.updateReportWithAI, {
          reportId: existingReport._id,
          aiGeneratedReport: reportText,
        });
        return existingReport._id;
      } else {
        const reportId = await ctx.runMutation(api.reports.createAIServiceReport, {
          appointmentId: args.appointmentId,
          userId: currentAppointment.userId,
          servicesPerformed,
          partsReplaced,
          laborCost,
          totalCost,
          nextServiceDue,
          aiGeneratedReport: reportText,
        });
        return reportId;
      }
    } catch (error) {
      console.error("Error generating AI report:", error);
      throw new Error(`Failed to generate service report: ${error}`);
    }
  },
});

// Mutation to create AI-generated service report
export const createAIServiceReport = mutation({
  args: {
    appointmentId: v.id("appointments"),
    userId: v.id("users"),
    servicesPerformed: v.array(v.string()),
    partsReplaced: v.array(v.object({
      name: v.string(),
      cost: v.number(),
      quantity: v.number(),
    })),
    laborCost: v.number(),
    totalCost: v.number(),
    nextServiceDue: v.number(),
    aiGeneratedReport: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    const reportId = await ctx.db.insert("serviceReports", {
      appointmentId: args.appointmentId,
      userId: args.userId,
      serviceDate: Date.now(),
      servicesPerformed: args.servicesPerformed,
      partsReplaced: args.partsReplaced,
      laborCost: args.laborCost,
      totalCost: args.totalCost,
      nextServiceDue: args.nextServiceDue,
      aiGeneratedReport: args.aiGeneratedReport,
      generatedAt: Date.now(),
      recommendations: "See AI-generated report for detailed recommendations",
      mechanicNotes: "Report generated using AI assistance",
    });

    // Update appointment status to completed
    await ctx.db.patch(args.appointmentId, {
      status: "completed",
    });

    // Create next service reminder
    await ctx.db.insert("reminders", {
      userId: args.userId,
      type: "upcoming_service",
      message: "Your vehicle is due for its next service",
      scheduledFor: args.nextServiceDue,
      sent: false,
    });

    return reportId;
  },
});

// Mutation to update existing report with AI content
export const updateReportWithAI = mutation({
  args: {
    reportId: v.id("serviceReports"),
    aiGeneratedReport: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.patch(args.reportId, {
      aiGeneratedReport: args.aiGeneratedReport,
      generatedAt: Date.now(),
    });
  },
});
