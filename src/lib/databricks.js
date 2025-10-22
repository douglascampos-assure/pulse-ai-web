import { getDatabricksSession } from "./databricksClient.js";

export async function queryDatabricks(sqlQuery, options) {
  try {
    const session = await getDatabricksSession();
    const operation = await session.executeStatement(sqlQuery, options);
    const result = await operation.fetchAll();
    return result;
  } catch (error) {
    console.error("Error Databricks:", error);
    throw error;
  }
}
