"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Save,
  X,
  Plus,
  Loader2,
  Package,
  DollarSign,
  Settings,
  ListChecks,
  FileText,
  AlertCircle,
} from "lucide-react";

const signalSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  version: z.string().min(1, "Version is required").regex(/^\d+\.\d+\.\d+$/, "Version must be in format X.Y.Z"),
  platform: z.enum(["MT4", "MT5", "Both"]),
  strategyType: z.string().min(1, "Strategy type is required"),
  status: z.enum(["active", "inactive", "beta"]),
  
  // File uploads
  fileUrl: z.string().url().optional().or(z.literal("")),
  previewImage: z.string().url().optional().or(z.literal("")),
  
  // Features and requirements (stored as JSON arrays)
  features: z.string().optional(),
  requirements: z.string().optional(),
  
  // Installation instructions
  installInstructions: z.string().optional(),
  
  // Pricing
  isPaid: z.boolean(),
  price: z.number().min(0, "Price must be positive").optional(),
  
  // Additional fields
  minBalance: z.number().min(0).optional(),
  recommendedBalance: z.number().min(0).optional(),
  supportedPairs: z.string().optional(),
  timeframe: z.string().optional(),
  
  // SEO
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  metaTitle: z.string().max(60, "Meta title should be under 60 characters").optional(),
  metaDescription: z.string().max(160, "Meta description should be under 160 characters").optional(),
  keywords: z.string().optional()
});

type SignalFormData = z.infer<typeof signalSchema>;

export default function SignalEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [requirementsList, setRequirementsList] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [newRequirement, setNewRequirement] = useState("");

  const form = useForm<SignalFormData>({
    resolver: zodResolver(signalSchema),
    defaultValues: {
      name: "",
      description: "",
      version: "1.0.0",
      platform: "MT4",
      strategyType: "",
      status: "active",
      fileUrl: "",
      previewImage: "",
      features: "",
      requirements: "",
      installInstructions: "",
      isPaid: false,
      price: 0,
      minBalance: 100,
      recommendedBalance: 1000,
      supportedPairs: "",
      timeframe: "",
      slug: "",
      metaTitle: "",
      metaDescription: "",
      keywords: ""
    }
  });

  // Fetch existing signal data
  useEffect(() => {
    const fetchSignal = async () => {
      try {
        const response = await fetch(`/api/admin/signals/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch signal");
        
        const data = await response.json();
        form.reset({
          ...data,
          features: JSON.stringify(data.features || []),
          requirements: JSON.stringify(data.requirements || [])
        });
        setFeaturesList(data.features || []);
        setRequirementsList(data.requirements || []);
      } catch (error) {
        toast.error("Failed to load signal data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignal();
  }, [params.id, form]);

  const onSubmit = async (data: SignalFormData) => {
    setIsSubmitting(true);
    
    try {
      const formattedData = {
        ...data,
        features: featuresList,
        requirements: requirementsList,
        price: data.isPaid ? data.price : 0
      };

      const response = await fetch(`/api/admin/signals/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) throw new Error("Failed to update signal");

      toast.success("Signal updated successfully!");
      router.push("/admin/signals");
    } catch (error) {
      toast.error("Failed to update signal");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate slug from name
  const generateSlug = () => {
    const name = form.getValues("name");
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    form.setValue("slug", slug);
  };

  // Add feature
  const addFeature = () => {
    if (newFeature.trim()) {
      setFeaturesList([...featuresList, newFeature.trim()]);
      setNewFeature("");
    }
  };

  // Remove feature
  const removeFeature = (index: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== index));
  };

  // Add requirement
  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirementsList([...requirementsList, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  // Remove requirement
  const removeRequirement = (index: number) => {
    setRequirementsList(requirementsList.filter((_, i) => i !== index));
  };

  const isPaid = form.watch("isPaid");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Edit Signal/EA</h1>
        <p className="text-zinc-400 mt-2">Update signal details and configuration</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
          {/* Basic Information */}
          <Card className="bg-surface-50 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription className="text-zinc-400">Core details about the signal or EA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Signal/EA Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Grid Trading EA Pro" 
                        {...field} 
                        className="bg-surface-100 border-white/10 text-white"
                      />
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
                    <FormLabel className="text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what this signal/EA does, its strategy, and key benefits..." 
                        className="min-h-32 bg-surface-100 border-white/10 text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Version</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="1.0.0" 
                          {...field} 
                          className="bg-surface-100 border-white/10 text-white"
                        />
                      </FormControl>
                      <FormDescription className="text-zinc-500">Use semantic versioning (X.Y.Z)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Platform</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-surface-100 border-white/10 text-white">
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MT4">MetaTrader 4</SelectItem>
                          <SelectItem value="MT5">MetaTrader 5</SelectItem>
                          <SelectItem value="Both">Both MT4 & MT5</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-surface-100 border-white/10 text-white">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="beta">Beta</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="strategyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Strategy Type</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Grid Trading, Scalping, Trend Following" 
                        {...field} 
                        className="bg-surface-100 border-white/10 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-surface-50 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ListChecks className="h-5 w-5" />
                Features
              </CardTitle>
              <CardDescription className="text-zinc-400">Key features and capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a feature..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  className="bg-surface-100 border-white/10 text-white"
                />
                <Button type="button" onClick={addFeature} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {featuresList.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="bg-brand/20 text-brand border-brand/30">
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="ml-2 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card className="bg-surface-50 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertCircle className="h-5 w-5" />
                Requirements
              </CardTitle>
              <CardDescription className="text-zinc-400">System and broker requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a requirement..."
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                  className="bg-surface-100 border-white/10 text-white"
                />
                <Button type="button" onClick={addRequirement} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {requirementsList.map((requirement, index) => (
                  <Badge key={index} variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    {requirement}
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="ml-2 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-surface-50 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="h-5 w-5" />
                Pricing
              </CardTitle>
              <CardDescription className="text-zinc-400">Set pricing for this signal/EA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="isPaid"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-white/10 p-4 bg-surface-100">
                    <div className="space-y-0.5">
                      <FormLabel className="text-white">Paid Signal/EA</FormLabel>
                      <FormDescription className="text-zinc-500">
                        Enable if this is a premium product
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isPaid && (
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Price (USD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="99.99" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          className="bg-surface-100 border-white/10 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Trading Parameters */}
          <Card className="bg-surface-50 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="h-5 w-5" />
                Trading Parameters
              </CardTitle>
              <CardDescription className="text-zinc-400">Recommended trading settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Minimum Balance (USD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          className="bg-surface-100 border-white/10 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recommendedBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Recommended Balance (USD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1000" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          className="bg-surface-100 border-white/10 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="supportedPairs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Supported Currency Pairs</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., EURUSD, GBPUSD, USDJPY" 
                        {...field} 
                        className="bg-surface-100 border-white/10 text-white"
                      />
                    </FormControl>
                    <FormDescription className="text-zinc-500">Comma-separated list</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Recommended Timeframe</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., H1, H4, D1" 
                        {...field} 
                        className="bg-surface-100 border-white/10 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Installation Instructions */}
          <Card className="bg-surface-50 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5" />
                Installation Instructions
              </CardTitle>
              <CardDescription className="text-zinc-400">Step-by-step installation guide</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="installInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="1. Download the file&#10;2. Copy to MT4/MT5 folder&#10;3. Restart terminal..." 
                        className="min-h-40 bg-surface-100 border-white/10 text-white font-mono text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="bg-surface-50 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="h-5 w-5" />
                SEO Settings
              </CardTitle>
              <CardDescription className="text-zinc-400">Search engine optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">URL Slug</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          placeholder="grid-trading-ea-pro" 
                          {...field} 
                          className="bg-surface-100 border-white/10 text-white"
                        />
                      </FormControl>
                      <Button type="button" onClick={generateSlug} variant="outline">
                        Generate
                      </Button>
                    </div>
                    <FormDescription className="text-zinc-500">
                      URL: /signals/{field.value || "your-slug"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Meta Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Grid Trading EA Pro - Free MT4/MT5 Expert Advisor" 
                        {...field} 
                        className="bg-surface-100 border-white/10 text-white"
                      />
                    </FormControl>
                    <FormDescription className="text-zinc-500">
                      {field.value?.length || 0}/60 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Meta Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Download our free Grid Trading EA for MT4/MT5. Automated trading with advanced risk management..." 
                        className="min-h-24 bg-surface-100 border-white/10 text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-zinc-500">
                      {field.value?.length || 0}/160 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Keywords</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="grid trading, forex ea, mt4 expert advisor" 
                        {...field} 
                        className="bg-surface-100 border-white/10 text-white"
                      />
                    </FormControl>
                    <FormDescription className="text-zinc-500">Comma-separated keywords</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-brand hover:bg-brand/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push("/admin/signals")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
