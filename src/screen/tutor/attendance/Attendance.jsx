import { DialogFooter } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { Clock, Users, CheckCircle, XCircle, Plus, Eye, Copy, CheckCheck, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { useToast } from "@/hooks/use-toast"
import { createAttendance, getAttendanceDetails, getClass, closeAttendance } from "../../../api/auth"

export default function TutorAttendancePage() {
    const { toast } = useToast()
    const [currentDate] = useState(new Date())
    const [createAttendanceOpen, setCreateAttendanceOpen] = useState(false)
    const [selectedClass, setSelectedClass] = useState(null)
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [notes, setNotes] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [classes, setClasses] = useState([])
    const [activeAttendanceSessions, setActiveAttendanceSessions] = useState([])
    const [pastAttendanceSessions, setPastAttendanceSessions] = useState([])
    const [attendanceDetails, setAttendanceDetails] = useState(null)
    const [copiedCode, setCopiedCode] = useState(null)
    const [classesWithAttendance, setClassesWithAttendance] = useState([])

    // Fetch classes on component mount
    useEffect(() => {
        fetchClasses()
        fetchPastAttendanceSessions()
    }, [])

    const fetchClasses = async () => {
        setIsLoading(true)
        try {
            // Filter for today's classes or upcoming classes
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const params = {
                startTime: today.toISOString(),
                limit: 10,
            }

            const response = await getClass(params)
            const fetchedClasses = response.data?.data || []
            setClasses(fetchedClasses)

            // Check which classes have active attendance sessions
            const classesWithAttendancePromises = fetchedClasses.map(async (cls) => {
                try {
                    const attendanceResponse = await getAttendanceDetails(cls._id)
                    return {
                        classId: cls._id,
                        hasAttendance: attendanceResponse.data && attendanceResponse.data.sessionId,
                        sessionId: attendanceResponse.data?.sessionId,
                    }
                } catch (error) {
                    return { classId: cls._id, hasAttendance: false }
                }
            })

            const attendanceResults = await Promise.all(classesWithAttendancePromises)
            setClassesWithAttendance(attendanceResults)

            // Collect active attendance sessions
            const activeSessions = []
            for (const result of attendanceResults) {
                if (result.hasAttendance && result.sessionId) {
                    try {
                        const sessionDetails = await getAttendanceDetails(result.classId)
                        if (sessionDetails.data) {
                            const classInfo = fetchedClasses.find((c) => c._id === result.classId)
                            activeSessions.push({
                                _id: sessionDetails.data.sessionId,
                                signInCode: sessionDetails.data.signInCode,
                                signOutCode: sessionDetails.data.signOutCode,
                                signInCodeUsed: sessionDetails.data.signInCodeUsed,
                                signOutCodeUsed: sessionDetails.data.signOutCodeUsed,
                                totalStudentsInClass: sessionDetails.data.totalStudentsInClass,
                                signedStudentsCount: sessionDetails.data.signedStudentsCount,
                                topic: sessionDetails.data.topic,
                                active: true,
                                createdAt: new Date().toISOString(),
                                classSession: classInfo,
                            })
                        }
                    } catch (error) {
                        console.error("Error fetching session details:", error)
                    }
                }
            }

            setActiveAttendanceSessions(activeSessions)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch classes",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const fetchPastAttendanceSessions = async () => {
        setIsLoading(true)
        try {
            // This is a placeholder - implement the actual API call when available
            // For now, we'll just set an empty array
            setPastAttendanceSessions([])
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch past attendance sessions",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateAttendance = async () => {
        if (!selectedClass || !selectedCourse) {
            toast({
                title: "Error",
                description: "Please select a class and course",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        try {
            const body = {
                classSessionId: selectedClass,
                courseId: selectedCourse,
                notes: notes.trim() || undefined,
            }
            const response = await createAttendance(body)

            toast({
                title: "Success",
                description: "Attendance session created successfully",
            })

            // Refresh the active attendance sessions and classes
            fetchClasses()

            // Close the modal
            setCreateAttendanceOpen(false)
            setSelectedClass(null)
            setSelectedCourse(null)
            setNotes("")
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create attendance session",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleViewAttendanceDetails = async (classId) => {
        setIsLoading(true)
        try {
            const response = await getAttendanceDetails(classId)

            if (response.data) {
                // Find the class from our classes list
                const classInfo = classes.find((c) => c._id === classId)

                // Create a session object using the API response data
                const session = {
                    _id: response.data.sessionId,
                    signInCode: response.data.signInCode,
                    signOutCode: response.data.signOutCode,
                    signInCodeUsed: response.data.signInCodeUsed,
                    signOutCodeUsed: response.data.signOutCodeUsed,
                    topic: response.data.topic,
                    totalStudentsInClass: response.data.totalStudentsInClass,
                    signedStudentsCount: response.data.signedStudentsCount,
                    active: true,
                    createdAt: new Date().toISOString(),
                    classSession: classInfo,
                }

                // Format attendance records
                const formattedRecords = response.data.attendanceRecords || []

                setAttendanceDetails({
                    session: session,
                    records: formattedRecords,
                    sessionDetails: response.data,
                })
            } else {
                toast({
                    title: "Error",
                    description: "No attendance data found for this class",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch attendance details",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const getAttendanceStats = (records) => {
        const presentCount = records.filter((r) => r.status === "present").length
        const partialCount = records.filter((r) => r.status === "partial").length
        const absentCount = records.filter((r) => r.status === "absent").length
        const totalStudents = records.length

        return {
            presentCount,
            partialCount,
            absentCount,
            totalStudents,
            attendanceRate: totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0,
        }
    }

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 2000)

        toast({
            title: "Copied",
            description: "Code copied to clipboard",
        })
    }

    const handleCloseAttendance = async (attendanceId) => {
        setIsLoading(true)
        try {
            // Implement close attendance functionality
            await closeAttendance(attendanceId)

            toast({
                title: "Success",
                description: "Attendance session closed successfully",
            })

            // Refresh the active attendance sessions
            fetchClasses()
            fetchPastAttendanceSessions()

            // If we're viewing the details of this session, close the dialog
            if (attendanceDetails?.session._id === attendanceId) {
                setAttendanceDetails(null)
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to close attendance session",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const formatTime = (dateString) => {
        if (!dateString) return "-"
        const date = new Date(dateString)
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    }

    const formatDate = (dateString) => {
        if (!dateString) return "-"
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    }

    // Check if a class has an active attendance session
    const hasActiveAttendance = (classId) => {
        const result = classesWithAttendance.find((item) => item.classId === classId)
        return result?.hasAttendance || false
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Attendance Management</h1>
                <div className="text-sm text-muted-foreground">
                    {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </div>
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
                                <Select
                                    onValueChange={(value) => {
                                        setSelectedClass(value)
                                        // Find the class and set the course ID
                                        const selectedClassObj = classes.find((c) => c._id === value)
                                        if (selectedClassObj) {
                                            setSelectedCourse(selectedClassObj.course._id)
                                        }
                                    }}
                                >
                                    <SelectTrigger id="class">
                                        <SelectValue placeholder="Select a class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes
                                            .filter((c) => !hasActiveAttendance(c._id))
                                            .map((cls) => (
                                                <SelectItem key={cls._id} value={cls._id}>
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
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
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
                            <Button onClick={handleCreateAttendance} disabled={!selectedClass || isLoading}>
                                {isLoading ? "Creating..." : "Create Attendance"}
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
                                {isLoading ? (
                                    <div className="text-center py-6 text-muted-foreground">Loading classes...</div>
                                ) : classes.length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground">No classes scheduled for today</div>
                                ) : (
                                    classes.map((cls) => {
                                        const hasAttendance = hasActiveAttendance(cls._id)
                                        return (
                                            <Card
                                                key={cls._id}
                                                className="border-l-4"
                                                style={{ borderLeftColor: hasAttendance ? "#10b981" : "#94a3b8" }}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-lg">{cls.topic}</h3>
                                                            <div className="text-sm text-muted-foreground">{cls.course.name}</div>
                                                        </div>
                                                        <Badge variant={hasAttendance ? "success" : "secondary"}>
                                                            {hasAttendance ? "Attendance Active" : "No Attendance"}
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
                                                            <span>{cls.students.length} Students</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex justify-end">
                                                        {!hasAttendance ? (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedClass(cls._id)
                                                                    setSelectedCourse(cls.course._id)
                                                                    setCreateAttendanceOpen(true)
                                                                }}
                                                            >
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Create Attendance
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleViewAttendanceDetails(cls._id)}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Attendance
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Active Attendance Sessions</CardTitle>
                                <CardDescription>Currently active attendance sessions</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isLoading ? (
                                    <div className="text-center py-6 text-muted-foreground">Loading attendance sessions...</div>
                                ) : activeAttendanceSessions.length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground">No active attendance sessions</div>
                                ) : (
                                    activeAttendanceSessions.map((session) => {
                                        // Get attendance records for this session if available
                                        const records = attendanceDetails?.session._id === session._id
                                            ? attendanceDetails.records || []
                                            : [];

                                        // Calculate attendance stats
                                        let stats = {
                                            presentCount: 0,
                                            partialCount: 0,
                                            absentCount: 0,
                                            totalStudents: session.totalStudentsInClass || 0,
                                            attendanceRate: 0,
                                        };

                                        // If we have records, calculate actual stats
                                        if (records.length > 0) {
                                            stats = getAttendanceStats(records);
                                        }

                                        // If we have session details, use those values instead
                                        if (attendanceDetails?.sessionDetails && attendanceDetails?.session._id === session._id) {
                                            stats.totalStudents = attendanceDetails.sessionDetails.totalStudentsInClass || stats.totalStudents;
                                            stats.presentCount = attendanceDetails.sessionDetails.signedStudentsCount || stats.presentCount;
                                        }

                                        return (
                                            <Card key={session._id} className="border-l-4 border-l-green-500">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-lg">
                                                                {session.topic || session.classSession?.topic || "Untitled Class"}
                                                            </h3>
                                                            <div className="text-sm text-muted-foreground">
                                                                {session.classSession?.course?.name || "No Course"}
                                                            </div>
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
                                                                {stats.presentCount + stats.partialCount}/{stats.totalStudents} Present
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={((stats.presentCount + stats.partialCount) / Math.max(stats.totalStudents, 1)) * 100}
                                                            className="h-2"
                                                        />
                                                    </div>

                                                    <div className="mt-4 flex justify-between">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleViewAttendanceDetails(session.classSession?._id)}
                                                            disabled={isLoading}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleCloseAttendance(session._id)}
                                                            disabled={isLoading}
                                                        >
                                                            Close Attendance
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })
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
                            {isLoading ? (
                                <div className="text-center py-6 text-muted-foreground">Loading past attendance records...</div>
                            ) : pastAttendanceSessions.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">No past attendance records found</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Class</TableHead>
                                            <TableHead>Course</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pastAttendanceSessions.map((session) => (
                                            <TableRow key={session._id}>
                                                <TableCell>{formatDate(session.createdAt)}</TableCell>
                                                <TableCell className="font-medium">{session.classSession.topic}</TableCell>
                                                <TableCell>{session.classSession.course.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">Completed</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleViewAttendanceDetails(session.classSession._id)}
                                                        disabled={isLoading}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {attendanceDetails && (
                <Dialog open={!!attendanceDetails} onOpenChange={(open) => !open && setAttendanceDetails(null)}>
                    <DialogContent className="sm:max-w-[700px]">
                        <DialogHeader>
                            <DialogTitle>Attendance Details</DialogTitle>
                            <DialogDescription>
                                {attendanceDetails.sessionDetails?.topic ||
                                    attendanceDetails.session.topic ||
                                    "Untitled Class"} -{" "}
                                {formatDate(attendanceDetails.session.createdAt)}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-secondary/20 p-3 rounded-md">
                                    <div className="text-sm font-medium mb-1">Sign-In Code</div>
                                    <div className="text-lg font-mono bg-background p-2 rounded border text-center">
                                        {attendanceDetails.session.signInCode}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 text-center">
                                        {attendanceDetails.session.signInCodeUsed ? "Code has been used" : "Code not used yet"}
                                    </div>
                                </div>
                                <div className="bg-secondary/20 p-3 rounded-md">
                                    <div className="text-sm font-medium mb-1">Sign-Out Code</div>
                                    <div className="text-lg font-mono bg-background p-2 rounded border text-center">
                                        {attendanceDetails.session.signOutCode}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 text-center">
                                        {attendanceDetails.session.signOutCodeUsed ? "Code has been used" : "Code not used yet"}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-secondary/10 p-4 rounded-md">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium">Attendance Summary</h3>
                                    <Badge variant={attendanceDetails.session.active ? "success" : "outline"}>
                                        {attendanceDetails.session.active ? "Active" : "Completed"}
                                    </Badge>
                                </div>

                                {attendanceDetails.records.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {attendanceDetails.records.filter((r) => r.status === "present").length}
                                                </div>
                                                <div className="text-sm text-muted-foreground">Present</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-yellow-600">
                                                    {attendanceDetails.records.filter((r) => r.status === "partial").length}
                                                </div>
                                                <div className="text-sm text-muted-foreground">Partial</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-red-600">
                                                    {attendanceDetails.records.filter((r) => r.status === "absent").length}
                                                </div>
                                                <div className="text-sm text-muted-foreground">Absent</div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium">Attendance Rate</span>
                                                <span className="text-sm font-medium">
                                                    {Math.round(
                                                        (attendanceDetails.records.filter((r) => r.status === "present").length /
                                                            Math.max(attendanceDetails.records.length, 1)) *
                                                        100
                                                    )}
                                                    %
                                                </span>
                                            </div>
                                            <Progress
                                                value={
                                                    (attendanceDetails.records.filter((r) => r.status === "present").length /
                                                        Math.max(attendanceDetails.records.length, 1)) *
                                                    100
                                                }
                                                className="h-2"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">No attendance records found</div>
                                )}
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">Student Attendance</h3>
                                {attendanceDetails.records.length > 0 ? (
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
                                            {attendanceDetails.records.map((record, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">
                                                        {record.student.firstname} {record.student.lastname}
                                                    </TableCell>
                                                    <TableCell>
                                                        {record.signInTime ? (
                                                            <div className="flex items-center">
                                                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                                                <span className="text-xs text-muted-foreground">{formatTime(record.signInTime)}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center">
                                                                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                                                <span className="text-xs text-muted-foreground">-</span>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {record.signOutTime ? (
                                                            <div className="flex items-center">
                                                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                                                <span className="text-xs text-muted-foreground">{formatTime(record.signOutTime)}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center">
                                                                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                                                <span className="text-xs text-muted-foreground">-</span>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                record.status === "present"
                                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                                    : record.status === "partial"
                                                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                                        : "bg-red-50 text-red-700 border-red-200"
                                                            }
                                                        >
                                                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">No student attendance records found</div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            {attendanceDetails.session.active && (
                                <Button
                                    variant="destructive"
                                    onClick={() => handleCloseAttendance(attendanceDetails.session._id)}
                                    disabled={isLoading}
                                >
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
