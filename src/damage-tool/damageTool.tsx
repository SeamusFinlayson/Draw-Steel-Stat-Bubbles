import OBR, { Item } from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import { createRoot } from 'react-dom/client';
import { Token } from "./Token";
import { useEffect, useState } from "react";
import { getTheme } from "./OBRThemeProvider";
import { Box, Button, TextField, ThemeProvider, useTheme } from "@mui/material";
import TokenList from "./components/TokenList";
import { StatMetadataID } from "../edit-stats/StatInputClass";
import { calculateNewHealth, scaleHealthDiff } from "./healthCalculations";

const validTokens: Token[] = [];

OBR.onReady(async () => {

    await parseSelection();

    const themeObject = await OBR.theme.getTheme()
    const theme = getTheme(themeObject)

    // Render React component
    const root = createRoot(document.getElementById('app') as HTMLDivElement);
    root.render(
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    );
});

function App(): JSX.Element {

    // Health diff state
    const [healthDiff, setHealthDiff] = useState(0);

    function updateHealthDiff(value: number) {

        if (isNaN(value)) {
            setHealthDiff(0);
        } else {
            setHealthDiff(value);
        }
    }

    // Damage scaling state
    const damageScaleSettings: number[] = []
    const setDamageScaleSettings: React.Dispatch<React.SetStateAction<number>>[] = []

    // Initialize damage scaling options
    for (let i = 0; i < validTokens.length; i++) {
        [damageScaleSettings[i], setDamageScaleSettings[i]] = useState(2);
    }

    // Callback for updating damage scaling options
    function updateDamageScaleSetting(name: number, value: number) {
        // console.log("Name: " + name + " Value: " + value);
        setDamageScaleSettings[name](value);
    }

    // Keyboard button controls
    useEffect(() => {

        const handleKeydown = (event: any) => {
            if (event.key == "Escape") { handleCancelButton(); }
            if (event.key == "Enter") { handleConfirmButton(Math.trunc(healthDiff), damageScaleSettings); }
        }
        document.addEventListener('keydown', handleKeydown, false);

        return () => { document.removeEventListener('keydown', handleKeydown); }

    }, [healthDiff]);

    const themeIsDark = useTheme().palette.mode === "dark";

    // App content
    return (
        <>
            <Box sx={{ paddingX: 1 }}>
                <TextField
                    color={themeIsDark ? "secondary" : "primary"}
                    type="number"
                    InputProps={{ inputProps: { inputMode: "decimal" } }}
                    label="Change health by..."
                    onChange={evt => updateHealthDiff(parseFloat(evt.target.value))}
                    autoFocus
                ></TextField>
            </Box>

            <TokenList
                tokensProp={validTokens}
                healthDiff={Math.trunc(healthDiff)}
                damageScaleOptions={damageScaleSettings}
                updateDamageScaleSetting={updateDamageScaleSetting}
            ></TokenList>

            <Box sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                padding: "8px",
                gap: "8px",
                position: "fixed",
                bottom: "0",
                left: "0",
                right: "0",
            }}>
                <Button
                    variant="outlined" sx={{ flexGrow: 1 }}
                    onClick={handleCancelButton}
                >Cancel (escape)</Button>
                <Button
                    variant="contained"
                    sx={{ flexGrow: 1 }}
                    onClick={function () { handleConfirmButton(Math.trunc(healthDiff), damageScaleSettings) }}
                >Confirm (enter)</Button>
            </Box>
        </>
    );
}

function handleCancelButton() {

    // Close popover
    OBR.popover.close(getPluginId("damage-tool-popover"));
}

function handleConfirmButton(healthDiff: number, damageScaleSettings: number[]) {

    // console.log("Confirm")
    // console.log(healthDiff)

    const validItems: Item[] = [];
    validTokens.forEach((token) => {
        validItems.push(token.item);
    });

    const healthId: StatMetadataID = "health";
    const tempHealthId: StatMetadataID = "temporary health";

    OBR.scene.items.updateItems(validItems, (items) => {
        for (let i = 0; i < items.length; i++) {

            if (items[i].id !== validTokens[i].item.id) {
                throw ("Error: Item mismatch in Stat Bubbles Damage Tool, could not update token.")
            }

            // Scale health diff
            let scaledHealthDiff: number = scaleHealthDiff(damageScaleSettings, healthDiff, i);

            // Set new health and temp health values
            let [newHealth, newTempHealth] = calculateNewHealth(
                validTokens[i].health.valueOf(),
                validTokens[i].maxHealth.valueOf(),
                validTokens[i].tempHealth.valueOf(),
                scaledHealthDiff
            );

            const newMetadata = { [healthId]: newHealth, [tempHealthId]: newTempHealth };

            let retrievedMetadata: any;
            if (items[i].metadata[getPluginId("metadata")]) {
                retrievedMetadata = JSON.parse(JSON.stringify(items[i].metadata[getPluginId("metadata")]));
            }

            const combinedMetadata = { ...retrievedMetadata, ...newMetadata }; //overwrite only the modified value

            items[i].metadata[getPluginId("metadata")] = combinedMetadata;

        }
    });

    // Close popover
    OBR.popover.close(getPluginId("damage-tool-popover"));
}

async function parseSelection() {

    // Get selected Items
    const selection = await OBR.player.getSelection();
    const items = await OBR.scene.items.getItems(selection);

    if (items.length === 0) {
        // OBR.popover.close()
        throw "Error: No item selected";
    }

    for (const item of items) {

        // Get token metadata
        const metadata: any = item.metadata[getPluginId("metadata")];

        // Extract health metadata
        let health: number = NaN;
        let hasHealth: boolean;
        try {
            health = parseFloat(metadata["health"]);
            hasHealth = true;
        } catch (error) {
            hasHealth = false;
            health = 0;
        }
        if (isNaN(health)) {
            hasHealth = false;
            health = 0;
        }

        // Extract max health metadata
        let maxHealth: number = NaN;
        let hasMaxHealth: boolean;
        try {
            maxHealth = parseFloat(metadata["max health"]);
            hasMaxHealth = true;
        } catch (error) {
            hasMaxHealth = false;
        }
        if (isNaN(maxHealth)) {
            hasMaxHealth = false;
        }

        // Extract temp health metadata
        let tempHealth: number = NaN;
        try {
            tempHealth = parseFloat(metadata["temporary health"]);
        } catch (error) {
            tempHealth = 0
        }
        if (isNaN(tempHealth)) {
            tempHealth = 0;
        }

        // If the token has health and max health add it to the list of valid tokens
        if (hasMaxHealth) {
            validTokens.push(new Token(item, health, maxHealth, tempHealth));
        }
    }
}