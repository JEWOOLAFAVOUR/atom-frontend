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
    FolderOpen,
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
import { Textarea } from "../../../components/ui/textarea"
import { sendToast } from "../../../components/utilis"
import useAuthStore from "../../../store/useAuthStore"
import { getCategories, createCategories, editCategories, getCourses } from "../../../api/auth"
import { getUsers } from "../../../api/auth"
import { Checkbox } from "../../../components/ui/checkbox"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Avatar } from "../../../components/ui/avatar"
import { AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"

const AdminCategory = () => {
    const { user } = useAuthStore()

    // State variables
    const [categories, setCategories] = useState([])
    const [students, setStudents] = useState([])
    const [tutors, setTutors] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isStudentsLoading, setIsStudentsLoading] = useState(false)
    const [isTutorsLoading, setIsTutorsLoading] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [studentsSearchQuery, setStudentsSearchQuery] = useState("")
    const [tutorsSearchQuery, setTutorsSearchQuery] = useState("")
    const [searchTimeout, setSearchTimeout] = useState(null)
    const [studentsSearchTimeout, setStudentsSearchTimeout] = useState(null)
    const [tutorsSearchTimeout, setTutorsSearchTimeout] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [courses, setCourses] = useState([])

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        students: [],
        tutors: [],
        course: "",
        organization: "",
    })
    const [errors, setErrors] = useState({})
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    })
    const [studentsPagination, setStudentsPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    })
    const [tutorsPagination, setTutorsPagination] = useState({
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

    // Fetch categories on component mount and when search changes
    useEffect(() => {
        fetchCategories()
    }, [pagination.currentPage])

    // Fetch students when modal opens
    useEffect(() => {
        if (isAddModalOpen || isEditModalOpen) {
            fetchStudents()
            fetchCourses()
            fetchTutors()
        }
    }, [isAddModalOpen, isEditModalOpen])

    // Debounce search input for categories
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        const timeout = setTimeout(() => {
            fetchCategories(1)
        }, 500)

        setSearchTimeout(timeout)

        return () => {
            if (searchTimeout) clearTimeout(searchTimeout)
        }
    }, [searchQuery])

    // Debounce search input for students
    useEffect(() => {
        if (studentsSearchTimeout) {
            clearTimeout(studentsSearchTimeout)
        }

        const timeout = setTimeout(() => {
            fetchStudents(1)
        }, 500)

        setStudentsSearchTimeout(timeout)

        return () => {
            if (studentsSearchTimeout) clearTimeout(studentsSearchTimeout)
        }
    }, [studentsSearchQuery])

    // Debounce search input for tutors
    useEffect(() => {
        if (tutorsSearchTimeout) {
            clearTimeout(tutorsSearchTimeout)
        }

        const timeout = setTimeout(() => {
            fetchTutors(1)
        }, 500)

        setTutorsSearchTimeout(timeout)

        return () => {
            if (tutorsSearchTimeout) clearTimeout(tutorsSearchTimeout)
        }
    }, [tutorsSearchQuery])

    // Fetch categories from API
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
                    total: response.data.total || response.data.totalCount
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

    const fetchCourses = async () => {
        try {
            const params = new URLSearchParams()
            if (user?.organization?._id) params.append("organization", user.organization._id)

            const response = await getCourses(params.toString())

            if (response.data?.success) {
                setCourses(response.data.data || [])
            } else {
                sendToast("error", response?.data?.message || "Failed to fetch courses")
            }
        } catch (error) {
            console.error("Error fetching courses:", error)
            sendToast("error", "Failed to fetch courses")
        }
    }
    // Fetch students
    const fetchStudents = async (page = studentsPagination.currentPage) => {
        setIsStudentsLoading(true)
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

            if (studentsSearchQuery) {
                params.search = studentsSearchQuery
            }

            // Make API request
            const response = await getUsers(params)

            if (response.data?.success) {
                setStudents(response.data.data)
                setStudentsPagination({
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
            setIsStudentsLoading(false)
        }
    }

    // Fetch tutors
    const fetchTutors = async (page = tutorsPagination.currentPage) => {
        setIsTutorsLoading(true)
        try {
            // Build query parameters
            const params = {
                userType: "tutor",
                page: page.toString(),
                limit: "10",
            }

            if (user?.organization?._id) {
                params.organizationId = user.organization._id
            }

            if (tutorsSearchQuery) {
                params.search = tutorsSearchQuery
            }

            // Make API request
            const response = await getUsers(params)

            if (response.data?.success) {
                setTutors(response.data.data)
                setTutorsPagination({
                    currentPage: response.data.page,
                    totalPages: response.data.totalPages,
                    total: response.data.totalCount,
                })
            } else {
                sendToast("error", response?.data?.message || "Failed to fetch tutors")
            }
        } catch (error) {
            console.error("Error fetching tutors:", error)
            sendToast("error", "Failed to fetch tutors")
        } finally {
            setIsTutorsLoading(false)
        }
    }

    // Reset form data
    const resetFormData = () => {
        setFormData({
            name: "",
            description: "",
            students: [],
            tutors: [],
            organization: user?.organization?._id || "",
        })
        setErrors({})
    }

    // Validate form
    const validateForm = () => {
        const newErrors = {}
        if (!formData.name.trim()) newErrors.name = "Category name is required"
        if (!formData.organization) newErrors.organization = "Organization is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle add category
    const handleAddCategory = async (e) => {
        e.preventDefault()

        if (validateForm()) {
            setIsLoading(true)
            try {
                const response = await createCategories(formData)

                if (response.data?.success) {
                    sendToast("success", "Category created successfully")
                    setIsAddModalOpen(false)
                    fetchCategories() // Refresh the category list
                } else {
                    sendToast("error", response.data?.message || "Failed to create category")
                }
            } catch (error) {
                console.error("Error creating category:", error)
                sendToast("error", "Failed to create category")
            } finally {
                setIsLoading(false)
            }
        }
    }

    // Handle edit category
    const handleEditCategory = async (e) => {
        e.preventDefault()

        if (validateForm() && selectedCategory) {
            setIsLoading(true)
            try {
                const response = await editCategories(formData, selectedCategory._id)

                if (response.data?.success) {
                    sendToast("success", "Category updated successfully")
                    setIsEditModalOpen(false)
                    fetchCategories() // Refresh the category list
                } else {
                    sendToast("error", response.data?.message || "Failed to update category")
                }
            } catch (error) {
                console.error("Error updating category:", error)
                sendToast("error", "Failed to update category")
            } finally {
                setIsLoading(false)
            }
        }
    }

    // Handle delete category
    const handleDeleteCategory = async () => {
        if (selectedCategory) {
            setIsLoading(true)
            try {
                const response = await editCategories({ ...selectedCategory, isDeleted: true }, selectedCategory._id)

                if (response.data?.success) {
                    sendToast("success", "Category deleted successfully")
                    setIsDeleteModalOpen(false)
                    fetchCategories() // Refresh the category list
                } else {
                    sendToast("error", response.data?.message || "Failed to delete category")
                }
            } catch (error) {
                console.error("Error deleting category:", error)
                sendToast("error", "Failed to delete category")
            } finally {
                setIsLoading(false)
            }
        }
    }

    // Open edit modal with category data
    const openEditModal = (category) => {
        setSelectedCategory(category)
        setFormData({
            name: category.name,
            description: category.description || "",
            students: category.students?.map(student => student._id || student) || [],
            tutors: category.tutors?.map(tutor => tutor._id || tutor) || [],
            organization: category.organization || user?.organization?._id || "",
        })
        setIsEditModalOpen(true)
    }

    // Open delete modal
    const openDeleteModal = (category) => {
        setSelectedCategory(category)
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

    // Handle student selection
    const handleStudentSelection = (studentId) => {
        setFormData(prev => {
            const students = [...prev.students]
            const index = students.indexOf(studentId)

            if (index === -1) {
                students.push(studentId)
            } else {
                students.splice(index, 1)
            }

            return {
                ...prev,
                students
            }
        })
    }

    // Handle tutor selection
    const handleTutorSelection = (tutorId) => {
        setFormData(prev => {
            const tutors = [...prev.tutors]
            const index = tutors.indexOf(tutorId)

            if (index === -1) {
                tutors.push(tutorId)
            } else {
                tutors.splice(index, 1)
            }

            return {
                ...prev,
                tutors
            }
        })
    }

    // Handle search input
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    // Handle students search input
    const handleStudentsSearchChange = (e) => {
        setStudentsSearchQuery(e.target.value)
    }

    // Handle tutors search input
    const handleTutorsSearchChange = (e) => {
        setTutorsSearchQuery(e.target.value)
    }

    // Handle pagination for categories
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return
        setPagination(prev => ({
            ...prev,
            currentPage: newPage
        }))
    }

    // Handle pagination for students
    const handleStudentsPageChange = (newPage) => {
        if (newPage < 1 || newPage > studentsPagination.totalPages) return
        setStudentsPagination(prev => ({
            ...prev,
            currentPage: newPage
        }))
        fetchStudents(newPage)
        fetchCourses(newPage)
    }

    // Handle pagination for tutors
    const handleTutorsPageChange = (newPage) => {
        if (newPage < 1 || newPage > tutorsPagination.totalPages) return
        setTutorsPagination(prev => ({
            ...prev,
            currentPage: newPage
        }))
        fetchTutors(newPage)
    }

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return "N/A"
        return name
            .split(" ")
            .map(part => part[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>
                    <p className="text-muted-foreground mt-1">Create and organize categories for students and tutors</p>
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
                    <span>Add Category</span>
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle>Categories</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search category..."
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
                                    <th className="p-3 text-left font-medium">Category Name</th>
                                    <th className="p-3 text-left font-medium hidden md:table-cell">Description</th>
                                    <th className="p-3 text-left font-medium">Students</th>
                                    <th className="p-3 text-left font-medium">Tutors</th>
                                    <th className="p-3 text-left font-medium">Created</th>
                                    <th className="p-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center">
                                            Loading categories...
                                        </td>
                                    </tr>
                                ) : categories.length > 0 ? (
                                    categories.map((category) => (
                                        <tr key={category._id} className="border-b">
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <FolderOpen className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{category.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-muted-foreground hidden md:table-cell">
                                                {category.description
                                                    ? (category.description.length > 60
                                                        ? `${category.description.substring(0, 60)}...`
                                                        : category.description)
                                                    : "No description available"}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center">
                                                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                                                    <span>{category.students?.length || 0}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center">
                                                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                                                    <span>{category.tutors?.length || 0}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {new Date(category.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-3 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEditModal(category)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openDeleteModal(category)}>
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
                                        <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                            No categories found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {categories.length > 0 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.total)}{" "}
                                of {pagination.total} categories
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

            {/* Add Category Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>Create a new category and assign students and tutors.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddCategory}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Category Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={errors.name ? "border-red-500" : ""}
                                    placeholder="e.g., Mathematics Group"
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
                                    placeholder="Brief description of the category"
                                    rows={3}
                                />
                            </div>

                            <div className={`grid grid-cols-1 gap-2`}>
                                <Label htmlFor="description">Course</Label>
                                <Select
                                    value={formData.course}
                                    onValueChange={(value) => setFormData({ ...formData, course: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course?._id} value={course?._id}>
                                                {course?.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Tabs defaultValue="students" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="students">Students</TabsTrigger>
                                    <TabsTrigger value="tutors">Tutors</TabsTrigger>
                                </TabsList>

                                <TabsContent value="students" className="mt-4 border rounded-md p-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium">Assign Students</h4>
                                            <div className="relative w-64">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="search"
                                                    placeholder="Search students..."
                                                    className="pl-9"
                                                    value={studentsSearchQuery}
                                                    onChange={handleStudentsSearchChange}
                                                />
                                            </div>
                                        </div>

                                        <ScrollArea className="h-60 rounded-md border">
                                            {isStudentsLoading ? (
                                                <div className="p-4 text-center">Loading students...</div>
                                            ) : students.length > 0 ? (
                                                <div className="p-4 space-y-2">
                                                    {students.map((student) => (
                                                        <div key={student._id} className="flex items-center justify-between py-2 px-1 hover:bg-muted/50 rounded-md">
                                                            <div className="flex items-center space-x-3">
                                                                <Avatar className="h-8 w-8">
                                                                    {student.profilePicture ? (
                                                                        <AvatarImage src={student.profilePicture} />
                                                                    ) : (
                                                                        <AvatarFallback>{getInitials(student.fullName || student.firstname + " " + student.lastname)}</AvatarFallback>
                                                                    )}
                                                                </Avatar>
                                                                <div>
                                                                    <p className="text-sm font-medium">{student.fullName || `${student.firstname} ${student.lastname}`}</p>
                                                                    <p className="text-xs text-muted-foreground">{student.email}</p>
                                                                </div>
                                                            </div>
                                                            <Checkbox
                                                                checked={formData.students.includes(student._id)}
                                                                onCheckedChange={() => handleStudentSelection(student._id)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 text-center text-muted-foreground">
                                                    No students found.
                                                </div>
                                            )}
                                        </ScrollArea>

                                        {students.length > 0 && (
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStudentsPageChange(studentsPagination.currentPage - 1)}
                                                    disabled={studentsPagination.currentPage === 1 || isStudentsLoading}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <span className="text-sm">
                                                    Page {studentsPagination.currentPage} of {studentsPagination.totalPages}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStudentsPageChange(studentsPagination.currentPage + 1)}
                                                    disabled={studentsPagination.currentPage === studentsPagination.totalPages || isStudentsLoading}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        <div className="text-sm text-muted-foreground">
                                            Selected: {formData.students.length} students
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="tutors" className="mt-4 border rounded-md p-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium">Assign Tutors</h4>
                                            <div className="relative w-64">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="search"
                                                    placeholder="Search tutors..."
                                                    className="pl-9"
                                                    value={tutorsSearchQuery}
                                                    onChange={handleTutorsSearchChange}
                                                />
                                            </div>
                                        </div>

                                        <ScrollArea className="h-60 rounded-md border">
                                            {isTutorsLoading ? (
                                                <div className="p-4 text-center">Loading tutors...</div>
                                            ) : tutors.length > 0 ? (
                                                <div className="p-4 space-y-2">
                                                    {tutors.map((tutor) => (
                                                        <div key={tutor._id} className="flex items-center justify-between py-2 px-1 hover:bg-muted/50 rounded-md">
                                                            <div className="flex items-center space-x-3">
                                                                <Avatar className="h-8 w-8">
                                                                    {tutor.profilePicture ? (
                                                                        <AvatarImage src={tutor.profilePicture} />
                                                                    ) : (
                                                                        <AvatarFallback>{getInitials(tutor.fullName || tutor.firstname + " " + tutor.lastname)}</AvatarFallback>
                                                                    )}
                                                                </Avatar>
                                                                <div>
                                                                    <p className="text-sm font-medium">{tutor.fullName || `${tutor.firstname} ${tutor.lastname}`}</p>
                                                                    <p className="text-xs text-muted-foreground">{tutor.email}</p>
                                                                </div>
                                                            </div>
                                                            <Checkbox
                                                                // checked={formData.tutors.includes(tutor._id)}
                                                                // onCheckedChange={() => handleTutorSelection(tutor._id)}

                                                                checked={formData.tutors.includes(tutor._id)}
                                                                onCheckedChange={() => handleTutorSelection(tutor._id)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 text-center text-muted-foreground">
                                                    No tutors found.
                                                </div>
                                            )}
                                        </ScrollArea>

                                        {tutors.length > 0 && (
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleTutorsPageChange(tutorsPagination.currentPage - 1)}
                                                    disabled={tutorsPagination.currentPage === 1 || isTutorsLoading}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <span className="text-sm">
                                                    Page {tutorsPagination.currentPage} of {tutorsPagination.totalPages}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleTutorsPageChange(tutorsPagination.currentPage + 1)}
                                                    disabled={tutorsPagination.currentPage === tutorsPagination.totalPages || isTutorsLoading}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        <div className="text-sm text-muted-foreground">
                                            Selected: {formData.tutors.length} tutors
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Creating..." : "Create Category"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Category Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>Update category information and assigned members.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditCategory}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Category Name</Label>
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

                            <div className={`grid grid-cols-1 gap-2`}>
                                <Label htmlFor="description">Course</Label>
                                <Select
                                    value={formData.course}
                                    onValueChange={(value) => setFormData({ ...formData, course: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course?._id} value={course?._id}>
                                                {course?.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Tabs defaultValue="students" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="students">Students</TabsTrigger>
                                    <TabsTrigger value="tutors">Tutors</TabsTrigger>
                                </TabsList>

                                <TabsContent value="students" className="mt-4 border rounded-md p-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium">Manage Students</h4>
                                            <div className="relative w-64">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="search"
                                                    placeholder="Search students..."
                                                    className="pl-9"
                                                    value={studentsSearchQuery}
                                                    onChange={handleStudentsSearchChange}
                                                />
                                            </div>
                                        </div>

                                        <ScrollArea className="h-60 rounded-md border">
                                            {isStudentsLoading ? (
                                                <div className="p-4 text-center">Loading students...</div>
                                            ) : students.length > 0 ? (
                                                <div className="p-4 space-y-2">
                                                    {students.map((student) => (
                                                        <div key={student._id} className="flex items-center justify-between py-2 px-1 hover:bg-muted/50 rounded-md">
                                                            <div className="flex items-center space-x-3">
                                                                <Avatar className="h-8 w-8">
                                                                    {student.profilePicture ? (
                                                                        <AvatarImage src={student.profilePicture} />
                                                                    ) : (
                                                                        <AvatarFallback>{getInitials(student.fullName || student.firstname + " " + student.lastname)}</AvatarFallback>
                                                                    )}
                                                                </Avatar>
                                                                <div>
                                                                    <p className="text-sm font-medium">{student.fullName || `${student.firstname} ${student.lastname}`}</p>
                                                                    <p className="text-xs text-muted-foreground">{student.email}</p>
                                                                </div>
                                                            </div>
                                                            <Checkbox
                                                                checked={formData.students.includes(student._id)}
                                                                onCheckedChange={() => handleStudentSelection(student._id)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 text-center text-muted-foreground">
                                                    No students found.
                                                </div>
                                            )}
                                        </ScrollArea>

                                        {students.length > 0 && (
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStudentsPageChange(studentsPagination.currentPage - 1)}
                                                    disabled={studentsPagination.currentPage === 1 || isStudentsLoading}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <span className="text-sm">
                                                    Page {studentsPagination.currentPage} of {studentsPagination.totalPages}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStudentsPageChange(studentsPagination.currentPage + 1)}
                                                    disabled={studentsPagination.currentPage === studentsPagination.totalPages || isStudentsLoading}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        <div className="text-sm text-muted-foreground">
                                            Selected: {formData.students.length} students
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="tutors" className="mt-4 border rounded-md p-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium">Manage Tutors</h4>
                                            <div className="relative w-64">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="search"
                                                    placeholder="Search tutors..."
                                                    className="pl-9"
                                                    value={tutorsSearchQuery}
                                                    onChange={handleTutorsSearchChange}
                                                />
                                            </div>
                                        </div>

                                        <ScrollArea className="h-60 rounded-md border">
                                            {isTutorsLoading ? (
                                                <div className="p-4 text-center">Loading tutors...</div>
                                            ) : tutors.length > 0 ? (
                                                <div className="p-4 space-y-2">
                                                    {tutors.map((tutor) => (
                                                        <div key={tutor._id} className="flex items-center justify-between py-2 px-1 hover:bg-muted/50 rounded-md">
                                                            <div className="flex items-center space-x-3">
                                                                <Avatar className="h-8 w-8">
                                                                    {tutor.profilePicture ? (
                                                                        <AvatarImage src={tutor.profilePicture} />
                                                                    ) : (
                                                                        <AvatarFallback>{getInitials(tutor.fullName || tutor.firstname + " " + tutor.lastname)}</AvatarFallback>
                                                                    )}
                                                                </Avatar>
                                                                <div>
                                                                    <p className="text-sm font-medium">{tutor.fullName || `${tutor.firstname} ${tutor.lastname}`}</p>
                                                                    <p className="text-xs text-muted-foreground">{tutor.email}</p>
                                                                </div>
                                                            </div>
                                                            <Checkbox
                                                                checked={formData.tutors.includes(tutor._id)}
                                                                onCheckedChange={() => handleTutorSelection(tutor._id)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 text-center text-muted-foreground">
                                                    No tutors found.
                                                </div>
                                            )}
                                        </ScrollArea>

                                        {tutors.length > 0 && (
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleTutorsPageChange(tutorsPagination.currentPage - 1)}
                                                    disabled={tutorsPagination.currentPage === 1 || isTutorsLoading}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <span className="text-sm">
                                                    Page {tutorsPagination.currentPage} of {tutorsPagination.totalPages}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleTutorsPageChange(tutorsPagination.currentPage + 1)}
                                                    disabled={tutorsPagination.currentPage === tutorsPagination.totalPages || isTutorsLoading}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        <div className="text-sm text-muted-foreground">
                                            Selected: {formData.tutors.length} tutors
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
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

            {/* Delete Category Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this category? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        {selectedCategory && (
                            <>
                                <h4 className="font-medium flex items-center gap-2">
                                    <FolderOpen className="h-4 w-4" />
                                    {selectedCategory.name}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedCategory.description || "No description available"}
                                </p>
                                <div className="mt-2 text-sm flex flex-wrap gap-2">
                                    <div className="flex items-center">
                                        <Users className="h-3 w-3 mr-1" />
                                        <span>{selectedCategory.students?.length || 0} students</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="h-3 w-3 mr-1" />
                                        <span>{selectedCategory.tutors?.length || 0} tutors</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteCategory} disabled={isLoading}>
                            {isLoading ? "Deleting..." : "Delete Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AdminCategory