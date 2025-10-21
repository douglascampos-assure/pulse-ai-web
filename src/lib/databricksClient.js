import { DBSQLClient } from "@databricks/sql";
import { databricksConfig } from "@/src/lib/databricksConfig.js";

let databricksClient = null;
let session = null;

async function initSession() {
  if (!databricksClient) {
    databricksClient = new DBSQLClient();
    await databricksClient.connect({
      host: databricksConfig.serverHostname,
      path: databricksConfig.httpPath,
      token: databricksConfig.accessToken,
    });
  }

  if (!session) {
    session = await databricksClient.openSession();
    console.log("✅ Databricks session abierta");
  }
}

export async function getDatabricksSession() {
  try {
    if (!databricksClient || !session) {
      await initSession();
    }
    return session;
  } catch (error) {
    console.warn("⚠️ Reintentando abrir sesión Databricks:", error.message);
    databricksClient = null;
    session = null;
    await initSession();
    return session;
  }
}

export async function closeDatabricks() {
  if (session) await session.close();
  if (databricksClient) await databricksClient.close();
  databricksClient = null;
  session = null;
  console.log("🧹 Databricks cerrado");
}
