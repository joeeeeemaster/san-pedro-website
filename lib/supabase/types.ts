export type UserRole = "admin" | "staff" | "resident";

export interface Profile {
  id: string;
  role: UserRole;
  status: "active" | "inactive" | "pending";
  full_name: string;
  email: string;
  mobile_number: string | null;
  date_of_birth: string | null;
  sex: "Male" | "Female" | null;
  civil_status: string | null;
  house_lot_no: string | null;
  street: string | null;
  purok_zone: string | null;
  household_no: string | null;
  avatar_url: string | null;
  position: string | null;
  notifications_last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export type RequestStatus = "pending" | "processing" | "ready" | "released" | "rejected";
export type DbDocumentType =
  | "barangay_clearance"
  | "certificate_of_indigency"
  | "business_permit"
  | "barangay_id";

export interface DocumentRequestRow {
  id: string;
  resident_id: string;
  document_type: DbDocumentType;
  purpose: string | null;
  address: string | null;
  contact_number: string | null;
  status: RequestStatus;
  uploaded_files: string[];
  requested_at: string;
  updated_at: string;
}

export interface HouseholdMemberRow {
  id: string;
  resident_id: string;
  full_name: string;
  relationship: string;
  age: number | null;
  created_at: string;
}

export const REQUEST_STATUS_STEPS: RequestStatus[] = [
  "pending",
  "processing",
  "ready",
  "released",
];

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  ready: "Ready",
  released: "Released",
  rejected: "Rejected",
};

// --- Phase 3 ---

export type AnnouncementCategory =
  | "Fiesta"
  | "Public Works"
  | "Assembly"
  | "Health"
  | "Environment"
  | "Events";
export type AnnouncementStatus = "draft" | "published";

export interface AnnouncementRow {
  id: string;
  slug: string;
  title: string;
  category: AnnouncementCategory;
  content: string;
  cover_image_url: string | null;
  status: AnnouncementStatus;
  published_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export type BlotterSeverity = "Low" | "Medium" | "High";
export type BlotterStatus = "Open" | "Under Mediation" | "Resolved";

export interface BlotterRow {
  id: string;
  case_no: string;
  complainant_name: string;
  respondent_name: string;
  incident_type: string;
  incident_datetime: string;
  location: string;
  severity: BlotterSeverity;
  description: string;
  witnesses: string | null;
  status: BlotterStatus;
  filed_by: string | null;
  created_at: string;
  updated_at: string;
}

export type EquipmentStatus = "Available" | "Rented" | "Under Maintenance";
export type RentalStatus = "Reserved" | "Released" | "Returned" | "Due Today";

export interface EquipmentRow {
  id: string;
  name: string;
  total_quantity: number;
  available_quantity: number;
  status: EquipmentStatus;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EquipmentRentalRow {
  id: string;
  equipment_id: string;
  borrower_name: string;
  contact_number: string | null;
  date_out: string;
  return_date: string;
  quantity: number;
  status: RentalStatus;
  created_by: string | null;
  created_at: string;
}

export interface CertificateRow {
  id: string;
  request_id: string | null;
  certificate_no: string;
  resident_id: string;
  document_type: DbDocumentType;
  purpose: string | null;
  address: string | null;
  issued_date: string;
  issued_by: string | null;
  created_at: string;
}

// --- Phase 4 ---

export interface BarangaySettings {
  id: true;
  barangay_name: string;
  municipality: string;
  province: string;
  complete_address: string;
  official_email: string;
  contact_number: string;
  office_hours: string;
  about_description: string;
  official_seal_url: string | null;
  sk_logo_url: string | null;
  updated_at: string;
}

