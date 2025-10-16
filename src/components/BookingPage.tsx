import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Car, 
  Bike, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText,
  DollarSign,
  CheckCircle2
} from "lucide-react";

export function BookingPage() {
  const services = useQuery(api.services.listServices);
  const createAppointment = useMutation(api.appointments.createAppointment);

  const [formData, setFormData] = useState({
    serviceId: "",
    vehicleType: "car" as "car" | "motorbike",
    vehicleModel: "",
    vehiclePlate: "",
    scheduledDate: "",
    scheduledTime: "",
    pickupRequired: false,
    pickupAddress: "",
    dropoffRequired: false,
    dropoffAddress: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedService = services?.find(s => s._id === formData.serviceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceId || !formData.vehicleModel || !formData.vehiclePlate || !formData.scheduledDate || !formData.scheduledTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).getTime();
      
      await createAppointment({
        serviceId: formData.serviceId as any,
        vehicleType: formData.vehicleType,
        vehicleModel: formData.vehicleModel,
        vehiclePlate: formData.vehiclePlate,
        scheduledDate: scheduledDateTime,
        pickupRequired: formData.pickupRequired,
        pickupAddress: formData.pickupRequired ? formData.pickupAddress : undefined,
        dropoffRequired: formData.dropoffRequired,
        dropoffAddress: formData.dropoffRequired ? formData.dropoffAddress : undefined,
        notes: formData.notes || undefined,
      });

      toast.success("Appointment booked successfully!");
      setFormData({
        serviceId: "",
        vehicleType: "car",
        vehicleModel: "",
        vehiclePlate: "",
        scheduledDate: "",
        scheduledTime: "",
        pickupRequired: false,
        pickupAddress: "",
        dropoffRequired: false,
        dropoffAddress: "",
        notes: "",
      });
    } catch (error) {
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = services?.filter(service => 
    service.vehicleType === "both" || service.vehicleType === formData.vehicleType
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          Book a Service
        </h1>
        <p className="text-lg text-muted-foreground">
          Schedule your vehicle maintenance or repair appointment
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>Fill in the information below to book your service</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Vehicle Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.vehicleType === "car"
                      ? "border-primary border-2 bg-blue-50 dark:bg-blue-950/20"
                      : "hover:border-gray-400"
                  }`}
                  onClick={() => setFormData({ ...formData, vehicleType: "car", serviceId: "" })}
                >
                  <CardContent className="p-6 text-center">
                    <Car className={`h-12 w-12 mx-auto mb-3 ${
                      formData.vehicleType === "car" ? "text-primary" : "text-muted-foreground"
                    }`} />
                    <div className="font-semibold text-lg">Car</div>
                  </CardContent>
                </Card>
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.vehicleType === "motorbike"
                      ? "border-primary border-2 bg-blue-50 dark:bg-blue-950/20"
                      : "hover:border-gray-400"
                  }`}
                  onClick={() => setFormData({ ...formData, vehicleType: "motorbike", serviceId: "" })}
                >
                  <CardContent className="p-6 text-center">
                    <Bike className={`h-12 w-12 mx-auto mb-3 ${
                      formData.vehicleType === "motorbike" ? "text-primary" : "text-muted-foreground"
                    }`} />
                    <div className="font-semibold text-lg">Motorbike</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Service Type *
              </label>
              <select
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                required
              >
                <option value="">Select a service</option>
                {filteredServices?.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name} - ${service.basePrice} ({service.estimatedDuration} min)
                  </option>
                ))}
              </select>
              {selectedService && (
                <Card className="mt-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-3">
                    <p className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {selectedService.description}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Vehicle Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Vehicle Model *
                </label>
                <input
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  placeholder="e.g., Toyota Camry, Honda CBR600"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  License Plate *
                </label>
                <input
                  type="text"
                  value={formData.vehiclePlate}
                  onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value.toUpperCase() })}
                  placeholder="ABC-123"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all uppercase"
                  required
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Preferred Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Preferred Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <select
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    required
                  >
                    <option value="">Select time</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pickup/Dropoff Options */}
            <Card className="bg-gray-50 dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Additional Services
                </CardTitle>
                <CardDescription>
                  Optional pickup and drop-off services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.pickupRequired}
                      onChange={(e) => setFormData({ ...formData, pickupRequired: e.target.checked })}
                      className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium">Vehicle pickup required</span>
                  </label>
                  {formData.pickupRequired && (
                    <input
                      type="text"
                      value={formData.pickupAddress}
                      onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                      placeholder="Enter pickup address"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all ml-8"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.dropoffRequired}
                      onChange={(e) => setFormData({ ...formData, dropoffRequired: e.target.checked })}
                      className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium">Vehicle drop-off required</span>
                  </label>
                  {formData.dropoffRequired && (
                    <input
                      type="text"
                      value={formData.dropoffAddress}
                      onChange={(e) => setFormData({ ...formData, dropoffAddress: e.target.value })}
                      placeholder="Enter drop-off address"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all ml-8"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any specific concerns or requests..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Price Summary */}
            {selectedService && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Estimated Total
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Final price may vary based on additional services
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-4xl font-bold text-green-600 dark:text-green-400">
                      <DollarSign className="h-8 w-8" />
                      {selectedService.basePrice}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-full gap-2"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Book Appointment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
