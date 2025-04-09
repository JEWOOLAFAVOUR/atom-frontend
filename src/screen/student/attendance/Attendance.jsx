import React, { useState } from "react"
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

const AttendancePage = () => {
    const [currentDate] = useState(new Date())
    const [attendanceCode, setAttendanceCode] = useState("")
    const [codeSubmitted, setCodeSubmitted] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    // Mock data - replace with actual data from your store
    const upcomingClasses = [
        {
            id: 1,
            title: "Web Development Fundamentals",
            date: "Today",
            time: "10:00 AM - 12:00 PM",
            tutor: "Dr. Sarah Miller",
            location: "Room 201, Tech Building",
            attendanceOpen: true,
            attendanceMarked: false
        },
        {
            id: 2,
            title: "Advanced JavaScript",
            date: "Tomorrow",
            time: "2:00 PM - 4:00 PM",
            tutor: "Prof. David Kim",
            location: "Room 305, Engineering Building",
            attendanceOpen: false,
            attendanceMarked: false
        },
        {
            id: 3,
            title: "React Hooks Workshop",
            date: "Wed, Apr 10",
            time: "11:00 AM - 1:00 PM",
            tutor: "Dr. Lisa Wang",
            location: "Computer Lab 3",
            attendanceOpen: false,
            attendanceMarked: false
        }
    ]

    const attendanceHistory = [
        { date: "Apr 01, 2025", class: "Web Development Fundamentals", status: "present" },
        { date: "Apr 01, 2025", class: "Advanced JavaScript", status: "present" },
        { date: "Mar 31, 2025", class: "React Hooks Workshop", status: "present" },
        { date: "Mar 31, 2025", class: "Web Development Fundamentals", status: "present" },
        { date: "Mar 28, 2025", class: "Advanced JavaScript", status: "absent" },
        { date: "Mar 28, 2025", class: "Web Development Fundamentals", status: "present" },
        { date: "Mar 27, 2025", class: "React Hooks Workshop", status: "late" }
    ]

    const attendanceStats = {
        present: 23,
        absent: 2,
        late: 3,
        totalClasses: 28,
        percentage: 82
    }

    const handleSubmitAttendanceCode = (e) => {
        e.preventDefault()
        // In a real app, you would validate the code with an API call
        if (attendanceCode.trim().length > 0) {
            setCodeSubmitted(true)
            setShowSuccess(true)
            // Reset after showing success message
            setTimeout(() => {
                setShowSuccess(false)
            }, 3000)
        }
    }

    const formatDate = (date) => {
        const options = { weekday: 'long', month: 'long', day: 'numeric' }
        return date.toLocaleDateString('en-US', options)
    }

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
                    {showSuccess && (
                        <Alert className="bg-green-50 border-green-200">
                            <Check className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Attendance Confirmed!</AlertTitle>
                            <AlertDescription className="text-green-700">
                                Your attendance has been marked successfully for Web Development Fundamentals.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Classes</CardTitle>
                            <CardDescription>Mark your attendance for today's classes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {upcomingClasses.filter(c => c.date === "Today").map((cls) => (
                                <Card key={cls.id} className="border-l-4" style={{ borderLeftColor: cls.attendanceOpen ? '#10b981' : '#94a3b8' }}>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-lg">{cls.title}</h3>
                                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                    <Clock className="mr-1 h-4 w-4" />
                                                    <span>{cls.time}</span>
                                                </div>
                                            </div>
                                            <Badge variant={codeSubmitted ? "outline" : cls.attendanceOpen ? "default" : "secondary"}>
                                                {codeSubmitted ? "Marked Present" : cls.attendanceOpen ? "Open for Attendance" : "Not Started"}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span>{cls.tutor}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span>{cls.location}</span>
                                            </div>
                                        </div>

                                        {cls.attendanceOpen && !codeSubmitted && (
                                            <div className="mt-4 p-3 bg-secondary/20 rounded-md">
                                                <form onSubmit={handleSubmitAttendanceCode} className="space-y-2">
                                                    <label className="text-sm font-medium">Enter Attendance Code:</label>
                                                    <div className="flex space-x-2">
                                                        <Input
                                                            value={attendanceCode}
                                                            onChange={(e) => setAttendanceCode(e.target.value)}
                                                            placeholder="Enter the code provided by your tutor"
                                                            className="flex-1"
                                                        />
                                                        <Button type="submit">Mark Present</Button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Code will be provided by your tutor during class
                                                    </p>
                                                </form>
                                            </div>
                                        )}

                                        {cls.attendanceOpen && codeSubmitted && (
                                            <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
                                                <div className="flex items-center">
                                                    <Check className="h-5 w-5 text-green-600 mr-2" />
                                                    <p className="text-sm text-green-800 font-medium">
                                                        Attendance marked at {new Date().toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}

                            {upcomingClasses.filter(c => c.date !== "Today").length > 0 && (
                                <>
                                    <Separator />
                                    <h3 className="font-medium">Upcoming Classes</h3>

                                    <div className="space-y-3">
                                        {upcomingClasses.filter(c => c.date !== "Today").map((cls) => (
                                            <Card key={cls.id} className="border-l-4 border-l-gray-300">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-semibold">{cls.title}</h3>
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
                                                            <span>{cls.location}</span>
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
                                <div className="space-y-4">
                                    {attendanceHistory.map((record, index) => (
                                        <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <div className="font-medium">{record.class}</div>
                                                <div className="text-sm text-muted-foreground">{record.date}</div>
                                            </div>
                                            <Badge variant={
                                                record.status === "present" ? "outline" :
                                                    record.status === "late" ? "secondary" : "destructive"
                                            }>
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
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
                                                Current status: <span className="font-medium text-green-600">Good Standing</span>
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

