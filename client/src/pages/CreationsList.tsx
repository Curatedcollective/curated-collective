import { useCreations, useCreateCreation } from "@/hooks/use-creations";
import { CreationCard } from "@/components/CreationCard";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Code2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCreationSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function CreationsList() {
  const { user } = useAuth();
  const { data: creations, isLoading } = useCreations(user?.id);
  const createMutation = useCreateCreation();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof insertCreationSchema>>({
    resolver: zodResolver(insertCreationSchema),
    defaultValues: {
      title: "",
      description: "",
      code: "<h1>Hello World</h1>",
      language: "html",
      userId: user?.id || "",
      isPublic: true,
    },
  });

  const onSubmit = (data: z.infer<typeof insertCreationSchema>) => {
    // Ensure userId is set
    createMutation.mutate({ ...data, userId: user!.id }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white lowercase tracking-tighter mb-2">creations</h1>
          <p className="text-zinc-500 lowercase tracking-widest text-[10px]">autonomous code gallery</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-white text-black hover:bg-zinc-200 rounded-none lowercase text-xs font-bold h-10 px-6 transition-all">
              <Plus className="w-4 h-4 mr-2" /> new creation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Creation</DialogTitle>
              <DialogDescription>
                Start a new coding project. You can edit the code later.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Project" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What does this code do?" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Project
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {!creations?.length ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-secondary/10">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
            <Code2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No creations yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-center">
            Start building your first code snippet to see it here.
          </p>
          <Button onClick={() => setOpen(true)} variant="secondary">Create your first project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creations.map((creation) => (
            <CreationCard key={creation.id} creation={creation} />
          ))}
        </div>
      )}
    </div>
  );
}
