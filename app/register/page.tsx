import RegisterClient from "./RegisterClient";

export const dynamic = 'force-dynamic';

/**
 * RegisterPage is now a Server Component.
 * This ensures that process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY is read at RUNTIME
 * from the Docker environment variables and passed to the client component.
 */
export default function RegisterPage() {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    return <RegisterClient siteKey={siteKey} />;
}
