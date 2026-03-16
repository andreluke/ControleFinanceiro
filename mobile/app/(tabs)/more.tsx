import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, type ReactNode } from 'react'
import { useRouter } from 'expo-router'
import { Card, CardContent } from '../../src/components/ui'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme/tokens'
import { useAuthStore } from '../../src/stores'
import { Icons } from '../../src/components/icons'

interface MenuItemProps {
  icon: ReactNode
  title: string
  subtitle?: string
  onPress?: () => void
  rightElement?: ReactNode
  danger?: boolean
}

function MenuItem({ icon, title, subtitle, onPress, rightElement, danger }: MenuItemProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={styles.menuItem}>
        <CardContent style={styles.menuItemContent}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
              <Text style={{ fontSize: 20 }}>{icon}</Text>
            </View>
            <View>
              <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>{title}</Text>
              {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
          </View>
          {rightElement || <Text style={styles.menuArrow}>›</Text>}
        </CardContent>
      </Card>
    </TouchableOpacity>
  )
}

export default function MoreScreen() {
  const router = useRouter()
  const { logout, user } = useAuthStore()
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout()
            router.replace('/(auth)/login')
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mais</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <MenuItem icon={<Icons.User size={20} />} title="Perfil" subtitle="Editar informações pessoais" />
          <MenuItem icon={<Icons.Lock size={20} />} title="Segurança" subtitle="Alterar senha" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          <MenuItem
            icon={<Icons.Bell size={20} />}
            title="Notificações"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.muted, true: colors.primary }}
                thumbColor={colors.foreground}
              />
            }
          />
          <MenuItem
            icon={<Icons.Moon size={20} />}
            title="Modo Escuro"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: colors.muted, true: colors.primary }}
                thumbColor={colors.foreground}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financeiro</Text>
          <MenuItem icon={<Icons.Repeat size={20} />} title="Transações Recorrentes" subtitle="Gerenciar recorrências" />
          <MenuItem icon={<Icons.Download size={20} />} title="Exportar Dados" subtitle="Baixar extrato" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          <MenuItem icon={<Icons.HelpCircle size={20} />} title="Ajuda" subtitle="Perguntas frequentes" />
          <MenuItem icon={<Icons.MessageCircle size={20} />} title="Contato" subtitle="Fale conosco" />
          <MenuItem icon={<Icons.Info size={20} />} title="Sobre" subtitle="Versão 1.0.0" />
        </View>

        <View style={styles.logoutSection}>
          <MenuItem 
            icon={<Icons.LogOut size={20} />} 
            title="Sair" 
            onPress={handleLogout}
            danger
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
  },
  userEmail: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.secondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    marginBottom: spacing.xs,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
  },
  menuSubtitle: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    marginTop: 2,
  },
  menuIconDanger: {
    backgroundColor: colors.danger + '20',
  },
  menuTitleDanger: {
    color: colors.danger,
  },
  menuArrow: {
    fontSize: 24,
    color: colors.secondary,
  },
  logoutSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
})
