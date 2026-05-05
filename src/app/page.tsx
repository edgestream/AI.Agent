import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const messages = [
  {
    role: "Agent",
    text: "Willkommen. Ich halte den oberen Bereich fuer den Dialog frei und lasse darunter die dynamische Arbeitsflaeche offen.",
  },
  {
    role: "Du",
    text: "Erzeuge unten eine neue Webansicht fuer den aktuellen Arbeitsschritt.",
  },
  {
    role: "Agent",
    text: "Bereit. Die untere Flaeche ist als flexibel belegbarer Bereich vorbereitet und kann spaeter mit generierten Inhalten gefuellt werden.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col gap-4 md:min-h-[calc(100vh-3rem)]">
        <Card className="overflow-hidden border-white/60 bg-white/85 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)] backdrop-blur">
          <CardHeader className="border-b border-border/70 bg-linear-to-r from-sky-50 via-cyan-50 to-white">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Agent Workspace
                </p>
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  Chatbereich fuer Steuerung und Abstimmung
                </CardTitle>
              </div>
              <div className="inline-flex w-fit items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-medium text-sky-900">
                Bereit fuer generierte Ansichten
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              <ScrollArea className="h-56 rounded-2xl border border-border/70 bg-muted/40 p-4">
                <div className="space-y-3 pr-4">
                  {messages.map((message) => (
                    <div
                      key={`${message.role}-${message.text.slice(0, 16)}`}
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                        message.role === "Agent"
                          ? "bg-white text-foreground"
                          : "ml-auto bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] opacity-70">
                        {message.role}
                      </p>
                      <p>{message.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Input
                  aria-label="Nachricht an den Agenten"
                  placeholder="Beschreibe den naechsten Schritt fuer die dynamische Flaeche ..."
                  className="h-12 bg-white"
                />
                <Button className="h-12 px-6">Senden</Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
              <Card className="border-border/70 bg-slate-950 text-slate-50">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                    Modus
                  </p>
                  <p className="mt-2 text-lg font-semibold">Agent Chat</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Oberer Bereich fuer Dialog, Planung und Befehle.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/70 bg-white">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-semibold">Leerlauf</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Unten ist noch keine generierte Ansicht aktiv.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/70 bg-cyan-50">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-900/70">
                    Hinweisschicht
                  </p>
                  <p className="mt-2 text-lg font-semibold text-cyan-950">
                    Frei belegbar
                  </p>
                  <p className="mt-1 text-sm text-cyan-950/75">
                    Die Hauptflaeche kann durch Agenten dynamisch ersetzt werden.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <section className="flex min-h-[22rem] flex-1 flex-col rounded-[2rem] border border-dashed border-sky-300/80 bg-white/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-3 border-b border-border/60 pb-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Dynamische Arbeitsflaeche
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-balance">
                Freier Bereich fuer generierte Webinhalte
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Dieser Bereich bleibt bewusst offen und kann spaeter als Canvas,
              Dashboard, Formularstrecke oder Ergebnisansicht befuellt werden.
            </p>
          </div>

          <div className="relative mt-5 flex flex-1 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(232,244,255,0.88))] p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.12),transparent_26%),radial-gradient(circle_at_80%_30%,rgba(34,211,238,0.14),transparent_24%),linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:auto,auto,24px_24px,24px_24px]" />
            <div className="relative z-10 max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.26em] text-sky-800/80">
                Placeholder Surface
              </p>
              <h3 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                Hier kann der Agent die naechste Webflaeche aufbauen
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Das Scaffold trennt Kommunikation und generierte Darstellung
                klar voneinander: oben der Chat, unten die offene Produktflaeche.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
