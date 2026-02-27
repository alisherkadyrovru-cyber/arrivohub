export type Role = "agency" | "assistant" | "guide" | "admin";
export type RequestKind = "assistant" | "guide";
export type AssistType = "Greeter" | "Assistant" | "AssistantOther";
export type ADType = "Arrival" | "Departure" | "Other";
export type GuideType = "FD" | "FD+Night" | "A Few Days";
export type RequestStatus = "open" | "confirmed" | "archived";

export type RequestBase = {
  id: string;
  kind: RequestKind;
  agencyName: string;
  notes?: string;
  date: string;
  time?: string;
  hotel: string;
  pax: number;
  lang: string;
  priceTry: number;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  confirmedApplicantName?: string;
  confirmedApplicantId?: string;
  confirmedPriceTry?: number;
  pendingDetailsUpdate?: boolean;
  finishedAt?: string;
  onlyFavorites?: boolean;
  agencyId?: string;
};

export type AssistantRequest = RequestBase & {
  kind: "assistant";
  assistType: AssistType;
  adType: ADType;
  flightCode?: string;
  airport?: string;
};

export type GuideRequest = RequestBase & {
  kind: "guide";
  guideType: GuideType;
};

export type Request = AssistantRequest | GuideRequest;

export type Application = {
  id: string;
  requestId: string;
  applicantId: string;
  applicantName: string;
  role: "assistant" | "guide";
  offerTry: number | null;
  createdAt: string;
};

export type ApplicantProfile = {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  languages: { lang: string; level: string }[];
  rating: number;
  completedCount: number;
  tursabCard?: string;
  kokartId?: string;
  phone?: string;
  email?: string;
  role?: "assistant" | "guide";
};

export type Profile = {
  id: string;
  role: Role;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  expiresAt?: string;
  credits?: number;
  cabinetId?: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female";
  tursabCard?: string;
  kokartId?: string;
  languages?: { lang: string; level: string }[];
  vatNumber?: string;
  tursabLicense?: string;
  rating?: number;
};

export type Rating = {
  id: string;
  applicantId: string;
  requestId: string;
  agencyId: string;
  stars: number;
  comment?: string;
  agencyName?: string;
  anonymousName?: string;
  createdAt: string;
};

export type ReceiptUpload = {
  id: string;
  profileId: string;
  cabinetId: string;
  fileName: string;
  type: "credits" | "subscription";
  amount: number;
  createdAt: string;
  processed?: boolean;
};

export type SubscriptionPayment = {
  id: string;
  profileId: string;
  days: number;
  priceTry: number;
  createdAt: string;
};
