"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface ChatRoom {
  id: string;
  updatedAt: string;
  store?: { id: string; name: string; logoUrl: string | null };
  buyer?: { id: string; name: string; avatarUrl: string | null };
  messages: { content: string; createdAt: string }[];
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

export default function ChatPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isAuthenticated) {
      fetchRooms();
    }
  }, [isAuthenticated, authLoading]);

  // Poll for messages every 5 seconds (Simple Real-time)
  useEffect(() => {
    if (!selectedRoomId) return;

    const interval = setInterval(() => {
      fetchMessages(selectedRoomId, false);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedRoomId]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get("/chats/rooms");
      setRooms(response.data.data);
    } catch (error) {
      console.error("Failed to fetch rooms", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: string, showLoading = true) => {
    try {
      if (showLoading) setMessages([]); // Clear previous messages visually
      const response = await api.get(`/chats/rooms/${roomId}/messages`);
      setMessages(response.data.data);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    fetchMessages(roomId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !newMessage.trim()) return;

    try {
      await api.post(`/chats/rooms/${selectedRoomId}/messages`, {
        content: newMessage,
      });
      setNewMessage("");
      fetchMessages(selectedRoomId, false); // Refresh immediately
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getRoomName = (room: ChatRoom) => {
    if (user?.role === "SELLER") {
      return room.buyer?.name || "Unknown Buyer";
    }
    return room.store?.name || "Unknown Store";
  };

  const getRoomAvatar = (room: ChatRoom) => {
    if (user?.role === "SELLER") {
      return room.buyer?.avatarUrl;
    }
    return room.store?.logoUrl;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <Skeleton className="h-[600px] w-full max-w-5xl rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-6xl h-[80vh] bg-card border rounded-xl shadow-sm flex overflow-hidden">
        {/* Sidebar - Rooms List */}
        <div className="w-1/3 border-r bg-muted/30 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Chats
            </h2>
          </div>
          <ScrollArea className="flex-1">
            {rooms.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No chats yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => handleSelectRoom(room.id)}
                    className={`p-4 flex items-center gap-3 hover:bg-muted transition-colors text-left ${
                      selectedRoomId === room.id ? "bg-muted" : ""
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={getRoomAvatar(room) || undefined} />
                      <AvatarFallback>{getRoomName(room)[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium truncate">
                          {getRoomName(room)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(room.updatedAt), "p")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {room.messages[0]?.content || "No messages"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedRoomId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3 bg-card">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="font-semibold">
                  {rooms.find((r) => r.id === selectedRoomId)
                    ? getRoomName(rooms.find((r) => r.id === selectedRoomId)!)
                    : "Chat"}
                </span>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 bg-muted/10">
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p
                            className={`text-[10px] mt-1 text-right ${
                              isMe ? "text-primary-foreground/70" : "opacity-50"
                            }`}
                          >
                            {format(new Date(msg.createdAt), "p")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t bg-card">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
