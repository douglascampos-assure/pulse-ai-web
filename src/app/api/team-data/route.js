// app/api/teamData/route.js
import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const teamName = searchParams.get("team");
    if (!teamName) {
      return NextResponse.json(
        { error: "Team name required" },
        { status: 400 }
      );
    }

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = process.env.DATABRICKS_SCHEMA_BRONZE;

    // 1️⃣ Traer miembros del equipo
    const membersResult = await queryDatabricks(`
      SELECT WorkEmail, FIrstName, LastName, Department, Lead, Role
      FROM ${catalog}.${schema}.google_sheets_employees
      WHERE Team = '${teamName}'
        AND WorkEmail IS NOT NULL
    `);

    console.log(membersResult);

    const members = membersResult || [];
    const emails = members.map((m) => m.WorkEmail);
    if (emails.length === 0) {
      return NextResponse.json({ members: [], kudos: [] });
    }

    // 2️⃣ Traer kudos de Slack para esos miembros
    const emailsList = emails.map((e) => `'${e}'`).join(", ");
    const kudosResult = await queryDatabricks(`
      SELECT *
      FROM ${catalog}.${schema}.slack_kudos
      WHERE workEmail IN (${emailsList})
    `);

    return NextResponse.json({
      members,
      kudos: kudosResult || [],
    });
  } catch (error) {
    console.error("Error fetching team data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
