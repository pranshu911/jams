import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApplications } from "@/hooks/useApplications";
import { ApplicationDetails } from "@/components/ApplicationDetails";
import { Badge } from "@/components/ui/badge";
import { Application } from "@/hooks/useApplications";

const getApplicationCountColor = (count: number) => {
  if (count >= 6) return "#00FFFF";
  if (count >= 4) return "#00C0C0";
  if (count >= 2) return "#00A0A0";
  if (count >= 1) return "#008080";
  return "transparent";
};

export default function CalendarPage() {
  const { data: applications, isLoading, error } = useApplications();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const handleCloseDetails = () => {
    setSelectedApplication(null);
  };

  const { applicationDates } = useMemo(() => {
    const appDates: { [key: string]: number } = {};
    if (applications) {
      applications.forEach((app) => {
        if (app.date_applied) {
          const appliedDate = new Date(app.date_applied).toDateString();
          appDates[appliedDate] = (appDates[appliedDate] || 0) + 1;
        }
      });
    }
    return { applicationDates: appDates };
  }, [applications]);

  const selectedDayFollowUps = date
    ? applications.filter((app) => {
        if (!app.follow_up) return false;
        const followUpDate = new Date(app.follow_up);
        return followUpDate.toDateString() === date.toDateString();
      })
    : [];

  const selectedDayApplications = date
    ? applications.filter((app) => {
        if (!app.date_applied) return false;
        const appliedDate = new Date(app.date_applied);
        return appliedDate.toDateString() === date.toDateString();
      })
    : [];

  const modifiers = useMemo(() => {
    const mods: { [key: string]: Date[] } = {
      followUp: [],
      level1: [],
      level2: [],
      level3: [],
      level4: [],
    };

    applications.forEach((app) => {
      if (app.follow_up) {
        mods.followUp.push(new Date(app.follow_up));
      }
    });

    for (const dateStr in applicationDates) {
      const count = applicationDates[dateStr];
      const date = new Date(dateStr);
      if (count >= 6) mods.level4.push(date);
      else if (count >= 4) mods.level3.push(date);
      else if (count >= 2) mods.level2.push(date);
      else if (count >= 1) mods.level1.push(date);
    }

    return mods;
  }, [applications, applicationDates]);

  const modifiersStyles = {
    followUp: {
      borderColor: "#FFA500",
      borderWidth: "4px",
      borderRadius: "0.5rem",
    },
    level1: { backgroundColor: getApplicationCountColor(1), color: "white" },
    level2: { backgroundColor: getApplicationCountColor(2), color: "white" },
    level3: { backgroundColor: getApplicationCountColor(4), color: "white" },
    level4: { backgroundColor: getApplicationCountColor(6), color: "white" },
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Activity Calendar</h1>
        <p className="text-muted-foreground">
          Visualize your job application activity and scheduled follow-ups.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          A border indicates a scheduled follow-up. The background color intensity shows the number of applications on that day - the brighter the color, the more applications.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-grow">
        <div className="xl:col-span-2 h-full">
          <Card className="gradient-card border-border/50 shadow-elegant h-full flex flex-col">
            <CardContent className="p-0 flex-grow flex">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full h-full"
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
              />
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-1 flex flex-col gap-8 h-full overflow-hidden">
          <Card className="gradient-card border-border/50 shadow-elegant flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="text-foreground">
                {date ? `Follow-ups for ${date.toLocaleDateString()}` : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
              {isLoading && <p>Loading...</p>}
              {error && <p className="text-destructive">Error loading applications.</p>}
              {!isLoading && !error && (
                <div className="space-y-4">
                  {selectedDayFollowUps.length > 0 ? (
                    selectedDayFollowUps.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl hover:bg-accent/50 transition-all duration-200 border border-border/30 hover:border-primary/30 cursor-pointer"
                        onClick={() => setSelectedApplication(app)}
                      >
                        <div className="flex-grow">
                          <h4 className="font-medium text-foreground">{app.title}</h4>
                          <p className="text-sm text-muted-foreground">{app.company}</p>
                          <div className="mt-2">
                            <Badge variant="outline">{app.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No follow-ups scheduled for this day.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50 shadow-elegant flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="text-foreground">
                {date ? `Applications on ${date.toLocaleDateString()}` : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
              {isLoading && <p>Loading...</p>}
              {error && <p className="text-destructive">Error loading applications.</p>}
              {!isLoading && !error && (
                <div className="space-y-4">
                  {selectedDayApplications.length > 0 ? (
                    selectedDayApplications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl hover:bg-accent/50 transition-all duration-200 border border-border/30 hover:border-primary/30 cursor-pointer"
                        onClick={() => setSelectedApplication(app)}
                      >
                        <div className="flex-grow">
                          <h4 className="font-medium text-foreground">{app.title}</h4>
                          <p className="text-sm text-muted-foreground">{app.company}</p>
                          <div className="mt-2">
                            <Badge variant="outline">{app.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No applications submitted on this day.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {selectedApplication && (
        <ApplicationDetails
          application={selectedApplication}
          isOpen={!!selectedApplication}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}
