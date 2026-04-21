"use client";

import { Button } from "@midday/ui/button";
import { useState } from "react";
import { Joyride, STATUS, type Step } from "react-joyride";

const steps: Step[] = [
  {
    target: ".sidebar",
    content:
      "This is your main navigation sidebar. Access all your documents, projects, and workflows here.",
    disableBeacon: true,
  },
  {
    target: ".header",
    content:
      "Access your profile, notifications, and theme settings from here.",
    disableBeacon: true,
  },
  {
    target: ".quick-actions",
    content:
      "Quickly create new documents, projects, or transmittals with the floating action button.",
    disableBeacon: true,
  },
  {
    target: ".search",
    content:
      "Use Cmd+K to quickly search across all your documents and projects.",
    disableBeacon: true,
  },
];

export function InteractiveTour() {
  const [runTour, setRunTour] = useState(false);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setRunTour(true)}
        className="quick-actions"
      >
        Start Tour
      </Button>
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showSkipButton
        showProgress
        callback={handleJoyrideCallback}
      />
    </>
  );
}
