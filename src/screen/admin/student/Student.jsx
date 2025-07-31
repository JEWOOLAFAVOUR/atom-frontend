"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Users,
  Trash2,
  Edit,
  Eye,
  GraduationCap,
  Mail,
  Calendar,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { sendToast } from "../../../components/utilis";
import useAuthStore from "../../../store/useAuthStore";
import {
  createUserByRole,
  getUsers,
  updateUser,
  deleteUser,
} from "../../../api/auth";
import { getCourses } from "../../../api/auth";
import { useNavigate } from "react-router-dom";

const AdminStudent = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // State variables
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    day: "",
    month: "",
    course: "",
    userType: "student",
    organizationId: "",
  });
  const [errors, setErrors] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

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
  ];

  // Initialize organization ID from authenticated user
  useEffect(() => {
    if (user?.organization?._id) {
      setFormData((prev) => ({
        ...prev,
        organizationId: user.organization._id,
      }));
    }
  }, [user]);

  // Fetch students on component mount and when search changes
  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, [pagination.currentPage]);

  // Debounce search input to prevent excessive API calls
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchStudents(1);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchQuery]);

  // Fetch students from API
  const fetchStudents = async (page = pagination.currentPage) => {
    setIsLoading(true);
    try {
      const params = {
        userType: "student",
        page: page.toString(),
        limit: "10",
      };

      if (user?.organization?._id) {
        params.organizationId = user.organization._id;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await getUsers(params);

      if (response.data?.success) {
        setStudents(response.data.data);
        setPagination({
          currentPage: response.data.page,
          totalPages: response.data.totalPages,
          total: response.data.totalCount,
        });
      } else {
        sendToast(
          "error",
          response?.data?.message || "Failed to fetch students"
        );
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      sendToast("error", "Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch courses for dropdown
  const fetchCourses = async () => {
    try {
      const params = {};
      if (user?.organization?._id) {
        params.organization = user.organization._id;
      }

      const response = await getCourses(params);

      if (response.data?.success) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

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
    });
    setErrors({});
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstname.trim())
      newErrors.firstname = "First name is required";
    if (!formData.lastname.trim()) newErrors.lastname = "Last name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.day.trim()) {
      newErrors.day = "Birth day is required";
    } else if (
      isNaN(formData.day) ||
      Number.parseInt(formData.day) < 1 ||
      Number.parseInt(formData.day) > 31
    ) {
      newErrors.day = "Please enter a valid day (1-31)";
    }

    if (!formData.month) newErrors.month = "Birth month is required";
    if (!formData.organizationId)
      newErrors.organizationId = "Organization is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle add student
  const handleAddStudent = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await createUserByRole(formData);

        if (response.data?.success) {
          sendToast("success", "Student created successfully");
          setIsAddModalOpen(false);
          resetFormData();
          fetchStudents();
        } else {
          sendToast(
            "error",
            response.data?.message || "Failed to create student"
          );
        }
      } catch (error) {
        console.error("Error creating student:", error);
        sendToast("error", "Failed to create student");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle edit student
  const handleEditStudent = async (e) => {
    e.preventDefault();

    if (validateForm() && selectedStudent) {
      setIsLoading(true);
      try {
        const response = await updateUser(selectedStudent._id, formData);

        if (response.data?.success) {
          sendToast("success", "Student updated successfully");
          setIsEditModalOpen(false);
          fetchStudents();
        } else {
          sendToast(
            "error",
            response.data?.message || "Failed to update student"
          );
        }
      } catch (error) {
        console.error("Error updating student:", error);
        sendToast("error", "Failed to update student");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle delete student
  const handleDeleteStudent = async () => {
    if (selectedStudent) {
      setIsLoading(true);
      try {
        const response = await deleteUser(selectedStudent._id);

        if (response.data?.success) {
          sendToast("success", "Student deleted successfully");
          setIsDeleteModalOpen(false);
          fetchStudents();
        } else {
          sendToast(
            "error",
            response.data?.message || "Failed to delete student"
          );
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        sendToast("error", "Failed to delete student");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Open edit modal with student data
  const openEditModal = (student) => {
    setSelectedStudent(student);

    let day = "";
    let month = "";

    if (student.dateOfBirth) {
      const date = new Date(student.dateOfBirth);
      day = date.getDate().toString();
      month = (date.getMonth() + 1).toString();
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
    });
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle select change
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Student Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
            <Users className="h-4 w-4" />
            Manage your students
          </p>
        </div>

        <Button
          onClick={() => {
            resetFormData();
            setIsAddModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Main Card */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Students</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total: {pagination.total} students
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search students..."
                  className="pl-10 w-full lg:w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Loading students...
              </span>
            </div>
          ) : students.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-800">
                    <TableHead className="font-semibold">Student</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Course</TableHead>
                    <TableHead className="font-semibold">Join Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow
                      key={student._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold">
                              {student.firstname?.charAt(0)}
                              {student.lastname?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {student.firstname} {student.lastname}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              #{student._id.substring(0, 8)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {student.email}
                      </TableCell>
                      <TableCell>
                        {student.course ? (
                          <span className="text-gray-900 dark:text-gray-100">
                            {typeof student.course === "object"
                              ? student.course.name
                              : "Assigned"}
                          </span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">
                            Not assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        >
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(`/dashboard/students/${student._id}`)
                            }
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(student)}
                            className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteModal(student)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
                  {Math.min(pagination.currentPage * 10, pagination.total)} of{" "}
                  {pagination.total} students
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1 || isLoading}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium">
                    {pagination.currentPage}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={
                      pagination.currentPage === pagination.totalPages ||
                      isLoading
                    }
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Students Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery
                  ? "No students match your search criteria."
                  : "Start by adding your first student"}
              </p>
              <Button
                onClick={() => {
                  resetFormData();
                  setIsAddModalOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Student
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new student account.
            </DialogDescription>
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
                  {errors.firstname && (
                    <p className="text-red-500 text-xs">{errors.firstname}</p>
                  )}
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
                  {errors.lastname && (
                    <p className="text-red-500 text-xs">{errors.lastname}</p>
                  )}
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
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
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
                    {errors.day && (
                      <p className="text-red-500 text-xs">{errors.day}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Select
                      value={formData.month}
                      onValueChange={(value) =>
                        handleSelectChange("month", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.month ? "border-red-500" : ""}
                      >
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
                    {errors.month && (
                      <p className="text-red-500 text-xs">{errors.month}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Course (Optional)</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => handleSelectChange("course", value)}
                >
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  "Create Student"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Student
            </DialogTitle>
            <DialogDescription>
              Update the student information below.
            </DialogDescription>
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
                  {errors.firstname && (
                    <p className="text-red-500 text-xs">{errors.firstname}</p>
                  )}
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
                  {errors.lastname && (
                    <p className="text-red-500 text-xs">{errors.lastname}</p>
                  )}
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
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
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
                    {errors.day && (
                      <p className="text-red-500 text-xs">{errors.day}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Select
                      value={formData.month}
                      onValueChange={(value) =>
                        handleSelectChange("month", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.month ? "border-red-500" : ""}
                      >
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
                    {errors.month && (
                      <p className="text-red-500 text-xs">{errors.month}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-course">Course (Optional)</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => handleSelectChange("course", value)}
                >
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Student Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Student
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 font-bold">
                    {selectedStudent.firstname?.charAt(0)}
                    {selectedStudent.lastname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedStudent.firstname} {selectedStudent.lastname}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedStudent.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteStudent}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete Student"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStudent;
