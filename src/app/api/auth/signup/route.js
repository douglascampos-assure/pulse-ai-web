import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = process.env.DATABRICKS_SCHEMA;
    const table = "users";

    const sql = `INSERT INTO \${catalog}.\${schema}.\${table} (email, password) VALUES (:email, :password)`;

    await queryDatabricks(sql, {
      parameters: { email, password: hashedPassword },
    });

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
