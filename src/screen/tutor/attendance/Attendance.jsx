"use client"

import { useState } from "react"
import { Clock, Users, CheckCircle, XCircle, Plus, Eye, RefreshCw, Copy, CheckCheck, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

export default function TutorAttendancePage() {
    const [currentDate] = useState(new Date())
    const [createAttendanceOpen, setCreateAttendanceOpen] = useState(false)
    const [selectedClass, setSelectedClass] = useState(null)
    const [attendanceDetails, setAttendanceDetails] = useState(null)
    const [copiedCode, setCopiedCode] = useState(null)

    // Mock data - replace with actual data from your API
    const upcomingClasses = [
        {
            id: "1",
            topic: "Web Development Fundamentals",
            course: "Web Development 101",
            startTime: new Date(new Date().setHours(10, 0)),
            endTime: new Date(new Date().setHours(12, 0)),
            students: 25,
            location: "Room 201, Tech Building",
            hasAttendance: false,
        },
        {
            id: "2",
            topic: "Advanced JavaScript",
            course: "Frontend Development",
            startTime: new Date(new Date().setHours(14, 0)),
            endTime: new Date(new Date().setHours(16, 0)),
            students: 18,
            location: "Room 305, Engineering Building",
            hasAttendance: true,
        },
        {
            id: "3",
            topic: "React Hooks Workshop",
            course: "React Mastery",
            startTime: new Date(new Date().setHours(16, 30)),
            endTime: new Date(new Date().setHours(18, 30)),
            students: 22,
            location: "Computer Lab 3",
            hasAttendance: false,
        },
    ]

    const activeAttendanceSessions = [
        {
            id: "1",
            classSession: {
                id: "2",
                topic: "Advanced JavaScript",
                course: "Frontend Development",
                startTime: new Date(new Date().setHours(14, 0)),
                endTime: new Date(new Date().setHours(16, 0)),
            },
            signInCode: "JS2023",
            signOutCode: "EXIT2023",
            active: true,
            signInCodeUsed: true,
            signOutCodeUsed: false,
            presentCount: 15,
            absentCount: 3,
            totalStudents: 18,
            createdAt: new Date(new Date().setHours(13, 45)),
        },
    ]

    const pastAttendanceSessions = [
        {
            id: "101",
            classSession: {
                id: "101",
                topic: "Web Development Fundamentals",
                course: "Web Development 101",
                startTime: new Date(new Date().setDate(new Date().getDate() - 1)),
                endTime: new Date(new Date().setDate(new Date().getDate() - 1)),
            },
            signInCode: "WEB1234",
            signOutCode: "EXIT1234",
            active: false,
            signInCodeUsed: true,
            signOutCodeUsed: true,
            presentCount: 22,
            absentCount: 3,
            totalStudents: 25,
            createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
        {
            id: "102",
            classSession: {
                id: "102",
                topic: "React Hooks Workshop",
                course: "React Mastery",
                startTime: new Date(new Date().setDate(new Date().getDate() - 2)),
                endTime: new Date(new Date().setDate(new Date().getDate() - 2)),
            },
            signInCode: "REACT456",
            signOutCode: "EXIT456",
            active: false,
            signInCodeUsed: true,
            signOutCodeUsed: true,
            presentCount: 20,
            absentCount: 2,
            totalStudents: 22,
            createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
        },
    ]

    const formatTime = (date) => {
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    }

    const formatDate = (date) => {
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    }

    const handleCreateAttendance = () => {
        // In a real app, you would make an API call to create the attendance session
        setCreateAttendanceOpen(false)
        // Show success message or update the UI
    }

    const handleViewAttendanceDetails = (attendanceId) => {
        // In a real app, you would fetch attendance details from the API
        const attendance =
            activeAttendanceSessions.find((a) => a.id === attendanceId) ||
            pastAttendanceSessions.find((a) => a.id === attendanceId)
        setAttendanceDetails(attendance)
    }

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 2000)
    }

    const handleGenerateNewCode = (type, attendanceId) => {
        // In a real app, you would make an API call to generate a new code
        console.log(`Generating new ${type} code for attendance ${attendanceId}`)
        // Update the UI with the new code
    }

    const handleCloseAttendance = (attendanceId) => {
        // In a real app, you would make an API call to close the attendance session
        console.log(`Closing attendance ${attendanceId}`)
        // Update the UI
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Attendance Management</h1>
                <div className="text-sm text-muted-foreground">{formatDate(currentDate)}</div>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Manage attendance for your classes</p>
                <Dialog open={createAttendanceOpen} onOpenChange={setCreateAttendanceOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Attendance
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create Attendance Session</DialogTitle>
                            <DialogDescription>
                                Create a new attendance session for a class. Students will use the generated codes to mark their
                                attendance.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="class">Select Class</Label>
                                <Select onValueChange={(value) => setSelectedClass(value)}>
                                    <SelectTrigger id="class">
                                        <SelectValue placeholder="Select a class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {upcomingClasses
                                            .filter((c) => !c.hasAttendance)
                                            .map((cls) => (
                                                <SelectItem key={cls.id} value={cls.id}>
                                                    {cls.topic} ({formatTime(cls.startTime)} - {formatTime(cls.endTime)})
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any notes about this attendance session"
                                    className="resize-none"
                                />
                            </div>

                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Important</AlertTitle>
                                <AlertDescription>
                                    Sign-in and sign-out codes will be automatically generated. You can share these codes with students
                                    during class.
                                </AlertDescription>
                            </Alert>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateAttendanceOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateAttendance} disabled={!selectedClass}>
                                Create Attendance
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active">Active Attendance</TabsTrigger>
                    <TabsTrigger value="past">Past Attendance</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-4 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Today's Classes</CardTitle>
                                <CardDescription>Classes scheduled for today</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {upcomingClasses.map((cls) => (
                                    <Card
                                        key={cls.id}
                                        className="border-l-4"
                                        style={{ borderLeftColor: cls.hasAttendance ? "#10b981" : "#94a3b8" }}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{cls.topic}</h3>
                                                    <div className="text-sm text-muted-foreground">{cls.course}</div>
                                                </div>
                                                <Badge variant={cls.hasAttendance ? "success" : "secondary"}>
                                                    {cls.hasAttendance ? "Attendance Active" : "No Attendance"}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span>
                                                        {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span>{cls.students} Students</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex justify-end">
                                                {!cls.hasAttendance ? (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedClass(cls.id)
                                                            setCreateAttendanceOpen(true)
                                                        }}
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Create Attendance
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" variant="outline" onClick={() => handleViewAttendanceDetails("1")}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Attendance
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Active Attendance Sessions</CardTitle>
                                <CardDescription>Currently active attendance sessions</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {activeAttendanceSessions.length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground">No active attendance sessions</div>
                                ) : (
                                    activeAttendanceSessions.map((session) => (
                                        <Card key={session.id} className="border-l-4 border-l-green-500">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{session.classSession.topic}</h3>
                                                        <div className="text-sm text-muted-foreground">{session.classSession.course}</div>
                                                    </div>
                                                    <Badge variant="success">Active</Badge>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 mt-4">
                                                    <div className="bg-secondary/20 p-3 rounded-md">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-sm font-medium">Sign-In Code</span>
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={() => handleCopyCode(session.signInCode)}
                                                                >
                                                                    {copiedCode === session.signInCode ? (
                                                                        <CheckCheck className="h-4 w-4 text-green-500" />
                                                                    ) : (
                                                                        <Copy className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={() => handleGenerateNewCode("signIn", session.id)}
                                                                >
                                                                    <RefreshCw className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="text-lg font-mono bg-background p-2 rounded border text-center">
                                                            {session.signInCode}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1 text-center">
                                                            {session.signInCodeUsed ? "Code has been used" : "Code not used yet"}
                                                        </div>
                                                    </div>

                                                    <div className="bg-secondary/20 p-3 rounded-md">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-sm font-medium">Sign-Out Code</span>
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={() => handleCopyCode(session.signOutCode)}
                                                                >
                                                                    {copiedCode === session.signOutCode ? (
                                                                        <CheckCheck className="h-4 w-4 text-green-500" />
                                                                    ) : (
                                                                        <Copy className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={() => handleGenerateNewCode("signOut", session.id)}
                                                                >
                                                                    <RefreshCw className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="text-lg font-mono bg-background p-2 rounded border text-center">
                                                            {session.signOutCode}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1 text-center">
                                                            {session.signOutCodeUsed ? "Code has been used" : "Code not used yet"}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-sm font-medium">Attendance Progress</span>
                                                        <span className="text-sm font-medium">
                                                            {session.presentCount}/{session.totalStudents} Present
                                                        </span>
                                                    </div>
                                                    <Progress value={(session.presentCount / session.totalStudents) * 100} className="h-2" />
                                                </div>

                                                <div className="mt-4 flex justify-between">
                                                    <Button size="sm" variant="outline" onClick={() => handleViewAttendanceDetails(session.id)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleCloseAttendance(session.id)}>
                                                        Close Attendance
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="past" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Past Attendance Records</CardTitle>
                            <CardDescription>History of attendance sessions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Attendance</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pastAttendanceSessions.map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell>{formatDate(session.classSession.startTime)}</TableCell>
                                            <TableCell className="font-medium">{session.classSession.topic}</TableCell>
                                            <TableCell>{session.classSession.course}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span>
                                                        {session.presentCount}/{session.totalStudents}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({Math.round((session.presentCount / session.totalStudents) * 100)}%)
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">Completed</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" onClick={() => handleViewAttendanceDetails(session.id)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {attendanceDetails && (
                <Dialog open={!!attendanceDetails} onOpenChange={() => setAttendanceDetails(null)}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Attendance Details</DialogTitle>
                            <DialogDescription>
                                {attendanceDetails.classSession.topic} - {formatDate(attendanceDetails.classSession.startTime)}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-secondary/20 p-3 rounded-md">
                                    <div className="text-sm font-medium mb-1">Sign-In Code</div>
                                    <div className="text-lg font-mono bg-background p-2 rounded border text-center">
                                        {attendanceDetails.signInCode}
                                    </div>
                                </div>
                                <div className="bg-secondary/20 p-3 rounded-md">
                                    <div className="text-sm font-medium mb-1">Sign-Out Code</div>
                                    <div className="text-lg font-mono bg-background p-2 rounded border text-center">
                                        {attendanceDetails.signOutCode}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-secondary/10 p-4 rounded-md">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium">Attendance Summary</h3>
                                    <Badge variant={attendanceDetails.active ? "success" : "outline"}>
                                        {attendanceDetails.active ? "Active" : "Completed"}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{attendanceDetails.presentCount}</div>
                                        <div className="text-sm text-muted-foreground">Present</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">{attendanceDetails.absentCount}</div>
                                        <div className="text-sm text-muted-foreground">Absent</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{attendanceDetails.totalStudents}</div>
                                        <div className="text-sm text-muted-foreground">Total</div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">Attendance Rate</span>
                                        <span className="text-sm font-medium">
                                            {Math.round((attendanceDetails.presentCount / attendanceDetails.totalStudents) * 100)}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={(attendanceDetails.presentCount / attendanceDetails.totalStudents) * 100}
                                        className="h-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">Student Attendance</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Sign In</TableHead>
                                            <TableHead>Sign Out</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* Mock student data - replace with actual data */}
                                        <TableRow>
                                            <TableCell className="font-medium">John Doe</TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                                    <span className="text-xs text-muted-foreground">14:05</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                                    <span className="text-xs text-muted-foreground">15:55</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    Present
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Jane Smith</TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                                    <span className="text-xs text-muted-foreground">14:02</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                    Partial
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Mike Johnson</TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                    Absent
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        <DialogFooter>
                            {attendanceDetails.active && (
                                <Button variant="destructive" onClick={() => handleCloseAttendance(attendanceDetails.id)}>
                                    Close Attendance
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => setAttendanceDetails(null)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

