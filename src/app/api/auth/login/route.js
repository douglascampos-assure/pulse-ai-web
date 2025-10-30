import { queryDatabricks } from "@/src/lib/databricks";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { USERS_TABLE } from "@/src/utils/constants";

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
    const schema = process.env.DATABRICKS_SCHEMA_BRONZE;
    const table = USERS_TABLE;

    const result = await queryDatabricks(`
      SELECT * FROM ${catalog}.${schema}.${table} 
      WHERE user_email = '${email}' LIMIT 1
    `);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = result[0];

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "User is not active" },
        { status: 403 }
      );
    }

    const passwordMatch = password === user.password; //await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const alg = "HS256";
    const token = await new SignJWT({
      email: user.user_email,
      userId: user.id,
      type: user.type,
    })
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
      maxAge: 60 * 60 * 4, // 4 hours
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
