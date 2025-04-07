"use client"

import { useState, useEffect } from "react"
import { Calendar, CheckCircle, Clock, FileText, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Progress } from "../../../components/ui/progress"
import { fetchTutorDashboard } from "../../../api/auth"

const TutorDashboard = () => {
    // State for dashboard data
    const [dashboardData, setDashboardData] = useState({
        totalStudents: 0,
        totalUpcomingClasses: 0,
        latestClasses: []
    })
    const [isLoading, setIsLoading] = useState(true)

    // Fetch dashboard data
    useEffect(() => {
        const getDashboardData = async () => {
            try {
                setIsLoading(true)
                const response = await fetchTutorDashboard()
                if (response.data?.success) {
                    setDashboardData(response.data.data)
                }
            } catch (error) {
                console.error("Error fetching tutor dashboard data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        getDashboardData()
    }, [])

    // Format date and time for class display
    const formatDateTime = (dateString) => {
        const date = new Date(dateString)
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // Check if the date is today or tomorrow
        let dayLabel = ""
        if (date.toDateString() === today.toDateString()) {
            dayLabel = "Today"
        } else if (date.toDateString() === tomorrow.toDateString()) {
            dayLabel = "Tomorrow"
        } else {
            // Format as day of week
            const options = { weekday: 'long' }
            dayLabel = new Intl.DateTimeFormat('en-US', options).format(date)
        }

        // Format time
        const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true }
        const timeString = new Intl.DateTimeFormat('en-US', timeOptions).format(date)

        return `${dayLabel}, ${timeString}`
    }

    // Keep these as placeholder stats since they're not in the API response
    const placeholderStats = {
        pendingAssignments: 12,
        completionRate: 78,
    }

    // Placeholder pending assignments since they're not in the API response
    const pendingAssignments = [
        { id: 1, title: "JavaScript Final Project", course: "Advanced JavaScript", submissions: 8, total: 12 },
        { id: 2, title: "Portfolio Website", course: "Web Development", submissions: 15, total: 18 },
        { id: 3, title: "React State Management", course: "React Fundamentals", submissions: 10, total: 15 },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Tutor Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : dashboardData.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Across all your courses</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : dashboardData.totalUpcomingClasses}</div>
                        <p className="text-xs text-muted-foreground">In the next 7 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{placeholderStats.pendingAssignments}</div>
                        <p className="text-xs text-muted-foreground">Awaiting review</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{placeholderStats.completionRate}%</div>
                        <Progress value={placeholderStats.completionRate} className="h-2 mt-2" />
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
                        {isLoading ? (
                            <div className="text-center py-4">Loading classes...</div>
                        ) : dashboardData.latestClasses && dashboardData.latestClasses.length > 0 ? (
                            <div className="space-y-4">
                                {dashboardData.latestClasses.map((cls, index) => (
                                    <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <h3 className="font-medium">{cls.topic}</h3>
                                            <p className="text-sm text-muted-foreground">{cls.courseName}</p>
                                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                <Clock className="mr-1 h-4 w-4" />
                                                {formatDateTime(cls.startTime)}
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <Users className="mr-1 h-4 w-4" />
                                            {cls.studentCount} {cls.studentCount === 1 ? 'student' : 'students'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted-foreground">No upcoming classes found.</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pending Assignments</CardTitle>
                        <CardDescription>Assignments awaiting review</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pendingAssignments.map((assignment) => (
                                <div key={assignment.id} className="border-b pb-4 last:border-0 last:pb-0">
                                    <h3 className="font-medium">{assignment.title}</h3>
                                    <p className="text-sm text-muted-foreground">{assignment.course}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-sm">
                                            {assignment.submissions} / {assignment.total} submissions
                                        </span>
                                        <Progress value={(assignment.submissions / assignment.total) * 100} className="h-2 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default TutorDashboard;





// import { Calendar, CheckCircle, Clock, FileText, Users } from "lucide-react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
// import { Progress } from "../../../components/ui/progress"

// const TutorDashboard = () => {
//     // Mock data - replace with actual data from your store
//     const stats = {
//         totalStudents: 48,
//         upcomingClasses: 5,
//         pendingAssignments: 12,
//         completionRate: 78,
//     }

//     const upcomingClasses = [
//         { id: 1, title: "Web Development Fundamentals", time: "Today, 10:00 AM", students: 18 },
//         { id: 2, title: "Advanced JavaScript", time: "Today, 2:00 PM", students: 12 },
//         { id: 3, title: "React Hooks Workshop", time: "Tomorrow, 11:00 AM", students: 15 },
//     ]

//     const pendingAssignments = [
//         { id: 1, title: "JavaScript Final Project", course: "Advanced JavaScript", submissions: 8, total: 12 },
//         { id: 2, title: "Portfolio Website", course: "Web Development", submissions: 15, total: 18 },
//         { id: 3, title: "React State Management", course: "React Fundamentals", submissions: 10, total: 15 },
//     ]

//     return (
//         <div className="space-y-6">
//             <h1 className="text-3xl font-bold">Tutor Dashboard</h1>

//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                 <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                         <CardTitle className="text-sm font-medium">Total Students</CardTitle>
//                         <Users className="h-4 w-4 text-muted-foreground" />
//                     </CardHeader>
//                     <CardContent>
//                         <div className="text-2xl font-bold">{stats.totalStudents}</div>
//                         <p className="text-xs text-muted-foreground">Across all your courses</p>
//                     </CardContent>
//                 </Card>

//                 <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                         <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
//                         <Calendar className="h-4 w-4 text-muted-foreground" />
//                     </CardHeader>
//                     <CardContent>
//                         <div className="text-2xl font-bold">{stats.upcomingClasses}</div>
//                         <p className="text-xs text-muted-foreground">In the next 7 days</p>
//                     </CardContent>
//                 </Card>

//                 <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                         <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
//                         <FileText className="h-4 w-4 text-muted-foreground" />
//                     </CardHeader>
//                     <CardContent>
//                         <div className="text-2xl font-bold">{stats.pendingAssignments}</div>
//                         <p className="text-xs text-muted-foreground">Awaiting review</p>
//                     </CardContent>
//                 </Card>

//                 <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                         <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
//                         <CheckCircle className="h-4 w-4 text-muted-foreground" />
//                     </CardHeader>
//                     <CardContent>
//                         <div className="text-2xl font-bold">{stats.completionRate}%</div>
//                         <Progress value={stats.completionRate} className="h-2 mt-2" />
//                     </CardContent>
//                 </Card>
//             </div>

//             <div className="grid gap-4 md:grid-cols-2">
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Upcoming Classes</CardTitle>
//                         <CardDescription>Your scheduled classes for the next few days</CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="space-y-4">
//                             {upcomingClasses.map((cls) => (
//                                 <div key={cls.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
//                                     <div>
//                                         <h3 className="font-medium">{cls.title}</h3>
//                                         <div className="flex items-center text-sm text-muted-foreground">
//                                             <Clock className="mr-1 h-4 w-4" />
//                                             {cls.time}
//                                         </div>
//                                     </div>
//                                     <div className="flex items-center text-sm">
//                                         <Users className="mr-1 h-4 w-4" />
//                                         {cls.students} students
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Pending Assignments</CardTitle>
//                         <CardDescription>Assignments awaiting review</CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="space-y-4">
//                             {pendingAssignments.map((assignment) => (
//                                 <div key={assignment.id} className="border-b pb-4 last:border-0 last:pb-0">
//                                     <h3 className="font-medium">{assignment.title}</h3>
//                                     <p className="text-sm text-muted-foreground">{assignment.course}</p>
//                                     <div className="mt-2 flex items-center justify-between">
//                                         <span className="text-sm">
//                                             {assignment.submissions} / {assignment.total} submissions
//                                         </span>
//                                         <Progress value={(assignment.submissions / assignment.total) * 100} className="h-2 w-1/2" />
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     )
// }

// export default TutorDashboard

