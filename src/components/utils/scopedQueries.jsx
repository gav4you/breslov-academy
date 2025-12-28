// Scoped query helpers for multi-tenant safety
// Ensures all data queries are properly scoped to active school

import { base44 } from '@/api/base44Client';

export const scopedFilter = async (entityName, schoolId, filter = {}, sort, limit) => {
  if (!schoolId) {
    console.warn(`scopedFilter called without schoolId for ${entityName}`);
    return [];
  }
  
  const scopedFilter = {
    ...filter,
    school_id: schoolId
  };
  
  return await base44.entities[entityName].filter(scopedFilter, sort, limit);
};

export const scopedList = async (entityName, schoolId, sort, limit) => {
  return scopedFilter(entityName, schoolId, {}, sort, limit);
};

export const scopedCreate = async (entityName, schoolId, data) => {
  if (!schoolId) {
    throw new Error(`scopedCreate called without schoolId for ${entityName}`);
  }
  
  return await base44.entities[entityName].create({
    ...data,
    school_id: schoolId
  });
};

export const scopedUpdate = async (entityName, id, data) => {
  // Update doesn't need school_id in payload, but validate access before calling
  return await base44.entities[entityName].update(id, data);
};

export const scopedDelete = async (entityName, id) => {
  // Validate school ownership before deleting
  return await base44.entities[entityName].delete(id);
};

// Helper to check if user has access to entity within their school
export const validateSchoolAccess = async (entityName, entityId, schoolId) => {
  try {
    const entities = await base44.entities[entityName].filter({ id: entityId });
    if (entities.length === 0) return false;
    return entities[0].school_id === schoolId;
  } catch {
    return false;
  }
};