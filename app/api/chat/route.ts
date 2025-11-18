import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message } = await req.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { reply: "من فضلك أرسل رسالة نصية صحيحة." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "أنت مساعد ذكي يتحدث بالعربية بطلاقة، يجيب بإجابات واضحة ومختصرة ومهذبة.",
          },
          { role: "user", content: message },
        ],
      }),
    });

    if (!res.ok) {
      console.error("OpenAI API error status:", res.status, await res.text());
      return NextResponse.json(
        { reply: "حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي." },
        { status: 500 }
      );
    }

    const data = await res.json();
    const reply =
      data?.choices?.[0]?.message?.content ??
      "عفوًا، لم أتمكن من فهم سؤالك. هل يمكنك إعادة صياغته بشكل مختلف؟";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { reply: "حدث خطأ في الاتصال بالخادم. حاول لاحقًا." },
      { status: 500 }
    );
  }
}
