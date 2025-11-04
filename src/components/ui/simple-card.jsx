import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/src/components/ui/card";

export default function SimpleCard({
  bgColor = "bg-white",
  textColor = "text-black",
  indicator,
  description,
  icon,
  width,
  height,
}) {
  const sizeClasses =
    width && height ? `${width} ${height}` : "w-full aspect-[4/3]";

  return (
    <Card
      className={`flex flex-col items-center justify-center ${bgColor} ${textColor} rounded-xl ${width} ${height} shadow-lg p-4`}
    >
      <CardContent
        className={`flex flex-col items-center justify-center p-0 mt-4 ${
          !icon ? "mt-10" : ""
        }`}
      >
        {icon && <img src={icon} alt="icon" className="w-10 h-10 mb-3" />}
        <span className="text-4xl font-bold">{indicator}</span>
      </CardContent>

      <CardFooter className="flex items-center justify-center mb-4">
        <span className="text-sm">{description}</span>
      </CardFooter>
    </Card>
  );
}
