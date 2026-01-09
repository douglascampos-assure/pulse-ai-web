import { queryDatabricks } from "@/src/lib/databricks";
import { getUserRole } from "@/src/lib/userRoles";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(req) {
  try {
    // 1. Get user from JWT
    const session = req.cookies.get("session")?.value;
    
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { payload } = await jwtVerify(session, secret);
    const userEmail = payload.email;

    // 2. Get user role
    const userRole = await getUserRole(userEmail);
    
    if (!userRole) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // 3. Build query with role-based filtering
    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";

    let whereClauses = ["team IS NOT NULL"];

    // 4. Apply role-based filters
    if (userRole.role === 'ADMIN') {
      // ADMIN sees only teams from their department
      whereClauses.push(`department = '${userRole.department}'`);
    }
    // ENGINEERING_ADMIN sees all teams (no additional filter)

    const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

    const sql = `
      SELECT DISTINCT team
      FROM ${catalog}.${schema}.google_sheets_feedback
      ${whereSQL}
      ORDER BY team ASC
    `;

    const result = await queryDatabricks(sql);
    
    console.log(`[ROLES] User: ${userEmail}, Role: ${userRole.role}, Teams returned: ${result.length}`);
    const teams = result.map(row => row.team);

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}