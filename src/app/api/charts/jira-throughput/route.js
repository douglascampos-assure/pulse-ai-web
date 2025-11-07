import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");         // 'project_id'
    const employee = searchParams.get("employee"); // 'employee_id'
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const periodicity = searchParams.get("periodicity") || "2week"; // 'sprint', '1week', '2week', '1month'

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";
    const table = "jira_metrics"; // Asumo el nombre de la tabla

    const whereClauses = [
      `done_date IS NOT NULL`, // ¡Clave! Throughput solo mide tickets cerrados.
      `issue_type IS NOT NULL` // ¡Columna asumida! Asegúrate de que exista.
    ];

    if (team) whereClauses.push(`project_id = '${team.replace(/'/g, "''")}'`);
    if (employee) whereClauses.push(`employee_id = '${employee.replace(/'/g, "''")}'`);
    if (startDate) whereClauses.push(`done_date >= '${startDate}'`);
    if (endDate) whereClauses.push(`done_date <= '${endDate}'`);

    let periodColumn;
    let orderByColumn = "period ASC";

    switch (periodicity) {
      case "sprint":
        periodColumn = "sprint";
        whereClauses.push(`sprint IS NOT NULL AND TRIM(sprint) <> ''`);
        // No podemos ordenar 'sprint' alfabéticamente, así que ordenamos por la fecha promedio de cierre
        orderByColumn = "MIN(done_date) ASC"; 
        break;
      case "1week":
        periodColumn = "date_trunc('week', done_date)";
        break;
      case "1month":
        periodColumn = "date_trunc('month', done_date)";
        break;
      case "2week":
      default:
        // Agrupa por períodos de 2 semanas (basado en un lunes de referencia)
        periodColumn = "date_add('1970-01-05', (floor(datediff(done_date, '1970-01-05') / 14) * 14))";
        break;
    }

    const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

    const sql = `
      SELECT
        ${periodColumn} AS period,
        issue_type, -- ¡Columna asumida!
        COUNT(DISTINCT issue_key) AS count
      FROM ${catalog}.${schema}.${table}
      ${whereSQL}
      GROUP BY
        period, issue_type
      ORDER BY
        ${orderByColumn}
    `;

    const rows = await queryDatabricks(sql);
    
    // Formatear fechas para que sean legibles en el gráfico
    const formattedRows = rows.map(row => ({
      ...row,
      // Si el período es una fecha (no un sprint), formatéalo como YYYY-MM-DD
      period: row.period instanceof Date ? row.period.toISOString().split('T')[0] : row.period,
    }));

    return NextResponse.json(Array.isArray(rows) ? formattedRows : []);
  } catch (error) {
    console.error("Error fetching throughput data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}