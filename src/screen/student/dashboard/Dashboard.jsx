import { BookOpen, Calendar, CheckCircle, Clock, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Progress } from "../../../components/ui/progress"
import { Badge } from "../../../components/ui/badge"

const StudentDashboard = () => {
    // Mock data - replace with actual data from your store
    const stats = {
        courseProgress: 65,
        attendanceRate: 92,
        completedAssignments: 8,
        totalAssignments: 10,
    }

    const upcomingClasses = [
        { id: 1, title: "Web Development Fundamentals", time: "Today, 10:00 AM", tutor: "Dr. Sarah Miller" },
        { id: 2, title: "Advanced JavaScript", time: "Tomorrow, 2:00 PM", tutor: "Prof. David Kim" },
        { id: 3, title: "React Hooks Workshop", time: "Wed, 11:00 AM", tutor: "Dr. Lisa Wang" },
    ]

    const assignments = [
        { id: 1, title: "JavaScript Final Project", dueDate: "Oct 15, 2023", status: "pending" },
        { id: 2, title: "Portfolio Website", dueDate: "Oct 20, 2023", status: "completed" },
        { id: 3, title: "React State Management", dueDate: "Oct 25, 2023", status: "pending" },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Student Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.courseProgress}%</div>
                        <Progress value={stats.courseProgress} className="h-2 mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
                        <Progress value={stats.attendanceRate} className="h-2 mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.completedAssignments}/{stats.totalAssignments}
                        </div>
                        <p className="text-xs text-muted-foreground">Completed assignments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Class</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-md font-medium">Today, 10:00 AM</div>
                        <p className="text-xs text-muted-foreground">Web Development Fundamentals</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Classes</CardTitle>
                        <CardDescription>Your scheduled classes for the next few days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingClasses.map((cls) => (
                                <div key={cls.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <h3 className="font-medium">{cls.title}</h3>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Clock className="mr-1 h-4 w-4" />
                                            {cls.time}
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">{cls.tutor}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Assignments</CardTitle>
                        <CardDescription>Your current and upcoming assignments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {assignments.map((assignment) => (
                                <div
                                    key={assignment.id}
                                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                                >
                                    <div>
                                        <h3 className="font-medium">{assignment.title}</h3>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="mr-1 h-4 w-4" />
                                            Due: {assignment.dueDate}
                                        </div>
                                    </div>
                                    <Badge variant={assignment.status === "completed" ? "outline" : "default"}>
                                        {assignment.status === "completed" ? "Completed" : "Pending"}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default StudentDashboard

