import { User, Project, Gem, ProjectLog, Tool, Repository, UsedID, TrainingModule, CompanyConfig } from '../types';
import { INITIAL_USERS, INITIAL_PROJECTS, INITIAL_GEMS, INITIAL_TOOLS, INITIAL_MODULES } from '../constants';

// Local Storage Keys
const USERS_KEY = 'SIMPLEDATA_users_v1'; 
const PROJECTS_KEY = 'SIMPLEDATA_projects_v1';
const GEMS_KEY = 'SIMPLEDATA_gems_v1';
const TOOLS_KEY = 'SIMPLEDATA_tools_v1';
const USED_IDS_KEY = 'SIMPLEDATA_used_ids_v1'; 
const CLOUD_SQL_CONFIG_KEY = 'SIMPLEDATA_cloud_sql_config_v1'; 
const MODULES_KEY = 'SIMPLEDATA_modules_v1'; // New Key
const COMPANY_CONFIG_KEY = 'SIMPLEDATA_company_config_v1'; // New Key

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface CloudSQLConfig {
    connectionName: string; 
    dbName: string;
    dbUser: string;
    proxyUrl: string; 
    provider: 'postgres' | 'mysql';
    isActive: boolean; 
}

export class DBService {
  private users: User[] = [];
  private projects: Project[] = [];
  private gems: Gem[] = [];
  private tools: Tool[] = [];
  private usedIds: UsedID[] = [];
  private modules: TrainingModule[] = [];
  private companyConfig: CompanyConfig = { title: 'PORTAL CORPORATIVO', subtitle: 'Centro de Capacitación' };
  
  private cloudSqlConfig: CloudSQLConfig = { 
      connectionName: '', 
      dbName: '', 
      dbUser: '', 
      proxyUrl: '',
      provider: 'postgres',
      isActive: false
  };

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    const savedSql = localStorage.getItem(CLOUD_SQL_CONFIG_KEY);
    if (savedSql) {
        this.cloudSqlConfig = JSON.parse(savedSql);
    }

    const savedUsers = localStorage.getItem(USERS_KEY);
    const savedProjects = localStorage.getItem(PROJECTS_KEY);
    const savedGems = localStorage.getItem(GEMS_KEY);
    const savedTools = localStorage.getItem(TOOLS_KEY);
    const savedIds = localStorage.getItem(USED_IDS_KEY);
    const savedModules = localStorage.getItem(MODULES_KEY);
    const savedConfig = localStorage.getItem(COMPANY_CONFIG_KEY);

    this.users = savedUsers ? JSON.parse(savedUsers) : [...INITIAL_USERS];
    this.projects = savedProjects ? JSON.parse(savedProjects) : [...INITIAL_PROJECTS];
    this.gems = savedGems ? JSON.parse(savedGems) : [...INITIAL_GEMS];
    this.tools = savedTools ? JSON.parse(savedTools) : [...INITIAL_TOOLS];
    this.usedIds = savedIds ? JSON.parse(savedIds) : [];
    this.modules = savedModules ? JSON.parse(savedModules) : [...INITIAL_MODULES];
    if (savedConfig) this.companyConfig = JSON.parse(savedConfig);
  }

  private saveLocal() {
    localStorage.setItem(USERS_KEY, JSON.stringify(this.users));
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(this.projects));
    localStorage.setItem(GEMS_KEY, JSON.stringify(this.gems));
    localStorage.setItem(TOOLS_KEY, JSON.stringify(this.tools));
    localStorage.setItem(USED_IDS_KEY, JSON.stringify(this.usedIds));
    localStorage.setItem(MODULES_KEY, JSON.stringify(this.modules));
    localStorage.setItem(COMPANY_CONFIG_KEY, JSON.stringify(this.companyConfig));
    localStorage.setItem(CLOUD_SQL_CONFIG_KEY, JSON.stringify(this.cloudSqlConfig));
  }

  // --- CLOUD SQL ENGINE ---

  getCloudSqlConfig() { return this.cloudSqlConfig; }
  
  saveCloudSqlConfig(config: CloudSQLConfig) { 
      this.cloudSqlConfig = config; 
      this.saveLocal(); 
  }

  async executeSql(text: string, params: any[] = []): Promise<any> {
      if (!this.cloudSqlConfig.proxyUrl) throw new Error("No Proxy URL configured");
      
      const response = await fetch(this.cloudSqlConfig.proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              query: text, 
              params: params,
              config: this.cloudSqlConfig 
          })
      });

      if (!response.ok) {
          const err = await response.text();
          throw new Error(`Cloud SQL Error: ${err}`);
      }
      
      const json = await response.json();
      return json.data; 
  }

  async initializeCloudSchema() {
      if (!this.cloudSqlConfig.isActive) return;
      
      const type = this.cloudSqlConfig.provider === 'postgres' ? 'JSONB' : 'JSON';
      const idType = 'VARCHAR(255) PRIMARY KEY';

      const tables = [
          `CREATE TABLE IF NOT EXISTS app_users (id ${idType}, content ${type});`,
          `CREATE TABLE IF NOT EXISTS app_projects (id ${idType}, content ${type});`,
          `CREATE TABLE IF NOT EXISTS app_gems (id ${idType}, content ${type});`,
          `CREATE TABLE IF NOT EXISTS app_tools (id ${idType}, content ${type});`,
          `CREATE TABLE IF NOT EXISTS app_used_ids (id ${idType}, content ${type});`,
          `CREATE TABLE IF NOT EXISTS app_training_modules (id ${idType}, content ${type});`, // New
          `CREATE TABLE IF NOT EXISTS app_config (id ${idType}, content ${type});` // New
      ];

      for (const query of tables) {
          await this.executeSql(query);
      }
  }

  async migrateLocalToCloud() {
      if (!this.cloudSqlConfig.isActive) throw new Error("Cloud connection not active");
      
      const upsert = async (table: string, items: any[]) => {
          for (const item of items) {
              const query = `
                  INSERT INTO ${table} (id, content) VALUES ($1, $2)
                  ON CONFLICT (id) DO UPDATE SET content = $2;
              `;
              await this.executeSql(query, [item.id, JSON.stringify(item)]);
          }
      };

      await upsert('app_users', this.users);
      await upsert('app_projects', this.projects);
      await upsert('app_gems', this.gems);
      await upsert('app_tools', this.tools);
      await upsert('app_used_ids', this.usedIds);
      await upsert('app_training_modules', this.modules);
      await upsert('app_config', [{id: 'global_config', ...this.companyConfig}]);
  }

  private async genericGet<T>(localData: T[], tableName: string): Promise<T[]> {
      if (this.cloudSqlConfig.isActive && this.cloudSqlConfig.proxyUrl) {
          try {
              const rows = await this.executeSql(`SELECT content FROM ${tableName}`);
              return rows.map((r: any) => r.content || JSON.parse(r.content));
          } catch (e) {
              console.warn(`Cloud Fetch Failed for ${tableName}, falling back to local.`, e);
              return localData;
          }
      }
      return localData;
  }

  private async genericSave<T extends { id: string }>(item: T, tableName: string, localList: T[], action: 'ADD' | 'UPDATE' | 'DELETE') {
      let newList = [...localList];
      if (action === 'DELETE') {
          newList = newList.filter(i => i.id !== item.id);
      } else if (action === 'UPDATE') {
          const idx = newList.findIndex(i => i.id === item.id);
          if (idx !== -1) newList[idx] = item;
      } else {
          newList.push(item);
      }
      
      if (tableName === 'app_users') this.users = newList as any;
      if (tableName === 'app_projects') this.projects = newList as any;
      if (tableName === 'app_gems') this.gems = newList as any;
      if (tableName === 'app_tools') this.tools = newList as any;
      if (tableName === 'app_training_modules') this.modules = newList as any;
      
      this.saveLocal();

      if (this.cloudSqlConfig.isActive && this.cloudSqlConfig.proxyUrl) {
          try {
              if (action === 'DELETE') {
                  await this.executeSql(`DELETE FROM ${tableName} WHERE id = $1`, [item.id]);
              } else {
                  await this.executeSql(`
                      INSERT INTO ${tableName} (id, content) VALUES ($1, $2)
                      ON CONFLICT (id) DO UPDATE SET content = $2
                  `, [item.id, JSON.stringify(item)]);
              }
          } catch (e) {
              console.error(`Cloud Sync Failed for ${tableName}`, e);
          }
      }
  }

  // --- CRUD OPERATIONS ---

  async resetToDefaults(): Promise<void> {
      this.users = [...INITIAL_USERS];
      this.projects = [...INITIAL_PROJECTS];
      this.gems = [...INITIAL_GEMS];
      this.tools = [...INITIAL_TOOLS];
      this.modules = [...INITIAL_MODULES];
      this.saveLocal();
  }

  // USERS
  async getUsers() { return this.genericGet(this.users, 'app_users'); }
  async addUser(u: User) { await this.genericSave(u, 'app_users', this.users, 'ADD'); }
  async updateUser(u: User) { await this.genericSave(u, 'app_users', this.users, 'UPDATE'); }
  async deleteUser(id: string) { await this.genericSave({ id } as User, 'app_users', this.users, 'DELETE'); }

  // PROJECTS
  async getProjects() { return this.genericGet(this.projects, 'app_projects'); }
  async addProject(p: Project) { await this.genericSave(p, 'app_projects', this.projects, 'ADD'); }
  async updateProject(p: Project) { await this.genericSave(p, 'app_projects', this.projects, 'UPDATE'); }
  async deleteProject(id: string) { await this.genericSave({ id } as Project, 'app_projects', this.projects, 'DELETE'); }

  // GEMS
  async getGems() { return this.genericGet(this.gems, 'app_gems'); }
  async addGem(g: Gem) { await this.genericSave(g, 'app_gems', this.gems, 'ADD'); }
  async updateGem(g: Gem) { await this.genericSave(g, 'app_gems', this.gems, 'UPDATE'); }
  async deleteGem(id: string) { await this.genericSave({ id } as Gem, 'app_gems', this.gems, 'DELETE'); }

  // TOOLS
  async getTools() { return this.genericGet(this.tools, 'app_tools'); }
  async addTool(t: Tool) { await this.genericSave(t, 'app_tools', this.tools, 'ADD'); }
  async updateTool(t: Tool) { await this.genericSave(t, 'app_tools', this.tools, 'UPDATE'); }
  async deleteTool(id: string) { await this.genericSave({ id } as Tool, 'app_tools', this.tools, 'DELETE'); }

  // USED IDS
  async getUsedIds() { return this.genericGet(this.usedIds, 'app_used_ids'); }
  async registerUsedId(record: UsedID) { 
       if (!this.usedIds.some(u => u.id === record.id)) {
           await this.genericSave(record, 'app_used_ids', this.usedIds, 'ADD');
       }
  }

  // TRAINING MODULES
  async getModules() { return this.genericGet(this.modules, 'app_training_modules'); }
  async addModule(m: TrainingModule) { await this.genericSave(m, 'app_training_modules', this.modules, 'ADD'); }
  async updateModule(m: TrainingModule) { await this.genericSave(m, 'app_training_modules', this.modules, 'UPDATE'); }
  async deleteModule(id: string) { await this.genericSave({ id } as TrainingModule, 'app_training_modules', this.modules, 'DELETE'); }

  // COMPANY CONFIG
  getCompanyConfig() { return this.companyConfig; }
  async saveCompanyConfig(c: CompanyConfig) {
      this.companyConfig = c;
      this.saveLocal();
      if(this.cloudSqlConfig.isActive) {
           await this.executeSql(`
              INSERT INTO app_config (id, content) VALUES ($1, $2)
              ON CONFLICT (id) DO UPDATE SET content = $2
          `, ['global_config', JSON.stringify({id: 'global_config', ...c})]);
      }
  }

  // --- RAW TABLE ACCESS FOR DB VIEW ---
  getTableData(tableName: string): any[] {
      switch(tableName) {
          case 'USERS': return this.users;
          case 'PROJECTS': return this.projects;
          case 'GEMS': return this.gems;
          case 'TOOLS': return this.tools;
          default: return [];
      }
  }

  async alterTable(tableName: string, action: 'ADD_COLUMN' | 'DROP_COLUMN', fieldName: string) {
      const data = this.getTableData(tableName);
      const updatedData = data.map(row => {
          if (action === 'ADD_COLUMN') {
              return { ...row, [fieldName]: '' };
          } else {
              const { [fieldName]: deleted, ...rest } = row;
              return rest;
          }
      });
      const map: any = { 'USERS': 'app_users', 'PROJECTS': 'app_projects', 'GEMS': 'app_gems', 'TOOLS': 'app_tools' };
      const internalName = map[tableName];
      
      if (internalName) {
          if (tableName === 'USERS') this.users = updatedData;
          if (tableName === 'PROJECTS') this.projects = updatedData;
          this.saveLocal();
          
          if (this.cloudSqlConfig.isActive) {
             await this.migrateLocalToCloud(); 
          }
      }
  }
}

export const db = new DBService();