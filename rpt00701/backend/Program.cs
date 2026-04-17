using Microsoft.Extensions.FileProviders;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = null;
});
var app = builder.Build();

// Determine PodiumJS entrypoint file at startup
var podiumJsRootPath = Path.Combine(builder.Environment.ContentRootPath, "..", "node_modules", "@afassoftware", "podium-js", "dist", "browser");
string? podiumJsEntrypointFile = null;

if (Directory.Exists(podiumJsRootPath))
{
    podiumJsEntrypointFile = Directory.EnumerateFiles(podiumJsRootPath, "podium-js.*.js")
                                      .Select(Path.GetFileName)
                                      .FirstOrDefault();
}

if (string.IsNullOrEmpty(podiumJsEntrypointFile))
{
    app.Logger.LogWarning($"PodiumJS entrypoint file (podium-js.*.js) not found in '{podiumJsRootPath}'. The application might not load correctly.");
}
else
{
    app.Logger.LogInformation($"Using PodiumJS entrypoint: {podiumJsEntrypointFile}");
}

// Serve static files for PodiumJS from node_modules/@afassoftware/podium-js/dist/browser
// This should be registered before the general wwwroot static files if there's any chance of conflict,
// or if specific caching headers are needed for /podium-js/
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(podiumJsRootPath),
    RequestPath = "/podium-js" // Serve files under /podium-js/ path
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "..", "wwwroot")),
    RequestPath = "" // Serve files from the root of the web server
});

// RPT00701 — Mock endpoints voor Abonnementsprijzen mockups
app.MapGet("/api/rpt00701-abonnementsprijzen", () => new[] {
    new { abonr = "AB-1001", naam = "Facilicom BV", abonregel = "Schoonmaak", begindatum = "01-01-2025", einddatum = "31-12-2025", prijs = 125.00m },
    new { abonr = "AB-1001", naam = "Facilicom BV", abonregel = "Schoonmaak", begindatum = "01-01-2026", einddatum = "", prijs = 132.50m },
    new { abonr = "AB-1001", naam = "Facilicom BV", abonregel = "Beveiliging", begindatum = "01-01-2025", einddatum = "31-12-2025", prijs = 200.00m },
    new { abonr = "AB-1001", naam = "Facilicom BV", abonregel = "Beveiliging", begindatum = "01-01-2026", einddatum = "", prijs = 212.00m },
    new { abonr = "AB-1002", naam = "Bakker BV", abonregel = "Catering", begindatum = "01-01-2026", einddatum = "", prijs = 89.25m },
});

app.MapGet("/api/rpt00701-wizard-stap1", () => new {
    Id = "1",
    Debiteur = "100001 - Facilicom BV",
    Factuurdatum = "01-04-2026",
    Peildatum = "01-04-2026",
    Boekingsperiode = "2026/04",
    IndexcorrectiesMeenemen = true,
    StartdatumIndexering = "01-01-2026"
});

app.MapGet("/api/rpt00701-te-corrigeren", () => new[] {
    new { bronfactuur = "F-0389", abonr = "AB-1001", abonregel = "Schoonmaak", periodevn = "01-2026", periodetm = "01-2026", oudeprijs = 125.00m, oudbedrag = 125.00m, nieuweprijs = 132.50m, corrbedrag = 7.50m, status = "Nieuw", meenemen = true },
    new { bronfactuur = "F-0390", abonr = "AB-1001", abonregel = "Schoonmaak", periodevn = "02-2026", periodetm = "02-2026", oudeprijs = 125.00m, oudbedrag = 125.00m, nieuweprijs = 132.50m, corrbedrag = 7.50m, status = "Nieuw", meenemen = true },
    new { bronfactuur = "F-0391", abonr = "AB-1001", abonregel = "Schoonmaak", periodevn = "03-2026", periodetm = "03-2026", oudeprijs = 125.00m, oudbedrag = 125.00m, nieuweprijs = 132.50m, corrbedrag = 7.50m, status = "Nieuw", meenemen = true },
    new { bronfactuur = "F-0389", abonr = "AB-1002", abonregel = "Catering", periodevn = "01-2026", periodetm = "01-2026", oudeprijs = 85.00m, oudbedrag = 85.00m, nieuweprijs = 89.25m, corrbedrag = 4.25m, status = "Al verwerkt", meenemen = false },
});

app.MapGet("/api/rpt00701-collectief-wijzigen", () => new {
    Id = "1",
    Percentage = 6.0,
    VastBedrag = 0.00m,
    OverNemenVanArtikel = false,
    Peildatum = "01-07-2026",
    OokOverNemenAlsLeeg = false,
    MetBegindatum = true,
    Begindatum = "01-01-2026",
    Afronding = "Geen"
});

app.MapPatch("/api/rpt00701-collectief-wijzigen", () => Results.Ok());
app.MapPatch("/api/rpt00701-wizard-stap1", () => Results.Ok());

// RPT00701 — Wizard: Abonnementen factureren (3 stappen)
app.MapGet("/api/rpt00701-wizard", () => new {
    Id = "1",
    Administratie = "1",
    Peildatum = "2026-04-01",
    Factuurdatum = "2026-04-01",
    IndexcorrectiesMeenemen = true,
    StartdatumIndexering = "2026-01-01",
    MeenemenTeCrediterenRegels = false,
    AutomatischVerstrekken = false
});

app.MapGet("/api/rpt00701-wizard/selectie", () => new[] {
    new { abonr = "AB-1001", naam = "Facilicom BV", abonregel = "Schoonmaak", periodevn = "04-2026", periodetm = "04-2026", prijs = 132.50m },
    new { abonr = "AB-1001", naam = "Facilicom BV", abonregel = "Beveiliging", periodevn = "04-2026", periodetm = "04-2026", prijs = 212.00m },
    new { abonr = "AB-1002", naam = "Bakker BV", abonregel = "Catering", periodevn = "04-2026", periodetm = "04-2026", prijs = 89.25m },
    new { abonr = "AB-1003", naam = "Groen & Co", abonregel = "Onderhoud", periodevn = "04-2026", periodetm = "04-2026", prijs = 175.00m },
});

app.MapGet("/api/rpt00701-wizard/te-corrigeren", () => new[] {
    new { bronfactuur = "F-0389", abonr = "AB-1001", abonregel = "Schoonmaak", periodevn = "01-2026", periodetm = "01-2026", oudeprijs = 125.00m, oudbedrag = 125.00m, nieuweprijs = 132.50m, corrbedrag = 7.50m, status = "Nieuw", meenemen = true },
    new { bronfactuur = "F-0390", abonr = "AB-1001", abonregel = "Schoonmaak", periodevn = "02-2026", periodetm = "02-2026", oudeprijs = 125.00m, oudbedrag = 125.00m, nieuweprijs = 132.50m, corrbedrag = 7.50m, status = "Nieuw", meenemen = true },
    new { bronfactuur = "F-0391", abonr = "AB-1001", abonregel = "Schoonmaak", periodevn = "03-2026", periodetm = "03-2026", oudeprijs = 125.00m, oudbedrag = 125.00m, nieuweprijs = 132.50m, corrbedrag = 7.50m, status = "Nieuw", meenemen = true },
    new { bronfactuur = "F-0389", abonr = "AB-1002", abonregel = "Catering", periodevn = "01-2026", periodetm = "01-2026", oudeprijs = 85.00m, oudbedrag = 85.00m, nieuweprijs = 89.25m, corrbedrag = 4.25m, status = "Al verwerkt", meenemen = false },
});

app.MapPatch("/api/rpt00701-wizard", () => Results.Ok());