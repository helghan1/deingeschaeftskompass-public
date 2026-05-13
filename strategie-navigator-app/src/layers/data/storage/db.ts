import Dexie, { type EntityTable } from 'dexie';
import { Project } from '../../domain/core/types';

export class StrategieNavigatorDB extends Dexie {
  projects!: EntityTable<Project, 'id'>;

  constructor() {
    super('StrategieNavigatorDB');
    this.version(1).stores({
      projects: 'id, name, industry, createdAt, updatedAt'
    });
  }
}

export const db = new StrategieNavigatorDB();
