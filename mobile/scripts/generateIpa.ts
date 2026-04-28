import path from "path";
import xlsx from "xlsx";

const FILE_PATH = path.resolve(__dirname, "../ipa.xlsx");

const API_URL = "https://www.dictionaryapi.com/api/v3/references/sd2/json";
const API_KEY = "f188526c-724a-4b56-af94-593e5d8c73ae";

type Row = {
  word: string;
  ipa?: string;
  def1?: string;
  def2?: string;
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function getWordData(word: string): Promise<{
  ipa: string;
  def1: string;
  def2: string;
}> {
  try {
    const url = `${API_URL}/${word}?key=${API_KEY}`;
    console.log("REQUEST:", url);

    const res = await fetch(url);
    console.log("STATUS:", res.status);

    const text = await res.text();

    if (text.startsWith("Invalid")) {
      console.error("❌ Invalid API key or endpoint mismatch");
      return { ipa: "", def1: "", def2: "" };
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("❌ Failed to parse JSON:", text);
      return { ipa: "", def1: "", def2: "" };
    }

    console.log("RESPONSE:", JSON.stringify(data, null, 2));

    const entry = data?.[0];

    const ipaRaw = entry?.hwi?.prs?.[0]?.mw || entry?.hwi?.prs?.[1]?.mw || "";

    const ipa = ipaRaw ? `/${ipaRaw}/` : "";

    const defs: string[] = entry?.shortdef || [];

    const def1 = defs[0] || "";
    const def2 = defs[1] || "";

    return { ipa, def1, def2 };
  } catch (err) {
    console.error("ERROR:", err);
    return { ipa: "", def1: "", def2: "" };
  }
}

async function run() {
  try {
    const workbook = xlsx.readFile(FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data: Row[] = xlsx.utils.sheet_to_json(sheet);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row || !row.word) continue;

      const word = row.word.toLowerCase().trim();

      const hasIPA = !!row.ipa?.trim();
      const hasDef1 = !!row.def1?.trim();
      const hasDef2 = !!row.def2?.trim();

      // ✅ Skip if everything is already complete
      if (hasIPA && hasDef1 && hasDef2) {
        console.log("⏭️ Skipping (complete):", word);
        continue;
      }

      console.log("\n🔤 Generating data for:", word);

      const result = await getWordData(word);

      // ✅ Only fill missing fields
      if (!hasIPA) {
        if (!result.ipa) {
          console.warn("⚠️ No IPA found for:", word);
        }
        row.ipa = result.ipa;
      }

      if (!hasDef1) {
        if (!result.def1) {
          console.warn("⚠️ No definition found for:", word);
        }
        row.def1 = result.def1;
      }

      if (!hasDef2) {
        row.def2 = result.def2;
      }

      await delay(200); // prevent rate limiting
    }

    const newSheet = xlsx.utils.json_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;

    xlsx.writeFile(workbook, FILE_PATH);

    console.log("\n✅ IPA + Definitions generation complete!");
  } catch (err) {
    console.error("❌ Script failed:", err);
  }
}

run();
