import { queryDatabricks } from "@/src/lib/databricks";

const schema = process.env.DATABRICKS_SCHEMA_GOLD;
const meetings = process.env.DATABRICKS_TABLE_MEETINGS;
const meetings_enriched = process.env.DATABRICKS_TABLE_MEETINGS_ENRICHED;
const catalog = process.env.DATABRICKS_CATALOG;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const sql = `
      SELECT *
      FROM workspace.silver.attendee_participations_clean
      WHERE meeting_url IN (
        SELECT meeting_url 
        FROM ${catalog}.${schema}.${meetings}
        WHERE correo='${email}'
        LIMIT 20
      )
    `;
    console.log("sql!!!!!");
    console.log(sql);
    const result = await queryDatabricks(sql);
    return new Response(JSON.stringify(result || []), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}