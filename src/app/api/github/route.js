import { queryDatabricks } from "@/src/lib/databricks"
import { GOLD_GITHUB_TABLE } from "@/src/utils/constants"

const schema = process.env.DATABRICKS_SCHEMA_GOLD
const catalog = process.env.DATABRICKS_CATALOG

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const developer = searchParams.get("developer")
    const team = searchParams.get("team")
    let sql = `
      SELECT *
      FROM ${catalog}.${schema}.${GOLD_GITHUB_TABLE}
      WHERE developer IS NOT NULL AND TRIM(developer) <> ''
    `;
    if (developer) {
        sql += ` AND developer = '${developer}'`
    }
    if (team) {
        sql += ` AND employee_team = '${team}'`
    }

    const result = await queryDatabricks(sql)
    return new Response(JSON.stringify(result || []), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }
}