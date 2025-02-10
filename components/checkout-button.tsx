import { ComponentProps } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableHighlight,
} from "react-native";

type Props = {
  title: string;
  loading: boolean;
};

export default function CheckoutButton(
  props: ComponentProps<typeof TouchableHighlight> & Props
) {
  return (
    <TouchableHighlight
      underlayColor={"#18191E"}
      {...props}
      style={[styles.container, props.style]}
    >
      {props.loading ? (
        <ActivityIndicator />
      ) : (
        <Text style={styles.title}>{props.title}</Text>
      )}
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 46,
    justifyContent: "center",
    backgroundColor: "#000",
    borderRadius: 8,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
