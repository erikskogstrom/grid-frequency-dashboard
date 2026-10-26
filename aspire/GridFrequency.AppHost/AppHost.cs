var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.GridFrequency_Api>("api");

// "start" is the npm script that runs `ng serve`. PORT is injected by Aspire and passed on
// to ng serve with --port in package.json. WithReference(api) gives the app the API address
// as API_HTTP / API_HTTPS, which proxy.conf.js reads.
builder.AddJavaScriptApp("frontend", "../../frontend", runScriptName: "start")
    .WithPnpm()
    .WithReference(api)
    .WaitFor(api)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();
