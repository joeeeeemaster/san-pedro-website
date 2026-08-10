import { FileText, FileCheck2, Store, IdCard, type LucideIcon } from "lucide-react";

export interface DocumentType {
  slug: string;
  dbType: "barangay_clearance" | "certificate_of_indigency" | "business_permit" | "barangay_id";
  name: string;
  description: string;
  fee: number;
  requirements: string[];
  processingTime: string;
  validity: string;
  icon: LucideIcon;
  accent: "maroon" | "mayon-blue" | "gold" | "festival-red";
}

export const DOCUMENT_TYPES: DocumentType[] = [
  {
    slug: "barangay-clearance",
    dbType: "barangay_clearance",
    name: "Barangay Clearance",
    description:
      "An official clearance certifying residency and/or good moral character for various legal purposes.",
    fee: 100,
    requirements: ["Valid ID (1 photocopy)", "Purpose/Transaction Details", "Payment of Required Fees"],
    processingTime: "Same day, if requested before 3:00 PM",
    validity: "6 months from date of issue",
    icon: FileText,
    accent: "maroon",
  },
  {
    slug: "certificate-of-indigency",
    dbType: "certificate_of_indigency",
    name: "Certificate of Indigency",
    description:
      "Certifies that the applicant is an indigent resident of the barangay for legal and medical assistance.",
    fee: 100,
    requirements: ["Valid ID (1 photocopy)", "Barangay Residency (6 months or more)", "Authorization Letter (if applicable)"],
    processingTime: "Same day, if requested before 3:00 PM",
    validity: "3 months from date of issue",
    icon: FileCheck2,
    accent: "mayon-blue",
  },
  {
    slug: "business-permit",
    dbType: "business_permit",
    name: "Business Permit",
    description: "Permit issued to individuals or businesses to operate within the barangay.",
    fee: 200,
    requirements: ["DTI/SEC Registration (1 photocopy)", "Mayor's/Occupational Permit (1 photocopy)", "Valid ID (1 photocopy)"],
    processingTime: "2–3 business days",
    validity: "1 year from date of issue",
    icon: Store,
    accent: "gold",
  },
  {
    slug: "barangay-id",
    dbType: "barangay_id",
    name: "Barangay ID",
    description: "Identification card for residents of Barangay San Pedro, Bacacay, Albay.",
    fee: 150,
    requirements: ["Valid ID (1 photocopy)", "Barangay Residency (6 months or more)", "2x2 ID Picture (2 copies)"],
    processingTime: "3–5 business days",
    validity: "3 years from date of issue",
    icon: IdCard,
    accent: "festival-red",
  },
];

export function getDocumentTypeBySlug(slug: string) {
  return DOCUMENT_TYPES.find((d) => d.slug === slug);
}
