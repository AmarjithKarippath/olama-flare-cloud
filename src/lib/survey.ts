export type SurveyOption = {
  id: string;
  label: string;
  hasOther?: boolean;
};

export type SurveyQuestion = {
  step: 1 | 2 | 3 | 4 | 5;
  field: "useCase" | "currentTool" | "frustration" | "shareWith" | "price";
  otherField?: "useCaseOther" | "currentToolOther" | "frustrationOther";
  title: string;
  options: SurveyOption[];
};

export const SURVEY: SurveyQuestion[] = [
  {
    step: 1,
    field: "useCase",
    otherField: "useCaseOther",
    title: "What will you primarily use this for?",
    options: [
      { id: "async", label: "Quick updates / async communication with my team" },
      { id: "demos", label: "Product demos & walkthroughs" },
      { id: "bugs", label: "Bug reports / technical explanations" },
      { id: "sales", label: "Client presentations or sales" },
      { id: "tutorials", label: "Personal tutorials / content creation" },
      { id: "other", label: "Other", hasOther: true },
    ],
  },
  {
    step: 2,
    field: "currentTool",
    otherField: "currentToolOther",
    title: "How do you currently record and share screen videos?",
    options: [
      { id: "loom", label: "Loom" },
      { id: "meet", label: "Zoom / Google Meet recordings" },
      { id: "quicktime", label: "QuickTime + manual upload" },
      { id: "obs", label: "OBS or other tools" },
      { id: "none", label: "I don’t really do it (too much friction)" },
      { id: "other", label: "Other", hasOther: true },
    ],
  },
  {
    step: 3,
    field: "frustration",
    otherField: "frustrationOther",
    title: "What’s the most annoying thing about your current screen recording tool?",
    options: [
      { id: "slow-link", label: "Too slow to get a shareable link" },
      { id: "quality", label: "Poor quality" },
      { id: "expensive", label: "Expensive" },
      { id: "complicated", label: "Complicated" },
      { id: "privacy", label: "Privacy / cloud concerns" },
      { id: "free-plan", label: "Limited free plan" },
      { id: "other", label: "Other", hasOther: true },
    ],
  },
  {
    step: 4,
    field: "shareWith",
    title: "Who do you mainly share these recordings with?",
    options: [
      { id: "team", label: "Internal team / colleagues" },
      { id: "clients", label: "Clients / external stakeholders" },
      { id: "both", label: "Both" },
      { id: "myself", label: "Just myself (for documentation)" },
    ],
  },
  {
    step: 5,
    field: "price",
    title: "If this tool solves your problem well, what feels like a fair price?",
    options: [
      { id: "free", label: "Free only" },
      { id: "5-8", label: "$5–8 / month" },
      { id: "10-15", label: "$10–15 / month" },
      { id: "15-20", label: "$15–20 / month" },
      { id: "one-time", label: "One-time purchase ($40–80)" },
      { id: "depends", label: "Depends on features" },
    ],
  },
];

export function surveyQuestion(step: number): SurveyQuestion | undefined {
  return SURVEY.find((item) => item.step === step);
}

export function optionLabel(question: SurveyQuestion, value: string | null, other: string | null): string {
  if (!value) {
    return "";
  }
  const option = question.options.find((item) => item.id === value);
  if (!option) {
    return value;
  }
  if (option.hasOther && other) {
    return other;
  }
  return option.label;
}
