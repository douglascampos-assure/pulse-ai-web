import { queryDatabricks } from "@/src/lib/databricks"
import { GOLD_GITHUB_TABLE } from "@/src/utils/constants"

const schema = process.env.DATABRICKS_SCHEMA_GOLD
const catalog = process.env.DATABRICKS_CATALOG

export async function GET() {
  try {
    let sql = `
      SELECT DISTINCT developer, display_name
      FROM ${catalog}.${schema}.${GOLD_GITHUB_TABLE}
      WHERE developer IS NOT NULL AND TRIM(developer) <> ''
    `;
    const result = await queryDatabricks(sql);
    const formatted = (result || []).map(row => ({
      value: row.developer,
      label: row.display_name,
    }));
    return new Response(JSON.stringify(formatted || []), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}