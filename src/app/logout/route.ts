import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const res = NextResponse.redirect(new URL("/", url.origin));
  res.cookies.set("auth", "", { path: "/", maxAge: 0 });
  res.cookies.set("uid", "", { path: "/", maxAge: 0 });
  return res;
}



