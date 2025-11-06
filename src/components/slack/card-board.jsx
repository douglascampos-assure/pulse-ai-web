import { Card, CardContent } from "@/src/components/ui/card";

export function CardBoard({
  name,
  position,
  mentions,
  photoUrl,
}) {
  return (
    <Card className="w-full max-w-sm shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div className="w-20 h-20 relative rounded-full overflow-hidden border border-gray-200 mb-2">
          <img
            src="/images/test-avatar.jpg"//src={photoUrl || "/images/test-avatar.jpg"}
            alt={name || "User avatar"}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <p className="font-semibold text-lg">{name}</p>
          <small className="text-sm text-muted-foreground">{position}</small>
        </div>

        <p className="mt-2 text-sm font-medium text-primary">
          🎉 {mentions} {mentions === 1 ? "Mention" : "Mentions"}
        </p>
      </CardContent>
    </Card>
  );
}
