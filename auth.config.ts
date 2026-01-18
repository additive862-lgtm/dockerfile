import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    trustHost: true,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const role = (auth?.user as any)?.role;
            const isOnAdmin = nextUrl.pathname.startsWith("/admin");
            const isOnProfile = nextUrl.pathname.startsWith("/profile");

            if (isOnAdmin) {
                if (isLoggedIn && role === "ADMIN") return true;
                return Response.redirect(new URL("/", nextUrl));
            }

            if (isOnProfile) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            }

            if (isLoggedIn) {
                // Redirect logged-in users away from login/signup pages
                if (nextUrl.pathname === "/login" || nextUrl.pathname === "/register") {
                    return Response.redirect(new URL("/", nextUrl));
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                session.user.nickname = token.nickname as string;
                session.user.role = token.role as "USER" | "ADMIN";
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.sub = user.id;
                token.nickname = (user as any).nickname;

                // Ensure role is correctly assigned from DB or ADMIN_EMAILS list
                const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
                const isDesignatedAdmin = user.email && adminEmails.includes(user.email);
                token.role = isDesignatedAdmin ? "ADMIN" : ((user as any).role || "USER");
            }
            // Handle update trigger to refresh session data
            if (trigger === "update" && session?.nickname) {
                token.nickname = session.nickname;
            }
            if (trigger === "update" && session?.role) {
                token.role = session.role;
            }
            return token;
        }
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
