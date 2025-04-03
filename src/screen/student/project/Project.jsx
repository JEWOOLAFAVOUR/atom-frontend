import React, { useState } from "react"
import { Calendar, Clock, FileText, Filter, Link2, MoreHorizontal, Paperclip, Search, Upload } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

const AssignmentPage = () => {
    const [selectedAssignment, setSelectedAssignment] = useState(null)
    const [view, setView] = useState("all") // "all", "pending", "completed"

    // Mock data - replace with actual data from your store
    const assignments = [
        {
            id: 1,
            title: "JavaScript Final Project",
            course: "Advanced JavaScript",
            description: "Create a web application that demonstrates advanced JavaScript concepts including closures, promises, async/await, and ES6+ features.",
            dueDate: "Apr 15, 2025",
            status: "pending",
            progress: 40,
            attachments: ["Project Requirements.pdf", "Grading Rubric.pdf"],
            submitted: false
        },
        {
            id: 2,
            title: "Portfolio Website",
            course: "Web Development Fundamentals",
            description: "Create a personal portfolio website showcasing your projects, skills, and resume. Use HTML, CSS, and basic JavaScript.",
            dueDate: "Apr 20, 2025",
            status: "completed",
            progress: 100,
            attachments: ["Portfolio Examples.pdf"],
            submissionDate: "Mar 28, 2025",
            submissionLink: "https://myportfolio.dev",
            feedback: "Excellent work! Your design is clean and professional.",
            grade: "A"
        },
        {
            id: 3,
            title: "React State Management",
            course: "React Hooks Workshop",
            description: "Implement a to-do application using React hooks for state management. Your app should allow users to add, edit, complete, and delete tasks.",
            dueDate: "Apr 25, 2025",
            status: "pending",
            progress: 10,
            attachments: ["Assignment Guidelines.pdf"],
            submitted: false
        },
        {
            id: 4,
            title: "API Integration Project",
            course: "Advanced JavaScript",
            description: "Create a web application that fetches and displays data from a public API of your choice. Implement error handling and loading states.",
            dueDate: "May 5, 2025",
            status: "pending",
            progress: 0,
            attachments: ["API Project Requirements.pdf", "Example APIs.pdf"],
            submitted: false
        },
    ]

    const filteredAssignments = view === "all"
        ? assignments
        : assignments.filter(a => view === "pending" ? a.status === "pending" : a.status === "completed")

    const handleViewAssignment = (assignment) => {
        setSelectedAssignment(assignment)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Assignments</h1>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search assignments..."
                            className="w-[200px] pl-8"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setView("all")}>All Assignments</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setView("pending")}>Pending</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setView("completed")}>Completed</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-1 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Assignments</CardTitle>
                            <CardDescription>
                                {view === "all"
                                    ? "All your current and past assignments"
                                    : view === "pending"
                                        ? "Assignments waiting for submission"
                                        : "Completed assignments"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[500px] pr-4">
                                <div className="space-y-4">
                                    {filteredAssignments.map((assignment) => (
                                        <Card key={assignment.id} className="cursor-pointer hover:bg-secondary/10 transition-colors">
                                            <CardContent className="p-4" onClick={() => handleViewAssignment(assignment)}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{assignment.title}</h3>
                                                        <p className="text-sm text-muted-foreground">{assignment.course}</p>
                                                    </div>
                                                    <Badge variant={assignment.status === "completed" ? "outline" : "default"}>
                                                        {assignment.status === "completed" ? "Completed" : "Pending"}
                                                    </Badge>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="flex justify-between items-center text-sm mb-1">
                                                        <span>Progress</span>
                                                        <span>{assignment.progress}%</span>
                                                    </div>
                                                    <Progress value={assignment.progress} className="h-2" />
                                                </div>

                                                <div className="flex justify-between mt-4">
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Calendar className="mr-1 h-4 w-4" />
                                                        Due: {assignment.dueDate}
                                                    </div>
                                                    <div className="flex items-center">
                                                        {assignment.attachments.length > 0 && (
                                                            <div className="flex items-center text-sm text-muted-foreground mr-4">
                                                                <Paperclip className="mr-1 h-4 w-4" />
                                                                {assignment.attachments.length}
                                                            </div>
                                                        )}
                                                        <Button variant="ghost" size="sm">View</Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-1">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Assignment Progress</CardTitle>
                            <CardDescription>Your overall assignment completion</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span>Overall Progress</span>
                                        <span>{Math.round(assignments.reduce((sum, a) => sum + a.progress, 0) / assignments.length)}%</span>
                                    </div>
                                    <Progress value={Math.round(assignments.reduce((sum, a) => sum + a.progress, 0) / assignments.length)} className="h-2" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <p className="text-sm text-muted-foreground mb-1">Completed</p>
                                            <p className="text-2xl font-bold">{assignments.filter(a => a.status === "completed").length}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <p className="text-sm text-muted-foreground mb-1">Pending</p>
                                            <p className="text-2xl font-bold">{assignments.filter(a => a.status === "pending").length}</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-3">Upcoming Deadlines</h3>
                                    <div className="space-y-3">
                                        {assignments
                                            .filter(a => a.status === "pending")
                                            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                                            .slice(0, 3)
                                            .map(a => (
                                                <div key={a.id} className="flex justify-between items-center p-2 bg-secondary/20 rounded-md">
                                                    <div className="text-sm truncate" style={{ maxWidth: "70%" }}>
                                                        {a.title}
                                                    </div>
                                                    <div className="text-xs">
                                                        {a.dueDate}
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Assignment submission dialog */}
            {selectedAssignment && (
                <Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>{selectedAssignment.title}</DialogTitle>
                            <DialogDescription>{selectedAssignment.course}</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="flex justify-between">
                                <div>
                                    <Badge variant={selectedAssignment.status === "completed" ? "outline" : "default"}>
                                        {selectedAssignment.status === "completed" ? "Completed" : "Pending"}
                                    </Badge>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-1 h-4 w-4" />
                                    Due: {selectedAssignment.dueDate}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-medium">Description</h3>
                                <p className="text-sm">{selectedAssignment.description}</p>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <h3 className="font-medium">Attachments</h3>
                                <div className="space-y-2">
                                    {selectedAssignment.attachments.map((attachment, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded-md">
                                            <div className="flex items-center">
                                                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span className="text-sm">{attachment}</span>
                                            </div>
                                            <Button variant="ghost" size="sm">Download</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {selectedAssignment.status === "completed" ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="font-medium">Your Submission</h3>
                                        <div className="p-3 bg-secondary/20 rounded-md">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Link2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    <a href={selectedAssignment.submissionLink} className="text-sm text-primary underline">{selectedAssignment.submissionLink}</a>
                                                </div>
                                                <div className="text-xs text-muted-foreground">Submitted on {selectedAssignment.submissionDate}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="font-medium">Feedback</h3>
                                        <div className="p-3 bg-secondary/20 rounded-md">
                                            <p className="text-sm">{selectedAssignment.feedback}</p>
                                            <div className="flex justify-between mt-2">
                                                <span className="text-sm font-medium">Grade:</span>
                                                <span className="text-sm font-medium">{selectedAssignment.grade}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="submission-type">Submission Type</Label>
                                        <Tabs defaultValue="link" className="w-full">
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="link">Submit Link</TabsTrigger>
                                                <TabsTrigger value="file">Upload File</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="link" className="mt-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="link">Project URL</Label>
                                                    <Input id="link" placeholder="https://your-project-url.com" />
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="file" className="mt-2">
                                                <div className="border-2 border-dashed rounded-md p-6 text-center">
                                                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                    <p className="text-sm mb-1">Drag files here or click to browse</p>
                                                    <p className="text-xs text-muted-foreground">Supported formats: PDF, ZIP, DOC, DOCX, JPG, PNG (Max: 10MB)</p>
                                                    <Button variant="outline" size="sm" className="mt-4">
                                                        Browse Files
                                                    </Button>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="comments">Additional Comments</Label>
                                        <Textarea id="comments" placeholder="Add any comments about your submission..." />
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            {selectedAssignment.status === "pending" && (
                                <>
                                    <Button variant="outline" onClick={() => setSelectedAssignment(null)}>Save Draft</Button>
                                    <Button>Submit Assignment</Button>
                                </>
                            )}
                            {selectedAssignment.status === "completed" && (
                                <Button onClick={() => setSelectedAssignment(null)}>Close</Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

export default AssignmentPage