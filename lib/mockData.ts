export interface Exporter {
  id: string
  user_id: string
  company_name: string
  contact_person: string
  email: string
  phone: string | null
  created_at: string
  updated_at: string
}

export interface ExporterProfile {
  id: string
  exporter_id: string
  company_name: string | null
  contact_person: string | null
  email: string | null
  phone: string | null
  country: string | null
  product_focus: string[] | null
  created_at: string
  updated_at: string
}

export interface Farm {
  id: string
  exporter_id: string
  farm_name: string
  county: string
  crop_type: string
  acreage: number | null
  created_at: string
  updated_at: string
}

export interface ProduceRequest {
  id: string
  exporter_id: string
  crop: string
  quantity_kg: number
  preferred_collection_date: string | null
  status: string | null
  created_at: string
  updated_at: string
}

// Mock current user
export const mockUser = {
  id: "user-123",
  email: "john@example.com",
}

// Mock exporter data
export const mockExporter: Exporter = {
  id: "exporter-123",
  user_id: "user-123",
  company_name: "Green Valley Exports",
  contact_person: "John Doe",
  email: "john@example.com",
  phone: "+254712345678",
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
}

// Mock profile data
export const mockProfile: ExporterProfile = {
  id: "profile-123",
  exporter_id: "exporter-123",
  company_name: "Green Valley Exports",
  contact_person: "John Doe",
  email: "john@example.com",
  phone: "+254712345678",
  country: "Kenya",
  product_focus: ["Avocado", "Mango", "Coffee"],
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
}

// Mock farms data
export const mockFarms: Farm[] = [
  {
    id: "farm-1",
    exporter_id: "exporter-123",
    farm_name: "Sunrise Farm",
    county: "Nakuru",
    crop_type: "Avocado",
    acreage: 25.5,
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-10T08:00:00Z",
  },
  {
    id: "farm-2",
    exporter_id: "exporter-123",
    farm_name: "Highland Plantation",
    county: "Meru",
    crop_type: "Coffee",
    acreage: 15.0,
    created_at: "2024-01-12T09:30:00Z",
    updated_at: "2024-01-12T09:30:00Z",
  },
  {
    id: "farm-3",
    exporter_id: "exporter-123",
    farm_name: "Tropical Gardens",
    county: "Kisumu",
    crop_type: "Mango",
    acreage: 30.2,
    created_at: "2024-01-14T11:15:00Z",
    updated_at: "2024-01-14T11:15:00Z",
  },
]

// Mock produce requests data
export const mockProduceRequests: ProduceRequest[] = [
  {
    id: "request-1",
    exporter_id: "exporter-123",
    crop: "Avocado",
    quantity_kg: 1000,
    preferred_collection_date: "2024-02-15",
    status: "pending",
    created_at: "2024-01-20T14:30:00Z",
    updated_at: "2024-01-20T14:30:00Z",
  },
  {
    id: "request-2",
    exporter_id: "exporter-123",
    crop: "Coffee",
    quantity_kg: 500,
    preferred_collection_date: "2024-02-20",
    status: "approved",
    created_at: "2024-01-18T10:15:00Z",
    updated_at: "2024-01-19T16:45:00Z",
  },
  {
    id: "request-3",
    exporter_id: "exporter-123",
    crop: "Mango",
    quantity_kg: 750,
    preferred_collection_date: "2024-02-10",
    status: "rejected",
    created_at: "2024-01-16T13:20:00Z",
    updated_at: "2024-01-17T09:30:00Z",
  },
]

// Mock authentication state
let isAuthenticated = true
let currentSession = {
  user: mockUser,
  exporter: mockExporter,
}

// Mock API functions
export const mockApi = {
  // Simulate async operations
  delay: (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Auth functions
  signUp: async (userData: any) => {
    await mockApi.delay(1500)
    isAuthenticated = true
    currentSession = {
      user: { ...mockUser, email: userData.email },
      exporter: { ...mockExporter, email: userData.email, company_name: userData.companyName },
    }
    return { user: currentSession.user, error: null }
  },

  signOut: async () => {
    await mockApi.delay(500)
    isAuthenticated = false
    currentSession = { user: null, exporter: null }
    return { error: null }
  },

  getUser: async () => {
    await mockApi.delay(500)
    if (!isAuthenticated) {
      return { user: null, error: { message: "Not authenticated" } }
    }
    return { user: currentSession.user, error: null }
  },

  getSession: async () => {
    await mockApi.delay(300)
    if (!isAuthenticated) {
      return { session: null, error: null }
    }
    return {
      session: {
        user: currentSession.user,
        access_token: "mock-token",
        expires_at: Date.now() + 3600000, // 1 hour from now
      },
      error: null,
    }
  },

  // Rest of the existing methods remain the same...
  getExporter: async () => {
    await mockApi.delay(500)
    if (!isAuthenticated) {
      return { data: null, error: { message: "Not authenticated" } }
    }
    return { data: currentSession.exporter, error: null }
  },

  createExporter: async (data: any) => {
    await mockApi.delay(1000)
    const newExporter = {
      ...mockExporter,
      id: `exporter-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    currentSession.exporter = newExporter
    return { data: newExporter, error: null }
  },

  // Profile functions
  getProfile: async () => {
    await mockApi.delay(500)
    return { data: mockProfile, error: null }
  },

  upsertProfile: async (data: any) => {
    await mockApi.delay(1000)
    const updatedProfile = {
      ...mockProfile,
      ...data,
      updated_at: new Date().toISOString(),
    }
    return { data: updatedProfile, error: null }
  },

  // Farm functions
  getFarms: async () => {
    await mockApi.delay(500)
    return { data: [...mockFarms], error: null }
  },

  createFarm: async (data: any) => {
    await mockApi.delay(1000)
    const newFarm = {
      id: `farm-${Date.now()}`,
      exporter_id: mockExporter.id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return { data: newFarm, error: null }
  },

  // Produce request functions
  getProduceRequests: async () => {
    await mockApi.delay(500)
    return { data: [...mockProduceRequests], error: null }
  },

  createProduceRequest: async (data: any) => {
    await mockApi.delay(1000)
    const newRequest = {
      id: `request-${Date.now()}`,
      exporter_id: mockExporter.id,
      status: "pending",
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return { data: newRequest, error: null }
  },
}

// Export authentication state checker
export const checkAuthState = () => isAuthenticated
