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
  "dailySchedule": [{"subject":"","topic":"specific unit/chapter task","date":"YYYY-MM-DD","startTime":"HH:mm","endTime":"HH:mm","type":"study|revision|practice|break","priority":"low|medium|high","notes":"specific deliverable"}],
  "weeklySchedule": [same session object],
  "subjectRoadmap": ["precise subject-wise roadmap with unit order, prerequisite gap, practice method, exam strategy, completion target, and measurable output"],
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

  const days = Math.min(21, Math.max(7, daysUntilNearestExam(subjects)));
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
      const unit = pickUnit(subject, day + block);
      const start = new Date(cursor);
      const end = new Date(cursor.getTime() + 50 * 60 * 1000);
      const session = {
        subject: subject.name,
        topic: buildSessionTopic(subject, unit, block),
        date: date.toISOString().slice(0, 10),
        startTime: toTime(start),
        endTime: toTime(end),
        type: block === blocks - 1 ? "revision" : "study",
        priority: subject.isWeak || subject.priority >= 4 ? "high" : "medium",
        notes: buildSessionDeliverable(subject, unit, block)
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
  const units = parseUnits(subject.syllabusUnits);
  const method = {
    programming: "learn syntax and patterns, implement examples, then solve timed coding problems",
    math: "revise formulas, solve solved examples, then practice exam-level numericals",
    lab: "prepare procedure, observations, viva questions, and common output errors",
    core: "clear prerequisites, make unit notes, practice numericals/diagrams/derivations",
    theory: "make concise unit notes, compare concepts, practice long-answer structures",
    elective: "focus on scoring units, definitions, applications, and repeated questions"
  }[type] || "study concepts, practice questions, and revise weak units";

  const unitPlan = units.length
    ? ` Unit order: ${units.map((unit, index) => `${index + 1}. ${unit}`).join("; ")}.`
    : " First split the syllabus into units, then study high-weight chapters before low-weight reading.";
  const weakness = subject.isWeak || Number(subject.currentUnderstanding || 50) < 50
    ? " First repair prerequisites and make a mistake log before attempting timed questions."
    : " Move quickly from concept review to timed practice and previous-year questions.";
  const exam = subject.examDate ? ` Complete first pass by ${dateBefore(subject.examDate, 3)} and keep the final 3 days for revision.` : " Set a target exam date to make this roadmap sharper.";

  return `${subject.name}: For ${inputs.branch || "BTech"} semester ${inputs.semester || ""}, use this method: ${method}.${unitPlan} ${weakness} ${exam} Target ${subject.targetScore || 75}% with priority ${subject.priority || 3}/5. Measurable output: one-page notes per unit, solved examples, previous-year questions, and a final error list.`;
}

function inferSubjectType(name = "") {
  const value = name.toLowerCase();
  if (/(program|coding|dsa|data structure|web|java|python|c\+\+|dbms|os|network)/.test(value)) return "programming";
  if (/(math|calculus|algebra|probability|statistics|numerical)/.test(value)) return "math";
  if (/(lab|workshop|practical)/.test(value)) return "lab";
  return "core";
}

function parseUnits(value = "") {
  return String(value)
    .split(/[\n,;|]+/)
    .map((unit) => unit.trim())
    .filter(Boolean);
}

function pickUnit(subject, index) {
  const units = parseUnits(subject.syllabusUnits);
  if (!units.length) return subject.name;
  return units[index % units.length];
}

function buildSessionTopic(subject, unit, block) {
  const type = subject.subjectType || inferSubjectType(subject.name);
  if (block % 3 === 2) return `${unit}: revision and self-test`;
  if (type === "programming") return `${unit}: implement and solve problems`;
  if (type === "math") return `${unit}: formulas and numericals`;
  if (type === "lab") return `${unit}: procedure, output, and viva prep`;
  return `${unit}: concepts and exam questions`;
}

function buildSessionDeliverable(subject, unit, block) {
  if (block % 3 === 2) return `Revise ${unit}, close mistakes, and write 5 recall questions.`;
  if (subject.isWeak || Number(subject.currentUnderstanding || 50) < 50) {
    return `Build fundamentals for ${unit}, solve 3 examples, and add doubts to the error log.`;
  }
  return `Finish ${unit} notes and solve at least 5 exam-level questions.`;
}

function daysUntilNearestExam(subjects) {
  const days = subjects
    .filter((subject) => subject.examDate)
    .map((subject) => Math.ceil((new Date(subject.examDate) - new Date()) / 86400000))
    .filter((daysLeft) => Number.isFinite(daysLeft) && daysLeft > 0);
  return days.length ? Math.min(...days) : 7;
}

function dateBefore(date, days) {
  const value = new Date(date);
  value.setDate(value.getDate() - days);
  return value.toISOString().slice(0, 10);
}
