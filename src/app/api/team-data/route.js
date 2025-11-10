import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const teamName = searchParams.get("team");

    console.log(teamName);

    if (!teamName) {
      return NextResponse.json(
        { error: "Team name required" },
        { status: 400 }
      );
    }

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = process.env.DATABRICKS_SCHEMA_BRONZE;
    const schema_gold = process.env.DATABRICKS_SCHEMA_GOLD;

    // 1️⃣ Miembros del equipo
    const membersResult = await queryDatabricks(`
      SELECT WorkEmail, FirstName, LastName, Department, Lead, Role
      FROM ${catalog}.${schema}.google_sheets_employees
      WHERE Team = '${teamName}'
        AND WorkEmail IS NOT NULL
    `);

    const members = membersResult || [];
    const emails = members.map((m) => m.WorkEmail);
    if (emails.length === 0) {
      return NextResponse.json({ members: [], performance: {} });
    }

    const emailsList = emails.map((e) => `'${e}'`).join(", ");

    const likeConditions = members.map(
      (m) => `LOWER(assignee) LIKE LOWER('%${m.FirstName}%${m.LastName}%')`
    );
    const whereClause = likeConditions.join(" OR ");

    // 2️⃣ Jira data (últimos 3 meses)
    const jiraResult = await queryDatabricks(`
      SELECT 
        assignee,
        status,
        created_at,
        story_points,
        key AS issue_key,
        summary
      FROM ${catalog}.${schema}.jira_issues
      WHERE (${whereClause})
        AND created_at >= date_add(current_date(), -90)
    `);

    // Mapa por persona
    const jiraMap = {};
    jiraResult.forEach((row) => {
      const email = row.assignee?.toLowerCase();
      if (!email) return;
      if (!jiraMap[email]) {
        jiraMap[email] = {
          assigned: 0,
          completed: 0,
          storyPointsTotal: 0,
          storyPointsCompleted: 0,
        };
      }
      jiraMap[email].assigned += 1;
      const sp = Number(row.story_points) || 0;
      jiraMap[email].storyPointsTotal += sp;
      if (["Done", "READY FOR QA", "Closed"].includes(row.status)) {
        jiraMap[email].completed += 1;
        jiraMap[email].storyPointsCompleted += sp;
      }
    });

    // Totales del equipo
    const totalAssigned = Object.values(jiraMap).reduce(
      (s, m) => s + m.assigned,
      0
    );
    const totalCompleted = Object.values(jiraMap).reduce(
      (s, m) => s + m.completed,
      0
    );
    const totalStoryPoints = Object.values(jiraMap).reduce(
      (s, m) => s + m.storyPointsTotal,
      0
    );
    const completedStoryPoints = Object.values(jiraMap).reduce(
      (s, m) => s + m.storyPointsCompleted,
      0
    );

    // 3️⃣ Kudos
    const kudosResult = await queryDatabricks(`
      SELECT work_email
      FROM ${catalog}.${schema_gold}.slack_kudos_enriched
      WHERE work_email IN (${emailsList})
    `);

    const kudosCountMap = kudosResult.reduce((acc, k) => {
      const email = k.work_email?.toLowerCase();
      if (email) acc[email] = (acc[email] || 0) + 1;
      return acc;
    }, {});

    console.log(kudosCountMap);

    // 4️⃣ Horas semanales
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

    // 5️⃣ Sentiment (feedback)
    const sentimentResult = await queryDatabricks(`
      SELECT Email AS work_email, Sentiment
      FROM ${catalog}.${schema_gold}.feedback_enriched
      WHERE Email IN (${emailsList})
        AND Sentiment IS NOT NULL
    `);

    const sentimentMap = sentimentResult.reduce((acc, row) => {
      const email = row.work_email?.toLowerCase();
      if (!email) return acc;
      if (!acc[email]) acc[email] = { total: 0, count: 0 };

      let score = 0;
      if (row.Sentiment === "Positive") score = 1;
      else if (row.Sentiment === "Negative") score = -1;

      acc[email].total += score;
      acc[email].count += 1;
      return acc;
    }, {});

    // 6️⃣ Enriquecer miembros
    const enrichedMembers = members.map((m) => {
      const email = m.WorkEmail?.toLowerCase();

      // Sentiment promedio
      const sentimentData = sentimentMap[email];
      const sentimentScore =
        sentimentData && sentimentData.count > 0
          ? sentimentData.total / sentimentData.count
          : 0;

      let sentimentLabel = "Neutral";
      if (sentimentScore > 0.2) sentimentLabel = "Positive";
      else if (sentimentScore < -0.2) sentimentLabel = "Negative";

      // Jira performance
      const jiraStats = jiraMap[email] || {
        assigned: 0,
        completed: 0,
        storyPointsTotal: 0,
        storyPointsCompleted: 0,
      };

      return {
        ...m,
        kudosCount: kudosCountMap[email] || 0,
        weeklyHours: weeklyHoursMap[email] || 0,
        sentimentScore,
        sentimentLabel,
        jiraAssigned: jiraStats.assigned,
        jiraCompleted: jiraStats.completed,
        storyPointsTotal: jiraStats.storyPointsTotal,
        storyPointsCompleted: jiraStats.storyPointsCompleted,
      };
    });

    // 7️⃣ Totales del equipo
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
      range: "last_3_months",
      totalKudos,
      totalWeeklyHours,
      avgWeeklyHours,
      avgSentimentScore,
      avgSentimentLabel,
      totalAssigned,
      totalCompleted,
      totalStoryPoints,
      completedStoryPoints,
      members: enrichedMembers,
      warnings: [
        {
          message:
            "Emilio Espinoza in Team Pulse AI has a predominant negative feedback.",
          type: "negative",
        },
        {
          message:
            "Alvaro Mercado, Roger Garcia in Team Pulse AI are having less than 85% camera engagement in the meetings.",
          type: "alert",
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching team data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
