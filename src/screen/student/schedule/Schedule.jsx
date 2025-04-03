import React, { useState } from "react"
import { Calendar as CalendarIcon, Clock, Info, MapPin, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

const ClassSchedulePage = () => {
    // Mock data - replace with actual data from your store
    const weeklyClasses = [
        {
            id: 1,
            title: "Web Development Fundamentals",
            day: "Monday",
            time: "10:00 AM - 12:00 PM",
            tutor: "Dr. Sarah Miller",
            location: "Room 201, Tech Building",
            type: "lecture"
        },
        {
            id: 2,
            title: "Advanced JavaScript",
            day: "Tuesday",
            time: "2:00 PM - 4:00 PM",
            tutor: "Prof. David Kim",
            location: "Room 305, Engineering Building",
            type: "lecture"
        },
        {
            id: 3,
            title: "React Hooks Workshop",
            day: "Wednesday",
            time: "11:00 AM - 1:00 PM",
            tutor: "Dr. Lisa Wang",
            location: "Computer Lab 3",
            type: "practical"
        },
        {
            id: 4,
            title: "JavaScript Project Support",
            day: "Thursday",
            time: "3:00 PM - 5:00 PM",
            tutor: "Dr. Sarah Miller",
            location: "Room 201, Tech Building",
            type: "support"
        },
        {
            id: 5,
            title: "Web Development Lab",
            day: "Friday",
            time: "10:00 AM - 12:00 PM",
            tutor: "Prof. David Kim",
            location: "Computer Lab 2",
            type: "practical"
        },
    ]

    const upcomingClasses = [
        {
            id: 1,
            title: "Web Development Fundamentals",
            date: "Today",
            time: "10:00 AM - 12:00 PM",
            tutor: "Dr. Sarah Miller",
            location: "Room 201, Tech Building",
            type: "lecture"
        },
        {
            id: 2,
            title: "Advanced JavaScript",
            date: "Tomorrow",
            time: "2:00 PM - 4:00 PM",
            tutor: "Prof. David Kim",
            location: "Room 305, Engineering Building",
            type: "lecture"
        },
        {
            id: 3,
            title: "React Hooks Workshop",
            date: "Wed, Apr 10",
            time: "11:00 AM - 1:00 PM",
            tutor: "Dr. Lisa Wang",
            location: "Computer Lab 3",
            type: "practical"
        },
    ]

    const getBadgeVariant = (type) => {
        switch (type) {
            case "lecture": return "default"
            case "practical": return "secondary"
            case "support": return "outline"
            default: return "default"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Class Schedule</h1>
                <Button variant="outline" size="sm" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Download Schedule
                </Button>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upcoming">Upcoming Classes</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Classes</CardTitle>
                            <CardDescription>Your classes for the next few days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-6">
                                    {upcomingClasses.map((cls) => (
                                        <Card key={cls.id} className="border-l-4" style={{ borderLeftColor: cls.type === 'lecture' ? '#0ea5e9' : cls.type === 'practical' ? '#8b5cf6' : '#94a3b8' }}>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{cls.title}</h3>
                                                        <p className="text-sm text-muted-foreground">{cls.date}</p>
                                                    </div>
                                                    <Badge variant={getBadgeVariant(cls.type)}>
                                                        {cls.type.charAt(0).toUpperCase() + cls.type.slice(1)}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mt-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span>{cls.time}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span>{cls.tutor}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span>{cls.location}</span>
                                                    </div>
                                                    <div className="flex justify-end md:col-span-2">
                                                        <Button variant="ghost" size="sm" className="gap-1">
                                                            <Info className="h-4 w-4" />
                                                            Details
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="weekly" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Schedule</CardTitle>
                            <CardDescription>Your regular weekly class schedule</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4">
                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
                                    const dayClasses = weeklyClasses.filter(cls => cls.day === day);
                                    return (
                                        <div key={day} className="border rounded-lg p-4">
                                            <h3 className="font-medium text-lg mb-2">{day}</h3>
                                            {dayClasses.length > 0 ? (
                                                <div className="space-y-3">
                                                    {dayClasses.map(cls => (
                                                        <div key={cls.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 bg-secondary/20 rounded-md">
                                                            <div>
                                                                <span className="font-medium">{cls.title}</span>
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    <span>{cls.time}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center mt-2 sm:mt-0 gap-2">
                                                                <Badge variant={getBadgeVariant(cls.type)}>
                                                                    {cls.type.charAt(0).toUpperCase() + cls.type.slice(1)}
                                                                </Badge>
                                                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                                                    <Info className="h-3 w-3 mr-1" />
                                                                    Details
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No classes scheduled</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default ClassSchedulePage