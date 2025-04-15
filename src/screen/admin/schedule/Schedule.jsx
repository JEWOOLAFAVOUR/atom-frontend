import { useState, useEffect } from "react"
import {
    CalendarIcon,
    Clock,
    Info,
    MapPin,
    User,
    Plus,
    Search,
    MoreVertical,
    ArrowLeft,
    ArrowRight,
    Trash2,
    Edit,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getClass, updateClass, deleteClass, getUsers, createClass, getCategories } from "../../../api/auth"
import { sendToast } from "../../../components/utilis"
import useAuthStore from "../../../store/useAuthStore"
import { useNavigate } from "react-router-dom"

const AdminClassDashboard = () => {
    const { user } = useAuthStore()
    const navigate = useNavigate();
    // console.log('...................................', user)
    const [isLoading, setIsLoading] = useState(true)
    const [classes, setClasses] = useState([])
    const [totalPages, setTotalPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalClasses, setTotalClasses] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedClass, setSelectedClass] = useState(null)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

    // 1. Add state for categories
    const [categories, setCategories] = useState([])
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0,
    })
    const [searchQuery, setSearchQuery] = useState("")

    // Check if user is admin
    const isAdmin = user?.role === "admin"

    // Form state for create/edit
    // 2. Update formData to replace tutor and course with category
    const [formData, setFormData] = useState({
        topic: "",
        description: "",
        category: "", // Replace tutor and course with category
        startTime: "",
        endTime: "",
        organization: user?.organization?._id || "",
    })

    // Selected students state (for multi-select)
    const [selectedStudents, setSelectedStudents] = useState([])

    const [tutors, setTutors] = useState([])
    const [courses, setCourses] = useState([])
    const [studentsList, setStudentsList] = useState([])

    // Fetch classes
    const fetchClasses = async () => {
        setIsLoading(true)
        try {
            const params = {
                page: currentPage,
                limit: 10,
                search: searchTerm,
            }

            const response = await getClass(params)
            setClasses(response.data?.data || [])
            setTotalPages(response.totalPages || 1)
            setTotalClasses(response?.data?.total || 0)
        } catch (error) {
            sendToast("error", "Failed to fetch classes")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchStudents = async () => {
        try {
            // Prepare params for students
            const studentParams = {
                userType: "student",
                limit: "100", // Increased limit to ensure we get all students
            }

            if (user?.organization?._id) {
                studentParams.organizationId = user.organization._id
            }

            const studentRes = await getUsers(studentParams)

            // Only fetch tutors if the user is an admin
            if (isAdmin) {
                const tutorParams = { ...studentParams, userType: "tutor" }
                const tutorRes = await getUsers(tutorParams)

                if (tutorRes.data?.success) {
                    setTutors(tutorRes.data.data || [])
                }
            }

            if (studentRes.data?.success) {
                setStudentsList(studentRes.data.data || [])
            } else {
                sendToast("error", studentRes?.data?.message || "Failed to fetch students")
            }
        } catch (error) {
            console.error("Fetch error:", error)
            sendToast("error", "Failed to fetch students")
        }
    }

    // 3. Add fetchCategories function
    const fetchCategories = async (page = pagination.currentPage) => {
        setIsLoading(true)
        try {
            // Build query parameters
            const params = {}
            if (page) params.page = page.toString()
            if (user?.organization?._id) params.organization = user.organization._id
            if (searchQuery) params.search = searchQuery

            // Make API request
            const response = await getCategories(params)

            if (response.data?.success) {
                setCategories(response.data.data)
                setPagination({
                    currentPage: response.data.currentPage || response.data.page,
                    totalPages: response.data.totalPages,
                    total: response.data.total || response.data.totalCount,
                })
            } else {
                sendToast("error", response?.data?.message || "Failed to fetch categories")
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
            sendToast("error", "Failed to fetch categories")
        } finally {
            setIsLoading(false)
        }
    }

    // 4. Update useEffect to fetch categories instead of courses
    useEffect(() => {
        fetchClasses()
        fetchCategories() // Replace fetchCourses with fetchCategories
        fetchStudents()
    }, [currentPage, searchTerm, selectedStatus, searchQuery])

    // Function to handle student selection
    // const handleStudentSelection = (studentId) => {
    //     // Check if already selected
    //     if (selectedStudents.includes(studentId)) {
    //         // If already selected, remove it
    //         setSelectedStudents(selectedStudents.filter((id) => id !== studentId))
    //     } else {
    //         // If not selected, add it
    //         setSelectedStudents([...selectedStudents, studentId])
    //     }
    // }

    // // Update formData whenever selectedStudents changes
    // useEffect(() => {
    //     setFormData((prev) => ({
    //         ...prev,
    //         students: selectedStudents,
    //     }))
    // }, [selectedStudents])

    // Handle form submission for create/edit
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        const submitData = { ...formData }

        // If user is a tutor, use their ID as the tutor value
        if (!isAdmin) {
            submitData.tutor = user.id
        }

        console.log("Submitting with tutor ID:", submitData.tutor)

        try {
            if (selectedClass) {
                // Update existing class
                await updateClass(selectedClass._id, submitData)
                sendToast("success", "Class updated successfully")
                setEditDialogOpen(false)
            } else {
                // Create new class
                console.log({ submitData })
                const response = await createClass(submitData)
                console.log("response from create class", response)
                sendToast("success", "Class created successfully")
                setCreateDialogOpen(false)
            }
            // Refresh the class list
            fetchClasses()
        } catch (error) {
            console.log("errorrrrrrrrr", error)
            sendToast("error", selectedClass ? "Failed to update class" : "Failed to create class")
        } finally {
            setIsLoading(false)
        }
    }

    // Handle class deletion
    const handleDeleteClass = async (classId) => {
        if (confirm("Are you sure you want to delete this class?")) {
            setIsLoading(true)
            try {
                await deleteClass(classId)
                sendToast("success", "Class deleted successfully")
                fetchClasses()
            } catch (error) {
                sendToast("error", "Failed to delete class")
            } finally {
                setIsLoading(false)
            }
        }
    }

    // 5. Update resetForm to use category instead of tutor and course
    const resetForm = () => {
        setFormData({
            topic: "",
            description: "",
            category: "", // Replace tutor and course with category
            startTime: "",
            endTime: "",
            organization: user?.organization?._id || "",
        })
        setSelectedStudents([])
    }

    // 6. Update openEditDialog to use category instead of tutor and course
    const openEditDialog = (classData) => {
        setSelectedClass(classData)

        // Format dates for the form
        const startDateTime = new Date(classData.startTime).toISOString().slice(0, 16) // Format as YYYY-MM-DDTHH:MM
        const endDateTime = new Date(classData.endTime).toISOString().slice(0, 16)

        // Extract student IDs
        const studentIds = classData.students.map((student) => student._id || student)
        setSelectedStudents(studentIds)

        setFormData({
            topic: classData.topic,
            description: classData.description,
            category: classData.category?._id || classData.category, // Replace tutor and course with category
            startTime: startDateTime,
            endTime: endDateTime,
            organization: classData.organization || user?.organization?._id,
        })
        setEditDialogOpen(true)
    }

    // Open details dialog
    const openDetailsDialog = (classData) => {
        setSelectedClass(classData)
        setDetailsDialogOpen(true)
    }

    // Get badge color based on status
    const getStatusBadge = (status) => {
        switch (status) {
            case "active":
                return "success"
            case "coming":
                return "secondary"
            case "done":
                return "outline"
            default:
                return "default"
        }
    }

    // Format date display
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    // Format time display
    const formatTime = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    // 7. Replace the tutor and course fields in the form with category field
    const renderClassForm = (isEdit = false) => (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor={`${isEdit ? "edit-" : ""}topic`}>Topic</Label>
                    <Input
                        id={`${isEdit ? "edit-" : ""}topic`}
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        placeholder="E.g., Introduction to React Hooks"
                        required
                    />
                </div>
                <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor={`${isEdit ? "edit-" : ""}description`}>Description</Label>
                    <Textarea
                        id={`${isEdit ? "edit-" : ""}description`}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Class description and objectives"
                        required
                    />
                </div>
                <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor={`${isEdit ? "edit-" : ""}category`}>Category</Label>
                    <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category?._id} value={category?._id}>
                                    {category?.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor={`${isEdit ? "edit-" : ""}startTime`}>Start Time</Label>
                        <Input
                            id={`${isEdit ? "edit-" : ""}startTime`}
                            type="datetime-local"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor={`${isEdit ? "edit-" : ""}endTime`}>End Time</Label>
                        <Input
                            id={`${isEdit ? "edit-" : ""}endTime`}
                            type="datetime-local"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            required
                        />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => (isEdit ? setEditDialogOpen(false) : setCreateDialogOpen(false))}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Class" : "Create Class"}
                </Button>
            </DialogFooter>
        </form>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Class Management</h1>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => {
                                resetForm()
                                setSelectedClass(null)
                            }}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Create Class
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create New Class</DialogTitle>
                            <DialogDescription>Add a new class session to the schedule</DialogDescription>
                        </DialogHeader>
                        {renderClassForm(false)}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Edit Class Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Class</DialogTitle>
                        <DialogDescription>Update this class session</DialogDescription>
                    </DialogHeader>
                    {renderClassForm(true)}
                </DialogContent>
            </Dialog>

            {/* Class Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    {selectedClass && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedClass.topic}</DialogTitle>
                                <DialogDescription>
                                    <Badge variant={getStatusBadge(selectedClass.status)}>
                                        {selectedClass.status === "coming"
                                            ? "Upcoming"
                                            : selectedClass.status === "active"
                                                ? "In Progress"
                                                : "Completed"}
                                    </Badge>
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <h4 className="text-sm font-medium mb-1">Description</h4>
                                    <p className="text-sm text-muted-foreground">{selectedClass.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Start Time</h4>
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{formatDate(selectedClass.startTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{formatTime(selectedClass.startTime)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">End Time</h4>
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{formatDate(selectedClass.endTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{formatTime(selectedClass.endTime)}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* 9. Update the class details dialog to show category instead of tutor and course */}
                                {/* In the class details dialog, replace: */}
                                {/* <div>
                                    <h4 className="text-sm font-medium mb-1">Tutor</h4>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {selectedClass.tutor?.firstname && selectedClass.tutor?.lastname
                                                ? `${selectedClass.tutor.firstname} ${selectedClass.tutor.lastname}`
                                                : selectedClass.tutor?.name || "Not specified"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium mb-1">Course</h4>
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{selectedClass.course?.name || "Not specified"}</span>
                                    </div>
                                </div> */}

                                {/* With: */}
                                <div>
                                    <h4 className="text-sm font-medium mb-1">Category</h4>
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{selectedClass.category?.name || "Not specified"}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium mb-1">Students Enrolled</h4>
                                    <div className="bg-secondary/20 rounded-md p-2 max-h-32 overflow-y-auto">
                                        {selectedClass.students && selectedClass?.students.length > 0 ? (
                                            <ul className="space-y-1">
                                                {selectedClass.students.map((student, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-sm">
                                                        <User className="h-3 w-3 text-muted-foreground" />
                                                        <span>
                                                            {student.firstname && student.lastname
                                                                ? `${student.firstname} ${student.lastname}`
                                                                : student.name || `Student ${idx + 1}`}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No students enrolled</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        setDetailsDialogOpen(false)
                                        openEditDialog(selectedClass)
                                    }}
                                >
                                    Edit Class
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search classes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Classes</SelectItem>
                            <SelectItem value="active">In Progress</SelectItem>
                            <SelectItem value="coming">Upcoming</SelectItem>
                            <SelectItem value="done">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All Classes</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past Classes</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Classes</CardTitle>
                            <CardDescription>
                                {isLoading ? "Loading classes..." : `Showing ${classes.length} of ${totalClasses} classes`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <p>Loading classes...</p>
                                </div>
                            ) : classes.length > 0 ? (
                                <ScrollArea className="h-[500px]">
                                    <div className="space-y-4">
                                        {classes.map((cls) => (
                                            <Card key={cls._id} className="overflow-hidden">
                                                <div
                                                    className="bg-primary/5 border-l-4 p-4"
                                                    style={{
                                                        borderLeftColor:
                                                            cls.status === "active" ? "#10b981" : cls.status === "coming" ? "#8b5cf6" : "#94a3b8",
                                                    }}
                                                >
                                                    <div className="flex flex-col sm:flex-row justify-between">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold text-lg">{cls.topic}</h3>
                                                                <Badge variant={getStatusBadge(cls.status)}>
                                                                    {cls.status === "coming"
                                                                        ? "Upcoming"
                                                                        : cls.status === "active"
                                                                            ? "In Progress"
                                                                            : "Completed"}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground line-clamp-1">{cls.description}</p>
                                                        </div>
                                                        <div className="flex items-center mt-2 sm:mt-0">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => openDetailsDialog(cls)}>
                                                                        <Info className="h-4 w-4 mr-2" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => openEditDialog(cls)}>
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Edit Class
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleDeleteClass(cls._id)} className="text-red-600">
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Delete Class
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                    {/* 8. Update the class card display to show category instead of tutor and course */}
                                                    {/* In the class card display, replace: */}
                                                    {/* <div className="flex items-center gap-2 text-sm">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {cls.tutor?.firstname && cls.tutor?.lastname
                                                                ? `${cls.tutor.firstname} ${cls.tutor.lastname}`
                                                                : "Not specified"}
                                                        </span>
                                                    </div> */}

                                                    {/* With: */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-4 mt-4">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span>
                                                                {formatDate(cls.startTime)} · {formatTime(cls.startTime)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Info className="h-4 w-4 text-muted-foreground" />
                                                            <span>{cls.category?.name || "Not specified"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Info className="h-4 w-4 text-muted-foreground" />
                                                            <span>
                                                                {cls.students?.length || 0} student{cls.students?.length !== 1 ? "s" : ""}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No classes found</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => {
                                            resetForm()
                                            setCreateDialogOpen(true)
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Your First Class
                                    </Button>
                                </div>
                            )}
                        </CardContent>

                        {classes.length > 0 && (
                            <CardFooter className="flex justify-between items-center border-t p-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalClasses)} of {totalClasses}{" "}
                                    classes
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm font-medium">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="upcoming" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Classes</CardTitle>
                            <CardDescription>Classes scheduled for the future</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <p>Loading upcoming classes...</p>
                                </div>
                            ) : (
                                <ScrollArea className="h-[500px]">
                                    <div className="space-y-4">
                                        {classes
                                            .filter((cls) => cls.status === "coming")
                                            .map((cls) => (
                                                <Card key={cls.id || cls._id} className="overflow-hidden">
                                                    <div className="bg-primary/5 border-l-4 p-4" style={{ borderLeftColor: "#8b5cf6" }}>
                                                        <div className="flex flex-col sm:flex-row justify-between">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="font-semibold text-lg">{cls.topic}</h3>
                                                                    <Badge variant="secondary">Upcoming</Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground line-clamp-1">{cls.description}</p>
                                                            </div>
                                                            <div className="flex items-center mt-2 sm:mt-0">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm">
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem onClick={() => openDetailsDialog(cls)}>
                                                                            <Info className="h-4 w-4 mr-2" />
                                                                            View Details
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => openEditDialog(cls)}>
                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                            Edit Class
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleDeleteClass(cls._id || cls.id)}
                                                                            className="text-red-600"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Delete Class
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-4 mt-4">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                                <span>
                                                                    {formatDate(cls.startTime)} · {formatTime(cls.startTime)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <User className="h-4 w-4 text-muted-foreground" />
                                                                <span>{cls.tutor?.name || "Dr. Sarah Miller"}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                                <span>{cls.location || "Room 201, Tech Building"}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        {classes.filter((cls) => cls.status === "coming").length === 0 && (
                                            <div className="text-center py-8">
                                                <p className="text-muted-foreground">No upcoming classes found</p>
                                                <Button
                                                    variant="outline"
                                                    className="mt-4"
                                                    onClick={() => {
                                                        resetForm()
                                                        setCreateDialogOpen(true)
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Schedule a Class
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="past" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Past Classes</CardTitle>
                            <CardDescription>Completed class sessions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <p>Loading past classes...</p>
                                </div>
                            ) : (
                                <ScrollArea className="h-[500px]">
                                    <div className="space-y-4">
                                        {classes
                                            .filter((cls) => cls.status === "done")
                                            .map((cls) => (
                                                <Card key={cls.id || cls._id} className="overflow-hidden">
                                                    <div className="bg-primary/5 border-l-4 p-4" style={{ borderLeftColor: "#94a3b8" }}>
                                                        <div className="flex flex-col sm:flex-row justify-between">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="font-semibold text-lg">{cls.topic}</h3>
                                                                    <Badge variant="outline">Completed</Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground line-clamp-1">{cls.description}</p>
                                                            </div>
                                                            <div className="flex items-center mt-2 sm:mt-0">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm">
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem onClick={() => openDetailsDialog(cls)}>
                                                                            <Info className="h-4 w-4 mr-2" />
                                                                            View Details
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => openEditDialog(cls)}>
                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                            Edit Class
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleDeleteClass(cls._id || cls.id)}
                                                                            className="text-red-600"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Delete Class
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-4 mt-4">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                                <span>
                                                                    {formatDate(cls.startTime)} · {formatTime(cls.startTime)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <User className="h-4 w-4 text-muted-foreground" />
                                                                <span>{cls.tutor?.name || "Dr. Sarah Miller"}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                                <span>{cls.location || "Room 201, Tech Building"}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        {classes.filter((cls) => cls.status === "done").length === 0 && (
                                            <div className="text-center py-8">
                                                <p className="text-muted-foreground">No past classes found</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default AdminClassDashboard
