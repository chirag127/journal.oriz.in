import { Button } from "@components/react/ui/Button";
import { Field, Input } from "@components/react/ui/Field";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	friendlyAuthError,
	signInAnonymouslyNow,
	signInWithEmail,
	signInWithGithub,
	signInWithGoogle,
	signUpWithEmail,
} from "@/lib/firebase/auth";

function GoogleIcon() {
	return (
		<svg viewBox="0 0 24 24" width={16} height={16} aria-hidden="true">
			<path
				fill="#4285F4"
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			/>
			<path
				fill="#34A853"
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
			/>
			<path
				fill="#FBBC05"
				d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.47 1.18 4.93l3.66-2.84z"
			/>
			<path
				fill="#EA4335"
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
			/>
		</svg>
	);
}

function GithubIcon() {
	return (
		<svg viewBox="0 0 24 24" width={16} height={16} aria-hidden="true" fill="currentColor">
			<path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.96 3.22 9.16 7.68 10.65.56.1.76-.24.76-.54v-1.9c-3.13.68-3.79-1.5-3.79-1.5-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.68.08-.68 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.94.1-.73.39-1.22.71-1.5-2.5-.29-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.99 0 0 .95-.3 3.1 1.15a10.77 10.77 0 0 1 5.65 0c2.15-1.45 3.1-1.15 3.1-1.15.61 1.56.23 2.7.11 2.99.72.79 1.16 1.79 1.16 3.02 0 4.32-2.63 5.27-5.14 5.55.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54 4.46-1.49 7.67-5.69 7.67-10.65C23.25 5.48 18.27.5 12 .5z" />
		</svg>
	);
}

const schema = z
	.object({
		email: z.email("Enter a valid email address"),
		password: z.string().min(6, "At least 6 characters"),
		name: z.string().min(1, "Required").max(60).optional(),
	})
	.refine((d) => !d.name || d.name.length >= 1, { message: "Required", path: ["name"] });

type FormData = z.infer<typeof schema>;

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
	const [busy, setBusy] = useState<null | "google" | "github" | "anon" | "email">(null);
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: { email: "", password: "", name: "" },
	});

	async function onEmailSubmit(data: FormData) {
		setError(null);
		setBusy("email");
		try {
			if (mode === "signup") {
				await signUpWithEmail(data.email, data.password, data.name);
			} else {
				await signInWithEmail(data.email, data.password);
			}
		} catch (e) {
			const err = e as { code?: string; message?: string };
			setError(friendlyAuthError(err.code ?? "unknown"));
		} finally {
			setBusy(null);
		}
	}

	async function onProvider(provider: "google" | "github" | "anon") {
		setError(null);
		setBusy(provider);
		try {
			if (provider === "google") await signInWithGoogle();
			else if (provider === "github") await signInWithGithub();
			else await signInAnonymouslyNow();
		} catch (e) {
			const err = e as { code?: string; message?: string };
			setError(friendlyAuthError(err.code ?? "unknown"));
		} finally {
			setBusy(null);
		}
	}

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<Button
					variant="outline"
					size="lg"
					className="w-full justify-center"
					loading={busy === "google"}
					onClick={() => onProvider("google")}
					leading={<GoogleIcon />}
				>
					Continue with Google
				</Button>
				<Button
					variant="outline"
					size="lg"
					className="w-full justify-center"
					loading={busy === "github"}
					onClick={() => onProvider("github")}
					leading={<GithubIcon />}
				>
					Continue with GitHub
				</Button>
				<Button
					variant="ghost"
					size="lg"
					className="w-full justify-center"
					loading={busy === "anon"}
					onClick={() => onProvider("anon")}
				>
					Continue as guest
				</Button>
			</div>

			<div className="flex items-center gap-3 text-xs text-fg-muted">
				<div className="h-px flex-1 bg-border" />
				<span>or with email</span>
				<div className="h-px flex-1 bg-border" />
			</div>

			<form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
				{mode === "signup" && (
					<Field label="Name" htmlFor="name" error={errors.name?.message}>
						<Input
							id="name"
							type="text"
							placeholder="Your name"
							autoComplete="name"
							invalid={!!errors.name}
							{...register("name")}
						/>
					</Field>
				)}
				<Field label="Email" htmlFor="email" error={errors.email?.message}>
					<div className="relative">
						<Mail
							size={16}
							className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted"
						/>
						<Input
							id="email"
							type="email"
							placeholder="you@example.com"
							autoComplete="email"
							className="pl-9"
							invalid={!!errors.email}
							{...register("email")}
						/>
					</div>
				</Field>
				<Field
					label="Password"
					hint={mode === "signup" ? "At least 6 characters" : undefined}
					htmlFor="password"
					error={errors.password?.message}
				>
					<div className="relative">
						<Lock
							size={16}
							className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted"
						/>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							autoComplete={mode === "signup" ? "new-password" : "current-password"}
							className="pl-9"
							invalid={!!errors.password}
							{...register("password")}
						/>
					</div>
				</Field>

				{error && (
					<div className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
						{error}
					</div>
				)}

				<Button
					type="submit"
					variant="primary"
					size="lg"
					className="w-full justify-center"
					loading={busy === "email"}
					trailing={busy === "email" ? null : <ArrowRight size={16} />}
				>
					{mode === "signup" ? (
						<>
							<UserPlus size={16} /> Create account
						</>
					) : (
						"Sign in"
					)}
				</Button>
			</form>
		</div>
	);
}
