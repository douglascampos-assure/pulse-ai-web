import { queryDatabricks } from "@/src/lib/databricks"
import { GOLD_GITHUB_TABLE } from "@/src/utils/constants"

const schema = process.env.DATABRICKS_SCHEMA_GOLD
const catalog = process.env.DATABRICKS_CATALOG

export async function GET() {
  try {
    let sql = `
      SELECT DISTINCT developer
      FROM ${catalog}.${schema}.${GOLD_GITHUB_TABLE}
    `;
    const result = await queryDatabricks(sql);
    const formatted = (result || []).map(row => ({
      value: row.developer,
      label: row.developer,
    }));
    return new Response(JSON.stringify(formatted || []), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}