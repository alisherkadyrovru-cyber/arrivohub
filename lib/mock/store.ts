import type { Application, ApplicantProfile, Profile, Request } from "@/lib/types";

type MockState = {
  profiles: Record<string, Profile>;
  requests: Request[];
  applications: Application[];
  applicantProfiles: Record<string, ApplicantProfile>;
  transport: Record<string, { driverName: string; carModel: string; plate: string; phone: string }>;
  creditsLedger: { id: string; profileId: string; delta: number; note: string; createdAt: string }[];
};

function nowIso(){ return new Date().toISOString(); }
function id(prefix:string){ return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`; }

const seed: MockState = (() => {
  const agencyId="mock_agency_1";
  const profiles: MockState["profiles"] = {
    [agencyId]: { id: agencyId, role:"agency", fullName:"Karavan Travel", email:"agency@demo.com", credits:85, phone:"+90 555 000 00 00", address:"Istanbul (demo)" },
    "mock_assistant_1": { id:"mock_assistant_1", role:"assistant", fullName:"Name Surname 1", email:"assistant@demo.com", expiresAt:"2026-12-31", phone:"+90 555 111 11 11", address:"Istanbul (demo)" },
    "mock_guide_1": { id:"mock_guide_1", role:"guide", fullName:"Name Surname 4", email:"guide@demo.com", expiresAt:"2026-12-31", phone:"+90 555 222 22 22", address:"Istanbul (demo)" },
  };

  const requests: Request[] = [
    { id:"req_a_1", kind:"assistant", agencyName:"Karavan Travel", assistType:"Assistant", adType:"Arrival", date:"2026-02-23", time:"15:45",
      flightCode:"TK1234", airport:"IST", hotel:"Radisson Blu Şişli", pax:3, lang:"EN", notes:"Meet at gate, VIP family.", priceTry:1500,
      status:"open", createdAt:nowIso(), updatedAt:nowIso()
    },
    { id:"req_g_1", kind:"guide", agencyName:"Karavan Travel", guideType:"FD", date:"2026-03-25", hotel:"Intercontinental Taksim", pax:5, lang:"EN",
      notes:"Old city + Bosphorus cruise.", priceTry:5000, status:"open", createdAt:nowIso(), updatedAt:nowIso()
    },
  ];

  const applications: Application[] = [
    { id:"app_1", requestId:"req_a_1", applicantId:"ap_2", applicantName:"Name Surname 2", role:"assistant", offerTry:1700, createdAt:nowIso() },
    { id:"app_2", requestId:"req_g_1", applicantId:"mock_guide_1", applicantName:"Name Surname 4", role:"guide", offerTry:4500, createdAt:nowIso() },
  ];

  const applicantProfiles: Record<string, ApplicantProfile> = {
    "mock_assistant_1": {
      id:"mock_assistant_1", name:"Name Surname 1", age:29, gender:"Male",
      languages:[{ lang:"EN", level:"Fluent" },{ lang:"RU", level:"Native" }],
      rating:4.8, completedCount:47, tursabCard:"TR-12345",
      phone:"+90 555 111 11 11", email:"assistant@demo.com",
    },
    "ap_2": {
      id:"ap_2", name:"Name Surname 2", age:34, gender:"Female",
      languages:[{ lang:"EN", level:"Fluent" },{ lang:"IT", level:"Intermediate" }],
      rating:4.5, completedCount:28, tursabCard:"TR-67890",
      phone:"+90 555 333 33 33", email:"assistant2@demo.com",
    },
    "ap_3": {
      id:"ap_3", name:"Name Surname 3", age:26, gender:"Male",
      languages:[{ lang:"EN", level:"Intermediate" },{ lang:"AR", level:"Native" }],
      rating:4.2, completedCount:15, tursabCard:undefined,
      phone:"+90 555 444 44 44", email:"assistant3@demo.com",
    },
    "mock_guide_1": {
      id:"mock_guide_1", name:"Name Surname 4", age:38, gender:"Male",
      languages:[{ lang:"EN", level:"Fluent" },{ lang:"RU", level:"Intermediate" }],
      rating:4.9, completedCount:112, kokartId:"KOK-55512",
      phone:"+90 555 222 22 22", email:"guide@demo.com",
    },
    "gd_5": {
      id:"gd_5", name:"Name Surname 5", age:31, gender:"Female",
      languages:[{ lang:"EN", level:"Fluent" },{ lang:"ES", level:"Fluent" }],
      rating:4.6, completedCount:63, kokartId:"KOK-77234",
      phone:"+90 555 555 55 55", email:"guide5@demo.com",
    },
  };

  const creditsLedger = [
    { id:id("led"), profileId: agencyId, delta:+100, note:"Top-up (demo)", createdAt:nowIso() },
    { id:id("led"), profileId: agencyId, delta:-5, note:"Create assistant request (demo)", createdAt:nowIso() },
  ];

  return { profiles, requests, applications, applicantProfiles, transport:{}, creditsLedger };
})();

const KEY="arrivohub_mock_state_v1";

export function loadMockState(): MockState {
  if (typeof window === "undefined") return seed;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return seed;
  try {
    const parsed = JSON.parse(raw) as MockState;
    // merge in any new seed fields that may not exist in stored state
    if (!parsed.applicantProfiles) parsed.applicantProfiles = seed.applicantProfiles;
    return parsed;
  } catch { return seed; }
}
export function saveMockState(state: MockState){ window.localStorage.setItem(KEY, JSON.stringify(state)); }
