import { Stack } from "expo-router";

import StripeProvider from "@/components/stripe-provider";
import { StyleSheet } from "react-native";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  return (
    <StripeProvider>
      <Stack>
        <Stack.Screen
          name='index'
          options={{
            title: "Support & Donate",
            headerTitleStyle: styles.title,
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: "#A0D6B4" },
            contentStyle: { backgroundColor: "#6B8E78" },
          }}
        />
      </Stack>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
});
