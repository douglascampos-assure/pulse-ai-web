import {
  Card,
  CardContent,
  CardFooter,
} from "@/src/components/ui/card"

const valueDefault = "800"
const footerDefault = "Mentions on kudos_to_you"
export function CardBasic({ value = valueDefault, footer = footerDefault }) {
  return (
    <Card className="w-full max-w-sm justify-center">
      <CardContent className="flex flex-row justify-center items-center">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">{value}</h2>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{footer}</h4>
      </CardFooter>
    </Card>
  )
}
