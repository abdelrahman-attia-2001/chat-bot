import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message } = await req.json();

  try {
    // ✅ هنا استدعاء OpenAI API
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "أنت مساعد ذكي يتحدث بالعربية بطلاقة." },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? "لم أفهم سؤالك.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ reply: "حدث خطأ في الاتصال بالخادم." });
  }
}
