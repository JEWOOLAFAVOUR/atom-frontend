import { useState, useEffect } from "react"
import {
    User,
    Calendar,
    ArrowLeft,
    Mail,
    Phone,
    Activity,
    GraduationCap,
    MoreHorizontal,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    Edit,
    UserPlus,
    MessageSquare,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import { Progress } from "../../../components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { sendToast } from "../../../components/utilis"
import { Separator } from "../../../components/ui/separator"
import { useNavigate, useParams } from "react-router-dom"
import { getUserDetails } from "../../../api/auth";

const AdminStudentDetails = () => {
    const params = useParams();
    const router = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [studentData, setStudentData] = useState(null)
    const [isAssignTutorModalOpen, setIsAssignTutorModalOpen] = useState(false)
    const [selectedTutor, setSelectedTutor] = useState("")
    const [message, setMessage] = useState("")

    // Mock tutors for dropdown (keep this until you have a tutors API)
    const tutors = [
        { id: "1", name: "Dr. Sarah Miller" },
        { id: "2", name: "Prof. David Kim" },
        { id: "3", name: "Dr. Lisa Wang" },
    ]

    // Mock login activity (keep as you mentioned)
    const loginActivity = [
        { date: "2025-04-05", time: "09:23 AM", device: "iPhone 15", location: "New York, USA" },
        { date: "2025-04-04", time: "02:45 PM", device: "MacBook Pro", location: "New York, USA" },
        { date: "2025-04-03", time: "10:12 AM", device: "iPhone 15", location: "New York, USA" },
        { date: "2025-04-01", time: "08:30 AM", device: "Windows PC", location: "New York, USA" },
        { date: "2025-03-30", time: "03:15 PM", device: "MacBook Pro", location: "Boston, USA" },
    ]

    // Mock projects (keep as you mentioned)
    const projects = [
        {
            id: "1",
            name: "Personal Portfolio Website",
            description: "A responsive portfolio website built with HTML, CSS, and JavaScript",
            status: "In Progress",
            dueDate: "2025-04-20",
            progress: 65,
            technologies: ["HTML", "CSS", "JavaScript"],
        },
        {
            id: "2",
            name: "E-commerce Product Page",
            description: "A product page with shopping cart functionality",
            status: "Completed",
            dueDate: "2025-03-15",
            progress: 100,
            technologies: ["React", "Tailwind CSS"],
        },
        {
            id: "3",
            name: "Weather App",
            description: "A weather application that fetches data from an API",
            status: "Not Started",
            dueDate: "2025-05-10",
            progress: 0,
            technologies: ["React", "API Integration"],
        },
    ]

    const studentId = params?.id

    console.log('........................', params)



    // Fetch student data using the actual API
    useEffect(() => {
        const fetchStudentData = async () => {
            setIsLoading(true)
            try {
                const response = await getUserDetails(studentId)
                setStudentData(response?.data?.data)
                setIsLoading(false)
            } catch (error) {
                console.error("Error fetching student data:", error)
                sendToast("error", "Failed to fetch student data")
                setIsLoading(false)
            }
        }

        fetchStudentData()
    }, [studentId])

    // Handle assign tutor
    const handleAssignTutor = () => {
        if (!selectedTutor) {
            sendToast("error", "Please select a tutor")
            return
        }

        // Mock API call - replace with actual API call when available
        setIsLoading(true)
        setTimeout(() => {
            const selectedTutorObj = tutors.find((t) => t.id === selectedTutor)
            setStudentData((prev) => ({
                ...prev,
                tutor: selectedTutorObj,
            }))
            setIsLoading(false)
            setIsAssignTutorModalOpen(false)
            sendToast("success", `Tutor ${selectedTutorObj.name} assigned successfully`)
        }, 1000)
    }

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A"
        const options = { year: "numeric", month: "long", day: "numeric" }
        return new Date(dateString).toLocaleDateString(undefined, options)
    }

    // Format time
    const formatTime = (dateString) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    // Calculate attendance percentage
    const calculateAttendancePercentage = () => {
        if (!studentData?.attendance?.summary) return 0
        const { present, total } = studentData.attendance.summary
        return total > 0 ? Math.round((present / total) * 100) : 0
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground">Loading student details...</p>
                </div>
            </div>
        )
    }

    if (!studentData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <AlertCircle className="h-16 w-16 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Student Not Found</h2>
                <p className="text-muted-foreground">
                    The student you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Button onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
            </div>
        )
    }

    const student = studentData.studentDetails
    const attendanceRecords = studentData.attendance.records || []
    const classes = studentData.classes.data || []
    const attendancePercentage = calculateAttendancePercentage()

    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Student Details</h1>
            </div>

            {/* Student Profile Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Student Info */}
                <Card className="shadow-sm lg:col-span-1">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <CardTitle>Profile</CardTitle>
                                <CardDescription>Student information and details</CardDescription>
                            </div>
                            {/* <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => router.push(`/admin/students/edit/${student._id}`)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setIsAssignTutorModalOpen(true)}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Assign Tutor
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Send Message
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu> */}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="flex flex-col items-center text-center mb-6">
                            <Avatar className="h-24 w-24 mb-4">
                                {student.avatar ? (
                                    <AvatarImage src={student.avatar} alt={`${student.firstname} ${student.lastname}`} />
                                ) : (
                                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                        {student.firstname.charAt(0)}
                                        {student.lastname.charAt(0)}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <h2 className="text-2xl font-bold">
                                {student.firstname} {student.lastname}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={student.verified ? "success" : "secondary"}>
                                    {student.verified ? "Verified" : "Pending"}
                                </Badge>
                                {student.course && (
                                    <Badge variant="outline" className="bg-primary/5 text-primary">
                                        {student.course.name}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground mt-2">{student.bio || "No bio available"}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-muted-foreground">{student.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Date of Birth</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(student.dateOfBirth)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Course</p>
                                    <p className="text-sm text-muted-foreground">
                                        {student.course?.name || "Not assigned"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">Categories</h3>
                            <div className="flex flex-wrap gap-2">
                                {studentData.categories.map((category) => (
                                    <Badge key={category.id} variant="secondary" className="bg-secondary/50">
                                        {category.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column - Tabs with different sections */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Classes Attended</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{studentData.attendance.summary.present}</div>
                                <Progress value={studentData.attendance.summary.present / (studentData.attendance.summary.total || 1) * 100} className="h-2 mt-2" />
                                <div className="text-xs text-muted-foreground mt-2">
                                    Out of {studentData.attendance.summary.total} total classes
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{attendancePercentage}%</div>
                                <Progress value={attendancePercentage} className="h-2 mt-2" />
                                <div className="text-xs text-muted-foreground mt-2">
                                    {studentData.attendance.summary.partial} partial attendance
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {classes.filter(c => c.status !== "completed").length}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2">
                                    {classes.length} total classes
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs for different sections */}
                    <Tabs defaultValue="classes">
                        <TabsList className="grid grid-cols-4 mb-4">
                            <TabsTrigger value="classes">Classes</TabsTrigger>
                            <TabsTrigger value="attendance">Attendance</TabsTrigger>
                            <TabsTrigger value="projects">Projects</TabsTrigger>
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                        </TabsList>

                        {/* Classes Tab */}
                        <TabsContent value="classes">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Enrolled Classes</CardTitle>
                                    <CardDescription>Classes the student is currently enrolled in</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {classes.length > 0 ? (
                                            classes.map((cls) => (
                                                <div key={cls.id} className="rounded-lg border p-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                        <div>
                                                            <h3 className="font-medium">{cls.topic}</h3>
                                                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                                <User className="h-3.5 w-3.5 mr-1" />
                                                                <span>{cls.tutor?.firstname} {cls.tutor?.lastname}</span>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground mt-1">
                                                                {cls.course?.name}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="bg-primary/5 text-primary">
                                                                {cls.category?.name}
                                                            </Badge>
                                                            <Badge variant={cls.status === "completed" ? "success" : "secondary"}>
                                                                {cls.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 text-sm text-muted-foreground">
                                                        <div className="flex justify-between">
                                                            <span>Start: {formatDate(cls.startTime)} at {formatTime(cls.startTime)}</span>
                                                            <span>End: {formatDate(cls.endTime)} at {formatTime(cls.endTime)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                No classes found for this student
                                            </div>
                                        )}
                                    </div>
                                    {studentData.classes.pagination && studentData.classes.pagination.total > studentData.classes.pagination.limit && (
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-sm text-muted-foreground">
                                                Showing {classes.length} of {studentData.classes.pagination.total} classes
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button variant="outline" size="icon">
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon">
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Attendance Tab */}
                        <TabsContent value="attendance">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Attendance Records</CardTitle>
                                    <CardDescription>Student's attendance history</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b bg-muted/50">
                                                    <th className="p-3 text-left font-medium">Date</th>
                                                    <th className="p-3 text-left font-medium">Class</th>
                                                    <th className="p-3 text-left font-medium">Sign In</th>
                                                    <th className="p-3 text-left font-medium">Sign Out</th>
                                                    <th className="p-3 text-left font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attendanceRecords.length > 0 ? (
                                                    attendanceRecords.map((record) => (
                                                        <tr key={record.id} className="border-b">
                                                            <td className="p-3 text-muted-foreground">{formatDate(record.date)}</td>
                                                            <td className="p-3 font-medium">{record.classSession?.topic || "N/A"}</td>
                                                            <td className="p-3 text-muted-foreground">{formatTime(record.signInTime)}</td>
                                                            <td className="p-3 text-muted-foreground">{record.signOutTime ? formatTime(record.signOutTime) : "Not signed out"}</td>
                                                            <td className="p-3">
                                                                <Badge
                                                                    variant={
                                                                        record.status === "present"
                                                                            ? "success"
                                                                            : record.status === "partial"
                                                                                ? "warning"
                                                                                : "destructive"
                                                                    }
                                                                >
                                                                    {record.status}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="p-8 text-center text-muted-foreground">
                                                            No attendance records found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Projects Tab - Keep mock data as mentioned */}
                        <TabsContent value="projects">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Student Projects</CardTitle>
                                    <CardDescription>Projects the student is working on</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {projects.map((project) => (
                                            <div key={project.id} className="rounded-lg border p-4">
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-medium">{project.name}</h3>
                                                            <Badge
                                                                variant={
                                                                    project.status === "Completed"
                                                                        ? "success"
                                                                        : project.status === "In Progress"
                                                                            ? "default"
                                                                            : "secondary"
                                                                }
                                                            >
                                                                {project.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            {project.technologies.map((tech, index) => (
                                                                <Badge key={index} variant="outline" className="bg-secondary/20">
                                                                    {tech}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className="text-sm text-muted-foreground">Due: {formatDate(project.dueDate)}</div>
                                                        <div className="w-32">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs">Progress</span>
                                                                <span className="text-xs font-medium">{project.progress}%</span>
                                                            </div>
                                                            <Progress value={project.progress} className="h-1.5" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Activity Tab - Keep mock data as mentioned */}
                        <TabsContent value="activity">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Login Activity</CardTitle>
                                    <CardDescription>Recent login history and activity</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {loginActivity.map((activity, index) => (
                                            <div key={index} className="flex items-start gap-4">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <Activity className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                        <div>
                                                            <p className="font-medium">Logged in successfully</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {activity.device} • {activity.location}
                                                            </p>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {formatDate(activity.date)} at {activity.time}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Assign Tutor Modal */}
            <Dialog open={isAssignTutorModalOpen} onOpenChange={setIsAssignTutorModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Assign Tutor</DialogTitle>
                        <DialogDescription>
                            Assign a tutor to {student.firstname} {student.lastname}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="tutor">Select Tutor</Label>
                            <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a tutor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tutors.map((tutor) => (
                                        <SelectItem key={tutor.id} value={tutor.id}>
                                            {tutor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message (Optional)</Label>
                            <Textarea
                                id="message"
                                placeholder="Add a note about this assignment"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAssignTutorModalOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleAssignTutor} disabled={isLoading}>
                            {isLoading ? "Assigning..." : "Assign Tutor"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AdminStudentDetails



// import { useState, useEffect } from "react"
// import {
//     User,
//     Calendar,
//     ArrowLeft,
//     Mail,
//     Phone,
//     MapPin,
//     Cake,
//     Activity,
//     GraduationCap,
//     MoreHorizontal,
//     PlusCircle,
//     AlertCircle,
//     ChevronRight,
//     ChevronLeft,
//     Edit,
//     UserPlus,
//     MessageSquare,
// } from "lucide-react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
// import { Button } from "../../../components/ui/button"
// import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
// import { Badge } from "../../../components/ui/badge"
// import { Progress } from "../../../components/ui/progress"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger,
// } from "../../../components/ui/dropdown-menu"
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
// } from "../../../components/ui/dialog"
// import { Label } from "../../../components/ui/label"
// import { Textarea } from "../../../components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
// import { sendToast } from "../../../components/utilis"
// import { Separator } from "../../../components/ui/separator"
// import { useNavigate } from "react-router-dom"

// const AdminStudentDetails = ({ params }) => {
//     const router = useNavigate()
//     const [isLoading, setIsLoading] = useState(true)
//     const [student, setStudent] = useState(null)
//     const [isAssignTutorModalOpen, setIsAssignTutorModalOpen] = useState(false)
//     const [selectedTutor, setSelectedTutor] = useState("")
//     const [message, setMessage] = useState("")

//     // Mock data - replace with actual API calls
//     const studentId = params?.id || "67f132463ddbf2b5423821e8"

//     // Mock tutors for dropdown
//     const tutors = [
//         { id: "1", name: "Dr. Sarah Miller" },
//         { id: "2", name: "Prof. David Kim" },
//         { id: "3", name: "Dr. Lisa Wang" },
//     ]

//     // Mock login activity
//     const loginActivity = [
//         { date: "2025-04-05", time: "09:23 AM", device: "iPhone 15", location: "New York, USA" },
//         { date: "2025-04-04", time: "02:45 PM", device: "MacBook Pro", location: "New York, USA" },
//         { date: "2025-04-03", time: "10:12 AM", device: "iPhone 15", location: "New York, USA" },
//         { date: "2025-04-01", time: "08:30 AM", device: "Windows PC", location: "New York, USA" },
//         { date: "2025-03-30", time: "03:15 PM", device: "MacBook Pro", location: "Boston, USA" },
//     ]

//     // Mock classes
//     const classes = [
//         {
//             id: "1",
//             name: "Web Development Basics",
//             tutor: "Dr. Sarah Miller",
//             progress: 75,
//             nextClass: "Today, 2:00 PM",
//             attendance: 90,
//         },
//         {
//             id: "2",
//             name: "JavaScript Fundamentals",
//             tutor: "Prof. David Kim",
//             progress: 60,
//             nextClass: "Tomorrow, 10:00 AM",
//             attendance: 85,
//         },
//         {
//             id: "3",
//             name: "UI/UX Principles",
//             tutor: "Dr. Lisa Wang",
//             progress: 40,
//             nextClass: "Friday, 3:30 PM",
//             attendance: 95,
//         },
//     ]

//     // Mock projects
//     const projects = [
//         {
//             id: "1",
//             name: "Personal Portfolio Website",
//             description: "A responsive portfolio website built with HTML, CSS, and JavaScript",
//             status: "In Progress",
//             dueDate: "2025-04-20",
//             progress: 65,
//             technologies: ["HTML", "CSS", "JavaScript"],
//         },
//         {
//             id: "2",
//             name: "E-commerce Product Page",
//             description: "A product page with shopping cart functionality",
//             status: "Completed",
//             dueDate: "2025-03-15",
//             progress: 100,
//             technologies: ["React", "Tailwind CSS"],
//         },
//         {
//             id: "3",
//             name: "Weather App",
//             description: "A weather application that fetches data from an API",
//             status: "Not Started",
//             dueDate: "2025-05-10",
//             progress: 0,
//             technologies: ["React", "API Integration"],
//         },
//     ]

//     // Mock attendance records
//     const attendanceRecords = [
//         { date: "2025-04-05", class: "Web Development Basics", status: "Present" },
//         { date: "2025-04-04", class: "JavaScript Fundamentals", status: "Present" },
//         { date: "2025-04-03", class: "UI/UX Principles", status: "Absent" },
//         { date: "2025-04-02", class: "Web Development Basics", status: "Present" },
//         { date: "2025-04-01", class: "JavaScript Fundamentals", status: "Present" },
//         { date: "2025-03-31", class: "UI/UX Principles", status: "Present" },
//         { date: "2025-03-30", class: "Web Development Basics", status: "Late" },
//     ]

//     // Fetch student data
//     useEffect(() => {
//         const fetchStudentData = async () => {
//             setIsLoading(true)
//             try {
//                 // Mock API call - replace with actual API call
//                 setTimeout(() => {
//                     setStudent({
//                         _id: studentId,
//                         firstname: "John",
//                         lastname: "Doe",
//                         email: "john.doe@example.com",
//                         phone: "+1 (555) 123-4567",
//                         address: "123 Main St, New York, NY 10001",
//                         dateOfBirth: "1998-05-15",
//                         enrollmentDate: "2025-01-10",
//                         course: {
//                             _id: "course1",
//                             name: "Web Development",
//                         },
//                         verified: true,
//                         tutor: tutors[0],
//                         profileImage: null,
//                         bio: "Passionate about web development and design. Looking to build a career in frontend development.",
//                         skills: ["HTML", "CSS", "JavaScript", "React", "UI/UX Design"],
//                         averageAttendance: 90,
//                         overallProgress: 68,
//                         createdAt: "2025-01-10T10:30:00.000Z",
//                     })
//                     setIsLoading(false)
//                 }, 1000)
//             } catch (error) {
//                 console.error("Error fetching student data:", error)
//                 sendToast("error", "Failed to fetch student data")
//                 setIsLoading(false)
//             }
//         }

//         fetchStudentData()
//     }, [studentId])

//     // Handle assign tutor
//     const handleAssignTutor = () => {
//         if (!selectedTutor) {
//             sendToast("error", "Please select a tutor")
//             return
//         }

//         // Mock API call - replace with actual API call
//         setIsLoading(true)
//         setTimeout(() => {
//             const selectedTutorObj = tutors.find((t) => t.id === selectedTutor)
//             setStudent((prev) => ({
//                 ...prev,
//                 tutor: selectedTutorObj,
//             }))
//             setIsLoading(false)
//             setIsAssignTutorModalOpen(false)
//             sendToast("success", `Tutor ${selectedTutorObj.name} assigned successfully`)
//         }, 1000)
//     }

//     // Format date
//     const formatDate = (dateString) => {
//         const options = { year: "numeric", month: "long", day: "numeric" }
//         return new Date(dateString).toLocaleDateString(undefined, options)
//     }

//     // Calculate age
//     const calculateAge = (birthDate) => {
//         const today = new Date()
//         const birth = new Date(birthDate)
//         let age = today.getFullYear() - birth.getFullYear()
//         const monthDiff = today.getMonth() - birth.getMonth()

//         if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
//             age--
//         }

//         return age
//     }

//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center min-h-[60vh]">
//                 <div className="flex flex-col items-center gap-2">
//                     <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
//                     <p className="text-muted-foreground">Loading student details...</p>
//                 </div>
//             </div>
//         )
//     }

//     if (!student) {
//         return (
//             <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
//                 <AlertCircle className="h-16 w-16 text-muted-foreground" />
//                 <h2 className="text-2xl font-bold">Student Not Found</h2>
//                 <p className="text-muted-foreground">
//                     The student you're looking for doesn't exist or you don't have permission to view it.
//                 </p>
//                 <Button onClick={() => router.back()}>
//                     <ArrowLeft className="mr-2 h-4 w-4" />
//                     Go Back
//                 </Button>
//             </div>
//         )
//     }

//     return (
//         <div className="space-y-6">
//             {/* Header with back button */}
//             <div className="flex items-center gap-2">
//                 <Button variant="ghost" size="icon" onClick={() => router.back()}>
//                     <ArrowLeft className="h-5 w-5" />
//                 </Button>
//                 <h1 className="text-3xl font-bold tracking-tight">Student Details</h1>
//             </div>

//             {/* Student Profile Section */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 {/* Left Column - Student Info */}
//                 <Card className="shadow-sm lg:col-span-1">
//                     <CardHeader className="pb-2">
//                         <div className="flex justify-between items-start">
//                             <div className="space-y-1">
//                                 <CardTitle>Profile</CardTitle>
//                                 <CardDescription>Student information and details</CardDescription>
//                             </div>
//                             <DropdownMenu>
//                                 <DropdownMenuTrigger asChild>
//                                     <Button variant="ghost" size="icon">
//                                         <MoreHorizontal className="h-4 w-4" />
//                                     </Button>
//                                 </DropdownMenuTrigger>
//                                 <DropdownMenuContent align="end">
//                                     <DropdownMenuItem onClick={() => router.push(`/admin/students/edit/${student._id}`)}>
//                                         <Edit className="mr-2 h-4 w-4" />
//                                         Edit Profile
//                                     </DropdownMenuItem>
//                                     <DropdownMenuItem onClick={() => setIsAssignTutorModalOpen(true)}>
//                                         <UserPlus className="mr-2 h-4 w-4" />
//                                         Assign Tutor
//                                     </DropdownMenuItem>
//                                     <DropdownMenuSeparator />
//                                     <DropdownMenuItem>
//                                         <MessageSquare className="mr-2 h-4 w-4" />
//                                         Send Message
//                                     </DropdownMenuItem>
//                                 </DropdownMenuContent>
//                             </DropdownMenu>
//                         </div>
//                     </CardHeader>
//                     <CardContent className="pt-4">
//                         <div className="flex flex-col items-center text-center mb-6">
//                             <Avatar className="h-24 w-24 mb-4">
//                                 {student.profileImage ? (
//                                     <AvatarImage src={student.profileImage} alt={`${student.firstname} ${student.lastname}`} />
//                                 ) : (
//                                     <AvatarFallback className="text-2xl bg-primary/10 text-primary">
//                                         {student.firstname.charAt(0)}
//                                         {student.lastname.charAt(0)}
//                                     </AvatarFallback>
//                                 )}
//                             </Avatar>
//                             <h2 className="text-2xl font-bold">
//                                 {student.firstname} {student.lastname}
//                             </h2>
//                             <div className="flex items-center gap-2 mt-1">
//                                 <Badge variant={student.verified ? "success" : "secondary"}>
//                                     {student.verified ? "Verified" : "Pending"}
//                                 </Badge>
//                                 {student.course && (
//                                     <Badge variant="outline" className="bg-primary/5 text-primary">
//                                         {student.course.name}
//                                     </Badge>
//                                 )}
//                             </div>
//                             <p className="text-muted-foreground mt-2">{student.bio}</p>
//                         </div>

//                         <div className="space-y-4">
//                             <div className="flex items-start gap-3">
//                                 <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
//                                 <div>
//                                     <p className="text-sm font-medium">Email</p>
//                                     <p className="text-sm text-muted-foreground">{student.email}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-start gap-3">
//                                 <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
//                                 <div>
//                                     <p className="text-sm font-medium">Phone</p>
//                                     <p className="text-sm text-muted-foreground">{student.phone}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-start gap-3">
//                                 <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
//                                 <div>
//                                     <p className="text-sm font-medium">Address</p>
//                                     <p className="text-sm text-muted-foreground">{student.address}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-start gap-3">
//                                 <Cake className="h-5 w-5 text-muted-foreground mt-0.5" />
//                                 <div>
//                                     <p className="text-sm font-medium">Date of Birth</p>
//                                     <p className="text-sm text-muted-foreground">
//                                         {formatDate(student.dateOfBirth)} ({calculateAge(student.dateOfBirth)} years old)
//                                     </p>
//                                 </div>
//                             </div>

//                             <div className="flex items-start gap-3">
//                                 <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
//                                 <div>
//                                     <p className="text-sm font-medium">Enrollment Date</p>
//                                     <p className="text-sm text-muted-foreground">{formatDate(student.enrollmentDate)}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-start gap-3">
//                                 <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
//                                 <div>
//                                     <p className="text-sm font-medium">Assigned Tutor</p>
//                                     {student.tutor ? (
//                                         <div className="flex items-center gap-2 mt-1">
//                                             <Avatar className="h-6 w-6">
//                                                 <AvatarFallback className="text-xs">
//                                                     {student.tutor.name
//                                                         .split(" ")
//                                                         .map((n) => n[0])
//                                                         .join("")}
//                                                 </AvatarFallback>
//                                             </Avatar>
//                                             <span className="text-sm">{student.tutor.name}</span>
//                                         </div>
//                                     ) : (
//                                         <div className="flex items-center gap-2 mt-1">
//                                             <span className="text-sm text-muted-foreground">Not assigned</span>
//                                             <Button
//                                                 variant="ghost"
//                                                 size="sm"
//                                                 className="h-7 px-2"
//                                                 onClick={() => setIsAssignTutorModalOpen(true)}
//                                             >
//                                                 <PlusCircle className="h-3.5 w-3.5 mr-1" />
//                                                 Assign
//                                             </Button>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         <Separator className="my-6" />

//                         <div className="space-y-4">
//                             <h3 className="text-sm font-medium">Skills</h3>
//                             <div className="flex flex-wrap gap-2">
//                                 {student.skills.map((skill, index) => (
//                                     <Badge key={index} variant="secondary" className="bg-secondary/50">
//                                         {skill}
//                                     </Badge>
//                                 ))}
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 {/* Right Column - Tabs with different sections */}
//                 <div className="lg:col-span-2 space-y-6">
//                     {/* Overview Cards */}
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                         <Card className="shadow-sm">
//                             <CardHeader className="pb-2">
//                                 <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <div className="text-2xl font-bold">{student.overallProgress}%</div>
//                                 <Progress value={student.overallProgress} className="h-2 mt-2" />
//                             </CardContent>
//                         </Card>

//                         <Card className="shadow-sm">
//                             <CardHeader className="pb-2">
//                                 <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <div className="text-2xl font-bold">{student.averageAttendance}%</div>
//                                 <Progress value={student.averageAttendance} className="h-2 mt-2" />
//                             </CardContent>
//                         </Card>

//                         <Card className="shadow-sm">
//                             <CardHeader className="pb-2">
//                                 <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <div className="text-2xl font-bold">{projects.filter((p) => p.status === "In Progress").length}</div>
//                                 <div className="text-xs text-muted-foreground mt-2">{projects.length} total projects</div>
//                             </CardContent>
//                         </Card>
//                     </div>

//                     {/* Tabs for different sections */}
//                     <Tabs defaultValue="classes">
//                         <TabsList className="grid grid-cols-4 mb-4">
//                             <TabsTrigger value="classes">Classes</TabsTrigger>
//                             <TabsTrigger value="projects">Projects</TabsTrigger>
//                             <TabsTrigger value="attendance">Attendance</TabsTrigger>
//                             <TabsTrigger value="activity">Activity</TabsTrigger>
//                         </TabsList>

//                         {/* Classes Tab */}
//                         <TabsContent value="classes">
//                             <Card>
//                                 <CardHeader>
//                                     <CardTitle>Enrolled Classes</CardTitle>
//                                     <CardDescription>Classes the student is currently enrolled in</CardDescription>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="space-y-6">
//                                         {classes.map((cls) => (
//                                             <div key={cls.id} className="rounded-lg border p-4">
//                                                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                                                     <div>
//                                                         <h3 className="font-medium">{cls.name}</h3>
//                                                         <div className="flex items-center text-sm text-muted-foreground mt-1">
//                                                             <User className="h-3.5 w-3.5 mr-1" />
//                                                             <span>{cls.tutor}</span>
//                                                         </div>
//                                                     </div>
//                                                     <div className="flex items-center gap-2">
//                                                         <Badge variant="outline" className="bg-primary/5 text-primary">
//                                                             Next: {cls.nextClass}
//                                                         </Badge>
//                                                         <Badge variant="secondary">{cls.attendance}% Attendance</Badge>
//                                                     </div>
//                                                 </div>
//                                                 <div className="mt-4">
//                                                     <div className="flex items-center justify-between mb-1">
//                                                         <span className="text-sm">Progress</span>
//                                                         <span className="text-sm font-medium">{cls.progress}%</span>
//                                                     </div>
//                                                     <Progress value={cls.progress} className="h-2" />
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         </TabsContent>

//                         {/* Projects Tab */}
//                         <TabsContent value="projects">
//                             <Card>
//                                 <CardHeader>
//                                     <CardTitle>Student Projects</CardTitle>
//                                     <CardDescription>Projects the student is working on</CardDescription>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="space-y-6">
//                                         {projects.map((project) => (
//                                             <div key={project.id} className="rounded-lg border p-4">
//                                                 <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
//                                                     <div>
//                                                         <div className="flex items-center gap-2">
//                                                             <h3 className="font-medium">{project.name}</h3>
//                                                             <Badge
//                                                                 variant={
//                                                                     project.status === "Completed"
//                                                                         ? "success"
//                                                                         : project.status === "In Progress"
//                                                                             ? "default"
//                                                                             : "secondary"
//                                                                 }
//                                                             >
//                                                                 {project.status}
//                                                             </Badge>
//                                                         </div>
//                                                         <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
//                                                         <div className="flex flex-wrap gap-2 mt-3">
//                                                             {project.technologies.map((tech, index) => (
//                                                                 <Badge key={index} variant="outline" className="bg-secondary/20">
//                                                                     {tech}
//                                                                 </Badge>
//                                                             ))}
//                                                         </div>
//                                                     </div>
//                                                     <div className="flex flex-col items-end gap-2">
//                                                         <div className="text-sm text-muted-foreground">Due: {formatDate(project.dueDate)}</div>
//                                                         <div className="w-32">
//                                                             <div className="flex items-center justify-between mb-1">
//                                                                 <span className="text-xs">Progress</span>
//                                                                 <span className="text-xs font-medium">{project.progress}%</span>
//                                                             </div>
//                                                             <Progress value={project.progress} className="h-1.5" />
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         </TabsContent>

//                         {/* Attendance Tab */}
//                         <TabsContent value="attendance">
//                             <Card>
//                                 <CardHeader>
//                                     <CardTitle>Attendance Records</CardTitle>
//                                     <CardDescription>Student's attendance history</CardDescription>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="rounded-md border">
//                                         <table className="w-full">
//                                             <thead>
//                                                 <tr className="border-b bg-muted/50">
//                                                     <th className="p-3 text-left font-medium">Date</th>
//                                                     <th className="p-3 text-left font-medium">Class</th>
//                                                     <th className="p-3 text-left font-medium">Status</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 {attendanceRecords.map((record, index) => (
//                                                     <tr key={index} className="border-b">
//                                                         <td className="p-3 text-muted-foreground">{formatDate(record.date)}</td>
//                                                         <td className="p-3 font-medium">{record.class}</td>
//                                                         <td className="p-3">
//                                                             <Badge
//                                                                 variant={
//                                                                     record.status === "Present"
//                                                                         ? "success"
//                                                                         : record.status === "Late"
//                                                                             ? "warning"
//                                                                             : "destructive"
//                                                                 }
//                                                             >
//                                                                 {record.status}
//                                                             </Badge>
//                                                         </td>
//                                                     </tr>
//                                                 ))}
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                     <div className="flex items-center justify-between mt-4">
//                                         <div className="text-sm text-muted-foreground">Showing 7 of 42 records</div>
//                                         <div className="flex items-center gap-1">
//                                             <Button variant="outline" size="icon">
//                                                 <ChevronLeft className="h-4 w-4" />
//                                             </Button>
//                                             <Button variant="outline" size="icon">
//                                                 <ChevronRight className="h-4 w-4" />
//                                             </Button>
//                                         </div>
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         </TabsContent>

//                         {/* Activity Tab */}
//                         <TabsContent value="activity">
//                             <Card>
//                                 <CardHeader>
//                                     <CardTitle>Login Activity</CardTitle>
//                                     <CardDescription>Recent login history and activity</CardDescription>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="space-y-6">
//                                         {loginActivity.map((activity, index) => (
//                                             <div key={index} className="flex items-start gap-4">
//                                                 <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
//                                                     <Activity className="h-5 w-5 text-primary" />
//                                                 </div>
//                                                 <div className="flex-1">
//                                                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//                                                         <div>
//                                                             <p className="font-medium">Logged in successfully</p>
//                                                             <p className="text-sm text-muted-foreground">
//                                                                 {activity.device} • {activity.location}
//                                                             </p>
//                                                         </div>
//                                                         <div className="text-sm text-muted-foreground">
//                                                             {formatDate(activity.date)} at {activity.time}
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         </TabsContent>
//                     </Tabs>
//                 </div>
//             </div>

//             {/* Assign Tutor Modal */}
//             <Dialog open={isAssignTutorModalOpen} onOpenChange={setIsAssignTutorModalOpen}>
//                 <DialogContent className="sm:max-w-[500px]">
//                     <DialogHeader>
//                         <DialogTitle>Assign Tutor</DialogTitle>
//                         <DialogDescription>
//                             Assign a tutor to {student.firstname} {student.lastname}
//                         </DialogDescription>
//                     </DialogHeader>
//                     <div className="grid gap-4 py-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="tutor">Select Tutor</Label>
//                             <Select value={selectedTutor} onValueChange={setSelectedTutor}>
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select a tutor" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {tutors.map((tutor) => (
//                                         <SelectItem key={tutor.id} value={tutor.id}>
//                                             {tutor.name}
//                                         </SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                         </div>

//                         <div className="space-y-2">
//                             <Label htmlFor="message">Message (Optional)</Label>
//                             <Textarea
//                                 id="message"
//                                 placeholder="Add a note about this assignment"
//                                 value={message}
//                                 onChange={(e) => setMessage(e.target.value)}
//                             />
//                         </div>
//                     </div>
//                     <DialogFooter>
//                         <Button
//                             type="button"
//                             variant="outline"
//                             onClick={() => setIsAssignTutorModalOpen(false)}
//                             disabled={isLoading}
//                         >
//                             Cancel
//                         </Button>
//                         <Button type="button" onClick={handleAssignTutor} disabled={isLoading}>
//                             {isLoading ? "Assigning..." : "Assign Tutor"}
//                         </Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//         </div>
//     );
// };

// export default AdminStudentDetails;

