import React, { useState, useEffect } from "react";
import { CalendarIcon, Clock, Info, MapPin, User, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getClass } from "../../../api/auth"; // Adjust path as needed

const ClassSchedulePage = () => {
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalClasses, setTotalClasses] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("current");

    useEffect(() => {
        fetchClasses();
    }, [currentPage, activeTab]);

    const fetchClasses = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 10,
                search: searchTerm,
                // Use the status parameter based on the active tab
                status: activeTab === "current" ? "active,coming" : "completed",
            };
            const response = await getClass(params);
            setClasses(response.data?.data || []);
            setTotalPages(response?.data.totalPages || 1);
            setTotalClasses(response?.data.total || 0);
        } catch (error) {
            console.error("Failed to fetch classes:", error);
            // Assuming you have a toast function
            sendToast("error", "Failed to fetch classes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchClasses();
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "";

        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        // Format date
        let dateText;
        if (date.toDateString() === today.toDateString()) {
            dateText = "Today";
        } else if (date.toDateString() === tomorrow.toDateString()) {
            dateText = "Tomorrow";
        } else {
            dateText = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        }

        // Format time
        const timeText = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        return { dateText, timeText };
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "active":
                return <Badge variant="default" className="bg-green-500">In Progress</Badge>;
            case "coming":
                return <Badge variant="outline" className="border-blue-500 text-blue-500">Upcoming</Badge>;
            case "completed":
                return <Badge variant="secondary">Completed</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const getTimeRange = (startTime, endTime) => {
        const { timeText: startTimeText } = formatDateTime(startTime);
        const { timeText: endTimeText } = formatDateTime(endTime);
        return `${startTimeText} - ${endTimeText}`;
    };

    const getDayOfWeek = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold">Class Schedule</h1>
                <div className="flex w-full sm:w-auto gap-2">
                    <form onSubmit={handleSearch} className="flex-1 sm:flex-initial">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search classes..."
                                className="pl-8 w-full sm:w-[200px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </form>
                    <Button variant="outline" size="sm" className="gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Download</span> Schedule
                    </Button>
                </div>
            </div>

            <Tabs
                defaultValue="current"
                className="w-full"
                onValueChange={(value) => {
                    setActiveTab(value);
                    setCurrentPage(1); // Reset to first page when switching tabs
                }}
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="current">Current & Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past Classes</TabsTrigger>
                </TabsList>

                {["current", "past"].map((tabValue) => (
                    <TabsContent key={tabValue} value={tabValue} className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {tabValue === "current" ? "Current & Upcoming Classes" : "Past Classes"}
                                </CardTitle>
                                <CardDescription>
                                    {tabValue === "current"
                                        ? "Classes that are in progress or scheduled for the future"
                                        : "Previously completed classes"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <ClassListSkeleton />
                                ) : classes.length > 0 ? (
                                    <ScrollArea className="h-[500px] pr-4">
                                        <div className="space-y-6">
                                            {classes.map((classItem) => (
                                                <Card
                                                    key={classItem._id}
                                                    className="border-l-4"
                                                    style={{
                                                        borderLeftColor: classItem.status === 'active'
                                                            ? '#10b981' // green for active
                                                            : classItem.status === 'coming'
                                                                ? '#3b82f6' // blue for upcoming
                                                                : '#94a3b8' // gray for completed
                                                    }}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                                                            <div>
                                                                <h3 className="font-semibold text-lg">{classItem.topic}</h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {classItem.course?.name || "No course specified"}
                                                                </p>
                                                            </div>
                                                            {getStatusBadge(classItem.status)}
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mt-4">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                                <span>
                                                                    {formatDateTime(classItem.startTime).dateText} ({getDayOfWeek(classItem.startTime)})
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                                <span>{getTimeRange(classItem.startTime, classItem.endTime)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <User className="h-4 w-4 text-muted-foreground" />
                                                                <span>{`${classItem.tutor?.firstname || ''} ${classItem.tutor?.lastname || ''}`}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Info className="h-4 w-4 text-muted-foreground" />
                                                                <span>{classItem.students?.length || 0} Students</span>
                                                            </div>

                                                            {/* <div className="flex justify-end md:col-span-2 mt-2">
                                                                <Button variant="outline" size="sm" className="gap-1">
                                                                    View Details
                                                                </Button>
                                                                {classItem.status === "active" && (
                                                                    <Button variant="default" size="sm" className="gap-1 ml-2">
                                                                        Join Class
                                                                    </Button>
                                                                )}
                                                            </div> */}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">
                                            {searchTerm
                                                ? "No classes match your search criteria"
                                                : tabValue === "current"
                                                    ? "No current or upcoming classes scheduled"
                                                    : "No past classes found"}
                                        </p>
                                    </div>
                                )}

                                {/* Pagination controls */}
                                {classes.length > 0 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-sm text-muted-foreground">
                                            Showing {classes.length} of {totalClasses} classes
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage <= 1 || isLoading}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Prev
                                            </Button>
                                            <span className="text-sm">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage >= totalPages || isLoading}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

const ClassListSkeleton = () => {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mt-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-28" />
                        <div className="flex justify-end md:col-span-2 mt-2">
                            <Skeleton className="h-9 w-28" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ClassSchedulePage;