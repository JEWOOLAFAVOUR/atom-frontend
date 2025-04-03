import { BarChart3, BookOpen, GraduationCap, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"

const AdminDashboard = () => {
    // Mock data - replace with actual data from your store
    const stats = {
        totalStudents: 156,
        totalTutors: 12,
        totalCourses: 8,
        activeClasses: 24,
    }

    const recentStudents = [
        { id: 1, name: "Emma Johnson", email: "emma@example.com", course: "Web Development" },
        { id: 2, name: "Michael Chen", email: "michael@example.com", course: "Data Science" },
        { id: 3, name: "Sophia Rodriguez", email: "sophia@example.com", course: "UX Design" },
        { id: 4, name: "James Wilson", email: "james@example.com", course: "Mobile Development" },
    ]

    const recentTutors = [
        { id: 1, name: "Dr. Sarah Miller", email: "sarah@example.com", courses: ["Web Development", "UI/UX"] },
        { id: 2, name: "Prof. David Kim", email: "david@example.com", courses: ["Data Science", "Machine Learning"] },
        { id: 3, name: "Dr. Lisa Wang", email: "lisa@example.com", courses: ["Mobile Development"] },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">+12 from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTutors}</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCourses}</div>
                        <p className="text-xs text-muted-foreground">+1 from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeClasses}</div>
                        <p className="text-xs text-muted-foreground">+4 from last week</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="students" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="students">Recent Students</TabsTrigger>
                    <TabsTrigger value="tutors">Recent Tutors</TabsTrigger>
                </TabsList>

                <TabsContent value="students" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recently Added Students</CardTitle>
                            <CardDescription>Manage your recently added students</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left font-medium">Name</th>
                                            <th className="p-3 text-left font-medium">Email</th>
                                            <th className="p-3 text-left font-medium">Course</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentStudents.map((student) => (
                                            <tr key={student.id} className="border-b">
                                                <td className="p-3">{student.name}</td>
                                                <td className="p-3">{student.email}</td>
                                                <td className="p-3">{student.course}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tutors" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recently Added Tutors</CardTitle>
                            <CardDescription>Manage your recently added tutors</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left font-medium">Name</th>
                                            <th className="p-3 text-left font-medium">Email</th>
                                            <th className="p-3 text-left font-medium">Courses</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTutors.map((tutor) => (
                                            <tr key={tutor.id} className="border-b">
                                                <td className="p-3">{tutor.name}</td>
                                                <td className="p-3">{tutor.email}</td>
                                                <td className="p-3">{tutor.courses.join(", ")}</td>
                                            </tr>
                                        ))}
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

