import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const apiBackendUrl = process.env.API_BACKEND_URL?.replace(/\/+$/, "");

function buildTargetUrl(request: NextRequest, pathSegments: string[]) {
	if (!apiBackendUrl) {
		throw new Error("API_BACKEND_URL is not configured");
	}

	const pathname = pathSegments.join("/");
	const hadTrailingSlash = request.nextUrl.pathname.endsWith("/");
	const backendPath = hadTrailingSlash ? `${pathname}/` : pathname;

	return `${apiBackendUrl}/${backendPath}${request.nextUrl.search}`;
}

async function proxyRequest(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> },
) {
	if (!apiBackendUrl) {
		return NextResponse.json(
			{ detail: "API backend is not configured." },
			{ status: 500 },
		);
	}

	const { path } = await context.params;
	const targetUrl = buildTargetUrl(request, path);

	const headers = new Headers(request.headers);
	headers.delete("host");
	headers.delete("connection");

	const init: RequestInit = {
		method: request.method,
		headers,
		redirect: "manual",
	};

	if (request.method !== "GET" && request.method !== "HEAD") {
		init.body = await request.arrayBuffer();
	}

	const response = await fetch(targetUrl, init);
	const responseHeaders = new Headers(response.headers);
	responseHeaders.delete("content-encoding");
	responseHeaders.delete("content-length");

	return new NextResponse(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: responseHeaders,
	});
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
