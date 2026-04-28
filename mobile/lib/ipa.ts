import ipaData from "./ipa.json";

type WordData = {
  ipa: string;
  def1: string;
  def2: string;
};

export const getWordData = (word: string): WordData | null => {
  if (!word) return null;

  const clean = word.toLowerCase().replace(/[^a-z]/g, "");

  return (ipaData as Record<string, WordData>)[clean] || null;
};
