import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Moon,
  Sun,
  User,
  Atom,
  Shield,
  Zap,
} from "lucide-react";
import { useTheme } from "../../components/template/ThemeProvider";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import useAuthStore from "../../store/useAuthStore";
import { loginUser } from "../../api/auth";
import { sendToast } from "../../components/utilis";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setTheme, theme } = useTheme();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, status } = await loginUser({ email, password });

      console.log("response from server: ", data);

      if (data?.success === true) {
        sendToast("success", data?.message);
        let user = data?.user;
        login({
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          role: user.role,
          organization: user.organization,
          token: user.token,
        });

        navigate("/dashboard");
      } else {
        sendToast("error", data?.message);
      }
    } catch (error) {
      setError("Failed to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-4 md:p-6">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Atom
              className="h-6 w-6 text-white animate-spin"
              style={{ animationDuration: "3s" }}
            />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ATOM
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-blue-600" />
          )}
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Welcome Section */}
          <div className="hidden lg:block space-y-8 pl-8">
            <div className="space-y-6">
              <h1 className="text-5xl xl:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome to
                </span>
                <br />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ATOM Portal
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg">
                Your gateway to streamlined student and tutor management.
                Experience the future of educational administration.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Secure Access
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Advanced authentication and data protection
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Lightning Fast
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Optimized performance for seamless experience
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
              <CardHeader className="space-y-4 text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Atom
                        className="h-8 w-8 text-white animate-spin"
                        style={{ animationDuration: "3s" }}
                      />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Sign In
                </CardTitle>
                <CardDescription className="text-base">
                  Access your personalized dashboard
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleLogin}>
                <CardContent className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm animate-in slide-in-from-top-2">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="email"
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-12 h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                        placeholder="Enter your password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-10 w-10 text-gray-400 hover:text-blue-500 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col pt-6">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors underline underline-offset-4">
                      Forgot your password?
                    </span>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Welcome Section */}
      <div className="lg:hidden relative z-10 text-center p-4 pb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          ATOM Portal
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Your gateway to educational excellence
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
