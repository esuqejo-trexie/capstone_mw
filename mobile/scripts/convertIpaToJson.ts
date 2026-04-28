import fs from "fs";
import path from "path";
import xlsx from "xlsx";

const FILE_PATH = path.resolve(__dirname, "../ipa.xlsx");
const OUTPUT_PATH = path.resolve(__dirname, "../lib/ipa.json");

type Row = {
  word: string;
  ipa?: string;
  def1?: string;
  def2?: string;
};

function run() {
  const workbook = xlsx.readFile(FILE_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const data: Row[] = xlsx.utils.sheet_to_json(sheet);

  const formatted: Record<string, { ipa: string; def1: string; def2: string }> =
    {};

  data.forEach((row) => {
    if (!row.word) return;

    const key = row.word.toLowerCase().trim();

    formatted[key] = {
      ipa: row.ipa || "",
      def1: row.def1 || "",
      def2: row.def2 || "",
    };
  });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(formatted, null, 2));

  console.log("✅ ipa.json generated!");
}

run();
