import { NextResponse } from "next/server";

export const jsonOk = (data: unknown, init: ResponseInit = {}) => {
  return NextResponse.json(data, { status: 200, ...init });
};

export const jsonError = (message: string, status = 400) => {
  return NextResponse.json({ error: message }, { status });
};
