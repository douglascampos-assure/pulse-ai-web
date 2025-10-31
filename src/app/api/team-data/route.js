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
    const schema_gold = process.env.DATABRICKS_SCHEMA_GOLD;

    // 1️⃣ Miembros
    const membersResult = await queryDatabricks(`
      SELECT WorkEmail, FirstName, LastName, Department, Lead, Role
      FROM ${catalog}.${schema}.google_sheets_employees
      WHERE Team = '${teamName}'
        AND WorkEmail IS NOT NULL
    `);

    const members = membersResult || [];
    const emails = members.map((m) => m.WorkEmail);
    if (emails.length === 0) {
      return NextResponse.json({ members: [], kudos: [] });
    }

    const emailsList = emails.map((e) => `'${e}'`).join(", ");

    // 2️⃣ Kudos
    const kudosResult = await queryDatabricks(`
      SELECT workEmail
      FROM ${catalog}.${schema_gold}.slack_kudos_enriched
      WHERE workEmail IN (${emailsList})
    `);

    const kudosCountMap = kudosResult.reduce((acc, k) => {
      const email = k.workEmail?.toLowerCase();
      if (email) acc[email] = (acc[email] || 0) + 1;
      return acc;
    }, {});

    // 3️⃣ Horas semanales
    const weeklyResult = await queryDatabricks(`
      SELECT owner_email, week, total_horas
      FROM ${catalog}.${schema_gold}.calendar_gold_weekly
      WHERE owner_email IN (${emailsList})
          AND week = WEEKOFYEAR(current_date())
    `);

    const weeklyHoursMap = weeklyResult.reduce((acc, row) => {
      const email = row.owner_email?.toLowerCase();
      if (email) acc[email] = row.total_horas || 0;
      return acc;
    }, {});

    const totalWeeklyHours = weeklyResult.reduce(
      (sum, row) => sum + (row.total_horas || 0),
      0
    );
    const avgWeeklyHours =
      members.length > 0 ? totalWeeklyHours / members.length : 0;

    // 4️⃣ Sentiment (nuevo)
    const sentimentResult = await queryDatabricks(`
    SELECT Email AS workEmail, Sentiment
    FROM ${catalog}.${schema_gold}.feedback_enriched
    WHERE Email IN (${emailsList})
        AND Sentiment IS NOT NULL
    `);

    const sentimentMap = sentimentResult.reduce((acc, row) => {
      const email = row.workEmail?.toLowerCase();
      if (!email) return acc;

      if (!acc[email]) acc[email] = { total: 0, count: 0 };

      let score = 0;
      if (row.Sentiment === "Positive") score = 1;
      else if (row.Sentiment === "Negative") score = -1;

      acc[email].total += score;
      acc[email].count += 1;
      return acc;
    }, {});

    // 5️⃣ Enriquecer miembros
    const enrichedMembers = members.map((m) => {
      const email = m.WorkEmail?.toLowerCase();
      const sentimentData = sentimentMap[email];
      const sentimentScore =
        sentimentData && sentimentData.count > 0
          ? sentimentData.total / sentimentData.count
          : 0;

      let sentimentLabel = "Neutral";
      if (sentimentScore > 0.2) sentimentLabel = "Positive";
      else if (sentimentScore < -0.2) sentimentLabel = "Negative";

      return {
        ...m,
        kudosCount: kudosCountMap[email] || 0,
        weeklyHours: weeklyHoursMap[email] || 0,
        sentimentScore,
        sentimentLabel,
      };
    });

    // 6️⃣ Totales
    const totalKudos = enrichedMembers.reduce(
      (sum, m) => sum + (m.kudosCount || 0),
      0
    );

    const avgSentimentScore =
      enrichedMembers.reduce((sum, m) => sum + m.sentimentScore, 0) /
      (enrichedMembers.length || 1);

    let avgSentimentLabel = "Neutral";
    if (avgSentimentScore > 0.2) avgSentimentLabel = "Positive";
    else if (avgSentimentScore < -0.2) avgSentimentLabel = "Negative";

    // ✅ Respuesta final
    return NextResponse.json({
      team: teamName,
      totalKudos,
      totalWeeklyHours,
      avgWeeklyHours,
      avgSentimentScore,
      avgSentimentLabel,
      members: enrichedMembers,
    });
  } catch (error) {
    console.error("Error fetching team data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
