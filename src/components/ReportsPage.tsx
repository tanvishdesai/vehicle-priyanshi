import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import ReactMarkdown from "react-markdown";
import {
  FileText,
  Calendar,
  Car,
  DollarSign,
  Wrench,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";

export function ReportsPage() {
  const reports = useQuery(api.reports.getUserReports);

  if (!reports) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Service Reports
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          View detailed service history and AI-generated reports for your vehicles
        </p>
      </div>

      {reports && reports.length > 0 ? (
        <div className="grid gap-6">
          {reports.map((report) => (
            <Card key={report._id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                      {report.service?.name}
                      {report.aiGeneratedReport && (
                        <Badge className="gap-1 bg-secondary text-secondary-foreground">
                          <Sparkles className="h-3 w-3" />
                          AI Generated
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-base">
                      <span className="flex items-center gap-1">
                        <Car className="h-4 w-4" />
                        {report.appointment?.vehicleModel} • {report.appointment?.vehiclePlate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(report.serviceDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-3xl font-bold text-primary mb-1">
                      <DollarSign className="h-7 w-7" />
                      {report.totalCost}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* AI Generated Report */}
                {report.aiGeneratedReport && (
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <h4 className="font-semibold text-lg text-purple-900 dark:text-purple-100">
                        AI-Generated Service Report
                      </h4>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-purple-900 dark:prose-headings:text-purple-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-purple-800 dark:prose-strong:text-purple-200 prose-li:text-gray-700 dark:prose-li:text-gray-300">
                      <ReactMarkdown>
                        {report.aiGeneratedReport}
                      </ReactMarkdown>
                    </div>
                    {report.generatedAt && (
                      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Generated on {new Date(report.generatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Services Performed */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-lg">Services Performed</h4>
                    </div>
                    <ul className="space-y-2">
                      {report.servicesPerformed.map((service: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Parts Replaced */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-lg">Parts Replaced</h4>
                    </div>
                    {report.partsReplaced.length > 0 ? (
                      <div className="space-y-2">
                        {report.partsReplaced.map((part: any, index: number) => (
                          <div 
                            key={index} 
                            className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm"
                          >
                            <span className="text-gray-700 dark:text-gray-300">
                              {part.name} <span className="text-muted-foreground">(x{part.quantity})</span>
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              ${(part.cost * part.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No parts replaced</p>
                    )}
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-lg">Cost Breakdown</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Labor Cost</span>
                      <span className="font-medium text-lg">${report.laborCost}</span>
                    </div>
                    {report.partsReplaced.length > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Parts Cost</span>
                        <span className="font-medium text-lg">
                          ${report.partsReplaced.reduce((sum: number, part: any) => sum + (part.cost * part.quantity), 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center font-semibold text-lg pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span>Total Cost</span>
                      <span className="text-2xl text-primary">${report.totalCost}</span>
                    </div>
                  </div>
                </div>

                {/* Recommendations and Notes */}
                {(report.recommendations || report.mechanicNotes) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {report.recommendations && (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                            Recommendations
                          </h4>
                        </div>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          {report.recommendations}
                        </p>
                      </div>
                    )}
                    {report.mechanicNotes && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-2 mb-2">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                            Mechanic Notes
                          </h4>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {report.mechanicNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Next Service Due */}
                {report.nextServiceDue && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-100 text-lg">
                          Next Service Due
                        </p>
                        <p className="text-green-700 dark:text-green-300">
                          {new Date(report.nextServiceDue).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No service reports yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Service reports will appear here after your appointments are completed and reports are generated
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
