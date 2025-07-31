import { useState, useEffect } from "react";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  Users,
  Search,
  ChevronDown,
  User,
  BookMarked,
  CalendarDays,
  Clock,
  TrendingUp,
  Activity,
  Star,
  Zap,
  ArrowRight,
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { fetchDashboard } from "../../../api/auth";

const AdminDashboard = () => {
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalTutors: 0,
    totalCourses: 0,
    totalActiveClasses: 0,
    last4Students: [],
    last4Tutors: [],
    latest4Classes: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch dashboard data
  useEffect(() => {
    const getDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchDashboard();
        if (response.data?.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getDashboardData();
  }, []);

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const formatTimeOnly = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const getDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours > 0 ? `${hours}h ` : ""}${
      minutes > 0 ? `${minutes}m` : ""
    }`;
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gradient-to-r from-blue-200/50 to-purple-200/50 rounded-lg"></div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20">
      {/* Gradient background overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`}
      ></div>

      {/* Animated gradient border */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity`}
      ></div>

      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div
          className={`relative p-2 rounded-xl bg-gradient-to-r ${color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
        >
          <Icon className="h-5 w-5 text-white" />
          <div
            className={`absolute -inset-1 bg-gradient-to-r ${color} rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity`}
          ></div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
          {isLoading ? <LoadingSkeleton /> : value}
        </div>
        {trend && (
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 dark:text-green-400 font-medium">
              +12% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 w-full relative">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header Section */}
      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Monitor and manage your educational portal
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/20 hover:bg-white/70 dark:hover:bg-gray-800/70"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={dashboardData.totalStudents}
          icon={Users}
          color="from-blue-500 to-cyan-500"
          trend={true}
        />
        <StatCard
          title="Total Tutors"
          value={dashboardData.totalTutors}
          icon={GraduationCap}
          color="from-purple-500 to-violet-500"
          trend={true}
        />
        <StatCard
          title="Total Courses"
          value={dashboardData.totalCourses}
          icon={BookOpen}
          color="from-amber-500 to-orange-500"
          trend={true}
        />
        <StatCard
          title="Active Classes"
          value={dashboardData.totalActiveClasses}
          icon={BarChart3}
          color="from-green-500 to-emerald-500"
          trend={true}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Classes Section */}
        <Card className="xl:col-span-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Active Classes
                </CardTitle>
                <CardDescription>
                  Currently running and upcoming sessions
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : dashboardData.latest4Classes &&
                dashboardData.latest4Classes.length > 0 ? (
                dashboardData.latest4Classes.map((cls, index) => (
                  <div
                    key={index}
                    className="group relative p-5 rounded-xl bg-gradient-to-r from-gray-50/80 to-blue-50/80 dark:from-gray-800/80 dark:to-blue-900/80 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Gradient accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-l-xl"></div>

                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <BookMarked className="h-6 w-6 text-white" />
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                            {cls.topic}
                          </h3>
                          <p className="text-blue-600 dark:text-blue-400 font-medium">
                            {cls.courseName}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                            <User className="h-4 w-4 text-purple-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {cls.tutorName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                            <CalendarDays className="h-4 w-4 text-blue-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {formatDateTime(cls.startTime)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                            <Clock className="h-4 w-4 text-green-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {getDuration(cls.startTime, cls.endTime)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={
                            cls.status === "current" ? "default" : "secondary"
                          }
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
                        >
                          {cls.studentCount} Students
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-12 bg-gradient-to-br from-gray-50/80 to-blue-50/80 dark:from-gray-800/80 dark:to-blue-900/80 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <BookMarked className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    No Active Classes
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start by scheduling your first class session
                  </p>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Class
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates across the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                icon: User,
                color: "from-blue-500 to-cyan-500",
                title: "New student registered",
                description: "Emma Johnson joined Web Development",
                time: "2 hours ago",
              },
              {
                icon: BookOpen,
                color: "from-green-500 to-emerald-500",
                title: "New course added",
                description: "Advanced React with Hooks",
                time: "Yesterday",
              },
              {
                icon: GraduationCap,
                color: "from-purple-500 to-violet-500",
                title: "New tutor onboarded",
                description: "Dr. Lisa Wang joined the platform",
                time: "3 days ago",
              },
              {
                icon: Star,
                color: "from-yellow-500 to-orange-500",
                title: "Course completed",
                description: "JavaScript Fundamentals finished",
                time: "1 week ago",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex gap-4 items-start p-3 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group"
              >
                <div
                  className={`relative p-2 rounded-xl bg-gradient-to-r ${activity.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                >
                  <activity.icon className="h-4 w-4 text-white" />
                  <div
                    className={`absolute -inset-0.5 bg-gradient-to-r ${activity.color} rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity`}
                  ></div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Data Tables Section */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 shadow-2xl">
        <Tabs defaultValue="students" className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 border-b border-white/20">
            <TabsList className="bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger
                value="students"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
              >
                Students
              </TabsTrigger>
              <TabsTrigger
                value="tutors"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
              >
                Tutors
              </TabsTrigger>
            </TabsList>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search members..."
                className="w-full lg:w-80 pl-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="students" className="mt-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Recently Added Students
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your newest student members
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  View All
                </Button>
              </div>

              <div className="rounded-xl border border-white/20 overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20 bg-gradient-to-r from-gray-50/80 to-blue-50/80 dark:from-gray-800/80 dark:to-blue-900/80">
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Student
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Email
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Join Date
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Loading students...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : dashboardData.last4Students &&
                      dashboardData.last4Students.length > 0 ? (
                      dashboardData.last4Students
                        .filter(
                          (student) =>
                            student.firstname
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            student.lastname
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            student.email
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                        )
                        .map((student) => (
                          <tr
                            key={student._id}
                            className="border-b border-white/10 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 ring-2 ring-blue-100 dark:ring-blue-900">
                                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                                    {student.firstname.charAt(0)}
                                    {student.lastname.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                                    {student.firstname} {student.lastname}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Student
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-gray-600 dark:text-gray-400">
                              {student.email}
                            </td>
                            <td className="p-4 text-gray-600 dark:text-gray-400">
                              {new Date(student.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Active
                              </Badge>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          No students found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tutors" className="mt-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Recently Added Tutors
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your newest tutor members
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  View All
                </Button>
              </div>

              <div className="rounded-xl border border-white/20 overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20 bg-gradient-to-r from-gray-50/80 to-purple-50/80 dark:from-gray-800/80 dark:to-purple-900/80">
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Tutor
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Email
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Join Date
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Loading tutors...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : dashboardData.last4Tutors &&
                      dashboardData.last4Tutors.length > 0 ? (
                      dashboardData.last4Tutors
                        .filter(
                          (tutor) =>
                            tutor.firstname
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            tutor.lastname
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            tutor.email
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                        )
                        .map((tutor) => (
                          <tr
                            key={tutor._id}
                            className="border-b border-white/10 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 ring-2 ring-purple-100 dark:ring-purple-900">
                                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold">
                                    {tutor.firstname.charAt(0)}
                                    {tutor.lastname.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                                    {tutor.firstname} {tutor.lastname}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Tutor
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-gray-600 dark:text-gray-400">
                              {tutor.email}
                            </td>
                            <td className="p-4 text-gray-600 dark:text-gray-400">
                              {new Date(tutor.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                Active
                              </Badge>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          No tutors found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminDashboard;
