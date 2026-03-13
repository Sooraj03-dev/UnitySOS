import type { AlertData } from "@/components/ui/AlertCard";
import type { ResponderData } from "@/components/ui/ResponderCard";
import type { ResourceData } from "@/components/ui/ResourceCard";

export const mockAlerts: AlertData[] = [
  { id: "1", type: "SOS",           description: "Trapped in collapsed building, need immediate rescue.", distance: "1.2 km", time: "2m ago",  userName: "Alex M.",    role: "Civilian",    badgeStatus: "unverified" },
  { id: "2", type: "Medical",       description: "Severe asthma attack — inhaler urgently needed.",       distance: "2.4 km", time: "8m ago",  userName: "Sarah K.",   role: "Civilian",    badgeStatus: "unverified" },
  { id: "3", type: "Blocked Route", description: "Main Street bridge collapsed, find alternate routes.",  distance: "3.1 km", time: "34m ago", userName: "Officer Dan",  role: "Rescue",    badgeStatus: "verified"   },
  { id: "4", type: "Resources",     description: "Clean water and food rations available at City Hall.",  distance: "4.5 km", time: "1h ago",  userName: "Dr. Evans",  role: "Doctor",      badgeStatus: "verified"   },
  { id: "5", type: "General",       description: "Power outage across the eastern district.",             distance: "5.0 km", time: "2h ago",  userName: "Maya R.",    role: "Volunteer",   badgeStatus: "pending"    },
];

export const mockResponders: ResponderData[] = [
  { id: "1", name: "Dr. Sarah Kim",  role: "Paramedic",   distance: "0.8 km", badgeStatus: "verified",   avatar: "S", online: true  },
  { id: "2", name: "John Davis",     role: "Rescue",      distance: "1.5 km", badgeStatus: "verified",   avatar: "J", online: true  },
  { id: "3", name: "Maria Garcia",   role: "Volunteer",   distance: "2.1 km", badgeStatus: "pending",    avatar: "M", online: true  },
  { id: "4", name: "Tom Reyes",      role: "Firefighter", distance: "3.0 km", badgeStatus: "verified",   avatar: "T", online: false },
  { id: "5", name: "Ayasha Patel",   role: "Doctor",      distance: "3.8 km", badgeStatus: "verified",   avatar: "A", online: true  },
];

export const mockResources: ResourceData[] = [
  { id: "1", name: "City General Hospital",  type: "Medical",   address: "23 Main Rd, Central",     contact: "+91 80 2345 6789", distance: "1.1 km", open: true  },
  { id: "2", name: "Community Hall Shelter", type: "Shelter",   address: "45 Gandhi St, Indiranagar", contact: "+91 80 9876 5432", distance: "2.3 km", open: true  },
  { id: "3", name: "Relief Water Station",   type: "Water",     address: "Near Metro Station, Ring Rd", contact: "N/A",            distance: "0.7 km", open: true  },
  { id: "4", name: "District Supplies Hub",  type: "Supplies",  address: "Govt Complex, Block B",   contact: "+91 80 1122 3344", distance: "3.5 km", open: false },
  { id: "5", name: "Emergency Control Ctr",  type: "Emergency", address: "Police HQ, MG Road",      contact: "112",              distance: "4.2 km", open: true  },
];
