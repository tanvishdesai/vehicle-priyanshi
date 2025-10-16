import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Calendar, 
  Car, 
  Clock, 
  MapPin, 
  FileText, 
  DollarSign, 
  Info,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

export function AppointmentsPage() {
  const appointments = useQuery(api.appointments.getUserAppointments);
  const updateStatus = useMutation(api.appointments.updateAppointmentStatus);
  const generateReport = useAction(api.reports.generateAIServiceReport);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const handleCancelAppointment = async (appointmentId: Id<"appointments">) => {
    try {
      await updateStatus({
        appointmentId,
        status: "cancelled",
      });
      toast.success("Appointment cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel appointment");
    }
  };

  const handleGenerateReport = async (appointmentId: Id<"appointments">) => {
    setGeneratingReport(appointmentId);
    try {
      await generateReport({ appointmentId });
      toast.success("Service report generated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate service report");
    } finally {
      setGeneratingReport(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "in-progress":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-3 w-3" />;
      case "in-progress":
        return <AlertCircle className="h-3 w-3" />;
      case "completed":
        return <CheckCircle2 className="h-3 w-3" />;
      case "cancelled":
        return <XCircle className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const upcomingAppointments = appointments?.filter(
    (apt) => apt.status === "scheduled" && apt.scheduledDate > Date.now()
  );

  const pastAppointments = appointments?.filter(
    (apt) => apt.status !== "scheduled" || apt.scheduledDate <= Date.now()
  );

  if (!appointments) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          My Appointments
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your vehicle service appointments and view service reports
        </p>
      </div>

      {/* Upcoming Appointments */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Upcoming Appointments
          </h2>
        </div>

        {upcomingAppointments && upcomingAppointments.length > 0 ? (
          <div className="grid gap-6">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment._id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-2xl">
                          {appointment.service?.name}
                        </CardTitle>
                        <Badge className="gap-1">
                          {getStatusIcon(appointment.status)}
                          {appointment.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-base">
                        Scheduled for {new Date(appointment.scheduledDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary mb-2">
                        ${appointment.totalPrice}
                      </div>
                      {appointment.status === "scheduled" && appointment.scheduledDate > Date.now() && (
                        <Button
                          onClick={() => handleCancelAppointment(appointment._id)}
                          variant="destructive"
                          size="sm"
                        >
                          Cancel Appointment
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                          <p className="text-lg font-semibold">
                            {appointment.vehicleModel}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.vehiclePlate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Time</p>
                          <p className="text-lg font-semibold">
                            {new Date(appointment.scheduledDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {(appointment.pickupRequired || appointment.dropoffRequired) && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-muted-foreground">Additional Services</p>
                          {appointment.pickupRequired && (
                            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                                  Pickup Service
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-400">
                                  {appointment.pickupAddress}
                                </p>
                              </div>
                            </div>
                          )}
                          {appointment.dropoffRequired && (
                            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                              <MapPin className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-green-900 dark:text-green-300">
                                  Drop-off Service
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-400">
                                  {appointment.dropoffAddress}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {appointment.notes && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                          <p className="text-sm p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No upcoming appointments</h3>
              <p className="text-muted-foreground text-center">
                Book your next service appointment to get started
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Past Appointments */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Past Appointments
          </h2>
        </div>

        {pastAppointments && pastAppointments.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {pastAppointments.map((appointment) => (
              <AccordionItem
                key={appointment._id}
                value={appointment._id}
                className="border rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-lg">
                            {appointment.service?.name}
                          </h4>
                          <Badge className="gap-1">
                            {getStatusIcon(appointment.status)}
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Car className="h-3 w-3" />
                            {appointment.vehicleModel} • {appointment.vehiclePlate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(appointment.scheduledDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 font-semibold text-lg">
                        <DollarSign className="h-4 w-4" />
                        {appointment.totalPrice}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6">
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Vehicle Details
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">Type:</span>{" "}
                              <span className="capitalize">{appointment.vehicleType}</span>
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Model:</span> {appointment.vehicleModel}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Plate:</span> {appointment.vehiclePlate}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Service Information
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">Service:</span> {appointment.service?.name}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Date:</span>{" "}
                              {new Date(appointment.scheduledDate).toLocaleString()}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Status:</span>{" "}
                              <span className="capitalize">{appointment.status}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {(appointment.pickupRequired || appointment.dropoffRequired) && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Additional Services
                            </p>
                            <div className="space-y-2">
                              {appointment.pickupRequired && (
                                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-sm">
                                  <p className="font-medium text-blue-900 dark:text-blue-300">
                                    Pickup Service
                                  </p>
                                  <p className="text-xs text-blue-700 dark:text-blue-400">
                                    {appointment.pickupAddress}
                                  </p>
                                </div>
                              )}
                              {appointment.dropoffRequired && (
                                <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded text-sm">
                                  <p className="font-medium text-green-900 dark:text-green-300">
                                    Drop-off Service
                                  </p>
                                  <p className="text-xs text-green-700 dark:text-green-400">
                                    {appointment.dropoffAddress}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {appointment.notes && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Customer Notes
                            </p>
                            <p className="text-sm p-3 bg-gray-50 dark:bg-gray-900 rounded">
                              {appointment.notes}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Total Cost
                          </p>
                          <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                            <DollarSign className="h-6 w-6" />
                            {appointment.totalPrice}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Service Report Section */}
                    <div className="pt-4 border-t">
                      <Alert className="mb-4">
                        <Sparkles className="h-4 w-4" />
                        <AlertDescription>
                          Generate a detailed AI-powered service report for this appointment using Google Gemini
                        </AlertDescription>
                      </Alert>

                      <Button
                        onClick={() => handleGenerateReport(appointment._id)}
                        disabled={generatingReport === appointment._id}
                        className="w-full gap-2"
                        size="lg"
                      >
                        {generatingReport === appointment._id ? (
                          <>
                            <Sparkles className="h-4 w-4 animate-spin" />
                            Generating Service Report...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                            Generate Service Report
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No past appointments found</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
