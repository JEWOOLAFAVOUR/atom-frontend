import { useState } from "react"
import { BookOpen, Search, Plus, MoreHorizontal, Pencil, Trash2, Filter, Download, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Badge } from "../../../components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "../../../components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"

export default function AdminCourse() {
    // State for courses
    const [courses, setCourses] = useState([
        {
            id: 1,
            name: "Web Development Fundamentals",
            description: "Learn the basics of HTML, CSS, and JavaScript",
            students: 18,
            tutors: ["Dr. Sarah Miller"],
            status: "Active",
            startDate: "2023-10-15",
            duration: "12 weeks",
        },
        {
            id: 2,
            name: "Advanced JavaScript",
            description: "Deep dive into modern JavaScript concepts and frameworks",
            students: 12,
            tutors: ["Prof. David Kim"],
            status: "Active",
            startDate: "2023-10-20",
            duration: "10 weeks",
        },
        {
            id: 3,
            name: "UI/UX Design Principles",
            description: "Learn the fundamentals of user interface and experience design",
            students: 15,
            tutors: ["Dr. Sarah Miller", "Dr. Lisa Wang"],
            status: "Upcoming",
            startDate: "2023-11-05",
            duration: "8 weeks",
        },
        {
            id: 4,
            name: "Data Science Basics",
            description: "Introduction to data analysis and visualization",
            students: 20,
            tutors: ["Prof. David Kim"],
            status: "Active",
            startDate: "2023-09-10",
            duration: "14 weeks",
        },
        {
            id: 5,
            name: "Mobile App Development",
            description: "Build native mobile applications for iOS and Android",
            students: 14,
            tutors: ["Dr. Lisa Wang"],
            status: "Completed",
            startDate: "2023-07-15",
            duration: "12 weeks",
        },
    ])

    // State for search query
    const [searchQuery, setSearchQuery] = useState("")

    // State for new/edit course
    const [isEditMode, setIsEditMode] = useState(false)
    const [currentCourse, setCurrentCourse] = useState({
        id: null,
        name: "",
        description: "",
        status: "Active",
        startDate: "",
        duration: "12 weeks",
    })

    // State for delete confirmation
    const [courseToDelete, setCourseToDelete] = useState(null)

    // Filter courses based on search query
    const filteredCourses = courses.filter(
        (course) =>
            course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.status.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Handle opening the edit modal
    const handleEditCourse = (course) => {
        setIsEditMode(true)
        setCurrentCourse({ ...course })
    }

    // Handle opening the delete modal
    const handleDeleteCourse = (courseId) => {
        setCourseToDelete(courseId)
    }

    // Handle form submission for create/edit
    const handleSubmitCourse = () => {
        if (isEditMode) {
            // Update existing course
            setCourses(courses.map((course) => (course.id === currentCourse.id ? currentCourse : course)))
        } else {
            // Create new course
            const newCourse = {
                ...currentCourse,
                id: courses.length + 1,
                students: 0,
                tutors: [],
            }
            setCourses([...courses, newCourse])
        }

        // Reset form
        resetForm()
    }

    // Handle delete confirmation
    const handleConfirmDelete = () => {
        setCourses(courses.filter((course) => course.id !== courseToDelete))
        setCourseToDelete(null)
    }

    // Reset form
    const resetForm = () => {
        setCurrentCourse({
            id: null,
            name: "",
            description: "",
            status: "Active",
            startDate: "",
            duration: "12 weeks",
        })
        setIsEditMode(false)
    }

    // Get status badge variant
    const getStatusBadge = (status) => {
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
        <div className="space-y-6 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Courses</h1>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Dialog onOpenChange={(open) => !open && resetForm()}>
                        <DialogTrigger asChild>
                            <Button className="gap-1">
                                <Plus className="h-4 w-4" />
                                Add Course
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                            <DialogHeader>
                                <DialogTitle>{isEditMode ? "Edit Course" : "Add New Course"}</DialogTitle>
                                <DialogDescription>
                                    {isEditMode
                                        ? "Update the course details below."
                                        : "Fill in the details below to create a new course."}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Course Name</Label>
                                    <Input
                                        id="name"
                                        value={currentCourse.name}
                                        onChange={(e) => setCurrentCourse({ ...currentCourse, name: e.target.value })}
                                        placeholder="e.g., Web Development Fundamentals"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={currentCourse.description}
                                        onChange={(e) => setCurrentCourse({ ...currentCourse, description: e.target.value })}
                                        placeholder="Brief description of the course"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="duration">Duration</Label>
                                    <Select
                                        value={currentCourse.duration}
                                        onValueChange={(value) => setCurrentCourse({ ...currentCourse, duration: value })}
                                    >
                                        <SelectTrigger id="duration">
                                            <SelectValue placeholder="Select duration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="4 weeks">4 weeks</SelectItem>
                                            <SelectItem value="8 weeks">8 weeks</SelectItem>
                                            <SelectItem value="10 weeks">10 weeks</SelectItem>
                                            <SelectItem value="12 weeks">12 weeks</SelectItem>
                                            <SelectItem value="14 weeks">14 weeks</SelectItem>
                                            <SelectItem value="16 weeks">16 weeks</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button type="submit" onClick={handleSubmitCourse}>
                                        {isEditMode ? "Save Changes" : "Create Course"}
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Course Management</CardTitle>
                            <CardDescription>Manage your courses, add new ones or edit existing courses</CardDescription>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search courses..."
                                    className="w-full sm:w-[250px] pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>All Courses</DropdownMenuItem>
                                    <DropdownMenuItem>Active Courses</DropdownMenuItem>
                                    <DropdownMenuItem>Upcoming Courses</DropdownMenuItem>
                                    <DropdownMenuItem>Completed Courses</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button variant="outline" size="icon">
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course Name</TableHead>
                                <TableHead className="hidden md:table-cell">Description</TableHead>
                                <TableHead className="hidden md:table-cell">Students</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCourses.length > 0 ? (
                                filteredCourses.map((course) => (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <BookOpen className="h-4 w-4 text-primary" />
                                                </div>
                                                <span>{course.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground">
                                            {course.description.length > 60
                                                ? `${course.description.substring(0, 60)}...`
                                                : course.description}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{course.students}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadge(course.status)}>{course.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <Dialog
                                                        onOpenChange={(open) => {
                                                            if (open) {
                                                                handleEditCourse(course)
                                                            } else if (!open && isEditMode) {
                                                                resetForm()
                                                            }
                                                        }}
                                                    >
                                                        <DialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                <Pencil className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                        </DialogTrigger>
                                                    </Dialog>

                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault()
                                                                    handleDeleteCourse(course.id)
                                                                }}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Delete Course</DialogTitle>
                                                                <DialogDescription>
                                                                    Are you sure you want to delete this course? This action cannot be undone.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="py-4">
                                                                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                                                                    <h4 className="font-medium flex items-center gap-2">
                                                                        <BookOpen className="h-4 w-4" />
                                                                        {courses.find((c) => c.id === courseToDelete)?.name}
                                                                    </h4>
                                                                    <p className="text-sm text-muted-foreground mt-1">
                                                                        {courses.find((c) => c.id === courseToDelete)?.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <DialogClose asChild>
                                                                    <Button variant="outline">Cancel</Button>
                                                                </DialogClose>
                                                                <DialogClose asChild>
                                                                    <Button variant="destructive" onClick={handleConfirmDelete}>
                                                                        Delete Course
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <BookOpen className="h-8 w-8 mb-2" />
                                            <p>No courses found</p>
                                            <p className="text-sm">Try adjusting your search or filters</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

