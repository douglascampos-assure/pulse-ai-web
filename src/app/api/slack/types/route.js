import { queryDatabricks } from "@/src/lib/databricks";

const schema = process.env.DATABRICKS_SCHEMA_GOLD;
const slack = process.env.DATABRICKS_TABLE_SLACK;
const catalog = process.env.DATABRICKS_CATALOG;

export async function GET() {
  try {
    let sql = `
      SELECT DISTINCT type_congratulation
      FROM ${catalog}.${schema}.${slack}
      WHERE type_congratulation is not NULL
    `;
    const result = await queryDatabricks(sql);
    const formatted = (result || []).map(row => ({
      value: row.type_congratulation,
      label: row.type_congratulation,
    }));
    return new Response(JSON.stringify(formatted || []), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}