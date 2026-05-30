import type { NextAuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
    };
  }
  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    picture?: string | null;
    role: string;
  }
}

export type AuthLoginType = "user" | "admin";

const ADMIN_EMAILS = new Set(["admin@ciar.com", "super@ciar.com"]);

// Hardcoded admin credentials (for initial platform setup)
const ADMIN_CREDENTIALS = [
  {
    email: "admin@ciar.com",
    password: "$2b$10$WAvm/DRYQevY3FMCMohPreeES16Js37DcXw0rD29xojIR56OOwGsK", // admin123
    role: "admin",
    name: "CIAR Admin",
    id: "admin-001",
  },
  {
    email: "super@ciar.com",
    password: "$2b$10$vzvWAfli5ZdBLpPJs/CVEet.2f3utclNllsLMpjjOhWZA9ats4rBq", // super123
    role: "super_admin",
    name: "CIAR Super Admin",
    id: "super-admin-001",
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginType: { label: "Login Type", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const loginType: AuthLoginType =
          credentials.loginType === "admin" ? "admin" : "user";

        if (loginType === "admin") {
          const adminUser = ADMIN_CREDENTIALS.find(
            (a) => a.email === credentials.email
          );

          if (adminUser) {
            const isValid = await bcrypt.compare(
              credentials.password,
              adminUser.password
            );
            if (isValid) {
              return {
                id: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
                role: adminUser.role,
              };
            }
            throw new Error("Invalid password");
          }

          const dbAdmin = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!dbAdmin) {
            throw new Error("No admin account found with this email");
          }

          if (dbAdmin.role !== "admin" && dbAdmin.role !== "super_admin") {
            throw new Error("This account is not authorized for admin access");
          }

          if (!dbAdmin.password) {
            throw new Error("Admin account password is not configured");
          }

          if (!dbAdmin.isActive) {
            throw new Error("This admin account has been deactivated");
          }

          if (dbAdmin.isBanned) {
            throw new Error(
              dbAdmin.bannedReason || "This admin account has been suspended"
            );
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            dbAdmin.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: dbAdmin.id,
            email: dbAdmin.email,
            name: dbAdmin.name,
            image: dbAdmin.avatar,
            role: dbAdmin.role,
          };
        }

        if (ADMIN_EMAILS.has(credentials.email)) {
          throw new Error("Please use the admin login page");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No account found with this email");
        }

        if (user.role === "admin" || user.role === "super_admin") {
          throw new Error("Please use the admin login page");
        }

        if (!user.password) {
          throw new Error(
            "This account was created with a social login. Please use that method instead."
          );
        }

        if (!user.isActive) {
          throw new Error("This account has been deactivated");
        }

        if (user.isBanned) {
          throw new Error(
            user.bannedReason || "This account has been suspended"
          );
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = user.role;
      }

      // Handle session update (e.g., when user updates their profile)
      if (trigger === "update" && session) {
        token.name = (session as Record<string, unknown>).name as string | undefined;
        token.picture = (session as Record<string, unknown>).image as string | undefined;
        token.role = (session as Record<string, unknown>).role as string | undefined;
      }

      return token;
    },
    async session({ session, token }) {
      // Expose id and role from token to the client session
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/?auth=login",
    error: "/?auth=error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Re-export getServerSession with typed options
import { getServerSession } from "next-auth";

export { getServerSession };
