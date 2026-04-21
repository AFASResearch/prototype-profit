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
// RPT00692 — Mock endpoints voor Periodetoekenning omzet abonnement
app.MapGet("/api/rpt00692-toekenningsregels", () => new[] {
    new { abonnementsregel = "AR-0001", jaarJournaal = "2026", periodeJournaal = 4, jaarFactuur = "2026", periodeFactuur = 4, abonnement = "AB-1001 Facilicom BV", omschrijving = "Schoonmaak kantoor april", bedrag = 3750.00m, aangemaakt = "2026-04-01T00:00:00Z", aanmakerNaam = "P. Jansen" },
    new { abonnementsregel = "AR-0002", jaarJournaal = "2026", periodeJournaal = 4, jaarFactuur = "2026", periodeFactuur = 4, abonnement = "AB-1001 Facilicom BV", omschrijving = "Beveiliging april", bedrag = 6000.00m, aangemaakt = "2026-04-01T00:00:00Z", aanmakerNaam = "P. Jansen" },
    new { abonnementsregel = "AR-0003", jaarJournaal = "2026", periodeJournaal = 4, jaarFactuur = "2026", periodeFactuur = 4, abonnement = "AB-1002 Bakker BV", omschrijving = "Catering april", bedrag = 89.25m, aangemaakt = "2026-04-02T00:00:00Z", aanmakerNaam = "P. de Vries" },
    new { abonnementsregel = "AR-0004", jaarJournaal = "2026", periodeJournaal = 4, jaarFactuur = "2026", periodeFactuur = 4, abonnement = "AB-1003 Groen & Co", omschrijving = "Tuinonderhoud april", bedrag = 525.00m, aangemaakt = "2026-04-02T00:00:00Z", aanmakerNaam = "P. de Vries" },
    new { abonnementsregel = "AR-0005", jaarJournaal = "2026", periodeJournaal = 4, jaarFactuur = "2026", periodeFactuur = 4, abonnement = "AB-1004 Van Kempen Afbouw", omschrijving = "Glasvezel internet 200 april", bedrag = 48.50m, aangemaakt = "2026-04-03T00:00:00Z", aanmakerNaam = "K. Bakker" },
    new { abonnementsregel = "AR-0006", jaarJournaal = "2026", periodeJournaal = 4, jaarFactuur = "2026", periodeFactuur = 4, abonnement = "AB-1005 Timmer Notariaat", omschrijving = "Net Magazine april", bedrag = 9.60m, aangemaakt = "2026-04-03T00:00:00Z", aanmakerNaam = "K. Bakker" },
    // Retroactieve correcties: factuurtijdvak in gesloten maart (periode 3), journaalpost in huidige open april (periode 4)
    new { abonnementsregel = "AR-0001", jaarJournaal = "2026", periodeJournaal = 4, jaarFactuur = "2026", periodeFactuur = 3, abonnement = "AB-1001 Facilicom BV", omschrijving = "Schoonmaak kantoor maart (correctie)", bedrag = 250.00m, aangemaakt = "2026-04-15T00:00:00Z", aanmakerNaam = "P. de Vries" },
    new { abonnementsregel = "AR-0003", jaarJournaal = "2026", periodeJournaal = 4, jaarFactuur = "2026", periodeFactuur = 3, abonnement = "AB-1002 Bakker BV", omschrijving = "Catering maart (correctie)", bedrag = -15.00m, aangemaakt = "2026-04-15T00:00:00Z", aanmakerNaam = "P. de Vries" },
});

app.MapGet("/api/rpt00692-abonnement-cyclus", () => new {
    Id = "1",
    // Tab Algemeen
    status = "Open (0)",
    administratie = "EnYoi ICT Services B.V. (1)",
    periodeafsluitingsplan = "Periodeafsluiting",
    boekjaar = "2026",
    periode = "April (4)",
    begindatumPeriode = "01-04-2026",
    einddatumPeriode = "30-04-2026"
});

app.MapPatch("/api/rpt00692-abonnement-cyclus", () => Results.Ok());

app.MapGet("/api/rpt00692-facturering-voorraad", () => new {
    Id = "1",
    begindatumFactCyclus = "01",
    cyclus = "M1",
    voorstelDatumVerlenging = "01",
    cyclusVerlenging = "J1",
    methodeVerdeling = "P",
    periodetoekenningToepassen = true,
    teFacturerenOmzetRekening = "1500 - Te factureren abonnementen omzet"
});

app.MapPatch("/api/rpt00692-facturering-voorraad", () => Results.Ok());

// RPT00692 — Wizard: Genereer periodetoekenningsregels
app.MapGet("/api/rpt00692-genereer-wizard", () => new {
    Id = "1",
    Boekjaar = 2026,
    Periode = "April (4)"
});

app.MapGet("/api/rpt00692-genereer-wizard/preview", () => new[] {
    new { abonnementsregel = "AR-0010", abonnement = "AB-1001 Facilicom BV", omschrijving = "Schoonmaak kantoor april", bedrag = 3750.00m, verkooprelatie = "Facilicom BV", verkooprelatienr = 10201, abonnementsnr = 1001, soort = "Schoonmaak", item = "Kantoorschoonmaak", begin = "2026-01-01T00:00:00Z", eind = (string?)null, cyclus = "Maand", aantal = 1 },
    new { abonnementsregel = "AR-0011", abonnement = "AB-1001 Facilicom BV", omschrijving = "Beveiliging april", bedrag = 6000.00m, verkooprelatie = "Facilicom BV", verkooprelatienr = 10201, abonnementsnr = 1001, soort = "Beveiliging", item = "Objectbeveiliging", begin = "2026-01-01T00:00:00Z", eind = (string?)null, cyclus = "Maand", aantal = 1 },
    new { abonnementsregel = "AR-0012", abonnement = "AB-1002 Bakker BV", omschrijving = "Catering april", bedrag = 89.25m, verkooprelatie = "Bakker BV", verkooprelatienr = 10202, abonnementsnr = 1002, soort = "Catering", item = "Lunchpakket", begin = "2026-02-01T00:00:00Z", eind = (string?)null, cyclus = "Maand", aantal = 1 },
    new { abonnementsregel = "AR-0013", abonnement = "AB-1003 Groen & Co", omschrijving = "Onderhoud tuin april", bedrag = 525.00m, verkooprelatie = "Groen & Co", verkooprelatienr = 10203, abonnementsnr = 1003, soort = "Onderhoud", item = "Tuinonderhoud", begin = "2026-01-15T00:00:00Z", eind = (string?)"2026-12-31T00:00:00Z", cyclus = "Maand", aantal = 1 },
});

// RPT00692 — Saldoverklaring: init (periode + telling)
app.MapGet("/api/rpt00692-saldoverklaring/init", () => new {
    Id = "1",
    Administratie = "EnYoi ICT Services B.V. (1)",
    Boekjaar = 2026,
    Periode = "3",
    Grootboeksaldo = 8475.00m,
    TotaalGefactureerd = 11814.25m,
    TotaalToegerekend = 6864.25m,
    TotaalTeruggedraaid = 525.00m,
    TotaalHandmatig = 3000.00m,
    Verschil = 0.00m
});

// RPT00692 — Saldoverklaring Te factureren abonnementen omzet
app.MapGet("/api/rpt00692-saldoverklaring", () => new[] {
    new { administratie = "1", abonnementsregel = "AR-0001", abonnement = "AB-1001 Facilicom BV", datumVan = "2026-03-01T00:00:00Z", datumTot = "2026-03-31T00:00:00Z", gefactureerd = 3750.00m, toegerekend = 3750.00m, teruggedraaid = 0.00m, openstaand = 0.00m },
    new { administratie = "1", abonnementsregel = "AR-0002", abonnement = "AB-1001 Facilicom BV", datumVan = "2026-03-01T00:00:00Z", datumTot = "2026-03-31T00:00:00Z", gefactureerd = 2500.00m, toegerekend = 2500.00m, teruggedraaid = 0.00m, openstaand = 0.00m },
    new { administratie = "1", abonnementsregel = "AR-0003", abonnement = "AB-1001 Facilicom BV", datumVan = "2026-03-01T00:00:00Z", datumTot = "2026-03-31T00:00:00Z", gefactureerd = 1200.00m, toegerekend = 0.00m, teruggedraaid = 0.00m, openstaand = 1200.00m },
    new { administratie = "1", abonnementsregel = "AR-0004", abonnement = "AB-1002 Bakker BV", datumVan = "2026-03-01T00:00:00Z", datumTot = "2026-03-31T00:00:00Z", gefactureerd = 89.25m, toegerekend = 89.25m, teruggedraaid = 0.00m, openstaand = 0.00m },
    new { administratie = "1", abonnementsregel = "AR-0005", abonnement = "AB-1003 Groen & Co", datumVan = "2026-02-01T00:00:00Z", datumTot = "2026-02-28T00:00:00Z", gefactureerd = 525.00m, toegerekend = 525.00m, teruggedraaid = 525.00m, openstaand = 525.00m },
    new { administratie = "1", abonnementsregel = "AR-0006", abonnement = "AB-1001 Facilicom BV", datumVan = "2026-04-01T00:00:00Z", datumTot = "2026-04-30T00:00:00Z", gefactureerd = 3750.00m, toegerekend = 0.00m, teruggedraaid = 0.00m, openstaand = 3750.00m },
    new { administratie = "1", abonnementsregel = "AR-0007", abonnement = "AB-1001 Facilicom BV", datumVan = "2026-05-01T00:00:00Z", datumTot = "2026-05-31T00:00:00Z", gefactureerd = 0.00m, toegerekend = 0.00m, teruggedraaid = 0.00m, openstaand = 0.00m },
    new { administratie = "1", abonnementsregel = "Handmatige boekingen", abonnement = "", datumVan = (string?)null, datumTot = (string?)null, gefactureerd = 0.00m, toegerekend = 0.00m, teruggedraaid = 0.00m, openstaand = 3000.00m },
});

// RPT00692 — Eigenschappen abonnement (US09)
app.MapGet("/api/rpt00692-abonnement-eigenschappen", () => new {
    Id = "1",
    Abonnementnummer = "AB-1001",
    Debiteur = "Facilicom BV",
    Omschrijving = "EnYoi Glasvezel internet 400",
    BegindatumCyclus = "2026-04-01T00:00:00Z",
    EinddatumCyclus = "2026-04-30T00:00:00Z",
    Factuurmoment = "Aantal dagen na einddatumcyclus",
    AantalDagen = 15
});

// KPI K004 — Dagen tot facturering
app.MapGet("/api/rpt00692-abonnement-eigenschappen/kpi", () => new {
    dagen = 32
});

app.MapPatch("/api/rpt00692-abonnement-eigenschappen", () => Results.Ok());

app.MapGet("/api/rpt00692-abonnement-eigenschappen/toekenningsregels", () => new[] {
    new { verkooprelatie = "Van Kempen Afbouw b.v.", verkooprelatienr = 10186, abonnementsnr = 4236, soort = "Combi internet/onderh/magazine", item = "Garantiecontract", begin = "2026-01-27T00:00:00Z", eind = (string?)null, cyclus = "Maand", aantal = 1, orgPrijs = 1046.35m },
    new { verkooprelatie = "Van Kempen Afbouw b.v.", verkooprelatienr = 10186, abonnementsnr = 4239, soort = "Combi internet/onderh/magazine", item = "EnYoi Glasvezel internet 200 Mb", begin = "2026-01-14T00:00:00Z", eind = (string?)"2026-03-31T00:00:00Z", cyclus = "Maand", aantal = 1, orgPrijs = 48.50m },
    new { verkooprelatie = "Van Kempen Afbouw b.v.", verkooprelatienr = 10186, abonnementsnr = 4232, soort = "Combi onderhoud/magazine", item = "EnYoi Glasvezel internet 50 Mb", begin = "2026-01-05T00:00:00Z", eind = (string?)null, cyclus = "Maand", aantal = 1, orgPrijs = 44.00m },
});

app.MapGet("/api/rpt00692-abonnement-eigenschappen/journaalposten", () => new[] {
    new { boekstuknummer = "20260401-001", boekdatum = "2026-04-01T00:00:00Z", boekjaar = 2026, periode = 4, grootboekrekening = "1350 Te factureren abo omzet", omschrijving = "Periodetoekenning apr 2026", debet = (decimal?)58.00m, credit = (decimal?)null },
    new { boekstuknummer = "20260401-002", boekdatum = "2026-04-01T00:00:00Z", boekjaar = 2026, periode = 4, grootboekrekening = "8010 Omzet abonnementen", omschrijving = "Periodetoekenning apr 2026", debet = (decimal?)null, credit = (decimal?)58.00m },
    new { boekstuknummer = "20260301-001", boekdatum = "2026-03-01T00:00:00Z", boekjaar = 2026, periode = 3, grootboekrekening = "1350 Te factureren abo omzet", omschrijving = "Periodetoekenning mrt 2026", debet = (decimal?)58.00m, credit = (decimal?)null },
    new { boekstuknummer = "20260301-002", boekdatum = "2026-03-01T00:00:00Z", boekjaar = 2026, periode = 3, grootboekrekening = "8010 Omzet abonnementen", omschrijving = "Periodetoekenning mrt 2026", debet = (decimal?)null, credit = (decimal?)58.00m },
});

// RPT00692 — Boekingslay-out abonnement (US07)
app.MapGet("/api/rpt00692-boekingslayout-abonnement", () => new {
    Id = "1",
app.MapPatch("/api/rpt00692-boekingslayout-abonnement", () => Results.Ok());

app.MapGet("/api/rpt00692-boekingslayout-abonnement/regels", () => new[] {
    new { code = "7007", omschrijving = "EnYoi Glasvezel internet 400", aantal = 1, begin = "2025-02-27T00:00:00Z", orgPrijs = 58.00m, afwPrijs = (decimal?)null, kortingPercentage = (decimal?)null, korting = (decimal?)null },
    new { code = "7008", omschrijving = "EnYoi TV Standaard", aantal = 1, begin = "2025-02-27T00:00:00Z", orgPrijs = 12.50m, afwPrijs = (decimal?)null, kortingPercentage = (decimal?)null, korting = (decimal?)null },
    new { code = "7009", omschrijving = "Onderhoudsabonnement modem", aantal = 1, begin = "2025-02-27T00:00:00Z", orgPrijs = 4.50m, afwPrijs = (decimal?)null, kortingPercentage = (decimal?)null, korting = (decimal?)null },
});

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
    <script module=""true"" nonce=""{cspNonce}"">
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