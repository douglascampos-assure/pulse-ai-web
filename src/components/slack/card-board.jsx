import {
  Card,
  CardContent,
} from "@/src/components/ui/card"

const nameDefault = "Andrea Salguero"
const positionDefault = "Software Engineer"
const mentionsDefault= "15"
export function CardBoard({ name = nameDefault, position = positionDefault, mentions = mentionsDefault }) {
  return (
    <Card className="w-full max-w-sm">
      <CardContent>
        <div className="flex flex-col">
            <p className="leading-7 [&:not(:first-child)]:mt-6">{name}</p>
            <small className="text-sm leading-none font-medium">{position}</small>
        </div>
        <p className="leading-7 [&:not(:first-child)]:mt-6">{mentions} Mentions</p>
      </CardContent>
    </Card>
  )
}
