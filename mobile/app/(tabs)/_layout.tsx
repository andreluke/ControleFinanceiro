import { Tabs } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
import { colors } from "../../src/theme/tokens";
import {
  HomeIcon,
  CardIcon,
  ChartIcon,
  MenuIcon,
  PlusIcon,
  FolderIcon,
  RepeatIcon,
} from "../../src/components/icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const iconColor = focused ? colors.primary : colors.secondary;

  switch (name) {
    case "index":
      return <HomeIcon color={iconColor} size={22} />;
    case "transactions":
      return <CardIcon color={iconColor} size={22} />;
    case "budgets":
      return <ChartIcon color={iconColor} size={22} />;
    case "categories":
      return <FolderIcon color={iconColor} size={22} />;
    case "recurring":
      return <RepeatIcon color={iconColor} size={22} />;
    case "more":
      return <MenuIcon color={iconColor} size={22} />;
    default:
      return null;
  }
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 60;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="index" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transações",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="transactions" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarIcon: () => (
            <View style={styles.fab}>
              <PlusIcon color={colors.foreground} size={24} />
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("add-transaction");
          },
        })}
      />
      <Tabs.Screen
        name="recurring"
        options={{
          title: "Recorrentes",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="recurring" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: "Orçamentos",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="budgets" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Gerenciar",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="categories" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Mais",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="more" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
