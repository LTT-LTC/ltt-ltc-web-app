"use client";

import StaffPage from "../../admin/staff/page";

// Placeholder for current manager's cinema context
const TEMP_CINEMA_ID = "00000000-0000-0000-0000-000000000000";

export default function StaffManagerPage() {
  return <StaffPage cinemaId={TEMP_CINEMA_ID} />;
}
