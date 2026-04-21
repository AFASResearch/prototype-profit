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
// POA442793 — Integratie financieel (systeemparameters Projecten) mock endpoint
app.MapGet("/api/poa442793-integratie-financieel", () => new {
    Id = "1",
    OhwIntegratieGebruiken = true,
    OhwSplitsen = true,
    DekkingOpbrengstSplitsen = true,
    DekkingInhuurDerdenSplitsen = true,
    ResultaatSplitsen = false,
    MethodeAfmelding = "1"
});

app.MapPatch("/api/poa442793-integratie-financieel", () => Results.Ok());

// POA442793 — Integratiegroep mock endpoint
app.MapGet("/api/poa442793-integratiegroep", () => new {
    Id = "1",
    Omschrijving = "Schoonmaak",
    Opslagpercentage = "0",
    Factuursjabloon = "Standaard",
    Confrontatie = "Nee",
    RekKostprijs = "7000 Kostprijs projecten",
    RekDekkingKp = "2610 Dekking lonen",
    RekInkoop = "7100 Inkoopkosten",
    RekVerkoop = "8000 Opbrengst projecten",
    RekConfrontatie = "7500 Confrontatie",
    RekDekkingKpInkopen = "2410 Tussenrekening inleenfacturen",
    BtwVerlegdBinnRekInkoop = "7101 Inkoop verlegd binnenland",
    BtwVerlegdBinnRekDekkingKp = "2611 Dekking verlegd binnenland",
    BtwVerlegdEuRekInkoop = "7102 Inkoop verlegd EU",
    BtwVerlegdEuRekDekkingKp = "2612 Dekking verlegd EU",
    BtwBuitenEuRekInkoop = "7103 Inkoop buiten EU",
    BtwBuitenEuRekDekkingKp = "2613 Dekking buiten EU",
    BtwPlichtigEuRekInkoop = "7104 Inkoop BTW plichtig EU",
    BtwPlichtigEuRekDekkingKp = "2614 Dekking BTW plichtig EU",
    BtwOverigRekInkoop = "7105 Inkoop overig",
    BtwOverigRekDekkingKp = "2615 Dekking overig",
    RekKostprijsIC = "7200 Kostprijs IC",
    RekDekkingKpIC = "2620 Dekking kp IC",
    RekVerkoopIC = "8100 Opbrengst IC",
    RekDekkingKpInkopenIC = "2411 Tussenrekening inleenfacturen IC",
    DekkingInhuurDerdenSplitsen = true
});

app.MapPatch("/api/poa442793-integratiegroep", () => Results.Ok());

app.Run();