import { queryDatabricks } from "@/src/lib/databricks"
import { GOLD_SLACK_TABLE } from "@/src/utils/constants"

const schema = process.env.DATABRICKS_SCHEMA_GOLD
const catalog = process.env.DATABRICKS_CATALOG

export async function GET() {
  try {
    let sql = `
      SELECT DISTINCT reporting_to
      FROM ${catalog}.${schema}.${GOLD_SLACK_TABLE}
      WHERE type_congratulation is not NULL AND reporting_to IS NOT NULL AND work_email IS NOT NULL AND TRIM(reporting_to) <> '' AND TRIM(work_email) <> '' AND TRIM(type_congratulation) <> ''
    `;
    const result = await queryDatabricks(sql);

    const uniqueValues = new Set();
    (result || []).forEach(row => {
      if (row.reporting_to) {
        row.reporting_to
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