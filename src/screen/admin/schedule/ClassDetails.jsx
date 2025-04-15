"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    User,
    BookOpen,
    CheckCircle,
    XCircle,
    Info,
    LogIn,
    LogOut,
    Search,
    FolderOpen,
    UserCheck,
    UserX,
    BarChart3,
    Download,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { sendToast } from "../../../components/utilis";
import useAuthStore from "../../../store/useAuthStore"
import { getClassDetails } from "../../../api/auth"

const ClassDetails = () => {
    const { classId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [classData, setClassData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredStudents, setFilteredStudents] = useState([])
    const [attendanceStats, setAttendanceStats] = useState({
        present: 0,
        absent: 0,
        total: 0,
        presentPercentage: 0,
    })

    useEffect(() => {
        if (classId) {
            fetchClassDetails(classId)
        }
    }, [classId])

    useEffect(() => {
        if (classData?.students) {
            const filtered = classData.students.filter(
                (item) =>
                    item.student.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.student.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.student.email.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            setFilteredStudents(filtered)

            // Calculate attendance statistics
            const present = classData.students.filter((item) => item.status === "present").length
            const total = classData.students.length
            const presentPercentage = total > 0 ? (present / total) * 100 : 0

            setAttendanceStats({
                present,
                absent: total - present,
                total,
                presentPercentage,
            })
        }
    }, [searchQuery, classData])

    const fetchClassDetails = async (id) => {
        setIsLoading(true)
        try {
            const response = await getClassDetails(id)

            if (response.data?.success) {
                setClassData(response.data.data)
            } else {
                sendToast("error", "Failed to fetch class details")
            }
        } catch (error) {
            console.error("Error fetching class details:", error)
            sendToast("error", "Failed to fetch class details")
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString) => {
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }
        return new Date(dateString).toLocaleDateString(undefined, options)
    }

    const formatTime = (dateString) => {
        const options = {
            hour: "2-digit",
            minute: "2-digit",
        }
        return new Date(dateString).toLocaleTimeString(undefined, options)
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return "Not recorded"
        const options = {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
        return new Date(dateString).toLocaleString(undefined, options)
    }

    const getInitials = (firstname, lastname) => {
        if (!firstname || !lastname) return "??"
        return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "present":
                return "bg-green-100 text-green-800 border-green-300"
            case "absent":
                return "bg-red-100 text-red-800 border-red-300"
            default:
                return "bg-gray-100 text-gray-800 border-gray-300"
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "present":
                return <CheckCircle className="h-4 w-4 text-green-600" />
            case "absent":
                return <XCircle className="h-4 w-4 text-red-600" />
            default:
                return <Info className="h-4 w-4 text-gray-600" />
        }
    }

    const isClassActive = () => {
        if (!classData) return false
        const now = new Date()
        const startTime = new Date(classData.startTime)
        const endTime = new Date(classData.endTime)
        return now >= startTime && now <= endTime
    }

    const isClassPast = () => {
        if (!classData) return false
        const now = new Date()
        const endTime = new Date(classData.endTime)
        return now > endTime
    }

    const isClassUpcoming = () => {
        if (!classData) return false
        const now = new Date()
        const startTime = new Date(classData.startTime)
        return now < startTime
    }

    const getClassStatusBadge = () => {
        if (isClassActive()) {
            return <Badge className="bg-green-100 text-green-800 border-green-300">In Progress</Badge>
        } else if (isClassPast()) {
            return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Completed</Badge>
        } else {
            return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Upcoming</Badge>
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading class details...</p>
                </div>
            </div>
        )
    }

    if (!classData) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <Info className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Class Not Found</h2>
                <p className="text-muted-foreground mb-6">The class you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => navigate("/dashboard/classes")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Classes
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigate("/dashboard/classes")} className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">{classData.topic}</h1>
                            {getClassStatusBadge()}
                        </div>
                        <p className="text-muted-foreground mt-1">Class Details</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/dashboard/classes/edit/${classId}`)}>
                        Edit Class
                    </Button>
                    <Button variant="outline" onClick={() => window.print()}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Class Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">{classData.topic}</h3>
                                    <p className="text-sm text-muted-foreground">{classData.description || "No description available"}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{formatDate(classData.startTime)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Course & Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <FolderOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">{classData.category?.name || "No category assigned"}</h3>
                                    <p className="text-sm text-muted-foreground">{classData.course?.name || "No course assigned"}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Students in Category</span>
                                    <span>{classData.category?.students?.length || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tutors in Category</span>
                                    <span>{classData.category?.tutors?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Attendance Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <BarChart3 className="h-5 w-5 text-primary" />
                                </div>
                                <div className="w-full">
                                    <div className="flex justify-between mb-1">
                                        <h3 className="font-medium">Attendance Rate</h3>
                                        <span className="text-sm font-medium">{attendanceStats.presentPercentage.toFixed(0)}%</span>
                                    </div>
                                    <Progress value={attendanceStats.presentPercentage} className="h-2" />
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="space-y-1">
                                    <div className="text-2xl font-bold">{attendanceStats.total}</div>
                                    <div className="text-xs text-muted-foreground">Total</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
                                    <div className="text-xs text-muted-foreground">Present</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
                                    <div className="text-xs text-muted-foreground">Absent</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="attendance" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="tutor">Tutor</TabsTrigger>
                    <TabsTrigger value="category">Category Details</TabsTrigger>
                </TabsList>

                <TabsContent value="attendance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle>Student Attendance</CardTitle>
                                    <CardDescription>Attendance record for {formatDate(classData.startTime)}</CardDescription>
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search students..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left font-medium">Student</th>
                                            <th className="p-3 text-left font-medium">Status</th>
                                            <th className="p-3 text-left font-medium hidden md:table-cell">Sign In</th>
                                            <th className="p-3 text-left font-medium hidden md:table-cell">Sign Out</th>
                                            <th className="p-3 text-left font-medium hidden lg:table-cell">Marked By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((item, index) => (
                                                <tr key={index} className="border-b hover:bg-muted/50">
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                                    {getInitials(item.student.firstname, item.student.lastname)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {item.student.firstname} {item.student.lastname}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">{item.student.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(item.status)}
                                                            <Badge className={getStatusColor(item.status)}>
                                                                {item.status === "present" ? "Present" : "Absent"}
                                                            </Badge>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 hidden md:table-cell">
                                                        <div className="flex items-center gap-2">
                                                            <LogIn className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">
                                                                {item.signInTime ? formatDateTime(item.signInTime) : "Not signed in"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 hidden md:table-cell">
                                                        <div className="flex items-center gap-2">
                                                            <LogOut className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">
                                                                {item.signOutTime ? formatDateTime(item.signOutTime) : "Not signed out"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 hidden lg:table-cell">
                                                        {item.marker ? (
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                                        {getInitials(item.marker.firstname, item.marker.lastname)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-sm">
                                                                    {item.marker.firstname} {item.marker.lastname}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">Not marked</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                    No students found matching your search.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t px-6 py-4">
                            <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-green-600" />
                                <span className="text-sm">
                                    {attendanceStats.present} present ({attendanceStats.presentPercentage.toFixed(0)}%)
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <UserX className="h-4 w-4 text-red-600" />
                                <span className="text-sm">
                                    {attendanceStats.absent} absent ({(100 - attendanceStats.presentPercentage).toFixed(0)}%)
                                </span>
                            </div>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Timeline</CardTitle>
                            <CardDescription>Sign-in and sign-out times for present students</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {classData.students
                                    .filter((item) => item.status === "present")
                                    .map((item, index) => (
                                        <div key={index} className="relative pl-6 pb-6 last:pb-0">
                                            <div className="absolute left-0 top-0 h-full w-px bg-border">
                                                <div
                                                    className="absolute top-0 left-0 h-3 w-3 -translate-x-1 rounded-full border-2 border-background bg-green-500"
                                                    style={{ transform: "translateX(-50%)" }}
                                                ></div>
                                                <div
                                                    className="absolute bottom-0 left-0 h-3 w-3 -translate-x-1 rounded-full border-2 border-background bg-red-500"
                                                    style={{ transform: "translateX(-50%)" }}
                                                ></div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                            {getInitials(item.student.firstname, item.student.lastname)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">
                                                            {item.student.firstname} {item.student.lastname}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">{item.student.email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:items-end gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <LogIn className="h-4 w-4 text-green-600" />
                                                        <span className="text-sm">
                                                            Signed in: {item.signInTime ? formatDateTime(item.signInTime) : "Not recorded"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <LogOut className="h-4 w-4 text-red-600" />
                                                        <span className="text-sm">
                                                            Signed out: {item.signOutTime ? formatDateTime(item.signOutTime) : "Not recorded"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                {classData.students.filter((item) => item.status === "present").length === 0 && (
                                    <div className="text-center py-8">
                                        <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No Attendance Records</h3>
                                        <p className="text-muted-foreground">No students have been marked as present for this class.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tutor">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tutor Information</CardTitle>
                            <CardDescription>Details about the tutors assigned to this category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {classData.category?.tutors && classData.category.tutors.length > 0 ? (
                                <div className="space-y-8">
                                    {classData.category.tutors.map((tutor, index) => (
                                        <div key={index} className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-shrink-0">
                                                <Avatar className="h-24 w-24">
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                                        {getInitials(tutor.firstname, tutor.lastname)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="space-y-4 flex-1">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-xl font-bold">
                                                            {tutor.firstname} {tutor.lastname}
                                                        </h3>
                                                        {classData.tutor === tutor._id ||
                                                            (typeof classData.tutor === "object" && classData.tutor?._id === tutor._id) ? (
                                                            <Badge className="bg-blue-100 text-blue-800 border-blue-300">Class Tutor</Badge>
                                                        ) : (
                                                            <Badge variant="outline">Category Tutor</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-muted-foreground">{tutor.email}</p>
                                                </div>

                                                <Separator />

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="text-sm font-medium mb-2">Class Information</h4>
                                                        <ul className="space-y-2">
                                                            <li className="flex items-center gap-2 text-sm">
                                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                <span>{formatDate(classData.startTime)}</span>
                                                            </li>
                                                            <li className="flex items-center gap-2 text-sm">
                                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                                <span>
                                                                    {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
                                                                </span>
                                                            </li>
                                                            <li className="flex items-center gap-2 text-sm">
                                                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                                <span>{classData.course?.name || "No course assigned"}</span>
                                                            </li>
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-medium mb-2">Attendance Summary</h4>
                                                        <ul className="space-y-2">
                                                            <li className="flex items-center gap-2 text-sm">
                                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                                <span>Total Students: {attendanceStats.total}</span>
                                                            </li>
                                                            <li className="flex items-center gap-2 text-sm">
                                                                <UserCheck className="h-4 w-4 text-green-600" />
                                                                <span>Present: {attendanceStats.present}</span>
                                                            </li>
                                                            <li className="flex items-center gap-2 text-sm">
                                                                <UserX className="h-4 w-4 text-red-600" />
                                                                <span>Absent: {attendanceStats.absent}</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Tutors Assigned</h3>
                                    <p className="text-muted-foreground">This category doesn't have any tutors assigned to it.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="category">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Information</CardTitle>
                            <CardDescription>Details about the category for this class</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {classData.category ? (
                                <div className="space-y-6">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <FolderOpen className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-lg">{classData.category.name}</h3>
                                            <p className="text-muted-foreground">{classData.course?.name || "No course assigned"}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-medium mb-3">
                                                Students in Category ({classData.category.students?.length || 0})
                                            </h4>
                                            <ScrollArea className="h-60 rounded-md border p-4">
                                                {classData.category.students && classData.category.students.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {classData.category.students.map((student, index) => (
                                                            <div key={index} className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                                            {getInitials(student.firstname, student.lastname)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <div className="font-medium">
                                                                            {student.firstname} {student.lastname}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">{student.email}</div>
                                                                    </div>
                                                                </div>
                                                                {classData.students.some(
                                                                    (item) => item.student._id === student._id && item.status === "present",
                                                                ) ? (
                                                                    <Badge className="bg-green-100 text-green-800 border-green-300">Present</Badge>
                                                                ) : classData.students.some((item) => item.student._id === student._id) ? (
                                                                    <Badge className="bg-red-100 text-red-800 border-red-300">Absent</Badge>
                                                                ) : (
                                                                    <Badge className="bg-gray-100 text-gray-800 border-gray-300">Not Enrolled</Badge>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                                                        <p className="text-muted-foreground">No students in this category</p>
                                                    </div>
                                                )}
                                            </ScrollArea>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium mb-3">
                                                Tutors in Category ({classData.category.tutors?.length || 0})
                                            </h4>
                                            <ScrollArea className="h-60 rounded-md border p-4">
                                                {classData.category.tutors && classData.category.tutors.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {classData.category.tutors.map((tutor, index) => (
                                                            <div key={index} className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                                            {getInitials(tutor.firstname, tutor.lastname)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <div className="font-medium">
                                                                            {tutor.firstname} {tutor.lastname}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">{tutor.email}</div>
                                                                    </div>
                                                                </div>
                                                                {classData.tutor === tutor._id ||
                                                                    (typeof classData.tutor === "object" && classData.tutor?._id === tutor._id) ? (
                                                                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">Class Tutor</Badge>
                                                                ) : (
                                                                    <Badge variant="outline">Category Tutor</Badge>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <User className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                                                        <p className="text-muted-foreground">No tutors in this category</p>
                                                    </div>
                                                )}
                                            </ScrollArea>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Category Assigned</h3>
                                    <p className="text-muted-foreground">This class doesn't have a category assigned to it.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default ClassDetails



// import { useState, useEffect } from "react"
// import { useParams, useNavigate } from "react-router-dom"
// import {
//     ArrowLeft,
//     Calendar,
//     Clock,
//     Users,
//     User,
//     BookOpen,
//     CheckCircle,
//     XCircle,
//     Info,
//     LogIn,
//     LogOut,
//     Search,
//     FolderOpen,
//     UserCheck,
//     UserX,
//     BarChart3,
//     Download,
// } from "lucide-react"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Input } from "@/components/ui/input"
// import { Separator } from "@/components/ui/separator"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Progress } from "@/components/ui/progress"
// import { sendToast } from "../../../components/utilis"
// import useAuthStore from "../../../store/useAuthStore"
// import { getClassDetails } from "../../../api/auth"

// const ClassDetails = () => {
//     const { classId } = useParams()
//     const navigate = useNavigate()
//     const { user } = useAuthStore()

//     const [classData, setClassData] = useState(null)
//     const [isLoading, setIsLoading] = useState(true)
//     const [searchQuery, setSearchQuery] = useState("")
//     const [filteredStudents, setFilteredStudents] = useState([])
//     const [attendanceStats, setAttendanceStats] = useState({
//         present: 0,
//         absent: 0,
//         total: 0,
//         presentPercentage: 0,
//     })

//     console.log('.................................', classData)

//     useEffect(() => {
//         if (classId) {
//             fetchClassDetails(classId)
//         }
//     }, [classId])

//     useEffect(() => {
//         if (classData?.students) {
//             const filtered = classData.students.filter(
//                 (item) =>
//                     item.student.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                     item.student.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                     item.student.email.toLowerCase().includes(searchQuery.toLowerCase()),
//             )
//             setFilteredStudents(filtered)

//             // Calculate attendance statistics
//             const present = classData.students.filter((item) => item.status === "present").length
//             const total = classData.students.length
//             const presentPercentage = total > 0 ? (present / total) * 100 : 0

//             setAttendanceStats({
//                 present,
//                 absent: total - present,
//                 total,
//                 presentPercentage,
//             })
//         }
//     }, [searchQuery, classData])

//     const fetchClassDetails = async (id) => {
//         setIsLoading(true)
//         try {
//             const response = await getClassDetails(id)

//             if (response.data?.success) {
//                 setClassData(response.data.data)
//             } else {
//                 sendToast("error", "Failed to fetch class details")
//             }
//         } catch (error) {
//             console.error("Error fetching class details:", error)
//             sendToast("error", "Failed to fetch class details")
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     const formatDate = (dateString) => {
//         const options = {
//             weekday: "long",
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//         }
//         return new Date(dateString).toLocaleDateString(undefined, options)
//     }

//     const formatTime = (dateString) => {
//         const options = {
//             hour: "2-digit",
//             minute: "2-digit",
//         }
//         return new Date(dateString).toLocaleTimeString(undefined, options)
//     }

//     const formatDateTime = (dateString) => {
//         if (!dateString) return "Not recorded"
//         const options = {
//             month: "short",
//             day: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//         }
//         return new Date(dateString).toLocaleString(undefined, options)
//     }

//     const getInitials = (firstname, lastname) => {
//         if (!firstname || !lastname) return "??"
//         return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
//     }

//     const getStatusColor = (status) => {
//         switch (status) {
//             case "present":
//                 return "bg-green-100 text-green-800 border-green-300"
//             case "absent":
//                 return "bg-red-100 text-red-800 border-red-300"
//             default:
//                 return "bg-gray-100 text-gray-800 border-gray-300"
//         }
//     }

//     const getStatusIcon = (status) => {
//         switch (status) {
//             case "present":
//                 return <CheckCircle className="h-4 w-4 text-green-600" />
//             case "absent":
//                 return <XCircle className="h-4 w-4 text-red-600" />
//             default:
//                 return <Info className="h-4 w-4 text-gray-600" />
//         }
//     }

//     const isClassActive = () => {
//         if (!classData) return false
//         const now = new Date()
//         const startTime = new Date(classData.startTime)
//         const endTime = new Date(classData.endTime)
//         return now >= startTime && now <= endTime
//     }

//     const isClassPast = () => {
//         if (!classData) return false
//         const now = new Date()
//         const endTime = new Date(classData.endTime)
//         return now > endTime
//     }

//     const isClassUpcoming = () => {
//         if (!classData) return false
//         const now = new Date()
//         const startTime = new Date(classData.startTime)
//         return now < startTime
//     }

//     const getClassStatusBadge = () => {
//         if (isClassActive()) {
//             return <Badge className="bg-green-100 text-green-800 border-green-300">In Progress</Badge>
//         } else if (isClassPast()) {
//             return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Completed</Badge>
//         } else {
//             return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Upcoming</Badge>
//         }
//     }

//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center h-96">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//                     <p className="mt-4 text-muted-foreground">Loading class details...</p>
//                 </div>
//             </div>
//         )
//     }

//     if (!classData) {
//         return (
//             <div className="flex flex-col items-center justify-center h-96">
//                 <Info className="h-12 w-12 text-muted-foreground mb-4" />
//                 <h2 className="text-2xl font-bold mb-2">Class Not Found</h2>
//                 <p className="text-muted-foreground mb-6">The class you're looking for doesn't exist or has been removed.</p>
//                 <Button onClick={() => navigate("/dashboard/classes")}>
//                     <ArrowLeft className="mr-2 h-4 w-4" />
//                     Back to Classes
//                 </Button>
//             </div>
//         )
//     }

//     return (
//         <div className="space-y-6">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                 <div className="flex items-center gap-2">
//                     <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
//                         <ArrowLeft className="h-4 w-4" />
//                     </Button>
//                     <div>
//                         <div className="flex items-center gap-2">
//                             <h1 className="text-3xl font-bold tracking-tight">{classData.topic}</h1>
//                             {getClassStatusBadge()}
//                         </div>
//                         <p className="text-muted-foreground mt-1">Class Details</p>
//                     </div>
//                 </div>
//                 <div className="flex gap-2">
//                     <Button variant="outline" onClick={() => navigate(`/dashboard/classes/edit/${classId}`)}>
//                         Edit Class
//                     </Button>
//                     <Button variant="outline" onClick={() => window.print()}>
//                         <Download className="mr-2 h-4 w-4" />
//                         Export
//                     </Button>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <Card>
//                     <CardHeader className="pb-2">
//                         <CardTitle className="text-sm font-medium">Class Information</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="space-y-4">
//                             <div className="flex items-start gap-3">
//                                 <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
//                                     <BookOpen className="h-5 w-5 text-primary" />
//                                 </div>
//                                 <div>
//                                     <h3 className="font-medium">{classData.topic}</h3>
//                                     <p className="text-sm text-muted-foreground">{classData.description || "No description available"}</p>
//                                 </div>
//                             </div>
//                             <Separator />
//                             <div className="space-y-3">
//                                 <div className="flex items-center gap-2">
//                                     <Calendar className="h-4 w-4 text-muted-foreground" />
//                                     <span className="text-sm">{formatDate(classData.startTime)}</span>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                     <Clock className="h-4 w-4 text-muted-foreground" />
//                                     <span className="text-sm">
//                                         {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card>
//                     <CardHeader className="pb-2">
//                         <CardTitle className="text-sm font-medium">Course & Category</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="space-y-4">
//                             <div className="flex items-start gap-3">
//                                 <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
//                                     <FolderOpen className="h-5 w-5 text-primary" />
//                                 </div>
//                                 <div>
//                                     <h3 className="font-medium">{classData.category?.name || "No category assigned"}</h3>
//                                     <p className="text-sm text-muted-foreground">{classData.course?.name || "No course assigned"}</p>
//                                 </div>
//                             </div>
//                             <Separator />
//                             <div className="space-y-2">
//                                 <div className="flex justify-between text-sm">
//                                     <span className="text-muted-foreground">Students in Category</span>
//                                     <span>{classData.category?.students?.length || 0}</span>
//                                 </div>
//                                 <div className="flex justify-between text-sm">
//                                     <span className="text-muted-foreground">Tutors in Category</span>
//                                     <span>{classData.category?.tutors?.length || 0}</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card>
//                     <CardHeader className="pb-2">
//                         <CardTitle className="text-sm font-medium">Attendance Summary</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="space-y-4">
//                             <div className="flex items-start gap-3">
//                                 <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
//                                     <BarChart3 className="h-5 w-5 text-primary" />
//                                 </div>
//                                 <div className="w-full">
//                                     <div className="flex justify-between mb-1">
//                                         <h3 className="font-medium">Attendance Rate</h3>
//                                         <span className="text-sm font-medium">{attendanceStats.presentPercentage.toFixed(0)}%</span>
//                                     </div>
//                                     <Progress value={attendanceStats.presentPercentage} className="h-2" />
//                                 </div>
//                             </div>
//                             <Separator />
//                             <div className="grid grid-cols-3 gap-2 text-center">
//                                 <div className="space-y-1">
//                                     <div className="text-2xl font-bold">{attendanceStats.total}</div>
//                                     <div className="text-xs text-muted-foreground">Total</div>
//                                 </div>
//                                 <div className="space-y-1">
//                                     <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
//                                     <div className="text-xs text-muted-foreground">Present</div>
//                                 </div>
//                                 <div className="space-y-1">
//                                     <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
//                                     <div className="text-xs text-muted-foreground">Absent</div>
//                                 </div>
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>

//             <Tabs defaultValue="attendance" className="space-y-4">
//                 <TabsList>
//                     <TabsTrigger value="attendance">Attendance</TabsTrigger>
//                     <TabsTrigger value="tutor">Tutor</TabsTrigger>
//                     <TabsTrigger value="category">Category Details</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="attendance" className="space-y-4">
//                     <Card>
//                         <CardHeader>
//                             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                                 <div>
//                                     <CardTitle>Student Attendance</CardTitle>
//                                     <CardDescription>Attendance record for {formatDate(classData.startTime)}</CardDescription>
//                                 </div>
//                                 <div className="relative w-full sm:w-64">
//                                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                                     <Input
//                                         type="search"
//                                         placeholder="Search students..."
//                                         className="pl-9"
//                                         value={searchQuery}
//                                         onChange={(e) => setSearchQuery(e.target.value)}
//                                     />
//                                 </div>
//                             </div>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="rounded-md border">
//                                 <table className="w-full">
//                                     <thead>
//                                         <tr className="border-b bg-muted/50">
//                                             <th className="p-3 text-left font-medium">Student</th>
//                                             <th className="p-3 text-left font-medium">Status</th>
//                                             <th className="p-3 text-left font-medium hidden md:table-cell">Sign In</th>
//                                             <th className="p-3 text-left font-medium hidden md:table-cell">Sign Out</th>
//                                             <th className="p-3 text-left font-medium hidden lg:table-cell">Marked By</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {filteredStudents.length > 0 ? (
//                                             filteredStudents.map((item, index) => (
//                                                 <tr key={index} className="border-b hover:bg-muted/50">
//                                                     <td className="p-3">
//                                                         <div className="flex items-center gap-3">
//                                                             <Avatar className="h-8 w-8">
//                                                                 <AvatarFallback className="bg-primary/10 text-primary">
//                                                                     {getInitials(item.student.firstname, item.student.lastname)}
//                                                                 </AvatarFallback>
//                                                             </Avatar>
//                                                             <div>
//                                                                 <div className="font-medium">
//                                                                     {item.student.firstname} {item.student.lastname}
//                                                                 </div>
//                                                                 <div className="text-sm text-muted-foreground">{item.student.email}</div>
//                                                             </div>
//                                                         </div>
//                                                     </td>
//                                                     <td className="p-3">
//                                                         <div className="flex items-center gap-2">
//                                                             {getStatusIcon(item.status)}
//                                                             <Badge className={getStatusColor(item.status)}>
//                                                                 {item.status === "present" ? "Present" : "Absent"}
//                                                             </Badge>
//                                                         </div>
//                                                     </td>
//                                                     <td className="p-3 hidden md:table-cell">
//                                                         <div className="flex items-center gap-2">
//                                                             <LogIn className="h-4 w-4 text-muted-foreground" />
//                                                             <span className="text-sm">
//                                                                 {item.signInTime ? formatDateTime(item.signInTime) : "Not signed in"}
//                                                             </span>
//                                                         </div>
//                                                     </td>
//                                                     <td className="p-3 hidden md:table-cell">
//                                                         <div className="flex items-center gap-2">
//                                                             <LogOut className="h-4 w-4 text-muted-foreground" />
//                                                             <span className="text-sm">
//                                                                 {item.signOutTime ? formatDateTime(item.signOutTime) : "Not signed out"}
//                                                             </span>
//                                                         </div>
//                                                     </td>
//                                                     <td className="p-3 hidden lg:table-cell">
//                                                         {item.marker ? (
//                                                             <div className="flex items-center gap-2">
//                                                                 <Avatar className="h-6 w-6">
//                                                                     <AvatarFallback className="bg-primary/10 text-primary text-xs">
//                                                                         {getInitials(item.marker.firstname, item.marker.lastname)}
//                                                                     </AvatarFallback>
//                                                                 </Avatar>
//                                                                 <span className="text-sm">
//                                                                     {item.marker.firstname} {item.marker.lastname}
//                                                                 </span>
//                                                             </div>
//                                                         ) : (
//                                                             <span className="text-sm text-muted-foreground">Not marked</span>
//                                                         )}
//                                                     </td>
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
//                         <CardFooter className="flex justify-between border-t px-6 py-4">
//                             <div className="flex items-center gap-2">
//                                 <UserCheck className="h-4 w-4 text-green-600" />
//                                 <span className="text-sm">
//                                     {attendanceStats.present} present ({attendanceStats.presentPercentage.toFixed(0)}%)
//                                 </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <UserX className="h-4 w-4 text-red-600" />
//                                 <span className="text-sm">
//                                     {attendanceStats.absent} absent ({(100 - attendanceStats.presentPercentage).toFixed(0)}%)
//                                 </span>
//                             </div>
//                         </CardFooter>
//                     </Card>

//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Attendance Timeline</CardTitle>
//                             <CardDescription>Sign-in and sign-out times for present students</CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="space-y-6">
//                                 {classData.students
//                                     .filter((item) => item.status === "present")
//                                     .map((item, index) => (
//                                         <div key={index} className="relative pl-6 pb-6 last:pb-0">
//                                             <div className="absolute left-0 top-0 h-full w-px bg-border">
//                                                 <div
//                                                     className="absolute top-0 left-0 h-3 w-3 -translate-x-1 rounded-full border-2 border-background bg-green-500"
//                                                     style={{ transform: "translateX(-50%)" }}
//                                                 ></div>
//                                                 <div
//                                                     className="absolute bottom-0 left-0 h-3 w-3 -translate-x-1 rounded-full border-2 border-background bg-red-500"
//                                                     style={{ transform: "translateX(-50%)" }}
//                                                 ></div>
//                                             </div>
//                                             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//                                                 <div className="flex items-center gap-3">
//                                                     <Avatar className="h-8 w-8">
//                                                         <AvatarFallback className="bg-primary/10 text-primary">
//                                                             {getInitials(item.student.firstname, item.student.lastname)}
//                                                         </AvatarFallback>
//                                                     </Avatar>
//                                                     <div>
//                                                         <div className="font-medium">
//                                                             {item.student.firstname} {item.student.lastname}
//                                                         </div>
//                                                         <div className="text-sm text-muted-foreground">{item.student.email}</div>
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex flex-col sm:items-end gap-1">
//                                                     <div className="flex items-center gap-2">
//                                                         <LogIn className="h-4 w-4 text-green-600" />
//                                                         <span className="text-sm">
//                                                             Signed in: {item.signInTime ? formatDateTime(item.signInTime) : "Not recorded"}
//                                                         </span>
//                                                     </div>
//                                                     <div className="flex items-center gap-2">
//                                                         <LogOut className="h-4 w-4 text-red-600" />
//                                                         <span className="text-sm">
//                                                             Signed out: {item.signOutTime ? formatDateTime(item.signOutTime) : "Not recorded"}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     ))}

//                                 {classData.students.filter((item) => item.status === "present").length === 0 && (
//                                     <div className="text-center py-8">
//                                         <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                                         <h3 className="text-lg font-medium mb-2">No Attendance Records</h3>
//                                         <p className="text-muted-foreground">No students have been marked as present for this class.</p>
//                                     </div>
//                                 )}
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>

//                 <TabsContent value="tutor">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Tutor Information</CardTitle>
//                             <CardDescription>Details about the tutor assigned to this class</CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                             {classData.tutor ? (
//                                 <div className="flex flex-col md:flex-row gap-6">
//                                     <div className="flex-shrink-0">
//                                         <Avatar className="h-24 w-24">
//                                             <AvatarFallback className="bg-primary/10 text-primary text-xl">
//                                                 {typeof classData.tutor === "string"
//                                                     ? "T"
//                                                     : getInitials(classData.tutor.firstname, classData.tutor.lastname)}
//                                             </AvatarFallback>
//                                         </Avatar>
//                                     </div>
//                                     <div className="space-y-4 flex-1">
//                                         <div>
//                                             <h3 className="text-xl font-bold">
//                                                 {typeof classData.tutor === "string"
//                                                     ? "Tutor"
//                                                     : `${classData.tutor.firstname} ${classData.tutor.lastname}`}
//                                             </h3>
//                                             <p className="text-muted-foreground">
//                                                 {typeof classData.tutor === "string" ? "" : classData.tutor.email}
//                                             </p>
//                                         </div>

//                                         <Separator />

//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                             <div>
//                                                 <h4 className="text-sm font-medium mb-2">Class Information</h4>
//                                                 <ul className="space-y-2">
//                                                     <li className="flex items-center gap-2 text-sm">
//                                                         <Calendar className="h-4 w-4 text-muted-foreground" />
//                                                         <span>{formatDate(classData.startTime)}</span>
//                                                     </li>
//                                                     <li className="flex items-center gap-2 text-sm">
//                                                         <Clock className="h-4 w-4 text-muted-foreground" />
//                                                         <span>
//                                                             {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
//                                                         </span>
//                                                     </li>
//                                                     <li className="flex items-center gap-2 text-sm">
//                                                         <BookOpen className="h-4 w-4 text-muted-foreground" />
//                                                         <span>{classData.course?.name || "No course assigned"}</span>
//                                                     </li>
//                                                 </ul>
//                                             </div>

//                                             <div>
//                                                 <h4 className="text-sm font-medium mb-2">Attendance Summary</h4>
//                                                 <ul className="space-y-2">
//                                                     <li className="flex items-center gap-2 text-sm">
//                                                         <Users className="h-4 w-4 text-muted-foreground" />
//                                                         <span>Total Students: {attendanceStats.total}</span>
//                                                     </li>
//                                                     <li className="flex items-center gap-2 text-sm">
//                                                         <UserCheck className="h-4 w-4 text-green-600" />
//                                                         <span>Present: {attendanceStats.present}</span>
//                                                     </li>
//                                                     <li className="flex items-center gap-2 text-sm">
//                                                         <UserX className="h-4 w-4 text-red-600" />
//                                                         <span>Absent: {attendanceStats.absent}</span>
//                                                     </li>
//                                                 </ul>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-8">
//                                     <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                                     <h3 className="text-lg font-medium mb-2">No Tutor Assigned</h3>
//                                     <p className="text-muted-foreground">This class doesn't have a tutor assigned to it.</p>
//                                 </div>
//                             )}
//                         </CardContent>
//                     </Card>
//                 </TabsContent>

//                 <TabsContent value="category">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Category Information</CardTitle>
//                             <CardDescription>Details about the category for this class</CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                             {classData.category ? (
//                                 <div className="space-y-6">
//                                     <div className="flex items-start gap-3">
//                                         <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
//                                             <FolderOpen className="h-5 w-5 text-primary" />
//                                         </div>
//                                         <div>
//                                             <h3 className="font-medium text-lg">{classData.category.name}</h3>
//                                             <p className="text-muted-foreground">{classData.course?.name || "No course assigned"}</p>
//                                         </div>
//                                     </div>

//                                     <Separator />

//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                         <div>
//                                             <h4 className="text-sm font-medium mb-3">
//                                                 Students in Category ({classData.category.students?.length || 0})
//                                             </h4>
//                                             <ScrollArea className="h-60 rounded-md border p-4">
//                                                 {classData.category.students && classData.category.students.length > 0 ? (
//                                                     <div className="space-y-3">
//                                                         {classData.category.students.map((student, index) => (
//                                                             <div key={index} className="flex items-center justify-between">
//                                                                 <div className="flex items-center gap-3">
//                                                                     <Avatar className="h-8 w-8">
//                                                                         <AvatarFallback className="bg-primary/10 text-primary">
//                                                                             {getInitials(student.firstname, student.lastname)}
//                                                                         </AvatarFallback>
//                                                                     </Avatar>
//                                                                     <div>
//                                                                         <div className="font-medium">
//                                                                             {student.firstname} {student.lastname}
//                                                                         </div>
//                                                                         <div className="text-xs text-muted-foreground">{student.email}</div>
//                                                                     </div>
//                                                                 </div>
//                                                                 {classData.students.some(
//                                                                     (item) => item.student._id === student._id && item.status === "present",
//                                                                 ) ? (
//                                                                     <Badge className="bg-green-100 text-green-800 border-green-300">Present</Badge>
//                                                                 ) : classData.students.some((item) => item.student._id === student._id) ? (
//                                                                     <Badge className="bg-red-100 text-red-800 border-red-300">Absent</Badge>
//                                                                 ) : (
//                                                                     <Badge className="bg-gray-100 text-gray-800 border-gray-300">Not Enrolled</Badge>
//                                                                 )}
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 ) : (
//                                                     <div className="text-center py-4">
//                                                         <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
//                                                         <p className="text-muted-foreground">No students in this category</p>
//                                                     </div>
//                                                 )}
//                                             </ScrollArea>
//                                         </div>

//                                         <div>
//                                             <h4 className="text-sm font-medium mb-3">
//                                                 Tutors in Category ({classData.category.tutors?.length || 0})
//                                             </h4>
//                                             <ScrollArea className="h-60 rounded-md border p-4">
//                                                 {classData.category.tutors && classData.category.tutors.length > 0 ? (
//                                                     <div className="space-y-3">
//                                                         {classData.category.tutors.map((tutor, index) => (
//                                                             <div key={index} className="flex items-center justify-between">
//                                                                 <div className="flex items-center gap-3">
//                                                                     <Avatar className="h-8 w-8">
//                                                                         <AvatarFallback className="bg-primary/10 text-primary">
//                                                                             {getInitials(tutor.firstname, tutor.lastname)}
//                                                                         </AvatarFallback>
//                                                                     </Avatar>
//                                                                     <div>
//                                                                         <div className="font-medium">
//                                                                             {tutor.firstname} {tutor.lastname}
//                                                                         </div>
//                                                                         <div className="text-xs text-muted-foreground">{tutor.email}</div>
//                                                                     </div>
//                                                                 </div>
//                                                                 {classData.tutor === tutor._id ||
//                                                                     (typeof classData.tutor === "object" && classData.tutor?._id === tutor._id) ? (
//                                                                     <Badge className="bg-blue-100 text-blue-800 border-blue-300">Class Tutor</Badge>
//                                                                 ) : (
//                                                                     <Badge variant="outline">Category Tutor</Badge>
//                                                                 )}
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 ) : (
//                                                     <div className="text-center py-4">
//                                                         <User className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
//                                                         <p className="text-muted-foreground">No tutors in this category</p>
//                                                     </div>
//                                                 )}
//                                             </ScrollArea>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-8">
//                                     <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                                     <h3 className="text-lg font-medium mb-2">No Category Assigned</h3>
//                                     <p className="text-muted-foreground">This class doesn't have a category assigned to it.</p>
//                                 </div>
//                             )}
//                         </CardContent>
//                     </Card>
//                 </TabsContent>
//             </Tabs>
//         </div>
//     )
// }

// export default ClassDetails
