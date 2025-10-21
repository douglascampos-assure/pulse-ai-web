import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const catalog = process.env.DATABRICKS_CATALOG;
    const schema = process.env.DATABRICKS_SCHEMA;
    const table = "users";

    const sql = `SELECT * FROM \${catalog}.\${schema}.\${table} WHERE email = :email LIMIT 1`;
    const result = await queryDatabricks(sql, { parameters: { email } });

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = result[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const alg = "HS256";

    const token = await new SignJWT({ email: user.email, userId: user.id })
      .setProtectedHeader({ alg })
      .setExpirationTime("2h")
      .setIssuedAt()
      .sign(secret);

    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 2, // 2 hours
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
