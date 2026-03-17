import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button, Input, Card, CardContent } from "../../src/components/ui";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from "../../src/theme/tokens";
import { loginSchema, type LoginInput } from "../../src/validators";
import { authService } from "../../src/services";
import { Icons } from "../../src/components/icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setError("");
      await authService.login(data);
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Icons.Wallet size={40} color={colors.primary} />
              </View>
            </View>
            <Text style={styles.title}>FinanceApp</Text>
            <Text style={styles.subtitle}>
              Controle suas finanças com facilidade
            </Text>
          </View>

          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <Text style={styles.cardTitle}>Bem-vindo de volta</Text>
              <Text style={styles.cardSubtitle}>
                Entre na sua conta para continuar
              </Text>

              {error && (
                <View style={styles.errorContainer}>
                  <Icons.AlertCircle size={18} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={{ gap: spacing.md }}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="E-mail"
                      placeholder="seu@email.com"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      error={errors.email?.message}
                      leftElement={<Icons.Mail size={18} />}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Senha"
                      placeholder="••••••••"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                      error={errors.password?.message}
                      leftElement={<Icons.Lock size={18} />}
                    />
                  )}
                />

                {/* <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity> */}

                <Button
                  onPress={handleSubmit(onSubmit)}
                  isLoading={isSubmitting}
                  style={styles.button}
                  size="lg"
                >
                  Entrar
                </Button>
              </View>

              {/* <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <Icons.ChevronRight size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View> */}

              <View style={styles.footer}>
                <Text style={styles.footerText}>Não tem conta? </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/register")}
                >
                  <Text style={styles.link}>Criar conta</Text>
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>

          <Text style={styles.termsText}>
            Ao continuar, você concorda com nossos Termos de Serviço
          </Text>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.md,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.secondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: {
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.danger + "15",
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    flex: 1,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: spacing.md,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  button: {
    marginTop: spacing.xs,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    marginHorizontal: spacing.md,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.muted + "30",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.secondary,
    fontSize: fontSize.sm,
  },
  link: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  termsText: {
    fontSize: fontSize.xs,
    color: colors.muted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
