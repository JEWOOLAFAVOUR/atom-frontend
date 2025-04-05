import { useState, useEffect } from "react"
import {
    Search,
    MoreHorizontal,
    Download,
    Filter,
    ChevronLeft,
    ChevronRight,
    Trash,
    Edit,
    User,
    UserPlus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback } from "../../../components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { sendToast } from "../../../components/utilis"
import useAuthStore from "../../../store/useAuthStore"
import { createUserByRole, getUsers, updateUser, deleteUser } from "../../../api/auth"
import { getCourses } from "../../../api/auth"
import { useNavigate } from "react-router-dom"


const AdminStudent = () => {
    const { user } = useAuthStore()
    const navigate = useNavigate();

    // State variables
    const [students, setStudents] = useState([])
    const [courses, setCourses] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchTimeout, setSearchTimeout] = useState(null)
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        day: "",
        month: "",
        course: "",
        userType: "student",
        organizationId: "",
    })
    const [errors, setErrors] = useState({})
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0,
    })

    // Month names for dropdown
    const months = [
        { value: "1", label: "January" },
        { value: "2", label: "February" },
        { value: "3", label: "March" },
        { value: "4", label: "April" },
        { value: "5", label: "May" },
        { value: "6", label: "June" },
        { value: "7", label: "July" },
        { value: "8", label: "August" },
        { value: "9", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ]

    // Initialize organization ID from authenticated user
    useEffect(() => {
        if (user?.organization?._id) {
            setFormData((prev) => ({
                ...prev,
                organizationId: user.organization._id,
            }))
        }
    }, [user])

    // Fetch students on component mount and when search changes
    useEffect(() => {
        fetchStudents()
        fetchCourses()
    }, [pagination.currentPage])

    // Debounce search input to prevent excessive API calls
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        const timeout = setTimeout(() => {
            fetchStudents(1)
        }, 500)

        setSearchTimeout(timeout)

        return () => {
            if (searchTimeout) clearTimeout(searchTimeout)
        }
    }, [searchQuery])

    // Fetch students from API
    const fetchStudents = async (page = pagination.currentPage) => {
        setIsLoading(true)
        try {
            // Build query parameters
            const params = {
                userType: "student",
                page: page.toString(),
                limit: "10",
            }

            if (user?.organization?._id) {
                params.organizationId = user.organization._id
            }

            if (searchQuery) {
                params.search = searchQuery
            }

            // Make API request
            const response = await getUsers(params)

            if (response.data?.success) {
                setStudents(response.data.data)
                setPagination({
                    currentPage: response.data.page,
                    totalPages: response.data.totalPages,
                    total: response.data.totalCount,
                })
            } else {
                sendToast("error", response?.data?.message || "Failed to fetch students")
            }
        } catch (error) {
            console.error("Error fetching students:", error)
            sendToast("error", "Failed to fetch students")
        } finally {
            setIsLoading(false)
        }
    }

    // Fetch courses for dropdown
    const fetchCourses = async () => {
        try {
            const params = {}
            if (user?.organization?._id) {
                params.organization = user.organization._id
            }

            const response = await getCourses(params)

            if (response.data?.success) {
                setCourses(response.data.data)
            }
        } catch (error) {
            console.error("Error fetching courses:", error)
        }
    }

    // Reset form data
    const resetFormData = () => {
        setFormData({
            firstname: "",
            lastname: "",
            email: "",
            day: "",
            month: "",
            course: "",
            userType: "student",
            organizationId: user?.organization?._id || "",
        })
        setErrors({})
    }

    // Validate form
    const validateForm = () => {
        const newErrors = {}
        if (!formData.firstname.trim()) newErrors.firstname = "First name is required"
        if (!formData.lastname.trim()) newErrors.lastname = "Last name is required"

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email"
        }

        if (!formData.day.trim()) {
            newErrors.day = "Birth day is required"
        } else if (isNaN(formData.day) || Number.parseInt(formData.day) < 1 || Number.parseInt(formData.day) > 31) {
            newErrors.day = "Please enter a valid day (1-31)"
        }

        if (!formData.month) newErrors.month = "Birth month is required"
        if (!formData.organizationId) newErrors.organizationId = "Organization is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle add student
    const handleAddStudent = async (e) => {
        e.preventDefault()

        if (validateForm()) {
            setIsLoading(true)
            try {
                const response = await createUserByRole(formData)

                if (response.data?.success) {
                    sendToast("success", "Student created successfully")
                    setIsAddModalOpen(false)
                    fetchStudents() // Refresh the student list
                } else {
                    sendToast("error", response.data?.message || "Failed to create student")
                }
            } catch (error) {
                console.error("Error creating student:", error)
                sendToast("error", "Failed to create student")
            } finally {
                setIsLoading(false)
            }
        }
    }

    // Handle edit student
    const handleEditStudent = async (e) => {
        e.preventDefault()

        if (validateForm() && selectedStudent) {
            setIsLoading(true)
            try {
                const response = await updateUser(selectedStudent._id, formData)

                if (response.data?.success) {
                    sendToast("success", "Student updated successfully")
                    setIsEditModalOpen(false)
                    fetchStudents() // Refresh the student list
                } else {
                    sendToast("error", response.data?.message || "Failed to update student")
                }
            } catch (error) {
                console.error("Error updating student:", error)
                sendToast("error", "Failed to update student")
            } finally {
                setIsLoading(false)
            }
        }
    }

    // Handle delete student
    const handleDeleteStudent = async () => {
        if (selectedStudent) {
            setIsLoading(true)
            try {
                const response = await deleteUser(selectedStudent._id)

                if (response.data?.success) {
                    sendToast("success", "Student deleted successfully")
                    setIsDeleteModalOpen(false)
                    fetchStudents() // Refresh the student list
                } else {
                    sendToast("error", response.data?.message || "Failed to delete student")
                }
            } catch (error) {
                console.error("Error deleting student:", error)
                sendToast("error", "Failed to delete student")
            } finally {
                setIsLoading(false)
            }
        }
    }

    // Open edit modal with student data
    const openEditModal = (student) => {
        setSelectedStudent(student)

        // Extract day and month from dateOfBirth if available
        let day = ""
        let month = ""

        if (student.dateOfBirth) {
            const date = new Date(student.dateOfBirth)
            day = date.getDate().toString()
            month = (date.getMonth() + 1).toString()
        }

        setFormData({
            firstname: student.firstname,
            lastname: student.lastname,
            email: student.email,
            day: day,
            month: month,
            course: student.course?._id || "",
            userType: "student",
            organizationId: student.organization || user?.organization?._id || "",
        })
        setIsEditModalOpen(true)
    }

    // Open delete modal
    const openDeleteModal = (student) => {
        setSelectedStudent(student)
        setIsDeleteModalOpen(true)
    }

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    // Handle select change
    const handleSelectChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination((prev) => ({ ...prev, currentPage: newPage }))
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Students</h1>
                    <p className="text-muted-foreground mt-1">Manage and organize your students</p>
                </div>
                <Button
                    onClick={() => {
                        resetFormData()
                        setIsAddModalOpen(true)
                    }}
                    className="gap-1"
                    disabled={isLoading}
                >
                    <UserPlus size={16} />
                    <span>Add Student</span>
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle>Students</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search students..."
                                    className="pl-9 w-full sm:w-64"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter size={16} />
                            </Button>
                            <Button variant="outline" size="icon">
                                <Download size={16} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-3 text-left font-medium">ID</th>
                                    <th className="p-3 text-left font-medium">Student</th>
                                    <th className="p-3 text-left font-medium hidden md:table-cell">Email</th>
                                    <th className="p-3 text-left font-medium hidden lg:table-cell">Course</th>
                                    <th className="p-3 text-left font-medium hidden lg:table-cell">Join Date</th>
                                    <th className="p-3 text-left font-medium">Status</th>
                                    <th className="p-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center">
                                            Loading students...
                                        </td>
                                    </tr>
                                ) : students.length > 0 ? (
                                    students.map((student) => (
                                        <tr onClick={() => navigate(`/dashboard/students/${student?._id}`)} key={student._id} className="border-b cursor-pointer">
                                            <td className="p-3 font-mono text-sm">{student._id.substring(0, 6)}</td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                            {student.firstname?.charAt(0)}
                                                            {student.lastname?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">
                                                            {student.firstname} {student.lastname}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground md:hidden">{student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-muted-foreground hidden md:table-cell">{student.email}</td>
                                            <td className="p-3 hidden lg:table-cell">
                                                {student.course ? (
                                                    <Badge variant="outline" className="bg-primary/5 text-primary font-normal">
                                                        {typeof student.course === "object" ? student.course.name : "Assigned"}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">Not assigned</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-muted-foreground hidden lg:table-cell">
                                                {new Date(student.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-3">
                                                <Badge variant={student.verified ? "success" : "secondary"}>
                                                    {student.verified ? "Verified" : "Pending"}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEditModal(student)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openDeleteModal(student)}>
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                            No students found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {students.length > 0 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
                                {Math.min(pagination.currentPage * 10, pagination.total)} of {pagination.total} students
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1 || isLoading}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages || isLoading}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Student Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Student</DialogTitle>
                        <DialogDescription>Fill in the details below to create a new student account.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddStudent}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstname">First Name</Label>
                                    <Input
                                        id="firstname"
                                        name="firstname"
                                        value={formData.firstname}
                                        onChange={handleChange}
                                        className={errors.firstname ? "border-red-500" : ""}
                                        placeholder="e.g., John"
                                    />
                                    {errors.firstname && <p className="text-red-500 text-xs">{errors.firstname}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastname">Last Name</Label>
                                    <Input
                                        id="lastname"
                                        name="lastname"
                                        value={formData.lastname}
                                        onChange={handleChange}
                                        className={errors.lastname ? "border-red-500" : ""}
                                        placeholder="e.g., Doe"
                                    />
                                    {errors.lastname && <p className="text-red-500 text-xs">{errors.lastname}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? "border-red-500" : ""}
                                    placeholder="e.g., student@example.com"
                                />
                                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                            </div>

                            <Label>Date of Birth</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Input
                                        id="day"
                                        name="day"
                                        placeholder="Day"
                                        value={formData.day}
                                        onChange={handleChange}
                                        className={errors.day ? "border-red-500" : ""}
                                    />
                                    {errors.day && <p className="text-red-500 text-xs">{errors.day}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Select value={formData.month} onValueChange={(value) => handleSelectChange("month", value)}>
                                        <SelectTrigger className={errors.month ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map((month) => (
                                                <SelectItem key={month.value} value={month.value}>
                                                    {month.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.month && <p className="text-red-500 text-xs">{errors.month}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="course">Course (Optional)</Label>
                                <Select value={formData.course} onValueChange={(value) => handleSelectChange("course", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course._id} value={course._id}>
                                                {course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Creating..." : "Create Student"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Student Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Student</DialogTitle>
                        <DialogDescription>Update the student information below.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditStudent}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-firstname">First Name</Label>
                                    <Input
                                        id="edit-firstname"
                                        name="firstname"
                                        value={formData.firstname}
                                        onChange={handleChange}
                                        className={errors.firstname ? "border-red-500" : ""}
                                    />
                                    {errors.firstname && <p className="text-red-500 text-xs">{errors.firstname}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-lastname">Last Name</Label>
                                    <Input
                                        id="edit-lastname"
                                        name="lastname"
                                        value={formData.lastname}
                                        onChange={handleChange}
                                        className={errors.lastname ? "border-red-500" : ""}
                                    />
                                    {errors.lastname && <p className="text-red-500 text-xs">{errors.lastname}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? "border-red-500" : ""}
                                />
                                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                            </div>

                            <Label>Date of Birth</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Input
                                        id="edit-day"
                                        name="day"
                                        placeholder="Day"
                                        value={formData.day}
                                        onChange={handleChange}
                                        className={errors.day ? "border-red-500" : ""}
                                    />
                                    {errors.day && <p className="text-red-500 text-xs">{errors.day}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Select value={formData.month} onValueChange={(value) => handleSelectChange("month", value)}>
                                        <SelectTrigger className={errors.month ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map((month) => (
                                                <SelectItem key={month.value} value={month.value}>
                                                    {month.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.month && <p className="text-red-500 text-xs">{errors.month}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-course">Course (Optional)</Label>
                                <Select value={formData.course} onValueChange={(value) => handleSelectChange("course", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course._id} value={course._id}>
                                                {course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Student Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Student</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this student? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        {selectedStudent && (
                            <>
                                <h4 className="font-medium flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    {selectedStudent.firstname} {selectedStudent.lastname}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">{selectedStudent.email}</p>
                            </>
                        )}
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteStudent} disabled={isLoading}>
                            {isLoading ? "Deleting..." : "Delete Student"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AdminStudent
