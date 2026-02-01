
import { Template } from "@/types";
import { ENGINEERING_TEMPLATES } from "./engineering";
import { CREATIVE_TEMPLATES } from "./creative";
import { EXECUTIVE_TEMPLATES } from "./executive";
import { ADDITIONAL_TEMPLATES } from "./additional";
import { MODERN_TEMPLATES } from "./modern";

export const PORTFOLIO_TEMPLATES: Template[] = [
  ...ENGINEERING_TEMPLATES,
  ...CREATIVE_TEMPLATES,
  ...EXECUTIVE_TEMPLATES,
  ...ADDITIONAL_TEMPLATES,
  ...MODERN_TEMPLATES,
];

export * from "./utils";

export const getTemplateById = (id: string) =>
  PORTFOLIO_TEMPLATES.find((t) => t.id === id);
