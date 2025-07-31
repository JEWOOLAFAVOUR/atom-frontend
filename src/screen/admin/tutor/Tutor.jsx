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

const AdminTutor = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // State variables
  const [tutors, setTutors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    day: "",
    month: "",
    course: "",
    userType: "tutor",
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

  // Fetch tutors on component mount and when search changes
  useEffect(() => {
    fetchTutors();
    fetchCourses();
  }, [pagination.currentPage]);

  // Debounce search input to prevent excessive API calls
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchTutors(1);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchQuery]);

  // Fetch tutors from API
  const fetchTutors = async (page = pagination.currentPage) => {
    setIsLoading(true);
    try {
      const params = {
        userType: "tutor",
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
        setTutors(response.data.data);
        setPagination({
          currentPage: response.data.page,
          totalPages: response.data.totalPages,
          total: response.data.totalCount,
        });
      } else {
        sendToast("error", response?.data?.message || "Failed to fetch tutors");
      }
    } catch (error) {
      console.error("Error fetching tutors:", error);
      sendToast("error", "Failed to fetch tutors");
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
      userType: "tutor",
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

  // Handle add tutor
  const handleAddTutor = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await createUserByRole(formData);

        if (response.data?.success) {
          sendToast("success", "Tutor created successfully");
          setIsAddModalOpen(false);
          resetFormData();
          fetchTutors();
        } else {
          sendToast(
            "error",
            response.data?.message || "Failed to create tutor"
          );
        }
      } catch (error) {
        console.error("Error creating tutor:", error);
        sendToast("error", "Failed to create tutor");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle edit tutor
  const handleEditTutor = async (e) => {
    e.preventDefault();

    if (validateForm() && selectedTutor) {
      setIsLoading(true);
      try {
        const response = await updateUser(selectedTutor._id, formData);

        if (response.data?.success) {
          sendToast("success", "Tutor updated successfully");
          setIsEditModalOpen(false);
          fetchTutors();
        } else {
          sendToast(
            "error",
            response.data?.message || "Failed to update tutor"
          );
        }
      } catch (error) {
        console.error("Error updating tutor:", error);
        sendToast("error", "Failed to update tutor");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle delete tutor
  const handleDeleteTutor = async () => {
    if (selectedTutor) {
      setIsLoading(true);
      try {
        const response = await deleteUser(selectedTutor._id);

        if (response.data?.success) {
          sendToast("success", "Tutor deleted successfully");
          setIsDeleteModalOpen(false);
          fetchTutors();
        } else {
          sendToast(
            "error",
            response.data?.message || "Failed to delete tutor"
          );
        }
      } catch (error) {
        console.error("Error deleting tutor:", error);
        sendToast("error", "Failed to delete tutor");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Open edit modal with tutor data
  const openEditModal = (tutor) => {
    setSelectedTutor(tutor);

    let day = "";
    let month = "";

    if (tutor.dateOfBirth) {
      const date = new Date(tutor.dateOfBirth);
      day = date.getDate().toString();
      month = (date.getMonth() + 1).toString();
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
    });
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (tutor) => {
    setSelectedTutor(tutor);
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
            Tutor Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
            <GraduationCap className="h-4 w-4" />
            Manage your tutors
          </p>
        </div>

        <Button
          onClick={() => {
            resetFormData();
            setIsAddModalOpen(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white"
          disabled={isLoading}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Tutor
        </Button>
      </div>

      {/* Main Card */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Tutors</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total: {pagination.total} tutors
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search tutors..."
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
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Loading tutors...
              </span>
            </div>
          ) : tutors.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-800">
                    <TableHead className="font-semibold">Tutor</TableHead>
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
                  {tutors.map((tutor) => (
                    <TableRow
                      key={tutor._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 font-semibold">
                              {tutor.firstname?.charAt(0)}
                              {tutor.lastname?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {tutor.firstname} {tutor.lastname}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              #{tutor._id.substring(0, 8)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {tutor.email}
                      </TableCell>
                      <TableCell>
                        {tutor.course ? (
                          <Badge
                            variant="outline"
                            className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                          >
                            {typeof tutor.course === "object"
                              ? tutor.course.name
                              : "Assigned"}
                          </Badge>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">
                            Not assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {new Date(tutor.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            tutor.verified
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }
                        >
                          {tutor.verified ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(`/dashboard/tutors/${tutor._id}`)
                            }
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(tutor)}
                            className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteModal(tutor)}
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
                  {pagination.total} tutors
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

                  <span className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm font-medium">
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
                <GraduationCap className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Tutors Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery
                  ? "No tutors match your search criteria."
                  : "Start by adding your first tutor"}
              </p>
              <Button
                onClick={() => {
                  resetFormData();
                  setIsAddModalOpen(true);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Tutor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Tutor Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Tutor
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new tutor account.
            </DialogDescription>
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
                  placeholder="e.g., tutor@example.com"
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
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  "Create Tutor"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Tutor Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Tutor
            </DialogTitle>
            <DialogDescription>
              Update the tutor information below.
            </DialogDescription>
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
                className="bg-purple-600 hover:bg-purple-700"
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

      {/* Delete Tutor Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Tutor
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tutor? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {selectedTutor && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 font-bold">
                    {selectedTutor.firstname?.charAt(0)}
                    {selectedTutor.lastname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedTutor.firstname} {selectedTutor.lastname}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedTutor.email}
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
              onClick={handleDeleteTutor}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete Tutor"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTutor;
