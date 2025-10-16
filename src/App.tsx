import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { HomePage } from "./components/HomePage";
import { BookingPage } from "./components/BookingPage";
import { AppointmentsPage } from "./components/AppointmentsPage";
import { ReportsPage } from "./components/ReportsPage";

type Page = "home" | "booking" | "appointments" | "reports";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 
                className="text-2xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer"
                onClick={() => setCurrentPage("home")}
              >
                AutoCare
              </h1>
              <Authenticated>
                <nav className="hidden md:flex space-x-6">
                  <button
                    onClick={() => setCurrentPage("home")}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === "home"
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => setCurrentPage("booking")}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === "booking"
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    Book Service
                  </button>
                  <button
                    onClick={() => setCurrentPage("appointments")}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === "appointments"
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    My Appointments
                  </button>
                  <button
                    onClick={() => setCurrentPage("reports")}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === "reports"
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    Service Reports
                  </button>
                </nav>
              </Authenticated>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Content currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </main>
      <Toaster />
    </div>
  );
}

function Content({ currentPage, setCurrentPage }: { currentPage: Page; setCurrentPage: (page: Page) => void }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Unauthenticated>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to AutoCare
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Professional vehicle service management at your fingertips
              </p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {currentPage === "home" && <HomePage setCurrentPage={setCurrentPage} />}
        {currentPage === "booking" && <BookingPage />}
        {currentPage === "appointments" && <AppointmentsPage />}
        {currentPage === "reports" && <ReportsPage />}
      </Authenticated>
    </>
  );
}
