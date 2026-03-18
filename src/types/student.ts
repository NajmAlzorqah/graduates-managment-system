export type Student = {
  id: string;
  name: string;
  email: string;
  academicId: string;
  department: string;
  status: "active" | "graduated" | "suspended";
  avatarUrl?: string | null;
};

export type StudentWithProfile = {
  id: string;
  name: string | null;
  email: string;
  academicId: string;
  nameAr: string | null;
  isApproved: boolean;
  role: "STUDENT";
  createdAt: Date;
  image: string | null;
  profile: {
    studentCardNumber: string | null;
    major: string | null;
    graduationYear: number | null;
    phone: string | null;
  } | null;
};

export type CertificateStep = {
  id: string;
  label: string;
  status: "completed" | "in-progress" | "pending" | "needs-verification" | "modified" | "rejected";
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
  avatarUrl?: string | null;
};

export type StudentHomeData = {
  profile: StudentProfile;
  certificateSteps: CertificateStep[];
  documents: DocumentItem[];
};

export type StudentWithSteps = {
  id: string;
  name: string | null;
  nameAr: string | null;
  major: string | null;
  steps: CertificateStep[];
  graduationFormSubmitted: boolean;
  documents: {
    id: string;
    label: string;
    documentType: string;
    filePath: string;
    status: string;
  }[];
};

export type StudentBasicInfo = {
  id: string;
  name: string | null;
  nameAr: string | null;
  academicId: string;
  major: string | null;
  graduationYear: number | null;
};
