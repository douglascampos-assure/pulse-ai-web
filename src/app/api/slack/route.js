import { queryDatabricks } from "@/src/lib/databricks"
import { GOLD_SLACK_TABLE } from "@/src/utils/constants"

const schema = process.env.DATABRICKS_SCHEMA_GOLD
const catalog = process.env.DATABRICKS_CATALOG

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get("employee")
    const pin = searchParams.get("pin")
    const type = searchParams.get("type")
    const detail = searchParams.get("detail")
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")
    const supervisor = searchParams.get("supervisor")
    const team = searchParams.get("team")
    let sql = `
      SELECT *
      FROM ${catalog}.${schema}.${GOLD_SLACK_TABLE}
      WHERE type_congratulation IS NOT NULL AND work_email IS NOT NULL AND TRIM(type_congratulation) <> '' AND TRIM(work_email) <> ''
    `;
    if (employeeId) {
        sql += ` AND work_email = '${employeeId}'`
    }
    if (pin) {
        sql += ` AND pin_congratulation = '${pin}'`
    }
    if (type) {
        sql += ` AND type_congratulation = '${type}'`
    }
    if (detail) {
        sql += ` AND detail_congratulation ='${detail}'`
    }
    if (startDate) {
      sql += ` AND DATE(congratulations_date) >= DATE('${startDate}')`;
    }
    if (endDate) {
      sql += ` AND DATE(congratulations_date) <= DATE('${endDate}')`;
    }
    if (supervisor) {
        sql += ` AND reporting_to LIKE '%${supervisor}%'`
    }
    if (team) {
        sql += ` AND team LIKE '%${team}%'`
    }
    const result = await queryDatabricks(sql)
    return new Response(JSON.stringify(result || []), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }
}