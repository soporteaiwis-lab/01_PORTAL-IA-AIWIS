
export enum UserRole {
  MASTER_ROOT = 'Master Root', // Nuevo Rol Supremo
  ADMIN = 'Super Admin',
  CEO = 'CEO',
  PROJECT_MANAGER = 'Project Manager',
  DEVELOPER = 'Developer',
  DESIGNER = 'Designer',
  ANALYST = 'Analyst',
  STUDENT = 'Estudiante' // Nuevo rol para capacitados
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string;
  avatar: string;
  skills: { name: string; level: number }[];
  projects: string[];
  completedVideoIds?: string[]; // Para trackear progreso de capacitación
}

export interface ProjectLog {
  id: string;
  date: string;
  text: string;
  author: string;
  link?: string;
}

export interface Repository {
  id: string;
  alias: string;
  url: string;
  type: 'github' | 'drive' | 'other';
}

export type ProjectStatus = 'Planificación' | 'En Desarrollo' | 'En QA' | 'Despliegue' | 'Finalizado' | 'En Curso';

export interface Project {
  id: string;
  name: string;
  client: string;
  encargadoCliente?: string;
  leadId: string;
  teamIds: string[];
  status: ProjectStatus;
  isOngoing: boolean;
  report: boolean;
  deadline: string;
  startDate?: string;
  progress: number;
  description: string;
  technologies: string[];
  year: number;
  logs: ProjectLog[];
  repositories: Repository[];
}

export interface UsedID {
  id: string;
  name: string;
  dateUsed: string;
  createdBy: string;
}

export interface Gem {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
}

export interface Tool {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  isLocal?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// --- TRAINING PORTAL TYPES ---
export interface TrainingVideo {
  id: string;
  title: string;
  url: string; // YouTube or Meet Link
  duration: string; // e.g. "15 min"
  type: 'video' | 'meet';
  transcriptionUrl?: string; // Drive Link
  quizUrl?: string; // Form Link
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  videos: TrainingVideo[];
  order: number;
}

export interface CompanyConfig {
    title: string;
    subtitle: string;
}

export enum AppRoute {
  DASHBOARD = 'dashboard', // Inicio General
  CLASSES = 'classes', // Nueva Ruta Exclusiva Clases
  PROJECTS = 'projects',
  GEMS = 'gems',
  TEAM = 'team',
  REPORTS = 'reports',
  TOOLS = 'tools',
  ADMIN = 'admin_panel',
  DATABASE = 'database_manager'
}