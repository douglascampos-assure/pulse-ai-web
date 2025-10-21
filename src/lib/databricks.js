import { getDatabricksSession } from "./databricksClient.js";

export async function queryDatabricks(sqlQuery) {
  try {
    const session = await getDatabricksSession();
    const operation = await session.executeStatement(sqlQuery);
    const result = await operation.fetchAll();
    return result;
  } catch (error) {
    console.error("Error Databricks:", error);
    throw error;
  }
}
