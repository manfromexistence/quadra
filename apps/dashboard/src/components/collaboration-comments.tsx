"use client";

import { Avatar, AvatarFallback } from "@midday/ui/avatar";
import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@midday/ui/dialog";
import { Input } from "@midday/ui/input";
import { AtSign, Clock, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  mentions?: string[];
}

interface CollaborationCommentsProps {
  documentId: string;
  trigger?: React.ReactNode;
}

export function CollaborationComments({
  documentId,
  trigger,
}: CollaborationCommentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "John Doe",
      content: "Please review the structural calculations in section 3.2",
      timestamp: "2 hours ago",
      mentions: ["Jane Smith"],
    },
    {
      id: "2",
      author: "Jane Smith",
      content: "I'll review and provide feedback by EOD",
      timestamp: "1 hour ago",
    },
  ]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: "You",
      content: newComment,
      timestamp: "Just now",
    };

    setComments([...comments, comment]);
    setNewComment("");
    toast("Comment added successfully");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquare className="mr-2 size-4" />
            Comments ({comments.length})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Document Comments</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 p-3 rounded-lg bg-muted/50"
              >
                <Avatar className="size-8">
                  <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {comment.author}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                  {comment.mentions && comment.mentions.length > 0 && (
                    <div className="flex gap-1">
                      {comment.mentions.map((mention) => (
                        <Badge
                          key={mention}
                          variant="secondary"
                          className="text-xs"
                        >
                          <AtSign className="size-3 mr-1" />
                          {mention}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a comment... (use @ to mention)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            />
            <Button onClick={handleAddComment}>
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
