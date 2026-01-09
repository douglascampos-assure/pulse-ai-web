import { queryDatabricks } from "./databricks";
import { USER_ROLES_TABLE } from "@/src/utils/constants";

const catalog = process.env.DATABRICKS_CATALOG;
const schema = process.env.DATABRICKS_SCHEMA_GOLD;

/**
 * Get user role from user_roles table
 * @param {string} email - User email
 * @returns {Object|null} User role object or null if not found
 */
export async function getUserRole(email) {
  try {
    const result = await queryDatabricks(`
      SELECT 
        id,
        email,
        role,
        division,
        department,
        created_at,
        updated_at
      FROM ${catalog}.${schema}.${USER_ROLES_TABLE}
      WHERE email = '${email}'
      LIMIT 1
    `);

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error("Error fetching user role:", error);
    throw error;
  }
}

/**
 * Check if user is authorized (exists in user_roles table)
 * @param {string} email - User email
 * @returns {boolean} True if authorized
 */
export async function isUserAuthorized(email) {
  const userRole = await getUserRole(email);
  return userRole !== null;
}

/**
 * Get visible employees based on user role
 * @param {Object} userRole - User role object from getUserRole
 * @param {Array} allEmployees - All employees array
 * @returns {Array} Filtered employees based on role permissions
 */
export function getVisibleEmployees(userRole, allEmployees) {
  if (!userRole) {
    return [];
  }

  // ENGINEERING_ADMIN sees all Engineering division
  if (userRole.role === 'ENGINEERING_ADMIN') {
    return allEmployees.filter(emp => 
      emp.division === 'Engineering'
    );
  }

  // ADMIN sees only their department
  if (userRole.role === 'ADMIN') {
    return allEmployees.filter(emp => 
      emp.division === userRole.division &&
      emp.department === userRole.department
    );
  }

  // Unknown role = no access
  return [];
}