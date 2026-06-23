import { NextResponse } from "next/server";

import * as Bytescale from "@bytescale/sdk";
import { normalizeBytescaleFilePath } from "@util/bytescaleFilePath";

const accountID = String(
	process.env.NEXT_PUBLIC_BYTESCALE_ACCOUNT_ID ?? "",
).trim();

const secretBackendAPIKey = (
	process.env.BYTESCSCALE_SECRET_BACKEND_KEY ?? ""
).trim();

const getFileApi = () =>
	new Bytescale.FileApi({
		apiKey: secretBackendAPIKey,
	});

export async function POST(request: Request) {
	if (!accountID || !secretBackendAPIKey) {
		console.error(
			"[api/bytescale] Missing NEXT_PUBLIC_BYTESCALE_ACCOUNT_ID or BYTESCSCALE_SECRET_BACKEND_KEY",
		);
		return NextResponse.json(
			{
				error:
					"File storage is not configured on the server. Set BYTESCSCALE_SECRET_BACKEND_KEY and NEXT_PUBLIC_BYTESCALE_ACCOUNT_ID.",
			},
			{ status: 503 },
		);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const filePathRaw =
		body != null &&
		typeof body === "object" &&
		"filePath" in body &&
		typeof (body as { filePath: unknown }).filePath === "string"
			? (body as { filePath: string }).filePath
			: null;

	if (!filePathRaw?.trim()) {
		return NextResponse.json(
			{ error: "Missing or invalid filePath" },
			{ status: 400 },
		);
	}

	const filePath = normalizeBytescaleFilePath(filePathRaw.trim());

	try {
		const fileApi = getFileApi();
		const isCropped = filePath.includes(".crop");

		const filesToDelete = isCropped
			? [filePath, normalizeBytescaleFilePath(filePath.replace(".crop", ""))]
			: [filePath];

		await fileApi.deleteFileBatch({
			accountId: accountID,
			deleteFileBatchRequest: { files: filesToDelete },
		});

		return NextResponse.json({ status: "deleted" });
	} catch (error) {
		console.error("[api/bytescale] deleteFileBatch failed:", error);
		const message =
			error instanceof Error ? error.message : "Unknown error from Bytescale";
		return NextResponse.json(
			{
				error: "Failed to delete file from storage",
				details: message,
			},
			{ status: 500 },
		);
	}
}
