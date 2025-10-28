import { queryDatabricks } from "@/src/lib/databricks";

const schema = process.env.DATABRICKS_SCHEMA_BRONZE;
const table = process.env.DATABRICKS_TABLE_CALENDAR;
const catalog = process.env.DATABRICKS_CATALOG;

export async function GET() {
  try {
    const sql = `
      SELECT * 
      FROM ${catalog}.${schema}.${table}
      LIMIT 20
    `;
    const result = await queryDatabricks(sql);
    return new Response(JSON.stringify(result || []), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
