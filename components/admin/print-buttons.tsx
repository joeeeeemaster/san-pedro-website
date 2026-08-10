"use client";

import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButtons() {
  return (
    <>
      <Button variant="outline" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Print
      </Button>
      <Button onClick={() => window.print()}>
        <Download className="h-4 w-4" /> Export as PDF
      </Button>
    </>
  );
}
