import { useState, useEffect } from "react"
import {
    Search,
    Plus,
    MoreHorizontal,
    Download,
    Filter,
    ChevronLeft,
    ChevronRight,
    Trash,
    Edit,
    Users,
    BookOpen,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Textarea } from "../../../components/ui/textarea"
import { sendToast } from "../../../components/utilis"
import useAuthStore from "../../../store/useAuthStore"
import { getCourses, createCourse, updateCourse, deleteCourse } from "../../../api/auth";
import { CourseActionMenu } from "../../../components/template/ActionMenu"


const AdminCourse = () => {
    const { user } = useAuthStore()

    // State variables
    const [courses, setCourses] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchTimeout, setSearchTimeout] = useState(null)
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        organization: "",
    })
    const [errors, setErrors] = useState({})
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    })

    // Initialize organization ID from authenticated user
    useEffect(() => {
        if (user?.organization?._id) {
            setFormData(prev => ({
                ...prev,
                organization: user.organization._id
            }))
        }
    }, [user])

    // Fetch courses on component mount and when search changes
    useEffect(() => {
        fetchCourses()
    }, [pagination.currentPage])

    // Debounce search input to prevent excessive API calls
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        const timeout = setTimeout(() => {
            fetchCourses(1)
        }, 500)

        setSearchTimeout(timeout)

        return () => {
            if (searchTimeout) clearTimeout(searchTimeout)
        }
    }, [searchQuery])

    // Fetch courses from API
    const fetchCourses = async (page = pagination.currentPage) => {
        setIsLoading(true)
        try {
            // Build query parameters
            const params = new URLSearchParams()
            if (page) params.append('page', page.toString())
            if (user?.organization?._id) params.append('organization', user.organization._id)
            if (searchQuery) params.append('search', searchQuery)

            // Make API request
            const response = await getCourses(params.toString())

            console.log('resposne from get courses', response)

            if (response.data?.success) {
                setCourses(response.data.data)
                setPagination({
                    currentPage: response.data.currentPage,
                    totalPages: response.data.totalPages,
                    total: response.data.total
                })
            } else {
                sendToast("error", response?.data?.message)
            }
        } catch (error) {
            console.error("Error fetching courses:", error)
            sendToast("error", "Failed to fetch courses")
        } finally {
            setIsLoading(false)
        }
    }

    // Reset form data
    const resetFormData = () => {
        setFormData({
            name: "",
            description: "",
            organization: user?.organization?._id || "",
        })
        setErrors({})
    }

    // Validate form
    const validateForm = () => {
        const newErrors = {}
        if (!formData.name.trim()) newErrors.name = "Course name is required"
        if (!formData.organization) newErrors.organization = "Organization is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle add course
    const handleAddCourse = async (e) => {
        e.preventDefault()

        if (validateForm()) {
            setIsLoading(true)
            try {
                const response = await createCourse(formData)

                if (response.data?.success) {
                    sendToast("success", "Course created successfully")
                    setIsAddModalOpen(false)
                    fetchCourses() // Refresh the course list
                } else {
                    sendToast("error", response.data?.message || "Failed to create course")
                }
            } catch (error) {
                console.error("Error creating course:", error)
                sendToast("error", "Failed to create course")
            } finally {
                setIsLoading(false)
            }
        }
    }

    // Handle edit course
    const handleEditCourse = async (e) => {
        e.preventDefault()

        if (validateForm() && selectedCourse) {
            setIsLoading(true)
            try {
                const response = await updateCourse(selectedCourse._id, formData)

                if (response.data?.success) {
                    sendToast("success", "Course updated successfully")
                    setIsEditModalOpen(false)
                    fetchCourses() // Refresh the course list
                } else {
                    sendToast("error", response.data?.message || "Failed to update course")
                }
            } catch (error) {
                console.error("Error updating course:", error)
                sendToast("error", "Failed to update course")
            } finally {
                setIsLoading(false)
            }
        }
    }

    // Handle delete course
    const handleDeleteCourse = async () => {
        if (selectedCourse) {
            setIsLoading(true)
            try {
                const response = await deleteCourse(selectedCourse._id)

                if (response.data?.success) {
                    sendToast("success", "Course deleted successfully")
                    setIsDeleteModalOpen(false)
                    fetchCourses() // Refresh the course list
                } else {
                    sendToast("error", response.data?.message || "Failed to delete course")
                }
            } catch (error) {
                console.error("Error deleting course:", error)
                sendToast("error", "Failed to delete course")
            } finally {
                setIsLoading(false)
            }
        }
    }

    // Open edit modal with course data
    const openEditModal = (course) => {
        setSelectedCourse(course)
        setFormData({
            name: course.name,
            description: course.description || "",
            organization: course.organization || user?.organization?._id || "",
        })
        setIsEditModalOpen(true)
    }

    // Open delete modal
    const openDeleteModal = (course) => {
        setSelectedCourse(course)
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

    // Handle search input
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    // Handle pagination
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return
        setPagination(prev => ({
            ...prev,
            currentPage: newPage
        }))
    }

    // Get status badge variant (adapt to your data structure)
    const getStatusBadge = (course) => {
        // This is a placeholder - adapt based on your actual data structure
        const status = course.status || "Active"
        switch (status) {
            case "Active":
                return "success"
            case "Upcoming":
                return "warning"
            case "Completed":
                return "secondary"
            default:
                return "outline"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Courses</h1>
                    <p className="text-muted-foreground mt-1">Manage and organize your courses</p>
                </div>
                <Button
                    onClick={() => {
                        resetFormData()
                        setIsAddModalOpen(true)
                    }}
                    className="gap-1"
                    disabled={isLoading}
                >
                    <Plus size={16} />
                    <span>Add Course</span>
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle>Courses</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search course..."
                                    className="pl-9 w-full sm:w-64"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
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
                                    <th className="p-3 text-left font-medium">Course Name</th>
                                    <th className="p-3 text-left font-medium hidden md:table-cell">Description</th>
                                    <th className="p-3 text-left font-medium">Created</th>
                                    <th className="p-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center">
                                            Loading courses...
                                        </td>
                                    </tr>
                                ) : courses.length > 0 ? (
                                    courses.map((course) => (
                                        <tr key={course._id} className="border-b">
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <BookOpen className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{course.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-muted-foreground hidden md:table-cell">
                                                {course.description
                                                    ? (course.description.length > 60
                                                        ? `${course.description.substring(0, 60)}...`
                                                        : course.description)
                                                    : "No description available"}
                                            </td>
                                            <td className="p-3">
                                                {new Date(course.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-3 text-right">
                                                <CourseActionMenu
                                                    onEdit={() => openEditModal(course)}
                                                    onDelete={() => openDeleteModal(course)}
                                                />
                                                {/* <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEditModal(course)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openDeleteModal(course)}>
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu> */}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                            No courses found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {courses.length > 0 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.total)}{" "}
                                of {pagination.total} courses
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

            {/* Add Course Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Course</DialogTitle>
                        <DialogDescription>Fill in the details below to create a new course.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddCourse}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Course Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={errors.name ? "border-red-500" : ""}
                                    placeholder="e.g., Web Development Fundamentals"
                                />
                                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Brief description of the course"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Creating..." : "Create Course"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Course Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Course</DialogTitle>
                        <DialogDescription>Update the course information below.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditCourse}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Course Name</Label>
                                <Input
                                    id="edit-name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={errors.name ? "border-red-500" : ""}
                                />
                                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                />
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

            {/* Delete Course Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Course</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this course? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        {selectedCourse && (
                            <>
                                <h4 className="font-medium flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    {selectedCourse.name}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedCourse.description || "No description available"}
                                </p>
                            </>
                        )}
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteCourse} disabled={isLoading}>
                            {isLoading ? "Deleting..." : "Delete Course"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AdminCourse;
