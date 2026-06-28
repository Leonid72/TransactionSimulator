namespace TransactionSimulator.Core.Common;

public static class RegionTimezones
{
    private static readonly Dictionary<string, string> Map = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Israel"]  = "Israel",
        ["France"]  = "Europe/Paris",
        ["USA"]     = "America/New_York",
        ["Japan"]   = "Asia/Tokyo",
        ["UK"]      = "Europe/London",
        ["Germany"] = "Europe/Berlin",
        ["India"]   = "Asia/Kolkata",
    };

    private static readonly Dictionary<string, string> WindowsAliases = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Europe/Paris"]     = "Romance Standard Time",
        ["America/New_York"] = "Eastern Standard Time",
        ["Asia/Tokyo"]       = "Tokyo Standard Time",
        ["Europe/London"]    = "GMT Standard Time",
        ["Europe/Berlin"]    = "W. Europe Standard Time",
        ["Asia/Kolkata"]     = "India Standard Time",
        ["Israel"]           = "Israel Standard Time",
    };

    public static IReadOnlyCollection<string> SupportedRegions => Map.Keys.ToList();

    public static TimeZoneInfo? Resolve(string region)
    {
        if (!Map.TryGetValue(region, out var tzId)) return null;

        try { return TimeZoneInfo.FindSystemTimeZoneById(tzId); } catch { }

        if (WindowsAliases.TryGetValue(tzId, out var winId))
            try { return TimeZoneInfo.FindSystemTimeZoneById(winId); } catch { }

        return null;
    }
}
