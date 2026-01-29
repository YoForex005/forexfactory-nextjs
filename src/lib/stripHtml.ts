function stripHtmlTags(html: string | null | undefined): string {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "");
}
