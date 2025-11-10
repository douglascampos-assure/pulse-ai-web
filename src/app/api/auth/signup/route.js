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

    // 🔎 Verificar si el usuario ya existe
    const existing = await queryDatabricks(`
      SELECT * FROM ${catalog}.${schema}.${table}
      WHERE user_email = '${email}' LIMIT 1
    `);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Encriptar contraseña
    //const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    await queryDatabricks(`
      INSERT INTO ${catalog}.${schema}.${table} (user_email, password)
      VALUES ('${email}', '${password}')
    `);

    // Crear token de sesión (igual que en login)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const alg = "HS256";

    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg })
      .setExpirationTime("2h")
      .setIssuedAt()
      .sign(secret);

    // Configurar cookie de sesión
    const response = NextResponse.json({ message: "User created and logged in" });
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 4, // 4 horas
    });

    response.headers.set("Location", "/");
    return new Response(null, {
      status: 302,
      headers: response.headers,
    });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
