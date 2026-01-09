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
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = "gold";

    let whereClauses = ["employeeId IS NOT NULL", "employee IS NOT NULL"];
    
    if (team) {
      whereClauses.push(`team = '${team}'`);
    }

    // 4. Apply role-based filters
    if (userRole.role === 'ADMIN') {
      // ADMIN sees only their department
      whereClauses.push(`department = '${userRole.department}'`);
    }
    // ENGINEERING_ADMIN sees all (no additional filter)

    const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

    const sql = `
      SELECT DISTINCT employeeId, employee
      FROM ${catalog}.${schema}.google_sheets_feedback
      ${whereSQL}
      ORDER BY employee ASC
    `;

    const result = await queryDatabricks(sql);

    const employees = result.map(row => ({
      id: row.employeeId,
      displayName: row.employee
    }));
    
    console.log(`[ROLES] User: ${userEmail}, Role: ${userRole.role}, Employees returned: ${employees.length}`);
    
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}