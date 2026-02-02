import { Template } from "@/types";
import { MINIMALIST_CREATOR } from "./minimalist";
import { DARK_SASS } from "./dark_sass";
import { THREED_DESIGNER } from "./3d_designer";
import { AGENCY_VYSION } from "./agency_vysion";
import { RETRO_POP } from "./retro_pop";
import { GRID_ARCHITECT } from "./grid_architect";
import { TYPOGRAPHIC_BOLD } from "./typographic";
import { DEV_BRUTALIST } from "./brutalist";
import { PHOTOGRAPHER_GALLERY } from "./photographer";
import { STARTUP_LANDING } from "./startup";

export const MODERN_TEMPLATES: Template[] = [
    {
        id: "minimalist_creator",
        name: "Minimalist Creator",
        niche: "Creative",
        preview: "/templates/screenshots/minimalist_creator1.png",
        structuredContent: MINIMALIST_CREATOR,
        html: "", css: ""
    },
    {
        id: "dark_sass",
        name: "Dark SaaS",
        niche: "Startup",
        preview: "/templates/screenshots/dark_sass1.png",
        structuredContent: DARK_SASS,
        html: "", css: ""
    },
    {
        id: "3d_designer",
        name: "3D Designer Portfolio",
        niche: "Creative",
        preview: "/templates/screenshots/3d_designer1.png",
        structuredContent: THREED_DESIGNER,
        html: "", css: ""
    },
    {
        id: "agency_vysion",
        name: "Vysion Agency",
        niche: "Agency",
        preview: "/templates/screenshots/vysion_agency.png",
        structuredContent: AGENCY_VYSION,
        html: "", css: ""
    },
    {
        id: "retro_pop",
        name: "Retro Pop",
        niche: "Creative",
        preview: "/templates/screenshots/retro_pop1.png",
        structuredContent: RETRO_POP,
        html: "", css: ""
    },
    {
        id: "grid_architect",
        name: "Grid Architect",
        niche: "Architecture",
        preview: "/templates/screenshots/grid_architect1.png",
        structuredContent: GRID_ARCHITECT,
        html: "", css: ""
    },
    {
        id: "typographic_bold",
        name: "Typographic Bold",
        niche: "Design",
        preview: "/templates/screenshots/typographic_bold1.png", 
        structuredContent: TYPOGRAPHIC_BOLD,
        html: "", css: ""
    },
    {
        id: "dev_brutalist",
        name: "Developer Brutalist",
        niche: "Engineering",
        preview: "/templates/screenshots/developer_brutalist1.png",
        structuredContent: DEV_BRUTALIST,
        html: "", css: ""
    },
    {
        id: "photographer_gallery",
        name: "Photographer Gallery",
        niche: "Photography",
        preview: "/templates/screenshots/photographer_gallery1.png",
        structuredContent: PHOTOGRAPHER_GALLERY,
        html: "", css: ""
    },
    {
        id: "startup_landing",
        name: "Startup Landing",
        niche: "Startup",
        preview: "/templates/screenshots/startup_landing.png",
        structuredContent: STARTUP_LANDING,
        html: "", css: ""
    }
];
