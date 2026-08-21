export function creditToHundredths(value: number) {
  return Math.round(value * 100);
}

export function creditFromHundredths(value: number) {
  return value / 100;
}

export function resolveEnrollmentStatus(
  capacity: number | null,
  occupiedSeats: number,
) {
  return capacity !== null && occupiedSeats >= capacity
    ? ("waitlisted" as const)
    : ("registered" as const);
}

export function isCreditEligible(
  enrollmentStatus: string,
  attendanceStatus: string | null,
) {
  return (
    (enrollmentStatus === "registered" || enrollmentStatus === "confirmed") &&
    (attendanceStatus === "present" || attendanceStatus === "late")
  );
}
