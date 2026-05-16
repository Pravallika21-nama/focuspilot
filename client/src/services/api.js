import axios from "axios";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("study_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function safeApi(call, fallback) {
  try {
    return await call();
  } catch (error) {
    console.warn("Using demo fallback:", error.message);
    return fallback;
  }
}

export async function loginRequest(payload) {
  return (await api.post("/auth/login", payload)).data;
}

export async function registerRequest(payload) {
  return (await api.post("/auth/register", payload)).data;
}

export async function googleLoginRequest(payload) {
  return (await api.post("/auth/google", payload)).data;
}

export async function fetchProfileRequest() {
  return (await api.get("/profile")).data;
}

export function getApiErrorMessage(error) {
  if (error.code === "ERR_NETWORK") {
    return `Cannot reach the backend API at ${api.defaults.baseURL}. Start the server with "npm.cmd run dev" inside the server folder, or fix VITE_API_URL.`;
  }

  const validation = error.response?.data?.errors?.[0]?.msg;
  return validation || error.response?.data?.message || error.message || "Something went wrong";
}

export async function fetchActiveTimetable() {
  return safeApi(
    async () => (await api.get("/timetables/active")).data,
    { timetable: null }
  );
}

export async function generateTimetable(payload) {
  return (await api.post("/timetables/generate", payload)).data;
}

export async function fetchAnalytics() {
  return safeApi(
    async () => (await api.get("/progress/analytics")).data,
    {
      summary: {
        plannedHours: 0,
        completedHours: 0,
        remainingHours: 0,
        weeklyHours: 0,
        tasksCompleted: 0,
        totalTasks: 0,
        completionPercent: 0,
        remainingTasks: 0,
        consistency: 0,
        averageFocus: 0
      },
      daily: [],
      subjects: []
    }
  );
}

export async function updateTask(id, payload) {
  return safeApi(
    async () => (await api.patch(`/tasks/${id}`, payload)).data,
    { task: { _id: id, ...payload } }
  );
}

export async function askAssistant(message) {
  return safeApi(
    async () => (await api.post("/chat", { message })).data,
    { answer: "Focus on your nearest exam first, then spend one block on the weakest subject. Keep the last 10 minutes for recall." }
  );
}

export async function fetchReminderPrefs() {
  return safeApi(
    async () => (await api.get("/reminders/preferences")).data,
    { emailEnabled: true, reminderTime: "07:00", studyDays: [1, 2, 3, 4, 5] }
  );
}

export async function saveReminderPrefs(payload) {
  return safeApi(
    async () => (await api.put("/reminders/preferences", payload)).data,
    payload
  );
}

