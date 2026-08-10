export interface Official {
  name: string;
  position: string;
  photo: string;
}

// Placeholder officials — swap photos (and names, if needed) for the real
// barangay officials before this goes live. See Tier 4 in the asset checklist.
export const PUNONG_BARANGAY: Official = {
  name: "Juan Miguel D. Reyes",
  position: "Punong Barangay",
  photo: "/brand/tier-4/punong-barangay-juan-miguel-reyes.png",
};

export const KAGAWAD: Official[] = [
  { name: "Maria Lourdes P. Garcia", position: "Kagawad", photo: "/brand/tier-4/kagawad-maria-lourdes-garcia.png" },
  { name: "Rodelino B. Santos", position: "Kagawad", photo: "/brand/tier-4/kagawad-rodelino-santos.png" },
  { name: "Carmela S. Alvarado", position: "Kagawad", photo: "/brand/tier-4/kagawad-carmela-alvarado.png" },
  { name: "Bernardo L. Delos Reyes", position: "Kagawad", photo: "/brand/tier-4/kagawad-bernardo-delos-reyes.png" },
  { name: "Erlinda P. Tabornida", position: "Kagawad", photo: "/brand/tier-4/kagawad-erlinda-tabornida.png" },
  { name: "Victorino M. Ocampo", position: "Kagawad", photo: "/brand/tier-4/kagawad-victorino-ocampo.png" },
  { name: "Jane Ann R. Bañares", position: "Kagawad", photo: "/brand/tier-4/kagawad-jane-ann-banares.png" },
];
