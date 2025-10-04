"use client"
import { THEMES, ThemeId } from "@/constants/themes";

export function applyTheme(themeId: ThemeId | string, isDark: boolean) {
    const id = themeId as ThemeId;
    const theme = (THEMES as any)[id] as typeof THEMES[keyof typeof THEMES] | undefined;
    if (!theme) return;

    const variables = isDark ? theme.darkVariables : theme.variables;

    const root = typeof document !== "undefined" ? document.documentElement : null;
    if (!root) return;

    Object.entries(variables).forEach(([key, value]) => {
        try {
            root.style.setProperty(key, value as string);
        } catch (e) {
            // ignore invalid values
        }
    });
}

export function getThemeFromUser(userSettings: any): ThemeId {
    if (!userSettings) return "neutral" as ThemeId;
    const id = userSettings.themeId as string | undefined;
    if (!id || !(id in THEMES)) return "neutral" as ThemeId;
    return id as ThemeId;
}

export default applyTheme;

