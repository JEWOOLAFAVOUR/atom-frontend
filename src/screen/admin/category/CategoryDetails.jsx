import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    User,
    BookOpen,
    FolderOpen,
    Info,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Input } from "../../../components/ui/input"
import { Separator } from "../../../components/ui/separator"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { sendToast } from "../../../components/utilis"
import useAuthStore from "../../../store/useAuthStore"
import { getCategoryId } from "../../../api/auth"

const CategoryDetails = () => {
    const { categoryId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [category, setCategory] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("overview")
    const [filteredSessions, setFilteredSessions] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    useEffect(() => {
        if (categoryId) {
            fetchCategoryDetails(categoryId)
        }
    }, [categoryId])

    useEffect(() => {
        if (category?.sessions) {
            const filtered = category.sessions.filter(
                (session) =>
                    session.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    session.description.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            setFilteredSessions(filtered)
        }
    }, [searchQuery, category])

    const fetchCategoryDetails = async (id) => {
        setIsLoading(true)
        try {
            const response = await getCategoryId(id)

            if (response.data?.success) {
                setCategory(response.data.data)
            } else {
                sendToast("error", "Failed to fetch category details")
            }
        } catch (error) {
            console.error("Error fetching category details:", error)
            sendToast("error", "Failed to fetch category details")
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString) => {
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
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

    const getInitials = (name) => {
        if (!name) return "N/A"
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
    }

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentSessions = filteredSessions.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage)

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading category details...</p>
                </div>
            </div>
        )
    }

    if (!category) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <Info className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Category Not Found</h2>
                <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => navigate("/dashboard/categories")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Categories
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigate("/dashboard/categories")} className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
                        <p className="text-muted-foreground mt-1">Category Details</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/dashboard/categories/edit/${categoryId}`)}>
                        Edit Category
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="students">Students ({category.students?.length || 0})</TabsTrigger>
                    <TabsTrigger value="tutors">Tutors ({category.tutors?.length || 0})</TabsTrigger>
                    <TabsTrigger value="sessions">Classes ({category.sessions?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Category Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <FolderOpen className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{category.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {category.description || "No description available"}
                                            </p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Created</span>
                                            <span>{formatDate(category.createdAt)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Last Updated</span>
                                            <span>{formatDate(category.updatedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Course Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <BookOpen className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{category.course?.name || "No course assigned"}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {category.course?.description || "No course description available"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Members</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Students</span>
                                        </div>
                                        <Badge variant="outline">{category.students?.length || 0}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Tutors</span>
                                        </div>
                                        <Badge variant="outline">{category.tutors?.length || 0}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Classes</span>
                                        </div>
                                        <Badge variant="outline">{category.sessions?.length || 0}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button variant="outline" className="w-full text-xs" onClick={() => setActiveTab("sessions")}>
                                    View All Sessions
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    {category.sessions && category.sessions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Classes</CardTitle>
                                <CardDescription>The most recent sessions for this category</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {category.sessions.slice(0, 3).map((session) => (
                                        <div
                                            key={session._id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div className="space-y-1">
                                                <h3 className="font-medium">{session.topic}</h3>
                                                <p className="text-sm text-muted-foreground">{session.description}</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <Badge variant="outline" className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(session.startTime).toLocaleDateString()}
                                                    </Badge>
                                                    <Badge variant="outline" className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                                    </Badge>
                                                    <Badge variant="outline" className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {session.students?.length || 0} students
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-3 sm:mt-0"
                                                onClick={() => navigate(`/dashboard/schedule/${session._id}`)}
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full" onClick={() => setActiveTab("sessions")}>
                                    View All Classes
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="students">
                    <Card>
                        <CardHeader>
                            <CardTitle>Students</CardTitle>
                            <CardDescription>Students assigned to this category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {category.students && category.students.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search students..."
                                            className="pl-9"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <ScrollArea className="h-[500px]">
                                        <div className="space-y-2">
                                            {category.students
                                                .filter(
                                                    (student) =>
                                                        `${student.firstname} ${student.lastname}`
                                                            .toLowerCase()
                                                            .includes(searchQuery.toLowerCase()) ||
                                                        student.email.toLowerCase().includes(searchQuery.toLowerCase()),
                                                )
                                                .map((student) => (
                                                    <div
                                                        key={student._id}
                                                        className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md"
                                                        onClick={() => navigate(`/dashboard/students/${student._id}`)}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <Avatar className="h-10 w-10">
                                                                {student.profilePicture ? (
                                                                    <AvatarImage src={student.profilePicture || "/placeholder.svg"} />
                                                                ) : (
                                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                                        {getInitials(`${student.firstname} ${student.lastname}`)}
                                                                    </AvatarFallback>
                                                                )}
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">
                                                                    {student.firstname} {student.lastname}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">{student.email}</p>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="icon">
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Students Assigned</h3>
                                    <p className="text-muted-foreground">This category doesn't have any students assigned to it yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tutors">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tutors</CardTitle>
                            <CardDescription>Tutors assigned to this category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {category.tutors && category.tutors.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search tutors..."
                                            className="pl-9"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        {category.tutors
                                            .filter(
                                                (tutor) =>
                                                    `${tutor.firstname} ${tutor.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    tutor.email.toLowerCase().includes(searchQuery.toLowerCase()),
                                            )
                                            .map((tutor) => (
                                                <div
                                                    key={tutor._id}
                                                    className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md"
                                                    onClick={() => navigate(`/dashboard/tutors/${tutor._id}`)}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-10 w-10">
                                                            {tutor.profilePicture ? (
                                                                <AvatarImage src={tutor.profilePicture || "/placeholder.svg"} />
                                                            ) : (
                                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                                    {getInitials(`${tutor.firstname} ${tutor.lastname}`)}
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">
                                                                {tutor.firstname} {tutor.lastname}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">{tutor.email}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon">
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Tutors Assigned</h3>
                                    <p className="text-muted-foreground">This category doesn't have any tutors assigned to it yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sessions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Classes</CardTitle>
                            <CardDescription>All classes for this category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {category.sessions && category.sessions.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search sessions..."
                                            className="pl-9"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        {currentSessions.map((session) => (
                                            <div key={session._id} className="border rounded-lg p-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="space-y-2">
                                                        <h3 className="font-medium text-lg">{session.topic}</h3>
                                                        <p className="text-muted-foreground">{session.description}</p>

                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <Badge variant="outline" className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(session.startTime).toLocaleDateString()}
                                                            </Badge>
                                                            <Badge variant="outline" className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex flex-wrap gap-4 mt-3">
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                                        {session.tutor
                                                                            ? getInitials(
                                                                                typeof session.tutor === "object"
                                                                                    ? `${session.tutor.firstname} ${session.tutor.lastname}`
                                                                                    : "TU",
                                                                            )
                                                                            : "TU"}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-sm">
                                                                    {session.tutor && typeof session.tutor === "object"
                                                                        ? `${session.tutor.firstname} ${session.tutor.lastname}`
                                                                        : "Assigned Tutor"}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-1">
                                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm">{session.students?.length || 0} students</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Button onClick={() => navigate(`/dashboard/schedule/${session._id}`)} className="shrink-0">
                                                        View Session
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {filteredSessions.length > itemsPerPage && (
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-sm text-muted-foreground">
                                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSessions.length)} of{" "}
                                                {filteredSessions.length} sessions
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Sessions Found</h3>
                                    <p className="text-muted-foreground">This category doesn't have any sessions yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default CategoryDetails
