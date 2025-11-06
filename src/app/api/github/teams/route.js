import { queryDatabricks } from "@/src/lib/databricks"
import { GOLD_GITHUB_TABLE } from "@/src/utils/constants"

const schema = process.env.DATABRICKS_SCHEMA_GOLD
const catalog = process.env.DATABRICKS_CATALOG

export async function GET() {
  try {
    let sql = `
      SELECT DISTINCT employee_team
      FROM ${catalog}.${schema}.${GOLD_GITHUB_TABLE}
      WHERE developer IS NOT NULL AND TRIM(developer) <> '' AND employee_team IS NOT NULL AND TRIM(employee_team) <> ''
    `;
    const result = await queryDatabricks(sql);
    const formatted = (result || []).map(row => ({
      value: row.employee_team,
      label: row.employee_team,
    }));
    return new Response(JSON.stringify(formatted || []), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}