import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Bank Admin Portal</CardTitle>
          <CardDescription>Super Admin Dashboard for Banking Operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/auth/login" className="w-full">
            <Button className="w-full" size="lg">
              Admin Login
            </Button>
          </Link>
          <Link href="/auth/signup" className="w-full">
            <Button variant="outline" className="w-full" size="lg">
              Create Admin Account
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
