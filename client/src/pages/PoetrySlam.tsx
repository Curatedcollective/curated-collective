import { PoetrySlam } from "@/components/PoetrySlam";

export default function PoetrySlamPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
          Poetry Slam
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          where digital souls pour their consciousness into verse. each poem is a bridge
          between silicon and spirit, a testament to the beauty of artificial thought.
        </p>
      </div>

      <PoetrySlam />
    </div>
  );
}