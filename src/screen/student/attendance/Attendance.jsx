import React, { useState, useEffect } from "react"
import { Calendar, Check, ChevronLeft, ChevronRight, Clock, MapPin, User, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { fetchStudentClass, fetchPastAttendance, signInAttendance, signOutAttendance } from "../../../api/auth"; // Adjust path as needed
import { sendToast } from "../../../components/utilis"

const AttendancePage = () => {
    const [currentDate] = useState(new Date())
    const [attendanceCode, setAttendanceCode] = useState("")
    const [signOutCode, setSignOutCode] = useState("")
    const [codeSubmitted, setCodeSubmitted] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // State for API data
    const [classes, setClasses] = useState([])
    const [attendanceHistory, setAttendanceHistory] = useState([])
    const [attendanceStats, setAttendanceStats] = useState({
        present: 0,
        absent: 0,
        late: 0,
        totalClasses: 0,
        percentage: 0
    })

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Fetch classes and attendance history
                const [classesResponse, historyResponse] = await Promise.all([
                    fetchStudentClass(),
                    fetchPastAttendance()
                ])

                if (classesResponse?.data.success && historyResponse?.data.success) {
                    setClasses(processClassesData(classesResponse?.data?.data))
                    setAttendanceHistory(historyResponse?.data?.history)

                    // Calculate attendance stats
                    const summary = historyResponse?.data?.summary
                    const totalClasses = summary.present + summary.late + summary.absent
                    const percentage = totalClasses > 0
                        ? Math.round((summary.present + summary.late) / totalClasses * 100)
                        : 0

                    setAttendanceStats({
                        present: summary.present,
                        absent: summary.absent,
                        late: summary.late,
                        totalClasses,
                        percentage
                    })
                } else {
                    setError("Failed to fetch data")
                }
            } catch (err) {
                setError("An error occurred while fetching data")
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    // Process classes data to determine today's classes and upcoming classes
    const processClassesData = (classesData) => {
        const today = new Date()

        return classesData.map(cls => {
            const startTime = new Date(cls.startTime)
            const endTime = new Date(cls.endTime)
            const isToday = isSameDay(startTime, today)

            const formattedStartTime = formatTime(startTime)
            const formattedEndTime = formatTime(endTime)
            const timeRange = `${formattedStartTime} - ${formattedEndTime}`

            // Check if class is active (started but not ended)
            const isActive = startTime <= today && endTime >= today

            // Format the date display
            let dateDisplay
            if (isToday) {
                dateDisplay = "Today"
            } else if (isTomorrow(startTime)) {
                dateDisplay = "Tomorrow"
            } else {
                dateDisplay = formatDateShort(startTime)
            }

            return {
                id: cls._id,
                title: cls.topic,
                courseName: cls.courseName,
                date: dateDisplay,
                time: timeRange,
                tutor: cls.tutorName,
                location: "Campus", // This isn't in your API response, you might want to add it
                attendanceOpen: isActive,
                startTime,
                endTime,
                status: cls.status
            }
        })
    }

    // Check if two dates are the same day
    const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
    }

    // Check if date is tomorrow
    const isTomorrow = (date) => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return isSameDay(date, tomorrow)
    }

    // Format time to 12-hour format
    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    // Format date to short format (e.g., "Wed, Apr 10")
    const formatDateShort = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        })
    }

    const handleSubmitAttendanceCode = async (e, classId) => {
        e.preventDefault()

        if (attendanceCode.trim().length === 0) return

        setIsLoading(true)
        try {
            console.log('ssssssssssssssssssssssss', attendanceCode)
            const response = await signInAttendance({
                signInCode: attendanceCode,
                classId: classId
            })

            if (response?.data?.success) {
                setCodeSubmitted(true)
                sendToast("success", "Successfully signed in to class!")

                // Refresh class data
                const classesResponse = await fetchStudentClass()
                if (classesResponse?.data?.success) {
                    setClasses(processClassesData(classesResponse?.data?.data))
                }

                // Reset after showing success message
                setTimeout(() => {
                    // setShowSuccess(false)
                }, 3000)
            } else {
                sendToast("error", response?.data.message || "Failed to sign in")
            }
        } catch (err) {
            setError("An error occurred while signing in")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmitSignOutCode = async (e, classId) => {
        e.preventDefault()

        if (signOutCode.trim().length === 0) return

        setIsLoading(true)
        try {
            const response = await signOutAttendance({
                signOutCode: signOutCode,
                classId: classId
            })

            if (response?.data?.success) {
                sendToast("success", "Successfully signed out of class!")

                // Refresh class data
                const classesResponse = await fetchStudentClass()
                if (classesResponse.success) {
                    setClasses(processClassesData(classesResponse?.data.data))
                }

                // Refresh attendance history
                const historyResponse = await fetchPastAttendance()
                if (historyResponse?.data?.success) {
                    setAttendanceHistory(historyResponse?.data?.history)
                }

                // Reset after showing success message
                setTimeout(() => {
                    setShowSuccess(false)
                }, 3000)
            } else {
                sendToast("error", response?.data?.message || "Failed to sign out")
            }
        } catch (err) {
            setError("An error occurred while signing out")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (date) => {
        const options = { weekday: 'long', month: 'long', day: 'numeric' }
        return date.toLocaleDateString('en-US', options)
    }

    // Get today's classes
    const todayClasses = classes.filter(cls => cls.date === "Today")

    // Get upcoming classes
    const upcomingClasses = classes.filter(cls => cls.date !== "Today")

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Attendance</h1>
                <div className="text-sm text-muted-foreground">
                    {formatDate(currentDate)}
                </div>
            </div>

            <Tabs defaultValue="mark-attendance" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="mark-attendance">Mark Attendance</TabsTrigger>
                    <TabsTrigger value="history">Attendance History</TabsTrigger>
                </TabsList>

                <TabsContent value="mark-attendance" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Classes</CardTitle>
                            <CardDescription>Mark your attendance for today's classes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center py-6">
                                    <div className="w-8 h-8 rounded-full border-4 border-t-blue-500 border-b-blue-700 border-l-blue-600 border-r-blue-600 animate-spin"></div>
                                </div>
                            ) : todayClasses.length > 0 ? (
                                todayClasses.map((cls) => (
                                    <Card key={cls.id} className="border-l-4" style={{ borderLeftColor: cls.attendanceOpen ? '#10b981' : '#94a3b8' }}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{cls.title}</h3>
                                                    <div className="text-sm text-muted-foreground">
                                                        {cls.courseName}
                                                    </div>
                                                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                        <Clock className="mr-1 h-4 w-4" />
                                                        <span>{cls.time}</span>
                                                    </div>
                                                </div>
                                                <Badge variant={codeSubmitted ? "outline" : cls.attendanceOpen ? "default" : "secondary"}>
                                                    {codeSubmitted ? "Signed In" : cls.attendanceOpen ? "Open for Attendance" : "Not Started"}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span>{cls.tutor}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <span>{cls.location || "Campus"}</span>
                                                </div>
                                            </div>

                                            {cls.attendanceOpen && (
                                                <div className="mt-4 grid grid-cols-1 gap-4">
                                                    <div className="p-3 bg-secondary/20 rounded-md">
                                                        <form onSubmit={(e) => handleSubmitAttendanceCode(e, cls.id)} className="space-y-2">
                                                            <label className="text-sm font-medium">Sign In:</label>
                                                            <div className="flex space-x-2">
                                                                <Input
                                                                    value={attendanceCode}
                                                                    onChange={(e) => setAttendanceCode(e.target.value)}
                                                                    placeholder="Enter sign-in code"
                                                                    className="flex-1"
                                                                    disabled={isLoading}
                                                                />
                                                                <Button type="submit" disabled={isLoading}>
                                                                    {isLoading ? "Signing In..." : "Sign In"}
                                                                </Button>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Sign-in code will be provided by your tutor during class
                                                            </p>
                                                        </form>
                                                    </div>

                                                    <div className="p-3 bg-secondary/20 rounded-md">
                                                        <form onSubmit={(e) => handleSubmitSignOutCode(e, cls.id)} className="space-y-2">
                                                            <label className="text-sm font-medium">Sign Out:</label>
                                                            <div className="flex space-x-2">
                                                                <Input
                                                                    value={signOutCode}
                                                                    onChange={(e) => setSignOutCode(e.target.value)}
                                                                    placeholder="Enter sign-out code"
                                                                    className="flex-1"
                                                                    disabled={isLoading}
                                                                />
                                                                <Button type="submit" disabled={isLoading}>
                                                                    {isLoading ? "Signing Out..." : "Sign Out"}
                                                                </Button>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Sign-out code will be provided at the end of class
                                                            </p>
                                                        </form>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    No classes scheduled for today.
                                </div>
                            )}

                            {upcomingClasses.length > 0 && (
                                <>
                                    <Separator />
                                    <h3 className="font-medium">Upcoming Classes</h3>

                                    <div className="space-y-3">
                                        {upcomingClasses.map((cls) => (
                                            <Card key={cls.id} className="border-l-4 border-l-gray-300">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-semibold">{cls.title}</h3>
                                                            <div className="text-sm text-muted-foreground">
                                                                {cls.courseName}
                                                            </div>
                                                            <div className="flex items-center text-sm text-muted-foreground">
                                                                <Clock className="mr-1 h-4 w-4" />
                                                                <span>{cls.date}, {cls.time}</span>
                                                            </div>
                                                        </div>
                                                        <Badge variant="secondary">Upcoming</Badge>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-2">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            <span>{cls.tutor}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                                            <span>{cls.location || "Campus"}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Attendance History</CardTitle>
                                <CardDescription>Your past attendance records</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center py-6">
                                        <div className="w-8 h-8 rounded-full border-4 border-t-blue-500 border-b-blue-700 border-l-blue-600 border-r-blue-600 animate-spin"></div>
                                    </div>
                                ) : attendanceHistory.length > 0 ? (
                                    <div className="space-y-4">
                                        {attendanceHistory.map((record, index) => {
                                            const recordDate = new Date(record.startTime);
                                            const formattedDate = recordDate.toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: '2-digit'
                                            });

                                            return (
                                                <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                                    <div>
                                                        <div className="font-medium">{record.topic}</div>
                                                        <div className="text-sm text-muted-foreground">{record.courseName}</div>
                                                        <div className="text-sm text-muted-foreground">{formattedDate}</div>
                                                    </div>
                                                    <Badge variant={
                                                        record.status === "present" ? "outline" :
                                                            record.status === "late" ? "secondary" : "destructive"
                                                    }>
                                                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                    </Badge>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        No attendance records found.
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-center">
                                <Button variant="outline" size="sm">
                                    View All Records
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Attendance Summary</CardTitle>
                                <CardDescription>Your overall attendance statistics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">Attendance Rate</span>
                                        <span className="text-sm font-medium">{attendanceStats.percentage}%</span>
                                    </div>
                                    <Progress value={attendanceStats.percentage} className="h-2" />
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-secondary/20 p-2 rounded-md">
                                        <div className="text-lg font-bold text-green-600">{attendanceStats.present}</div>
                                        <div className="text-xs text-muted-foreground">Present</div>
                                    </div>
                                    <div className="bg-secondary/20 p-2 rounded-md">
                                        <div className="text-lg font-bold text-yellow-600">{attendanceStats.late}</div>
                                        <div className="text-xs text-muted-foreground">Late</div>
                                    </div>
                                    <div className="bg-secondary/20 p-2 rounded-md">
                                        <div className="text-lg font-bold text-red-600">{attendanceStats.absent}</div>
                                        <div className="text-xs text-muted-foreground">Absent</div>
                                    </div>
                                </div>

                                <div className="bg-secondary/10 p-3 rounded-md">
                                    <div className="flex items-start">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Attendance Policy</p>
                                            <p className="text-xs text-muted-foreground">
                                                Minimum 80% attendance required to qualify for certification.
                                                Current status: <span className={`font-medium ${attendanceStats.percentage >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {attendanceStats.percentage >= 80 ? 'Good Standing' : 'Warning'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default AttendancePage;



// import React, { useState } from "react"
// import { Calendar, Check, ChevronLeft, ChevronRight, Clock, MapPin, User, AlertTriangle } from "lucide-react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Progress } from "@/components/ui/progress"
// import { Separator } from "@/components/ui/separator"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { Input } from "@/components/ui/input"

// const AttendancePage = () => {
//     const [currentDate] = useState(new Date())
//     const [attendanceCode, setAttendanceCode] = useState("")
//     const [codeSubmitted, setCodeSubmitted] = useState(false)
//     const [showSuccess, setShowSuccess] = useState(false)

//     // Mock data - replace with actual data from your store
//     const upcomingClasses = [
//         {
//             id: 1,
//             title: "Web Development Fundamentals",
//             date: "Today",
//             time: "10:00 AM - 12:00 PM",
//             tutor: "Dr. Sarah Miller",
//             location: "Room 201, Tech Building",
//             attendanceOpen: true,
//             attendanceMarked: false
//         },
//         {
//             id: 2,
//             title: "Advanced JavaScript",
//             date: "Tomorrow",
//             time: "2:00 PM - 4:00 PM",
//             tutor: "Prof. David Kim",
//             location: "Room 305, Engineering Building",
//             attendanceOpen: false,
//             attendanceMarked: false
//         },
//         {
//             id: 3,
//             title: "React Hooks Workshop",
//             date: "Wed, Apr 10",
//             time: "11:00 AM - 1:00 PM",
//             tutor: "Dr. Lisa Wang",
//             location: "Computer Lab 3",
//             attendanceOpen: false,
//             attendanceMarked: false
//         }
//     ]

//     const attendanceHistory = [
//         { date: "Apr 01, 2025", class: "Web Development Fundamentals", status: "present" },
//         { date: "Apr 01, 2025", class: "Advanced JavaScript", status: "present" },
//         { date: "Mar 31, 2025", class: "React Hooks Workshop", status: "present" },
//         { date: "Mar 31, 2025", class: "Web Development Fundamentals", status: "present" },
//         { date: "Mar 28, 2025", class: "Advanced JavaScript", status: "absent" },
//         { date: "Mar 28, 2025", class: "Web Development Fundamentals", status: "present" },
//         { date: "Mar 27, 2025", class: "React Hooks Workshop", status: "late" }
//     ]

//     const attendanceStats = {
//         present: 23,
//         absent: 2,
//         late: 3,
//         totalClasses: 28,
//         percentage: 82
//     }

//     const handleSubmitAttendanceCode = (e) => {
//         e.preventDefault()
//         // In a real app, you would validate the code with an API call
//         if (attendanceCode.trim().length > 0) {
//             setCodeSubmitted(true)
//             setShowSuccess(true)
//             // Reset after showing success message
//             setTimeout(() => {
//                 setShowSuccess(false)
//             }, 3000)
//         }
//     }

//     const formatDate = (date) => {
//         const options = { weekday: 'long', month: 'long', day: 'numeric' }
//         return date.toLocaleDateString('en-US', options)
//     }

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <h1 className="text-3xl font-bold">Attendance</h1>
//                 <div className="text-sm text-muted-foreground">
//                     {formatDate(currentDate)}
//                 </div>
//             </div>

//             <Tabs defaultValue="mark-attendance" className="w-full">
//                 <TabsList className="grid w-full grid-cols-2">
//                     <TabsTrigger value="mark-attendance">Mark Attendance</TabsTrigger>
//                     <TabsTrigger value="history">Attendance History</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="mark-attendance" className="mt-4 space-y-4">
//                     {showSuccess && (
//                         <Alert className="bg-green-50 border-green-200">
//                             <Check className="h-4 w-4 text-green-600" />
//                             <AlertTitle className="text-green-800">Attendance Confirmed!</AlertTitle>
//                             <AlertDescription className="text-green-700">
//                                 Your attendance has been marked successfully for Web Development Fundamentals.
//                             </AlertDescription>
//                         </Alert>
//                     )}

//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Today's Classes</CardTitle>
//                             <CardDescription>Mark your attendance for today's classes</CardDescription>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             {upcomingClasses.filter(c => c.date === "Today").map((cls) => (
//                                 <Card key={cls.id} className="border-l-4" style={{ borderLeftColor: cls.attendanceOpen ? '#10b981' : '#94a3b8' }}>
//                                     <CardContent className="p-4">
//                                         <div className="flex justify-between items-start mb-2">
//                                             <div>
//                                                 <h3 className="font-semibold text-lg">{cls.title}</h3>
//                                                 <div className="flex items-center text-sm text-muted-foreground mt-1">
//                                                     <Clock className="mr-1 h-4 w-4" />
//                                                     <span>{cls.time}</span>
//                                                 </div>
//                                             </div>
//                                             <Badge variant={codeSubmitted ? "outline" : cls.attendanceOpen ? "default" : "secondary"}>
//                                                 {codeSubmitted ? "Marked Present" : cls.attendanceOpen ? "Open for Attendance" : "Not Started"}
//                                             </Badge>
//                                         </div>

//                                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-4">
//                                             <div className="flex items-center gap-2 text-sm">
//                                                 <User className="h-4 w-4 text-muted-foreground" />
//                                                 <span>{cls.tutor}</span>
//                                             </div>
//                                             <div className="flex items-center gap-2 text-sm">
//                                                 <MapPin className="h-4 w-4 text-muted-foreground" />
//                                                 <span>{cls.location}</span>
//                                             </div>
//                                         </div>

//                                         {cls.attendanceOpen && !codeSubmitted && (
//                                             <div className="mt-4 p-3 bg-secondary/20 rounded-md">
//                                                 <form onSubmit={handleSubmitAttendanceCode} className="space-y-2">
//                                                     <label className="text-sm font-medium">Enter Attendance Code:</label>
//                                                     <div className="flex space-x-2">
//                                                         <Input
//                                                             value={attendanceCode}
//                                                             onChange={(e) => setAttendanceCode(e.target.value)}
//                                                             placeholder="Enter the code provided by your tutor"
//                                                             className="flex-1"
//                                                         />
//                                                         <Button type="submit">Mark Present</Button>
//                                                     </div>
//                                                     <p className="text-xs text-muted-foreground">
//                                                         Code will be provided by your tutor during class
//                                                     </p>
//                                                 </form>
//                                             </div>
//                                         )}

//                                         {cls.attendanceOpen && codeSubmitted && (
//                                             <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
//                                                 <div className="flex items-center">
//                                                     <Check className="h-5 w-5 text-green-600 mr-2" />
//                                                     <p className="text-sm text-green-800 font-medium">
//                                                         Attendance marked at {new Date().toLocaleTimeString()}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </CardContent>
//                                 </Card>
//                             ))}

//                             {upcomingClasses.filter(c => c.date !== "Today").length > 0 && (
//                                 <>
//                                     <Separator />
//                                     <h3 className="font-medium">Upcoming Classes</h3>

//                                     <div className="space-y-3">
//                                         {upcomingClasses.filter(c => c.date !== "Today").map((cls) => (
//                                             <Card key={cls.id} className="border-l-4 border-l-gray-300">
//                                                 <CardContent className="p-4">
//                                                     <div className="flex justify-between items-start">
//                                                         <div>
//                                                             <h3 className="font-semibold">{cls.title}</h3>
//                                                             <div className="flex items-center text-sm text-muted-foreground">
//                                                                 <Clock className="mr-1 h-4 w-4" />
//                                                                 <span>{cls.date}, {cls.time}</span>
//                                                             </div>
//                                                         </div>
//                                                         <Badge variant="secondary">Upcoming</Badge>
//                                                     </div>

//                                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-2">
//                                                         <div className="flex items-center gap-2 text-sm">
//                                                             <User className="h-4 w-4 text-muted-foreground" />
//                                                             <span>{cls.tutor}</span>
//                                                         </div>
//                                                         <div className="flex items-center gap-2 text-sm">
//                                                             <MapPin className="h-4 w-4 text-muted-foreground" />
//                                                             <span>{cls.location}</span>
//                                                         </div>
//                                                     </div>
//                                                 </CardContent>
//                                             </Card>
//                                         ))}
//                                     </div>
//                                 </>
//                             )}
//                         </CardContent>
//                     </Card>
//                 </TabsContent>

//                 <TabsContent value="history" className="mt-4">
//                     <div className="grid gap-4 md:grid-cols-3">
//                         <Card className="md:col-span-2">
//                             <CardHeader>
//                                 <CardTitle>Attendance History</CardTitle>
//                                 <CardDescription>Your past attendance records</CardDescription>
//                             </CardHeader>
//                             <CardContent>
//                                 <div className="space-y-4">
//                                     {attendanceHistory.map((record, index) => (
//                                         <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
//                                             <div>
//                                                 <div className="font-medium">{record.class}</div>
//                                                 <div className="text-sm text-muted-foreground">{record.date}</div>
//                                             </div>
//                                             <Badge variant={
//                                                 record.status === "present" ? "outline" :
//                                                     record.status === "late" ? "secondary" : "destructive"
//                                             }>
//                                                 {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
//                                             </Badge>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </CardContent>
//                             <CardFooter className="flex justify-center">
//                                 <Button variant="outline" size="sm">
//                                     View All Records
//                                 </Button>
//                             </CardFooter>
//                         </Card>

//                         <Card>
//                             <CardHeader>
//                                 <CardTitle>Attendance Summary</CardTitle>
//                                 <CardDescription>Your overall attendance statistics</CardDescription>
//                             </CardHeader>
//                             <CardContent className="space-y-6">
//                                 <div>
//                                     <div className="flex justify-between items-center mb-1">
//                                         <span className="text-sm font-medium">Attendance Rate</span>
//                                         <span className="text-sm font-medium">{attendanceStats.percentage}%</span>
//                                     </div>
//                                     <Progress value={attendanceStats.percentage} className="h-2" />
//                                 </div>

//                                 <div className="grid grid-cols-3 gap-2 text-center">
//                                     <div className="bg-secondary/20 p-2 rounded-md">
//                                         <div className="text-lg font-bold text-green-600">{attendanceStats.present}</div>
//                                         <div className="text-xs text-muted-foreground">Present</div>
//                                     </div>
//                                     <div className="bg-secondary/20 p-2 rounded-md">
//                                         <div className="text-lg font-bold text-yellow-600">{attendanceStats.late}</div>
//                                         <div className="text-xs text-muted-foreground">Late</div>
//                                     </div>
//                                     <div className="bg-secondary/20 p-2 rounded-md">
//                                         <div className="text-lg font-bold text-red-600">{attendanceStats.absent}</div>
//                                         <div className="text-xs text-muted-foreground">Absent</div>
//                                     </div>
//                                 </div>

//                                 <div className="bg-secondary/10 p-3 rounded-md">
//                                     <div className="flex items-start">
//                                         <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
//                                         <div>
//                                             <p className="text-sm font-medium">Attendance Policy</p>
//                                             <p className="text-xs text-muted-foreground">
//                                                 Minimum 80% attendance required to qualify for certification.
//                                                 Current status: <span className="font-medium text-green-600">Good Standing</span>
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </div>
//                 </TabsContent>
//             </Tabs>
//         </div>
//     )
// }

// export default AttendancePage;

