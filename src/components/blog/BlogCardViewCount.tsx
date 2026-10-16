type BlogCardViewCountProps = {
  initialViews: string;
};

function formatViews(value: string) {
  try {
    const views = BigInt(value);
    return views > BigInt(0) ? `${new Intl.NumberFormat("en-US").format(views)} views` : "New";
  } catch {
    return "New";
  }
}

/**
 * The count is supplied from the cached database query that rendered the card.
 * Avoiding a client component here prevents one hydration and one network request
 * per card on catalogue-heavy pages.
 */
export function BlogCardViewCount({ initialViews }: BlogCardViewCountProps) {
  return <span>{formatViews(initialViews)}</span>;
}
