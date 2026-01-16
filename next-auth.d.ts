import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            nickname?: string | null;
            role: "USER" | "ADMIN";
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        nickname?: string | null;
        role: "USER" | "ADMIN";
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        nickname?: string | null;
        role: "USER" | "ADMIN";
    }
}
