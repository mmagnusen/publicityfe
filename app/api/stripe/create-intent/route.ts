import { NextResponse } from "next/server";

import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeSecretKey
	? new Stripe(stripeSecretKey, {
			apiVersion: "2026-05-27.dahlia",
		})
	: null;

function parseCookieHeader(header: string | null): Record<string, string> {
	if (!header) {
		return {};
	}

	const out: Record<string, string> = {};
	for (const part of header.split(";")) {
		const idx = part.indexOf("=");
		if (idx === -1) {
			continue;
		}
		const name = part.slice(0, idx).trim();
		let value = part.slice(idx + 1).trim();
		try {
			value = decodeURIComponent(value);
		} catch {
			// leave raw
		}
		if (name) {
			out[name] = value;
		}
	}
	return out;
}

export async function POST(request: Request) {
	if (!stripe) {
		return NextResponse.json(
			{ error: "Stripe is not configured." },
			{ status: 500 },
		);
	}

	try {
		const body = await request.json();
		const amountPence = Number.parseInt(String(body.amount), 10);
		if (Number.isNaN(amountPence)) {
			return NextResponse.json(
				{ error: "Missing/invalid amount." },
				{ status: 400 },
			);
		}

		const purchaseTypeRaw = body.purchase_type;
		const purchaseType =
			typeof purchaseTypeRaw === "string" && purchaseTypeRaw.trim()
				? purchaseTypeRaw.trim().toLowerCase()
				: body.plan_id != null
					? "subscription"
					: body.event_pk != null
						? "event_ticket"
						: "";

		if (!purchaseType) {
			return NextResponse.json(
				{ error: "Missing purchase_type/plan_id/event_pk." },
				{ status: 400 },
			);
		}

		const email = body.email ?? body.customer_email;
		if (!email) {
			return NextResponse.json({ error: "Missing email." }, { status: 400 });
		}

		const metadata: Record<string, string> = {
			email: String(email),
			purchase_type: purchaseType,
			amount_paid_pence: String(amountPence),
		};

		if (body.first_name != null) {
			metadata.first_name = String(body.first_name);
		}
		if (body.last_name != null) {
			metadata.last_name = String(body.last_name);
		}
		if (purchaseType === "event_ticket" && body.event_pk != null) {
			metadata.event_pk = String(body.event_pk);
		}
		if (purchaseType === "subscription" && body.plan_id != null) {
			metadata.plan_id = String(body.plan_id);
		}
		if (body.promo_code) {
			metadata.promo_code = String(body.promo_code);
		}
		if (body.list_price_pence != null && body.list_price_pence !== "") {
			metadata.list_price_pence = String(body.list_price_pence);
		}
		if (body.promo_pk != null && body.promo_pk !== "") {
			metadata.promo_pk = String(body.promo_pk);
		}

		const cookies = parseCookieHeader(request.headers.get("cookie"));
		if (cookies.datafast_visitor_id) {
			metadata.datafast_visitor_id = String(cookies.datafast_visitor_id);
		}
		if (cookies.datafast_session_id) {
			metadata.datafast_session_id = String(cookies.datafast_session_id);
		}

		const paymentIntent = await stripe.paymentIntents.create({
			amount: amountPence,
			automatic_payment_methods: {
				enabled: true,
			},
			currency: "gbp",
			metadata,
			receipt_email: String(email),
		});

		return NextResponse.json(paymentIntent, { status: 201 });
	} catch {
		return NextResponse.json({ error: "error" }, { status: 500 });
	}
}
