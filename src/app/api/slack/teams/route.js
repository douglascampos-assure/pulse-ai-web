import { queryDatabricks } from "@/src/lib/databricks"
import { GOLD_SLACK_TABLE } from "@/src/utils/constants"

const schema = process.env.DATABRICKS_SCHEMA_GOLD
const catalog = process.env.DATABRICKS_CATALOG

export async function GET() {
  try {
    let sql = `
      SELECT DISTINCT team
      FROM ${catalog}.${schema}.${GOLD_SLACK_TABLE}
      WHERE type_congratulation is not NULL AND team IS NOT NULL AND work_email IS NOT NULL AND TRIM(team) <> '' AND TRIM(work_email) <> '' AND TRIM(type_congratulation) <> ''
    `;
    const result = await queryDatabricks(sql);

    const uniqueValues = new Set();
    (result || []).forEach(row => {
      if (row.team) {
        row.team
          .split(',')
          .map(v => v.trim())
          .filter(v => v !== '')
          .forEach(v => uniqueValues.add(v));
      }
    });
    const formatted = Array.from(uniqueValues).map(v => ({
      value: v,
      label: v,
    }));

    return new Response(JSON.stringify(formatted || []), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}