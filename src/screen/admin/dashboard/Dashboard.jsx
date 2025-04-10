"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Avatar, AvatarFallback } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import { fetchDashboard } from "../../../api/auth"

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
    })
    const [isLoading, setIsLoading] = useState(true)

    // Fetch dashboard data
    useEffect(() => {
        const getDashboardData = async () => {
            try {
                setIsLoading(true)
                const response = await fetchDashboard()
                if (response.data?.success) {
                    setDashboardData(response.data.data)
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        getDashboardData()
    }, [])

    // Format date and time for class display
    // const formatDateTime = (dateString) => {
    //     const date = new Date(dateString)
    //     const today = new Date()
    //     const tomorrow = new Date(today)
    //     tomorrow.setDate(tomorrow.getDate() + 1)

    //     // Check if the date is today or tomorrow
    //     let dayLabel = ""
    //     if (date.toDateString() === today.toDateString()) {
    //         dayLabel = "Today"
    //     } else if (date.toDateString() === tomorrow.toDateString()) {
    //         dayLabel = "Tomorrow"
    //     } else {
    //         // Format as day of week
    //         const options = { weekday: 'long' }
    //         dayLabel = new Intl.DateTimeFormat('en-US', options).format(date)
    //     }

    //     // Format time
    //     const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true }
    //     const timeString = new Intl.DateTimeFormat('en-US', timeOptions).format(date)

    //     return `${dayLabel}, ${timeString}`
    // }

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(date);
    };

    // Format time only helper function
    const formatTimeOnly = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(date);
    };

    // Calculate duration helper function
    const getDuration = (startTime, endTime) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMs = end - start;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m` : ''}`;
    };

    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="space-y-6 w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : dashboardData.totalStudents}</div>
                        <div className="flex items-center mt-1">
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">+12</span>
                            <span className="text-xs text-muted-foreground ml-1">from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : dashboardData.totalTutors}</div>
                        <div className="flex items-center mt-1">
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">+2</span>
                            <span className="text-xs text-muted-foreground ml-1">from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : dashboardData.totalCourses}</div>
                        <div className="flex items-center mt-1">
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">+1</span>
                            <span className="text-xs text-muted-foreground ml-1">from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : dashboardData.totalActiveClasses}</div>
                        <div className="flex items-center mt-1">
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">+4</span>
                            <span className="text-xs text-muted-foreground ml-1">from last week</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="shadow-sm col-span-1 lg:col-span-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle>Upcoming Classes</CardTitle>
                            <Button variant="ghost" size="sm" className="gap-1">
                                View All
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="text-center p-4">Loading upcoming classes...</div>
                            ) : dashboardData.latest4Classes && dashboardData.latest4Classes.length > 0 ? (
                                dashboardData.latest4Classes.map((cls, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start p-4 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                    >
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                                            <BookMarked className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-base">{cls.topic}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{cls.courseName}</p>

                                            <div className="flex flex-wrap gap-y-2 mt-3">
                                                <div className="flex items-center mr-4 text-xs text-gray-600 dark:text-gray-300">
                                                    <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                                    <span>{cls.tutorName}</span>
                                                </div>

                                                <div className="flex items-center mr-4 text-xs text-gray-600 dark:text-gray-300">
                                                    <CalendarDays className="h-3 w-3 mr-1 flex-shrink-0" />
                                                    <span>{formatDateTime(cls.startTime)}</span>
                                                </div>

                                                <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                                                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                                    <span>
                                                        {formatTimeOnly(cls.startTime)} - {formatTimeOnly(cls.endTime)}
                                                        <span className="ml-1 text-primary font-medium">({getDuration(cls.startTime, cls.endTime)})</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={cls.status === "current" ? "default" : "secondary"}
                                            className="ml-2 self-start mt-1"
                                        >
                                            {cls.studentCount} {cls.studentCount === 1 ? 'Student' : 'Students'}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-4 text-muted-foreground">No upcoming classes found.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest activity in the system</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3 items-start">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">New student registered</p>
                                <p className="text-xs text-muted-foreground">Emma Johnson joined Web Development</p>
                                <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0 flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">New course added</p>
                                <p className="text-xs text-muted-foreground">Advanced React with Hooks</p>
                                <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex-shrink-0 flex items-center justify-center">
                                <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">New tutor onboarded</p>
                                <p className="text-xs text-muted-foreground">Dr. Lisa Wang joined the platform</p>
                                <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="students" className="mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <TabsList>
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="tutors">Tutors</TabsTrigger>
                    </TabsList>

                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="w-full sm:w-64 pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="students">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle>Recently Added Students</CardTitle>
                            <CardDescription>Manage your recently added students</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left font-medium">Student</th>
                                            <th className="p-3 text-left font-medium">Email</th>
                                            <th className="p-3 text-left font-medium">Join Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={3} className="p-4 text-center">
                                                    Loading students...
                                                </td>
                                            </tr>
                                        ) : dashboardData.last4Students && dashboardData.last4Students.length > 0 ? (
                                            dashboardData.last4Students
                                                .filter(
                                                    (student) =>
                                                        student.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        student.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        student.email.toLowerCase().includes(searchQuery.toLowerCase()),
                                                )
                                                .map((student) => (
                                                    <tr key={student._id} className="border-b">
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarFallback>
                                                                        {student.firstname.charAt(0)}
                                                                        {student.lastname.charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="font-medium">
                                                                    {student.firstname} {student.lastname}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-muted-foreground">{student.email}</td>
                                                        <td className="p-3 text-muted-foreground">
                                                            {new Date(student.createdAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="p-4 text-center text-muted-foreground">
                                                    No students found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tutors">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle>Recently Added Tutors</CardTitle>
                            <CardDescription>Manage your recently added tutors</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left font-medium">Tutor</th>
                                            <th className="p-3 text-left font-medium">Email</th>
                                            <th className="p-3 text-left font-medium">Join Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={3} className="p-4 text-center">
                                                    Loading tutors...
                                                </td>
                                            </tr>
                                        ) : dashboardData.last4Tutors && dashboardData.last4Tutors.length > 0 ? (
                                            dashboardData.last4Tutors
                                                .filter(
                                                    (tutor) =>
                                                        tutor.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        tutor.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        tutor.email.toLowerCase().includes(searchQuery.toLowerCase()),
                                                )
                                                .map((tutor) => (
                                                    <tr key={tutor._id} className="border-b">
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarFallback>
                                                                        {tutor.firstname.charAt(0)}
                                                                        {tutor.lastname.charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="font-medium">
                                                                    {tutor.firstname} {tutor.lastname}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-muted-foreground">{tutor.email}</td>
                                                        <td className="p-3 text-muted-foreground">
                                                            {new Date(tutor.createdAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="p-4 text-center text-muted-foreground">
                                                    No tutors found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default AdminDashboard
