"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Search, Edit, AlertCircle, CheckCircle, XCircle,
  FileText, Code, Settings, Globe, Copy, ExternalLink,
  Save, Loader2, RefreshCw, TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface SeoContent {
  id: number;
  type: 'blog' | 'signal' | 'page';
  title: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  updatedAt: string;
  status: 'good' | 'warning' | 'error';
  issues: string[];
}

interface SeoStats {
  total: number;
  good: number;
  warning: number;
  error: number;
}

export default function SeoManagerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("content");
  const [isLoading, setIsLoading] = useState(true);
  const [contents, setContents] = useState<SeoContent[]>([]);
  const [stats, setStats] = useState<SeoStats>({ total: 0, good: 0, warning: 0, error: 0 });
  const [searchTerm, setSearchTerm] = useState("");

  // Selected item for editing
  const [selectedContent, setSelectedContent] = useState<SeoContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Robots.txt state
  const [robotsContent, setRobotsContent] = useState("");
  const [isSavingRobots, setIsSavingRobots] = useState(false);

  // Sitemap state
  const [sitemapPreview, setSitemapPreview] = useState("");
  const [isRegeneratingSitemap, setIsRegeneratingSitemap] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated") {
      fetchSeoData();
    }
  }, [status, router]);

  const fetchSeoData = async () => {
    setIsLoading(true);
    try {
      // Fetch content list
      const res = await fetch("/api/admin/seo/content");
      if (!res.ok) throw new Error("Failed to fetch SEO content");
      const data = await res.json();
      setContents(data.content);
      setStats(data.stats);

      // Fetch robots.txt
      const robotsRes = await fetch("/api/admin/seo/robots");
      if (robotsRes.ok) {
        const robotsData = await robotsRes.json();
        setRobotsContent(robotsData.content);
      }

      // Fetch sitemap
      const sitemapRes = await fetch("/api/admin/seo/sitemap");
      if (sitemapRes.ok) {
        const sitemapData = await sitemapRes.json();
        setSitemapPreview(sitemapData.preview);
      }

    } catch (error) {
      console.error("Error fetching SEO data:", error);
      toast.error("Failed to load SEO data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSeo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedContent) return;

    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    const updateData = {
      metaTitle: formData.get("metaTitle"),
      metaDescription: formData.get("metaDescription"),
      keywords: formData.get("keywords"),
      canonicalUrl: formData.get("canonicalUrl"),
      ogTitle: formData.get("ogTitle"),
      ogDescription: formData.get("ogDescription"),
      ogImage: formData.get("ogImage"),
    };

    try {
      const res = await fetch(`/api/admin/seo/content/${selectedContent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedContent.type, ...updateData }),
      });

      if (!res.ok) throw new Error("Failed to update SEO");

      toast.success("SEO settings updated");
      setSelectedContent(null);
      fetchSeoData(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error("Failed to update SEO settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRobots = async () => {
    setIsSavingRobots(true);
    try {
      const res = await fetch("/api/admin/seo/robots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: robotsContent }),
      });

      if (!res.ok) throw new Error("Failed to save robots.txt");
      toast.success("robots.txt updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save robots.txt");
    } finally {
      setIsSavingRobots(false);
    }
  };

  const handleRegenerateSitemap = async () => {
    setIsRegeneratingSitemap(true);
    try {
      const res = await fetch("/api/admin/seo/sitemap", { method: "POST" });
      if (!res.ok) throw new Error("Failed to regenerate sitemap");

      const data = await res.json();
      setSitemapPreview(data.preview);
      toast.success("Sitemap regenerated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to regenerate sitemap");
    } finally {
      setIsRegeneratingSitemap(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const filteredContents = contents.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 bg-surface-100">
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-surface-100">
        <div className="container mx-auto p-6 lg:p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">SEO Manager</h1>
              <p className="text-zinc-400">Manage SEO settings and optimize for search engines</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-surface-50 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                </CardContent>
              </Card>
              <Card className="bg-surface-50 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white">Good SEO</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-2xl font-bold text-green-500">{stats.good}</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-surface-50 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white">Warnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-2xl font-bold text-yellow-500">{stats.warning}</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-surface-50 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white">Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-2xl font-bold text-red-500">{stats.error}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-surface-50 border border-white/10">
                <TabsTrigger value="content" className="data-[state=active]:bg-brand data-[state=active]:text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  Content SEO
                </TabsTrigger>
                <TabsTrigger value="robots" className="data-[state=active]:bg-brand data-[state=active]:text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  robots.txt
                </TabsTrigger>
                <TabsTrigger value="sitemap" className="data-[state=active]:bg-brand data-[state=active]:text-white">
                  <Globe className="h-4 w-4 mr-2" />
                  Sitemap
                </TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4">
                <Card className="bg-surface-50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Content SEO</CardTitle>
                    <CardDescription className="text-zinc-400">Manage SEO settings for all your content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                          placeholder="Search content..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 bg-surface-100 border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <div className="rounded-md border border-white/10 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-surface-100">
                          <TableRow className="border-white/10 hover:bg-surface-100">
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-zinc-400">Title</TableHead>
                            <TableHead className="text-zinc-400">Type</TableHead>
                            <TableHead className="text-zinc-400">Meta Title</TableHead>
                            <TableHead className="text-zinc-400">Issues</TableHead>
                            <TableHead className="text-zinc-400">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredContents.map((item) => (
                            <TableRow key={`${item.type}-${item.id}`} className="border-white/10 hover:bg-white/5">
                              <TableCell>
                                {item.status === 'good' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {item.status === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                                {item.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-white">{item.title}</p>
                                  <p className="text-xs text-zinc-500">/{item.slug}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-white/20 text-zinc-300">{item.type}</Badge>
                              </TableCell>
                              <TableCell>
                                <p className="truncate max-w-[200px] text-sm text-zinc-300">
                                  {item.metaTitle || <span className="text-zinc-600 italic">Not set</span>}
                                </p>
                              </TableCell>
                              <TableCell>
                                {item.issues.length > 0 ? (
                                  <div className="space-y-1">
                                    {item.issues.slice(0, 1).map((issue, i) => (
                                      <Badge key={i} variant="destructive" className="text-[10px] h-5 px-1">
                                        {issue}
                                      </Badge>
                                    ))}
                                    {item.issues.length > 1 && (
                                      <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-surface-100 text-zinc-400">
                                        +{item.issues.length - 1} more
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none">All Good</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedContent(item)}
                                  className="text-zinc-400 hover:text-white hover:bg-white/10"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Robots.txt Tab */}
              <TabsContent value="robots">
                <Card className="bg-surface-50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">robots.txt Configuration</CardTitle>
                    <CardDescription className="text-zinc-400">Control how search engines crawl your site</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">robots.txt Content</Label>
                      <Textarea
                        value={robotsContent}
                        onChange={(e) => setRobotsContent(e.target.value)}
                        className="font-mono text-sm h-64 bg-surface-100 border-white/10 text-white"
                        placeholder="User-agent: *"
                      />
                    </div>

                    <div className="flex justify-between">
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => copyToClipboard(robotsContent)} className="border-white/10 text-zinc-300 hover:bg-white/5">
                          <Copy className="h-4 w-4 mr-2" /> Copy
                        </Button>
                      </div>
                      <Button onClick={handleSaveRobots} disabled={isSavingRobots} className="bg-brand hover:bg-brand-dark">
                        {isSavingRobots ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sitemap Tab */}
              <TabsContent value="sitemap">
                <Card className="bg-surface-50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">XML Sitemap</CardTitle>
                    <CardDescription className="text-zinc-400">Help search engines discover your content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Sitemap Preview</Label>
                      <Textarea
                        value={sitemapPreview}
                        readOnly
                        className="font-mono text-xs h-64 bg-surface-100 border-white/10 text-zinc-400"
                      />
                    </div>

                    <div className="flex justify-between">
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.open('/sitemap.xml', '_blank')} className="border-white/10 text-zinc-300 hover:bg-white/5">
                          <ExternalLink className="h-4 w-4 mr-2" /> View Live
                        </Button>
                      </div>
                      <Button onClick={handleRegenerateSitemap} disabled={isRegeneratingSitemap} className="bg-brand hover:bg-brand-dark">
                        {isRegeneratingSitemap ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                        Regenerate Sitemap
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Edit Dialog */}
            <Dialog open={!!selectedContent} onOpenChange={(open) => !open && setSelectedContent(null)}>
              <DialogContent className="max-w-2xl bg-surface-50 border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Edit SEO Settings</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    {selectedContent?.title}
                  </DialogDescription>
                </DialogHeader>

                {selectedContent && (
                  <form onSubmit={handleSaveSeo} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Meta Title</Label>
                      <Input
                        name="metaTitle"
                        defaultValue={selectedContent.metaTitle || ""}
                        className="bg-surface-100 border-white/10 text-white"
                      />
                      <p className="text-xs text-zinc-500">Recommended: 50-60 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Meta Description</Label>
                      <Textarea
                        name="metaDescription"
                        defaultValue={selectedContent.metaDescription || ""}
                        className="bg-surface-100 border-white/10 text-white h-24"
                      />
                      <p className="text-xs text-zinc-500">Recommended: 150-160 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Keywords</Label>
                      <Input
                        name="keywords"
                        defaultValue={selectedContent.keywords || ""}
                        placeholder="comma, separated, keywords"
                        className="bg-surface-100 border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Canonical URL</Label>
                      <Input
                        name="canonicalUrl"
                        defaultValue={selectedContent.canonicalUrl || ""}
                        className="bg-surface-100 border-white/10 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Open Graph Title</Label>
                        <Input
                          name="ogTitle"
                          defaultValue={selectedContent.ogTitle || ""}
                          className="bg-surface-100 border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Open Graph Image</Label>
                        <Input
                          name="ogImage"
                          defaultValue={selectedContent.ogImage || ""}
                          className="bg-surface-100 border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setSelectedContent(null)} className="text-zinc-400">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSaving} className="bg-brand hover:bg-brand-dark">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
