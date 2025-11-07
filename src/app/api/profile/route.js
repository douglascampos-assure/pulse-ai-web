import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = process.env.DATABRICKS_SCHEMA_BRONZE;
    const schemaSilver = process.env.DATABRICKS_SCHEMA_SILVER;

    // Traer la info principal del usuario (primer registro)
    const googleSheetResult = await queryDatabricks(`
      SELECT * FROM ${catalog}.${schemaSilver}.google_sheets_employees
      WHERE WorkEmail = '${email}'
      LIMIT 1
    `);
    //TODO: Arreglar nombre de correo gabriela villareal o vilarreal
    // Traer la foto de BambooHR
    const bambooResult = await queryDatabricks(`
      SELECT photoUrl FROM ${catalog}.${schemaSilver}.bamboohr_employees
      WHERE WorkEmail = 'gabriela.villareal@assuresoft.com'
      LIMIT 1
    `);

    const userRecord = googleSheetResult[0] || {};
    const bambooData = bambooResult[0] || {};

    return NextResponse.json({
      fullName: userRecord.DisplayName || "",
      role: userRecord.Role || "",
      jobTitle: userRecord.JobTitle || "",
      department: userRecord.Department || "",
      photoUrl: bambooData.photoUrl || "/images/test-avatar.jpg",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
