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
    factuurmoment = "1",
    aantalDagen = 10,
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
    new { abonnementsregel = "AR-0010", abonnement = "AB-1001 Facilicom BV", omschrijving = "Schoonmaak kantoor april", bedrag = 3750.00m, factuurmoment = "Aantal dagen na einddatumcyclus" },
    new { abonnementsregel = "AR-0011", abonnement = "AB-1001 Facilicom BV", omschrijving = "Beveiliging april", bedrag = 6000.00m, factuurmoment = "Aantal dagen na einddatumcyclus" },
    new { abonnementsregel = "AR-0012", abonnement = "AB-1002 Bakker BV", omschrijving = "Catering april", bedrag = 89.25m, factuurmoment = "Aantal dagen voor begindatumcyclus" },
    new { abonnementsregel = "AR-0013", abonnement = "AB-1003 Groen & Co", omschrijving = "Onderhoud tuin april", bedrag = 525.00m, factuurmoment = "Midden van de factuurperiode" },
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
    new { administratie = "1", abonnementsregel = "AR-0001", abonnement = "AB-1001 Facilicom BV", datumVan = (string?)"2026-03-01T00:00:00Z", datumTot = (string?)"2026-03-31T00:00:00Z", gefactureerd = 3750.00m, toegerekend = 3750.00m, teruggedraaid = 0.00m, openstaand = 0.00m },
    new { administratie = "1", abonnementsregel = "AR-0002", abonnement = "AB-1001 Facilicom BV", datumVan = (string?)"2026-03-01T00:00:00Z", datumTot = (string?)"2026-03-31T00:00:00Z", gefactureerd = 2500.00m, toegerekend = 2500.00m, teruggedraaid = 0.00m, openstaand = 0.00m },
    new { administratie = "1", abonnementsregel = "AR-0003", abonnement = "AB-1001 Facilicom BV", datumVan = (string?)"2026-03-01T00:00:00Z", datumTot = (string?)"2026-03-31T00:00:00Z", gefactureerd = 1200.00m, toegerekend = 0.00m, teruggedraaid = 0.00m, openstaand = 1200.00m },
    new { administratie = "1", abonnementsregel = "AR-0004", abonnement = "AB-1002 Bakker BV", datumVan = (string?)"2026-03-01T00:00:00Z", datumTot = (string?)"2026-03-31T00:00:00Z", gefactureerd = 89.25m, toegerekend = 89.25m, teruggedraaid = 0.00m, openstaand = 0.00m },
    new { administratie = "1", abonnementsregel = "AR-0005", abonnement = "AB-1003 Groen & Co", datumVan = (string?)"2026-02-01T00:00:00Z", datumTot = (string?)"2026-02-28T00:00:00Z", gefactureerd = 525.00m, toegerekend = 525.00m, teruggedraaid = 525.00m, openstaand = 525.00m },
    new { administratie = "1", abonnementsregel = "AR-0006", abonnement = "AB-1001 Facilicom BV", datumVan = (string?)"2026-04-01T00:00:00Z", datumTot = (string?)"2026-04-30T00:00:00Z", gefactureerd = 3750.00m, toegerekend = 0.00m, teruggedraaid = 0.00m, openstaand = 3750.00m },
    new { administratie = "1", abonnementsregel = "AR-0007", abonnement = "AB-1001 Facilicom BV", datumVan = (string?)"2026-05-01T00:00:00Z", datumTot = (string?)"2026-05-31T00:00:00Z", gefactureerd = 0.00m, toegerekend = 0.00m, teruggedraaid = 0.00m, openstaand = 0.00m },
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
    new { abonnementsregel = "7007", item = "EnYoi Glasvezel internet 400", boekjaar = 2026, periode = 4, bedrag = 58.00m, status = "Gejournaliseerd", aangemaakt = "2026-04-15T00:00:00Z", aanmakerNaam = "P. de Vries" },
    new { abonnementsregel = "7007", item = "EnYoi Glasvezel internet 400", boekjaar = 2026, periode = 3, bedrag = 58.00m, status = "Gejournaliseerd", aangemaakt = "2026-03-15T00:00:00Z", aanmakerNaam = "P. de Vries" },
    new { abonnementsregel = "7008", item = "EnYoi TV Standaard", boekjaar = 2026, periode = 4, bedrag = 12.50m, status = "Gejournaliseerd", aangemaakt = "2026-04-15T00:00:00Z", aanmakerNaam = "P. de Vries" },
    new { abonnementsregel = "7009", item = "Onderhoudsabonnement modem", boekjaar = 2026, periode = 4, bedrag = 4.50m, status = "Verwijderd", aangemaakt = "2026-04-15T00:00:00Z", aanmakerNaam = "K. Bakker" },
});

app.MapGet("/api/rpt00692-abonnement-eigenschappen/journaalposten", () => new[] {
    new { boekstuknummer = "20260401-001", boekdatum = "2026-04-01T00:00:00Z", boekjaar = 2026, periode = 4, grootboekrekening = "1350 Te factureren abo omzet", omschrijving = "Periodetoekenning apr 2026", debet = (decimal?)58.00m, credit = (decimal?)null },
    new { boekstuknummer = "20260401-002", boekdatum = "2026-04-01T00:00:00Z", boekjaar = 2026, periode = 4, grootboekrekening = "8010 Omzet abonnementen", omschrijving = "Periodetoekenning apr 2026", debet = (decimal?)null, credit = (decimal?)58.00m },
    new { boekstuknummer = "20260301-001", boekdatum = "2026-03-01T00:00:00Z", boekjaar = 2026, periode = 3, grootboekrekening = "1350 Te factureren abo omzet", omschrijving = "Periodetoekenning mrt 2026", debet = (decimal?)58.00m, credit = (decimal?)null },
    new { boekstuknummer = "20260301-002", boekdatum = "2026-03-01T00:00:00Z", boekjaar = 2026, periode = 3, grootboekrekening = "8010 Omzet abonnementen", omschrijving = "Periodetoekenning mrt 2026", debet = (decimal?)null, credit = (decimal?)58.00m },
});

// RPT00692 — Verkooprelatieprofiel (US07, §3.4a)
app.MapGet("/api/rpt00692-verkooprelatieprofiel", () => new {
    Id = "1",
    aantalExemplaren = 1,
    bijlageSamenvoegen = false,
    ordermanagement = "O",
    overige = "O",
    bankrekeningVerkoopfactuur = "ABN AMRO (0412595125)",
    gRekeningEFactuur = "",
    facturatieFrequentie = "",
    extraDagenFacturatieFrequentie = (int?)null,
    voorkeurPortal = "",
    factuurmoment = "4",
    aantalDagen = 10
});

app.MapPatch("/api/rpt00692-verkooprelatieprofiel", () => Results.Ok());

// RPT00692 — Boekingslay-out abonnement (US07)
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