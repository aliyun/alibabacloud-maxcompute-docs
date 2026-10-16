export type SearchEntry = {
  title: string;
  description: string;
  href: string;
  group: string;
  keywords: string;
  product?: string;
  status?: string;
  docType?: string;
};

export function searchTerms(query: string): string[] {
  return [
    ...new Set(
      query
        .normalize('NFKC')
        .toLowerCase()
        .trim()
        .replace(/(?:如何|怎么|怎样)/g, '')
        .replace(/([a-z0-9])([\p{Script=Han}])/gu, '$1 $2')
        .replace(/([\p{Script=Han}])([a-z0-9])/gu, '$1 $2')
        .split(/[\s，,。？?！!]+/u)
        .filter(Boolean),
    ),
  ];
}

export function searchDocs(
  entries: SearchEntry[],
  query: string,
  {
    product = '',
    currentProduct = '',
  }: {product?: string; currentProduct?: string} = {},
): Array<SearchEntry & {snippet: string}> {
  const terms = searchTerms(query);
  return entries
    .filter((entry) => !product || entry.product === product)
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const description = entry.description.toLowerCase();
      const group = entry.group.toLowerCase();
      const keywords = entry.keywords.toLowerCase();
      const text = `${title} ${description} ${group} ${keywords}`;
      if (!terms.every((term) => text.includes(term))) return null;
      const score =
        terms.reduce(
          (sum, term) =>
            sum +
            (title.includes(term) ? 80 : 0) +
            (description.includes(term) ? 30 : 0) +
            (group.includes(term) ? 18 : 0) +
            (keywords.includes(term) ? 4 : 0),
          0,
        ) +
        (entry.docType === 'quickstart' ? 45 : 0) +
        (entry.product === currentProduct && currentProduct ? 10 : 0) -
        (entry.status === 'deprecated' ? 60 : 0);
      const bodyMatch = terms.find(
        (term) => keywords.includes(term) && !description.includes(term),
      );
      const source = bodyMatch ? entry.keywords : entry.description;
      const start = bodyMatch
        ? Math.max(0, source.toLowerCase().indexOf(bodyMatch) - 32)
        : 0;
      const snippet = `${start ? '…' : ''}${source.slice(start, start + 130)}${source.length > start + 130 ? '…' : ''}`;
      return {...entry, snippet, score};
    })
    .filter(
      (entry): entry is SearchEntry & {snippet: string; score: number} =>
        entry !== null,
    )
    .sort(
      (a, b) => b.score - a.score || a.title.localeCompare(b.title, 'zh-CN'),
    );
}

export function searchKeyAction(
  event: Pick<
    KeyboardEvent,
    'key' | 'ctrlKey' | 'metaKey' | 'isComposing' | 'keyCode'
  >,
): 'none' | 'toggle' | 'close' | 'tab' | 'next' | 'previous' {
  // IME candidate selection owns these keys until composition completes.
  if (event.isComposing || event.keyCode === 229) return 'none';
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')
    return 'toggle';
  if (event.key === 'Escape') return 'close';
  if (event.key === 'Tab') return 'tab';
  if (event.key === 'ArrowDown') return 'next';
  if (event.key === 'ArrowUp') return 'previous';
  return 'none';
}
