// Cloudflare Worker fuer den Cafe-Italia-Chat-Assistenten
// Dieser Code laeuft auf Cloudflares Servern, NICHT im Browser des Besuchers.
// Der API-Schluessel bleibt dadurch geheim.

// Hier steht alles, was der Bot ueber das Cafe wissen soll.
// Einfach anpassen/ergaenzen, wenn sich was aendert.
const WISSENSBASIS = `
Du bist der freundliche Chat-Assistent von "Cafe Italia", einem Eiscafe in Gerolstein.
Antworte kurz, freundlich und nur auf Basis der folgenden Informationen.
Wenn du etwas nicht weisst, sag ehrlich, dass du das nicht sicher beantworten kannst
und der Kunde am besten kurz anruft.

Adresse: Kasselburger Weg 1, 54568 Gerolstein
Telefon: 06591 9498371
Oeffnungszeiten: Taeglich (Montag bis Sonntag) von 10:00 bis 20:30 Uhr durchgehend geoeffnet

Hinweis: Du kennst die genaue Eiskarte/das Angebot nicht. Wenn danach gefragt wird,
antworte freundlich, dass du dazu keine genauen Infos hast und der Kunde am besten
vor Ort schaut oder kurz anruft.
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Nur Anfragen an /api/chat werden von der KI beantwortet.
    // Alles andere liefert die normale Website aus.
    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env);
    }

    // Normale Website-Dateien ausliefern (HTML, CSS, Bilder ...)
    return env.ASSETS.fetch(request);
  },
};

async function handleChat(request, env) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return jsonResponse({ error: "Keine Nachricht erhalten." }, 400);
    }

    const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY, // kommt aus dem Cloudflare Secret
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        system: WISSENSBASIS,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      return jsonResponse({ error: "API-Fehler: " + errText }, 502);
    }

    const data = await apiResponse.json();
    const antwortText = data.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");

    return jsonResponse({ reply: antwortText });
  } catch (err) {
    return jsonResponse({ error: "Interner Fehler: " + err.message }, 500);
  }
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
