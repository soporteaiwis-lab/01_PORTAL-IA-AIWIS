import { User, UserRole, Project, Gem, Tool, TrainingModule } from './types';

// --- CONFIGURACIÓN DE ENTORNO (.ENV & LOCAL STORAGE) ---
const getEnvVar = (key: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  if (typeof process !== 'undefined' && process.env && process.env[`REACT_APP_${key}`]) {
    return process.env[`REACT_APP_${key}`] as string;
  }
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      if (import.meta.env[key]) return import.meta.env[key];
      // @ts-ignore
      if (import.meta.env[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
      const SIMPLEDATAKey = localStorage.getItem(`SIMPLEDATA_env_${key}`);
      if (SIMPLEDATAKey) return SIMPLEDATAKey;
      const simpleKey = localStorage.getItem(`simple_env_${key}`);
      if (simpleKey) return simpleKey;
  }
  return '';
};

const HARDCODED_KEYS = {
    GEMINI: "PEGAR_AQUI_TU_API_KEY_DE_GEMINI",
    GITHUB: "PEGAR_AQUI_TU_TOKEN_GITHUB_PAT",
    DRIVE_CLIENT_ID: "89422266816-u5nshe6d09vf4i72efirip5khd66gqp0.apps.googleusercontent.com" 
};

export const APP_CONFIG = {
  GEMINI_API_KEY: getEnvVar('API_KEY') || HARDCODED_KEYS.GEMINI, 
  GITHUB_TOKEN: getEnvVar('GITHUB_TOKEN') || HARDCODED_KEYS.GITHUB,
  GOOGLE_CLIENT_ID: getEnvVar('GOOGLE_CLIENT_ID') || HARDCODED_KEYS.DRIVE_CLIENT_ID
};

export const INITIAL_USERS: User[] = [
  // --- MASTER ROOT USER ---
  {
    id: "u_root_aiwis",
    name: "AIWIS Master",
    role: UserRole.MASTER_ROOT,
    email: "aiwis", // Simplified login
    password: "123123",
    avatar: "https://ui-avatars.com/api/?name=AIWIS+Root&background=000&color=fff&bold=true",
    skills: [{ name: "Omnipotencia", level: 100 }],
    projects: [],
    completedVideoIds: []
  },
  {
    id: "u_soporte",
    name: "Soporte AIWIS",
    role: UserRole.ADMIN,
    email: "soporte.aiwis@gmail.com",
    password: "123",
    avatar: "https://ui-avatars.com/api/?name=AIWIS+Soporte&background=000000&color=fff",
    skills: [{ name: "System Architecture", level: 100 }, { name: "Mentoring", level: 100 }],
    projects: ["PROYECTO_001"],
    completedVideoIds: []
  },
  {
    id: "u_estudiante1",
    name: "Estudiante Demo",
    role: UserRole.STUDENT,
    email: "alumno@aiwis.cl",
    password: "1234",
    avatar: "https://ui-avatars.com/api/?name=Estudiante+Demo&background=random",
    skills: [{ name: "Aprendizaje", level: 10 }],
    projects: [],
    completedVideoIds: []
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'PROYECTO_001',
    name: 'Migración Infraestructura Cloud',
    client: 'Interno AIWIS',
    encargadoCliente: 'Gerencia AIWIS',
    leadId: 'u_soporte', 
    teamIds: ['u_soporte'],
    status: 'En Curso',
    isOngoing: true,
    report: true,
    startDate: '2025-01-15',
    deadline: '2025-06-30',
    progress: 45,
    year: 2025,
    description: 'Proyecto de modernización de infraestructura y servicios core.',
    technologies: ['AWS', 'Terraform', 'React'],
    logs: [],
    repositories: []
  }
];

export const INITIAL_GEMS: Gem[] = [
    { id: 'g1', url: 'https://gemini.google.com/gem/6257c452aac9', name: 'COTIZACIONES', description: 'Asistente experto en la generación y análisis de cotizaciones.', icon: 'fa-calculator' },
    { id: 'g2', url: 'https://gemini.google.com/gem/fa10051c004b', name: 'PIPELINES AZURE', description: 'Especialista en crear pipelines de Azure y archivos JSON.', icon: 'fa-cloud' }
];

export const INITIAL_TOOLS: Tool[] = [
  { id: 't1', name: 'VS Code Web', url: 'https://vscode.dev', icon: 'fa-code', color: 'text-blue-500' },
  { id: 't5', name: 'Gemini', url: 'https://gemini.google.com', icon: 'fa-gem', color: 'text-purple-500' }
];

// --- INITIAL TRAINING DATA ---
export const INITIAL_MODULES: TrainingModule[] = [
    {
        id: 'mod_1',
        title: 'Módulo 1: Inducción AIWIS',
        description: 'Bienvenida a la cultura y herramientas de la empresa.',
        order: 1,
        videos: [
            { id: 'v1', title: 'Visión y Misión', url: 'https://www.youtube.com/watch?v=engvideo1', duration: '10 min', type: 'video' },
            { id: 'v2', title: 'Uso del Portal', url: 'https://meet.google.com/abc-defg-hij', duration: '45 min', type: 'meet' }
        ]
    }
];