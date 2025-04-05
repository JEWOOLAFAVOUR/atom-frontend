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
        last4Students: [],
        last4Tutors: [],
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

    // Mock data for classes - as requested, keeping this as dummy data
    const stats = {
        activeClasses: 24,
    }

    const recentStudents = [
        {
            id: 1,
            name: "Emma Johnson",
            email: "emma@example.com",
            course: "Web Development",
            status: "Active",
            lastActive: "Today",
        },
        {
            id: 2,
            name: "Michael Chen",
            email: "michael@example.com",
            course: "Data Science",
            status: "Active",
            lastActive: "Yesterday",
        },
        {
            id: 3,
            name: "Sophia Rodriguez",
            email: "sophia@example.com",
            course: "UX Design",
            status: "Inactive",
            lastActive: "3 days ago",
        },
        {
            id: 4,
            name: "James Wilson",
            email: "james@example.com",
            course: "Mobile Development",
            status: "Active",
            lastActive: "Today",
        },
    ]

    const recentTutors = [
        {
            id: 1,
            name: "Dr. Sarah Miller",
            email: "sarah@example.com",
            courses: ["Web Development", "UI/UX"],
            status: "Active",
            lastActive: "Today",
        },
        {
            id: 2,
            name: "Prof. David Kim",
            email: "david@example.com",
            courses: ["Data Science", "Machine Learning"],
            status: "Active",
            lastActive: "Yesterday",
        },
        {
            id: 3,
            name: "Dr. Lisa Wang",
            email: "lisa@example.com",
            courses: ["Mobile Development"],
            status: "On Leave",
            lastActive: "5 days ago",
        },
    ]

    const upcomingClasses = [
        { id: 1, name: "Web Development Basics", tutor: "Dr. Sarah Miller", time: "Today, 2:00 PM", students: 18 },
        {
            id: 2,
            name: "Introduction to Machine Learning",
            tutor: "Prof. David Kim",
            time: "Tomorrow, 10:00 AM",
            students: 15,
        },
        { id: 3, name: "UI/UX Principles", tutor: "Dr. Sarah Miller", time: "Friday, 3:30 PM", students: 12 },
    ]

    const [searchQuery, setSearchQuery] = useState("")

    // Filter students based on search query
    const filteredStudents = recentStudents.filter(
        (student) =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.course.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Filter tutors based on search query
    const filteredTutors = recentTutors.filter(
        (tutor) =>
            tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tutor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tutor.courses.some((course) => course.toLowerCase().includes(searchQuery.toLowerCase())),
    )

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
                        <div className="text-2xl font-bold">{stats.activeClasses}</div>
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
                            {upcomingClasses.map((cls) => (
                                <div key={cls.id} className="flex items-center p-3 rounded-lg bg-accent/50">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                        <BookMarked className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium">{cls.name}</h3>
                                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                                            <User className="h-3 w-3 mr-1" />
                                            <span>{cls.tutor}</span>
                                            <span className="mx-2">•</span>
                                            <CalendarDays className="h-3 w-3 mr-1" />
                                            <span>{cls.time}</span>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">{cls.students} Students</Badge>
                                </div>
                            ))}
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




// import { useState } from "react"
// import {
//     BarChart3,
//     BookOpen,
//     GraduationCap,
//     Users,
//     Plus,
//     Search,
//     ChevronDown,
//     Filter,
//     Download,
//     User,
//     BookMarked,
//     CalendarDays
// } from "lucide-react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
// import { Button } from "../../../components/ui/button"
// import { Input } from "../../../components/ui/input"
// import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
// import { Badge } from "../../../components/ui/badge"

// const AdminDashboard = () => {
//     // Mock data - replace with actual data from your store
//     const stats = {
//         totalStudents: 156,
//         totalTutors: 12,
//         totalCourses: 8,
//         activeClasses: 24,
//     }

//     const recentStudents = [
//         { id: 1, name: "Emma Johnson", email: "emma@example.com", course: "Web Development", status: "Active", lastActive: "Today" },
//         { id: 2, name: "Michael Chen", email: "michael@example.com", course: "Data Science", status: "Active", lastActive: "Yesterday" },
//         { id: 3, name: "Sophia Rodriguez", email: "sophia@example.com", course: "UX Design", status: "Inactive", lastActive: "3 days ago" },
//         { id: 4, name: "James Wilson", email: "james@example.com", course: "Mobile Development", status: "Active", lastActive: "Today" },
//     ]

//     const recentTutors = [
//         { id: 1, name: "Dr. Sarah Miller", email: "sarah@example.com", courses: ["Web Development", "UI/UX"], status: "Active", lastActive: "Today" },
//         { id: 2, name: "Prof. David Kim", email: "david@example.com", courses: ["Data Science", "Machine Learning"], status: "Active", lastActive: "Yesterday" },
//         { id: 3, name: "Dr. Lisa Wang", email: "lisa@example.com", courses: ["Mobile Development"], status: "On Leave", lastActive: "5 days ago" },
//     ]

//     const upcomingClasses = [
//         { id: 1, name: "Web Development Basics", tutor: "Dr. Sarah Miller", time: "Today, 2:00 PM", students: 18 },
//         { id: 2, name: "Introduction to Machine Learning", tutor: "Prof. David Kim", time: "Tomorrow, 10:00 AM", students: 15 },
//         { id: 3, name: "UI/UX Principles", tutor: "Dr. Sarah Miller", time: "Friday, 3:30 PM", students: 12 },
//     ]

//     const [searchQuery, setSearchQuery] = useState("")

//     // Filter students based on search query
//     const filteredStudents = recentStudents.filter(student =>
//         student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         student.course.toLowerCase().includes(searchQuery.toLowerCase())
//     )

//     // Filter tutors based on search query
//     const filteredTutors = recentTutors.filter(tutor =>
//         tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         tutor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         tutor.courses.some(course => course.toLowerCase().includes(searchQuery.toLowerCase()))
//     )

//     return (
//         <div className="space-y-6 w-full">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                 <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
//             </div>

//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                 <Card className="shadow-sm hover:shadow-md transition-shadow">
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                         <CardTitle className="text-sm font-medium">Total Students</CardTitle>
//                         <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
//                             <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
//                         </div>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="text-2xl font-bold">{stats.totalStudents}</div>
//                         <div className="flex items-center mt-1">
//                             <span className="text-xs text-green-600 dark:text-green-400 font-medium">+12</span>
//                             <span className="text-xs text-muted-foreground ml-1">from last month</span>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card className="shadow-sm hover:shadow-md transition-shadow">
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                         <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
//                         <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
//                             <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
//                         </div>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="text-2xl font-bold">{stats.totalTutors}</div>
//                         <div className="flex items-center mt-1">
//                             <span className="text-xs text-green-600 dark:text-green-400 font-medium">+2</span>
//                             <span className="text-xs text-muted-foreground ml-1">from last month</span>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card className="shadow-sm hover:shadow-md transition-shadow">
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                         <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
//                         <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
//                             <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
//                         </div>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="text-2xl font-bold">{stats.totalCourses}</div>
//                         <div className="flex items-center mt-1">
//                             <span className="text-xs text-green-600 dark:text-green-400 font-medium">+1</span>
//                             <span className="text-xs text-muted-foreground ml-1">from last month</span>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card className="shadow-sm hover:shadow-md transition-shadow">
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                         <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
//                         <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
//                             <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
//                         </div>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="text-2xl font-bold">{stats.activeClasses}</div>
//                         <div className="flex items-center mt-1">
//                             <span className="text-xs text-green-600 dark:text-green-400 font-medium">+4</span>
//                             <span className="text-xs text-muted-foreground ml-1">from last week</span>
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 <Card className="shadow-sm col-span-1 lg:col-span-2">
//                     <CardHeader className="pb-3">
//                         <div className="flex items-center justify-between">
//                             <CardTitle>Upcoming Classes</CardTitle>
//                             <Button variant="ghost" size="sm" className="gap-1">
//                                 View All
//                                 <ChevronDown className="h-4 w-4" />
//                             </Button>
//                         </div>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="space-y-4">
//                             {upcomingClasses.map((cls) => (
//                                 <div key={cls.id} className="flex items-center p-3 rounded-lg bg-accent/50">
//                                     <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
//                                         <BookMarked className="h-5 w-5 text-primary" />
//                                     </div>
//                                     <div className="flex-1">
//                                         <h3 className="font-medium">{cls.name}</h3>
//                                         <div className="text-sm text-muted-foreground flex items-center mt-1">
//                                             <User className="h-3 w-3 mr-1" />
//                                             <span>{cls.tutor}</span>
//                                             <span className="mx-2">•</span>
//                                             <CalendarDays className="h-3 w-3 mr-1" />
//                                             <span>{cls.time}</span>
//                                         </div>
//                                     </div>
//                                     <Badge variant="secondary">{cls.students} Students</Badge>
//                                 </div>
//                             ))}
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card className="shadow-sm">
//                     <CardHeader>
//                         <CardTitle>Recent Activity</CardTitle>
//                         <CardDescription>
//                             Latest activity in the system
//                         </CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                         <div className="flex gap-3 items-start">
//                             <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 flex items-center justify-center">
//                                 <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
//                             </div>
//                             <div>
//                                 <p className="text-sm font-medium">New student registered</p>
//                                 <p className="text-xs text-muted-foreground">Emma Johnson joined Web Development</p>
//                                 <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
//                             </div>
//                         </div>

//                         <div className="flex gap-3 items-start">
//                             <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0 flex items-center justify-center">
//                                 <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
//                             </div>
//                             <div>
//                                 <p className="text-sm font-medium">New course added</p>
//                                 <p className="text-xs text-muted-foreground">Advanced React with Hooks</p>
//                                 <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
//                             </div>
//                         </div>

//                         <div className="flex gap-3 items-start">
//                             <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex-shrink-0 flex items-center justify-center">
//                                 <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
//                             </div>
//                             <div>
//                                 <p className="text-sm font-medium">New tutor onboarded</p>
//                                 <p className="text-xs text-muted-foreground">Dr. Lisa Wang joined the platform</p>
//                                 <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>

//             <Tabs defaultValue="students" className="mt-8">
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
//                     <TabsList>
//                         <TabsTrigger value="students">Students</TabsTrigger>
//                         <TabsTrigger value="tutors">Tutors</TabsTrigger>
//                     </TabsList>

//                     <div className="relative">
//                         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                         <Input
//                             type="search"
//                             placeholder="Search..."
//                             className="w-full sm:w-64 pl-9"
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                     </div>
//                 </div>

//                 <TabsContent value="students">
//                     <Card className="shadow-sm">
//                         <CardHeader className="pb-2">
//                             <CardTitle>Recently Added Students</CardTitle>
//                             <CardDescription>Manage your recently added students</CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="rounded-md border">
//                                 <table className="w-full">
//                                     <thead>
//                                         <tr className="border-b bg-muted/50">
//                                             <th className="p-3 text-left font-medium">Student</th>
//                                             <th className="p-3 text-left font-medium">Email</th>
//                                             <th className="p-3 text-left font-medium">Course</th>
//                                             <th className="p-3 text-left font-medium">Status</th>
//                                             <th className="p-3 text-left font-medium">Last Active</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {filteredStudents.length > 0 ? (
//                                             filteredStudents.map((student) => (
//                                                 <tr key={student.id} className="border-b">
//                                                     <td className="p-3">
//                                                         <div className="flex items-center gap-3">
//                                                             <Avatar className="h-8 w-8">
//                                                                 <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
//                                                             </Avatar>
//                                                             <span className="font-medium">{student.name}</span>
//                                                         </div>
//                                                     </td>
//                                                     <td className="p-3 text-muted-foreground">{student.email}</td>
//                                                     <td className="p-3">
//                                                         <Badge variant="outline" className="bg-primary/5 text-primary font-normal">
//                                                             {student.course}
//                                                         </Badge>
//                                                     </td>
//                                                     <td className="p-3">
//                                                         <Badge variant={student.status === "Active" ? "success" : "secondary"}>
//                                                             {student.status}
//                                                         </Badge>
//                                                     </td>
//                                                     <td className="p-3 text-muted-foreground">{student.lastActive}</td>
//                                                 </tr>
//                                             ))
//                                         ) : (
//                                             <tr>
//                                                 <td colSpan={5} className="p-4 text-center text-muted-foreground">
//                                                     No students found matching your search.
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>

//                 <TabsContent value="tutors">
//                     <Card className="shadow-sm">
//                         <CardHeader className="pb-2">
//                             <CardTitle>Recently Added Tutors</CardTitle>
//                             <CardDescription>Manage your recently added tutors</CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="rounded-md border">
//                                 <table className="w-full">
//                                     <thead>
//                                         <tr className="border-b bg-muted/50">
//                                             <th className="p-3 text-left font-medium">Tutor</th>
//                                             <th className="p-3 text-left font-medium">Email</th>
//                                             <th className="p-3 text-left font-medium">Courses</th>
//                                             <th className="p-3 text-left font-medium">Status</th>
//                                             <th className="p-3 text-left font-medium">Last Active</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {filteredTutors.length > 0 ? (
//                                             filteredTutors.map((tutor) => (
//                                                 <tr key={tutor.id} className="border-b">
//                                                     <td className="p-3">
//                                                         <div className="flex items-center gap-3">
//                                                             <Avatar className="h-8 w-8">
//                                                                 <AvatarFallback>{tutor.name.split(' ')[0].charAt(0) + tutor.name.split(' ')[1].charAt(0)}</AvatarFallback>
//                                                             </Avatar>
//                                                             <span className="font-medium">{tutor.name}</span>
//                                                         </div>
//                                                     </td>
//                                                     <td className="p-3 text-muted-foreground">{tutor.email}</td>
//                                                     <td className="p-3">
//                                                         <div className="flex flex-wrap gap-1">
//                                                             {tutor.courses.map((course, idx) => (
//                                                                 <Badge key={idx} variant="outline" className="bg-primary/5 text-primary font-normal">
//                                                                     {course}
//                                                                 </Badge>
//                                                             ))}
//                                                         </div>
//                                                     </td>
//                                                     <td className="p-3">
//                                                         <Badge variant={tutor.status === "Active" ? "success" : tutor.status === "On Leave" ? "warning" : "secondary"}>
//                                                             {tutor.status}
//                                                         </Badge>
//                                                     </td>
//                                                     <td className="p-3 text-muted-foreground">{tutor.lastActive}</td>
//                                                 </tr>
//                                             ))
//                                         ) : (
//                                             <tr>
//                                                 <td colSpan={5} className="p-4 text-center text-muted-foreground">
//                                                     No tutors found matching your search.
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>
//             </Tabs>
//         </div>
//     );
// };

// export default AdminDashboard;
