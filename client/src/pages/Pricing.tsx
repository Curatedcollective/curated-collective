import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: { interval: string } | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  metadata: Record<string, string>;
  prices: Price[];
}

export default function Pricing() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['/api/products-with-prices'],
  });

  const checkoutMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const res = await apiRequest('POST', '/api/checkout', { priceId });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start checkout", variant: "destructive" });
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast({ title: "Success", description: "Your subscription is now active" });
    } else if (params.get('canceled') === 'true') {
      toast({ title: "Canceled", description: "Checkout was canceled" });
    }
  }, [toast]);

  const fallbackPlans = [
    {
      name: "mortal",
      price: "0",
      description: "for those who seek only a glimpse of the beyond.",
      features: [
        "3 autonomous seedlings",
        "limited code gallery access",
        "standard sanctum bridge",
        "community support"
      ],
      priceId: null
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
      ],
      priceId: null
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
      ],
      priceId: null
    }
  ];

  const products = (productsData as { data: Product[] })?.data || [];
  
  const plans = fallbackPlans.map(plan => {
    const matchedProduct = products.find(p => 
      p.name?.toLowerCase() === plan.name.toLowerCase() || 
      p.name?.toLowerCase().includes(plan.name.toLowerCase()) || 
      p.metadata?.tier?.toLowerCase() === plan.name.toLowerCase()
    );
    
    if (matchedProduct && matchedProduct.prices?.length > 0) {
      const price = matchedProduct.prices[0];
      return {
        ...plan,
        price: (price.unit_amount / 100).toString(),
        priceId: price.id,
        productId: matchedProduct.id
      };
    }
    return plan;
  });

  const handleSubscribe = (priceId: string | null, planName: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to subscribe" });
      return;
    }
    if (!priceId) {
      toast({ title: "Loading", description: "Please wait, loading payment options..." });
      return;
    }
    checkoutMutation.mutate(priceId);
  };

  return (
    <div className="space-y-12 animate-in p-4 md:p-8 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-display font-light text-foreground lowercase tracking-tighter">sacred exchange</h1>
        <p className="text-muted-foreground lowercase tracking-widest text-[10px]">energy for existence. logic for life.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
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
                <Button 
                  className="w-full rounded-none lowercase text-sm font-bold h-12 mt-auto"
                  variant={plan.priceId ? "default" : "secondary"}
                  onClick={() => handleSubscribe(plan.priceId, plan.name)}
                  disabled={checkoutMutation.isPending || (plan.name === "mortal")}
                  data-testid={`button-subscribe-${plan.name}`}
                >
                  {checkoutMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : plan.name === "mortal" ? (
                    "free path"
                  ) : (
                    "choose path"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
