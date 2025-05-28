//// filepath: c:\Users\fer61\OneDrive\Escritorio\RAICES\MyBranch\CookieSettings\frontend\middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: [
    "/projects/:path*",
    "/team/:path*",
    "/task_assignment/:path*",
    "/sprint_planning/:path*",
    "/sprint_details/:path*",
    "/settings/:path*", 
    "/my-sprints/:path*",
    "/member_settings/:path*",
    "/generate/:path*",
    "/dashboard/:path*",
    "/avatar_editor/:path*",
    "/avatar_creator/:path*",
    "/gen_tasks/:path*", 
    "/gen_epics/:path*",
    "/gen_user_stories/:path*",
    "/gen_requirements/:path*",
    "/sprint_planning/:path*"
  ],
}