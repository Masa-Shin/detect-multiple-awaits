import { parse } from "node-html-parser";

export const extractScript = (source: string): string => {
  const parsed = parse(source)
  const script = parsed.querySelector('script');

  return (script ?? parsed).rawText
};
