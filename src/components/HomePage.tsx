import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Calendar, 
  CheckCircle2, 
  BarChart3, 
  Settings, 
  Sparkles,
  Car,
  Clock,
  ArrowRight,
  Wrench,
  Shield,
  Droplets
} from "lucide-react";

interface HomePageProps {
  setCurrentPage: (page: "home" | "booking" | "appointments" | "reports") => void;
}

export function HomePage({ setCurrentPage }: HomePageProps) {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const appointments = useQuery(api.appointments.getUserAppointments);
  const seedServices = useMutation(api.services.seedServices);

  useEffect(() => {
    seedServices();
  }, [seedServices]);

  const upcomingAppointments = appointments?.filter(
    (apt) => apt.status === "scheduled" && apt.scheduledDate > Date.now()
  ).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <Card className="relative overflow-hidden mb-12 border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
        <CardContent className="relative p-8 sm:p-12 md:p-16">
          <div className="max-w-3xl">
            <Badge className="mb-4 gap-1 bg-secondary text-secondary-foreground">
              <Sparkles className="h-3 w-3" />
              AI-Powered Service Reports
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Professional Vehicle Service Made Simple
            </h1>
            <p className="text-xl text-blue-50 mb-8">
              Book appointments, track service history, and get AI-generated service reports with our comprehensive vehicle care platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => setCurrentPage("booking")}
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg px-8 py-6 text-lg"
              >
                Book Service Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => setCurrentPage("appointments")}
                className="bg-blue-500/20 text-white hover:bg-blue-500/30 border-blue-400 px-8 py-6 text-lg"
              >
                View Appointments
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {loggedInUser?.email?.split('@')[0] || 'friend'}!
        </h2>
        <p className="text-lg text-muted-foreground">
          Manage your vehicle maintenance and service appointments with ease.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming
            </CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingAppointments?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {upcomingAppointments?.length === 1 ? 'appointment' : 'appointments'} scheduled
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {appointments?.filter(apt => apt.status === "completed").length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              services completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Services
            </CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{appointments?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              lifetime appointments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments && upcomingAppointments.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Upcoming Appointments
              </h3>
              <p className="text-muted-foreground mt-1">Your scheduled services</p>
            </div>
            <Button
              onClick={() => setCurrentPage("appointments")}
              className="gap-2 bg-transparent hover:bg-accent"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                          {appointment.service?.name}
                        </h4>
                        <p className="text-muted-foreground mb-2">
                          {appointment.vehicleModel} • {appointment.vehiclePlate}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(appointment.scheduledDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(appointment.scheduledDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="mb-2">
                        {appointment.status}
                      </Badge>
                      <p className="text-2xl font-bold text-primary">
                        ${appointment.totalPrice}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Services Overview */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Our Services
        </h3>
        <p className="text-muted-foreground mb-6">
          Comprehensive vehicle care solutions for all your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
          <CardHeader>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mb-4">
              <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg">Regular Maintenance</CardTitle>
            <CardDescription>
              Oil changes, inspections, and routine care
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
          <CardHeader>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg w-fit mb-4">
              <Droplets className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-lg">Premium Wash</CardTitle>
            <CardDescription>
              Complete cleaning and detailing services
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
          <CardHeader>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg w-fit mb-4">
              <Wrench className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-lg">Repair Services</CardTitle>
            <CardDescription>
              Expert repairs and part replacements
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
          <CardHeader>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-fit mb-4">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-lg">Safety Inspections</CardTitle>
            <CardDescription>
              Comprehensive safety and emissions checks
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
