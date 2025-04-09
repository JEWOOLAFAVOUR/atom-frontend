import { useEffect, useState } from "react";
import { BookOpen, Calendar, CheckCircle, Clock, FileText, User, Book } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Progress } from "../../../components/ui/progress";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";

// API import
import { fetchStudentDashboard } from "../../../api/auth"; // Adjust the path as needed

const StudentDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                const response = await fetchStudentDashboard();
                setDashboardData(response.data?.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to load dashboard data");
                setLoading(false);
                console.error("Dashboard loading error:", err);
            }
        };

        loadDashboardData();
    }, []);

    // Calculate attendance status
    const getAttendanceRate = () => {
        if (!dashboardData || !dashboardData.recentAttendance || dashboardData.recentAttendance.length === 0) {
            return 0;
        }

        const fullAttendance = dashboardData.recentAttendance.filter(a => a.status === "full").length;
        const partialAttendance = dashboardData.recentAttendance.filter(a => a.status === "partial").length;

        // Count partial attendance as 0.5
        const attendanceScore = fullAttendance + (partialAttendance * 0.5);
        const totalClasses = dashboardData.recentAttendance.length;

        return totalClasses ? Math.round((attendanceScore / totalClasses) * 100) : 0;
    };

    // Format date for display
    const formatDateTime = (dateString) => {
        if (!dateString) return "";

        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        // Format time
        const timeFormat = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        // Format date prefix
        let datePrefix;
        if (isToday) {
            datePrefix = "Today";
        } else if (isTomorrow) {
            datePrefix = "Tomorrow";
        } else {
            datePrefix = date.toLocaleDateString('en-US', { weekday: 'short' });
        }

        return `${datePrefix}, ${timeFormat.format(date)}`;
    };

    // Get current or next class
    const getNextClass = () => {
        if (!dashboardData || !dashboardData.classes || dashboardData.classes.length === 0) {
            return null;
        }

        // First check for current class
        const currentClass = dashboardData.classes.find(c => c.status === "current");
        if (currentClass) return currentClass;

        // Then check for upcoming class
        const upcomingClasses = dashboardData.classes.filter(c => c.status === "upcoming");
        return upcomingClasses.length > 0 ? upcomingClasses[0] : null;
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    const nextClass = getNextClass();
    const attendanceRate = getAttendanceRate();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Student Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.totalTutors || 0}</div>
                        <p className="text-xs text-muted-foreground">Available tutors</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assigned Classes</CardTitle>
                        <Book className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.totalAssignedClasses || 0}</div>
                        <p className="text-xs text-muted-foreground">Total assigned classes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{attendanceRate}%</div>
                        <Progress value={attendanceRate} className="h-2 mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Class</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {nextClass ? (
                            <>
                                <div className="text-md font-medium">{formatDateTime(nextClass.startTime)}</div>
                                <p className="text-xs text-muted-foreground">{nextClass.topic}</p>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">No upcoming classes</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Classes</CardTitle>
                        <CardDescription>Your scheduled classes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dashboardData?.classes && dashboardData.classes.length > 0 ? (
                                dashboardData.classes.map((cls, index) => (
                                    <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <h3 className="font-medium">{cls.topic}</h3>
                                            <p className="text-xs text-muted-foreground">{cls.courseName}</p>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Clock className="mr-1 h-4 w-4" />
                                                {formatDateTime(cls.startTime)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-sm text-muted-foreground">{cls.tutorName}</div>
                                            <Badge variant={cls.status === "current" ? "default" : "outline"}>
                                                {cls.status === "current" ? "In Progress" : "Upcoming"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No classes scheduled</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Attendance</CardTitle>
                        <CardDescription>Your latest class attendance records</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dashboardData?.recentAttendance && dashboardData.recentAttendance.length > 0 ? (
                                dashboardData.recentAttendance.map((attendance, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                                    >
                                        <div>
                                            <h3 className="font-medium">{attendance.topic}</h3>
                                            <p className="text-xs text-muted-foreground">{attendance.courseName}</p>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Calendar className="mr-1 h-4 w-4" />
                                                {new Date(attendance.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-sm text-muted-foreground">{attendance.tutorName}</div>
                                            <Badge
                                                variant={attendance.status === "full" ? "outline" : "default"}
                                                className={attendance.status === "partial" ? "bg-amber-500" : ""}
                                            >
                                                {attendance.status === "full" ? "Full" : "Partial"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No attendance records yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// Loading skeleton for better UX
const DashboardSkeleton = () => {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-64" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-2 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="border-b pb-4 last:border-0 last:pb-0">
                                        <Skeleton className="h-5 w-48 mb-2" />
                                        <Skeleton className="h-4 w-32 mb-2" />
                                        <div className="flex justify-between">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default StudentDashboard;