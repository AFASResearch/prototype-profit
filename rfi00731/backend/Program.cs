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
// RFI00731 — Mock endpoints voor inhoudingsplicht België mockups
app.MapGet("/api/rfi00731-crediteur-pw", () => new {
    StatusFOD = "Heeft schulden",
    LaatsteControleFOD = "2026-03-15",
    GeldigTmFOD = "2026-06-15",
    PercInhoudingFiscaal = 0.15,
    StatusRSZ = "Heeft schulden",
    LaatsteControleRSZ = "2026-03-15",
    GeldigTmRSZ = "2026-06-15",
    PercInhoudingSociaal = 0.35,
    RaadplegingsnummerRSZ = "REF-2026-123456",
    Foutdetail = "Verbinding met V2.1 service mislukt (timeout na 30s)"
});

app.MapGet("/api/rfi00731-crediteur-insite", () => new {
    StatusFOD = "Heeft schulden",
    LaatsteControleFOD = "2026-03-15",
    GeldigTmFOD = "2026-06-15",
    PercInhoudingFiscaal = 0.15,
    StatusRSZ = "Heeft schulden",
    LaatsteControleRSZ = "2026-03-15",
    GeldigTmRSZ = "2026-06-15",
    PercInhoudingSociaal = 0.35,
    RaadplegingsnummerRSZ = "REF-2026-123456",
    Foutdetail = "Verbinding met V2.1 service mislukt (timeout na 30s)"
});

app.MapGet("/api/rfi00731-inkoopfactuur", () => new {
    Inhoudingsplicht = "FOD Financiën en Rijksdienst voor Sociale Zekerheid (ALL)",
    BedragFOD = 1405.34,
    BedragRSZ = 3279.13,
    KenmerkBetalingRSZ = "+++000/0012/34567+++"
});

app.MapGet("/api/rfi00731-instantie", () => new {
    Crediteur = "100001 - Bouwbedrijf NV",
    Afdeling = "Crediteuren",
    Bankrekening = "BE68 5390 0754 7034",
    Berichtsjabloon = "Inhoudingsplicht",
    Percentage = 0.15
});

app.MapGet("/api/rfi00731-w15-profit7", () => new {
    StatusFOD = "Heeft schuld (1)",
    LaatsteControleFOD = "23-03-2026",
    GeldigTmFOD = "23-03-2026",
    StatusRSZ = "Heeft schuld (1)",
    LaatsteControleRSZ = "19-01-2026",
    GeldigTmRSZ = ""
});

app.MapGet("/api/rfi00731-w15-profit8", () => new {
    StatusFOD = "Heeft schuld (1)",
    LaatsteControleFOD = "23-03-2026",
    GeldigTmFOD = "23-03-2026",
    PercInhoudingFiscaal = 0.15,
    StatusRSZ = "Heeft schuld (1)",
    LaatsteControleRSZ = "19-01-2026",
    GeldigTmRSZ = "",
    PercInhoudingSociaal = 0.35,
    RaadplegingsnummerRSZ = "REF-2026-123456"
});