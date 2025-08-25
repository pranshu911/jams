
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const events = [
  {
    id: 1,
    title: "TechCorp Interview",
    time: "10:00 AM",
    type: "interview",
    date: 15,
  },
  {
    id: 2,
    title: "StartupXYZ Phone Screen",
    time: "2:00 PM",
    type: "phone",
    date: 18,
  },
  {
    id: 3,
    title: "BigTech Follow-up",
    time: "11:30 AM",
    type: "followup",
    date: 22,
  },
];

const getEventColor = (type: string) => {
  switch (type) {
    case "interview":
      return "bg-primary text-primary-foreground shadow-lg";
    case "phone":
      return "bg-secondary text-secondary-foreground shadow-lg";
    case "followup":
      return "bg-purple-500 text-white shadow-lg";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function Calendar() {
  const currentMonth = "January 2024";
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const startDay = 1; // Monday

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Calendar</h1>
          <p className="text-muted-foreground">NOTE: This page is a work in progress. The calendar below is a mock-up and is not functional as of now.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:glow-teal">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <Card className="gradient-card border-border/50 shadow-elegant">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-foreground">{currentMonth}</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" className="border-border/50 hover:bg-accent/50 rounded-xl">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-border/50 hover:bg-accent/50 rounded-xl">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {/* Days of week header */}
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Empty cells for start of month */}
            {Array.from({ length: startDay - 1 }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2"></div>
            ))}
            
            {/* Calendar days */}
            {daysInMonth.map((day) => {
              const dayEvents = events.filter(event => event.date === day);
              const isToday = day === 15; // Mock today
              
              return (
                <div
                  key={day}
                  className={`p-3 min-h-[100px] border border-border/30 rounded-xl hover:bg-accent/30 transition-all duration-200 ${
                    isToday ? "bg-primary/10 border-primary/50 shadow-lg" : "bg-muted/20"
                  }`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    isToday ? "text-primary font-bold" : "text-foreground"
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-2 rounded-lg ${getEventColor(event.type)} truncate cursor-pointer transition-all duration-200 hover:scale-105`}
                        title={`${event.title} at ${event.time}`}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <CardTitle className="text-foreground">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl hover:bg-accent/50 transition-all duration-200 border border-border/30 hover:border-primary/30"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${getEventColor(event.type).replace('text-white', '').replace('text-primary-foreground', '').replace('text-secondary-foreground', '')}`}></div>
                  <div>
                    <h4 className="font-medium text-foreground">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">January {event.date} at {event.time}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-border/50 hover:bg-accent/50 rounded-lg">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          className="w-14 h-14 rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-elegant hover:shadow-2xl transition-all duration-300 hover:scale-110 glow-orange"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
