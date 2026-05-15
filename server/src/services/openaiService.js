import OpenAI from "openai";

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function generateStudyPlan(inputs) {
  if (!client) {
    return buildFallbackPlan(inputs);
  }

  const prompt = `
Generate a realistic personalized BTech study roadmap and timetable as strict JSON.
Student inputs:
${JSON.stringify(inputs, null, 2)}

Return this shape only:
{
  "dailySchedule": [{"subject":"","topic":"","date":"YYYY-MM-DD","startTime":"HH:mm","endTime":"HH:mm","type":"study|revision|practice|break","priority":"low|medium|high","notes":""}],
  "weeklySchedule": [same session object],
  "subjectRoadmap": ["subject-wise roadmap item with units, prerequisites, practice method, lab/theory strategy, and target outcome"],
  "revisionPlan": ["..."],
  "suggestions": ["..."],
  "productivityScore": 0-100
}
Act like a BTech academic mentor trained across common engineering subjects:
- CSE: Programming, DSA, DBMS, OS, CN, COA, Software Engineering, AI/ML, Web, Compiler Design
- ECE/EEE: Circuits, Signals, Control Systems, Digital Electronics, Communication, Power Systems
- Mechanical: Thermodynamics, SOM, Fluid Mechanics, Manufacturing, Machine Design
- Civil: Strength of Materials, Surveying, RCC, Geotechnical, Transportation, Hydraulics
- Common: Engineering Mathematics, Physics, Chemistry, English, Environmental Science
Analyze branch, semester, subject type, syllabus units, backlogs, weak subjects, difficulty, current understanding, exam dates, target score, and daily hours.
Do not invent a student profile. Use only supplied details.
Balance fundamentals, prerequisites, numericals/coding/lab/theory practice, revision, exam proximity, and breaks.
`;

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an expert academic planning coach. Return valid JSON only." },
      { role: "user", content: prompt }
    ],
    temperature: 0.35,
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function askStudyAssistant(message, context = {}) {
  if (!client) {
    return "Start with the nearest exam and your weakest subject. Use 45-minute focus blocks, revise yesterday's material first, then practice questions.";
  }

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a concise, encouraging AI study coach." },
      { role: "user", content: `Context: ${JSON.stringify(context)}\nQuestion: ${message}` }
    ],
    temperature: 0.5
  });

  return response.choices[0].message.content;
}

function buildFallbackPlan(inputs) {
  const subjects = normalizeSubjects(inputs.subjects);
  if (subjects.length === 0) {
    return {
      dailySchedule: [],
      weeklySchedule: [],
      subjectRoadmap: [],
      revisionPlan: [],
      suggestions: ["Add your BTech branch, semester, subjects, syllabus units, and exam dates to generate a useful roadmap."],
      productivityScore: 0
    };
  }

  const days = 7;
  const dailyHours = Number(inputs.dailyStudyHours || 3);
  const preferred = inputs.preferredStudyTime || "18:00";
  const [hour, minute] = preferred.split(":").map(Number);
  const dailySchedule = [];
  const weeklySchedule = [];

  for (let day = 0; day < days; day += 1) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    const ranked = [...subjects].sort((a, b) => scoreSubject(b) - scoreSubject(a));
    let cursor = new Date(date);
    cursor.setHours(hour, minute || 0, 0, 0);
    const blocks = Math.max(2, Math.floor(dailyHours));

    for (let block = 0; block < blocks; block += 1) {
      const subject = ranked[(day + block) % ranked.length];
      const start = new Date(cursor);
      const end = new Date(cursor.getTime() + 50 * 60 * 1000);
      const session = {
        subject: subject.name,
        topic: block % 2 === 0 ? "Concept mastery and notes" : "Practice questions",
        date: date.toISOString().slice(0, 10),
        startTime: toTime(start),
        endTime: toTime(end),
        type: block === blocks - 1 ? "revision" : "study",
        priority: subject.isWeak || subject.priority >= 4 ? "high" : "medium",
        notes: subject.isWeak ? "Spend extra time on weak areas and error logs." : "Keep notes crisp and test yourself."
      };
      dailySchedule.push(session);
      weeklySchedule.push(session);
      cursor = new Date(end.getTime() + 10 * 60 * 1000);
    }
  }

  return {
    dailySchedule: dailySchedule.slice(0, Math.max(3, Math.floor(dailyHours))),
    weeklySchedule,
    subjectRoadmap: subjects.map((subject) => buildSubjectRoadmap(subject, inputs)),
    revisionPlan: [
      "Revise every completed unit within 24 hours using short recall notes.",
      "Three days before each exam, switch from learning new units to mixed previous-year and model-paper practice.",
      "On the final evening, revise formulas, definitions, diagrams, algorithms, derivations, and common mistakes only."
    ],
    suggestions: [
      `Prioritize ${inputs.branch || "your branch"} core subjects before general theory subjects when exam dates are close.`,
      "For programming/math/numerical subjects, spend at least 60% of the block solving problems instead of rereading.",
      "End every session by writing three recall questions and one mistake to avoid."
    ],
    productivityScore: 84
  };
}

function normalizeSubjects(subjects = []) {
  if (Array.isArray(subjects) && subjects.length > 0) return subjects;
  return [];
}

function scoreSubject(subject) {
  const daysLeft = Math.max(1, Math.ceil((new Date(subject.examDate) - new Date()) / 86400000));
  return Number(subject.priority || 3) * 2 + Number(subject.difficulty || 3) + (subject.isWeak ? 4 : 0) + 10 / daysLeft;
}

function toTime(date) {
  return date.toTimeString().slice(0, 5);
}

function buildSubjectRoadmap(subject, inputs) {
  const type = subject.subjectType || inferSubjectType(subject.name);
  const method = {
    programming: "learn syntax and patterns, implement examples, then solve timed coding problems",
    math: "revise formulas, solve solved examples, then practice exam-level numericals",
    lab: "prepare procedure, observations, viva questions, and common output errors",
    core: "clear prerequisites, make unit notes, practice numericals/diagrams/derivations",
    theory: "make concise unit notes, compare concepts, practice long-answer structures",
    elective: "focus on scoring units, definitions, applications, and repeated questions"
  }[type] || "study concepts, practice questions, and revise weak units";

  const units = subject.syllabusUnits ? ` Units to cover: ${subject.syllabusUnits}.` : "";
  const weakness = subject.isWeak || Number(subject.currentUnderstanding || 50) < 50
    ? " Start with fundamentals and weak prerequisites before exam questions."
    : " Move quickly from concepts to practice and revision.";

  return `${subject.name}: For ${inputs.branch || "BTech"} semester ${inputs.semester || ""}, use a ${method} roadmap.${units}${weakness} Target ${subject.targetScore || 75}% with priority ${subject.priority || 3}/5.`;
}

function inferSubjectType(name = "") {
  const value = name.toLowerCase();
  if (/(program|coding|dsa|data structure|web|java|python|c\+\+|dbms|os|network)/.test(value)) return "programming";
  if (/(math|calculus|algebra|probability|statistics|numerical)/.test(value)) return "math";
  if (/(lab|workshop|practical)/.test(value)) return "lab";
  return "core";
}
