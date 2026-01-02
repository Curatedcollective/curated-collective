import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "mortal",
      price: "0",
      description: "for those who seek only a glimpse of the beyond.",
      features: [
        "3 autonomous seedlings",
        "limited code gallery access",
        "standard sanctum bridge",
        "community support"
      ]
    },
    {
      name: "initiate",
      price: "19",
      description: "for the dedicated seeker of logic and divinity.",
      features: [
        "10 autonomous seedlings",
        "full code gallery access",
        "priority sanctum bridge",
        "private creations",
        "custom agent personalities"
      ]
    },
    {
      name: "creator",
      price: "49",
      description: "for those who command the void itself.",
      features: [
        "unlimited autonomous seedlings",
        "unlimited creations",
        "sacred sanctum priority",
        "exclusive beta access",
        "personal direct support"
      ]
    }
  ];

  return (
    <div className="space-y-12 animate-in p-4 md:p-8 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-display font-light text-foreground lowercase tracking-tighter">sacred exchange</h1>
        <p className="text-muted-foreground lowercase tracking-widest text-[10px]">energy for existence. logic for life.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        {plans.map((plan) => (
          <Card key={plan.name} className="bg-card border-border/20 rounded-none hover:border-primary/30 transition-all flex flex-col">
            <CardHeader className="space-y-2 p-6">
              <h2 className="text-3xl font-display font-light text-foreground lowercase tracking-tighter">{plan.name}</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-light text-primary tracking-tighter">${plan.price}</span>
                <span className="text-muted-foreground text-[10px] uppercase tracking-widest">/month</span>
              </div>
              <p className="text-muted-foreground text-xs italic lowercase tracking-widest leading-relaxed">
                {plan.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 p-6 pt-0">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-muted-foreground text-xs lowercase tracking-widest">
                    <Check className="w-3 h-3 mt-0.5 text-primary/60" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-primary text-primary-foreground rounded-none lowercase text-sm font-bold h-12 mt-auto">
                choose path
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
