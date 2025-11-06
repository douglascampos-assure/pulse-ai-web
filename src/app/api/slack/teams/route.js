import { queryDatabricks } from "@/src/lib/databricks"
import { GOLD_SLACK_TABLE } from "@/src/utils/constants"

const schema = process.env.DATABRICKS_SCHEMA_GOLD
const catalog = process.env.DATABRICKS_CATALOG

export async function GET() {
  try {
    let sql = `
      SELECT DISTINCT team
      FROM ${catalog}.${schema}.${GOLD_SLACK_TABLE}
      WHERE type_congratulation is not NULL AND team IS NOT NULL AND employee_id IS NOT NULL AND TRIM(team) <> '' AND TRIM(employee_id) <> '' AND TRIM(type_congratulation) <> ''
    `;
    const result = await queryDatabricks(sql);
    const formatted = (result || []).map(row => ({
      value: row.team,
      label: row.team,
    }));
    return new Response(JSON.stringify(formatted || []), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}