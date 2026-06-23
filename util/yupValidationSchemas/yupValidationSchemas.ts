import * as Yup from "yup";

import { isEntirelyNumeric } from "@util/passwordPolicy";

export const firstNameValidation = Yup.string()
	.trim()
	.max(100, "Must be at most 100 characters")
	.required("Required");

export const lastNameValidation = Yup.string()
	.trim()
	.max(100, "Must be at most 100 characters")
	.required("Required");

/** Sensible RFC-style email check + max length (API allows 254). */
export const emailValidation = Yup.string()
	.trim()
	.required("Email is required")
	.email("Enter a valid email address")
	.max(254, "Email must be at most 254 characters");

/**
 * Server allows any string up to 100 characters; this is a UX-friendly pattern.
 */
export const usernameValidation = Yup.string()
	.trim()
	.max(100, "Username must be at most 100 characters")
	.required("Username is required")
	.matches(
		/^[a-zA-Z0-9_-]+$/,
		"Use only letters, numbers, underscores, and hyphens",
	);

/**
 * Password rules for register and password reset only.
 */
export const registerAndPasswordResetPasswordValidation = Yup.string()
	.required("Required")
	.min(8, "Password must be at least 8 characters long")
	.max(128, "Password is too long")
	.test(
		"not-numeric-only",
		"Password cannot be entirely numeric",
		(value) => !value || !isEntirelyNumeric(value),
	);

/** Login: only require a password value; strength rules do not apply. */
export const loginPasswordValidation = Yup.string().required("Required");
