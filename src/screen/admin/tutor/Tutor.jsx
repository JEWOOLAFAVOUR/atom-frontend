"use client"

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

const AdminTutor = () => {
    const { user } = useAuthStore()

    // State variables
    const [tutors, setTutors] = useState([])
    const [courses, setCourses] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchTimeout, setSearchTimeout] = useState(null)
    const [selectedTutor, setSelectedTutor] = useState(null)
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        day: "",
        month: "",
        course: "",
        userType: "tutor", // Set userType to tutor
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

    // Fetch tutors on component mount and when search changes
    useEffect(() => {
        fetchTutors()
        fetchCourses()
    }, [pagination.currentPage])

    // Debounce search input to prevent excessive API calls
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        const timeout = setTimeout(() => {
            fetchTutors(1)
        }, 500)

        setSearchTimeout(timeout)

        return () => {
            if (searchTimeout) clearTimeout(searchTimeout)
        }
    }, [searchQuery])

    // Fetch tutors from API
    const fetchTutors = async (page = pagination.currentPage) => {
        setIsLoading(true)
        try {
            // Build query parameters
            const params = {
                userType: "tutor", // Set userType to tutor
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
                setTutors(response.data.data)
                setPagination({
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
            userType: "tutor", // Set userType to tutor
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

    // Handle add tutor
    const handleAddTutor = async (e) => {
        e.preventDefault()

        if (validateForm()) {
            setIsLoading(true)
            try {
                const response = await createUserByRole(formData)

                if (response.data?.success) {
                    sendToast("success", "Tutor created successfully")
                    setIsAddModalOpen(false)
                    fetchTutors() // Refresh the tutor list
                } else {
                    sendToast("error", response.data?.message || "Failed to create tutor")
                }
            } catch (error) {
                console.error("Error creating tutor:", error)
                sendToast("error", "Failed to create tutor")
            } finally {
                setIsLoading(false)
            }
        }
    }

    // Handle edit tutor
    const handleEditTutor = async (e) => {
        e.preventDefault()

        if (validateForm() && selectedTutor) {
            setIsLoading(true)
            try {
                const response = await updateUser(selectedTutor._id, formData)

                if (response.data?.success) {
                    sendToast("success", "Tutor updated successfully")
                    setIsEditModalOpen(false)
                    fetchTutors() // Refresh the tutor list
                } else {
                    sendToast("error", response.data?.message || "Failed to update tutor")
                }
            } catch (error) {
                console.error("Error updating tutor:", error)
                sendToast("error", "Failed to update tutor")
            } finally {
                setIsLoading(false)
            }
        }
    }

    // Handle delete tutor
    const handleDeleteTutor = async () => {
        if (selectedTutor) {
            setIsLoading(true)
            try {
                const response = await deleteUser(selectedTutor._id)

                if (response.data?.success) {
                    sendToast("success", "Tutor deleted successfully")
                    setIsDeleteModalOpen(false)
                    fetchTutors() // Refresh the tutor list
                } else {
                    sendToast("error", response.data?.message || "Failed to delete tutor")
                }
            } catch (error) {
                console.error("Error deleting tutor:", error)
                sendToast("error", "Failed to delete tutor")
            } finally {
                setIsLoading(false)
            }
        }
    }

    // Open edit modal with tutor data
    const openEditModal = (tutor) => {
        setSelectedTutor(tutor)

        // Extract day and month from dateOfBirth if available
        let day = ""
        let month = ""

        if (tutor.dateOfBirth) {
            const date = new Date(tutor.dateOfBirth)
            day = date.getDate().toString()
            month = (date.getMonth() + 1).toString()
        }

        setFormData({
            firstname: tutor.firstname,
            lastname: tutor.lastname,
            email: tutor.email,
            day: day,
            month: month,
            course: tutor.course?._id || "",
            userType: "tutor",
            organizationId: tutor.organization || user?.organization?._id || "",
        })
        setIsEditModalOpen(true)
    }

    // Open delete modal
    const openDeleteModal = (tutor) => {
        setSelectedTutor(tutor)
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
                    <h1 className="text-3xl font-bold tracking-tight">Manage Tutors</h1>
                    <p className="text-muted-foreground mt-1">Manage and organize your tutors</p>
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
                    <span>Add Tutor</span>
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle>Tutors</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search tutors..."
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
                                    <th className="p-3 text-left font-medium">Tutor Name</th>
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
                                        <td colSpan={6} className="p-4 text-center">
                                            Loading tutors...
                                        </td>
                                    </tr>
                                ) : tutors.length > 0 ? (
                                    tutors.map((tutor) => (
                                        <tr key={tutor._id} className="border-b">
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                            {tutor.firstname?.charAt(0)}
                                                            {tutor.lastname?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">
                                                            {tutor.firstname} {tutor.lastname}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground md:hidden">{tutor.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-muted-foreground hidden md:table-cell">{tutor.email}</td>
                                            <td className="p-3 hidden lg:table-cell">
                                                {tutor.course ? (
                                                    <Badge variant="outline" className="bg-primary/5 text-primary font-normal">
                                                        {typeof tutor.course === "object" ? tutor.course.name : "Assigned"}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">Not assigned</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-muted-foreground hidden lg:table-cell">
                                                {new Date(tutor.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-3">
                                                <Badge variant={tutor.verified ? "success" : "secondary"}>
                                                    {tutor.verified ? "Verified" : "Pending"}
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
                                                        <DropdownMenuItem onClick={() => openEditModal(tutor)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openDeleteModal(tutor)}>
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
                                            No tutors found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {tutors.length > 0 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
                                {Math.min(pagination.currentPage * 10, pagination.total)} of {pagination.total} tutors
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

            {/* Add Tutor Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Tutor</DialogTitle>
                        <DialogDescription>Fill in the details below to create a new tutor account.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddTutor}>
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
                                    placeholder="e.g., tutor@example.com"
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
                                {isLoading ? "Creating..." : "Create Tutor"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Tutor Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Tutor</DialogTitle>
                        <DialogDescription>Update the tutor information below.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditTutor}>
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

            {/* Delete Tutor Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Tutor</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this tutor? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        {selectedTutor && (
                            <>
                                <h4 className="font-medium flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    {selectedTutor.firstname} {selectedTutor.lastname}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">{selectedTutor.email}</p>
                            </>
                        )}
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteTutor} disabled={isLoading}>
                            {isLoading ? "Deleting..." : "Delete Tutor"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AdminTutor



// import { useState, useEffect } from "react";
// import {
//     Search,
//     Plus,
//     MoreHorizontal,
//     Download,
//     Filter,
//     ChevronLeft,
//     ChevronRight,
//     Calendar,
//     Mail,
//     Check,
//     Trash,
//     Edit,
//     X,
//     User,
//     UserPlus,
//     Users
// } from "lucide-react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
// import { Button } from "../../../components/ui/button";
// import { Input } from "../../../components/ui/input";
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger
// } from "../../../components/ui/dropdown-menu";
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "../../../components/ui/dialog";
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from "../../../components/ui/form";
// import { Label } from "../../../components/ui/label";
// import { Badge } from "../../../components/ui/badge";
// import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
// import { Separator } from "../../../components/ui/separator";
// import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
// // import { ToastAction } from "../../../components/ui/toast";
// // import { useToast } from "../../../components/ui/use-sonner";
// import { sendToast } from "../../../components/utilis";

// const AdminTutor = () => {
//     // Mock data for initial students
//     const [students, setStudents] = useState([
//         {
//             id: "20001",
//             firstName: "Emma",
//             lastName: "Johnson",
//             email: "emma@example.com",
//             birthDay: "12",
//             birthMonth: "5",
//             course: "Web Development",
//             joinDate: "March 10, 2025",
//             status: "Active"
//         },
//         {
//             id: "20002",
//             firstName: "Michael",
//             lastName: "Chen",
//             email: "michael@example.com",
//             birthDay: "24",
//             birthMonth: "8",
//             course: "Data Science",
//             joinDate: "February 18, 2025",
//             status: "Active"
//         },
//         {
//             id: "20003",
//             firstName: "Sophia",
//             lastName: "Rodriguez",
//             email: "sophia@example.com",
//             birthDay: "3",
//             birthMonth: "11",
//             course: "UX Design",
//             joinDate: "January 5, 2025",
//             status: "Inactive"
//         },
//         {
//             id: "20004",
//             firstName: "James",
//             lastName: "Wilson",
//             email: "james@example.com",
//             birthDay: "19",
//             birthMonth: "2",
//             course: "Mobile Development",
//             joinDate: "March 22, 2025",
//             status: "Active"
//         },
//         {
//             id: "20005",
//             firstName: "Olivia",
//             lastName: "Smith",
//             email: "olivia@example.com",
//             birthDay: "7",
//             birthMonth: "6",
//             course: "Web Development",
//             joinDate: "January 15, 2025",
//             status: "Active"
//         },
//     ]);

//     // Courses data
//     const courses = [
//         { id: 1, name: "Web Development" },
//         { id: 2, name: "Data Science" },
//         { id: 3, name: "UX Design" },
//         { id: 4, name: "Mobile Development" },
//         { id: 5, name: "Machine Learning" },
//         { id: 6, name: "Digital Marketing" },
//         { id: 7, name: "Game Development" },
//         { id: 8, name: "Cloud Computing" },
//     ];

//     // Toast hook for notifications
//     // const { toast } = useToast();

//     // States for modals and form data
//     const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//     const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [formData, setFormData] = useState({
//         firstName: "",
//         lastName: "",
//         email: "",
//         birthDay: "",
//         birthMonth: "",
//         course: "",
//     });
//     const [errors, setErrors] = useState({});
//     const [page, setPage] = useState(1);
//     const studentsPerPage = 5;

//     // Month names for dropdown
//     const months = [
//         { value: "1", label: "January" },
//         { value: "2", label: "February" },
//         { value: "3", label: "March" },
//         { value: "4", label: "April" },
//         { value: "5", label: "May" },
//         { value: "6", label: "June" },
//         { value: "7", label: "July" },
//         { value: "8", label: "August" },
//         { value: "9", label: "September" },
//         { value: "10", label: "October" },
//         { value: "11", label: "November" },
//         { value: "12", label: "December" },
//     ];

//     // Filter students based on search query
//     const filteredStudents = students.filter(student =>
//         student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         student.id.includes(searchQuery)
//     );

//     // Pagination
//     const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
//     const paginatedStudents = filteredStudents.slice(
//         (page - 1) * studentsPerPage,
//         page * studentsPerPage
//     );

//     // Reset form data
//     const resetFormData = () => {
//         setFormData({
//             firstName: "",
//             lastName: "",
//             email: "",
//             birthDay: "",
//             birthMonth: "",
//             course: "",
//         });
//         setErrors({});
//     };

//     // Validate form
//     const validateForm = () => {
//         const newErrors = {};
//         if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
//         if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!formData.email.trim()) {
//             newErrors.email = "Email is required";
//         } else if (!emailRegex.test(formData.email)) {
//             newErrors.email = "Please enter a valid email";
//         }

//         if (!formData.birthDay.trim()) {
//             newErrors.birthDay = "Birth day is required";
//         } else if (isNaN(formData.birthDay) || parseInt(formData.birthDay) < 1 || parseInt(formData.birthDay) > 31) {
//             newErrors.birthDay = "Please enter a valid day (1-31)";
//         }

//         if (!formData.birthMonth) newErrors.birthMonth = "Birth month is required";
//         if (!formData.course) newErrors.course = "Course is required";

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     // Handle add student
//     const handleAddStudent = (e) => {
//         e.preventDefault();

//         if (validateForm()) {
//             // Generate new student ID (last ID + 1)
//             const lastId = parseInt(students[students.length - 1].id);
//             const newId = (lastId + 1).toString();

//             // Get current date
//             const today = new Date();
//             const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//             const joinDate = `${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

//             // Create new student object
//             const newStudent = {
//                 id: newId,
//                 firstName: formData.firstName,
//                 lastName: formData.lastName,
//                 email: formData.email,
//                 birthDay: formData.birthDay,
//                 birthMonth: formData.birthMonth,
//                 course: formData.course,
//                 joinDate,
//                 status: "Active",
//             };

//             // Add to students array
//             setStudents([...students, newStudent]);

//             // Reset form and close modal
//             resetFormData();
//             setIsAddModalOpen(false);

//             // Show success modal
//             setIsSuccessModalOpen(true);

//             // Show toast notification
//             sendToast('success', "Student Created Successfully")
//             // toast({
//             //     title: "Student Created Successfully",
//             //     description: "The student account has been created and login details sent.",
//             //     action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
//             // });
//         }
//     };

//     // Handle edit student
//     const handleEditStudent = (e) => {
//         e.preventDefault();

//         if (validateForm() && selectedStudent) {
//             // Update student in array
//             const updatedStudents = students.map(student => {
//                 if (student.id === selectedStudent.id) {
//                     return {
//                         ...student,
//                         firstName: formData.firstName,
//                         lastName: formData.lastName,
//                         email: formData.email,
//                         birthDay: formData.birthDay,
//                         birthMonth: formData.birthMonth,
//                         course: formData.course,
//                     };
//                 }
//                 return student;
//             });

//             setStudents(updatedStudents);

//             // Reset form and close modal
//             resetFormData();
//             setIsEditModalOpen(false);

//             // Show toast notification
//             sendToast('success', "Student Updated Successfully")

//             // toast({
//             //     title: "Student Updated",
//             //     description: "The student information has been updated successfully.",
//             //     action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
//             // });
//         }
//     };

//     // Handle delete student
//     const handleDeleteStudent = () => {
//         if (selectedStudent) {
//             // Filter out the selected student
//             const updatedStudents = students.filter(student => student.id !== selectedStudent.id);

//             setStudents(updatedStudents);

//             // Close modal
//             setIsDeleteModalOpen(false);

//             // Show toast notification
//             sendToast('success', "Student Deleted Successfully")


//             // toast({
//             //     title: "Student Deleted",
//             //     description: "The student has been removed from the system.",
//             //     action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
//             // });
//         }
//     };

//     // Open edit modal with student data
//     const openEditModal = (student) => {
//         setSelectedStudent(student);
//         setFormData({
//             firstName: student.firstName,
//             lastName: student.lastName,
//             email: student.email,
//             birthDay: student.birthDay,
//             birthMonth: student.birthMonth,
//             course: student.course,
//         });
//         setIsEditModalOpen(true);
//     };

//     // Open delete modal
//     const openDeleteModal = (student) => {
//         setSelectedStudent(student);
//         setIsDeleteModalOpen(true);
//     };

//     // Handle input change
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({
//             ...formData,
//             [name]: value,
//         });
//     };

//     // Handle select change
//     const handleSelectChange = (name, value) => {
//         setFormData({
//             ...formData,
//             [name]: value,
//         });
//     };

//     return (
//         <div className="space-y-6">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                 <div>
//                     <h1 className="text-3xl font-bold tracking-tight">Manage Tutors</h1>
//                     <p className="text-muted-foreground mt-1">Manage and organize your tutors</p>
//                 </div>
//                 <Button onClick={() => {
//                     resetFormData();
//                     setIsAddModalOpen(true);
//                 }} className="gap-1">
//                     <UserPlus size={16} />
//                     <span>Add Tutor</span>
//                 </Button>
//             </div>

//             <Card className="shadow-sm">
//                 <CardHeader className="pb-3">
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                         <CardTitle>Tutors</CardTitle>
//                         <div className="flex items-center gap-2">
//                             <div className="relative">
//                                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                                 <Input
//                                     type="search"
//                                     placeholder="Search tutors..."
//                                     className="pl-9 w-full sm:w-64"
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                 />
//                             </div>
//                             <Button variant="outline" size="icon">
//                                 <Filter size={16} />
//                             </Button>
//                             <Button variant="outline" size="icon">
//                                 <Download size={16} />
//                             </Button>
//                         </div>
//                     </div>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="rounded-md border">
//                         <table className="w-full">
//                             <thead>
//                                 <tr className="border-b bg-muted/50">
//                                     <th className="p-3 text-left font-medium">Tutor Name</th>
//                                     <th className="p-3 text-left font-medium hidden md:table-cell">Email</th>
//                                     <th className="p-3 text-left font-medium hidden lg:table-cell">Course</th>
//                                     <th className="p-3 text-left font-medium hidden lg:table-cell">Join Date</th>
//                                     <th className="p-3 text-left font-medium">Status</th>
//                                     <th className="p-3 text-right font-medium">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {paginatedStudents.length > 0 ? (
//                                     paginatedStudents.map((student) => (
//                                         <tr key={student.id} className="border-b">
//                                             <td className="p-3">
//                                                 <div className="flex items-center gap-3">

//                                                     <div>
//                                                         <div className="font-medium">{student.firstName} {student.lastName}</div>
//                                                         <div className="text-sm text-muted-foreground md:hidden">{student.email}</div>
//                                                     </div>
//                                                 </div>
//                                             </td>
//                                             <td className="p-3 text-muted-foreground hidden md:table-cell">{student.email}</td>
//                                             <td className="p-3 hidden lg:table-cell">
//                                                 <Badge variant="outline" className="bg-primary/5 text-primary font-normal">
//                                                     {student.course}
//                                                 </Badge>
//                                             </td>
//                                             <td className="p-3 text-muted-foreground hidden lg:table-cell">{student.joinDate}</td>
//                                             <td className="p-3">
//                                                 <Badge variant={student.status === "Active" ? "success" : "secondary"}>
//                                                     {student.status}
//                                                 </Badge>
//                                             </td>
//                                             <td className="p-3 text-right">
//                                                 <DropdownMenu>
//                                                     <DropdownMenuTrigger asChild>
//                                                         <Button variant="ghost" size="icon">
//                                                             <MoreHorizontal className="h-4 w-4" />
//                                                         </Button>
//                                                     </DropdownMenuTrigger>
//                                                     <DropdownMenuContent align="end">
//                                                         <DropdownMenuItem onClick={() => openEditModal(student)}>
//                                                             <Edit className="mr-2 h-4 w-4" />
//                                                             Edit
//                                                         </DropdownMenuItem>
//                                                         <DropdownMenuItem onClick={() => openDeleteModal(student)}>
//                                                             <Trash className="mr-2 h-4 w-4" />
//                                                             Delete
//                                                         </DropdownMenuItem>
//                                                     </DropdownMenuContent>
//                                                 </DropdownMenu>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 ) : (
//                                     <tr>
//                                         <td colSpan={7} className="p-4 text-center text-muted-foreground">
//                                             No students found matching your search.
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Pagination */}
//                     {filteredStudents.length > 0 && (
//                         <div className="flex items-center justify-between mt-4">
//                             <div className="text-sm text-muted-foreground">
//                                 Showing {((page - 1) * studentsPerPage) + 1} to {Math.min(page * studentsPerPage, filteredStudents.length)} of {filteredStudents.length} students
//                             </div>
//                             <div className="flex items-center gap-1">
//                                 <Button
//                                     variant="outline"
//                                     size="icon"
//                                     onClick={() => setPage(prev => Math.max(prev - 1, 1))}
//                                     disabled={page === 1}
//                                 >
//                                     <ChevronLeft className="h-4 w-4" />
//                                 </Button>
//                                 <Button
//                                     variant="outline"
//                                     size="icon"
//                                     onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
//                                     disabled={page === totalPages}
//                                 >
//                                     <ChevronRight className="h-4 w-4" />
//                                 </Button>
//                             </div>
//                         </div>
//                     )}
//                 </CardContent>
//             </Card>

//             {/* Add Student Modal */}
//             <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
//                 <DialogContent className="sm:max-w-[500px]">
//                     <DialogHeader>
//                         <DialogTitle>Add New Student</DialogTitle>
//                         <DialogDescription>
//                             Fill in the details below to create a new student account.
//                         </DialogDescription>
//                     </DialogHeader>
//                     <form onSubmit={handleAddStudent}>
//                         <div className="grid gap-4 py-4">
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div className="space-y-2">
//                                     <Label htmlFor="firstName">First Name</Label>
//                                     <Input
//                                         id="firstName"
//                                         name="firstName"
//                                         value={formData.firstName}
//                                         onChange={handleChange}
//                                         className={errors.firstName ? "border-red-500" : ""}
//                                     />
//                                     {errors.firstName && (
//                                         <p className="text-red-500 text-xs">{errors.firstName}</p>
//                                     )}
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label htmlFor="lastName">Last Name</Label>
//                                     <Input
//                                         id="lastName"
//                                         name="lastName"
//                                         value={formData.lastName}
//                                         onChange={handleChange}
//                                         className={errors.lastName ? "border-red-500" : ""}
//                                     />
//                                     {errors.lastName && (
//                                         <p className="text-red-500 text-xs">{errors.lastName}</p>
//                                     )}
//                                 </div>
//                             </div>

//                             <div className="space-y-2">
//                                 <Label htmlFor="email">Email</Label>
//                                 <Input
//                                     id="email"
//                                     name="email"
//                                     type="email"
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     className={errors.email ? "border-red-500" : ""}
//                                 />
//                                 {errors.email && (
//                                     <p className="text-red-500 text-xs">{errors.email}</p>
//                                 )}
//                             </div>

//                             <Label>Date of Birth</Label>
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div className="space-y-2">
//                                     <Input
//                                         id="birthDay"
//                                         name="birthDay"
//                                         placeholder="Day"
//                                         value={formData.birthDay}
//                                         onChange={handleChange}
//                                         className={errors.birthDay ? "border-red-500" : ""}
//                                     />
//                                     {errors.birthDay && (
//                                         <p className="text-red-500 text-xs">{errors.birthDay}</p>
//                                     )}
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Select
//                                         value={formData.birthMonth}
//                                         onValueChange={(value) => handleSelectChange('birthMonth', value)}
//                                     >
//                                         <SelectTrigger className={errors.birthMonth ? "border-red-500" : ""}>
//                                             <SelectValue placeholder="Month" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {months.map((month) => (
//                                                 <SelectItem key={month.value} value={month.value}>
//                                                     {month.label}
//                                                 </SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                     {errors.birthMonth && (
//                                         <p className="text-red-500 text-xs">{errors.birthMonth}</p>
//                                     )}
//                                 </div>
//                             </div>

//                             <div className="space-y-2">
//                                 <Label htmlFor="course">Course</Label>
//                                 <Select
//                                     value={formData.course}
//                                     onValueChange={(value) => handleSelectChange('course', value)}
//                                 >
//                                     <SelectTrigger className={errors.course ? "border-red-500" : ""}>
//                                         <SelectValue placeholder="Select a course" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         {courses.map((course) => (
//                                             <SelectItem key={course.id} value={course.name}>
//                                                 {course.name}
//                                             </SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                                 {errors.course && (
//                                     <p className="text-red-500 text-xs">{errors.course}</p>
//                                 )}
//                             </div>
//                         </div>
//                         <DialogFooter>
//                             <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
//                                 Cancel
//                             </Button>
//                             <Button type="submit">Create Student</Button>
//                         </DialogFooter>
//                     </form>
//                 </DialogContent>
//             </Dialog>

//             {/* Edit Student Modal */}
//             <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
//                 <DialogContent className="sm:max-w-[500px]">
//                     <DialogHeader>
//                         <DialogTitle>Edit Student</DialogTitle>
//                         <DialogDescription>
//                             Update the student information below.
//                         </DialogDescription>
//                     </DialogHeader>
//                     <form onSubmit={handleEditStudent}>
//                         <div className="grid gap-4 py-4">
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div className="space-y-2">
//                                     <Label htmlFor="firstName">First Name</Label>
//                                     <Input
//                                         id="firstName"
//                                         name="firstName"
//                                         value={formData.firstName}
//                                         onChange={handleChange}
//                                         className={errors.firstName ? "border-red-500" : ""}
//                                     />
//                                     {errors.firstName && (
//                                         <p className="text-red-500 text-xs">{errors.firstName}</p>
//                                     )}
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label htmlFor="lastName">Last Name</Label>
//                                     <Input
//                                         id="lastName"
//                                         name="lastName"
//                                         value={formData.lastName}
//                                         onChange={handleChange}
//                                         className={errors.lastName ? "border-red-500" : ""}
//                                     />
//                                     {errors.lastName && (
//                                         <p className="text-red-500 text-xs">{errors.lastName}</p>
//                                     )}
//                                 </div>
//                             </div>

//                             <div className="space-y-2">
//                                 <Label htmlFor="email">Email</Label>
//                                 <Input
//                                     id="email"
//                                     name="email"
//                                     type="email"
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     className={errors.email ? "border-red-500" : ""}
//                                 />
//                                 {errors.email && (
//                                     <p className="text-red-500 text-xs">{errors.email}</p>
//                                 )}
//                             </div>

//                             <Label>Date of Birth</Label>
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div className="space-y-2">
//                                     <Input
//                                         id="birthDay"
//                                         name="birthDay"
//                                         placeholder="Day"
//                                         value={formData.birthDay}
//                                         onChange={handleChange}
//                                         className={errors.birthDay ? "border-red-500" : ""}
//                                     />
//                                     {errors.birthDay && (
//                                         <p className="text-red-500 text-xs">{errors.birthDay}</p>
//                                     )}
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Select
//                                         value={formData.birthMonth}
//                                         onValueChange={(value) => handleSelectChange('birthMonth', value)}
//                                     >
//                                         <SelectTrigger className={errors.birthMonth ? "border-red-500" : ""}>
//                                             <SelectValue placeholder="Month" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {months.map((month) => (
//                                                 <SelectItem key={month.value} value={month.value}>
//                                                     {month.label}
//                                                 </SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                     {errors.birthMonth && (
//                                         <p className="text-red-500 text-xs">{errors.birthMonth}</p>
//                                     )}
//                                 </div>
//                             </div>

//                             <div className="space-y-2">
//                                 <Label htmlFor="course">Course</Label>
//                                 <Select
//                                     value={formData.course}
//                                     onValueChange={(value) => handleSelectChange('course', value)}
//                                 >
//                                     <SelectTrigger className={errors.course ? "border-red-500" : ""}>
//                                         <SelectValue placeholder="Select a course" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         {courses.map((course) => (
//                                             <SelectItem key={course.id} value={course.name}>
//                                                 {course.name}
//                                             </SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                                 {errors.course && (
//                                     <p className="text-red-500 text-xs">{errors.course}</p>
//                                 )}
//                             </div>
//                         </div>
//                         <DialogFooter>
//                             <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
//                                 Cancel
//                             </Button>
//                             <Button type="submit">Save Changes</Button>
//                         </DialogFooter>
//                     </form>
//                 </DialogContent>
//             </Dialog>

//             {/* Delete Student Modal */}
//             {/* <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>Delete Student</DialogTitle>
//             <DialogDescription>
//               Are you sure you want to delete this student? This action cannot be undone.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="p-4 */}

//         </div>
//     )
// }

// export default AdminTutor;