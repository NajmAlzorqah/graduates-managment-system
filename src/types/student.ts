export type Student = {
  id: string;
  name: string;
  email: string;
  department: string;
  status: "active" | "graduated" | "suspended";
};

export type CertificateStep = {
  id: string;
  label: string;
  status: "completed" | "in-progress" | "pending";
};

export type DocumentItem = {
  id: string;
  label: string;
  status: "accepted" | "pending" | "rejected";
};

export type StudentProfile = {
  id: string;
  nameAr: string;
  department: string;
};

export type StudentHomeData = {
  profile: StudentProfile;
  certificateSteps: CertificateStep[];
  documents: DocumentItem[];
};
