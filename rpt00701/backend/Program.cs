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
    RequestPath = "", // Serve files from the root of the web server
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers["Cache-Control"] = "no-store";
    }
});

// Serve pages from Lopende/*/pages/ and Gebrieft/*/pages/ project directories at /pages/
{
    var repoRoot = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, ".."));
    var pageProviders = new List<IFileProvider>();
    foreach (var folder in new[] { "Lopende", "Gebrieft" })
    {
        var folderPath = Path.Combine(repoRoot, folder);
        if (Directory.Exists(folderPath))
        {
            foreach (var projectDir in Directory.GetDirectories(folderPath))
            {
                var pagesDir = Path.Combine(projectDir, "pages");
                if (Directory.Exists(pagesDir))
                {
                    pageProviders.Add(new PhysicalFileProvider(pagesDir));
                    app.Logger.LogInformation($"Serving pages from: {pagesDir}");
                }
            }
        }
    }
    if (pageProviders.Count > 0)
    {
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new CompositeFileProvider(pageProviders),
            RequestPath = "/pages",
            OnPrepareResponse = ctx =>
            {
                ctx.Context.Response.Headers["Cache-Control"] = "no-store";
            }
        });
    }
}

// RPT00701 — Mock endpoints voor Abonnementsprijzen mockups
app.MapGet("/api/rpt00701-abonnementsprijzen", () => new[] {
    new { abonr = "AB-1001", naam = "Facilicom BV", abonregel = "Schoonmaak", begindatum = "01-01-2025", einddatum = "31-12-2025", prijs = 125.00m },
    new { abonr = "AB-1001", naam = "Facilicom BV", abonregel = "Schoonmaak", begindatum = "01-01-2026", einddatum = "", prijs = 132.50m },
    new { abonr = "AB-1001", naam = "Facilicom BV", abonregel = "Beveiliging", begindatum = "01-01-2025", einddatum = "31-12-2025", prijs = 200.00m },
    new { abonr = "AB-1001", naam = "Facilicom BV", abonregel = "Beveiliging", begindatum = "01-01-2026", einddatum = "", prijs = 212.00m },
    new { abonr = "AB-1002", naam = "Bakker BV", abonregel = "Catering", begindatum = "01-01-2026", einddatum = "", prijs = 89.25m },
});

// RPT00701 — Eigenschappen historie verkoopprijs
app.MapGet("/api/rpt00701-abonnementsprijzen/detail", () => new {
    Id = "1",
    Naam = "Facilicom BV",
    Abonnementsregel = "Schoonmaak",
    Prijslijst = "Basisprijslijst (excl BTW)",
    Valuta = "Euro"
});
app.MapPatch("/api/rpt00701-abonnementsprijzen/detail", () => Results.Ok());
app.MapGet("/api/rpt00701-abonnementsprijzen/historie", () => new[] {
    new { code = "100", valuta = "EUR", verkoopprijs = 125.00m, begindatum = "01-01-2025", einddatum = "31-12-2025", eenheid = "*****", huidigePrijs = false, dim1 = "", dim2 = "" },
    new { code = "100", valuta = "EUR", verkoopprijs = 132.50m, begindatum = "01-01-2026", einddatum = "", eenheid = "*****", huidigePrijs = true, dim1 = "", dim2 = "" },
});

app.MapGet("/api/rpt00701-wizard-stap1", () => new {
    Id = "1",
    Debiteur = "100001 - Facilicom BV",
    Factuurdatum = "01-04-2026",
    Peildatum = "01-04-2026",
    Boekingsperiode = "2026/04",
    IndexcorrectiesMeenemen = true,
    StartdatumIndexering = "2026-01-01T00:00:00Z"
});

app.MapGet("/api/rpt00701-te-corrigeren", () => new[] {
    new { bronfactuur = "F-0389", abonr = "AB-1001", abonregel = "Schoonmaak", periodevn = "01-2026", periodetm = "01-2026", aantal = 1, oudeprijs = 125.00m, oudbedrag = 125.00m, nieuweprijs = 132.50m, nieuwbedrag = 132.50m, corrbedrag = 7.50m, status = "Nieuw", meenemen = true },
    new { bronfactuur = "F-0390", abonr = "AB-1001", abonregel = "Schoonmaak", periodevn = "02-2026", periodetm = "02-2026", aantal = 1, oudeprijs = 125.00m, oudbedrag = 125.00m, nieuweprijs = 132.50m, nieuwbedrag = 132.50m, corrbedrag = 7.50m, status = "Nieuw", meenemen = true },
    new { bronfactuur = "F-0391", abonr = "AB-1001", abonregel = "Schoonmaak", periodevn = "03-2026", periodetm = "03-2026", aantal = 1, oudeprijs = 125.00m, oudbedrag = 125.00m, nieuweprijs = 132.50m, nieuwbedrag = 132.50m, corrbedrag = 7.50m, status = "Nieuw", meenemen = true },
    new { bronfactuur = "F-0389", abonr = "AB-1002", abonregel = "Catering", periodevn = "01-2026", periodetm = "01-2026", aantal = 1, oudeprijs = 85.00m, oudbedrag = 85.00m, nieuweprijs = 89.25m, nieuwbedrag = 89.25m, corrbedrag = 4.25m, status = "Al verwerkt", meenemen = false },
});

app.MapGet("/api/rpt00701-collectief-wijzigen", () => new {
    Id = "1",
    OverNemenVanArtikel = false,
    OokOverNemenAlsLeeg = false,
    MetBegindatum = true,
    Begindatum = "2026-01-01T00:00:00Z",
    Afronding = "geen"
});

app.MapPatch("/api/rpt00701-collectief-wijzigen", () => Results.Ok());

// RPT00701 — Weergave: Prijswijzigingen abonnementsregels
// Gefilterd op peildatum als Peildatum toepassen aan staat.
app.MapGet("/api/rpt00701-prijswijzigingen", () => new[] {
    new { peildatum = "2026-05-04T00:00:00Z", abonr = 3000, naam = "Van Ubbens Advies B.V.", vrkrel = 10024, item = "EnYoi Net Onderhoud", code = 7002, aantal = 12, waardeBV = 660.00m, afwPrijs = 660.00m, begin = "2026-01-01T00:00:00Z", eind = "2026-12-31T00:00:00Z", begindatumTarief = (string?)null, einddatumTarief = (string?)null },
    new { peildatum = "2026-05-04T00:00:00Z", abonr = 3000, naam = "Van Ubbens Advies B.V.", vrkrel = 10024, item = "EnYoi Net ADSL", code = 7000, aantal = 12, waardeBV = 359.40m, afwPrijs = 359.40m, begin = "2026-01-01T00:00:00Z", eind = "2026-12-31T00:00:00Z", begindatumTarief = (string?)null, einddatumTarief = (string?)null },
    new { peildatum = "2026-05-04T00:00:00Z", abonr = 3000, naam = "Van Ubbens Advies B.V.", vrkrel = 10024, item = "EnYoi Net Magazine", code = 7001, aantal = 12, waardeBV = 95.40m, afwPrijs = 95.40m, begin = "2026-01-01T00:00:00Z", eind = "2026-12-31T00:00:00Z", begindatumTarief = (string?)null, einddatumTarief = (string?)null },
    new { peildatum = "2026-05-04T00:00:00Z", abonr = 3001, naam = "Multihouse Techniek B.V.", vrkrel = 10058, item = "EnYoi Net ADSL", code = 7000, aantal = 3, waardeBV = 89.85m, afwPrijs = 89.85m, begin = "2026-01-01T00:00:00Z", eind = "2026-12-31T00:00:00Z", begindatumTarief = (string?)null, einddatumTarief = (string?)null },
    new { peildatum = "2026-05-04T00:00:00Z", abonr = 3001, naam = "Multihouse Techniek B.V.", vrkrel = 10058, item = "EnYoi Net Magazine", code = 7001, aantal = 3, waardeBV = 23.85m, afwPrijs = 23.85m, begin = "2026-01-01T00:00:00Z", eind = "2026-12-31T00:00:00Z", begindatumTarief = (string?)null, einddatumTarief = (string?)null },
    new { peildatum = "2026-05-04T00:00:00Z", abonr = 3002, naam = "Air-Trading Ruurlo", vrkrel = 10009, item = "EnYoi Net ADSL", code = 7000, aantal = 1, waardeBV = 29.95m, afwPrijs = 29.95m, begin = "2026-01-01T00:00:00Z", eind = "2026-07-31T00:00:00Z", begindatumTarief = (string?)null, einddatumTarief = (string?)null },
    new { peildatum = "2026-05-04T00:00:00Z", abonr = 3004, naam = "Slijpkes Biljards B.V.", vrkrel = 10027, item = "EnYoi Net Magazine", code = 7001, aantal = 5, waardeBV = 39.75m, afwPrijs = 39.75m, begin = "2026-01-01T00:00:00Z", eind = "2026-12-31T00:00:00Z", begindatumTarief = (string?)null, einddatumTarief = (string?)null },
    new { peildatum = "2026-05-04T00:00:00Z", abonr = 3005, naam = "Taxi- en vervoerscentrale Beers", vrkrel = 10005, item = "EnYoi Net Onderhoud", code = 7002, aantal = 1, waardeBV = 55.00m, afwPrijs = 55.00m, begin = "2026-01-01T00:00:00Z", eind = "2026-06-30T00:00:00Z", begindatumTarief = (string?)null, einddatumTarief = (string?)null },
    new { peildatum = "2026-05-04T00:00:00Z", abonr = 3006, naam = "MBT Industrial B.V.", vrkrel = 10043, item = "EnYoi Net ADSL", code = 7000, aantal = 1, waardeBV = 32.50m, afwPrijs = 32.50m, begin = "2026-01-01T00:00:00Z", eind = "2026-06-30T00:00:00Z", begindatumTarief = (string?)null, einddatumTarief = (string?)null },
    new { peildatum = "2026-05-04T00:00:00Z", abonr = 3007, naam = "Perfecta Bouw", vrkrel = 10002, item = "EnYoi Net ADSL", code = 7000, aantal = 1, waardeBV = 29.95m, afwPrijs = 29.95m, begin = "2026-01-01T00:00:00Z", eind = "2026-07-31T00:00:00Z", begindatumTarief = (string?)null, einddatumTarief = (string?)null },
  });
app.MapPatch("/api/rpt00701-wizard-stap1", () => Results.Ok());

// RPT00701 — Boekingslay-out: Onderhouden abonnementstarieven
app.MapGet("/api/rpt00701-onderhouden", () => new { Id = "1", Begindatum = "2026-05-04T00:00:00Z" });
app.MapPatch("/api/rpt00701-onderhouden", () => Results.Ok());
app.MapGet("/api/rpt00701-onderhouden/regels", () => new[] {
    new { abonr = "AB-1001", regelnr = 1, naam = "Facilicom BV", itemcode = "SCH-01", omschrijving = "Schoonmaak kantoor",       prijsHdg = 132.50m,  begindatumHdg = "2026-01-01T00:00:00Z", einddatumHdg = (string?)null, begindatumNw = (string?)null, einddatumNw = (string?)null, prijsNw = (decimal?)null },
    new { abonr = "AB-1001", regelnr = 2, naam = "Facilicom BV", itemcode = "BEV-01", omschrijving = "Beveiliging receptie",     prijsHdg = 212.00m,  begindatumHdg = "2026-01-01T00:00:00Z", einddatumHdg = (string?)null, begindatumNw = (string?)null, einddatumNw = (string?)null, prijsNw = (decimal?)null },
    new { abonr = "AB-1002", regelnr = 1, naam = "Bakker BV",    itemcode = "CAT-01", omschrijving = "Catering lunch",           prijsHdg = 89.25m,   begindatumHdg = "2026-01-01T00:00:00Z", einddatumHdg = (string?)null, begindatumNw = (string?)null, einddatumNw = (string?)null, prijsNw = (decimal?)null },
});

// RPT00701 — Boekingslay-out: Abonnementsfactuur (Facilicom indexcorrectie-voorbeeld)
app.MapGet("/api/rpt00701-abonnementsfactuur", () => new {
    Id = "1",
    Verkooprelatie = "Facilicom BV (10200)",
    Factuurdatum = "2026-04-29T00:00:00Z",
    Opdrachtnummer = "",
    Btwplicht = "Verkopen standaard (1)",
    Totaalbedrag = 155.00m,
    BtwBedrag = 32.55m,
    Factuurtotaal = 187.55m
});
app.MapPatch("/api/rpt00701-abonnementsfactuur", () => Results.Ok());
app.MapGet("/api/rpt00701-abonnementsfactuur/regels", () => new[] {
    new { id = "1", omschrijving = "Schoonmaak april 2026",                aantal = 1, prijs = 132.50m,  bedrag = 132.50m },
    new { id = "2", omschrijving = "Indexcorrectie terugdraaiing 01-2026", aantal = 1, prijs = -125.00m, bedrag = -125.00m },
    new { id = "3", omschrijving = "Indexcorrectie nieuwe prijs  01-2026", aantal = 1, prijs = 132.50m,  bedrag = 132.50m },
    new { id = "4", omschrijving = "Indexcorrectie terugdraaiing 02-2026", aantal = 1, prijs = -125.00m, bedrag = -125.00m },
    new { id = "5", omschrijving = "Indexcorrectie nieuwe prijs  02-2026", aantal = 1, prijs = 132.50m,  bedrag = 132.50m },
    new { id = "6", omschrijving = "Indexcorrectie terugdraaiing 03-2026", aantal = 1, prijs = -125.00m, bedrag = -125.00m },
    new { id = "7", omschrijving = "Indexcorrectie nieuwe prijs  03-2026", aantal = 1, prijs = 132.50m,  bedrag = 132.50m },
});

// RPT00701 — Wizard: Prijsregel kiezen
app.MapGet("/api/rpt00701-prijsregel-wizard", () => new {
    Id = "1",
    Prijsregel = "1",
    NieuwePrijs = 140.00m
});

// RPT00701 — Eigenschappen prijzen/kortingen Artikel (container)
app.MapGet("/api/rpt00701-eigenschappen-prijzen", () => new { Id = "1" });

// RPT00701 — Lege lijsten voor niet-relevante secties
var legeKortingLijst = Array.Empty<object>();
var legePrijsLijst = Array.Empty<object>();
app.MapGet("/api/rpt00701-eigenschappen-prijzen/inkoopprijs", () => legePrijsLijst);
app.MapGet("/api/rpt00701-eigenschappen-prijzen/verkoopprijs-actie", () => legePrijsLijst);
app.MapGet("/api/rpt00701-eigenschappen-prijzen/verkoopkorting", () => legeKortingLijst);
app.MapGet("/api/rpt00701-eigenschappen-prijzen/verkoopkorting-actie", () => legeKortingLijst);
app.MapGet("/api/rpt00701-eigenschappen-prijzen/kostprijs", () => legePrijsLijst);
app.MapGet("/api/rpt00701-eigenschappen-prijzen/inkoopkorting", () => legeKortingLijst);
app.MapGet("/api/rpt00701-eigenschappen-prijzen/inkoopkorting-actie", () => legeKortingLijst);
app.MapGet("/api/rpt00701-eigenschappen-prijzen/inkoopprijs-actie", () => legePrijsLijst);
app.MapGet("/api/rpt00701-eigenschappen-prijzen/verrekenprijs", () => legePrijsLijst);

// RPT00701 — Verkoopprijs (item) weergave
app.MapGet("/api/rpt00701-verkoopprijs-item", () => new[] {
  new { id = "1", huidigePrijs = true,  prijslijst = "*****", prijslijstVerkoop = "Basisprijslijst (excl BTW)", begin = "2026-04-29T00:00:00Z", verkoopprijs = 70.00m, valuta = "EUR", eenheid = "Stuks", debiteur = "", naam = "", project = "", projectNaam = "", dim1 = "", dim2 = "" },
  new { id = "2", huidigePrijs = true,  prijslijst = "*****", prijslijstVerkoop = "Basisprijslijst (excl BTW)", begin = "2026-01-01T00:00:00Z", verkoopprijs = 58.00m, valuta = "EUR", eenheid = "Stuks", debiteur = "10186", naam = "Van Kempen Afbouw b.v.", project = "", projectNaam = "", dim1 = "", dim2 = "" },
  new { id = "3", huidigePrijs = true,  prijslijst = "*****", prijslijstVerkoop = "Basisprijslijst (excl BTW)", begin = "2026-04-01T00:00:00Z", verkoopprijs = 65.00m, valuta = "EUR", eenheid = "Stuks", debiteur = "", naam = "", project = "300000", projectNaam = "Onderhoud EnYoi", dim1 = "", dim2 = "" },
});

// RPT00701 — Wizard: Nieuwe verkoopprijs (bestaand)
app.MapGet("/api/rpt00701-nieuwe-verkoopprijs", () => new {
    Id = "1",
    Type = "",
    TypeItem = "Art",
    Itemcode = "EnYoi Net Onderhoud (7002)",
    Eenheid = "Stuks (STK)",
    AantalPerEenheid = 1,
    Valuta = "EUR",
    HuidigeVerkoopprijs = 70.00m,
    Verkoopprijs = 0.00m,
    BerekendePrijs = 0.00m,
    Begindatum = "2012-12-31T00:00:00Z",
    KortingToestaan = "0",
    KortingOpOrderregelWijzigen = true
});

// RPT00701 — Weergave Abonnementstarieven
app.MapGet("/api/rpt00701-abonnementstarieven", (string? regelcode) => {
    var tarieven = new[] {
        new { id = "1", regelcode = "7007", abonr = "AB-1001", naam = "Total Job B.V.", regelnr = 1, abonregel = "EnYoi Glasvezel internet 400", begindatum = "2025-02-27T00:00:00Z", einddatum = (string?)"2026-04-28T00:00:00Z", prijs = 58.00m, huidigePrijs = false },
        new { id = "2", regelcode = "7007", abonr = "AB-1001", naam = "Total Job B.V.", regelnr = 1, abonregel = "EnYoi Glasvezel internet 400", begindatum = "2026-04-29T00:00:00Z", einddatum = (string?)null, prijs = 60.00m, huidigePrijs = true },
        new { id = "3", regelcode = "7008", abonr = "AB-1001", naam = "Total Job B.V.", regelnr = 2, abonregel = "EnYoi TV Standaard", begindatum = "2025-02-27T00:00:00Z", einddatum = (string?)null, prijs = 12.50m, huidigePrijs = true },
        new { id = "4", regelcode = "7009", abonr = "AB-1001", naam = "Total Job B.V.", regelnr = 3, abonregel = "Onderhoudsabonnement modem", begindatum = "2025-02-27T00:00:00Z", einddatum = (string?)null, prijs = 4.50m, huidigePrijs = true },
    };

    return string.IsNullOrWhiteSpace(regelcode)
        ? tarieven
        : tarieven.Where(tarief => tarief.regelcode == regelcode).ToArray();
});

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
    new { bronfactuur = "F-0389", abonr = "AB-1001", abonregel = "Schoonmaak", periodevn = "01-2026", periodetm = "01-2026", aantal = 1, oudeprijs = 125.00m, oudbedrag = 125.00m, nieuweprijs = 132.50m, nieuwbedrag = 132.50m, corrbedrag = 7.50m, status = "Nieuw", meenemen = true },
    new { bronfactuur = "F-0390", abonr = "AB-1001", abonregel = "Schoonmaak", periodevn = "02-2026", periodetm = "02-2026", aantal = 1, oudeprijs = 125.00m, oudbedrag = 125.00m, nieuweprijs = 132.50m, nieuwbedrag = 132.50m, corrbedrag = 7.50m, status = "Nieuw", meenemen = true },
    new { bronfactuur = "F-0391", abonr = "AB-1001", abonregel = "Schoonmaak", periodevn = "03-2026", periodetm = "03-2026", aantal = 1, oudeprijs = 125.00m, oudbedrag = 125.00m, nieuweprijs = 132.50m, nieuwbedrag = 132.50m, corrbedrag = 7.50m, status = "Nieuw", meenemen = true },
    new { bronfactuur = "F-0389", abonr = "AB-1002", abonregel = "Catering", periodevn = "01-2026", periodetm = "01-2026", aantal = 1, oudeprijs = 85.00m, oudbedrag = 85.00m, nieuweprijs = 89.25m, nieuwbedrag = 89.25m, corrbedrag = 4.25m, status = "Al verwerkt", meenemen = false },
});

app.MapPatch("/api/rpt00701-wizard", () => Results.Ok());
app.MapGet("/api/rpt00701-boekingslayout-abonnement", () => new {
    Id = "1",
    // Kop - Algemeen
    Verkooprelatie = "Total Job B.V. (10132)",
    FactuurNaarAfwijkende = false,
    Contactpersoon = "",
    Betaalvoorwaarde = "30 dagen (30)",
    BegindatumAbonnement = "2025-02-27T00:00:00Z",
    Project = "",
    Projectfase = "",
    UitsluitenVerzamelfactuur = false,
    Administratie = "EnYoi ICT Services B.V. (1)",
    // Kop - Cyclus
    BegindatumCyclus = "2025-02-27T00:00:00Z",
    EinddatumCyclus = "2026-04-30T00:00:00Z",
    // Kop - Factuurmoment (nieuw US07)
    Factuurmoment = "1",
    AantalDagen = 15,
    // Staart - Verkoop
    ItemcodeVerkoop = "TP-Link Acces point (6000)",
    KortingPercentageVerkoop = 0.00m,
    OrgVerkoopprijs = 312.00m,
    KortingsbedragVerkoop = 0.00m,
    AfwVerkoopprijs = 0.00m,
    Verkoopbedrag = 312.00m
});

app.MapPatch("/api/rpt00701-boekingslayout-abonnement", () => Results.Ok());

app.MapGet("/api/rpt00701-boekingslayout-abonnement/regels", () => new[] {
    new { code = "7007", omschrijving = "EnYoi Glasvezel internet 400", aantal = 1, begin = "2025-02-27T00:00:00Z", orgPrijs = 58.00m, afwPrijs = (decimal?)60.00m, kortingPercentage = (decimal?)null, korting = (decimal?)null },
    new { code = "7008", omschrijving = "EnYoi TV Standaard", aantal = 1, begin = "2025-02-27T00:00:00Z", orgPrijs = 12.50m, afwPrijs = (decimal?)null, kortingPercentage = (decimal?)null, korting = (decimal?)null },
    new { code = "7009", omschrijving = "Onderhoudsabonnement modem", aantal = 1, begin = "2025-02-27T00:00:00Z", orgPrijs = 4.50m, afwPrijs = (decimal?)null, kortingPercentage = (decimal?)null, korting = (decimal?)null },
});

app.MapPatch("/api/rpt00701-boekingslayout-abonnement/regels/update", () => Results.Ok());
// SPA Fallback: Serve the dynamic HTML for any request not handled by static files.
app.MapFallback(async context =>
{
    var cspNonce = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

    // These URLs could be made configurable
    var applicationEndpointUrl = "/";
    var assetsBaseUrl = "/podium-js/";

    var pageTitle = "Podium Application"; // Or any other title
    var applicationName = "Podium Application"; // Or any other name
    var loadingMessage = "Loading..."; // Or any other loading message

    if (string.IsNullOrEmpty(podiumJsEntrypointFile))
    {
        context.Response.ContentType = "text/html";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsync($@"<!doctype html>
<html>
<head><title>Error</title></head>
<body><h1>Application Error</h1><p>The PodiumJS application cannot be loaded because its entrypoint file was not found.</p></body>
</html>");
        return;
    }

    var htmlContent = $@"<!doctype html>
<html>
  <head>
    <title>{pageTitle}</title>
    <base href=""{applicationEndpointUrl}"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1"" />
    <link type=""image/png"" rel=""icon"" sizes=""48x48"" href=""{assetsBaseUrl}favicon.png"" />
  </head>
  <body>
    <div id=""loading"">{loadingMessage}</div>
    <a id=""editor-btn"" href=""/editor.html"" target=""_blank"" style=""position:fixed;bottom:16px;right:16px;z-index:9999;background:#0078d4;color:#fff;border:none;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:20px;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer"" title=""Mockup Editor"" onclick=""var p=location.pathname.split('/').filter(Boolean)[0];if(p)this.href='/editor.html?page='+encodeURIComponent(p)"">&#9998;</a>
    <style nonce=""{cspNonce}"">
      .delete-page-btn {{
        display: inline-block !important;
        margin-left: 8px;
        background: none;
        border: none;
        color: #999;
        font-size: 16px;
        cursor: pointer;
        padding: 0 4px;
        border-radius: 4px;
        line-height: 1;
        vertical-align: middle;
        opacity: 0;
        transition: opacity 0.15s;
      }}
      .delete-page-btn:hover {{
        color: #d32f2f !important;
        background: rgba(211,47,47,0.1);
      }}
      .StartMenuLayout-menuItem:hover .delete-page-btn {{
        opacity: 1;
      }}
      /* Drag-and-drop reorder styles */
      .reorder-handle {{
        display: none;
        cursor: grab;
        color: #999;
        font-size: 14px;
        padding: 0 6px 0 0;
        user-select: none;
        flex-shrink: 0;
      }}
      .reorder-handle:active {{ cursor: grabbing; }}
      .StartMenuLayout-menuItem:hover .reorder-handle {{ display: inline; }}
      .StartMenuLayout-menuItem.dragging {{ opacity: 0.4; pointer-events: none; }}
      .StartMenuLayout-menuItem.drag-over-top {{ border-top: 2px solid #0078d4; margin-top: -2px; }}
      .StartMenuLayout-menuItem.drag-over-bottom {{ border-bottom: 2px solid #0078d4; margin-bottom: -2px; }}
      .reorder-ghost {{
        position: fixed;
        pointer-events: none;
        z-index: 10000;
        background: #fff;
        border: 1px solid #0078d4;
        border-radius: 4px;
        padding: 4px 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        font-size: 13px;
        color: #333;
        white-space: nowrap;
        opacity: 0.9;
      }}
    </style>
    <script module=""true"" nonce=""{cspNonce}"">
      // Update editor link with current page
      setTimeout(() => {{
        const path = location.pathname.replace(/^\//, '').replace(/\/\d+$/, '');
        if (path && path !== 'menu' && path !== 'home') {{
          document.getElementById('editor-btn').href = '/editor.html?page=' + path;
        }}
      }}, 100);

      // Delete buttons on start menu entries
      const PROTECTED = new Set(['home', 'menu', '_services']);
      function extractPageName(href) {{
        if (!href) return null;
        return href.replace(/^\//, '').replace(/\/\d+$/, '').replace(/\?.*$/, '');
      }}
      function addDeleteButtons() {{
        const items = document.querySelectorAll('a.StartMenuLayout-menuItem');
        if (!items.length) return false;
        items.forEach(a => {{
          if (a.querySelector('.delete-page-btn')) return;
          const pageName = extractPageName(a.getAttribute('href'));
          if (!pageName || PROTECTED.has(pageName)) return;
          // Skip editor entry (link to home but data-id is editor)
          if (a.dataset.id === 'editor') return;
          const btn = document.createElement('button');
          btn.className = 'delete-page-btn';
          btn.textContent = '\u00D7';
          btn.title = 'Verwijder pagina';
          btn.addEventListener('click', async (e) => {{
            e.preventDefault();
            e.stopPropagation();
            if (!confirm('Weet je zeker dat je de pagina \'' + pageName + '\' wilt verwijderen?\n\nDit verwijdert alle bronbestanden, compiled output en de menu-entry.')) return;
            try {{
              const res = await fetch('/api/editor/pages/' + encodeURIComponent(pageName), {{ method: 'DELETE' }});
              if (res.ok) {{
                // Remove entry from DOM
                const category = a.closest('.StartMenuLayout-category');
                a.remove();
                // If category has no more links, remove the whole group
                if (category && !category.querySelector('a.StartMenuLayout-menuItem')) {{
                  category.remove();
                }}
              }} else {{
                const data = await res.json().catch(() => ({{}}));
                alert('Verwijderen mislukt: ' + (data.error || res.statusText));
              }}
            }} catch (err) {{
              alert('Verwijderen mislukt: ' + err.message);
            }}
          }});
          a.appendChild(btn);
        }});
        return true;
      }}
      // Wait for PodiumJS to render the menu, then add buttons
      const observer = new MutationObserver(() => {{
        if (addDeleteButtons()) observer.disconnect();
      }});
      observer.observe(document.body, {{ childList: true, subtree: true }});
      // Also try immediately and on navigation changes
      setTimeout(addDeleteButtons, 1000);
      window.addEventListener('popstate', () => setTimeout(addDeleteButtons, 500));

      // Pointer-based drag reorder for menu entries within a group
      let dragState = null; // {{ el, ghost, category, groupIndex, startY }}

      function getGroupIndex(categoryEl) {{
        const categories = document.querySelectorAll('.StartMenuLayout-category');
        return Array.from(categories).indexOf(categoryEl);
      }}

      async function reorderEntry(groupIndex, entryId, newIndex) {{
        const res = await fetch('/api/menu-config');
        if (!res.ok) return;
        const groups = await res.json();
        if (groupIndex < 0 || groupIndex >= groups.length) return;
        const groupId = groups[groupIndex].id;
        await fetch('/api/menu-config/reorder', {{
          method: 'POST',
          headers: {{ 'Content-Type': 'application/json' }},
          body: JSON.stringify({{ groupId, entryId, newIndex }})
        }});
      }}

      function getClosestLink(category, y) {{
        const links = Array.from(category.querySelectorAll('a.StartMenuLayout-menuItem'));
        let closest = null;
        let closestDist = Infinity;
        let insertBefore = true;
        for (const link of links) {{
          const rect = link.getBoundingClientRect();
          const mid = rect.top + rect.height / 2;
          const dist = Math.abs(y - mid);
          if (dist < closestDist) {{
            closestDist = dist;
            closest = link;
            insertBefore = y < mid;
          }}
        }}
        return {{ closest, insertBefore }};
      }}

      function onPointerMove(e) {{
        if (!dragState) return;
        e.preventDefault();
        const {{ ghost, category, el }} = dragState;
        ghost.style.left = (e.clientX + 12) + 'px';
        ghost.style.top = (e.clientY - 10) + 'px';

        // Clear all indicators
        category.querySelectorAll('.drag-over-top,.drag-over-bottom').forEach(el => {{
          el.classList.remove('drag-over-top', 'drag-over-bottom');
        }});

        const {{ closest, insertBefore }} = getClosestLink(category, e.clientY);
        if (closest && closest !== el) {{
          closest.classList.add(insertBefore ? 'drag-over-top' : 'drag-over-bottom');
        }}
      }}

      async function onPointerUp(e) {{
        if (!dragState) return;
        const {{ el, ghost, category, groupIndex }} = dragState;
        dragState = null;
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);

        ghost.remove();
        el.classList.remove('dragging');
        category.querySelectorAll('.drag-over-top,.drag-over-bottom').forEach(el => {{
          el.classList.remove('drag-over-top', 'drag-over-bottom');
        }});

        const {{ closest, insertBefore }} = getClosestLink(category, e.clientY);
        if (!closest || closest === el) return;

        // Move DOM element
        if (insertBefore) {{
          closest.parentNode.insertBefore(el, closest);
        }} else {{
          closest.parentNode.insertBefore(el, closest.nextSibling);
        }}

        // Calculate new index after DOM move
        const links = Array.from(category.querySelectorAll('a.StartMenuLayout-menuItem'));
        const newIndex = links.indexOf(el);
        const entryId = el.dataset.id || extractPageName(el.getAttribute('href'));
        if (entryId && newIndex >= 0) {{
          await reorderEntry(groupIndex, entryId, newIndex);
        }}
      }}

      function addDragHandles() {{
        const items = document.querySelectorAll('a.StartMenuLayout-menuItem');
        if (!items.length) return false;

        items.forEach(a => {{
          if (a.querySelector('.reorder-handle')) return;

          const handle = document.createElement('span');
          handle.className = 'reorder-handle';
          handle.textContent = '\u2807';
          handle.title = 'Sleep om te verplaatsen';
          a.insertBefore(handle, a.firstChild);

          handle.addEventListener('pointerdown', (e) => {{
            e.preventDefault();
            e.stopPropagation();

            const category = a.closest('.StartMenuLayout-category');
            if (!category) return;

            a.classList.add('dragging');

            const ghost = document.createElement('div');
            ghost.className = 'reorder-ghost';
            ghost.textContent = a.textContent.replace(/[⠇×]/g, '').trim();
            ghost.style.left = (e.clientX + 12) + 'px';
            ghost.style.top = (e.clientY - 10) + 'px';
            document.body.appendChild(ghost);

            dragState = {{
              el: a,
              ghost,
              category,
              groupIndex: getGroupIndex(category),
              startY: e.clientY
            }};

            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
          }});
        }});
        return true;
      }}

      // Wait for menu to render, then add drag handles
      const reorderObserver = new MutationObserver(() => {{
        if (addDragHandles()) reorderObserver.disconnect();
      }});
      reorderObserver.observe(document.body, {{ childList: true, subtree: true }});
      setTimeout(addDragHandles, 1500);
      window.addEventListener('popstate', () => setTimeout(addDragHandles, 500));

      const afasAppConfig = {{
        applicationName: '{applicationName}',
        podiumJsUrl: '{assetsBaseUrl}',
        menuServiceUrl: '_services/menu',
        spotlightServiceUrl: '_services/spotlight'
      }};
      import('{assetsBaseUrl}{podiumJsEntrypointFile}').then(module => {{
        if (module && typeof module.default === 'function') {{
          module.default(window, afasAppConfig).then(() => {{
            const loadingElement = document.getElementById('loading');
            if (loadingElement) {{
              loadingElement.remove();
            }}
          }}).catch(err => {{
            console.error('Error initializing PodiumJS:', err);
            const loadingElement = document.getElementById('loading');
            if (loadingElement) {{
              loadingElement.textContent = 'Error initializing application.';
            }}
          }});
        }} else {{
          console.error('PodiumJS module or its default export is not valid.');
          const loadingElement = document.getElementById('loading');
          if (loadingElement) {{
            loadingElement.textContent = 'Error loading application module.';
          }}
        }}
      }}).catch(err => {{
        console.error('Error importing PodiumJS entrypoint:', err);
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {{
          loadingElement.textContent = 'Error loading application assets.';
        }}
      }});
    </script>
  </body>
</html>";


    context.Response.Headers.Append("Content-Security-Policy", $"default-src 'none'; child-src 'self' blob:; script-src 'self' 'nonce-{cspNonce}' blob:; object-src 'self'; connect-src 'self' wss://{context.Request.Host} https://api-eu.mixpanel.com; img-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src 'self'; worker-src 'self'");
    context.Response.ContentType = "text/html";
    await context.Response.WriteAsync(htmlContent);
});
app.Run();
record MenuReorderRequest(string groupId, string entryId, int newIndex);
record MenuEntry(string id, string description, string link);
record MenuGroup(string id, string description, List<MenuEntry> entries);