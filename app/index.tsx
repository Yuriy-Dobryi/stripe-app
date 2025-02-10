import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { useEffect, useMemo, useRef, useState } from "react";
import CheckoutButton from "@/components/checkout-button";
import { WebView } from "react-native-webview";
import Checkbox from "expo-checkbox";
import usePaymentSheet from "@/hooks/usePaymentSheet";

const DonatePage = () => {
  const [donationAmount, setDonationAmount] = useState(0);
  const [showWebview, setShowWebview] = useState(false);
  const { openPaymentSheet, loading: nativeLoading } = usePaymentSheet({
    amount: donationAmount,
  });
  const [webviewLoading, setWebviewLoading] = useState(false);
  const webviewRef = useRef<WebView>(null);

  const loading = useMemo(
    () => nativeLoading || webviewLoading,
    [nativeLoading, webviewLoading]
  );

  const onLoadEnd = () => {
    webviewRef.current?.injectJavaScript(`window.amount = ${donationAmount};`);
    setWebviewLoading(false);
  };

  useEffect(() => {
    if (showWebview) {
      setWebviewLoading(true);
      const timeoutId = setTimeout(() => {
        setWebviewLoading(false);
      }, 800);
      return () => clearTimeout(timeoutId);
    }
  }, [showWebview]);

  return (
    <View style={styles.content}>
      <Text style={styles.title}>
        Donation amount:
        <Text style={styles.amount}> ${donationAmount}</Text>
      </Text>
      <Slider
        value={donationAmount}
        onValueChange={setDonationAmount}
        minimumValue={0}
        maximumValue={100}
        step={1}
        minimumTrackTintColor='#F99ACC'
        maximumTrackTintColor='#000000'
        style={styles.slider}
      />
      <View style={[styles.row, styles.withWebviewRow]}>
        <Text style={styles.withWebviewText}>With webview </Text>
        <Checkbox
          color={"#F99ACC"}
          value={showWebview}
          onValueChange={setShowWebview}
          style={styles.checkbox}
        />
      </View>
      {webviewLoading && <ActivityIndicator color='#000' size={"large"} />}
      {showWebview && (
        <WebView
          ref={webviewRef}
          source={require("@/utils/webview-payment-form.html")}
          onLoadStart={() => setWebviewLoading(true)}
          onLoadEnd={onLoadEnd}
          style={{
            flex: 1,
            opacity: webviewLoading ? 0 : 1,
            backgroundColor: "#6b8e78",
          }}
        />
      )}
      {!showWebview && (
        <CheckoutButton
          title={showWebview ? "Pay" : "Open payment sheet"}
          onPress={openPaymentSheet}
          loading={loading}
          disabled={loading}
          style={{ marginHorizontal: 20 }}
        />
      )}
    </View>
  );
};

export default DonatePage;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  slider: { marginTop: 8 },
  withWebviewRow: {
    gap: 10,
    marginTop: 8,
    marginBottom: 40,
  },
  withWebviewText: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#F3F4F6",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
  },
  amount: {
    fontWeight: "bold",
    color: "gold",
  },
});
