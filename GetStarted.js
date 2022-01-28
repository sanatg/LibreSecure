import React, { useEffect, useState } from "react";
import { AppearanceProvider, Appearance } from "react-native-appearance";
import WalkthroughScreen from "./screens/WalkthroughScreen/WalkthroughScreen";
import WalkthroughAppConfig from "./WalkthroughAppConfig";
import DynamicAppStyles from "./DynamicAppStyles";
export default function GetStarted(props) {

  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });
  });

  return (
    <AppearanceProvider>
      <WalkthroughScreen
        appConfig={WalkthroughAppConfig}
        appStyles={DynamicAppStyles}
        {...props}
      />
    </AppearanceProvider>
  );
}
