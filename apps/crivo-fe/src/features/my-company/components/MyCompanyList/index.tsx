"use client";

import { Suspense } from "react";
import { CircularProgress } from "@mui/material";

import { MyCompanyContent } from "../MyCompanyContent";

export function MyCompany() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <MyCompanyContent />
    </Suspense>
  );
}
