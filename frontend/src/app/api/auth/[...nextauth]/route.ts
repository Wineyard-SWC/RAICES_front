
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/utils/firebaseConfig"

export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Firebase",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize({ email, password }) {
        try {
          const { user } = await signInWithEmailAndPassword(auth, email!, password!)
          return {
            id: user.uid,
            email: user.email,
            token: await user.getIdToken(),
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id
        token.token = user.token
      }
      return token
    },
    async session({ session, token }) {
      session.user = { uid: token.uid as string, email: session.user?.email, token: token.token as string }
      return session
    },
  },
  pages: { signIn: "/login" },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
