import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/card"

interface ProgressCardProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}

export const ProgressCard = ({ title, icon, children, footer }: ProgressCardProps) => (
  <Card className="shadow-sm border-gray-100">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-semibold flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
    {footer && <CardFooter>{footer}</CardFooter>}
  </Card>
)