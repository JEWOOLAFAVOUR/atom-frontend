import React, { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Edit, MoreHorizontal, Trash } from "lucide-react";

export const CourseActionMenu = ({ course, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleEdit = () => {
        setIsOpen(false); // Close dropdown after action
        onEdit(course);
    };

    const handleDelete = () => {
        setIsOpen(false); // Close dropdown after action
        onDelete(course);
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};