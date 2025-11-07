import { queryDatabricks } from "@/src/lib/databricks"
import { GOLD_SLACK_TABLE } from "@/src/utils/constants"

const schema = process.env.DATABRICKS_SCHEMA_GOLD
const catalog = process.env.DATABRICKS_CATALOG

export async function GET() {
  try {
    let sql = `
      SELECT DISTINCT display_name, work_email
      FROM ${catalog}.${schema}.${GOLD_SLACK_TABLE}
      WHERE type_congratulation is not NULL AND display_name IS NOT NULL AND work_email IS NOT NULL AND TRIM(type_congratulation) <> '' AND TRIM(work_email) <> '' AND TRIM(display_name) <> ''
    `;
    const result = await queryDatabricks(sql);
    const formatted = (result || []).map(row => ({
      value: row.work_email,
      label: row.display_name,
    }));
    return new Response(JSON.stringify(formatted || []), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}