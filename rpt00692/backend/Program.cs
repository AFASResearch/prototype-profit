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
    new { abonnementsregel = "AR-0001", abonnement = "AB-1001 Facilicom BV", omschrijving = "Schoonmaak kantoor Q1", bedrag = 3750.00m, aangemaakt = "2026-04-01T00:00:00Z", aanmakerNaam = "P. Jansen" },
    new { abonnementsregel = "AR-0002", abonnement = "AB-1001 Facilicom BV", omschrijving = "Schoonmaak kantoor Q2", bedrag = 3750.00m, aangemaakt = "2026-04-01T00:00:00Z", aanmakerNaam = "P. Jansen" },
    new { abonnementsregel = "AR-0003", abonnement = "AB-1001 Facilicom BV", omschrijving = "Beveiliging Q1", bedrag = 6000.00m, aangemaakt = "2026-04-01T00:00:00Z", aanmakerNaam = "M. Bakker" },
    new { abonnementsregel = "AR-0004", abonnement = "AB-1002 Bakker BV", omschrijving = "Catering januari", bedrag = 89.25m, aangemaakt = "2026-03-15T00:00:00Z", aanmakerNaam = "J. de Vries" },
    new { abonnementsregel = "AR-0005", abonnement = "AB-1003 Groen & Co", omschrijving = "Onderhoud tuin maart", bedrag = 525.00m, aangemaakt = "2026-03-01T00:00:00Z", aanmakerNaam = "S. de Groot" },
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
    new { abonnementsregel = "AR-0010", abonnement = "AB-1001 Facilicom BV", omschrijving = "Schoonmaak kantoor april", bedrag = 3750.00m, factuurmoment = "Aantal dagen na einddatumcyclus", geparkeerd = false },
    new { abonnementsregel = "AR-0011", abonnement = "AB-1001 Facilicom BV", omschrijving = "Beveiliging april", bedrag = 6000.00m, factuurmoment = "Aantal dagen voor begindatumcyclus", geparkeerd = false },
    new { abonnementsregel = "AR-0012", abonnement = "AB-1002 Bakker BV", omschrijving = "Catering april", bedrag = 89.25m, factuurmoment = "Aantal dagen na begindatumcyclus", geparkeerd = false },
    new { abonnementsregel = "AR-0013", abonnement = "AB-1003 Groen & Co", omschrijving = "Onderhoud tuin april", bedrag = 525.00m, factuurmoment = "Midden van de factuurperiode", geparkeerd = true },
});

// RPT00692 — Saldoverklaring Te factureren abonnementen omzet
app.MapGet("/api/rpt00692-saldoverklaring", () => new[] {
    new { administratie = "1", abonnementsregel = "AR-0001", abonnement = "AB-1001 Facilicom BV", datumVan = "2026-03-01T00:00:00Z", datumTot = "2026-03-31T00:00:00Z", gefactureerd = 3750.00m, toegerekend = 3750.00m, teruggedraaid = 0.00m, openstaand = 0.00m },
    new { administratie = "1", abonnementsregel = "AR-0002", abonnement = "AB-1001 Facilicom BV", datumVan = "2026-03-01T00:00:00Z", datumTot = "2026-03-31T00:00:00Z", gefactureerd = 2500.00m, toegerekend = 2500.00m, teruggedraaid = 2500.00m, openstaand = 2500.00m },
    new { administratie = "1", abonnementsregel = "AR-0003", abonnement = "AB-1001 Facilicom BV", datumVan = "2026-03-01T00:00:00Z", datumTot = "2026-03-31T00:00:00Z", gefactureerd = 1200.00m, toegerekend = 0.00m, teruggedraaid = 0.00m, openstaand = 1200.00m },
    new { administratie = "1", abonnementsregel = "AR-0004", abonnement = "AB-1002 Bakker BV", datumVan = "2026-03-01T00:00:00Z", datumTot = "2026-03-31T00:00:00Z", gefactureerd = 89.25m, toegerekend = 89.25m, teruggedraaid = 0.00m, openstaand = 0.00m },
    new { administratie = "1", abonnementsregel = "AR-0005", abonnement = "AB-1003 Groen & Co", datumVan = "2026-02-01T00:00:00Z", datumTot = "2026-02-28T00:00:00Z", gefactureerd = 525.00m, toegerekend = 525.00m, teruggedraaid = 525.00m, openstaand = 525.00m },
    new { administratie = "1", abonnementsregel = "AR-0006", abonnement = "AB-1001 Facilicom BV", datumVan = "2026-04-01T00:00:00Z", datumTot = "2026-04-30T00:00:00Z", gefactureerd = 3750.00m, toegerekend = 0.00m, teruggedraaid = 0.00m, openstaand = 3750.00m },
    new { administratie = "1", abonnementsregel = "AR-0007", abonnement = "AB-1001 Facilicom BV", datumVan = "2026-05-01T00:00:00Z", datumTot = "2026-05-31T00:00:00Z", gefactureerd = 0.00m, toegerekend = 0.00m, teruggedraaid = 0.00m, openstaand = 0.00m },
});

// RPT00692 — Eigenschappen abonnement (US09)
app.MapGet("/api/rpt00692-abonnement-eigenschappen", () => new {
    Id = "1"
});

app.MapPatch("/api/rpt00692-abonnement-eigenschappen", () => Results.Ok());

app.MapGet("/api/rpt00692-abonnement-eigenschappen/toekenningsregels", () => new[] {
    new { abonnementsregel = "7007", item = "EnYoi Glasvezel internet 400", boekjaar = 2026, periode = 4, bedrag = 58.00m, status = "Gejournaliseerd", aangemaakt = "2026-03-15T00:00:00Z", aanmakerNaam = "P. de Vries" },
    new { abonnementsregel = "7007", item = "EnYoi Glasvezel internet 400", boekjaar = 2026, periode = 3, bedrag = 58.00m, status = "Gejournaliseerd", aangemaakt = "2026-02-15T00:00:00Z", aanmakerNaam = "P. de Vries" },
    new { abonnementsregel = "7008", item = "EnYoi TV Standaard", boekjaar = 2026, periode = 4, bedrag = 12.50m, status = "Gejournaliseerd", aangemaakt = "2026-03-15T00:00:00Z", aanmakerNaam = "P. de Vries" },
});

app.MapGet("/api/rpt00692-abonnement-eigenschappen/journaalposten", () => new[] {
    new { boekstuknummer = "20260401-001", boekdatum = "2026-04-01T00:00:00Z", boekjaar = 2026, periode = 4, grootboekrekening = "1350 Te factureren abo omzet", omschrijving = "Periodetoekenning apr 2026", debet = (decimal?)58.00m, credit = (decimal?)null },
    new { boekstuknummer = "20260401-002", boekdatum = "2026-04-01T00:00:00Z", boekjaar = 2026, periode = 4, grootboekrekening = "8010 Omzet abonnementen", omschrijving = "Periodetoekenning apr 2026", debet = (decimal?)null, credit = (decimal?)58.00m },
    new { boekstuknummer = "20260301-001", boekdatum = "2026-03-01T00:00:00Z", boekjaar = 2026, periode = 3, grootboekrekening = "1350 Te factureren abo omzet", omschrijving = "Periodetoekenning mrt 2026", debet = (decimal?)58.00m, credit = (decimal?)null },
    new { boekstuknummer = "20260301-002", boekdatum = "2026-03-01T00:00:00Z", boekjaar = 2026, periode = 3, grootboekrekening = "8010 Omzet abonnementen", omschrijving = "Periodetoekenning mrt 2026", debet = (decimal?)null, credit = (decimal?)58.00m },
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

app.Run();